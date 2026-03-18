import { withLayoutDefaults } from "./designTokens.js";

const cloneGraph = (graph) => {
  if (typeof structuredClone === "function") return structuredClone(graph);
  return JSON.parse(JSON.stringify(graph));
};

const defaultAiRepairRequest = async ({ issue, component, graphId }) => {
  const response = await fetch("/api/ai/layout-repair", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      graphId,
      issue,
      component,
    }),
  });
  if (!response.ok) {
    throw new Error("AI layout repair request failed");
  }
  const payload = await response.json().catch(() => ({}));
  return payload?.recommendation && typeof payload.recommendation === "object"
    ? payload.recommendation
    : null;
};

const applyRecommendation = (graph, issue, recommendation) => {
  if (!recommendation || typeof recommendation !== "object") return false;
  const components = Array.isArray(graph?.components) ? graph.components : [];
  const index = components.findIndex((component) => component.id === issue.componentId);
  if (index < 0) return false;
  const component = components[index];
  const currentProps = withLayoutDefaults(component?.props || {});
  const nextProps = {
    ...currentProps,
  };

  if (recommendation.recommendedLayout) {
    nextProps.layout = String(recommendation.recommendedLayout);
  }
  if (recommendation.columns != null) {
    nextProps.gridColumns = Number(recommendation.columns);
  }
  if (recommendation.mobileColumns != null) {
    nextProps.mobileColumns = Number(recommendation.mobileColumns);
  }
  if (recommendation.spacing != null) {
    nextProps.spacing = Number(recommendation.spacing);
  }
  if (recommendation.padding != null) {
    nextProps.padding = Number(recommendation.padding);
  }
  if (recommendation.fontScale != null) {
    nextProps.fontSize = Number(recommendation.fontScale);
  }
  if (recommendation.mobileStack != null) {
    nextProps.mobileStack = Boolean(recommendation.mobileStack);
  }
  if (recommendation.lineClamp != null) {
    nextProps.lineClamp = Number(recommendation.lineClamp);
  }
  if (recommendation.textColor) {
    nextProps.textColor = String(recommendation.textColor);
  }
  if (recommendation.backgroundColor) {
    nextProps.backgroundColor = String(recommendation.backgroundColor);
  }

  components[index] = {
    ...component,
    props: nextProps,
  };
  return true;
};

export const runAiRepairFallback = async ({
  graph,
  unresolvedIssues = [],
  requestAiRepair = defaultAiRepairRequest,
  maxIssues = 5,
}) => {
  if (!Array.isArray(unresolvedIssues) || unresolvedIssues.length === 0) {
    return {
      graph,
      aiRepairs: [],
    };
  }
  const workingGraph = cloneGraph(graph);
  const aiRepairs = [];
  const queue = unresolvedIssues.slice(0, Math.max(1, Number(maxIssues) || 5));

  for (const issue of queue) {
    const component = (workingGraph.components || []).find((item) => item.id === issue.componentId) || null;
    if (!component) continue;
    try {
      const recommendation = await requestAiRepair({
        issue,
        component,
        graphId: workingGraph.id,
      });
      if (!recommendation) {
        aiRepairs.push({
          componentId: issue.componentId,
          issueType: issue.type,
          applied: false,
          reason: "empty-recommendation",
        });
        continue;
      }
      const applied = applyRecommendation(workingGraph, issue, recommendation);
      aiRepairs.push({
        componentId: issue.componentId,
        issueType: issue.type,
        applied,
        recommendation,
      });
    } catch (error) {
      aiRepairs.push({
        componentId: issue.componentId,
        issueType: issue.type,
        applied: false,
        reason: String(error?.message || "ai-fallback-failed"),
      });
    }
  }

  return {
    graph: workingGraph,
    aiRepairs,
  };
};
