import React from "react";
import { componentDefinitionRegistry } from "../registry/componentRegistry";
import { useEditor } from "../editor/EditorContext";

const listToTextarea = (value) => (Array.isArray(value) ? value.join("\n") : "");

const textareaToList = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export default function PropertyEditorPanel() {
  const {
    selectedComponent,
    selectedComponentId,
    updateComponent,
    duplicateComponent,
    removeComponent,
  } = useEditor();

  if (!selectedComponent) {
    return (
      <aside className="ve-panel">
        <h3>Properties</h3>
        <p className="ve-muted">Select a section to edit its properties.</p>
      </aside>
    );
  }

  const definition = componentDefinitionRegistry[selectedComponent.type] || componentDefinitionRegistry.TextBlock;
  const fields = Array.isArray(definition?.fields) ? definition.fields : [];

  return (
    <aside className="ve-panel">
      <h3>Selected: {selectedComponentId}</h3>
      <p className="ve-muted">{definition.label || selectedComponent.type}</p>
      <div className="ve-property-actions">
        <button type="button" onClick={() => duplicateComponent(selectedComponent.id)}>
          Duplicate
        </button>
        <button type="button" className="ve-danger" onClick={() => removeComponent(selectedComponent.id)}>
          Delete
        </button>
      </div>
      <div className="ve-fields">
        {fields.map((field) => {
          const key = field.key;
          const value = selectedComponent.props?.[key];
          if (field.type === "textarea") {
            return (
              <label key={key}>
                <span>{field.label}</span>
                <textarea
                  value={String(value ?? "")}
                  onChange={(event) => updateComponent(selectedComponent.id, { [key]: event.target.value })}
                />
              </label>
            );
          }
          if (field.type === "list") {
            return (
              <label key={key}>
                <span>{field.label}</span>
                <textarea
                  value={listToTextarea(value)}
                  onChange={(event) =>
                    updateComponent(selectedComponent.id, { [key]: textareaToList(event.target.value) })
                  }
                />
              </label>
            );
          }
          if (field.type === "checkbox") {
            return (
              <label key={key}>
                <span>{field.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => updateComponent(selectedComponent.id, { [key]: event.target.checked })}
                />
              </label>
            );
          }
          return (
            <label key={key}>
              <span>{field.label}</span>
              <input
                type={field.type === "url" ? "url" : "text"}
                value={String(value ?? "")}
                onChange={(event) => updateComponent(selectedComponent.id, { [key]: event.target.value })}
              />
            </label>
          );
        })}
      </div>
    </aside>
  );
}
