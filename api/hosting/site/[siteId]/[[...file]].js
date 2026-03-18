import { serveDirectHostedFile } from "../../../_hostingDirect.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed. Use GET." });
    return;
  }
  const siteId = String(req.query?.siteId || "").trim();
  const fileParts = req.query?.file;
  const filePath = Array.isArray(fileParts)
    ? fileParts.join("/")
    : String(fileParts || "index.html").trim() || "index.html";
  return serveDirectHostedFile(req, res, siteId, filePath);
}
