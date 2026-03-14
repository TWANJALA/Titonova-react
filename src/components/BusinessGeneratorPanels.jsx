import React from "react";

export default function BusinessGeneratorPanels({
  styles,
  showAdvancedTools,
  setShowAdvancedTools,
  aiProjectSchema,
  handleExportAiSchema,
  businessGeneratorOutput,
}) {
  return (
    <>
      <div style={styles.businessOsCard}>
        <label style={styles.solutionLabel}>Optional Advanced Tools</label>
        <small style={styles.businessOsHint}>
          Use these only when you want extra automation, redesign, brand, growth controls, billing, or team workspace settings.
        </small>
        <button style={styles.advancedToggleButton} onClick={() => setShowAdvancedTools((prev) => !prev)}>
          {showAdvancedTools ? "Hide Advanced Tools" : "Show Advanced Tools"}
        </button>
        {aiProjectSchema && (
          <button style={styles.smokeSecondaryButton} onClick={handleExportAiSchema}>
            Export TitoNova Cloud Engine Schema JSON
          </button>
        )}
      </div>
      {businessGeneratorOutput && (
        <section style={styles.generatorOutputCard}>
          <div style={styles.generatorOutputHeader}>
            <strong style={styles.generatorOutputTitle}>TitoNova Cloud Engine Business Generator Output</strong>
            <span style={styles.generatorOutputMeta}>Core Feature</span>
          </div>
          <div style={styles.generatorBusinessRow}>
            <img src={businessGeneratorOutput.logo} alt="Generated business logo" style={styles.generatorLogo} />
            <div style={styles.generatorBusinessText}>
              <small style={styles.generatorLabel}>Business Name</small>
              <strong style={styles.generatorValue}>{businessGeneratorOutput.businessName}</strong>
              <small style={styles.generatorLabel}>Website</small>
              <a href={businessGeneratorOutput.website} target="_blank" rel="noreferrer" style={styles.generatorLink}>
                {businessGeneratorOutput.website}
              </a>
            </div>
          </div>
          <div style={styles.generatorColorRow}>
            {[
              { key: "heroStart", label: "Primary" },
              { key: "accent", label: "Accent" },
              { key: "accentStrong", label: "CTA" },
            ].map((item) => (
              <span key={item.key} style={{ ...styles.generatorColorSwatch, background: businessGeneratorOutput.brandColors[item.key] }} title={item.label} />
            ))}
          </div>
          <small style={styles.generatorLabel}>Services</small>
          <ul style={styles.generatorServicesList}>
            {businessGeneratorOutput.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
