import { analyzeLayout } from "./layoutAnalyzer.js";
import {
  DESIGN_TOKENS,
  snapFontScale,
  snapGridColumns,
  snapSpacing,
  withLayoutDefaults,
} from "./designTokens.js";

const cloneGraph = (graph) => {
  if (typeof structuredClone === "function") return structuredClone(graph);
  return JSON.parse(JSON.stringify(graph));
};

const findComponentIndex = (graph, componentId) =>
  Array.isArray(graph?.components)
    ? graph.components.findIndex((component) => component.id === componentId)
    : -1;

const updateComponentProps = (graph, componentId, updater) => {
  const index = findComponentIndex(graph, componentId);
  if (index < 0) return false;
  const target = graph.components[index];
  const currentProps = withLayoutDefaults(target?.props || {});
  const nextProps = updater(currentProps, target);
  if (!nextProps || typeof nextProps !== "object") return false;
  graph.components[index] = {
    ...target,
    props: {
      ...currentProps,
      ...nextProps,
    },
  };
  return true;
};

export const fixOverflow = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => ({
    layout: "grid",
    gridColumns: Math.max(1, Math.min(3, snapGridColumns(props.gridColumns, 2))),
    mobileColumns: 1,
    mobileStack: true,
    spacing: snapSpacing(Math.max(8, Number(props.spacing || 16) - 8)),
    padding: snapSpacing(Math.max(8, Number(props.padding || 24) - 8), 16),
  }));

export const fixMobileLayout = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => ({
    mobileStack: true,
    mobileColumns: 1,
    gridColumns: Math.max(1, Math.min(3, snapGridColumns(props.gridColumns, 2))),
    spacing: snapSpacing(props.spacing, 16),
    padding: snapSpacing(props.padding, 16),
  }));

export const normalizeSpacing = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => ({
    spacing: snapSpacing(props.spacing, 16),
    padding: snapSpacing(props.padding, 24),
  }));

export const fixContrast = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => {
    const currentText = String(props.textColor || "").trim().toLowerCase();
    const currentBg = String(props.backgroundColor || "").trim().toLowerCase();
    if (currentText === "#ffffff" && currentBg === "#0f172a") {
      return { textColor: "#0f172a", backgroundColor: "#ffffff" };
    }
    return { textColor: "#0f172a", backgroundColor: "#ffffff" };
  });

export const fixTextOverflow = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => {
    const reducedFont = Math.max(12, snapFontScale(Number(props.fontSize || 16) - 2, 16));
    return {
      fontSize: reducedFont,
      lineClamp: Math.max(2, Number(props.lineClamp || 0) || 3),
      spacing: snapSpacing(props.spacing, 16),
    };
  });

export const fixAlignment = (graph, issue) =>
  updateComponentProps(graph, issue.componentId, (props) => {
    const itemCount = issue?.details?.itemCount;
    if (!Number.isFinite(itemCount) || itemCount <= 1) {
      return {
        gridColumns: snapGridColumns(props.gridColumns, 2),
      };
    }
    const candidates = DESIGN_TOKENS.gridColumns.filter((column) => column <= itemCount);
    const perfect = candidates.find((column) => itemCount % column === 0);
    return {
      gridColumns: perfect || snapGridColumns(props.gridColumns, 2),
    };
  });

export const repairRules = {
  overflow: fixOverflow,
  "mobile-break": fixMobileLayout,
  spacing: normalizeSpacing,
  contrast: fixContrast,
  "text-overflow": fixTextOverflow,
  alignment: fixAlignment,
};

export const validateLayout = (graph, options = {}) => {
  const analysis = analyzeLayout(graph, options);
  const blocking = analysis.issues.filter((issue) => issue.severity === "high");
  return {
    isValid: blocking.length === 0,
    issues: analysis.issues,
    blockingIssues: blocking,
    durationMs: analysis.durationMs,
  };
};

export const applyRepairRules = (graph, issues) => {
  const workingGraph = cloneGraph(graph);
  const repairResults = [];
  (issues || []).forEach((issue) => {
    const handler = repairRules[issue.type];
    if (typeof handler !== "function") {
      repairResults.push({
        issue,
        repaired: false,
        reason: "no-rule",
      });
      return;
    }
    const repaired = Boolean(handler(workingGraph, issue));
    repairResults.push({
      issue,
      repaired,
      reason: repaired ? "rule-applied" : "rule-failed",
    });
  });
  return {
    graph: workingGraph,
    repairResults,
  };
};
