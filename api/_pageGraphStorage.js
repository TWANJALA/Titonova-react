import path from "node:path";
import { promises as fs } from "node:fs";

const STORAGE_ROOT = path.resolve(process.env.PAGE_GRAPH_STORAGE_ROOT || "/tmp/titonova-page-graphs");

const safeToken = (value, fallback = "page") =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || fallback;

const graphPathForPage = (pageId) => path.join(STORAGE_ROOT, `${safeToken(pageId, "page")}.json`);

export const sendJson = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

export const readJsonBody = async (req) => {
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

export const ensureGraphStorageRoot = async () => {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
};

export const savePageGraphSnapshot = async ({ pageId, graph, source = "visual-editor" }) => {
  const safePageId = safeToken(pageId, "page");
  await ensureGraphStorageRoot();
  const payload = {
    pageId: safePageId,
    graph,
    source: String(source || "visual-editor"),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(graphPathForPage(safePageId), JSON.stringify(payload, null, 2), "utf8");
  return payload;
};

export const readPageGraphSnapshot = async (pageId) => {
  const safePageId = safeToken(pageId, "page");
  const raw = await fs.readFile(graphPathForPage(safePageId), "utf8");
  return JSON.parse(raw);
};
