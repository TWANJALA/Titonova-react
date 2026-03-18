import { readJsonBody, sendJson } from "../_pageGraphStorage.js";

const toNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const recommendationForIssue = ({ issue, component }) => {
  const props = component?.props && typeof component.props === "object" ? component.props : {};
  const type = String(issue?.type || "");

  if (type === "overflow") {
    return {
      recommendedLayout: "grid",
      columns: Math.max(1, Math.min(2, toNumber(props.gridColumns, 2))),
      mobileColumns: 1,
      spacing: 16,
      padding: 16,
      mobileStack: true,
    };
  }
  if (type === "mobile-break") {
    return {
      recommendedLayout: "stack",
      columns: Math.max(1, Math.min(2, toNumber(props.gridColumns, 2))),
      mobileColumns: 1,
      spacing: 16,
      padding: 16,
      mobileStack: true,
    };
  }
  if (type === "text-overflow") {
    return {
      fontScale: Math.max(14, toNumber(props.fontSize, 18) - 2),
      lineClamp: 3,
      spacing: 16,
    };
  }
  if (type === "contrast") {
    return {
      textColor: "#0f172a",
      backgroundColor: "#ffffff",
    };
  }
  if (type === "spacing") {
    return {
      spacing: 16,
      padding: 24,
    };
  }
  if (type === "alignment") {
    return {
      columns: 2,
      spacing: 16,
      mobileColumns: 1,
    };
  }
  return {
    recommendedLayout: String(props.layout || "stack"),
    columns: toNumber(props.gridColumns, 2),
    spacing: toNumber(props.spacing, 16),
    padding: toNumber(props.padding, 24),
  };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST." });
    return;
  }
  try {
    const payload = await readJsonBody(req);
    const issue = payload?.issue && typeof payload.issue === "object" ? payload.issue : {};
    const component = payload?.component && typeof payload.component === "object" ? payload.component : {};
    const recommendation = recommendationForIssue({ issue, component });
    sendJson(res, 200, {
      ok: true,
      recommendation,
    });
  } catch (error) {
    sendJson(res, 400, {
      error: String(error?.message || "Failed to generate layout repair recommendation."),
    });
  }
}
