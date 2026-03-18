import React, { Suspense } from "react";
import PreviewActionCenter from "./PreviewActionCenter";
import PreviewHeaderControls from "./PreviewHeaderControls";
import PublishFlow from "./PublishFlow";

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
    handlePreviewLinkNavigation,
    generatedSite,
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
            <div
              ref={previewEditableRef}
              onClick={handlePreviewLinkNavigation}
              dangerouslySetInnerHTML={{ __html: generatedSite }}
            />
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
