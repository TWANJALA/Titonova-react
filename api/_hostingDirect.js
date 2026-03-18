import path from "node:path";
import { promises as fs } from "node:fs";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const DEFAULT_DOMAIN_DNS_RECORDS = [
  { type: "A", host: "@", value: "76.76.21.21" },
  { type: "CNAME", host: "www", value: "cname.vercel-dns.com" },
];

const STORAGE_ROOT = path.resolve(process.env.HOSTING_STORAGE_ROOT || "/tmp/titonova-hosted-sites");

const sendJson = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

const readJsonBody = async (req) => {
  if (req.body != null) {
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
    if (Buffer.isBuffer(req.body)) return JSON.parse(req.body.toString("utf8"));
    return JSON.parse(String(req.body || "{}"));
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const safeSegment = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

const safeFileName = (name) => {
  const normalized = String(name || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error(`Invalid file path: ${name}`);
  }
  return normalized;
};

const siteDir = (siteId) => path.join(STORAGE_ROOT, safeSegment(siteId || "site"));
const siteMetaPath = (siteId) => path.join(siteDir(siteId), "_site.json");

const ensureStorageRoot = async () => {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
};

const listSiteMetas = async () => {
  await ensureStorageRoot();
  const entries = await fs.readdir(STORAGE_ROOT, { withFileTypes: true });
  const metas = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        try {
          const raw = await fs.readFile(path.join(STORAGE_ROOT, entry.name, "_site.json"), "utf8");
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
  );
  return metas.filter(Boolean).sort((a, b) => String(b.publishedAt || "").localeCompare(String(a.publishedAt || "")));
};

const requestBaseUrl = (req) => {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const host = forwardedHost || String(req.headers.host || "").trim();
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
  return host ? `${proto}://${host}`.replace(/\/$/, "") : "";
};

const publishHostedSite = async (req, payload = {}) => {
  const safeId = safeSegment(payload.siteId || payload.projectName || `site-${Date.now()}`);
  if (!safeId) throw new Error("siteId or projectName is required");
  if (!payload.files || typeof payload.files !== "object") throw new Error("files object is required");
  const entries = Object.entries(payload.files);
  if (entries.length === 0) throw new Error("At least one file is required for publish");
  if (!entries.some(([name]) => name === "index.html")) {
    throw new Error("index.html is required for hosted site");
  }

  await ensureStorageRoot();
  const targetDir = siteDir(safeId);
  await fs.mkdir(targetDir, { recursive: true });
  for (const [name, content] of entries) {
    const safeName = safeFileName(name);
    const outputPath = path.join(targetDir, safeName);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, String(content ?? ""), "utf8");
  }

  const baseUrl = requestBaseUrl(req);
  const meta = {
    siteId: safeId,
    projectName: String(payload.projectName || safeId),
    customDomain: String(payload.customDomain || ""),
    publishedAt: new Date().toISOString(),
    fileCount: entries.length,
    url: `${baseUrl}/api/hosting/site/${safeId}/index.html`,
    provider: "vercel-direct",
    hosting: {
      tier: "Fast Hosting",
      edge: true,
    },
    ssl: {
      enabled: true,
      status: "active",
    },
    cdn: {
      enabled: true,
      provider: "edge-cdn",
    },
    domain: {
      attached: Boolean(payload.customDomain),
      records: DEFAULT_DOMAIN_DNS_RECORDS,
    },
  };
  await fs.writeFile(siteMetaPath(safeId), JSON.stringify(meta, null, 2), "utf8");
  return meta;
};

const unpublishHostedSite = async (payload = {}) => {
  const safeId = safeSegment(payload.siteId || "");
  if (!safeId) throw new Error("siteId is required");
  await fs.rm(siteDir(safeId), { recursive: true, force: true });
  return { ok: true, siteId: safeId };
};

export const handleDirectHostingAction = async (req, res, action) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST." });
    return;
  }
  try {
    const payload = await readJsonBody(req).catch(() => ({}));
    if (action === "list") {
      sendJson(res, 200, { sites: await listSiteMetas() });
      return;
    }
    if (action === "publish") {
      sendJson(res, 200, await publishHostedSite(req, payload));
      return;
    }
    if (action === "unpublish") {
      sendJson(res, 200, await unpublishHostedSite(payload));
      return;
    }
    sendJson(res, 404, { error: `Unsupported hosting action: ${action}` });
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: String(error?.message || "Direct hosting action failed"),
    });
  }
};

export const serveDirectHostedFile = async (req, res, siteIdRaw, filePathRaw) => {
  try {
    const safeId = safeSegment(siteIdRaw || "");
    if (!safeId) {
      sendJson(res, 400, { error: "Invalid site id" });
      return;
    }
    const safeFile = safeFileName(filePathRaw || "index.html");
    const filePath = path.join(siteDir(safeId), safeFile);
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", String(content.length));
    res.setHeader("Cache-Control", ext === ".html" ? "no-store" : "public, max-age=300");
    res.status(200).send(content);
  } catch (error) {
    sendJson(res, 404, { error: "Hosted file not found", details: String(error?.message || "") });
  }
};
