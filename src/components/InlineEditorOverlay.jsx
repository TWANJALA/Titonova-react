import React from "react";

export default function InlineEditorOverlay({
  styles,
  isInlineEditing,
  inlineEditToolbarStyle,
  inlineEditMetaStyle,
  inlineSmartStatus,
  inlineSiteModel,
  sections,
  selectedSectionEditId,
  updateSection,
  inlineSelectionText,
  inlineSelectionSection,
  inlineCheckpoints,
  handleRestoreInlineCheckpoint,
  inlineAdvancedOpen,
  simpleInlineMode,
  setSimpleInlineMode,
  stylesInput,
  inlineSmartCommand,
  setInlineSmartCommand,
  handleRunInlineSmartCommand,
  getInlineCommandOptions,
  inlineAutoApplyHighConfidence,
  setInlineAutoApplyHighConfidence,
  inlineSuggestions,
  handleApplyInlineSuggestion,
  inlineEditActionsStyle,
  inlineDraftDirty,
  handleImproveInlinePageCopy,
  inlineBulkImproving,
  handleImproveInlineSectionCopy,
  handleImproveAndSaveInlinePageCopy,
  handleImproveSavePublishInline,
  publishing,
  inlineLastPublishSnapshot,
  handleRollbackInlinePublishSnapshot,
  handleUndoInlineEdit,
  editHistory,
  handleRedoInlineEdit,
  redoHistory,
  handleSaveInlineEdit,
  handleCancelInlineEdit,
  setInlineAdvancedOpen,
  fieldLockMode,
  setFieldLockMode,
  selectedEditableMeta,
  selectedSectionMeta,
  floatingToolbarPos,
  isCompactInlineEditor,
  viewportWidth,
  focusInlineEditableNode,
  selectedEditableNodeRef,
  syncInlineSiteModelFromDom,
  setSelectedEditableMeta,
  handleInlineImageReplace,
  handleSectionFieldChange,
  handleImproveSelectedSection,
  handleReplaceSelectedSection,
  handleMoveSelectedSection,
  handleDeleteSelectedSection,
}) {
  if (!isInlineEditing) return null;

  const canRewriteSelection = Boolean(inlineSelectionText || selectedEditableMeta?.type === "text");
  const canEditSection = Boolean(selectedSectionMeta?.id);
  const selectedSectionValue = selectedSectionEditId
    ? String(sections?.[selectedSectionEditId] ?? "")
    : "";
  const selectedEditableType = String(selectedEditableMeta?.type || "").toLowerCase();
  const selectedEditableValue = selectedEditableMeta?.id
    ? selectedEditableType === "image"
      ? String(selectedEditableMeta?.value || "")
      : String(sections?.[selectedEditableMeta.id] ?? selectedEditableMeta?.value ?? "")
    : "";
  const canInlineEditSelectedValue = selectedEditableType === "text" || selectedEditableType === "button" || selectedEditableType === "link";
  const showAdvancedControls = !simpleInlineMode;
  const preserveInlineSelection = (event) => {
    event.preventDefault();
  };
  const rewriteButtons = [
    { label: "Improve Text", command: "/smart" },
    { label: "Shorter", command: "/shorten" },
    { label: "More Persuasive", command: "/persuasive" },
    { label: "SEO Optimized", command: "/seo" },
  ];

  return (
    <>
      <div style={inlineEditToolbarStyle}>
        <div style={inlineEditMetaStyle}>
          <strong style={styles.inlineEditTitle}>Inline edit mode</strong>
          <div style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <button
              style={simpleInlineMode ? styles.inlineModeButton : styles.inlineSmartChip}
              onClick={() => setSimpleInlineMode(true)}
            >
              Simple
            </button>
            <button
              style={!simpleInlineMode ? styles.inlineModeButton : styles.inlineSmartChip}
              onClick={() => setSimpleInlineMode(false)}
            >
              Advanced
            </button>
          </div>
          <small style={styles.inlineEditHint}>
            Click any text and type. Save when you're done. Shortcuts: Cmd/Ctrl+S save, Cmd/Ctrl+Z undo, Cmd/Ctrl+Y redo.
          </small>
          {simpleInlineMode ? (
            <small style={styles.inlineSelectionMeta}>Quick steps: 1) Click text in preview 2) Type in the box 3) Click Save.</small>
          ) : null}
          {inlineSmartStatus ? <small style={styles.inlineSmartStatus}>{inlineSmartStatus}</small> : null}
          <small style={styles.inlineSelectionMeta}>
            Synced editable elements: {Object.keys(inlineSiteModel).length}
          </small>
          {inlineSelectionText ? (
            <small style={styles.inlineSelectionMeta}>
              Section: {inlineSelectionSection || "general"} | Selected:{" "}
              {inlineSelectionText.length > 90 ? `${inlineSelectionText.slice(0, 90)}...` : inlineSelectionText}
            </small>
          ) : null}
          {inlineCheckpoints.length > 0 ? (
            <div style={styles.inlineCheckpointRow}>
              {inlineCheckpoints
                .slice(-3)
                .reverse()
                .map((checkpoint) => (
                  <button
                    key={checkpoint.id}
                    style={styles.inlineCheckpointChip}
                    onClick={() => handleRestoreInlineCheckpoint(checkpoint.id)}
                    title={`Restore ${checkpoint.label}`}
                  >
                    {checkpoint.label} • {new Date(checkpoint.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
            </div>
          ) : null}
          {inlineAdvancedOpen && showAdvancedControls && (
            <>
              <div style={styles.inlineSmartRow}>
                <input
                  style={stylesInput}
                  value={inlineSmartCommand}
                  onChange={(event) => setInlineSmartCommand(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleRunInlineSmartCommand();
                    }
                  }}
                  placeholder="Smart command: /smart /shorten /expand /seo /cta /professional /friendly /fix"
                />
                <button style={styles.inlineSmartRunButton} onClick={() => handleRunInlineSmartCommand()}>
                  Smart Rewrite
                </button>
              </div>
              <small style={styles.inlineAdaptiveMeta}>
                Adaptive commands: {inlineSelectionSection || "general"}
              </small>
              <div style={styles.inlineSmartChips}>
                {getInlineCommandOptions(inlineSelectionSection).map((command) => (
                  <button
                    key={command}
                    style={styles.inlineSmartChip}
                    onClick={() => handleRunInlineSmartCommand(command)}
                  >
                    {command}
                  </button>
                ))}
              </div>
              <label style={styles.inlineAutoModeToggle}>
                <input
                  type="checkbox"
                  checked={inlineAutoApplyHighConfidence}
                  onChange={(event) => setInlineAutoApplyHighConfidence(event.target.checked)}
                />
                Auto-apply when confidence is 90%+
              </label>
              {inlineSuggestions.length > 0 ? (
                <div style={styles.inlineSuggestionWrap}>
                  {inlineSuggestions.map((item) => (
                    <article key={`${item.key}-${item.text}`} style={styles.inlineSuggestionItem}>
                      <small style={styles.inlineSuggestionLabel}>
                        {item.label} ({Math.round(Number(item.confidence) || 0)}%)
                      </small>
                      <small style={styles.inlineSuggestionText}>{item.text}</small>
                      <button
                        style={styles.inlineSuggestionApply}
                        onMouseDown={preserveInlineSelection}
                        onClick={() => handleApplyInlineSuggestion(item.text, item.label, item.confidence)}
                      >
                        Apply
                      </button>
                    </article>
                  ))}
                </div>
              ) : null}
            </>
          )}
          {selectedSectionMeta ? (
            <div style={styles.inlineSectionEditorCard}>
              <div style={styles.inlineSectionHeader}>
                <strong style={styles.inlineSectionTitle}>Section Editor</strong>
                <small style={styles.inlineSectionMeta}>
                  {selectedSectionMeta.sectionName || selectedSectionMeta.component || "section"} • {selectedSectionMeta.sectionType || "general"}
                </small>
              </div>
              {selectedSectionEditId ? (
                <label style={styles.inlineSectionField}>
                  <small style={styles.inlineSectionLabel}>
                    Selected Text Block
                  </small>
                  <textarea
                    style={{ ...stylesInput, minHeight: 80, resize: "vertical" }}
                    value={selectedSectionValue}
                    onChange={(event) => updateSection(selectedSectionEditId, event.target.value)}
                  />
                </label>
              ) : null}
              {showAdvancedControls ? (
                <>
                  <label style={styles.inlineSectionField}>
                    <small style={styles.inlineSectionLabel}>Title</small>
                    <input
                      style={stylesInput}
                      value={selectedSectionMeta.titleId ? String(sections?.[selectedSectionMeta.titleId] ?? selectedSectionMeta.title ?? "") : selectedSectionMeta.title || ""}
                      onChange={(event) => handleSectionFieldChange("title", event.target.value)}
                    />
                  </label>
                  <label style={styles.inlineSectionField}>
                    <small style={styles.inlineSectionLabel}>Subtitle</small>
                    <textarea
                      style={{ ...stylesInput, minHeight: 72, resize: "vertical" }}
                      value={selectedSectionMeta.subtitleId ? String(sections?.[selectedSectionMeta.subtitleId] ?? selectedSectionMeta.subtitle ?? "") : selectedSectionMeta.subtitle || ""}
                      onChange={(event) => handleSectionFieldChange("subtitle", event.target.value)}
                    />
                  </label>
                  <label style={styles.inlineSectionField}>
                    <small style={styles.inlineSectionLabel}>Button Text</small>
                    <input
                      style={stylesInput}
                      value={selectedSectionMeta.buttonTextId ? String(sections?.[selectedSectionMeta.buttonTextId] ?? selectedSectionMeta.buttonText ?? "") : selectedSectionMeta.buttonText || ""}
                      onChange={(event) => handleSectionFieldChange("buttonText", event.target.value)}
                    />
                  </label>
                  <div style={styles.inlineSectionActions}>
                    <button style={styles.inlineAutoApplyButton} onMouseDown={preserveInlineSelection} onClick={handleImproveSelectedSection}>
                      Improve
                    </button>
                    <button style={styles.inlineAutoApplyButton} onMouseDown={preserveInlineSelection} onClick={handleReplaceSelectedSection}>
                      Replace
                    </button>
                    <button style={styles.inlineSmartChip} onMouseDown={preserveInlineSelection} onClick={() => handleMoveSelectedSection("up")}>
                      Move Up
                    </button>
                    <button style={styles.inlineSmartChip} onMouseDown={preserveInlineSelection} onClick={() => handleMoveSelectedSection("down")}>
                      Move Down
                    </button>
                    <button style={styles.cancelButton} onMouseDown={preserveInlineSelection} onClick={handleDeleteSelectedSection}>
                      Delete
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <div style={inlineEditActionsStyle}>
          <span style={inlineDraftDirty ? styles.inlineDirtyBadge : styles.inlineCleanBadge}>
            {inlineDraftDirty ? "Unsaved changes" : "Saved"}
          </span>
          <button style={styles.undoButton} onClick={handleUndoInlineEdit} disabled={editHistory.length <= 1}>
            Undo
          </button>
          <button style={styles.undoButton} onClick={handleRedoInlineEdit} disabled={redoHistory.length <= 0}>
            Redo
          </button>
          <button style={styles.saveButton} onClick={handleSaveInlineEdit}>
            Save
          </button>
          <button style={styles.cancelButton} onClick={handleCancelInlineEdit}>
            Discard
          </button>
          {showAdvancedControls ? (
            <>
              {rewriteButtons.map((item) => (
                <button
                  key={item.command}
                  style={styles.inlineAutoApplyButton}
                  disabled={!canRewriteSelection}
                  onMouseDown={preserveInlineSelection}
                  onClick={() => handleRunInlineSmartCommand(item.command)}
                >
                  {item.label}
                </button>
              ))}
              <button style={styles.inlineAutoApplyButton} onClick={handleImproveInlinePageCopy} disabled={inlineBulkImproving}>
                {inlineBulkImproving ? "Improving..." : "Improve Page Copy"}
              </button>
              <button style={styles.inlineAutoApplyButton} onClick={handleImproveInlineSectionCopy} disabled={inlineBulkImproving || !canEditSection}>
                Improve Section
              </button>
              <button style={styles.saveButton} onClick={handleImproveAndSaveInlinePageCopy} disabled={inlineBulkImproving}>
                Improve + Save
              </button>
              <button style={styles.goLiveButton} onClick={handleImproveSavePublishInline} disabled={inlineBulkImproving || publishing}>
                {publishing ? "Publishing..." : "Improve + Save + Publish"}
              </button>
              {inlineLastPublishSnapshot?.html ? (
                <button style={styles.undoButton} onClick={handleRollbackInlinePublishSnapshot}>
                  Quick Rollback
                </button>
              ) : null}
              <button style={styles.inlineModeButton} onClick={() => setInlineAdvancedOpen((previous) => !previous)}>
                {inlineAdvancedOpen ? "Hide Advanced" : "Advanced"}
              </button>
              {inlineAdvancedOpen ? (
                <button style={styles.inlineModeButton} onClick={() => setFieldLockMode((previous) => !previous)}>
                  {fieldLockMode ? "Text-only mode" : "Free layout mode"}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      {selectedEditableMeta && showAdvancedControls ? (
        <div
          style={{
            ...styles.inlineFloatingToolbar,
            top: `${floatingToolbarPos.top}px`,
            left: `${floatingToolbarPos.left}px`,
            width: isCompactInlineEditor ? `min(${Math.max(220, viewportWidth - 24)}px, calc(100vw - 24px))` : "320px",
          }}
        >
          <small style={styles.inlineFloatingEyebrow}>
            {selectedEditableMeta.type.toUpperCase()} • {selectedEditableMeta.component || "page"}
          </small>
          <strong style={styles.inlineFloatingTitle}>{selectedEditableMeta.id}</strong>
          <small style={styles.inlineFloatingValue}>
            {String(selectedEditableMeta.value || "").slice(0, 140) || "No value"}
          </small>
          {canInlineEditSelectedValue ? (
            <label style={styles.inlineSectionField}>
              <small style={styles.inlineSectionLabel}>
                {selectedEditableType === "button" ? "Button Label" : selectedEditableType === "link" ? "Link Label" : "Text Value"}
              </small>
              <textarea
                style={{ ...stylesInput, minHeight: 70, resize: "vertical" }}
                value={selectedEditableValue}
                onChange={(event) => updateSection(selectedEditableMeta.id, event.target.value)}
              />
            </label>
          ) : null}
          {selectedEditableType === "image" ? (
            <label style={styles.inlineSectionField}>
              <small style={styles.inlineSectionLabel}>Image URL</small>
              <input
                style={stylesInput}
                value={selectedEditableValue}
                onChange={(event) => updateSection(selectedEditableMeta.id, event.target.value)}
                placeholder="https://..."
              />
            </label>
          ) : null}
          <div style={styles.inlineFloatingActions}>
            {selectedEditableMeta.type === "text" || selectedEditableMeta.type === "button" || selectedEditableMeta.type === "link" ? (
              <button style={styles.inlineSuggestionApply} onClick={() => focusInlineEditableNode(selectedEditableNodeRef.current)}>
                {selectedEditableMeta.type === "button" ? "Edit Button" : selectedEditableMeta.type === "link" ? "Edit Link" : "Edit Text"}
              </button>
            ) : null}
            {selectedEditableMeta.type === "image" ? (
              <button
                style={styles.inlineSuggestionApply}
                onMouseDown={preserveInlineSelection}
                onClick={() => handleInlineImageReplace(selectedEditableNodeRef.current)}
              >
                Edit Image
              </button>
            ) : null}
            <button style={styles.inlineSmartChip} onClick={() => syncInlineSiteModelFromDom()}>
              Sync Model
            </button>
            <button
              style={styles.inlineSmartChip}
              onClick={() => {
                selectedEditableNodeRef.current = null;
                setSelectedEditableMeta(null);
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
