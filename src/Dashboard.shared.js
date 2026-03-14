export const HOSTING_BASE_URL = String(import.meta.env.VITE_HOSTING_API_BASE_URL || "").replace(/\/$/, "");
export const REGISTRAR_BASE_URL = String(import.meta.env.VITE_REGISTRAR_API_BASE_URL || "").replace(/\/$/, "");
export const HOSTING_GATEWAY_TOKEN = String(import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "");
export const EXPORT_FRAMEWORK_OPTIONS = ["html", "react", "nextjs", "vue", "webflow", "tailwind"];
export const GENERATE_REQUEST_TIMEOUT_MS = 45000;
export const fetchWithTimeout = async (url, options = {}, timeoutMs = GENERATE_REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), Math.max(1000, Number(timeoutMs) || GENERATE_REQUEST_TIMEOUT_MS));
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Generation timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
};
export const isLocalHostName = (value) => /^(localhost|127\.0\.0\.1)$/i.test(String(value || ""));
export const isUsableApiBaseUrl = (rawUrl, allowLocalHost = false) => {
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
export const DEFAULT_DNS_RECORDS = [
  { type: "A", host: "@", value: "76.76.21.21" },
  { type: "CNAME", host: "www", value: "cname.vercel-dns.com" },
];
export const DEFAULT_HOSTING_PROFILE = {
  domain: "",
  sslEnabled: false,
  cdnEnabled: false,
  tier: "Fast Hosting",
  verified: false,
  provider: "gateway",
  liveUrl: "",
  updatedAt: "",
};

export const PURCHASED_DOMAINS_STORAGE_KEY = "titonova_purchased_domains_v1";
export const DEVELOPER_ADDONS_STORAGE_KEY = "titonova_developer_addons_v1";
export const INSTALLED_ADDONS_STORAGE_KEY = "titonova_installed_addons_v1";
export const AUTH_TOKEN_STORAGE_KEY = "titonova_auth_token_v1";
export const AUTH_USER_STORAGE_KEY = "titonova_auth_user_v1";
export const BUSINESS_OS_REQUIRED_FEATURE_KEYS = [
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
export const CORE_ADDON_CATALOG = [
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
export const CORE_PAGE_DEFS = [
  { key: "index.html", label: "Home", matcher: /home/i },
  { key: "about.html", label: "About", matcher: /about/i },
  { key: "services.html", label: "Services", matcher: /service/i },
  { key: "pricing.html", label: "Pricing", matcher: /(pricing|plans|packages|rates)/i },
  { key: "contact.html", label: "Contact", matcher: /contact/i },
  { key: "landing.html", label: "Landing", matcher: /(landing|campaign)/i },
  { key: "blog.html", label: "Blog", matcher: /blog/i },
];
export const AUTOMATION_PAGE_DEFS = [
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
export const REVENUE_MODULE_KEYS = [
  "subscriptions.html",
  "booking.html",
  "digital-products.html",
  "memberships.html",
  "affiliates.html",
  "payments.html",
];
export const INDUSTRY_TEMPLATE_PACKAGES = [
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
export const DEFAULT_INDUSTRY_TEMPLATE = "healthcare-hcbs";
export const buildFeatureFlagsForIndustry = (industryKey) => {
  const pkg = INDUSTRY_TEMPLATE_PACKAGES.find((item) => item.key === industryKey) || INDUSTRY_TEMPLATE_PACKAGES[0];
  const nextFlags = Object.fromEntries(AUTOMATION_PAGE_DEFS.map((page) => [page.key, false]));
  pkg.modules.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(nextFlags, key)) nextFlags[key] = true;
  });
  return nextFlags;
};
export const buildIndustryBlueprintPrompt = (pkg) => {
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
export const DEFAULT_THEME_COLORS = {
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
export const TEXT_STYLE_PRESETS = [
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
export const DEFAULT_TEXT_STYLE = {
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
export const DESIGN_EVOLUTION_THEMES = [
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
export const UI_LAYOUT_VARIANTS = ["split-hero", "stacked-hero", "editorial"];
export const SMART_CONTENT_TYPE_OPTIONS = [
  { key: "blog-posts", label: "Blog Posts" },
  { key: "landing-pages", label: "Landing Pages" },
  { key: "faqs", label: "FAQs" },
  { key: "product-descriptions", label: "Product Descriptions" },
];
export const QUICK_PROMPT_CHIPS = [
  "Cleaning company",
  "Home care agency",
  "Restaurant website",
  "SaaS landing page",
  "Portfolio site",
];
export const AI_LAYOUT_VARIANT_OPTIONS = [
  { key: "corporate", label: "Version A: Corporate" },
  { key: "minimal", label: "Version B: Minimal" },
  { key: "bold", label: "Version C: Bold" },
];
export const SMART_COMPONENT_LIBRARY = ["hero", "testimonials", "pricing", "faq", "cta"];
export const FUNNEL_REQUIRED_KEYS = ["marketing-pages.html", "booking.html", "payments.html", "pricing.html"];
export const CRM_LEAD_STAGES = ["New Leads", "Contacted", "Booked", "Completed"];
export const CRM_SALES_PIPELINE = ["Lead", "Consultation", "Proposal", "Won"];
export const PAYMENT_PROVIDER_KEYS = ["Stripe", "PayPal", "Apple Pay", "Google Pay"];
export const BOOKING_AUTOMATION_STEPS = [
  "New Booking",
  "Send Confirmation Email",
  "Add to CRM",
  "Send Reminder 24h Before",
];
export const DEFAULT_CRM_CUSTOMERS = [
  { id: "crm-1", name: "Jordan Miles", email: "jordan@example.com", phone: "(555) 120-9911", bookings: 1, payments: 149, stage: "Contacted" },
  { id: "crm-2", name: "Avery Stone", email: "avery@example.com", phone: "(555) 348-1122", bookings: 2, payments: 420, stage: "Booked" },
  { id: "crm-3", name: "Riley Carter", email: "riley@example.com", phone: "(555) 872-4400", bookings: 3, payments: 780, stage: "Completed" },
];
export const SECTION_ID_ALIASES = {
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

export const safeJsonParse = (value, fallback = {}) => {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
};

export const SECTION_KEY_ALIASES = {
  hero: "hero",
  feature: "features",
  features: "features",
  service: "services",
  services: "services",
  pricing: "pricing",
  plans: "pricing",
  testimonial: "testimonials",
  testimonials: "testimonials",
  faq: "faq",
  faqs: "faq",
  cta: "cta",
  "call to action": "cta",
  contact: "contact_form",
  "contact form": "contact_form",
  booking: "booking_widget",
  "booking widget": "booking_widget",
  about: "about",
  team: "team",
  blog: "blog",
  gallery: "gallery",
};

export const normalizeSectionKey = (value) => {
  const raw = String(value || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9\s_-]/g, " ")
    .trim();
  if (!raw) return "";
  if (SECTION_KEY_ALIASES[raw]) return SECTION_KEY_ALIASES[raw];
  const compact = raw.replace(/\s+/g, " ");
  if (SECTION_KEY_ALIASES[compact]) return SECTION_KEY_ALIASES[compact];
  return "";
};

export const extractStructuredSectionsFromPrompt = (promptText) => {
  const lines = String(promptText || "")
    .split(/\n+/)
    .map((line) => String(line || "").trim())
    .filter(Boolean);
  const sections = [];
  let inSectionsBlock = false;
  const pushSection = (value) => {
    const normalized = normalizeSectionKey(value);
    if (!normalized || sections.includes(normalized)) return;
    sections.push(normalized);
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isSectionHeader = /^(include|required|add)?\s*sections?\s*:/.test(lower);
    if (isSectionHeader) {
      inSectionsBlock = true;
        const afterColon = line.split(":").slice(1).join(":").trim();
        if (afterColon) {
          afterColon
          .split(/[,|]/)
          .map((part) => part.trim())
          .filter(Boolean)
          .forEach(pushSection);
        }
      continue;
    }

    const bulletCandidate = line.replace(/^[-*•\d.)\s]+/, "").trim();
    const looksLikeStandaloneSection = /^[a-z][a-z0-9\s_-]{1,40}$/i.test(bulletCandidate);
    if (inSectionsBlock && looksLikeStandaloneSection) {
      pushSection(bulletCandidate);
      continue;
    }

    if (inSectionsBlock && /^[a-z][a-z0-9\s_-]{1,40}\s*:/i.test(line)) {
      const headingOnly = line.replace(/:.*/, "").trim();
      pushSection(headingOnly);
      continue;
    }

    if (inSectionsBlock && /^(brand|style|tone|color|colors)\b/i.test(lower)) {
      inSectionsBlock = false;
    }
  }

  return sections.slice(0, 12);
};

export const parseStructuredBusinessPrompt = (promptText) => {
  const result = {
    businessName: "",
    industry: "",
    pages: [],
    services: [],
    contact: {},
    style: "",
    colors: [],
    features: [],
  };
  const lines = String(promptText || "")
    .split(/\n/)
    .map((line) => String(line || "").trim());
  let currentBlock = "";
  const pushUnique = (list, value, max = 20) => {
    const safe = String(value || "").trim();
    if (!safe) return;
    if (!list.includes(safe) && list.length < max) list.push(safe);
  };
  const normalizeBlockLabel = (label) => {
    const normalized = String(label || "").trim().toLowerCase();
    if (["pages", "sections", "services", "features", "contact"].includes(normalized)) return normalized;
    return "";
  };
  const assignStructuredValue = (label, value) => {
    if (label === "business name" || label === "company name" || label === "brand name") {
      result.businessName = value;
      currentBlock = "";
      return true;
    }
    if (label === "industry") {
      result.industry = value;
      currentBlock = "";
      return true;
    }
    if (label === "phone") {
      result.contact.phone = value;
      currentBlock = "contact";
      return true;
    }
    if (label === "email") {
      result.contact.email = value;
      currentBlock = "contact";
      return true;
    }
    if (label === "contact person" || label === "contact" || label === "owner") {
      if (value) result.contact.person = value;
      currentBlock = "contact";
      return true;
    }
    if (label === "style" || label === "design style") {
      result.style = value;
      currentBlock = "";
      return true;
    }
    if (label === "colors" || label === "brand colors" || label === "color scheme") {
      result.colors = value
        .split(/[,|]/)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 12);
      currentBlock = "";
      return true;
    }
    const blockLabel = normalizeBlockLabel(label);
    if (!blockLabel) return false;
    currentBlock = blockLabel;
    value
      .split(/[,|]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((token) => {
        if (blockLabel === "pages") pushUnique(result.pages, token, 24);
        if (blockLabel === "services") pushUnique(result.services, token, 24);
        if (blockLabel === "sections" || blockLabel === "features") pushUnique(result.features, token, 24);
      });
    return true;
  };

  lines.forEach((line) => {
    if (!line) return;
    const normalizedLine = line.replace(/^[-*•\d.)\s]+/, "").trim();
    const kv = normalizedLine.match(/^([a-z][a-z0-9\s&/_-]{1,60})\s*:\s*(.*)$/i);
    if (kv) {
      const label = kv[1].trim().toLowerCase();
      const value = kv[2].trim();
      if (assignStructuredValue(label, value)) return;
    }

    const bullet = normalizedLine;
    if (!bullet) return;
    if (currentBlock === "pages") {
      pushUnique(result.pages, bullet, 24);
      return;
    }
    if (currentBlock === "services") {
      pushUnique(result.services, bullet, 24);
      return;
    }
    if (currentBlock === "sections" || currentBlock === "features") {
      pushUnique(result.features, bullet, 24);
      return;
    }
    if (currentBlock === "contact") {
      const bulletKv = bullet.match(/^([a-z][a-z0-9\s&/_-]{1,60})\s*:\s*(.+)$/i);
      if (bulletKv) {
        const bulletLabel = bulletKv[1].trim().toLowerCase();
        const bulletValue = bulletKv[2].trim();
        if (assignStructuredValue(bulletLabel, bulletValue)) return;
      }
      if (/@/.test(bullet)) result.contact.email = bullet.replace(/^email\s*:\s*/i, "").trim();
      else if (/\+?\d[\d\s().-]{6,}/.test(bullet)) result.contact.phone = bullet.replace(/^phone\s*:\s*/i, "").trim();
      else if (!result.contact.person) result.contact.person = bullet.replace(/^contact person\s*:\s*/i, "").trim();
      return;
    }
  });

  return result;
};

export const inferConversionLayoutSections = (industryText) => {
  const lower = String(industryText || "").toLowerCase();
  if (/(saas|software|startup|ai|tech|platform)/.test(lower)) {
    return ["hero", "features", "pricing", "testimonials", "faq", "cta", "contact_form"];
  }
  if (/(health|healthcare|medical|clinic|hcbs|care|therapy|rehab)/.test(lower)) {
    return ["hero", "services", "about", "testimonials", "faq", "contact_form", "cta"];
  }
  if (/(ecommerce|store|shop|retail|products|catalog)/.test(lower)) {
    return ["hero", "features", "pricing", "testimonials", "cta", "contact_form"];
  }
  if (/(agency|consult|law|attorney|real estate|realtor)/.test(lower)) {
    return ["hero", "services", "about", "testimonials", "faq", "cta", "contact_form"];
  }
  return ["hero", "features", "services", "pricing", "testimonials", "faq", "cta", "contact_form"];
};

export const derivePromptIntelligence = ({
  rawPrompt = "",
  parsedPrompt = {},
  industryHint = "",
  packagePages = [],
  packageServices = [],
} = {}) => {
  const normalizedPrompt = String(rawPrompt || "").trim();
  const structuredSections = extractStructuredSectionsFromPrompt(normalizedPrompt);
  const inferredIndustry = String(parsedPrompt?.industry || industryHint || "").trim();
  const suggestedSections =
    structuredSections.length > 0
      ? structuredSections
      : inferConversionLayoutSections(inferredIndustry).map((token) => normalizeSectionKey(token) || token);
  const suggestedPages =
    Array.isArray(parsedPrompt?.pages) && parsedPrompt.pages.length > 0
      ? parsedPrompt.pages
      : Array.isArray(packagePages) && packagePages.length > 0
        ? packagePages
        : ["Home", "About", "Services", "Pricing", "Contact"];
  const suggestedServices =
    Array.isArray(parsedPrompt?.services) && parsedPrompt.services.length > 0
      ? parsedPrompt.services
      : Array.isArray(packageServices) && packageServices.length > 0
        ? packageServices.slice(0, 6)
        : ["Core Service 1", "Core Service 2", "Core Service 3"];
  const lower = normalizedPrompt.toLowerCase();
  const featureSet = new Set();
  if (/(book|booking|appointment|calendar|schedule)/.test(lower)) featureSet.add("booking");
  if (/(crm|lead|pipeline|contacts)/.test(lower)) featureSet.add("crm");
  if (/(pay|payment|checkout|invoice|billing|stripe)/.test(lower)) featureSet.add("payments");
  if (/(seo|keyword|ranking|search)/.test(lower)) featureSet.add("seo");
  if (/(email|automation|drip|campaign)/.test(lower)) featureSet.add("email_automation");
  if (/(analytics|metrics|dashboard|tracking)/.test(lower)) featureSet.add("analytics");
  if (/(hcbs|care|health|medical|clinic)/.test(lower)) {
    featureSet.add("booking");
    featureSet.add("crm");
    featureSet.add("payments");
    featureSet.add("email_automation");
  }
  const missing = [];
  if (!String(parsedPrompt?.businessName || "").trim()) missing.push({ key: "business_name", label: "Business Name" });
  if (!String(parsedPrompt?.industry || "").trim()) missing.push({ key: "industry", label: "Industry" });
  if (!Array.isArray(parsedPrompt?.pages) || parsedPrompt.pages.length === 0) missing.push({ key: "pages", label: "Pages" });
  if (!Array.isArray(parsedPrompt?.services) || parsedPrompt.services.length === 0) missing.push({ key: "services", label: "Services" });
  const hasContact =
    String(parsedPrompt?.contact?.phone || "").trim() ||
    String(parsedPrompt?.contact?.email || "").trim() ||
    String(parsedPrompt?.contact?.person || "").trim();
  if (!hasContact) missing.push({ key: "contact", label: "Contact Details" });
  if (!String(parsedPrompt?.style || "").trim()) missing.push({ key: "style", label: "Design Style" });
  if (!Array.isArray(parsedPrompt?.colors) || parsedPrompt.colors.length === 0) missing.push({ key: "colors", label: "Color Scheme" });
  const structureSignals =
    Number(Boolean(parsedPrompt?.businessName)) +
    Number(Boolean(parsedPrompt?.industry)) +
    Number((parsedPrompt?.pages || []).length > 0) +
    Number((parsedPrompt?.services || []).length > 0) +
    Number(Boolean(hasContact)) +
    Number(Boolean(parsedPrompt?.style)) +
    Number((parsedPrompt?.colors || []).length > 0);
  const score = Math.max(10, Math.min(100, 32 + structureSignals * 9 + Math.min(20, featureSet.size * 3) - missing.length * 4));
  return {
    score,
    missing,
    suggestedSections: suggestedSections.slice(0, 12),
    suggestedPages: suggestedPages.slice(0, 12),
    suggestedServices: suggestedServices.slice(0, 8),
    inferredFeatures: Array.from(featureSet),
  };
};

export const buildInstantSectionTemplate = ({ sectionType, projectName, promptText, parsedPrompt }) => {
  const normalizedType = normalizeSectionKey(sectionType) || String(sectionType || "").toLowerCase().trim();
  const safeProject = String(projectName || "Your Business").trim() || "Your Business";
  const safePrompt = String(promptText || "").trim();
  const promptSnippet = safePrompt ? safePrompt.slice(0, 120) : "Built from your prompt details.";

  if (normalizedType === "hero") {
    return {
      type: "hero",
      title: `${safeProject} Website`,
      subtitle: promptSnippet,
      cta: "Get Started",
    };
  }
  if (normalizedType === "features") {
    return { type: "features", items: ["Fast setup", "Modern design", "Conversion-focused sections"] };
  }
  if (normalizedType === "services") {
    const items =
      Array.isArray(parsedPrompt?.services) && parsedPrompt.services.length > 0
        ? parsedPrompt.services.slice(0, 8)
        : ["Core Service 1", "Core Service 2", "Core Service 3"];
    return { type: "services", items };
  }
  if (normalizedType === "pricing") {
    return {
      type: "pricing",
      plans: [
        { name: "Starter", price: "$99" },
        { name: "Growth", price: "$249" },
        { name: "Scale", price: "$499" },
      ],
    };
  }
  if (normalizedType === "testimonials") {
    return { type: "testimonials", items: ["Trusted by teams", "Excellent support", "Fast results"] };
  }
  if (normalizedType === "faq") {
    return { type: "faq", items: ["What is included?", "How fast can we launch?", "Can this be customized?"] };
  }
  if (normalizedType === "contact_form") {
    const contactPerson = String(parsedPrompt?.contact?.person || "").trim();
    const phone = String(parsedPrompt?.contact?.phone || "").trim();
    const email = String(parsedPrompt?.contact?.email || "").trim();
    const contactBits = [contactPerson, phone, email].filter(Boolean).join(" • ");
    return {
      type: "contact_form",
      title: "Contact Us",
      subtitle: contactBits
        ? `Reach us directly: ${contactBits}`
        : "Send us your details and we will follow up quickly.",
    };
  }
  if (normalizedType === "booking_widget") {
    return { type: "booking_widget", title: "Book a Consultation" };
  }
  if (normalizedType === "cta") {
    return { type: "cta", text: "Launch Now" };
  }
  if (normalizedType === "about") {
    return { type: "about", title: `About ${safeProject}`, subtitle: "Our mission, approach, and values." };
  }
  if (normalizedType === "gallery") {
    return { type: "gallery", items: ["Showcase Item 1", "Showcase Item 2", "Showcase Item 3"] };
  }
  return { type: normalizedType || "custom", title: normalizedType || "Section", subtitle: promptSnippet };
};

export const buildInstantPagesFromPrompt = ({ projectName, promptText, pageNames, structuredSections, parsedPrompt }) => {
  const sections = structuredSections.length > 0
    ? structuredSections
    : ["hero", "features", "services", "pricing", "testimonials", "faq", "cta", "contact_form"];
  const uniquePages = Array.from(new Set(pageNames.filter(Boolean))).slice(0, 16);
  return uniquePages.map((pageName) => ({
    name: pageName,
    sections: sections.map((sectionType) =>
      buildInstantSectionTemplate({ sectionType, projectName, promptText, parsedPrompt })
    ),
  }));
};

export const POWER_PROMPT_MARKER = "[TITONOVA_POWER_BRIEF]";
export const POWER_PROMPT_DEFAULT_SECTIONS = [
  "hero",
  "features",
  "services",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "contact_form",
];

export const getEditableComponentSlug = (node) => {
  if (!(node instanceof Element)) return "page";
  const componentRoot =
    node.closest("[data-component], [data-tn-section], section, article, header, footer, nav, aside, main, [id], [class]") || node;
  const raw =
    String(componentRoot.getAttribute("data-component") || "").trim() ||
    String(componentRoot.getAttribute("data-tn-section") || "").trim() ||
    String(componentRoot.getAttribute("id") || "").trim() ||
    String(componentRoot.getAttribute("class") || "").trim() ||
    String(componentRoot.tagName || "page").trim();
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "page";
};

export const getInjectedEditableType = (node) => {
  if (!(node instanceof HTMLElement)) return "";
  const tag = String(node.tagName || "").toLowerCase();
  if (tag === "img") return "image";
  if (tag === "button") return "button";
  if (tag === "a") {
    const classBlob = `${node.className || ""} ${node.getAttribute("role") || ""}`.toLowerCase();
    return /(btn|button|cta|action)/.test(classBlob) ? "button" : "link";
  }
  if (/^(h1|h2|h3|h4|p|li|span|small|strong|em|summary|label)$/.test(tag)) {
    const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (Array.from(node.children).some((child) => child instanceof HTMLElement)) return "";
    return "text";
  }
  return "";
};

export const injectEditableLayerIntoHtml = (html, pageKey = "index.html", makeProjectSlug) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${String(html || "")}</body>`, "text/html");
    const pageSlug = makeProjectSlug(pageKey.replace(/\.html$/i, "") || "page");

    const componentNodes = Array.from(doc.body.querySelectorAll("section, article, header, footer, nav, aside, main"));
    componentNodes.forEach((node, index) => {
      if (!(node instanceof HTMLElement)) return;
      if (!node.dataset.component) {
        node.dataset.component = getEditableComponentSlug(node) || `section-${index + 1}`;
      }
      if (!node.dataset.id) {
        node.dataset.id = `${pageSlug}-${node.dataset.component || `section-${index + 1}`}`;
      }
    });

    const counters = {};
    const editables = Array.from(doc.body.querySelectorAll("h1, h2, h3, h4, p, li, a, button, span, small, strong, em, summary, label, img"));
    editables.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const type = getInjectedEditableType(node);
      if (!type) return;
      const component = getEditableComponentSlug(node);
      counters[`${component}:${type}`] = (counters[`${component}:${type}`] || 0) + 1;
      const sequence = counters[`${component}:${type}`];
      node.dataset.editable = type;
      node.dataset.component = component;
      node.dataset.binding =
        type === "image" ? "src" : type === "link" ? "href" : type === "button" ? "content" : "content";
      node.dataset.id = node.dataset.id || `${pageSlug}-${component}-${type}-${sequence}`;
    });

    return doc.body.innerHTML || String(html || "");
  } catch {
    return String(html || "");
  }
};

export const buildInlineSiteModelFromHtml = (html) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${String(html || "")}</body>`, "text/html");
    const model = {};
    const nodes = Array.from(doc.body.querySelectorAll("[data-editable][data-id]"));
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const id = String(node.dataset.id || "").trim();
      const type = String(node.dataset.editable || "").trim();
      if (!id || !type) return;
      const component = String(node.dataset.component || "").trim();
      const binding = String(node.dataset.binding || "").trim();
      if (type === "image") {
        model[id] = {
          id,
          type,
          component,
          binding,
          src: String(node.getAttribute("src") || "").trim(),
          alt: String(node.getAttribute("alt") || "").trim(),
        };
        return;
      }
      if (type === "link") {
        model[id] = {
          id,
          type,
          component,
          binding,
          href: String(node.getAttribute("href") || "").trim(),
          content: String(node.textContent || "").replace(/\s+/g, " ").trim(),
        };
        return;
      }
      if (type === "button") {
        model[id] = {
          id,
          type,
          component,
          binding,
          text: String(node.textContent || "").replace(/\s+/g, " ").trim(),
          link: String(node.getAttribute("href") || "").trim(),
        };
        return;
      }
      model[id] = {
        id,
        type,
        component,
        binding,
        content: String(node.textContent || "").replace(/\s+/g, " ").trim(),
      };
    });
    return model;
  } catch {
    return {};
  }
};

export const parseInlineSmartAction = (rawValue) => {
  const value = String(rawValue || "")
    .trim()
    .toLowerCase()
    .replace(/^\//, "");
  if (!value) return "";
  if (/(smart|improve|best|premium|convert|conversion|optimize)/.test(value)) return "smart";
  if (value.includes("short")) return "shorten";
  if (value.includes("expand")) return "expand";
  if (/(persuasive|persuade|convince|sales)/.test(value)) return "persuasive";
  if (value.includes("seo")) return "seo";
  if (value.includes("cta")) return "cta";
  if (value.includes("professional")) return "professional";
  if (value.includes("friendly")) return "friendly";
  if (value.includes("fix") || value.includes("clean")) return "fix";
  return "";
};

export const detectInlineSectionType = (node, root) => {
  if (!(node instanceof Element) || !(root instanceof Element)) return "general";
  const tokens = [];
  let cursor = node;
  let depth = 0;
  while (cursor && root.contains(cursor) && depth < 8) {
    tokens.push(
      String(cursor.getAttribute("data-tn-section") || ""),
      String(cursor.getAttribute("data-section") || ""),
      String(cursor.getAttribute("id") || ""),
      String(cursor.getAttribute("class") || ""),
      String(cursor.getAttribute("aria-label") || "")
    );
    const heading = cursor.querySelector("h1, h2, h3, h4, summary, strong");
    if (heading) tokens.push(String(heading.textContent || ""));
    cursor = cursor.parentElement;
    depth += 1;
  }
  const text = tokens.join(" ").toLowerCase();
  if (/(faq|question|answer)/.test(text)) return "faq";
  if (/(pricing|plan|package|tier|quote|billing|payment)/.test(text)) return "pricing";
  if (/(hero|headline|banner|above-the-fold)/.test(text)) return "hero";
  if (/(testimonial|review|success story|case study|trusted by)/.test(text)) return "testimonials";
  if (/(service|offer|solution|what we do)/.test(text)) return "services";
  if (/(contact|book|appointment|schedule|call us|get in touch)/.test(text)) return "contact";
  if (/(about|mission|story|team)/.test(text)) return "about";
  return "general";
};

export const buildInlineSuggestions = (text, sectionType = "general", rewriteFn) => {
  const source = String(text || "").trim();
  if (!source) return [];
  const section = String(sectionType || "general").toLowerCase();
  const preferredBySection = {
    hero: ["smart", "persuasive", "cta", "shorten", "seo"],
    pricing: ["smart", "persuasive", "cta", "professional", "shorten"],
    faq: ["smart", "fix", "shorten", "professional"],
    testimonials: ["smart", "persuasive", "professional", "shorten", "cta"],
    services: ["smart", "persuasive", "shorten", "seo", "cta"],
    contact: ["smart", "persuasive", "cta", "professional", "shorten"],
    about: ["smart", "persuasive", "professional", "shorten", "seo"],
    general: ["smart", "persuasive", "shorten", "professional", "seo", "cta"],
  };
  const confidenceForSuggestion = (actionKey, rewrittenText) => {
    const preferred = preferredBySection[section] || preferredBySection.general;
    const preferenceIndex = Math.max(0, preferred.indexOf(actionKey));
    const sourceLen = Math.max(1, source.length);
    const rewrittenLen = Math.max(1, String(rewrittenText || "").length);
    const deltaRatio = Math.min(1, Math.abs(rewrittenLen - sourceLen) / sourceLen);
    let score = 74;
    score += Math.max(0, 12 - preferenceIndex * 4);
    if (actionKey === "shorten" && rewrittenLen < sourceLen) score += 5;
    if (actionKey === "cta" && /(book|start|get started|contact|choose)/i.test(String(rewrittenText || ""))) score += 4;
    if (actionKey === "seo" && /(trusted|solutions|support|outcomes|pricing|questions)/i.test(String(rewrittenText || ""))) score += 4;
    if (deltaRatio <= 0.42) score += 3;
    if (deltaRatio > 0.75) score -= 5;
    return Math.max(55, Math.min(97, Math.round(score)));
  };
  const templatesBySection = {
    hero: [
      { key: "smart", label: "Hero smart upgrade" },
      { key: "persuasive", label: "More persuasive hero" },
      { key: "shorten", label: "Hero punchline" },
      { key: "cta", label: "Hero CTA" },
      { key: "seo", label: "Hero SEO line" }
    ],
    pricing: [
      { key: "smart", label: "Pricing smart upgrade" },
      { key: "persuasive", label: "Value-focused pricing" },
      { key: "cta", label: "Pricing CTA" },
      { key: "professional", label: "Trust-focused pricing" },
      { key: "shorten", label: "Clearer pricing copy" }
    ],
    faq: [
      { key: "smart", label: "FAQ smart answer" },
      { key: "fix", label: "Clear answer" },
      { key: "shorten", label: "Concise FAQ" },
      { key: "professional", label: "Reassuring tone" },
    ],
    testimonials: [
      { key: "smart", label: "Proof smart polish" },
      { key: "persuasive", label: "Stronger proof" },
      { key: "professional", label: "Proof-focused tone" },
      { key: "shorten", label: "Stronger quote" },
      { key: "cta", label: "Trust CTA" }
    ],
    services: [
      { key: "smart", label: "Service smart upgrade" },
      { key: "persuasive", label: "More persuasive service copy" },
      { key: "shorten", label: "Service clarity" },
      { key: "seo", label: "Service SEO" },
      { key: "cta", label: "Book this service" }
    ],
    contact: [
      { key: "smart", label: "Contact smart CTA" },
      { key: "persuasive", label: "Higher-conversion contact copy" },
      { key: "cta", label: "Contact CTA" },
      { key: "professional", label: "Professional contact tone" },
      { key: "shorten", label: "Simpler contact copy" }
    ],
    about: [
      { key: "smart", label: "About smart polish" },
      { key: "persuasive", label: "More compelling story" },
      { key: "professional", label: "Mission tone" },
      { key: "shorten", label: "Tighter story" },
      { key: "seo", label: "About SEO line" }
    ],
    general: [
      { key: "smart", label: "Smart rewrite" },
      { key: "persuasive", label: "More persuasive" },
      { key: "shorten", label: "Make shorter" },
      { key: "professional", label: "Professional tone" },
      { key: "seo", label: "SEO boost" },
      { key: "cta", label: "Add CTA" }
    ],
  };
  const candidates = (templatesBySection[section] || templatesBySection.general)
    .map((item) => {
      const rewritten = rewriteFn(source, item.key, { sectionType: section });
      return {
        ...item,
        text: rewritten,
        confidence: confidenceForSuggestion(item.key, rewritten),
      };
    })
    .filter((item) => item.text && item.text !== source);
  const unique = [];
  const seen = new Set();
  candidates.forEach((item) => {
    if (seen.has(item.text)) return;
    seen.add(item.text);
    unique.push(item);
  });
  return unique.sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0)).slice(0, 3);
};

export const getInlineCommandOptions = (sectionType = "general") => {
  const section = String(sectionType || "general").toLowerCase();
  const optionsBySection = {
    hero: ["/smart", "/persuasive", "/shorten", "/cta", "/seo", "/expand", "/professional", "/fix"],
    pricing: ["/smart", "/persuasive", "/cta", "/professional", "/shorten", "/seo", "/expand", "/fix"],
    faq: ["/smart", "/fix", "/shorten", "/professional", "/expand", "/seo", "/friendly"],
    testimonials: ["/smart", "/persuasive", "/professional", "/shorten", "/cta", "/seo", "/friendly", "/fix"],
    services: ["/smart", "/persuasive", "/shorten", "/seo", "/cta", "/expand", "/professional", "/fix"],
    contact: ["/smart", "/persuasive", "/cta", "/professional", "/shorten", "/friendly", "/seo", "/fix"],
    about: ["/smart", "/persuasive", "/professional", "/shorten", "/seo", "/expand", "/friendly", "/fix"],
    general: ["/smart", "/persuasive", "/shorten", "/expand", "/seo", "/cta", "/professional", "/friendly", "/fix"],
  };
  return optionsBySection[section] || optionsBySection.general;
};
