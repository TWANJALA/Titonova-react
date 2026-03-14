import "dotenv/config";
import express from "express";
import Redis from "ioredis";
import pg from "pg";
import { Counter, collectDefaultMetrics, register } from "prom-client";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const app = express();
app.use(express.json({ limit: "2mb" }));

const PORT = Number(process.env.PORT || 8080);
const REDIS_URL = String(process.env.REDIS_URL || "redis://redis:6379");
const DATABASE_URL = String(process.env.DATABASE_URL || "postgres://postgres:postgres@postgres:5432/titonova");
const CLONE_QUEUE = String(process.env.CLONE_QUEUE_NAME || "clone_jobs");
const EXPORT_QUEUE = String(process.env.EXPORT_QUEUE_NAME || "export_jobs");
const CLONE_DLQ = String(process.env.CLONE_DLQ_NAME || "clone_jobs_dlq");
const EXPORT_DLQ = String(process.env.EXPORT_DLQ_NAME || "export_jobs_dlq");
const MAX_JOB_ATTEMPTS = Number(process.env.MAX_JOB_ATTEMPTS || 3);

const S3_REGION = String(process.env.S3_REGION || "us-east-1");
const S3_BUCKET = String(process.env.S3_BUCKET || "titonova-exports");
const S3_ENDPOINT = String(process.env.S3_ENDPOINT || "").trim();
const S3_ACCESS_KEY = String(process.env.S3_ACCESS_KEY || "").trim();
const S3_SECRET_KEY = String(process.env.S3_SECRET_KEY || "").trim();
const S3_SIGNED_URL_TTL_SECONDS = Number(process.env.S3_SIGNED_URL_TTL_SECONDS || 900);

const redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
const pgPool = new pg.Pool({ connectionString: DATABASE_URL, max: 5 });

const s3Enabled = Boolean(S3_BUCKET && S3_ACCESS_KEY && S3_SECRET_KEY);
const s3Client = s3Enabled
  ? new S3Client({
      region: S3_REGION,
      forcePathStyle: true,
      ...(S3_ENDPOINT ? { endpoint: S3_ENDPOINT } : {}),
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    })
  : null;

collectDefaultMetrics({ register });
const apiRequestsTotal = new Counter({
  name: "api_requests_total",
  help: "Total API requests by route and method",
  labelNames: ["method", "route", "status"],
});
const apiJobsEnqueuedTotal = new Counter({
  name: "api_jobs_enqueued_total",
  help: "Total jobs enqueued by queue",
  labelNames: ["queue"],
});

const json = (res, code, payload) => res.status(code).json(payload);
const jobId = () => `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

app.use((req, res, next) => {
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    apiRequestsTotal.inc({
      method: req.method,
      route,
      status: String(res.statusCode),
    });
  });
  next();
});

const withRedis = async (fn) => {
  let opened = false;
  if (redis.status !== "ready") {
    await redis.connect();
    opened = true;
  }

  try {
    return await fn();
  } finally {
    if (opened) {
      try {
        await redis.disconnect();
      } catch {
        // no-op
      }
    }
  }
};

app.get("/health", async (_req, res) => {
  const status = {
    api: "ok",
    redis: "down",
    postgres: "down",
    ts: new Date().toISOString(),
  };

  try {
    await withRedis(async () => {
      await redis.ping();
    });
    status.redis = "ok";
  } catch {
    status.redis = "down";
  }

  try {
    const result = await pgPool.query("select 1 as ok");
    status.postgres = result.rows?.[0]?.ok === 1 ? "ok" : "down";
  } catch {
    status.postgres = "down";
  }

  const code = status.redis === "ok" && status.postgres === "ok" ? 200 : 503;
  return json(res, code, status);
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  return res.status(200).send(await register.metrics());
});

app.post("/v1/clone/jobs", async (req, res) => {
  const targetUrl = String(req.body?.url || "").trim();
  if (!targetUrl) return json(res, 400, { error: "url is required" });

  const id = jobId();
  const payload = {
    id,
    type: "clone",
    status: "queued",
    createdAt: new Date().toISOString(),
    attempt: 0,
    max_attempts: MAX_JOB_ATTEMPTS,
    retry_queue: CLONE_QUEUE,
    dlq_queue: CLONE_DLQ,
    input: { url: targetUrl, mode: String(req.body?.mode || "full") },
  };

  try {
    await withRedis(async () => {
      await redis.rpush(CLONE_QUEUE, JSON.stringify(payload));
      await redis.hset("job_status", id, JSON.stringify(payload));
    });
    apiJobsEnqueuedTotal.inc({ queue: CLONE_QUEUE });
    return json(res, 202, { ok: true, job_id: id, queue: CLONE_QUEUE });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || "Failed to enqueue clone job") });
  }
});

app.post("/v1/export/jobs", async (req, res) => {
  const projectId = String(req.body?.project_id || "").trim();
  const framework = String(req.body?.framework || "html").toLowerCase();
  if (!projectId) return json(res, 400, { error: "project_id is required" });

  const id = jobId();
  const payload = {
    id,
    type: "export",
    status: "queued",
    createdAt: new Date().toISOString(),
    attempt: 0,
    max_attempts: MAX_JOB_ATTEMPTS,
    retry_queue: EXPORT_QUEUE,
    dlq_queue: EXPORT_DLQ,
    input: { project_id: projectId, framework },
  };

  try {
    await withRedis(async () => {
      await redis.rpush(EXPORT_QUEUE, JSON.stringify(payload));
      await redis.hset("job_status", id, JSON.stringify(payload));
    });
    apiJobsEnqueuedTotal.inc({ queue: EXPORT_QUEUE });
    return json(res, 202, { ok: true, job_id: id, queue: EXPORT_QUEUE });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || "Failed to enqueue export job") });
  }
});

app.get("/v1/jobs/:id", async (req, res) => {
  const id = String(req.params?.id || "").trim();
  if (!id) return json(res, 400, { error: "id is required" });

  try {
    const raw = await withRedis(async () => redis.hget("job_status", id));
    if (!raw) return json(res, 404, { error: "job not found" });
    return json(res, 200, { ok: true, job: JSON.parse(raw) });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || "Failed to read job status") });
  }
});

app.post("/v1/storage/sign-upload", async (req, res) => {
  if (!s3Client) return json(res, 500, { error: "S3 signing is not configured" });

  const key = String(req.body?.key || "").trim();
  const contentType = String(req.body?.content_type || "application/octet-stream").trim();
  if (!key) return json(res, 400, { error: "key is required" });

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: S3_SIGNED_URL_TTL_SECONDS });
    return json(res, 200, {
      ok: true,
      method: "PUT",
      bucket: S3_BUCKET,
      key,
      expires_in: S3_SIGNED_URL_TTL_SECONDS,
      url,
    });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || "Failed to sign upload URL") });
  }
});

app.post("/v1/storage/sign-download", async (req, res) => {
  if (!s3Client) return json(res, 500, { error: "S3 signing is not configured" });

  const key = String(req.body?.key || "").trim();
  if (!key) return json(res, 400, { error: "key is required" });

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: S3_SIGNED_URL_TTL_SECONDS });
    return json(res, 200, {
      ok: true,
      method: "GET",
      bucket: S3_BUCKET,
      key,
      expires_in: S3_SIGNED_URL_TTL_SECONDS,
      url,
    });
  } catch (error) {
    return json(res, 500, { error: String(error?.message || "Failed to sign download URL") });
  }
});

app.listen(PORT, () => {
  console.log(`[api] listening on :${PORT}`);
});
