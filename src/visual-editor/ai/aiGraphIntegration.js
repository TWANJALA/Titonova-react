import { createComponentId, createComponentNode, normalizePageGraph } from "../schema/pageGraph";

const isPlainObject = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));

const clone = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

const toSafeProps = (props) => (isPlainObject(props) ? { ...props } : {});

const hasManualLock = (manualLocks, componentId, propKey) =>
  Boolean(manualLocks?.[componentId] && manualLocks[componentId][propKey]);

const mergePropsSafely = (currentProps, incomingProps, manualLocks, componentId, allowOverwriteManual) => {
  const nextProps = { ...toSafeProps(currentProps) };
  Object.entries(toSafeProps(incomingProps)).forEach(([key, value]) => {
    if (!allowOverwriteManual && hasManualLock(manualLocks, componentId, key)) return;
    nextProps[key] = value;
  });
  return nextProps;
};

const matchAiComponentToExisting = (components, aiComponent, usedIds) => {
  const explicitId = String(aiComponent?.id || "").trim();
  if (explicitId) {
    const byId = components.find((component) => component.id === explicitId);
    if (byId) return byId;
  }
  const type = String(aiComponent?.type || "").trim();
  if (!type) return null;
  const byType = components.find(
    (component) => component.type === type && !usedIds.has(component.id)
  );
  return byType || null;
};

export const mergeAiComponentsIntoGraph = ({
  currentGraph,
  aiGraph,
  manualLocks = {},
  allowOverwriteManual = false,
}) => {
  const normalizedCurrent = normalizePageGraph(currentGraph);
  const normalizedAi = normalizePageGraph(aiGraph);
  const nextGraph = clone(normalizedCurrent);
  const used = new Set();

  normalizedAi.components.forEach((aiComponent) => {
    const matched = matchAiComponentToExisting(nextGraph.components, aiComponent, used);
    if (matched) {
      const index = nextGraph.components.findIndex((item) => item.id === matched.id);
      if (index < 0) return;
      const mergedProps = mergePropsSafely(
        matched.props,
        aiComponent.props,
        manualLocks,
        matched.id,
        allowOverwriteManual
      );
      nextGraph.components[index] = {
        ...matched,
        props: mergedProps,
      };
      used.add(matched.id);
      return;
    }

    const type = String(aiComponent.type || "TextBlock");
    const id = String(aiComponent.id || "").trim() || createComponentId(type);
    nextGraph.components.push(
      createComponentNode({
        ...aiComponent,
        id,
        type,
        props: toSafeProps(aiComponent.props),
      })
    );
    used.add(id);
  });

  return normalizePageGraph(nextGraph);
};

export const createMockAiGraphFromPrompt = (prompt = "") => {
  const text = String(prompt || "").trim();
  const phrase = text || "AI Generated Website";
  return normalizePageGraph({
    id: "homepage",
    title: "Homepage",
    components: [
      {
        type: "Hero",
        props: {
          title: phrase,
          subtitle: "Generated from AI prompt",
          cta: "Get Started",
          buttonUrl: "#contact",
        },
      },
      {
        type: "Services",
        props: {
          title: "AI Services",
          items: ["Strategy", "Execution", "Optimization"],
        },
      },
      {
        type: "CTA",
        props: {
          title: "Want AI-generated growth?",
          buttonText: "Book a Demo",
          buttonUrl: "#contact",
        },
      },
    ],
  });
};
