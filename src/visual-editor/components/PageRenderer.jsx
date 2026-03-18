import React from "react";
import EditableWrapper from "./EditableWrapper";
import { componentDefinitionRegistry, componentRegistry } from "../registry/componentRegistry";
import { useEditor } from "../editor/EditorContext";

function UnknownComponent({ type }) {
  return (
    <section style={{ border: "1px dashed #94a3b8", borderRadius: 12, padding: 16, background: "#f8fafc" }}>
      Unknown component type: <strong>{String(type || "unknown")}</strong>
    </section>
  );
}

export default function PageRenderer({ graph }) {
  const { pageGraph } = useEditor();
  const activeGraph = graph || pageGraph;
  const components = Array.isArray(activeGraph?.components) ? activeGraph.components : [];

  return (
    <div className="ve-canvas">
      {components.map((component, index) => {
        const Component = componentRegistry[component.type] || UnknownComponent;
        const definition = componentDefinitionRegistry[component.type];
        const label = definition?.label || component.type;
        return (
          <EditableWrapper key={component.id} id={component.id} index={index} label={label}>
            <Component {...(component.props || {})} type={component.type} />
          </EditableWrapper>
        );
      })}
    </div>
  );
}
