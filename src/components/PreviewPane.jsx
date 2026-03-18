import React, { Suspense } from "react";
import PreviewActionCenter from "./PreviewActionCenter";
import PreviewHeaderControls from "./PreviewHeaderControls";
import PublishFlow from "./PublishFlow";

const InlineEditorOverlay = React.lazy(() => import("./InlineEditorOverlay"));
const PreviewInsightsSections = React.lazy(() => import("./PreviewInsightsSections"));

export default function PreviewPane(props) {
  const {
    styles,
    hasGeneratedContent,
    isMobilePreview,
    customDomain,
    setCustomDomain,
    handleExportHtml,
    exportFramework,
    setExportFramework,
    exportFrameworkOptions,
    handleExportProjectBundle,
    exportBundleLoading,
    isInlineEditing,
    handleStartInlineEdit,
    handleUndoInlineEdit,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
    publishPrimaryHint,
    publishedSiteId,
    publishPrimaryAction,
    publishPrimaryLabel,
    oneClickHostingRunning,
    publishing,
    handleAddDomainNow,
    domainLoading,
    handleVerifyDnsNow,
    verifyingDns,
    handleOneClickHosting,
    handleGoLive,
    handleUnpublish,
    normalizedCustomDomain,
    dnsVerifyStatus,
    previewRecommendedStep,
    previewJourneySteps,
    previewEditableRef,
    inlineDraftDirty,
    publishStatus,
    publishReadinessMessage,
    orderPageKeys,
    generatedPages,
    activePage,
    handleSwitchPage,
    pageLabelFromKey,
    redesignInsights,
    showComparison,
    setShowComparison,
    newPageName,
    setNewPageName,
    handleAddPage,
    handleDeleteActivePage,
    seoChecklist,
    insightsProps,
    shouldShowGuestPreviewPrompt,
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
    inlineSmartInputStyle,
    inlineSmartCommand,
    setInlineSmartCommand,
    handleRunInlineSmartCommand,
    getInlineCommandOptions,
    inlineAutoApplyHighConfidence,
    setInlineAutoApplyHighConfidence,
    inlineSuggestions,
    handleApplyInlineSuggestion,
    inlineEditActionsStyle,
    handleImproveInlinePageCopy,
    inlineBulkImproving,
    handleImproveInlineSectionCopy,
    handleImproveAndSaveInlinePageCopy,
    handleImproveSavePublishInline,
    inlineLastPublishSnapshot,
    handleRollbackInlinePublishSnapshot,
    editHistory,
    handleRedoInlineEdit,
    redoHistory,
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
    selectInlineSection,
    previewEditableStyle,
    handlePreviewLinkNavigation,
    handleInlinePointerActivate,
    setInlineDraftDirty,
    selectInlineEditableNode,
    snapshotInlineDraft,
    captureInlineSelection,
    handleInlineHoverMove,
    handleInlineHoverLeave,
    draftHtml,
    generatedSite,
    previewGuestOverlayStyle,
    setAuthMode,
    handlePrimaryGenerateWebsite,
    handleSmartFillPrompt,
    handleQuickPromptChip,
  } = props;

  return (
    <aside style={styles.previewPane}>
      {hasGeneratedContent ? (
        <div style={styles.preview}>
          <PreviewHeaderControls
            styles={styles}
            isMobilePreview={isMobilePreview}
            customDomain={customDomain}
            setCustomDomain={setCustomDomain}
            handleExportHtml={handleExportHtml}
            exportFramework={exportFramework}
            setExportFramework={setExportFramework}
            exportFrameworkOptions={exportFrameworkOptions}
            handleExportProjectBundle={handleExportProjectBundle}
            exportBundleLoading={exportBundleLoading}
            isInlineEditing={isInlineEditing}
            handleStartInlineEdit={handleStartInlineEdit}
            handleUndoInlineEdit={handleUndoInlineEdit}
            handleSaveInlineEdit={handleSaveInlineEdit}
            handleCancelInlineEdit={handleCancelInlineEdit}
          />
          <PublishFlow
            styles={styles}
            publishPrimaryHint={publishPrimaryHint}
            publishedSiteId={publishedSiteId}
            publishPrimaryAction={publishPrimaryAction}
            publishPrimaryLabel={publishPrimaryLabel}
            oneClickHostingRunning={oneClickHostingRunning}
            publishing={publishing}
            handleAddDomainNow={handleAddDomainNow}
            domainLoading={domainLoading}
            customDomain={customDomain}
            handleVerifyDnsNow={handleVerifyDnsNow}
            verifyingDns={verifyingDns}
            handleOneClickHosting={handleOneClickHosting}
            handleGoLive={handleGoLive}
            handleUnpublish={handleUnpublish}
            normalizedCustomDomain={normalizedCustomDomain}
            dnsVerifyStatus={dnsVerifyStatus}
          />
          <PreviewActionCenter
            styles={styles}
            previewRecommendedStep={previewRecommendedStep}
            previewJourneySteps={previewJourneySteps}
            previewEditableRef={previewEditableRef}
            handleStartInlineEdit={handleStartInlineEdit}
            isInlineEditing={isInlineEditing}
            handleSaveInlineEdit={handleSaveInlineEdit}
            inlineDraftDirty={inlineDraftDirty}
            handleGoLive={handleGoLive}
            publishing={publishing}
            publishedSiteId={publishedSiteId}
            publishStatus={publishStatus}
            publishReadinessMessage={publishReadinessMessage}
          />
          <div style={styles.pageTabs}>
            {orderPageKeys(Object.keys(generatedPages)).map((pageKey) => (
              <button
                key={pageKey}
                style={activePage === pageKey ? styles.pageTabActive : styles.pageTab}
                onClick={() => handleSwitchPage(pageKey)}
              >
                {pageLabelFromKey(pageKey)}
              </button>
            ))}
            {redesignInsights?.normalizedUrl && (
              <button
                style={showComparison ? styles.compareButtonActive : styles.compareButton}
                onClick={() => setShowComparison((previous) => !previous)}
              >
                {showComparison ? "Hide Before vs Redesigned" : "Before vs Redesigned"}
              </button>
            )}
            <div style={styles.pageActions}>
              <input
                style={styles.pageInput}
                placeholder="new page (pricing)"
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
              />
              <button style={styles.pageAddButton} onClick={handleAddPage}>
                Add Page
              </button>
              <button style={styles.pageDeleteButton} onClick={handleDeleteActivePage} disabled={activePage === "index.html"}>
                Delete Page
              </button>
            </div>
          </div>
          <section style={styles.seoCard}>
            <div style={styles.seoHeader}>
              <strong style={styles.seoTitle}>SEO Checklist Score</strong>
              <span style={styles.seoScore}>{seoChecklist.score}/100</span>
            </div>
            <div style={styles.seoSummary}>
              {seoChecklist.passedCount} of {seoChecklist.totalCount} checks passed
            </div>
            <div style={styles.seoList}>
              {seoChecklist.items.map((item) => (
                <div key={item.label} style={styles.seoItem}>
                  <span style={item.passed ? styles.seoPass : styles.seoFail}>
                    {item.passed ? "PASS" : "FIX"}
                  </span>
                  <div>
                    <strong style={styles.seoItemLabel}>{item.label}</strong>
                    <small style={styles.seoItemMeta}>{item.detail}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <Suspense fallback={<section style={styles.analyticsDashboardCard}><small style={styles.analyticsDashboardMeta}>Loading insights...</small></section>}>
            <PreviewInsightsSections {...insightsProps} />
          </Suspense>
          <div style={styles.previewCanvasWrap}>
            <div style={shouldShowGuestPreviewPrompt ? styles.previewCanvasFaint : undefined}>
              <Suspense fallback={null}>
                <InlineEditorOverlay
                  styles={styles}
                  isInlineEditing={isInlineEditing}
                  inlineEditToolbarStyle={inlineEditToolbarStyle}
                  inlineEditMetaStyle={inlineEditMetaStyle}
                  inlineSmartStatus={inlineSmartStatus}
                  inlineSiteModel={inlineSiteModel}
                  sections={sections}
                  selectedSectionEditId={selectedSectionEditId}
                  updateSection={updateSection}
                  inlineSelectionText={inlineSelectionText}
                  inlineSelectionSection={inlineSelectionSection}
                  inlineCheckpoints={inlineCheckpoints}
                  handleRestoreInlineCheckpoint={handleRestoreInlineCheckpoint}
                  inlineAdvancedOpen={inlineAdvancedOpen}
                  stylesInput={inlineSmartInputStyle}
                  inlineSmartCommand={inlineSmartCommand}
                  setInlineSmartCommand={setInlineSmartCommand}
                  handleRunInlineSmartCommand={handleRunInlineSmartCommand}
                  getInlineCommandOptions={getInlineCommandOptions}
                  inlineAutoApplyHighConfidence={inlineAutoApplyHighConfidence}
                  setInlineAutoApplyHighConfidence={setInlineAutoApplyHighConfidence}
                  inlineSuggestions={inlineSuggestions}
                  handleApplyInlineSuggestion={handleApplyInlineSuggestion}
                  inlineEditActionsStyle={inlineEditActionsStyle}
                  inlineDraftDirty={inlineDraftDirty}
                  handleImproveInlinePageCopy={handleImproveInlinePageCopy}
                  inlineBulkImproving={inlineBulkImproving}
                  handleImproveInlineSectionCopy={handleImproveInlineSectionCopy}
                  handleImproveAndSaveInlinePageCopy={handleImproveAndSaveInlinePageCopy}
                  handleImproveSavePublishInline={handleImproveSavePublishInline}
                  publishing={publishing}
                  inlineLastPublishSnapshot={inlineLastPublishSnapshot}
                  handleRollbackInlinePublishSnapshot={handleRollbackInlinePublishSnapshot}
                  handleUndoInlineEdit={handleUndoInlineEdit}
                  editHistory={editHistory}
                  handleRedoInlineEdit={handleRedoInlineEdit}
                  redoHistory={redoHistory}
                  handleSaveInlineEdit={handleSaveInlineEdit}
                  handleCancelInlineEdit={handleCancelInlineEdit}
                  setInlineAdvancedOpen={setInlineAdvancedOpen}
                  fieldLockMode={fieldLockMode}
                  setFieldLockMode={setFieldLockMode}
                  selectedEditableMeta={selectedEditableMeta}
                  selectedSectionMeta={selectedSectionMeta}
                  floatingToolbarPos={floatingToolbarPos}
                  isCompactInlineEditor={isCompactInlineEditor}
                  viewportWidth={viewportWidth}
                  focusInlineEditableNode={focusInlineEditableNode}
                  selectedEditableNodeRef={selectedEditableNodeRef}
                  syncInlineSiteModelFromDom={syncInlineSiteModelFromDom}
                  setSelectedEditableMeta={setSelectedEditableMeta}
                  handleInlineImageReplace={handleInlineImageReplace}
                  handleSectionFieldChange={handleSectionFieldChange}
                  handleImproveSelectedSection={handleImproveSelectedSection}
                  handleReplaceSelectedSection={handleReplaceSelectedSection}
                  handleMoveSelectedSection={handleMoveSelectedSection}
                  handleDeleteSelectedSection={handleDeleteSelectedSection}
                />
              </Suspense>
              <div
                ref={previewEditableRef}
                contentEditable={false}
                style={isInlineEditing ? previewEditableStyle : undefined}
                onClick={handlePreviewLinkNavigation}
                onClickCapture={handleInlinePointerActivate}
                onFocusCapture={handleInlinePointerActivate}
                onKeyDown={(event) => {
                  if (!isInlineEditing) return;
                  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                    event.preventDefault();
                    handleSaveInlineEdit();
                  }
                }}
                onInput={(event) => {
                  if (!isInlineEditing) return;
                  setInlineDraftDirty(true);
                  if (event.target instanceof Element) {
                    const editableTarget = event.target.closest("[data-editable][data-edit-id], [data-editable][data-id]");
                    if (editableTarget instanceof HTMLElement) {
                      const editableId = String(editableTarget.dataset.editId || editableTarget.dataset.id || "").trim();
                      if (editableId) {
                        const editableType = String(editableTarget.dataset.editable || "").trim();
                        const nextValue =
                          editableType === "image"
                            ? String(editableTarget.getAttribute("src") || "").trim()
                            : String(editableTarget.textContent || "").replace(/\s+/g, " ").trim();
                        updateSection(editableId, nextValue, { syncDraft: false });
                      }
                    }
                    selectInlineSection(event.target);
                    selectInlineEditableNode(event.target);
                  }
                  syncInlineSiteModelFromDom();
                }}
                onBlurCapture={(event) => {
                  if (!isInlineEditing) return;
                  const nextFocus = event.relatedTarget;
                  if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) return;
                  snapshotInlineDraft();
                  syncInlineSiteModelFromDom();
                }}
                onMouseUpCapture={captureInlineSelection}
                onKeyUpCapture={captureInlineSelection}
                onMouseMoveCapture={handleInlineHoverMove}
                onMouseLeave={handleInlineHoverLeave}
                dangerouslySetInnerHTML={{ __html: isInlineEditing ? draftHtml : generatedSite }}
              />
            </div>
            {shouldShowGuestPreviewPrompt ? (
              <div style={previewGuestOverlayStyle}>
                <strong style={styles.previewGuestTitle}>Create an account to save and publish this website</strong>
                <small style={styles.previewGuestMeta}>
                  Your generated site is ready. Sign up here to unlock dashboard saves, publishing, and project access.
                </small>
                <div style={styles.previewGuestActions}>
                  <button type="button" style={styles.authPrimaryButton} onClick={() => setAuthMode("signup")}>
                    Create Account
                  </button>
                  <button type="button" style={styles.authGhostButton} onClick={() => setAuthMode("login")}>
                    Login
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={styles.previewEmpty}>
          <h2 style={styles.previewEmptyTitle}>Live Preview Rail</h2>
          <p style={styles.previewEmptyText}>
            Generate a website to pin the interactive multi-page preview here while you keep working in the command center.
          </p>
          <div style={styles.previewEmptyActions}>
            <button type="button" style={styles.previewEmptyPrimary} onClick={handlePrimaryGenerateWebsite}>
              Generate Website
            </button>
            <button type="button" style={styles.previewEmptySecondary} onClick={handleSmartFillPrompt}>
              Fill Missing Details
            </button>
            <button type="button" style={styles.previewEmptySecondary} onClick={() => handleQuickPromptChip("SaaS landing page")}>
              Use Example Prompt
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
