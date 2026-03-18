const normalizeToken = (value, fallback = "item") =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;

export const PAGE_GRAPH_VERSION = "1.0";

export const createComponentId = (type = "component") =>
  `${normalizeToken(type, "component")}-${Math.random().toString(36).slice(2, 8)}`;

export const createComponentNode = ({ id, type, props = {}, meta = {} }) => ({
  id: String(id || createComponentId(type)),
  type: String(type || "TextBlock"),
  props: props && typeof props === "object" ? { ...props } : {},
  meta: meta && typeof meta === "object" ? { ...meta } : {},
});

export const createPageGraph = ({ id = "homepage", title = "Homepage", components = [] } = {}) => ({
  version: PAGE_GRAPH_VERSION,
  id: String(id || "homepage"),
  title: String(title || "Homepage"),
  components: Array.isArray(components)
    ? components.map((component) => createComponentNode(component))
    : [],
});

export const normalizePageGraph = (graph) => {
  const safe = createPageGraph(graph);
  const seen = new Set();
  const normalizedComponents = safe.components.map((component) => {
    const normalized = createComponentNode(component);
    if (!normalized.id || seen.has(normalized.id)) {
      normalized.id = createComponentId(normalized.type);
    }
    seen.add(normalized.id);
    return normalized;
  });
  return {
    ...safe,
    components: normalizedComponents,
  };
};

export const DEFAULT_PAGE_GRAPH = createPageGraph({
  id: "homepage",
  title: "Homepage",
  components: [
    {
      id: "hero-section",
      type: "Hero",
      props: {
        title: "Clean Website",
        subtitle: "Built for revenue teams",
        cta: "Schedule a Tour",
        buttonUrl: "#contact",
      },
    },
    {
      id: "commitment-section",
      type: "TextBlock",
      props: {
        title: "Our Heartfelt Commitment",
        body: "Clean Website",
      },
    },
    {
      id: "services-section",
      type: "Services",
      props: {
        title: "Core Services",
        items: ["Home Care", "Rehab", "Nursing"],
      },
    },
  ],
});

export const findComponentById = (graph, componentId) => {
  if (!graph || !Array.isArray(graph.components)) return null;
  return graph.components.find((component) => component.id === componentId) || null;
};
