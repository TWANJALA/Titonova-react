import React from "react";
import {
  AUTOMATION_PAGE_DEFS,
  BOOKING_AUTOMATION_STEPS,
  CRM_LEAD_STAGES,
  CRM_SALES_PIPELINE,
  INDUSTRY_TEMPLATE_PACKAGES,
  PAYMENT_PROVIDER_KEYS,
  REVENUE_MODULE_KEYS,
  SMART_CONTENT_TYPE_OPTIONS,
} from "../Dashboard.shared";

export default function AdvancedOperationsPanels({
  styles,
  showAdvancedTools,
  businessOsOutput,
  handleExportBusinessOsBundle,
  brandLoading,
  handleGenerateBrandKit,
  brandKit,
  handleApplyBrandKit,
  solutionMode,
  setSolutionMode,
  industryTemplate,
  applyIndustryTemplate,
  selectedIndustryBlueprint,
  selectedIndustryPackage,
  businessOsPrompt,
  setBusinessOsPrompt,
  uiDesignPrompt,
  setUiDesignPrompt,
  sourceWebsiteUrl,
  setSourceWebsiteUrl,
  competitorUrlsInput,
  setCompetitorUrlsInput,
  cloneDepth,
  setCloneDepth,
  clonePixelPerfect,
  setClonePixelPerfect,
  cloneAiRedesign,
  setCloneAiRedesign,
  cloneRevenueAutomation,
  setCloneRevenueAutomation,
  setAutoRevenueFeatures,
  exactRedesignMode,
  setExactRedesignMode,
  handleCompetitorScan,
  competitorLoading,
  handleRedesignFromUrl,
  redesigning,
  redesignInsights,
  automationFeatures,
  autoRevenueFeatures,
  toggleAutomationFeature,
  bookingDurationMinutes,
  setBookingDurationMinutes,
  bookingSlotsInput,
  setBookingSlotsInput,
  bookingServicesInput,
  setBookingServicesInput,
  bookingAutoConfirmEnabled,
  setBookingAutoConfirmEnabled,
  bookingGoogleSyncEnabled,
  setBookingGoogleSyncEnabled,
  crmStageCounts,
  crmNameInput,
  setCrmNameInput,
  crmEmailInput,
  setCrmEmailInput,
  crmPhoneInput,
  setCrmPhoneInput,
  crmStageInput,
  setCrmStageInput,
  handleAddCrmCustomer,
  crmCustomers,
  handleCrmStageChange,
  workflowAutomationEnabled,
  setWorkflowAutomationEnabled,
  workflowAutoOnAutonomous,
  setWorkflowAutoOnAutonomous,
  workflowTestEmail,
  setWorkflowTestEmail,
  workflowReminderHours,
  setWorkflowReminderHours,
  handleRunWorkflowTest,
  workflowRecentRun,
  workflowRuns,
  paymentIntegrations,
  togglePaymentProvider,
  subscriptionsEnabled,
  setSubscriptionsEnabled,
  invoiceNumber,
  setInvoiceNumber,
  invoiceServiceInput,
  setInvoiceServiceInput,
  invoiceAmountInput,
  setInvoiceAmountInput,
  handleRunRecommendedFlow,
  runningRecommendedFlow,
  runSmokeCheck,
  smokeRunning,
  smokeResults,
  handleDownloadSmokeReport,
  autoSearchOnGenerate,
  setAutoSearchOnGenerate,
  designEvolutionEnabled,
  setDesignEvolutionEnabled,
  designEvolutionMinutes,
  setDesignEvolutionMinutes,
  runDesignEvolution,
  evolutionRunning,
  lastDesignEvolutionAt,
  selfOptimizeEnabled,
  setSelfOptimizeEnabled,
  selfOptimizeDays,
  setSelfOptimizeDays,
  runSelfOptimization,
  selfOptimizeRunning,
  lastSelfOptimizationAt,
  autonomousModeEnabled,
  setAutonomousModeEnabled,
  autonomousIntervalMinutes,
  setAutonomousIntervalMinutes,
  runAutonomousBusinessMode,
  autonomousRunning,
  translationLanguage,
  setTranslationLanguage,
  handleTranslateAllPages,
  translating,
  marketingAutopilotEnabled,
  setMarketingAutopilotEnabled,
  runMarketingAutopilot,
  marketingLoading,
  marketingOfferInput,
  setMarketingOfferInput,
  marketingCitiesInput,
  setMarketingCitiesInput,
  runAiMarketingEngine,
  marketingEngineLoading,
  runMonetizationEngine,
  monetizationLoading,
  runAiAppBuilder,
  appBuilderLoading,
  hasGeneratedContent,
  runGrowthCoach,
  growthCoachLoading,
  runBusinessCoach,
  businessCoachLoading,
  refreshAnalyticsDashboard,
  smartContentType,
  setSmartContentType,
  smartContentCount,
  setSmartContentCount,
  smartContentKeyword,
  setSmartContentKeyword,
  runSmartContentEngine,
  smartContentLoading,
  smartContentProgress,
}) {
  if (!showAdvancedTools) return null;

  return (
    <>
      {businessOsOutput && (
        <section style={styles.businessOsOutputCard}>
          <div style={styles.businessOsOutputHeader}>
            <strong style={styles.businessOsOutputTitle}>Business OS Output</strong>
            <span style={styles.businessOsOutputMeta}>
              {businessOsOutput.passedCount}/{businessOsOutput.totalCount} modules passed
            </span>
          </div>
          <div style={styles.businessOsOutputList}>
            {businessOsOutput.modules.map((module) => (
              <article key={module.key} style={styles.businessOsOutputItem}>
                <span style={module.pass ? styles.smokePass : styles.smokeFail}>{module.pass ? "PASS" : "FAIL"}</span>
                <div style={styles.businessOsOutputContent}>
                  <strong style={styles.smokeLabel}>{module.label}</strong>
                  <small style={styles.smokeMsg}>{module.message}</small>
                </div>
              </article>
            ))}
          </div>
          <button style={styles.smokeSecondaryButton} onClick={handleExportBusinessOsBundle}>
            Download JSON Bundle
          </button>
        </section>
      )}
      <button style={styles.brandButton} onClick={handleGenerateBrandKit} disabled={brandLoading}>
        {brandLoading ? "Designing brand..." : "TitoNova Cloud Engine Brand Designer"}
      </button>
      {brandKit && (
        <section style={styles.brandCard}>
          <div style={styles.brandHeader}>
            <img src={brandKit.logo} alt="Generated brand logo" style={styles.brandLogo} />
            <div>
              <strong style={styles.brandTitle}>Brand Identity</strong>
              <small style={styles.brandMeta}>{brandKit.category.toUpperCase()} package</small>
            </div>
          </div>
          <div style={styles.brandPaletteRow}>
            {[
              { key: "heroStart", label: "Primary" },
              { key: "accent", label: "Accent" },
              { key: "accentStrong", label: "CTA" },
              { key: "pageBg", label: "Background" },
            ].map((item) => (
              <div key={item.key} style={styles.brandColorWrap}>
                <span style={{ ...styles.brandSwatch, background: brandKit.palette[item.key] }} />
                <small style={styles.brandColorLabel}>{item.label}</small>
              </div>
            ))}
          </div>
          <small style={styles.brandMeta}>Typography: {brandKit.typographyPreset}</small>
          <div style={styles.brandBullets}>
            {brandKit.identity.map((line) => (
              <small key={line} style={styles.brandBullet}>• {line}</small>
            ))}
          </div>
          <div style={styles.brandImages}>
            {brandKit.images.slice(1).map((src, index) => (
              <img key={`${src}-${index}`} src={src} alt={`Brand marketing ${index + 1}`} style={styles.brandImageThumb} />
            ))}
          </div>
          <button style={styles.brandApplyButton} onClick={handleApplyBrandKit}>
            Apply Brand Kit
          </button>
        </section>
      )}
      <div style={styles.solutionRow}>
        <label style={styles.solutionLabel}>Build Type</label>
        <select style={styles.solutionSelect} value={solutionMode} onChange={(event) => setSolutionMode(event.target.value)}>
          <option value="website-app">Website + App</option>
          <option value="website">Website only</option>
          <option value="app">App only</option>
        </select>
      </div>
      <div style={styles.solutionRow}>
        <label style={styles.solutionLabel}>Industry Template</label>
        <select style={styles.solutionSelect} value={industryTemplate} onChange={(event) => applyIndustryTemplate(event.target.value)}>
          {INDUSTRY_TEMPLATE_PACKAGES.map((pkg) => (
            <option key={pkg.key} value={pkg.key}>
              {pkg.label}
            </option>
          ))}
        </select>
      </div>
      {selectedIndustryBlueprint && (
        <div style={styles.templateBlueprintCard}>
          <strong style={styles.templateBlueprintTitle}>Industry Blueprint</strong>
          <small style={styles.templateBlueprintMeta}>Pages: {selectedIndustryBlueprint.pages.join(" • ")}</small>
          <small style={styles.templateBlueprintMeta}>Services: {selectedIndustryBlueprint.services.join(" • ")}</small>
          <small style={styles.templateBlueprintMeta}>Pricing: {selectedIndustryBlueprint.pricing.join(" • ")}</small>
          <small style={styles.templateBlueprintMeta}>Workflows: {selectedIndustryBlueprint.workflows.join(" • ")}</small>
          <button
            style={styles.templateBlueprintButton}
            onClick={() => {
              const draft = selectedIndustryPackage?.promptFocus?.[0] || "";
              if (!businessOsPrompt.trim() && draft) setBusinessOsPrompt(draft);
              if (!uiDesignPrompt.trim() && draft) setUiDesignPrompt(draft);
            }}
          >
            Use Template Prompt
          </button>
        </div>
      )}
      <section style={styles.cloneGeneratorCard}>
        <div style={styles.cloneGeneratorHeader}>
          <strong style={styles.cloneGeneratorTitle}>TITONOVA CLOUD ENGINE - AI CLONING GENERATOR (REDESIGN)</strong>
          <small style={styles.cloneGeneratorMeta}>90-95% visual accuracy target with production-ready output</small>
        </div>
        <div style={styles.solutionRow}>
          <label style={styles.solutionLabel}>TARGET URL</label>
          <input style={styles.solutionInput} placeholder="Paste Website URL" value={sourceWebsiteUrl} onChange={(event) => setSourceWebsiteUrl(event.target.value)} />
        </div>
        <div style={styles.solutionRow}>
          <label style={styles.solutionLabel}>COMPETITOR URLS</label>
          <textarea
            style={styles.solutionTextarea}
            placeholder={"site1.com\nsite2.com\nsite3.com"}
            value={competitorUrlsInput}
            onChange={(event) => setCompetitorUrlsInput(event.target.value)}
          />
        </div>
        <div style={styles.solutionRow}>
          <label style={styles.solutionLabel}>CLONE DEPTH</label>
          <select style={styles.solutionSelect} value={cloneDepth} onChange={(event) => setCloneDepth(event.target.value)}>
            <option value="visual">Visual clone</option>
            <option value="full-ui">Full UI clone</option>
            <option value="full-stack">Full-stack clone (recommended)</option>
          </select>
        </div>
        <div style={styles.cloneOptionsGrid}>
          <label style={styles.autoSearchLabel}>
            <input type="checkbox" checked={clonePixelPerfect} onChange={(event) => setClonePixelPerfect(event.target.checked)} />
            Pixel-perfect clone
          </label>
          <label style={styles.autoSearchLabel}>
            <input type="checkbox" checked={cloneAiRedesign} onChange={(event) => setCloneAiRedesign(event.target.checked)} />
            AI redesign
          </label>
          <label style={styles.autoSearchLabel}>
            <input
              type="checkbox"
              checked={cloneRevenueAutomation}
              onChange={(event) => {
                const checked = event.target.checked;
                setCloneRevenueAutomation(checked);
                setAutoRevenueFeatures(checked);
              }}
            />
            Revenue automation
          </label>
          <label style={styles.autoSearchLabel}>
            <input type="checkbox" checked={exactRedesignMode} onChange={(event) => setExactRedesignMode(event.target.checked)} />
            Exact structure match mode
          </label>
        </div>
        <div style={styles.cloneActionsRow}>
          <button style={styles.smokeSecondaryButton} onClick={() => handleCompetitorScan()} disabled={competitorLoading}>
            {competitorLoading ? "Scanning competitors..." : "Competitor Intelligence"}
          </button>
          <button
            style={{ ...styles.redesignButton, width: "auto", flex: "1 1 240px", marginTop: 0 }}
            onClick={handleRedesignFromUrl}
            disabled={redesigning || !sourceWebsiteUrl.trim()}
          >
            {redesigning ? "Generating clone..." : "GENERATE WEBSITE"}
          </button>
        </div>
      </section>
      {redesignInsights && (
        <div style={styles.redesignInsights}>
          <strong style={styles.redesignTitle}>Instant Analysis: {redesignInsights.host}</strong>
          <small style={styles.redesignMeta}>Layout: {redesignInsights.layoutFindings[0]}</small>
          <small style={styles.redesignMeta}>SEO: {redesignInsights.seoFindings[0]}</small>
          <small style={styles.redesignMeta}>UI: {redesignInsights.uiFindings[0]}</small>
        </div>
      )}
      {solutionMode !== "website" && (
        <div style={styles.featureWrap}>
          {AUTOMATION_PAGE_DEFS.map((item) => {
            const active = Boolean(automationFeatures[item.key]) || (autoRevenueFeatures && REVENUE_MODULE_KEYS.includes(item.key));
            return (
              <button key={item.key} style={active ? styles.featureChipActive : styles.featureChip} onClick={() => toggleAutomationFeature(item.key)}>
                {item.label}
              </button>
            );
          })}
        </div>
      )}
      <section style={styles.bookingControlCard}>
        <div style={styles.bookingControlHeader}>
          <strong style={styles.bookingControlTitle}>📅 Booking & Scheduling System</strong>
          <small style={styles.bookingControlMeta}>Calendly/Square-style workflow</small>
        </div>
        <div style={styles.bookingControlGrid}>
          <label style={styles.solutionLabel}>
            Service Duration
            <select style={styles.solutionSelect} value={bookingDurationMinutes} onChange={(event) => setBookingDurationMinutes(Number(event.target.value || 60))}>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </label>
          <label style={styles.solutionLabel}>
            Availability Slots (comma separated)
            <input style={styles.solutionInput} value={bookingSlotsInput} onChange={(event) => setBookingSlotsInput(event.target.value)} placeholder="09:00 AM, 10:30 AM, 01:00 PM" />
          </label>
          <label style={styles.solutionLabel}>
            Services (comma separated)
            <input style={styles.solutionInput} value={bookingServicesInput} onChange={(event) => setBookingServicesInput(event.target.value)} placeholder="Consultation, Full Service, Premium" />
          </label>
        </div>
        <div style={styles.bookingToggleRow}>
          <label style={styles.autoSearchLabel}>
            <input type="checkbox" checked={bookingAutoConfirmEnabled} onChange={(event) => setBookingAutoConfirmEnabled(event.target.checked)} />
            Automatic confirmations
          </label>
          <label style={styles.autoSearchLabel}>
            <input type="checkbox" checked={bookingGoogleSyncEnabled} onChange={(event) => setBookingGoogleSyncEnabled(event.target.checked)} />
            Google Calendar sync
          </label>
        </div>
        <small style={styles.bookingFlowHint}>Flow: Customer visits website → Selects service → Chooses time → Books appointment → Pays online</small>
      </section>
      <section style={styles.crmControlCard}>
        <div style={styles.crmControlHeader}>
          <strong style={styles.crmControlTitle}>👥 Built-in CRM</strong>
          <small style={styles.crmControlMeta}>HubSpot/Pipedrive-style pipeline</small>
        </div>
        <div style={styles.crmStageRow}>
          {CRM_LEAD_STAGES.map((stage) => (
            <span key={stage} style={styles.crmStageChip}>
              {stage}: {crmStageCounts[stage] || 0}
            </span>
          ))}
        </div>
        <div style={styles.crmPipelineRow}>
          {CRM_SALES_PIPELINE.map((stage, index) => (
            <React.Fragment key={stage}>
              <span style={styles.crmPipelineChip}>{stage}</span>
              {index < CRM_SALES_PIPELINE.length - 1 ? <span style={styles.crmPipelineArrow}>→</span> : null}
            </React.Fragment>
          ))}
        </div>
        <div style={styles.crmFormGrid}>
          <input style={styles.solutionInput} placeholder="Customer name" value={crmNameInput} onChange={(event) => setCrmNameInput(event.target.value)} />
          <input style={styles.solutionInput} placeholder="Email" value={crmEmailInput} onChange={(event) => setCrmEmailInput(event.target.value)} />
          <input style={styles.solutionInput} placeholder="Phone" value={crmPhoneInput} onChange={(event) => setCrmPhoneInput(event.target.value)} />
          <select style={styles.solutionSelect} value={crmStageInput} onChange={(event) => setCrmStageInput(event.target.value)}>
            {CRM_LEAD_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
          <button style={styles.crmAddButton} onClick={handleAddCrmCustomer}>Add Customer</button>
        </div>
        <div style={styles.crmProfilesList}>
          {crmCustomers.slice(0, 8).map((customer) => (
            <article key={customer.id} style={styles.crmProfileItem}>
              <div style={styles.crmProfileHeader}>
                <strong style={styles.crmProfileName}>{customer.name}</strong>
                <select style={styles.crmStageSelect} value={customer.stage} onChange={(event) => handleCrmStageChange(customer.id, event.target.value)}>
                  {CRM_LEAD_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <small style={styles.crmProfileMeta}>{customer.email} • {customer.phone}</small>
              <small style={styles.crmProfileMeta}>Bookings: {customer.bookings} • Payments: ${customer.payments}</small>
            </article>
          ))}
        </div>
      </section>
      <section style={styles.workflowControlCard}>
        <div style={styles.workflowControlHeader}>
          <strong style={styles.workflowControlTitle}>⚙️ Automation Workflows</strong>
          <small style={styles.workflowControlMeta}>Built-in Zapier/Make-style flow engine</small>
        </div>
        <div style={styles.workflowStepsRow}>
          {BOOKING_AUTOMATION_STEPS.map((step, index) => (
            <React.Fragment key={step}>
              <span style={styles.workflowStepChip}>{step}</span>
              {index < BOOKING_AUTOMATION_STEPS.length - 1 ? <span style={styles.crmPipelineArrow}>→</span> : null}
            </React.Fragment>
          ))}
        </div>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={workflowAutomationEnabled} onChange={(event) => setWorkflowAutomationEnabled(event.target.checked)} />
          Enable automation workflows
        </label>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={workflowAutoOnAutonomous} onChange={(event) => setWorkflowAutoOnAutonomous(event.target.checked)} />
          Auto-run on new autonomous bookings
        </label>
        <div style={styles.workflowFormGrid}>
          <input style={styles.solutionInput} placeholder="Test booking email" value={workflowTestEmail} onChange={(event) => setWorkflowTestEmail(event.target.value)} />
          <input
            type="number"
            min="1"
            max="168"
            style={styles.evolutionInput}
            value={workflowReminderHours}
            onChange={(event) => setWorkflowReminderHours(Math.max(1, Number(event.target.value || 24)))}
          />
          <button style={styles.workflowRunButton} onClick={handleRunWorkflowTest} disabled={!workflowAutomationEnabled}>
            Run Workflow Test
          </button>
        </div>
        {workflowRecentRun && (
          <small style={styles.workflowHint}>
            Last run: {new Date(workflowRecentRun.at).toLocaleString()} ({workflowRecentRun.source}) for {workflowRecentRun.email}
          </small>
        )}
        {workflowRuns.length > 0 && (
          <div style={styles.workflowRunsList}>
            {workflowRuns.slice(0, 4).map((run) => (
              <article key={run.id} style={styles.workflowRunItem}>
                <strong style={styles.workflowRunTitle}>{run.email}</strong>
                <small style={styles.workflowRunMeta}>
                  {run.service} • {run.slot} • {run.source}
                </small>
                <small style={styles.workflowRunMeta}>{run.steps.map((item) => item.label).join(" -> ")}</small>
              </article>
            ))}
          </div>
        )}
      </section>
      <section style={styles.paymentControlCard}>
        <div style={styles.paymentControlHeader}>
          <strong style={styles.paymentControlTitle}>💳 Payments & Invoicing</strong>
          <small style={styles.paymentControlMeta}>Stripe • PayPal • Apple Pay • Google Pay</small>
        </div>
        <div style={styles.paymentProvidersRow}>
          {PAYMENT_PROVIDER_KEYS.map((provider) => (
            <button
              key={provider}
              type="button"
              style={paymentIntegrations[provider] ? styles.paymentProviderChipActive : styles.paymentProviderChip}
              onClick={() => togglePaymentProvider(provider)}
            >
              {provider}
            </button>
          ))}
        </div>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={subscriptionsEnabled} onChange={(event) => setSubscriptionsEnabled(event.target.checked)} />
          Subscriptions enabled (gyms, coaching, SaaS)
        </label>
        <div style={styles.paymentFlowRow}>
          <span style={styles.paymentFlowChip}>Book Service</span>
          <span style={styles.crmPipelineArrow}>→</span>
          <span style={styles.paymentFlowChip}>Pay</span>
          <span style={styles.crmPipelineArrow}>→</span>
          <span style={styles.paymentFlowChip}>Confirmation</span>
        </div>
        <div style={styles.paymentInvoiceGrid}>
          <input style={styles.solutionInput} placeholder="Invoice #" value={invoiceNumber} onChange={(event) => setInvoiceNumber(event.target.value)} />
          <input style={styles.solutionInput} placeholder="Service" value={invoiceServiceInput} onChange={(event) => setInvoiceServiceInput(event.target.value)} />
          <input
            style={styles.solutionInput}
            placeholder="Amount"
            value={invoiceAmountInput}
            onChange={(event) => setInvoiceAmountInput(event.target.value.replace(/[^0-9.]/g, ""))}
          />
        </div>
        <div style={styles.invoicePreviewCard}>
          <strong style={styles.invoicePreviewTitle}>Invoice #{invoiceNumber || "1023"}</strong>
          <small style={styles.invoicePreviewMeta}>Service: {invoiceServiceInput || "Full Detail"}</small>
          <small style={styles.invoicePreviewMeta}>Amount: ${invoiceAmountInput || "150"}</small>
        </div>
      </section>

      <button style={styles.recommendedFlowButton} onClick={handleRunRecommendedFlow} disabled={runningRecommendedFlow}>
        {runningRecommendedFlow ? "Running flow..." : "One-click recommended flow"}
      </button>
      <button style={styles.smokeButton} onClick={() => runSmokeCheck()} disabled={smokeRunning}>
        {smokeRunning ? "Running smoke test..." : "Smoke Test"}
      </button>
      <div style={styles.smokeActions}>
        <button
          style={styles.smokeSecondaryButton}
          onClick={() => runSmokeCheck({ failedOnly: true })}
          disabled={smokeRunning || !smokeResults.some((item) => item.status === "fail")}
        >
          Re-run Failed Only
        </button>
        <button style={styles.smokeSecondaryButton} onClick={handleDownloadSmokeReport} disabled={smokeResults.length === 0}>
          Download Smoke Report
        </button>
      </div>
      {smokeResults.length > 0 && (
        <div style={styles.smokeList}>
          {smokeResults.map((item) => (
            <div key={item.key} style={styles.smokeItem}>
              <span style={item.status === "pass" ? styles.smokePass : styles.smokeFail}>{item.status === "pass" ? "PASS" : "FAIL"}</span>
              <strong style={styles.smokeLabel}>{item.label}</strong>
              <small style={styles.smokeMsg}>{item.message}</small>
              <small style={styles.smokeMeta}>
                {item.startedAt ? new Date(item.startedAt).toLocaleTimeString() : "--"} • {typeof item.durationMs === "number" ? `${item.durationMs}ms` : "--"}
              </small>
            </div>
          ))}
        </div>
      )}
      <label style={styles.autoSearchLabel}>
        <input type="checkbox" checked={autoSearchOnGenerate} onChange={(event) => setAutoSearchOnGenerate(event.target.checked)} />
        Auto search domains after generation
      </label>
      <div style={styles.evolutionRow}>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={designEvolutionEnabled} onChange={(event) => setDesignEvolutionEnabled(event.target.checked)} />
          TitoNova Cloud Engine Design Evolution (auto modern refresh)
        </label>
        <div style={styles.evolutionControls}>
          <input
            type="number"
            min="5"
            step="5"
            value={designEvolutionMinutes}
            onChange={(event) => setDesignEvolutionMinutes(Number(event.target.value || 60))}
            style={styles.evolutionInput}
          />
          <span style={styles.evolutionMeta}>minutes</span>
          <button style={styles.smokeSecondaryButton} onClick={() => runDesignEvolution()} disabled={evolutionRunning}>
            {evolutionRunning ? "Evolving..." : "Run Evolution Now"}
          </button>
        </div>
        {lastDesignEvolutionAt ? <small style={styles.evolutionMeta}>Last evolved: {new Date(lastDesignEvolutionAt).toLocaleString()}</small> : null}
      </div>
      <div style={styles.evolutionRow}>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={selfOptimizeEnabled} onChange={(event) => setSelfOptimizeEnabled(event.target.checked)} />
          Self-Optimizing Website (monthly TitoNova Cloud Engine improvements)
        </label>
        <div style={styles.evolutionControls}>
          <input
            type="number"
            min="1"
            step="1"
            value={selfOptimizeDays}
            onChange={(event) => setSelfOptimizeDays(Number(event.target.value || 30))}
            style={styles.evolutionInput}
          />
          <span style={styles.evolutionMeta}>days</span>
          <button style={styles.smokeSecondaryButton} onClick={() => runSelfOptimization()} disabled={selfOptimizeRunning}>
            {selfOptimizeRunning ? "Optimizing..." : "Run Optimization Now"}
          </button>
        </div>
        {lastSelfOptimizationAt ? <small style={styles.evolutionMeta}>Last optimized: {new Date(lastSelfOptimizationAt).toLocaleString()}</small> : null}
      </div>
      <div style={styles.evolutionRow}>
        <label style={styles.autoSearchLabel}>
          <input type="checkbox" checked={autonomousModeEnabled} onChange={(event) => setAutonomousModeEnabled(event.target.checked)} />
          Autonomous Business Mode (TitoNova Cloud Engine handles daily ops)
        </label>
        <div style={styles.evolutionControls}>
          <input
            type="number"
            min="1"
            step="1"
            value={autonomousIntervalMinutes}
            onChange={(event) => setAutonomousIntervalMinutes(Number(event.target.value || 30))}
            style={styles.evolutionInput}
          />
          <span style={styles.evolutionMeta}>minutes</span>
          <button style={styles.smokeSecondaryButton} onClick={() => runAutonomousBusinessMode()} disabled={autonomousRunning}>
            {autonomousRunning ? "Running..." : "Run Autonomous Cycle"}
          </button>
        </div>
        <small style={styles.evolutionMeta}>
          Responds to inquiries, schedules appointments, sends invoices, and suggests pricing adjustments.
        </small>
      </div>
      <div style={styles.evolutionRow}>
        <div style={styles.evolutionControls}>
          <select style={styles.solutionSelect} value={translationLanguage} onChange={(event) => setTranslationLanguage(event.target.value)}>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Portuguese">Portuguese</option>
            <option value="Swahili">Swahili</option>
            <option value="Arabic">Arabic</option>
          </select>
          <button style={styles.smokeSecondaryButton} onClick={handleTranslateAllPages} disabled={translating}>
            {translating ? "Translating..." : "Global Translation"}
          </button>
        </div>
      </div>
      <label style={styles.autoSearchLabel}>
        <input type="checkbox" checked={marketingAutopilotEnabled} onChange={(event) => setMarketingAutopilotEnabled(event.target.checked)} />
        TitoNova Cloud Engine Marketing Autopilot (SEO, social, ads, email)
      </label>
      <button style={styles.smokeSecondaryButton} onClick={() => runMarketingAutopilot({ source: "generation" })} disabled={marketingLoading}>
        {marketingLoading ? "Generating marketing..." : "Generate Marketing Pack"}
      </button>
      <section style={styles.marketingEngineControlCard}>
        <strong style={styles.marketingEngineControlTitle}>TitoNova Cloud Engine Marketing Engine</strong>
        <div style={styles.marketingEngineControlGrid}>
          <input
            style={styles.solutionInput}
            value={marketingOfferInput}
            onChange={(event) => setMarketingOfferInput(event.target.value)}
            placeholder="Primary SEO service (e.g., House Cleaning)"
          />
          <input
            style={styles.solutionInput}
            value={marketingCitiesInput}
            onChange={(event) => setMarketingCitiesInput(event.target.value)}
            placeholder="Cities (comma separated): Dallas, Austin, Houston"
          />
        </div>
        <button style={styles.smokeSecondaryButton} onClick={runAiMarketingEngine} disabled={marketingEngineLoading}>
          {marketingEngineLoading ? "Generating TitoNova Cloud Engine marketing..." : "Generate SEO + Email Assets"}
        </button>
      </section>
      <button style={styles.smokeSecondaryButton} onClick={runMonetizationEngine} disabled={monetizationLoading}>
        {monetizationLoading ? "Generating revenue plan..." : "Generate Monetization Engine"}
      </button>
      <button style={styles.smokeSecondaryButton} onClick={runAiAppBuilder} disabled={appBuilderLoading || !hasGeneratedContent}>
        {appBuilderLoading ? "Building apps..." : "TitoNova Cloud Engine App Builder (iOS + Android + Admin)"}
      </button>
      <button style={styles.smokeSecondaryButton} onClick={() => runGrowthCoach()} disabled={growthCoachLoading || !hasGeneratedContent}>
        {growthCoachLoading ? "Analyzing growth..." : "TitoNova Cloud Engine Growth Coach"}
      </button>
      <button style={styles.smokeSecondaryButton} onClick={runBusinessCoach} disabled={businessCoachLoading || !hasGeneratedContent}>
        {businessCoachLoading ? "Analyzing business..." : "TitoNova Cloud Engine Business Coach"}
      </button>
      <button style={styles.smokeSecondaryButton} onClick={refreshAnalyticsDashboard} disabled={!hasGeneratedContent}>
        Refresh Analytics Dashboard
      </button>
      <section style={styles.smartContentControlCard}>
        <strong style={styles.smartContentControlTitle}>Smart Content Engine</strong>
        <div style={styles.smartContentControls}>
          <select style={styles.solutionSelect} value={smartContentType} onChange={(event) => setSmartContentType(event.target.value)}>
            {SMART_CONTENT_TYPE_OPTIONS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            max="100000"
            style={styles.evolutionInput}
            value={smartContentCount}
            onChange={(event) => setSmartContentCount(Number(event.target.value || 12))}
          />
          <input
            style={styles.solutionInput}
            placeholder="Keyword focus (optional)"
            value={smartContentKeyword}
            onChange={(event) => setSmartContentKeyword(event.target.value)}
          />
        </div>
        <div style={styles.smartContentActions}>
          <button style={styles.smokeSecondaryButton} onClick={() => runSmartContentEngine()} disabled={smartContentLoading}>
            {smartContentLoading ? "Generating content..." : `Generate ${smartContentCount} Items`}
          </button>
          <button
            style={styles.smokeSecondaryButton}
            onClick={() => runSmartContentEngine({ type: "blog-posts", count: 100 })}
            disabled={smartContentLoading}
          >
            Generate 100 SEO Blog Posts
          </button>
        </div>
        {smartContentProgress && <small style={styles.evolutionMeta}>{smartContentProgress}</small>}
      </section>
    </>
  );
}
