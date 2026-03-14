const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 18% 12%, rgba(45,212,191,0.22), transparent 34%), radial-gradient(circle at 78% 16%, rgba(59,130,246,0.24), transparent 38%), radial-gradient(circle at 52% 88%, rgba(16,185,129,0.16), transparent 40%), linear-gradient(148deg, #020817 0%, #081734 42%, #0b2344 100%)",
    padding: "24px 18px 40px",
    color: "#e6edf7",
    fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  hero: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto 14px",
    padding: "10px 10px 4px",
    textAlign: "center",
    boxSizing: "border-box",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "16px",
    background: "linear-gradient(180deg, rgba(9,18,42,0.78), rgba(9,20,46,0.58))",
    backdropFilter: "blur(8px)"
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid rgba(45,212,191,0.45)",
    color: "#63f5b4",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "999px",
    padding: "5px 9px",
    marginBottom: "10px",
    background: "rgba(7,16,38,0.75)"
  },
  title: {
    margin: 0,
    color: "#39df82",
    fontSize: "clamp(24px, 3.5vw, 40px)",
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    fontWeight: 800
  },
  subtitle: {
    margin: "0",
    color: "#c8d8ef",
    fontSize: "14px",
    maxWidth: "700px",
    lineHeight: 1.4,
    marginLeft: "auto",
    marginRight: "auto",
    overflowWrap: "anywhere"
  },
  subtitleBlock: {
    display: "grid",
    gap: "6px",
    marginTop: "8px",
    justifyItems: "center"
  },
  subtitleLead: {
    margin: 0,
    color: "#f8fafc",
    fontSize: "15px",
    fontWeight: 700,
    maxWidth: "700px",
    lineHeight: 1.35
  },
  landingHighlights: {
    marginTop: "14px",
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
    textAlign: "left",
    boxSizing: "border-box"
  },
  landingHighlightCard: {
    borderRadius: "12px",
    border: "1px solid rgba(99,245,180,0.28)",
    background: "linear-gradient(160deg, rgba(11,28,56,0.88), rgba(10,20,44,0.92))",
    padding: "10px 11px",
    boxShadow: "0 10px 20px rgba(2,6,23,0.22)",
    overflow: "visible",
    boxSizing: "border-box"
  },
  landingHighlightTitle: {
    margin: "0 0 6px",
    color: "#9cfed0",
    fontSize: "14px",
    lineHeight: 1.25,
    letterSpacing: "0.01em"
  },
  landingHighlightText: {
    margin: 0,
    color: "#d5e3f8",
    fontSize: "12px",
    lineHeight: 1.4,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "normal"
  },
  appShell: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: "12px",
    flexWrap: "wrap",
    boxSizing: "border-box"
  },
  commandPane: {
    flex: "1 1 500px",
    minWidth: "300px",
    maxWidth: "560px",
    display: "grid",
    gap: "8px"
  },
  resizeHandle: {
    width: "12px",
    minHeight: "220px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "col-resize",
    background: "rgba(7,30,22,0.55)",
    border: "1px solid rgba(74,222,128,0.24)",
    alignSelf: "stretch"
  },
  resizeHandleActive: {
    background: "rgba(16,185,129,0.35)",
    border: "1px solid rgba(74,222,128,0.8)"
  },
  resizeGrip: {
    width: "4px",
    height: "48px",
    borderRadius: "999px",
    background: "linear-gradient(180deg, #6ee7b7, #22c55e)"
  },
  previewPane: {
    flex: "1 1 560px",
    minWidth: "360px",
    position: "sticky",
    top: "16px",
    alignSelf: "flex-start",
    display: "grid",
    gap: "10px"
  },
  card: {
    background:
      "radial-gradient(820px 280px at 50% 0%, rgba(45,212,191,0.1), rgba(45,212,191,0) 62%), linear-gradient(160deg, rgba(15,26,52,0.95), rgba(20,33,61,0.93))",
    padding: "14px",
    borderRadius: "18px",
    maxWidth: "100%",
    margin: 0,
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(76,117,168,0.45)",
    boxShadow: "0 18px 44px rgba(2,6,23,0.38)",
    display: "grid",
    gap: "8px"
  },
  sectionTitle: {
    margin: "0 0 10px",
    color: "#f8fafc",
    fontSize: "19px",
    letterSpacing: "-0.02em"
  },
  sectionIntro: {
    margin: "0 0 10px",
    color: "#b9cbe6",
    fontSize: "12px",
    lineHeight: 1.45
  },
  input: {
    width: "100%",
    padding: "9px 11px",
    borderRadius: "10px",
    border: "1px solid rgba(72,102,148,0.65)",
    marginBottom: "0",
    fontSize: "13px",
    background: "rgba(7,16,38,0.9)",
    color: "#f8fafc",
    outline: "none"
  },
  brandButton: {
    width: "100%",
    padding: "11px 14px",
    marginBottom: "10px",
    background: "linear-gradient(135deg, #047857, #10b981)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  brandCard: {
    border: "1px solid rgba(147,197,253,0.5)",
    background: "rgba(219,234,254,0.15)",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "10px",
    display: "grid",
    gap: "8px"
  },
  brandHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  brandLogo: {
    width: "54px",
    height: "54px",
    borderRadius: "10px",
    border: "1px solid #93c5fd",
    background: "white"
  },
  brandTitle: {
    display: "block",
    fontSize: "13px",
    color: "#dbeafe"
  },
  brandMeta: {
    color: "#cbd5e1",
    fontSize: "11px"
  },
  brandPaletteRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  brandColorWrap: {
    display: "grid",
    justifyItems: "center",
    gap: "3px"
  },
  brandSwatch: {
    width: "26px",
    height: "26px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.25)"
  },
  brandColorLabel: {
    color: "#cbd5e1",
    fontSize: "10px"
  },
  brandBullets: {
    display: "grid",
    gap: "2px"
  },
  brandBullet: {
    color: "#e2e8f0",
    fontSize: "11px"
  },
  brandImages: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "6px"
  },
  brandImageThumb: {
    width: "100%",
    height: "54px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.22)"
  },
  brandApplyButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  businessOsCard: {
    border: "1px solid rgba(34,197,94,0.35)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.32), rgba(6,95,70,0.2))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "8px"
  },
  quickStartCard: {
    border: "1px solid #bfdbfe",
    borderRadius: "16px",
    background: "linear-gradient(180deg,#eff6ff,#ffffff)",
    padding: "14px",
    marginBottom: "12px",
    display: "grid",
    gap: "12px"
  },
  quickStartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    flexWrap: "wrap"
  },
  quickStartTitle: {
    display: "block",
    color: "#0f172a",
    fontSize: "15px"
  },
  quickStartMeta: {
    display: "block",
    color: "#475569",
    fontSize: "12px",
    marginTop: "3px"
  },
  quickStartBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #93c5fd",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 700
  },
  quickStartSteps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "8px"
  },
  quickStartStepDone: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    border: "1px solid #86efac",
    background: "#f0fdf4",
    borderRadius: "12px",
    padding: "10px"
  },
  quickStartStepPending: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "10px"
  },
  quickStartStepIndex: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
    flexShrink: 0
  },
  quickStartStepContent: {
    display: "grid",
    gap: "2px"
  },
  quickStartStepTitle: {
    color: "#0f172a",
    fontSize: "13px"
  },
  quickStartStepMeta: {
    color: "#64748b",
    fontSize: "11px"
  },
  quickStartActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  quickStartAction: {
    background: "#ffffff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  quickStartActionPrimary: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #1d4ed8",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  businessOsHint: {
    color: "#c6f6d5",
    fontSize: "12px",
    lineHeight: 1.45
  },
  promptExampleHint: {
    color: "#8fd9bb",
    fontSize: "12px",
    lineHeight: 1.45
  },
  promptAssistRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap"
  },
  promptAssistActions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  promptToggleLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#bbf7d0",
    fontSize: "11px",
    fontWeight: 700
  },
  promptAssistHint: {
    color: "#86efac",
    fontSize: "11px",
    lineHeight: 1.4
  },
  promptIntelPanel: {
    border: "1px solid rgba(34,197,94,0.35)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.32), rgba(2,24,44,0.3))",
    borderRadius: "10px",
    padding: "8px",
    display: "grid",
    gap: "4px"
  },
  promptIntelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  },
  promptIntelTitle: {
    color: "#dcfce7",
    fontSize: "12px"
  },
  promptIntelScore: {
    color: "#bbf7d0",
    border: "1px solid rgba(134,239,172,0.4)",
    background: "rgba(2,6,23,0.4)",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700
  },
  promptIntelMeta: {
    color: "#bbf7d0",
    fontSize: "11px",
    lineHeight: 1.35
  },
  parsedPromptPanel: {
    border: "1px solid rgba(56,189,248,0.35)",
    background: "linear-gradient(180deg, rgba(8,47,73,0.38), rgba(2,24,44,0.42))",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "6px"
  },
  ultraSmartPanel: {
    border: "1px solid rgba(45,212,191,0.4)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.35), rgba(8,47,73,0.35))",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "6px"
  },
  smartQaPanel: {
    border: "1px solid rgba(251,191,36,0.45)",
    background: "linear-gradient(180deg, rgba(120,53,15,0.24), rgba(8,47,73,0.3))",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "6px"
  },
  smartQaIssues: {
    display: "grid",
    gap: "3px"
  },
  smartQaIssueItem: {
    color: "#fde68a",
    fontSize: "11px",
    lineHeight: 1.35
  },
  smartQaFixButton: {
    justifySelf: "start",
    background: "#f59e0b",
    color: "#111827",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  parsedPromptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  parsedPromptTitle: {
    color: "#dbeafe",
    fontSize: "12px"
  },
  parsedPromptMeta: {
    color: "#93c5fd",
    fontSize: "10px",
    fontWeight: 600
  },
  parsedPromptPre: {
    margin: 0,
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(2,6,23,0.55)",
    color: "#d1fae5",
    padding: "8px",
    fontSize: "11px",
    lineHeight: 1.45,
    maxHeight: "220px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere"
  },
  advancedToggleButton: {
    background: "rgba(6,95,70,0.9)",
    color: "white",
    border: "1px solid rgba(74,222,128,0.4)",
    borderRadius: "10px",
    padding: "8px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    width: "fit-content"
  },
  promptChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "6px"
  },
  authCard: {
    border: "2px solid rgba(76,117,168,0.58)",
    background: "linear-gradient(180deg, rgba(8,24,58,0.74), rgba(11,34,74,0.58))",
    borderRadius: "12px",
    padding: "10px",
    marginBottom: "10px",
    display: "grid",
    gap: "9px"
  },
  authHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  authTitle: {
    color: "#dbeafe",
    fontSize: "12px"
  },
  authModeRow: {
    display: "flex",
    gap: "6px"
  },
  authModeButton: {
    background: "rgba(15,23,42,0.72)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authModeButtonActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #3b82f6",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authFormGrid: {
    display: "grid",
    gap: "8px"
  },
  authPrimaryButton: {
    background: "linear-gradient(180deg,#2f66ff 0%, #2855d8 100%)",
    color: "white",
    border: "1px solid rgba(129,161,255,0.65)",
    borderRadius: "9px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authGhostButton: {
    background: "rgba(15,23,42,0.7)",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: "9px",
    padding: "5px 8px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authProjectWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap"
  },
  authMeta: {
    color: "#bfdbfe",
    fontSize: "11px",
    fontWeight: 600
  },
  authProjectList: {
    display: "grid",
    gap: "4px"
  },
  authProjectItem: {
    color: "#dbeafe",
    fontSize: "11px",
    border: "1px solid rgba(148,163,184,0.42)",
    background: "rgba(15,23,42,0.55)",
    borderRadius: "8px",
    padding: "5px 8px"
  },
  billingPlanItem: {
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.46)",
    borderRadius: "10px",
    padding: "8px",
    display: "grid",
    gap: "6px"
  },
  workspaceRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  workspaceChips: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  variantItem: {
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(2,6,23,0.45)",
    borderRadius: "10px",
    padding: "8px",
    display: "grid",
    gap: "6px"
  },
  guestPromptCard: {
    border: "2px solid rgba(56,189,248,0.55)",
    background: "linear-gradient(180deg, rgba(8,47,73,0.42), rgba(2,132,199,0.22))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "12px",
    display: "grid",
    gap: "8px",
    boxShadow: "0 10px 26px rgba(2, 6, 23, 0.3)"
  },
  guestPromptTitle: {
    color: "#e0f2fe",
    fontSize: "14px"
  },
  guestPromptMeta: {
    color: "#bae6fd",
    fontSize: "12px",
    lineHeight: 1.45
  },
  guestPromptActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  primaryCtaWrap: {
    marginTop: "10px",
    marginBottom: "10px",
    display: "grid",
    justifyItems: "center",
    gap: "8px"
  },
  ctaProofWrap: {
    display: "grid",
    gap: "2px",
    marginTop: "2px",
    marginBottom: "8px"
  },
  ctaProofLine: {
    color: "#87f7be",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.01em"
  },
  primaryCtaButton: {
    width: "min(100%, 520px)",
    padding: "18px 22px",
    background: "linear-gradient(180deg, #2f66ff 0%, #2855d8 100%)",
    color: "white",
    border: "1px solid rgba(129,161,255,0.65)",
    borderRadius: "16px",
    fontSize: "22px",
    fontWeight: 800,
    letterSpacing: "0.02em",
    boxShadow: "0 0 0 1px rgba(47,102,255,0.45), 0 16px 36px rgba(47,102,255,0.42), 0 0 22px rgba(96,130,255,0.3)",
    cursor: "pointer"
  },
  secondaryCtaButton: {
    width: "min(100%, 520px)",
    padding: "11px 14px",
    background: "rgba(10,28,66,0.95)",
    color: "#d8e5ff",
    border: "1px solid rgba(98,132,194,0.55)",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer"
  },
  promptChip: {
    background: "rgba(8,24,58,0.9)",
    color: "#9fdcc0",
    border: "1px solid rgba(59,138,111,0.6)",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  businessOsOutputCard: {
    border: "1px solid rgba(56,189,248,0.38)",
    background: "linear-gradient(180deg, rgba(12,74,110,0.3), rgba(8,47,73,0.24))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "8px"
  },
  businessOsOutputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  },
  businessOsOutputTitle: {
    color: "#e0f2fe",
    fontSize: "13px"
  },
  businessOsOutputMeta: {
    color: "#bae6fd",
    fontSize: "12px",
    fontWeight: 600
  },
  businessOsOutputList: {
    display: "grid",
    gap: "6px"
  },
  businessOsOutputItem: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "8px",
    padding: "8px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    alignItems: "center"
  },
  businessOsOutputContent: {
    display: "grid",
    gap: "2px"
  },
  generatorOutputCard: {
    border: "1px solid rgba(74,222,128,0.5)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.3), rgba(6,95,70,0.22))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  generatorOutputHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  },
  generatorOutputTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  generatorOutputMeta: {
    color: "#86efac",
    fontSize: "11px",
    fontWeight: 700
  },
  generatorBusinessRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start"
  },
  generatorLogo: {
    width: "54px",
    height: "54px",
    borderRadius: "10px",
    border: "1px solid rgba(74,222,128,0.45)",
    background: "#ffffff"
  },
  generatorBusinessText: {
    display: "grid",
    gap: "2px"
  },
  generatorLabel: {
    color: "#bbf7d0",
    fontSize: "11px",
    fontWeight: 600
  },
  generatorValue: {
    color: "#f0fdf4",
    fontSize: "15px"
  },
  generatorLink: {
    color: "#6ee7b7",
    fontSize: "12px",
    textDecoration: "none"
  },
  generatorColorRow: {
    display: "flex",
    gap: "8px"
  },
  generatorColorSwatch: {
    width: "20px",
    height: "20px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.24)"
  },
  generatorServicesList: {
    margin: 0,
    paddingLeft: "18px",
    color: "#dcfce7",
    fontSize: "12px",
    display: "grid",
    gap: "3px"
  },
  funnelBuilderCard: {
    border: "1px solid rgba(52,211,153,0.48)",
    background: "linear-gradient(180deg, rgba(6,95,70,0.28), rgba(4,120,87,0.2))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  funnelBuilderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  funnelBuilderTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  funnelBuilderButton: {
    background: "linear-gradient(135deg, #10b981, #22c55e)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  funnelBuilderMeta: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  funnelPagesGrid: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap"
  },
  funnelPagePass: {
    background: "rgba(34,197,94,0.2)",
    border: "1px solid rgba(34,197,94,0.45)",
    color: "#dcfce7",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  funnelPagePending: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.34)",
    color: "#cbd5e1",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  funnelFlowRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap"
  },
  funnelStagePass: {
    background: "rgba(16,185,129,0.22)",
    border: "1px solid rgba(16,185,129,0.52)",
    color: "#ecfdf5",
    borderRadius: "8px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  funnelStagePending: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.34)",
    color: "#cbd5e1",
    borderRadius: "8px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  funnelArrow: {
    color: "#86efac",
    fontWeight: 700
  },
  smartComponentsList: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap"
  },
  smartComponentChip: {
    border: "1px dashed rgba(52,211,153,0.62)",
    background: "rgba(6,78,59,0.45)",
    color: "#d1fae5",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "lowercase",
    cursor: "grab"
  },
  pipelineCard: {
    border: "1px solid rgba(74,222,128,0.42)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.26), rgba(6,95,70,0.2))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  pipelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  pipelineTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  pipelineControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  pipelineRunButton: {
    background: "linear-gradient(135deg,#10b981,#22c55e)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  pipelineMeta: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  pipelineBlueprintCard: {
    border: "1px solid rgba(74,222,128,0.34)",
    background: "rgba(6,95,70,0.2)",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "2px"
  },
  pipelineStepsList: {
    display: "grid",
    gap: "7px"
  },
  pipelineStepItem: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "8px",
    padding: "8px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    alignItems: "center"
  },
  pipelineStepContent: {
    display: "grid",
    gap: "2px"
  },
  pipelineRunning: {
    background: "#0ea5e9",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700
  },
  pipelinePending: {
    background: "#475569",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700
  },
  bookingControlCard: {
    border: "1px solid rgba(74,222,128,0.42)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.26), rgba(6,95,70,0.2))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  bookingControlHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap"
  },
  bookingControlTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  bookingControlMeta: {
    color: "#86efac",
    fontSize: "11px",
    fontWeight: 700
  },
  bookingControlGrid: {
    display: "grid",
    gap: "8px"
  },
  bookingToggleRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  bookingFlowHint: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  crmControlCard: {
    border: "1px solid rgba(74,222,128,0.42)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.24), rgba(4,120,87,0.18))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  crmControlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  crmControlTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  crmControlMeta: {
    color: "#86efac",
    fontSize: "11px",
    fontWeight: 700
  },
  crmStageRow: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap"
  },
  crmStageChip: {
    background: "rgba(16,185,129,0.2)",
    border: "1px solid rgba(16,185,129,0.45)",
    color: "#dcfce7",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  crmPipelineRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  crmPipelineChip: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.34)",
    color: "#cbd5e1",
    borderRadius: "8px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  crmPipelineArrow: {
    color: "#86efac",
    fontWeight: 700
  },
  crmFormGrid: {
    display: "grid",
    gap: "8px"
  },
  crmAddButton: {
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    width: "fit-content"
  },
  crmProfilesList: {
    display: "grid",
    gap: "8px"
  },
  crmProfileItem: {
    border: "1px solid rgba(74,222,128,0.34)",
    background: "rgba(6,95,70,0.2)",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "3px"
  },
  crmProfileHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  crmProfileName: {
    color: "#f0fdf4",
    fontSize: "13px"
  },
  crmStageSelect: {
    padding: "5px 8px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "11px"
  },
  crmProfileMeta: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  workflowControlCard: {
    border: "1px solid rgba(74,222,128,0.42)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.24), rgba(4,120,87,0.18))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  workflowControlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  workflowControlTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  workflowControlMeta: {
    color: "#86efac",
    fontSize: "11px",
    fontWeight: 700
  },
  workflowStepsRow: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  workflowStepChip: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.34)",
    color: "#cbd5e1",
    borderRadius: "8px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  workflowFormGrid: {
    display: "grid",
    gap: "8px"
  },
  workflowRunButton: {
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    width: "fit-content"
  },
  workflowHint: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  workflowRunsList: {
    display: "grid",
    gap: "7px"
  },
  workflowRunItem: {
    border: "1px solid rgba(74,222,128,0.34)",
    background: "rgba(6,95,70,0.2)",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "3px"
  },
  workflowRunTitle: {
    color: "#f0fdf4",
    fontSize: "12px"
  },
  workflowRunMeta: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  paymentControlCard: {
    border: "1px solid rgba(74,222,128,0.42)",
    background: "linear-gradient(180deg, rgba(6,78,59,0.24), rgba(4,120,87,0.18))",
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "10px",
    display: "grid",
    gap: "10px"
  },
  paymentControlHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  paymentControlTitle: {
    color: "#d1fae5",
    fontSize: "13px"
  },
  paymentControlMeta: {
    color: "#86efac",
    fontSize: "11px",
    fontWeight: 700
  },
  paymentProvidersRow: {
    display: "flex",
    gap: "7px",
    flexWrap: "wrap"
  },
  paymentProviderChip: {
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(148,163,184,0.34)",
    color: "#cbd5e1",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  paymentProviderChipActive: {
    background: "rgba(16,185,129,0.22)",
    border: "1px solid rgba(16,185,129,0.5)",
    color: "#ecfdf5",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  paymentFlowRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  paymentFlowChip: {
    background: "rgba(16,185,129,0.2)",
    border: "1px solid rgba(16,185,129,0.45)",
    color: "#dcfce7",
    borderRadius: "8px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  paymentInvoiceGrid: {
    display: "grid",
    gap: "8px"
  },
  invoicePreviewCard: {
    border: "1px solid rgba(74,222,128,0.34)",
    background: "rgba(6,95,70,0.2)",
    borderRadius: "10px",
    padding: "9px",
    display: "grid",
    gap: "2px"
  },
  invoicePreviewTitle: {
    color: "#f0fdf4",
    fontSize: "13px"
  },
  invoicePreviewMeta: {
    color: "#bbf7d0",
    fontSize: "11px"
  },
  solutionRow: {
    display: "grid",
    gap: "7px",
    marginBottom: "12px"
  },
  solutionLabel: {
    fontSize: "12px",
    color: "#cbd5e1",
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase"
  },
  solutionSelect: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "13px"
  },
  solutionInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "13px",
    lineHeight: 1.45,
    resize: "none",
    overflow: "hidden",
    outline: "none"
  },
  solutionTextarea: {
    width: "100%",
    minHeight: "58px",
    padding: "8px 10px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "12px",
    resize: "vertical"
  },
  cloneGeneratorCard: {
    background: "linear-gradient(180deg, rgba(8,47,73,0.3), rgba(15,23,42,0.55))",
    border: "1px solid rgba(56,189,248,0.38)",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "12px",
    display: "grid",
    gap: "10px"
  },
  cloneGeneratorHeader: {
    display: "grid",
    gap: "4px"
  },
  cloneGeneratorTitle: {
    color: "#e0f2fe",
    fontSize: "12px",
    letterSpacing: "0.05em",
    textTransform: "uppercase"
  },
  cloneGeneratorMeta: {
    color: "#bae6fd",
    fontSize: "12px"
  },
  cloneOptionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "8px 10px"
  },
  cloneActionsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  redesignInsights: {
    background: "rgba(15,118,110,0.18)",
    border: "1px solid rgba(20,184,166,0.45)",
    borderRadius: "8px",
    padding: "8px",
    marginBottom: "10px",
    display: "grid",
    gap: "4px"
  },
  redesignTitle: {
    color: "#ccfbf1",
    fontSize: "12px"
  },
  redesignMeta: {
    color: "#e2e8f0",
    fontSize: "11px"
  },
  templateBlueprintCard: {
    background: "rgba(20,83,45,0.24)",
    border: "1px solid rgba(74,222,128,0.4)",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "12px",
    display: "grid",
    gap: "5px"
  },
  templateBlueprintTitle: {
    color: "#dcfce7",
    fontSize: "12px",
    letterSpacing: "0.03em",
    textTransform: "uppercase"
  },
  templateBlueprintMeta: {
    color: "#e2e8f0",
    fontSize: "11px",
    lineHeight: 1.45
  },
  templateBlueprintButton: {
    marginTop: "4px",
    border: "1px solid rgba(74,222,128,0.5)",
    background: "rgba(20,184,166,0.18)",
    color: "#f0fdf4",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    padding: "6px 10px",
    cursor: "pointer",
    justifySelf: "start"
  },
  featureWrap: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "12px"
  },
  featureChip: {
    background: "rgba(30,41,59,0.7)",
    color: "#e2e8f0",
    border: "1px solid rgba(148,163,184,0.35)",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer"
  },
  featureChipActive: {
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "white",
    border: "1px solid #2dd4bf",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer"
  },
  compareButton: {
    background: "#dbeafe",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  compareButtonActive: {
    background: "#1e3a8a",
    color: "white",
    border: "1px solid #1e3a8a",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  button: {
    width: "100%",
    padding: "17px 20px",
    background: "linear-gradient(135deg, #10b981, #22c55e)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    boxShadow: "0 14px 30px rgba(16,185,129,0.38)",
    cursor: "pointer"
  },
  redesignButton: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    background: "linear-gradient(135deg, #0f766e, #14b8a6)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  recommendedFlowButton: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    background: "linear-gradient(135deg, #16a34a, #22c55e)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer"
  },
  smokeButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    background: "#123026",
    color: "white",
    border: "1px solid rgba(74,222,128,0.34)",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer"
  },
  smokeActions: {
    marginTop: "8px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  smokeSecondaryButton: {
    background: "rgba(18,48,38,0.92)",
    color: "white",
    border: "1px solid rgba(74,222,128,0.32)",
    borderRadius: "10px",
    padding: "8px 11px",
    fontSize: "12px",
    cursor: "pointer"
  },
  smokeList: {
    marginTop: "10px",
    display: "grid",
    gap: "6px"
  },
  smokeItem: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    padding: "8px",
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    columnGap: "8px",
    rowGap: "2px",
    alignItems: "center"
  },
  smokePass: {
    background: "#16a34a",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700,
    gridRow: "1 / span 2"
  },
  smokeFail: {
    background: "#dc2626",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700,
    gridRow: "1 / span 2"
  },
  smokeLabel: {
    color: "#f8fafc",
    fontSize: "13px"
  },
  smokeMsg: {
    color: "#cbd5e1",
    fontSize: "12px"
  },
  smokeMeta: {
    color: "#94a3b8",
    fontSize: "11px"
  },
  autoSearchLabel: {
    marginTop: "12px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    color: "#dbe7f6"
  },
  evolutionRow: {
    marginTop: "8px",
    display: "grid",
    gap: "6px"
  },
  evolutionControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },
  evolutionInput: {
    width: "80px",
    padding: "7px 8px",
    borderRadius: "10px",
    border: "1px solid rgba(148,163,184,0.35)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "12px"
  },
  evolutionMeta: {
    color: "#94a3b8",
    fontSize: "11px"
  },
  smartContentControlCard: {
    marginTop: "10px",
    border: "1px solid rgba(34,211,238,0.35)",
    borderRadius: "10px",
    background: "rgba(6,182,212,0.1)",
    padding: "10px",
    display: "grid",
    gap: "8px"
  },
  smartContentControlTitle: {
    color: "#cffafe",
    fontSize: "12px"
  },
  smartContentControls: {
    display: "grid",
    gridTemplateColumns: "minmax(140px,1fr) auto minmax(180px,1.5fr)",
    gap: "8px",
    alignItems: "center"
  },
  smartContentActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  marketingEngineControlCard: {
    border: "1px solid rgba(34,211,238,0.35)",
    borderRadius: "10px",
    background: "rgba(6,182,212,0.1)",
    padding: "10px",
    display: "grid",
    gap: "8px"
  },
  marketingEngineControlTitle: {
    color: "#cffafe",
    fontSize: "12px"
  },
  marketingEngineControlGrid: {
    display: "grid",
    gap: "8px"
  },
  preview: {
    marginTop: 0,
    background: "linear-gradient(180deg, #f4fff8 0%, #ebfdf2 100%)",
    color: "#0f172a",
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid #b7ebcc",
    boxShadow: "0 20px 55px rgba(15,23,42,0.14)",
    display: "grid",
    gap: "12px"
  },
  previewCanvasWrap: {
    position: "relative"
  },
  previewCanvasFaint: {
    opacity: 0.24,
    filter: "saturate(0.8) blur(0.6px)",
    pointerEvents: "none"
  },
  previewGuestOverlay: {
    position: "absolute",
    inset: "20px 14px 14px",
    display: "grid",
    alignContent: "center",
    justifyItems: "center",
    gap: "10px",
    textAlign: "center",
    background: "rgba(255,255,255,0.7)",
    border: "1px solid #99f6c0",
    borderRadius: "12px",
    boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
    backdropFilter: "blur(2px)"
  },
  previewGuestTitle: {
    color: "#14532d",
    fontSize: "18px",
    lineHeight: 1.3,
    maxWidth: "560px"
  },
  previewGuestMeta: {
    color: "#334155",
    fontSize: "13px",
    maxWidth: "620px"
  },
  previewGuestActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  previewEmpty: {
    background: "linear-gradient(180deg, rgba(6,24,18,0.95), rgba(7,38,28,0.9))",
    border: "1px solid rgba(74,222,128,0.24)",
    borderRadius: "18px",
    padding: "30px 24px",
    boxShadow: "0 16px 45px rgba(2,6,23,0.35)"
  },
  previewEmptyTitle: {
    margin: "0 0 10px",
    color: "#d1fae5",
    fontSize: "22px",
    letterSpacing: "-0.02em"
  },
  previewEmptyText: {
    margin: 0,
    color: "#a7f3d0",
    fontSize: "14px",
    lineHeight: 1.6,
    maxWidth: "65ch"
  },
  previewEmptyActions: {
    marginTop: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px"
  },
  previewEmptyPrimary: {
    background: "linear-gradient(135deg,#22c55e,#16a34a)",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer"
  },
  previewEmptySecondary: {
    background: "rgba(255,255,255,0.08)",
    color: "#d1fae5",
    border: "1px solid rgba(167,243,208,0.24)",
    borderRadius: "999px",
    padding: "10px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer"
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "12px"
  },
  previewTitle: {
    margin: 0,
    color: "#0b3a2b",
    fontSize: "24px",
    letterSpacing: "-0.02em"
  },
  previewActionCard: {
    border: "1px solid #bbf7d0",
    borderRadius: "14px",
    background: "linear-gradient(180deg,#ffffff 0%,#f0fdf4 100%)",
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  previewActionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap"
  },
  previewActionTitle: {
    display: "block",
    color: "#14532d",
    fontSize: "15px"
  },
  previewActionMeta: {
    color: "#166534",
    fontSize: "12px"
  },
  previewActionBadge: {
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 700
  },
  previewActionSteps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
    gap: "10px"
  },
  previewActionStepDone: {
    border: "1px solid #86efac",
    borderRadius: "12px",
    background: "#f0fdf4",
    padding: "10px",
    display: "grid",
    gap: "4px"
  },
  previewActionStepPending: {
    border: "1px solid #d1d5db",
    borderRadius: "12px",
    background: "#ffffff",
    padding: "10px",
    display: "grid",
    gap: "4px"
  },
  previewActionStepTitle: {
    color: "#0f172a",
    fontSize: "13px"
  },
  previewActionStepMeta: {
    color: "#475569",
    fontSize: "11px"
  },
  previewActionButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  previewActionButtonPrimary: {
    background: "#0f766e",
    color: "#ffffff",
    border: "none",
    borderRadius: "999px",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  previewActionButton: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #a7f3d0",
    borderRadius: "999px",
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  previewActionStatusInfo: {
    color: "#166534",
    fontSize: "12px"
  },
  previewActionStatusSuccess: {
    color: "#047857",
    fontSize: "12px",
    fontWeight: 700
  },
  previewActionStatusError: {
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: 700
  },
  seoCard: {
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    padding: "10px",
    marginBottom: "10px"
  },
  seoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },
  seoTitle: {
    fontSize: "13px",
    color: "#166534"
  },
  seoScore: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#0f172a"
  },
  seoSummary: {
    color: "#334155",
    fontSize: "12px",
    marginBottom: "8px"
  },
  seoList: {
    display: "grid",
    gap: "6px"
  },
  seoItem: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "8px",
    alignItems: "start",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "7px",
    background: "white"
  },
  seoPass: {
    background: "#16a34a",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700
  },
  seoFail: {
    background: "#dc2626",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: 700
  },
  seoItemLabel: {
    display: "block",
    color: "#0f172a",
    fontSize: "12px"
  },
  seoItemMeta: {
    color: "#475569",
    fontSize: "11px"
  },
  analyticsDashboardCard: {
    border: "1px solid #99f6e4",
    borderRadius: "10px",
    background: "#ecfeff",
    padding: "10px",
    marginBottom: "10px"
  },
  analyticsDashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px"
  },
  analyticsDashboardTitle: {
    color: "#115e59",
    fontSize: "13px"
  },
  analyticsDashboardMeta: {
    color: "#0f766e",
    fontSize: "11px",
    fontWeight: 600
  },
  analyticsStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: "8px",
    marginBottom: "8px"
  },
  analyticsStatItem: {
    border: "1px solid #ccfbf1",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "8px",
    display: "grid",
    gap: "2px"
  },
  analyticsStatLabel: {
    color: "#0f766e",
    fontSize: "11px",
    fontWeight: 600
  },
  analyticsStatValue: {
    color: "#0f172a",
    fontSize: "18px"
  },
  analyticsTopPages: {
    display: "grid",
    gap: "4px"
  },
  analyticsTopPageItem: {
    color: "#134e4a",
    fontSize: "11px"
  },
  mobileAppCard: {
    border: "1px solid #86efac",
    borderRadius: "10px",
    background: "#f0fdf4",
    padding: "10px",
    marginBottom: "10px",
    display: "grid",
    gap: "8px"
  },
  mobileAppHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px"
  },
  mobileAppTitle: {
    color: "#14532d",
    fontSize: "13px"
  },
  mobileAppMeta: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 600
  },
  mobileTabRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  mobileTab: {
    border: "1px solid #bbf7d0",
    background: "#ffffff",
    color: "#166534",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "capitalize",
    cursor: "pointer"
  },
  mobileTabActive: {
    border: "1px solid #22c55e",
    background: "#22c55e",
    color: "#ffffff",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "capitalize",
    cursor: "pointer"
  },
  mobilePhoneFrame: {
    border: "1px solid #dcfce7",
    borderRadius: "16px",
    background: "#ffffff",
    padding: "10px",
    display: "grid",
    gap: "8px",
    maxWidth: "340px"
  },
  mobilePhoneTopBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  mobilePhoneTime: {
    color: "#0f172a",
    fontSize: "11px",
    fontWeight: 700
  },
  mobilePhoneSignal: {
    color: "#334155",
    fontSize: "10px"
  },
  mobileMetricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(120px,1fr))",
    gap: "6px"
  },
  mobileMetricItem: {
    border: "1px solid #dcfce7",
    background: "#f8fafc",
    borderRadius: "10px",
    padding: "8px",
    display: "grid",
    gap: "1px"
  },
  mobileMetricLabel: {
    color: "#166534",
    fontSize: "10px",
    fontWeight: 600
  },
  mobileMetricValue: {
    color: "#0f172a",
    fontSize: "16px"
  },
  mobileFeed: {
    display: "grid",
    gap: "5px"
  },
  mobileFeedItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "7px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "11px"
  },
  growthCoachCard: {
    border: "1px solid #fde68a",
    borderRadius: "10px",
    background: "#fffbeb",
    padding: "10px",
    marginBottom: "10px"
  },
  growthCoachHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  growthCoachTitle: {
    color: "#92400e",
    fontSize: "13px"
  },
  growthCoachMeta: {
    color: "#b45309",
    fontSize: "11px",
    fontWeight: 600
  },
  growthCoachList: {
    display: "grid",
    gap: "8px"
  },
  growthCoachItem: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #fef3c7",
    background: "white",
    borderRadius: "8px",
    padding: "8px"
  },
  growthCoachSeverityHigh: {
    background: "#dc2626",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700
  },
  growthCoachSeverityMedium: {
    background: "#d97706",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700
  },
  growthCoachSeverityLow: {
    background: "#16a34a",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700
  },
  growthCoachContent: {
    display: "grid",
    gap: "2px"
  },
  growthCoachIssue: {
    color: "#1f2937",
    fontSize: "12px"
  },
  growthCoachRecommendation: {
    color: "#4b5563",
    fontSize: "11px"
  },
  growthCoachAction: {
    background: "#b45309",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "11px",
    cursor: "pointer"
  },
  businessCoachCard: {
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    padding: "10px",
    marginBottom: "10px"
  },
  businessCoachHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    gap: "8px"
  },
  businessCoachTitle: {
    color: "#166534",
    fontSize: "13px"
  },
  businessCoachMeta: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 600
  },
  businessCoachList: {
    display: "grid",
    gap: "8px"
  },
  businessCoachItem: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    alignItems: "start",
    gap: "8px",
    border: "1px solid #dcfce7",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "8px"
  },
  businessCoachSeverityHigh: {
    background: "#dc2626",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700
  },
  businessCoachSeverityMedium: {
    background: "#16a34a",
    color: "white",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "10px",
    fontWeight: 700
  },
  businessCoachContent: {
    display: "grid",
    gap: "2px"
  },
  businessCoachIssue: {
    color: "#14532d",
    fontSize: "12px"
  },
  businessCoachRecommendation: {
    color: "#334155",
    fontSize: "11px"
  },
  selfOptimizeCard: {
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    padding: "10px",
    marginBottom: "10px"
  },
  selfOptimizeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    gap: "8px"
  },
  selfOptimizeTitle: {
    color: "#166534",
    fontSize: "13px"
  },
  selfOptimizeMeta: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 600
  },
  selfOptimizeList: {
    display: "grid",
    gap: "8px"
  },
  selfOptimizeItem: {
    border: "1px solid #dcfce7",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "3px"
  },
  selfOptimizeTime: {
    color: "#166534",
    fontSize: "11px",
    fontWeight: 700
  },
  selfOptimizeText: {
    color: "#334155",
    fontSize: "11px"
  },
  autonomousCard: {
    border: "1px solid #ddd6fe",
    borderRadius: "10px",
    background: "#f5f3ff",
    padding: "10px",
    marginBottom: "10px"
  },
  autonomousHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    gap: "8px"
  },
  autonomousTitle: {
    color: "#5b21b6",
    fontSize: "13px"
  },
  autonomousMeta: {
    color: "#6d28d9",
    fontSize: "11px",
    fontWeight: 700
  },
  autonomousStats: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px"
  },
  autonomousStat: {
    background: "#ede9fe",
    border: "1px solid #c4b5fd",
    borderRadius: "999px",
    padding: "3px 8px",
    color: "#4c1d95",
    fontSize: "11px",
    fontWeight: 600
  },
  autonomousPricing: {
    display: "block",
    color: "#4c1d95",
    fontSize: "11px",
    marginBottom: "8px"
  },
  autonomousLogList: {
    display: "grid",
    gap: "6px"
  },
  autonomousLogItem: {
    border: "1px solid #e9d5ff",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "2px"
  },
  autonomousLogTime: {
    color: "#6d28d9",
    fontSize: "10px",
    fontWeight: 700
  },
  autonomousLogType: {
    color: "#7c3aed",
    fontSize: "10px",
    fontWeight: 700
  },
  autonomousLogText: {
    color: "#374151",
    fontSize: "11px"
  },
  uiDesignCard: {
    border: "1px solid #c7d2fe",
    borderRadius: "10px",
    background: "#eef2ff",
    padding: "10px",
    marginBottom: "10px"
  },
  uiDesignHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  uiDesignTitle: {
    fontSize: "13px",
    color: "#312e81"
  },
  uiDesignMeta: {
    fontSize: "11px",
    color: "#4338ca",
    fontWeight: 700,
    textTransform: "capitalize"
  },
  uiDesignSwatches: {
    display: "flex",
    gap: "6px",
    marginBottom: "6px"
  },
  uiDesignSwatch: {
    width: "18px",
    height: "18px",
    borderRadius: "999px",
    border: "1px solid rgba(15,23,42,0.2)"
  },
  uiDesignText: {
    display: "block",
    color: "#3730a3",
    fontSize: "11px",
    lineHeight: 1.35
  },
  competitorCard: {
    border: "1px solid #fed7aa",
    borderRadius: "10px",
    background: "#fff7ed",
    padding: "10px",
    marginBottom: "10px"
  },
  competitorHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px"
  },
  competitorTitle: {
    fontSize: "13px",
    color: "#9a3412"
  },
  competitorMeta: {
    fontSize: "11px",
    color: "#7c2d12"
  },
  competitorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "8px"
  },
  competitorPanel: {
    border: "1px solid #fdba74",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "6px"
  },
  competitorUrl: {
    color: "#7c2d12",
    fontSize: "12px"
  },
  competitorPricing: {
    color: "#9a3412",
    fontSize: "11px"
  },
  competitorSection: {
    display: "grid",
    gap: "4px"
  },
  competitorLabel: {
    color: "#7c2d12",
    fontSize: "11px",
    fontWeight: 700
  },
  competitorChip: {
    display: "inline-block",
    width: "fit-content",
    background: "#ffedd5",
    border: "1px solid #fdba74",
    color: "#9a3412",
    borderRadius: "999px",
    padding: "2px 8px",
    fontSize: "11px"
  },
  competitorWeakness: {
    color: "#7c2d12",
    fontSize: "11px"
  },
  competitorSuggestions: {
    marginTop: "10px",
    borderTop: "1px solid #fdba74",
    paddingTop: "8px",
    display: "grid",
    gap: "4px"
  },
  competitorSuggestionTitle: {
    fontSize: "12px",
    color: "#9a3412"
  },
  competitorSuggestionItem: {
    color: "#7c2d12",
    fontSize: "11px"
  },
  smartContentCard: {
    border: "1px solid #a5f3fc",
    borderRadius: "10px",
    background: "#ecfeff",
    padding: "10px",
    marginBottom: "10px"
  },
  smartContentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  smartContentTitle: {
    color: "#155e75",
    fontSize: "13px"
  },
  smartContentMeta: {
    color: "#0e7490",
    fontSize: "11px",
    fontWeight: 700
  },
  smartContentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "8px",
    maxHeight: "340px",
    overflowY: "auto",
    paddingRight: "2px"
  },
  smartContentItem: {
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "4px"
  },
  smartContentItemTitle: {
    color: "#0f172a",
    fontSize: "12px"
  },
  smartContentItemMeta: {
    color: "#334155",
    fontSize: "11px"
  },
  smartContentSlug: {
    color: "#0e7490",
    fontSize: "10px",
    background: "#f0f9ff",
    borderRadius: "6px",
    padding: "2px 6px",
    width: "fit-content"
  },
  appBuilderCard: {
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    background: "#eff6ff",
    padding: "10px",
    marginBottom: "10px"
  },
  appBuilderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
    gap: "8px"
  },
  appBuilderTitle: {
    color: "#1e3a8a",
    fontSize: "13px"
  },
  appBuilderMeta: {
    color: "#1d4ed8",
    fontSize: "11px",
    fontWeight: 600
  },
  appBuilderGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "8px"
  },
  appBuilderPanel: {
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "4px"
  },
  appBuilderPanelTitle: {
    color: "#0f172a",
    fontSize: "12px"
  },
  appBuilderRow: {
    color: "#334155",
    fontSize: "11px"
  },
  appBuilderListTitle: {
    color: "#1e3a8a",
    fontSize: "11px",
    fontWeight: 700,
    marginTop: "2px"
  },
  appBuilderItem: {
    color: "#334155",
    fontSize: "11px"
  },
  appBuilderAction: {
    marginTop: "6px",
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "11px",
    cursor: "pointer"
  },
  marketingCard: {
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    background: "#f0fdf4",
    padding: "10px",
    marginBottom: "10px"
  },
  marketingEngineCard: {
    border: "1px solid #a7f3d0",
    borderRadius: "10px",
    background: "#ecfdf5",
    padding: "10px",
    marginBottom: "10px"
  },
  marketingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  marketingTitle: {
    color: "#166534",
    fontSize: "13px"
  },
  marketingMeta: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 600
  },
  marketingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "8px"
  },
  marketingEngineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: "8px"
  },
  marketingPanel: {
    border: "1px solid #dcfce7",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "6px"
  },
  marketingPanelTitle: {
    color: "#166534",
    fontSize: "12px"
  },
  marketingItem: {
    display: "grid",
    gap: "2px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "6px"
  },
  marketingItemTitle: {
    color: "#0f172a",
    fontSize: "11px"
  },
  marketingItemMeta: {
    color: "#475569",
    fontSize: "10px"
  },
  monetizationCard: {
    border: "1px solid #fde68a",
    borderRadius: "10px",
    background: "#fffbeb",
    padding: "10px",
    marginBottom: "10px"
  },
  monetizationTitle: {
    color: "#92400e",
    fontSize: "13px"
  },
  monetizationMeta: {
    color: "#b45309",
    fontSize: "11px",
    fontWeight: 600
  },
  monetizationSummary: {
    margin: "0 0 8px",
    color: "#78350f",
    fontSize: "12px"
  },
  monetizationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "8px"
  },
  monetizationItem: {
    border: "1px solid #fde68a",
    borderRadius: "8px",
    background: "white",
    padding: "8px",
    display: "grid",
    gap: "4px"
  },
  monetizationItemTitle: {
    color: "#78350f",
    fontSize: "12px"
  },
  monetizationItemMeta: {
    color: "#92400e",
    fontSize: "11px"
  },
  monetizationNext: {
    display: "block",
    marginTop: "8px",
    color: "#92400e",
    fontSize: "11px"
  },
  compareWrap: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "10px",
    marginBottom: "10px"
  },
  compareCard: {
    border: "1px solid #dcdcde",
    borderRadius: "10px",
    background: "#f6f7f7",
    padding: "10px",
    display: "grid",
    gap: "6px"
  },
  compareTitle: {
    color: "#1d2327",
    fontSize: "13px"
  },
  compareMeta: {
    color: "#475569",
    fontSize: "11px",
    wordBreak: "break-all"
  },
  compareFrame: {
    width: "100%",
    height: "420px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "white"
  },
  compareHint: {
    color: "#64748b",
    fontSize: "11px"
  },
  pageTabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px"
  },
  pageActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap"
  },
  pageInput: {
    minWidth: "150px",
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "12px"
  },
  pageAddButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  pageDeleteButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  pageTab: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  pageTabActive: {
    background: "#0f172a",
    color: "white",
    border: "1px solid #0f172a",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  imageEditorCard: {
    border: "1px solid #dcdcde",
    borderRadius: "10px",
    background: "#f6f7f7",
    padding: "10px",
    marginBottom: "10px"
  },
  imageEditorTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#1d2327",
    fontSize: "13px"
  },
  imageEditorRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "6px"
  },
  imageScopeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: "8px"
  },
  imageScopeButton: {
    background: "#eef2ff",
    color: "#1e293b",
    border: "1px solid #c7d2fe",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  imageScopeButtonActive: {
    background: "#0f766e",
    color: "#ffffff",
    border: "1px solid #0f766e",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  imageSelect: {
    minWidth: "140px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    background: "white"
  },
  imageUrlInput: {
    flex: 1,
    minWidth: "220px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  imageApplyButton: {
    background: "#2271b1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  imageUploadLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#f0f0f1",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "12px",
    color: "#1d2327",
    cursor: "pointer"
  },
  imageMeta: {
    color: "#475569",
    fontSize: "12px"
  },
  mapEditorCard: {
    border: "1px solid #dcdcde",
    borderRadius: "10px",
    background: "#f6f7f7",
    padding: "10px",
    marginBottom: "10px"
  },
  colorEditorCard: {
    border: "1px solid #dcdcde",
    borderRadius: "10px",
    background: "#f6f7f7",
    padding: "10px",
    marginBottom: "10px"
  },
  colorEditorTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#1d2327",
    fontSize: "13px"
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "8px",
    marginBottom: "8px"
  },
  colorField: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "6px",
    alignItems: "center",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px"
  },
  colorLabel: {
    gridColumn: "1 / span 2",
    fontSize: "12px",
    fontWeight: 600,
    color: "#0f172a"
  },
  colorInput: {
    width: "36px",
    height: "28px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    padding: 0,
    background: "transparent",
    cursor: "pointer"
  },
  colorHex: {
    fontSize: "12px",
    color: "#334155",
    justifySelf: "end"
  },
  colorActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  applyThemeButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  resetThemeButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer"
  },
  typeEditorCard: {
    border: "1px solid #dcdcde",
    borderRadius: "10px",
    background: "#f6f7f7",
    padding: "10px",
    marginBottom: "10px"
  },
  typeEditorTitle: {
    display: "block",
    marginBottom: "8px",
    color: "#1d2327",
    fontSize: "13px"
  },
  typeEditorRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: "8px",
    marginBottom: "8px"
  },
  typeField: {
    display: "grid",
    gap: "6px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "8px"
  },
  typeLabel: {
    fontSize: "12px",
    color: "#334155",
    fontWeight: 600
  },
  typeSelect: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    background: "white"
  },
  typePreview: {
    background: "white",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "8px",
    color: "#0f172a"
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px"
  },
  headerActionsCompact: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    width: "100%"
  },
  domainInput: {
    minWidth: "220px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  domainInputCompact: {
    width: "100%",
    minWidth: 0,
    gridColumn: "1 / -1",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px"
  },
  editActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  editActionsCompact: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "8px",
    width: "100%"
  },
  exportButton: {
    background: "#0369a1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  exportBundleControls: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  },
  exportBundleControlsCompact: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    width: "100%"
  },
  exportFrameworkSelect: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "12px",
    background: "white",
    minWidth: "112px",
  },
  goLiveButton: {
    background: "#f97316",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  addDomainButton: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  verifyDnsButton: {
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  oneClickHostingButton: {
    background: "linear-gradient(135deg,#059669,#16a34a)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700
  },
  publishFlowCard: {
    border: "1px solid #86efac",
    borderRadius: "14px",
    background: "linear-gradient(180deg,#f7fee7 0%,#f0fdf4 100%)",
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  publishFlowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    flexWrap: "wrap"
  },
  publishFlowTitle: {
    display: "block",
    color: "#166534",
    fontSize: "15px"
  },
  publishFlowMeta: {
    color: "#15803d",
    fontSize: "12px",
    lineHeight: 1.5,
    maxWidth: "62ch"
  },
  publishFlowBadgeDraft: {
    borderRadius: "999px",
    padding: "5px 10px",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 700
  },
  publishFlowBadgeLive: {
    borderRadius: "999px",
    padding: "5px 10px",
    background: "#16a34a",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700
  },
  publishFlowPrimaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
    gap: "8px"
  },
  publishFlowSecondaryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  publishFlowPrimaryButton: {
    background: "linear-gradient(135deg,#f97316,#ea580c)",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer"
  },
  publishFlowSecondaryButton: {
    background: "#ffffff",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  publishFlowFacts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: "8px"
  },
  publishFlowFact: {
    border: "1px solid #dcfce7",
    background: "#ffffff",
    borderRadius: "10px",
    padding: "8px 10px",
    color: "#14532d",
    fontSize: "11px",
    lineHeight: 1.4
  },
  republishButton: {
    background: "#0ea5e9",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  unpublishButton: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  editButton: {
    background: "#0f172a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  undoButton: {
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  lockLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: 600
  },
  lockHint: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#475569",
    fontSize: "13px"
  },
  inlineEditToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    background: "linear-gradient(135deg,#ecfeff,#dbeafe)",
    border: "1px solid #7dd3fc",
    borderRadius: "10px",
    padding: "8px 10px",
    marginBottom: "10px"
  },
  inlineFloatingToolbar: {
    position: "fixed",
    zIndex: 30,
    display: "grid",
    gap: "5px",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(59,130,246,0.32)",
    background: "rgba(15,23,42,0.94)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.32)",
    backdropFilter: "blur(10px)"
  },
  inlineFloatingEyebrow: {
    color: "#93c5fd",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "0.08em"
  },
  inlineFloatingTitle: {
    color: "#f8fafc",
    fontSize: "12px",
    lineHeight: 1.35,
    wordBreak: "break-word"
  },
  inlineFloatingValue: {
    color: "#cbd5e1",
    fontSize: "11px",
    lineHeight: 1.4,
    wordBreak: "break-word"
  },
  inlineFloatingActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "4px"
  },
  inlineEditMeta: {
    display: "grid",
    gap: "2px",
    minWidth: "220px"
  },
  inlineEditTitle: {
    color: "#0f172a",
    fontSize: "12px"
  },
  inlineEditHint: {
    color: "#334155",
    fontSize: "11px"
  },
  inlineSmartRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "6px"
  },
  inlineSmartInput: {
    minWidth: "260px",
    flex: 1,
    padding: "6px 9px",
    borderRadius: "8px",
    border: "1px solid #93c5fd",
    background: "rgba(255,255,255,0.85)",
    color: "#0f172a",
    fontSize: "12px"
  },
  inlineSmartRunButton: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  inlineSmartChips: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "5px",
    marginTop: "5px"
  },
  inlineSmartChip: {
    border: "1px solid #93c5fd",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1e3a8a",
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  inlineSmartStatus: {
    color: "#0f172a",
    fontSize: "11px",
    marginTop: "4px"
  },
  inlineAdaptiveMeta: {
    color: "#1e3a8a",
    fontSize: "11px",
    marginTop: "5px",
    fontWeight: 700,
    display: "block"
  },
  inlineAutoApplyRow: {
    marginTop: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    background: "rgba(219,234,254,0.65)",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    padding: "6px 8px"
  },
  inlineAutoApplyMeta: {
    color: "#1e3a8a",
    fontSize: "11px",
    fontWeight: 700
  },
  inlineAutoApplyButton: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer"
  },
  inlineAutoModeToggle: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "6px",
    color: "#0f172a",
    fontSize: "11px",
    fontWeight: 700
  },
  inlineSelectionMeta: {
    color: "#334155",
    fontSize: "11px",
    marginTop: "3px",
    display: "block"
  },
  inlineCheckpointRow: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
    marginTop: "5px"
  },
  inlineCheckpointChip: {
    border: "1px solid #86efac",
    borderRadius: "999px",
    background: "#f0fdf4",
    color: "#166534",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: 700,
    cursor: "pointer"
  },
  inlineSuggestionWrap: {
    marginTop: "6px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: "6px"
  },
  inlineSuggestionItem: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "7px",
    display: "grid",
    gap: "4px"
  },
  inlineSuggestionLabel: {
    color: "#1e3a8a",
    fontSize: "10px",
    fontWeight: 700
  },
  inlineSuggestionText: {
    color: "#0f172a",
    fontSize: "11px",
    lineHeight: 1.35
  },
  inlineSuggestionApply: {
    background: "#0f766e",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    padding: "5px 8px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
    justifySelf: "start"
  },
  inlineEditActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px"
  },
  inlineDirtyBadge: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #f59e0b",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  inlineCleanBadge: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #22c55e",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  inlineModeButton: {
    background: "#0f766e",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  publishSuccess: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#166534",
    fontSize: "14px",
    fontWeight: 600
  },
  publishInfo: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#1e40af",
    fontSize: "14px",
    fontWeight: 600
  },
  publishError: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#b91c1c",
    fontSize: "14px",
    fontWeight: 600
  },
  siteMeta: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600
  },
  hostingSummaryCard: {
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    background: "#ecfdf5",
    padding: "10px",
    marginBottom: "12px",
    display: "grid",
    gap: "7px"
  },
  hostingSummaryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px"
  },
  hostingSummaryTitle: {
    color: "#166534",
    fontSize: "13px"
  },
  hostingSummaryMeta: {
    color: "#15803d",
    fontSize: "11px",
    wordBreak: "break-all"
  },
  hostingBadgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px"
  },
  hostingBadgeDomain: {
    background: "#dcfce7",
    border: "1px solid #86efac",
    color: "#166534",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  hostingBadgeOn: {
    background: "#22c55e",
    border: "1px solid #16a34a",
    color: "white",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  hostingBadgeOff: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    color: "#334155",
    borderRadius: "999px",
    padding: "3px 9px",
    fontSize: "11px",
    fontWeight: 700
  },
  checklistCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    padding: "10px",
    marginBottom: "12px"
  },
  checklistHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#0f172a",
    fontSize: "13px",
    marginBottom: "8px"
  },
  checklistBar: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px"
  },
  checklistFill: {
    height: "100%",
    background: "linear-gradient(90deg,#22c55e,#0ea5e9)",
    borderRadius: "999px"
  },
  checklistSteps: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  checkStepDone: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 600
  },
  checkStepPending: {
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 600
  },
  marketCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "#f8fafc",
    padding: "12px",
    marginBottom: "14px"
  },
  marketHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "10px"
  },
  marketTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#0f172a"
  },
  ecosystemMeta: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#0f766e",
    background: "#d1fae5",
    border: "1px solid #99f6e4",
    borderRadius: "999px",
    padding: "4px 8px"
  },
  ecosystemIntro: {
    margin: "0 0 10px",
    color: "#334155",
    fontSize: "13px"
  },
  marketControls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "10px"
  },
  marketSortSelect: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    background: "white"
  },
  marketToggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#0f172a",
    fontWeight: 600
  },
  tldChips: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "10px"
  },
  tldChip: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer"
  },
  tldChipActive: {
    background: "#0f766e",
    color: "white",
    border: "1px solid #0f766e",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer"
  },
  marketInput: {
    minWidth: "240px",
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  marketSearchButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  marketGhostButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  marketGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px"
  },
  marketItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "10px",
    background: "white"
  },
  marketSub: {
    margin: "4px 0 0",
    color: "#475569",
    fontSize: "12px"
  },
  ecosystemDescription: {
    margin: "6px 0 0",
    color: "#334155",
    fontSize: "12px",
    maxWidth: "420px"
  },
  marketActions: {
    display: "flex",
    gap: "6px"
  },
  marketUseButton: {
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer"
  },
  marketBuyButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "7px 10px",
    cursor: "pointer"
  },
  marketError: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: 600
  },
  purchasedWrap: {
    marginBottom: "10px"
  },
  purchasedTitle: {
    display: "block",
    marginBottom: "6px",
    color: "#0f172a",
    fontSize: "13px"
  },
  purchasedList: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },
  purchasedChip: {
    background: "#dbeafe",
    color: "#1e3a8a",
    border: "1px solid #93c5fd",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
    cursor: "pointer"
  },
  dnsGuide: {
    marginTop: "12px",
    border: "1px solid #bfdbfe",
    background: "#eff6ff",
    borderRadius: "10px",
    padding: "10px"
  },
  ecosystemPublisher: {
    marginTop: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#ffffff",
    padding: "10px"
  },
  ecosystemTextarea: {
    width: "100%",
    minHeight: "70px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    padding: "8px 10px",
    fontSize: "13px",
    marginBottom: "8px",
    resize: "vertical"
  },
  dnsTitle: {
    margin: "0 0 6px",
    fontSize: "14px",
    color: "#1e3a8a"
  },
  dnsText: {
    margin: "0 0 8px",
    fontSize: "13px",
    color: "#1e3a8a"
  },
  dnsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "6px"
  },
  dnsCode: {
    background: "#dbeafe",
    color: "#1e3a8a",
    borderRadius: "6px",
    padding: "4px 6px",
    fontSize: "12px"
  },
  dnsCopyButton: {
    background: "#1d4ed8",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer"
  },
  dnsCopyAllButton: {
    background: "#0f766e",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "12px",
    cursor: "pointer",
    marginTop: "4px"
  },
  dnsCopyMessage: {
    margin: "4px 0 0",
    color: "#1e3a8a",
    fontSize: "12px",
    fontWeight: 600
  },
  saveButton: {
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  cancelButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
  },
  previewEditable: {
    outline: "2px dashed #22c55e",
    outlineOffset: "6px",
    borderRadius: "12px",
    minHeight: "420px",
    cursor: "text",
    padding: "4px"
  },
  error: {
    color: "#fecaca",
    marginTop: "16px",
    textAlign: "center"
  }
};

// Normalize card surfaces across the dashboard with an intentionally bold treatment.
const CARD_KEY_PATTERN = /(^card$|Card$)/;
const BOLD_CARD_BORDER = "2px";
const BOLD_CARD_SHADOW = "0 12px 28px rgba(2, 6, 23, 0.34), 0 0 0 1px rgba(148, 163, 184, 0.18)";
Object.keys(styles).forEach((key) => {
  if (!CARD_KEY_PATTERN.test(key)) return;
  const current = styles[key] || {};
  styles[key] = {
    ...current,
    borderRadius: current.borderRadius || "12px",
    border: String(current.border || "1px solid rgba(255,255,255,0.2)").replace(/^(\d+)px/, BOLD_CARD_BORDER),
    boxShadow: BOLD_CARD_SHADOW,
    padding: current.padding || "9px",
    marginBottom: current.marginBottom || "8px",
    overflow: "visible",
  };
});

["preview", "seoCard", "analyticsDashboardCard", "imageEditorCard", "mapEditorCard", "colorEditorCard", "typeEditorCard", "marketCard", "hostingSummaryCard", "checklistCard"]
  .forEach((key) => {
    if (!styles[key]) return;
    styles[key] = {
      ...styles[key],
      border: String(styles[key].border || "1px solid rgba(255,255,255,0.2)").replace(/^(\d+)px/, BOLD_CARD_BORDER),
      borderRadius: styles[key].borderRadius || "12px",
      boxShadow: BOLD_CARD_SHADOW,
      overflow: "visible",
    };
  });

// Apply global visual polish so the full display looks cohesive and premium.
const BUTTON_KEY_PATTERN = /(Button|button|Tab|tab|Chip|chip|Action|action)$/;
const INPUT_KEY_PATTERN = /(Input|input|Select|select|Textarea|textarea|Field|field)$/;
const TITLE_KEY_PATTERN = /(Title|title|Heading|heading|Hero|hero|subtitle|Intro|Meta|Text|Label|Copy|Hint|Description|desc|Summary)$/;

Object.keys(styles).forEach((key) => {
  const current = styles[key];
  if (!current || typeof current !== "object" || Array.isArray(current)) return;

  const next = {
    ...current,
    transition: current.transition || "all 180ms ease",
  };

  if (TITLE_KEY_PATTERN.test(key)) {
    next.letterSpacing = current.letterSpacing || "-0.01em";
    next.textWrap = current.textWrap || "pretty";
    next.whiteSpace = current.whiteSpace || "normal";
    next.overflowWrap = current.overflowWrap || "anywhere";
    next.wordBreak = current.wordBreak || "break-word";
    next.lineHeight = current.lineHeight || 1.45;
  }

  if (BUTTON_KEY_PATTERN.test(key)) {
    next.fontWeight = current.fontWeight || 700;
    next.borderRadius = current.borderRadius || "10px";
    next.boxShadow = current.boxShadow || "0 8px 22px rgba(15, 23, 42, 0.26)";
    next.transform = current.transform || "translateZ(0)";
  }

  if (INPUT_KEY_PATTERN.test(key)) {
    next.border = String(current.border || "1px solid rgba(148,163,184,0.45)").replace(/^1px/, "2px");
    next.background = current.background || "linear-gradient(180deg, rgba(15,23,42,0.9), rgba(15,23,42,0.82))";
    next.borderRadius = current.borderRadius || "10px";
    next.boxShadow = current.boxShadow || "inset 0 1px 0 rgba(255,255,255,0.08)";
  }

  styles[key] = next;
});


export default styles;
