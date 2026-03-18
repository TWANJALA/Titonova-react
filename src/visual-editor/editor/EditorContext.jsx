import React, { createContext, useContext, useMemo, useReducer } from "react";
import { mergeAiComponentsIntoGraph } from "../ai/aiGraphIntegration";
import {
  cloneSnapshot,
  commitHistory,
  createHistoryState,
  redoHistory,
  undoHistory,
} from "../history/historyManager";
import {
  createComponentId,
  createComponentNode,
  DEFAULT_PAGE_GRAPH,
  findComponentById,
  normalizePageGraph,
} from "../schema/pageGraph";
import { componentDefinitionRegistry } from "../registry/componentRegistry";

const EditorContext = createContext(null);

const SOURCE_MANUAL = "manual";

const getDefaultPropsForType = (type) => {
  const definition = componentDefinitionRegistry[String(type || "")];
  return definition?.defaultProps ? { ...definition.defaultProps } : {};
};

const lockManualProps = (state, componentId, propKeys) => {
  if (!componentId || !Array.isArray(propKeys) || propKeys.length === 0) return state.manualLocks;
  const existing = state.manualLocks?.[componentId] || {};
  const nextLocks = { ...existing };
  propKeys.forEach((key) => {
    const propKey = String(key || "").trim();
    if (propKey) nextLocks[propKey] = true;
  });
  return {
    ...(state.manualLocks || {}),
    [componentId]: nextLocks,
  };
};

const applyGraphWithHistory = (state, nextGraph, options = {}) => {
  const normalizedNext = normalizePageGraph(nextGraph);
  const nextHistory = commitHistory(state.history, normalizedNext);
  const selectedId = String(state.selectedComponentId || "");
  const selectedStillExists = selectedId
    ? Boolean(findComponentById(normalizedNext, selectedId))
    : false;
  return {
    ...state,
    history: nextHistory,
    selectedComponentId: selectedStillExists
      ? selectedId
      : normalizedNext.components[0]?.id || null,
    manualLocks:
      options.source === SOURCE_MANUAL && options.componentId
        ? lockManualProps(state, options.componentId, options.propKeys || [])
        : state.manualLocks,
  };
};

const initialEditorState = (initialGraph) => {
  const normalized = normalizePageGraph(initialGraph || DEFAULT_PAGE_GRAPH);
  return {
    selectedComponentId: normalized.components[0]?.id || null,
    pageGraph: normalized,
    editMode: "visual",
    history: createHistoryState(normalized),
    manualLocks: {},
  };
};

const editorReducer = (state, action) => {
  switch (action.type) {
    case "SELECT_COMPONENT": {
      return {
        ...state,
        selectedComponentId: action.payload || null,
      };
    }
    case "SET_EDIT_MODE": {
      const mode = String(action.payload || "visual");
      return {
        ...state,
        editMode: mode,
      };
    }
    case "UPDATE_COMPONENT": {
      const { id, newProps, source = SOURCE_MANUAL } = action.payload || {};
      if (!id || !newProps || typeof newProps !== "object") return state;
      const currentGraph = state.history.present;
      const nextComponents = currentGraph.components.map((component) => {
        if (component.id !== id) return component;
        return {
          ...component,
          props: {
            ...(component.props || {}),
            ...newProps,
          },
        };
      });
      return applyGraphWithHistory(
        state,
        {
          ...currentGraph,
          components: nextComponents,
        },
        {
          source,
          componentId: id,
          propKeys: Object.keys(newProps),
        }
      );
    }
    case "ADD_COMPONENT": {
      const { type, index } = action.payload || {};
      const componentType = String(type || "TextBlock");
      const currentGraph = state.history.present;
      const nextComponent = createComponentNode({
        id: createComponentId(componentType),
        type: componentType,
        props: getDefaultPropsForType(componentType),
      });
      const nextComponents = [...currentGraph.components];
      const targetIndex =
        Number.isInteger(index) && index >= 0 && index <= nextComponents.length
          ? index
          : nextComponents.length;
      nextComponents.splice(targetIndex, 0, nextComponent);
      const nextState = applyGraphWithHistory(state, {
        ...currentGraph,
        components: nextComponents,
      });
      return {
        ...nextState,
        selectedComponentId: nextComponent.id,
      };
    }
    case "REMOVE_COMPONENT": {
      const id = String(action.payload || "");
      if (!id) return state;
      const currentGraph = state.history.present;
      const nextComponents = currentGraph.components.filter((component) => component.id !== id);
      if (nextComponents.length === currentGraph.components.length) return state;
      const nextGraph = {
        ...currentGraph,
        components: nextComponents,
      };
      const nextState = applyGraphWithHistory(state, nextGraph);
      return {
        ...nextState,
        manualLocks: Object.fromEntries(
          Object.entries(nextState.manualLocks || {}).filter(([componentId]) => componentId !== id)
        ),
      };
    }
    case "DUPLICATE_COMPONENT": {
      const id = String(action.payload || "");
      if (!id) return state;
      const currentGraph = state.history.present;
      const source = currentGraph.components.find((component) => component.id === id);
      if (!source) return state;
      const duplicate = createComponentNode({
        ...cloneSnapshot(source),
        id: createComponentId(source.type),
      });
      const sourceIndex = currentGraph.components.findIndex((component) => component.id === id);
      const nextComponents = [...currentGraph.components];
      nextComponents.splice(sourceIndex + 1, 0, duplicate);
      const nextState = applyGraphWithHistory(state, {
        ...currentGraph,
        components: nextComponents,
      });
      return {
        ...nextState,
        selectedComponentId: duplicate.id,
      };
    }
    case "MOVE_COMPONENT": {
      const { id, toIndex } = action.payload || {};
      const componentId = String(id || "");
      if (!componentId) return state;
      const currentGraph = state.history.present;
      const fromIndex = currentGraph.components.findIndex((component) => component.id === componentId);
      if (fromIndex < 0) return state;
      const clampedTo = Math.max(0, Math.min(currentGraph.components.length - 1, Number(toIndex)));
      if (fromIndex === clampedTo) return state;
      const nextComponents = [...currentGraph.components];
      const [moved] = nextComponents.splice(fromIndex, 1);
      nextComponents.splice(clampedTo, 0, moved);
      return applyGraphWithHistory(state, {
        ...currentGraph,
        components: nextComponents,
      });
    }
    case "MERGE_AI_GRAPH": {
      const { aiGraph, allowOverwriteManual = false } = action.payload || {};
      if (!aiGraph || typeof aiGraph !== "object") return state;
      const merged = mergeAiComponentsIntoGraph({
        currentGraph: state.history.present,
        aiGraph,
        manualLocks: state.manualLocks,
        allowOverwriteManual,
      });
      return applyGraphWithHistory(state, merged, { source: "ai" });
    }
    case "UNDO": {
      const nextHistory = undoHistory(state.history);
      if (nextHistory === state.history) return state;
      const selectedExists = Boolean(findComponentById(nextHistory.present, state.selectedComponentId));
      return {
        ...state,
        history: nextHistory,
        selectedComponentId: selectedExists
          ? state.selectedComponentId
          : nextHistory.present.components[0]?.id || null,
      };
    }
    case "REDO": {
      const nextHistory = redoHistory(state.history);
      if (nextHistory === state.history) return state;
      const selectedExists = Boolean(findComponentById(nextHistory.present, state.selectedComponentId));
      return {
        ...state,
        history: nextHistory,
        selectedComponentId: selectedExists
          ? state.selectedComponentId
          : nextHistory.present.components[0]?.id || null,
      };
    }
    case "REPLACE_GRAPH": {
      const nextGraph = normalizePageGraph(action.payload || DEFAULT_PAGE_GRAPH);
      return {
        ...state,
        history: createHistoryState(nextGraph),
        selectedComponentId: nextGraph.components[0]?.id || null,
        manualLocks: {},
      };
    }
    default:
      return state;
  }
};

export function EditorProvider({ children, initialGraph }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState(initialGraph));

  const value = useMemo(() => {
    const pageGraph = state.history.present;
    const selectedComponent = findComponentById(pageGraph, state.selectedComponentId);
    return {
      selectedComponentId: state.selectedComponentId,
      selectedComponent,
      pageGraph,
      editMode: state.editMode,
      history: state.history,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      selectComponent: (id) => dispatch({ type: "SELECT_COMPONENT", payload: id }),
      setEditMode: (mode) => dispatch({ type: "SET_EDIT_MODE", payload: mode }),
      updateComponent: (id, newProps, source = SOURCE_MANUAL) =>
        dispatch({ type: "UPDATE_COMPONENT", payload: { id, newProps, source } }),
      addComponent: (type, index) =>
        dispatch({ type: "ADD_COMPONENT", payload: { type, index } }),
      removeComponent: (id) => dispatch({ type: "REMOVE_COMPONENT", payload: id }),
      duplicateComponent: (id) => dispatch({ type: "DUPLICATE_COMPONENT", payload: id }),
      moveComponent: (id, toIndex) => dispatch({ type: "MOVE_COMPONENT", payload: { id, toIndex } }),
      applyAiGraph: (aiGraph, options = {}) =>
        dispatch({ type: "MERGE_AI_GRAPH", payload: { aiGraph, ...options } }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
      replaceGraph: (graph) => dispatch({ type: "REPLACE_GRAPH", payload: graph }),
    };
  }, [state]);

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used inside <EditorProvider />");
  }
  return context;
};
