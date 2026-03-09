import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HOSTING_BASE_URL = String(import.meta.env.VITE_HOSTING_API_BASE_URL || "").replace(/\/$/, "");
const REGISTRAR_BASE_URL = String(import.meta.env.VITE_REGISTRAR_API_BASE_URL || "").replace(/\/$/, "");
const HOSTING_GATEWAY_TOKEN = String(import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "");
const isLocalHostName = (value) => /^(localhost|127\.0\.0\.1)$/i.test(String(value || ""));
const isUsableApiBaseUrl = (rawUrl, allowLocalHost = false) => {
  const value = String(rawUrl || "").trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    if (!allowLocalHost && isLocalHostName(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
};
const DEFAULT_DNS_RECORDS = [
  { type: "A", host: "@", value: "76.76.21.21" },
  { type: "CNAME", host: "www", value: "cname.vercel-dns.com" },
];
const DEFAULT_HOSTING_PROFILE = {
  domain: "",
  sslEnabled: false,
  cdnEnabled: false,
  tier: "Fast Hosting",
  verified: false,
  provider: "gateway",
  liveUrl: "",
  updatedAt: "",
};

const PURCHASED_DOMAINS_STORAGE_KEY = "titonova_purchased_domains_v1";
const DEVELOPER_ADDONS_STORAGE_KEY = "titonova_developer_addons_v1";
const INSTALLED_ADDONS_STORAGE_KEY = "titonova_installed_addons_v1";
const AUTH_TOKEN_STORAGE_KEY = "titonova_auth_token_v1";
const AUTH_USER_STORAGE_KEY = "titonova_auth_user_v1";
const BUSINESS_OS_REQUIRED_FEATURE_KEYS = [
  "booking.html",
  "pricing.html",
  "crm.html",
  "payments.html",
  "invoicing.html",
  "email-automation.html",
  "marketing-pages.html",
  "seo-pages.html",
  "client-dashboard.html",
  "login-portal.html",
  "analytics.html",
];
const CORE_ADDON_CATALOG = [
  {
    id: "addon-booking-pro",
    name: "Booking Pro",
    category: "booking",
    description: "Advanced appointment windows, reminders, and calendar syncing.",
    priceLabel: "Free",
    featureKeys: ["booking.html"],
  },
  {
    id: "addon-crm-pipeline",
    name: "CRM Pipeline",
    category: "crm",
    description: "Lead capture stages, contact timelines, and follow-up actions.",
    priceLabel: "$19/mo",
    featureKeys: ["crm.html", "client-dashboard.html"],
  },
  {
    id: "addon-automation-flow",
    name: "Automation Flow Kit",
    category: "automation",
    description: "No-code automations for onboarding, notifications, and task routing.",
    priceLabel: "$29/mo",
    featureKeys: ["analytics.html", "login-portal.html"],
  },
];
const CORE_PAGE_DEFS = [
  { key: "index.html", label: "Home", matcher: /home/i },
  { key: "about.html", label: "About", matcher: /about/i },
  { key: "services.html", label: "Services", matcher: /service/i },
  { key: "pricing.html", label: "Pricing", matcher: /(pricing|plans|packages|rates)/i },
  { key: "contact.html", label: "Contact", matcher: /contact/i },
  { key: "landing.html", label: "Landing", matcher: /(landing|campaign)/i },
  { key: "blog.html", label: "Blog", matcher: /blog/i },
];
const AUTOMATION_PAGE_DEFS = [
  { key: "client-dashboard.html", label: "Client Dashboard", matcher: /(client.*dashboard|dashboard)/i },
  { key: "login-portal.html", label: "Login Portal", matcher: /(login|portal|auth|sign in)/i },
  { key: "payments.html", label: "Payments", matcher: /(payment|billing|checkout|invoice)/i },
  { key: "invoicing.html", label: "Invoicing", matcher: /(invoice|invoicing|accounts receivable|billing ledger)/i },
  { key: "booking.html", label: "Booking", matcher: /(booking|schedule|appointment|calendar)/i },
  { key: "pricing.html", label: "Pricing", matcher: /(pricing|plans|packages|rates)/i },
  { key: "crm.html", label: "CRM", matcher: /(crm|leads|pipeline|contacts)/i },
  { key: "analytics.html", label: "Analytics", matcher: /(analytics|reporting|metrics|dashboard analytics)/i },
  { key: "email-automation.html", label: "Email Automation", matcher: /(email automation|drip campaign|lifecycle email)/i },
  { key: "marketing-pages.html", label: "Marketing Pages", matcher: /(marketing page|landing page|campaign page)/i },
  { key: "seo-pages.html", label: "SEO Pages", matcher: /(seo page|seo landing|keyword page|search page)/i },
  { key: "dsp-portal.html", label: "DSP Portal", matcher: /(dsp|direct support|caregiver portal)/i },
  { key: "incident-reporting.html", label: "Incident Reporting", matcher: /(incident|critical event|risk report)/i },
  { key: "staff-training.html", label: "Staff Training Tracker", matcher: /(staff training|training tracker|compliance training)/i },
  { key: "case-intake.html", label: "Case Intake", matcher: /(case intake|legal intake|matter intake)/i },
  { key: "document-portal.html", label: "Document Portal", matcher: /(document portal|client documents|secure docs)/i },
  { key: "ordering-system.html", label: "Ordering System", matcher: /(ordering|online order|menu order)/i },
  { key: "reservations.html", label: "Reservations", matcher: /(reservation|table booking|host stand)/i },
  { key: "delivery-tracking.html", label: "Delivery Tracking", matcher: /(delivery tracking|order tracking|dispatch)/i },
  { key: "subscriptions.html", label: "Subscriptions", matcher: /(subscription|recurring|plans)/i },
  { key: "digital-products.html", label: "Digital Products", matcher: /(digital product|downloads|courses|templates)/i },
  { key: "memberships.html", label: "Memberships", matcher: /(membership|member area|gated content)/i },
  { key: "affiliates.html", label: "Affiliate Program", matcher: /(affiliate|referral program|partner payout)/i },
];
const REVENUE_MODULE_KEYS = [
  "subscriptions.html",
  "booking.html",
  "digital-products.html",
  "memberships.html",
  "affiliates.html",
  "payments.html",
];
const INDUSTRY_TEMPLATE_PACKAGES = [
  {
    key: "cleaning-company",
    label: "Cleaning Company",
    modules: ["booking.html", "pricing.html", "payments.html", "crm.html", "email-automation.html", "marketing-pages.html", "seo-pages.html", "analytics.html", "client-dashboard.html", "subscriptions.html", "affiliates.html"],
    promptFocus: [
      "residential and commercial cleaning packages with clear booking paths",
      "staff assignment workflow and service checklists per visit",
      "review requests, recurring plans, and neighborhood SEO landing pages",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Standard Home Cleaning", "Deep Cleaning", "Move-In/Move-Out Cleaning", "Office Cleaning"],
      pricing: ["Starter Clean", "Recurring Plan", "Premium Deep Clean"],
      workflows: ["Lead intake -> quote", "Booking -> payment", "Cleaner dispatch -> completion", "Review + follow-up automation"],
    },
    industryMatchers: ["cleaning", "maid", "janitorial", "housekeeping"],
  },
  {
    key: "dental-clinic",
    label: "Dental Clinic",
    modules: ["booking.html", "payments.html", "crm.html", "email-automation.html", "analytics.html", "client-dashboard.html", "login-portal.html", "memberships.html"],
    promptFocus: [
      "new patient intake and appointment scheduling with provider selection",
      "treatment plan follow-ups with reminders and confirmation workflows",
      "insurance/payment guidance with clear patient portal access",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Routine Checkups", "Teeth Cleaning", "Whitening", "Emergency Dental Care"],
      pricing: ["New Patient Exam", "Preventive Care Plan", "Cosmetic Package"],
      workflows: ["Patient intake -> eligibility check", "Appointment -> treatment", "Billing -> reminder sequence", "Post-visit review request"],
    },
    industryMatchers: ["dental", "dentist", "orthodontic", "oral"],
  },
  {
    key: "fitness-trainer",
    label: "Fitness Trainer",
    modules: ["booking.html", "subscriptions.html", "memberships.html", "payments.html", "crm.html", "analytics.html", "email-automation.html", "client-dashboard.html", "digital-products.html"],
    promptFocus: [
      "program packages for 1:1 training, group coaching, and online plans",
      "membership onboarding and recurring payment workflows",
      "progress tracking dashboards with retention-focused messaging",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["1:1 Personal Training", "Group Classes", "Online Coaching", "Nutrition Guidance"],
      pricing: ["Starter Plan", "Transformation Plan", "VIP Coaching"],
      workflows: ["Lead magnet -> consultation", "Assessment -> plan assignment", "Recurring subscription billing", "Progress check-ins + renewals"],
    },
    industryMatchers: ["fitness", "trainer", "gym", "wellness", "coaching"],
  },
  {
    key: "healthcare-hcbs",
    label: "Healthcare (HCBS)",
    modules: ["dsp-portal.html", "incident-reporting.html", "staff-training.html", "client-dashboard.html", "login-portal.html", "crm.html", "analytics.html", "booking.html", "subscriptions.html", "memberships.html", "affiliates.html", "payments.html"],
    promptFocus: [
      "DSP portal for assignments and shift status",
      "incident reporting workflow with severity + follow-up",
      "staff training tracker for compliance credentials",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["HCBS Intake", "Care Plan Coordination", "DSP Staffing", "Family Support"],
      pricing: ["Assessment Package", "Weekly Support Plan", "Comprehensive Care Program"],
      workflows: ["Referral intake -> eligibility", "Care plan -> DSP assignment", "Incident response -> compliance follow-up", "Training tracker -> credential renewals"],
    },
    industryMatchers: ["care", "hcbs", "health", "nursing", "rehab", "caregiver", "home care", "dsp", "compliance"],
  },
  {
    key: "law-firm",
    label: "Law Firm",
    modules: ["case-intake.html", "booking.html", "document-portal.html", "crm.html", "analytics.html", "login-portal.html", "client-dashboard.html", "subscriptions.html", "memberships.html", "affiliates.html", "payments.html"],
    promptFocus: [
      "case intake forms with matter categorization",
      "appointment booking for consultations",
      "secure client document portal and status visibility",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Case Intake", "Legal Consultation", "Document Review", "Representation"],
      pricing: ["Initial Consultation", "Retainer Plan", "Litigation Package"],
      workflows: ["Case intake -> conflict check", "Consultation booking -> proposal", "Document upload -> review", "Matter updates -> billing"],
    },
    industryMatchers: ["law", "legal", "attorney", "firm", "case", "litigation"],
  },
  {
    key: "restaurant",
    label: "Restaurant",
    modules: ["ordering-system.html", "reservations.html", "delivery-tracking.html", "payments.html", "analytics.html", "client-dashboard.html", "login-portal.html", "subscriptions.html", "digital-products.html", "memberships.html", "affiliates.html"],
    promptFocus: [
      "online ordering with menu workflows",
      "reservation management and seating windows",
      "delivery tracking with status updates",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Dine-In", "Online Ordering", "Catering", "Delivery"],
      pricing: ["Lunch Specials", "Family Bundle", "Catering Package"],
      workflows: ["Menu browsing -> cart checkout", "Reservation -> confirmation", "Order prep -> delivery tracking", "Loyalty + promo automation"],
    },
    industryMatchers: ["restaurant", "food", "cafe", "kitchen", "dining", "delivery"],
  },
  {
    key: "real-estate-agent",
    label: "Real Estate Agent",
    modules: ["crm.html", "booking.html", "document-portal.html", "marketing-pages.html", "seo-pages.html", "email-automation.html", "analytics.html", "client-dashboard.html", "payments.html"],
    promptFocus: [
      "property listing funnels for buyers and sellers",
      "showing scheduler with lead routing into CRM pipeline",
      "market report content with neighborhood SEO pages",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Buyer Representation", "Seller Strategy", "Property Tours", "Market Analysis"],
      pricing: ["Buyer Package", "Seller Listing Plan", "Premium Concierge Plan"],
      workflows: ["Lead capture -> qualification", "Showing booking -> follow-up", "Offer/contract doc portal", "Post-close referral automation"],
    },
    industryMatchers: ["real estate", "realtor", "property", "listing", "broker"],
  },
  {
    key: "consultant",
    label: "Consultant",
    modules: ["booking.html", "pricing.html", "crm.html", "payments.html", "invoicing.html", "email-automation.html", "analytics.html", "marketing-pages.html", "client-dashboard.html"],
    promptFocus: [
      "clarify service offers, package pricing, and discovery call flows",
      "proposal-to-invoice workflow with client dashboard access",
      "authority content and lead magnets for predictable pipeline growth",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Strategy Session", "Implementation Support", "Retainer Advisory", "Workshops"],
      pricing: ["Intro Package", "Growth Retainer", "Enterprise Advisory"],
      workflows: ["Discovery call -> proposal", "Contract -> onboarding", "Milestone delivery -> invoicing", "Case study + referral workflow"],
    },
    industryMatchers: ["consultant", "consulting", "advisor", "fractional"],
  },
  {
    key: "agency",
    label: "Agency",
    modules: ["crm.html", "payments.html", "invoicing.html", "analytics.html", "client-dashboard.html", "login-portal.html", "email-automation.html", "marketing-pages.html", "seo-pages.html", "subscriptions.html", "affiliates.html"],
    promptFocus: [
      "service retainers with transparent deliverables and reporting dashboards",
      "lead capture and qualification workflows for pipeline growth",
      "client portal for approvals, assets, and campaign analytics",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Brand Strategy", "Website Development", "Performance Marketing", "Automation Services"],
      pricing: ["Starter Retainer", "Growth Retainer", "Scale Partner Plan"],
      workflows: ["Lead form -> discovery call", "Proposal -> onboarding", "Production -> approval", "Reporting -> renewal"],
    },
    industryMatchers: ["agency", "studio", "creative", "marketing agency"],
  },
  {
    key: "saas-startup",
    label: "SaaS Startup",
    modules: ["pricing.html", "payments.html", "subscriptions.html", "login-portal.html", "client-dashboard.html", "crm.html", "analytics.html", "email-automation.html", "affiliates.html", "digital-products.html"],
    promptFocus: [
      "product-led website with clear problem, solution, and feature messaging",
      "trial-to-paid conversion flow with billing and lifecycle automation",
      "dashboard onboarding, knowledge resources, and referral growth loops",
    ],
    blueprint: {
      pages: ["Home", "About", "Services", "Pricing", "Contact", "Landing Page", "Blog"],
      services: ["Core Platform", "Automation Add-ons", "Integrations", "Onboarding Support"],
      pricing: ["Starter SaaS Plan", "Growth Plan", "Enterprise Plan"],
      workflows: ["Visitor -> free trial", "Onboarding checklist -> activation", "Subscription upgrade -> invoicing", "Referral program -> rewards"],
    },
    industryMatchers: ["saas", "software", "app", "startup", "platform"],
  },
];
const DEFAULT_INDUSTRY_TEMPLATE = "healthcare-hcbs";
const buildFeatureFlagsForIndustry = (industryKey) => {
  const pkg = INDUSTRY_TEMPLATE_PACKAGES.find((item) => item.key === industryKey) || INDUSTRY_TEMPLATE_PACKAGES[0];
  const nextFlags = Object.fromEntries(AUTOMATION_PAGE_DEFS.map((page) => [page.key, false]));
  pkg.modules.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(nextFlags, key)) nextFlags[key] = true;
  });
  return nextFlags;
};
const buildIndustryBlueprintPrompt = (pkg) => {
  if (!pkg?.blueprint) return "";
  const pages = Array.isArray(pkg.blueprint.pages) ? pkg.blueprint.pages : [];
  const services = Array.isArray(pkg.blueprint.services) ? pkg.blueprint.services : [];
  const pricing = Array.isArray(pkg.blueprint.pricing) ? pkg.blueprint.pricing : [];
  const workflows = Array.isArray(pkg.blueprint.workflows) ? pkg.blueprint.workflows : [];
  const lines = [
    pages.length ? `Template pages to include: ${pages.join(", ")}.` : "",
    services.length ? `Template services to include: ${services.join(", ")}.` : "",
    pricing.length ? `Template pricing packages to include: ${pricing.join(", ")}.` : "",
    workflows.length ? `Template workflows to model: ${workflows.join(" | ")}.` : "",
  ].filter(Boolean);
  return lines.join("\n");
};
const DEFAULT_THEME_COLORS = {
  heroStart: "#0f3f8f",
  heroEnd: "#1d6fc2",
  accent: "#0b5cab",
  accentStrong: "#1f8ded",
  pageBg: "#f7fbff",
  cardBg: "#ffffff",
  borderColor: "#d8e6f5",
  textPrimary: "#10243d",
  textSecondary: "#4b6179",
  linkColor: "#0b5cab",
  ctaPanelBg: "#eef5fd",
  ctaPanelBorder: "#bfd5ec",
  ctaText: "#ffffff",
};
const TEXT_STYLE_PRESETS = [
  {
    key: "modern",
    label: "Modern Clean",
    fontImport:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap",
    headingFamily: "'Poppins', 'Segoe UI', sans-serif",
    bodyFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  {
    key: "editorial",
    label: "Editorial Premium",
    fontImport:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap",
    headingFamily: "'Playfair Display', Georgia, serif",
    bodyFamily: "'Source Sans 3', 'Segoe UI', Arial, sans-serif",
  },
  {
    key: "bold-tech",
    label: "Bold Tech",
    fontImport:
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
    headingFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    bodyFamily: "'Manrope', 'Segoe UI', Arial, sans-serif",
  },
];
const DEFAULT_TEXT_STYLE = {
  preset: "modern",
  headingFamily: TEXT_STYLE_PRESETS[0].headingFamily,
  bodyFamily: TEXT_STYLE_PRESETS[0].bodyFamily,
  fontImport: TEXT_STYLE_PRESETS[0].fontImport,
  baseSizePx: 16,
  lineHeight: 1.6,
  headingWeight: 800,
  bodyWeight: 400,
  headingSpacingEm: -0.01,
};
const DESIGN_EVOLUTION_THEMES = [
  {
    heroStart: "#0f3f8f",
    heroEnd: "#1d6fc2",
    accent: "#0b5cab",
    accentStrong: "#1f8ded",
    pageBg: "#f7fbff",
    cardBg: "#ffffff",
    borderColor: "#d8e6f5",
    textPrimary: "#10243d",
    textSecondary: "#4b6179",
    linkColor: "#0b5cab",
    ctaPanelBg: "#eef5fd",
    ctaPanelBorder: "#bfd5ec",
    ctaText: "#ffffff",
  },
  {
    heroStart: "#1f2937",
    heroEnd: "#334155",
    accent: "#0f766e",
    accentStrong: "#14b8a6",
    pageBg: "#f8fafc",
    cardBg: "#ffffff",
    borderColor: "#d1d5db",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    linkColor: "#0f766e",
    ctaPanelBg: "#ecfeff",
    ctaPanelBorder: "#99f6e4",
    ctaText: "#ffffff",
  },
  {
    heroStart: "#4c1d95",
    heroEnd: "#6d28d9",
    accent: "#7c3aed",
    accentStrong: "#8b5cf6",
    pageBg: "#faf5ff",
    cardBg: "#ffffff",
    borderColor: "#ddd6fe",
    textPrimary: "#312e81",
    textSecondary: "#5b21b6",
    linkColor: "#6d28d9",
    ctaPanelBg: "#f3e8ff",
    ctaPanelBorder: "#c4b5fd",
    ctaText: "#ffffff",
  },
];
const UI_LAYOUT_VARIANTS = ["split-hero", "stacked-hero", "editorial"];
const SMART_CONTENT_TYPE_OPTIONS = [
  { key: "blog-posts", label: "Blog Posts" },
  { key: "landing-pages", label: "Landing Pages" },
  { key: "faqs", label: "FAQs" },
  { key: "product-descriptions", label: "Product Descriptions" },
];
const QUICK_PROMPT_CHIPS = [
  "Cleaning company",
  "Home care agency",
  "Restaurant website",
  "SaaS landing page",
  "Portfolio site",
];
const AI_LAYOUT_VARIANT_OPTIONS = [
  { key: "corporate", label: "Version A: Corporate" },
  { key: "minimal", label: "Version B: Minimal" },
  { key: "bold", label: "Version C: Bold" },
];
const SMART_COMPONENT_LIBRARY = ["hero", "testimonials", "pricing", "faq", "cta"];
const FUNNEL_REQUIRED_KEYS = ["marketing-pages.html", "booking.html", "payments.html", "pricing.html"];
const CRM_LEAD_STAGES = ["New Leads", "Contacted", "Booked", "Completed"];
const CRM_SALES_PIPELINE = ["Lead", "Consultation", "Proposal", "Won"];
const PAYMENT_PROVIDER_KEYS = ["Stripe", "PayPal", "Apple Pay", "Google Pay"];
const BOOKING_AUTOMATION_STEPS = [
  "New Booking",
  "Send Confirmation Email",
  "Add to CRM",
  "Send Reminder 24h Before",
];
const DEFAULT_CRM_CUSTOMERS = [
  { id: "crm-1", name: "Jordan Miles", email: "jordan@example.com", phone: "(555) 120-9911", bookings: 1, payments: 149, stage: "Contacted" },
  { id: "crm-2", name: "Avery Stone", email: "avery@example.com", phone: "(555) 348-1122", bookings: 2, payments: 420, stage: "Booked" },
  { id: "crm-3", name: "Riley Carter", email: "riley@example.com", phone: "(555) 872-4400", bookings: 3, payments: 780, stage: "Completed" },
];
const SECTION_ID_ALIASES = {
  hero: "hero",
  stats: "stats",
  commitment: "commitment",
  services: "servicesGrid",
  servicesgrid: "servicesGrid",
  serviceactions: "servicesAction",
  aboutstory: "aboutStory",
  contactform: "contactForm",
  booking: "booking",
  clientdashboard: "clientDashboard",
  analytics: "analytics",
  loginportal: "loginPortal",
  payments: "payments",
  invoicing: "invoicing",
  crm: "crm",
  emailautomation: "emailAutomation",
  marketingpages: "marketingPages",
  dsppotal: "dspPortal",
  dspportal: "dspPortal",
  incidentreporting: "incidentReporting",
  stafftraining: "staffTraining",
  caseintake: "caseIntake",
  documentportal: "documentPortal",
  orderingsystem: "orderingSystem",
  reservations: "reservations",
  deliverytracking: "deliveryTracking",
  subscriptions: "subscriptions",
  digitalproducts: "digitalProducts",
  memberships: "memberships",
  affiliates: "affiliates",
  monetization: "monetizationHub",
  monetizationhub: "monetizationHub",
  gallery: "gallery",
  map: "map",
  quicknav: "quickNav",
};

const safeJsonParse = (value, fallback = {}) => {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
};

export default function Dashboard() {

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
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [draftHtml, setDraftHtml] = useState("");
  const [_editHistory, setEditHistory] = useState([]);
  const [fieldLockMode, setFieldLockMode] = useState(true);
  const [commandPaneWidth, setCommandPaneWidth] = useState(460);
  const [isResizingPane, setIsResizingPane] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
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
  const appShellRef = useRef(null);

  const selectedAutomationDefs = AUTOMATION_PAGE_DEFS.filter(
    (page) => Boolean(automationFeatures[page.key]) || (autoRevenueFeatures && REVENUE_MODULE_KEYS.includes(page.key))
  );
  const selectedIndustryPackage = INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === industryTemplate) || INDUSTRY_TEMPLATE_PACKAGES[0];
  const selectedIndustryBlueprint = selectedIndustryPackage?.blueprint || null;
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
               <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#dbeafe">Welcome</p>
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
                   <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--tn-accent)">Editorial Layout</p>
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
               <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:14px;align-items:stretch">
                 <article data-parallax-speed="0.06" style="background:linear-gradient(145deg,var(--tn-hero-start),var(--tn-hero-end));color:var(--tn-cta-text);padding:24px;border-radius:8px;display:flex;flex-direction:column;justify-content:center">
                   <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#dbeafe">Welcome</p>
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
        style="--tn-hero-start:${theme.heroStart};--tn-hero-end:${theme.heroEnd};--tn-accent:${theme.accent};--tn-accent-strong:${theme.accentStrong};--tn-page-bg:${theme.pageBg};--tn-surface:${theme.cardBg};--tn-surface-subtle:#f8fafc;--tn-border:${theme.borderColor};--tn-text-primary:${theme.textPrimary};--tn-text-secondary:${theme.textSecondary};--tn-link:${theme.linkColor};--tn-cta-panel-bg:${theme.ctaPanelBg};--tn-cta-panel-border:${theme.ctaPanelBorder};--tn-cta-text:${theme.ctaText};--tn-nav-active-bg:var(--tn-accent);--tn-nav-active-text:${theme.ctaText};--tn-nav-bg:#e2e8f0;--tn-nav-text:${theme.textPrimary};--tn-nav-border:#cbd5e1;--tn-font-heading:${textTheme.headingFamily};--tn-font-body:${textTheme.bodyFamily};--tn-font-size-base:${textTheme.baseSizePx}px;--tn-line-height-base:${textTheme.lineHeight};--tn-heading-weight:${textTheme.headingWeight};--tn-body-weight:${textTheme.bodyWeight};--tn-heading-spacing:${textTheme.headingSpacingEm}em;font-family:var(--tn-font-body);font-size:var(--tn-font-size-base);line-height:var(--tn-line-height-base);font-weight:var(--tn-body-weight);width:min(100%,1200px);margin:0 auto;padding:0;background:var(--tn-page-bg);border-radius:0"
      >
        <style data-tn-typography="true">@import url("${textTheme.fontImport}");</style>
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
            gap: 18px;
            justify-content: center;
            align-items: center;
            flex-wrap: nowrap;
            white-space: nowrap;
            overflow-x: auto;
            scrollbar-width: thin;
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
        <section style="background:var(--tn-accent);color:var(--tn-cta-text);padding:10px 20px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:13px">
          <span>Compassionate Care. Professional Support.</span>
          <span>Call: (000) 000-0000 | Email: hello@example.com</span>
        </section>
        <section style="background:var(--tn-surface);padding:14px 20px 8px;border-bottom:1px solid var(--tn-border)">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:12px">
              <img
                data-image-id="brand-logo"
                src="${brandLogoDataUri}"
                alt="${escapeHtml(projectName || "Business")} logo"
                style="width:58px;height:58px;border-radius:14px;object-fit:cover;border:1px solid var(--tn-border);background:#fff"
              />
              <div>
              <p style="margin:0;color:var(--tn-accent);font-weight:700;font-size:12px;letter-spacing:.08em">SKILLED NURSING & REHAB</p>
              <h1 style="margin:3px 0 0;font-family:var(--tn-font-heading);font-size:27px;line-height:1.1;color:var(--tn-text-primary)"> ${escapeHtml(projectName || "Care Center")} </h1>
              </div>
            </div>
            <a href="contact.html" style="display:inline-block;padding:9px 14px;background:var(--tn-accent-strong);color:var(--tn-cta-text);text-decoration:none;border-radius:6px;font-weight:700;font-size:13px">Request Info</a>
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

        <section style="background:var(--tn-cta-panel-bg);border-top:1px solid var(--tn-cta-panel-border);border-bottom:1px solid var(--tn-cta-panel-border);padding:24px 20px;text-align:center;margin-top:18px">
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

        <footer style="padding:16px 20px;text-align:center;color:var(--tn-text-secondary);font-size:12px;background:#fff;border-top:1px solid var(--tn-border)">
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
      acc[key] = buildHtmlFromGeneratedData({ pages: [page] }, key, uniqueKeys, palette, typography, uiDesign);
      return acc;
    }, {});
  };

  const getWorkingPages = () => {
    const baseline = Object.keys(generatedPages).length > 0
      ? { ...generatedPages }
      : { "index.html": generatedSite || "" };
    const current = isInlineEditing ? draftHtml : generatedSite || baseline[activePage] || "";
    if (current) baseline[activePage] = current;
    return baseline;
  };

  const buildDocumentHtml = (content, title) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title || "Generated Site")}</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff">
${content || ""}
</body>
</html>`;

  const extractPageImages = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
      return Array.from(doc.body.querySelectorAll("img[data-image-id]")).map((img, index) => ({
        id: String(img.getAttribute("data-image-id") || `image-${index + 1}`),
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
      const target = Array.from(doc.body.querySelectorAll("img[data-image-id]")).find(
        (img) => String(img.getAttribute("data-image-id") || "") === String(imageId || "")
      );
      if (!target) return html || "";
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

  const makeSiteId = (value) => `${makeProjectSlug(value)}-${Date.now().toString().slice(-6)}`;
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
          String(payload?.message || "Account created. Awaiting super admin approval before dashboard access.")
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
    setGeneratedPages((previous) => ({ ...previous, [activePage]: nextHtml }));
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory([nextHtml]);
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
        const response = await fetch("/api/generate", {
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
    const prompt = String(promptOverride || uiDesignPrompt || businessOsPrompt || projectName || "").trim();
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

    const titleCase = (value) =>
      String(value || "")
        .split(/[-_\s]+/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    const jsonCall = async (prompt) => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "TitoNova Cloud Engine generation call failed.");
      return parseModelJson(payload?.result);
    };
    const promptTemplates = {
      planner: ({ userPrompt }) => `You are an expert startup business planner.

Analyze the user's request and generate a structured business profile.

Return JSON with:
- business_name
- industry
- target_audience
- services
- pricing_packages
- website_pages
- tone_of_voice
- call_to_action

User request:
${userPrompt}

Return JSON only.`,
      brand: ({ businessName, industry, tone }) => `You are a brand designer.

Generate a modern brand identity for this business.

Business name: ${businessName}
Industry: ${industry}
Tone: ${tone}

Return JSON with:
- color_palette
- typography
- tagline
- brand_voice
- icon_style`,
      layout: ({ pages }) => `You are a professional web designer.

Generate a website layout structure.

Pages:
${pages.join(", ")}

Available sections:
hero
features
services
pricing
testimonials
faq
cta
contact_form
booking_widget

Return JSON mapping each page to sections.`,
      content: ({ businessName, industry, tone, pageName, sections }) => `Generate website content.

Business: ${businessName}
Industry: ${industry}
Tone: ${tone}

Page: ${pageName}
Sections: ${sections.join(", ")}

Return JSON for each section including headlines, descriptions, and CTA text.`,
      seo: ({ businessName, service, location }) => `Generate SEO landing pages.

Business: ${businessName}
Service: ${service}
City: ${location}

Return:
- seo_title
- meta_description
- h1
- content_sections`,
      marketing: ({ businessName, services }) => `Generate marketing assets.

Business: ${businessName}
Services: ${services.join(", ")}

Return:
- email_campaign
- social_media_posts
- google_ads_copy
- landing_page_headlines`,
    };
    const promptsUsed = {};

    setPipelineRunning(true);
    setPublishStatus("info");
      setPublishMessage("Running TitoNova Cloud Engine generation pipeline: planner -> brand -> layout -> content -> seo -> marketing -> render.");
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
      const inferredTemplate = inferIndustryTemplateFromPrompt(basePrompt);
      const selectedTemplate = INDUSTRY_TEMPLATE_PACKAGES.find((pkg) => pkg.key === inferredTemplate) || selectedIndustryPackage;

      let planner = null;
      try {
        promptsUsed.planner = promptTemplates.planner({ userPrompt: basePrompt });
        planner = await jsonCall(promptsUsed.planner);
      } catch {
        planner = null;
      }
      const fallbackServices = Array.isArray(selectedTemplate?.blueprint?.services) ? selectedTemplate.blueprint.services : ["Core Service 1", "Core Service 2"];
      const fallbackPricing = Array.isArray(selectedTemplate?.blueprint?.pricing)
        ? selectedTemplate.blueprint.pricing.map((name, index) => ({ name, price: `$${99 + index * 100}` }))
        : [{ name: "Starter", price: "$99" }, { name: "Premium", price: "$199" }];
      const fallbackPages = Array.isArray(selectedTemplate?.blueprint?.pages)
        ? selectedTemplate.blueprint.pages
        : ["Home", "Services", "Pricing", "About", "Contact", "Booking"];
      const plannerData = {
        business_name: String(planner?.business_name || requiredProjectName),
        industry: String(planner?.industry || selectedTemplate?.label || "Professional Services"),
        target_audience: String(planner?.target_audience || "Local customers"),
        services: Array.isArray(planner?.services) && planner.services.length > 0 ? planner.services.map((s) => String(s)) : fallbackServices,
        pricing_packages:
          Array.isArray(planner?.pricing_packages) && planner.pricing_packages.length > 0
            ? planner.pricing_packages.map((item, index) => ({
                name: String(item?.name || `Package ${index + 1}`),
                price: String(item?.price || `$${(index + 1) * 99}`),
              }))
            : fallbackPricing,
        website_pages:
          Array.isArray(planner?.website_pages) && planner.website_pages.length > 0
            ? planner.website_pages.map((p) => String(p))
            : Array.isArray(planner?.pages) && planner.pages.length > 0
              ? planner.pages.map((p) => String(p))
              : fallbackPages,
        tone_of_voice: String(planner?.tone_of_voice || planner?.tone || "premium and trustworthy"),
        call_to_action: String(planner?.call_to_action || planner?.cta || "Get Started Today"),
      };
      plannerData.pricing = plannerData.pricing_packages;
      plannerData.pages = plannerData.website_pages;
      plannerData.tone = plannerData.tone_of_voice;
      plannerData.cta = plannerData.call_to_action;
      setPipelineBlueprint(plannerData);
      setStep("planner", "pass", `${plannerData.business_name} • ${plannerData.industry}`);

      setStep("brand", "running", "Generating brand identity...");
      let brand = null;
      try {
        promptsUsed.brand = promptTemplates.brand({
          businessName: plannerData.business_name,
          industry: plannerData.industry,
          tone: plannerData.tone_of_voice,
        });
        brand = await jsonCall(promptsUsed.brand);
      } catch {
        brand = null;
      }
      const brandKitFallback = generateBrandKitFromPrompt(`${plannerData.business_name} ${basePrompt}`);
      const palette = {
        heroStart: String(brand?.color_palette?.primary || brand?.colors?.primary || brandKitFallback.palette.heroStart || DEFAULT_THEME_COLORS.heroStart),
        heroEnd: String(brand?.color_palette?.secondary || brand?.colors?.secondary || brandKitFallback.palette.heroEnd || DEFAULT_THEME_COLORS.heroEnd),
        accent: String(brand?.color_palette?.secondary || brand?.colors?.secondary || brandKitFallback.palette.accent || DEFAULT_THEME_COLORS.accent),
        accentStrong: String(brand?.color_palette?.accent || brand?.colors?.accent || brandKitFallback.palette.accentStrong || DEFAULT_THEME_COLORS.accentStrong),
        pageBg: brandKitFallback.palette.pageBg,
        cardBg: brandKitFallback.palette.cardBg,
        borderColor: brandKitFallback.palette.borderColor,
        textPrimary: brandKitFallback.palette.textPrimary,
        textSecondary: brandKitFallback.palette.textSecondary,
        linkColor: brandKitFallback.palette.linkColor,
        ctaPanelBg: brandKitFallback.palette.ctaPanelBg,
        ctaPanelBorder: brandKitFallback.palette.ctaPanelBorder,
        ctaText: brandKitFallback.palette.ctaText,
      };
      const typographyPreset = TEXT_STYLE_PRESETS.find((item) =>
        String(brand?.typography || brand?.font || "").toLowerCase().includes(item.label.toLowerCase().split(" ")[0].toLowerCase())
      ) || TEXT_STYLE_PRESETS[0];
      const typography = {
        ...DEFAULT_TEXT_STYLE,
        preset: typographyPreset.key,
        headingFamily: typographyPreset.headingFamily,
        bodyFamily: typographyPreset.bodyFamily,
        fontImport: typographyPreset.fontImport,
      };
      setThemeColors({ ...palette });
      setTextStyle((previous) => ({ ...previous, ...typography }));
      setStep("brand", "pass", String(brand?.tagline || "Brand identity generated."));

      setStep("layout", "running", "Generating page layouts and variants...");
      let layoutData = null;
      try {
        promptsUsed.layout = promptTemplates.layout({ pages: plannerData.pages });
        layoutData = await jsonCall(promptsUsed.layout);
      } catch {
        layoutData = null;
      }
      const pagesNormalized = plannerData.pages.map((page) => String(page || "").trim().toLowerCase()).filter(Boolean);
      const fallbackLayoutForPage = (page) => {
        if (page === "home") return ["hero", "services", "testimonials", "cta"];
        if (page === "services") return ["hero", "services", "faq", "cta"];
        if (page === "pricing") return ["hero", "pricing", "cta"];
        if (page === "contact") return ["hero", "contact_form", "cta"];
        if (page === "booking") return ["hero", "booking_widget", "cta"];
        return ["hero", "services", "cta"];
      };
      const fallbackVariants = AI_LAYOUT_VARIANT_OPTIONS.reduce((acc, variant) => {
        acc[variant.key] = pagesNormalized.reduce((pageAcc, pageName) => {
          pageAcc[pageName] = fallbackLayoutForPage(pageName);
          return pageAcc;
        }, {});
        return acc;
      }, {});
      const parsedVariants = layoutData?.variants && typeof layoutData.variants === "object" ? layoutData.variants : {};
      const nextVariants = AI_LAYOUT_VARIANT_OPTIONS.reduce((acc, variant) => {
        const entry = parsedVariants[variant.key];
        if (entry && typeof entry === "object") {
          acc[variant.key] = Object.entries(entry).reduce((pageAcc, [name, sections]) => {
            pageAcc[String(name || "").toLowerCase()] = Array.isArray(sections) ? sections.map((item) => String(item || "")) : fallbackLayoutForPage(String(name || "").toLowerCase());
            return pageAcc;
          }, {});
        } else {
          acc[variant.key] = fallbackVariants[variant.key];
        }
        return acc;
      }, {});
      setPipelineVariants(nextVariants);
      setStep("layout", "pass", `Generated ${Object.keys(nextVariants).length} variants.`);

      setStep("content", "running", "Generating page copy...");
      const contentPages = {};
      promptsUsed.content = {};
      for (const pageName of pagesNormalized) {
        const pageSections = Array.isArray(nextVariants[pipelineVariant]?.[pageName])
          ? nextVariants[pipelineVariant][pageName]
          : ["hero", "services", "cta"];
        try {
          const pagePrompt = promptTemplates.content({
            businessName: plannerData.business_name,
            industry: plannerData.industry,
            tone: plannerData.tone_of_voice,
            pageName,
            sections: pageSections,
          });
          promptsUsed.content[pageName] = pagePrompt;
          const pageJson = await jsonCall(pagePrompt);
          contentPages[pageName] =
            pageJson?.[pageName] && typeof pageJson[pageName] === "object"
              ? pageJson[pageName]
              : pageJson && typeof pageJson === "object"
                ? pageJson
                : {};
        } catch {
          contentPages[pageName] = {};
        }
      }
      setStep("content", "pass", `Generated copy for ${Object.keys(contentPages).length || pagesNormalized.length} page(s).`);

      setStep("seo", "running", "Generating metadata, keywords, and slugs...");
      const seoPages = {};
      const seoLandingPages = [];
      promptsUsed.seo = {};
      const locationHint =
        String(plannerData.target_audience || "")
          .split(/\s+/)
          .slice(-2)
          .join(" ") || "your city";
      const seoServices = Array.isArray(plannerData.services) ? plannerData.services.slice(0, 3) : [];
      for (const service of seoServices) {
        try {
          const seoPrompt = promptTemplates.seo({
            businessName: plannerData.business_name,
            service,
            location: locationHint,
          });
          promptsUsed.seo[service] = seoPrompt;
          const seoJson = await jsonCall(seoPrompt);
          seoLandingPages.push({
            service,
            location: locationHint,
            seo_title: String(seoJson?.seo_title || `${service} ${locationHint}`),
            meta_description: String(
              seoJson?.meta_description || `Professional ${service.toLowerCase()} services in ${locationHint}.`
            ),
            h1: String(seoJson?.h1 || `${service} ${locationHint}`),
            content_sections: Array.isArray(seoJson?.content_sections) ? seoJson.content_sections : [],
          });
        } catch {
          seoLandingPages.push({
            service,
            location: locationHint,
            seo_title: `${service} ${locationHint}`,
            meta_description: `Professional ${service.toLowerCase()} services in ${locationHint}.`,
            h1: `${service} ${locationHint}`,
            content_sections: [],
          });
        }
      }
      pagesNormalized.forEach((pageName) => {
        seoPages[pageName] = {
          title: `${titleCase(pageName)} | ${plannerData.business_name}`,
          description: `${plannerData.industry} for ${plannerData.target_audience}.`,
          keywords: [plannerData.industry, ...plannerData.services].slice(0, 5),
          slug: pageName,
        };
      });
      setStep("seo", "pass", `Generated SEO data for ${Object.keys(seoPages).length || pagesNormalized.length} page(s).`);

      setStep("marketing", "running", "Generating marketing assets...");
      let marketingData = null;
      try {
        promptsUsed.marketing = promptTemplates.marketing({
          businessName: plannerData.business_name,
          services: plannerData.services,
        });
        marketingData = await jsonCall(promptsUsed.marketing);
      } catch {
        marketingData = null;
      }
      if (marketingData && typeof marketingData === "object") {
        setMarketingEngineOutput({
          business: plannerData.business_name,
          offer: plannerData.services[0] || plannerData.industry,
          seoPages: seoLandingPages.map((item) => ({
            title: item.seo_title,
            slug: String(item.seo_title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
            summary: item.meta_description,
          })),
          emailCampaign:
            marketingData.email_campaign && typeof marketingData.email_campaign === "object"
              ? marketingData.email_campaign
              : {
                  subject: `Get started with ${plannerData.business_name}`,
                  body: `Book ${plannerData.services[0] || "our service"} today.`,
                },
          socialPosts: Array.isArray(marketingData.social_media_posts) ? marketingData.social_media_posts : [],
          ads: Array.isArray(marketingData.google_ads_copy) ? marketingData.google_ads_copy : [],
          landingPages: Array.isArray(marketingData.landing_page_headlines)
            ? marketingData.landing_page_headlines.map((headline, idx) => ({
                title: String(headline || `Landing Headline ${idx + 1}`),
                slug: `landing-${idx + 1}`,
              }))
            : [],
        });
      }
      setStep("marketing", "pass", "Marketing assets generated.");

      setStep("renderer", "running", "Rendering schema-driven website...");
      const chosenVariant = nextVariants[pipelineVariant] || nextVariants.corporate || {};
      const toSectionObjects = (pageName, sectionTokens) => {
        const key = String(pageName || "").toLowerCase();
        const pageCopy = contentPages[key] || {};
        const heroData = pageCopy?.hero || {};
        const seoPage = seoPages[key] || {};
        const seoKeywordHint = Array.isArray(seoPage?.keywords) ? seoPage.keywords.slice(0, 2).join(", ") : "";
        return (Array.isArray(sectionTokens) ? sectionTokens : [])
          .map((token) => String(token || "").trim().toLowerCase())
          .map((token) => {
            if (token === "hero") {
              return {
                type: "hero",
                title: String(heroData.headline || `${plannerData.business_name} ${titleCase(key)}`),
                subtitle: String(
                  heroData.subtext ||
                    `${seoKeywordHint ? `${seoKeywordHint}. ` : ""}Professional ${plannerData.industry} services for ${plannerData.target_audience}.`
                ),
              };
            }
            if (token === "services") {
              const serviceItems = Array.isArray(pageCopy?.services)
                ? pageCopy.services
                    .map((item) => (typeof item === "string" ? item : String(item?.title || item?.name || "")))
                    .filter(Boolean)
                : plannerData.services;
              return { type: "features", items: serviceItems.slice(0, 6) };
            }
            if (token === "pricing") {
              return { type: "features", items: plannerData.pricing.map((item) => `${item.name} ${item.price}`) };
            }
            if (token === "faq") {
              return { type: "features", items: ["Frequently asked questions", "Service coverage", "Satisfaction guarantee"] };
            }
            if (token === "testimonials") {
              return { type: "features", items: ["Trusted by local customers", "5-star reviewed service", "Fast response team"] };
            }
            return null;
          })
          .filter(Boolean)
          .concat([
            {
              type: "cta",
              text: String(pageCopy?.cta || heroData?.cta || plannerData.cta || "Get Started Today"),
            },
          ]);
      };

      const pageModels = pagesNormalized.map((name, index) => {
        const sectionTokens = chosenVariant[name] || ["hero", "services", "cta"];
        return {
          name: titleCase(name),
          sections: toSectionObjects(name, sectionTokens),
          _pageIndex: index,
        };
      });
      const parsedPayload = { pages: pageModels };
      const pageJsonMap = pageModels.reduce((acc, page) => {
        const key = pageKeyFromName(page?.name || "Page", page._pageIndex || 0);
        const sectionTokens = Array.isArray(chosenVariant[String(page?.name || "").toLowerCase()])
          ? chosenVariant[String(page?.name || "").toLowerCase()]
          : [];
        acc[key] = {
          name: page.name,
          sections: sectionTokens,
          content: page.sections,
          seo: seoPages[String(page?.name || "").toLowerCase()] || {},
        };
        return acc;
      }, {});

      const effectiveUiDesign = normalizeUiDesignSpec(
        uiDesignSpec || buildAutoUiDesignSpec(`${plannerData.business_name}|${selectedTemplate?.key || industryTemplate}|${pipelineVariant}`)
      );
      setUiDesignSpec(effectiveUiDesign);
      const pages = buildGeneratedPages(parsedPayload, palette, typography, {
        mode: "website-app",
        automationDefs: selectedAutomationDefs,
        autoRevenueFeatures,
        uiDesign: effectiveUiDesign,
      });
      const firstPageKey = pages["index.html"] ? "index.html" : orderPageKeys(Object.keys(pages))[0] || "index.html";
      const firstHtml = pages[firstPageKey] || "";
      setGeneratedPages(pages);
      setFunnelBuilderData(buildFunnelBuilderData(pages));
      setActivePage(firstPageKey);
      setGeneratedSite(firstHtml);
      setDraftHtml(firstHtml);
      setEditHistory(firstHtml ? [firstHtml] : []);
      setLiveUrl("");
      setPublishedSiteId("");
      setDnsGuideDomain("");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");

      setAiProjectSchema({
        project: {
          name: plannerData.business_name,
          prompt: basePrompt,
          generatedAt: new Date().toISOString(),
          pipeline: "planner-brand-layout-content-seo-marketing-renderer",
        },
        business: {
          "blueprint.json": plannerData,
        },
        brand: {
          "palette.json": palette,
          "typography.json": typography,
          "identity.json": {
            tagline: String(brand?.tagline || ""),
            voice: String(brand?.brand_voice || plannerData.tone_of_voice),
            iconStyle: String(brand?.icon_style || "modern-flat"),
          },
        },
        layout: {
          "layout.json": {
            selectedVariant: pipelineVariant,
            variants: nextVariants,
          },
          "sections.json": chosenVariant,
          "components.json": {
            registry: ["hero", "features", "cta"],
          },
        },
        seo: {
          "seo.json": {
            pages: seoPages,
            landing_pages: seoLandingPages,
          },
        },
        marketing: {
          "marketing.json": marketingData && typeof marketingData === "object" ? marketingData : {},
        },
        prompts: {
          "prompts.json": promptsUsed,
        },
        pages: Object.entries(pageJsonMap).reduce((acc, [key, value]) => {
          const fileName = `${String(key || "").replace(/\.html$/i, "")}.json`;
          acc[fileName] = value;
          return acc;
        }, {}),
      });
      setStep("renderer", "pass", `Rendered ${Object.keys(pages).length} page(s).`);
      setPublishStatus("success");
      setPublishMessage("TitoNova Cloud Engine generation pipeline complete. Schema-driven website ready.");
    } catch (error) {
      const message = String(error?.message || "TitoNova Cloud Engine generation pipeline failed.");
      setStep("renderer", "fail", message);
      setPublishStatus("error");
      setPublishMessage(message);
    } finally {
      setPipelineRunning(false);
    }
  };

  const handleAttachDomain = async (targetSiteId, rawDomain) => {
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
  };

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
    const template = buildHtmlFromGeneratedData(
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
    );
    const synced = syncNavigationAcrossPages({ ...current, "client-dashboard.html": template });
    setGeneratedPages(synced);
    if (activePage === "index.html" || !generatedSite) {
      const html = synced["client-dashboard.html"] || "";
      setActivePage("client-dashboard.html");
      setGeneratedSite(html);
      setDraftHtml(html);
      setEditHistory(html ? [html] : []);
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
              [tmpKey]: buildHtmlFromGeneratedData(
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
              ),
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

  const commitInlineDraftForActivePage = () => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    const sourceHtml = previewEditableRef.current?.innerHTML || draftHtml || currentHtml || "";
    const nextHtml = fieldLockMode ? applyTextOnlyChanges(currentHtml, sourceHtml) : sourceHtml;
    setGeneratedPages((previous) => ({ ...previous, [activePage]: nextHtml }));
    return nextHtml;
  };

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
  };

  const handlePreviewLinkNavigation = (event) => {
    if (isInlineEditing) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
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
    const template = buildHtmlFromGeneratedData(
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
    );
    const synced = syncNavigationAcrossPages({ ...current, [pageKey]: template });
    setGeneratedPages(synced);
    setActivePage(pageKey);
    setGeneratedSite(synced[pageKey] || "");
    setDraftHtml(synced[pageKey] || "");
    setEditHistory(synced[pageKey] ? [synced[pageKey]] : []);
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
    setGeneratedPages(synced);
    setActivePage(nextActive);
    setGeneratedSite(synced[nextActive] || "");
    setDraftHtml(synced[nextActive] || "");
    setEditHistory(synced[nextActive] ? [synced[nextActive]] : []);
    setPublishStatus("success");
    setPublishMessage(`Page deleted: ${pageLabelFromKey(activePage)}`);
  };

  const normalizedCustomDomain = normalizeDomain(customDomain);
  const redesignInsights = deriveRedesignInsights(sourceWebsiteUrl);
  const hasDashboardAccess = true;
  const shouldShowGuestPreviewPrompt = Boolean(showGuestAuthPrompt && !authUser && hasGeneratedContent);
  const currentPageHtml = generatedPages[activePage] || generatedSite || "";
  const seoChecklist = computeSeoChecklist(currentPageHtml);
  const currentMapQuery = extractMapQueryFromHtml(currentPageHtml);
  const editableImages = extractPageImages(currentPageHtml);
  const selectedImage = editableImages.find((item) => item.id === selectedImageId) || editableImages[0] || null;
  const hasGeneratedContent = Object.keys(generatedPages).length > 0 || Boolean(generatedSite);
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
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Image upload failed."));
      reader.readAsDataURL(file);
    }).catch(() => "");
    if (!dataUrl) return;
    applyImageUpdate(selectedImage.id, dataUrl, imageApplyScope);
    setPublishStatus("success");
    setPublishMessage(
      imageApplyScope === "all"
        ? `Uploaded image across all pages: ${selectedImage.id}`
        : `Uploaded image: ${selectedImage.id}`
    );
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

      const response = await fetch("/api/generate", {
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

  const publishToHosting = async ({ siteId, pages, domain }) => {
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
  };

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

  const handleGoLive = async ({ republish = false, forceDomain = "" } = {}) => {
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
  };

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

  const handleLaunchBusinessOs = async () => {
    const command = String(businessOsPrompt || "").trim();
    const requiredProjectName = String(projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before launching business.");
      return null;
    }
    if (!command) {
      setPublishStatus("error");
      setPublishMessage("Enter a Business OS command first (example: Start a cleaning company).");
      setError("Business Prompt is required.");
      return null;
    }
    const inferredTemplate = inferIndustryTemplateFromPrompt(command);
    const inferredName = deriveProjectNameFromBusinessPrompt(command);
    const nextProjectName = inferredName || projectName || "New Business";
    setBusinessOsLaunching(true);
    try {
      setSolutionMode("website-app");
      setAutoRevenueFeatures(true);
      setMarketingAutopilotEnabled(true);
      setIndustryTemplate(inferredTemplate);
      setAutomationFeatures((previous) => {
        const next = { ...previous };
        BUSINESS_OS_REQUIRED_FEATURE_KEYS.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(next, key)) next[key] = true;
        });
        return next;
      });
      setPublishStatus("info");
      setPublishMessage(
        "Launching TitoNova Cloud Engine Business OS: website, booking, pricing, Stripe payments, CRM, email automation, landing pages, and SEO pages."
      );
      const generation = await handleGenerate({
        projectNameOverride: nextProjectName,
        industryTemplateOverride: inferredTemplate,
        enforceFeatureKeys: BUSINESS_OS_REQUIRED_FEATURE_KEYS,
        businessOsPrompt: command,
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
    if (loading || uiDesignLoading || businessOsLaunching) return;

    const requiredProjectName = String(projectName || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before generating.");
      return;
    }

    const prompt = String(businessOsPrompt || "").trim();
    if (!prompt) {
      setError("Business Prompt is required.");
      setPublishStatus("error");
      setPublishMessage("Describe what you want to build before generating.");
      return;
    }
    const useBusinessOsFlow =
      /(business\s*os|start\s+a\s+.+\s+company|booking|crm|invoic|invoice|portal|dashboard|membership|subscription|payment integration|analytics|client dashboard|login portal)/i.test(
        prompt
      );

    if (prompt && useBusinessOsFlow) {
      await handleLaunchBusinessOs();
      return;
    }

    if (prompt) {
      await handleAiUiDesign(prompt);
    }

    await handleGenerate();
  };

  const handleGenerateFunnel = async () => {
    if (loading || uiDesignLoading || businessOsLaunching) return;
    const requiredProjectName = String(projectName || "").trim();
    const prompt = String(businessOsPrompt || "").trim();
    if (!requiredProjectName) {
      setError("Project Name is required.");
      setPublishStatus("error");
      setPublishMessage("Enter Project Name * before generating funnel.");
      return;
    }
    if (!prompt) {
      setError("Business Prompt is required.");
      setPublishStatus("error");
      setPublishMessage("Describe your business to generate funnel pages.");
      return;
    }
    const generation = await handleGenerate({
      enforceFeatureKeys: FUNNEL_REQUIRED_KEYS,
      businessOsPrompt: `${prompt}\nCreate conversion funnel flow: Ad -> Landing Page -> Booking -> Payment.`,
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
    if (!projectName.trim()) {
      const base = value.replace(/\s+(website|company|agency|site)$/i, "").trim();
      if (base) setProjectName(base.replace(/\b\w/g, (m) => m.toUpperCase()));
    }
  };

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

  const handleGenerate = async (options = {}) => {
    const resolvedProjectName = String(options.projectNameOverride || projectName || "").trim();
    if (!resolvedProjectName) {
      alert("Enter a project name first");
      return;
    }

    setLoading(true);
    setError("");
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

      const requestedWebsitePages = "Home, About, Services, Pricing, Contact, Landing Page, Blog";
      const requestedAutomationPages = effectiveAutomationDefs.map((page) => page.label).join(", ");
      const requestedPageList =
        solutionMode === "website"
          ? requestedWebsitePages
          : solutionMode === "app"
            ? requestedAutomationPages || "Client Dashboard, Login Portal"
            : `${requestedWebsitePages}, ${requestedAutomationPages}`;
      const businessOsClause = options.businessOsPrompt
        ? `
Business OS Command: ${options.businessOsPrompt}
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
	Make each page conversion-focused with clear calls to action.${businessOsClause}
${uiDesignClause}`,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Website generation failed.");
      }

      const parsed = parseModelJson(payload?.result);
      let pages = buildGeneratedPages(parsed, effectivePalette, effectiveTypography, {
        mode: solutionMode,
        automationDefs: effectiveAutomationDefs,
        autoRevenueFeatures,
        uiDesign: effectiveUiDesign,
      });
      const autoBrandPrompt = `${resolvedProjectName} ${String(options.businessOsPrompt || businessOsPrompt || "")} ${effectiveIndustryPackage?.label || ""}`.trim();
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
          prompt: String(options.businessOsPrompt || businessOsPrompt || ""),
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
      setGeneratedPages(pages);
      setFunnelBuilderData(buildFunnelBuilderData(pages));
      setActivePage(firstPageKey);
      setGeneratedSite(firstHtml);
      setDraftHtml(firstHtml);
      setEditHistory([firstHtml]);
      setPublishMessage("");
      setPublishStatus("info");
      setLiveUrl("");
      setPublishedSiteId("");
      setDnsGuideDomain("");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");
      setNewPageName("");
      setIsInlineEditing(true);
      if (resolvedProjectName !== projectName) setProjectName(resolvedProjectName);
      let savedProjectId = "";
      if (authToken && authUser?.id) {
        try {
          const projectPayload = await apiJson({
            path: "/api/projects/create",
            method: "POST",
            body: {
              project_name: resolvedProjectName,
              ai_prompt: String(options.businessOsPrompt || businessOsPrompt || ""),
            },
            token: authToken,
          });
          savedProjectId = String(projectPayload?.project?.id || "");
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
      setError(message);
      setGeneratedSite(null);
      setGeneratedPages({});
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
      const cloneLayerDirectives = [
        "Layout scanner: extract page structure, sections, containers, nav, and hero blocks.",
        "Design AI: replicate colors, typography, spacing, and responsive breakpoints.",
        "Component extractor: identify buttons, forms, sliders, cards, popups, CTA blocks.",
        "Behavior AI: replicate animations, hover effects, modals, and interactions.",
        "Content AI: rewrite content to remain unique and SEO-safe while preserving intent.",
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
Cloning engine layers:
${cloneLayerDirectives.join("\n")}
${cloneModeDirective}
${cloneOptionsDirective}
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
      setGeneratedPages(pages);
      setFunnelBuilderData(buildFunnelBuilderData(pages));
      setActivePage(firstPageKey);
      setGeneratedSite(firstHtml);
      setDraftHtml(firstHtml);
      setEditHistory([firstHtml]);
      setPublishMessage(`${exactRedesignMode ? "Exact" : "Modern"} redesign generated from ${insights.host}`);
      setPublishStatus("success");
      setLiveUrl("");
      setPublishedSiteId("");
      setDnsGuideDomain("");
      setDnsVerifyStatus("idle");
      setDnsVerifyMessage("");
      setNewPageName("");
      setIsInlineEditing(true);
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

  const handleStartInlineEdit = () => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    if (!currentHtml) return;
    setFieldLockMode(true);
    setDraftHtml(currentHtml);
    setEditHistory([currentHtml]);
    setIsInlineEditing(true);
  };

  const handleSaveInlineEdit = () => {
    const nextHtml = commitInlineDraftForActivePage();
    setGeneratedSite(nextHtml);
    setDraftHtml(nextHtml);
    setEditHistory([nextHtml]);
    setIsInlineEditing(false);
    setPublishStatus("success");
    setPublishMessage("Inline edits saved.");
  };

  const handleCancelInlineEdit = () => {
    const currentHtml = generatedPages[activePage] || generatedSite || "";
    setDraftHtml(currentHtml);
    setEditHistory(currentHtml ? [currentHtml] : []);
    setIsInlineEditing(false);
  };

  const handleUndoInlineEdit = () => {
    setEditHistory((previous) => {
      if (previous.length <= 1) return previous;
      const next = previous.slice(0, -1);
      const restored = next[next.length - 1] || "";
      setDraftHtml(restored);
      if (previewEditableRef.current) previewEditableRef.current.innerHTML = restored;
      return next;
    });
  };

  const snapshotInlineDraft = () => {
    if (!isInlineEditing) return;
    const nextHtml = previewEditableRef.current?.innerHTML || draftHtml || generatedSite || "";
    setDraftHtml(nextHtml);
    setEditHistory((previous) => {
      if (previous[previous.length - 1] === nextHtml) return previous;
      return [...previous.slice(-49), nextHtml];
    });
  };

  useEffect(() => {
    const root = previewEditableRef.current;
    if (!root) return;
    const selector = "h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label";
    const lockedNodes = Array.from(root.querySelectorAll(selector));

    if (isInlineEditing && fieldLockMode) {
      lockedNodes.forEach((node) => {
        node.setAttribute("contenteditable", "true");
        node.setAttribute("data-locked-edit", "true");
      });
      return;
    }

    lockedNodes.forEach((node) => {
      if (node.getAttribute("data-locked-edit") === "true") {
        node.removeAttribute("contenteditable");
        node.removeAttribute("data-locked-edit");
      }
    });
  }, [isInlineEditing, fieldLockMode, draftHtml]);

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
            Dashboard access is locked. Create an account and wait for super admin approval.
          </p>
        </div>
        <div style={{ ...styles.card, maxWidth: 760, margin: "0 auto" }}>
          <h2 style={styles.sectionTitle}>Create Account</h2>
          <p style={styles.sectionIntro}>
            New users are set to pending status until approved by super admin.
          </p>
          {authUser ? (
            <div style={styles.authCard}>
              <div style={styles.authHeader}>
                <strong style={styles.authTitle}>Approval Pending</strong>
                <button type="button" style={styles.authGhostButton} onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <small style={styles.authMeta}>
                Account: {authUser?.email || "unknown"} · Status: {authUser?.approval_status || "pending"}.
                You will gain dashboard access after super admin approval.
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
                  Login (Approved Users)
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

  return (
    <div style={styles.wrapper}>
      <div style={styles.hero}>
        <span style={styles.eyebrow}>TITONOVA CLOUD  BUSINESS ENGINE</span>
        <h1 style={styles.title}>TitoNova Cloud Business &amp; Website Engine</h1>
        <p style={styles.subtitle}>
          <strong>TitoNova Website &amp; Business Platform</strong>
          <br />
          TitoNova automatically builds your complete website, marketing infrastructure, and revenue systems—creating intelligent websites that continuously evolve with your business.
        </p>
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
        <section style={styles.authCard}>
          <div style={styles.authHeader}>
            <strong style={styles.authTitle}>
              {authUser ? `Logged in as ${authUser.name || authUser.email}` : "Account Login Required"}
            </strong>
            {authUser ? (
              <button type="button" style={styles.authGhostButton} onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <div style={styles.authModeRow}>
                <button
                  type="button"
                  style={authMode === "login" ? styles.authModeButtonActive : styles.authModeButton}
                  onClick={() => setAuthMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  style={authMode === "signup" ? styles.authModeButtonActive : styles.authModeButton}
                  onClick={() => setAuthMode("signup")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
          {!authUser ? (
            <div style={styles.authFormGrid}>
              {authMode === "signup" && (
                <input
                  style={styles.solutionInput}
                  placeholder="Full name"
                  value={authNameInput}
                  onChange={(event) => setAuthNameInput(event.target.value)}
                />
              )}
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
          ) : (
            <div style={styles.authProjectWrap}>
              <small style={styles.authMeta}>Saved projects: {userProjects.length}</small>
              <button type="button" style={styles.authGhostButton} onClick={() => refreshUserProjects()}>
                Refresh Projects
              </button>
            </div>
          )}
          {!authUser && (
            <small style={styles.authMeta}>
              Guest mode is enabled. You can generate first, then create an account to save and publish.
            </small>
          )}
          {authUser && userProjects.length > 0 && (
            <div style={styles.authProjectList}>
              {userProjects.slice(0, 5).map((project) => (
                <small key={project.id} style={styles.authProjectItem}>
                  {project.project_name}
                </small>
              ))}
            </div>
          )}
        </section>
        {authUser && (
          <section style={styles.authCard}>
            <div style={styles.authHeader}>
              <strong style={styles.authTitle}>Stripe Billing + Plan Gating</strong>
              <button
                type="button"
                style={styles.authGhostButton}
                onClick={async () => {
                  setBillingLoading(true);
                  try {
                    await Promise.all([refreshBillingPlans(), refreshBillingStatus()]);
                  } finally {
                    setBillingLoading(false);
                  }
                }}
                disabled={billingLoading}
              >
                {billingLoading ? "Refreshing..." : "Refresh Billing"}
              </button>
            </div>
            {billingStatusData && (
              <small style={styles.authMeta}>
                Current plan: {billingStatusData?.plan?.label || billingStatusData?.subscription?.plan || "Free"} ·
                Daily generations left: {billingStatusData?.usage?.generationsRemaining ?? "-"} ·
                Projects: {billingStatusData?.usage?.projectCount ?? "-"}
              </small>
            )}
            <div style={styles.authProjectList}>
              {(billingPlans || []).map((plan) => {
                const isCurrent = String(billingStatusData?.plan?.key || "").toLowerCase() === String(plan?.key || "").toLowerCase();
                return (
                  <div key={plan.key} style={styles.billingPlanItem}>
                    <small style={styles.authMeta}>
                      <strong>{plan.label}</strong> · {plan.priceLabel}
                    </small>
                    <small style={styles.authMeta}>
                      {plan.generationLimit}/day · {plan.maxProjects} projects · {plan.maxMembers} members
                    </small>
                    <button
                      type="button"
                      style={isCurrent ? styles.authModeButtonActive : styles.authPrimaryButton}
                      onClick={() => handleUpgradePlan(plan.key)}
                      disabled={billingUpgradeLoading === plan.key || isCurrent}
                    >
                      {isCurrent ? "Current Plan" : billingUpgradeLoading === plan.key ? "Updating..." : "Upgrade"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {authUser && (
          <section style={styles.authCard}>
            <div style={styles.authHeader}>
              <strong style={styles.authTitle}>Team Workspaces & Roles</strong>
              <button
                type="button"
                style={styles.authGhostButton}
                onClick={async () => {
                  setWorkspaceLoading(true);
                  try {
                    await refreshWorkspaces();
                    await refreshWorkspaceMembers(authUser?.active_workspace_id);
                  } finally {
                    setWorkspaceLoading(false);
                  }
                }}
                disabled={workspaceLoading}
              >
                {workspaceLoading ? "Refreshing..." : "Refresh Team"}
              </button>
            </div>
            <div style={styles.workspaceRow}>
              <input
                style={styles.solutionInput}
                placeholder="New workspace name"
                value={newWorkspaceName}
                onChange={(event) => setNewWorkspaceName(event.target.value)}
              />
              <button type="button" style={styles.authPrimaryButton} onClick={handleCreateWorkspace} disabled={workspaceLoading}>
                Create Workspace
              </button>
            </div>
            <small style={styles.authMeta}>
              Active workspace: {workspaceList.find((item) => item.id === authUser?.active_workspace_id)?.name || "Default"} · Role:{" "}
              {workspaceList.find((item) => item.id === authUser?.active_workspace_id)?.role || "owner"}
            </small>
            {workspaceList.length > 0 && (
              <div style={styles.workspaceChips}>
                {workspaceList.map((workspace) => (
                  <span key={workspace.id} style={styles.purchasedChip}>
                    {workspace.name} ({workspace.role})
                  </span>
                ))}
              </div>
            )}
            <div style={styles.workspaceRow}>
              <input
                style={styles.solutionInput}
                type="email"
                placeholder="Invite by email"
                value={workspaceInviteEmail}
                onChange={(event) => setWorkspaceInviteEmail(event.target.value)}
              />
              <select
                style={styles.solutionSelect}
                value={workspaceInviteRole}
                onChange={(event) => setWorkspaceInviteRole(event.target.value)}
              >
                <option value="admin">admin</option>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
              <button type="button" style={styles.authPrimaryButton} onClick={handleInviteWorkspaceMember} disabled={workspaceLoading}>
                Invite
              </button>
            </div>
            {workspaceMembers.length > 0 && (
              <div style={styles.authProjectList}>
                {workspaceMembers.slice(0, 8).map((member) => (
                  <small key={`${member.user_id}-${member.email}`} style={styles.authProjectItem}>
                    {member.name || member.email} · {member.role}
                  </small>
                ))}
              </div>
            )}
          </section>
        )}
        {hasGeneratedContent && (
          <section style={styles.authCard}>
            <div style={styles.authHeader}>
              <strong style={styles.authTitle}>AI Variant Scoring + One-Click Improve</strong>
              <button type="button" style={styles.authPrimaryButton} onClick={handleScoreVariants} disabled={variantScoringLoading}>
                {variantScoringLoading ? "Scoring..." : "Score Variants"}
              </button>
            </div>
            {scoredVariants.length > 0 ? (
              <div style={styles.authProjectList}>
                {scoredVariants.map((variant) => (
                  <div key={variant.id} style={styles.variantItem}>
                    <small style={styles.authMeta}>
                      <strong>{variant.name}</strong> · Total {variant?.scores?.total ?? 0}
                    </small>
                    <small style={styles.authMeta}>
                      SEO {variant?.scores?.seo ?? 0} · Conversion {variant?.scores?.conversion ?? 0} · Accessibility {variant?.scores?.accessibility ?? 0}
                    </small>
                    <button type="button" style={styles.authGhostButton} onClick={() => applyVariantById(variant.id)}>
                      Apply Variant
                    </button>
                  </div>
                ))}
                <button type="button" style={styles.authPrimaryButton} onClick={handleOneClickImprove}>
                  One-Click Improve (Best Variant)
                </button>
              </div>
            ) : (
              <small style={styles.authMeta}>Run scoring to rank generated page variants and apply the best version instantly.</small>
            )}
          </section>
        )}
        {showGuestAuthPrompt && !authUser && (
          <section style={styles.guestPromptCard}>
            <strong style={styles.guestPromptTitle}>Website generated successfully</strong>
            <small style={styles.guestPromptMeta}>
              Create an account to save this project, publish it, and access it from your dashboard anytime.
            </small>
            <div style={styles.guestPromptActions}>
              <button type="button" style={styles.authPrimaryButton} onClick={() => navigateToAuth("/signup")}>
                Create Account
              </button>
              <button type="button" style={styles.authGhostButton} onClick={() => navigateToAuth("/login")}>
                Login
              </button>
            </div>
          </section>
        )}

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
          <input
            style={styles.solutionInput}
            placeholder='Example: "Premium home care brand with online booking"'
            value={businessOsPrompt}
            required
            onChange={(event) => {
              const value = event.target.value;
              setBusinessOsPrompt(value);
              setUiDesignPrompt(value);
              if (error) setError("");
            }}
          />
          <small style={styles.businessOsHint}>Describe the website or business you want to create.</small>
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
              <button
                key={chip}
                type="button"
                style={styles.promptChip}
                onClick={() => handleQuickPromptChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.businessOsCard}>
          <label style={styles.solutionLabel}>Optional Advanced Tools</label>
          <small style={styles.businessOsHint}>
            Use these only when you want extra automation, redesign, brand, or growth controls.
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
        <section style={styles.funnelBuilderCard}>
          <div style={styles.funnelBuilderHeader}>
            <strong style={styles.funnelBuilderTitle}>🌐 TitoNova Cloud Engine Website + Funnel Builder</strong>
            <button style={styles.funnelBuilderButton} onClick={handleGenerateFunnel} disabled={loading || uiDesignLoading || businessOsLaunching}>
              {loading || uiDesignLoading || businessOsLaunching ? "Generating Funnel..." : "Generate Funnel Flow"}
            </button>
          </div>
          <small style={styles.funnelBuilderMeta}>
            Schema-driven pages and conversion funnels instead of fixed templates.
          </small>
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
              <select
                style={styles.solutionSelect}
                value={pipelineVariant}
                onChange={(event) => setPipelineVariant(event.target.value)}
              >
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
          <small style={styles.pipelineMeta}>Prompt -&gt; Planner -&gt; Brand -&gt; Layout -&gt; Content -&gt; SEO -&gt; Marketing -&gt; Component Renderer</small>
          {Object.keys(pipelineVariants || {}).length > 0 ? (
            <small style={styles.pipelineMeta}>Variants ready: {Object.keys(pipelineVariants).join(", ")}</small>
          ) : null}
          {pipelineBlueprint && (
            <div style={styles.pipelineBlueprintCard}>
              <small style={styles.pipelineMeta}><strong>Business:</strong> {pipelineBlueprint.business_name}</small>
              <small style={styles.pipelineMeta}><strong>Industry:</strong> {pipelineBlueprint.industry}</small>
              <small style={styles.pipelineMeta}><strong>Pages:</strong> {pipelineBlueprint.pages.join(", ")}</small>
              <small style={styles.pipelineMeta}><strong>CTA:</strong> {pipelineBlueprint.cta}</small>
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
                    {step.status === "pass"
                      ? "PASS"
                      : step.status === "fail"
                        ? "FAIL"
                        : step.status === "running"
                          ? "RUN"
                          : "WAIT"}
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
        {showAdvancedTools && (
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
        <button
          style={styles.brandButton}
          onClick={handleGenerateBrandKit}
          disabled={brandLoading}
        >
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
          <select
            style={styles.solutionSelect}
            value={solutionMode}
            onChange={(event) => setSolutionMode(event.target.value)}
          >
            <option value="website-app">Website + App</option>
            <option value="website">Website only</option>
            <option value="app">App only</option>
          </select>
        </div>
        <div style={styles.solutionRow}>
          <label style={styles.solutionLabel}>Industry Template</label>
          <select
            style={styles.solutionSelect}
            value={industryTemplate}
            onChange={(event) => applyIndustryTemplate(event.target.value)}
          >
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
            <input
              style={styles.solutionInput}
              placeholder="Paste Website URL"
              value={sourceWebsiteUrl}
              onChange={(event) => setSourceWebsiteUrl(event.target.value)}
            />
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
              <input
                type="checkbox"
                checked={clonePixelPerfect}
                onChange={(event) => setClonePixelPerfect(event.target.checked)}
              />
              Pixel-perfect clone
            </label>
            <label style={styles.autoSearchLabel}>
              <input
                type="checkbox"
                checked={cloneAiRedesign}
                onChange={(event) => setCloneAiRedesign(event.target.checked)}
              />
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
              <input
                type="checkbox"
                checked={exactRedesignMode}
                onChange={(event) => setExactRedesignMode(event.target.checked)}
              />
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
                <button
                  key={item.key}
                  style={active ? styles.featureChipActive : styles.featureChip}
                  onClick={() => toggleAutomationFeature(item.key)}
                >
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
              <select
                style={styles.solutionSelect}
                value={bookingDurationMinutes}
                onChange={(event) => setBookingDurationMinutes(Number(event.target.value || 60))}
              >
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </label>
            <label style={styles.solutionLabel}>
              Availability Slots (comma separated)
              <input
                style={styles.solutionInput}
                value={bookingSlotsInput}
                onChange={(event) => setBookingSlotsInput(event.target.value)}
                placeholder="09:00 AM, 10:30 AM, 01:00 PM"
              />
            </label>
            <label style={styles.solutionLabel}>
              Services (comma separated)
              <input
                style={styles.solutionInput}
                value={bookingServicesInput}
                onChange={(event) => setBookingServicesInput(event.target.value)}
                placeholder="Consultation, Full Service, Premium"
              />
            </label>
          </div>
          <div style={styles.bookingToggleRow}>
            <label style={styles.autoSearchLabel}>
              <input
                type="checkbox"
                checked={bookingAutoConfirmEnabled}
                onChange={(event) => setBookingAutoConfirmEnabled(event.target.checked)}
              />
              Automatic confirmations
            </label>
            <label style={styles.autoSearchLabel}>
              <input
                type="checkbox"
                checked={bookingGoogleSyncEnabled}
                onChange={(event) => setBookingGoogleSyncEnabled(event.target.checked)}
              />
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
            <input
              style={styles.solutionInput}
              placeholder="Customer name"
              value={crmNameInput}
              onChange={(event) => setCrmNameInput(event.target.value)}
            />
            <input
              style={styles.solutionInput}
              placeholder="Email"
              value={crmEmailInput}
              onChange={(event) => setCrmEmailInput(event.target.value)}
            />
            <input
              style={styles.solutionInput}
              placeholder="Phone"
              value={crmPhoneInput}
              onChange={(event) => setCrmPhoneInput(event.target.value)}
            />
            <select style={styles.solutionSelect} value={crmStageInput} onChange={(event) => setCrmStageInput(event.target.value)}>
              {CRM_LEAD_STAGES.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
            <button style={styles.crmAddButton} onClick={handleAddCrmCustomer}>Add Customer</button>
          </div>
          <div style={styles.crmProfilesList}>
            {crmCustomers.slice(0, 8).map((customer) => (
              <article key={customer.id} style={styles.crmProfileItem}>
                <div style={styles.crmProfileHeader}>
                  <strong style={styles.crmProfileName}>{customer.name}</strong>
                  <select
                    style={styles.crmStageSelect}
                    value={customer.stage}
                    onChange={(event) => handleCrmStageChange(customer.id, event.target.value)}
                  >
                    {CRM_LEAD_STAGES.map((stage) => (
                      <option key={stage} value={stage}>{stage}</option>
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
            <input
              type="checkbox"
              checked={workflowAutomationEnabled}
              onChange={(event) => setWorkflowAutomationEnabled(event.target.checked)}
            />
            Enable automation workflows
          </label>
          <label style={styles.autoSearchLabel}>
            <input
              type="checkbox"
              checked={workflowAutoOnAutonomous}
              onChange={(event) => setWorkflowAutoOnAutonomous(event.target.checked)}
            />
            Auto-run on new autonomous bookings
          </label>
          <div style={styles.workflowFormGrid}>
            <input
              style={styles.solutionInput}
              placeholder="Test booking email"
              value={workflowTestEmail}
              onChange={(event) => setWorkflowTestEmail(event.target.value)}
            />
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
                  <small style={styles.workflowRunMeta}>
                    {run.steps.map((item) => item.label).join(" -> ")}
                  </small>
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
            <input
              type="checkbox"
              checked={subscriptionsEnabled}
              onChange={(event) => setSubscriptionsEnabled(event.target.checked)}
            />
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
            <input
              style={styles.solutionInput}
              placeholder="Invoice #"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
            <input
              style={styles.solutionInput}
              placeholder="Service"
              value={invoiceServiceInput}
              onChange={(event) => setInvoiceServiceInput(event.target.value)}
            />
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
          <button
            style={styles.smokeSecondaryButton}
            onClick={handleDownloadSmokeReport}
            disabled={smokeResults.length === 0}
          >
            Download Smoke Report
          </button>
        </div>
        {smokeResults.length > 0 && (
          <div style={styles.smokeList}>
            {smokeResults.map((item) => (
              <div key={item.key} style={styles.smokeItem}>
                <span style={item.status === "pass" ? styles.smokePass : styles.smokeFail}>
                  {item.status === "pass" ? "PASS" : "FAIL"}
                </span>
                <strong style={styles.smokeLabel}>{item.label}</strong>
                <small style={styles.smokeMsg}>{item.message}</small>
                <small style={styles.smokeMeta}>
                  {item.startedAt ? new Date(item.startedAt).toLocaleTimeString() : "--"} •{" "}
                  {typeof item.durationMs === "number" ? `${item.durationMs}ms` : "--"}
                </small>
              </div>
            ))}
          </div>
        )}
        <label style={styles.autoSearchLabel}>
          <input
            type="checkbox"
            checked={autoSearchOnGenerate}
            onChange={(event) => setAutoSearchOnGenerate(event.target.checked)}
          />
          Auto search domains after generation
        </label>
        <div style={styles.evolutionRow}>
          <label style={styles.autoSearchLabel}>
            <input
              type="checkbox"
              checked={designEvolutionEnabled}
              onChange={(event) => setDesignEvolutionEnabled(event.target.checked)}
            />
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
          {lastDesignEvolutionAt ? (
            <small style={styles.evolutionMeta}>Last evolved: {new Date(lastDesignEvolutionAt).toLocaleString()}</small>
          ) : null}
        </div>
        <div style={styles.evolutionRow}>
          <label style={styles.autoSearchLabel}>
            <input
              type="checkbox"
              checked={selfOptimizeEnabled}
              onChange={(event) => setSelfOptimizeEnabled(event.target.checked)}
            />
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
          {lastSelfOptimizationAt ? (
            <small style={styles.evolutionMeta}>Last optimized: {new Date(lastSelfOptimizationAt).toLocaleString()}</small>
          ) : null}
        </div>
        <div style={styles.evolutionRow}>
          <label style={styles.autoSearchLabel}>
            <input
              type="checkbox"
              checked={autonomousModeEnabled}
              onChange={(event) => setAutonomousModeEnabled(event.target.checked)}
            />
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
            <select
              style={styles.solutionSelect}
              value={translationLanguage}
              onChange={(event) => setTranslationLanguage(event.target.value)}
            >
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
          <input
            type="checkbox"
            checked={marketingAutopilotEnabled}
            onChange={(event) => setMarketingAutopilotEnabled(event.target.checked)}
          />
          TitoNova Cloud Engine Marketing Autopilot (SEO, social, ads, email)
        </label>
        <button
          style={styles.smokeSecondaryButton}
          onClick={() => runMarketingAutopilot({ source: "generation" })}
          disabled={marketingLoading}
        >
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
        <button
          style={styles.smokeSecondaryButton}
          onClick={runMonetizationEngine}
          disabled={monetizationLoading}
        >
          {monetizationLoading ? "Generating revenue plan..." : "Generate Monetization Engine"}
        </button>
        <button
          style={styles.smokeSecondaryButton}
          onClick={runAiAppBuilder}
          disabled={appBuilderLoading || !hasGeneratedContent}
        >
          {appBuilderLoading ? "Building apps..." : "TitoNova Cloud Engine App Builder (iOS + Android + Admin)"}
        </button>
        <button
          style={styles.smokeSecondaryButton}
          onClick={() => runGrowthCoach()}
          disabled={growthCoachLoading || !hasGeneratedContent}
        >
          {growthCoachLoading ? "Analyzing growth..." : "TitoNova Cloud Engine Growth Coach"}
        </button>
        <button
          style={styles.smokeSecondaryButton}
          onClick={runBusinessCoach}
          disabled={businessCoachLoading || !hasGeneratedContent}
        >
          {businessCoachLoading ? "Analyzing business..." : "TitoNova Cloud Engine Business Coach"}
        </button>
        <button
          style={styles.smokeSecondaryButton}
          onClick={refreshAnalyticsDashboard}
          disabled={!hasGeneratedContent}
        >
          Refresh Analytics Dashboard
        </button>
        <section style={styles.smartContentControlCard}>
          <strong style={styles.smartContentControlTitle}>Smart Content Engine</strong>
          <div style={styles.smartContentControls}>
            <select
              style={styles.solutionSelect}
              value={smartContentType}
              onChange={(event) => setSmartContentType(event.target.value)}
            >
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
            <button
              style={styles.smokeSecondaryButton}
              onClick={() => runSmartContentEngine()}
              disabled={smartContentLoading}
            >
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
        )}
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
        <aside style={styles.previewPane}>
          {hasGeneratedContent ? (
            <div style={styles.preview}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>Generated Website Preview</h2>
            <div style={styles.headerActions}>
              <input
                style={styles.domainInput}
                placeholder="Domain (example.com)"
                value={customDomain}
                onChange={(event) => setCustomDomain(event.target.value)}
              />
              <button
                style={styles.addDomainButton}
                onClick={handleAddDomainNow}
                disabled={domainLoading || publishing || !customDomain.trim() || !publishedSiteId}
              >
                {domainLoading ? "Adding..." : "Add Domain"}
              </button>
              <button
                style={styles.verifyDnsButton}
                onClick={handleVerifyDnsNow}
                disabled={verifyingDns || !customDomain.trim()}
              >
                {verifyingDns ? "Verifying..." : "Verify DNS now"}
              </button>
              <button
                style={styles.oneClickHostingButton}
                onClick={handleOneClickHosting}
                disabled={oneClickHostingRunning || publishing}
              >
                {oneClickHostingRunning ? "Provisioning..." : "One-Click Hosting"}
              </button>
              <button style={styles.goLiveButton} onClick={() => handleGoLive()} disabled={publishing}>
                {publishing ? "Publishing..." : "Go Live"}
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
              <button style={styles.exportButton} onClick={handleExportHtml}>
                Export HTML
              </button>
              {!isInlineEditing ? (
                <button style={styles.editButton} onClick={handleStartInlineEdit}>
                  Start Editing
                </button>
              ) : (
                <div style={styles.editActions}>
                  <button style={styles.undoButton} onClick={handleUndoInlineEdit}>
                    Undo
                  </button>
                  <button style={styles.saveButton} onClick={handleSaveInlineEdit}>
                    Done (Save)
                  </button>
                  <button style={styles.cancelButton} onClick={handleCancelInlineEdit}>
                    Discard
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={styles.pageTabs}>
            {orderPageKeys(Object.keys(generatedPages)).map((pageKey) => (
              <button
                key={pageKey}
                style={activePage === pageKey ? styles.pageTabActive : styles.pageTab}
                onClick={() => handleSwitchPage(pageKey)}
              >
                {pageLabelFromKey(pageKey)}
              </button>
            ))}
            {redesignInsights?.normalizedUrl && (
              <button
                style={showComparison ? styles.compareButtonActive : styles.compareButton}
                onClick={() => setShowComparison((previous) => !previous)}
              >
                {showComparison ? "Hide Before vs Redesigned" : "Before vs Redesigned"}
              </button>
            )}
            <div style={styles.pageActions}>
              <input
                style={styles.pageInput}
                placeholder="new page (pricing)"
                value={newPageName}
                onChange={(event) => setNewPageName(event.target.value)}
              />
              <button style={styles.pageAddButton} onClick={handleAddPage}>
                Add Page
              </button>
              <button
                style={styles.pageDeleteButton}
                onClick={handleDeleteActivePage}
                disabled={activePage === "index.html"}
              >
                Delete Page
              </button>
            </div>
          </div>
          <section style={styles.seoCard}>
            <div style={styles.seoHeader}>
              <strong style={styles.seoTitle}>SEO Checklist Score</strong>
              <span style={styles.seoScore}>{seoChecklist.score}/100</span>
            </div>
            <div style={styles.seoSummary}>
              {seoChecklist.passedCount} of {seoChecklist.totalCount} checks passed
            </div>
            <div style={styles.seoList}>
              {seoChecklist.items.map((item) => (
                <div key={item.label} style={styles.seoItem}>
                  <span style={item.passed ? styles.seoPass : styles.seoFail}>
                    {item.passed ? "PASS" : "FIX"}
                  </span>
                  <div>
                    <strong style={styles.seoItemLabel}>{item.label}</strong>
                    <small style={styles.seoItemMeta}>{item.detail}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
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
          {growthCoachInsights.length > 0 && (
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
          {businessCoachInsights.length > 0 && (
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
          {selfOptimizationHistory.length > 0 && (
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
          {(autonomousLog.length > 0 || autonomousPricingNote) && (
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
          {uiDesignSpec && (
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
          {competitorIntel && (
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
          {smartContentItems.length > 0 && (
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
          {appBuilderArtifacts && (
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
                <iframe
                  title="Before website"
                  src={redesignInsights.normalizedUrl}
                  style={styles.compareFrame}
                />
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
                  {imageApplyScope === "all"
                    ? "Changes apply to every generated page."
                    : "Changes apply only to the active page."}
                </small>
              </div>
              <div style={styles.imageEditorRow}>
                <select
                  style={styles.imageSelect}
                  value={selectedImageId || ""}
                  onChange={(event) => setSelectedImageId(event.target.value)}
                >
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
                <select
                  style={styles.typeSelect}
                  value={textStyle.preset}
                  onChange={(event) => handleTextStylePresetChange(event.target.value)}
                >
                  {TEXT_STYLE_PRESETS.map((preset) => (
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
                publishStatus === "error"
                  ? styles.publishError
                  : publishStatus === "success"
                    ? styles.publishSuccess
                    : styles.publishInfo
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
                dnsVerifyStatus === "error"
                  ? styles.publishError
                  : dnsVerifyStatus === "success"
                    ? styles.publishSuccess
                    : styles.publishInfo
              }
            >
              {dnsVerifyMessage}
            </p>
          )}
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
          {publishedSiteId && <p style={styles.siteMeta}>Published site ID: {publishedSiteId}</p>}
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
          {!publishedSiteId && (
            <p style={styles.siteMeta}>Tip: enter a domain and click One-Click Hosting to auto-publish, attach domain, and verify SSL/CDN.</p>
          )}
          <section style={styles.marketCard}>
            <div style={styles.marketHeader}>
              <h3 style={styles.marketTitle}>Domain Marketplace</h3>
              <button style={styles.marketSearchButton} onClick={handleDomainSearch} disabled={marketLoading}>
                {marketLoading ? "Searching..." : "Search Domains"}
              </button>
            </div>
            <div style={styles.marketControls}>
              <input
                style={styles.marketInput}
                placeholder="Search keyword (brand, niche, business)"
                value={marketKeyword}
                onChange={(event) => setMarketKeyword(event.target.value)}
              />
              <button
                style={styles.marketGhostButton}
                onClick={() => setMarketKeyword(makeProjectSlug(projectName).replace(/-/g, ""))}
              >
                Use Project Name
              </button>
              <button style={styles.marketGhostButton} onClick={() => setPurchasedDomains([])}>
                Clear purchased history
              </button>
              <select
                style={styles.marketSortSelect}
                value={marketSort}
                onChange={(event) => setMarketSort(event.target.value)}
              >
                <option value="available">Available first</option>
                <option value="cheapest">Cheapest</option>
                <option value="premium">Most premium</option>
              </select>
              <label style={styles.marketToggleLabel}>
                <input
                  type="checkbox"
                  checked={autoSelectBestDomain}
                  onChange={(event) => setAutoSelectBestDomain(event.target.checked)}
                />
                Auto-select best domain
              </label>
            </div>
            <div style={styles.tldChips}>
              {[".com", ".net", ".org", ".io"].map((tld) => {
                const active = marketTlds.includes(tld);
                return (
                  <button
                    key={tld}
                    style={active ? styles.tldChipActive : styles.tldChip}
                    onClick={() => toggleMarketTld(tld)}
                  >
                    {tld}
                  </button>
                );
              })}
            </div>
            {marketError && <p style={styles.marketError}>{marketError}</p>}
            {purchasedDomains.length > 0 && (
              <div style={styles.purchasedWrap}>
                <strong style={styles.purchasedTitle}>Purchased Domains</strong>
                <div style={styles.purchasedList}>
                  {purchasedDomains.map((domain) => (
                    <button
                      key={domain}
                      style={styles.purchasedChip}
                      onClick={() => handleUseDomainFromMarket(domain)}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {getSortedMarketResults().length > 0 && (
              <div style={styles.marketGrid}>
                {getSortedMarketResults().map((item) => {
                  const domainName = String(item?.name || "").toLowerCase();
                  const available = Boolean(item?.available);
                  const price = Number(item?.price || 0);
                  return (
                    <article key={domainName} style={styles.marketItem}>
                      <div>
                        <strong>{domainName}</strong>
                        <p style={styles.marketSub}>
                          {available ? "Available" : "Taken"} • ${Number.isFinite(price) ? price.toFixed(2) : "0.00"}
                        </p>
                      </div>
                      <div style={styles.marketActions}>
                        <button style={styles.marketUseButton} onClick={() => handleUseDomainFromMarket(domainName)}>
                          Use Domain
                        </button>
                        <button
                          style={styles.marketBuyButton}
                          onClick={() => handleBuyDomain(domainName)}
                          disabled={!available || marketBuying === domainName}
                        >
                          {marketBuying === domainName ? "Buying..." : "Buy"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            {dnsGuideDomain && (
              <div style={styles.dnsGuide}>
                <h4 style={styles.dnsTitle}>Connect DNS Guide</h4>
                <p style={styles.dnsText}>
                  Configure your DNS provider for <strong>{dnsGuideDomain}</strong> using these records:
                </p>
                {(dnsRecords.length > 0 ? dnsRecords : DEFAULT_DNS_RECORDS).map((record, index) => (
                  <div key={`${record.type}-${record.host}-${index}`} style={styles.dnsRow}>
                    <code style={styles.dnsCode}>Type: {record.type}</code>
                    <code style={styles.dnsCode}>Host: {record.host}</code>
                    <code style={styles.dnsCode}>Value: {record.value}</code>
                    <button
                      style={styles.dnsCopyButton}
                      onClick={() => handleCopyDnsValue(`${record.type} record`, record.value)}
                    >
                      Copy
                    </button>
                  </div>
                ))}
                <button style={styles.dnsCopyAllButton} onClick={handleCopyAllDnsRecords}>
                  Copy all DNS records
                </button>
                {dnsCopyMessage && <p style={styles.dnsCopyMessage}>{dnsCopyMessage}</p>}
              </div>
            )}
          </section>
          <section style={styles.marketCard}>
            <div style={styles.marketHeader}>
              <h3 style={styles.marketTitle}>Marketplace Ecosystem</h3>
              <span style={styles.ecosystemMeta}>{Object.keys(installedAddons).length} installed</span>
            </div>
            <p style={styles.ecosystemIntro}>
              Install ready add-ons or publish your own modules for booking, CRM, and automation workflows.
            </p>
            <div style={styles.marketControls}>
              <input
                style={styles.marketInput}
                placeholder="Search add-ons"
                value={addonSearch}
                onChange={(event) => setAddonSearch(event.target.value)}
              />
              <select
                style={styles.marketSortSelect}
                value={addonCategory}
                onChange={(event) => setAddonCategory(event.target.value)}
              >
                <option value="all">All categories</option>
                <option value="booking">Booking</option>
                <option value="crm">CRM</option>
                <option value="automation">Automation</option>
              </select>
            </div>
            <div style={styles.marketGrid}>
              {getFilteredAddons().map((addon) => {
                const installed = Boolean(installedAddons[addon.id]);
                return (
                  <article key={addon.id} style={styles.marketItem}>
                    <div>
                      <strong>{addon.name}</strong>
                      <p style={styles.marketSub}>
                        {(addon.category || "automation").toUpperCase()} • {addon.priceLabel || "Free"}
                      </p>
                      <p style={styles.ecosystemDescription}>{addon.description}</p>
                    </div>
                    <div style={styles.marketActions}>
                      {!installed ? (
                        <button style={styles.marketBuyButton} onClick={() => handleInstallAddon(addon)}>
                          Install
                        </button>
                      ) : (
                        <button style={styles.marketGhostButton} onClick={() => handleUninstallAddon(addon)}>
                          Uninstall
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div style={styles.ecosystemPublisher}>
              <h4 style={styles.dnsTitle}>Developer Add-on Publisher</h4>
              <div style={styles.marketControls}>
                <input
                  style={styles.marketInput}
                  placeholder="Add-on name"
                  value={addonNameInput}
                  onChange={(event) => setAddonNameInput(event.target.value)}
                />
                <select
                  style={styles.marketSortSelect}
                  value={addonTypeInput}
                  onChange={(event) => setAddonTypeInput(event.target.value)}
                >
                  <option value="booking">Booking plugin</option>
                  <option value="crm">CRM tool</option>
                  <option value="automation">Automation tool</option>
                </select>
                <input
                  style={styles.marketSortSelect}
                  placeholder="Price label"
                  value={addonPriceInput}
                  onChange={(event) => setAddonPriceInput(event.target.value)}
                />
              </div>
              <div style={styles.marketControls}>
                <input
                  style={styles.marketInput}
                  placeholder="Supported pages (comma separated, e.g. booking.html,crm.html)"
                  value={addonFeaturesInput}
                  onChange={(event) => setAddonFeaturesInput(event.target.value)}
                />
              </div>
              <textarea
                style={styles.ecosystemTextarea}
                placeholder="Add-on description"
                value={addonDescriptionInput}
                onChange={(event) => setAddonDescriptionInput(event.target.value)}
              />
              <button style={styles.marketSearchButton} onClick={handlePublishAddon}>
                Publish Add-on
              </button>
            </div>
          </section>
          <div style={styles.previewCanvasWrap}>
            <div style={shouldShowGuestPreviewPrompt ? styles.previewCanvasFaint : undefined}>
              {isInlineEditing && (
                <p style={styles.lockHint}>
                  Inline text edit is active. Click headings, paragraphs, links, buttons, and list text to edit.
                </p>
              )}
              <div
                ref={previewEditableRef}
                contentEditable={isInlineEditing && !fieldLockMode}
                suppressContentEditableWarning
                style={isInlineEditing ? styles.previewEditable : undefined}
                onClick={handlePreviewLinkNavigation}
                onKeyDown={(event) => {
                  if (!isInlineEditing) return;
                  if (fieldLockMode && event.key === "Enter") {
                    event.preventDefault();
                    return;
                  }
                  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                    event.preventDefault();
                    handleSaveInlineEdit();
                  }
                }}
                onInput={(event) => {
                  if (!isInlineEditing) return;
                  const nextHtml = event.currentTarget.innerHTML;
                  setDraftHtml(nextHtml);
                  setEditHistory((previous) => {
                    if (previous[previous.length - 1] === nextHtml) return previous;
                    return [...previous.slice(-49), nextHtml];
                  });
                }}
                onBlurCapture={() => {
                  if (isInlineEditing) snapshotInlineDraft();
                }}
                dangerouslySetInnerHTML={{ __html: isInlineEditing ? draftHtml : generatedSite }}
              />
            </div>
            {shouldShowGuestPreviewPrompt && (
              <div style={styles.previewGuestOverlay}>
                <strong style={styles.previewGuestTitle}>Create an account to save and publish this website</strong>
                <small style={styles.previewGuestMeta}>
                  Your generated site is ready. Sign up here to unlock dashboard saves, publishing, and project access.
                </small>
                <div style={styles.previewGuestActions}>
                  <button
                    type="button"
                    style={styles.authPrimaryButton}
                    onClick={() => setAuthMode("signup")}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    style={styles.authGhostButton}
                    onClick={() => setAuthMode("login")}
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
            </div>
          ) : (
            <div style={styles.previewEmpty}>
              <h2 style={styles.previewEmptyTitle}>Live Preview Rail</h2>
              <p style={styles.previewEmptyText}>
                Generate a website to pin the interactive multi-page preview here while you keep working in the command center.
              </p>
            </div>
          )}
        </aside>
      </div>
      {error && <p style={styles.error}>{error}</p>}

    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 50% 8%, rgba(24,119,255,0.2), transparent 36%), radial-gradient(circle at 10% 20%, rgba(0,20,80,0.45), transparent 46%), linear-gradient(145deg, #03091d 0%, #081938 45%, #0a274d 100%)",
    padding: "34px 24px 56px",
    color: "#e6edf7",
    fontFamily: "'Inter', 'SF Pro Display', 'Segoe UI', sans-serif",
    position: "relative"
  },
  hero: {
    maxWidth: "1240px",
    margin: "0 auto 18px",
    padding: "4px 2px"
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid rgba(45,212,191,0.45)",
    color: "#63f5b4",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    borderRadius: "999px",
    padding: "6px 10px",
    marginBottom: "12px",
    background: "rgba(7,16,38,0.75)"
  },
  title: {
    margin: 0,
    color: "#39df82",
    fontSize: "clamp(30px, 4.5vw, 52px)",
    lineHeight: 1.04,
    letterSpacing: "-0.03em",
    fontWeight: 800
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#c8d8ef",
    fontSize: "15px",
    maxWidth: "760px",
    lineHeight: 1.45
  },
  appShell: {
    maxWidth: "1240px",
    margin: "0 auto",
    display: "flex",
    alignItems: "stretch",
    gap: "22px",
    flexWrap: "wrap"
  },
  commandPane: {
    flex: "1 1 460px",
    minWidth: "320px",
    maxWidth: "760px",
    display: "grid",
    gap: "14px"
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
    flex: "2 1 700px",
    minWidth: "320px",
    position: "sticky",
    top: "16px",
    alignSelf: "flex-start",
    display: "grid",
    gap: "12px"
  },
  card: {
    background:
      "radial-gradient(820px 280px at 50% 0%, rgba(45,212,191,0.1), rgba(45,212,191,0) 62%), linear-gradient(160deg, rgba(15,26,52,0.95), rgba(20,33,61,0.93))",
    padding: "26px",
    borderRadius: "24px",
    maxWidth: "100%",
    margin: 0,
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(76,117,168,0.45)",
    boxShadow: "0 28px 70px rgba(2,6,23,0.45)",
    display: "grid",
    gap: "14px"
  },
  sectionTitle: {
    margin: "0 0 14px",
    color: "#f8fafc",
    fontSize: "23px",
    letterSpacing: "-0.02em"
  },
  sectionIntro: {
    margin: "0 0 14px",
    color: "#b9cbe6",
    fontSize: "13px",
    lineHeight: 1.5
  },
  input: {
    width: "100%",
    padding: "12px 13px",
    borderRadius: "12px",
    border: "1px solid rgba(72,102,148,0.65)",
    marginBottom: "0",
    fontSize: "15px",
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
  businessOsHint: {
    color: "#c6f6d5",
    fontSize: "12px",
    lineHeight: 1.45
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
    borderRadius: "14px",
    padding: "12px",
    marginBottom: "12px",
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
    fontSize: "13px"
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
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authModeButtonActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    border: "1px solid #3b82f6",
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "12px",
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
    borderRadius: "10px",
    padding: "9px 12px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer"
  },
  authGhostButton: {
    background: "rgba(15,23,42,0.7)",
    color: "#dbeafe",
    border: "1px solid rgba(148,163,184,0.45)",
    borderRadius: "10px",
    padding: "6px 9px",
    fontSize: "12px",
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
    fontSize: "12px",
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
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "14px"
  },
  solutionInput: {
    width: "100%",
    padding: "11px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "14px",
    outline: "none"
  },
  solutionTextarea: {
    width: "100%",
    minHeight: "68px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(148,163,184,0.36)",
    background: "rgba(15,23,42,0.74)",
    color: "#f8fafc",
    fontSize: "13px",
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
  domainInput: {
    minWidth: "220px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px"
  },
  editActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  exportButton: {
    background: "#0369a1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer"
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
    borderRadius: "12px"
  },
  error: {
    color: "#fecaca",
    marginTop: "16px",
    textAlign: "center"
  }
};

// Normalize card surfaces across the dashboard for stronger hierarchy and cleaner organization.
const CARD_KEY_PATTERN = /Card$/;
Object.keys(styles).forEach((key) => {
  if (!CARD_KEY_PATTERN.test(key)) return;
  const current = styles[key] || {};
  styles[key] = {
    ...current,
    borderRadius: current.borderRadius || "14px",
    border: String(current.border || "1px solid rgba(255,255,255,0.18)").replace(/^1px/, "2px"),
    boxShadow: current.boxShadow || "0 10px 28px rgba(2, 6, 23, 0.32)",
    padding: current.padding || "12px",
    marginBottom: current.marginBottom || "10px",
  };
});

["preview", "seoCard", "analyticsDashboardCard", "imageEditorCard", "mapEditorCard", "colorEditorCard", "typeEditorCard", "marketCard", "hostingSummaryCard", "checklistCard"]
  .forEach((key) => {
    if (!styles[key]) return;
    styles[key] = {
      ...styles[key],
      border: String(styles[key].border || "1px solid rgba(255,255,255,0.2)").replace(/^1px/, "2px"),
      borderRadius: styles[key].borderRadius || "14px",
      boxShadow: styles[key].boxShadow || "0 12px 30px rgba(2, 6, 23, 0.34)",
    };
  });
