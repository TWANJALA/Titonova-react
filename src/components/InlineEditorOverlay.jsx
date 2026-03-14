import React from "react";

export default function InlineEditorOverlay({
  styles,
  isInlineEditing,
  inlineEditToolbarStyle,
  inlineEditMetaStyle,
  inlineSmartStatus,
  inlineSiteModel,
  inlineSelectionText,
  inlineSelectionSection,
  inlineCheckpoints,
  handleRestoreInlineCheckpoint,
  inlineAdvancedOpen,
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
  floatingToolbarPos,
  isCompactInlineEditor,
  viewportWidth,
  focusInlineEditableNode,
  selectedEditableNodeRef,
  syncInlineSiteModelFromDom,
  setSelectedEditableMeta,
  handleInlineImageReplace,
}) {
  if (!isInlineEditing) return null;

  const canRewriteSelection = Boolean(inlineSelectionText || selectedEditableMeta?.type === "text");
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
          <small style={styles.inlineEditHint}>
            Click any text and type. Save when you're done. Shortcuts: Cmd/Ctrl+S save, Cmd/Ctrl+Z undo, Cmd/Ctrl+Y redo.
          </small>
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
          {inlineAdvancedOpen && (
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
        </div>
        <div style={inlineEditActionsStyle}>
          <span style={inlineDraftDirty ? styles.inlineDirtyBadge : styles.inlineCleanBadge}>
            {inlineDraftDirty ? "Unsaved changes" : "Saved"}
          </span>
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
          <button style={styles.inlineAutoApplyButton} onClick={handleImproveInlineSectionCopy} disabled={inlineBulkImproving}>
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
          <button style={styles.inlineModeButton} onClick={() => setInlineAdvancedOpen((previous) => !previous)}>
            {inlineAdvancedOpen ? "Hide Advanced" : "Advanced"}
          </button>
          {inlineAdvancedOpen && (
            <button style={styles.inlineModeButton} onClick={() => setFieldLockMode((previous) => !previous)}>
              {fieldLockMode ? "Text-only mode" : "Free layout mode"}
            </button>
          )}
        </div>
      </div>
      {selectedEditableMeta ? (
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
          <div style={styles.inlineFloatingActions}>
            {selectedEditableMeta.type === "text" ? (
              <button style={styles.inlineSuggestionApply} onClick={() => focusInlineEditableNode(selectedEditableNodeRef.current)}>
                Edit Text
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
