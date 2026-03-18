import React, { useMemo, useState } from "react";
import { createMockAiGraphFromPrompt } from "../ai/aiGraphIntegration";
import usePageGraphAutosave from "../autosave/usePageGraphAutosave";
import { EditorProvider, useEditor } from "../editor/EditorContext";
import { componentDefinitionRegistry } from "../registry/componentRegistry";
import { DEFAULT_PAGE_GRAPH, normalizePageGraph } from "../schema/pageGraph";
import PageRenderer from "./PageRenderer";
import PropertyEditorPanel from "./PropertyEditorPanel";
import "../visualEditor.css";

const requestAiGraph = async ({ prompt, pageGraph }) => {
  const response = await fetch("/api/ai/generate-graph", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      graph: pageGraph,
      pageId: pageGraph?.id,
    }),
  });
  if (!response.ok) {
    throw new Error("AI graph request failed");
  }
  const payload = await response.json().catch(() => ({}));
  if (payload?.graph && typeof payload.graph === "object") {
    return normalizePageGraph(payload.graph);
  }
  if (Array.isArray(payload?.components)) {
    return normalizePageGraph({
      id: pageGraph?.id || "homepage",
      title: pageGraph?.title || "Homepage",
      components: payload.components,
    });
  }
  throw new Error("AI response did not contain a valid graph.");
};

function VisualBuilderWorkspace() {
  const {
    pageGraph,
    selectedComponentId,
    selectComponent,
    addComponent,
    applyAiGraph,
    replaceGraph,
    undo,
    redo,
    canUndo,
    canRedo,
    editMode,
    setEditMode,
  } = useEditor();

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [allowOverwriteManual, setAllowOverwriteManual] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [loadingSavedGraph, setLoadingSavedGraph] = useState(false);

  const autosave = usePageGraphAutosave({
    pageId: pageGraph?.id || "homepage",
    graph: pageGraph,
    enabled: true,
  });

  const componentTypes = useMemo(
    () => Object.keys(componentDefinitionRegistry),
    []
  );

  const handleRunAi = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    setAiStatus("Running AI generation...");
    try {
      let aiGraph = null;
      try {
        aiGraph = await requestAiGraph({ prompt: aiPrompt, pageGraph });
      } catch {
        aiGraph = createMockAiGraphFromPrompt(aiPrompt);
      }
      applyAiGraph(aiGraph, { allowOverwriteManual });
      setAiStatus(
        allowOverwriteManual
          ? "AI graph merged (manual locks can be overwritten)."
          : "AI graph merged (manual edits preserved)."
      );
    } catch (error) {
      setAiStatus(`AI failed: ${String(error?.message || "unknown error")}`);
    } finally {
      setAiBusy(false);
    }
  };

  const handleLoadSavedGraph = async () => {
    if (loadingSavedGraph) return;
    setLoadingSavedGraph(true);
    setAiStatus("Loading saved graph...");
    try {
      const response = await fetch(`/api/save-page?pageId=${encodeURIComponent(pageGraph?.id || "homepage")}`);
      if (!response.ok) {
        throw new Error("No saved graph found for this page.");
      }
      const payload = await response.json().catch(() => ({}));
      if (!payload?.graph || typeof payload.graph !== "object") {
        throw new Error("Saved graph payload is invalid.");
      }
      replaceGraph(payload.graph);
      setAiStatus("Loaded saved graph snapshot.");
    } catch (error) {
      setAiStatus(`Load failed: ${String(error?.message || "unknown error")}`);
    } finally {
      setLoadingSavedGraph(false);
    }
  };

  return (
    <div className="ve-root">
      <header className="ve-topbar">
        <strong>Visual Component Graph Editor</strong>
        <select value={editMode} onChange={(event) => setEditMode(event.target.value)}>
          <option value="visual">Visual</option>
          <option value="ai">AI</option>
          <option value="preview">Preview</option>
        </select>
        <button type="button" onClick={undo} disabled={!canUndo}>
          Undo
        </button>
        <button type="button" onClick={redo} disabled={!canRedo}>
          Redo
        </button>
        <button type="button" onClick={handleLoadSavedGraph} disabled={loadingSavedGraph}>
          {loadingSavedGraph ? "Loading..." : "Load Saved"}
        </button>
        <input
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          placeholder="Generate a home care website for Dallas"
          style={{ minWidth: 320 }}
        />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={allowOverwriteManual}
            onChange={(event) => setAllowOverwriteManual(event.target.checked)}
          />
          Allow AI overwrite
        </label>
        <button type="button" onClick={handleRunAi} disabled={aiBusy}>
          {aiBusy ? "Generating..." : "Generate Graph"}
        </button>
        <small>
          Autosave: {autosave.status}
          {autosave.lastSavedAt ? ` (${new Date(autosave.lastSavedAt).toLocaleTimeString()})` : ""}
        </small>
        {autosave.lastError ? <small style={{ color: "#fca5a5" }}>{autosave.lastError}</small> : null}
        {aiStatus ? <small>{aiStatus}</small> : null}
      </header>

      <div className="ve-layout">
        <aside className="ve-sidebar">
          <h3>Add Component</h3>
          <div className="ve-component-list">
            {componentTypes.map((type) => (
              <button key={type} type="button" onClick={() => addComponent(type)}>
                + {componentDefinitionRegistry[type]?.label || type}
              </button>
            ))}
          </div>
          <h3>Page Graph</h3>
          <p className="ve-muted">{pageGraph?.id}</p>
          <div className="ve-outline-list">
            {(pageGraph?.components || []).map((component) => (
              <button
                key={component.id}
                type="button"
                className={selectedComponentId === component.id ? "ve-outline-selected" : ""}
                onClick={() => selectComponent(component.id)}
              >
                {componentDefinitionRegistry[component.type]?.label || component.type}: {component.id}
              </button>
            ))}
          </div>
        </aside>

        <main className="ve-canvas-wrap">
          <PageRenderer graph={pageGraph} />
        </main>

        <PropertyEditorPanel />
      </div>
    </div>
  );
}

export default function VisualBuilderStudio({ initialGraph = DEFAULT_PAGE_GRAPH }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <EditorProvider initialGraph={initialGraph}>
      <VisualBuilderWorkspace />
    </EditorProvider>
  );
}
