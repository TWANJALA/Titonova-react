import React from "react";

export default function PreviewHeaderControls({
  styles,
  isMobilePreview,
  customDomain,
  setCustomDomain,
  handleExportHtml,
  exportFramework,
  setExportFramework,
  exportFrameworkOptions,
  handleExportProjectBundle,
  exportBundleLoading,
}) {
  return (
    <div style={styles.previewHeader}>
      <h2 style={styles.previewTitle}>Generated Website Preview</h2>
      <div style={isMobilePreview ? styles.headerActionsCompact : styles.headerActions}>
        <input
          style={isMobilePreview ? styles.domainInputCompact : styles.domainInput}
          placeholder="Domain (example.com)"
          value={customDomain}
          onChange={(event) => setCustomDomain(event.target.value)}
        />
        <button style={styles.exportButton} onClick={handleExportHtml}>
          Export HTML
        </button>
        <div style={isMobilePreview ? styles.exportBundleControlsCompact : styles.exportBundleControls}>
          <select
            style={styles.exportFrameworkSelect}
            value={exportFramework}
            onChange={(event) => setExportFramework(event.target.value)}
          >
            {exportFrameworkOptions.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
          <button style={styles.exportButton} onClick={handleExportProjectBundle} disabled={exportBundleLoading}>
            {exportBundleLoading ? "Exporting..." : "Export Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
