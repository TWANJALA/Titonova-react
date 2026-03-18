import { analyzeLayout } from "./layoutAnalyzer.js";
import { runAiRepairFallback } from "./aiRepairFallback.js";
import { applyRepairRules, validateLayout } from "./repairEngine.js";
import { normalizePageGraph } from "../schema/pageGraph.js";

const startTimer = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const stopTimer = (startedAt) =>
  (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt;

const buildIssueKey = (issue) => `${issue.type}:${issue.componentId}`;

const unresolvedIssuesFrom = (baselineIssues, finalIssues) => {
  const baselineSet = new Set((baselineIssues || []).map(buildIssueKey));
  return (finalIssues || []).filter((issue) => baselineSet.has(buildIssueKey(issue)));
};

export const selfHeal = (graph, options = {}) => {
  const startedAt = startTimer();
  const normalizedGraph = normalizePageGraph(graph);
  const initialAnalysis = analyzeLayout(normalizedGraph, options);
  if (!initialAnalysis.issues.length) {
    const durationMs = stopTimer(startedAt);
    return {
      graph: normalizedGraph,
      report: {
        durationMs: Number(durationMs.toFixed(2)),
        analysisDurationMs: initialAnalysis.durationMs,
        initialIssueCount: 0,
        fixedByRules: 0,
        unresolvedCount: 0,
        issues: [],
        unresolvedIssues: [],
        repairResults: [],
        aiRepairs: [],
      },
    };
  }

  const repaired = applyRepairRules(normalizedGraph, initialAnalysis.issues);
  const finalValidation = validateLayout(repaired.graph, options);
  const unresolved = unresolvedIssuesFrom(initialAnalysis.issues, finalValidation.issues);
  const fixedByRules = repaired.repairResults.filter((result) => result.repaired).length;
  const durationMs = stopTimer(startedAt);

  return {
    graph: repaired.graph,
    report: {
      durationMs: Number(durationMs.toFixed(2)),
      analysisDurationMs: initialAnalysis.durationMs + finalValidation.durationMs,
      initialIssueCount: initialAnalysis.issueCount,
      fixedByRules,
      unresolvedCount: unresolved.length,
      issues: finalValidation.issues,
      unresolvedIssues: unresolved,
      repairResults: repaired.repairResults,
      aiRepairs: [],
    },
  };
};

export const selfHealWithAiFallback = async (graph, options = {}) => {
  const base = selfHeal(graph, options);
  if (!base.report.unresolvedIssues.length) return base;
  const aiResult = await runAiRepairFallback({
    graph: base.graph,
    unresolvedIssues: base.report.unresolvedIssues,
    requestAiRepair: options.requestAiRepair,
    maxIssues: options.maxAiIssues || 5,
  });
  const finalValidation = validateLayout(aiResult.graph, options);
  return {
    graph: aiResult.graph,
    report: {
      ...base.report,
      aiRepairs: aiResult.aiRepairs,
      issues: finalValidation.issues,
      unresolvedCount: finalValidation.blockingIssues.length,
    },
  };
};

export const EXAMPLE_BROKEN_LAYOUT = {
  id: "broken-services-layout",
  title: "Broken Services Layout",
  version: "1.0",
  components: [
    {
      id: "services-grid",
      type: "Services",
      props: {
        title: "Services",
        items: ["Care Plan", "Nursing", "Rehab", "Billing", "Coordination", "Support"],
        layout: "grid",
        gridColumns: 4,
        mobileColumns: 3,
        spacing: 13,
        padding: 37,
        fontSize: 26,
        mobileStack: false,
      },
    },
  ],
};

export const EXAMPLE_REPAIRED_LAYOUT = selfHeal(EXAMPLE_BROKEN_LAYOUT).graph;
