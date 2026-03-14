import React from "react";
import MarketplacePanels from "./MarketplacePanels";

export default function PreviewInsightsSections(props) {
  const {
    styles,
    analyticsSnapshot,
    showAdvancedTools,
    mobileOwnerView,
    setMobileOwnerView,
    mobileOwnerSnapshot,
    autonomousAppointments,
    growthCoachInsights,
    handleApplyGrowthCoachFix,
    businessCoachInsights,
    selfOptimizationHistory,
    autonomousLog,
    autonomousPricingNote,
    autonomousModeEnabled,
    autonomousProcessedLeadKeys,
    autonomousInvoices,
    uiDesignSpec,
    activePage,
    competitorIntel,
    smartContentItems,
    smartContentType,
    appBuilderArtifacts,
    ensureAdminDashboardPage,
    marketingPack,
    marketingEngineOutput,
    monetizationPlan,
    showComparison,
    redesignInsights,
    pageLabelFromKey,
    buildDocumentHtml,
    currentPageHtml,
    projectName,
    editableImages,
    imageApplyScope,
    setImageApplyScope,
    selectedImageId,
    setSelectedImageId,
    imageUrlInput,
    setImageUrlInput,
    handleApplyImageUrl,
    handleImageUpload,
    selectedImage,
    mapQueryInput,
    setMapQueryInput,
    handleApplyMapLocation,
    themeColors,
    handleThemeColorChange,
    handleApplyThemeColors,
    handleResetThemeColors,
    textStyle,
    handleTextStylePresetChange,
    setTextStyle,
    textStylePresets,
    handleApplyTextStyles,
    handleResetTextStyles,
    publishMessage,
    publishStatus,
    liveUrl,
    dnsVerifyMessage,
    dnsVerifyStatus,
    checklistProgress,
    checklistSteps,
    publishedSiteId,
    hostingProfile,
    marketProps,
  } = props;

  return (
    <>
      {analyticsSnapshot && (
        <section style={styles.analyticsDashboardCard}>
          <div style={styles.analyticsDashboardHeader}>
            <strong style={styles.analyticsDashboardTitle}>Analytics Dashboard</strong>
            <span style={styles.analyticsDashboardMeta}>Live business metrics</span>
          </div>
          <div style={styles.analyticsStatsGrid}>
            <article style={styles.analyticsStatItem}>
              <small style={styles.analyticsStatLabel}>Visitors Today</small>
              <strong style={styles.analyticsStatValue}>{analyticsSnapshot.visitorsToday}</strong>
            </article>
            <article style={styles.analyticsStatItem}>
              <small style={styles.analyticsStatLabel}>Bookings</small>
              <strong style={styles.analyticsStatValue}>{analyticsSnapshot.bookings}</strong>
            </article>
            <article style={styles.analyticsStatItem}>
              <small style={styles.analyticsStatLabel}>Revenue</small>
              <strong style={styles.analyticsStatValue}>${analyticsSnapshot.revenue.toLocaleString()}</strong>
            </article>
            <article style={styles.analyticsStatItem}>
              <small style={styles.analyticsStatLabel}>Conversion Rate</small>
              <strong style={styles.analyticsStatValue}>{analyticsSnapshot.conversionRate}%</strong>
            </article>
          </div>
          <div style={styles.analyticsTopPages}>
            <small style={styles.analyticsStatLabel}>Top Pages</small>
            {analyticsSnapshot.topPages.length > 0 ? (
              analyticsSnapshot.topPages.map((page) => (
                <small key={page.key} style={styles.analyticsTopPageItem}>
                  {page.label}
                </small>
              ))
            ) : (
              <small style={styles.analyticsTopPageItem}>No generated pages yet.</small>
            )}
          </div>
        </section>
      )}
      {showAdvancedTools && (
        <section style={styles.mobileAppCard}>
          <div style={styles.mobileAppHeader}>
            <strong style={styles.mobileAppTitle}>📱 Mobile Business App</strong>
            <small style={styles.mobileAppMeta}>Owner controls from phone</small>
          </div>
          <div style={styles.mobileTabRow}>
            {["dashboard", "bookings", "messages", "customers"].map((tab) => (
              <button
                key={tab}
                type="button"
                style={mobileOwnerView === tab ? styles.mobileTabActive : styles.mobileTab}
                onClick={() => setMobileOwnerView(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={styles.mobilePhoneFrame}>
            <div style={styles.mobilePhoneTopBar}>
              <small style={styles.mobilePhoneTime}>9:41</small>
              <small style={styles.mobilePhoneSignal}>5G • 100%</small>
            </div>
            <div style={styles.mobileMetricsGrid}>
              <article style={styles.mobileMetricItem}>
                <small style={styles.mobileMetricLabel}>Today's bookings</small>
                <strong style={styles.mobileMetricValue}>{mobileOwnerSnapshot.bookingsToday}</strong>
              </article>
              <article style={styles.mobileMetricItem}>
                <small style={styles.mobileMetricLabel}>Messages</small>
                <strong style={styles.mobileMetricValue}>{mobileOwnerSnapshot.messages}</strong>
              </article>
              <article style={styles.mobileMetricItem}>
                <small style={styles.mobileMetricLabel}>Revenue</small>
                <strong style={styles.mobileMetricValue}>${Number(mobileOwnerSnapshot.revenueToday).toLocaleString()}</strong>
              </article>
              <article style={styles.mobileMetricItem}>
                <small style={styles.mobileMetricLabel}>Customers</small>
                <strong style={styles.mobileMetricValue}>{mobileOwnerSnapshot.customers}</strong>
              </article>
            </div>
            <div style={styles.mobileFeed}>
              {mobileOwnerView === "dashboard" && (
                <small style={styles.mobileFeedItem}>
                  Dashboard synced. Track bookings, messages, revenue, and customers in real time.
                </small>
              )}
              {mobileOwnerView === "bookings" && (
                <small style={styles.mobileFeedItem}>
                  Booking queue: {autonomousAppointments.slice(0, 1).map((item) => item.slot).join(", ") || "No new bookings yet."}
                </small>
              )}
              {mobileOwnerView === "messages" && (
                <small style={styles.mobileFeedItem}>
                  Inbox status: {mobileOwnerSnapshot.messages > 0 ? `${mobileOwnerSnapshot.messages} inbound message(s)` : "No new messages."}
                </small>
              )}
              {mobileOwnerView === "customers" && (
                <small style={styles.mobileFeedItem}>
                  CRM synced with {mobileOwnerSnapshot.customers} customer profile(s).
                </small>
              )}
              <small style={styles.mobileFeedItem}>
                Last sync: {new Date(mobileOwnerSnapshot.lastSyncAt).toLocaleTimeString()}
              </small>
            </div>
          </div>
        </section>
      )}
      {showAdvancedTools && growthCoachInsights.length > 0 && (
        <section style={styles.growthCoachCard}>
          <div style={styles.growthCoachHeader}>
            <strong style={styles.growthCoachTitle}>TitoNova Cloud Engine Growth Coach</strong>
            <span style={styles.growthCoachMeta}>Actionable optimization plan</span>
          </div>
          <div style={styles.growthCoachList}>
            {growthCoachInsights.map((item, index) => (
              <article key={`${item.id}-${index}`} style={styles.growthCoachItem}>
                <span
                  style={
                    item.severity === "high"
                      ? styles.growthCoachSeverityHigh
                      : item.severity === "low"
                        ? styles.growthCoachSeverityLow
                        : styles.growthCoachSeverityMedium
                  }
                >
                  {String(item.severity || "medium").toUpperCase()}
                </span>
                <div style={styles.growthCoachContent}>
                  <strong style={styles.growthCoachIssue}>{item.issue}</strong>
                  <small style={styles.growthCoachRecommendation}>{item.recommendation}</small>
                </div>
                <button style={styles.growthCoachAction} onClick={() => handleApplyGrowthCoachFix(item.id)}>
                  {item.actionLabel || "Apply Fix"}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && businessCoachInsights.length > 0 && (
        <section style={styles.businessCoachCard}>
          <div style={styles.businessCoachHeader}>
            <strong style={styles.businessCoachTitle}>TitoNova Cloud Engine Business Coach</strong>
            <span style={styles.businessCoachMeta}>Business advisor insights</span>
          </div>
          <div style={styles.businessCoachList}>
            {businessCoachInsights.map((item) => (
              <article key={item.id} style={styles.businessCoachItem}>
                <span style={item.severity === "high" ? styles.businessCoachSeverityHigh : styles.businessCoachSeverityMedium}>
                  {String(item.severity || "medium").toUpperCase()}
                </span>
                <div style={styles.businessCoachContent}>
                  <strong style={styles.businessCoachIssue}>{item.title}</strong>
                  <small style={styles.businessCoachRecommendation}>{item.recommendation}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && selfOptimizationHistory.length > 0 && (
        <section style={styles.selfOptimizeCard}>
          <div style={styles.selfOptimizeHeader}>
            <strong style={styles.selfOptimizeTitle}>Self-Optimization History</strong>
            <span style={styles.selfOptimizeMeta}>Website gets smarter every cycle</span>
          </div>
          <div style={styles.selfOptimizeList}>
            {selfOptimizationHistory.map((item) => (
              <article key={item.at} style={styles.selfOptimizeItem}>
                <small style={styles.selfOptimizeTime}>{new Date(item.at).toLocaleString()}</small>
                <small style={styles.selfOptimizeText}>Headline A/B: {item.headline}</small>
                <small style={styles.selfOptimizeText}>CTA variant: {item.cta}</small>
                <small style={styles.selfOptimizeText}>
                  Updates: {item.optimizedHeadlines} headline, {item.optimizedCtas} CTAs, {item.optimizedImages} images optimized
                </small>
              </article>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && (autonomousLog.length > 0 || autonomousPricingNote) && (
        <section style={styles.autonomousCard}>
          <div style={styles.autonomousHeader}>
            <strong style={styles.autonomousTitle}>Autonomous Business Mode</strong>
            <span style={styles.autonomousMeta}>{autonomousModeEnabled ? "Active" : "Manual"}</span>
          </div>
          <div style={styles.autonomousStats}>
            <small style={styles.autonomousStat}>Inquiries handled: {Object.keys(autonomousProcessedLeadKeys).length}</small>
            <small style={styles.autonomousStat}>Appointments: {autonomousAppointments.length}</small>
            <small style={styles.autonomousStat}>Invoices sent: {autonomousInvoices.length}</small>
          </div>
          {autonomousPricingNote ? <small style={styles.autonomousPricing}>{autonomousPricingNote}</small> : null}
          <div style={styles.autonomousLogList}>
            {autonomousLog.slice(0, 8).map((item, index) => (
              <article key={`${item.at}-${index}`} style={styles.autonomousLogItem}>
                <small style={styles.autonomousLogTime}>{new Date(item.at).toLocaleString()}</small>
                <small style={styles.autonomousLogType}>{String(item.type || "task").toUpperCase()}</small>
                <small style={styles.autonomousLogText}>{item.detail}</small>
              </article>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && uiDesignSpec && (
        <section style={styles.uiDesignCard}>
          <div style={styles.uiDesignHeader}>
            <strong style={styles.uiDesignTitle}>TitoNova Cloud Engine UI Design Spec</strong>
            <span style={styles.uiDesignMeta}>{uiDesignSpec.layoutVariant}</span>
          </div>
          <div style={styles.uiDesignSwatches}>
            {["heroStart", "heroEnd", "accent", "accentStrong", "pageBg", "textPrimary"].map((key) => (
              <span key={key} style={{ ...styles.uiDesignSwatch, background: uiDesignSpec.palette?.[key] || "#ffffff" }} title={key} />
            ))}
          </div>
          <small style={styles.uiDesignText}>
            Heading: {uiDesignSpec.typography?.headingFamily} | Body: {uiDesignSpec.typography?.bodyFamily}
          </small>
          <small style={styles.uiDesignText}>
            Hierarchy: {JSON.stringify(uiDesignSpec.sectionHierarchy?.[activePage] || uiDesignSpec.sectionHierarchy?.global || [])}
          </small>
        </section>
      )}
      {showAdvancedTools && competitorIntel && (
        <section style={styles.competitorCard}>
          <div style={styles.competitorHeader}>
            <strong style={styles.competitorTitle}>TitoNova Cloud Engine Competitor Intelligence</strong>
            <span style={styles.competitorMeta}>
              {competitorIntel.scannedAt ? new Date(competitorIntel.scannedAt).toLocaleString() : "just now"}
            </span>
          </div>
          <div style={styles.competitorGrid}>
            {(competitorIntel.competitors || []).map((item) => (
              <article key={item.url} style={styles.competitorPanel}>
                <strong style={styles.competitorUrl}>{item.url}</strong>
                <small style={styles.competitorPricing}>{item.pricing}</small>
                <div style={styles.competitorSection}>
                  <small style={styles.competitorLabel}>SEO Keywords</small>
                  {(item.keywords || []).map((kw) => (
                    <span key={`${item.url}-${kw}`} style={styles.competitorChip}>{kw}</span>
                  ))}
                </div>
                <div style={styles.competitorSection}>
                  <small style={styles.competitorLabel}>Website Weaknesses</small>
                  {(item.weaknesses || []).map((weakness) => (
                    <small key={`${item.url}-${weakness}`} style={styles.competitorWeakness}>- {weakness}</small>
                  ))}
                </div>
              </article>
            ))}
          </div>
          {(competitorIntel.suggestions || []).length > 0 && (
            <div style={styles.competitorSuggestions}>
              <strong style={styles.competitorSuggestionTitle}>Suggested Improvements</strong>
              {(competitorIntel.suggestions || []).map((suggestion) => (
                <small key={suggestion} style={styles.competitorSuggestionItem}>{suggestion}</small>
              ))}
            </div>
          )}
        </section>
      )}
      {showAdvancedTools && smartContentItems.length > 0 && (
        <section style={styles.smartContentCard}>
          <div style={styles.smartContentHeader}>
            <strong style={styles.smartContentTitle}>Smart Content Engine</strong>
            <span style={styles.smartContentMeta}>
              {smartContentItems.length} {smartContentType}
            </span>
          </div>
          <div style={styles.smartContentGrid}>
            {smartContentItems.map((item, index) => (
              <article key={`${item.slug}-${index}`} style={styles.smartContentItem}>
                <strong style={styles.smartContentItemTitle}>{item.title}</strong>
                {item.keyword ? <small style={styles.smartContentItemMeta}>Keyword: {item.keyword}</small> : null}
                <small style={styles.smartContentItemMeta}>{item.summary}</small>
                <code style={styles.smartContentSlug}>/{item.slug}</code>
              </article>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && appBuilderArtifacts && (
        <section style={styles.appBuilderCard}>
          <div style={styles.appBuilderHeader}>
            <strong style={styles.appBuilderTitle}>TitoNova Cloud Engine App Builder</strong>
            <span style={styles.appBuilderMeta}>
              {appBuilderArtifacts.source === "ai" ? "TitoNova Cloud Engine Generated" : "Generated"} •{" "}
              {appBuilderArtifacts.generatedAt ? new Date(appBuilderArtifacts.generatedAt).toLocaleString() : "just now"}
            </span>
          </div>
          <div style={styles.appBuilderGrid}>
            <article style={styles.appBuilderPanel}>
              <strong style={styles.appBuilderPanelTitle}>{appBuilderArtifacts.ios?.name || "iOS App"}</strong>
              <small style={styles.appBuilderRow}>Framework: {appBuilderArtifacts.ios?.framework || "SwiftUI"}</small>
              <small style={styles.appBuilderRow}>Bundle: {appBuilderArtifacts.ios?.bundleId || "-"}</small>
              <small style={styles.appBuilderListTitle}>Screens</small>
              {(appBuilderArtifacts.ios?.screens || []).map((item) => (
                <small key={`ios-${item}`} style={styles.appBuilderItem}>- {item}</small>
              ))}
            </article>
            <article style={styles.appBuilderPanel}>
              <strong style={styles.appBuilderPanelTitle}>{appBuilderArtifacts.android?.name || "Android App"}</strong>
              <small style={styles.appBuilderRow}>Framework: {appBuilderArtifacts.android?.framework || "Jetpack Compose"}</small>
              <small style={styles.appBuilderRow}>Package: {appBuilderArtifacts.android?.packageName || "-"}</small>
              <small style={styles.appBuilderListTitle}>Screens</small>
              {(appBuilderArtifacts.android?.screens || []).map((item) => (
                <small key={`android-${item}`} style={styles.appBuilderItem}>- {item}</small>
              ))}
            </article>
            <article style={styles.appBuilderPanel}>
              <strong style={styles.appBuilderPanelTitle}>{appBuilderArtifacts.admin?.name || "Admin Dashboard"}</strong>
              <small style={styles.appBuilderRow}>Route: {appBuilderArtifacts.admin?.route || "/admin"}</small>
              <small style={styles.appBuilderListTitle}>Modules</small>
              {(appBuilderArtifacts.admin?.modules || []).map((item) => (
                <small key={`admin-${item}`} style={styles.appBuilderItem}>- {item}</small>
              ))}
              <button style={styles.appBuilderAction} onClick={ensureAdminDashboardPage}>
                Ensure Admin Page Exists
              </button>
            </article>
          </div>
        </section>
      )}
      {marketingPack && (
        <section style={styles.marketingCard}>
          <div style={styles.marketingHeader}>
            <strong style={styles.marketingTitle}>TitoNova Cloud Engine Marketing Autopilot</strong>
            <span style={styles.marketingMeta}>Auto-generated campaigns</span>
          </div>
          <div style={styles.marketingGrid}>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>SEO Articles</strong>
              {marketingPack.seoArticles.map((item) => (
                <div key={item.title} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.title}</small>
                  <small style={styles.marketingItemMeta}>Keyword: {item.targetKeyword}</small>
                </div>
              ))}
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Social Posts</strong>
              {marketingPack.socialPosts.map((item) => (
                <small key={item} style={styles.marketingItemTitle}>{item}</small>
              ))}
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Google Ads Copy</strong>
              {marketingPack.googleAds.map((item) => (
                <div key={`${item.headline}-${item.description}`} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.headline}</small>
                  <small style={styles.marketingItemMeta}>{item.description}</small>
                </div>
              ))}
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Email Campaign</strong>
              {marketingPack.emailCampaign.map((item) => (
                <div key={item.subject} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.subject}</small>
                  <small style={styles.marketingItemMeta}>{item.body}</small>
                </div>
              ))}
            </article>
          </div>
        </section>
      )}
      {marketingEngineOutput && (
        <section style={styles.marketingEngineCard}>
          <div style={styles.marketingHeader}>
            <strong style={styles.marketingTitle}>TitoNova Cloud Engine Marketing Engine</strong>
            <span style={styles.marketingMeta}>SEO + Email + Social + Ads</span>
          </div>
          <div style={styles.marketingEngineGrid}>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>SEO Page Generator</strong>
              {marketingEngineOutput.seoPages.map((item) => (
                <div key={item.slug} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.title}</small>
                  <small style={styles.marketingItemMeta}>/{item.slug}</small>
                </div>
              ))}
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Email Campaign</strong>
              <div style={styles.marketingItem}>
                <small style={styles.marketingItemTitle}>Subject: {marketingEngineOutput.emailCampaign.subject}</small>
                <small style={{ ...styles.marketingItemMeta, whiteSpace: "pre-wrap" }}>
                  {marketingEngineOutput.emailCampaign.body}
                </small>
              </div>
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Social Media Posts</strong>
              {marketingEngineOutput.socialPosts.map((item) => (
                <div key={item.platform} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.platform}</small>
                  <small style={styles.marketingItemMeta}>{item.copy}</small>
                </div>
              ))}
            </article>
            <article style={styles.marketingPanel}>
              <strong style={styles.marketingPanelTitle}>Ads + Landing Pages</strong>
              {marketingEngineOutput.ads.map((item) => (
                <div key={`${item.channel}-${item.headline}`} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.channel}: {item.headline}</small>
                  <small style={styles.marketingItemMeta}>{item.description}</small>
                </div>
              ))}
              {marketingEngineOutput.landingPages.map((item) => (
                <div key={item.slug} style={styles.marketingItem}>
                  <small style={styles.marketingItemTitle}>{item.title}</small>
                  <small style={styles.marketingItemMeta}>/{item.slug}</small>
                </div>
              ))}
            </article>
          </div>
        </section>
      )}
      {monetizationPlan && (
        <section style={styles.monetizationCard}>
          <div style={styles.marketingHeader}>
            <strong style={styles.monetizationTitle}>{monetizationPlan.title}</strong>
            <span style={styles.monetizationMeta}>Revenue Platform</span>
          </div>
          <p style={styles.monetizationSummary}>{monetizationPlan.summary}</p>
          <div style={styles.monetizationGrid}>
            {monetizationPlan.suggestions.map((item) => (
              <article key={item.channel} style={styles.monetizationItem}>
                <strong style={styles.monetizationItemTitle}>{item.channel}</strong>
                <small style={styles.monetizationItemMeta}>Model: {item.model}</small>
                <small style={styles.monetizationItemMeta}>{item.strategy}</small>
                <small style={styles.monetizationItemMeta}>Launch: {item.launch}</small>
              </article>
            ))}
          </div>
          <small style={styles.monetizationNext}>Next step: {monetizationPlan.nextStep}</small>
        </section>
      )}
      {showComparison && redesignInsights?.normalizedUrl && (
        <section style={styles.compareWrap}>
          <article style={styles.compareCard}>
            <strong style={styles.compareTitle}>Before</strong>
            <small style={styles.compareMeta}>{redesignInsights.normalizedUrl}</small>
            <iframe title="Before website" src={redesignInsights.normalizedUrl} style={styles.compareFrame} />
            <small style={styles.compareHint}>
              Some websites block embedding via browser security headers.
            </small>
          </article>
          <article style={styles.compareCard}>
            <strong style={styles.compareTitle}>Redesigned</strong>
            <small style={styles.compareMeta}>{pageLabelFromKey(activePage)}</small>
            <iframe
              title="Redesigned website"
              srcDoc={buildDocumentHtml(currentPageHtml, `${projectName || "Redesigned"} Preview`)}
              style={styles.compareFrame}
            />
          </article>
        </section>
      )}
      {editableImages.length > 0 && (
        <section style={styles.imageEditorCard}>
          <strong style={styles.imageEditorTitle}>Image Customization</strong>
          <div style={styles.imageScopeRow}>
            <button
              type="button"
              style={imageApplyScope === "page" ? styles.imageScopeButtonActive : styles.imageScopeButton}
              onClick={() => setImageApplyScope("page")}
            >
              This page
            </button>
            <button
              type="button"
              style={imageApplyScope === "all" ? styles.imageScopeButtonActive : styles.imageScopeButton}
              onClick={() => setImageApplyScope("all")}
            >
              All pages
            </button>
            <small style={styles.imageMeta}>
              {imageApplyScope === "all" ? "Changes apply to every generated page." : "Changes apply only to the active page."}
            </small>
          </div>
          <div style={styles.imageEditorRow}>
            <select style={styles.imageSelect} value={selectedImageId || ""} onChange={(event) => setSelectedImageId(event.target.value)}>
              {editableImages.map((image) => (
                <option key={image.id} value={image.id}>
                  {image.id} {image.alt ? `• ${image.alt}` : ""}
                </option>
              ))}
            </select>
            <input
              style={styles.imageUrlInput}
              placeholder="Paste image URL (https://...)"
              value={imageUrlInput}
              onChange={(event) => setImageUrlInput(event.target.value)}
            />
            <button style={styles.imageApplyButton} onClick={handleApplyImageUrl}>
              Apply URL
            </button>
          </div>
          <div style={styles.imageEditorRow}>
            <label style={styles.imageUploadLabel}>
              Upload image
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
            {selectedImage?.alt ? <small style={styles.imageMeta}>Alt: {selectedImage.alt}</small> : null}
          </div>
        </section>
      )}
      <section style={styles.mapEditorCard}>
        <strong style={styles.imageEditorTitle}>Location Map</strong>
        <div style={styles.imageEditorRow}>
          <input
            style={styles.imageUrlInput}
            placeholder="Enter location, address, or city"
            value={mapQueryInput}
            onChange={(event) => setMapQueryInput(event.target.value)}
          />
          <button style={styles.imageApplyButton} onClick={handleApplyMapLocation}>
            Apply Map
          </button>
        </div>
        <small style={styles.imageMeta}>
          This updates the map section across all generated pages.
        </small>
      </section>
      <section style={styles.colorEditorCard}>
        <strong style={styles.colorEditorTitle}>Full Color Selector</strong>
        <div style={styles.colorGrid}>
          {[
            { key: "heroStart", label: "Hero Start" },
            { key: "heroEnd", label: "Hero End" },
            { key: "accent", label: "Accent" },
            { key: "accentStrong", label: "Primary CTA" },
            { key: "pageBg", label: "Page Background" },
            { key: "cardBg", label: "Cards" },
            { key: "borderColor", label: "Borders" },
            { key: "textPrimary", label: "Heading Text" },
            { key: "textSecondary", label: "Body Text" },
            { key: "linkColor", label: "Links" },
            { key: "ctaPanelBg", label: "CTA Panel" },
            { key: "ctaPanelBorder", label: "CTA Border" },
            { key: "ctaText", label: "Button Text" },
          ].map((item) => (
            <label key={item.key} style={styles.colorField}>
              <span style={styles.colorLabel}>{item.label}</span>
              <input
                type="color"
                value={themeColors[item.key]}
                onChange={(event) => handleThemeColorChange(item.key, event.target.value)}
                style={styles.colorInput}
              />
              <code style={styles.colorHex}>{themeColors[item.key]}</code>
            </label>
          ))}
        </div>
        <div style={styles.colorActions}>
          <button style={styles.applyThemeButton} onClick={handleApplyThemeColors}>
            Apply colors to all pages
          </button>
          <button style={styles.resetThemeButton} onClick={handleResetThemeColors}>
            Reset default colors
          </button>
        </div>
      </section>
      <section style={styles.typeEditorCard}>
        <strong style={styles.typeEditorTitle}>Text Styles & Fonts</strong>
        <div style={styles.typeEditorRow}>
          <label style={styles.typeField}>
            <span style={styles.typeLabel}>Font preset</span>
            <select style={styles.typeSelect} value={textStyle.preset} onChange={(event) => handleTextStylePresetChange(event.target.value)}>
              {textStylePresets.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label style={styles.typeField}>
            <span style={styles.typeLabel}>Base size ({textStyle.baseSizePx}px)</span>
            <input
              type="range"
              min="14"
              max="20"
              step="1"
              value={textStyle.baseSizePx}
              onChange={(event) => setTextStyle((previous) => ({ ...previous, baseSizePx: Number(event.target.value) }))}
            />
          </label>
          <label style={styles.typeField}>
            <span style={styles.typeLabel}>Line height ({textStyle.lineHeight})</span>
            <input
              type="range"
              min="1.3"
              max="1.9"
              step="0.05"
              value={textStyle.lineHeight}
              onChange={(event) => setTextStyle((previous) => ({ ...previous, lineHeight: Number(event.target.value) }))}
            />
          </label>
          <label style={styles.typeField}>
            <span style={styles.typeLabel}>Heading weight</span>
            <select
              style={styles.typeSelect}
              value={textStyle.headingWeight}
              onChange={(event) => setTextStyle((previous) => ({ ...previous, headingWeight: Number(event.target.value) }))}
            >
              <option value={600}>600</option>
              <option value={700}>700</option>
              <option value={800}>800</option>
            </select>
          </label>
        </div>
        <div style={styles.typePreview}>
          <h3 style={{ margin: "0 0 6px", fontFamily: textStyle.headingFamily, fontWeight: textStyle.headingWeight }}>
            Premium text hierarchy preview
          </h3>
          <p style={{ margin: 0, fontFamily: textStyle.bodyFamily, fontSize: `${textStyle.baseSizePx}px`, lineHeight: textStyle.lineHeight }}>
            Clear headlines, readable body copy, and stronger conversion-focused typography across every page.
          </p>
        </div>
        <div style={styles.colorActions}>
          <button style={styles.applyThemeButton} onClick={handleApplyTextStyles}>
            Apply text styles to all pages
          </button>
          <button style={styles.resetThemeButton} onClick={handleResetTextStyles}>
            Reset text defaults
          </button>
        </div>
      </section>
      {publishMessage && (
        <p
          style={
            publishStatus === "error" ? styles.publishError : publishStatus === "success" ? styles.publishSuccess : styles.publishInfo
          }
        >
          {publishMessage}
          {liveUrl ? (
            <>
              {" "}
              <a href={liveUrl} target="_blank" rel="noreferrer">
                Open live site
              </a>
            </>
          ) : null}
        </p>
      )}
      {dnsVerifyMessage && (
        <p
          style={
            dnsVerifyStatus === "error" ? styles.publishError : dnsVerifyStatus === "success" ? styles.publishSuccess : styles.publishInfo
          }
        >
          {dnsVerifyMessage}
        </p>
      )}
      {showAdvancedTools && (
        <section style={styles.checklistCard}>
          <div style={styles.checklistHeader}>
            <strong>Manual Domain Checklist</strong>
            <span>{checklistProgress}% complete</span>
          </div>
          <div style={styles.checklistBar}>
            <div style={{ ...styles.checklistFill, width: `${checklistProgress}%` }} />
          </div>
          <div style={styles.checklistSteps}>
            {checklistSteps.map((step) => (
              <span key={step.key} style={step.done ? styles.checkStepDone : styles.checkStepPending}>
                {step.label}
              </span>
            ))}
          </div>
        </section>
      )}
      {showAdvancedTools && publishedSiteId ? <p style={styles.siteMeta}>Published site ID: {publishedSiteId}</p> : null}
      {hostingProfile?.domain && (
        <section style={styles.hostingSummaryCard}>
          <div style={styles.hostingSummaryHeader}>
            <strong style={styles.hostingSummaryTitle}>Hosting Status</strong>
            <small style={styles.hostingSummaryMeta}>{hostingProfile.tier || "Fast Hosting"}</small>
          </div>
          <div style={styles.hostingBadgeRow}>
            <span style={styles.hostingBadgeDomain}>Domain: {hostingProfile.domain}</span>
            <span style={hostingProfile.sslEnabled ? styles.hostingBadgeOn : styles.hostingBadgeOff}>
              {hostingProfile.sslEnabled ? "SSL On" : "SSL Pending"}
            </span>
            <span style={hostingProfile.cdnEnabled ? styles.hostingBadgeOn : styles.hostingBadgeOff}>
              {hostingProfile.cdnEnabled ? "CDN On" : "CDN Pending"}
            </span>
            <span style={hostingProfile.verified ? styles.hostingBadgeOn : styles.hostingBadgeOff}>
              {hostingProfile.verified ? "DNS Verified" : "DNS Pending"}
            </span>
          </div>
          <small style={styles.hostingSummaryMeta}>
            {hostingProfile.liveUrl || liveUrl ? `Live URL: ${hostingProfile.liveUrl || liveUrl}` : "Live URL pending"}
          </small>
        </section>
      )}
      {!publishedSiteId ? (
        <p style={styles.siteMeta}>Tip: enter a domain and click One-Click Hosting to auto-publish, attach domain, and verify SSL/CDN.</p>
      ) : null}
      <MarketplacePanels {...marketProps} />
    </>
  );
}
