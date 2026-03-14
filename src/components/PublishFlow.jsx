import React from "react";

export default function PublishFlow({
  styles,
  publishPrimaryHint,
  publishedSiteId,
  publishPrimaryAction,
  publishPrimaryLabel,
  oneClickHostingRunning,
  publishing,
  handleAddDomainNow,
  domainLoading,
  customDomain,
  handleVerifyDnsNow,
  verifyingDns,
  handleOneClickHosting,
  handleGoLive,
  handleUnpublish,
  normalizedCustomDomain,
  dnsVerifyStatus,
}) {
  return (
    <section style={styles.publishFlowCard}>
      <div style={styles.publishFlowHeader}>
        <div>
          <strong style={styles.publishFlowTitle}>Publish Flow</strong>
          <small style={styles.publishFlowMeta}>{publishPrimaryHint}</small>
        </div>
        <span style={publishedSiteId ? styles.publishFlowBadgeLive : styles.publishFlowBadgeDraft}>
          {publishedSiteId ? "Live" : "Draft"}
        </span>
      </div>
      <div style={styles.publishFlowPrimaryRow}>
        <button
          style={styles.publishFlowPrimaryButton}
          onClick={publishPrimaryAction}
          disabled={oneClickHostingRunning || publishing}
        >
          {publishPrimaryLabel}
        </button>
        <button
          style={styles.publishFlowSecondaryButton}
          onClick={handleAddDomainNow}
          disabled={domainLoading || publishing || !customDomain.trim() || !publishedSiteId}
        >
          {domainLoading ? "Adding..." : "Attach Domain"}
        </button>
        <button
          style={styles.publishFlowSecondaryButton}
          onClick={handleVerifyDnsNow}
          disabled={verifyingDns || !customDomain.trim()}
        >
          {verifyingDns ? "Verifying..." : "Verify DNS"}
        </button>
      </div>
      <div style={styles.publishFlowSecondaryRow}>
        <button
          style={styles.oneClickHostingButton}
          onClick={handleOneClickHosting}
          disabled={oneClickHostingRunning || publishing}
        >
          {oneClickHostingRunning ? "Provisioning..." : "One-Click Hosting"}
        </button>
        <button
          style={styles.republishButton}
          onClick={() => handleGoLive({ republish: true })}
          disabled={publishing || !publishedSiteId}
        >
          Re-publish
        </button>
        <button
          style={styles.unpublishButton}
          onClick={handleUnpublish}
          disabled={publishing || !publishedSiteId}
        >
          Unpublish
        </button>
      </div>
      <div style={styles.publishFlowFacts}>
        <small style={styles.publishFlowFact}>Domain: {normalizedCustomDomain || "Not set yet"}</small>
        <small style={styles.publishFlowFact}>Site ID: {publishedSiteId || "Generated after first publish"}</small>
        <small style={styles.publishFlowFact}>
          DNS: {dnsVerifyStatus === "success" ? "Verified" : normalizedCustomDomain ? "Needs verification" : "Not started"}
        </small>
      </div>
    </section>
  );
}
