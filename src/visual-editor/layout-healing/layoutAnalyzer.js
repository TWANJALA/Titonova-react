import { runAllDetectors, LAYOUT_VIEWPORT_DEFAULTS } from "./issueDetectors.js";
import { normalizePageGraph } from "../schema/pageGraph.js";

const ANALYSIS_CACHE_LIMIT = 40;
const analysisCache = new Map();

const graphHash = (graph) => {
  try {
    return JSON.stringify(graph);
  } catch {
    return String(Date.now());
  }
};

const maintainCacheBound = () => {
  while (analysisCache.size > ANALYSIS_CACHE_LIMIT) {
    const firstKey = analysisCache.keys().next().value;
    if (firstKey == null) break;
    analysisCache.delete(firstKey);
  }
};

export const analyzeLayout = (graph, options = {}) => {
  const normalizedGraph = normalizePageGraph(graph);
  const hash = graphHash({
    graph: normalizedGraph,
    viewport: options.viewport || LAYOUT_VIEWPORT_DEFAULTS,
  });
  const cached = analysisCache.get(hash);
  if (cached) {
    return {
      ...cached,
      cacheHit: true,
    };
  }

  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  const context = {
    viewport: {
      ...LAYOUT_VIEWPORT_DEFAULTS,
      ...(options.viewport || {}),
    },
  };
  const issues = (normalizedGraph.components || []).flatMap((component) =>
    runAllDetectors(component, context)
  );
  const durationMs = (typeof performance !== "undefined" ? performance.now() : Date.now()) - start;
  const result = {
    issues,
    durationMs: Number(durationMs.toFixed(2)),
    cacheHit: false,
    graphId: normalizedGraph.id,
    issueCount: issues.length,
  };
  analysisCache.set(hash, result);
  maintainCacheBound();
  return result;
};

export const analyzeLayoutIssues = (graph, options = {}) => analyzeLayout(graph, options).issues;

export const clearLayoutAnalysisCache = () => {
  analysisCache.clear();
};
