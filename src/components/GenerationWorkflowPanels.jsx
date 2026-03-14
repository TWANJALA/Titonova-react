import React from "react";
import { AI_LAYOUT_VARIANT_OPTIONS } from "../Dashboard.shared";

export default function GenerationWorkflowPanels({
  styles,
  showAdvancedTools,
  handleGenerateFunnel,
  loading,
  uiDesignLoading,
  businessOsLaunching,
  funnelBuilderData,
  smartComponents,
  handleSmartComponentDragStart,
  handleSmartComponentDrop,
  pipelineVariant,
  setPipelineVariant,
  handleRunAiGenerationPipeline,
  pipelineRunning,
  pipelineVariants,
  pipelineBlueprint,
  pipelineSteps,
}) {
  if (!showAdvancedTools) return null;

  return (
    <>
      <section style={styles.funnelBuilderCard}>
        <div style={styles.funnelBuilderHeader}>
          <strong style={styles.funnelBuilderTitle}>🌐 TitoNova Cloud Engine Website + Funnel Builder</strong>
          <button style={styles.funnelBuilderButton} onClick={handleGenerateFunnel} disabled={loading || uiDesignLoading || businessOsLaunching}>
            {loading || uiDesignLoading || businessOsLaunching ? "Generating Funnel..." : "Generate Funnel Flow"}
          </button>
        </div>
        <small style={styles.funnelBuilderMeta}>Schema-driven pages and conversion funnels instead of fixed templates.</small>
        {funnelBuilderData && (
          <>
            <div style={styles.funnelPagesGrid}>
              {funnelBuilderData.pageChecks.map((item) => (
                <span key={item.key} style={item.pass ? styles.funnelPagePass : styles.funnelPagePending}>
                  {item.label}
                </span>
              ))}
            </div>
            <div style={styles.funnelFlowRow}>
              {funnelBuilderData.funnelStages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <span style={stage.pass ? styles.funnelStagePass : styles.funnelStagePending}>{stage.label}</span>
                  {index < funnelBuilderData.funnelStages.length - 1 ? <span style={styles.funnelArrow}>→</span> : null}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
        <small style={styles.funnelBuilderMeta}>Smart Components (drag to reorder)</small>
        <div style={styles.smartComponentsList}>
          {smartComponents.map((component, index) => (
            <button
              key={`${component}-${index}`}
              type="button"
              draggable
              onDragStart={() => handleSmartComponentDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleSmartComponentDrop(index)}
              style={styles.smartComponentChip}
              title="Drag to reorder"
            >
              {component}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.pipelineCard}>
        <div style={styles.pipelineHeader}>
          <strong style={styles.pipelineTitle}>🧠 TitoNova Cloud Engine Generation System</strong>
          <div style={styles.pipelineControls}>
            <select style={styles.solutionSelect} value={pipelineVariant} onChange={(event) => setPipelineVariant(event.target.value)}>
              {AI_LAYOUT_VARIANT_OPTIONS.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
            <button
              style={styles.pipelineRunButton}
              onClick={handleRunAiGenerationPipeline}
              disabled={pipelineRunning || loading || uiDesignLoading || businessOsLaunching}
            >
              {pipelineRunning ? "Running Pipeline..." : "Run TitoNova Cloud Engine Generation Pipeline"}
            </button>
          </div>
        </div>
        <small style={styles.pipelineMeta}>
          Prompt -&gt; Planner -&gt; Brand -&gt; Layout -&gt; Content -&gt; SEO -&gt; Marketing -&gt; Component Renderer
        </small>
        {Object.keys(pipelineVariants || {}).length > 0 ? (
          <small style={styles.pipelineMeta}>Variants ready: {Object.keys(pipelineVariants).join(", ")}</small>
        ) : null}
        {pipelineBlueprint && (
          <div style={styles.pipelineBlueprintCard}>
            <small style={styles.pipelineMeta}>
              <strong>Business:</strong> {pipelineBlueprint.business_name}
            </small>
            <small style={styles.pipelineMeta}>
              <strong>Industry:</strong> {pipelineBlueprint.industry}
            </small>
            <small style={styles.pipelineMeta}>
              <strong>Pages:</strong> {pipelineBlueprint.pages.join(", ")}
            </small>
            <small style={styles.pipelineMeta}>
              <strong>CTA:</strong> {pipelineBlueprint.cta}
            </small>
          </div>
        )}
        {pipelineSteps.length > 0 && (
          <div style={styles.pipelineStepsList}>
            {pipelineSteps.map((step) => (
              <article key={step.key} style={styles.pipelineStepItem}>
                <span
                  style={
                    step.status === "pass"
                      ? styles.smokePass
                      : step.status === "fail"
                        ? styles.smokeFail
                        : step.status === "running"
                          ? styles.pipelineRunning
                          : styles.pipelinePending
                  }
                >
                  {step.status === "pass" ? "PASS" : step.status === "fail" ? "FAIL" : step.status === "running" ? "RUN" : "WAIT"}
                </span>
                <div style={styles.pipelineStepContent}>
                  <strong style={styles.smokeLabel}>{step.label}</strong>
                  <small style={styles.smokeMsg}>{step.message}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
