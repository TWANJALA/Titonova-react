export { EditorProvider, useEditor } from "./editor/EditorContext";
export { DEFAULT_PAGE_GRAPH, createPageGraph, normalizePageGraph } from "./schema/pageGraph";
export { componentRegistry, componentDefinitionRegistry } from "./registry/componentRegistry";
export { default as PageRenderer } from "./components/PageRenderer";
export { default as EditableWrapper } from "./components/EditableWrapper";
export { default as PropertyEditorPanel } from "./components/PropertyEditorPanel";
export { default as VisualBuilderStudio } from "./components/VisualBuilderStudio";
export { default as usePageGraphAutosave } from "./autosave/usePageGraphAutosave";
export { mergeAiComponentsIntoGraph, createMockAiGraphFromPrompt } from "./ai/aiGraphIntegration";
