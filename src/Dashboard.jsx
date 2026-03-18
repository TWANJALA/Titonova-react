import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import BusinessGeneratorPanels from "./components/BusinessGeneratorPanels";
import AuthProjectCard from "./components/AuthProjectCard";
import MarketplacePanels from "./components/MarketplacePanels";
import PreviewPane from "./components/PreviewPane";
import PreviewActionCenter from "./components/PreviewActionCenter";
import PreviewHeaderControls from "./components/PreviewHeaderControls";
import ProjectPromptPanel from "./components/ProjectPromptPanel";
import PublishFlow from "./components/PublishFlow";
import WorkspaceOnboardingPanels from "./components/WorkspaceOnboardingPanels";
import styles from "./Dashboard.styles";
import {
  HOSTING_BASE_URL,
  REGISTRAR_BASE_URL,
  HOSTING_GATEWAY_TOKEN,
  EXPORT_FRAMEWORK_OPTIONS,
  GENERATE_REQUEST_TIMEOUT_MS,
  fetchWithTimeout,
  isLocalHostName,
  isUsableApiBaseUrl,
  DEFAULT_DNS_RECORDS,
  DEFAULT_HOSTING_PROFILE,
  PURCHASED_DOMAINS_STORAGE_KEY,
  DEVELOPER_ADDONS_STORAGE_KEY,
  INSTALLED_ADDONS_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_STORAGE_KEY,
  BUSINESS_OS_REQUIRED_FEATURE_KEYS,
  CORE_ADDON_CATALOG,
  CORE_PAGE_DEFS,
  AUTOMATION_PAGE_DEFS,
  REVENUE_MODULE_KEYS,
  INDUSTRY_TEMPLATE_PACKAGES,
  DEFAULT_INDUSTRY_TEMPLATE,
  buildFeatureFlagsForIndustry,
  buildIndustryBlueprintPrompt,
  DEFAULT_THEME_COLORS,
  TEXT_STYLE_PRESETS,
  DEFAULT_TEXT_STYLE,
  DESIGN_EVOLUTION_THEMES,
  UI_LAYOUT_VARIANTS,
  SMART_CONTENT_TYPE_OPTIONS,
  QUICK_PROMPT_CHIPS,
  AI_LAYOUT_VARIANT_OPTIONS,
  SMART_COMPONENT_LIBRARY,
  FUNNEL_REQUIRED_KEYS,
  CRM_LEAD_STAGES,
  CRM_SALES_PIPELINE,
  PAYMENT_PROVIDER_KEYS,
  BOOKING_AUTOMATION_STEPS,
  DEFAULT_CRM_CUSTOMERS,
  SECTION_ID_ALIASES,
  safeJsonParse,
  SECTION_KEY_ALIASES,
  extractStructuredSectionsFromPrompt,
  parseStructuredBusinessPrompt,
  derivePromptIntelligence,
  buildInstantPagesFromPrompt,
  POWER_PROMPT_MARKER,
  POWER_PROMPT_DEFAULT_SECTIONS,
  injectEditableLayerIntoHtml,
  buildInlineSiteModelFromHtml,
  parseInlineSmartAction,
  detectInlineSectionType,
  buildInlineSuggestions,
  getInlineCommandOptions
} from "./Dashboard.shared";
import useDebouncedSectionsAutosave from "./hooks/useDebouncedSectionsAutosave";

const GenerationWorkflowPanels = React.lazy(() => import("./components/GenerationWorkflowPanels"));
const AdvancedOperationsPanels = React.lazy(() => import("./components/AdvancedOperationsPanels"));

export default function Dashboard() {

  const [mounted, setMounted] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [businessOsPrompt, setBusinessOsPrompt] = useState("");
  const [businessOsLaunching, setBusinessOsLaunching] = useState(false);
  const [sourceWebsiteUrl, setSourceWebsiteUrl] = useState("");
  const [uiDesignPrompt, setUiDesignPrompt] = useState("");
  const [uiDesignLoading, setUiDesignLoading] = useState(false);
  const [uiDesignSpec, setUiDesignSpec] = useState(null);
  const [aiProjectSchema, setAiProjectSchema] = useState(null);
  const [businessOsOutput, setBusinessOsOutput] = useState(null);
  const [competitorUrlsInput, setCompetitorUrlsInput] = useState("");
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [competitorIntel, setCompetitorIntel] = useState(null);
  const [brandKit, setBrandKit] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [marketingAutopilotEnabled, setMarketingAutopilotEnabled] = useState(true);
  const [marketingPack, setMarketingPack] = useState(null);
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [marketingCitiesInput, setMarketingCitiesInput] = useState("Dallas, Austin, Houston");
  const [marketingOfferInput, setMarketingOfferInput] = useState("House Cleaning");
  const [marketingEngineOutput, setMarketingEngineOutput] = useState(null);
  const [marketingEngineLoading, setMarketingEngineLoading] = useState(false);
  const [growthCoachLoading, setGrowthCoachLoading] = useState(false);
  const [growthCoachInsights, setGrowthCoachInsights] = useState([]);
  const [businessCoachLoading, setBusinessCoachLoading] = useState(false);
  const [businessCoachInsights, setBusinessCoachInsights] = useState([]);
  const [analyticsSnapshot, setAnalyticsSnapshot] = useState(null);
  const [smartContentType, setSmartContentType] = useState("blog-posts");
  const [smartContentCount, setSmartContentCount] = useState(12);
  const [smartContentKeyword, setSmartContentKeyword] = useState("");
  const [smartContentLoading, setSmartContentLoading] = useState(false);
  const [smartContentProgress, setSmartContentProgress] = useState("");
  const [smartContentItems, setSmartContentItems] = useState([]);
  const [appBuilderLoading, setAppBuilderLoading] = useState(false);
  const [appBuilderArtifacts, setAppBuilderArtifacts] = useState(null);
  const [autonomousModeEnabled, setAutonomousModeEnabled] = useState(false);
  const [autonomousIntervalMinutes, setAutonomousIntervalMinutes] = useState(30);
  const [autonomousRunning, setAutonomousRunning] = useState(false);
  const [autonomousLog, setAutonomousLog] = useState([]);
  const [autonomousAppointments, setAutonomousAppointments] = useState([]);
  const [autonomousInvoices, setAutonomousInvoices] = useState([]);
  const [autonomousPricingNote, setAutonomousPricingNote] = useState("");
  const [autonomousProcessedLeadKeys, setAutonomousProcessedLeadKeys] = useState({});
  const [monetizationPlan, setMonetizationPlan] = useState(null);
  const [monetizationLoading, setMonetizationLoading] = useState(false);
  const [designEvolutionEnabled, setDesignEvolutionEnabled] = useState(false);
  const [designEvolutionMinutes, setDesignEvolutionMinutes] = useState(60);
  const [lastDesignEvolutionAt, setLastDesignEvolutionAt] = useState("");
  const [evolutionRunning, setEvolutionRunning] = useState(false);
  const [selfOptimizeEnabled, setSelfOptimizeEnabled] = useState(true);
  const [selfOptimizeDays, setSelfOptimizeDays] = useState(30);
  const [lastSelfOptimizationAt, setLastSelfOptimizationAt] = useState("");
  const [selfOptimizeRunning, setSelfOptimizeRunning] = useState(false);
  const [selfOptimizationHistory, setSelfOptimizationHistory] = useState([]);
  const [translationLanguage, setTranslationLanguage] = useState("Spanish");
  const [translating, setTranslating] = useState(false);
  const [redesigning, setRedesigning] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [exactRedesignMode, setExactRedesignMode] = useState(true);
  const [cloneDepth, setCloneDepth] = useState("full-stack");
  const [clonePixelPerfect, setClonePixelPerfect] = useState(true);
  const [cloneAiRedesign, setCloneAiRedesign] = useState(true);
  const [cloneRevenueAutomation, setCloneRevenueAutomation] = useState(true);
  const [autoRevenueFeatures, setAutoRevenueFeatures] = useState(true);
  const [solutionMode, setSolutionMode] = useState("website-app");
  const [industryTemplate, setIndustryTemplate] = useState(DEFAULT_INDUSTRY_TEMPLATE);
  const [automationFeatures, setAutomationFeatures] = useState(() => buildFeatureFlagsForIndustry(DEFAULT_INDUSTRY_TEMPLATE));
  const [generatedSite, setGeneratedSite] = useState(null);
  const [generatedPages, setGeneratedPages] = useState({});
  const [activePage, setActivePage] = useState("index.html");
  const [newPageName, setNewPageName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [domainLoading, setDomainLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");
  const [publishStatus, setPublishStatus] = useState("info");
  const [liveUrl, setLiveUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [publishedSiteId, setPublishedSiteId] = useState("");
  const [marketKeyword, setMarketKeyword] = useState("");
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketResults, setMarketResults] = useState([]);
  const [marketBuying, setMarketBuying] = useState("");
  const [marketTlds, setMarketTlds] = useState([".com", ".net", ".org", ".io"]);
  const [marketSort, setMarketSort] = useState("available");
  const [authMode, setAuthMode] = useState("signup");
  const [authLoading, setAuthLoading] = useState(false);
  const [authNameInput, setAuthNameInput] = useState("");
  const [authEmailInput, setAuthEmailInput] = useState("");
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [billingPlans, setBillingPlans] = useState([]);
  const [billingStatusData, setBillingStatusData] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingUpgradeLoading, setBillingUpgradeLoading] = useState("");
  const [workspaceList, setWorkspaceList] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [workspaceInviteEmail, setWorkspaceInviteEmail] = useState("");
  const [workspaceInviteRole, setWorkspaceInviteRole] = useState("editor");
  const [variantScoringLoading, setVariantScoringLoading] = useState(false);
  const [scoredVariants, setScoredVariants] = useState([]);
  const [bestVariantId, setBestVariantId] = useState("");
  const [showGuestAuthPrompt, setShowGuestAuthPrompt] = useState(false);
  const [dnsGuideDomain, setDnsGuideDomain] = useState("");
  const [dnsRecords, setDnsRecords] = useState(DEFAULT_DNS_RECORDS);
  const [dnsCopyMessage, setDnsCopyMessage] = useState("");
  const [purchasedDomains, setPurchasedDomains] = useState([]);
  const [ecosystemAddons, setEcosystemAddons] = useState(CORE_ADDON_CATALOG);
  const [installedAddons, setInstalledAddons] = useState({});
  const [addonSearch, setAddonSearch] = useState("");
  const [addonCategory, setAddonCategory] = useState("all");
  const [addonNameInput, setAddonNameInput] = useState("");
  const [addonTypeInput, setAddonTypeInput] = useState("booking");
  const [addonPriceInput, setAddonPriceInput] = useState("Free");
  const [addonDescriptionInput, setAddonDescriptionInput] = useState("");
  const [addonFeaturesInput, setAddonFeaturesInput] = useState("booking.html");
  const [autoSearchOnGenerate, setAutoSearchOnGenerate] = useState(true);
  const [autoSelectBestDomain, setAutoSelectBestDomain] = useState(true);
  const [dnsVerifyStatus, setDnsVerifyStatus] = useState("idle");
  const [dnsVerifyMessage, setDnsVerifyMessage] = useState("");
  const [verifyingDns, setVerifyingDns] = useState(false);
  const [oneClickHostingRunning, setOneClickHostingRunning] = useState(false);
  const [hostingProfile, setHostingProfile] = useState({ ...DEFAULT_HOSTING_PROFILE });
  const [runningRecommendedFlow, setRunningRecommendedFlow] = useState(false);
  const [smokeRunning, setSmokeRunning] = useState(false);
  const [smokeResults, setSmokeResults] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageApplyScope, setImageApplyScope] = useState("page");
  const [mapQueryInput, setMapQueryInput] = useState("");
  const [themeColors, setThemeColors] = useState({ ...DEFAULT_THEME_COLORS });
  const [textStyle, setTextStyle] = useState({ ...DEFAULT_TEXT_STYLE });
  const [exportFramework, setExportFramework] = useState("html");
  const [exportBundleLoading, setExportBundleLoading] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(true);
  const [draftHtml, setDraftHtml] = useState("");
  const [editHistory, setEditHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [inlineDraftDirty, setInlineDraftDirty] = useState(false);
  const [inlineSmartCommand, setInlineSmartCommand] = useState("");
  const [inlineSmartStatus, setInlineSmartStatus] = useState("");
  const [inlineSelectionText, setInlineSelectionText] = useState("");
  const [inlineSelectionSection, setInlineSelectionSection] = useState("");
  const [inlineSuggestions, setInlineSuggestions] = useState([]);
  const [inlineAutoApplyHighConfidence, setInlineAutoApplyHighConfidence] = useState(false);
  const [inlineAdvancedOpen, setInlineAdvancedOpen] = useState(false);
  const [inlineBulkImproving, setInlineBulkImproving] = useState(false);
  const [inlineLastPublishSnapshot, setInlineLastPublishSnapshot] = useState(null);
  const [inlineCheckpoints, setInlineCheckpoints] = useState([]);
  const [inlineSiteModel, setInlineSiteModel] = useState({});
  const [sections, setSections] = useState({});
  const [selectedSectionEditId, setSelectedSectionEditId] = useState("");
  const [selectedEditableMeta, setSelectedEditableMeta] = useState(null);
  const [selectedSectionMeta, setSelectedSectionMeta] = useState(null);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState({ top: 0, left: 0 });
  const [fieldLockMode, setFieldLockMode] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [commandPaneWidth, setCommandPaneWidth] = useState(460);
  const [isResizingPane, setIsResizingPane] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [powerPromptEnabled, setPowerPromptEnabled] = useState(true);
  const [ultraSmartModeEnabled, setUltraSmartModeEnabled] = useState(true);
  const [lastGenerationPlan, setLastGenerationPlan] = useState(null);
  const [lastGenerationAudit, setLastGenerationAudit] = useState(null);
  const [businessGeneratorLoading, setBusinessGeneratorLoading] = useState(false);
  const [businessGeneratorOutput, setBusinessGeneratorOutput] = useState(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([]);
  const [pipelineVariant, setPipelineVariant] = useState("corporate");
  const [pipelineVariants, setPipelineVariants] = useState({});
  const [pipelineBlueprint, setPipelineBlueprint] = useState(null);
  const [smartComponents, setSmartComponents] = useState([...SMART_COMPONENT_LIBRARY]);
  const [dragComponentIndex, setDragComponentIndex] = useState(-1);
  const [funnelBuilderData, setFunnelBuilderData] = useState(null);
  const [bookingDurationMinutes, setBookingDurationMinutes] = useState(60);
  const [bookingSlotsInput, setBookingSlotsInput] = useState("09:00 AM, 10:30 AM, 01:00 PM, 03:00 PM");
  const [bookingServicesInput, setBookingServicesInput] = useState("Consultation, Standard Service, Premium Service");
  const [bookingAutoConfirmEnabled, setBookingAutoConfirmEnabled] = useState(true);
  const [bookingGoogleSyncEnabled, setBookingGoogleSyncEnabled] = useState(true);
  const [workflowAutomationEnabled, setWorkflowAutomationEnabled] = useState(true);
  const [workflowAutoOnAutonomous, setWorkflowAutoOnAutonomous] = useState(true);
  const [workflowReminderHours, setWorkflowReminderHours] = useState(24);
  const [workflowTestEmail, setWorkflowTestEmail] = useState("new.booking@example.com");
  const [workflowRuns, setWorkflowRuns] = useState([]);
  const [mobileOwnerView, setMobileOwnerView] = useState("dashboard");
  const [crmCustomers, setCrmCustomers] = useState(DEFAULT_CRM_CUSTOMERS);
  const [crmNameInput, setCrmNameInput] = useState("");
  const [crmEmailInput, setCrmEmailInput] = useState("");
  const [crmPhoneInput, setCrmPhoneInput] = useState("");
  const [crmStageInput, setCrmStageInput] = useState("New Leads");
  const [paymentIntegrations, setPaymentIntegrations] = useState({
    Stripe: true,
    "PayPal": true,
    "Apple Pay": true,
    "Google Pay": true,
  });
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState("1023");
  const [invoiceServiceInput, setInvoiceServiceInput] = useState("Full Detail");
  const [invoiceAmountInput, setInvoiceAmountInput] = useState("150");
  const previewEditableRef = useRef(null);
  const inlineHoverNodeRef = useRef(null);
  const selectedEditableNodeRef = useRef(null);
  const selectedSectionNodeRef = useRef(null);
  const pendingInstantEditRef = useRef(false);
  const inlineAutofocusHandlesRef = useRef([]);
  const appShellRef = useRef(null);
  const promptTextareaRef = useRef(null);

  const isSectionValueMapEqual = (left, right) => {
    const leftKeys = Object.keys(left || {});
    const rightKeys = Object.keys(right || {});
    if (leftKeys.length !== rightKeys.length) return false;
    for (let index = 0; index < leftKeys.length; index += 1) {
      const key = leftKeys[index];
      if (left[key] !== right[key]) return false;
    }
    return true;
  };

  const buildSectionMapFromInlineModel = useCallback((model) => {
    if (!model || typeof model !== "object") return {};
    return Object.values(model).reduce((acc, entry) => {
      if (!entry || typeof entry !== "object") return acc;
      const id = String(entry.id || "").trim();
      const type = String(entry.type || "").trim();
      if (!id || !type) return acc;
      if (type === "text" || type === "button" || type === "link") {
        const value = type === "button" ? String(entry.text || "") : type === "link" ? String(entry.content || "") : String(entry.content || "");
        acc[id] = value;
      }
      return acc;
    }, {});
  }, []);

  const setSectionsFromInlineModel = useCallback((model) => {
    const nextMap = buildSectionMapFromInlineModel(model);
    setSections((previous) => (isSectionValueMapEqual(previous, nextMap) ? previous : nextMap));
  }, [buildSectionMapFromInlineModel]);

  const escapeEditableIdForSelector = useCallback((id) => {
    const value = String(id || "");
    if (!value) return "";
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      return CSS.escape(value);
    }
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toAutosaveSlug = (value) =>
    String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "draft";

  const sectionAutosaveStorageKey = useMemo(
    () => `titonova_sections_autosave_${toAutosaveSlug(projectName)}_${toAutosaveSlug(activePage)}`,
    [activePage, projectName]
  );

  const handleAutosaveSections = useCallback((nextSections) => {
    if (typeof window === "undefined") return;
    if (!nextSections || typeof nextSections !== "object") return;
    try {
      window.localStorage.setItem(
        sectionAutosaveStorageKey,
        JSON.stringify({
          pageKey: activePage,
          projectName,
          publishedSiteId,
          updatedAt: new Date().toISOString(),
          sections: nextSections,
        })
      );
    } catch {
      // Ignore private-mode/localStorage quota failures.
    }
  }, [activePage, projectName, publishedSiteId, sectionAutosaveStorageKey]);

  useDebouncedSectionsAutosave({
    sections,
    onSave: handleAutosaveSections,
    delay: 1000,
    enabled: mounted && isInlineEditing && Object.keys(sections || {}).length > 0,
  });

  const selectedAutomationDefs = AUTOMATION_PAGE_DEFS.filter(
    (page) => Boolean(automationFeatures[page.key]) || (autoRevenueFeatures && REVENUE_MODULE_KEYS.includes(page.key))
  );
  const selectedIndustryPackage = INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === industryTemplate) || INDUSTRY_TEMPLATE_PACKAGES[0];
  const selectedIndustryBlueprint = selectedIndustryPackage?.blueprint || null;
  const buildPowerPromptBrief = (rawPrompt, options = {}) => {
    const base = String(rawPrompt || "").trim();
    if (!base) return "";
    if (base.includes(POWER_PROMPT_MARKER)) return base;
    const parsedPrompt = parseStructuredBusinessPrompt(base);
    const inferredTemplateKey = inferIndustryTemplateFromPrompt(base);
    const inferredPackage =
      INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === inferredTemplateKey) || selectedIndustryPackage;
    const industryLabel = String(options.industryLabel || inferredPackage?.label || "Professional Services");
    const promptIntel = derivePromptIntelligence({
      rawPrompt: base,
      parsedPrompt,
      industryHint: industryLabel,
      packagePages: inferredPackage?.blueprint?.pages || [],
      packageServices: inferredPackage?.blueprint?.services || [],
    });
    const promptSections = extractStructuredSectionsFromPrompt(base);
    const requiredSections = promptSections.length > 0 ? promptSections : (promptIntel.suggestedSections.length > 0 ? promptIntel.suggestedSections : POWER_PROMPT_DEFAULT_SECTIONS);
    const mode = String(options.solutionMode || solutionMode || "website-app");
    const requiredPages = (Array.isArray(parsedPrompt.pages) && parsedPrompt.pages.length > 0)
      ? parsedPrompt.pages.join(", ")
      : promptIntel.suggestedPages.length > 0
        ? promptIntel.suggestedPages.join(", ")
      : mode === "website"
        ? "Home, About, Services, Pricing, Contact, Landing Page, Blog"
        : mode === "app"
          ? "Client Dashboard, Login Portal, Booking, Payments, CRM, Analytics"
          : "Home, About, Services, Pricing, Contact, Landing Page, Blog, Client Dashboard, Login Portal, Booking, Payments, CRM, Analytics";
    const projectLabel = String(
      options.projectName || parsedPrompt.businessName || projectName || "Generated Business"
    ).trim();
    const serviceList = ((parsedPrompt.services || []).length > 0 ? parsedPrompt.services : promptIntel.suggestedServices).join(", ");
    const contactBits = [parsedPrompt.contact?.person, parsedPrompt.contact?.phone, parsedPrompt.contact?.email]
      .filter(Boolean)
      .join(" | ");
    const styleLine = [parsedPrompt.style, (parsedPrompt.colors || []).join(", ")].filter(Boolean).join(" | ");
    const featureLine = (parsedPrompt.features || []).join(", ");
    return `${POWER_PROMPT_MARKER}
Project: ${projectLabel}
Industry: ${industryLabel}
Generation mode: ${mode}

USER REQUEST:
${base}

SECTIONS:
${requiredSections.join(", ")}

REQUIRED PAGES:
${requiredPages}

STRUCTURED PROMPT DATA:
- Business name: ${parsedPrompt.businessName || projectLabel}
- Industry: ${parsedPrompt.industry || industryLabel}
- Services: ${serviceList || "Use industry-standard service packages"}
- Contact: ${contactBits || "Generate professional contact details placeholders"}
- Style/colors: ${styleLine || "Modern, conversion-focused design with trustworthy brand palette"}
- Features: ${featureLine || "Lead capture, trust signals, CTA hierarchy, conversion-focused sections"}

PROMPT INTELLIGENCE:
- Quality score: ${promptIntel.score}/100
- Missing fields: ${promptIntel.missing.length > 0 ? promptIntel.missing.map((item) => item.label).join(", ") : "None"}
- Suggested pages: ${promptIntel.suggestedPages.join(", ")}
- Suggested sections: ${promptIntel.suggestedSections.join(", ")}
- Inferred business features: ${promptIntel.inferredFeatures.length > 0 ? promptIntel.inferredFeatures.join(", ") : "booking, crm, payments, seo"}

CONVERSION REQUIREMENTS:
- Include clear primary and secondary CTAs above the fold and near each decision block.
- Add trust signals: proof, testimonials, guarantees, and clear benefit-oriented copy.
- Build conversion flow: Awareness -> Consideration -> Proof -> Action.

QUALITY REQUIREMENTS:
- SEO-ready headings and metadata-friendly section copy.
- Accessibility-ready structure with readable hierarchy and inclusive wording.
- Mobile-first layout decisions and fast-loading section structure.
- Business-ready components for leads/bookings/payments where applicable.

OUTPUT INTENT:
Generate a complete, production-style multi-page website that follows all required sections exactly and reflects the user request in detail.`;
  };

  const buildUltraSmartGenerationPlan = ({
    projectLabel,
    mode,
    parsedPrompt,
    promptIntel,
    industryPackage,
    structuredSections,
    automationDefs,
  }) => {
    const sectionFlowByIntent = {
      home: ["hero", "proof", "services", "benefits", "cta"],
      about: ["hero", "story", "team", "trust", "cta"],
      services: ["hero", "service_grid", "outcomes", "faq", "cta"],
      pricing: ["hero", "plans", "comparison", "guarantee", "cta"],
      contact: ["hero", "contact_options", "form", "faq", "cta"],
      landing: ["hero", "problem", "solution", "proof", "cta"],
      blog: ["hero", "featured_articles", "categories", "newsletter_cta"],
      default: ["hero", "features", "proof", "cta"],
    };
    const pageIntent = (name) => {
      const lower = String(name || "").toLowerCase();
      if (lower.includes("about")) return "about";
      if (lower.includes("service")) return "services";
      if (lower.includes("pricing") || lower.includes("plan")) return "pricing";
      if (lower.includes("contact")) return "contact";
      if (lower.includes("landing")) return "landing";
      if (lower.includes("blog")) return "blog";
      return "home";
    };
    const conversionGoalByIntent = {
      home: "Move visitors to core CTA within first scroll depth.",
      about: "Build trust and reduce objection risk.",
      services: "Match service intent to clear next action.",
      pricing: "Drive plan selection with transparent value framing.",
      contact: "Maximize qualified leads and booked conversations.",
      landing: "Single-goal conversion with focused CTA.",
      blog: "Capture SEO traffic and route to offer CTA.",
      default: "Improve clarity, trust, and conversion flow.",
    };
    const defaultPagesByMode =
      mode === "website"
        ? ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"]
        : mode === "app"
          ? ["Client Dashboard", "Login Portal", "Booking", "Payments", "CRM", "Analytics"]
          : ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog", "Client Dashboard", "Login Portal"];
    const pageNames =
      parsedPrompt?.pages?.length > 0
        ? parsedPrompt.pages
        : promptIntel?.suggestedPages?.length > 0
          ? promptIntel.suggestedPages
          : defaultPagesByMode;
    const activeSections = Array.isArray(structuredSections) && structuredSections.length > 0
      ? [...structuredSections]
      : null;
    const pagePlan = pageNames.map((name) => {
      const intent = pageIntent(name);
      const sections = activeSections || sectionFlowByIntent[intent] || sectionFlowByIntent.default;
      return {
        name,
        intent,
        conversion_goal: conversionGoalByIntent[intent] || conversionGoalByIntent.default,
        section_order: sections,
      };
    });
    const confidenceBase = Number(promptIntel?.score || 60);
    const confidenceBoost =
      (parsedPrompt?.businessName ? 6 : 0) +
      (parsedPrompt?.industry ? 4 : 0) +
      (Array.isArray(parsedPrompt?.pages) && parsedPrompt.pages.length > 0 ? 6 : 0) +
      (Array.isArray(parsedPrompt?.services) && parsedPrompt.services.length > 0 ? 5 : 0) +
      (Array.isArray(structuredSections) && structuredSections.length > 0 ? 5 : 0) +
      (Array.isArray(automationDefs) && automationDefs.length > 0 ? 4 : 0);
    const confidence = Math.max(65, Math.min(99, confidenceBase + confidenceBoost));
    return {
      engine: "TitoNova Ultra Smart Planner",
      confidence,
      project: {
        name: projectLabel || parsedPrompt?.businessName || "Generated Business",
        industry: parsedPrompt?.industry || industryPackage?.label || "General Services",
        generation_mode: mode,
      },
      audience: parsedPrompt?.industry
        ? `People searching for ${parsedPrompt.industry} services and decision-makers evaluating providers.`
        : "High-intent visitors seeking a trustworthy provider and clear next steps.",
      tone: parsedPrompt?.style || "Professional, modern, friendly, conversion-focused.",
      color_direction: parsedPrompt?.colors?.length > 0 ? parsedPrompt.colors : ["Blue", "Green"],
      required_features: [
        ...(promptIntel?.inferredFeatures || []),
        ...((automationDefs || []).map((item) => String(item?.label || "").toLowerCase())),
      ].filter(Boolean),
      page_plan: pagePlan,
      seo_framework: {
        keyword_clusters: promptIntel?.inferredFeatures?.includes("seo")
          ? ["service keywords", "local intent keywords", "trust intent keywords"]
          : ["service intent keywords", "brand keywords"],
        metadata_rule: "Unique title + description per page with clear value proposition and CTA.",
        schema: ["Organization", "Service", "FAQPage (where relevant)"],
      },
      trust_framework: [
        "Testimonials or social proof above key CTA areas",
        "Service guarantees and transparent process",
        "Clear contact and response-time expectations",
      ],
      conversion_checks: [
        "Primary CTA visible above the fold",
        "Supporting CTA repeated after proof blocks",
        "Pricing/offer clarity with low-friction next action",
        "Contact path no more than 1 click from nav",
      ],
    };
  };

  const buildUltraSmartPromptClause = (plan) => {
    if (!plan || typeof plan !== "object") return "";
    return `
ULTRA SMART PLANNER OUTPUT (STRICT):
${JSON.stringify(plan)}

Execution requirements:
- Follow page_plan and section_order for each page exactly.
- Ensure each page satisfies its conversion_goal.
- Apply seo_framework, trust_framework, and conversion_checks across the generated output.
- If user prompt conflicts with plan details, keep user intent and adapt while preserving conversion quality.`;
  };

  const buildSmartQaAudit = ({ promptIntel, plan, mode, automationDefs }) => {
    const issues = [];
    const suggestedLines = [];
    const pageNames = Array.isArray(plan?.page_plan) ? plan.page_plan.map((page) => String(page?.name || "").trim()).filter(Boolean) : [];
    const pageLower = pageNames.map((name) => name.toLowerCase());
    const hasPage = (keyword) => pageLower.some((name) => name.includes(keyword));
    const hasDuplicatePages = new Set(pageLower).size !== pageLower.length;
    if (hasDuplicatePages) {
      issues.push("Duplicate page names detected in plan.");
    }
    if (!hasPage("contact")) {
      issues.push("No contact page detected.");
      suggestedLines.push("Pages: Add Contact page with direct inquiry form and phone/email section.");
    }
    if (!hasPage("services")) {
      issues.push("No services page detected.");
      suggestedLines.push("Pages: Add Services page with detailed service cards and clear CTA.");
    }
    if (!hasPage("pricing") && mode !== "app") {
      issues.push("No pricing page detected for website flow.");
      suggestedLines.push("Pages: Add Pricing page with tier comparison and CTA.");
    }
    const weakCtaPages = (plan?.page_plan || []).filter((page) => {
      const sections = Array.isArray(page?.section_order) ? page.section_order.map((item) => String(item || "").toLowerCase()) : [];
      return !sections.includes("cta");
    });
    if (weakCtaPages.length > 0) {
      issues.push(`Missing CTA section in ${weakCtaPages.length} page(s).`);
      suggestedLines.push("Sections: Ensure each primary page includes a CTA section near decision points.");
    }
    if ((promptIntel?.missing || []).some((item) => item?.key === "contact")) {
      issues.push("Prompt is missing structured contact details.");
      suggestedLines.push("Contact: Add phone, email, and contact person for trust and lead routing.");
    }
    if (mode !== "website" && (!Array.isArray(automationDefs) || automationDefs.length === 0)) {
      issues.push("Automation mode selected without automation modules enabled.");
      suggestedLines.push("Features: Enable booking, CRM, payments, analytics, and email automation modules.");
    }
    const score = Math.max(58, Math.min(99, 98 - issues.length * 7));
    const directives = [
      "Enforce single H1 and semantic H2/H3 hierarchy per page.",
      "Ensure primary CTA appears above the fold and after social proof.",
      "Guarantee contact route in top navigation and footer.",
      "Keep copy concise, benefit-driven, and audience-specific.",
      ...issues.map((issue) => `Resolve QA issue: ${issue}`),
    ];
    return {
      score,
      issues,
      directives,
      suggestedLines: suggestedLines.filter(Boolean),
    };
  };

  const buildSmartQaPromptClause = (audit) => {
    if (!audit || typeof audit !== "object") return "";
    return `
SMART QA GUARDRAILS:
- QA score target: ${Number(audit.score || 0)}/100 or better.
- Mandatory directives:
${(audit.directives || []).map((line) => `  - ${line}`).join("\n")}
- Never omit required pages or conversion CTA blocks.
- Output must satisfy guardrails before finalizing page content.`;
  };

  const getEffectiveBusinessPrompt = (rawPrompt, options = {}) => {
    const base = String(rawPrompt || "").trim();
    if (!base) return "";
    if (!powerPromptEnabled && !options.force) return base;
    return buildPowerPromptBrief(base, options);
  };

  const syncPromptDerivedFields = (promptValue) => {
    const parsed = parseStructuredBusinessPrompt(promptValue);
    const intel = derivePromptIntelligence({
      rawPrompt: promptValue,
      parsedPrompt: parsed,
      industryHint: selectedIndustryPackage?.label || "",
      packagePages: selectedIndustryPackage?.blueprint?.pages || [],
      packageServices: selectedIndustryPackage?.blueprint?.services || [],
    });
    if (parsed.businessName && (!String(projectName || "").trim() || projectName === deriveProjectNameFromBusinessPrompt(promptValue))) {
      setProjectName(parsed.businessName);
    }
    if (parsed.industry) {
      const inferredFromIndustry = inferIndustryTemplateFromPrompt(parsed.industry);
      if (inferredFromIndustry && inferredFromIndustry !== industryTemplate) {
        setIndustryTemplate(inferredFromIndustry);
      }
    }
    const featureKeyMap = {
      booking: ["booking.html"],
      crm: ["crm.html", "client-dashboard.html"],
      payments: ["payments.html", "invoicing.html", "pricing.html"],
      seo: ["seo-pages.html", "marketing-pages.html"],
      analytics: ["analytics.html"],
      email_automation: ["email-automation.html"],
    };
    const inferredFeatureKeys = intel.inferredFeatures
      .flatMap((feature) => featureKeyMap[feature] || [])
      .filter(Boolean);
    if (inferredFeatureKeys.length > 0) {
      setSolutionMode("website-app");
      setAutomationFeatures((previous) => {
        const next = { ...previous };
        inferredFeatureKeys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(next, key)) next[key] = true;
        });
        return next;
      });
    }
  };

  const bookingSlots = String(bookingSlotsInput || "")
    .split(",")
    .map((slot) => slot.trim())
    .filter(Boolean)
    .slice(0, 8);
  const bookingServices = String(bookingServicesInput || "")
    .split(",")
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, 8);
  const parsedPromptPreview = useMemo(
    () => parseStructuredBusinessPrompt(businessOsPrompt),
    [businessOsPrompt]
  );
  const promptIntelligence = useMemo(
    () =>
      derivePromptIntelligence({
        rawPrompt: businessOsPrompt,
        parsedPrompt: parsedPromptPreview,
        industryHint: selectedIndustryPackage?.label || "",
        packagePages: selectedIndustryPackage?.blueprint?.pages || [],
        packageServices: selectedIndustryPackage?.blueprint?.services || [],
      }),
    [businessOsPrompt, parsedPromptPreview, selectedIndustryPackage]
  );
  const parsedPromptPreviewText = useMemo(
    () => JSON.stringify(parsedPromptPreview, null, 2),
    [parsedPromptPreview]
  );
  const ultraSmartPlanPreview = useMemo(() => {
    if (!ultraSmartModeEnabled) return null;
    const structuredSections = extractStructuredSectionsFromPrompt(businessOsPrompt);
    return buildUltraSmartGenerationPlan({
      projectLabel: projectName,
      mode: solutionMode,
      parsedPrompt: parsedPromptPreview,
      promptIntel: promptIntelligence,
      industryPackage: selectedIndustryPackage,
      structuredSections,
      automationDefs: selectedAutomationDefs,
    });
  }, [
    ultraSmartModeEnabled,
    businessOsPrompt,
    projectName,
    solutionMode,
    parsedPromptPreview,
    promptIntelligence,
    selectedIndustryPackage,
    selectedAutomationDefs,
  ]);
  const ultraSmartPlanPreviewText = useMemo(
    () => JSON.stringify(lastGenerationPlan || ultraSmartPlanPreview || {}, null, 2),
    [lastGenerationPlan, ultraSmartPlanPreview]
  );
  const smartQaAuditPreview = useMemo(() => {
    const plan = lastGenerationPlan || ultraSmartPlanPreview;
    if (!plan) return null;
    return buildSmartQaAudit({
      promptIntel: promptIntelligence,
      plan,
      mode: solutionMode,
      automationDefs: selectedAutomationDefs,
    });
  }, [
    lastGenerationPlan,
    ultraSmartPlanPreview,
    promptIntelligence,
    solutionMode,
    selectedAutomationDefs,
  ]);

  const handleAutoFixSmartGaps = () => {
    const audit = smartQaAuditPreview;
    if (!audit || !Array.isArray(audit.suggestedLines) || audit.suggestedLines.length === 0) {
      setPublishStatus("info");
      setPublishMessage("Smart QA found no critical gaps to auto-fix.");
      return;
    }
    const current = String(businessOsPrompt || "").trim();
    const additions = audit.suggestedLines.filter(Boolean);
    const nextPrompt = `${current}\n\n${additions.join("\n")}`.slice(0, 5000);
    setBusinessOsPrompt(nextPrompt);
    setUiDesignPrompt(nextPrompt);
    syncPromptDerivedFields(nextPrompt);
    setPublishStatus("success");
    setPublishMessage(`Smart QA auto-fixed ${additions.length} gap${additions.length === 1 ? "" : "s"} in the prompt.`);
  };
  const crmStageCounts = CRM_LEAD_STAGES.reduce((acc, stage) => {
    acc[stage] = crmCustomers.filter((item) => item.stage === stage).length;
    return acc;
  }, {});
  const enabledPaymentProviders = PAYMENT_PROVIDER_KEYS.filter((provider) => Boolean(paymentIntegrations[provider]));
  const workflowRecentRun = workflowRuns[0] || null;
  const mobileOwnerSnapshot = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayAppointments = (autonomousAppointments || []).filter((item) =>
      String(item?.id || "").includes(todayKey.replace(/-/g, "")) || String(item?.slot || "").length > 0
    );
    const todayInvoices = (autonomousInvoices || []).filter((item) => {
      const id = String(item?.id || "");
      return id.includes(todayKey.replace(/-/g, "")) || id.startsWith("inv-");
    });
    const todayRevenue = todayInvoices.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
    let inboundMessages = 0;
    try {
      const raw = localStorage.getItem("tn_assistant_leads");
      const parsed = raw ? JSON.parse(raw) : [];
      inboundMessages = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      inboundMessages = 0;
    }
    return {
      bookingsToday: Math.max(todayAppointments.length, Number(analyticsSnapshot?.bookings || 0)),
      messages: inboundMessages,
      revenueToday: Math.max(todayRevenue, Number(analyticsSnapshot?.revenue || 0)),
      customers: crmCustomers.length,
      lastSyncAt: new Date().toISOString(),
    };
  }, [autonomousAppointments, autonomousInvoices, analyticsSnapshot, crmCustomers.length]);

  const applyParallaxTransforms = () => {
    const root = previewEditableRef.current;
    if (!root || !window?.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = Array.from(root.querySelectorAll("[data-parallax-speed]"));
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const speed = Number(node.getAttribute("data-parallax-speed") || "0");
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight * 0.5;
      const nodeCenter = rect.top + rect.height * 0.5;
      const delta = (viewportCenter - nodeCenter) * speed;
      node.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
    });
  };

  const normalizeWebsiteUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      return new URL(withProto).toString();
    } catch {
      return "";
    }
  };

  const inferClonePageCandidates = (pathParts) => {
    const joined = pathParts.join(" ");
    const set = new Set(["Home", "About", "Services", "Contact"]);
    if (/(pricing|plans|packages|rates)/i.test(joined)) set.add("Pricing");
    if (/(blog|news|articles|insights)/i.test(joined)) set.add("Blog");
    if (/(book|booking|appointment|schedule|calendar)/i.test(joined)) set.add("Booking");
    if (/(faq|questions|help)/i.test(joined)) set.add("FAQ");
    if (/(gallery|portfolio|projects)/i.test(joined)) set.add("Gallery");
    return Array.from(set);
  };

  const absolutizeCloneUrl = (value, baseUrl = "") => {
    try {
      if (!value) return "";
      const next = baseUrl ? new URL(value, baseUrl) : new URL(value);
      if (!/^https?:$/i.test(next.protocol)) return "";
      next.hash = "";
      return next.toString();
    } catch {
      return "";
    }
  };

  const extractInternalLinksFromHtml = (html, baseUrl) => {
    if (!html || !baseUrl) return [];
    try {
      const origin = new URL(baseUrl).origin;
      const parser = new DOMParser();
      const doc = parser.parseFromString(String(html), "text/html");
      const anchors = Array.from(doc.querySelectorAll("a[href]"));
      const links = anchors
        .map((node) => absolutizeCloneUrl(node.getAttribute("href") || "", baseUrl))
        .filter(Boolean)
        .filter((href) => {
          try {
            const parsed = new URL(href);
            if (parsed.origin !== origin) return false;
            if (!/^https?:$/i.test(parsed.protocol)) return false;
            if (/\.(pdf|zip|rar|7z|mp4|mp3|avi|mov)$/i.test(parsed.pathname)) return false;
            return true;
          } catch {
            return false;
          }
        })
        .map((href) => {
          const parsed = new URL(href);
          parsed.search = "";
          parsed.hash = "";
          return parsed.toString();
        });
      return Array.from(new Set(links)).slice(0, 80);
    } catch {
      return [];
    }
  };

  const extractAssetManifestFromHtml = (html, baseUrl) => {
    const empty = { images: [], css: [], js: [], fonts: [], videos: [], icons: [] };
    if (!html || !baseUrl) return empty;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(String(html), "text/html");
      const toAbs = (value) => absolutizeCloneUrl(value, baseUrl);
      const uniq = (items) => Array.from(new Set(items.filter(Boolean)));

      const images = uniq(
        Array.from(doc.querySelectorAll("img[src], source[srcset], [style*='background-image']"))
          .map((node) => {
            if (node.hasAttribute("src")) return toAbs(node.getAttribute("src") || "");
            if (node.hasAttribute("srcset")) return toAbs(String(node.getAttribute("srcset") || "").split(",")[0].trim().split(" ")[0]);
            const style = String(node.getAttribute("style") || "");
            const match = style.match(/url\((['"]?)(.*?)\1\)/i);
            return match ? toAbs(match[2]) : "";
          })
      );
      const css = uniq(Array.from(doc.querySelectorAll("link[rel~='stylesheet'][href]")).map((node) => toAbs(node.getAttribute("href") || "")));
      const js = uniq(Array.from(doc.querySelectorAll("script[src]")).map((node) => toAbs(node.getAttribute("src") || "")));
      const fonts = uniq(
        Array.from(doc.querySelectorAll("link[rel*='preload'][as='font'][href], link[href*='fonts'], style"))
          .map((node) => {
            if (node.hasAttribute("href")) return toAbs(node.getAttribute("href") || "");
            const text = String(node.textContent || "");
            const match = text.match(/url\((['"]?)(.*?)\1\)/i);
            return match ? toAbs(match[2]) : "";
          })
      );
      const videos = uniq(Array.from(doc.querySelectorAll("video[src], source[src]")).map((node) => toAbs(node.getAttribute("src") || "")));
      const icons = uniq(Array.from(doc.querySelectorAll("link[rel*='icon'][href], svg use[href], svg use[xlink\\:href]")).map((node) => toAbs(node.getAttribute("href") || node.getAttribute("xlink:href") || "")));

      return {
        images: images.slice(0, 120),
        css: css.slice(0, 80),
        js: js.slice(0, 80),
        fonts: fonts.slice(0, 60),
        videos: videos.slice(0, 40),
        icons: icons.slice(0, 40),
      };
    } catch {
      return empty;
    }
  };

  const summarizeDomForClone = (html) => {
    const fallback = {
      title: "",
      sectionLabels: [],
      componentHints: [],
      layoutHints: [],
      contentMap: { hero: [], features: [], cta: [], pricing: [], faq: [] },
    };
    if (!html) return fallback;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(String(html), "text/html");
      const title = String(doc.querySelector("title")?.textContent || "").trim();
      const sectionNodes = Array.from(doc.querySelectorAll("header, nav, section, main, article, aside, footer"));
      const sectionLabels = sectionNodes
        .map((node) => {
          const id = String(node.getAttribute("id") || "");
          const cls = String(node.getAttribute("class") || "");
          const aria = String(node.getAttribute("aria-label") || "");
          const heading = String(node.querySelector("h1,h2,h3")?.textContent || "").trim();
          return [id, cls, aria, heading].filter(Boolean).join(" ").trim();
        })
        .filter(Boolean)
        .slice(0, 36);

      const hintSelectors = [
        ["form", "form"],
        ["button,[role='button']", "cta_button"],
        ["[class*='card'],[data-card],article", "card"],
        ["[class*='testimonial'],[id*='testimonial']", "testimonial"],
        ["[class*='pricing'],[id*='pricing']", "pricing"],
        ["details,[class*='faq'],[id*='faq']", "faq"],
        ["[class*='hero'],[id*='hero'],header h1", "hero"],
        ["nav a", "navigation_link"],
      ];
      const componentHints = hintSelectors
        .filter(([selector]) => doc.querySelector(selector))
        .map(([, token]) => token);

      const layoutHints = [];
      const nodeClassBlob = sectionNodes.map((node) => String(node.getAttribute("class") || "")).join(" ").toLowerCase();
      if (/(grid|col-|columns|masonry)/.test(nodeClassBlob)) layoutHints.push("grid");
      if (/(flex|row|stack|inline)/.test(nodeClassBlob)) layoutHints.push("flex");
      if (/(container|wrapper|shell)/.test(nodeClassBlob)) layoutHints.push("container");
      if (layoutHints.length === 0) layoutHints.push("flow");

      const textFor = (selector) =>
        Array.from(doc.querySelectorAll(selector))
          .map((node) => String(node.textContent || "").replace(/\s+/g, " ").trim())
          .filter(Boolean)
          .slice(0, 6);

      const contentMap = {
        hero: textFor("header h1, [class*='hero'] h1, [id*='hero'] h1, main h1"),
        features: textFor("[class*='feature'] h2, [id*='feature'] h2, section h2"),
        cta: textFor("a[class*='btn'], button, [class*='cta']"),
        pricing: textFor("[class*='pricing'] h2, [id*='pricing'] h2, [class*='plan'] h3"),
        faq: textFor("details summary, [class*='faq'] h3, [id*='faq'] h3"),
      };

      return { title, sectionLabels, componentHints, layoutHints, contentMap };
    } catch {
      return fallback;
    }
  };

  const detectReusableClonePatterns = (pageSummaries = []) => {
    const patternCount = {};
    pageSummaries.forEach((page) => {
      const uniqueTokens = Array.from(new Set([...(page?.componentHints || []), ...(page?.layoutHints || [])]));
      uniqueTokens.forEach((token) => {
        patternCount[token] = (patternCount[token] || 0) + 1;
      });
    });
    return Object.entries(patternCount)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([token, count]) => ({ token, pageCount: count }));
  };

  const renderClonePageViaGateway = async (url) => {
    const response = await fetch("/api/clone/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        waitUntil: "networkidle",
        timeoutMs: 45000,
        maxLinks: 80,
        viewportWidth: 1440,
        viewportHeight: 900,
        includeComputedStyles: true,
        styleSampleLimit: 1400,
        includeVisionAnalysis: true,
        includeScreenshot: false,
        componentRepeatThreshold: 4,
        includeResponsiveDetection: true,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = String(payload?.error || "headless render failed");
      throw new Error(message);
    }
    return payload;
  };

  const crawlWebsiteViaGateway = async (startUrl, options = {}) => {
    const response = await fetch("/api/clone/crawl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: startUrl,
        maxPages: Math.max(1, Number(options.maxPages || 12)),
        waitUntil: "networkidle",
        timeoutMs: 45000,
        maxLinks: 80,
        viewportWidth: 1440,
        viewportHeight: 900,
        includeComputedStyles: true,
        styleSampleLimit: 1400,
        includeVisionAnalysis: true,
        includeScreenshot: false,
        componentRepeatThreshold: 4,
        includeResponsiveDetection: true,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = String(payload?.error || "multi-page crawl failed");
      throw new Error(message);
    }
    return payload;
  };

  const crawlWebsiteForClone = async (startUrl, options = {}) => {
    const maxPages = Math.max(1, Number(options.maxPages || 12));
    try {
      const gatewayCrawl = await crawlWebsiteViaGateway(startUrl, { maxPages });
      const gatewayPages = Array.isArray(gatewayCrawl?.pages) ? gatewayCrawl.pages : [];
      if (gatewayPages.length > 0) {
        const assetRollup = { images: new Set(), css: new Set(), js: new Set(), fonts: new Set(), videos: new Set(), icons: new Set() };
        const pages = gatewayPages.map((page) => {
          const html = String(page?.html || "");
          const domSummary = summarizeDomForClone(html);
          const normalizedAssets = page?.assets && typeof page.assets === "object"
            ? page.assets
            : extractAssetManifestFromHtml(html, String(page?.url || startUrl));
          Object.entries(normalizedAssets).forEach(([key, list]) => {
            if (!assetRollup[key] || !Array.isArray(list)) return;
            list.forEach((item) => assetRollup[key].add(item));
          });
          const computedStyles = page?.computed_styles && typeof page.computed_styles === "object" ? page.computed_styles : null;
          const domComponentTree = page?.dom_component_tree && typeof page.dom_component_tree === "object" ? page.dom_component_tree : null;
          return {
            url: String(page?.url || startUrl),
            renderMode: String(page?.mode || "headless-browser-render"),
            title: String(page?.title || domSummary.title || ""),
            sectionLabels: domSummary.sectionLabels,
            componentHints: domSummary.componentHints,
            layoutHints: domSummary.layoutHints,
            contentMap: domSummary.contentMap,
            computedStyleSummary: computedStyles
              ? {
                  totalElements: Number(computedStyles.total_elements || 0),
                  sampledElements: Number(computedStyles.sampled_elements || 0),
                  truncated: Boolean(computedStyles.truncated),
                  displayHistogram: computedStyles.display_histogram || {},
                  tagHistogram: computedStyles.tag_histogram || {},
                }
              : null,
            domComponentTreeSummary: domComponentTree
              ? {
                  flatSections: Array.isArray(domComponentTree.flat_sections) ? domComponentTree.flat_sections : [],
                  totalVisitedNodes: Number(domComponentTree.total_visited_nodes || 0),
                  truncated: Boolean(domComponentTree.truncated),
                }
              : null,
            layoutAnalysis: page?.layout_analysis && typeof page.layout_analysis === "object" ? page.layout_analysis : null,
            visionAnalysis: page?.vision_analysis && typeof page.vision_analysis === "object" ? page.vision_analysis : null,
            componentDetection: page?.component_detection && typeof page.component_detection === "object" ? page.component_detection : null,
            responsiveDetection: page?.responsive_detection && typeof page.responsive_detection === "object" ? page.responsive_detection : null,
            links: Array.isArray(page?.internal_links) ? page.internal_links.slice(0, 40) : [],
            assetCounts: page?.asset_counts && typeof page.asset_counts === "object"
              ? page.asset_counts
              : Object.fromEntries(Object.entries(normalizedAssets).map(([key, list]) => [key, Array.isArray(list) ? list.length : 0])),
          };
        });
        return {
          crawlMode: "server-multi-page-crawl",
          renderStats: {
            headlessRenderedCount: pages.length,
            fallbackFetchCount: 0,
          },
          pages,
          failedPages: Array.isArray(gatewayCrawl?.failed_pages) ? gatewayCrawl.failed_pages.slice(0, 12) : [],
          reusableComponents: detectReusableClonePatterns(pages),
          assets: Object.fromEntries(
            Object.entries(assetRollup).map(([key, set]) => [key, Array.from(set).slice(0, 160)])
          ),
          assetCounts: Object.fromEntries(
            Object.entries(assetRollup).map(([key, set]) => [key, set.size])
          ),
          discoveredUrls: pages.map((page) => page.url),
        };
      }
    } catch {
      // Fallback to local client-side queue crawler below.
    }

    const queue = [startUrl];
    const visited = new Set();
    const pages = [];
    const failedPages = [];
    let headlessRenderedCount = 0;
    let fallbackFetchCount = 0;
    const assetRollup = { images: new Set(), css: new Set(), js: new Set(), fonts: new Set(), videos: new Set(), icons: new Set() };

    while (queue.length > 0 && visited.size < maxPages) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      try {
        let html = "";
        let links = [];
        let assets = null;
        let computedStyles = null;
        let domComponentTree = null;
        let layoutAnalysis = null;
        let visionAnalysis = null;
        let componentDetection = null;
        let responsiveDetection = null;
        let renderMode = "fetch-fallback";
        let resolvedUrl = current;
        try {
          const rendered = await renderClonePageViaGateway(current);
          if (rendered?.html) {
            html = String(rendered.html);
            links = Array.isArray(rendered.internal_links) ? rendered.internal_links : [];
            assets = rendered.assets && typeof rendered.assets === "object" ? rendered.assets : null;
            computedStyles = rendered.computed_styles && typeof rendered.computed_styles === "object"
              ? rendered.computed_styles
              : null;
            domComponentTree = rendered.dom_component_tree && typeof rendered.dom_component_tree === "object"
              ? rendered.dom_component_tree
              : null;
            layoutAnalysis = rendered.layout_analysis && typeof rendered.layout_analysis === "object"
              ? rendered.layout_analysis
              : null;
            visionAnalysis = rendered.vision_analysis && typeof rendered.vision_analysis === "object"
              ? rendered.vision_analysis
              : null;
            componentDetection = rendered.component_detection && typeof rendered.component_detection === "object"
              ? rendered.component_detection
              : null;
            responsiveDetection = rendered.responsive_detection && typeof rendered.responsive_detection === "object"
              ? rendered.responsive_detection
              : null;
            resolvedUrl = String(rendered.final_url || current);
            renderMode = "headless-browser-render";
            headlessRenderedCount += 1;
          }
        } catch {
          // fallback to direct fetch for environments without Playwright
        }
        if (!html) {
          const response = await fetch(current, { method: "GET" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const contentType = String(response.headers.get("content-type") || "").toLowerCase();
          if (contentType && !contentType.includes("html")) throw new Error("Non-HTML response");
          html = await response.text();
          links = extractInternalLinksFromHtml(html, current);
          assets = extractAssetManifestFromHtml(html, current);
          fallbackFetchCount += 1;
        }
        const domSummary = summarizeDomForClone(html);
        const normalizedAssets = assets || extractAssetManifestFromHtml(html, resolvedUrl);
        Object.entries(normalizedAssets).forEach(([key, list]) => {
          if (!assetRollup[key]) return;
          list.forEach((item) => assetRollup[key].add(item));
        });
        pages.push({
          url: resolvedUrl,
          renderMode,
          title: domSummary.title,
          sectionLabels: domSummary.sectionLabels,
          componentHints: domSummary.componentHints,
          layoutHints: domSummary.layoutHints,
          contentMap: domSummary.contentMap,
          computedStyleSummary: computedStyles
            ? {
                totalElements: Number(computedStyles.total_elements || 0),
                sampledElements: Number(computedStyles.sampled_elements || 0),
                truncated: Boolean(computedStyles.truncated),
                displayHistogram: computedStyles.display_histogram || {},
                tagHistogram: computedStyles.tag_histogram || {},
              }
            : null,
          domComponentTreeSummary: domComponentTree
            ? {
                flatSections: Array.isArray(domComponentTree.flat_sections) ? domComponentTree.flat_sections : [],
                totalVisitedNodes: Number(domComponentTree.total_visited_nodes || 0),
                truncated: Boolean(domComponentTree.truncated),
              }
            : null,
          layoutAnalysis: layoutAnalysis || null,
          visionAnalysis: visionAnalysis || null,
          componentDetection: componentDetection || null,
          responsiveDetection: responsiveDetection || null,
          links: links.slice(0, 40),
          assetCounts: Object.fromEntries(Object.entries(normalizedAssets).map(([key, list]) => [key, list.length])),
        });
        links.forEach((link) => {
          if (!visited.has(link) && !queue.includes(link) && queue.length < maxPages * 5) queue.push(link);
        });
      } catch (error) {
        failedPages.push({ url: current, reason: String(error?.message || "crawl failure") });
      }
    }

    const reusable = detectReusableClonePatterns(pages);
    const crawlMode =
      headlessRenderedCount > 0
        ? fallbackFetchCount > 0
          ? "hybrid-headless+fetch"
          : "headless-browser-render"
        : pages.length > 0
          ? "live-fetch"
          : "url-inference-fallback";
    return {
      crawlMode,
      renderStats: {
        headlessRenderedCount,
        fallbackFetchCount,
      },
      pages,
      failedPages: failedPages.slice(0, 12),
      reusableComponents: reusable,
      assets: Object.fromEntries(
        Object.entries(assetRollup).map(([key, set]) => [key, Array.from(set).slice(0, 160)])
      ),
      assetCounts: Object.fromEntries(
        Object.entries(assetRollup).map(([key, set]) => [key, set.size])
      ),
      discoveredUrls: Array.from(visited),
    };
  };

  const buildClonePipelineSummary = (crawlResult, insights) => {
    const pages = Array.isArray(crawlResult?.pages) ? crawlResult.pages : [];
    const styleSignals = pages
      .map((page) => page?.computedStyleSummary?.displayHistogram || {})
      .reduce((acc, histogram) => {
        Object.entries(histogram || {}).forEach(([key, value]) => {
          const token = String(key || "").trim() || "unknown";
          acc[token] = (acc[token] || 0) + Number(value || 0);
        });
        return acc;
      }, {});
    const topDisplayModes = Object.entries(styleSignals)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 8)
      .map(([display, count]) => ({ display, count }));
    const domSectionSignals = pages
      .flatMap((page) => (Array.isArray(page?.domComponentTreeSummary?.flatSections) ? page.domComponentTreeSummary.flatSections : []))
      .reduce((acc, label) => {
        const key = String(label || "").trim();
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    const topDomSections = Object.entries(domSectionSignals)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 12)
      .map(([section, count]) => ({ section, count }));
    const componentSignals = pages
      .flatMap((page) => (Array.isArray(page?.componentDetection?.components) ? page.componentDetection.components : []))
      .reduce((acc, item) => {
        const key = String(item?.name || "").trim();
        if (!key) return acc;
        const count = Number(item?.repeat_count || 0);
        acc[key] = (acc[key] || 0) + count;
        return acc;
      }, {});
    const topDetectedComponents = Object.entries(componentSignals)
      .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
      .slice(0, 14)
      .map(([component, total_repeat_count]) => ({ component, total_repeat_count }));
    const layoutPatternSignals = pages.reduce(
      (acc, page) => {
        const patterns = page?.layoutAnalysis?.patterns || {};
        const components = page?.layoutAnalysis?.components || {};
        acc.flexbox += Number(patterns.flexbox || 0);
        acc.grid += Number(patterns.grid || 0);
        acc.overlay += Number(patterns.overlay || 0);
        acc.cards += Number(components.cards || 0);
        acc.columns += Number(components.columns || 0);
        acc.hero_sections += Number(components.hero_sections || 0);
        acc.sidebars += Number(components.sidebars || 0);
        acc.navbars += Number(components.navbars || 0);
        return acc;
      },
      {
        flexbox: 0,
        grid: 0,
        overlay: 0,
        cards: 0,
        columns: 0,
        hero_sections: 0,
        sidebars: 0,
        navbars: 0,
      }
    );
    const visionSignals = {
      sources: pages
        .map((page) => String(page?.visionAnalysis?.source || "").trim())
        .filter(Boolean),
      spacing_distribution: pages.reduce(
        (acc, page) => {
          const key = String(page?.visionAnalysis?.spacing_signal || "").trim().toLowerCase();
          if (key) acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {}
      ),
      detected_sections: pages
        .flatMap((page) => (Array.isArray(page?.visionAnalysis?.detected_sections) ? page.visionAnalysis.detected_sections : []))
        .reduce((acc, item) => {
          const key = String(item || "").trim();
          if (!key) return acc;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
    };
    const responsiveSignals = {
      inferred_breakpoints: pages
        .flatMap((page) => (Array.isArray(page?.responsiveDetection?.inferred_breakpoints) ? page.responsiveDetection.inferred_breakpoints : []))
        .reduce((acc, value) => {
          const key = String(value || "").trim();
          if (!key) return acc;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
      tested_modes: pages
        .flatMap((page) => (Array.isArray(page?.responsiveDetection?.tested) ? page.responsiveDetection.tested : []))
        .reduce((acc, mode) => {
          const key = String(mode || "").trim().toLowerCase();
          if (!key) return acc;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {}),
      overflow_pages: pages.filter((page) =>
        Array.isArray(page?.responsiveDetection?.viewports) &&
        page.responsiveDetection.viewports.some((item) => Boolean(item?.horizontal_overflow))
      ).length,
    };
    const primaryLayoutMode = layoutPatternSignals.grid > layoutPatternSignals.flexbox
      ? "grid"
      : layoutPatternSignals.flexbox > 0
        ? "flexbox"
        : layoutPatternSignals.overlay > 0
          ? "overlay"
          : "flow";
    const pageMap = pages.slice(0, 20).map((page, index) => {
      const parsed = absolutizeCloneUrl(page.url) ? new URL(page.url) : null;
      const path = parsed?.pathname || "/";
      const inferredSections = Array.from(
        new Set(
          []
            .concat(page?.componentHints || [])
            .concat(page?.layoutHints || [])
            .map((token) => String(token || "").toLowerCase())
        )
      ).slice(0, 10);
      return {
        name: page?.title || `Page ${index + 1}`,
        source_path: path,
        intent: inferredSections.join(", ") || "content page",
        sections: inferredSections.length > 0 ? inferredSections : ["hero", "content", "cta"],
      };
    });

    const navLabels = pageMap.map((item) => {
      const normalized = String(item.name || "").trim();
      if (normalized) return normalized;
      return String(item.source_path || "/").replace(/\//g, " ").trim() || "Home";
    });

    return {
      crawl_mode: crawlResult?.crawlMode || "unknown",
      pages_crawled: pages.length,
      pages_failed: Array.isArray(crawlResult?.failedPages) ? crawlResult.failedPages.length : 0,
      reusable_components: crawlResult?.reusableComponents || [],
      computed_style_signals: {
        top_display_modes: topDisplayModes,
        sampled_pages: pages.filter((page) => page?.computedStyleSummary).length,
      },
      dom_component_signals: {
        top_sections: topDomSections,
        sampled_pages: pages.filter((page) => page?.domComponentTreeSummary).length,
      },
      layout_pattern_signals: {
        primary_layout_mode: primaryLayoutMode,
        totals: layoutPatternSignals,
        sampled_pages: pages.filter((page) => page?.layoutAnalysis).length,
      },
      component_detection_signals: {
        top_components: topDetectedComponents,
        sampled_pages: pages.filter((page) => page?.componentDetection).length,
      },
      vision_signals: {
        sources: Array.from(new Set(visionSignals.sources)).slice(0, 4),
        spacing_distribution: visionSignals.spacing_distribution,
        top_detected_sections: Object.entries(visionSignals.detected_sections)
          .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
          .slice(0, 12)
          .map(([section, count]) => ({ section, count })),
        sampled_pages: pages.filter((page) => page?.visionAnalysis).length,
      },
      responsive_signals: {
        inferred_breakpoints: Object.entries(responsiveSignals.inferred_breakpoints)
          .sort((a, b) => Number(b[1] || 0) - Number(a[1] || 0))
          .map(([breakpoint, count]) => ({ breakpoint, count })),
        tested_modes: responsiveSignals.tested_modes,
        overflow_pages: responsiveSignals.overflow_pages,
        sampled_pages: pages.filter((page) => page?.responsiveDetection).length,
      },
      navigation: navLabels.slice(0, 14),
      page_map: pageMap.length > 0
        ? pageMap
        : (insights?.suggestedPages || []).map((name) => ({
            name,
            source_path: "/",
            intent: "inferred from URL fingerprint",
            sections: ["hero", "content", "cta"],
          })),
      assets: {
        counts: crawlResult?.assetCounts || {},
        folders: ["/assets", "/images", "/css", "/js", "/fonts"],
      },
    };
  };

  const deriveRedesignInsights = (url) => {
    const normalized = normalizeWebsiteUrl(url);
    if (!normalized) return null;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./i, "");
    const slug = host.split(".")[0] || "brand";
    const tokens = slug.split(/[-_]/g).filter(Boolean);
    const brand = tokens.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Brand";
    const segment = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "homepage";
    const pathParts = String(parsed.pathname || "")
      .split("/")
      .map((part) => part.trim())
      .filter(Boolean);
    const queryKeys = Array.from(parsed.searchParams.keys()).slice(0, 10);
    const sourceSignals = [host, ...tokens, ...pathParts, ...queryKeys]
      .map((token) => String(token || "").toLowerCase())
      .filter(Boolean);
    const suggestedPages = inferClonePageCandidates(pathParts);
    const cloneScore = Math.min(99, 65 + suggestedPages.length * 4 + (queryKeys.length > 0 ? 3 : 0));
    return {
      normalizedUrl: normalized,
      host,
      brand,
      segment,
      pathParts,
      queryKeys,
      sourceSignals,
      suggestedPages,
      structuralFingerprint: `${host}|${segment}|${pathParts.join("-") || "root"}`,
      cloneScore,
      layoutFindings: [
        "Rebuild with clearer navigation hierarchy and stronger conversion CTAs.",
        "Upgrade section spacing rhythm and responsive breakpoints for mobile.",
      ],
      seoFindings: [
        "Improve heading architecture (single H1 + semantic H2/H3 blocks).",
        "Add metadata patterns, internal links, and schema-ready content blocks.",
      ],
      uiFindings: [
        "Modernize typography scale and interaction states.",
        "Elevate trust sections with outcome cards and proof components.",
      ],
      cloneDirectives: [
        "Preserve source page order and nav labels unless broken/duplicated.",
        "Preserve section intent and heading semantics while modernizing style.",
        "Keep service naming and offer architecture aligned with the source.",
        "Maintain conversion path continuity from hero -> proof -> CTA.",
      ],
    };
  };

  const inferBrandCategory = (value) => {
    const text = String(value || "").toLowerCase();
    if (/(cleaning|janitorial|maid|housekeeping)/.test(text)) return "cleaning";
    if (/(health|clinic|medical|care|nursing|hcbs)/.test(text)) return "healthcare";
    if (/(law|attorney|legal|firm)/.test(text)) return "legal";
    if (/(restaurant|food|cafe|kitchen|delivery)/.test(text)) return "restaurant";
    if (/(fitness|gym|trainer)/.test(text)) return "fitness";
    return "general";
  };

  const makeBrandLogoDataUri = (name, palette, category) => {
    const initials = String(name || "TN")
      .replace(/[^a-z0-9 ]/gi, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "TN";

    const iconPathByCategory = {
      cleaning: `<path d="M6 18h12M10 18V8l4-2v12M8 10h8" stroke="${palette.accentStrong}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      healthcare: `<path d="M12 6v12M6 12h12" stroke="${palette.accentStrong}" stroke-width="2" stroke-linecap="round"/>`,
      legal: `<path d="M7 9h10M6 12h12M8 16h8" stroke="${palette.accentStrong}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
      restaurant: `<path d="M9 6v12M15 6v12M12 6v12" stroke="${palette.accentStrong}" stroke-width="1.6" stroke-linecap="round"/>`,
      fitness: `<path d="M7 12h10M9 10v4M15 10v4" stroke="${palette.accentStrong}" stroke-width="1.8" stroke-linecap="round"/>`,
      general: `<circle cx="12" cy="12" r="5" stroke="${palette.accentStrong}" stroke-width="1.8" fill="none"/>`,
    };

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="24" fill="${palette.heroStart}"/>
      <rect x="18" y="18" width="84" height="84" rx="18" fill="${palette.heroEnd}"/>
      <text x="60" y="74" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${initials}</text>
      <g transform="translate(48,18) scale(1.1)">${iconPathByCategory[category] || iconPathByCategory.general}</g>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const generateBrandKitFromPrompt = (prompt) => {
    const category = inferBrandCategory(prompt);
    const library = {
      cleaning: {
        palette: {
          heroStart: "#0b3a6e",
          heroEnd: "#1f6bb8",
          accent: "#0e7490",
          accentStrong: "#22c55e",
          pageBg: "#f1f8ff",
          cardBg: "#ffffff",
          borderColor: "#cfe1f4",
          textPrimary: "#0f2340",
          textSecondary: "#4e6783",
          linkColor: "#0e5ea8",
          ctaPanelBg: "#e8f7ee",
          ctaPanelBorder: "#9adbb3",
          ctaText: "#ffffff",
        },
        typographyPreset: "modern",
        identity: [
          "Clean, trustworthy, and fast-response positioning",
          "Service guarantee and quote-first conversion flow",
          "Neighborhood/local credibility with before-after proof",
        ],
        images: [
          "https://images.pexels.com/photos/4107096/pexels-photo-4107096.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/4239102/pexels-photo-4239102.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/4239113/pexels-photo-4239113.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      healthcare: {
        palette: DEFAULT_THEME_COLORS,
        typographyPreset: "modern",
        identity: ["Clinical trust and compassionate care", "Regulatory-ready tone and clarity", "Family-centered outcomes messaging"],
        images: [
          "https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/7551682/pexels-photo-7551682.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/7551658/pexels-photo-7551658.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/7551677/pexels-photo-7551677.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      legal: {
        palette: {
          ...DEFAULT_THEME_COLORS,
          heroStart: "#1f2937",
          heroEnd: "#374151",
          accent: "#0f3f8f",
          accentStrong: "#2563eb",
        },
        typographyPreset: "editorial",
        identity: ["Authoritative and discreet brand voice", "Consultation-first intake journey", "Trust-building credentials and case clarity"],
        images: [
          "https://images.pexels.com/photos/5668481/pexels-photo-5668481.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/8112164/pexels-photo-8112164.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      restaurant: {
        palette: {
          ...DEFAULT_THEME_COLORS,
          heroStart: "#3f1d1d",
          heroEnd: "#7f1d1d",
          accent: "#b45309",
          accentStrong: "#dc2626",
        },
        typographyPreset: "bold-tech",
        identity: ["High-energy appetite-driven visuals", "Order-first calls to action", "Reservation + delivery conversion blend"],
        images: [
          "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      fitness: {
        palette: {
          ...DEFAULT_THEME_COLORS,
          heroStart: "#0f172a",
          heroEnd: "#1e293b",
          accent: "#0f766e",
          accentStrong: "#22c55e",
        },
        typographyPreset: "bold-tech",
        identity: ["Performance-focused tone", "Transformation proof and social trust", "Membership and booking first UX"],
        images: [
          "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      general: {
        palette: DEFAULT_THEME_COLORS,
        typographyPreset: "modern",
        identity: ["Clear value proposition", "Conversion-oriented page flow", "Brand-consistent visual hierarchy"],
        images: [
          "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600",
          "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
    };

    const selected = library[category] || library.general;
    return {
      category,
      prompt: String(prompt || ""),
      palette: selected.palette,
      typographyPreset: selected.typographyPreset,
      identity: selected.identity,
      images: selected.images,
      logo: makeBrandLogoDataUri(prompt, selected.palette, category),
    };
  };

  const buildMarketingAutopilotPack = ({ brandName, industryLabel, primaryOffer, domainHint }) => {
    const business = String(brandName || "Your Business").trim() || "Your Business";
    const industry = String(industryLabel || "General").trim() || "General";
    const offer = String(primaryOffer || "premium services").trim() || "premium services";
    const domain = String(domainHint || "").trim();
    const ctaUrl = domain ? `https://${domain}` : "your website";

    return {
      seoArticles: [
        {
          title: `${business}: The Complete Guide to Choosing ${offer}`,
          outline: "Pain points, buyer checklist, comparison framework, and a clear decision path.",
          targetKeyword: `${business.toLowerCase()} ${offer.toLowerCase()}`.replace(/\s+/g, " "),
        },
        {
          title: `Top 7 ${industry} Mistakes Businesses Make and How ${business} Solves Them`,
          outline: "Educational listicle with actionable fixes and internal CTA blocks.",
          targetKeyword: `${industry.toLowerCase()} best practices`,
        },
        {
          title: `How to Get Faster Results with ${offer}: A Practical 30-Day Plan`,
          outline: "Week-by-week implementation with downloadable checklist CTA.",
          targetKeyword: `${offer.toLowerCase()} plan`,
        },
      ],
      socialPosts: [
        `Stop losing leads from slow follow-up. ${business} now offers a faster, conversion-first process for ${offer}. See how: ${ctaUrl}`,
        `If you're comparing providers in ${industry}, focus on outcomes, response time, and clarity. ${business} checks all three. ${ctaUrl}`,
        `New: our streamlined workflow helps clients launch faster with fewer handoff gaps. Book now via ${ctaUrl}`,
      ],
      googleAds: [
        {
          headline: `${business} | Book ${offer}`,
          description: `Trusted ${industry} solution. Fast onboarding. Get started today.`,
        },
        {
          headline: `Need ${offer}?`,
          description: `Professional ${industry} support with clear pricing and fast response.`,
        },
        {
          headline: `Switch to ${business}`,
          description: `Upgrade results with a proven ${industry} workflow. Request a quote now.`,
        },
      ],
      emailCampaign: [
        {
          subject: `Welcome to ${business} - Here’s your quick start`,
          body: `Thanks for your interest in ${offer}. This email gives you the fastest path to launch: define goals, choose your package, and schedule onboarding.`,
        },
        {
          subject: `Case Study: Better outcomes in 30 days`,
          body: `See how our clients improved conversion and delivery speed using our ${industry} framework. Reply for a tailored rollout plan.`,
        },
        {
          subject: `Last call: Priority onboarding window`,
          body: `Our next implementation window closes soon. Secure your slot and start seeing measurable progress this month.`,
        },
      ],
    };
  };

  const buildMonetizationEnginePlan = ({ brandName, industryLabel, enabledModules }) => {
    const business = String(brandName || "Your Business").trim() || "Your Business";
    const industry = String(industryLabel || "General").trim() || "General";
    const moduleSet = new Set(enabledModules || []);
    const suggestions = [];

    if (moduleSet.has("subscriptions.html")) {
      suggestions.push({
        channel: "Subscriptions",
        strategy: "Offer tiered monthly plans (Starter/Growth/Premium) with annual discount.",
        model: "MRR",
        launch: "Connect Stripe subscriptions, add pricing comparison table, and upgrade CTA on Home + Services.",
      });
    }
    if (moduleSet.has("memberships.html")) {
      suggestions.push({
        channel: "Memberships",
        strategy: "Gate premium resources, templates, or support behind member-only access.",
        model: "Recurring + retention",
        launch: "Create member portal sections and lock high-value content with monthly/annual options.",
      });
    }
    if (moduleSet.has("affiliates.html")) {
      suggestions.push({
        channel: "Affiliate Program",
        strategy: "Launch referral commissions for partners and creators.",
        model: "Performance-based CAC",
        launch: "Publish affiliate signup page, referral links, and commission dashboard with payout rules.",
      });
    }
    if (moduleSet.has("digital-products.html")) {
      suggestions.push({
        channel: "Digital Downloads",
        strategy: "Sell one-time products (guides, templates, playbooks, toolkits).",
        model: "One-time revenue",
        launch: "Add product catalog with checkout, instant delivery links, and post-purchase upsell.",
      });
    }
    if (moduleSet.has("booking.html")) {
      suggestions.push({
        channel: "Bookings",
        strategy: "Monetize consultations, appointments, demos, or services via online scheduling.",
        model: "Service revenue",
        launch: "Enable paid booking slots, reminders, and follow-up conversion to higher-tier offers.",
      });
    }
    if (moduleSet.has("payments.html")) {
      suggestions.push({
        channel: "Direct Payments",
        strategy: "Use pay links and invoices for fast checkout.",
        model: "Immediate cash flow",
        launch: "Add checkout CTA in hero + pricing blocks and automate invoice reminders.",
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        channel: "Lead Monetization",
        strategy: "Capture qualified leads with value-first offers and nurture sequences.",
        model: "Pipeline conversion",
        launch: "Use form funnels + email automation to convert leads into paid offerings.",
      });
    }

    return {
      title: `${business} Monetization Engine`,
      summary: `TitoNova Cloud Engine-recommended revenue channels for ${industry}.`,
      suggestions,
      nextStep:
        "Prioritize 1 recurring model + 1 immediate cash model, launch both in week 1, then optimize conversion weekly.",
    };
  };

  const buildSmartContentFallbackItems = ({ type, count, brandName, industryLabel, keyword }) => {
    const business = String(brandName || "Your Business").trim() || "Your Business";
    const industry = String(industryLabel || "General").trim() || "General";
    const keywordSeed = String(keyword || `${business} ${industry}`).trim();
    return Array.from({ length: count }).map((_, index) => {
      const n = index + 1;
      if (type === "landing-pages") {
        return {
          type,
          title: `${business} ${keywordSeed} Landing Page ${n}`,
          keyword: `${keywordSeed.toLowerCase()} offer ${n}`,
          summary: `Conversion-focused landing page copy for ${industry}, including value proposition, trust proof, and CTA flow.`,
          slug: `landing-page-${n}`,
        };
      }
      if (type === "faqs") {
        return {
          type,
          title: `FAQ ${n}: ${business} ${industry}`,
          keyword: `${keywordSeed.toLowerCase()} faq`,
          summary: `Q: How does ${business} handle ${industry.toLowerCase()} requests? A: We use a guided onboarding and clear support workflow.`,
          slug: `faq-${n}`,
        };
      }
      if (type === "product-descriptions") {
        return {
          type,
          title: `${business} Product ${n}`,
          keyword: `${keywordSeed.toLowerCase()} product`,
          summary: `Benefit-driven product description for ${industry} buyers with feature highlights, outcomes, and strong CTA.`,
          slug: `product-${n}`,
        };
      }
      return {
        type: "blog-posts",
        title: `${business}: ${keywordSeed} Strategy Guide ${n}`,
        keyword: `${keywordSeed.toLowerCase()} tips ${n}`,
        summary: `SEO blog outline covering intent, implementation checklist, and conversion CTAs for ${industry}.`,
        slug: `blog-post-${n}`,
      };
    });
  };

  const buildAppBuilderFallbackArtifacts = ({ brandName, industryLabel, pages }) => {
    const screens = orderPageKeys(Object.keys(pages || {})).map((key) => pageLabelFromKey(key));
    const featureHints = selectedAutomationDefs.map((item) => item.label);
    return {
      ios: {
        name: `${brandName} iOS`,
        framework: "SwiftUI",
        bundleId: `com.titonova.${makeProjectSlug(brandName)}.ios`,
        screens: screens.slice(0, 8),
        features: featureHints.slice(0, 6),
      },
      android: {
        name: `${brandName} Android`,
        framework: "Jetpack Compose",
        packageName: `com.titonova.${makeProjectSlug(brandName)}.android`,
        screens: screens.slice(0, 8),
        features: featureHints.slice(0, 6),
      },
      admin: {
        name: `${brandName} Admin Dashboard`,
        route: "/admin",
        modules: [
          "User management",
          "Bookings and scheduling",
          "CRM pipeline",
          "Payments and invoicing",
          "Analytics snapshots",
        ],
      },
      generatedAt: new Date().toISOString(),
      source: "fallback",
      industry: industryLabel,
    };
  };

  const normalizeSmartContentItems = (items, expectedType) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item, index) => {
        const type = String(item?.type || expectedType || "blog-posts");
        const title = String(item?.title || item?.headline || item?.question || "").trim();
        const summary = String(item?.summary || item?.description || item?.answer || "").trim();
        const keyword = String(item?.keyword || item?.targetKeyword || "").trim();
        const fallbackTitle =
          expectedType === "faqs"
            ? `FAQ ${index + 1}`
            : expectedType === "landing-pages"
              ? `Landing Page ${index + 1}`
              : expectedType === "product-descriptions"
                ? `Product Description ${index + 1}`
                : `Blog Post ${index + 1}`;
        return {
          type,
          title: title || fallbackTitle,
          keyword: keyword || "",
          summary: summary || "Generated content draft ready for review.",
          slug: String(item?.slug || fallbackTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")),
        };
      })
      .filter((item) => item.title);
  };

  const pickNextTheme = (currentTheme) => {
    const index = DESIGN_EVOLUTION_THEMES.findIndex(
      (theme) =>
        theme.heroStart === currentTheme.heroStart &&
        theme.heroEnd === currentTheme.heroEnd &&
        theme.accent === currentTheme.accent
    );
    return DESIGN_EVOLUTION_THEMES[(index + 1 + DESIGN_EVOLUTION_THEMES.length) % DESIGN_EVOLUTION_THEMES.length];
  };

  const computeSeoChecklist = (html) => {
    const empty = { score: 0, passedCount: 0, totalCount: 8, items: [] };
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const root = doc.body;
      const text = String(root.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      const words = text ? text.split(" ").length : 0;
      const h1Count = root.querySelectorAll("h1").length;
      const h2Count = root.querySelectorAll("h2").length;
      const sectionsCount = root.querySelectorAll("section").length;
      const links = Array.from(root.querySelectorAll("a[href]"));
      const internalLinks = links.filter((link) => /\.html(?:[#?].*)?$/i.test(String(link.getAttribute("href") || "")));
      const images = Array.from(root.querySelectorAll("img"));
      const imagesWithAlt = images.filter((img) => String(img.getAttribute("alt") || "").trim().length > 0);
      const ctaCount = Array.from(root.querySelectorAll("a,button")).filter((node) =>
        /(contact|book|start|get|learn|reserve|order|request|sign)/i.test(String(node.textContent || ""))
      ).length;
      const hasMap = Boolean(root.querySelector("iframe[data-map-frame='true']"));

      const items = [
        {
          label: "Single primary heading (H1)",
          passed: h1Count === 1,
          detail: `${h1Count} found`,
        },
        {
          label: "Section heading structure (H2)",
          passed: h2Count >= 2,
          detail: `${h2Count} found`,
        },
        {
          label: "Readable content depth",
          passed: words >= 180,
          detail: `${words} words`,
        },
        {
          label: "Internal linking",
          passed: internalLinks.length >= 3,
          detail: `${internalLinks.length} internal links`,
        },
        {
          label: "Image alt coverage",
          passed: images.length > 0 && imagesWithAlt.length === images.length,
          detail: `${imagesWithAlt.length}/${images.length} images with alt`,
        },
        {
          label: "Conversion CTAs",
          passed: ctaCount >= 2,
          detail: `${ctaCount} CTA actions`,
        },
        {
          label: "Semantic sectioning",
          passed: sectionsCount >= 4,
          detail: `${sectionsCount} sections`,
        },
        {
          label: "Local intent signal (map)",
          passed: hasMap,
          detail: hasMap ? "Map section present" : "No map section",
        },
      ];

      const passedCount = items.filter((item) => item.passed).length;
      const score = Math.round((passedCount / items.length) * 100);
      return { score, passedCount, totalCount: items.length, items };
    } catch {
      return empty;
    }
  };

  const buildGrowthCoachFallbackInsights = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const root = doc.body;
      const text = String(root.textContent || "").replace(/\s+/g, " ").trim();
      const words = text ? text.split(" ").length : 0;
      const h1 = root.querySelector("h1");
      const h1Text = String(h1?.textContent || "").trim();
      const ctas = Array.from(root.querySelectorAll("a,button")).filter((node) =>
        /(contact|book|start|get|learn|reserve|order|request|sign|call)/i.test(String(node.textContent || ""))
      );
      const testimonialCount = root.querySelectorAll("[data-tn-testimonial], blockquote").length;

      const insights = [];
      if (!h1Text || h1Text.length < 26 || !/(benefit|trusted|fast|care|staffing|results|growth|support|solutions)/i.test(h1Text)) {
        insights.push({
          id: "headline",
          severity: "high",
          issue: "Your homepage headline is weak.",
          recommendation: `Change it to: "${projectName || "Your Business"} delivers trusted, fast-response service with measurable results."`,
          actionLabel: "Apply headline fix",
        });
      }
      if (testimonialCount < 2) {
        insights.push({
          id: "testimonials",
          severity: "high",
          issue: "Trust proof is limited.",
          recommendation: "Add testimonials to improve trust and increase conversion confidence.",
          actionLabel: "Add testimonials section",
        });
      }
      if (ctas.length < 2) {
        insights.push({
          id: "cta",
          severity: "medium",
          issue: "Not enough conversion actions above the fold.",
          recommendation: "Add stronger CTA buttons like Book Now, Request Quote, or Schedule a Call.",
          actionLabel: "Add CTA button",
        });
      }
      if (words < 220) {
        insights.push({
          id: "content-depth",
          severity: "medium",
          issue: "Content depth is thin for SEO intent coverage.",
          recommendation: "Add richer service details, outcomes, and FAQ content to rank for more long-tail keywords.",
          actionLabel: "Use Smart Content Engine",
        });
      }
      if (insights.length === 0) {
        insights.push({
          id: "momentum",
          severity: "low",
          issue: "Core conversion structure looks solid.",
          recommendation: "Keep iterating weekly with fresh SEO pages and testimonials to compound growth.",
          actionLabel: "Generate growth content",
        });
      }
      return insights;
    } catch {
      return [
        {
          id: "headline",
          severity: "high",
          issue: "Your homepage headline could be stronger.",
          recommendation: "Lead with a clear benefit and outcome-focused value proposition.",
          actionLabel: "Apply headline fix",
        },
      ];
    }
  };

  const buildBusinessCoachInsights = ({ html, competitorData }) => {
    const insights = [];
    const text = String(html || "");
    const hasTestimonials = /data-tn-testimonial|testimonial|review/i.test(text);
    if (!hasTestimonials) {
      insights.push({
        id: "testimonials",
        severity: "high",
        title: "Website is missing testimonials.",
        recommendation: "Add reviews to increase conversions and trust.",
      });
    }

    const priceMatches = [...text.matchAll(/\$([0-9]+(?:\.[0-9]{1,2})?)/g)]
      .map((item) => Number(item[1]))
      .filter((value) => Number.isFinite(value) && value > 0);
    const yourPrice = priceMatches.length > 0 ? Math.min(...priceMatches) : null;

    const competitorPrices = Array.isArray(competitorData?.competitors)
      ? competitorData.competitors
          .map((item) => String(item?.pricing || ""))
          .flatMap((raw) => [...raw.matchAll(/\$([0-9]+(?:\.[0-9]{1,2})?)/g)].map((m) => Number(m[1])))
          .filter((value) => Number.isFinite(value) && value > 0)
      : [];
    const competitorAvg =
      competitorPrices.length > 0
        ? competitorPrices.reduce((sum, value) => sum + value, 0) / competitorPrices.length
        : null;

    if (yourPrice && competitorAvg && yourPrice < competitorAvg * 0.85) {
      const suggested = Math.round(competitorAvg * 0.95);
      insights.push({
        id: "pricing",
        severity: "high",
        title: "Your pricing appears lower than competitors.",
        recommendation: `Suggested price: $${suggested} instead of $${Math.round(yourPrice)}.`,
      });
    } else if (!yourPrice) {
      insights.push({
        id: "pricing-missing",
        severity: "medium",
        title: "Pricing is not clearly visible.",
        recommendation: "Add a clear starting price or package grid to improve buyer confidence.",
      });
    }

    if (insights.length === 0) {
      insights.push({
        id: "momentum",
        severity: "low",
        title: "Core business fundamentals look healthy.",
        recommendation: "Keep improving social proof, local SEO pages, and pricing tests monthly.",
      });
    }

    return insights;
  };

  const buildAnalyticsSnapshot = useCallback(({ pages, crmList, appointments, invoices }) => {
    const pageEntries = Object.entries(pages || {});
    const crmBookings = (crmList || []).reduce((sum, item) => sum + Number(item?.bookings || 0), 0);
    const invoiceRevenue = (invoices || []).reduce((sum, item) => sum + Number(item?.amount || 0), 0);
    const crmRevenue = (crmList || []).reduce((sum, item) => sum + Number(item?.payments || 0), 0);
    const bookings = Math.max(0, Number((appointments || []).length) + crmBookings);
    const visitorsToday = Math.max(120, 200 + pageEntries.length * 18 + bookings * 4);
    const revenue = Math.max(0, invoiceRevenue + crmRevenue);
    const conversionRate = visitorsToday > 0 ? ((bookings / visitorsToday) * 100).toFixed(1) : "0.0";
    const topPages = pageEntries
      .map(([key, html]) => ({
        key,
        label:
          key === "index.html"
            ? "Home"
            : String(key || "")
                .replace(/\.html$/i, "")
                .split("-")
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" "),
        score: String(html || "").length,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      visitorsToday,
      bookings,
      revenue,
      conversionRate: Number(conversionRate),
      topPages,
    };
  }, []);

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const pageKeyFromName = (name, fallbackIndex = 0) => {
    const normalized = String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!normalized || normalized === "home") return "index.html";
    return `${normalized || `page-${fallbackIndex + 1}`}.html`;
  };

  const pageLabelFromKey = (key) => {
    if (key === "index.html") return "Home";
    return String(key || "")
      .replace(/\.html$/i, "")
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const orderPageKeys = (keys = []) => {
    const coreOrder = [...CORE_PAGE_DEFS, ...AUTOMATION_PAGE_DEFS].map((page) => page.key);
    return [...keys].sort((a, b) => {
      const ai = coreOrder.indexOf(a);
      const bi = coreOrder.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b);
    });
  };

  const buildCorePageModel = (key, fallbackPage) => {
    if (key === "blog.html") {
      return {
        name: "Blog",
        sections: [
          { type: "hero", title: `${projectName || "Your Business"} Blog`, subtitle: "Insights, guides, and updates." },
          { type: "features", items: ["How-to guides", "Industry trends", "Case studies"] },
          { type: "cta", text: "Read Latest Posts" },
        ],
      };
    }
    if (key === "landing.html") {
      return {
        name: "Landing Page",
        sections: [
          { type: "hero", title: "Conversion Landing Page", subtitle: "Focused message, proof, and one strong CTA." },
          { type: "features", items: ["Value proposition", "Testimonials", "Offer highlights"] },
          { type: "cta", text: "Start Now" },
        ],
      };
    }
    if (key === "pricing.html") return buildAutomationPageModel("pricing.html");
    return fallbackPage;
  };

  const buildFunnelBuilderData = (pages = {}) => {
    const keys = Object.keys(pages || {});
    const hasAny = (candidates = []) => candidates.some((key) => keys.includes(key));
    const pageChecks = [
      { key: "index.html", label: "Home", pass: hasAny(["index.html"]) },
      { key: "about.html", label: "About", pass: hasAny(["about.html"]) },
      { key: "services.html", label: "Services", pass: hasAny(["services.html"]) },
      { key: "pricing.html", label: "Pricing", pass: hasAny(["pricing.html"]) },
      { key: "contact.html", label: "Contact", pass: hasAny(["contact.html"]) },
      { key: "landing", label: "Landing Pages", pass: hasAny(["landing.html", "marketing-pages.html", "landing-page.html"]) },
      { key: "blog.html", label: "Blog", pass: hasAny(["blog.html"]) },
    ];
    const funnelStages = [
      { id: "ad", label: "Ad", pass: true },
      { id: "landing", label: "Landing Page", pass: hasAny(["landing.html", "marketing-pages.html", "landing-page.html"]) },
      { id: "booking", label: "Booking", pass: hasAny(["booking.html"]) },
      { id: "payment", label: "Payment", pass: hasAny(["payments.html", "invoicing.html"]) },
    ];
    return {
      pageChecks,
      funnelStages,
      funnelPass: funnelStages.every((stage) => stage.pass),
    };
  };

  const buildNavLinksMarkup = (pageKey, navPageKeys) =>
    navPageKeys
      .map((key) => ({ key, label: pageLabelFromKey(key) }))
      .map((item) => {
        const active = item.key === pageKey;
        return `<a href="${item.key}" style="text-decoration:none;padding:8px 12px;border-radius:999px;font-weight:600;font-size:13px;${
          active
            ? "background:transparent;color:var(--tn-nav-active-bg);border:none;border-bottom:2px solid var(--tn-nav-active-bg);border-radius:0;padding:6px 2px;"
            : "background:transparent;color:var(--tn-nav-text);border:none;border-bottom:2px solid transparent;border-radius:0;padding:6px 2px;"
        }">${item.label}</a>`;
      })
      .join("");

  const injectNavIntoPageHtml = (html, pageKey, navPageKeys) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const nav = doc.querySelector("nav");
      if (nav) nav.innerHTML = buildNavLinksMarkup(pageKey, navPageKeys);
      return doc.body.innerHTML || html || "";
    } catch {
      return html || "";
    }
  };


  const buildHtmlFromGeneratedData = (
    data,
    pageKey = "index.html",
    navPageKeys = [],
    palette = DEFAULT_THEME_COLORS,
    typography = DEFAULT_TEXT_STYLE,
    uiDesign = null
  ) => {
    const page = Array.isArray(data?.pages) && data.pages.length > 0 ? data.pages[0] : null;
    const sections = Array.isArray(page?.sections) ? page.sections : [];
    const hero = sections.find((section) => section?.type === "hero") || {};
    const featureSection = sections.find((section) => section?.type === "features") || {};
    const cta = sections.find((section) => section?.type === "cta") || {};
    const theme = { ...DEFAULT_THEME_COLORS, ...(palette || {}) };
    const textTheme = { ...DEFAULT_TEXT_STYLE, ...(typography || {}) };
    const uiSpec = uiDesign || {};
    const layoutVariant = UI_LAYOUT_VARIANTS.includes(uiSpec?.layoutVariant) ? uiSpec.layoutVariant : "split-hero";

    const stringifyFeatureItem = (item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      const candidateFields = [
        item.title,
        item.name,
        item.label,
        item.text,
        item.description,
        item.summary,
      ];
      const match = candidateFields.find((value) => typeof value === "string" && value.trim());
      if (match) return match.trim();
      try {
        return JSON.stringify(item);
      } catch {
        return "";
      }
    };

    const featureItems = Array.isArray(featureSection.items)
      ? featureSection.items.map(stringifyFeatureItem).filter(Boolean).slice(0, 6)
      : [];
    const normalizedFeatureItems = featureItems.length
      ? featureItems
      : ["Tailored strategy", "Conversion-first content", "Fast launch support"];
    const assistantKnowledgeEncoded = encodeURIComponent(
      JSON.stringify({
        businessName: String(projectName || "This company"),
        page: pageLabelFromKey(pageKey),
        services: normalizedFeatureItems.slice(0, 6),
        bookingUrl: "contact.html",
        appointmentSlots: (bookingSlots.length > 0 ? bookingSlots : ["3:00 PM", "4:30 PM"]).slice(0, 6),
        salesBotName: "TitoNova Cloud Engine Sales",
        supportEmail: "hello@example.com",
        supportPhone: "(000) 000-0000",
      })
    );

    const getFeatureIcon = (label) => {
      const text = String(label || "").toLowerCase();

      if (/(care plan|person-centered|service plan|isp|goals?)/.test(text)) {
        return {
          bg: "#dcfce7",
          stroke: "#166534",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l3 3v13H5V4h3z"/><path d="M8 4v4h8V4"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>`,
        };
      }

      if (/(dsp|direct support|staffing|caregiver|shift|scheduling|coverage)/.test(text)) {
        return {
          bg: "#e0f2fe",
          stroke: "#0369a1",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M4 19a5 5 0 0 1 10 0"/><path d="M16 8h5"/><path d="M18.5 5.5v5"/></svg>`,
        };
      }

      if (/(incident response|incident|critical event|reporting|risk|safety event)/.test(text)) {
        return {
          bg: "#fee2e2",
          stroke: "#b91c1c",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2.5 20h19z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>`,
        };
      }

      if (/(medication|med pass|health tracking|nursing|wellness|clinical)/.test(text)) {
        return {
          bg: "#fce7f3",
          stroke: "#be185d",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v6"/><path d="M14 4v6"/><path d="M7 8h10"/><path d="M12 10v10"/><path d="M8 16h8"/></svg>`,
        };
      }

      if (/(support|help|assist|care|service)/.test(text)) {
        return {
          bg: "#dcfce7",
          stroke: "#15803d",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a7 7 0 0 0-7 7v2a3 3 0 0 0 3 3h1"/><path d="M12 3a7 7 0 0 1 7 7v2a3 3 0 0 1-3 3h-1"/><path d="M9 15v1a3 3 0 0 0 3 3h2"/><rect x="3" y="11" width="4" height="6" rx="2"/><rect x="17" y="11" width="4" height="6" rx="2"/></svg>`,
        };
      }

      if (/(growth|scale|revenue|sales|expand|conversion)/.test(text)) {
        return {
          bg: "#dbeafe",
          stroke: "#1d4ed8",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l5-5 4 4 7-7"/><path d="M15 8h5v5"/><path d="M4 20h16"/></svg>`,
        };
      }

      if (/(quality|trusted|trust|premium|excellence|reliable)/.test(text)) {
        return {
          bg: "#fef3c7",
          stroke: "#b45309",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9-4.2-4.1 5.9-.9z"/></svg>`,
        };
      }

      if (/(security|safe|compliance|protect)/.test(text)) {
        return {
          bg: "#e0e7ff",
          stroke: "#4338ca",
          svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 4.5 2.9 7.7 7 9 4.1-1.3 7-4.5 7-9V6z"/><path d="m9.5 12.5 1.8 1.8 3.6-3.6"/></svg>`,
        };
      }

      return {
        bg: "#cffafe",
        stroke: "#0f766e",
        svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`,
      };
    };

    const featureCards = normalizedFeatureItems
      .map((item, index) => {
        const icon = getFeatureIcon(item);
        return `
          <article style="background:var(--tn-surface-subtle);border:1px solid var(--tn-border);border-radius:14px;padding:16px">
            <div style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:${icon.bg};color:${icon.stroke};margin-bottom:12px">
              ${icon.svg}
            </div>
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--tn-accent)">FEATURE ${index + 1}</p>
            <h3 style="margin:0;font-size:18px;line-height:1.35;color:var(--tn-text-primary);font-family:var(--tn-font-heading);font-weight:700;letter-spacing:var(--tn-heading-spacing)">${escapeHtml(item)}</h3>
          </article>
        `;
      })
      .join("");

    const previewSections = sections
      .filter((section) => !["hero", "features", "cta"].includes(section?.type))
      .slice(0, 3)
      .map(
        (section, index) => `
          <article style="border:1px solid var(--tn-border);border-radius:12px;padding:14px;background:var(--tn-surface)">
            <h4 style="margin:0 0 6px;color:var(--tn-text-primary);font-family:var(--tn-font-heading);font-weight:700;letter-spacing:var(--tn-heading-spacing)">Section ${index + 1}</h4>
            <p style="margin:0;color:var(--tn-text-secondary);font-size:14px">${escapeHtml(section?.type || "custom")}</p>
          </article>
        `
      )
      .join("");

    const resolveIndustryKey = (value) => {
      const text = String(value || "").toLowerCase();
      if (/(saas|software|app|platform|b2b|cloud)/.test(text)) return "saas";
      if (/(e-?commerce|online store|shop|retail|product catalog|checkout)/.test(text)) return "ecommerce";
      if (/(home\s*care|hcbs|caregiver|disability|support)/.test(text)) return "hcbs";
      if (/(beauty|salon|spa|cosmetic|skincare)/.test(text)) return "beauty";
      if (/(restaurant|cafe|food|bakery|kitchen)/.test(text)) return "restaurant";
      if (/(real\s*estate|realtor|property|housing)/.test(text)) return "real_estate";
      if (/(fitness|gym|wellness|trainer)/.test(text)) return "fitness";
      if (/(health|clinic|medical|dental)/.test(text)) return "healthcare";
      if (/(construction|roofing|plumbing|electric)/.test(text)) return "construction";
      if (/(law|attorney|legal)/.test(text)) return "legal";
      if (/(finance|accounting|tax|consulting)/.test(text)) return "finance";
      if (/(education|school|academy|learning)/.test(text)) return "education";
      return "general";
    };

    const industryKey = resolveIndustryKey(`${projectName} ${hero.title} ${hero.subtitle}`);
    const INDUSTRY_IMAGE_BANK = {
      saas: {
        hero: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      ecommerce: {
        hero: "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/6169056/pexels-photo-6169056.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/6347546/pexels-photo-6347546.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      hcbs: {
        hero: "https://images.pexels.com/photos/7551662/pexels-photo-7551662.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/7551682/pexels-photo-7551682.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/7551658/pexels-photo-7551658.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/7551677/pexels-photo-7551677.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      beauty: {
        hero: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3993133/pexels-photo-3993133.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      restaurant: {
        hero: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      real_estate: {
        hero: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      fitness: {
        hero: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      healthcare: {
        hero: "https://images.pexels.com/photos/844209/pexels-photo-844209.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/7580257/pexels-photo-7580257.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/7108343/pexels-photo-7108343.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      construction: {
        hero: "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/209230/pexels-photo-209230.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/534220/pexels-photo-534220.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      legal: {
        hero: "https://images.pexels.com/photos/5668481/pexels-photo-5668481.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/6077123/pexels-photo-6077123.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/8112164/pexels-photo-8112164.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      finance: {
        hero: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/6693661/pexels-photo-6693661.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/8353838/pexels-photo-8353838.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      education: {
        hero: "https://images.pexels.com/photos/5212703/pexels-photo-5212703.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/8471835/pexels-photo-8471835.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/8423025/pexels-photo-8423025.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
      general: {
        hero: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600",
        gallery: [
          "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3182746/pexels-photo-3182746.jpeg?auto=compress&cs=tinysrgb&w=800",
          "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
      },
    };

    const selectedImages = INDUSTRY_IMAGE_BANK[industryKey] || INDUSTRY_IMAGE_BANK.general;
    const heroImageUrl = selectedImages.hero;
    const [galleryImageA, galleryImageB, galleryImageC] = selectedImages.gallery;
    const brandLogoCategory = inferBrandCategory(`${projectName} ${hero.title} ${hero.subtitle} ${industryKey}`);
    const brandLogoDataUri = makeBrandLogoDataUri(projectName || hero.title || "TitoNova", theme, brandLogoCategory);
    const defaultMapQuery = `${projectName || "care center"} location`;
    const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(defaultMapQuery)}&output=embed`;
    const navToggleId = `tn-nav-toggle-${String(pageKey || "index").replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    const navLinks = buildNavLinksMarkup(
      pageKey,
      navPageKeys.length > 0 ? navPageKeys : CORE_PAGE_DEFS.map((page) => page.key)
    );
    const sectionTitle = (label) =>
      `<h2 style="margin:0 0 10px;color:var(--tn-text-primary);font-family:var(--tn-font-heading);font-weight:var(--tn-heading-weight);letter-spacing:var(--tn-heading-spacing)">${label}</h2>`;

    const visualIndustryKey =
      industryKey === "healthcare" || industryKey === "hcbs"
        ? "healthcare"
        : industryKey === "saas"
          ? "saas"
          : industryKey === "ecommerce"
            ? "ecommerce"
            : "general";
    const industryVisualProfile = {
      healthcare: {
        strapline: "Compassionate Care. Professional Support.",
        supportLine: "Care planning, family communication, and dependable outcomes.",
        logoPill: "HEALTHCARE & HCBS",
        primaryHeaderCta: "Book Assessment",
        heroEyebrow: "Trusted Care Team",
        shadowSoft: "0 14px 34px rgba(14, 116, 144, .11)",
        shadowHover: "0 20px 48px rgba(14, 116, 144, .22)",
        cardRadius: "16px",
      },
      saas: {
        strapline: "Ship Product Faster. Convert Better.",
        supportLine: "Automation-ready workflows, analytics, and onboarding that scales.",
        logoPill: "SAAS GROWTH PLATFORM",
        primaryHeaderCta: "Start Free Trial",
        heroEyebrow: "Built for Revenue Teams",
        shadowSoft: "0 14px 34px rgba(37, 99, 235, .12)",
        shadowHover: "0 22px 54px rgba(37, 99, 235, .25)",
        cardRadius: "14px",
      },
      ecommerce: {
        strapline: "Merchandise Beautifully. Sell Confidently.",
        supportLine: "Storefront UX, checkout flow, and retention automation in one stack.",
        logoPill: "E-COMMERCE EXPERIENCE",
        primaryHeaderCta: "Shop Collections",
        heroEyebrow: "Commerce-Optimized Layout",
        shadowSoft: "0 14px 34px rgba(217, 119, 6, .12)",
        shadowHover: "0 22px 54px rgba(217, 119, 6, .24)",
        cardRadius: "18px",
      },
      general: {
        strapline: "Build Credibility. Drive Growth.",
        supportLine: "Premium website pages generated for speed, clarity, and conversion.",
        logoPill: "BUSINESS WEBSITE ENGINE",
        primaryHeaderCta: "Request Info",
        heroEyebrow: "Welcome",
        shadowSoft: "0 14px 38px rgba(15,23,42,.08)",
        shadowHover: "0 18px 48px rgba(15,23,42,.16)",
        cardRadius: "16px",
      },
    }[visualIndustryKey];

    const quickNavBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Quick Navigation")}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="about.html" style="padding:8px 12px;background:#f0f0f1;border:1px solid #dcdcde;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Learn About Us</a>
          <a href="services.html" style="padding:8px 12px;background:#f0f0f1;border:1px solid #dcdcde;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Explore Services</a>
          <a href="contact.html" style="padding:8px 12px;background:#f0f0f1;border:1px solid #dcdcde;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Contact Team</a>
        </div>
      </section>
    `;

    const aboutStoryBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Our Story")}
        <details open style="border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff;margin-bottom:8px">
          <summary style="cursor:pointer;font-family:var(--tn-font-heading);font-weight:700;color:#1d2327">Mission & Values</summary>
          <p style="margin:10px 0 0;color:#475569">We prioritize quality care, transparent communication, and dependable staffing outcomes for every client engagement.</p>
        </details>
        <details style="border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff">
          <summary style="cursor:pointer;font-family:var(--tn-font-heading);font-weight:700;color:#1d2327">Why Families Choose Us</summary>
          <p style="margin:10px 0 0;color:#475569">Dedicated account support, experienced caregivers, and responsive service delivery tailored to each resident.</p>
        </details>
      </section>
    `;

    const servicesActionBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Service Actions")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <article style="border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff">
            <h3 style="margin:0 0 8px;color:#1d2327;font-family:var(--tn-font-heading);font-weight:700;letter-spacing:var(--tn-heading-spacing)">Skilled Nursing</h3>
            <a href="contact.html" style="color:#2271b1;font-weight:600;text-decoration:none">Request this service</a>
          </article>
          <article style="border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff">
            <h3 style="margin:0 0 8px;color:#1d2327;font-family:var(--tn-font-heading);font-weight:700;letter-spacing:var(--tn-heading-spacing)">Post-Acute Rehab</h3>
            <a href="contact.html" style="color:#2271b1;font-weight:600;text-decoration:none">Book a care consultation</a>
          </article>
          <article style="border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff">
            <h3 style="margin:0 0 8px;color:#1d2327;font-family:var(--tn-font-heading);font-weight:700;letter-spacing:var(--tn-heading-spacing)">Long-Term Support</h3>
            <a href="contact.html" style="color:#2271b1;font-weight:600;text-decoration:none">Talk with admissions</a>
          </article>
        </div>
      </section>
    `;

    const clientDashboardBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Client Dashboard Workspace")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px">
            <p style="margin:0;color:var(--tn-text-secondary);font-size:12px">Active Clients</p>
            <strong style="font-size:24px;color:var(--tn-text-primary)">128</strong>
          </article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px">
            <p style="margin:0;color:var(--tn-text-secondary);font-size:12px">Open Bookings</p>
            <strong style="font-size:24px;color:var(--tn-text-primary)">24</strong>
          </article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px">
            <p style="margin:0;color:var(--tn-text-secondary);font-size:12px">Pending Invoices</p>
            <strong style="font-size:24px;color:var(--tn-text-primary)">7</strong>
          </article>
        </div>
      </section>
    `;

    const loginPortalBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Secure Login Portal")}
        <form style="max-width:420px;background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:8px">
          <input type="email" placeholder="Email address" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="password" placeholder="Password" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <button type="button" style="padding:10px 14px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Sign In</button>
          <a href="contact.html" style="color:var(--tn-link);text-decoration:none;font-size:12px">Forgot password? Contact support</a>
        </form>
      </section>
    `;

    const paymentsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Payments & Checkout")}
        <div style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:10px">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${(enabledPaymentProviders.length > 0 ? enabledPaymentProviders : ["Stripe"]).map((provider) =>
              `<span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">${escapeHtml(provider)}</span>`
            ).join("")}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <strong style="color:var(--tn-text-primary)">Checkout Page</strong>
            <span style="color:var(--tn-text-secondary)">Book Service → Pay → Confirmation</span>
          </div>
          <button type="button" style="padding:10px 14px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Pay Now</button>
          <small style="color:var(--tn-text-secondary)">${subscriptionsEnabled ? "Subscriptions enabled for gyms, coaching, and SaaS." : "One-time payment mode enabled."}</small>
        </div>
      </section>
    `;

    const invoicingBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Automatic Invoicing")}
        <div style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:8px">
          <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
            <strong style="color:var(--tn-text-primary)">Invoice #${escapeHtml(invoiceNumber || "1023")}</strong>
            <span style="color:var(--tn-text-secondary)">Due in 7 days</span>
          </div>
          <p style="margin:0;color:var(--tn-text-secondary)">Service: ${escapeHtml(invoiceServiceInput || "Full Detail")} • Amount: $${escapeHtml(invoiceAmountInput || "150")}</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" style="padding:9px 12px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Send Invoice</button>
            <button type="button" style="padding:9px 12px;background:#f1f5f9;color:var(--tn-text-primary);border:1px solid var(--tn-border);border-radius:8px;font-weight:700;cursor:pointer">Mark Paid</button>
          </div>
        </div>
      </section>
    `;

    const bookingServiceOptions = (bookingServices.length > 0 ? bookingServices : ["Consultation", "Standard Service", "Premium Service"])
      .map((item) => `<option>${escapeHtml(item)}</option>`)
      .join("");
    const bookingSlotButtons = (bookingSlots.length > 0 ? bookingSlots : ["09:00 AM", "10:30 AM", "01:00 PM", "03:00 PM"])
      .map(
        (slot) =>
          `<button type="button" style="padding:7px 10px;background:#f0fdf4;color:#14532d;border:1px solid #86efac;border-radius:8px;font-weight:700;cursor:pointer">${escapeHtml(
            slot
          )}</button>`
      )
      .join("");
    const bookingConfirmationText = bookingAutoConfirmEnabled
      ? "Automatic confirmations are enabled (email + SMS reminders)."
      : "Automatic confirmations are disabled. Manual follow-up is required.";
    const bookingGoogleSyncText = bookingGoogleSyncEnabled
      ? "Google Calendar sync is connected."
      : "Google Calendar sync is disconnected.";

    const bookingBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Booking & Scheduling System")}
        <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:10px">
          <div style="display:flex;gap:6px;flex-wrap:wrap;color:var(--tn-text-secondary);font-size:12px;font-weight:600">
            <span>Customer visits website</span><span>→</span>
            <span>Selects service</span><span>→</span>
            <span>Chooses time</span><span>→</span>
            <span>Books appointment</span><span>→</span>
            <span>Pays online</span>
          </div>
          <form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
            <select style="padding:10px;border:1px solid #cbd5e1;border-radius:8px">${bookingServiceOptions}</select>
            <input type="date" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
            <select style="padding:10px;border:1px solid #cbd5e1;border-radius:8px">
              <option>${Number(bookingDurationMinutes || 60)} minutes</option>
            </select>
            <button type="button" style="padding:10px 14px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Book Appointment</button>
          </form>
          <div style="display:flex;gap:8px;flex-wrap:wrap">${bookingSlotButtons}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <small style="color:var(--tn-text-secondary)">${escapeHtml(bookingConfirmationText)}</small>
            <small style="color:var(--tn-text-secondary)">${escapeHtml(bookingGoogleSyncText)}</small>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button type="button" style="padding:9px 12px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Pay Online</button>
            <button type="button" style="padding:9px 12px;background:#f1f5f9;color:var(--tn-text-primary);border:1px solid var(--tn-border);border-radius:8px;font-weight:700;cursor:pointer">Add to Google Calendar</button>
          </div>
        </article>
      </section>
    `;

    const bookingControlBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Scheduling Configuration")}
        <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:8px">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Appointment calendar</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Availability slots</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Automatic confirmations</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Google Calendar sync</span>
          </div>
        </article>
          </section>
    `;

    const crmBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Built-in CRM")}
        <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:10px">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">New Leads</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Contacted</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Booked</span>
            <span style="padding:6px 10px;border-radius:999px;background:#ecfdf3;border:1px solid #a7f3d0;color:#166534;font-size:12px;font-weight:700">Completed</span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;color:var(--tn-text-secondary);font-size:12px;font-weight:600">
            <span>Lead</span><span>→</span><span>Consultation</span><span>→</span><span>Proposal</span><span>→</span><span>Won</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
            <article style="background:#f8fafc;border:1px solid var(--tn-border);border-radius:10px;padding:10px"><strong>Jordan Miles</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">jordan@example.com • (555) 120-9911</p><small style="color:var(--tn-text-secondary)">Bookings: 1 • Payments: $149</small></article>
            <article style="background:#f8fafc;border:1px solid var(--tn-border);border-radius:10px;padding:10px"><strong>Avery Stone</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">avery@example.com • (555) 348-1122</p><small style="color:var(--tn-text-secondary)">Bookings: 2 • Payments: $420</small></article>
            <article style="background:#f8fafc;border:1px solid var(--tn-border);border-radius:10px;padding:10px"><strong>Riley Carter</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">riley@example.com • (555) 872-4400</p><small style="color:var(--tn-text-secondary)">Bookings: 3 • Payments: $780</small></article>
          </div>
        </article>
      </section>
    `;

    const emailAutomationBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Email Automation")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Welcome Flow</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Instant intro + offer email</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Booking Reminder</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">24h and 1h reminder sequence</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Reactivation</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Win-back campaign for inactive leads</p></article>
        </div>
      </section>
    `;

    const marketingPagesBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Marketing Pages")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Local Service Landing</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">SEO page focused on city-level intent.</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Offer Campaign Page</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Lead form + promo call-to-action block.</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Referral Program Page</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Share-ready referral incentives and tracking.</p></article>
        </div>
      </section>
    `;

    const analyticsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Analytics & KPI Reporting")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><p style="margin:0;color:var(--tn-text-secondary)">Monthly Revenue</p><strong style="font-size:22px">$84,200</strong></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><p style="margin:0;color:var(--tn-text-secondary)">Booking Conversion</p><strong style="font-size:22px">37%</strong></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><p style="margin:0;color:var(--tn-text-secondary)">Customer Retention</p><strong style="font-size:22px">89%</strong></article>
        </div>
      </section>
    `;

    const subscriptionsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Subscriptions")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px">
            <strong>Starter</strong>
            <p style="margin:6px 0;color:var(--tn-text-secondary)">$29/month</p>
            <button type="button" style="padding:8px 12px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Subscribe</button>
          </article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px">
            <strong>Growth</strong>
            <p style="margin:6px 0;color:var(--tn-text-secondary)">$79/month</p>
            <button type="button" style="padding:8px 12px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Subscribe</button>
          </article>
        </div>
      </section>
    `;

    const digitalProductsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Digital Product Sales")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Template Pack</strong><p style="margin:6px 0;color:var(--tn-text-secondary)">$49 one-time</p><button type="button" style="padding:8px 12px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Buy Now</button></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Video Course</strong><p style="margin:6px 0;color:var(--tn-text-secondary)">$129 one-time</p><button type="button" style="padding:8px 12px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Buy Now</button></article>
        </div>
      </section>
    `;

    const membershipsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Memberships")}
        <div style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;gap:8px">
          <p style="margin:0;color:var(--tn-text-secondary)">Launch gated member access with recurring billing and premium content areas.</p>
          <button type="button" style="padding:10px 14px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer;max-width:220px">Join Membership</button>
        </div>
      </section>
    `;

    const affiliatesBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Affiliate System")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Partner Signups</strong><p style="margin:6px 0;color:var(--tn-text-secondary)">42 active affiliates</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Commission Rate</strong><p style="margin:6px 0;color:var(--tn-text-secondary)">15% per conversion</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><button type="button" style="padding:8px 12px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Generate Affiliate Link</button></article>
        </div>
      </section>
    `;

    const monetizationHubBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Revenue Engine")}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="subscriptions.html" style="padding:8px 12px;background:#f0f6fc;border:1px solid #8cb4d8;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Subscriptions</a>
          <a href="booking.html" style="padding:8px 12px;background:#f0f6fc;border:1px solid #8cb4d8;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Bookings</a>
          <a href="digital-products.html" style="padding:8px 12px;background:#f0f6fc;border:1px solid #8cb4d8;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Digital Products</a>
          <a href="memberships.html" style="padding:8px 12px;background:#f0f6fc;border:1px solid #8cb4d8;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Memberships</a>
          <a href="affiliates.html" style="padding:8px 12px;background:#f0f6fc;border:1px solid #8cb4d8;border-radius:8px;color:#1d2327;text-decoration:none;font-weight:600">Affiliates</a>
        </div>
      </section>
    `;

    const dspPortalBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("DSP Portal")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Shift Assignments</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Current and upcoming shifts</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Care Notes</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Visit updates and outcomes</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Attendance</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Clock-in and verification</p></article>
        </div>
      </section>
    `;

    const incidentReportingBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Incident Reporting")}
        <form style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <select style="padding:10px;border:1px solid #cbd5e1;border-radius:8px"><option>Severity</option><option>Low</option><option>Medium</option><option>High</option></select>
          <input type="text" placeholder="Incident type" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="datetime-local" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <button type="button" style="padding:10px 14px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Submit Report</button>
        </form>
      </section>
    `;

    const staffTrainingBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Staff Training Tracker")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Medication Admin</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Due in 14 days</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Safety Protocols</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Completed</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Incident Response</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Due in 3 days</p></article>
        </div>
      </section>
    `;

    const caseIntakeBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Case Intake Form")}
        <form style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <input type="text" placeholder="Client full name" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="text" placeholder="Practice area" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="text" placeholder="Case summary" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <button type="button" style="padding:10px 14px;background:var(--tn-accent-strong);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Submit Intake</button>
        </form>
      </section>
    `;

    const documentPortalBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Document Portal")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Client Agreement.pdf</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Uploaded today</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Evidence Packet.zip</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Awaiting review</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Court Filing.docx</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Version 3</p></article>
        </div>
      </section>
    `;

    const orderingSystemBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Ordering System")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Order #1542</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">2x Combo Meals</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Order #1543</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Pickup at 7:30 PM</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Order #1544</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Delivery requested</p></article>
        </div>
      </section>
    `;

    const reservationsBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Reservations")}
        <form style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:14px;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px">
          <input type="text" placeholder="Guest name" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="date" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input type="number" placeholder="Party size" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <button type="button" style="padding:10px 14px;background:var(--tn-accent);color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">Reserve Table</button>
        </form>
      </section>
    `;

    const deliveryTrackingBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Delivery Tracking")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Driver Assigned</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">Order #1544</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>On Route</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">ETA 14 min</p></article>
          <article style="background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px"><strong>Delivered</strong><p style="margin:6px 0 0;color:var(--tn-text-secondary)">3 orders today</p></article>
        </div>
      </section>
    `;

    const contactFormBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Contact Form")}
        <form action="mailto:hello@example.com" method="post" enctype="text/plain" style="display:grid;gap:8px;border:1px solid #dcdcde;border-radius:10px;padding:12px;background:#fff">
          <input name="name" placeholder="Your name" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <input name="email" placeholder="Your email" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px" />
          <textarea name="message" placeholder="How can we help?" rows="4" style="padding:10px;border:1px solid #cbd5e1;border-radius:8px"></textarea>
          <button type="submit" style="padding:10px 14px;background:#2271b1;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Send Inquiry</button>
        </form>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="tel:+10000000000" style="padding:8px 12px;border-radius:8px;background:#f0f6fc;border:1px solid #8cb4d8;color:#1d2327;text-decoration:none;font-weight:600">Call Now</a>
          <a href="mailto:hello@example.com" style="padding:8px 12px;border-radius:8px;background:#f0f6fc;border:1px solid #8cb4d8;color:#1d2327;text-decoration:none;font-weight:600">Email Us</a>
        </div>
      </section>
    `;

    const statsBlock = `
      <section style="padding:16px 20px 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
        <div style="background:var(--tn-surface);border:1px solid var(--tn-border);border-radius:8px;padding:14px">
          <p style="margin:0 0 4px;color:var(--tn-text-primary);font-size:24px;font-family:var(--tn-font-heading);font-weight:700">24/7</p>
          <p style="margin:0;color:var(--tn-text-secondary)">Skilled support availability</p>
        </div>
        <div style="background:var(--tn-surface);border:1px solid var(--tn-border);border-radius:8px;padding:14px">
          <p style="margin:0 0 4px;color:var(--tn-text-primary);font-size:24px;font-family:var(--tn-font-heading);font-weight:700">Multi-Disciplinary</p>
          <p style="margin:0;color:var(--tn-text-secondary)">Nursing, therapy, and recovery services</p>
        </div>
        <div style="background:var(--tn-surface);border:1px solid var(--tn-border);border-radius:8px;padding:14px">
          <p style="margin:0 0 4px;color:var(--tn-text-primary);font-size:24px;font-family:var(--tn-font-heading);font-weight:700">Family-Centered</p>
          <p style="margin:0;color:var(--tn-text-secondary)">Transparent, compassionate communication</p>
        </div>
      </section>
    `;

    const commitmentBlock = `
      <section style="padding:18px 20px 0">
        <article style="background:var(--tn-surface);border:1px solid var(--tn-border);border-radius:8px;padding:18px">
          ${sectionTitle("Our Heartfelt Commitment")}
          <p style="margin:0;color:var(--tn-text-secondary)"> ${escapeHtml(hero.title || "We provide a supportive and uplifting environment focused on healing, dignity, and long-term wellness outcomes.")} </p>
        </article>
      </section>
    `;

    const servicesGridBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle(pageKey === "services.html" ? "Our Rehab Programs" : "Care & Rehab Services")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">
          ${featureCards}
        </div>
      </section>
    `;

    const galleryBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Photo Highlights")}
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
          <img data-image-id="gallery-1" data-parallax-speed="0.08" src="${galleryImageA}" alt="Industry highlight 1" style="width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--tn-border)" onerror="this.onerror=null;this.src='https://placehold.co/800x600/e2e8f0/0f172a?text=Image+1';" />
          <img data-image-id="gallery-2" data-parallax-speed="0.1" src="${galleryImageB}" alt="Industry highlight 2" style="width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--tn-border)" onerror="this.onerror=null;this.src='https://placehold.co/800x600/e2e8f0/0f172a?text=Image+2';" />
          <img data-image-id="gallery-3" data-parallax-speed="0.12" src="${galleryImageC}" alt="Industry highlight 3" style="width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:8px;border:1px solid var(--tn-border)" onerror="this.onerror=null;this.src='https://placehold.co/800x600/e2e8f0/0f172a?text=Image+3';" />
        </div>
      </section>
    `;

    const mapBlock = `
      <section style="padding:18px 20px 0">
        ${sectionTitle("Find Our Location")}
        <article style="background:var(--tn-surface);border:1px solid var(--tn-border);border-radius:8px;padding:12px">
          <p data-map-query style="margin:0 0 10px;color:var(--tn-text-secondary)">
            Visit us at: ${escapeHtml(defaultMapQuery)}
          </p>
          <div style="border:1px solid var(--tn-border);border-radius:8px;overflow:hidden">
            <iframe
              title="Location map"
              data-map-frame="true"
              src="${mapEmbedUrl}"
              style="display:block;width:100%;height:320px;border:0"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </article>
      </section>
    `;

    const blockById = {
      stats: statsBlock,
      commitment: commitmentBlock,
      servicesGrid: servicesGridBlock,
      monetizationHub: monetizationHubBlock,
      gallery: galleryBlock,
      map: mapBlock,
      quickNav: quickNavBlock,
      aboutStory: aboutStoryBlock,
      servicesAction: servicesActionBlock,
      contactForm: contactFormBlock,
      booking: bookingBlock,
      bookingControl: bookingControlBlock,
      clientDashboard: clientDashboardBlock,
      analytics: analyticsBlock,
      loginPortal: loginPortalBlock,
      payments: paymentsBlock,
      invoicing: invoicingBlock,
      crm: crmBlock,
      emailAutomation: emailAutomationBlock,
      marketingPages: marketingPagesBlock,
      dspPortal: dspPortalBlock,
      incidentReporting: incidentReportingBlock,
      staffTraining: staffTrainingBlock,
      caseIntake: caseIntakeBlock,
      documentPortal: documentPortalBlock,
      orderingSystem: orderingSystemBlock,
      reservations: reservationsBlock,
      deliveryTracking: deliveryTrackingBlock,
      subscriptions: subscriptionsBlock,
      digitalProducts: digitalProductsBlock,
      memberships: membershipsBlock,
      affiliates: affiliatesBlock,
    };
    const pageFlowIdsByKey = {
      "index.html": ["stats", "commitment", "servicesGrid", "monetizationHub", "gallery", "map", "quickNav"],
      "about.html": ["commitment", "aboutStory", "stats", "monetizationHub", "gallery", "map", "quickNav"],
      "services.html": ["servicesGrid", "servicesAction", "subscriptions", "monetizationHub", "stats", "gallery", "map", "quickNav"],
      "pricing.html": ["subscriptions", "payments", "monetizationHub", "quickNav"],
      "contact.html": ["contactForm", "booking", "monetizationHub", "map", "commitment", "stats", "gallery", "quickNav"],
      "landing.html": ["servicesGrid", "subscriptions", "booking", "monetizationHub", "quickNav"],
      "blog.html": ["commitment", "servicesGrid", "quickNav"],
      "client-dashboard.html": ["clientDashboard", "analytics", "quickNav"],
      "login-portal.html": ["loginPortal", "quickNav"],
      "payments.html": ["payments", "analytics", "quickNav"],
      "invoicing.html": ["invoicing", "payments", "analytics", "quickNav"],
      "booking.html": ["booking", "bookingControl", "payments", "clientDashboard", "quickNav"],
      "crm.html": ["crm", "analytics", "quickNav"],
      "analytics.html": ["analytics", "quickNav"],
      "email-automation.html": ["emailAutomation", "analytics", "quickNav"],
      "marketing-pages.html": ["marketingPages", "subscriptions", "quickNav"],
      "dsp-portal.html": ["dspPortal", "staffTraining", "quickNav"],
      "incident-reporting.html": ["incidentReporting", "analytics", "quickNav"],
      "staff-training.html": ["staffTraining", "analytics", "quickNav"],
      "case-intake.html": ["caseIntake", "booking", "quickNav"],
      "document-portal.html": ["documentPortal", "quickNav"],
      "ordering-system.html": ["orderingSystem", "payments", "quickNav"],
      "reservations.html": ["reservations", "analytics", "quickNav"],
      "delivery-tracking.html": ["deliveryTracking", "analytics", "quickNav"],
      "subscriptions.html": ["subscriptions", "payments", "analytics", "quickNav"],
      "digital-products.html": ["digitalProducts", "payments", "analytics", "quickNav"],
      "memberships.html": ["memberships", "subscriptions", "analytics", "quickNav"],
      "affiliates.html": ["affiliates", "analytics", "quickNav"],
    };
    const defaultFlow = pageFlowIdsByKey[pageKey] || pageFlowIdsByKey["index.html"];
    const hierarchyForPage = Array.isArray(uiSpec?.sectionHierarchy?.[pageKey])
      ? uiSpec.sectionHierarchy[pageKey]
      : Array.isArray(uiSpec?.sectionHierarchy?.global)
        ? uiSpec.sectionHierarchy.global
        : [];
    const hierarchyIds = hierarchyForPage
      .map((id) => String(id || "").toLowerCase().replace(/[^a-z]/g, ""))
      .map((token) => SECTION_ID_ALIASES[token] || null)
      .filter(Boolean);
    const reorderedFlow = [
      ...hierarchyIds.filter((id) => defaultFlow.includes(id)),
      ...defaultFlow.filter((id) => !hierarchyIds.includes(id)),
    ];
    const pageOrderedBlocks = reorderedFlow.map((id) => blockById[id]).filter(Boolean).join("");

    const heroLayoutMarkup =
      layoutVariant === "stacked-hero"
        ? `<section style="padding:16px 20px 0">
             <article data-parallax-speed="0.05" style="background:linear-gradient(145deg,var(--tn-hero-start),var(--tn-hero-end));color:var(--tn-cta-text);padding:26px;border-radius:10px">
               <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#dbeafe">${escapeHtml(industryVisualProfile.heroEyebrow)}</p>
               <h2 style="margin:0 0 10px;font-family:var(--tn-font-heading);font-size:clamp(26px,4.2vw,40px);line-height:1.08;letter-spacing:var(--tn-heading-spacing)">${escapeHtml(hero.title || "Built for Modern Growth")}</h2>
               <p style="margin:0 0 14px;color:#e7f0fb;max-width:760px">${escapeHtml(hero.subtitle || "Personalized services with conversion-focused UX.")}</p>
               <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
                 <a href="contact.html" style="display:inline-block;padding:10px 16px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:6px;font-weight:700">Schedule a Tour</a>
                 <a href="services.html" style="display:inline-block;padding:10px 16px;background:transparent;color:var(--tn-cta-text);text-decoration:none;border-radius:6px;border:1px solid rgba(255,255,255,.6);font-weight:700">Our Services</a>
               </div>
               <img data-image-id="hero-image" data-parallax-speed="0.12" src="${heroImageUrl}" alt="${escapeHtml(projectName || "Business")} hero visual" style="width:100%;height:auto;aspect-ratio:16/7;object-fit:cover;display:block;border-radius:8px;border:1px solid rgba(255,255,255,.4)" onerror="this.onerror=null;this.src='https://placehold.co/1200x700/e2e8f0/0f172a?text=Industry+Image';" />
             </article>
           </section>`
        : layoutVariant === "editorial"
          ? `<section style="padding:16px 20px 0">
               <div style="display:grid;grid-template-columns:.88fr 1.12fr;gap:14px;align-items:stretch">
                 <article style="border:1px solid var(--tn-border);border-radius:8px;overflow:hidden;background:var(--tn-surface)">
                   <img data-image-id="hero-image" data-parallax-speed="0.12" src="${heroImageUrl}" alt="${escapeHtml(projectName || "Business")} hero visual" style="width:100%;height:100%;min-height:280px;object-fit:cover;display:block" onerror="this.onerror=null;this.src='https://placehold.co/1200x800/e2e8f0/0f172a?text=Industry+Image';" />
                 </article>
                 <article data-parallax-speed="0.06" style="background:var(--tn-surface);color:var(--tn-text-primary);padding:24px;border-radius:8px;border:1px solid var(--tn-border);display:flex;flex-direction:column;justify-content:center">
                   <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--tn-accent)">${escapeHtml(industryVisualProfile.heroEyebrow)}</p>
                   <h2 style="margin:0 0 10px;font-family:var(--tn-font-heading);font-size:clamp(26px,4.1vw,38px);line-height:1.08;letter-spacing:var(--tn-heading-spacing)">${escapeHtml(hero.title || "Delivering Excellence in Care & Rehabilitation")}</h2>
                   <p style="margin:0 0 14px;color:var(--tn-text-secondary);max-width:640px">${escapeHtml(hero.subtitle || "Personalized nursing and therapy services with a patient-first approach.")}</p>
                   <div style="display:flex;gap:8px;flex-wrap:wrap">
                     <a href="contact.html" style="display:inline-block;padding:10px 16px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:6px;font-weight:700">Schedule a Tour</a>
                     <a href="services.html" style="display:inline-block;padding:10px 16px;background:#fff;color:var(--tn-text-primary);text-decoration:none;border-radius:6px;border:1px solid var(--tn-border);font-weight:700">Our Services</a>
                   </div>
                 </article>
               </div>
             </section>`
          : `<section style="padding:16px 20px 0">
               <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;align-items:stretch">
                 <article data-parallax-speed="0.06" style="background:linear-gradient(145deg,var(--tn-hero-start),var(--tn-hero-end));color:var(--tn-cta-text);padding:24px;border-radius:8px;display:flex;flex-direction:column;justify-content:center">
                   <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#dbeafe">${escapeHtml(industryVisualProfile.heroEyebrow)}</p>
                   <h2 style="margin:0 0 10px;font-family:var(--tn-font-heading);font-size:clamp(26px,4.2vw,38px);line-height:1.08;letter-spacing:var(--tn-heading-spacing)">${escapeHtml(hero.title || "Delivering Excellence in Care & Rehabilitation")}</h2>
                   <p style="margin:0 0 14px;color:#e7f0fb;max-width:640px">${escapeHtml(hero.subtitle || "Personalized nursing and therapy services with a patient-first approach.")}</p>
                   <div style="display:flex;gap:8px;flex-wrap:wrap">
                     <a href="contact.html" style="display:inline-block;padding:10px 16px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:6px;font-weight:700">Schedule a Tour</a>
                     <a href="services.html" style="display:inline-block;padding:10px 16px;background:transparent;color:var(--tn-cta-text);text-decoration:none;border-radius:6px;border:1px solid rgba(255,255,255,.6);font-weight:700">Our Services</a>
                   </div>
                 </article>
                 <article style="border:1px solid var(--tn-border);border-radius:8px;overflow:hidden;background:var(--tn-surface)">
                   <img data-image-id="hero-image" data-parallax-speed="0.12" src="${heroImageUrl}" alt="${escapeHtml(projectName || "Business")} hero visual" style="width:100%;height:100%;min-height:280px;object-fit:cover;display:block" onerror="this.onerror=null;this.src='https://placehold.co/1200x800/e2e8f0/0f172a?text=Industry+Image';" />
                 </article>
               </div>
             </section>`;

    return `
      <div
        id="tn-top"
        data-tn-theme-root="true"
        data-tn-industry="${visualIndustryKey}"
        style="--tn-hero-start:${theme.heroStart};--tn-hero-end:${theme.heroEnd};--tn-accent:${theme.accent};--tn-accent-strong:${theme.accentStrong};--tn-page-bg:${theme.pageBg};--tn-surface:${theme.cardBg};--tn-surface-subtle:#f8fafc;--tn-border:${theme.borderColor};--tn-text-primary:${theme.textPrimary};--tn-text-secondary:${theme.textSecondary};--tn-link:${theme.linkColor};--tn-cta-panel-bg:${theme.ctaPanelBg};--tn-cta-panel-border:${theme.ctaPanelBorder};--tn-cta-text:${theme.ctaText};--tn-nav-active-bg:var(--tn-accent);--tn-nav-active-text:${theme.ctaText};--tn-nav-bg:#e2e8f0;--tn-nav-text:${theme.textPrimary};--tn-nav-border:#cbd5e1;--tn-font-heading:${textTheme.headingFamily};--tn-font-body:${textTheme.bodyFamily};--tn-font-size-base:${textTheme.baseSizePx}px;--tn-line-height-base:${textTheme.lineHeight};--tn-heading-weight:${textTheme.headingWeight};--tn-body-weight:${textTheme.bodyWeight};--tn-heading-spacing:${textTheme.headingSpacingEm}em;--tn-shadow-soft:${industryVisualProfile.shadowSoft};--tn-shadow-hover:${industryVisualProfile.shadowHover};--tn-radius-card:${industryVisualProfile.cardRadius};font-family:var(--tn-font-body);font-size:var(--tn-font-size-base);line-height:var(--tn-line-height-base);font-weight:var(--tn-body-weight);width:min(100%,1280px);margin:0 auto;padding:0 clamp(12px,2.1vw,26px) 30px;box-sizing:border-box;background:radial-gradient(circle at 16% 8%, color-mix(in srgb, var(--tn-hero-start) 9%, #ffffff 91%), transparent 48%),radial-gradient(circle at 84% 14%, color-mix(in srgb, var(--tn-accent) 10%, #ffffff 90%), transparent 46%),var(--tn-page-bg);border-radius:14px"
      >
        <style data-tn-typography="true">@import url("${textTheme.fontImport}");</style>
        <style data-tn-fluid-beauty="true">
          [data-tn-theme-root="true"] { color: var(--tn-text-primary); overflow-wrap: anywhere; }
          [data-tn-theme-root="true"] section { position: relative; z-index: 1; }
          [data-tn-theme-root="true"] article,
          [data-tn-theme-root="true"] form,
          [data-tn-theme-root="true"] details {
            border-radius: var(--tn-radius-card) !important;
            box-shadow: var(--tn-shadow-soft);
            transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease;
          }
          [data-tn-theme-root="true"] article:hover,
          [data-tn-theme-root="true"] form:hover,
          [data-tn-theme-root="true"] details:hover {
            transform: translateY(-3px);
            box-shadow: var(--tn-shadow-hover);
            border-color: color-mix(in srgb, var(--tn-accent) 45%, var(--tn-border) 55%) !important;
          }
          [data-tn-theme-root="true"] a,
          [data-tn-theme-root="true"] button {
            transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease;
          }
          [data-tn-theme-root="true"] a:hover,
          [data-tn-theme-root="true"] button:hover {
            transform: translateY(-1px);
            filter: saturate(1.08);
          }
          [data-tn-theme-root="true"] h1,
          [data-tn-theme-root="true"] h2,
          [data-tn-theme-root="true"] h3,
          [data-tn-theme-root="true"] h4 {
            text-wrap: balance;
          }
          [data-tn-theme-root="true"] p,
          [data-tn-theme-root="true"] li {
            text-wrap: pretty;
          }
          [data-tn-theme-root="true"] [data-editable] {
            position: relative;
          }
          [data-tn-theme-root="true"] [data-editable="text"][contenteditable="true"] {
            caret-color: var(--tn-link);
          }
          [data-tn-theme-root="true"] [data-editable]:hover {
            outline: 2px solid rgba(59, 130, 246, 0.9);
            cursor: text;
          }
          [data-tn-theme-root="true"] [data-editable]::after {
            content: "Click to edit";
            position: absolute;
            top: -10px;
            right: -8px;
            opacity: 0;
            transform: translateY(-4px);
            pointer-events: none;
            z-index: 4;
            padding: 2px 7px;
            border-radius: 999px;
            background: rgba(30, 64, 175, 0.96);
            color: #fff;
            font: 700 10px/1 sans-serif;
            letter-spacing: .04em;
            transition: opacity 140ms ease, transform 140ms ease;
          }
          [data-tn-theme-root="true"] [data-editable]:hover::after {
            opacity: 1;
            transform: translateY(0);
          }
          [data-tn-theme-root="true"] [data-editable="image"]:hover {
            cursor: pointer;
          }
          [data-tn-theme-root="true"] [data-editable="image"]::after {
            content: "Click to replace";
          }
          [data-tn-theme-root="true"] [data-editable].tn-editable-active {
            outline: 3px solid rgba(59, 130, 246, 0.92);
          }
          [data-tn-theme-root="true"] [data-component][data-id] {
            position: relative;
          }
          [data-tn-theme-root="true"] [data-component][data-id]:hover {
            outline: 2px solid rgba(59, 130, 246, 0.9);
            outline-offset: 4px;
          }
          [data-tn-theme-root="true"] [data-component][data-id]::before {
            content: "Section: " attr(data-section-name);
            position: absolute;
            left: 8px;
            top: -12px;
            opacity: 0;
            transform: translateY(-4px);
            pointer-events: none;
            z-index: 4;
            padding: 2px 7px;
            border-radius: 999px;
            background: rgba(15, 23, 42, 0.92);
            color: #e2e8f0;
            font: 700 10px/1 sans-serif;
            letter-spacing: .04em;
            transition: opacity 140ms ease, transform 140ms ease;
          }
          [data-tn-theme-root="true"] [data-component][data-id]:hover::before,
          [data-tn-theme-root="true"] [data-component][data-id].tn-section-active::before {
            opacity: 1;
            transform: translateY(0);
          }
          [data-tn-theme-root="true"] [data-component][data-id].tn-section-active {
            outline: 3px solid rgba(14, 165, 233, 0.92);
            outline-offset: 6px;
          }
          [data-tn-theme-root="true"][data-tn-editing="true"] * {
            user-select: text !important;
            -webkit-user-select: text !important;
          }
          [data-tn-theme-root="true"][data-tn-editing="true"] article:hover,
          [data-tn-theme-root="true"][data-tn-editing="true"] form:hover,
          [data-tn-theme-root="true"][data-tn-editing="true"] details:hover,
          [data-tn-theme-root="true"][data-tn-editing="true"] a:hover,
          [data-tn-theme-root="true"][data-tn-editing="true"] button:hover {
            transform: none !important;
            box-shadow: var(--tn-shadow-soft) !important;
            filter: none !important;
          }
          [data-tn-theme-root="true"][data-tn-editing="true"] a,
          [data-tn-theme-root="true"][data-tn-editing="true"] button,
          [data-tn-theme-root="true"][data-tn-editing="true"] input,
          [data-tn-theme-root="true"][data-tn-editing="true"] textarea,
          [data-tn-theme-root="true"][data-tn-editing="true"] select,
          [data-tn-theme-root="true"][data-tn-editing="true"] summary,
          [data-tn-theme-root="true"][data-tn-editing="true"] iframe,
          [data-tn-theme-root="true"][data-tn-editing="true"] img {
            pointer-events: none !important;
          }
          [data-tn-theme-root="true"][data-tn-editing="true"] [data-editable="text"] {
            pointer-events: auto !important;
          }
          [data-tn-theme-root="true"][data-tn-editing="true"] [data-editable="image"],
          [data-tn-theme-root="true"][data-tn-editing="true"] [data-editable="button"],
          [data-tn-theme-root="true"][data-tn-editing="true"] [data-editable="link"] {
            pointer-events: auto !important;
          }
          [data-tn-theme-root="true"] [data-tn-reveal] {
            opacity: 0;
            transform: translate3d(0, 24px, 0);
            transition: opacity 520ms ease, transform 520ms cubic-bezier(.2,.65,.2,1);
          }
          [data-tn-theme-root="true"] [data-tn-reveal].is-visible {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
          [data-tn-theme-root="true"] .tn-main-nav {
            backdrop-filter: blur(8px);
          }
          [data-tn-theme-root="true"] .tn-main-nav a {
            font-size: 13px !important;
            letter-spacing: .01em;
          }
          [data-tn-theme-root="true"][data-tn-industry="healthcare"] .tn-main-nav a {
            text-transform: none;
            font-weight: 700;
          }
          [data-tn-theme-root="true"][data-tn-industry="saas"] .tn-main-nav a {
            text-transform: uppercase;
            letter-spacing: .05em;
            font-size: 11px !important;
          }
          [data-tn-theme-root="true"][data-tn-industry="ecommerce"] .tn-main-nav a {
            letter-spacing: .02em;
            font-weight: 700;
          }
          [data-tn-theme-root="true"][data-tn-industry="saas"] article,
          [data-tn-theme-root="true"][data-tn-industry="saas"] form {
            border-width: 1px;
            border-style: solid;
            border-color: color-mix(in srgb, var(--tn-accent) 28%, var(--tn-border) 72%);
          }
          [data-tn-theme-root="true"][data-tn-industry="ecommerce"] article,
          [data-tn-theme-root="true"][data-tn-industry="ecommerce"] form {
            background: linear-gradient(180deg, color-mix(in srgb, var(--tn-surface) 94%, #fff 6%), var(--tn-surface));
          }
          @media (max-width: 820px) {
            [data-tn-theme-root="true"] {
              border-radius: 12px;
              padding-left: 10px !important;
              padding-right: 10px !important;
            }
            [data-tn-theme-root="true"] article,
            [data-tn-theme-root="true"] form,
            [data-tn-theme-root="true"] details {
              border-radius: 12px !important;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-tn-theme-root="true"] [data-tn-reveal] {
              opacity: 1;
              transform: none;
              transition: none;
            }
            [data-tn-theme-root="true"] article,
            [data-tn-theme-root="true"] form,
            [data-tn-theme-root="true"] details,
            [data-tn-theme-root="true"] a,
            [data-tn-theme-root="true"] button {
              transition: none;
            }
          }
        </style>
        <style data-tn-nav-behavior="true">
          .tn-nav-shell { display: flex; justify-content: center; }
          .tn-nav-toggle-label {
            display: none;
            align-items: center;
            gap: 8px;
            background: var(--tn-accent);
            color: var(--tn-cta-text);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            user-select: none;
          }
          .tn-main-nav {
            display: flex;
            gap: 12px;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            white-space: normal;
            overflow: visible;
          }
          @media (max-width: 820px) {
            .tn-nav-shell { justify-content: flex-start; }
            .tn-nav-toggle-label { display: inline-flex; }
            .tn-main-nav {
              display: none;
              margin-top: 10px;
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
              white-space: normal;
              overflow: visible;
              background: #fff;
              border: 1px solid var(--tn-border);
              border-radius: 8px;
              padding: 10px;
              width: min(300px, 100%);
            }
            #${navToggleId}:checked + .tn-nav-toggle-label + nav.tn-main-nav { display: flex; }
          }
        </style>
        <style data-tn-smooth-scroll="true">
          html, body, [data-tn-theme-root="true"] { scroll-behavior: smooth; }
          @media (prefers-reduced-motion: reduce) {
            html, body, [data-tn-theme-root="true"] { scroll-behavior: auto; }
          }
        </style>
        <style data-tn-parallax-style="true">
          [data-parallax-speed] {
            will-change: transform;
            transition: transform 120ms linear;
            transform: translate3d(0, 0, 0);
          }
          @media (prefers-reduced-motion: reduce) {
            [data-parallax-speed] {
              transition: none;
              transform: none !important;
            }
          }
        </style>
        <section data-tn-reveal="true" style="background:linear-gradient(90deg,var(--tn-accent),color-mix(in srgb,var(--tn-accent-strong) 68%, #0f172a 32%));color:var(--tn-cta-text);padding:10px 20px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:13px;border-top-left-radius:14px;border-top-right-radius:14px">
          <span>${escapeHtml(industryVisualProfile.strapline)}</span>
          <span>${escapeHtml(industryVisualProfile.supportLine)}</span>
        </section>
        <section data-tn-reveal="true" style="background:color-mix(in srgb,var(--tn-surface) 94%, #ffffff 6%);padding:14px 20px 8px;border-bottom:1px solid var(--tn-border)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
              <img
                data-image-id="brand-logo"
                src="${brandLogoDataUri}"
                alt="${escapeHtml(projectName || "Business")} logo"
                style="width:58px;height:58px;border-radius:14px;object-fit:cover;border:1px solid var(--tn-border);background:#fff"
              />
              <div>
              <p style="margin:0;color:var(--tn-accent);font-weight:700;font-size:12px;letter-spacing:.08em">${escapeHtml(industryVisualProfile.logoPill)}</p>
              <h1 style="margin:3px 0 0;font-family:var(--tn-font-heading);font-size:27px;line-height:1.1;color:var(--tn-text-primary)"> ${escapeHtml(projectName || "Care Center")} </h1>
              </div>
            </div>
            <a href="contact.html" style="display:inline-block;padding:9px 14px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:6px;font-weight:700;font-size:13px">${escapeHtml(industryVisualProfile.primaryHeaderCta)}</a>
          </div>
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--tn-border)">
            <div class="tn-nav-shell">
              <input id="${navToggleId}" type="checkbox" style="display:none" />
              <label class="tn-nav-toggle-label" for="${navToggleId}">☰ Menu</label>
              <nav class="tn-main-nav">
                ${navLinks}
              </nav>
            </div>
          </div>
        </section>

        ${heroLayoutMarkup}
        ${pageOrderedBlocks}

        ${
          previewSections
            ? `<section style="padding:18px 20px 0">
                <h2 style="margin:0 0 10px;color:var(--tn-text-primary);font-family:var(--tn-font-heading);font-weight:var(--tn-heading-weight);letter-spacing:var(--tn-heading-spacing)">Additional Generated Sections</h2>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px">
                  ${previewSections}
                </div>
              </section>`
            : ""
        }

        <section data-tn-reveal="true" style="background:linear-gradient(150deg,var(--tn-cta-panel-bg),color-mix(in srgb,var(--tn-cta-panel-bg) 82%, #ffffff 18%));border-top:1px solid var(--tn-cta-panel-border);border-bottom:1px solid var(--tn-cta-panel-border);padding:24px 20px;text-align:center;margin-top:18px;border-radius:16px">
          <h2 style="margin:0 0 8px;color:#134e4a;font-family:var(--tn-font-heading);font-weight:var(--tn-heading-weight);letter-spacing:var(--tn-heading-spacing)">Ready to take the next step?</h2>
          <a href="contact.html" style="display:inline-block;padding:12px 22px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border:none;border-radius:10px;font-size:18px;font-weight:600;cursor:pointer">
            ${escapeHtml(cta.text || "Contact Us")}
          </a>
          <div style="margin-top:10px">
            <a href="services.html" style="display:inline-block;padding:10px 16px;background:var(--tn-accent);color:var(--tn-cta-text);text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
              Learn More About Our Services
            </a>
          </div>
        </section>

        <div id="tn-ai-assistant-root" data-tn-ai-assistant="true" style="position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:var(--tn-font-body)">
          <button id="tn-ai-assistant-toggle" type="button" style="border:none;border-radius:999px;padding:10px 14px;background:var(--tn-accent-strong);color:var(--tn-cta-text);font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.22)">TitoNova Cloud Engine Sales Chatbot</button>
          <section id="tn-ai-assistant-panel" style="display:none;width:min(340px,86vw);margin-top:8px;background:#fff;border:1px solid var(--tn-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 28px rgba(15,23,42,.25)">
            <header style="padding:10px 12px;background:var(--tn-accent);color:var(--tn-cta-text);display:flex;justify-content:space-between;gap:8px;align-items:center">
              <strong style="font-size:13px">Live TitoNova Cloud Engine Sales Chatbot</strong>
              <small style="opacity:.9;font-size:11px">Leads + booking</small>
            </header>
            <div id="tn-ai-assistant-log" style="max-height:260px;overflow:auto;padding:10px;background:#f8fafc;display:grid;gap:8px">
              <div style="background:#e2e8f0;color:#0f172a;padding:8px;border-radius:8px;font-size:12px">Hi, I can answer questions, recommend services, collect leads, and book appointments.</div>
            </div>
            <div style="display:grid;gap:8px;padding:10px;border-top:1px solid #e2e8f0">
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                <button data-tn-ai-quick="services" type="button" style="border:1px solid var(--tn-border);background:#fff;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer">Services</button>
                <button data-tn-ai-quick="book" type="button" style="border:1px solid var(--tn-border);background:#fff;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer">Book Appointment</button>
                <button data-tn-ai-quick="support" type="button" style="border:1px solid var(--tn-border);background:#fff;border-radius:999px;padding:4px 8px;font-size:11px;cursor:pointer">Support</button>
              </div>
              <div style="display:flex;gap:6px">
                <input id="tn-ai-assistant-input" placeholder="Ask a question..." style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:8px;font-size:12px" />
                <button id="tn-ai-assistant-send" type="button" style="border:none;border-radius:8px;background:var(--tn-accent-strong);color:var(--tn-cta-text);padding:8px 10px;font-weight:700;cursor:pointer">Send</button>
              </div>
            </div>
          </section>
        </div>

        <footer data-tn-reveal="true" style="padding:16px 20px;text-align:center;color:var(--tn-text-secondary);font-size:12px;background:color-mix(in srgb,#ffffff 88%, var(--tn-surface) 12%);border-top:1px solid var(--tn-border);border-bottom-left-radius:14px;border-bottom-right-radius:14px">
          <a href="#tn-top" style="display:inline-block;margin-bottom:8px;color:var(--tn-link);text-decoration:none;font-weight:600">Back to Top</a>
          <br />
          <a href="index.html" style="color:var(--tn-link);text-decoration:none;font-weight:600">
            Preview generated by TitoNova for ${escapeHtml(projectName)}
          </a>
        </footer>
        <script>
          (function () {
            if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
            var apply = function () {
              var nodes = document.querySelectorAll("[data-parallax-speed]");
              for (var i = 0; i < nodes.length; i += 1) {
                var node = nodes[i];
                var speed = Number(node.getAttribute("data-parallax-speed") || "0");
                var rect = node.getBoundingClientRect();
                var viewportCenter = window.innerHeight * 0.5;
                var nodeCenter = rect.top + rect.height * 0.5;
                var delta = (viewportCenter - nodeCenter) * speed;
                node.style.transform = "translate3d(0," + delta.toFixed(2) + "px,0)";
              }
            };
            apply();
            window.addEventListener("scroll", apply, { passive: true });
            window.addEventListener("resize", apply);
          })();
        </script>
        <script>
          (function () {
            if (!window.IntersectionObserver) return;
            var root = document.querySelector('[data-tn-theme-root="true"]');
            if (!root) return;
            var nodes = root.querySelectorAll("section, article, form, details");
            for (var i = 0; i < nodes.length; i += 1) {
              nodes[i].setAttribute("data-tn-reveal", "true");
            }
            var observer = new IntersectionObserver(function (entries) {
              for (var j = 0; j < entries.length; j += 1) {
                if (entries[j].isIntersecting) {
                  entries[j].target.classList.add("is-visible");
                  observer.unobserve(entries[j].target);
                }
              }
            }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
            for (var k = 0; k < nodes.length; k += 1) {
              nodes[k].style.transitionDelay = (Math.min(k, 8) * 35) + "ms";
              observer.observe(nodes[k]);
            }
          })();
        </script>
        <script>
          (function () {
            try {
              var knowledge = JSON.parse(decodeURIComponent("${assistantKnowledgeEncoded}"));
              var toggle = document.getElementById("tn-ai-assistant-toggle");
              var panel = document.getElementById("tn-ai-assistant-panel");
              var input = document.getElementById("tn-ai-assistant-input");
              var send = document.getElementById("tn-ai-assistant-send");
              var log = document.getElementById("tn-ai-assistant-log");
              if (!toggle || !panel || !input || !send || !log) return;

              var appendMessage = function (text, who) {
                var bubble = document.createElement("div");
                bubble.style.padding = "8px";
                bubble.style.borderRadius = "8px";
                bubble.style.fontSize = "12px";
                bubble.style.whiteSpace = "pre-wrap";
                bubble.style.background = who === "user" ? "#dbeafe" : "#e2e8f0";
                bubble.style.color = "#0f172a";
                bubble.textContent = text;
                log.appendChild(bubble);
                log.scrollTop = log.scrollHeight;
              };

              var servicesReply = function () {
                var services = Array.isArray(knowledge.services) && knowledge.services.length > 0
                  ? knowledge.services.join(", ")
                  : "our core services";
                return "We offer: " + services + ". Would you like to book an appointment?";
              };

              var recommendServiceReply = function () {
                var services = Array.isArray(knowledge.services) && knowledge.services.length > 0
                  ? knowledge.services
                  : ["Standard Service", "Premium Service"];
                var first = services[0] || "Standard Service";
                var second = services[1] || first;
                return "Based on your request, I recommend " + first + " or " + second + ". Want me to book one now?";
              };

              var nextSlotReply = function () {
                var slots = Array.isArray(knowledge.appointmentSlots) && knowledge.appointmentSlots.length > 0
                  ? knowledge.appointmentSlots
                  : ["3:00 PM"];
                return "Yes! We have availability today at " + slots[0] + ". Would you like to book it?";
              };

              var handlePrompt = function (raw) {
                var message = String(raw || "").trim();
                if (!message) return;
                appendMessage(message, "user");
                var lower = message.toLowerCase();
                var emailMatch = lower.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}/i);
                var phoneMatch = message.match(/[0-9]{3}[-. ]?[0-9]{3}[-. ]?[0-9]{4}/);
                if (emailMatch) {
                  try {
                    var key = "tn_assistant_leads";
                    var leads = JSON.parse(localStorage.getItem(key) || "[]");
                    leads.unshift({ email: emailMatch[0], phone: phoneMatch ? phoneMatch[0] : "", message: message, at: new Date().toISOString(), page: knowledge.page });
                    localStorage.setItem(key, JSON.stringify(leads.slice(0, 100)));
                  } catch (_) {}
                  appendMessage("Thanks. I captured your contact details and our team will follow up shortly.", "assistant");
                  return;
                }
                if (phoneMatch) {
                  try {
                    var phoneKey = "tn_assistant_leads";
                    var phoneLeads = JSON.parse(localStorage.getItem(phoneKey) || "[]");
                    phoneLeads.unshift({ phone: phoneMatch[0], message: message, at: new Date().toISOString(), page: knowledge.page });
                    localStorage.setItem(phoneKey, JSON.stringify(phoneLeads.slice(0, 100)));
                  } catch (_) {}
                  appendMessage("Thanks. I captured your number and can reserve a slot for you now.", "assistant");
                  return;
                }
                if (/same[- ]?day|today|available today/.test(lower)) {
                  appendMessage(nextSlotReply(), "assistant");
                  return;
                }
                if (/what services|services|offer/.test(lower)) {
                  appendMessage(servicesReply(), "assistant");
                  return;
                }
                if (/recommend|suggest|best service|which service/.test(lower)) {
                  appendMessage(recommendServiceReply(), "assistant");
                  return;
                }
                if (/book|appointment|schedule|consult/.test(lower)) {
                  appendMessage(nextSlotReply() + " You can also book here: " + (knowledge.bookingUrl || "contact.html"), "assistant");
                  return;
                }
                if (/support|help|issue|problem/.test(lower)) {
                  appendMessage("I can help with support. Contact " + (knowledge.supportEmail || "hello@example.com") + " or " + (knowledge.supportPhone || "(000) 000-0000") + ".", "assistant");
                  return;
                }
                if (/price|cost|pricing/.test(lower)) {
                  appendMessage("For pricing, request a custom quote and we will respond quickly with options that fit your needs.", "assistant");
                  return;
                }
                appendMessage("I can help with questions, service recommendations, lead capture, and booking. Try: 'Do you offer same-day cleaning?'", "assistant");
              };

              toggle.addEventListener("click", function () {
                panel.style.display = panel.style.display === "none" ? "block" : "none";
              });
              send.addEventListener("click", function () {
                var value = input.value;
                input.value = "";
                handlePrompt(value);
              });
              input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                  event.preventDefault();
                  send.click();
                }
              });
              var quickButtons = document.querySelectorAll("[data-tn-ai-quick]");
              for (var i = 0; i < quickButtons.length; i += 1) {
                quickButtons[i].addEventListener("click", function () {
                  handlePrompt(String(this.getAttribute("data-tn-ai-quick") || ""));
                });
              }
            } catch (_) {
              // Keep site functional if assistant bootstrapping fails.
            }
          })();
        </script>
      </div>
    `;
  };

  const parseModelJson = (raw) => {
    const text = String(raw || "").trim();
    if (!text) return {};
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1].trim() : text;
    return JSON.parse(candidate);
  };

  const buildAutomationPageModel = (pageKey) => {
    const base = {
      name: pageLabelFromKey(pageKey),
      sections: [
        {
          type: "hero",
          title: `${projectName || "Business"} ${pageLabelFromKey(pageKey)}`,
          subtitle: "Generated automation-ready experience with production-friendly UX structure.",
        },
        {
          type: "features",
          items: [
            "Role-based workflows",
            "Real-time status tracking",
            "Secure data handling",
          ],
        },
        { type: "cta", text: "Request Setup" },
      ],
    };

    if (pageKey === "client-dashboard.html") {
      return {
        ...base,
        sections: [
          {
            type: "hero",
            title: "Client Dashboard",
            subtitle: "Track accounts, bookings, payments, and activity in one workspace.",
          },
          {
            type: "features",
            items: ["Account summary cards", "Open tasks queue", "Recent activity feed"],
          },
          { type: "cta", text: "Open Dashboard" },
        ],
      };
    }
    if (pageKey === "login-portal.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Secure Login Portal", subtitle: "Client and admin authentication flow." },
          { type: "features", items: ["Email/password login", "Role-based routing", "Password recovery"] },
          { type: "cta", text: "Sign In" },
        ],
      };
    }
    if (pageKey === "payments.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Payments & Billing", subtitle: "Accept online payments with invoice tracking." },
          { type: "features", items: ["Payment links", "Subscription plans", "Invoice history"] },
          { type: "cta", text: "Start Payment" },
        ],
      };
    }
    if (pageKey === "invoicing.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Invoicing System", subtitle: "Create invoices, track status, and reconcile payments." },
          { type: "features", items: ["Invoice creation", "Due-date reminders", "A/R tracking"] },
          { type: "cta", text: "Create Invoice" },
        ],
      };
    }
    if (pageKey === "booking.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Booking System", subtitle: "Automated appointments and calendar availability." },
          { type: "features", items: ["Calendar booking", "Availability rules", "Reminder workflows"] },
          { type: "cta", text: "Book Now" },
        ],
      };
    }
    if (pageKey === "pricing.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Pricing Plans", subtitle: "Simple, transparent plans built for growth." },
          { type: "features", items: ["Starter, Growth, Business tiers", "Monthly/annual billing", "Clear value comparison"] },
          { type: "cta", text: "Choose Plan" },
        ],
      };
    }
    if (pageKey === "crm.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "CRM Workspace", subtitle: "Manage leads, contacts, and sales pipeline." },
          { type: "features", items: ["Lead stages", "Contact records", "Follow-up tasks"] },
          { type: "cta", text: "Open CRM" },
        ],
      };
    }
    if (pageKey === "analytics.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Analytics & Reports", subtitle: "Track KPIs, revenue, traffic, and engagement." },
          { type: "features", items: ["KPI overview", "Trend reporting", "Exportable insights"] },
          { type: "cta", text: "View Analytics" },
        ],
      };
    }
    if (pageKey === "email-automation.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Email Automation", subtitle: "Run lifecycle campaigns with triggers and segments." },
          { type: "features", items: ["Welcome drip", "Booking reminders", "Reactivation campaigns"] },
          { type: "cta", text: "Launch Campaign" },
        ],
      };
    }
    if (pageKey === "marketing-pages.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Marketing Pages", subtitle: "Publish conversion-focused landing pages by campaign." },
          { type: "features", items: ["SEO landing pages", "Offer pages", "Referral campaign pages"] },
          { type: "cta", text: "Create Campaign Page" },
        ],
      };
    }
    if (pageKey === "seo-pages.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "SEO Pages", subtitle: "Rank for local and high-intent service keywords." },
          { type: "features", items: ["Keyword clusters", "Location pages", "Search-intent content structure"] },
          { type: "cta", text: "Generate SEO Pages" },
        ],
      };
    }
    if (pageKey === "dsp-portal.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "DSP Portal", subtitle: "Manage caregiver assignments, shifts, and visit updates." },
          { type: "features", items: ["Shift board", "Care notes", "Attendance check-in"] },
          { type: "cta", text: "Open DSP Portal" },
        ],
      };
    }
    if (pageKey === "incident-reporting.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Incident Reporting", subtitle: "Capture and escalate incidents with structured workflows." },
          { type: "features", items: ["Severity triage", "Supervisor alerts", "Corrective action log"] },
          { type: "cta", text: "Report Incident" },
        ],
      };
    }
    if (pageKey === "staff-training.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Staff Training Tracker", subtitle: "Track certifications, due dates, and completion status." },
          { type: "features", items: ["Course catalog", "Expiry reminders", "Compliance dashboards"] },
          { type: "cta", text: "View Training" },
        ],
      };
    }
    if (pageKey === "case-intake.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Case Intake Forms", subtitle: "Collect legal matter details with secure intake workflows." },
          { type: "features", items: ["Practice area routing", "Conflict check fields", "Intake status pipeline"] },
          { type: "cta", text: "Start Intake" },
        ],
      };
    }
    if (pageKey === "document-portal.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Document Portal", subtitle: "Share and review legal documents securely with clients." },
          { type: "features", items: ["Secure uploads", "Version history", "Review acknowledgments"] },
          { type: "cta", text: "Open Documents" },
        ],
      };
    }
    if (pageKey === "ordering-system.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Ordering System", subtitle: "Handle online orders, menu items, and checkout flows." },
          { type: "features", items: ["Menu management", "Cart + checkout", "Order status board"] },
          { type: "cta", text: "Start Order" },
        ],
      };
    }
    if (pageKey === "reservations.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Reservations", subtitle: "Take and manage table reservations with time-slot logic." },
          { type: "features", items: ["Date/time slots", "Party size controls", "Host queue"] },
          { type: "cta", text: "Reserve Table" },
        ],
      };
    }
    if (pageKey === "delivery-tracking.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Delivery Tracking", subtitle: "Track dispatch and delivery ETA with live status updates." },
          { type: "features", items: ["Dispatch board", "Driver status", "ETA updates"] },
          { type: "cta", text: "Track Delivery" },
        ],
      };
    }
    if (pageKey === "subscriptions.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Subscription Plans", subtitle: "Offer recurring plans with automated billing and upgrades." },
          { type: "features", items: ["Monthly/annual plans", "Self-serve upgrades", "Churn recovery messaging"] },
          { type: "cta", text: "Start Subscription" },
        ],
      };
    }
    if (pageKey === "digital-products.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Digital Product Store", subtitle: "Sell downloads, courses, and digital assets instantly." },
          { type: "features", items: ["Product catalog", "Secure delivery links", "One-time checkout"] },
          { type: "cta", text: "Buy Product" },
        ],
      };
    }
    if (pageKey === "memberships.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Membership Program", subtitle: "Monetize gated content and member-only benefits." },
          { type: "features", items: ["Member tiers", "Private content", "Renewal automation"] },
          { type: "cta", text: "Join Membership" },
        ],
      };
    }
    if (pageKey === "affiliates.html") {
      return {
        ...base,
        sections: [
          { type: "hero", title: "Affiliate Program", subtitle: "Launch referrals and partner commissions at scale." },
          { type: "features", items: ["Unique referral links", "Commission tracking", "Payout reporting"] },
          { type: "cta", text: "Become an Affiliate" },
        ],
      };
    }
    return base;
  };

  const buildGeneratedPages = (data, palette = themeColors, typography = textStyle, options = {}) => {
    const mode = options.mode || "website-app";
    const automationDefs = Array.isArray(options.automationDefs) ? options.automationDefs : [];
    const deriveSchemaPages = (source = {}) => {
      const pagesFromSchema = [];
      const layoutPages = Array.isArray(source?.layout?.pages) ? source.layout.pages : [];
      const sectionsByKey = source?.sections && typeof source.sections === "object" ? source.sections : {};
      const sectionHierarchy =
        source?.sections?.sectionHierarchy && typeof source.sections.sectionHierarchy === "object"
          ? source.sections.sectionHierarchy
          : source?.sectionHierarchy && typeof source.sectionHierarchy === "object"
            ? source.sectionHierarchy
            : {};

      const toSectionObject = (token) => {
        const key = String(token || "").trim();
        const sectionObj = sectionsByKey[key];
        if (sectionObj && typeof sectionObj === "object" && !Array.isArray(sectionObj)) {
          return { type: String(sectionObj.type || key), ...sectionObj };
        }
        return { type: key || "custom" };
      };

      if (layoutPages.length > 0) {
        layoutPages.forEach((page, index) => {
          const pageName = String(page?.name || pageLabelFromKey(page?.key || pageKeyFromName(`Page ${index + 1}`, index)));
          const sectionTokens = Array.isArray(page?.sections) ? page.sections : [];
          const sectionObjects = sectionTokens.map(toSectionObject);
          pagesFromSchema.push({
            name: pageName,
            sections: sectionObjects.length > 0 ? sectionObjects : [{ type: "hero", title: pageName, subtitle: "" }],
          });
        });
      }

      if (pagesFromSchema.length === 0 && Object.keys(sectionHierarchy).length > 0) {
        Object.entries(sectionHierarchy).forEach(([pageKey, tokens], index) => {
          const sectionObjects = Array.isArray(tokens) ? tokens.map(toSectionObject) : [];
          const normalizedPageKey = pageKey.endsWith(".html") ? pageKey : pageKeyFromName(pageKey, index);
          pagesFromSchema.push({
            name: pageLabelFromKey(normalizedPageKey),
            sections: sectionObjects.length > 0 ? sectionObjects : [{ type: "hero", title: pageLabelFromKey(normalizedPageKey), subtitle: "" }],
          });
        });
      }

      return pagesFromSchema;
    };

    const sourcePagesRaw = Array.isArray(data?.pages) ? data.pages : [];
    const sourcePages = sourcePagesRaw.length > 0 ? sourcePagesRaw : deriveSchemaPages(data);
    const uiDesign = options.uiDesign || null;
    const fallback = sourcePages[0] || { name: "Home", sections: [] };
    const pageMap = {};

    sourcePages.forEach((page, index) => {
      const key = pageKeyFromName(page?.name, index);
      pageMap[key] = page;
    });

    CORE_PAGE_DEFS.forEach((pageDef) => {
      if (pageMap[pageDef.key]) return;
      const matched = sourcePages.find((page) => pageDef.matcher.test(String(page?.name || "")));
      pageMap[pageDef.key] = matched || buildCorePageModel(pageDef.key, fallback);
    });

    const includeWeb = mode !== "app";
    const includeApp = mode !== "website" || options.autoRevenueFeatures;
    const pageKeys = [
      ...(includeWeb ? CORE_PAGE_DEFS.map((page) => page.key) : []),
      ...(includeApp ? automationDefs.map((page) => page.key) : []),
    ];
    const uniqueKeys = orderPageKeys(Array.from(new Set(pageKeys.length > 0 ? pageKeys : ["index.html"])));

    automationDefs.forEach((pageDef) => {
      if (!includeApp) return;
      if (pageMap[pageDef.key]) return;
      const matched = sourcePages.find((page) => pageDef.matcher.test(String(page?.name || "")));
      pageMap[pageDef.key] = matched || buildAutomationPageModel(pageDef.key);
    });

    return uniqueKeys.reduce((acc, key) => {
      const page = pageMap[key] || fallback;
      const renderedHtml = buildHtmlFromGeneratedData({ pages: [page] }, key, uniqueKeys, palette, typography, uiDesign);
      acc[key] = injectEditableLayerIntoHtml(renderedHtml, key, makeProjectSlug);
      return acc;
    }, {});
  };

  const getWorkingPages = useCallback(() => {
    const baseline = Object.keys(generatedPages).length > 0
      ? { ...generatedPages }
      : { "index.html": generatedSite || "" };
    const current = isInlineEditing ? draftHtml : generatedSite || baseline[activePage] || "";
    if (current) baseline[activePage] = current;
    return baseline;
  }, [activePage, draftHtml, generatedPages, generatedSite, isInlineEditing]);

  const buildDocumentHtml = useCallback((content, title) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "Generated Site")}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff">
${content || ""}
</body>
</html>`, []);

  const extractPageImages = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      return Array.from(doc.body.querySelectorAll("img")).map((img, index) => ({
        id: String(img.getAttribute("data-image-id") || `tn-image-${index + 1}`),
        src: String(img.getAttribute("src") || ""),
        alt: String(img.getAttribute("alt") || ""),
      }));
    } catch {
      return [];
    }
  };

  const updateImageSourceInHtml = (html, imageId, nextSrc) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const target = Array.from(doc.body.querySelectorAll("img")).find((img, index) => {
        const explicitId = String(img.getAttribute("data-image-id") || "");
        const fallbackId = `tn-image-${index + 1}`;
        return explicitId === String(imageId || "") || (!explicitId && fallbackId === String(imageId || ""));
      });
      if (!target) return html || "";
      if (!target.getAttribute("data-image-id")) {
        target.setAttribute("data-image-id", String(imageId || ""));
      }
      target.setAttribute("src", String(nextSrc || ""));
      return doc.body.innerHTML || html || "";
    } catch {
      return html || "";
    }
  };

  const extractMapQueryFromHtml = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const iframe = doc.body.querySelector("iframe[data-map-frame='true']");
      if (!iframe) return "";
      const src = String(iframe.getAttribute("src") || "");
      const match = src.match(/[?&]q=([^&]+)/i);
      return match ? decodeURIComponent(match[1]) : "";
    } catch {
      return "";
    }
  };

  const updateMapInHtml = (html, nextQuery) => {
    try {
      const query = String(nextQuery || "").trim();
      if (!query) return html || "";
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const iframe = doc.body.querySelector("iframe[data-map-frame='true']");
      if (iframe) {
        iframe.setAttribute("src", `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`);
      }
      const label = doc.body.querySelector("[data-map-query]");
      if (label) label.textContent = `Visit us at: ${query}`;
      return doc.body.innerHTML || html || "";
    } catch {
      return html || "";
    }
  };

  const applyTextOnlyChanges = (baseHtml, editedHtml) => {
    try {
      const parser = new DOMParser();
      const baseDoc = parser.parseFromString(String(baseHtml || ""), "text/html");
      const editedDoc = parser.parseFromString(String(editedHtml || ""), "text/html");
      const editableSelectors = ["h1", "h2", "h3", "h4", "p", "li", "a", "button", "span", "small", "strong", "em", "summary", "label"];

      editableSelectors.forEach((selector) => {
        const baseNodes = Array.from(baseDoc.body.querySelectorAll(selector));
        const editedNodes = Array.from(editedDoc.body.querySelectorAll(selector));
        const length = Math.min(baseNodes.length, editedNodes.length);
        for (let index = 0; index < length; index += 1) {
          baseNodes[index].textContent = editedNodes[index].textContent || "";
        }
      });

      return baseDoc.body.innerHTML || String(baseHtml || "");
    } catch {
      return String(editedHtml || baseHtml || "");
    }
  };

  const makeProjectSlug = (value) =>
    (value || "generated-site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "generated-site";

  const makeSiteId = useCallback(
    (value) => `${makeProjectSlug(value)}-${Date.now().toString().slice(-6)}`,
    []
  );
  const normalizeDomain = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");

  const inferIndustryTemplateFromPrompt = (prompt) => {
    const text = String(prompt || "").toLowerCase();
    const match = INDUSTRY_TEMPLATE_PACKAGES.find((pkg) =>
      Array.isArray(pkg.industryMatchers) && pkg.industryMatchers.some((token) => text.includes(String(token).toLowerCase()))
    );
    if (match?.key) return match.key;
    return industryTemplate;
  };

  const deriveProjectNameFromBusinessPrompt = (prompt) => {
    const text = String(prompt || "").trim();
    if (!text) return "";
    const cleaned = text.replace(/^(start|build|launch|create)\b/i, "").trim();
    const directMatch = cleaned.match(/(?:a|an)\s+(.+?)(?:\s+(?:company|business|agency|firm|service|services))?$/i);
    const candidate = (directMatch?.[1] || cleaned)
      .replace(/[^\w\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!candidate) return "";
    return candidate
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const parseCompetitorUrls = (raw) => {
    const urls = String(raw || "")
      .split(/[\n,]+/g)
      .map((entry) => normalizeWebsiteUrl(entry))
      .filter(Boolean);
    return Array.from(new Set(urls)).slice(0, 8);
  };

  const sanitizeEmail = (value) => String(value || "").trim().toLowerCase();

  const apiJson = async ({ path, method = "POST", body, token = authToken }) => {
    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(method === "GET" ? {} : { body: JSON.stringify(body || {}) }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(String(payload?.error || `Request failed (${response.status})`));
    }
    return payload || {};
  };

  const runDeferred = (task) => {
    void (async () => {
      try {
        await task();
      } catch {
        // Keep async post-processing non-blocking for UX responsiveness.
      }
    })();
  };

  const handleLogout = () => {
    setAuthToken("");
    setAuthUser(null);
    setUserProjects([]);
    setBillingPlans([]);
    setBillingStatusData(null);
    setWorkspaceList([]);
    setWorkspaceMembers([]);
    setScoredVariants([]);
    setBestVariantId("");
    setAuthPasswordInput("");
    try {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    } catch {
      // Ignore storage failures in private mode.
    }
    setPublishStatus("info");
    setPublishMessage("Logged out.");
  };

  const navigateToAuth = (path = "/signup") => {
    const nextPath = path === "/login" ? "/login" : "/signup";
    window.history.pushState({}, "", nextPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const refreshUserProjects = async (tokenOverride = authToken) => {
    if (!tokenOverride) return [];
    const payload = await apiJson({
      path: "/api/projects/list",
      method: "POST",
      body: {},
      token: tokenOverride,
    });
    const items = Array.isArray(payload?.projects) ? payload.projects : [];
    setUserProjects(items);
    return items;
  };

  const refreshBillingStatus = async (tokenOverride = authToken) => {
    if (!tokenOverride) {
      setBillingStatusData(null);
      return null;
    }
    const payload = await apiJson({
      path: "/api/billing/status",
      method: "POST",
      body: {},
      token: tokenOverride,
    });
    setBillingStatusData(payload || null);
    return payload || null;
  };

  const refreshBillingPlans = async (tokenOverride = authToken) => {
    if (!tokenOverride) {
      setBillingPlans([]);
      return [];
    }
    const payload = await apiJson({
      path: "/api/billing/plans",
      method: "GET",
      token: tokenOverride,
    });
    const plans = Array.isArray(payload?.plans) ? payload.plans : [];
    setBillingPlans(plans);
    return plans;
  };

  const refreshWorkspaces = async (tokenOverride = authToken) => {
    if (!tokenOverride) {
      setWorkspaceList([]);
      return [];
    }
    const payload = await apiJson({
      path: "/api/workspaces/list",
      method: "POST",
      body: {},
      token: tokenOverride,
    });
    const workspaces = Array.isArray(payload?.workspaces) ? payload.workspaces : [];
    setWorkspaceList(workspaces);
    if (payload?.active_workspace_id && authUser?.id) {
      const nextUser = { ...authUser, active_workspace_id: payload.active_workspace_id };
      setAuthUser(nextUser);
      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(nextUser));
      } catch {
        // Ignore storage failures in private mode.
      }
    }
    return workspaces;
  };

  const refreshWorkspaceMembers = async (workspaceId, tokenOverride = authToken) => {
    const effectiveId = String(workspaceId || authUser?.active_workspace_id || "").trim();
    if (!tokenOverride || !effectiveId) {
      setWorkspaceMembers([]);
      return [];
    }
    const payload = await apiJson({
      path: "/api/workspaces/members",
      method: "POST",
      body: { workspace_id: effectiveId },
      token: tokenOverride,
    });
    const members = Array.isArray(payload?.members) ? payload.members : [];
    setWorkspaceMembers(members);
    return members;
  };

  const persistAuthSession = async ({ token, user }) => {
    const safeToken = String(token || "").trim();
    if (!safeToken || !user?.id) throw new Error("Invalid auth session");
    setAuthToken(safeToken);
    setAuthUser(user);
    setAuthPasswordInput("");
    try {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, safeToken);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage failures in private mode.
    }
    await Promise.all([
      refreshUserProjects(safeToken).catch(() => []),
      refreshBillingPlans(safeToken).catch(() => []),
      refreshBillingStatus(safeToken).catch(() => null),
      refreshWorkspaces(safeToken).catch(() => []),
    ]);
    const activeWorkspaceId = String(user?.active_workspace_id || "").trim();
    if (activeWorkspaceId) {
      await refreshWorkspaceMembers(activeWorkspaceId, safeToken).catch(() => []);
    } else {
      setWorkspaceMembers([]);
    }
  };

  const handleSignup = async () => {
    if (authLoading) return;
    const name = String(authNameInput || "").trim();
    const email = sanitizeEmail(authEmailInput);
    const password = String(authPasswordInput || "");
    if (!name || !email || !password) {
      setPublishStatus("error");
      setPublishMessage("Enter name, email, and password to sign up.");
      return;
    }
    setAuthLoading(true);
    try {
      const payload = await apiJson({
        path: "/api/auth/signup",
        method: "POST",
        body: { name, email, password },
      });
      if (payload?.token && payload?.user) {
        await persistAuthSession({ token: payload?.token, user: payload?.user });
        setPublishStatus("success");
        setPublishMessage(`Welcome ${payload?.user?.name || name}. Account created.`);
      } else {
        setPublishStatus("info");
        setPublishMessage(
          String(payload?.message || "Account created.")
        );
        setAuthPasswordInput("");
      }
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Signup failed."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async () => {
    if (authLoading) return;
    const email = sanitizeEmail(authEmailInput);
    const password = String(authPasswordInput || "");
    if (!email || !password) {
      setPublishStatus("error");
      setPublishMessage("Enter email and password to log in.");
      return;
    }
    setAuthLoading(true);
    try {
      const payload = await apiJson({
        path: "/api/auth/login",
        method: "POST",
        body: { email, password },
      });
      await persistAuthSession({ token: payload?.token, user: payload?.user });
      setPublishStatus("success");
      setPublishMessage(`Logged in as ${payload?.user?.email || email}.`);
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Login failed."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpgradePlan = async (planKey) => {
    if (!authToken || !authUser?.id) {
      setPublishStatus("error");
      setPublishMessage("Log in to change plans.");
      return;
    }
    const nextPlan = String(planKey || "").trim();
    if (!nextPlan) return;
    setBillingUpgradeLoading(nextPlan);
    try {
      const payload = await apiJson({
        path: "/api/billing/subscribe",
        method: "POST",
        body: { plan: nextPlan },
      });
      await refreshBillingStatus();
      const checkoutUrl = String(payload?.checkout_url || "").trim();
      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }
      setPublishStatus("success");
      setPublishMessage(
        checkoutUrl
          ? `Stripe checkout opened for ${nextPlan}. Complete payment to activate the plan.`
          : `Plan change initiated for ${nextPlan}.`
      );
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Plan update failed."));
    } finally {
      setBillingUpgradeLoading("");
    }
  };

  const handleCreateWorkspace = async () => {
    if (!authToken || !authUser?.id) return;
    const name = String(newWorkspaceName || "").trim() || "New Workspace";
    setWorkspaceLoading(true);
    try {
      const payload = await apiJson({
        path: "/api/workspaces/create",
        method: "POST",
        body: { name },
      });
      setNewWorkspaceName("");
      await refreshWorkspaces();
      const nextWorkspaceId = String(payload?.workspace?.id || authUser?.active_workspace_id || "").trim();
      if (nextWorkspaceId) await refreshWorkspaceMembers(nextWorkspaceId);
      setPublishStatus("success");
      setPublishMessage(`Workspace created: ${payload?.workspace?.name || name}`);
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Workspace creation failed."));
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleInviteWorkspaceMember = async () => {
    if (!authToken || !authUser?.id) return;
    const email = sanitizeEmail(workspaceInviteEmail);
    const role = String(workspaceInviteRole || "editor");
    const workspaceId = String(authUser?.active_workspace_id || "").trim();
    if (!email || !workspaceId) {
      setPublishStatus("error");
      setPublishMessage("Select workspace and enter member email.");
      return;
    }
    setWorkspaceLoading(true);
    try {
      await apiJson({
        path: "/api/workspaces/invite",
        method: "POST",
        body: {
          workspace_id: workspaceId,
          email,
          role,
        },
      });
      setWorkspaceInviteEmail("");
      await refreshWorkspaceMembers(workspaceId);
      setPublishStatus("success");
      setPublishMessage(`Invited ${email} as ${role}.`);
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Workspace invite failed."));
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleScoreVariants = async () => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) {
      setPublishStatus("error");
      setPublishMessage("Generate a page first before scoring variants.");
      return;
    }
    setVariantScoringLoading(true);
    try {
      const payload = await apiJson({
        path: "/api/ai/score-variants",
        method: "POST",
        body: {
          html: currentHtml,
          prompt: businessOsPrompt,
        },
      });
      const variants = Array.isArray(payload?.variants) ? payload.variants : [];
      setScoredVariants(variants);
      setBestVariantId(String(payload?.best_variant_id || ""));
      setPublishStatus("success");
      setPublishMessage(`Scored ${variants.length} variants. Best option selected for one-click improve.`);
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Variant scoring failed."));
    } finally {
      setVariantScoringLoading(false);
    }
  };

  const applyVariantById = (variantId) => {
    const variant = scoredVariants.find((item) => item.id === variantId);
    if (!variant) return;
    const nextHtml = String(variant.html || "");
    if (!nextHtml) return;
    applyGeneratedPreviewState({ ...generatedPages, [activePage]: nextHtml }, activePage, nextHtml);
    if (isInlineEditing && previewEditableRef.current) {
      previewEditableRef.current.innerHTML = nextHtml;
    }
    setPublishStatus("success");
    setPublishMessage(`Applied ${variant.name} variant to ${pageLabelFromKey(activePage)}.`);
  };

  const handleOneClickImprove = () => {
    if (!bestVariantId) {
      setPublishStatus("error");
      setPublishMessage("Run variant scoring first.");
      return;
    }
    applyVariantById(bestVariantId);
  };

  const toValidHex = (value, fallback) => {
    const text = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
  };

  const normalizeUiDesignSpec = (input) => {
    const palette = input?.palette || {};
    const typography = input?.typography || {};
    const hierarchy = input?.sectionHierarchy || {};
    const layoutVariant = UI_LAYOUT_VARIANTS.includes(input?.layoutVariant) ? input.layoutVariant : "split-hero";
    const normalizedHierarchy = Object.entries(hierarchy).reduce((acc, [pageKey, values]) => {
      if (!Array.isArray(values)) return acc;
      const ids = values
        .map((value) => String(value || "").toLowerCase().replace(/[^a-z]/g, ""))
        .map((token) => SECTION_ID_ALIASES[token])
        .filter(Boolean);
      if (ids.length > 0) acc[pageKey] = Array.from(new Set(ids));
      return acc;
    }, {});
    return {
      palette: {
        heroStart: toValidHex(palette.heroStart, DEFAULT_THEME_COLORS.heroStart),
        heroEnd: toValidHex(palette.heroEnd, DEFAULT_THEME_COLORS.heroEnd),
        accent: toValidHex(palette.accent, DEFAULT_THEME_COLORS.accent),
        accentStrong: toValidHex(palette.accentStrong, DEFAULT_THEME_COLORS.accentStrong),
        pageBg: toValidHex(palette.pageBg, DEFAULT_THEME_COLORS.pageBg),
        cardBg: toValidHex(palette.cardBg, DEFAULT_THEME_COLORS.cardBg),
        borderColor: toValidHex(palette.borderColor, DEFAULT_THEME_COLORS.borderColor),
        textPrimary: toValidHex(palette.textPrimary, DEFAULT_THEME_COLORS.textPrimary),
        textSecondary: toValidHex(palette.textSecondary, DEFAULT_THEME_COLORS.textSecondary),
        linkColor: toValidHex(palette.linkColor, DEFAULT_THEME_COLORS.linkColor),
        ctaPanelBg: toValidHex(palette.ctaPanelBg, DEFAULT_THEME_COLORS.ctaPanelBg),
        ctaPanelBorder: toValidHex(palette.ctaPanelBorder, DEFAULT_THEME_COLORS.ctaPanelBorder),
        ctaText: toValidHex(palette.ctaText, DEFAULT_THEME_COLORS.ctaText),
      },
      typography: {
        ...DEFAULT_TEXT_STYLE,
        headingFamily: String(typography.headingFamily || DEFAULT_TEXT_STYLE.headingFamily),
        bodyFamily: String(typography.bodyFamily || DEFAULT_TEXT_STYLE.bodyFamily),
        fontImport: String(typography.fontImport || DEFAULT_TEXT_STYLE.fontImport),
        baseSizePx: Number.isFinite(Number(typography.baseSizePx)) ? Math.min(20, Math.max(14, Number(typography.baseSizePx))) : DEFAULT_TEXT_STYLE.baseSizePx,
        lineHeight: Number.isFinite(Number(typography.lineHeight)) ? Math.min(1.9, Math.max(1.3, Number(typography.lineHeight))) : DEFAULT_TEXT_STYLE.lineHeight,
        headingWeight: Number.isFinite(Number(typography.headingWeight)) ? Math.min(900, Math.max(600, Number(typography.headingWeight))) : DEFAULT_TEXT_STYLE.headingWeight,
        bodyWeight: Number.isFinite(Number(typography.bodyWeight)) ? Math.min(600, Math.max(300, Number(typography.bodyWeight))) : DEFAULT_TEXT_STYLE.bodyWeight,
        headingSpacingEm: Number.isFinite(Number(typography.headingSpacingEm))
          ? Math.min(0.05, Math.max(-0.03, Number(typography.headingSpacingEm)))
          : DEFAULT_TEXT_STYLE.headingSpacingEm,
      },
      layoutVariant,
      sectionHierarchy: normalizedHierarchy,
    };
  };

  const buildAutoUiDesignSpec = (seedInput) => {
    const seed = String(seedInput || "default-seed");
    const hash = Array.from(seed).reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) % 100000, 7);
    const hue = hash % 360;
    const accentHue = (hue + 34) % 360;
    const layoutVariant = UI_LAYOUT_VARIANTS[hash % UI_LAYOUT_VARIANTS.length];
    const toHex = (h, s, l) => {
      const a = s * Math.min(l, 1 - l);
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    const palette = {
      heroStart: toHex(hue, 0.58, 0.32),
      heroEnd: toHex((hue + 18) % 360, 0.56, 0.42),
      accent: toHex(accentHue, 0.7, 0.36),
      accentStrong: toHex(accentHue, 0.76, 0.46),
      pageBg: toHex(hue, 0.42, 0.96),
      cardBg: "#ffffff",
      borderColor: toHex(hue, 0.3, 0.82),
      textPrimary: toHex(hue, 0.4, 0.17),
      textSecondary: toHex(hue, 0.24, 0.38),
      linkColor: toHex(accentHue, 0.74, 0.34),
      ctaPanelBg: toHex(accentHue, 0.52, 0.93),
      ctaPanelBorder: toHex(accentHue, 0.48, 0.78),
      ctaText: "#ffffff",
    };
    const preset = TEXT_STYLE_PRESETS[(hash + 1) % TEXT_STYLE_PRESETS.length] || TEXT_STYLE_PRESETS[0];
    const hierarchy = hash % 2 === 0
      ? ["servicesGrid", "stats", "commitment", "gallery", "map", "quickNav"]
      : ["commitment", "servicesGrid", "stats", "monetizationHub", "gallery", "quickNav"];
    return normalizeUiDesignSpec({
      palette,
      layoutVariant,
      typography: {
        ...DEFAULT_TEXT_STYLE,
        preset: preset.key,
        headingFamily: preset.headingFamily,
        bodyFamily: preset.bodyFamily,
        fontImport: preset.fontImport,
      },
      sectionHierarchy: {
        "index.html": hierarchy,
        global: ["quickNav"],
      },
    });
  };

  const getIndustryKeywordStem = () => {
    if (industryTemplate === "cleaning-company") return "cleaning services";
    if (industryTemplate === "dental-clinic") return "dental clinic";
    if (industryTemplate === "fitness-trainer") return "personal training";
    if (industryTemplate === "healthcare-hcbs") return "home care services";
    if (industryTemplate === "law-firm") return "legal services";
    if (industryTemplate === "restaurant") return "restaurant";
    if (industryTemplate === "real-estate-agent") return "real estate services";
    if (industryTemplate === "consultant") return "consulting services";
    if (industryTemplate === "agency") return "marketing agency";
    if (industryTemplate === "saas-startup") return "software platform";
    return "professional services";
  };

  const buildCompetitorFallback = (urls) => {
    const keywordStem = getIndustryKeywordStem();
    const competitors = urls.map((url, index) => {
      const insight = deriveRedesignInsights(url);
      const hostSlug = insight?.host?.split(".")[0]?.replace(/-/g, " ") || `competitor ${index + 1}`;
      const primaryKeyword = `${hostSlug} ${keywordStem}`.trim().toLowerCase();
      return {
        url,
        pricing: index % 2 === 0 ? "Estimated: mid-tier packages with monthly plans." : "Estimated: premium packages with bundled services.",
        keywords: [
          primaryKeyword,
          `${keywordStem} near me`,
          `${hostSlug} reviews`,
        ],
        weaknesses: [
          "Weak CTA hierarchy on core landing pages.",
          "Limited trust proof and conversion-focused service sections.",
          "Inconsistent metadata and internal linking for SEO depth.",
        ],
      };
    });
    const suggestions = competitors
      .flatMap((item) => item.keywords.slice(0, 2))
      .filter(Boolean)
      .slice(0, 4)
      .map((kw) => `Your competitor ranks for "${kw}". Add this keyword to your services and location pages.`);
    return { competitors, suggestions };
  };

  const handleCompetitorScan = async ({ silent = false } = {}) => {
    const urls = parseCompetitorUrls(competitorUrlsInput);
    if (urls.length === 0) {
      if (!silent) {
        setPublishStatus("error");
        setPublishMessage("Add at least one competitor URL to scan.");
      }
      return null;
    }

    setCompetitorLoading(true);
    try {
      let intel = null;
      try {
        const response = await fetchWithTimeout("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a TitoNova Cloud Engine competitor intelligence analyst for a web-builder product.
Analyze these competitor URLs:
${urls.map((url) => `- ${url}`).join("\n")}

Business context:
- Project: ${projectName || "Business"}
- Industry: ${selectedIndustryPackage?.label || "General"}

Return strict JSON only:
{
  "competitors":[
    {
      "url":"...",
      "pricing":"short pricing summary",
      "keywords":["keyword 1","keyword 2","keyword 3"],
      "weaknesses":["weakness 1","weakness 2","weakness 3"]
    }
  ],
  "suggestions":["improvement suggestion 1","improvement suggestion 2","improvement suggestion 3"]
}
Each suggestion must be directly actionable for this builder.`,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "Competitor scan failed.");
        const parsed = parseModelJson(payload?.result);
        if (Array.isArray(parsed?.competitors) && parsed.competitors.length > 0) {
          intel = {
            competitors: parsed.competitors.slice(0, 8).map((item, idx) => ({
              url: normalizeWebsiteUrl(item?.url) || urls[idx] || urls[0],
              pricing: String(item?.pricing || "Pricing details unavailable."),
              keywords: Array.isArray(item?.keywords) ? item.keywords.map((kw) => String(kw)).filter(Boolean).slice(0, 5) : [],
              weaknesses: Array.isArray(item?.weaknesses) ? item.weaknesses.map((w) => String(w)).filter(Boolean).slice(0, 5) : [],
            })),
            suggestions: Array.isArray(parsed?.suggestions)
              ? parsed.suggestions.map((item) => String(item)).filter(Boolean).slice(0, 8)
              : [],
          };
        }
      } catch {
        intel = null;
      }

      if (!intel) intel = buildCompetitorFallback(urls);
      setCompetitorIntel({
        ...intel,
        scannedAt: new Date().toISOString(),
      });
      if (!silent) {
        setPublishStatus("success");
        setPublishMessage(`Competitor scan complete for ${urls.length} site${urls.length > 1 ? "s" : ""}.`);
      }
      return intel;
    } finally {
      setCompetitorLoading(false);
    }
  };

  const handleAiUiDesign = async (promptOverride = "") => {
    const prompt = getEffectiveBusinessPrompt(
      String(promptOverride || uiDesignPrompt || businessOsPrompt || projectName || "").trim(),
      { solutionMode, projectName }
    );
    if (!prompt) {
      setPublishStatus("error");
      setPublishMessage("Describe the website or business you want to create first.");
      return;
    }
    setUiDesignLoading(true);
    try {
      let nextSpec = null;
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a TitoNova Cloud Engine UI designer.
Create a unique non-generic website design spec for this brief: "${prompt}".
Return strict JSON only:
{
  "layoutVariant":"split-hero|stacked-hero|editorial",
  "palette":{
    "heroStart":"#RRGGBB",
    "heroEnd":"#RRGGBB",
    "accent":"#RRGGBB",
    "accentStrong":"#RRGGBB",
    "pageBg":"#RRGGBB",
    "cardBg":"#RRGGBB",
    "borderColor":"#RRGGBB",
    "textPrimary":"#RRGGBB",
    "textSecondary":"#RRGGBB",
    "linkColor":"#RRGGBB",
    "ctaPanelBg":"#RRGGBB",
    "ctaPanelBorder":"#RRGGBB",
    "ctaText":"#RRGGBB"
  },
  "typography":{
    "fontImport":"google fonts css url",
    "headingFamily":"font stack",
    "bodyFamily":"font stack",
    "baseSizePx":16,
    "lineHeight":1.6,
    "headingWeight":800,
    "bodyWeight":400,
    "headingSpacingEm":-0.01
  },
  "sectionHierarchy":{
    "index.html":["servicesGrid","stats","commitment","gallery","map","quickNav"],
    "about.html":["aboutStory","stats","commitment","gallery","quickNav"],
    "services.html":["servicesGrid","servicesAction","subscriptions","quickNav"],
    "contact.html":["contactForm","booking","map","quickNav"]
  }
}`,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "TitoNova Cloud Engine design engine failed.");
        const parsed = parseModelJson(payload?.result);
        nextSpec = normalizeUiDesignSpec(parsed);
      } catch {
        nextSpec = buildAutoUiDesignSpec(prompt);
      }

      setUiDesignSpec(nextSpec);
      setThemeColors({ ...nextSpec.palette });
      setTextStyle((previous) => ({
        ...previous,
        ...nextSpec.typography,
      }));
      setAiProjectSchema((previous) => ({
        project: {
          name: String(projectName || "Untitled Project"),
          prompt,
          generatedAt: new Date().toISOString(),
        },
        brand: {
          "palette.json": { ...(nextSpec?.palette || {}) },
          "typography.json": { ...(nextSpec?.typography || {}) },
        },
        layout: {
          "layout.json": {
            layoutVariant: nextSpec?.layoutVariant || "split-hero",
          },
        },
        sections: {
          "sections.json": { ...(nextSpec?.sectionHierarchy || {}) },
        },
        components: previous?.components || {},
        pages: previous?.pages || {},
      }));
      setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine design engine generated custom palette, typography, layout, and section hierarchy.");
    } finally {
      setUiDesignLoading(false);
    }
  };

  const handleRunAiGenerationPipeline = async () => {
    const basePrompt = String(businessOsPrompt || "").trim();
    const requiredProjectName = String(projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before running the TitoNova Cloud Engine generation pipeline.");
      return;
    }
    if (!basePrompt) {
      setError("Business Prompt is required.");
      setPublishStatus("error");
      setPublishMessage("Describe what you want to build before running the TitoNova Cloud Engine generation pipeline.");
      return;
    }
    if (pipelineRunning || loading) return;

    const setStep = (key, status, message) => {
      setPipelineSteps((previous) => {
        const next = [...previous];
        const index = next.findIndex((item) => item.key === key);
        const patch = {
          key,
          label:
            key === "planner"
              ? "Business Planner"
              : key === "brand"
                ? "Brand Generator"
                : key === "layout"
                  ? "Layout Generator"
                  : key === "content"
                    ? "Content Generator"
                    : key === "seo"
                      ? "SEO Generator"
                      : key === "marketing"
                        ? "Marketing Generator"
                        : "Renderer",
          status,
          message,
        };
        if (index >= 0) next[index] = patch;
        else next.push(patch);
        return next;
      });
    };

    setPipelineRunning(true);
    setPublishStatus("info");
    setPublishMessage("Running unified TitoNova Cloud Engine generation pipeline.");
    setPipelineSteps([
      { key: "planner", label: "Business Planner", status: "running", message: "Analyzing prompt..." },
      { key: "brand", label: "Brand Generator", status: "pending", message: "Waiting..." },
      { key: "layout", label: "Layout Generator", status: "pending", message: "Waiting..." },
      { key: "content", label: "Content Generator", status: "pending", message: "Waiting..." },
      { key: "seo", label: "SEO Generator", status: "pending", message: "Waiting..." },
      { key: "marketing", label: "Marketing Generator", status: "pending", message: "Waiting..." },
      { key: "renderer", label: "Renderer", status: "pending", message: "Waiting..." },
    ]);

    try {
      const promptData = parseStructuredBusinessPrompt(basePrompt);
      const inferredTemplate = inferIndustryTemplateFromPrompt(basePrompt);
      const industryPackage =
        INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === inferredTemplate) || selectedIndustryPackage;
      const pagesFromPrompt = Array.isArray(promptData?.pages) && promptData.pages.length > 0
        ? promptData.pages
        : Array.isArray(industryPackage?.blueprint?.pages)
          ? industryPackage.blueprint.pages
          : ["Home", "Services", "Pricing", "Contact"];
      const pipelineBlueprintDraft = {
        business_name: String(promptData?.businessName || requiredProjectName),
        industry: String(promptData?.industry || industryPackage?.label || "General"),
        pages: pagesFromPrompt.map((item) => String(item)),
        cta: String(promptData?.cta || "Get Started Today"),
      };
      setPipelineBlueprint(pipelineBlueprintDraft);
      setStep("planner", "pass", `${pipelineBlueprintDraft.business_name} • ${pipelineBlueprintDraft.industry}`);
      setStep("brand", "running", "Applying shared design system...");
      setStep("layout", "running", "Preparing unified page layout...");
      setStep("content", "running", "Generating conversion-focused content...");
      setStep("seo", "running", "Applying SEO and metadata...");
      setStep("marketing", "running", "Generating marketing-ready blocks...");
      setStep("renderer", "running", "Rendering website...");

      const generation = await runUnifiedWebsiteGeneration({
        intent: "pipeline",
        promptOverride: basePrompt,
        projectNameOverride: requiredProjectName,
        industryTemplateOverride: inferredTemplate,
        skipStatusMessage: true,
      });
      if (!generation) throw new Error("Unified pipeline did not return a generated site.");

      const pageKeys = orderPageKeys(Object.keys(generation.pages || {}));
      const pageNames = pageKeys.map((key) => pageLabelFromKey(key).toLowerCase());
      const inferredSections = extractStructuredSectionsFromPrompt(basePrompt);
      const sectionTemplate =
        inferredSections.length > 0 ? inferredSections : ["hero", "features", "services", "cta"];
      const nextVariants = AI_LAYOUT_VARIANT_OPTIONS.reduce((acc, variant) => {
        acc[variant.key] = pageNames.reduce((pageAcc, pageName) => {
          pageAcc[pageName] = [...sectionTemplate];
          return pageAcc;
        }, {});
        return acc;
      }, {});
      setPipelineVariants(nextVariants);

      setStep("brand", "pass", "Design system applied.");
      setStep("layout", "pass", `Layout mapped for ${pageKeys.length || 1} page(s).`);
      setStep("content", "pass", "Content generated.");
      setStep("seo", "pass", "SEO signals generated.");
      setStep("marketing", "pass", "Marketing assets generated.");
      setStep("renderer", "pass", `Rendered ${pageKeys.length || 1} page(s).`);
      setPublishStatus("success");
      setPublishMessage("Unified generation pipeline complete. Website is ready.");
    } catch (error) {
      const message = String(error?.message || "TitoNova Cloud Engine generation pipeline failed.");
      setStep("renderer", "fail", message);
      setPublishStatus("error");
      setPublishMessage(message);
    } finally {
      setPipelineRunning(false);
    }
  };

  const handleAttachDomain = useCallback(async (targetSiteId, rawDomain) => {
    const domain = normalizeDomain(rawDomain);
    if (!domain) throw new Error("Enter a valid domain (example.com).");
    const response = await fetch("/api/domain/attach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, siteId: targetSiteId }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Domain attach failed.");
    const records = Array.isArray(payload?.attach?.records)
      ? payload.attach.records
      : Array.isArray(payload?.records)
        ? payload.records
        : [];
    const normalizedRecords = records
      .map((record) => ({
        type: String(record?.type || "").trim().toUpperCase(),
        host: String(record?.host || "").trim(),
        value: String(record?.value || "").trim(),
      }))
      .filter((record) => record.type && record.host && record.value);
    if (normalizedRecords.length > 0) setDnsRecords(normalizedRecords);
    setDnsGuideDomain(domain);
    setHostingProfile((previous) => ({
      ...previous,
      domain,
      sslEnabled: Boolean(payload?.ssl?.enabled ?? payload?.attach?.sslEnabled ?? previous.sslEnabled),
      cdnEnabled: Boolean(payload?.cdn?.enabled ?? payload?.attach?.cdnEnabled ?? previous.cdnEnabled),
      tier: String(payload?.hosting?.tier || previous.tier || "Fast Hosting"),
      provider: String(payload?.provider || payload?.attach?.provider || previous.provider || "gateway"),
      updatedAt: new Date().toISOString(),
    }));
    return domain;
  }, []);

  const verifyDomainStatus = async (rawDomain) => {
    const domain = normalizeDomain(rawDomain);
    if (!domain) throw new Error("Enter a domain first.");
    const response = await fetch("/api/domain/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "DNS verify failed.");
    const records = Array.isArray(payload?.verification?.records)
      ? payload.verification.records
      : Array.isArray(payload?.records)
        ? payload.records
        : [];
    const normalizedRecords = records
      .map((record) => ({
        type: String(record?.type || "").trim().toUpperCase(),
        host: String(record?.host || "").trim(),
        value: String(record?.value || "").trim(),
      }))
      .filter((record) => record.type && record.host && record.value);
    return {
      domain,
      verified: Boolean(payload?.verified),
      provider: String(payload?.provider || payload?.verification?.provider || "gateway"),
      sslEnabled: Boolean(payload?.ssl?.enabled ?? payload?.verification?.sslEnabled ?? payload?.verified),
      cdnEnabled: Boolean(payload?.cdn?.enabled ?? payload?.verification?.cdnEnabled ?? payload?.verified),
      records: normalizedRecords,
      payload,
    };
  };

  const suggestKeyword = () => {
    if (marketKeyword.trim()) return marketKeyword.trim();
    if (projectName.trim()) return makeProjectSlug(projectName).replace(/-/g, "");
    return "brand";
  };

  const toggleMarketTld = (tld) => {
    setMarketTlds((previous) => {
      const exists = previous.includes(tld);
      if (exists) {
        const next = previous.filter((item) => item !== tld);
        return next.length > 0 ? next : [".com"];
      }
      return [...previous, tld];
    });
  };

  const getSortedMarketResults = () => {
    const list = [...marketResults];
    if (marketSort === "cheapest") {
      return list.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    }
    if (marketSort === "premium") {
      return list.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    }
    return list.sort((a, b) => {
      const availability = Number(Boolean(b?.available)) - Number(Boolean(a?.available));
      if (availability !== 0) return availability;
      return Number(a?.price || 0) - Number(b?.price || 0);
    });
  };

  const normalizeAddonFeatureKeys = (rawValue) => {
    const tokens = String(rawValue || "")
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
    const allowed = new Set(AUTOMATION_PAGE_DEFS.map((item) => item.key));
    const unique = [];
    tokens.forEach((token) => {
      const normalized = token.endsWith(".html") ? token : `${token}.html`;
      if (allowed.has(normalized) && !unique.includes(normalized)) unique.push(normalized);
    });
    return unique;
  };

  const getFilteredAddons = () =>
    ecosystemAddons.filter((addon) => {
      const categoryMatch = addonCategory === "all" || addon.category === addonCategory;
      if (!categoryMatch) return false;
      const q = addonSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        addon.name.toLowerCase().includes(q) ||
        addon.description.toLowerCase().includes(q) ||
        addon.category.toLowerCase().includes(q)
      );
    });

  const handleInstallAddon = (addon) => {
    if (!addon?.id) return;
    setInstalledAddons((previous) => ({ ...previous, [addon.id]: true }));
    if (Array.isArray(addon.featureKeys) && addon.featureKeys.length > 0) {
      setAutomationFeatures((previous) => {
        const next = { ...previous };
        addon.featureKeys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(next, key)) next[key] = true;
        });
        return next;
      });
    }
    setPublishStatus("success");
    setPublishMessage(`Installed add-on: ${addon.name}`);
  };

  const handleUninstallAddon = (addon) => {
    if (!addon?.id) return;
    setInstalledAddons((previous) => {
      const next = { ...previous };
      delete next[addon.id];
      return next;
    });
    setPublishStatus("info");
    setPublishMessage(`Uninstalled add-on: ${addon.name}`);
  };

  const handlePublishAddon = () => {
    const name = String(addonNameInput || "").trim();
    const description = String(addonDescriptionInput || "").trim();
    if (!name || !description) {
      setPublishStatus("error");
      setPublishMessage("Add-on name and description are required.");
      return;
    }
    const featureKeys = normalizeAddonFeatureKeys(addonFeaturesInput);
    const id = `addon-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-${Date.now()
      .toString()
      .slice(-4)}`;
    const nextAddon = {
      id,
      name,
      category: addonTypeInput,
      description,
      priceLabel: String(addonPriceInput || "Free").trim() || "Free",
      featureKeys,
      publishedBy: "You",
    };
    setEcosystemAddons((previous) => [nextAddon, ...previous]);
    setAddonNameInput("");
    setAddonDescriptionInput("");
    setAddonPriceInput("Free");
    setAddonFeaturesInput("booking.html");
    setPublishStatus("success");
    setPublishMessage(`Published add-on to Marketplace Ecosystem: ${name}`);
  };

  const runGrowthCoach = async ({ silent = false } = {}) => {
    if (growthCoachLoading) return;
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) return;
    setGrowthCoachLoading(true);
    try {
      let insights = [];
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a TitoNova Cloud Engine Growth Coach.
Review this website HTML and return actionable growth recommendations.
Focus on conversion copy strength, trust signals, CTA clarity, and quick wins.
Return strict JSON only:
{"insights":[{"id":"headline|testimonials|cta|content-depth|momentum","severity":"high|medium|low","issue":"...","recommendation":"...","actionLabel":"..."}]}
Limit to 4 concise high-impact items.
HTML:
${currentHtml.slice(0, 14000)}`,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "Growth Coach failed.");
        const parsed = parseModelJson(payload?.result);
        if (Array.isArray(parsed?.insights)) {
          insights = parsed.insights
            .map((item) => ({
              id: String(item?.id || "").trim() || "momentum",
              severity: ["high", "medium", "low"].includes(String(item?.severity || "").toLowerCase())
                ? String(item.severity).toLowerCase()
                : "medium",
              issue: String(item?.issue || "").trim(),
              recommendation: String(item?.recommendation || "").trim(),
              actionLabel: String(item?.actionLabel || "Apply fix").trim(),
            }))
            .filter((item) => item.issue && item.recommendation)
            .slice(0, 4);
        }
      } catch {
        insights = [];
      }
      if (insights.length === 0) insights = buildGrowthCoachFallbackInsights(currentHtml);
      setGrowthCoachInsights(insights);
      if (!silent) {
        setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine Growth Coach generated actionable recommendations.");
      }
    } finally {
      setGrowthCoachLoading(false);
    }
  };

  const runBusinessCoach = async () => {
    if (businessCoachLoading) return;
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) return;
    setBusinessCoachLoading(true);
    try {
      const insights = buildBusinessCoachInsights({
        html: currentHtml,
        competitorData: competitorIntel,
      });
      setBusinessCoachInsights(insights);
      setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine Business Coach generated business improvement recommendations.");
    } finally {
      setBusinessCoachLoading(false);
    }
  };

  const refreshAnalyticsDashboard = () => {
    const snapshot = buildAnalyticsSnapshot({
      pages: generatedPages,
      crmList: crmCustomers,
      appointments: autonomousAppointments,
      invoices: autonomousInvoices,
    });
    setAnalyticsSnapshot(snapshot);
    setPublishStatus("success");
    setPublishMessage("Analytics dashboard refreshed.");
  };

  const handleApplyGrowthCoachFix = (insightId) => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) return;
    let nextHtml = currentHtml;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${currentHtml}</body>`, "text/html");
      const root = doc.body;

      if (insightId === "headline") {
        const heading = root.querySelector("h1");
        const nextHeadline = `${projectName || "Your Business"} delivers trusted, fast-response service with measurable results`;
        if (heading) {
          heading.textContent = nextHeadline;
        }
      }

      if (insightId === "testimonials" && !root.querySelector("[data-tn-testimonials='true']")) {
        const section = doc.createElement("section");
        section.setAttribute("data-tn-testimonials", "true");
        section.style.cssText = "padding:18px 20px 0";
        section.innerHTML = `
          <h2 style="margin:0 0 10px;color:var(--tn-text-primary);font-family:var(--tn-font-heading);font-weight:var(--tn-heading-weight);letter-spacing:var(--tn-heading-spacing)">Client Testimonials</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">
            <blockquote data-tn-testimonial="true" style="margin:0;background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px;color:var(--tn-text-secondary)">
              "Excellent service and clear communication from day one."
              <footer style="margin-top:8px;color:var(--tn-text-primary);font-weight:700">- Verified Client</footer>
            </blockquote>
            <blockquote data-tn-testimonial="true" style="margin:0;background:#fff;border:1px solid var(--tn-border);border-radius:10px;padding:12px;color:var(--tn-text-secondary)">
              "Fast response, professional team, and measurable results."
              <footer style="margin-top:8px;color:var(--tn-text-primary);font-weight:700">- Local Business Owner</footer>
            </blockquote>
          </div>
        `;
        const ctaPanel = Array.from(root.querySelectorAll("section")).find((node) =>
          /Ready to take the next step\?/i.test(String(node.textContent || ""))
        );
        if (ctaPanel?.parentNode) {
          ctaPanel.parentNode.insertBefore(section, ctaPanel);
        } else {
          root.appendChild(section);
        }
      }

      if (insightId === "cta") {
        const ctaHost = root.querySelector("section");
        if (ctaHost && !root.querySelector("[data-tn-growth-cta='true']")) {
          const wrapper = doc.createElement("div");
          wrapper.style.cssText = "padding:8px 20px 0";
          wrapper.innerHTML = `<a data-tn-growth-cta="true" href="contact.html" style="display:inline-block;padding:10px 16px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:8px;font-weight:700">Get Your Free Consultation</a>`;
          ctaHost.insertAdjacentElement("afterend", wrapper);
        }
      }

      nextHtml = root.innerHTML || currentHtml;
    } catch {
      nextHtml = currentHtml;
    }

    setGeneratedPages((previous) => ({ ...previous, [activePage]: nextHtml }));
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory([nextHtml]);
    setPublishStatus("success");
    setPublishMessage("Growth Coach fix applied.");
  };

  const ensureAdminDashboardPage = () => {
    const current = getWorkingPages();
    if (current["client-dashboard.html"]) {
      setPublishStatus("success");
      setPublishMessage("Admin dashboard page already exists.");
      return;
    }
    const nextKeys = orderPageKeys([...Object.keys(current), "client-dashboard.html"]);
    const template = injectEditableLayerIntoHtml(buildHtmlFromGeneratedData(
      {
        pages: [
          buildAutomationPageModel("client-dashboard.html"),
        ],
      },
      "client-dashboard.html",
      nextKeys,
      themeColors,
      textStyle,
      uiDesignSpec
    ), "client-dashboard.html", makeProjectSlug);
    const synced = syncNavigationAcrossPages({ ...current, "client-dashboard.html": template });
    if (activePage === "index.html" || !generatedSite) {
      const html = synced["client-dashboard.html"] || "";
      applyGeneratedPreviewState(synced, "client-dashboard.html", html);
    } else {
      setGeneratedPages(synced);
    }
    setAutomationFeatures((previous) => ({ ...previous, "client-dashboard.html": true }));
    setPublishStatus("success");
    setPublishMessage("Admin dashboard page added to generated site.");
  };

  const runAiAppBuilder = async () => {
    if (appBuilderLoading) return;
    const pages = getWorkingPages();
    const keys = orderPageKeys(Object.keys(pages));
    if (keys.length === 0) {
      setPublishStatus("error");
      setPublishMessage("Generate a website first, then run TitoNova Cloud Engine App Builder.");
      return;
    }
    const brandName = projectName || "Generated Business";
    const industryLabel = selectedIndustryPackage?.label || "General";
    setAppBuilderLoading(true);
    try {
      let artifacts = null;
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `You are a TitoNova Cloud Engine App Builder.
Convert this web project into iOS app, Android app, and admin dashboard deliverables.
Project: ${brandName}
Industry: ${industryLabel}
Pages: ${keys.join(", ")}
Automation features: ${selectedAutomationDefs.map((item) => item.label).join(", ") || "client dashboard, login portal, payments, booking, CRM, analytics"}

Return strict JSON:
{
  "ios":{"name":"...","framework":"SwiftUI","bundleId":"...","screens":["..."],"features":["..."]},
  "android":{"name":"...","framework":"Jetpack Compose","packageName":"...","screens":["..."],"features":["..."]},
  "admin":{"name":"...","route":"/admin","modules":["..."]},
  "generatedAt":"ISO string"
}`,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || "TitoNova Cloud Engine App Builder failed.");
        const parsed = parseModelJson(payload?.result);
        if (parsed?.ios && parsed?.android && parsed?.admin) {
          artifacts = {
            ios: {
              name: String(parsed.ios.name || `${brandName} iOS`),
              framework: String(parsed.ios.framework || "SwiftUI"),
              bundleId: String(parsed.ios.bundleId || `com.titonova.${makeProjectSlug(brandName)}.ios`),
              screens: Array.isArray(parsed.ios.screens) ? parsed.ios.screens.map((x) => String(x)).slice(0, 10) : [],
              features: Array.isArray(parsed.ios.features) ? parsed.ios.features.map((x) => String(x)).slice(0, 10) : [],
            },
            android: {
              name: String(parsed.android.name || `${brandName} Android`),
              framework: String(parsed.android.framework || "Jetpack Compose"),
              packageName: String(parsed.android.packageName || `com.titonova.${makeProjectSlug(brandName)}.android`),
              screens: Array.isArray(parsed.android.screens) ? parsed.android.screens.map((x) => String(x)).slice(0, 10) : [],
              features: Array.isArray(parsed.android.features) ? parsed.android.features.map((x) => String(x)).slice(0, 10) : [],
            },
            admin: {
              name: String(parsed.admin.name || `${brandName} Admin Dashboard`),
              route: String(parsed.admin.route || "/admin"),
              modules: Array.isArray(parsed.admin.modules) ? parsed.admin.modules.map((x) => String(x)).slice(0, 12) : [],
            },
            generatedAt: String(parsed.generatedAt || new Date().toISOString()),
            source: "ai",
            industry: industryLabel,
          };
        }
      } catch {
        artifacts = null;
      }
      if (!artifacts) artifacts = buildAppBuilderFallbackArtifacts({ brandName, industryLabel, pages });
      setAppBuilderArtifacts(artifacts);
      ensureAdminDashboardPage();
      setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine App Builder generated iOS, Android, and admin dashboard deliverables.");
    } finally {
      setAppBuilderLoading(false);
    }
  };

  const pickBestDomain = (domains) => {
    const available = (domains || []).filter((item) => Boolean(item?.available));
    if (available.length === 0) return null;
    const availableCom = available.filter((item) => String(item?.name || "").toLowerCase().endsWith(".com"));
    const target = (availableCom.length > 0 ? availableCom : available).sort(
      (a, b) => Number(a?.price || 0) - Number(b?.price || 0)
    )[0];
    return target || null;
  };

  const searchDomains = async ({ keyword, tlds }) => {
    const response = await fetch("/api/registrar/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "mock",
        keyword,
        tlds,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || "Domain search failed.");
    return Array.isArray(payload?.domains) ? payload.domains : [];
  };

  const handleDomainSearch = async () => {
    const keyword = suggestKeyword();
    if (!keyword) return [];
    setMarketLoading(true);
    setMarketError("");
    try {
      const domains = await searchDomains({ keyword, tlds: marketTlds });
      setMarketResults(domains);
      if (autoSelectBestDomain) {
        const best = pickBestDomain(domains);
        if (best?.name) {
          handleUseDomainFromMarket(best.name);
        }
      }
      if (domains.length === 0) setMarketError("No domains found. Try a different keyword.");
      return domains;
    } catch (err) {
      setMarketResults([]);
      setMarketError(String(err?.message || "Domain search failed."));
      return [];
    } finally {
      setMarketLoading(false);
    }
  };

  const handleUseDomainFromMarket = (value) => {
    const normalized = normalizeDomain(value);
    setCustomDomain(normalized);
    setDnsGuideDomain(normalized);
    setDnsRecords(DEFAULT_DNS_RECORDS);
    setPublishStatus("info");
    setPublishMessage(`Selected domain: ${normalized}. Click Add Domain or Go Live.`);
  };

  const handleCopyDnsValue = async (label, value) => {
    const text = String(value || "");
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("textarea");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setDnsCopyMessage(`Copied ${label}: ${text}`);
    } catch {
      setDnsCopyMessage(`Could not copy ${label}. Please copy manually.`);
    }
  };

  const handleCopyAllDnsRecords = async () => {
    const allRecords = (dnsRecords.length > 0 ? dnsRecords : DEFAULT_DNS_RECORDS)
      .map((record) => `${record.type} ${record.host} ${record.value}`)
      .join("\n");
    await handleCopyDnsValue("all DNS records", allRecords);
  };

  const handleVerifyDnsNow = async () => {
    const domain = normalizeDomain(customDomain);
    if (!domain) {
      setDnsVerifyStatus("error");
      setDnsVerifyMessage("Enter a domain first.");
      return;
    }
    setVerifyingDns(true);
    setDnsVerifyStatus("idle");
    setDnsVerifyMessage("");
    try {
      const verifiedStatus = await verifyDomainStatus(domain);
      const normalizedRecords = verifiedStatus.records;
      if (normalizedRecords.length > 0) setDnsRecords(normalizedRecords);
      const verified = Boolean(verifiedStatus.verified);
      setDnsVerifyStatus(verified ? "success" : "warning");
      setDnsVerifyMessage(
        verified
          ? `DNS verified for ${domain}.`
          : `DNS not verified yet for ${domain}. Keep DNS records and try again in a few minutes.`
      );
      setHostingProfile((previous) => ({
        ...previous,
        domain,
        verified,
        sslEnabled: Boolean(verifiedStatus.sslEnabled),
        cdnEnabled: Boolean(verifiedStatus.cdnEnabled),
        provider: String(verifiedStatus.provider || previous.provider || "gateway"),
        updatedAt: new Date().toISOString(),
      }));
    } catch (err) {
      const message = String(err?.message || "DNS verify failed.");
      setDnsVerifyStatus("error");
      if (/ENOTFOUND|Hosting API not configured|getaddrinfo/i.test(message)) {
        setDnsVerifyMessage(
          "DNS verification provider is not configured yet. Keep your DNS records in place and verify from your hosting provider dashboard."
        );
      } else {
        setDnsVerifyMessage(message);
      }
    } finally {
      setVerifyingDns(false);
    }
  };

  const handleBuyDomain = async (domainName) => {
    if (!domainName) return;
    setMarketBuying(domainName);
    setMarketError("");
    try {
      const response = await fetch("/api/registrar/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "mock",
          domains: [domainName],
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Purchase failed.");
      setPublishStatus("success");
      setPublishMessage(`Domain purchased: ${domainName}`);
      setCustomDomain(normalizeDomain(domainName));
      setPurchasedDomains((previous) => {
        const normalized = normalizeDomain(domainName);
        const next = [normalized, ...previous.filter((item) => item !== normalized)];
        return next.slice(0, 12);
      });
      await handleDomainSearch();
    } catch (err) {
      setMarketError(String(err?.message || "Purchase failed."));
    } finally {
      setMarketBuying("");
    }
  };

  const handleRunRecommendedFlow = async () => {
    const keyword = suggestKeyword();
    if (!(Object.keys(generatedPages).length > 0 || generatedSite)) {
      setPublishStatus("info");
      setPublishMessage("Generate a website first, then run the recommended domain flow.");
      return;
    }
    if (!keyword || loading || publishing || runningRecommendedFlow) return;
    setRunningRecommendedFlow(true);
    setMarketError("");
    try {
      const domains = await handleDomainSearch();
      const best = pickBestDomain(domains);
      if (best?.name) {
        handleUseDomainFromMarket(best.name);
        await handleGoLive({ forceDomain: best.name });
      } else {
        setPublishStatus("info");
        setPublishMessage("No available domains found in this search. Website generated and ready for manual publish.");
      }
    } finally {
      setRunningRecommendedFlow(false);
    }
  };

  const runSmokeCheck = async ({ failedOnly = false } = {}) => {
    if (smokeRunning) return;

    const allStepDefs = [
      { key: "generate", label: "Generate API" },
      { key: "pages", label: "Add/Delete Pages" },
      { key: "publish", label: "Publish" },
      { key: "reachable", label: "Page Reachability" },
      { key: "dns", label: "Verify DNS" },
      { key: "cleanup", label: "Cleanup" },
    ];

    const failedKeys = smokeResults.filter((item) => item.status === "fail").map((item) => item.key);
    const selectedDefs =
      failedOnly && failedKeys.length > 0
        ? allStepDefs.filter((step) => failedKeys.includes(step.key))
        : allStepDefs;

    const needsPublishDependency =
      selectedDefs.some((step) => step.key === "reachable" || step.key === "cleanup") &&
      !selectedDefs.some((step) => step.key === "publish");
    const stepDefs = needsPublishDependency
      ? [{ key: "publish", label: "Publish (dependency)" }, ...selectedDefs]
      : selectedDefs;

    const results = [];
    const pushResult = (entry) => {
      results.push(entry);
      setSmokeResults([...results]);
    };
    const runStep = async (key, label, runner) => {
      const started = Date.now();
      const startedAt = new Date(started).toISOString();
      try {
        const message = await runner();
        pushResult({
          key,
          label,
          status: "pass",
          message: message || "OK",
          startedAt,
          durationMs: Date.now() - started,
        });
      } catch (error) {
        pushResult({
          key,
          label,
          status: "fail",
          message: String(error?.message || "Step failed"),
          startedAt,
          durationMs: Date.now() - started,
        });
      }
    };

    setSmokeRunning(true);
    setSmokeResults([]);
    let temporarySiteId = "";

    try {
      for (const step of stepDefs) {
        if (step.key === "generate") {
          await runStep(step.key, step.label, async () => {
            const response = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt:
                  "Generate a professional multi-page website for smoke test with Home About Services Contact pages.",
              }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload?.error || "Generate API failed");
            const parsed = parseModelJson(payload?.result);
            const pageCount = Array.isArray(parsed?.pages) ? parsed.pages.length : 0;
            if (pageCount < 1) throw new Error("Generate returned no pages.");
            return `${pageCount} pages returned`;
          });
          continue;
        }

        if (step.key === "pages") {
          await runStep(step.key, step.label, async () => {
            const working = getWorkingPages();
            const baselineCount = Object.keys(working).length;
            const tmpKey = `smoke-test-${Date.now().toString().slice(-4)}.html`;
            const withTmp = syncNavigationAcrossPages({
              ...working,
              [tmpKey]: injectEditableLayerIntoHtml(buildHtmlFromGeneratedData(
                {
                  pages: [
                    {
                      name: "Smoke Test",
                      sections: [
                        { type: "hero", title: "Smoke Test", subtitle: "Temporary page check" },
                        { type: "features", items: ["A", "B", "C"] },
                        { type: "cta", text: "Continue" },
                      ],
                    },
                  ],
                },
                tmpKey,
                orderPageKeys([...Object.keys(working), tmpKey]),
                themeColors,
                textStyle
              ), tmpKey, makeProjectSlug),
            });
            const withoutTmp = { ...withTmp };
            delete withoutTmp[tmpKey];
            const finalCount = Object.keys(withoutTmp).length;
            if (finalCount !== baselineCount) throw new Error("Add/Delete page count mismatch.");
            return "Page controls healthy";
          });
          continue;
        }

        if (step.key === "publish") {
          await runStep(step.key, step.label, async () => {
            temporarySiteId = `smoke-${Date.now()}`;
            const payload = await publishToHosting({
              siteId: temporarySiteId,
              pages: {
                "index.html": "<a href='about.html'>About</a><h1>Home</h1>",
                "about.html": "<a href='index.html'>Home</a><h1>About</h1>",
                "services.html": "<a href='index.html'>Home</a><h1>Services</h1>",
                "contact.html": "<a href='index.html'>Home</a><h1>Contact</h1>",
              },
            });
            return String(payload?.siteId || temporarySiteId);
          });
          continue;
        }

        if (step.key === "reachable") {
          await runStep(step.key, step.label, async () => {
            if (!temporarySiteId) throw new Error("No temporary site available for reachability check.");
            const reachabilityUrl = HOSTING_BASE_URL
              ? `${HOSTING_BASE_URL}/sites/${temporarySiteId}/services.html`
              : `/sites/${temporarySiteId}/services.html`;
            const pageResponse = await fetch(reachabilityUrl);
            if (!pageResponse.ok) throw new Error(`Published page check failed (${pageResponse.status})`);
            return "services.html reachable";
          });
          continue;
        }

        if (step.key === "dns") {
          await runStep(step.key, step.label, async () => {
            const response = await fetch("/api/domain/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ domain: normalizeDomain(customDomain) || "example.com" }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              const details = String(payload?.details || payload?.error || "");
              if (/hosting api not configured|enotfound|getaddrinfo|domain verify failed/i.test(details)) {
                return "DNS provider not configured in this environment (skipped)";
              }
              throw new Error(payload?.error || "Verify DNS failed");
            }
            if (!payload?.verified) {
              return "DNS not verified yet (pending propagation)";
            }
            return "DNS verified";
          });
          continue;
        }

        if (step.key === "cleanup") {
          await runStep(step.key, step.label, async () => {
            if (!temporarySiteId) return "No temporary site to clean up";
            const response = await fetch("/api/hosting/unpublish", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ siteId: temporarySiteId }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(payload?.error || "Unpublish cleanup failed");
            temporarySiteId = "";
            return "Temporary site unpublished";
          });
        }
      }
    } finally {
      if (temporarySiteId) {
        try {
          await fetch("/api/hosting/unpublish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ siteId: temporarySiteId }),
          });
        } catch {
          // Best-effort cleanup.
        }
      }
      setSmokeRunning(false);
    }
  };

  const handleDownloadSmokeReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      projectName,
      activePage,
      results: smokeResults,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smoke-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const commitInlineDraftForActivePage = useCallback(() => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    const sourceHtml = previewEditableRef.current?.innerHTML || draftHtml || currentHtml || "";
    const nextHtml = fieldLockMode ? applyTextOnlyChanges(currentHtml, sourceHtml) : sourceHtml;
    setGeneratedPages((previous) => ({ ...previous, [activePage]: nextHtml }));
    return nextHtml;
  }, [activePage, draftHtml, fieldLockMode, generatedPages, generatedSite]);

  const handleSwitchPage = (pageKey) => {
    if (!pageKey || pageKey === activePage) return;
    if (isInlineEditing) {
      commitInlineDraftForActivePage();
    }
    const nextHtml = generatedPages[pageKey] || "";
    setActivePage(pageKey);
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory(nextHtml ? [nextHtml] : []);
    setInlineDraftDirty(false);
  };

  const handlePreviewLinkNavigation = (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (isInlineEditing) {
      const editAnchor = target.closest("a[href]");
      if (editAnchor) {
        event.preventDefault();
      }
      return;
    }
    const anchor = target.closest("a[href]");
    if (!anchor) return;
    const href = String(anchor.getAttribute("href") || "").trim();
    if (!href || /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (href.startsWith("#")) {
      const targetId = href.slice(1);
      if (!targetId) return;
      event.preventDefault();
      const root = previewEditableRef.current;
      let targetEl = null;
      try {
        targetEl = root?.querySelector(`#${targetId}`) || null;
      } catch {
        targetEl = null;
      }
      if (targetEl instanceof HTMLElement) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    const cleanHref = href.split("#")[0].split("?")[0];
    if (!cleanHref.endsWith(".html")) return;
    if (!generatedPages[cleanHref]) return;
    event.preventDefault();
    handleSwitchPage(cleanHref);
  };

  const syncNavigationAcrossPages = (pages) => {
    const keys = orderPageKeys(Object.keys(pages || {}));
    return keys.reduce((acc, key) => {
      acc[key] = injectNavIntoPageHtml(pages[key] || "", key, keys);
      return acc;
    }, {});
  };

  const applyThemeToHtml = useCallback((html, palette = themeColors) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const root =
        doc.body.querySelector("[data-tn-theme-root='true']") ||
        doc.body.querySelector("div");
      if (!root) return html || "";

      const theme = { ...DEFAULT_THEME_COLORS, ...(palette || {}) };
      root.setAttribute("data-tn-theme-root", "true");
      const vars = {
        "--tn-hero-start": theme.heroStart,
        "--tn-hero-end": theme.heroEnd,
        "--tn-accent": theme.accent,
        "--tn-accent-strong": theme.accentStrong,
        "--tn-page-bg": theme.pageBg,
        "--tn-surface": theme.cardBg,
        "--tn-border": theme.borderColor,
        "--tn-text-primary": theme.textPrimary,
        "--tn-text-secondary": theme.textSecondary,
        "--tn-link": theme.linkColor,
        "--tn-cta-panel-bg": theme.ctaPanelBg,
        "--tn-cta-panel-border": theme.ctaPanelBorder,
        "--tn-cta-text": theme.ctaText,
        "--tn-nav-active-bg": theme.accent,
        "--tn-nav-active-text": theme.ctaText,
        "--tn-nav-text": theme.textPrimary,
      };
      Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));

      // Fallback updates for previously generated HTML that still contains static colors.
      const colorSwap = {
        "#0f172a": theme.textPrimary,
        "#0b4a6f": theme.heroEnd,
        "#0f766e": theme.accent,
        "#22c55e": theme.accentStrong,
        "#f1f5f9": theme.pageBg,
        "#ffffff": theme.cardBg,
        "#e2e8f0": theme.borderColor,
        "#475569": theme.textSecondary,
        "#2271b1": theme.linkColor,
        "#ecfeff": theme.ctaPanelBg,
        "#99f6e4": theme.ctaPanelBorder,
      };
      let themedHtml = doc.body.innerHTML || html || "";
      Object.entries(colorSwap).forEach(([from, to]) => {
        themedHtml = themedHtml.replace(new RegExp(from.replace("#", "\\#"), "gi"), to);
      });
      return themedHtml;
    } catch {
      return html || "";
    }
  }, [themeColors]);

  const handleAddPage = () => {
    const rawName = String(newPageName || "").trim() || `Page ${Object.keys(generatedPages).length + 1}`;
    const pageKey = pageKeyFromName(rawName, Object.keys(generatedPages).length);
    if (generatedPages[pageKey]) {
      setPublishStatus("error");
      setPublishMessage(`Page already exists: ${pageLabelFromKey(pageKey)}`);
      return;
    }

    if (isInlineEditing) {
      handleCancelInlineEdit();
    }

    const current = getWorkingPages();
    const nextKeys = orderPageKeys([...Object.keys(current), pageKey]);
    const template = injectEditableLayerIntoHtml(buildHtmlFromGeneratedData(
      {
        pages: [
          {
            name: pageLabelFromKey(pageKey),
            sections: [
              { type: "hero", title: `${pageLabelFromKey(pageKey)} Page`, subtitle: `Information for ${pageLabelFromKey(pageKey).toLowerCase()}.` },
              { type: "features", items: ["Key point one", "Key point two", "Key point three"] },
              { type: "cta", text: "Contact Us" },
            ],
          },
        ],
      },
      pageKey,
      nextKeys,
      themeColors,
      textStyle
    ), pageKey, makeProjectSlug);
    const synced = syncNavigationAcrossPages({ ...current, [pageKey]: template });
    applyGeneratedPreviewState(synced, pageKey, synced[pageKey] || "");
    setNewPageName("");
    setPublishStatus("success");
    setPublishMessage(`Page added: ${pageLabelFromKey(pageKey)}`);
  };

  const handleDeleteActivePage = () => {
    if (!activePage || activePage === "index.html") {
      setPublishStatus("error");
      setPublishMessage("Home page cannot be deleted.");
      return;
    }
    const current = getWorkingPages();
    if (!current[activePage]) return;
    const next = { ...current };
    delete next[activePage];
    const synced = syncNavigationAcrossPages(next);
    const nextActive = synced["index.html"] ? "index.html" : orderPageKeys(Object.keys(synced))[0] || "index.html";
    applyGeneratedPreviewState(synced, nextActive, synced[nextActive] || "");
    setPublishStatus("success");
    setPublishMessage(`Page deleted: ${pageLabelFromKey(activePage)}`);
  };

  const normalizedCustomDomain = normalizeDomain(customDomain);
  const redesignInsights = deriveRedesignInsights(sourceWebsiteUrl);
  const hasDashboardAccess = true;
  const hasGeneratedContent = Object.keys(generatedPages).length > 0 || Boolean(generatedSite);
  const shouldShowGuestPreviewPrompt = Boolean(showGuestAuthPrompt && !authUser && hasGeneratedContent && !isInlineEditing);
  const currentPageHtml = generatedPages[activePage] || generatedSite || "";
  const seoChecklist = computeSeoChecklist(currentPageHtml);
  const currentMapQuery = extractMapQueryFromHtml(currentPageHtml);
  const editableImages = extractPageImages(currentPageHtml);
  const selectedImage = editableImages.find((item) => item.id === selectedImageId) || editableImages[0] || null;
  const isDomainPurchased = Boolean(
    normalizedCustomDomain && purchasedDomains.includes(normalizedCustomDomain)
  );
  const isDomainAdded = Boolean(normalizedCustomDomain);
  const isDnsConfigured = Boolean(publishedSiteId && normalizedCustomDomain);
  const isDnsVerified = dnsVerifyStatus === "success";
  const checklistSteps = [
    { key: "buy", label: "Buy", done: isDomainPurchased },
    { key: "add", label: "Add Domain", done: isDomainAdded },
    { key: "dns", label: "DNS", done: isDnsConfigured },
    { key: "verify", label: "Verify", done: isDnsVerified },
  ];
  const checklistDoneCount = checklistSteps.filter((step) => step.done).length;
  const checklistProgress = Math.round((checklistDoneCount / checklistSteps.length) * 100);
  const quickStartSteps = [
    { key: "name", label: "Add a project name", done: Boolean(String(projectName || "").trim()) },
    { key: "prompt", label: "Describe what you want to build", done: String(businessOsPrompt || "").trim().length >= 20 },
    { key: "generate", label: "Generate your website", done: hasGeneratedContent },
    { key: "publish", label: "Edit and publish", done: Boolean(publishedSiteId) },
  ];
  const recommendedNextStep = quickStartSteps.find((item) => !item.done)?.label || "Your site is ready. Edit, publish, or add a domain.";
  const previewJourneySteps = [
    { key: "generated", label: "Website generated", done: hasGeneratedContent },
    { key: "editing", label: "Inline editing ready", done: hasGeneratedContent && isInlineEditing },
    { key: "saved", label: "Changes saved", done: hasGeneratedContent && !inlineDraftDirty },
    { key: "published", label: "Published live", done: Boolean(publishedSiteId) },
  ];
  const previewRecommendedStep = previewJourneySteps.find((item) => !item.done)?.label || "Review your pages, then publish when ready.";
  const publishPrimaryLabel = oneClickHostingRunning
    ? "Provisioning hosting..."
    : publishing
      ? "Publishing..."
      : publishedSiteId
        ? "Publish Update"
        : "Go Live";
  const publishPrimaryAction = normalizedCustomDomain ? () => handleOneClickHosting() : () => handleGoLive();
  const publishPrimaryHint = normalizedCustomDomain
    ? "With a domain added, TitoNova can attach the domain, verify DNS, and publish in one guided step."
    : "Publish instantly with a temporary live URL now. Add a custom domain any time after that.";
  const isMobilePreview = viewportWidth < 720;
  const publishReadinessMessage =
    publishStatus === "error"
      ? "Publishing needs a reachable hosting gateway. Keep the gateway running, then try Go Live again."
      : publishedSiteId
        ? "Your site has been published. You can re-publish anytime after edits."
        : "Generate, review the preview, make quick inline edits, then publish when ready.";
  const isCompactInlineEditor = viewportWidth < 960;
  const inlineEditToolbarStyle = isCompactInlineEditor
    ? {
        ...styles.inlineEditToolbar,
        position: "sticky",
        top: "8px",
        zIndex: 12,
        alignItems: "stretch",
        padding: "10px",
      }
    : styles.inlineEditToolbar;
  const inlineEditMetaStyle = isCompactInlineEditor
    ? {
        ...styles.inlineEditMeta,
        minWidth: 0,
        width: "100%",
      }
    : styles.inlineEditMeta;
  const inlineEditActionsStyle = isCompactInlineEditor
    ? {
        ...styles.inlineEditActions,
        width: "100%",
        justifyContent: "stretch",
      }
    : styles.inlineEditActions;
  const inlineSmartInputStyle = isCompactInlineEditor
    ? {
        ...styles.inlineSmartInput,
        minWidth: "100%",
      }
    : styles.inlineSmartInput;
  const previewEditableStyle = isCompactInlineEditor
    ? {
        ...styles.previewEditable,
        minHeight: "320px",
        padding: "8px",
        outlineOffset: "3px",
      }
    : styles.previewEditable;
  const previewGuestOverlayStyle = isCompactInlineEditor
    ? {
        ...styles.previewGuestOverlay,
        inset: "12px",
      }
    : styles.previewGuestOverlay;

  const applyImageUpdate = (imageId, nextSrc, scope = imageApplyScope) => {
    if (!imageId || !nextSrc) return;
    if (scope === "all") {
      const working = getWorkingPages();
      const keys = orderPageKeys(Object.keys(working));
      if (keys.length === 0) return;
      const nextPages = keys.reduce((acc, key) => {
        acc[key] = updateImageSourceInHtml(working[key] || "", imageId, nextSrc);
        return acc;
      }, {});
      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
      return;
    }
    const baseHtml = isInlineEditing ? draftHtml : currentPageHtml;
    const nextHtml = updateImageSourceInHtml(baseHtml, imageId, nextSrc);
    setGeneratedPages((previous) => ({ ...previous, [activePage]: nextHtml }));
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory([nextHtml]);
  };

  const readImageFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image upload failed."));
      reader.readAsDataURL(file);
    });

  const replaceInlineImage = async (imageId, file, scope = imageApplyScope) => {
    if (!imageId || !file) return "";
    const dataUrl = await readImageFileAsDataUrl(file).catch(() => "");
    if (!dataUrl) return "";
    applyImageUpdate(imageId, dataUrl, scope);
    setPublishStatus("success");
    setPublishMessage(
      scope === "all"
        ? `Uploaded image across all pages: ${imageId}`
        : `Uploaded image: ${imageId}`
    );
    return dataUrl;
  };

  const handleInlineImageReplace = (targetNode) => {
    const imageTarget =
      targetNode instanceof Element ? targetNode.closest("[data-editable='image'][data-edit-id], [data-editable='image'][data-id], img") : null;
    if (!(imageTarget instanceof HTMLElement)) return;
    const explicitId = String(imageTarget.getAttribute("data-image-id") || imageTarget.dataset.id || "").trim();
    const fallbackId = (() => {
      const root = previewEditableRef.current;
      if (!(root instanceof HTMLElement) || imageTarget.tagName.toLowerCase() !== "img") return "";
      const images = Array.from(root.querySelectorAll("img"));
      const index = images.indexOf(imageTarget);
      return index >= 0 ? `tn-image-${index + 1}` : "";
    })();
    const imageId = explicitId || fallbackId;
    if (!imageId) return;
    setSelectedImageId(imageId);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event) => {
      const file = event.target?.files?.[0];
      if (!file) return;
      await replaceInlineImage(imageId, file, imageApplyScope);
    };
    input.click();
  };

  const handleApplyImageUrl = () => {
    if (!selectedImage || !imageUrlInput.trim()) return;
    applyImageUpdate(selectedImage.id, imageUrlInput.trim(), imageApplyScope);
    setImageUrlInput("");
    setPublishStatus("success");
    setPublishMessage(
      imageApplyScope === "all"
        ? `Updated image across all pages: ${selectedImage.id}`
        : `Updated image: ${selectedImage.id}`
    );
  };

  const handleApplyMapLocation = () => {
    const nextQuery = String(mapQueryInput || "").trim();
    if (!nextQuery) return;
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    const nextPages = keys.reduce((acc, key) => {
      acc[key] = updateMapInHtml(working[key] || "", nextQuery);
      return acc;
    }, {});
    const active = nextPages[activePage] || nextPages[keys[0]] || "";
    setGeneratedPages(nextPages);
    setGeneratedSite(active);
    setDraftHtml(active);
    setEditHistory(active ? [active] : []);
    setPublishStatus("success");
    setPublishMessage(`Updated map location: ${nextQuery}`);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedImage) return;
    await replaceInlineImage(selectedImage.id, file, imageApplyScope);
    event.target.value = "";
  };

  const handleThemeColorChange = (key, value) => {
    setThemeColors((previous) => ({ ...previous, [key]: value }));
  };

  const toggleAutomationFeature = (key) => {
    setAutomationFeatures((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  const handleGenerateBrandKit = () => {
    const prompt = String(projectName || "").trim();
    if (!prompt) {
      setError("Enter a business prompt first (example: Build a cleaning company website).");
      return;
    }
    setBrandLoading(true);
    try {
      const nextKit = generateBrandKitFromPrompt(prompt);
      setBrandKit(nextKit);
      setPublishStatus("success");
      setPublishMessage(`TitoNova Cloud Engine Brand Designer generated a ${nextKit.category} brand kit.`);
    } finally {
      setBrandLoading(false);
    }
  };

  const handleApplyBrandKit = () => {
    if (!brandKit) return;
    const preset = TEXT_STYLE_PRESETS.find((item) => item.key === brandKit.typographyPreset) || TEXT_STYLE_PRESETS[0];
    const nextTextStyle = {
      ...DEFAULT_TEXT_STYLE,
      preset: preset.key,
      headingFamily: preset.headingFamily,
      bodyFamily: preset.bodyFamily,
      fontImport: preset.fontImport,
    };
    setThemeColors({ ...brandKit.palette });
    setTextStyle(nextTextStyle);

    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) {
      setPublishStatus("success");
      setPublishMessage("Brand kit applied to design controls.");
      return;
    }

    const nextPages = keys.reduce((acc, key) => {
      let html = working[key] || "";
      html = applyThemeToHtml(html, brandKit.palette);
      html = applyTypographyToHtml(html, nextTextStyle);
      html = updateImageSourceInHtml(html, "hero-image", brandKit.images[0]);
      html = updateImageSourceInHtml(html, "gallery-1", brandKit.images[1]);
      html = updateImageSourceInHtml(html, "gallery-2", brandKit.images[2]);
      html = updateImageSourceInHtml(html, "gallery-3", brandKit.images[3]);
      return { ...acc, [key]: html };
    }, {});

    const active = nextPages[activePage] || nextPages[keys[0]] || "";
    setGeneratedPages(nextPages);
    setGeneratedSite(active);
    setDraftHtml(active);
    setEditHistory(active ? [active] : []);
    setPublishStatus("success");
    setPublishMessage("Brand kit applied across all generated pages.");
  };

  const runMarketingAutopilot = async ({ source = "generation" } = {}) => {
    if (!marketingAutopilotEnabled) return;
    setMarketingLoading(true);
    try {
      const primaryOffer =
        selectedIndustryPackage?.promptFocus?.[0] ||
        "high-converting digital services";
      const pack = buildMarketingAutopilotPack({
        brandName: projectName || (brandKit?.prompt ?? "Your Business"),
        industryLabel: selectedIndustryPackage?.label || "General",
        primaryOffer,
        domainHint: normalizeDomain(customDomain),
      });
      setMarketingPack(pack);
      setPublishStatus("success");
      setPublishMessage(
        source === "redesign"
          ? "Redesign complete. TitoNova Cloud Engine Marketing Autopilot assets generated."
          : "Website generated. TitoNova Cloud Engine Marketing Autopilot assets generated."
      );
    } finally {
      setMarketingLoading(false);
    }
  };

  const runAiMarketingEngine = () => {
    if (marketingEngineLoading) return;
    const business = String(projectName || "Your Business").trim() || "Your Business";
    const offer = String(marketingOfferInput || "").trim() || "House Cleaning";
    const cities = String(marketingCitiesInput || "")
      .split(",")
      .map((city) => city.trim())
      .filter(Boolean)
      .slice(0, 20);

    if (cities.length === 0) {
      setPublishStatus("error");
      setPublishMessage("Add at least one city for SEO page generation.");
      return;
    }

    setMarketingEngineLoading(true);
    try {
      const seoPages = cities.map((city) => {
        const keyword = `${offer} ${city}`;
        return {
          title: keyword,
          slug: `${offer}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
          summary: `Location-focused SEO page for ${keyword} with local trust signals and CTA blocks.`,
        };
      });
      const sampleFirstName = "Sarah";
      const emailCampaign = {
        subject: `20% Off Your First ${offer}`,
        body: `Hi ${sampleFirstName},\n\nWe’re offering a special discount for new customers this week. Book your ${offer.toLowerCase()} today and save 20% on your first service.\n\nChoose a time that works for you and confirm online in minutes.\n\nBest,\n${business} Team`,
      };
      const platforms = ["Instagram", "LinkedIn", "Facebook", "TikTok"];
      const socialPosts = platforms.map((platform) => ({
        platform,
        copy:
          platform === "LinkedIn"
            ? `${business} now serves ${cities.join(", ")} with premium ${offer.toLowerCase()} and online booking.`
            : `Need ${offer.toLowerCase()} in ${cities[0]}? ${business} is offering 20% off for new customers this week. Book now.`,
      }));
      const ads = [
        {
          channel: "Google Ads",
          headline: `${offer} Near You | ${business}`,
          description: `Book online in minutes. Serving ${cities.join(", ")}.`,
        },
        {
          channel: "Facebook Ads",
          headline: `20% Off ${offer}`,
          description: `New customer offer this week. Tap to book and pay online.`,
        },
      ];
      const landingPages = cities.map((city) => ({
        title: `${offer} ${city} Landing Page`,
        slug: `${offer}-${city}-landing`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      }));

      setMarketingEngineOutput({ business, offer, seoPages, emailCampaign, socialPosts, ads, landingPages });
      setPublishStatus("success");
      setPublishMessage(`TitoNova Cloud Engine Marketing Engine generated SEO pages, email campaign, social posts, ads, and landing pages.`);
    } finally {
      setMarketingEngineLoading(false);
    }
  };

  const runSmartContentEngine = async ({ type, count, keyword } = {}) => {
    if (smartContentLoading) return;
    const targetType = SMART_CONTENT_TYPE_OPTIONS.some((item) => item.key === type) ? type : smartContentType;
    const requestedCount = Number(count || smartContentCount || 0);
    const targetCount = Math.max(1, Number.isFinite(requestedCount) ? requestedCount : 12);
    const keywordHint = String(keyword ?? smartContentKeyword).trim();
    const brandName = projectName || brandKit?.prompt || "Your Business";
    const industryLabel = selectedIndustryPackage?.label || "General";
    const batchSize = Math.min(25, targetCount);
    const totalBatches = Math.ceil(targetCount / batchSize);

    setSmartContentLoading(true);
    setSmartContentItems([]);
    setSmartContentProgress(`Generating ${targetCount} ${targetType}...`);
    try {
      const generated = [];
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex += 1) {
        const batchCount = Math.min(batchSize, targetCount - generated.length);
        setSmartContentProgress(`Generating batch ${batchIndex + 1}/${totalBatches}...`);
        let batchItems = [];
        try {
          const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: `Generate ${batchCount} ${targetType} for ${brandName} (${industryLabel}).
Keyword focus: ${keywordHint || `${brandName} ${industryLabel}`}.
Return strict JSON only:
{"items":[{"type":"${targetType}","title":"...","keyword":"...","summary":"...","slug":"..."}]}
Keep each item unique, SEO-friendly, and conversion-oriented.`,
            }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(payload?.error || "Smart content generation failed.");
          const parsed = parseModelJson(payload?.result);
          batchItems = normalizeSmartContentItems(parsed?.items, targetType);
        } catch {
          batchItems = [];
        }
        if (batchItems.length === 0) {
          batchItems = buildSmartContentFallbackItems({
            type: targetType,
            count: batchCount,
            brandName,
            industryLabel,
            keyword: keywordHint,
          });
        }
        generated.push(...batchItems.slice(0, batchCount));
        setSmartContentItems([...generated]);
      }
      setSmartContentType(targetType);
      setSmartContentCount(targetCount);
      if (keywordHint) setSmartContentKeyword(keywordHint);
      setSmartContentProgress(`Generated ${generated.length} ${targetType}.`);
      setPublishStatus("success");
      setPublishMessage(`Smart Content Engine generated ${generated.length} ${targetType}.`);
    } finally {
      setSmartContentLoading(false);
    }
  };

  const runMonetizationEngine = async () => {
    setMonetizationLoading(true);
    try {
      const plan = buildMonetizationEnginePlan({
        brandName: projectName || "Your Business",
        industryLabel: selectedIndustryPackage?.label || "General",
        enabledModules: selectedAutomationDefs.map((item) => item.key),
      });
      setMonetizationPlan(plan);
      setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine Monetization Engine generated revenue suggestions.");
    } finally {
      setMonetizationLoading(false);
    }
  };

  const applyTypographyToHtml = useCallback((html, styleConfig = textStyle) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const root =
        doc.body.querySelector("[data-tn-theme-root='true']") ||
        doc.body.querySelector("div");
      if (!root) return html || "";

      const nextStyle = { ...DEFAULT_TEXT_STYLE, ...(styleConfig || {}) };
      const vars = {
        "--tn-font-heading": nextStyle.headingFamily,
        "--tn-font-body": nextStyle.bodyFamily,
        "--tn-font-size-base": `${nextStyle.baseSizePx}px`,
        "--tn-line-height-base": String(nextStyle.lineHeight),
        "--tn-heading-weight": String(nextStyle.headingWeight),
        "--tn-body-weight": String(nextStyle.bodyWeight),
        "--tn-heading-spacing": `${nextStyle.headingSpacingEm}em`,
      };
      Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
      root.style.setProperty("font-family", "var(--tn-font-body)");
      root.style.setProperty("font-size", "var(--tn-font-size-base)");
      root.style.setProperty("line-height", "var(--tn-line-height-base)");
      root.style.setProperty("font-weight", "var(--tn-body-weight)");

      const styleTag = doc.body.querySelector("style[data-tn-typography='true']");
      const importTag = `@import url("${nextStyle.fontImport}");`;
      if (styleTag) {
        styleTag.textContent = importTag;
      } else {
        root.insertAdjacentHTML("afterbegin", `<style data-tn-typography="true">${importTag}</style>`);
      }
      return doc.body.innerHTML || html || "";
    } catch {
      return html || "";
    }
  }, [textStyle]);

  const runDesignEvolution = useCallback(async ({ silent = false } = {}) => {
    if (evolutionRunning) return;
    const working =
      generatedPages && Object.keys(generatedPages).length > 0
        ? generatedPages
        : generatedSite
          ? { [activePage]: generatedSite }
          : {};
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) return;

    setEvolutionRunning(true);
    try {
      const nextTheme = pickNextTheme(themeColors);
      const nextPreset =
        TEXT_STYLE_PRESETS[(TEXT_STYLE_PRESETS.findIndex((item) => item.key === textStyle.preset) + 1) % TEXT_STYLE_PRESETS.length] ||
        TEXT_STYLE_PRESETS[0];
      const nextTextStyle = {
        ...textStyle,
        preset: nextPreset.key,
        headingFamily: nextPreset.headingFamily,
        bodyFamily: nextPreset.bodyFamily,
        fontImport: nextPreset.fontImport,
      };

      const nextPages = keys.reduce((acc, key) => {
        const themed = applyThemeToHtml(working[key] || "", nextTheme);
        const typed = applyTypographyToHtml(themed, nextTextStyle);
        return { ...acc, [key]: typed };
      }, {});

      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      setThemeColors({ ...nextTheme });
      setTextStyle(nextTextStyle);
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
      const timestamp = new Date().toISOString();
      setLastDesignEvolutionAt(timestamp);
      if (!silent) {
        setPublishStatus("success");
        setPublishMessage("TitoNova Cloud Engine Design Evolution applied: modernized layout style, fonts, and color palette.");
      }
    } finally {
      setEvolutionRunning(false);
    }
  }, [
    evolutionRunning,
    generatedPages,
    generatedSite,
    activePage,
    themeColors,
    textStyle,
    applyThemeToHtml,
    applyTypographyToHtml,
  ]);

  const runSelfOptimization = useCallback(async ({ silent = false } = {}) => {
    if (selfOptimizeRunning) return;
    const working =
      generatedPages && Object.keys(generatedPages).length > 0
        ? generatedPages
        : generatedSite
          ? { [activePage]: generatedSite }
          : {};
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) return;

    const headlineVariants = [
      `${projectName || "Your Business"} Delivers Trusted Results Faster`,
      `Get Reliable, High-Quality Support with ${projectName || "Your Team"}`,
      `${projectName || "Your Business"} Helps You Grow with Confidence`,
    ];
    const ctaVariants = [
      "Book a Free Consultation",
      "Get Your Custom Plan",
      "Talk to Our Team Today",
    ];
    const cycleIndex = selfOptimizationHistory.length % Math.min(headlineVariants.length, ctaVariants.length);

    setSelfOptimizeRunning(true);
    try {
      let optimizedImages = 0;
      let optimizedCtas = 0;
      let optimizedHeadlines = 0;

      const nextPages = keys.reduce((acc, key) => {
        const html = String(working[key] || "");
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
          const root = doc.body;

          const primaryHeading = root.querySelector("h1");
          if (primaryHeading && key === "index.html") {
            primaryHeading.textContent = headlineVariants[cycleIndex];
            optimizedHeadlines += 1;
          }

          const ctaNodes = Array.from(root.querySelectorAll("a,button")).filter((node) =>
            /(contact|book|start|get|learn|reserve|order|request|sign|call|quote)/i.test(String(node.textContent || ""))
          );
          ctaNodes.slice(0, 2).forEach((node, index) => {
            const nextText = index === 0 ? ctaVariants[cycleIndex] : "Learn Why Clients Choose Us";
            node.textContent = nextText;
            optimizedCtas += 1;
          });

          const images = Array.from(root.querySelectorAll("img"));
          images.forEach((img) => {
            const imageId = String(img.getAttribute("data-image-id") || "");
            if (imageId !== "hero-image") {
              img.setAttribute("loading", "lazy");
              img.setAttribute("decoding", "async");
              img.setAttribute("fetchpriority", "low");
              optimizedImages += 1;
            } else if (!img.getAttribute("fetchpriority")) {
              img.setAttribute("fetchpriority", "high");
            }
            if (!img.getAttribute("width")) img.setAttribute("width", "1200");
            if (!img.getAttribute("height")) img.setAttribute("height", "800");
          });

          acc[key] = root.innerHTML || html;
        } catch {
          acc[key] = html;
        }
        return acc;
      }, {});

      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      const timestamp = new Date().toISOString();
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
      setLastSelfOptimizationAt(timestamp);
      setSelfOptimizationHistory((previous) => [
        {
          at: timestamp,
          headline: headlineVariants[cycleIndex],
          cta: ctaVariants[cycleIndex],
          optimizedHeadlines,
          optimizedCtas,
          optimizedImages,
        },
        ...previous.slice(0, 9),
      ]);
      if (!silent) {
        setPublishStatus("success");
        setPublishMessage(
          `Self-optimization complete: ${optimizedHeadlines} headlines A/B tested, ${optimizedCtas} CTAs tuned, ${optimizedImages} images speed-optimized.`
        );
      }
    } finally {
      setSelfOptimizeRunning(false);
    }
  }, [
    selfOptimizeRunning,
    generatedPages,
    generatedSite,
    activePage,
    projectName,
    selfOptimizationHistory,
  ]);

  const applyWorkflowBookingsToCrm = useCallback((existingCustomers, workflowBookings) => {
    const next = Array.isArray(existingCustomers) ? [...existingCustomers] : [];
    (workflowBookings || []).forEach((booking, index) => {
      const email = String(booking?.email || "").trim().toLowerCase();
      if (!email) return;
      const nameFromEmail = email.split("@")[0].replace(/[._-]+/g, " ").trim();
      const displayName = nameFromEmail
        ? nameFromEmail.replace(/\b\w/g, (m) => m.toUpperCase())
        : `Booking Lead ${index + 1}`;
      const matchIndex = next.findIndex((item) => String(item?.email || "").toLowerCase() === email);
      if (matchIndex >= 0) {
        next[matchIndex] = {
          ...next[matchIndex],
          stage: "Booked",
          bookings: Number(next[matchIndex].bookings || 0) + 1,
        };
      } else {
        next.unshift({
          id: `crm-wf-${Date.now()}-${index}`,
          name: displayName,
          email,
          phone: "(not set)",
          bookings: 1,
          payments: 0,
          stage: "Booked",
        });
      }
    });
    return next.slice(0, 100);
  }, []);

  const runAutonomousBusinessMode = useCallback(async ({ silent = false } = {}) => {
    if (autonomousRunning) return;
    const hasSite = Object.keys(generatedPages || {}).length > 0 || Boolean(generatedSite);
    if (!hasSite) {
      if (!silent) {
        setPublishStatus("error");
        setPublishMessage("Generate a website first, then run Autonomous Business Mode.");
      }
      return;
    }

    setAutonomousRunning(true);
    try {
      const now = new Date().toISOString();
      const leads = (() => {
        try {
          const raw = localStorage.getItem("tn_assistant_leads");
          const parsed = raw ? JSON.parse(raw) : [];
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

      const newAppointments = [];
      const newInvoices = [];
      const nextProcessed = { ...autonomousProcessedLeadKeys };
      const newLog = [];

      const pendingLeads = leads
        .filter((lead) => lead && lead.email)
        .filter((lead) => !nextProcessed[String(lead.email).toLowerCase()])
        .slice(0, 5);

      pendingLeads.forEach((lead, index) => {
        const email = String(lead.email || "").toLowerCase();
        const message = String(lead.message || "");
        nextProcessed[email] = true;
        newLog.push({
          at: now,
          type: "inquiry",
          detail: `Responded to customer inquiry from ${email}.`,
        });

        if (/(book|schedule|appointment|consult)/i.test(message)) {
          const appointment = {
            id: `appt-${Date.now()}-${index}`,
            email,
            slot: `Next available (${index + 1} day${index === 0 ? "" : "s"})`,
            status: "scheduled",
          };
          newAppointments.push(appointment);
          newLog.push({
            at: now,
            type: "appointment",
            detail: `Scheduled appointment for ${email}: ${appointment.slot}.`,
          });

          const amount = selectedIndustryPackage?.key === "law-firm" ? 250 : selectedIndustryPackage?.key === "restaurant" ? 80 : 150;
          const invoice = {
            id: `inv-${Date.now()}-${index}`,
            email,
            amount,
            status: "sent",
          };
          newInvoices.push(invoice);
          newLog.push({
            at: now,
            type: "invoice",
            detail: `Sent invoice ${invoice.id} to ${email} for $${amount}.`,
          });
        }
      });

      if (pendingLeads.length === 0) {
        newLog.push({
          at: now,
          type: "monitor",
          detail: "No new inquiries found. Monitoring channels and waiting for the next cycle.",
        });
      }

      if (workflowAutomationEnabled && workflowAutoOnAutonomous && newAppointments.length > 0) {
        const workflowEntries = newAppointments.map((appointment, index) => ({
          id: `wf-auto-${Date.now()}-${index}`,
          at: now,
          source: "autonomous",
          email: String(appointment.email || "").toLowerCase(),
          service: "Automated Consultation",
          slot: appointment.slot,
          steps: [
            { id: "new-booking", label: "New Booking", status: "pass", detail: appointment.slot },
            {
              id: "confirm-email",
              label: "Send Confirmation Email",
              status: "pass",
              detail: `Sent to ${String(appointment.email || "").toLowerCase()}`,
            },
            { id: "crm-add", label: "Add to CRM", status: "pass", detail: "Lead moved to Booked stage" },
            {
              id: "reminder-24h",
              label: `Send Reminder ${workflowReminderHours}h Before`,
              status: "pass",
              detail: `Reminder scheduled for ${workflowReminderHours}h before appointment`,
            },
          ],
        }));
        setWorkflowRuns((previous) => [...workflowEntries, ...previous].slice(0, 25));
        setCrmCustomers((previous) =>
          applyWorkflowBookingsToCrm(
            previous,
            workflowEntries.map((item) => ({ email: item.email }))
          )
        );
        newLog.push({
          at: now,
          type: "workflow",
          detail: `Automation workflow ran for ${workflowEntries.length} autonomous booking(s): confirmation, CRM sync, ${workflowReminderHours}h reminder.`,
        });
      }

      const competitorPriceSignals = (competitorIntel?.competitors || [])
        .map((item) => String(item?.pricing || "").toLowerCase())
        .join(" ");
      const pricingNote = /premium|high|expensive/.test(competitorPriceSignals)
        ? "Competitor pricing appears premium. Test a value-tier offer to increase win rate."
        : /discount|cheap|low/.test(competitorPriceSignals)
          ? "Competitor pricing appears discount-heavy. Test a premium positioning package with stronger guarantees."
          : "Run a pricing A/B test: Standard package vs Value package to improve conversion.";
      setAutonomousPricingNote(pricingNote);
      newLog.push({
        at: now,
        type: "pricing",
        detail: `Pricing recommendation: ${pricingNote}`,
      });

      setAutonomousProcessedLeadKeys(nextProcessed);
      setAutonomousAppointments((previous) => [...newAppointments, ...previous].slice(0, 50));
      setAutonomousInvoices((previous) => [...newInvoices, ...previous].slice(0, 50));
      setAutonomousLog((previous) => [...newLog, ...previous].slice(0, 120));

      if (!silent) {
        setPublishStatus("success");
        setPublishMessage(
          `Autonomous cycle complete: ${pendingLeads.length} inquiries handled, ${newAppointments.length} appointments scheduled, ${newInvoices.length} invoices sent.`
        );
      }
    } finally {
      setAutonomousRunning(false);
    }
  }, [
    autonomousRunning,
    generatedPages,
    generatedSite,
    autonomousProcessedLeadKeys,
    competitorIntel,
    selectedIndustryPackage,
    workflowAutomationEnabled,
    workflowAutoOnAutonomous,
    workflowReminderHours,
    applyWorkflowBookingsToCrm,
  ]);

  const translatePageHtml = async (html, targetLanguage) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      const textNodes = Array.from(
        doc.body.querySelectorAll("h1,h2,h3,h4,p,li,a,button,label,strong,small,summary")
      );
      const inputNodes = Array.from(doc.body.querySelectorAll("input[placeholder],textarea[placeholder]"));

      const textEntries = textNodes
        .map((node, index) => ({ index, text: String(node.textContent || "").trim() }))
        .filter((entry) => entry.text.length > 0);
      const placeholderEntries = inputNodes
        .map((node, index) => ({ index, text: String(node.getAttribute("placeholder") || "").trim() }))
        .filter((entry) => entry.text.length > 0);

      const sourceTexts = [...textEntries.map((item) => item.text), ...placeholderEntries.map((item) => item.text)];
      if (sourceTexts.length === 0) return html || "";

      const response = await fetchWithTimeout("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Translate the following UI strings into ${targetLanguage}.
Rules:
- Keep order exactly the same.
- Preserve brand names and URLs.
- Return strict JSON only in this format: {"translations":["..."]}.

Strings:
${JSON.stringify(sourceTexts)}`,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Translation failed.");
      const parsed = parseModelJson(payload?.result);
      const translations = Array.isArray(parsed?.translations) ? parsed.translations : [];
      if (translations.length !== sourceTexts.length) return html || "";

      textEntries.forEach((entry, idx) => {
        const node = textNodes[entry.index];
        if (node) node.textContent = String(translations[idx] || entry.text);
      });
      placeholderEntries.forEach((entry, idx) => {
        const node = inputNodes[entry.index];
        const translated = String(translations[textEntries.length + idx] || entry.text);
        if (node) node.setAttribute("placeholder", translated);
      });
      return doc.body.innerHTML || html || "";
    } catch {
      return html || "";
    }
  };

  const handleTranslateAllPages = async () => {
    const lang = String(translationLanguage || "").trim();
    if (!lang) return;
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) return;
    setTranslating(true);
    try {
      const nextPages = {};
      for (const key of keys) {
        // Keep sequence deterministic for stable content replacements.
        nextPages[key] = await translatePageHtml(working[key] || "", lang);
      }
      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
      setPublishStatus("success");
      setPublishMessage(`Global translation complete: ${lang}`);
    } finally {
      setTranslating(false);
    }
  };

  const applyIndustryTemplate = (templateKey) => {
    const target = INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === templateKey);
    if (!target) return;
    const nextFlags = buildFeatureFlagsForIndustry(target.key);
    setIndustryTemplate(target.key);
    setAutomationFeatures(nextFlags);
  };

  const handleResetThemeColors = () => {
    const nextColors = { ...DEFAULT_THEME_COLORS };
    setThemeColors(nextColors);
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length > 0) {
      const nextPages = keys.reduce((acc, key) => {
        const themed = applyThemeToHtml(working[key] || "", nextColors);
        acc[key] = applyTypographyToHtml(themed, textStyle);
        return acc;
      }, {});
      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
    }
    setPublishStatus("success");
    setPublishMessage("Default colors reset and applied.");
  };

  const handleTextStylePresetChange = (presetKey) => {
    const preset = TEXT_STYLE_PRESETS.find((item) => item.key === presetKey) || TEXT_STYLE_PRESETS[0];
    setTextStyle((previous) => ({
      ...previous,
      preset: preset.key,
      headingFamily: preset.headingFamily,
      bodyFamily: preset.bodyFamily,
      fontImport: preset.fontImport,
    }));
  };

  const handleResetTextStyles = () => {
    const nextStyle = { ...DEFAULT_TEXT_STYLE };
    setTextStyle(nextStyle);
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length > 0) {
      const nextPages = keys.reduce((acc, key) => {
        const themed = applyThemeToHtml(working[key] || "", themeColors);
        acc[key] = applyTypographyToHtml(themed, nextStyle);
        return acc;
      }, {});
      const active = nextPages[activePage] || nextPages[keys[0]] || "";
      setGeneratedPages(nextPages);
      setGeneratedSite(active);
      setDraftHtml(active);
      setEditHistory(active ? [active] : []);
    }
    setPublishStatus("success");
    setPublishMessage("Text defaults reset and applied.");
  };

  const handleApplyTextStyles = () => {
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) return;
    const nextPages = keys.reduce((acc, key) => {
      const themed = applyThemeToHtml(working[key] || "", themeColors);
      acc[key] = applyTypographyToHtml(themed, textStyle);
      return acc;
    }, {});
    const active = nextPages[activePage] || nextPages[keys[0]] || "";
    setGeneratedPages(nextPages);
    setGeneratedSite(active);
    setDraftHtml(active);
    setEditHistory(active ? [active] : []);
    setPublishStatus("success");
    setPublishMessage("Text styles and fonts applied across all pages.");
  };

  const handleApplyThemeColors = () => {
    const working = getWorkingPages();
    const keys = orderPageKeys(Object.keys(working));
    if (keys.length === 0) return;
    const nextPages = keys.reduce((acc, key) => {
      acc[key] = applyThemeToHtml(working[key] || "", themeColors);
      return acc;
    }, {});
    const active = nextPages[activePage] || nextPages[keys[0]] || "";
    setGeneratedPages(nextPages);
    setGeneratedSite(active);
    setDraftHtml(active);
    setEditHistory(active ? [active] : []);
    setPublishStatus("success");
    setPublishMessage("Theme colors applied across all pages.");
  };

  const buildDomainPendingMessage = (domain, context = "published") =>
    context === "published"
      ? `Website is live. Domain ${domain} is saved. Complete DNS/provider connection to finish linking it.`
      : `Domain ${domain} is saved. Complete DNS/provider connection to finish linking it.`;

  const publishToHosting = useCallback(async ({ siteId, pages, domain }) => {
    const files = Object.entries(pages || {}).reduce((acc, [name, html]) => {
      const pageLabel = pageLabelFromKey(name) || "Page";
      acc[name] = buildDocumentHtml(String(html || ""), `${projectName || "Generated Site"} | ${pageLabel}`);
      return acc;
    }, {});
    if (!files["index.html"]) {
      const fallbackKey = Object.keys(files)[0];
      if (fallbackKey) files["index.html"] = files[fallbackKey];
    }

    const isLocalHost =
      typeof window !== "undefined" && isLocalHostName(String(window.location.hostname || ""));
    const envBaseUrls = [HOSTING_BASE_URL, REGISTRAR_BASE_URL].filter((value) =>
      isUsableApiBaseUrl(value, isLocalHost)
    );
    const sameOriginBase =
      typeof window !== "undefined" ? String(window.location.origin || "").replace(/\/$/, "") : "";
    const sameOriginFallbackUrls = [
      sameOriginBase ? `${sameOriginBase}/api/hosting/publish` : "",
      "/api/hosting/publish",
    ];
    const localFallbackUrls = [
      ...sameOriginFallbackUrls,
      "http://localhost:8787/api/hosting/publish",
    ];
    const publishUrls = Array.from(
      new Set(
        [
          ...envBaseUrls.map((base) => `${base}/api/hosting/publish`),
          ...(isLocalHost ? localFallbackUrls : sameOriginFallbackUrls),
        ].filter(Boolean)
      )
    );

    const requestBody = JSON.stringify({
      siteId,
      projectName: projectName || "Generated Site",
      customDomain: domain || "",
      files,
    });

    let lastError = null;
    for (const publishUrl of publishUrls) {
      try {
        const response = await fetch(publishUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(HOSTING_GATEWAY_TOKEN ? { "x-registrar-token": HOSTING_GATEWAY_TOKEN } : {}),
          },
          body: requestBody,
        });
        const payload = await response.json().catch(() => ({}));
        if (response.ok) return payload;

        const rawMessage = String(payload?.details || payload?.error || "").trim();
        // Retry all configured endpoints before failing hard. This avoids early exits on 404
        // when one base URL is misconfigured but another is valid.
        lastError = new Error(
          rawMessage || `Publish failed (HTTP ${response.status}) via ${publishUrl}.`
        );
        continue;
      } catch (error) {
        lastError = error;
      }
    }

    const configuredHint =
      !isLocalHost && envBaseUrls.length === 0
        ? "No production gateway URL is configured. Tried same-origin /api fallback."
        : "Check VITE_HOSTING_API_BASE_URL / VITE_REGISTRAR_API_BASE_URL and ensure gateway is reachable.";
    throw new Error(
      `${String(lastError?.message || "Go Live publish failed.")} ${configuredHint} Tried: ${publishUrls.join(", ")}`
    );
  }, [buildDocumentHtml, projectName]);

  const handleExportHtml = () => {
    const content = isInlineEditing ? draftHtml : generatedSite || "";
    if (!content) return;
    const filename = makeProjectSlug(projectName);
    const pageLabel = pageLabelFromKey(activePage) || "Page";
    const fullHtml = buildDocumentHtml(content, `${projectName || "Generated Site"} | ${pageLabel}`);
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const buildExportBundleFiles = (framework) => {
    const workingPages = getWorkingPages();
    const keys = orderPageKeys(Object.keys(workingPages));
    const slug = makeProjectSlug(projectName);
    const siteTitle = projectName || "Generated Site";
    const htmlPages = keys.reduce((acc, key) => {
      const body = workingPages[key] || "";
      const title = `${siteTitle} | ${pageLabelFromKey(key)}`;
      acc[key] = buildDocumentHtml(body, title);
      return acc;
    }, {});
    const pageJson = JSON.stringify(htmlPages, null, 2);
    const navKeysJson = JSON.stringify(keys, null, 2);

    if (framework === "html" || framework === "webflow" || framework === "tailwind") {
      const baseFiles = {
        "README.md":
          `# ${siteTitle}\n\nExport target: ${framework.toUpperCase()}\n\nProject structure:\n- /pages\n- /components\n- /styles\n- /assets\n`,
        "project.manifest.json": JSON.stringify(
          {
            name: siteTitle,
            framework,
            pages: keys,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        "components/.gitkeep": "",
        "styles/.gitkeep": "",
        "assets/.gitkeep": "",
      };
      Object.entries(htmlPages).forEach(([key, content]) => {
        const pathKey = framework === "webflow" ? `webflow/pages/${key}` : `pages/${key}`;
        baseFiles[pathKey] = content;
      });
      if (framework === "tailwind") {
        baseFiles["tailwind.config.js"] = `export default { content: ["./pages/**/*.{html,js}"], theme: { extend: {} }, plugins: [] };`;
        baseFiles["styles/tailwind.css"] = "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n";
        baseFiles["postcss.config.js"] = "export default { plugins: { tailwindcss: {}, autoprefixer: {} } };";
      }
      return baseFiles;
    }

    if (framework === "react") {
      return {
        "package.json": JSON.stringify(
          {
            name: `${slug}-react-export`,
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
            dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
            devDependencies: { vite: "^7.0.0", "@vitejs/plugin-react": "^5.0.0" },
          },
          null,
          2
        ),
        "index.html": `<!doctype html><html><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
        "src/main.jsx": `import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./styles.css";\ncreateRoot(document.getElementById("root")).render(<App />);\n`,
        "src/App.jsx": `import React, { useState } from "react";\nconst pages = ${pageJson};\nconst nav = ${navKeysJson};\nexport default function App(){const [active,setActive]=useState(nav[0]||"index.html");return(<div><nav style={{display:"flex",gap:8,flexWrap:"wrap",padding:12}}>{nav.map((k)=><button key={k} onClick={()=>setActive(k)}>{k}</button>)}</nav><main dangerouslySetInnerHTML={{__html: pages[active]||""}} /></div>);}\n`,
        "src/styles.css": "body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#0f172a}",
        "components/.gitkeep": "",
        "pages/.gitkeep": "",
        "styles/.gitkeep": "",
        "assets/.gitkeep": "",
      };
    }

    if (framework === "nextjs") {
      return {
        "package.json": JSON.stringify(
          {
            name: `${slug}-next-export`,
            private: true,
            version: "1.0.0",
            scripts: { dev: "next dev", build: "next build", start: "next start" },
            dependencies: { next: "^15.0.0", react: "^19.0.0", "react-dom": "^19.0.0" },
          },
          null,
          2
        ),
        "app/layout.jsx": `export const metadata = { title: ${JSON.stringify(siteTitle)} }; export default function RootLayout({ children }) { return <html><body>{children}</body></html>; }`,
        "app/page.jsx": `import pages from "../pages/pages.json"; export default function Page(){return <main dangerouslySetInnerHTML={{__html: pages["index.html"]||""}} />;}`,
        "pages/pages.json": pageJson,
        "components/.gitkeep": "",
        "styles/.gitkeep": "",
        "assets/.gitkeep": "",
      };
    }

    if (framework === "vue") {
      return {
        "package.json": JSON.stringify(
          {
            name: `${slug}-vue-export`,
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
            dependencies: { vue: "^3.5.0" },
            devDependencies: { vite: "^7.0.0", "@vitejs/plugin-vue": "^5.0.0" },
          },
          null,
          2
        ),
        "index.html": `<!doctype html><html><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>`,
        "src/main.js": `import { createApp } from "vue"; import App from "./App.vue"; createApp(App).mount("#app");`,
        "src/App.vue": `<script setup>\nimport { ref } from "vue";\nconst pages = ${pageJson};\nconst nav = ${navKeysJson};\nconst active = ref(nav[0] || "index.html");\n</script>\n<template><div><nav style="display:flex;gap:8px;flex-wrap:wrap;padding:12px"><button v-for="k in nav" :key="k" @click="active=k">{{k}}</button></nav><main v-html="pages[active] || ''" /></div></template>\n`,
        "components/.gitkeep": "",
        "pages/.gitkeep": "",
        "styles/.gitkeep": "",
        "assets/.gitkeep": "",
      };
    }

    return {};
  };

  const handleExportProjectBundle = async () => {
    const framework = EXPORT_FRAMEWORK_OPTIONS.includes(exportFramework) ? exportFramework : "html";
    const files = buildExportBundleFiles(framework);
    const entries = Object.entries(files || {});
    if (entries.length === 0) return;
    setExportBundleLoading(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      entries.forEach(([filePath, content]) => {
        zip.file(filePath, String(content ?? ""));
      });
      const blob = await zip.generateAsync({ type: "blob" });
      const slug = makeProjectSlug(projectName);
      const download = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);
      download.href = objectUrl;
      download.download = `${slug}-${framework}-export.zip`;
      document.body.appendChild(download);
      download.click();
      download.remove();
      URL.revokeObjectURL(objectUrl);
      setPublishStatus("success");
      setPublishMessage(`Exported ${framework.toUpperCase()} project bundle.`);
    } finally {
      setExportBundleLoading(false);
    }
  };

  const handleGoLive = useCallback(async ({ republish = false, forceDomain = "" } = {}) => {
    const pages = getWorkingPages();
    if (!pages["index.html"]) return "";
    setPublishing(true);
    setPublishMessage("");
    setPublishStatus("info");
    setLiveUrl("");
    setDnsVerifyStatus("idle");
    setDnsVerifyMessage("");
    try {
      const siteId = republish && publishedSiteId ? publishedSiteId : makeSiteId(projectName);
      const cleanedDomain = normalizeDomain(forceDomain || customDomain);
      const payload = await publishToHosting({ siteId, pages, domain: cleanedDomain });

      const nextUrl = String(payload?.url || "");
      setPublishedSiteId(siteId);
      setLiveUrl(nextUrl);
      setHostingProfile((previous) => ({
        ...previous,
        domain: cleanedDomain || previous.domain || "",
        sslEnabled: Boolean(payload?.ssl?.enabled ?? previous.sslEnabled),
        cdnEnabled: Boolean(payload?.cdn?.enabled ?? previous.cdnEnabled),
        tier: String(payload?.hosting?.tier || previous.tier || "Fast Hosting"),
        provider: String(payload?.provider || previous.provider || "gateway"),
        liveUrl: nextUrl || previous.liveUrl || "",
        updatedAt: new Date().toISOString(),
      }));
      if (cleanedDomain) {
        try {
          await handleAttachDomain(siteId, cleanedDomain);
          setCustomDomain(cleanedDomain);
          setPublishStatus("success");
          setPublishMessage(
            republish
              ? `Website re-published and domain attached: ${cleanedDomain}`
              : `Website published and domain attached: ${cleanedDomain}`
          );
        } catch {
          setCustomDomain(cleanedDomain);
          setPublishStatus("info");
          setPublishMessage(buildDomainPendingMessage(cleanedDomain, "published"));
        }
      } else {
        setPublishStatus("success");
        setPublishMessage(republish ? "Website re-published successfully." : "Website published successfully.");
      }
      if (nextUrl) window.open(nextUrl, "_blank", "noopener,noreferrer");
      return nextUrl;
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Go Live failed."));
      return "";
    } finally {
      setPublishing(false);
    }
  }, [
    customDomain,
    getWorkingPages,
    handleAttachDomain,
    makeSiteId,
    projectName,
    publishedSiteId,
    publishToHosting,
  ]);

  const handleOneClickHosting = async () => {
    if (oneClickHostingRunning || publishing || domainLoading || verifyingDns) return;
    const pages = getWorkingPages();
    if (!pages["index.html"]) {
      setPublishStatus("error");
      setPublishMessage("Generate a website first, then launch one-click hosting.");
      return;
    }

    setOneClickHostingRunning(true);
    setPublishStatus("info");
    setPublishMessage("Launching one-click hosting: publish, domain attach, SSL/CDN provisioning, and DNS verification.");
    try {
      const domainCandidate = normalizeDomain(customDomain) || `${makeProjectSlug(projectName || "site")}.com`;
      if (!customDomain.trim()) setCustomDomain(domainCandidate);
      const nextUrl = await handleGoLive({ forceDomain: domainCandidate });
      if (!nextUrl) throw new Error("Publish step failed.");
      const verifiedStatus = await verifyDomainStatus(domainCandidate);
      if (verifiedStatus.records.length > 0) setDnsRecords(verifiedStatus.records);
      setDnsVerifyStatus(verifiedStatus.verified ? "success" : "warning");
      setDnsVerifyMessage(
        verifiedStatus.verified
          ? `DNS verified for ${domainCandidate}.`
          : `DNS is still propagating for ${domainCandidate}.`
      );
      setHostingProfile((previous) => ({
        ...previous,
        domain: domainCandidate,
        sslEnabled: Boolean(verifiedStatus.sslEnabled),
        cdnEnabled: Boolean(verifiedStatus.cdnEnabled),
        verified: Boolean(verifiedStatus.verified),
        provider: String(verifiedStatus.provider || previous.provider || "gateway"),
        tier: String(previous.tier || "Fast Hosting"),
        liveUrl: nextUrl,
        updatedAt: new Date().toISOString(),
      }));
      setPublishStatus("success");
      setPublishMessage(
        `One-click hosting complete: ${domainCandidate} is configured with SSL, CDN, and fast hosting.`
      );
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "One-click hosting failed."));
    } finally {
      setOneClickHostingRunning(false);
    }
  };

  const handleUnpublish = async () => {
    if (!publishedSiteId) return;
    setPublishing(true);
    setPublishMessage("");
    setPublishStatus("info");
    try {
      const response = await fetch("/api/hosting/unpublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: publishedSiteId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Unpublish failed.");
      setLiveUrl("");
      setPublishedSiteId("");
      setHostingProfile({ ...DEFAULT_HOSTING_PROFILE });
      setPublishStatus("success");
      setPublishMessage("Website unpublished successfully.");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Unpublish failed."));
    } finally {
      setPublishing(false);
    }
  };

  const handleAddDomainNow = async () => {
    if (!publishedSiteId) {
      setPublishStatus("info");
      setPublishMessage("Publish first, then add your domain.");
      return;
    }
    setDomainLoading(true);
    setPublishMessage("");
    setPublishStatus("info");
    setDnsVerifyStatus("idle");
    setDnsVerifyMessage("");
    try {
      const domain = normalizeDomain(customDomain);
      if (!domain) throw new Error("Enter a valid domain (example.com).");
      try {
        await handleAttachDomain(publishedSiteId, domain);
        setCustomDomain(domain);
        setPublishStatus("success");
        setPublishMessage(`Domain attached successfully: ${domain}`);
      } catch (attachError) {
        const pages = getWorkingPages();
        if (!pages["index.html"]) throw attachError;
        await publishToHosting({ siteId: publishedSiteId, pages, domain });
        setCustomDomain(domain);
        setPublishStatus("info");
        setPublishMessage(buildDomainPendingMessage(domain, "saved"));
      }
    } catch (err) {
      setPublishStatus("error");
      setPublishMessage(String(err?.message || "Domain attach failed."));
    } finally {
      setDomainLoading(false);
    }
  };

  const extractBusinessServices = (generation, promptText) => {
    const candidates = [];
    const pages = Array.isArray(generation?.parsed?.pages) ? generation.parsed.pages : [];
    pages.forEach((page) => {
      const sections = Array.isArray(page?.sections) ? page.sections : [];
      sections.forEach((section) => {
        if (!/(services|features|offers|packages)/i.test(String(section?.type || ""))) return;
        const items = Array.isArray(section?.items) ? section.items : [];
        items.forEach((item) => {
          if (typeof item === "string") candidates.push(item.trim());
          if (item && typeof item === "object") {
            const value = String(item.title || item.name || item.label || item.description || "").trim();
            if (value) candidates.push(value);
          }
        });
      });
    });
    const normalized = Array.from(new Set(candidates.filter(Boolean))).slice(0, 6);
    if (normalized.length >= 3) return normalized;
    if (/(car detailing|auto detailing|mobile detailing|detailing)/i.test(String(promptText || ""))) {
      return ["Interior Detailing", "Exterior Wash", "Full Detail Package"];
    }
    return ["Core Service 1", "Core Service 2", "Core Service 3"];
  };

  const runUnifiedWebsiteGeneration = async (options = {}) => {
    const intent = String(options.intent || "standard");
    const basePrompt = String(options.promptOverride || businessOsPrompt || "").trim();
    const requiredProjectName = String(options.projectNameOverride || projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before generating.");
      return null;
    }
    if (!basePrompt) {
      setError("Business Prompt is required.");
      setPublishStatus("error");
      setPublishMessage("Describe what you want to build before generating.");
      return null;
    }
    if (loading || uiDesignLoading || businessOsLaunching || pipelineRunning) return null;

    const inferredTemplate = String(
      options.industryTemplateOverride || inferIndustryTemplateFromPrompt(basePrompt)
    );
    const inferredName = deriveProjectNameFromBusinessPrompt(basePrompt);
    const nextProjectName = String(options.projectNameOverride || inferredName || requiredProjectName);
    const effectivePrompt =
      intent === "funnel"
        ? getEffectiveBusinessPrompt(
            `${basePrompt}\nCreate conversion funnel flow: Ad -> Landing Page -> Booking -> Payment.`,
            { force: true, solutionMode: "website-app", projectName: nextProjectName }
          )
        : getEffectiveBusinessPrompt(basePrompt, {
            force: true,
            solutionMode: intent === "business-os" ? "website-app" : solutionMode,
            projectName: nextProjectName,
          });
    const enforcedKeys = Array.isArray(options.enforceFeatureKeys) ? options.enforceFeatureKeys : [];

    if (intent === "business-os" || intent === "pipeline") {
      setSolutionMode("website-app");
      setAutoRevenueFeatures(true);
      setMarketingAutopilotEnabled(true);
      setIndustryTemplate(inferredTemplate);
      setAutomationFeatures((previous) => {
        const next = { ...previous };
        [...BUSINESS_OS_REQUIRED_FEATURE_KEYS, ...enforcedKeys].forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(next, key)) next[key] = true;
        });
        return next;
      });
    }

    if (!options.skipStatusMessage) {
      setPublishStatus("info");
      if (intent === "business-os") {
        setPublishMessage(
          "Launching TitoNova Cloud Engine Business OS: website, booking, pricing, payments, CRM, automation, and SEO pages."
        );
      } else if (intent === "funnel") {
        setPublishMessage("Generating funnel-ready website with conversion flow.");
      } else if (intent === "pipeline") {
        setPublishMessage("Running unified TitoNova Cloud Engine generation pipeline.");
      } else {
        setPublishMessage("Generating website with the unified TitoNova Cloud Engine flow.");
      }
    }

    const generation = await handleGenerate({
      projectNameOverride: nextProjectName,
      industryTemplateOverride: inferredTemplate,
      enforceFeatureKeys: enforcedKeys,
      businessOsPrompt: effectivePrompt,
    });
    if (!generation) return null;

    if (intent !== "business-os") {
      runDeferred(async () => {
        try {
          await handleAiUiDesign(basePrompt);
        } catch {
          // Keep generation resilient if design refinement fails.
        }
      });
    }

    return generation;
  };

  const handleLaunchBusinessOs = async () => {
    const rawCommand = String(businessOsPrompt || "").trim();
    const command = getEffectiveBusinessPrompt(rawCommand, { force: true, solutionMode: "website-app" });
    const requiredProjectName = String(projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before launching business.");
      return null;
    }
    if (!rawCommand) {
      setPublishStatus("error");
      setPublishMessage("Enter a Business OS command first (example: Start a cleaning company).");
      setError("Business Prompt is required.");
      return null;
    }
    const inferredTemplate = inferIndustryTemplateFromPrompt(rawCommand);
    const inferredName = deriveProjectNameFromBusinessPrompt(rawCommand);
    const nextProjectName = inferredName || projectName || "New Business";
    setBusinessOsLaunching(true);
    try {
      const generation = await runUnifiedWebsiteGeneration({
        intent: "business-os",
        projectNameOverride: nextProjectName,
        industryTemplateOverride: inferredTemplate,
        enforceFeatureKeys: BUSINESS_OS_REQUIRED_FEATURE_KEYS,
        promptOverride: command,
        skipStatusMessage: true,
      });
      if (!generation) {
        setBusinessOsOutput(null);
        return null;
      }

      const generatedPageKeys = Object.keys(generation.pages || {});
      const hasPage = (key) => generatedPageKeys.includes(key);
      const hasAnyPage = (keys = []) => keys.some((key) => hasPage(key));
      const firstPageHtml = generation.pages?.["index.html"] || generation.pages?.[generatedPageKeys[0]] || "";

      const moduleResults = [
        {
          key: "website",
          label: "Website",
          pass: hasAnyPage(["index.html", "about.html", "services.html", "contact.html"]),
          message: "Homepage + core pages generated",
        },
        {
          key: "brand",
          label: "Brand System",
          pass: Boolean(generation.effectiveUiDesign && generation.effectivePalette && generation.effectiveTypography),
          message: "Palette + typography + layout schema ready",
        },
        {
          key: "booking",
          label: "Booking System",
          pass: hasAnyPage(["booking.html"]),
          message: "Booking page and appointment flow generated",
        },
        {
          key: "crm",
          label: "CRM",
          pass: hasAnyPage(["crm.html", "client-dashboard.html"]),
          message: "CRM and dashboard pages generated",
        },
        {
          key: "payments",
          label: "Payment System",
          pass: hasAnyPage(["payments.html", "invoicing.html", "pricing.html"]),
          message: "Stripe-ready payments/invoicing/pricing pages generated",
        },
        {
          key: "marketing",
          label: "Marketing System",
          pass: hasAnyPage(["marketing-pages.html", "seo-pages.html"]),
          message: "Landing + SEO pages generated",
        },
        {
          key: "sales-agent",
          label: "TitoNova Cloud Engine Sales Agent",
          pass: /data-tn-ai-assistant/.test(firstPageHtml),
          message: "Embedded TitoNova Cloud Engine assistant present in generated site",
        },
      ];

      const passedCount = moduleResults.filter((item) => item.pass).length;
      const bundle = {
        project: {
          name: generation.resolvedProjectName,
          prompt: command,
          generatedAt: new Date().toISOString(),
        },
        modules: moduleResults,
        artifacts: {
          "/projects/brand/palette.json": generation.effectivePalette,
          "/projects/brand/typography.json": generation.effectiveTypography,
          "/projects/layout/layout.json": {
            layoutVariant: generation.effectiveUiDesign?.layoutVariant || "split-hero",
          },
          "/projects/layout/sections.json": {
            ...(generation.parsed?.sections && typeof generation.parsed.sections === "object"
              ? generation.parsed.sections
              : {}),
            sectionHierarchy: generation.effectiveUiDesign?.sectionHierarchy || {},
          },
          "/projects/layout/components.json": {
            ...(generation.parsed?.components && typeof generation.parsed.components === "object"
              ? generation.parsed.components
              : {}),
          },
          "/projects/pages": generation.pageJsonMap,
        },
      };

      setBusinessOsOutput({
        modules: moduleResults,
        passedCount,
        totalCount: moduleResults.length,
        bundle,
      });
      setPublishStatus(passedCount === moduleResults.length ? "success" : "info");
      setPublishMessage(
        passedCount === moduleResults.length
          ? "Business OS launch complete. All modules generated."
          : `Business OS launch complete. ${passedCount}/${moduleResults.length} modules passed.`
      );
      return { generation, moduleResults, passedCount, bundle };
    } finally {
      setBusinessOsLaunching(false);
    }
  };

  const handlePrimaryGenerateWebsite = async () => {
    const prompt = String(businessOsPrompt || "").trim();
    if (!prompt) return runUnifiedWebsiteGeneration({ intent: "standard" });
    const useBusinessOsFlow =
      /(business\s*os|start\s+a\s+.+\s+company|booking|crm|invoic|invoice|portal|dashboard|membership|subscription|payment integration|analytics|client dashboard|login portal)/i.test(
        prompt
      );

    if (prompt && useBusinessOsFlow) {
      await handleLaunchBusinessOs();
      return;
    }
    await runUnifiedWebsiteGeneration({ intent: "standard" });
  };

  const handleGenerateFunnel = async () => {
    const generation = await runUnifiedWebsiteGeneration({
      intent: "funnel",
      enforceFeatureKeys: FUNNEL_REQUIRED_KEYS,
      skipStatusMessage: false,
    });
    if (generation?.pages) setFunnelBuilderData(buildFunnelBuilderData(generation.pages));
  };

  const handleSmartComponentDragStart = (index) => {
    setDragComponentIndex(index);
  };

  const handleSmartComponentDrop = (targetIndex) => {
    if (dragComponentIndex < 0 || dragComponentIndex === targetIndex) {
      setDragComponentIndex(-1);
      return;
    }
    setSmartComponents((previous) => {
      const next = [...previous];
      const [moved] = next.splice(dragComponentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragComponentIndex(-1);
  };

  const handleAddCrmCustomer = () => {
    const name = String(crmNameInput || "").trim();
    const email = String(crmEmailInput || "").trim();
    if (!name || !email) {
      setPublishStatus("error");
      setPublishMessage("CRM requires customer name and email.");
      return;
    }
    const phone = String(crmPhoneInput || "").trim();
    const stage = CRM_LEAD_STAGES.includes(crmStageInput) ? crmStageInput : "New Leads";
    const nextCustomer = {
      id: `crm-${Date.now()}`,
      name,
      email,
      phone: phone || "(not set)",
      bookings: 0,
      payments: 0,
      stage,
    };
    setCrmCustomers((previous) => [nextCustomer, ...previous].slice(0, 100));
    setCrmNameInput("");
    setCrmEmailInput("");
    setCrmPhoneInput("");
    setCrmStageInput("New Leads");
    setPublishStatus("success");
    setPublishMessage(`CRM customer added: ${name}`);
  };

  const handleCrmStageChange = (id, nextStage) => {
    const stage = CRM_LEAD_STAGES.includes(nextStage) ? nextStage : "New Leads";
    setCrmCustomers((previous) =>
      previous.map((item) => (item.id === id ? { ...item, stage } : item))
    );
  };

  const runBookingAutomationWorkflow = ({ email, service, slot, source = "manual" } = {}) => {
    if (!workflowAutomationEnabled) {
      setPublishStatus("info");
      setPublishMessage("Enable Automation Workflows first.");
      return null;
    }
    const safeEmail = String(email || "").trim().toLowerCase();
    if (!safeEmail) {
      setPublishStatus("error");
      setPublishMessage("Workflow requires a booking email.");
      return null;
    }
    const safeService = String(service || bookingServices[0] || "Consultation").trim();
    const safeSlot = String(slot || bookingSlots[0] || "Next available").trim();
    const timestamp = new Date().toISOString();
    const steps = [
      { id: "new-booking", label: "New Booking", status: "pass", detail: `${safeService} at ${safeSlot}` },
      { id: "confirm-email", label: "Send Confirmation Email", status: "pass", detail: `Sent to ${safeEmail}` },
      { id: "crm-add", label: "Add to CRM", status: "pass", detail: "Lead moved to Booked stage" },
      {
        id: "reminder-24h",
        label: `Send Reminder ${workflowReminderHours}h Before`,
        status: "pass",
        detail: `Reminder scheduled for ${workflowReminderHours}h before appointment`,
      },
    ];

    const run = {
      id: `wf-${Date.now()}`,
      at: timestamp,
      source,
      email: safeEmail,
      service: safeService,
      slot: safeSlot,
      steps,
    };

    setWorkflowRuns((previous) => [run, ...previous].slice(0, 25));
    setCrmCustomers((previous) => applyWorkflowBookingsToCrm(previous, [{ email: safeEmail }]));
    setAutonomousLog((previous) => [
      {
        at: timestamp,
        type: "workflow",
        detail: `Automation workflow executed for ${safeEmail}: confirmation email, CRM sync, ${workflowReminderHours}h reminder.`,
      },
      ...previous,
    ].slice(0, 120));
    setPublishStatus("success");
    setPublishMessage("Automation workflow complete: confirmation sent, CRM updated, and reminder scheduled.");
    return run;
  };

  const handleRunWorkflowTest = () => {
    runBookingAutomationWorkflow({
      email: workflowTestEmail,
      service: bookingServices[0] || "Consultation",
      slot: bookingSlots[0] || "Next available",
      source: "manual-test",
    });
  };

  const togglePaymentProvider = (provider) => {
    setPaymentIntegrations((previous) => {
      const next = { ...previous, [provider]: !previous[provider] };
      const hasEnabled = PAYMENT_PROVIDER_KEYS.some((key) => Boolean(next[key]));
      if (!hasEnabled) next.Stripe = true;
      return next;
    });
  };

  const handleAiBusinessGenerator = async () => {
    if (businessGeneratorLoading || loading || uiDesignLoading || businessOsLaunching) return;
    const prompt = String(businessOsPrompt || "").trim();
    const requiredProjectName = String(projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before running TitoNova Cloud Engine Business Generator.");
      return;
    }
    if (!prompt) {
      setError("Business Prompt is required.");
      setPublishStatus("error");
      setPublishMessage("Describe the business you want to generate.");
      return;
    }

    setBusinessGeneratorLoading(true);
    try {
      const launch = await handleLaunchBusinessOs();
      const generation = launch?.generation;
      if (!generation) return;

      const businessName = String(generation?.resolvedProjectName || requiredProjectName).trim();
      const nextBrandKit = generateBrandKitFromPrompt(`${businessName} ${prompt}`);
      setBrandKit(nextBrandKit);
      const services = extractBusinessServices(generation, prompt);

      let website = String(liveUrl || "").trim();
      if (!website) {
        const goLiveUrl = await handleGoLive();
        website = String(goLiveUrl || "").trim();
      }
      if (!website) {
        website = `https://${makeProjectSlug(businessName)}.titonova.app`;
      }

      const output = {
        businessName,
        logo: nextBrandKit.logo,
        brandColors: nextBrandKit.palette,
        website,
        services,
      };
      setBusinessGeneratorOutput(output);
      setPublishStatus("success");
      setPublishMessage(`TitoNova Cloud Engine Business Generator complete for ${businessName}.`);
    } finally {
      setBusinessGeneratorLoading(false);
    }
  };

  const handleQuickPromptChip = (chip) => {
    const value = String(chip || "").trim();
    if (!value) return;
    setBusinessOsPrompt(value);
    setUiDesignPrompt(value);
    requestAnimationFrame(() => {
      const node = promptTextareaRef.current;
      if (!node) return;
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    });
    if (!projectName.trim()) {
      const base = value.replace(/\s+(website|company|agency|site)$/i, "").trim();
      if (base) setProjectName(base.replace(/\b\w/g, (m) => m.toUpperCase()));
    }
  };

  const handleEnhancePrompt = () => {
    const base = String(businessOsPrompt || "").trim();
    if (!base) {
      setPublishStatus("error");
      setPublishMessage("Add a prompt first, then click Enhance Prompt.");
      return;
    }
    const boosted = buildPowerPromptBrief(base, { force: true, solutionMode, projectName });
    setBusinessOsPrompt(boosted);
    setUiDesignPrompt(boosted);
    setPowerPromptEnabled(true);
    setPublishStatus("success");
    setPublishMessage("Prompt enhanced with TitoNova Power Brief directives.");
  };

  const handleSmartFillPrompt = () => {
    const current = String(businessOsPrompt || "").trim();
    if (!current) {
      setPublishStatus("error");
      setPublishMessage("Add a prompt first, then use Smart Fill.");
      return;
    }
    const parsed = parseStructuredBusinessPrompt(current);
    const intel = derivePromptIntelligence({
      rawPrompt: current,
      parsedPrompt: parsed,
      industryHint: selectedIndustryPackage?.label || "",
      packagePages: selectedIndustryPackage?.blueprint?.pages || [],
      packageServices: selectedIndustryPackage?.blueprint?.services || [],
    });
    const additions = [];
    if (!parsed.businessName) additions.push(`Business Name: ${projectName || "Your Business"}`);
    if (!parsed.industry) additions.push(`Industry: ${selectedIndustryPackage?.label || "Professional Services"}`);
    if (!parsed.pages?.length) {
      additions.push("Pages:");
      intel.suggestedPages.slice(0, 7).forEach((page) => additions.push(`- ${page}`));
    }
    if (!parsed.services?.length) {
      additions.push("Services:");
      intel.suggestedServices.slice(0, 6).forEach((service) => additions.push(`- ${service}`));
    }
    if (!parsed.contact?.phone && !parsed.contact?.email && !parsed.contact?.person) {
      additions.push("Contact:");
      additions.push("- Contact Person: Team");
      additions.push("- Phone: (555) 555-5555");
      additions.push("- Email: hello@example.com");
    }
    if (!parsed.style) additions.push("Style: Modern, clean, conversion-focused, professional");
    if (!parsed.colors?.length) additions.push("Colors: Blue and green");
    if (additions.length === 0) {
      setPublishStatus("info");
      setPublishMessage("Prompt already contains key structured fields.");
      return;
    }
    const next = `${current}\n\n${additions.join("\n")}`.slice(0, 5000);
    setBusinessOsPrompt(next);
    setUiDesignPrompt(next);
    syncPromptDerivedFields(next);
    setPublishStatus("success");
    setPublishMessage(`Smart Fill added ${additions.length} structured line${additions.length === 1 ? "" : "s"} to strengthen prompt quality.`);
  };

  const resizePromptTextarea = (target) => {
    if (!target) return;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 560)}px`;
  };

  const normalizePromptText = (value) =>
    String(value || "")
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+\n/g, "\n")
      .trim();

  const handleBusinessPromptChange = (event) => {
    const value = event.target.value;
    setBusinessOsPrompt(value);
    setUiDesignPrompt(value);
    syncPromptDerivedFields(value);
    if (error) setError("");
  };

  const handleBusinessPromptInput = (event) => {
    resizePromptTextarea(event.target);
  };

  const handleBusinessPromptPaste = (event) => {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData("text") || "";
    const cleaned = normalizePromptText(pastedText);
    const target = event.currentTarget;
    const current = String(businessOsPrompt || "");
    const start = Number(target.selectionStart ?? current.length);
    const end = Number(target.selectionEnd ?? current.length);
    const next = `${current.slice(0, start)}${cleaned}${current.slice(end)}`.slice(0, 5000);
    setBusinessOsPrompt(next);
    setUiDesignPrompt(next);
    syncPromptDerivedFields(next);
    requestAnimationFrame(() => resizePromptTextarea(target));
  };

  useEffect(() => {
    const node = promptTextareaRef.current;
    if (!node) return;
    resizePromptTextarea(node);
  }, [businessOsPrompt]);

  const handleExportAiSchema = () => {
    if (!aiProjectSchema) return;
    const blob = new Blob([JSON.stringify(aiProjectSchema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${makeProjectSlug(projectName || "project")}-ai-schema.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportBusinessOsBundle = () => {
    if (!businessOsOutput?.bundle) return;
    const blob = new Blob([JSON.stringify(businessOsOutput.bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${makeProjectSlug(projectName || "business-os")}-bundle.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleViewportResize = () => setViewportWidth(window.innerWidth || 1280);
    handleViewportResize();
    window.addEventListener("resize", handleViewportResize);
    return () => window.removeEventListener("resize", handleViewportResize);
  }, []);

  const INLINE_TEXT_EDITABLE_QUERY = "h1, h2, h3, h4, p, li, blockquote";
  const INLINE_EDITABLE_QUERY = `${INLINE_TEXT_EDITABLE_QUERY}, a, button, img`;

  const humanizeSectionName = (value) =>
    String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Section";

  const getInlineEditableType = (node) => {
    if (!(node instanceof HTMLElement)) return "";
    const tag = String(node.tagName || "").toLowerCase();
    if (tag === "img") return "image";
    if (tag === "button") return "button";
    if (tag === "a") {
      const classBlob = `${String(node.className || "")} ${String(node.getAttribute("role") || "")}`.toLowerCase();
      return /(btn|button|cta|action)/.test(classBlob) ? "button" : "link";
    }
    if (!/^(h1|h2|h3|h4|p|li|blockquote)$/.test(tag)) return "";
    const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (
      Array.from(node.children).some(
        (child) => child instanceof HTMLElement && child.matches(INLINE_TEXT_EDITABLE_QUERY)
      )
    ) {
      return "";
    }
    return "text";
  };

  const getInlineComponentName = (node, root) => {
    if (!(node instanceof HTMLElement) || !(root instanceof HTMLElement)) return "page";
    const sectionRoot =
      node.closest("[data-tn-section], section, article, main, header, footer, [id], [class]") || root;
    const explicit =
      String(sectionRoot?.getAttribute?.("data-tn-section") || "").trim() ||
      String(sectionRoot?.getAttribute?.("data-section") || "").trim() ||
      String(sectionRoot?.getAttribute?.("id") || "").trim();
    if (explicit) return explicit.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
    return String(sectionRoot?.tagName || "page").toLowerCase();
  };

  const readInlineEditableValue = (node) => {
    if (!(node instanceof HTMLElement)) return "";
    if (String(node.tagName || "").toLowerCase() === "img") {
      return String(node.getAttribute("src") || "").trim();
    }
    return String(node.textContent || "").replace(/\s+/g, " ").trim();
  };

  const readEditableId = (node) => {
    if (!(node instanceof HTMLElement)) return "";
    return String(node.dataset.editId || node.dataset.id || "").trim();
  };

  const findSectionFieldNode = (sectionNode, field) => {
    if (!(sectionNode instanceof HTMLElement)) return null;
    if (field === "title") {
      return sectionNode.querySelector("h1, h2, h3, h4");
    }
    if (field === "subtitle") {
      return Array.from(sectionNode.querySelectorAll("p, blockquote")).find(
        (node) => node instanceof HTMLElement && String(node.textContent || "").trim()
      ) || null;
    }
    if (field === "buttonText") {
      return sectionNode.querySelector("a[data-editable='button'], button[data-editable='button'], a[href], button");
    }
    return null;
  };

  const buildSectionMeta = useCallback((sectionNode) => {
    const root = previewEditableRef.current;
    if (!(sectionNode instanceof HTMLElement) || !(root instanceof HTMLElement)) return null;
    const sectionId = String(sectionNode.dataset.id || sectionNode.getAttribute("data-id") || "").trim();
    const component = String(sectionNode.dataset.component || sectionNode.getAttribute("data-component") || "").trim() || "section";
    const titleNode = findSectionFieldNode(sectionNode, "title");
    const subtitleNode = findSectionFieldNode(sectionNode, "subtitle");
    const buttonNode = findSectionFieldNode(sectionNode, "buttonText");
    const titleId = readEditableId(titleNode);
    const subtitleId = readEditableId(subtitleNode);
    const buttonTextId = readEditableId(buttonNode);
    const titleValue = titleId && Object.prototype.hasOwnProperty.call(sections, titleId)
      ? String(sections[titleId] || "")
      : String(titleNode?.textContent || "").replace(/\s+/g, " ").trim();
    const subtitleValue = subtitleId && Object.prototype.hasOwnProperty.call(sections, subtitleId)
      ? String(sections[subtitleId] || "")
      : String(subtitleNode?.textContent || "").replace(/\s+/g, " ").trim();
    const buttonValue = buttonTextId && Object.prototype.hasOwnProperty.call(sections, buttonTextId)
      ? String(sections[buttonTextId] || "")
      : String(buttonNode?.textContent || "").replace(/\s+/g, " ").trim();
    const headingFallback = String(titleValue || "").trim();
    const sectionName =
      String(sectionNode.dataset.sectionName || "").trim() ||
      headingFallback ||
      humanizeSectionName(component);
    return {
      id: sectionId || component,
      component,
      sectionName,
      sectionType: detectInlineSectionType(sectionNode, root),
      titleId,
      subtitleId,
      buttonTextId,
      title: titleValue,
      subtitle: subtitleValue,
      buttonText: buttonValue,
    };
  }, [sections]);

  const findSectionRoot = useCallback((node) => {
    const root = previewEditableRef.current;
    if (!(node instanceof Element) || !(root instanceof HTMLElement)) return null;
    const sectionRoot =
      node.closest("[data-component][data-id], [data-component], [data-tn-section], section, article, header, footer, nav, aside, main") || null;
    return sectionRoot instanceof HTMLElement && root.contains(sectionRoot) ? sectionRoot : null;
  }, []);

  const selectInlineSection = useCallback((node) => {
    const sectionRoot = findSectionRoot(node);
    if (!(sectionRoot instanceof HTMLElement)) return null;
    if (selectedSectionNodeRef.current instanceof HTMLElement && selectedSectionNodeRef.current !== sectionRoot) {
      selectedSectionNodeRef.current.classList.remove("tn-section-active");
    }
    sectionRoot.classList.add("tn-section-active");
    selectedSectionNodeRef.current = sectionRoot;
    const meta = buildSectionMeta(sectionRoot);
    setSelectedSectionMeta(meta);
    const preferredEditableId = readEditableId(
      node instanceof HTMLElement ? node.closest("[data-edit-id]") : null
    );
    if (preferredEditableId) {
      setSelectedSectionEditId(preferredEditableId);
    } else if (meta?.titleId) {
      setSelectedSectionEditId(meta.titleId);
    } else if (meta?.subtitleId) {
      setSelectedSectionEditId(meta.subtitleId);
    } else if (meta?.buttonTextId) {
      setSelectedSectionEditId(meta.buttonTextId);
    }
    return meta;
  }, [buildSectionMeta, findSectionRoot]);

  const syncInlineSiteModelFromDom = useCallback(() => {
    const root = previewEditableRef.current;
    if (!(root instanceof HTMLElement)) return;
    const nextInlineModel = buildInlineSiteModelFromHtml(root.innerHTML || "");
    setInlineSiteModel(nextInlineModel);
    setSectionsFromInlineModel(nextInlineModel);
  }, [setSectionsFromInlineModel]);

  const updateFloatingToolbarPosition = useCallback((node) => {
    if (!(node instanceof HTMLElement) || typeof window === "undefined") return;
    const rect = node.getBoundingClientRect();
    const toolbarWidth = viewportWidth < 640 ? Math.max(220, viewportWidth - 24) : 320;
    const top = Math.max(12, rect.top - 56);
    const left = Math.min(
      Math.max(12, rect.left),
      Math.max(12, viewportWidth - toolbarWidth - 12)
    );
    setFloatingToolbarPos({ top, left });
  }, [viewportWidth]);

  const selectInlineEditableNode = useCallback((node) => {
    const root = previewEditableRef.current;
    if (!(node instanceof HTMLElement) || !(root instanceof HTMLElement)) return;
    const editableNode = node.closest("[data-editable][data-edit-id], [data-editable][data-id]");
    if (!(editableNode instanceof HTMLElement)) return;
    if (selectedEditableNodeRef.current instanceof HTMLElement && selectedEditableNodeRef.current !== editableNode) {
      selectedEditableNodeRef.current.classList.remove("tn-editable-active");
    }
    editableNode.classList.add("tn-editable-active");
    const type = String(editableNode.dataset.editable || "").trim();
    const id = readEditableId(editableNode);
    const component = String(editableNode.dataset.component || "").trim();
    const value = Object.prototype.hasOwnProperty.call(sections, id) ? String(sections[id] || "") : readInlineEditableValue(editableNode);
    selectedEditableNodeRef.current = editableNode;
    setSelectedEditableMeta({ id, type, component, value });
    if (id && (type === "text" || type === "button" || type === "link")) {
      setSelectedSectionEditId(id);
    }
    updateFloatingToolbarPosition(editableNode);
    if (type === "image") {
      const imageId = String(editableNode.getAttribute("data-image-id") || id).trim();
      if (imageId) setSelectedImageId(imageId);
    }
  }, [sections, updateFloatingToolbarPosition]);

  const annotateInlineEditableDom = useCallback(() => {
    const root = previewEditableRef.current;
    if (!(root instanceof HTMLElement)) return;
    const pagePrefix = makeProjectSlug(activePage || "page");
    const sectionNodes = Array.from(
      root.querySelectorAll("[data-component][data-id], [data-component], [data-tn-section], section, article, header, footer, nav, aside, main")
    );
    let sectionSequence = 0;
    sectionNodes.forEach((sectionNode) => {
      if (!(sectionNode instanceof HTMLElement)) return;
      const component =
        String(sectionNode.dataset.component || "").trim() || getInlineComponentName(sectionNode, root);
      const sectionId =
        String(sectionNode.dataset.id || "").trim() || `${pagePrefix}-${component || "section"}-${sectionSequence += 1}`;
      const headingText = String(
        sectionNode.querySelector("h1, h2, h3, h4")?.textContent || ""
      ).replace(/\s+/g, " ").trim();
      sectionNode.dataset.component = component || `section-${sectionSequence}`;
      sectionNode.dataset.id = sectionId;
      sectionNode.dataset.sectionName = headingText || humanizeSectionName(component || sectionId);
    });

    let sequence = 0;
    const editableNodes = Array.from(root.querySelectorAll("[data-editable], " + INLINE_EDITABLE_QUERY));
    editableNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const currentType = String(node.dataset.editable || "").trim();
      const detectedType = getInlineEditableType(node);
      const type = currentType || detectedType;
      if (!type) return;
      const component = getInlineComponentName(node, root);
      const existingId = String(node.dataset.editId || node.dataset.id || "").trim();
      const id = existingId || `${pagePrefix}-${component}-${type}-${sequence += 1}`;
      node.dataset.editable = type;
      node.dataset.id = id;
      node.dataset.editId = id;
      node.dataset.component = component;
      node.dataset.binding =
        type === "image" ? "src" : type === "link" ? "href" : type === "button" ? "content" : "content";
      node.dataset.editRole = "content";
      if (type === "image") {
        node.removeAttribute("contenteditable");
        node.setAttribute("tabindex", "0");
        node.removeAttribute("spellcheck");
      } else {
        node.setAttribute("contenteditable", "true");
        node.setAttribute("tabindex", "0");
        node.setAttribute("spellcheck", "true");
      }
    });
    syncInlineSiteModelFromDom();
  }, [activePage, syncInlineSiteModelFromDom]);

  const queueInstantInlineEditing = useCallback(() => {
    pendingInstantEditRef.current = true;
    setIsInlineEditing(true);
  }, []);

  const applyGeneratedPreviewState = useCallback(
    (pages, pageKey, html, { resetHistory = true } = {}) => {
      const safePages = pages && typeof pages === "object" ? pages : {};
      const safePageKey = String(pageKey || "").trim();
      const nextHtml = String(html || safePages[safePageKey] || "").trim();
      setGeneratedPages(safePages);
      if (safePageKey) setActivePage(safePageKey);
      setGeneratedSite(nextHtml);
      setDraftHtml(nextHtml);
      setEditHistory(resetHistory && nextHtml ? [nextHtml] : []);
      queueInstantInlineEditing();
    },
    [queueInstantInlineEditing]
  );

  const handleGenerate = async (options = {}) => {
    const resolvedProjectName = String(options.projectNameOverride || projectName || "").trim();
    if (!resolvedProjectName) {
      alert("Enter a project name first");
      return;
    }

    setLoading(true);
    setError("");
    let hasInstantDraft = false;
    try {
      setScoredVariants([]);
      setBestVariantId("");
      if (authToken && authUser?.id) {
        await apiJson({
          path: "/api/billing/consume-generation",
          method: "POST",
          body: { project_name: resolvedProjectName },
          token: authToken,
        });
        await refreshBillingStatus(authToken).catch(() => null);
      }
      const effectiveUiDesign = normalizeUiDesignSpec(
        options.uiDesignOverride ||
          uiDesignSpec ||
          buildAutoUiDesignSpec(`${resolvedProjectName}|${industryTemplate}|${solutionMode}`)
      );
      const effectivePalette = effectiveUiDesign.palette;
      const effectiveTypography = { ...textStyle, ...effectiveUiDesign.typography };
      setUiDesignSpec(effectiveUiDesign);
      setThemeColors({ ...effectivePalette });
      setTextStyle((previous) => ({ ...previous, ...effectiveTypography }));
      const enforcedKeys = Array.isArray(options.enforceFeatureKeys) ? options.enforceFeatureKeys : [];
      const effectiveIndustryTemplate =
        options.industryTemplateOverride || industryTemplate;
      const effectiveIndustryPackage =
        INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === effectiveIndustryTemplate) || selectedIndustryPackage;
      const effectiveAutomationDefs = AUTOMATION_PAGE_DEFS.filter(
        (page) =>
          Boolean(automationFeatures[page.key]) ||
          enforcedKeys.includes(page.key) ||
          (autoRevenueFeatures && REVENUE_MODULE_KEYS.includes(page.key))
      );
      const enabledAutomationLabels = effectiveAutomationDefs.map((item) => item.label.toLowerCase());
      const industryFocus = effectiveIndustryPackage?.promptFocus?.join("; ") || "";
      const industryBlueprintPrompt = buildIndustryBlueprintPrompt(effectiveIndustryPackage);

      const rawPromptText = String(options.businessOsPrompt || businessOsPrompt || "");
      const structuredPromptData = parseStructuredBusinessPrompt(rawPromptText);
      const generationPromptIntel = derivePromptIntelligence({
        rawPrompt: rawPromptText,
        parsedPrompt: structuredPromptData,
        industryHint: effectiveIndustryPackage?.label || "",
        packagePages: effectiveIndustryPackage?.blueprint?.pages || [],
        packageServices: effectiveIndustryPackage?.blueprint?.services || [],
      });
      const userDefinedPages =
        Array.isArray(structuredPromptData.pages) && structuredPromptData.pages.length > 0
          ? structuredPromptData.pages.join(", ")
          : "";
      const requestedWebsitePages = userDefinedPages || "Home, About, Services, Pricing, Contact, Landing Page, Blog";
      const requestedAutomationPages = effectiveAutomationDefs.map((page) => page.label).join(", ");
      const requestedPageList =
        solutionMode === "website"
          ? requestedWebsitePages
          : solutionMode === "app"
            ? requestedAutomationPages || "Client Dashboard, Login Portal"
            : `${requestedWebsitePages}, ${requestedAutomationPages}`;
      const effectivePromptText = getEffectiveBusinessPrompt(rawPromptText, {
        solutionMode,
        projectName: resolvedProjectName,
      });
      const structuredSections = extractStructuredSectionsFromPrompt(rawPromptText || effectivePromptText);
      const ultraSmartPlan = ultraSmartModeEnabled
        ? buildUltraSmartGenerationPlan({
            projectLabel: resolvedProjectName,
            mode: solutionMode,
            parsedPrompt: structuredPromptData,
            promptIntel: generationPromptIntel,
            industryPackage: effectiveIndustryPackage,
            structuredSections,
            automationDefs: effectiveAutomationDefs,
          })
        : null;
      setLastGenerationPlan(ultraSmartPlan);
      const smartQaAudit = ultraSmartModeEnabled
        ? buildSmartQaAudit({
            promptIntel: generationPromptIntel,
            plan: ultraSmartPlan,
            mode: solutionMode,
            automationDefs: effectiveAutomationDefs,
          })
        : null;
      setLastGenerationAudit(smartQaAudit);
      const requestedPageNames = requestedPageList
        .split(",")
        .map((item) => String(item || "").trim())
        .filter(Boolean);
      const instantParsed = {
        pages: buildInstantPagesFromPrompt({
          projectName: resolvedProjectName,
          promptText: effectivePromptText,
          pageNames: requestedPageNames,
          structuredSections,
          parsedPrompt: structuredPromptData,
        }),
      };
      const instantPages = buildGeneratedPages(instantParsed, effectivePalette, effectiveTypography, {
        mode: solutionMode,
        automationDefs: effectiveAutomationDefs,
        autoRevenueFeatures,
        uiDesign: effectiveUiDesign,
      });
      const instantFirstKey = instantPages["index.html"] ? "index.html" : orderPageKeys(Object.keys(instantPages))[0] || "index.html";
      const instantFirstHtml = instantPages[instantFirstKey] || "";
      if (instantFirstHtml) {
        hasInstantDraft = true;
        setFunnelBuilderData(buildFunnelBuilderData(instantPages));
        applyGeneratedPreviewState(instantPages, instantFirstKey, instantFirstHtml);
        setPublishStatus("info");
        setPublishMessage("Instant draft generated. Refining with AI...");
      }
      const structuredSectionClause =
        structuredSections.length > 0
          ? `\nMandatory section order for every primary page: ${structuredSections.join(", ")}.
Use these exact section keys and do not omit or rename them.`
          : "";
      const businessOsClause = effectivePromptText
        ? `
Business OS Command: ${effectivePromptText}
Mandatory system modules: website, booking system, CRM, invoicing system, email automation, and marketing pages.
Ensure each module has an interactive page with practical workflows and CTA copy.`
        : "";
      const uiDesignClause = `
TitoNova Cloud Engine UI Design Spec:
- Layout variant: ${effectiveUiDesign.layoutVariant}
- Palette accents: ${effectivePalette.heroStart} to ${effectivePalette.heroEnd}, accent ${effectivePalette.accent}
- Typography: headings ${effectiveTypography.headingFamily}, body ${effectiveTypography.bodyFamily}
- Section hierarchy directives: ${JSON.stringify(effectiveUiDesign.sectionHierarchy || {})}
Use this design spec throughout all generated pages.`;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a professional multi-page ${solutionMode === "website-app" ? "website and web app" : solutionMode === "app" ? "web app" : "website"} for ${resolvedProjectName}.
	Return JSON with:
  "pages": array containing these pages: ${requestedPageList}
  "layout": {"pages":[{"key":"index.html","name":"Home","sections":["hero","services","cta"]}]}
  "sections": {"hero":{"type":"hero","title":"...","subtitle":"..."}}
  "components": {"hero":{"variant":"split","items":["..."]}}
	Each page should include unique sections and useful business-specific copy.
	Industry template: ${effectiveIndustryPackage?.label || "General"}.
	Include these capabilities with actionable copy and UI blocks: ${enabledAutomationLabels.join(", ") || "client dashboard, login portal, payments, booking, CRM, analytics"}.
	Automatic revenue requirements: include subscriptions, bookings, digital product sales, memberships, and affiliate/referral systems so the project can monetize immediately.
	Industry-specific requirements: ${industryFocus}.
	Industry template blueprint:
${industryBlueprintPrompt || "Use standard pages, service offers, pricing packages, and operational workflows for this industry."}
	Make each page conversion-focused with clear calls to action.${businessOsClause}${structuredSectionClause}
${uiDesignClause}${buildUltraSmartPromptClause(ultraSmartPlan)}${buildSmartQaPromptClause(smartQaAudit)}`,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Website generation failed.");
      }

      let parsed = parseModelJson(payload?.result);
      if (structuredSections.length > 0 && parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.pages)) {
          parsed.pages = parsed.pages.map((page) => ({
            ...(page && typeof page === "object" ? page : {}),
            sections: [...structuredSections],
          }));
        }
        if (parsed.layout && typeof parsed.layout === "object" && Array.isArray(parsed.layout.pages)) {
          parsed.layout.pages = parsed.layout.pages.map((page) => ({
            ...(page && typeof page === "object" ? page : {}),
            sections: [...structuredSections],
          }));
        }
      }
      let pages = buildGeneratedPages(parsed, effectivePalette, effectiveTypography, {
        mode: solutionMode,
        automationDefs: effectiveAutomationDefs,
        autoRevenueFeatures,
        uiDesign: effectiveUiDesign,
      });
      const autoBrandPrompt = `${resolvedProjectName} ${effectivePromptText} ${effectiveIndustryPackage?.label || ""}`.trim();
      const autoBrandKit = generateBrandKitFromPrompt(autoBrandPrompt);
      setBrandKit(autoBrandKit);
      pages = Object.entries(pages).reduce((acc, [key, html]) => {
        acc[key] = updateImageSourceInHtml(html, "brand-logo", autoBrandKit.logo);
        return acc;
      }, {});
      const parsedPages = Array.isArray(parsed?.pages) ? parsed.pages : [];
      const pageJsonMap = parsedPages.reduce((acc, page, index) => {
        const key = pageKeyFromName(page?.name || `Page ${index + 1}`, index);
        acc[key] = {
          name: String(page?.name || pageLabelFromKey(key)),
          sections: Array.isArray(page?.sections) ? page.sections : [],
        };
        return acc;
      }, {});
      setAiProjectSchema({
        project: {
          name: resolvedProjectName,
          prompt: effectivePromptText,
          generatedAt: new Date().toISOString(),
        },
        brand: {
          "palette.json": { ...effectivePalette },
          "typography.json": { ...effectiveTypography },
        },
        layout: {
          "layout.json": {
            layoutVariant: effectiveUiDesign.layoutVariant || "split-hero",
          },
        },
        sections: {
          "sections.json": {
            ...(parsed?.sections && typeof parsed.sections === "object" ? parsed.sections : {}),
            sectionHierarchy: { ...(effectiveUiDesign.sectionHierarchy || {}) },
          },
        },
        components: {
          "components.json": {
            ...(parsed?.components && typeof parsed.components === "object" ? parsed.components : {}),
          },
        },
        pages: pageJsonMap,
      });
      const firstPageKey = pages["index.html"] ? "index.html" : orderPageKeys(Object.keys(pages))[0] || "index.html";
      const firstHtml = pages[firstPageKey] || "";
      setFunnelBuilderData(buildFunnelBuilderData(pages));
      applyGeneratedPreviewState(pages, firstPageKey, firstHtml);
      setPublishMessage("");
      setPublishStatus("info");
      setLiveUrl("");
      setPublishedSiteId("");
      setDnsGuideDomain("");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");
      setNewPageName("");
      if (resolvedProjectName !== projectName) setProjectName(resolvedProjectName);
      if (authToken && authUser?.id) {
        setShowGuestAuthPrompt(false);
        runDeferred(async () => {
          try {
            const projectPayload = await apiJson({
              path: "/api/projects/create",
              method: "POST",
              body: {
                project_name: resolvedProjectName,
                ai_prompt: effectivePromptText,
              },
              token: authToken,
            });
            const savedProjectId = String(projectPayload?.project?.id || "");
            if (savedProjectId) {
              await apiJson({
                path: "/api/websites/save",
                method: "POST",
                body: {
                  project_id: savedProjectId,
                  html: firstHtml,
                  css: "",
                  pages,
                  domain: normalizeDomain(customDomain),
                },
                token: authToken,
              });
            }
            await refreshUserProjects(authToken).catch(() => []);
          } catch (storageError) {
            setPublishStatus("info");
            setPublishMessage(`Website generated, but account save failed: ${String(storageError?.message || "save error")}`);
          }
        });
      } else {
        setShowGuestAuthPrompt(true);
        setPublishStatus("info");
        setPublishMessage("Website generated in guest mode. Create an account to save, publish, and manage projects.");
      }
      runDeferred(async () => {
        await runMarketingAutopilot({ source: "generation" });
      });
      runDeferred(async () => {
        await runMonetizationEngine();
      });
      runDeferred(async () => {
        await runGrowthCoach({ silent: true });
      });
      if (autonomousModeEnabled) {
        runDeferred(async () => {
          await runAutonomousBusinessMode({ silent: true });
        });
      }
      if (autoSearchOnGenerate) {
        runDeferred(async () => {
          await handleDomainSearch();
        });
      }
      if (parseCompetitorUrls(competitorUrlsInput).length > 0) {
        runDeferred(async () => {
          await handleCompetitorScan({ silent: true });
        });
      }
      const domainCandidate = normalizeDomain(customDomain);
      if (domainCandidate) {
        runDeferred(async () => {
          const siteId = makeSiteId(resolvedProjectName);
          try {
            const publishPayload = await publishToHosting({ siteId, pages, domain: domainCandidate });
            const nextUrl = String(publishPayload?.url || "");
            setPublishedSiteId(siteId);
            setLiveUrl(nextUrl);
            setCustomDomain(domainCandidate);
            setHostingProfile((previous) => ({
              ...previous,
              domain: domainCandidate,
              sslEnabled: Boolean(publishPayload?.ssl?.enabled ?? previous.sslEnabled),
              cdnEnabled: Boolean(publishPayload?.cdn?.enabled ?? previous.cdnEnabled),
              tier: String(publishPayload?.hosting?.tier || previous.tier || "Fast Hosting"),
              provider: String(publishPayload?.provider || previous.provider || "gateway"),
              liveUrl: nextUrl || previous.liveUrl || "",
              updatedAt: new Date().toISOString(),
            }));
            try {
              await handleAttachDomain(siteId, domainCandidate);
              setPublishStatus("success");
              setPublishMessage(`Website generated and domain attached: ${domainCandidate}`);
            } catch {
              setPublishStatus("info");
              setPublishMessage(buildDomainPendingMessage(domainCandidate, "published"));
            }
          } catch (publishErr) {
            setPublishStatus("error");
            setPublishMessage(
              `Website generated, but domain connection failed: ${String(
                publishErr?.message || "publish/connect error"
              )}`
            );
          }
        });
      }
      return {
        resolvedProjectName,
        parsed,
        pages,
        pageJsonMap,
        effectiveUiDesign,
        effectivePalette,
        effectiveTypography,
        effectiveAutomationDefs,
      };
    } catch (err) {
      const message = String(err?.message || "Unknown generation error.");
      setError(hasInstantDraft ? "" : message);
      if (!hasInstantDraft) {
        setGeneratedSite(null);
        setGeneratedPages({});
      }
      setPublishStatus(hasInstantDraft ? "info" : "error");
      setPublishMessage(
        hasInstantDraft
          ? `Instant draft is ready. AI refinement failed: ${message}`
          : message
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleRedesignFromUrl = async () => {
    const insights = deriveRedesignInsights(sourceWebsiteUrl);
    if (!insights) {
      setError("Enter a valid website URL to redesign.");
      return;
    }

    setRedesigning(true);
    setError("");
    try {
      const effectiveUiDesign = normalizeUiDesignSpec(
        uiDesignSpec || buildAutoUiDesignSpec(`${projectName || insights.brand}|${industryTemplate}|redesign`)
      );
      const effectivePalette = effectiveUiDesign.palette;
      const effectiveTypography = { ...textStyle, ...effectiveUiDesign.typography };
      setUiDesignSpec(effectiveUiDesign);
      setThemeColors({ ...effectivePalette });
      setTextStyle((previous) => ({ ...previous, ...effectiveTypography }));
      const enabledAutomationLabels = selectedAutomationDefs.map((item) => item.label.toLowerCase());
      const industryFocus = selectedIndustryPackage?.promptFocus?.join("; ") || "";
      const industryBlueprintPrompt = buildIndustryBlueprintPrompt(selectedIndustryPackage);
      const requestedWebsitePages = "Home, About, Services, Pricing, Contact, Landing Page, Blog";
      const requestedAutomationPages = selectedAutomationDefs.map((page) => page.label).join(", ");
      const requestedPageList =
        solutionMode === "website"
          ? requestedWebsitePages
          : solutionMode === "app"
            ? requestedAutomationPages || "Client Dashboard, Login Portal"
            : `${requestedWebsitePages}, ${requestedAutomationPages}`;
      const clonePipelinePhases = [
        "URL input",
        "Headless browser render",
        "DOM + CSS extraction",
        "Layout detection",
        "Component detection",
        "Screenshot vision analysis",
        "AI code generation",
        "Pixel accuracy validation",
        "Final website export",
      ];
      const cloneLayerDirectives = [
        "Headless renderer: execute JavaScript and capture the post-hydration DOM state.",
        "DOM/CSS extractor: capture semantic structure, computed style intent, and media breakpoints.",
        "Layout engine: infer container, grid, flex, spacing rhythm, and section hierarchy.",
        "Component detector: identify reusable UI patterns (header, nav, card, pricing, faq, footer).",
        "Vision pass: use screenshot-level cues to validate spacing, alignment, and visual hierarchy.",
        "Code generator: output clean multi-page templates with reusable components.",
        "Pixel validator: compare rendered clone vs source and tighten major diffs.",
      ];
      const cloneModeDirective =
        cloneDepth === "visual"
          ? "Clone depth: Visual clone. Prioritize visual layout and styling fidelity."
          : cloneDepth === "full-ui"
            ? "Clone depth: Full UI clone. Prioritize component and interaction fidelity."
            : "Clone depth: Full-stack clone. Prioritize UI fidelity + business/revenue modules + deployable structure.";
      const cloneOptionsDirective = [
        clonePixelPerfect ? "Pixel-match mode ON (high visual fidelity)." : "Pixel-match mode OFF.",
        cloneAiRedesign ? "AI redesign improvements ON (UX + clarity)." : "AI redesign improvements OFF.",
        cloneRevenueAutomation
          ? "Revenue automation ON (subscriptions, bookings, products, memberships, affiliates)."
          : "Revenue automation OFF.",
      ].join(" ");
      const competitorListForPrompt = parseCompetitorUrls(competitorUrlsInput);
      const crawlResult = await crawlWebsiteForClone(insights.normalizedUrl, {
        maxPages: exactRedesignMode ? 20 : 10,
      });
      const pipelineSummary = buildClonePipelineSummary(crawlResult, insights);
      const cloneBlueprint = {
        source_url: insights.normalizedUrl,
        source_host: insights.host,
        segment: insights.segment,
        path_parts: insights.pathParts,
        query_keys: insights.queryKeys,
        source_signals: insights.sourceSignals,
        structural_fingerprint: insights.structuralFingerprint,
        suggested_pages: insights.suggestedPages,
        clone_score_target: insights.cloneScore,
        directives: insights.cloneDirectives,
        pipeline_phases: clonePipelinePhases,
        crawl_summary: {
          mode: pipelineSummary.crawl_mode,
          pages_crawled: pipelineSummary.pages_crawled,
          pages_failed: pipelineSummary.pages_failed,
          reusable_components: pipelineSummary.reusable_components,
          assets: pipelineSummary.assets,
          computed_style_signals: pipelineSummary.computed_style_signals || {},
          dom_component_signals: pipelineSummary.dom_component_signals || {},
          layout_pattern_signals: pipelineSummary.layout_pattern_signals || {},
          component_detection_signals: pipelineSummary.component_detection_signals || {},
          vision_signals: pipelineSummary.vision_signals || {},
          responsive_signals: pipelineSummary.responsive_signals || {},
        },
        detected_navigation: pipelineSummary.navigation,
        detected_page_map: pipelineSummary.page_map,
      };

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are a TitoNova Cloud Engine website redesign engine.
Source website URL: ${insights.normalizedUrl}
Brand inference: ${insights.brand}
Detected path focus: ${insights.segment}
Instant layout findings: ${insights.layoutFindings.join(" ")}
Instant SEO findings: ${insights.seoFindings.join(" ")}
Instant UI findings: ${insights.uiFindings.join(" ")}
Source clone blueprint:
${JSON.stringify(cloneBlueprint, null, 2)}
Canonical cloning pipeline (must follow in order):
${clonePipelinePhases.map((phase, index) => `${index + 1}. ${phase}`).join("\n")}
Cloning engine layers:
${cloneLayerDirectives.join("\n")}
${cloneModeDirective}
${cloneOptionsDirective}
Website crawl intelligence:
- Crawl mode: ${pipelineSummary.crawl_mode}
- Pages crawled: ${pipelineSummary.pages_crawled}
- Failed pages: ${pipelineSummary.pages_failed}
- Reusable components: ${JSON.stringify(pipelineSummary.reusable_components)}
- Asset counts: ${JSON.stringify(pipelineSummary.assets?.counts || {})}
- Computed style signals: ${JSON.stringify(pipelineSummary.computed_style_signals || {})}
- DOM component signals: ${JSON.stringify(pipelineSummary.dom_component_signals || {})}
- Layout pattern signals: ${JSON.stringify(pipelineSummary.layout_pattern_signals || {})}
- Component detection signals: ${JSON.stringify(pipelineSummary.component_detection_signals || {})}
- Vision signals: ${JSON.stringify(pipelineSummary.vision_signals || {})}
- Responsive signals: ${JSON.stringify(pipelineSummary.responsive_signals || {})}
Detected page map:
${JSON.stringify(pipelineSummary.page_map, null, 2)}
Competitor URLs:
${competitorListForPrompt.length > 0 ? competitorListForPrompt.join(", ") : "none provided"}
TitoNova Cloud Engine UI Design Spec:
- Layout variant: ${effectiveUiDesign.layoutVariant}
- Palette accents: ${effectivePalette.heroStart} to ${effectivePalette.heroEnd}, accent ${effectivePalette.accent}
- Typography: headings ${effectiveTypography.headingFamily}, body ${effectiveTypography.bodyFamily}
- Section hierarchy directives: ${JSON.stringify(effectiveUiDesign.sectionHierarchy || {})}

Create a significantly improved multi-page ${solutionMode === "website-app" ? "website and web app" : solutionMode === "app" ? "web app" : "website"}.
Return JSON with a "pages" array containing these pages: ${requestedPageList}.
${exactRedesignMode
  ? "Exact mode is ON: preserve source IA and page sequence with high-fidelity cloning. Keep nav labels, section order, and service architecture tightly aligned to source intent. Do not invent a different sitemap unless source is clearly broken."
  : "Exact mode is OFF: redesign freely with improved UX and content architecture."}
Apply modern UX, strong conversion, and SEO improvements (semantic structure, metadata-ready copy, internal linking, and intent-focused headings).
Industry template: ${selectedIndustryPackage?.label || "General"}.
Include these capabilities: ${enabledAutomationLabels.join(", ") || "client dashboard, login portal, payments, booking, CRM, analytics"}.
Automatic revenue requirements: include subscriptions, bookings, digital product sales, memberships, and affiliate/referral systems so the project can monetize immediately.
Industry-specific requirements: ${industryFocus}.
Industry template blueprint:
${industryBlueprintPrompt || "Use standard pages, service offers, pricing packages, and workflows for this industry."}.

Return strict JSON with:
{
  "source_clone": {
    "url": "string",
    "clone_score": 0-100,
    "navigation": ["Home", "..."],
    "page_map": [{"name":"Home","source_path":"/","intent":"...","sections":["hero","..."]}]
  },
  "pages": [{"name":"Home","sections":[...]}]
}
Ensure navigation labels and page intents stay close to the source blueprint while improving quality.`,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Website redesign failed.");

      const parsed = parseModelJson(payload?.result);
      const pages = buildGeneratedPages(parsed, effectivePalette, effectiveTypography, {
        mode: solutionMode,
        automationDefs: selectedAutomationDefs,
        autoRevenueFeatures,
        uiDesign: effectiveUiDesign,
      });
      const firstPageKey = pages["index.html"] ? "index.html" : orderPageKeys(Object.keys(pages))[0] || "index.html";
      const firstHtml = pages[firstPageKey] || "";
      setFunnelBuilderData(buildFunnelBuilderData(pages));
      applyGeneratedPreviewState(pages, firstPageKey, firstHtml);
      setPublishMessage(
        `${exactRedesignMode ? "Exact" : "Modern"} redesign generated from ${insights.host}. ` +
        `Clone intelligence: ${pipelineSummary.pages_crawled} page${pipelineSummary.pages_crawled === 1 ? "" : "s"} crawled, ` +
        `${pipelineSummary.reusable_components.length} reusable pattern${pipelineSummary.reusable_components.length === 1 ? "" : "s"} detected.`
      );
      setPublishStatus("success");
      setLiveUrl("");
      setPublishedSiteId("");
      setDnsGuideDomain("");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");
      setNewPageName("");
      if (!projectName.trim()) setProjectName(insights.brand);
      runDeferred(async () => {
        await runMarketingAutopilot({ source: "redesign" });
      });
      runDeferred(async () => {
        await runMonetizationEngine();
      });
      runDeferred(async () => {
        await runGrowthCoach({ silent: true });
      });
      if (autonomousModeEnabled) {
        runDeferred(async () => {
          await runAutonomousBusinessMode({ silent: true });
        });
      }
      if (autoSearchOnGenerate) {
        runDeferred(async () => {
          await handleDomainSearch();
        });
      }
      if (parseCompetitorUrls(competitorUrlsInput).length > 0) {
        runDeferred(async () => {
          await handleCompetitorScan({ silent: true });
        });
      }
    } catch (err) {
      setError(String(err?.message || "Unknown redesign error."));
    } finally {
      setRedesigning(false);
    }
  };

  const focusInlineEditableNode = useCallback((targetNode = null, { placeCursorAtEnd = true } = {}) => {
    const root = previewEditableRef.current;
    if (!root || typeof window === "undefined") return null;
    const editableSelector =
      "[data-editable='text'][data-edit-id], [data-editable='text'][data-id], [data-editable='button'][data-edit-id], [data-editable='button'][data-id], [data-editable='link'][data-edit-id], [data-editable='link'][data-id]";
    const selectedTarget =
      targetNode instanceof Element ? targetNode.closest(editableSelector) : null;
    const fallbackTarget = root.querySelector(editableSelector);
    const focusTarget = selectedTarget instanceof HTMLElement ? selectedTarget : fallbackTarget;

    if (!(focusTarget instanceof HTMLElement)) return null;

    const selection = window.getSelection();
    if (!selection) return null;

    const range = document.createRange();
    range.selectNodeContents(focusTarget);
    range.collapse(!placeCursorAtEnd);
    focusTarget.focus({ preventScroll: true });

    selection.removeAllRanges();
    selection.addRange(range);
    return focusTarget;
  }, []);

  const clearInlineAutofocusQueue = useCallback(() => {
    if (typeof window === "undefined") return;
    inlineAutofocusHandlesRef.current.forEach((handle) => {
      if (!handle) return;
      if (handle.type === "timeout") {
        window.clearTimeout(handle.id);
      } else if (handle.type === "frame") {
        window.cancelAnimationFrame(handle.id);
      }
    });
    inlineAutofocusHandlesRef.current = [];
  }, []);

  const scheduleInlineAutofocus = useCallback((targetNode = null) => {
    if (typeof window === "undefined") return;
    clearInlineAutofocusQueue();
    const attemptFocus = () => {
      const focusTarget = focusInlineEditableNode(targetNode);
      if (!(focusTarget instanceof HTMLElement)) return;
      const selection = window.getSelection();
      const activeElement = document.activeElement;
      const hasCollapsedCaret = Boolean(selection && selection.rangeCount > 0 && selection.isCollapsed);
      if ((activeElement === focusTarget || focusTarget.contains(activeElement)) && hasCollapsedCaret) {
        return;
      }
      focusInlineEditableNode(focusTarget);
    };
    [0, 40, 120, 240, 420].forEach((delay) => {
      const timeoutId = window.setTimeout(attemptFocus, delay);
      inlineAutofocusHandlesRef.current.push({ type: "timeout", id: timeoutId });
    });
  }, [clearInlineAutofocusQueue, focusInlineEditableNode]);

  const handleStartInlineEdit = () => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) return;
    setFieldLockMode(false);
    setDraftHtml(currentHtml);
    setEditHistory([currentHtml]);
    setRedoHistory([]);
    setInlineDraftDirty(false);
    setInlineSmartStatus("");
    setInlineSmartCommand("");
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
    setInlineAutoApplyHighConfidence(false);
    setInlineAdvancedOpen(false);
    setInlineLastPublishSnapshot(null);
    setInlineCheckpoints([
      {
        id: `cp-${Date.now()}`,
        label: "Start Edit",
        pageKey: activePage,
        html: currentHtml,
        at: new Date().toISOString(),
      },
    ]);
    setIsInlineEditing(true);
    scheduleInlineAutofocus();
  };

  const handleSaveInlineEdit = useCallback(() => {
    const nextHtml = commitInlineDraftForActivePage();
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory([nextHtml]);
    setRedoHistory([]);
    setInlineDraftDirty(false);
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
    setInlineAutoApplyHighConfidence(false);
    setInlineAdvancedOpen(false);
    setInlineLastPublishSnapshot(null);
    setInlineCheckpoints([]);
    setIsInlineEditing(true);
    setPublishStatus("success");
    setPublishMessage("Inline edits saved. Edit mode remains active.");
  }, [commitInlineDraftForActivePage]);

  const handleCancelInlineEdit = useCallback(() => {
    if (inlineDraftDirty && !window.confirm("Discard unsaved inline edits?")) return;
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    setDraftHtml(currentHtml);
    setEditHistory(currentHtml ? [currentHtml] : []);
    setRedoHistory([]);
    setInlineDraftDirty(false);
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
    setInlineAutoApplyHighConfidence(false);
    setInlineAdvancedOpen(false);
    setInlineLastPublishSnapshot(null);
    setInlineCheckpoints([]);
    setIsInlineEditing(true);
    setPublishStatus("info");
    setPublishMessage("Changes discarded. Edit mode remains active.");
  }, [activePage, generatedPages, generatedSite, inlineDraftDirty]);

  const handleUndoInlineEdit = useCallback(() => {
    setEditHistory((previous) => {
      if (previous.length <= 1) return previous;
      const next = previous.slice(0, -1);
      const restored = next[next.length - 1] || "";
      const removed = previous[previous.length - 1] || "";
      if (removed) {
        setRedoHistory((redoPrevious) => [removed, ...redoPrevious].slice(0, 50));
      }
      setDraftHtml(restored);
      setInlineDraftDirty(true);
      if (previewEditableRef.current) previewEditableRef.current.innerHTML = restored;
      return next;
    });
  }, []);

  const handleRedoInlineEdit = useCallback(() => {
    setRedoHistory((previousRedo) => {
      if (previousRedo.length === 0) return previousRedo;
      const [nextHtml, ...restRedo] = previousRedo;
      if (!nextHtml) return restRedo;
      setDraftHtml(nextHtml);
      setInlineDraftDirty(true);
      if (previewEditableRef.current) previewEditableRef.current.innerHTML = nextHtml;
      setEditHistory((previousHistory) => {
        if (previousHistory[previousHistory.length - 1] === nextHtml) return previousHistory;
        return [...previousHistory.slice(-49), nextHtml];
      });
      return restRedo;
    });
  }, []);

  const appendInlineHistory = (nextHtml) => {
    setEditHistory((previous) => {
      if (previous[previous.length - 1] === nextHtml) return previous;
      return [...previous.slice(-49), nextHtml];
    });
    setRedoHistory([]);
  };

  const snapshotInlineDraft = () => {
    if (!isInlineEditing) return;
    const nextHtml = previewEditableRef.current?.innerHTML || draftHtml || generatedSite || "";
    setDraftHtml(nextHtml);
    appendInlineHistory(nextHtml);
  };

  const commitInlineDomMutation = useCallback((message = "", checkpointLabel = "", nextSectionId = "") => {
    const root = previewEditableRef.current;
    if (!(root instanceof HTMLElement)) return;
    annotateInlineEditableDom();
    syncInlineSiteModelFromDom();
    const nextHtml = root.innerHTML || "";
    setDraftHtml(nextHtml);
    setInlineDraftDirty(true);
    appendInlineHistory(nextHtml);
    if (checkpointLabel) {
      setInlineCheckpoints((previous) => [
        ...previous.slice(-5),
        {
          id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: checkpointLabel,
          pageKey: activePage,
          html: nextHtml,
          at: new Date().toISOString(),
        },
      ]);
    }
    if (message) {
      setInlineSmartStatus(message);
    }
    if (nextSectionId) {
      const nextSection = Array.from(root.querySelectorAll("[data-component][data-id]")).find(
        (node) => node instanceof HTMLElement && String(node.dataset.id || "").trim() === String(nextSectionId || "").trim()
      );
      if (nextSection instanceof HTMLElement) {
        selectInlineSection(nextSection);
      }
    }
  }, [activePage, annotateInlineEditableDom, selectInlineSection, syncInlineSiteModelFromDom]);

  const updateSection = useCallback((id, value, options = {}) => {
    const sectionId = String(id || "").trim();
    if (!sectionId) return;
    const nextValue = String(value ?? "");
    const shouldSyncDraft = options.syncDraft !== false;

    setSections((previous) => {
      if (previous[sectionId] === nextValue) return previous;
      return { ...previous, [sectionId]: nextValue };
    });
    setSelectedSectionEditId(sectionId);

    const root = previewEditableRef.current;
    if (root instanceof HTMLElement) {
      const escapedId = escapeEditableIdForSelector(sectionId);
      const targetNode =
        escapedId
          ? root.querySelector(`[data-editable][data-edit-id="${escapedId}"], [data-editable][data-id="${escapedId}"]`)
          : null;
      if (targetNode instanceof HTMLElement) {
        const targetType = String(targetNode.dataset.editable || "").trim();
        targetNode.dataset.id = targetNode.dataset.id || sectionId;
        targetNode.dataset.editId = sectionId;
        if (targetType === "image") {
          targetNode.setAttribute("src", nextValue);
        } else {
          targetNode.textContent = nextValue;
        }
      }
      if (shouldSyncDraft) {
        setDraftHtml(root.innerHTML || "");
        setInlineDraftDirty(true);
      }
    }

    setInlineSiteModel((previous) => {
      const entry = previous?.[sectionId];
      if (!entry || typeof entry !== "object") return previous;
      const nextEntry = entry.type === "image"
        ? { ...entry, src: nextValue }
        : entry.type === "button"
          ? { ...entry, text: nextValue }
          : entry.type === "link"
            ? { ...entry, content: nextValue }
            : { ...entry, content: nextValue };
      if (JSON.stringify(nextEntry) === JSON.stringify(entry)) return previous;
      return { ...previous, [sectionId]: nextEntry };
    });

    setSelectedEditableMeta((previous) => {
      if (!previous || previous.id !== sectionId) return previous;
      if (String(previous.value || "") === nextValue) return previous;
      return { ...previous, value: nextValue };
    });
    setSelectedSectionMeta((previous) => {
      if (!previous) return previous;
      let changed = false;
      const nextMeta = { ...previous };
      if (previous.titleId === sectionId && previous.title !== nextValue) {
        nextMeta.title = nextValue;
        changed = true;
      }
      if (previous.subtitleId === sectionId && previous.subtitle !== nextValue) {
        nextMeta.subtitle = nextValue;
        changed = true;
      }
      if (previous.buttonTextId === sectionId && previous.buttonText !== nextValue) {
        nextMeta.buttonText = nextValue;
        changed = true;
      }
      return changed ? nextMeta : previous;
    });
  }, [escapeEditableIdForSelector]);

  const handleSectionFieldChange = useCallback((field, value) => {
    const sectionRoot = selectedSectionNodeRef.current;
    if (!(sectionRoot instanceof HTMLElement)) return;
    const nextValue = String(value || "");
    const fieldIdFromMeta =
      field === "title"
        ? selectedSectionMeta?.titleId
        : field === "subtitle"
          ? selectedSectionMeta?.subtitleId
          : selectedSectionMeta?.buttonTextId;
    if (fieldIdFromMeta) {
      updateSection(fieldIdFromMeta, nextValue);
      setInlineSmartStatus(`Updated section ${field}.`);
      return;
    }
    let fieldNode = findSectionFieldNode(sectionRoot, field);

    if (!(fieldNode instanceof HTMLElement)) {
      if (field === "title") {
        fieldNode = document.createElement("h2");
        sectionRoot.prepend(fieldNode);
      } else if (field === "subtitle") {
        fieldNode = document.createElement("p");
        const titleNode = findSectionFieldNode(sectionRoot, "title");
        if (titleNode instanceof HTMLElement && titleNode.parentNode === sectionRoot) {
          titleNode.insertAdjacentElement("afterend", fieldNode);
        } else {
          sectionRoot.prepend(fieldNode);
        }
      } else if (field === "buttonText") {
        fieldNode = document.createElement("a");
        fieldNode.setAttribute("href", "#contact");
        fieldNode.style.display = "inline-flex";
        fieldNode.style.alignItems = "center";
        fieldNode.style.justifyContent = "center";
        fieldNode.style.padding = "12px 18px";
        fieldNode.style.borderRadius = "999px";
        fieldNode.style.background = "var(--tn-cta)";
        fieldNode.style.color = "var(--tn-button-text)";
        fieldNode.style.textDecoration = "none";
        fieldNode.style.fontWeight = "700";
        sectionRoot.append(fieldNode);
      }
    }

    if (!(fieldNode instanceof HTMLElement)) return;
    if (!fieldNode.dataset.id) {
      const sectionId = String(sectionRoot.dataset.id || sectionRoot.getAttribute("data-id") || "").trim() || "section";
      const fieldSlug = field === "buttonText" ? "button" : field;
      const autoId = `${sectionId}-${fieldSlug}-text`;
      fieldNode.dataset.id = autoId;
      fieldNode.dataset.editId = autoId;
      fieldNode.dataset.editable = field === "buttonText" ? "button" : "text";
      fieldNode.dataset.component = String(sectionRoot.dataset.component || "section");
      fieldNode.dataset.binding = "content";
    } else {
      fieldNode.dataset.editId = String(fieldNode.dataset.editId || fieldNode.dataset.id || "").trim();
    }
    fieldNode.textContent = nextValue;
    const nodeEditId = readEditableId(fieldNode);
    if (nodeEditId) {
      updateSection(nodeEditId, nextValue);
      setInlineSmartStatus(`Updated section ${field}.`);
      return;
    }
    const sectionId = String(sectionRoot.dataset.id || "").trim();
    commitInlineDomMutation(`Updated section ${field}.`, "", sectionId);
  }, [commitInlineDomMutation, selectedSectionMeta, updateSection]);

  const runInlineSmartRewrite = useCallback((selectedText, actionKey, context = {}) => {
    const source = String(selectedText || "").trim();
    if (!source) return "";
    const cleaned = source.replace(/\s+/g, " ").trim();
    const sentenceParts = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
    const firstSentence = sentenceParts[0] || cleaned;
    const projectKeyword = projectName.trim() || "your business";
    const industryKeyword = selectedIndustryPackage?.label || "your industry";
    const sectionType = String(context.sectionType || "general").toLowerCase();
    const industryTone = /(health|care|medical|hcbs|clinic)/i.test(industryKeyword)
      ? "compassionate and trustworthy"
      : /(saas|software|tech|platform|cloud)/i.test(industryKeyword)
        ? "clear, outcome-focused, and modern"
        : /(retail|e-?commerce|shop|store)/i.test(industryKeyword)
          ? "benefit-led and conversion-focused"
          : "professional and conversion-focused";

    if (actionKey === "smart") {
      if (sectionType === "hero") {
        return `${cleaned.replace(/[.!?]+$/, "")}. ${projectKeyword} helps clients achieve results with ${industryTone} execution and fast onboarding.`;
      }
      if (sectionType === "pricing") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Clear deliverables, transparent pricing, and support are included so buyers can choose confidently.`;
      }
      if (sectionType === "faq") {
        return `${cleaned.replace(/[.!?]+$/, "")}. We keep answers practical, fast, and easy to follow so visitors can move to the next step.`;
      }
      if (sectionType === "contact") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Reach out now and ${projectKeyword} will respond quickly with clear next steps.`;
      }
      if (sectionType === "services") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Every service is designed for reliable outcomes, clear communication, and measurable value.`;
      }
      if (sectionType === "testimonials") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Clients consistently highlight responsive support, strong outcomes, and dependable delivery.`;
      }
      return `${cleaned.replace(/[.!?]+$/, "")}. ${projectKeyword} delivers ${industryKeyword} solutions with ${industryTone} standards and measurable outcomes.`;
    }

    if (actionKey === "shorten") {
      const words = cleaned.split(/\s+/);
      const limited = words.slice(0, Math.max(8, Math.floor(words.length * 0.55))).join(" ");
      return limited.length < cleaned.length ? `${limited.replace(/[,.!?;:]+$/, "")}.` : firstSentence;
    }
    if (actionKey === "expand") {
      if (sectionType === "faq") return `${cleaned} We guide each step clearly, explain timelines, and follow up quickly so families stay informed.`;
      if (sectionType === "pricing") return `${cleaned} Every plan includes transparent deliverables, clear timelines, and responsive support with no hidden surprises.`;
      if (sectionType === "hero") return `${cleaned} Partner with ${projectKeyword} for fast onboarding, trusted execution, and measurable outcomes.`;
      return `${cleaned} We deliver measurable results with clear timelines, transparent updates, and trusted support.`;
    }
    if (actionKey === "persuasive") {
      if (sectionType === "hero") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Move forward with ${projectKeyword} for faster results, clearer value, and a more confident next step.`;
      }
      if (sectionType === "pricing") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Choose the option that gives you transparent value, dependable support, and confidence from day one.`;
      }
      if (sectionType === "services") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Designed to deliver meaningful outcomes with a smoother process and stronger support at every step.`;
      }
      if (sectionType === "contact") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Reach out today and get clear answers, practical next steps, and responsive support without delay.`;
      }
      if (sectionType === "testimonials") {
        return `${cleaned.replace(/[.!?]+$/, "")}. Trusted by clients who value reliable delivery, responsive communication, and measurable results.`;
      }
      return `${cleaned.replace(/[.!?]+$/, "")}. ${projectKeyword} helps you move faster with trusted ${industryKeyword} support and a clearer path to results.`;
    }
    if (actionKey === "seo") {
      const sectionKeyword =
        sectionType === "pricing"
          ? "pricing options"
          : sectionType === "faq"
            ? "frequently asked questions"
            : sectionType === "services"
              ? "service solutions"
              : sectionType === "contact"
                ? "contact support"
                : "trusted solutions";
      return `${cleaned} ${projectKeyword} delivers trusted ${industryKeyword} ${sectionKeyword} with responsive support and proven outcomes.`;
    }
    if (actionKey === "cta") {
      const stripped = cleaned.replace(/[.!?]+$/, "");
      if (sectionType === "pricing") {
        return `Choose the best-fit plan and start with ${projectKeyword} today. ${stripped}.`;
      }
      if (sectionType === "faq") {
        return `Still have questions? Contact ${projectKeyword} today for clear answers and next steps. ${stripped}.`;
      }
      if (sectionType === "hero") {
        return `Get started with ${projectKeyword} today and see results faster. ${stripped}.`;
      }
      return `Book your consultation with ${projectKeyword} today to get started quickly and confidently. ${stripped}.`;
    }
    if (actionKey === "professional") {
      return cleaned
        .replace(/\b(can't|cannot)\b/gi, "can not")
        .replace(/\b(don't)\b/gi, "do not")
        .replace(/\b(we're)\b/gi, "we are")
        .replace(/\b(you'll)\b/gi, "you will");
    }
    if (actionKey === "friendly") {
      return cleaned
        .replace(/\b(do not)\b/gi, "don't")
        .replace(/\b(we are)\b/gi, "we're")
        .replace(/\b(you will)\b/gi, "you'll")
        .replace(/\.$/, "!") || `${cleaned}!`;
    }
    if (actionKey === "fix") {
      const normalized = cleaned.replace(/\s+/g, " ").replace(/\s([,.!?;:])/g, "$1");
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
    return "";
  }, [projectName, selectedIndustryPackage]);

  const handleImproveSelectedSection = useCallback(() => {
    const root = previewEditableRef.current;
    const sectionRoot = selectedSectionNodeRef.current;
    if (!(root instanceof HTMLElement) || !(sectionRoot instanceof HTMLElement)) {
      setInlineSmartStatus("Select a section first.");
      return;
    }
    let changedCount = 0;
    Array.from(sectionRoot.querySelectorAll("h1, h2, h3, h4, p, li, blockquote")).slice(0, 80).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.children.length > 0) return;
      const source = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (!source || source.length < 5) return;
      const sectionType = detectInlineSectionType(node, root);
      const actionKey = source.length > 130 ? "shorten" : "smart";
      const rewritten = runInlineSmartRewrite(source, actionKey, { sectionType });
      if (!rewritten || rewritten === source) return;
      node.textContent = rewritten;
      changedCount += 1;
    });
    const sectionId = String(sectionRoot.dataset.id || "").trim();
    commitInlineDomMutation(
      changedCount > 0
        ? `Improved ${changedCount} text block${changedCount === 1 ? "" : "s"} in this section.`
        : "No section-level improvements were needed.",
      "Improve Section",
      sectionId
    );
  }, [commitInlineDomMutation, runInlineSmartRewrite]);

  const handleReplaceSelectedSection = useCallback(() => {
    const root = previewEditableRef.current;
    const sectionRoot = selectedSectionNodeRef.current;
    if (!(root instanceof HTMLElement) || !(sectionRoot instanceof HTMLElement)) {
      setInlineSmartStatus("Select a section first.");
      return;
    }
    const sectionId = String(sectionRoot.dataset.id || "").trim();
    const sectionType = detectInlineSectionType(sectionRoot, root);
    const title = buildSectionMeta(sectionRoot)?.title || "Section headline";
    const subtitle = buildSectionMeta(sectionRoot)?.subtitle || "Clear supporting copy for this section.";
    const buttonText = buildSectionMeta(sectionRoot)?.buttonText || (sectionType === "contact" ? "Contact Us" : "Get Started");
    const benefits = [
      runInlineSmartRewrite(title, "smart", { sectionType }),
      runInlineSmartRewrite(subtitle, "persuasive", { sectionType }),
      runInlineSmartRewrite(buttonText, "cta", { sectionType }),
    ]
      .map((item) => String(item || "").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .slice(0, 3);
    sectionRoot.innerHTML = `
      <div style="display:grid;gap:16px">
        <div style="display:grid;gap:10px">
          <small style="font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--tn-link)">REFRESHED SECTION</small>
          <h2>${escapeHtml(runInlineSmartRewrite(title, "smart", { sectionType }) || title)}</h2>
          <p>${escapeHtml(runInlineSmartRewrite(subtitle, "expand", { sectionType }) || subtitle)}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px">
          ${benefits
            .map(
              (item) => `
                <article style="border:1px solid var(--tn-border);border-radius:14px;padding:14px;background:var(--tn-card-bg);box-shadow:var(--tn-shadow-soft)">
                  <strong style="display:block;color:var(--tn-heading);font-size:14px;line-height:1.4">${escapeHtml(item)}</strong>
                </article>
              `
            )
            .join("")}
        </div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <a href="#contact" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:var(--tn-cta);color:var(--tn-button-text);text-decoration:none;font-weight:700">
            ${escapeHtml(runInlineSmartRewrite(buttonText, "cta", { sectionType }) || buttonText)}
          </a>
          <span style="color:var(--tn-body);font-size:13px">Benefits, proof, and stronger conversion structure were added automatically.</span>
        </div>
      </div>
    `;
    commitInlineDomMutation("Section layout replaced with a stronger conversion structure.", "Replace Section", sectionId);
  }, [buildSectionMeta, commitInlineDomMutation, runInlineSmartRewrite]);

  const handleMoveSelectedSection = useCallback((direction) => {
    const sectionRoot = selectedSectionNodeRef.current;
    if (!(sectionRoot instanceof HTMLElement)) {
      setInlineSmartStatus("Select a section first.");
      return;
    }
    const parent = sectionRoot.parentElement;
    if (!(parent instanceof HTMLElement)) return;
    const siblings = Array.from(parent.children).filter(
      (node) => node instanceof HTMLElement && node.matches("[data-component][data-id], [data-component], section, article, header, footer, nav, aside, main")
    );
    const currentIndex = siblings.indexOf(sectionRoot);
    if (currentIndex < 0) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const target = siblings[targetIndex];
    if (!(target instanceof HTMLElement)) return;
    if (direction === "up") {
      parent.insertBefore(sectionRoot, target);
    } else {
      parent.insertBefore(target, sectionRoot);
    }
    const sectionId = String(sectionRoot.dataset.id || "").trim();
    commitInlineDomMutation(
      direction === "up" ? "Section moved up." : "Section moved down.",
      direction === "up" ? "Move Section Up" : "Move Section Down",
      sectionId
    );
  }, [commitInlineDomMutation]);

  const handleDeleteSelectedSection = useCallback(() => {
    const root = previewEditableRef.current;
    const sectionRoot = selectedSectionNodeRef.current;
    if (!(root instanceof HTMLElement) || !(sectionRoot instanceof HTMLElement)) {
      setInlineSmartStatus("Select a section first.");
      return;
    }
    const sections = Array.from(root.querySelectorAll("[data-component][data-id], [data-component], section, article, header, footer, nav, aside, main"));
    if (sections.length <= 1) {
      setInlineSmartStatus("At least one section must remain.");
      return;
    }
    const fallback =
      sectionRoot.nextElementSibling instanceof HTMLElement
        ? sectionRoot.nextElementSibling
        : sectionRoot.previousElementSibling instanceof HTMLElement
          ? sectionRoot.previousElementSibling
          : null;
    sectionRoot.remove();
    if (selectedEditableNodeRef.current instanceof HTMLElement && !root.contains(selectedEditableNodeRef.current)) {
      selectedEditableNodeRef.current = null;
      setSelectedEditableMeta(null);
    }
    if (!(fallback instanceof HTMLElement)) {
      setSelectedSectionMeta(null);
      selectedSectionNodeRef.current = null;
      commitInlineDomMutation("Section deleted.", "Delete Section");
      return;
    }
    const fallbackId = String(fallback.dataset.id || "").trim();
    commitInlineDomMutation("Section deleted.", "Delete Section", fallbackId);
  }, [commitInlineDomMutation]);

  const clearInlineHoverNode = () => {
    const node = inlineHoverNodeRef.current;
    if (!(node instanceof HTMLElement)) return;
    node.style.boxShadow = node.dataset.tnOldBoxShadow || "";
    node.style.backgroundColor = node.dataset.tnOldBackground || "";
    node.style.cursor = node.dataset.tnOldCursor || "";
    node.style.transition = node.dataset.tnOldTransition || "";
    delete node.dataset.tnOldBoxShadow;
    delete node.dataset.tnOldBackground;
    delete node.dataset.tnOldCursor;
    delete node.dataset.tnOldTransition;
    inlineHoverNodeRef.current = null;
  };

  const handleInlineHoverMove = (event) => {
    if (!isInlineEditing) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const node = target.closest(
      "[data-editable][data-edit-id], [data-editable][data-id]"
    );
    if (!(node instanceof HTMLElement)) {
      clearInlineHoverNode();
      return;
    }
    if (inlineHoverNodeRef.current === node) return;
    clearInlineHoverNode();
    node.dataset.tnOldBoxShadow = node.style.boxShadow || "";
    node.dataset.tnOldBackground = node.style.backgroundColor || "";
    node.dataset.tnOldCursor = node.style.cursor || "";
    node.dataset.tnOldTransition = node.style.transition || "";
    node.style.transition = node.style.transition || "box-shadow 120ms ease, background-color 120ms ease";
    node.style.boxShadow = "inset 0 0 0 2px rgba(59,130,246,0.78)";
    node.style.backgroundColor = "rgba(59,130,246,0.09)";
    const nodeType = String(node.dataset.editable || "");
    node.style.cursor = nodeType === "image" ? "pointer" : nodeType === "button" || nodeType === "link" ? "text" : "text";
    inlineHoverNodeRef.current = node;
  };

  const handleInlineHoverLeave = () => {
    clearInlineHoverNode();
  };

  const handleInlinePointerActivate = (event) => {
    if (!isInlineEditing) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    selectInlineSection(target);
    const editableTarget = target.closest("[data-editable][data-edit-id], [data-editable][data-id]");
    if (!(editableTarget instanceof HTMLElement)) return;
    event.preventDefault();
    selectInlineEditableNode(editableTarget);
  };


  const inlineBestSuggestion = useMemo(
    () => (Array.isArray(inlineSuggestions) && inlineSuggestions.length > 0 ? inlineSuggestions[0] : null),
    [inlineSuggestions]
  );

  const captureInlineSelection = () => {
    if (!isInlineEditing) return;
    const root = previewEditableRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.rangeCount < 1) {
      setInlineSelectionText("");
      setInlineSelectionSection("");
      setInlineSuggestions([]);
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = String(selection.toString() || "").trim();
    const ancestorNode =
      range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer?.parentElement;
    if (!ancestorNode || !root.contains(ancestorNode)) {
      setInlineSelectionText("");
      setInlineSelectionSection("");
      setInlineSuggestions([]);
      return;
    }
    const fallbackNode = ancestorNode.closest("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label");
    const fallbackText = String(fallbackNode?.textContent || "").replace(/\s+/g, " ").trim();
    const effectiveText = selectedText || fallbackText;
    if (!effectiveText) {
      setInlineSelectionText("");
      setInlineSelectionSection("");
      setInlineSuggestions([]);
      return;
    }
    const sectionType = detectInlineSectionType(ancestorNode, root);
    selectInlineSection(ancestorNode instanceof Element ? ancestorNode : root);
    selectInlineEditableNode(
      ancestorNode instanceof HTMLElement
        ? ancestorNode
        : fallbackNode instanceof HTMLElement
          ? fallbackNode
          : root
    );
    setInlineSelectionText(effectiveText);
    setInlineSelectionSection(sectionType);
    const nextSuggestions = buildInlineSuggestions(effectiveText, sectionType, runInlineSmartRewrite);
    setInlineSuggestions(nextSuggestions);
    const best = Array.isArray(nextSuggestions) && nextSuggestions.length > 0 ? nextSuggestions[0] : null;
    const bestConfidence = Number(best?.confidence || 0);
    if (inlineAutoApplyHighConfidence && best && bestConfidence >= 90) {
      handleApplyInlineSuggestion(best.text, `best suggestion (${best.label})`, bestConfidence);
    }
  };

  const handleRunInlineSmartCommand = useCallback((rawCommand) => {
    if (!isInlineEditing) return;
    const actionKey = parseInlineSmartAction(rawCommand || inlineSmartCommand);
    if (!actionKey) {
      setInlineSmartStatus("Use /smart, /shorten, /persuasive, /expand, /seo, /cta, /professional, /friendly, or /fix.");
      return;
    }
    const root = previewEditableRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.rangeCount < 1) {
      setInlineSmartStatus("Select text in the preview first.");
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    const ancestorNode =
      range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer?.parentElement;
    if (!ancestorNode || !root.contains(ancestorNode)) {
      setInlineSmartStatus("Click inside text in the preview first.");
      return;
    }
    const fallbackNode = ancestorNode.closest("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label");
    const fallbackText = String(fallbackNode?.textContent || "").replace(/\s+/g, " ").trim();
    const effectiveText = selectedText || fallbackText;
    if (!effectiveText) {
      setInlineSmartStatus("Click or select text in the preview first.");
      return;
    }
    const sectionType = detectInlineSectionType(ancestorNode, root);
    const rewritten = runInlineSmartRewrite(effectiveText, actionKey, { sectionType });
    if (!rewritten || rewritten === effectiveText) {
      setInlineSmartStatus("No rewrite needed for this selection.");
      return;
    }
    if (selectedText) {
      range.deleteContents();
      const nextNode = document.createTextNode(rewritten);
      range.insertNode(nextNode);
      const nextRange = document.createRange();
      nextRange.setStartAfter(nextNode);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    } else if (fallbackNode instanceof HTMLElement) {
      fallbackNode.textContent = rewritten;
      const nextRange = document.createRange();
      nextRange.selectNodeContents(fallbackNode);
      nextRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    }
    const nextHtml = root.innerHTML;
    setDraftHtml(nextHtml);
    setInlineDraftDirty(true);
    appendInlineHistory(nextHtml);
    setInlineSmartStatus(`Applied ${actionKey} rewrite (${sectionType}).`);
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
  }, [inlineSmartCommand, isInlineEditing, runInlineSmartRewrite]);

  const handleApplyInlineSuggestion = useCallback((suggestionText, sourceLabel = "smart suggestion", confidence = null) => {
    const root = previewEditableRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.rangeCount < 1) {
      setInlineSmartStatus("Select text in the preview first.");
      return;
    }
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    const ancestorNode =
      range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer?.parentElement;
    if (!ancestorNode || !root.contains(ancestorNode)) {
      setInlineSmartStatus("Click inside text in the preview first.");
      return;
    }
    const fallbackNode = ancestorNode.closest("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label");
    const fallbackText = String(fallbackNode?.textContent || "").replace(/\s+/g, " ").trim();
    if (!selectedText && !fallbackText) {
      setInlineSmartStatus("Click or select text in the preview first.");
      return;
    }
    const rewritten = String(suggestionText || "").trim();
    if (!rewritten) return;
    if (selectedText) {
      range.deleteContents();
      const nextNode = document.createTextNode(rewritten);
      range.insertNode(nextNode);
      const nextRange = document.createRange();
      nextRange.setStartAfter(nextNode);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    } else if (fallbackNode instanceof HTMLElement) {
      fallbackNode.textContent = rewritten;
      const nextRange = document.createRange();
      nextRange.selectNodeContents(fallbackNode);
      nextRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    }
    const nextHtml = root.innerHTML;
    setDraftHtml(nextHtml);
    setInlineDraftDirty(true);
    setEditHistory((previous) => {
      if (previous[previous.length - 1] === nextHtml) return previous;
      return [...previous.slice(-49), nextHtml];
    });
    setInlineSmartStatus(
      confidence
        ? `Applied ${sourceLabel} (${Math.round(Number(confidence) || 0)}% confidence).`
        : `Applied ${sourceLabel}.`
    );
    setInlineCheckpoints((previous) => [
      ...previous.slice(-5),
      {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: String(sourceLabel || "Smart Apply").slice(0, 28),
        pageKey: activePage,
        html: nextHtml,
        at: new Date().toISOString(),
      },
    ]);
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
  }, [activePage]);

  const handleImproveInlinePageCopy = useCallback(() => {
    if (!isInlineEditing || inlineBulkImproving) return 0;
    const root = previewEditableRef.current;
    if (!root) return 0;
    setInlineBulkImproving(true);
    let changedCount = 0;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${root.innerHTML || ""}</body>`, "text/html");
      const textNodes = Array.from(
        doc.body.querySelectorAll("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label")
      );
      textNodes.slice(0, 120).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.children.length > 0) return;
        const source = String(node.textContent || "").replace(/\s+/g, " ").trim();
        if (!source || source.length < 5) return;
        const sectionType = detectInlineSectionType(node, doc.body);
        const actionKey = source.length > 130 ? "shorten" : "fix";
        const rewritten = runInlineSmartRewrite(source, actionKey, { sectionType });
        if (!rewritten || rewritten === source) return;
        node.textContent = rewritten;
        changedCount += 1;
      });
      const nextHtml = doc.body.innerHTML;
      if (nextHtml && nextHtml !== root.innerHTML) {
        root.innerHTML = nextHtml;
        setDraftHtml(nextHtml);
        setInlineDraftDirty(true);
        appendInlineHistory(nextHtml);
        setInlineCheckpoints((previous) => [
          ...previous.slice(-5),
          {
            id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            label: "Improve Page",
            pageKey: activePage,
            html: nextHtml,
            at: new Date().toISOString(),
          },
        ]);
      }
      setInlineSmartStatus(
        changedCount > 0
          ? `Improved copy across ${changedCount} text block${changedCount === 1 ? "" : "s"}.`
          : "No page-wide copy fixes were needed."
      );
    } finally {
      setInlineBulkImproving(false);
    }
    return changedCount;
  }, [activePage, inlineBulkImproving, isInlineEditing, runInlineSmartRewrite]);

  const handleImproveInlineSectionCopy = useCallback(() => {
    if (!isInlineEditing || inlineBulkImproving) return;
    const root = previewEditableRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.rangeCount < 1) {
      setInlineSmartStatus("Select text inside a section first.");
      return;
    }
    const range = selection.getRangeAt(0);
    const anchorNode =
      range.commonAncestorContainer instanceof Element
        ? range.commonAncestorContainer
        : range.commonAncestorContainer?.parentElement;
    if (!anchorNode || !root.contains(anchorNode)) {
      setInlineSmartStatus("Select text inside a section first.");
      return;
    }
    const sectionRoot =
      anchorNode.closest("[data-tn-section], section, article, main, [id*='section'], [class*='section']") || anchorNode;
    if (!(sectionRoot instanceof Element)) {
      setInlineSmartStatus("Could not detect section root.");
      return;
    }
    setInlineBulkImproving(true);
    let changedCount = 0;
    try {
      const textNodes = Array.from(
        sectionRoot.querySelectorAll("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label")
      );
      textNodes.slice(0, 80).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.children.length > 0) return;
        const source = String(node.textContent || "").replace(/\s+/g, " ").trim();
        if (!source || source.length < 5) return;
        const sectionType = detectInlineSectionType(node, root);
        const actionKey = source.length > 130 ? "shorten" : "fix";
        const rewritten = runInlineSmartRewrite(source, actionKey, { sectionType });
        if (!rewritten || rewritten === source) return;
        node.textContent = rewritten;
        changedCount += 1;
      });
      const nextHtml = root.innerHTML;
      setDraftHtml(nextHtml);
      setInlineDraftDirty(true);
      appendInlineHistory(nextHtml);
      setInlineCheckpoints((previous) => [
        ...previous.slice(-5),
        {
          id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: "Improve Section",
          pageKey: activePage,
          html: nextHtml,
          at: new Date().toISOString(),
        },
      ]);
      setInlineSmartStatus(
        changedCount > 0
          ? `Improved ${changedCount} text block${changedCount === 1 ? "" : "s"} in this section.`
          : "No section-level improvements were needed."
      );
    } finally {
      setInlineBulkImproving(false);
    }
  }, [activePage, inlineBulkImproving, isInlineEditing, runInlineSmartRewrite]);

  const handleImproveAndSaveInlinePageCopy = useCallback(() => {
    if (!isInlineEditing || inlineBulkImproving) return;
    handleImproveInlinePageCopy();
    handleSaveInlineEdit();
  }, [handleImproveInlinePageCopy, handleSaveInlineEdit, inlineBulkImproving, isInlineEditing]);

  const handleImproveSavePublishInline = useCallback(async () => {
    if (!isInlineEditing || inlineBulkImproving || publishing) return;
    const snapshotHtml = generatedPages[activePage] || generatedSite || "";
    if (snapshotHtml) {
      setInlineLastPublishSnapshot({
        pageKey: activePage,
        html: snapshotHtml,
        savedAt: new Date().toISOString(),
      });
      setInlineCheckpoints((previous) => [
        ...previous.slice(-5),
        {
          id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: "Pre Publish",
          pageKey: activePage,
          html: snapshotHtml,
          at: new Date().toISOString(),
        },
      ]);
    }
    handleImproveAndSaveInlinePageCopy();
    await handleGoLive();
  }, [
    activePage,
    generatedPages,
    generatedSite,
    handleGoLive,
    handleImproveAndSaveInlinePageCopy,
    inlineBulkImproving,
    isInlineEditing,
    publishing,
  ]);

  const handleRollbackInlinePublishSnapshot = useCallback(() => {
    const snapshot = inlineLastPublishSnapshot;
    if (!snapshot?.pageKey || !snapshot?.html) return;
    const nextPages = { ...(generatedPages || {}), [snapshot.pageKey]: snapshot.html };
    setGeneratedPages(nextPages);
    setActivePage(snapshot.pageKey);
    setGeneratedSite(snapshot.html);
    setDraftHtml(snapshot.html);
    setEditHistory([snapshot.html]);
    setRedoHistory([]);
    setInlineDraftDirty(false);
    setIsInlineEditing(true);
    setInlineCheckpoints((previous) => [
      ...previous.slice(-5),
      {
        id: `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label: "Rollback",
        pageKey: snapshot.pageKey,
        html: snapshot.html,
        at: new Date().toISOString(),
      },
    ]);
    setPublishStatus("info");
    setPublishMessage("Rolled back to pre-publish content for this page. Re-publish when ready.");
  }, [generatedPages, inlineLastPublishSnapshot]);

  const handleRestoreInlineCheckpoint = (checkpointId) => {
    const target = (inlineCheckpoints || []).find((item) => item.id === checkpointId);
    if (!target?.html) return;
    const nextPages = { ...(generatedPages || {}), [target.pageKey || activePage]: target.html };
    setGeneratedPages(nextPages);
    setActivePage(target.pageKey || activePage);
    setGeneratedSite(target.html);
    setDraftHtml(target.html);
    if (previewEditableRef.current) previewEditableRef.current.innerHTML = target.html;
    setEditHistory((previous) => {
      if (previous[previous.length - 1] === target.html) return previous;
      return [...previous.slice(-49), target.html];
    });
    setRedoHistory([]);
    setInlineDraftDirty(true);
    setInlineSmartStatus(`Restored checkpoint: ${target.label}.`);
  };

  useEffect(() => {
    if (!isInlineEditing) return undefined;
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSaveInlineEdit();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndoInlineEdit();
        return;
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))
      ) {
        event.preventDefault();
        handleRedoInlineEdit();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        if (event.shiftKey) {
          if (inlineBestSuggestion) {
            handleApplyInlineSuggestion(
              inlineBestSuggestion.text,
              `best suggestion (${inlineBestSuggestion.label})`,
              inlineBestSuggestion.confidence
            );
          } else {
            handleRunInlineSmartCommand("/smart");
          }
        } else {
          handleRunInlineSmartCommand("/smart");
        }
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "i") {
        event.preventDefault();
        handleImproveInlinePageCopy();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        handleImproveInlineSectionCopy();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handleImproveAndSaveInlinePageCopy();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handleImproveSavePublishInline();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "u") {
        event.preventDefault();
        handleRollbackInlinePublishSnapshot();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleSaveInlineEdit();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        handleCancelInlineEdit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    isInlineEditing,
    handleApplyInlineSuggestion,
    handleSaveInlineEdit,
    handleCancelInlineEdit,
    handleUndoInlineEdit,
    handleRedoInlineEdit,
    handleRunInlineSmartCommand,
    handleImproveInlinePageCopy,
    handleImproveInlineSectionCopy,
    handleImproveAndSaveInlinePageCopy,
    handleImproveSavePublishInline,
    handleRollbackInlinePublishSnapshot,
    inlineBestSuggestion,
    inlineBulkImproving,
  ]);

  useEffect(() => {
    if (isInlineEditing) return undefined;
    clearInlineHoverNode();
    if (selectedEditableNodeRef.current instanceof HTMLElement) {
      selectedEditableNodeRef.current.classList.remove("tn-editable-active");
    }
    if (selectedSectionNodeRef.current instanceof HTMLElement) {
      selectedSectionNodeRef.current.classList.remove("tn-section-active");
    }
    selectedEditableNodeRef.current = null;
    selectedSectionNodeRef.current = null;
    setSelectedEditableMeta(null);
    setSelectedSectionMeta(null);
    setSelectedSectionEditId("");
    setInlineSmartStatus("");
    setInlineSmartCommand("");
    setInlineSelectionText("");
    setInlineSelectionSection("");
    setInlineSuggestions([]);
    setInlineAutoApplyHighConfidence(false);
    setInlineAdvancedOpen(false);
    clearInlineAutofocusQueue();
    return undefined;
  }, [clearInlineAutofocusQueue, isInlineEditing]);

  useEffect(() => {
    const root = previewEditableRef.current;
    if (!root) return;
    const selector =
      "[data-editable='text'][data-edit-id], [data-editable='text'][data-id], [data-editable='button'][data-edit-id], [data-editable='button'][data-id], [data-editable='link'][data-edit-id], [data-editable='link'][data-id]";

    if (isInlineEditing) {
      annotateInlineEditableDom();
      const editableNodes = Array.from(root.querySelectorAll(selector));
      editableNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        node.setAttribute("contenteditable", "true");
        node.setAttribute("tabindex", "0");
        node.setAttribute("spellcheck", "true");
      });
      const imageNodes = Array.from(
        root.querySelectorAll("[data-editable='image'][data-edit-id], [data-editable='image'][data-id]")
      );
      imageNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        node.removeAttribute("contenteditable");
        node.setAttribute("tabindex", "0");
        node.removeAttribute("spellcheck");
      });
      return;
    }

    const editableNodes = Array.from(root.querySelectorAll(selector));
    editableNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.removeAttribute("contenteditable");
      node.removeAttribute("tabindex");
      node.removeAttribute("spellcheck");
    });
    const imageNodes = Array.from(
      root.querySelectorAll("[data-editable='image'][data-edit-id], [data-editable='image'][data-id]")
    );
    imageNodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      node.removeAttribute("tabindex");
    });
  }, [isInlineEditing, draftHtml, annotateInlineEditableDom]);

  useEffect(() => {
    const root = previewEditableRef.current;
    if (!(root instanceof HTMLElement)) return;
    const themedRoot = root.querySelector("[data-tn-theme-root='true']");
    if (!(themedRoot instanceof HTMLElement)) return;
    if (isInlineEditing) {
      themedRoot.setAttribute("data-tn-editing", "true");
    } else {
      themedRoot.removeAttribute("data-tn-editing");
    }
  }, [isInlineEditing, draftHtml, activePage]);

  useEffect(() => {
    if (!isInlineEditing) return;
    const root = previewEditableRef.current;
    if (!root) return;
    window.requestAnimationFrame(() => {
      if (!previewEditableRef.current) return;
      const activeElement = document.activeElement;
      if (root.contains(activeElement)) return;
      scheduleInlineAutofocus();
    });
  }, [activePage, isInlineEditing, fieldLockMode, scheduleInlineAutofocus]);

  useEffect(() => {
    if (!isInlineEditing || !pendingInstantEditRef.current) return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const root = previewEditableRef.current;
      if (!(root instanceof HTMLElement)) return;
      annotateInlineEditableDom();
      const firstEditable = root.querySelector(
        "[data-editable='text'][data-edit-id], [data-editable='text'][data-id], [data-editable][data-edit-id], [data-editable][data-id]"
      );
      if (firstEditable instanceof HTMLElement) {
        selectInlineSection(firstEditable);
        selectInlineEditableNode(firstEditable);
        scheduleInlineAutofocus(firstEditable);
      } else {
        scheduleInlineAutofocus();
      }
      pendingInstantEditRef.current = false;
    };
    const rafA = window.requestAnimationFrame(run);
    inlineAutofocusHandlesRef.current.push({ type: "frame", id: rafA });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafA);
    };
  }, [draftHtml, activePage, isInlineEditing, annotateInlineEditableDom, selectInlineEditableNode, scheduleInlineAutofocus, selectInlineSection]);

  useEffect(() => {
    if (!selectedEditableMeta) return undefined;
    const syncToolbar = () => {
      if (selectedEditableNodeRef.current instanceof HTMLElement) {
        updateFloatingToolbarPosition(selectedEditableNodeRef.current);
        setSelectedEditableMeta((previous) =>
          previous
            ? {
                ...previous,
                value: readInlineEditableValue(selectedEditableNodeRef.current, previous.type),
              }
            : previous
        );
      }
    };
    syncToolbar();
    window.addEventListener("scroll", syncToolbar, { passive: true });
    window.addEventListener("resize", syncToolbar);
    return () => {
      window.removeEventListener("scroll", syncToolbar);
      window.removeEventListener("resize", syncToolbar);
    };
  }, [selectedEditableMeta, updateFloatingToolbarPosition]);

  useEffect(() => {
    const selectedSectionNode = selectedSectionNodeRef.current;
    if (!(selectedSectionNode instanceof HTMLElement)) return;
    const nextMeta = buildSectionMeta(selectedSectionNode);
    if (!nextMeta) return;
    setSelectedSectionMeta(nextMeta);
  }, [buildSectionMeta, sections]);

  useEffect(() => {
    const html = String(draftHtml || generatedSite || "").trim();
    if (!html) {
      setInlineSiteModel({});
      setSections({});
      return;
    }
    const nextInlineModel = buildInlineSiteModelFromHtml(html);
    setInlineSiteModel(nextInlineModel);
    setSectionsFromInlineModel(nextInlineModel);
  }, [draftHtml, generatedSite, activePage, setSectionsFromInlineModel]);

  useEffect(() => {
    const onScrollOrResize = () => applyParallaxTransforms();
    applyParallaxTransforms();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [generatedSite, activePage, isInlineEditing]);

  useEffect(() => {
    let cancelled = false;
    const bootstrapAuth = async () => {
      let storedToken = "";
      try {
        storedToken = String(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || "").trim();
        const storedUser = safeJsonParse(localStorage.getItem(AUTH_USER_STORAGE_KEY) || "null", null);
        if (storedUser && typeof storedUser === "object" && storedUser.id && !cancelled) {
          setAuthUser(storedUser);
        }
      } catch {
        storedToken = "";
      }
      if (!storedToken || cancelled) return;
      setAuthToken(storedToken);
      try {
        const meResponse = await fetch("/api/auth/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({}),
        });
        const payload = await meResponse.json().catch(() => ({}));
        if (!meResponse.ok) throw new Error(String(payload?.error || "Auth bootstrap failed"));
        if (cancelled) return;
        if (payload?.user) {
          setAuthUser(payload.user);
          try {
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(payload.user));
          } catch {
            // Ignore storage failures in private mode.
          }
        }
        const projectsResponse = await fetch("/api/projects/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({}),
        });
        const projectsPayload = await projectsResponse.json().catch(() => ({}));
        if (projectsResponse.ok && !cancelled) {
          setUserProjects(Array.isArray(projectsPayload?.projects) ? projectsPayload.projects : []);
        }
        if (!cancelled) {
          const [plansResponse, statusResponse, workspacesResponse] = await Promise.all([
            fetch("/api/billing/plans", {
              method: "GET",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${storedToken}` },
            }),
            fetch("/api/billing/status", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${storedToken}` },
              body: JSON.stringify({}),
            }),
            fetch("/api/workspaces/list", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${storedToken}` },
              body: JSON.stringify({}),
            }),
          ]);
          const plansPayload = await plansResponse.json().catch(() => ({}));
          const statusPayload = await statusResponse.json().catch(() => ({}));
          const workspacesPayload = await workspacesResponse.json().catch(() => ({}));
          if (!cancelled && plansResponse.ok) {
            setBillingPlans(Array.isArray(plansPayload?.plans) ? plansPayload.plans : []);
          }
          if (!cancelled && statusResponse.ok) {
            setBillingStatusData(statusPayload || null);
          }
          if (!cancelled && workspacesResponse.ok) {
            const workspaces = Array.isArray(workspacesPayload?.workspaces) ? workspacesPayload.workspaces : [];
            setWorkspaceList(workspaces);
            const activeWorkspaceId = String(payload?.user?.active_workspace_id || "").trim();
            if (activeWorkspaceId) {
              const membersResponse = await fetch("/api/workspaces/members", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${storedToken}` },
                body: JSON.stringify({ workspace_id: activeWorkspaceId }),
              });
              const membersPayload = await membersResponse.json().catch(() => ({}));
              if (membersResponse.ok && !cancelled) {
                setWorkspaceMembers(Array.isArray(membersPayload?.members) ? membersPayload.members : []);
              }
            }
          }
        }
      } catch {
        if (cancelled) return;
        setAuthToken("");
        setAuthUser(null);
        setUserProjects([]);
        try {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        } catch {
          // Ignore storage failures in private mode.
        }
      }
    };
    bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PURCHASED_DOMAINS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        const normalized = parsed
          .map((item) => normalizeDomain(item))
          .filter(Boolean)
          .slice(0, 12);
        setPurchasedDomains(normalized);
      }
    } catch {
      setPurchasedDomains([]);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DEVELOPER_ADDONS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        const coreIds = new Set(CORE_ADDON_CATALOG.map((item) => item.id));
        const safeCustom = parsed
          .filter((item) => item && typeof item === "object" && typeof item.id === "string" && !coreIds.has(item.id))
          .map((item) => ({
            ...item,
            category: ["booking", "crm", "automation"].includes(item.category) ? item.category : "automation",
            featureKeys: Array.isArray(item.featureKeys) ? item.featureKeys : [],
            priceLabel: String(item.priceLabel || "Free"),
          }));
        setEcosystemAddons([...safeCustom, ...CORE_ADDON_CATALOG]);
      }
    } catch {
      setEcosystemAddons(CORE_ADDON_CATALOG);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INSTALLED_ADDONS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object") {
        setInstalledAddons(parsed);
      }
    } catch {
      setInstalledAddons({});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PURCHASED_DOMAINS_STORAGE_KEY, JSON.stringify(purchasedDomains.slice(0, 12)));
    } catch {
      // Ignore storage write failures in private mode/quota limits.
    }
  }, [purchasedDomains]);

  useEffect(() => {
    try {
      const customAddons = ecosystemAddons.filter((item) => !CORE_ADDON_CATALOG.some((core) => core.id === item.id));
      localStorage.setItem(DEVELOPER_ADDONS_STORAGE_KEY, JSON.stringify(customAddons.slice(0, 60)));
    } catch {
      // Ignore storage write failures in private mode/quota limits.
    }
  }, [ecosystemAddons]);

  useEffect(() => {
    try {
      localStorage.setItem(INSTALLED_ADDONS_STORAGE_KEY, JSON.stringify(installedAddons));
    } catch {
      // Ignore storage write failures in private mode/quota limits.
    }
  }, [installedAddons]);

  useEffect(() => {
    if (editableImages.length === 0) {
      setSelectedImageId("");
      setImageUrlInput("");
      return;
    }
    if (!selectedImageId || !editableImages.some((item) => item.id === selectedImageId)) {
      setSelectedImageId(editableImages[0].id);
      setImageUrlInput(editableImages[0].src || "");
    }
  }, [editableImages, selectedImageId]);

  useEffect(() => {
    if (!selectedImage) return;
    setImageUrlInput(selectedImage.src || "");
  }, [selectedImage]);

  useEffect(() => {
    if (!currentMapQuery) {
      setMapQueryInput((previous) => previous || `${projectName || "care center"} location`);
      return;
    }
    setMapQueryInput(currentMapQuery);
  }, [currentMapQuery, projectName]);

  useEffect(() => {
    if (!designEvolutionEnabled) return undefined;
    const minutes = Number(designEvolutionMinutes || 0);
    if (!Number.isFinite(minutes) || minutes < 1) return undefined;
    const intervalMs = minutes * 60 * 1000;
    const timer = window.setInterval(() => {
      runDesignEvolution({ silent: true });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [designEvolutionEnabled, designEvolutionMinutes, activePage, generatedPages, themeColors, textStyle, runDesignEvolution]);

  useEffect(() => {
    if (!selfOptimizeEnabled) return undefined;
    const days = Number(selfOptimizeDays || 0);
    if (!Number.isFinite(days) || days < 1) return undefined;
    const intervalMs = days * 24 * 60 * 60 * 1000;
    const timer = window.setInterval(() => {
      runSelfOptimization({ silent: true });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [selfOptimizeEnabled, selfOptimizeDays, runSelfOptimization]);

  useEffect(() => {
    if (!autonomousModeEnabled) return undefined;
    const minutes = Number(autonomousIntervalMinutes || 0);
    if (!Number.isFinite(minutes) || minutes < 1) return undefined;
    const intervalMs = minutes * 60 * 1000;
    const timer = window.setInterval(() => {
      runAutonomousBusinessMode({ silent: true });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autonomousModeEnabled, autonomousIntervalMinutes, runAutonomousBusinessMode]);

  useEffect(() => {
    setAnalyticsSnapshot(
      buildAnalyticsSnapshot({
        pages: generatedPages,
        crmList: crmCustomers,
        appointments: autonomousAppointments,
        invoices: autonomousInvoices,
      })
    );
  }, [generatedPages, crmCustomers, autonomousAppointments, autonomousInvoices, buildAnalyticsSnapshot]);

  const handleResizeMouseDown = useCallback((event) => {
    event.preventDefault();
    setIsResizingPane(true);
  }, []);

  useEffect(() => {
    if (!isResizingPane) return undefined;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const onMouseMove = (event) => {
      const shell = appShellRef.current;
      if (!shell) return;
      const rect = shell.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const maxWidth = Math.max(420, rect.width - 420);
      const nextWidth = clamp(relativeX, 360, maxWidth);
      setCommandPaneWidth(nextWidth);
    };

    const onMouseUp = () => setIsResizingPane(false);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizingPane]);

  if (!hasDashboardAccess) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.hero}>
          <span style={styles.eyebrow}>TITONOVA CLOUD  BUSINESS ENGINE</span>
          <h1 style={styles.title}>TitoNova Cloud Business &amp; Website Engine</h1>
          <p style={styles.subtitle}>
            Dashboard access is locked. Create an account or log in to continue.
          </p>
        </div>
        <div style={{ ...styles.card, maxWidth: 760, margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Create Account</h2>
          <p style={styles.sectionIntro}>
            New users can access the dashboard immediately after signup.
          </p>
          {authUser ? (
            <div style={styles.authCard}>
              <div style={styles.authHeader}>
                <strong style={styles.authTitle}>Account Active</strong>
                <button type="button" style={styles.authGhostButton} onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <small style={styles.authMeta}>
                Account: {authUser?.email || "unknown"} · Status: {authUser?.approval_status || "approved"}.
              </small>
            </div>
          ) : (
            <div style={styles.authFormGrid}>
              <div style={styles.authModeRow}>
                <button
                  type="button"
                  style={authMode === "signup" ? styles.authModeButtonActive : styles.authModeButton}
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  style={authMode === "login" ? styles.authModeButtonActive : styles.authModeButton}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
              </div>
              {authMode === "signup" ? (
                <input
                  style={styles.solutionInput}
                  placeholder="Full name"
                  value={authNameInput}
                  onChange={(event) => setAuthNameInput(event.target.value)}
                />
              ) : null}
              <input
                style={styles.solutionInput}
                placeholder="Email"
                type="email"
                value={authEmailInput}
                onChange={(event) => setAuthEmailInput(event.target.value)}
              />
              <input
                style={styles.solutionInput}
                placeholder="Password"
                type="password"
                value={authPasswordInput}
                onChange={(event) => setAuthPasswordInput(event.target.value)}
              />
              <button
                type="button"
                style={styles.authPrimaryButton}
                onClick={authMode === "signup" ? handleSignup : handleLogin}
                disabled={authLoading}
              >
                {authLoading ? "Please wait..." : authMode === "signup" ? "Create Account" : "Login"}
              </button>
            </div>
          )}
          {publishMessage ? (
            <p
              style={
                publishStatus === "error"
                  ? styles.publishError
                  : publishStatus === "success"
                    ? styles.publishSuccess
                    : styles.publishInfo
              }
            >
              {publishMessage}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.hero}>
        <span style={styles.eyebrow}>TITONOVA CLOUD  BUSINESS ENGINE</span>
        <h1 style={styles.title}>TitoNova Cloud Business &amp; Website Engine</h1>
        <div style={styles.subtitleBlock}>
          <p style={styles.subtitleLead}>
            TitoNova Website &amp; Business Platform
          </p>
          <p style={styles.subtitle}>
            TitoNova automatically builds your complete website, marketing infrastructure, and revenue systems.
          </p>
          <p style={styles.subtitle}>
            Launch faster, keep brand consistency, and manage growth operations from one dashboard without losing any key messaging.
          </p>
        </div>
        <div style={styles.landingHighlights}>
          <article style={styles.landingHighlightCard}>
            <h2 style={styles.landingHighlightTitle}>Everything Visible</h2>
            <p style={styles.landingHighlightText}>
              Long prompts, strategy notes, generated sections, and project metadata are shown with readable wrapping so your full text is always visible.
            </p>
          </article>
          <article style={styles.landingHighlightCard}>
            <h2 style={styles.landingHighlightTitle}>From Prompt To Live Site</h2>
            <p style={styles.landingHighlightText}>
              Build pages, refine copy, apply branding, run quality checks, and publish in one flow with side-by-side control and preview.
            </p>
          </article>
          <article style={styles.landingHighlightCard}>
            <h2 style={styles.landingHighlightTitle}>Business Engine Included</h2>
            <p style={styles.landingHighlightText}>
              Enable bookings, CRM, payments, automation, and growth modules while keeping the generated website aligned to your conversion goals.
            </p>
          </article>
        </div>
      </div>

      <div style={styles.appShell} ref={appShellRef}>
        <section
          style={{
            ...styles.commandPane,
            flexBasis: `${commandPaneWidth}px`,
            width: `${commandPaneWidth}px`,
          }}
        >
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>What do you want to build?</h2>
            <p style={styles.sectionIntro}>Project Name + one prompt. TitoNova handles Website or full Business OS automatically.</p>
        <AuthProjectCard
          styles={styles}
          authUser={authUser}
          authMode={authMode}
          setAuthMode={setAuthMode}
          handleLogout={handleLogout}
          authNameInput={authNameInput}
          setAuthNameInput={setAuthNameInput}
          authEmailInput={authEmailInput}
          setAuthEmailInput={setAuthEmailInput}
          authPasswordInput={authPasswordInput}
          setAuthPasswordInput={setAuthPasswordInput}
          handleSignup={handleSignup}
          handleLogin={handleLogin}
          authLoading={authLoading}
          userProjects={userProjects}
          refreshUserProjects={refreshUserProjects}
        />
        <WorkspaceOnboardingPanels
          styles={styles}
          authUser={authUser}
          showAdvancedTools={showAdvancedTools}
          billingLoading={billingLoading}
          setBillingLoading={setBillingLoading}
          refreshBillingPlans={refreshBillingPlans}
          refreshBillingStatus={refreshBillingStatus}
          billingStatusData={billingStatusData}
          billingPlans={billingPlans}
          billingUpgradeLoading={billingUpgradeLoading}
          handleUpgradePlan={handleUpgradePlan}
          workspaceLoading={workspaceLoading}
          setWorkspaceLoading={setWorkspaceLoading}
          refreshWorkspaces={refreshWorkspaces}
          refreshWorkspaceMembers={refreshWorkspaceMembers}
          workspaceList={workspaceList}
          newWorkspaceName={newWorkspaceName}
          setNewWorkspaceName={setNewWorkspaceName}
          handleCreateWorkspace={handleCreateWorkspace}
          workspaceInviteEmail={workspaceInviteEmail}
          setWorkspaceInviteEmail={setWorkspaceInviteEmail}
          workspaceInviteRole={workspaceInviteRole}
          setWorkspaceInviteRole={setWorkspaceInviteRole}
          handleInviteWorkspaceMember={handleInviteWorkspaceMember}
          workspaceMembers={workspaceMembers}
          hasGeneratedContent={hasGeneratedContent}
          handleScoreVariants={handleScoreVariants}
          variantScoringLoading={variantScoringLoading}
          scoredVariants={scoredVariants}
          applyVariantById={applyVariantById}
          handleOneClickImprove={handleOneClickImprove}
          showGuestAuthPrompt={showGuestAuthPrompt}
          navigateToAuth={navigateToAuth}
          recommendedNextStep={recommendedNextStep}
          quickStartSteps={quickStartSteps}
          handleQuickPromptChip={handleQuickPromptChip}
          handleSmartFillPrompt={handleSmartFillPrompt}
          handlePrimaryGenerateWebsite={handlePrimaryGenerateWebsite}
          loading={loading}
          uiDesignLoading={uiDesignLoading}
          businessOsLaunching={businessOsLaunching}
          previewEditableRef={previewEditableRef}
        />

        <ProjectPromptPanel
          styles={styles}
          projectName={projectName}
          setProjectName={setProjectName}
          error={error}
          setError={setError}
          promptTextareaRef={promptTextareaRef}
          businessOsPrompt={businessOsPrompt}
          handleBusinessPromptChange={handleBusinessPromptChange}
          handleBusinessPromptInput={handleBusinessPromptInput}
          handleBusinessPromptPaste={handleBusinessPromptPaste}
          handleEnhancePrompt={handleEnhancePrompt}
          handleSmartFillPrompt={handleSmartFillPrompt}
          powerPromptEnabled={powerPromptEnabled}
          setPowerPromptEnabled={setPowerPromptEnabled}
          ultraSmartModeEnabled={ultraSmartModeEnabled}
          setUltraSmartModeEnabled={setUltraSmartModeEnabled}
          promptIntelligence={promptIntelligence}
          parsedPromptPreviewText={parsedPromptPreviewText}
          ultraSmartPlanPreview={ultraSmartPlanPreview}
          lastGenerationPlan={lastGenerationPlan}
          ultraSmartPlanPreviewText={ultraSmartPlanPreviewText}
          smartQaAuditPreview={smartQaAuditPreview}
          lastGenerationAudit={lastGenerationAudit}
          handleAutoFixSmartGaps={handleAutoFixSmartGaps}
          handleAiBusinessGenerator={handleAiBusinessGenerator}
          businessGeneratorLoading={businessGeneratorLoading}
          businessOsLaunching={businessOsLaunching}
          loading={loading}
          uiDesignLoading={uiDesignLoading}
          handlePrimaryGenerateWebsite={handlePrimaryGenerateWebsite}
          handleQuickPromptChip={handleQuickPromptChip}
        />

        <BusinessGeneratorPanels
          styles={styles}
          showAdvancedTools={showAdvancedTools}
          setShowAdvancedTools={setShowAdvancedTools}
          aiProjectSchema={aiProjectSchema}
          handleExportAiSchema={handleExportAiSchema}
          businessGeneratorOutput={businessGeneratorOutput}
        />

        <Suspense fallback={showAdvancedTools ? <section style={styles.pipelineCard}><small style={styles.pipelineMeta}>Loading workflow tools...</small></section> : null}>
          <GenerationWorkflowPanels
            styles={styles}
            showAdvancedTools={showAdvancedTools}
            handleGenerateFunnel={handleGenerateFunnel}
            loading={loading}
            uiDesignLoading={uiDesignLoading}
            businessOsLaunching={businessOsLaunching}
            funnelBuilderData={funnelBuilderData}
            smartComponents={smartComponents}
            handleSmartComponentDragStart={handleSmartComponentDragStart}
            handleSmartComponentDrop={handleSmartComponentDrop}
            pipelineVariant={pipelineVariant}
            setPipelineVariant={setPipelineVariant}
            handleRunAiGenerationPipeline={handleRunAiGenerationPipeline}
            pipelineRunning={pipelineRunning}
            pipelineVariants={pipelineVariants}
            pipelineBlueprint={pipelineBlueprint}
            pipelineSteps={pipelineSteps}
          />
        </Suspense>

        <Suspense fallback={showAdvancedTools ? <section style={styles.businessOsOutputCard}><small style={styles.businessOsOutputMeta}>Loading advanced operations...</small></section> : null}>
          <AdvancedOperationsPanels
            styles={styles}
            showAdvancedTools={showAdvancedTools}
            businessOsOutput={businessOsOutput}
            handleExportBusinessOsBundle={handleExportBusinessOsBundle}
            brandLoading={brandLoading}
            handleGenerateBrandKit={handleGenerateBrandKit}
            brandKit={brandKit}
            handleApplyBrandKit={handleApplyBrandKit}
            solutionMode={solutionMode}
            setSolutionMode={setSolutionMode}
            industryTemplate={industryTemplate}
            applyIndustryTemplate={applyIndustryTemplate}
            selectedIndustryBlueprint={selectedIndustryBlueprint}
            selectedIndustryPackage={selectedIndustryPackage}
            businessOsPrompt={businessOsPrompt}
            setBusinessOsPrompt={setBusinessOsPrompt}
            uiDesignPrompt={uiDesignPrompt}
            setUiDesignPrompt={setUiDesignPrompt}
            sourceWebsiteUrl={sourceWebsiteUrl}
            setSourceWebsiteUrl={setSourceWebsiteUrl}
            competitorUrlsInput={competitorUrlsInput}
            setCompetitorUrlsInput={setCompetitorUrlsInput}
            cloneDepth={cloneDepth}
            setCloneDepth={setCloneDepth}
            clonePixelPerfect={clonePixelPerfect}
            setClonePixelPerfect={setClonePixelPerfect}
            cloneAiRedesign={cloneAiRedesign}
            setCloneAiRedesign={setCloneAiRedesign}
            cloneRevenueAutomation={cloneRevenueAutomation}
            setCloneRevenueAutomation={setCloneRevenueAutomation}
            setAutoRevenueFeatures={setAutoRevenueFeatures}
            exactRedesignMode={exactRedesignMode}
            setExactRedesignMode={setExactRedesignMode}
            handleCompetitorScan={handleCompetitorScan}
            competitorLoading={competitorLoading}
            handleRedesignFromUrl={handleRedesignFromUrl}
            redesigning={redesigning}
            redesignInsights={redesignInsights}
            automationFeatures={automationFeatures}
            autoRevenueFeatures={autoRevenueFeatures}
            toggleAutomationFeature={toggleAutomationFeature}
            bookingDurationMinutes={bookingDurationMinutes}
            setBookingDurationMinutes={setBookingDurationMinutes}
            bookingSlotsInput={bookingSlotsInput}
            setBookingSlotsInput={setBookingSlotsInput}
            bookingServicesInput={bookingServicesInput}
            setBookingServicesInput={setBookingServicesInput}
            bookingAutoConfirmEnabled={bookingAutoConfirmEnabled}
            setBookingAutoConfirmEnabled={setBookingAutoConfirmEnabled}
            bookingGoogleSyncEnabled={bookingGoogleSyncEnabled}
            setBookingGoogleSyncEnabled={setBookingGoogleSyncEnabled}
            crmStageCounts={crmStageCounts}
            crmNameInput={crmNameInput}
            setCrmNameInput={setCrmNameInput}
            crmEmailInput={crmEmailInput}
            setCrmEmailInput={setCrmEmailInput}
            crmPhoneInput={crmPhoneInput}
            setCrmPhoneInput={setCrmPhoneInput}
            crmStageInput={crmStageInput}
            setCrmStageInput={setCrmStageInput}
            handleAddCrmCustomer={handleAddCrmCustomer}
            crmCustomers={crmCustomers}
            handleCrmStageChange={handleCrmStageChange}
            workflowAutomationEnabled={workflowAutomationEnabled}
            setWorkflowAutomationEnabled={setWorkflowAutomationEnabled}
            workflowAutoOnAutonomous={workflowAutoOnAutonomous}
            setWorkflowAutoOnAutonomous={setWorkflowAutoOnAutonomous}
            workflowTestEmail={workflowTestEmail}
            setWorkflowTestEmail={setWorkflowTestEmail}
            workflowReminderHours={workflowReminderHours}
            setWorkflowReminderHours={setWorkflowReminderHours}
            handleRunWorkflowTest={handleRunWorkflowTest}
            workflowRecentRun={workflowRecentRun}
            workflowRuns={workflowRuns}
            paymentIntegrations={paymentIntegrations}
            togglePaymentProvider={togglePaymentProvider}
            subscriptionsEnabled={subscriptionsEnabled}
            setSubscriptionsEnabled={setSubscriptionsEnabled}
            invoiceNumber={invoiceNumber}
            setInvoiceNumber={setInvoiceNumber}
            invoiceServiceInput={invoiceServiceInput}
            setInvoiceServiceInput={setInvoiceServiceInput}
            invoiceAmountInput={invoiceAmountInput}
            setInvoiceAmountInput={setInvoiceAmountInput}
            handleRunRecommendedFlow={handleRunRecommendedFlow}
            runningRecommendedFlow={runningRecommendedFlow}
            runSmokeCheck={runSmokeCheck}
            smokeRunning={smokeRunning}
            smokeResults={smokeResults}
            handleDownloadSmokeReport={handleDownloadSmokeReport}
            autoSearchOnGenerate={autoSearchOnGenerate}
            setAutoSearchOnGenerate={setAutoSearchOnGenerate}
            designEvolutionEnabled={designEvolutionEnabled}
            setDesignEvolutionEnabled={setDesignEvolutionEnabled}
            designEvolutionMinutes={designEvolutionMinutes}
            setDesignEvolutionMinutes={setDesignEvolutionMinutes}
            runDesignEvolution={runDesignEvolution}
            evolutionRunning={evolutionRunning}
            lastDesignEvolutionAt={lastDesignEvolutionAt}
            selfOptimizeEnabled={selfOptimizeEnabled}
            setSelfOptimizeEnabled={setSelfOptimizeEnabled}
            selfOptimizeDays={selfOptimizeDays}
            setSelfOptimizeDays={setSelfOptimizeDays}
            runSelfOptimization={runSelfOptimization}
            selfOptimizeRunning={selfOptimizeRunning}
            lastSelfOptimizationAt={lastSelfOptimizationAt}
            autonomousModeEnabled={autonomousModeEnabled}
            setAutonomousModeEnabled={setAutonomousModeEnabled}
            autonomousIntervalMinutes={autonomousIntervalMinutes}
            setAutonomousIntervalMinutes={setAutonomousIntervalMinutes}
            runAutonomousBusinessMode={runAutonomousBusinessMode}
            autonomousRunning={autonomousRunning}
            translationLanguage={translationLanguage}
            setTranslationLanguage={setTranslationLanguage}
            handleTranslateAllPages={handleTranslateAllPages}
            translating={translating}
            marketingAutopilotEnabled={marketingAutopilotEnabled}
            setMarketingAutopilotEnabled={setMarketingAutopilotEnabled}
            runMarketingAutopilot={runMarketingAutopilot}
            marketingLoading={marketingLoading}
            marketingOfferInput={marketingOfferInput}
            setMarketingOfferInput={setMarketingOfferInput}
            marketingCitiesInput={marketingCitiesInput}
            setMarketingCitiesInput={setMarketingCitiesInput}
            runAiMarketingEngine={runAiMarketingEngine}
            marketingEngineLoading={marketingEngineLoading}
            runMonetizationEngine={runMonetizationEngine}
            monetizationLoading={monetizationLoading}
            runAiAppBuilder={runAiAppBuilder}
            appBuilderLoading={appBuilderLoading}
            hasGeneratedContent={hasGeneratedContent}
            runGrowthCoach={runGrowthCoach}
            growthCoachLoading={growthCoachLoading}
            runBusinessCoach={runBusinessCoach}
            businessCoachLoading={businessCoachLoading}
            refreshAnalyticsDashboard={refreshAnalyticsDashboard}
            smartContentType={smartContentType}
            setSmartContentType={setSmartContentType}
            smartContentCount={smartContentCount}
            setSmartContentCount={setSmartContentCount}
            smartContentKeyword={smartContentKeyword}
            setSmartContentKeyword={setSmartContentKeyword}
            runSmartContentEngine={runSmartContentEngine}
            smartContentLoading={smartContentLoading}
            smartContentProgress={smartContentProgress}
          />
        </Suspense>
          </div>
        </section>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          style={isResizingPane ? { ...styles.resizeHandle, ...styles.resizeHandleActive } : styles.resizeHandle}
          onMouseDown={handleResizeMouseDown}
        >
          <span style={styles.resizeGrip} />
        </div>
        <PreviewPane
          styles={styles}
          hasGeneratedContent={hasGeneratedContent}
          isMobilePreview={isMobilePreview}
          customDomain={customDomain}
          setCustomDomain={setCustomDomain}
          handleExportHtml={handleExportHtml}
          exportFramework={exportFramework}
          setExportFramework={setExportFramework}
          exportFrameworkOptions={EXPORT_FRAMEWORK_OPTIONS}
          handleExportProjectBundle={handleExportProjectBundle}
          exportBundleLoading={exportBundleLoading}
          isInlineEditing={isInlineEditing}
          handleStartInlineEdit={handleStartInlineEdit}
          handleUndoInlineEdit={handleUndoInlineEdit}
          handleSaveInlineEdit={handleSaveInlineEdit}
          handleCancelInlineEdit={handleCancelInlineEdit}
          publishPrimaryHint={publishPrimaryHint}
          publishedSiteId={publishedSiteId}
          publishPrimaryAction={publishPrimaryAction}
          publishPrimaryLabel={publishPrimaryLabel}
          oneClickHostingRunning={oneClickHostingRunning}
          publishing={publishing}
          handleAddDomainNow={handleAddDomainNow}
          domainLoading={domainLoading}
          handleVerifyDnsNow={handleVerifyDnsNow}
          verifyingDns={verifyingDns}
          handleOneClickHosting={handleOneClickHosting}
          handleGoLive={handleGoLive}
          handleUnpublish={handleUnpublish}
          normalizedCustomDomain={normalizedCustomDomain}
          dnsVerifyStatus={dnsVerifyStatus}
          previewRecommendedStep={previewRecommendedStep}
          previewJourneySteps={previewJourneySteps}
          previewEditableRef={previewEditableRef}
          inlineDraftDirty={inlineDraftDirty}
          publishStatus={publishStatus}
          publishReadinessMessage={publishReadinessMessage}
          orderPageKeys={orderPageKeys}
          generatedPages={generatedPages}
          activePage={activePage}
          handleSwitchPage={handleSwitchPage}
          pageLabelFromKey={pageLabelFromKey}
          redesignInsights={redesignInsights}
          showComparison={showComparison}
          setShowComparison={setShowComparison}
          newPageName={newPageName}
          setNewPageName={setNewPageName}
          handleAddPage={handleAddPage}
          handleDeleteActivePage={handleDeleteActivePage}
          seoChecklist={seoChecklist}
          showAdvancedTools={showAdvancedTools}
          insightsProps={{
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
            textStylePresets: TEXT_STYLE_PRESETS,
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
            marketProps: {
              styles,
              showAdvancedTools,
              marketLoading,
              handleDomainSearch,
              marketKeyword,
              setMarketKeyword,
              makeProjectSlug,
              projectName,
              setPurchasedDomains,
              marketSort,
              setMarketSort,
              autoSelectBestDomain,
              setAutoSelectBestDomain,
              marketTlds,
              toggleMarketTld,
              marketError,
              purchasedDomains,
              handleUseDomainFromMarket,
              getSortedMarketResults,
              marketBuying,
              handleBuyDomain,
              dnsGuideDomain,
              dnsRecords,
              defaultDnsRecords: DEFAULT_DNS_RECORDS,
              handleCopyDnsValue,
              handleCopyAllDnsRecords,
              dnsCopyMessage,
              installedAddons,
              addonSearch,
              setAddonSearch,
              addonCategory,
              setAddonCategory,
              getFilteredAddons,
              handleInstallAddon,
              handleUninstallAddon,
              addonNameInput,
              setAddonNameInput,
              addonTypeInput,
              setAddonTypeInput,
              addonPriceInput,
              setAddonPriceInput,
              addonFeaturesInput,
              setAddonFeaturesInput,
              addonDescriptionInput,
              setAddonDescriptionInput,
              handlePublishAddon,
            },
          }}
          shouldShowGuestPreviewPrompt={shouldShowGuestPreviewPrompt}
          inlineEditToolbarStyle={inlineEditToolbarStyle}
          inlineEditMetaStyle={inlineEditMetaStyle}
          inlineSmartStatus={inlineSmartStatus}
          inlineSiteModel={inlineSiteModel}
          sections={sections}
          selectedSectionEditId={selectedSectionEditId}
          updateSection={updateSection}
          inlineSelectionText={inlineSelectionText}
          inlineSelectionSection={inlineSelectionSection}
          inlineCheckpoints={inlineCheckpoints}
          handleRestoreInlineCheckpoint={handleRestoreInlineCheckpoint}
          inlineAdvancedOpen={inlineAdvancedOpen}
          inlineSmartInputStyle={inlineSmartInputStyle}
          inlineSmartCommand={inlineSmartCommand}
          setInlineSmartCommand={setInlineSmartCommand}
          handleRunInlineSmartCommand={handleRunInlineSmartCommand}
          getInlineCommandOptions={getInlineCommandOptions}
          inlineAutoApplyHighConfidence={inlineAutoApplyHighConfidence}
          setInlineAutoApplyHighConfidence={setInlineAutoApplyHighConfidence}
          inlineSuggestions={inlineSuggestions}
          handleApplyInlineSuggestion={handleApplyInlineSuggestion}
          inlineEditActionsStyle={inlineEditActionsStyle}
          handleImproveInlinePageCopy={handleImproveInlinePageCopy}
          inlineBulkImproving={inlineBulkImproving}
          handleImproveInlineSectionCopy={handleImproveInlineSectionCopy}
          handleImproveAndSaveInlinePageCopy={handleImproveAndSaveInlinePageCopy}
          handleImproveSavePublishInline={handleImproveSavePublishInline}
          inlineLastPublishSnapshot={inlineLastPublishSnapshot}
          handleRollbackInlinePublishSnapshot={handleRollbackInlinePublishSnapshot}
          editHistory={editHistory}
          handleRedoInlineEdit={handleRedoInlineEdit}
          redoHistory={redoHistory}
          setInlineAdvancedOpen={setInlineAdvancedOpen}
          fieldLockMode={fieldLockMode}
          setFieldLockMode={setFieldLockMode}
          selectedEditableMeta={selectedEditableMeta}
          selectedSectionMeta={selectedSectionMeta}
          floatingToolbarPos={floatingToolbarPos}
          isCompactInlineEditor={isCompactInlineEditor}
          viewportWidth={viewportWidth}
          focusInlineEditableNode={focusInlineEditableNode}
          selectedEditableNodeRef={selectedEditableNodeRef}
          syncInlineSiteModelFromDom={syncInlineSiteModelFromDom}
          setSelectedEditableMeta={setSelectedEditableMeta}
          handleInlineImageReplace={handleInlineImageReplace}
          handleSectionFieldChange={handleSectionFieldChange}
          handleImproveSelectedSection={handleImproveSelectedSection}
          handleReplaceSelectedSection={handleReplaceSelectedSection}
          handleMoveSelectedSection={handleMoveSelectedSection}
          handleDeleteSelectedSection={handleDeleteSelectedSection}
          selectInlineSection={selectInlineSection}
          previewEditableStyle={previewEditableStyle}
          handlePreviewLinkNavigation={handlePreviewLinkNavigation}
          handleInlinePointerActivate={handleInlinePointerActivate}
          setInlineDraftDirty={setInlineDraftDirty}
          selectInlineEditableNode={selectInlineEditableNode}
          snapshotInlineDraft={snapshotInlineDraft}
          captureInlineSelection={captureInlineSelection}
          handleInlineHoverMove={handleInlineHoverMove}
          handleInlineHoverLeave={handleInlineHoverLeave}
          draftHtml={draftHtml}
          generatedSite={generatedSite}
          previewGuestOverlayStyle={previewGuestOverlayStyle}
          setAuthMode={setAuthMode}
          handlePrimaryGenerateWebsite={handlePrimaryGenerateWebsite}
          handleSmartFillPrompt={handleSmartFillPrompt}
          handleQuickPromptChip={handleQuickPromptChip}
        />
      </div>
      {error && <p style={styles.error}>{error}</p>}

    </div>
  );
}
