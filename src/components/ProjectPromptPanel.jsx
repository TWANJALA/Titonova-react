import React from "react";
import { QUICK_PROMPT_CHIPS } from "../Dashboard.shared";

export default function ProjectPromptPanel({
  styles,
  projectName,
  setProjectName,
  error,
  setError,
  promptTextareaRef,
  businessOsPrompt,
  handleBusinessPromptChange,
  handleBusinessPromptInput,
  handleBusinessPromptPaste,
  handleEnhancePrompt,
  handleSmartFillPrompt,
  powerPromptEnabled,
  setPowerPromptEnabled,
  ultraSmartModeEnabled,
  setUltraSmartModeEnabled,
  promptIntelligence,
  parsedPromptPreviewText,
  ultraSmartPlanPreview,
  lastGenerationPlan,
  ultraSmartPlanPreviewText,
  smartQaAuditPreview,
  lastGenerationAudit,
  handleAutoFixSmartGaps,
  handleAiBusinessGenerator,
  businessGeneratorLoading,
  businessOsLaunching,
  loading,
  uiDesignLoading,
  handlePrimaryGenerateWebsite,
  handleQuickPromptChip,
}) {
  return (
    <>
      <div style={styles.solutionRow}>
        <label style={styles.solutionLabel}>📁 Project Name *</label>
        <input
          style={styles.input}
          placeholder="Enter project name"
          value={projectName}
          required
          onChange={(e) => {
            setProjectName(e.target.value);
            if (error) setError("");
          }}
        />
      </div>
      <div style={styles.solutionRow}>
        <label style={styles.solutionLabel}>🧠 TitoNova Cloud Engine Prompt</label>
        <textarea
          ref={promptTextareaRef}
          className="prompt-box"
          style={styles.solutionInput}
          placeholder="Describe the website or business you want to create..."
          value={businessOsPrompt}
          rows={4}
          maxLength={5000}
          required
          onChange={handleBusinessPromptChange}
          onInput={handleBusinessPromptInput}
          onPaste={handleBusinessPromptPaste}
        />
        <small style={styles.businessOsHint}>Paste your full website idea here. Sections, style, colors, and features are all supported.</small>
        <small style={styles.promptExampleHint}>
          Example: "Create a modern home care agency website in Dallas with services, testimonials, pricing, and online booking."
        </small>
        <div style={styles.promptAssistRow}>
          <div style={styles.promptAssistActions}>
            <button type="button" style={styles.authGhostButton} onClick={handleEnhancePrompt}>
              Enhance Prompt
            </button>
            <button type="button" style={styles.authGhostButton} onClick={handleSmartFillPrompt}>
              Smart Fill Missing
            </button>
          </div>
          <label style={styles.promptToggleLabel}>
            <input type="checkbox" checked={powerPromptEnabled} onChange={(event) => setPowerPromptEnabled(Boolean(event.target.checked))} />
            Auto Power Prompt
          </label>
          <label style={styles.promptToggleLabel}>
            <input type="checkbox" checked={ultraSmartModeEnabled} onChange={(event) => setUltraSmartModeEnabled(Boolean(event.target.checked))} />
            Ultra Smart Mode
          </label>
        </div>
        <small style={styles.promptPowerHint}>
          Power mode expands your brief into conversion, SEO, UX, trust, and section directives for stronger outputs.
        </small>
        {String(businessOsPrompt || "").trim() && promptIntelligence && (
          <section style={styles.promptIntelPanel}>
            <div style={styles.promptIntelHeader}>
              <strong style={styles.promptIntelTitle}>Prompt Intelligence</strong>
              <span style={styles.promptIntelScore}>{promptIntelligence.score}/100</span>
            </div>
            <small style={styles.promptIntelMeta}>
              Missing: {promptIntelligence.missing.length > 0 ? promptIntelligence.missing.map((item) => item.label).join(", ") : "None"}
            </small>
            <small style={styles.promptIntelMeta}>
              Inferred features:{" "}
              {promptIntelligence.inferredFeatures.length > 0 ? promptIntelligence.inferredFeatures.join(", ") : "booking, crm, payments, seo"}
            </small>
            <small style={styles.promptIntelMeta}>Suggested sections: {promptIntelligence.suggestedSections.join(", ")}</small>
          </section>
        )}
        {String(businessOsPrompt || "").trim() && (
          <section style={styles.parsedPromptPanel}>
            <div style={styles.parsedPromptHeader}>
              <strong style={styles.parsedPromptTitle}>Parsed Prompt JSON</strong>
              <small style={styles.parsedPromptMeta}>Live extraction preview before generation</small>
            </div>
            <pre style={styles.parsedPromptPre}>{parsedPromptPreviewText}</pre>
          </section>
        )}
        {ultraSmartModeEnabled && (ultraSmartPlanPreview || lastGenerationPlan) && (
          <section style={styles.ultraSmartPanel}>
            <div style={styles.parsedPromptHeader}>
              <strong style={styles.parsedPromptTitle}>Ultra Smart Generation Plan</strong>
              <small style={styles.parsedPromptMeta}>Confidence {(lastGenerationPlan || ultraSmartPlanPreview)?.confidence || 0}/100</small>
            </div>
            <pre style={styles.parsedPromptPre}>{ultraSmartPlanPreviewText}</pre>
          </section>
        )}
        {ultraSmartModeEnabled && (smartQaAuditPreview || lastGenerationAudit) && (
          <section style={styles.smartQaPanel}>
            <div style={styles.parsedPromptHeader}>
              <strong style={styles.parsedPromptTitle}>Smart QA Guardrails</strong>
              <small style={styles.parsedPromptMeta}>Score {(smartQaAuditPreview || lastGenerationAudit)?.score || 0}/100</small>
            </div>
            {(smartQaAuditPreview || lastGenerationAudit)?.issues?.length > 0 ? (
              <div style={styles.smartQaIssues}>
                {(smartQaAuditPreview || lastGenerationAudit).issues.slice(0, 6).map((issue) => (
                  <small key={issue} style={styles.smartQaIssueItem}>
                    - {issue}
                  </small>
                ))}
              </div>
            ) : (
              <small style={styles.smartQaIssueItem}>No critical gaps detected.</small>
            )}
            <button type="button" style={styles.smartQaFixButton} onClick={handleAutoFixSmartGaps}>
              Auto Fix Smart Gaps
            </button>
          </section>
        )}
        <div style={styles.primaryCtaWrap}>
          <button
            style={styles.primaryCtaButton}
            onClick={handleAiBusinessGenerator}
            disabled={businessGeneratorLoading || businessOsLaunching || loading || !String(businessOsPrompt || "").trim()}
          >
            {businessGeneratorLoading || businessOsLaunching ? "Launching..." : "🚀 Launch Business"}
          </button>
          <button
            style={styles.secondaryCtaButton}
            onClick={handlePrimaryGenerateWebsite}
            disabled={loading || uiDesignLoading || businessOsLaunching}
          >
            {loading || uiDesignLoading || businessOsLaunching ? "Generating..." : "Generate TitoNova Cloud Engine Website"}
          </button>
        </div>
        <div style={styles.ctaProofWrap}>
          <small style={styles.ctaProofLine}>✨ Used to generate 12,000+ businesses and websites from scratch</small>
          <small style={styles.ctaProofLine}>⚡ Average build time: 28 seconds</small>
        </div>
        <div style={styles.promptChips}>
          {QUICK_PROMPT_CHIPS.map((chip) => (
            <button key={chip} type="button" style={styles.promptChip} onClick={() => handleQuickPromptChip(chip)}>
              {chip}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
