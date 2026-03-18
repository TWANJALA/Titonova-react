import { readPageGraphSnapshot, readJsonBody, savePageGraphSnapshot, sendJson } from "./_pageGraphStorage.js";

const normalizeGraph = (graph) => {
  if (!graph || typeof graph !== "object") return null;
  const pageId = String(graph.id || "").trim();
  const title = String(graph.title || "").trim();
  const components = Array.isArray(graph.components) ? graph.components : [];
  const normalizedComponents = components
    .map((component) => {
      if (!component || typeof component !== "object") return null;
      const id = String(component.id || "").trim();
      const type = String(component.type || "").trim();
      if (!id || !type) return null;
      return {
        id,
        type,
        props: component.props && typeof component.props === "object" ? component.props : {},
        meta: component.meta && typeof component.meta === "object" ? component.meta : {},
      };
    })
    .filter(Boolean);
  return {
    version: String(graph.version || "1.0"),
    id: pageId || "homepage",
    title: title || "Homepage",
    components: normalizedComponents,
  };
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const pageId = String(req.query?.pageId || "homepage").trim();
      const snapshot = await readPageGraphSnapshot(pageId);
      sendJson(res, 200, {
        ok: true,
        pageId: snapshot.pageId,
        graph: snapshot.graph,
        updatedAt: snapshot.updatedAt,
      });
      return;
    } catch (error) {
      sendJson(res, 404, { error: "Page graph not found", details: String(error?.message || "") });
      return;
    }
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST or GET." });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const pageId = String(payload?.pageId || payload?.graph?.id || "homepage").trim();
    const graph = normalizeGraph(payload?.graph);
    if (!graph) {
      sendJson(res, 400, { error: "Invalid graph payload." });
      return;
    }
    const saved = await savePageGraphSnapshot({
      pageId,
      graph,
      source: "visual-editor-autosave",
    });
    sendJson(res, 200, {
      ok: true,
      pageId: saved.pageId,
      updatedAt: saved.updatedAt,
      graph: saved.graph,
    });
  } catch (error) {
    sendJson(res, 400, { error: String(error?.message || "Failed to save page graph.") });
  }
}
