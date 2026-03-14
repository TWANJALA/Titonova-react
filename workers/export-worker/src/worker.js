import "dotenv/config";
import Redis from "ioredis";

const REDIS_URL = String(process.env.REDIS_URL || "redis://redis:6379");
const EXPORT_QUEUE = String(process.env.EXPORT_QUEUE_NAME || "export_jobs");
const EXPORT_DLQ = String(process.env.EXPORT_DLQ_NAME || "export_jobs_dlq");
const MAX_JOB_ATTEMPTS = Number(process.env.MAX_JOB_ATTEMPTS || 3);
const SLEEP_MS = Number(process.env.EXPORT_WORKER_SLEEP_MS || 900);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const redis = new Redis(REDIS_URL);
  console.log(`[export-worker] connected. queue=${EXPORT_QUEUE} dlq=${EXPORT_DLQ}`);

  while (true) {
    try {
      const raw = await redis.lpop(EXPORT_QUEUE);
      if (!raw) {
        await sleep(500);
        continue;
      }

      const job = JSON.parse(raw);
      const inProgress = { ...job, status: "running", startedAt: new Date().toISOString() };
      await redis.hset("job_status", job.id, JSON.stringify(inProgress));

      try {
        // Placeholder: generate framework bundle + upload to object storage.
        await sleep(SLEEP_MS);

        const framework = String(job?.input?.framework || "html");
        const done = {
          ...inProgress,
          status: "completed",
          completedAt: new Date().toISOString(),
          result: {
            summary: `Export bundle created for ${framework}.`,
            artifact_key: `exports/${job.id}/${framework}.zip`,
          },
        };
        await redis.hset("job_status", job.id, JSON.stringify(done));
      } catch (jobError) {
        const attempt = Number(job?.attempt || 0) + 1;
        const maxAttempts = Number(job?.max_attempts || MAX_JOB_ATTEMPTS);

        if (attempt < maxAttempts) {
          const retryPayload = {
            ...job,
            status: "queued",
            attempt,
            retriedAt: new Date().toISOString(),
            last_error: String(jobError?.message || jobError),
          };
          await redis.rpush(EXPORT_QUEUE, JSON.stringify(retryPayload));
          await redis.hset("job_status", job.id, JSON.stringify(retryPayload));
          continue;
        }

        const failedPayload = {
          ...job,
          status: "failed",
          attempt,
          failedAt: new Date().toISOString(),
          last_error: String(jobError?.message || jobError),
          dead_letter_queue: EXPORT_DLQ,
        };
        await redis.rpush(EXPORT_DLQ, JSON.stringify(failedPayload));
        await redis.hset("job_status", job.id, JSON.stringify(failedPayload));
      }
    } catch (error) {
      console.error("[export-worker] job error", error);
      await sleep(800);
    }
  }
};

run().catch((error) => {
  console.error("[export-worker] fatal", error);
  process.exit(1);
});
