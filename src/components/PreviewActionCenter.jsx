import React from "react";

export default function PreviewActionCenter({
  styles,
  previewRecommendedStep,
  previewJourneySteps,
  previewEditableRef,
  handleGoLive,
  publishing,
  publishedSiteId,
  publishStatus,
  publishReadinessMessage,
}) {
  return (
    <section style={styles.previewActionCard}>
      <div style={styles.previewActionHeader}>
        <div>
          <strong style={styles.previewActionTitle}>Action Center</strong>
          <small style={styles.previewActionMeta}>Next step: {previewRecommendedStep}</small>
        </div>
        <span style={styles.previewActionBadge}>
          {previewJourneySteps.filter((item) => item.done).length}/{previewJourneySteps.length} done
        </span>
      </div>
      <div style={styles.previewActionSteps}>
        {previewJourneySteps.map((step) => (
          <article key={step.key} style={step.done ? styles.previewActionStepDone : styles.previewActionStepPending}>
            <strong style={styles.previewActionStepTitle}>{step.label}</strong>
            <small style={styles.previewActionStepMeta}>{step.done ? "Ready" : "Pending"}</small>
          </article>
        ))}
      </div>
      <div style={styles.previewActionButtons}>
        <button
          type="button"
          style={styles.previewActionButtonPrimary}
          onClick={() => previewEditableRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        >
          Focus Preview
        </button>
        <button type="button" style={styles.previewActionButton} onClick={() => handleGoLive()} disabled={publishing}>
          {publishing ? "Publishing..." : publishedSiteId ? "Publish Update" : "Go Live"}
        </button>
      </div>
      <small
        style={
          publishStatus === "error"
            ? styles.previewActionStatusError
            : publishedSiteId
              ? styles.previewActionStatusSuccess
              : styles.previewActionStatusInfo
        }
      >
        {publishReadinessMessage}
      </small>
    </section>
  );
}
