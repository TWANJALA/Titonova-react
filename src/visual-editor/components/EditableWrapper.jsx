import React from "react";
import { useEditor } from "../editor/EditorContext";

export default function EditableWrapper({ id, label, index, children }) {
  const {
    selectedComponentId,
    selectComponent,
    removeComponent,
    duplicateComponent,
    moveComponent,
    addComponent,
    editMode,
  } = useEditor();
  const isSelected = selectedComponentId === id;
  const canEdit = editMode !== "preview";

  const handleDrop = (event) => {
    if (!canEdit) return;
    event.preventDefault();
    const sourceId = String(event.dataTransfer.getData("text/plain") || "").trim();
    if (!sourceId || sourceId === id) return;
    moveComponent(sourceId, index);
    selectComponent(sourceId);
  };

  const handleDragStart = (event) => {
    if (!canEdit) return;
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      data-component-id={id}
      data-edit-id={id}
      className={`ve-wrapper ${isSelected ? "ve-wrapper-selected" : ""}`}
      onClick={(event) => {
        if (!canEdit) return;
        event.stopPropagation();
        selectComponent(id);
      }}
      onDragOver={(event) => {
        if (!canEdit) return;
        event.preventDefault();
      }}
      onDrop={handleDrop}
      draggable={canEdit}
      onDragStart={handleDragStart}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (!canEdit) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectComponent(id);
        }
      }}
    >
      <div className="ve-wrapper-label">{label || id}</div>
      {isSelected && canEdit ? (
        <div className="ve-wrapper-actions">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              duplicateComponent(id);
            }}
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              addComponent("TextBlock", index + 1);
            }}
          >
            Add Below
          </button>
          <button
            type="button"
            className="ve-danger"
            onClick={(event) => {
              event.stopPropagation();
              removeComponent(id);
            }}
          >
            Delete
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
