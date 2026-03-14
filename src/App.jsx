import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import {
  activateSellerLive,
  checkRegistrarHealth,
  purchaseDomainsLive,
  searchDomainsLive,
  updateListingLive,
} from "./lib/registrarClient";
import {
  listHostedProjects,
  publishProjectLive,
  unpublishProjectLive,
} from "./lib/hostingClient";
import {
  getRegistrarProviderByKey,
  REGISTRAR_PROVIDERS,
} from "./lib/registrarProviders";

const INDUSTRIES = [
  { key: "agency", label: "Digital Agency", query: "creative agency team" },
  { key: "restaurant", label: "Restaurant", query: "modern restaurant interior" },
  { key: "healthcare", label: "Healthcare", query: "modern healthcare clinic" },
  { key: "real-estate", label: "Real Estate", query: "luxury real estate" },
  { key: "legal", label: "Law Firm", query: "law office professionals" },
  { key: "construction", label: "Construction", query: "construction company" },
  { key: "education", label: "Education", query: "education campus students" },
  { key: "fitness", label: "Fitness", query: "fitness studio training" },
  { key: "travel", label: "Travel", query: "travel destination" },
  { key: "finance", label: "Finance", query: "finance consulting team" },
];

const TONES = ["Professional", "Modern", "Bold", "Minimal", "Friendly"];
const REWRITE_PRESETS = [
  {
    key: "premium",
    label: "More Premium",
    tone: "Professional",
    instruction:
      "Elevate perceived value and authority with refined, high-trust language suited to premium buyers.",
  },
  {
    key: "concise",
    label: "More Concise",
    tone: "Minimal",
    instruction: "Shorten copy while preserving clarity and conversion intent.",
  },
  {
    key: "friendly",
    label: "More Friendly",
    tone: "Friendly",
    instruction: "Use warmer, approachable language while staying clear and action-oriented.",
  },
  {
    key: "urgent",
    label: "More Urgent",
    tone: "Bold",
    instruction: "Increase urgency and momentum without sounding spammy or aggressive.",
  },
];
const GOALS = ["Lead Generation", "Bookings", "Ecommerce", "Brand Awareness"];
const QUICK_START_PRESETS = [
  {
    key: "local-services",
    label: "Local Services",
    businessName: "Northpoint Home Services",
    industryKey: "construction",
    goal: "Lead Generation",
    tone: "Professional",
    ctaText: "Request a free estimate",
    prompt:
      "Build a trustworthy local services website with service areas, customer reviews, clear pricing cues, and a quote request funnel.",
  },
  {
    key: "saas-launch",
    label: "SaaS Launch",
    businessName: "Your SaaS Company",
    industryKey: "finance",
    goal: "Brand Awareness",
    tone: "Modern",
    ctaText: "Start free trial",
    prompt:
      "Create a modern SaaS website with product highlights, social proof, feature sections, and clear free-trial conversion paths.",
  },
  {
    key: "restaurant-bookings",
    label: "Restaurant Bookings",
    businessName: "Harbor & Hearth",
    industryKey: "restaurant",
    goal: "Bookings",
    tone: "Friendly",
    ctaText: "Reserve a table",
    prompt:
      "Design a high-converting restaurant website with menu highlights, events, gallery, testimonials, and strong reservation calls to action.",
  },
];
const FONT_THEME_OPTIONS = [
  { key: "sans", label: "Sans Modern" },
  { key: "serif", label: "Serif Classic" },
  { key: "mono", label: "Monospace Tech" },
  { key: "geometric", label: "Geometric" },
  { key: "humanist", label: "Humanist" },
  { key: "editorial", label: "Editorial" },
  { key: "display", label: "Display Bold" },
  { key: "luxury", label: "Luxury Serif" },
  { key: "friendly", label: "Friendly Rounded" },
  { key: "formal", label: "Formal" },
];
const TYPOGRAPHY_PRESETS = [
  { key: "corporate", label: "Corporate", heading: "display", body: "humanist" },
  { key: "editorial", label: "Editorial", heading: "editorial", body: "serif" },
  { key: "startup", label: "Startup", heading: "geometric", body: "sans" },
  { key: "luxury", label: "Luxury", heading: "luxury", body: "formal" },
];
const FONT_THEMES = {
  sans: {
    stack: '"DM Sans", "Segoe UI", system-ui, sans-serif',
    googleQuery: "family=DM+Sans:wght@400;500;700;800",
    primary: "DM Sans",
  },
  serif: {
    stack: '"Merriweather", Georgia, "Times New Roman", serif',
    googleQuery: "family=Merriweather:wght@400;700;900",
    primary: "Merriweather",
  },
  mono: {
    stack: '"IBM Plex Mono", "JetBrains Mono", monospace',
    googleQuery: "family=IBM+Plex+Mono:wght@400;500;700",
    primary: "IBM Plex Mono",
  },
  geometric: {
    stack: '"Poppins", "Avenir Next", "Century Gothic", sans-serif',
    googleQuery: "family=Poppins:wght@400;500;600;700;800",
    primary: "Poppins",
  },
  humanist: {
    stack: '"Source Sans 3", "Calibri", "Trebuchet MS", sans-serif',
    googleQuery: "family=Source+Sans+3:wght@400;500;600;700",
    primary: "Source Sans 3",
  },
  editorial: {
    stack: '"Spectral", "Garamond", "Times New Roman", serif',
    googleQuery: "family=Spectral:wght@400;500;600;700;800",
    primary: "Spectral",
  },
  display: {
    stack: '"Sora", "Montserrat", "Arial Black", sans-serif',
    googleQuery: "family=Sora:wght@400;500;600;700;800",
    primary: "Sora",
  },
  luxury: {
    stack: '"Cormorant Garamond", "Baskerville", "Times New Roman", serif',
    googleQuery: "family=Cormorant+Garamond:wght@400;500;600;700",
    primary: "Cormorant Garamond",
  },
  friendly: {
    stack: '"Nunito", "Trebuchet MS", "Verdana", sans-serif',
    googleQuery: "family=Nunito:wght@400;500;600;700;800",
    primary: "Nunito",
  },
  formal: {
    stack: '"Lora", "Cambria", "Georgia", serif',
    googleQuery: "family=Lora:wght@400;500;600;700",
    primary: "Lora",
  },
};
const THEME_PRESETS = [
  { key: "corporate", label: "Corporate" },
  { key: "saas", label: "SaaS" },
  { key: "luxury", label: "Luxury" },
  { key: "editorial", label: "Editorial" },
];
const THEME_SUBSTYLES = {
  corporate: [
    { key: "enterprise", label: "Enterprise" },
    { key: "startup", label: "Startup" },
  ],
  saas: [
    { key: "product-led", label: "Product-led" },
    { key: "developer", label: "Developer-first" },
  ],
  luxury: [
    { key: "hotel", label: "Hotel" },
    { key: "jewelry", label: "Jewelry" },
  ],
  editorial: [
    { key: "magazine", label: "Magazine" },
    { key: "journal", label: "Journal" },
  ],
};
const VISUAL_STYLES = [
  { key: "glass", label: "Glass Gradient" },
  { key: "vibrant", label: "Vibrant Neon" },
  { key: "editorial", label: "Soft Editorial" },
];
const LLM_MODEL_PRESETS = [
  {
    key: "flagship",
    label: "Flagship Quality",
    description: "Highest quality for conversion copy and brand voice.",
    models: ["gpt-4.1", "gpt-4o"],
  },
  {
    key: "reasoning",
    label: "Reasoning Focus",
    description: "Stronger structured planning and strategy language.",
    models: ["o4-mini", "gpt-4.1"],
  },
  {
    key: "balanced",
    label: "Balanced",
    description: "Best cost/performance for most website generation.",
    models: ["gpt-4.1-mini", "gpt-4o-mini", "gpt-4o"],
  },
  {
    key: "speed",
    label: "Fast Drafting",
    description: "Fastest generation for rapid iteration.",
    models: ["gpt-4o-mini", "gpt-4.1-mini"],
  },
];

const getLlmPresetByKey = (key) =>
  LLM_MODEL_PRESETS.find((preset) => preset.key === key) || LLM_MODEL_PRESETS[0];

const dedupeModels = (values) => {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const DEFAULT_INDUSTRY = INDUSTRIES[0];
const STORAGE_KEY = "titonova_ai_projects";
const DRAFT_STORAGE_KEY = "titonova_builder_draft_v1";
const PUBLISH_LOG_STORAGE_KEY = "titonova_publish_logs_v1";
const DEFAULT_PAGE = "index.html";
const SESSION_USER_KEY = "titonova_user";

const PAGE_CONFIG = [
  { key: "index.html", label: "Home" },
  { key: "about.html", label: "About" },
  { key: "services.html", label: "Services" },
  { key: "contact.html", label: "Contact" },
];
const createDefaultPageFontOverrides = () =>
  Object.fromEntries(PAGE_CONFIG.map((page) => [page.key, { heading: "", body: "" }]));
const normalizePageFontOverrides = (input) => {
  const defaults = createDefaultPageFontOverrides();
  if (!input || typeof input !== "object") return defaults;
  const next = { ...defaults };
  PAGE_CONFIG.forEach((page) => {
    const item = input[page.key];
    if (!item || typeof item !== "object") return;
    const heading =
      typeof item.heading === "string" && Object.prototype.hasOwnProperty.call(FONT_THEMES, item.heading)
        ? item.heading
        : "";
    const body =
      typeof item.body === "string" && Object.prototype.hasOwnProperty.call(FONT_THEMES, item.body)
        ? item.body
        : "";
    next[page.key] = { heading, body };
  });
  return next;
};
const DOMAIN_STORAGE_KEY = "titonova_domain_store";
const DOMAIN_TLDS = [
  { tld: ".com", price: 14.99 },
  { tld: ".io", price: 39.0 },
  { tld: ".ai", price: 79.0 },
  { tld: ".co", price: 24.0 },
  { tld: ".net", price: 16.0 },
  { tld: ".studio", price: 29.0 },
];
const BLOCK_TEMPLATES = {
  feature_grid: {
    label: "Feature Grid",
    html: `<section>
  <h2 class="title">Feature Highlights</h2>
  <div class="cards">
    <article class="card"><h3>Fast Launch</h3><p>Ship quickly with conversion-focused structure.</p></article>
    <article class="card"><h3>Clear Messaging</h3><p>Position your value in language customers understand.</p></article>
    <article class="card"><h3>Growth Ready</h3><p>Designed for scaling traffic and lead capture.</p></article>
  </div>
</section>`,
  },
  trust_metrics: {
    label: "Trust Metrics",
    html: `<section class="metrics-strip">
  <article><strong>Add KPI</strong><span>Projects launched</span></article>
  <article><strong>Add KPI</strong><span>Retention rate</span></article>
  <article><strong>Add KPI</strong><span>Client satisfaction</span></article>
</section>`,
  },
  cta_band: {
    label: "CTA Band",
    html: `<section class="cta-band">
  <h2>Ready to grow faster?</h2>
  <a class="cta" href="contact.html">Start your project</a>
</section>`,
  },
  testimonial_row: {
    label: "Testimonial Row",
    html: `<section>
  <h2 class="title">Testimonials</h2>
  <div class="cards">
    <article class="card"><p>"The new site transformed our lead quality."</p><h3>— Growth Lead</h3></article>
    <article class="card"><p>"Clean execution, clear strategy, measurable results."</p><h3>— Customer</h3></article>
    <article class="card"><p>"Best redesign decision we made this year."</p><h3>— Operations Manager</h3></article>
  </div>
</section>`,
  },
  faq_block: {
    label: "FAQ Block",
    html: `<section>
  <h2 class="title">Frequently Asked Questions</h2>
  <div class="cards">
    <article class="card"><h3>How long does this take?</h3><p>Most launches complete within 1-2 weeks.</p></article>
    <article class="card"><h3>Can we edit later?</h3><p>Yes, every section can be updated anytime.</p></article>
    <article class="card"><h3>Do you support SEO?</h3><p>Yes, metadata and structure are built for discoverability.</p></article>
  </div>
</section>`,
  },
};
const IMAGE_UPLOAD_TARGETS = [
  { key: "first", label: "First image on page" },
  { key: "hero", label: "Hero image" },
  { key: "about", label: "About section image" },
  { key: "portfolio_one", label: "Portfolio one image" },
  { key: "gallery", label: "Gallery and portfolio images" },
  { key: "all", label: "All images on page" },
];
const PUBLISH_STEPS = ["preparing", "uploading", "live"];

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

const imageFor = (query, seed) => {
  const tags = String(query || "business")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ",")
    .replace(/^,+|,+$/g, "")
    .split(",")
    .filter(Boolean)
    .slice(0, 4)
    .join(",");
  const lock = Math.abs(domainHash(String(seed || query || "0")));
  return `https://loremflickr.com/1600/900/${tags || "business"}?lock=${lock}`;
};

const normalizeDomain = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\s+/g, "");

const domainHash = (value) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const isDomainLikelyAvailable = (domain) => domainHash(domain) % 5 !== 0;

const DOMAIN_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "llc",
  "inc",
  "ltd",
  "co",
  "company",
  "group",
  "studio",
  "agency",
  "services",
  "solutions",
]);

const toDomainKeyword = (value) => {
  const compact = slugify(value || "").replaceAll("-", "");
  return compact.slice(0, 28);
};

const PREFERRED_TLD_ORDER = [".com", ".co", ".io", ".ai", ".net", ".studio"];

const tldRank = (tld) => {
  const index = PREFERRED_TLD_ORDER.indexOf(String(tld || "").toLowerCase());
  return index === -1 ? PREFERRED_TLD_ORDER.length : index;
};

const scoreDomainVariant = ({ variant, baseVariant, keywordVariants }) => {
  let score = 0;
  const clean = String(variant || "").toLowerCase();
  const isExactBrand = clean === baseVariant;
  const hasDigits = /\d/.test(clean);
  const looksAlternate =
    clean.includes("online") ||
    clean.includes("hq") ||
    clean.includes("app") ||
    clean.includes("get");

  if (isExactBrand) score += 180;
  if (clean.length <= 10) score += 120;
  else if (clean.length <= 14) score += 80;
  else score += 30;

  if (!hasDigits) score += 40;
  if (!looksAlternate) score += 35;
  if (keywordVariants.some((item) => item && clean.includes(item))) score += 45;
  if (looksAlternate) score -= 70;
  if (hasDigits) score -= 45;

  return score;
};

const buildDomainSuggestions = (seed, options = {}) => {
  const base = slugify(seed || "");
  if (!base) return [];

  const businessTokens = slugify(options.businessName || "")
    .split("-")
    .filter((part) => part && !DOMAIN_STOP_WORDS.has(part));
  const industryToken = slugify(options.industryLabel || "").replaceAll("-", "");
  const compactBase = base.replaceAll("-", "");
  const keywordVariants = [
    toDomainKeyword(options.businessName || ""),
    industryToken,
  ].filter(Boolean);
  const variants = [
    compactBase,
    base,
    businessTokens.join(""),
    businessTokens.slice(0, 2).join(""),
    businessTokens[0] ? `${businessTokens[0]}hq` : "",
    businessTokens[0] ? `${businessTokens[0]}online` : "",
    compactBase && industryToken ? `${compactBase}${industryToken}` : "",
    businessTokens[0] && industryToken ? `${businessTokens[0]}${industryToken}` : "",
  ]
    .map((item) => toDomainKeyword(item))
    .filter(Boolean);

  const uniqueVariants = [];
  const seenVariants = new Set();
  variants.forEach((item) => {
    if (seenVariants.has(item)) return;
    seenVariants.add(item);
    uniqueVariants.push(item);
  });

  const suggestions = [];
  const seenDomains = new Set();

  uniqueVariants.forEach((variant) => {
    const variantQuality = scoreDomainVariant({
      variant,
      baseVariant: compactBase,
      keywordVariants,
    });
    DOMAIN_TLDS.forEach(({ tld, price }) => {
      const domain = `${variant}${tld}`;
      if (seenDomains.has(domain)) return;
      seenDomains.add(domain);
      suggestions.push({
        name: domain,
        price,
        available: isDomainLikelyAvailable(domain),
        __score: variantQuality - tldRank(tld) * 12,
      });
    });
  });

  return suggestions
    .sort((a, b) => {
      if (b.__score !== a.__score) return b.__score - a.__score;
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.price !== b.price) return a.price - b.price;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 18)
    .map((domain) => ({
      name: domain.name,
      price: domain.price,
      available: domain.available,
    }));
};

const getDefaultSubstyle = (themePreset) => THEME_SUBSTYLES[themePreset]?.[0]?.key || "";

const getSubstyleLabel = (themePreset, substylePreset) =>
  THEME_SUBSTYLES[themePreset]?.find((item) => item.key === substylePreset)?.label || "";

const scoreBrief = ({ businessName, prompt, seoTitle, ctaText, includeFaq, includePricing }) => {
  let score = 40;
  if (businessName.trim().length >= 3) score += 10;
  if (prompt.trim().length >= 80) score += 20;
  if (prompt.trim().length >= 150) score += 10;
  if (seoTitle.trim().length >= 20) score += 8;
  if (ctaText.trim().length >= 8) score += 6;
  if (includeFaq) score += 3;
  if (includePricing) score += 3;
  return Math.min(score, 100);
};

const parseJsonSafe = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const resolvePreviewPageFromHref = (href) => {
  const value = String(href || "").trim();
  if (!value) return null;
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("#")
  ) {
    return null;
  }

  const cleaned = value.split("#")[0].split("?")[0].trim();
  if (!cleaned) return null;
  const normalized = cleaned.replace(/^\.\//, "").replace(/^\//, "");
  const exact = PAGE_CONFIG.find((page) => page.key === normalized);
  if (exact) return exact.key;
  const withHtml = PAGE_CONFIG.find((page) => page.key === `${normalized}.html`);
  return withHtml ? withHtml.key : null;
};

const buildDefaultLlmContent = (safeName, safePrompt) => ({
  heroHeadline: `${safeName} that converts visitors into clients`,
  heroSubhead: safePrompt,
  brandPromise:
    "A conversion-focused digital experience designed to communicate value fast and move buyers to action.",
  services: [
    { title: "Strategy", description: "Clear growth roadmap tailored for your audience and market." },
    { title: "Execution", description: "End-to-end project delivery with measurable milestones." },
    { title: "Optimization", description: "Continuous improvements for conversion, speed, and SEO." },
  ],
  valueProps: [
    { title: "Positioning Clarity", description: "Messaging framework aligned to buyer intent and market context." },
    { title: "Conversion Architecture", description: "Every section is designed to guide visitors toward high-intent actions." },
    { title: "Scale-Ready Foundation", description: "SEO, analytics, and reusable blocks prepared for growth iterations." },
  ],
  process: [
    { step: "01", title: "Discover", description: "Map audience pain points, offers, and competitive gaps." },
    { step: "02", title: "Build", description: "Develop conversion-first pages with persuasive structure and UX." },
    { step: "03", title: "Optimize", description: "Track outcomes, refine messaging, and improve funnel performance." },
  ],
  stats: [
    { value: "Add KPI", label: "Qualified inquiries improvement" },
    { value: "Add KPI", label: "Lead-response cycle improvement" },
    { value: "Add KPI", label: "Retention outcome" },
  ],
  testimonials: [
    { quote: "Add a real customer testimonial here.", author: "Customer Name, Role" },
    { quote: "Add a second verified testimonial here.", author: "Customer Name, Role" },
    { quote: "Add a third verified testimonial here.", author: "Customer Name, Role" },
  ],
  faqs: [
    { question: "How quickly can we launch?", answer: "Most projects go live in 1-2 weeks." },
    { question: "Can we edit content ourselves?", answer: "Yes, every page is structured for easy updates." },
    { question: "Do you support SEO?", answer: "Built-in semantic structure and metadata are included." },
  ],
  closingCtaHeadline: "Ready to turn your website into a predictable growth channel?",
  pageCopy: {
    about: {
      heroTitle: `About ${safeName}`,
      heroSubhead: safePrompt,
      missionTitle: "Our Mission",
      missionBody:
        "We combine strategy, design, and execution to deliver practical business growth outcomes.",
      aboutStory: [
        "Founded to simplify complex digital growth for ambitious teams.",
        "Built around measurable outcomes, not vanity metrics.",
        "Trusted delivery through clear planning and accountable execution.",
      ],
      teamValues: [
        { title: "Clarity", description: "Clear strategy, scope, and success metrics from day one." },
        { title: "Ownership", description: "We take responsibility for outcomes, not just outputs." },
        { title: "Velocity", description: "Fast iteration cycles with quality controls built in." },
      ],
    },
    services: {
      heroTitle: "Solutions Designed for Measurable Growth",
      heroSubhead:
        "Flexible service packages designed for acquisition, retention, and operational efficiency.",
      sectionTitle: "Service Packages",
      serviceDetails: [
        {
          title: "Offer Positioning",
          description: "Sharpen your value proposition for higher-intent demand.",
          outcome: "Improved lead quality",
        },
        {
          title: "Conversion UX",
          description: "Restructure key journeys to remove friction and increase actions.",
          outcome: "Higher conversion rate",
        },
        {
          title: "Growth Operations",
          description: "Instrument reporting and optimization loops for repeatable scale.",
          outcome: "Predictable pipeline growth",
        },
      ],
      packageComparison: [
        {
          tier: "Starter",
          fit: "New teams launching core pages quickly.",
          investment: "From $499/mo",
        },
        {
          tier: "Growth",
          fit: "Teams optimizing conversion and demand capture.",
          investment: "From $1,250/mo",
        },
        {
          tier: "Enterprise",
          fit: "Multi-team programs with governance and scale needs.",
          investment: "Custom pricing",
        },
      ],
    },
    contact: {
      heroTitle: `Contact ${safeName}`,
      heroSubhead:
        "Tell us about your goals and timeline. We will share a tailored roadmap and proposal.",
      contactTitle: "Let’s Talk",
      contactTrustCopy:
        "Every inquiry is reviewed by a project strategist. You get practical next steps, not a generic sales reply.",
      responseExpectations: [
        "Initial response within one business day.",
        "Clear scope guidance tailored to your goals.",
        "Recommended next step call with timeline options.",
      ],
    },
  },
});

const INDUSTRY_CONTACT_FORMS = {
  agency: {
    title: "Start Your Agency Growth Project",
    serviceLabel: "Primary need",
    serviceOptions: ["Website redesign", "Lead generation funnel", "Brand positioning", "Retainer support"],
    priorityLabel: "Top priority",
    priorityOptions: ["Increase qualified leads", "Improve conversion rate", "Launch faster", "Raise average deal size"],
  },
  restaurant: {
    title: "Plan Your Restaurant Growth",
    serviceLabel: "What do you need?",
    serviceOptions: ["Reservations website", "Menu + ordering flow", "Local SEO setup", "Event promotions"],
    priorityLabel: "Primary outcome",
    priorityOptions: ["More bookings", "More online orders", "Better local visibility", "Higher repeat customers"],
  },
  healthcare: {
    title: "Request a Healthcare Website Consultation",
    serviceLabel: "Project type",
    serviceOptions: ["Clinic website", "Appointment flow", "Patient education pages", "Practice rebrand"],
    priorityLabel: "Compliance focus",
    priorityOptions: ["Privacy-first UX", "Trust and credibility", "Accessible patient journey", "Provider profile optimization"],
  },
  "real-estate": {
    title: "Launch Your Real Estate Lead Engine",
    serviceLabel: "Campaign focus",
    serviceOptions: ["Agent site", "Property showcase pages", "Lead capture funnels", "Brokerage rebrand"],
    priorityLabel: "Lead source",
    priorityOptions: ["Buyer leads", "Seller leads", "Investor inquiries", "Luxury segment clients"],
  },
  legal: {
    title: "Start Your Law Firm Intake Upgrade",
    serviceLabel: "Practice area focus",
    serviceOptions: ["Personal injury", "Corporate law", "Family law", "Criminal defense"],
    priorityLabel: "Business goal",
    priorityOptions: ["More consultations", "Higher-value cases", "Better trust signals", "Stronger local rankings"],
  },
  construction: {
    title: "Build a Construction Lead Pipeline",
    serviceLabel: "Service line",
    serviceOptions: ["Residential projects", "Commercial projects", "Remodeling", "General contracting"],
    priorityLabel: "Project objective",
    priorityOptions: ["More quote requests", "Higher project value", "Faster sales cycle", "Regional expansion"],
  },
  education: {
    title: "Create an Education Enrollment Experience",
    serviceLabel: "Institution type",
    serviceOptions: ["School website", "Course catalog", "Admissions flow", "Learning portal landing pages"],
    priorityLabel: "Enrollment goal",
    priorityOptions: ["More applications", "Better parent communication", "Program awareness", "Higher student retention"],
  },
  fitness: {
    title: "Scale Your Fitness Studio Online",
    serviceLabel: "Program focus",
    serviceOptions: ["Studio website", "Class schedule booking", "Trainer profiles", "Membership sales pages"],
    priorityLabel: "Growth goal",
    priorityOptions: ["More memberships", "More class bookings", "Better retention", "Premium package sales"],
  },
  travel: {
    title: "Design a Travel Booking Experience",
    serviceLabel: "Travel product",
    serviceOptions: ["Tour packages", "Destination pages", "Booking funnels", "Luxury travel offers"],
    priorityLabel: "Commercial goal",
    priorityOptions: ["More inquiries", "Higher booking volume", "Higher booking value", "Stronger repeat bookings"],
  },
  finance: {
    title: "Launch a Finance Conversion Website",
    serviceLabel: "Financial service",
    serviceOptions: ["Advisory website", "Wealth management pages", "Consultation funnels", "Compliance-first content"],
    priorityLabel: "Revenue objective",
    priorityOptions: ["More qualified appointments", "Higher trust and authority", "Upsell premium services", "Improve conversion quality"],
  },
};

const getIndustryContactFormConfig = (industryKey, industryLabel) =>
  INDUSTRY_CONTACT_FORMS[industryKey] || {
    title: `Start Your ${industryLabel} Project`,
    serviceLabel: "Service needed",
    serviceOptions: ["Consultation", "Website build", "Growth strategy", "Ongoing support"],
    priorityLabel: "Primary goal",
    priorityOptions: ["More leads", "More sales", "Faster launch", "Brand growth"],
  };

const buildWebsiteFiles = ({
  businessName,
  industry,
  tone,
  prompt,
  goal,
  themePreset,
  substylePreset,
  brandColor,
  headingFontTheme,
  bodyFontTheme,
  pageFontOverrides,
  fontTheme,
  ctaText,
  seoTitle,
  customDomain,
  includePricing,
  includeTestimonials,
  includeFaq,
  includeBlog,
  visualStyle,
  includePortfolio,
  includeLogoCloud,
  enableMotion,
  llmContent,
}) => {
  const rawName = businessName || "Your Business";
  const safeName = escapeHtml(rawName);
  const safeIndustry = escapeHtml(industry.label);
  const safeTone = escapeHtml(tone);
  const safeGoal = escapeHtml(goal);
  const safeTheme = escapeHtml(
    THEME_PRESETS.find((preset) => preset.key === themePreset)?.label || "Corporate"
  );
  const defaultSubstyle = getDefaultSubstyle(themePreset || "corporate");
  const activeSubstyle = THEME_SUBSTYLES[themePreset || "corporate"]?.some(
    (item) => item.key === substylePreset
  )
    ? substylePreset
    : defaultSubstyle;
  const safeSubstyle = escapeHtml(
    getSubstyleLabel(themePreset || "corporate", activeSubstyle) || "Standard"
  );
  const safePrompt = escapeHtml(prompt || `Trusted ${industry.label.toLowerCase()} services.`);
  const safeCta = escapeHtml(ctaText || "Book a strategy call");
  const safeSeoTitle = escapeHtml(seoTitle || `${rawName} | ${industry.label} Services`);
  const brandSlug = slugify(rawName || industry.label || "website");
  const normalizedDomain = normalizeDomain(customDomain || "");
  const domainHost = normalizedDomain || `${brandSlug || "example"}.com`;
  const domainUrl = `https://${domainHost}`;
  const safeBrandColor = /^#[0-9A-Fa-f]{6}$/.test(brandColor) ? brandColor : "#14b987";
  const resolvedBodyFontKey = Object.prototype.hasOwnProperty.call(FONT_THEMES, bodyFontTheme)
    ? bodyFontTheme
    : Object.prototype.hasOwnProperty.call(FONT_THEMES, fontTheme)
      ? fontTheme
      : "sans";
  const resolvedHeadingFontKey = Object.prototype.hasOwnProperty.call(FONT_THEMES, headingFontTheme)
    ? headingFontTheme
    : resolvedBodyFontKey;
  const normalizedPageFontOverrides = normalizePageFontOverrides(pageFontOverrides);
  const resolveFontKeysForPage = (pagePath) => {
    const override = normalizedPageFontOverrides[pagePath] || { heading: "", body: "" };
    const body = override.body || resolvedBodyFontKey;
    const heading = override.heading || resolvedHeadingFontKey;
    return {
      body: Object.prototype.hasOwnProperty.call(FONT_THEMES, body) ? body : resolvedBodyFontKey,
      heading: Object.prototype.hasOwnProperty.call(FONT_THEMES, heading)
        ? heading
        : resolvedHeadingFontKey,
    };
  };
  const safeVisualStyle = VISUAL_STYLES.some((style) => style.key === visualStyle)
    ? visualStyle
    : "glass";
  const activeTheme = THEME_PRESETS.some((preset) => preset.key === themePreset)
    ? themePreset
    : "corporate";
  const variantKey = `${activeTheme}:${activeSubstyle}`;

  const heroImage = imageFor(`${industry.query} website hero`, `${brandSlug}-hero`);
  const aboutImage = imageFor(`${industry.query} office`, `${brandSlug}-about`);
  const gallery = [1, 2, 3].map((index) =>
    imageFor(`${industry.query} commercial`, `${brandSlug}-${index}`)
  );
  const contactImage = imageFor(`${industry.query} team support`, `${brandSlug}-contact`);

  const pageLinks = PAGE_CONFIG.map((page) => `<a href="${page.key}">${page.label}</a>`).join("");
  const pageChips = PAGE_CONFIG.map((page) => `<span>${page.label}</span>`).join("");
  const contactEmail = `hello@${slugify(rawName) || "business"}.com`;
  const contactPhone = "+1 (000) 000-0000";
  const contactPhoneHref = "+10000000000";
  const whatsappHref = `https://wa.me/10000000000?text=${encodeURIComponent(
    `Hi ${rawName}, I want to discuss ${industry.label.toLowerCase()} website services.`
  )}`;

  const stylePalette = {
    glass: {
      bg: "#f3f8ff",
      card: "rgba(255,255,255,0.8)",
      line: "rgba(151, 173, 207, 0.42)",
      heroFx: "radial-gradient(circle at 12% 10%, rgba(20, 185, 135, 0.22), transparent 35%), radial-gradient(circle at 88% 6%, rgba(24, 255, 156, 0.18), transparent 30%)",
      radius: "20px",
    },
    vibrant: {
      bg: "#0d1220",
      card: "rgba(20, 28, 48, 0.88)",
      line: "rgba(130, 232, 192, 0.32)",
      heroFx: "radial-gradient(circle at 6% 10%, rgba(20, 185, 135, 0.36), transparent 34%), radial-gradient(circle at 96% 12%, rgba(70, 130, 255, 0.34), transparent 38%)",
      radius: "18px",
    },
    editorial: {
      bg: "#fbfaf7",
      card: "#ffffff",
      line: "rgba(190, 177, 156, 0.38)",
      heroFx: "radial-gradient(circle at 20% 12%, rgba(232, 220, 196, 0.45), transparent 35%), radial-gradient(circle at 80% 6%, rgba(212, 230, 225, 0.42), transparent 36%)",
      radius: "12px",
    },
  }[safeVisualStyle];
  const fallbackLlm = buildDefaultLlmContent(safeName, safePrompt);
  const aiCopy = llmContent || fallbackLlm;

  const heroHeadline = escapeHtml(aiCopy.heroHeadline || fallbackLlm.heroHeadline);
  const heroSubhead = escapeHtml(aiCopy.heroSubhead || fallbackLlm.heroSubhead);
  const brandPromise = escapeHtml(aiCopy.brandPromise || fallbackLlm.brandPromise);
  const closingCtaHeadline = escapeHtml(aiCopy.closingCtaHeadline || fallbackLlm.closingCtaHeadline);
  const aboutCopy = {
    heroTitle: escapeHtml(aiCopy?.pageCopy?.about?.heroTitle || fallbackLlm.pageCopy.about.heroTitle),
    heroSubhead: escapeHtml(aiCopy?.pageCopy?.about?.heroSubhead || fallbackLlm.pageCopy.about.heroSubhead),
    missionTitle: escapeHtml(aiCopy?.pageCopy?.about?.missionTitle || fallbackLlm.pageCopy.about.missionTitle),
    missionBody: escapeHtml(aiCopy?.pageCopy?.about?.missionBody || fallbackLlm.pageCopy.about.missionBody),
  };
  const servicesCopy = {
    heroTitle: escapeHtml(
      aiCopy?.pageCopy?.services?.heroTitle || fallbackLlm.pageCopy.services.heroTitle
    ),
    heroSubhead: escapeHtml(
      aiCopy?.pageCopy?.services?.heroSubhead || fallbackLlm.pageCopy.services.heroSubhead
    ),
    sectionTitle: escapeHtml(
      aiCopy?.pageCopy?.services?.sectionTitle || fallbackLlm.pageCopy.services.sectionTitle
    ),
  };
  const contactCopy = {
    heroTitle: escapeHtml(
      aiCopy?.pageCopy?.contact?.heroTitle || fallbackLlm.pageCopy.contact.heroTitle
    ),
    heroSubhead: escapeHtml(
      aiCopy?.pageCopy?.contact?.heroSubhead || fallbackLlm.pageCopy.contact.heroSubhead
    ),
    contactTitle: escapeHtml(
      aiCopy?.pageCopy?.contact?.contactTitle || fallbackLlm.pageCopy.contact.contactTitle
    ),
  };
  const aboutStoryItems =
    Array.isArray(aiCopy?.pageCopy?.about?.aboutStory) && aiCopy.pageCopy.about.aboutStory.length >= 3
      ? aiCopy.pageCopy.about.aboutStory
      : fallbackLlm.pageCopy.about.aboutStory;
  const aboutStoryMarkup = aboutStoryItems
    .slice(0, 3)
    .map((item) => `<article class="card"><p>${escapeHtml(item || "")}</p></article>`)
    .join("");
  const aboutValuesItems =
    Array.isArray(aiCopy?.pageCopy?.about?.teamValues) && aiCopy.pageCopy.about.teamValues.length >= 3
      ? aiCopy.pageCopy.about.teamValues
      : fallbackLlm.pageCopy.about.teamValues;
  const aboutValuesMarkup = aboutValuesItems
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><h3>${escapeHtml(item.title || "Value")}</h3><p>${escapeHtml(
          item.description || ""
        )}</p></article>`
    )
    .join("");
  const serviceDetailsItems =
    Array.isArray(aiCopy?.pageCopy?.services?.serviceDetails) &&
    aiCopy.pageCopy.services.serviceDetails.length >= 3
      ? aiCopy.pageCopy.services.serviceDetails
      : fallbackLlm.pageCopy.services.serviceDetails;
  const serviceDetailsMarkup = serviceDetailsItems
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="matrix-card"><h3>${escapeHtml(item.title || "Detail")}</h3><p>${escapeHtml(
          item.description || ""
        )}</p><p class="muted"><strong>Outcome:</strong> ${escapeHtml(item.outcome || "")}</p></article>`
    )
    .join("");
  const packageComparisonItems =
    Array.isArray(aiCopy?.pageCopy?.services?.packageComparison) &&
    aiCopy.pageCopy.services.packageComparison.length >= 3
      ? aiCopy.pageCopy.services.packageComparison
      : fallbackLlm.pageCopy.services.packageComparison;
  const packageComparisonMarkup = packageComparisonItems
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><h3>${escapeHtml(item.tier || "Package")}</h3><p>${escapeHtml(
          item.fit || ""
        )}</p><strong>${escapeHtml(item.investment || "")}</strong></article>`
    )
    .join("");
  const contactTrustCopy = escapeHtml(
    aiCopy?.pageCopy?.contact?.contactTrustCopy || fallbackLlm.pageCopy.contact.contactTrustCopy
  );
  const responseExpectationsItems =
    Array.isArray(aiCopy?.pageCopy?.contact?.responseExpectations) &&
    aiCopy.pageCopy.contact.responseExpectations.length >= 3
      ? aiCopy.pageCopy.contact.responseExpectations
      : fallbackLlm.pageCopy.contact.responseExpectations;
  const responseExpectationsMarkup = responseExpectationsItems
    .slice(0, 3)
    .map((item) => `<article class="card"><p>${escapeHtml(item || "")}</p></article>`)
    .join("");

  const aiServices =
    Array.isArray(aiCopy.services) && aiCopy.services.length >= 3
      ? aiCopy.services
      : fallbackLlm.services;
  const serviceCardsMarkup = aiServices
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><h3>${escapeHtml(item.title || "Service")}</h3><p>${escapeHtml(
          item.description || "Service description"
        )}</p></article>`
    )
    .join("");

  const aiValueProps =
    Array.isArray(aiCopy.valueProps) && aiCopy.valueProps.length >= 3
      ? aiCopy.valueProps
      : fallbackLlm.valueProps;
  const valuePropsMarkup = aiValueProps
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><h3>${escapeHtml(item.title || "Value pillar")}</h3><p>${escapeHtml(
          item.description || "Value proposition details."
        )}</p></article>`
    )
    .join("");

  const aiProcess =
    Array.isArray(aiCopy.process) && aiCopy.process.length >= 3 ? aiCopy.process : fallbackLlm.process;
  const processMarkup = aiProcess
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="matrix-card"><h3>${escapeHtml(item.step || "01")} • ${escapeHtml(
          item.title || "Phase"
        )}</h3><p>${escapeHtml(item.description || "Execution step details.")}</p></article>`
    )
    .join("");

  const aiStats =
    Array.isArray(aiCopy.stats) && aiCopy.stats.length >= 3 ? aiCopy.stats : fallbackLlm.stats;
  const statsMarkup = aiStats
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><strong>${escapeHtml(item.value || "0%")}</strong><p>${escapeHtml(
          item.label || "Performance metric"
        )}</p></article>`
    )
    .join("");

  const aiTestimonials =
    Array.isArray(aiCopy.testimonials) && aiCopy.testimonials.length >= 3
      ? aiCopy.testimonials
      : fallbackLlm.testimonials;
  const testimonialsMarkup = aiTestimonials
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><p>"${escapeHtml(item.quote || "")}"</p><h3>— ${escapeHtml(
          item.author || "Client"
        )}</h3></article>`
    )
    .join("");

  const aiFaqs =
    Array.isArray(aiCopy.faqs) && aiCopy.faqs.length >= 3 ? aiCopy.faqs : fallbackLlm.faqs;
  const faqMarkup = aiFaqs
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="card"><h3>${escapeHtml(item.question || "Question")}</h3><p>${escapeHtml(
          item.answer || "Answer"
        )}</p></article>`
    )
    .join("");
  const contactFormConfig = getIndustryContactFormConfig(industry.key, industry.label);
  const contactServiceOptions = contactFormConfig.serviceOptions
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("");
  const contactPriorityOptions = contactFormConfig.priorityOptions
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("");
  const detailedContactForm = `
    <section class="contact-form-card">
      <h2 class="title">${escapeHtml(contactFormConfig.title)}</h2>
      <p class="muted">Share your goals and requirements. We will send a tailored plan and next steps.</p>
      <form data-lead-form class="form-grid">
        <label class="form-field">
          <span>Full name *</span>
          <input name="fullName" required placeholder="Jane Doe" />
        </label>
        <label class="form-field">
          <span>Work email *</span>
          <input type="email" name="email" required placeholder="you@company.com" />
        </label>
        <label class="form-field">
          <span>Phone number</span>
          <input type="tel" name="phone" placeholder="+1 000 000 0000" />
        </label>
        <label class="form-field">
          <span>Company / Organization</span>
          <input name="company" placeholder="${safeName}" />
        </label>
        <label class="form-field">
          <span>${escapeHtml(contactFormConfig.serviceLabel)} *</span>
          <select name="serviceNeed" required>
            <option value="">Select one</option>
            ${contactServiceOptions}
          </select>
        </label>
        <label class="form-field">
          <span>${escapeHtml(contactFormConfig.priorityLabel)} *</span>
          <select name="priority" required>
            <option value="">Select one</option>
            ${contactPriorityOptions}
          </select>
        </label>
        <label class="form-field">
          <span>Budget range *</span>
          <select name="budget" required>
            <option value="">Select one</option>
            <option value="$2k-$5k">$2k-$5k</option>
            <option value="$5k-$15k">$5k-$15k</option>
            <option value="$15k-$40k">$15k-$40k</option>
            <option value="$40k+">$40k+</option>
          </select>
        </label>
        <label class="form-field">
          <span>Timeline *</span>
          <select name="timeline" required>
            <option value="">Select one</option>
            <option value="Immediate (0-2 weeks)">Immediate (0-2 weeks)</option>
            <option value="Soon (2-6 weeks)">Soon (2-6 weeks)</option>
            <option value="Planned (1-3 months)">Planned (1-3 months)</option>
            <option value="Exploring options">Exploring options</option>
          </select>
        </label>
        <label class="form-field form-field-full">
          <span>Project details *</span>
          <textarea name="details" required rows="5" placeholder="Tell us current challenges, goals, and what success looks like."></textarea>
        </label>
        <label class="form-field form-field-full form-check">
          <input type="checkbox" name="consent" required />
          <span>I agree to be contacted about this request.</span>
        </label>
        <div class="form-actions form-field-full">
          <button class="cta" data-next="Submitting your request..." type="submit">Submit Request</button>
          <small class="muted">You should hear from us within 1 business day.</small>
        </div>
      </form>
    </section>`;

  const pricingGrid = includePricing
    ? `<section>
        <h2 class="title">Pricing</h2>
        <div class="cards">
          <article class="card"><h3>Starter</h3><p>For new teams launching quickly.</p><strong>Add your pricing</strong></article>
          <article class="card"><h3>Growth</h3><p>For teams scaling lead volume.</p><strong>Add your pricing</strong></article>
          <article class="card"><h3>Enterprise</h3><p>Advanced workflows and priority support.</p><strong>Contact for quote</strong></article>
        </div>
      </section>`
    : "";

  const testimonialsGrid = includeTestimonials
    ? `<section>
        <h2 class="title">Client Results</h2>
        <div class="cards">${testimonialsMarkup}</div>
      </section>`
    : "";

  const faqGrid = includeFaq
    ? `<section>
        <h2 class="title">FAQ</h2>
        <div class="cards">${faqMarkup}</div>
      </section>`
    : "";

  const blogGrid = includeBlog
    ? `<section>
        <h2 class="title">Insights</h2>
        <div class="cards">
          <article class="card"><h3>Industry Trends</h3><p>What is shaping ${safeIndustry.toLowerCase()} performance this quarter.</p></article>
          <article class="card"><h3>Execution Playbook</h3><p>How teams deploy high-performing websites faster.</p></article>
          <article class="card"><h3>Conversion Systems</h3><p>Frameworks that turn traffic into consistent leads.</p></article>
        </div>
      </section>`
    : "";

  const logoCloudBlock = includeLogoCloud
    ? `<section class="logo-cloud">
        <span>Trusted by teams like yours</span>
        <div><b>Add Client</b><b>Add Client</b><b>Add Client</b><b>Add Client</b><b>Add Client</b></div>
      </section>`
    : "";

  const portfolioBlock = includePortfolio
    ? `<section class="portfolio-grid">
        <article><img src="${gallery[0]}" alt="Portfolio one" /><h3>Launch System</h3><p>Positioning, pages, and conversion journey.</p></article>
        <article><img src="${gallery[1]}" alt="Portfolio two" /><h3>Growth Site</h3><p>Offer architecture and demand capture.</p></article>
        <article><img src="${gallery[2]}" alt="Portfolio three" /><h3>Brand Refresh</h3><p>Narrative update with modern UX direction.</p></article>
      </section>`
    : "";

  const ctaBandBlock = `<section class="cta-band"><h2>${closingCtaHeadline}</h2><a class="cta" data-next="Opening contact page..." href="contact.html">${safeCta}</a></section>`;

  const themeHomeBlocks = {
    "corporate:enterprise": `
      <section class="metrics-strip">
        <article><strong>Add KPI</strong><span>Projects delivered</span></article>
        <article><strong>Add KPI</strong><span>Retention rate</span></article>
        <article><strong>Add KPI</strong><span>Client satisfaction</span></article>
      </section>
      <section class="split-panel">
        <div class="panel-copy">
          <h2 class="title">Operationally Reliable Delivery</h2>
          <p class="muted">Built for teams that value governance, scale, and predictable outcomes.</p>
          <ul class="bullet-list">
            <li>Executive-ready reporting</li>
            <li>Milestone-based execution model</li>
            <li>Cross-functional implementation support</li>
          </ul>
        </div>
        <img src="${aboutImage}" alt="${safeIndustry} operations" />
      </section>
    `,
    "corporate:startup": `
      <section class="startup-roadmap">
        <article class="matrix-card"><h3>Launch Fast</h3><p>Lean setup and clear go-to-market priorities.</p></article>
        <article class="matrix-card"><h3>Validate Fit</h3><p>Rapid feedback loops and message testing.</p></article>
        <article class="matrix-card"><h3>Scale Smart</h3><p>High-impact improvements every sprint.</p></article>
      </section>
      <section class="logo-ribbon">
        <span>Backed by teams across your market</span>
        <div><b>Add Partner</b><b>Add Partner</b><b>Add Partner</b><b>Add Partner</b></div>
      </section>
    `,
    "saas:product-led": `
      <section class="feature-matrix">
        <article class="matrix-card"><h3>Onboarding</h3><p>Conversion-first user journey from signup to activation.</p></article>
        <article class="matrix-card"><h3>Automation</h3><p>Workflow templates and TitoNova Cloud Engine assistants to accelerate output.</p></article>
        <article class="matrix-card"><h3>Analytics</h3><p>Live dashboards focused on usage and revenue health.</p></article>
      </section>
      <section class="logo-ribbon">
        <span>Trusted by product teams across industries</span>
        <div><b>Add Company</b><b>Add Company</b><b>Add Company</b><b>Add Company</b></div>
      </section>
    `,
    "saas:developer": `
      <section class="dev-grid">
        <article class="matrix-card"><h3>APIs First</h3><p>Composable integration strategy with clear docs and SDKs.</p></article>
        <article class="matrix-card"><h3>CLI Workflows</h3><p>Automation paths designed for engineering velocity.</p></article>
        <article class="matrix-card"><h3>Observability</h3><p>Telemetry and reliability guardrails by default.</p></article>
      </section>
      <section class="contact-note"><p class="muted">Developer-first stack with production-grade patterns and docs.</p></section>
    `,
    "luxury:hotel": `
      <section class="luxury-quote">
        <p>Curated hospitality experiences for guests who value privacy, comfort, and impeccable service.</p>
      </section>
      <section class="luxury-gallery">
        <img src="${gallery[0]}" alt="Suite showcase" />
        <img src="${gallery[1]}" alt="Lobby showcase" />
      </section>
    `,
    "luxury:jewelry": `
      <section class="luxury-quote">
        <p>Fine craftsmanship, rare materials, and timeless silhouettes designed as heirloom pieces.</p>
      </section>
      <section class="luxury-gallery">
        <img src="${gallery[1]}" alt="Jewelry showcase one" />
        <img src="${gallery[2]}" alt="Jewelry showcase two" />
      </section>
    `,
    "editorial:magazine": `
      <section class="editorial-headline">
        <h2>A magazine-style perspective on modern ${safeIndustry.toLowerCase()} strategy</h2>
        <p class="muted">Feature-led storytelling designed for broad audience readability.</p>
      </section>
      <section class="editorial-columns">
        <article><h3>Cover Story</h3><p>Macro shifts shaping next-quarter performance.</p></article>
        <article><h3>Interviews</h3><p>Operator insights from leaders in the space.</p></article>
        <article><h3>Field Notes</h3><p>Practical moves teams can execute this week.</p></article>
      </section>
    `,
    "editorial:journal": `
      <section class="editorial-headline">
        <h2>A journal-style framework for rigorous decision-making</h2>
        <p class="muted">Research-forward narrative intended for specialist audiences.</p>
      </section>
      <section class="editorial-columns">
        <article><h3>Method</h3><p>Approach, assumptions, and analytical framing.</p></article>
        <article><h3>Findings</h3><p>Signal patterns and validated insights.</p></article>
        <article><h3>Implications</h3><p>Where teams should invest and why.</p></article>
      </section>
    `,
  };

  const themeAboutBlocks = {
    "corporate:enterprise": `<section class="org-structure"><h2 class="title">Leadership & Governance</h2><div class="cards"><article class="card"><h3>Client Success</h3><p>Dedicated account leadership and KPI ownership.</p></article><article class="card"><h3>Delivery Office</h3><p>Program oversight with standardized quality controls.</p></article><article class="card"><h3>Specialist Bench</h3><p>Domain experts engaged by initiative complexity.</p></article></div></section>`,
    "corporate:startup": `<section class="timeline"><h2 class="title">Startup Operating Rhythm</h2><div class="cards"><article class="card"><h3>Weekly Sprints</h3><p>Rapid experimentation cycles.</p></article><article class="card"><h3>Monthly Reviews</h3><p>Outcome tracking against traction goals.</p></article><article class="card"><h3>Quarterly Bets</h3><p>Focused investments for growth inflection.</p></article></div></section>`,
    "saas:product-led": `<section class="timeline"><h2 class="title">Product Journey</h2><div class="cards"><article class="card"><h3>v1</h3><p>Core launch with validated onboarding loops.</p></article><article class="card"><h3>v2</h3><p>Expanded integrations and lifecycle automation.</p></article><article class="card"><h3>v3</h3><p>Predictive intelligence and deeper reporting.</p></article></div></section>`,
    "saas:developer": `<section class="timeline"><h2 class="title">Engineering Evolution</h2><div class="cards"><article class="card"><h3>Stable Core</h3><p>Solid API contract and versioning policy.</p></article><article class="card"><h3>Extensibility</h3><p>Plugin architecture for custom workflows.</p></article><article class="card"><h3>Scale Readiness</h3><p>Performance and reliability benchmarks.</p></article></div></section>`,
    "luxury:hotel": `<section class="atelier"><h2 class="title">Hospitality Philosophy</h2><p class="muted">Every stay is choreographed to deliver comfort, privacy, and enduring impressions.</p></section>`,
    "luxury:jewelry": `<section class="atelier"><h2 class="title">House of Craft</h2><p class="muted">Design language rooted in artisanal precision, rare materials, and bespoke finishing.</p></section>`,
    "editorial:magazine": `<section class="manifesto"><h2 class="title">Editorial Manifesto</h2><p class="muted">We translate complexity into engaging, human-centered narratives with broad accessibility.</p></section>`,
    "editorial:journal": `<section class="manifesto"><h2 class="title">Research Manifesto</h2><p class="muted">We prioritize methodological clarity, evidence discipline, and citation-ready storytelling.</p></section>`,
  };

  const themeServicesBlocks = {
    "corporate:enterprise": `<section class="service-table"><h2 class="title">Service Portfolio</h2><div class="cards"><article class="card"><h3>Advisory</h3><p>Executive planning, governance, and roadmap design.</p></article><article class="card"><h3>Implementation</h3><p>Cross-team execution with delivery assurance.</p></article><article class="card"><h3>Optimization</h3><p>Continuous improvement and operational uplift.</p></article></div></section>`,
    "corporate:startup": `<section class="service-pipeline"><h2 class="title">Startup Service Stack</h2><div class="cards"><article class="card"><h3>MVP Acceleration</h3><p>Fast launch and feedback instrumentation.</p></article><article class="card"><h3>Growth Loops</h3><p>Acquisition and retention mechanics.</p></article><article class="card"><h3>Scale Ops</h3><p>Process upgrades as complexity grows.</p></article></div></section>`,
    "saas:product-led": `<section class="service-pipeline"><h2 class="title">Growth Pipeline</h2><div class="cards"><article class="card"><h3>Acquire</h3><p>Demand capture and acquisition funnel tuning.</p></article><article class="card"><h3>Activate</h3><p>User onboarding and product adoption playbooks.</p></article><article class="card"><h3>Expand</h3><p>Retention and expansion revenue mechanics.</p></article></div></section>`,
    "saas:developer": `<section class="service-pipeline"><h2 class="title">Developer Experience Stack</h2><div class="cards"><article class="card"><h3>API Platform</h3><p>Design, docs, and sandbox environment strategy.</p></article><article class="card"><h3>SDK Tooling</h3><p>Frictionless integration across key languages.</p></article><article class="card"><h3>Support Ops</h3><p>Issue triage and reliability runbooks.</p></article></div></section>`,
    "luxury:hotel": `<section class="concierge"><h2 class="title">Concierge Services</h2><div class="cards"><article class="card"><h3>Private Stays</h3><p>Tailored accommodation and itinerary curation.</p></article><article class="card"><h3>Events</h3><p>High-touch hosting for intimate gatherings.</p></article><article class="card"><h3>Member Privileges</h3><p>Priority access and seasonal experiences.</p></article></div></section>`,
    "luxury:jewelry": `<section class="concierge"><h2 class="title">Atelier Services</h2><div class="cards"><article class="card"><h3>Custom Design</h3><p>Bespoke concepting and gemstone sourcing.</p></article><article class="card"><h3>Private Appointments</h3><p>One-to-one consultation with master artisans.</p></article><article class="card"><h3>Lifetime Care</h3><p>Restoration and authentication support.</p></article></div></section>`,
    "editorial:magazine": `<section class="story-services"><h2 class="title">Feature-Led Services</h2><div class="cards"><article class="card"><h3>Editorial Planning</h3><p>Issue architecture and content sequencing.</p></article><article class="card"><h3>Contributor Network</h3><p>Specialist writers and domain voices.</p></article><article class="card"><h3>Audience Distribution</h3><p>Reach optimization across owned channels.</p></article></div></section>`,
    "editorial:journal": `<section class="story-services"><h2 class="title">Research Services</h2><div class="cards"><article class="card"><h3>Knowledge Mapping</h3><p>Landscape analysis and source triangulation.</p></article><article class="card"><h3>Argument Design</h3><p>Structured claims backed by evidence.</p></article><article class="card"><h3>Publication Systems</h3><p>Review workflows and long-term archives.</p></article></div></section>`,
  };

  const themeContactBlocks = {
    "corporate:enterprise": `<section class="contact-note"><p class="muted">For enterprise requests, include expected timeline, stakeholders, and decision process.</p></section>`,
    "corporate:startup": `<section class="contact-note"><p class="muted">Share your current growth stage, runway goals, and top bottleneck.</p></section>`,
    "saas:product-led": `<section class="contact-note"><p class="muted">Share your current funnel metrics and product stage for a tailored growth teardown.</p></section>`,
    "saas:developer": `<section class="contact-note"><p class="muted">Include API architecture, stack constraints, and DX priorities for best recommendations.</p></section>`,
    "luxury:hotel": `<section class="contact-note"><p class="muted">Private consultations are scheduled by invitation and referral priority.</p></section>`,
    "luxury:jewelry": `<section class="contact-note"><p class="muted">For bespoke commissions, include preferred metals, stones, and milestone dates.</p></section>`,
    "editorial:magazine": `<section class="contact-note"><p class="muted">We welcome publisher briefs with audience profile and editorial objectives.</p></section>`,
    "editorial:journal": `<section class="contact-note"><p class="muted">Please include your research scope, methodological constraints, and intended readership.</p></section>`,
  };

  const sharedHead = (title, pagePath) => {
    const pageFonts = resolveFontKeysForPage(pagePath);
    const safeBodyFontStack = FONT_THEMES[pageFonts.body]?.stack || FONT_THEMES.sans.stack;
    const safeHeadingFontStack = FONT_THEMES[pageFonts.heading]?.stack || FONT_THEMES.sans.stack;
    const bodyPrimary = FONT_THEMES[pageFonts.body]?.primary || "sans-serif";
    const headingPrimary = FONT_THEMES[pageFonts.heading]?.primary || "sans-serif";
    const googleQueries = Array.from(
      new Set(
        [pageFonts.body, pageFonts.heading]
          .map((key) => FONT_THEMES[key]?.googleQuery)
          .filter(Boolean)
      )
    );
    const fontHeadTags = googleQueries.length
      ? `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?${googleQueries.join("&")}&display=swap" rel="stylesheet" />`
      : "";
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${safePrompt}" />
  <meta property="og:title" content="${safeSeoTitle}" />
  <meta property="og:description" content="${safePrompt}" />
  <meta property="og:url" content="${domainUrl}/${pagePath}" />
  <link rel="canonical" href="${domainUrl}/${pagePath}" />
  ${fontHeadTags}
  <style>
    :root {
      --bg: ${stylePalette.bg};
      --ink: ${safeVisualStyle === "vibrant" ? "#e8f3ff" : "#102038"};
      --muted: ${safeVisualStyle === "vibrant" ? "rgba(232, 243, 255, 0.78)" : "#55657f"};
      --primary: ${safeBrandColor};
      --card: ${stylePalette.card};
      --line: ${stylePalette.line};
      --font-body: ${safeBodyFontStack};
      --font-heading: ${safeHeadingFontStack};
      --theme-mode: "${activeTheme}";
      --style-mode: "${safeVisualStyle}";
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: var(--font-body);
      color: var(--ink);
      background: ${stylePalette.heroFx}, var(--bg);
    }
    h1, h2, h3, .title, .pill, .cta { font-family: var(--font-heading); }
    .container { width: min(1120px, 92%); margin: 0 auto; }
    .nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 0;
      border-bottom: 1px solid var(--line);
      margin-bottom: 12px;
      gap: 14px;
      flex-wrap: wrap;
    }
    .nav strong { font-size: 1.05rem; }
    .nav .menu { display: flex; gap: 12px; color: var(--muted); font-size: 14px; flex-wrap: wrap; }
    .nav .menu a { color: inherit; text-decoration: none; }
    .hero {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 28px;
      align-items: center;
      padding: 34px 0;
      position: relative;
    }
    .pill {
      display: inline-block;
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary) 18%, white);
      color: color-mix(in srgb, var(--primary) 75%, black);
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3.3rem); line-height: 1.06; }
    .sub { color: var(--muted); line-height: 1.7; margin-bottom: 18px; }
    .cta {
      display: inline-block;
      text-decoration: none;
      color: white;
      background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 65%, black));
      border-radius: 999px;
      padding: 12px 20px;
      font-weight: 700;
    }
    .font-fallback-alert {
      position: sticky;
      top: 8px;
      z-index: 50;
      margin: 8px 0 0;
      border: 1px solid rgba(255, 196, 64, 0.6);
      background: rgba(255, 196, 64, 0.14);
      color: #5f490c;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 12px;
      display: none;
    }
    .hero img, .about img, .gallery img {
      width: 100%;
      border-radius: ${stylePalette.radius};
      border: 1px solid var(--line);
      object-fit: cover;
    }
    .hero img { min-height: 320px; }
    section { padding: 20px 0; }
    .title { margin: 0 0 14px; font-size: 1.8rem; }
    .muted { color: var(--muted); }
    .stats, .cards, .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 14px;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: ${stylePalette.radius};
      padding: 16px;
      box-shadow: ${safeVisualStyle === "vibrant" ? "0 16px 40px rgba(0,0,0,0.35)" : "0 12px 30px rgba(15, 32, 60, 0.08)"};
    }
    .card h3 { margin: 0 0 8px; }
    .card p { margin: 0; color: var(--muted); line-height: 1.6; }
    .card strong { display: block; margin-top: 10px; }
    .stats .card strong { font-size: 1.6rem; margin-top: 0; }
    .about {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      align-items: center;
    }
    .pages {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }
    .pages span {
      font-size: 12px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px 10px;
      background: #fbfdff;
      color: #3d4f6b;
    }
    .stack { display: grid; gap: 14px; }
    .contact-list { display: grid; gap: 10px; }
    .contact-form-card { border: 1px solid var(--line); border-radius: ${stylePalette.radius}; padding: 18px; background: var(--card); }
    .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 10px; }
    .form-field { display: grid; gap: 6px; }
    .form-field span { font-size: 12px; color: var(--muted); font-weight: 700; letter-spacing: 0.02em; }
    .form-field input,
    .form-field select,
    .form-field textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      color: var(--ink);
      background: color-mix(in srgb, var(--card) 82%, white);
    }
    .form-field textarea { resize: vertical; min-height: 110px; }
    .form-field-full { grid-column: 1 / -1; }
    .form-check { display: flex; align-items: center; gap: 8px; }
    .form-check input { width: auto; margin: 0; }
    .form-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .contact-item {
      border: 1px solid var(--line);
      background: var(--card);
      border-radius: 12px;
      padding: 12px;
    }
    footer {
      margin-top: 28px;
      border-top: 1px solid var(--line);
      padding: 22px 0 36px;
      color: var(--muted);
      font-size: 14px;
    }
    .metrics-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    .metrics-strip article {
      border: 1px solid var(--line);
      background: var(--card);
      border-radius: 14px;
      padding: 14px;
    }
    .metrics-strip strong { display: block; font-size: 1.7rem; }
    .metrics-strip span { color: var(--muted); font-size: 13px; }
    .split-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: center; }
    .split-panel img { width: 100%; border-radius: 14px; border: 1px solid var(--line); }
    .bullet-list { margin: 0; padding-left: 18px; color: var(--muted); display: grid; gap: 6px; }
    .feature-matrix { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .startup-roadmap { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .dev-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; }
    .matrix-card { border: 1px solid var(--line); border-radius: 14px; padding: 14px; background: var(--card); }
    .logo-ribbon { border: 1px solid var(--line); border-radius: 14px; padding: 14px; background: var(--card); display: grid; gap: 10px; }
    .logo-ribbon div { display: flex; flex-wrap: wrap; gap: 10px; color: var(--muted); }
    .luxury-quote { border: 1px solid var(--line); background: var(--card); border-radius: 14px; padding: 24px; font-size: 1.15rem; line-height: 1.8; }
    .luxury-gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
    .luxury-gallery img { width: 100%; border-radius: 14px; border: 1px solid var(--line); min-height: 320px; object-fit: cover; }
    .editorial-headline { border-left: 4px solid var(--primary); padding-left: 14px; }
    .editorial-headline h2 { margin: 0 0 8px; font-size: clamp(1.5rem, 3.4vw, 2.2rem); }
    .editorial-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .editorial-columns article { border-top: 2px solid var(--line); padding-top: 10px; }
    .contact-note { border: 1px solid var(--line); border-radius: 12px; padding: 14px; background: var(--card); }
    .logo-cloud { border: 1px solid var(--line); border-radius: ${stylePalette.radius}; padding: 14px; background: var(--card); display: grid; gap: 10px; }
    .logo-cloud div { display: flex; flex-wrap: wrap; gap: 10px; color: var(--muted); }
    .logo-cloud b { padding: 6px 10px; border-radius: 999px; border: 1px solid var(--line); background: color-mix(in srgb, var(--card) 70%, white); }
    .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .portfolio-grid article { border: 1px solid var(--line); border-radius: ${stylePalette.radius}; padding: 12px; background: var(--card); }
    .portfolio-grid img { width: 100%; height: 160px; object-fit: cover; border-radius: ${stylePalette.radius}; border: 1px solid var(--line); }
    .portfolio-grid h3 { margin: 10px 0 6px; }
    .portfolio-grid p { margin: 0; color: var(--muted); }
    .cta-band { border: 1px solid var(--line); border-radius: ${stylePalette.radius}; background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, var(--card)), var(--card)); padding: 20px; display: flex; gap: 14px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
    .cta-band h2 { margin: 0; font-size: clamp(1.3rem, 2.2vw, 2rem); }
    .action-feedback {
      position: fixed;
      left: 14px;
      bottom: 14px;
      z-index: 30;
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--card) 88%, white);
      color: var(--ink);
      border-radius: 10px;
      padding: 10px 12px;
      max-width: min(92vw, 380px);
      box-shadow: 0 10px 24px rgba(12, 24, 42, 0.16);
      font-size: 12px;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 180ms ease, transform 180ms ease;
      pointer-events: none;
    }
    .action-feedback.show {
      opacity: 1;
      transform: translateY(0);
    }
    .connection-dock {
      position: fixed;
      right: 14px;
      bottom: 14px;
      display: grid;
      gap: 8px;
      z-index: 30;
    }
    .connection-btn {
      text-decoration: none;
      border: 1px solid var(--line);
      background: color-mix(in srgb, var(--card) 84%, white);
      color: var(--ink);
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 10px 20px rgba(12, 24, 42, 0.14);
      transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .connection-btn::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 36%, transparent);
      animation: ping 2.4s ease infinite;
    }
    .connection-btn:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--primary) 42%, var(--line)); box-shadow: 0 14px 22px rgba(12, 24, 42, 0.18); }
    .connection-btn.active { transform: scale(0.98); }
    .connection-btn.whatsapp { background: color-mix(in srgb, var(--primary) 18%, var(--card)); }
    .connection-btn.contact { background: color-mix(in srgb, var(--primary) 24%, var(--card)); }
    @keyframes ping {
      0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 36%, transparent); }
      70% { box-shadow: 0 0 0 12px color-mix(in srgb, var(--primary) 0%, transparent); }
      100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 0%, transparent); }
    }
    ${enableMotion ? `
    .card, .matrix-card, .portfolio-grid article, .logo-cloud, .cta-band { transition: transform 220ms ease, box-shadow 220ms ease; }
    .card:hover, .matrix-card:hover, .portfolio-grid article:hover { transform: translateY(-3px); }
    .hero, section { animation: fadeUp 520ms ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    ` : ""}
    body.theme-corporate { background: #f3f6fb; }
    body.theme-corporate .hero { border: 1px solid var(--line); border-radius: 16px; padding: 24px; background: var(--card); }
    body.theme-saas { background: radial-gradient(circle at top, #eef8f6, #f7f9fc 42%); }
    body.theme-saas .hero { position: relative; overflow: hidden; border-radius: 18px; padding: 30px; border: 1px solid var(--line); background: var(--card); }
    body.theme-saas .hero::after { content: ""; position: absolute; width: 160px; height: 160px; border-radius: 50%; right: -40px; top: -40px; background: color-mix(in srgb, var(--primary) 24%, white); }
    body.theme-luxury { background: #f8f6f2; color: #231d14; }
    body.theme-luxury .container { width: min(1040px, 90%); }
    body.theme-luxury .hero { border-bottom: 1px solid #e5dbca; padding-bottom: 30px; }
    body.theme-luxury .card { border-color: #e5dbca; background: #fffcf6; }
    body.theme-luxury .nav { border-color: #e5dbca; }
    body.theme-editorial { background: #f6f8fb; }
    body.theme-editorial .container { width: min(980px, 90%); }
    body.theme-editorial .hero { grid-template-columns: 1fr; gap: 14px; }
    body.theme-editorial .hero img { min-height: 360px; }
    body.theme-editorial .cards { grid-template-columns: 1fr; }
    @media (max-width: 760px) { .form-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body
  class="theme-${activeTheme} substyle-${activeSubstyle}"
  data-font-body-primary="${bodyPrimary}"
  data-font-heading-primary="${headingPrimary}"
>
  <main class="container">
    <div id="font-fallback-alert" class="font-fallback-alert" role="status" aria-live="polite">
      Google Fonts failed to load. Showing web-safe fallback fonts.
    </div>
    <nav class="nav">
      <strong>${safeName}</strong>
      <div class="menu">${pageLinks}</div>
    </nav>`;
  };

  const footer = `
    <aside class="connection-dock" aria-label="Connection actions">
      <a class="connection-btn call" data-conn data-next="Opening phone dialer..." href="tel:${contactPhoneHref}">Call</a>
      <a class="connection-btn email" data-conn data-next="Opening email draft..." href="mailto:${contactEmail}">Email</a>
      <a class="connection-btn whatsapp" data-conn data-next="Opening WhatsApp chat..." href="${whatsappHref}" target="_blank" rel="noreferrer">WhatsApp</a>
      <a class="connection-btn contact" data-conn data-next="Taking you to contact options..." href="contact.html#connect">Connect</a>
    </aside>
    <div id="action-feedback" class="action-feedback" role="status" aria-live="polite"></div>
    <footer>${safeName} • ${safeTheme} / ${safeSubstyle} • Goal: ${safeGoal} • Website generated by TitoNova Cloud Engine Pro</footer>
  </main>
  <script>
    (() => {
      const feedback = document.getElementById("action-feedback");
      let clearTimer = null;

      const getDefaultNextAction = (href) => {
        if (!href) return "Processing action...";
        if (href.startsWith("tel:")) return "Opening phone dialer...";
        if (href.startsWith("mailto:")) return "Opening email draft...";
        if (href.includes("wa.me")) return "Opening WhatsApp chat...";
        if (href.includes("#connect")) return "Jumping to contact section...";
        if (href.endsWith(".html")) return "Opening next page...";
        return "Processing action...";
      };

      const showFeedback = (message) => {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.classList.add("show");
        if (clearTimer) window.clearTimeout(clearTimer);
        clearTimer = window.setTimeout(() => feedback.classList.remove("show"), 2200);
      };

      const links = Array.from(document.querySelectorAll("a, button"));
      links.forEach((link) => {
        link.addEventListener("click", () => {
          const next = link.getAttribute("data-next") || getDefaultNextAction(link.getAttribute("href"));
          showFeedback(next);
          link.classList.add("active");
          window.setTimeout(() => link.classList.remove("active"), 180);
        });
      });

      const forms = Array.from(document.querySelectorAll("[data-lead-form]"));
      forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(form);
          const name = data.get("fullName");
          showFeedback(
            "Thanks " +
              (name || "there") +
              " - your ${industry.label} request was received. We will contact you shortly."
          );
          form.reset();
        });
      });

      const fontAlert = document.getElementById("font-fallback-alert");
      const verifyFonts = () => {
        if (!fontAlert || !document.fonts || typeof document.fonts.check !== "function") return;
        const bodyPrimary = document.body?.dataset?.fontBodyPrimary || "";
        const headingPrimary = document.body?.dataset?.fontHeadingPrimary || "";
        const bodyOk = bodyPrimary ? document.fonts.check('16px "' + bodyPrimary + '"') : true;
        const headingOk = headingPrimary
          ? document.fonts.check('16px "' + headingPrimary + '"')
          : true;
        if (!bodyOk || !headingOk) {
          fontAlert.style.display = "block";
        }
      };
      window.setTimeout(verifyFonts, 1800);
    })();
  </script>
</body>
</html>`;

  const indexHtml = `${sharedHead(`${safeName} | Home`, "index.html")}
    <section class="hero">
      <div>
        <span class="pill">${safeIndustry} • ${safeTone}</span>
        <h1>${heroHeadline}</h1>
        <p class="sub">${heroSubhead}</p>
        <a class="cta" data-next="Opening contact page..." href="contact.html">${safeCta}</a>
        <div class="pages">${pageChips}</div>
      </div>
      <img src="${heroImage}" alt="${safeIndustry} hero" />
    </section>

    <section>
      <h2 class="title">Services</h2>
      <div class="cards">${serviceCardsMarkup}</div>
    </section>

    <section>
      <h2 class="title">Why ${safeName}</h2>
      <p class="muted">${brandPromise}</p>
      <div class="cards">${valuePropsMarkup}</div>
    </section>

    <section>
      <h2 class="title">Performance</h2>
      <div class="stats">${statsMarkup}</div>
    </section>

    <section>
      <h2 class="title">Implementation Roadmap</h2>
      <div class="startup-roadmap">${processMarkup}</div>
    </section>

    ${themeHomeBlocks[variantKey] || themeHomeBlocks[`${activeTheme}:${defaultSubstyle}`]}
    ${logoCloudBlock}
    ${portfolioBlock}
    ${pricingGrid}
    ${testimonialsGrid}
    ${faqGrid}
    ${blogGrid}
    ${ctaBandBlock}
    ${footer}`;

  const aboutHtml = `${sharedHead(`${safeName} | About`, "about.html")}
    <section class="hero">
      <div>
        <span class="pill">${safeIndustry}</span>
        <h1>${aboutCopy.heroTitle}</h1>
        <p class="sub">${aboutCopy.heroSubhead}</p>
      </div>
      <img src="${aboutImage}" alt="${safeIndustry} about" />
    </section>

    <section class="about">
      <div class="stack">
        <h2 class="title">${aboutCopy.missionTitle}</h2>
        <p class="muted">${safePrompt}</p>
        <p class="muted">${brandPromise}</p>
        <p class="muted">${aboutCopy.missionBody}</p>
      </div>
      <div class="cards">${valuePropsMarkup}</div>
    </section>

    <section>
      <h2 class="title">How We Deliver</h2>
      <div class="startup-roadmap">${processMarkup}</div>
    </section>
    <section>
      <h2 class="title">Our Story</h2>
      <div class="cards">${aboutStoryMarkup}</div>
    </section>
    <section>
      <h2 class="title">Team Values</h2>
      <div class="cards">${aboutValuesMarkup}</div>
    </section>
    ${themeAboutBlocks[variantKey] || themeAboutBlocks[`${activeTheme}:${defaultSubstyle}`]}
    ${portfolioBlock}
    ${testimonialsGrid}
    ${ctaBandBlock}
    ${footer}`;

  const servicesHtml = `${sharedHead(`${safeName} | Services`, "services.html")}
    <section>
      <span class="pill">${safeIndustry} Services</span>
      <h1>${servicesCopy.heroTitle}</h1>
      <p class="sub">${servicesCopy.heroSubhead}</p>
    </section>

    <section>
      <h2 class="title">${servicesCopy.sectionTitle}</h2>
      <div class="cards">${serviceCardsMarkup}</div>
    </section>

    <section>
      <h2 class="title">Engagement Model</h2>
      <div class="startup-roadmap">${processMarkup}</div>
    </section>
    <section>
      <h2 class="title">Service Details</h2>
      <div class="startup-roadmap">${serviceDetailsMarkup}</div>
    </section>

    <section>
      <h2 class="title">Expected Outcomes</h2>
      <div class="stats">${statsMarkup}</div>
    </section>
    <section>
      <h2 class="title">Package Comparison</h2>
      <div class="cards">${packageComparisonMarkup}</div>
    </section>

    ${themeServicesBlocks[variantKey] || themeServicesBlocks[`${activeTheme}:${defaultSubstyle}`]}
    ${pricingGrid}
    ${logoCloudBlock}

    <section>
      <h2 class="title">Recent Work</h2>
      <div class="gallery">
        <img src="${gallery[0]}" alt="Service gallery one" />
        <img src="${gallery[1]}" alt="Service gallery two" />
        <img src="${gallery[2]}" alt="Service gallery three" />
      </div>
    </section>
    ${ctaBandBlock}
    ${footer}`;

  const contactHtml = `${sharedHead(`${safeName} | Contact`, "contact.html")}
    <section>
      <span class="pill">${contactCopy.contactTitle}</span>
      <h1>${contactCopy.heroTitle}</h1>
      <p class="sub">${contactCopy.heroSubhead}</p>
      <a class="cta" data-next="Opening email draft..." href="mailto:${contactEmail}">${safeCta}</a>
    </section>

    ${detailedContactForm}
    <section>
      <h2 class="title">Inside ${safeName}</h2>
      <div class="gallery">
        <img src="${contactImage}" alt="${safeIndustry} team support" />
        <img src="${gallery[1]}" alt="${safeIndustry} workspace" />
        <img src="${aboutImage}" alt="${safeIndustry} operations" />
      </div>
    </section>
    <section>
      <h2 class="title">What Happens Next</h2>
      <p class="muted">${contactTrustCopy}</p>
      <div class="cards">${responseExpectationsMarkup}</div>
    </section>

    <section id="connect" class="contact-list">
      <article class="contact-item"><strong>Email</strong><p class="muted">${contactEmail}</p></article>
      <article class="contact-item"><strong>Phone</strong><p class="muted">${contactPhone}</p></article>
      <article class="contact-item"><strong>Office</strong><p class="muted">Add your office address</p></article>
    </section>
    ${themeContactBlocks[variantKey] || themeContactBlocks[`${activeTheme}:${defaultSubstyle}`]}
    ${faqGrid}
    ${ctaBandBlock}
    ${footer}`;

  return {
    "index.html": indexHtml,
    "about.html": aboutHtml,
    "services.html": servicesHtml,
    "contact.html": contactHtml,
    "sitemap.xml": `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${domainUrl}/index.html</loc></url>\n  <url><loc>${domainUrl}/about.html</loc></url>\n  <url><loc>${domainUrl}/services.html</loc></url>\n  <url><loc>${domainUrl}/contact.html</loc></url>\n</urlset>`,
    "robots.txt": `User-agent: *\nAllow: /\nSitemap: ${domainUrl}/sitemap.xml\n`,
    ...(normalizedDomain ? { CNAME: domainHost } : {}),
    "DOMAIN_SETUP.md": `# Domain Setup\n\nTarget domain: ${domainHost}\n\n## DNS\n- Use A/ALIAS/CNAME records based on your hosting provider.\n- Point apex/root domain and www (if used) to your host.\n\n## Site files\n- Sitemap is pre-configured: ${domainUrl}/sitemap.xml\n- Canonical URLs and OG URLs are pre-configured in page head tags.\n${normalizedDomain ? `- CNAME file included for providers that support it.` : "- Add your domain in the builder and re-export to include provider-specific domain file."}\n\n## SSL\n- Enable HTTPS in your host dashboard before going live.\n`,
  };
};

const requestServerLlmText = async ({
  model,
  systemPrompt,
  userPrompt,
  schemaName,
  schema,
}) => {
  const schemaBlock =
    schema && schemaName
      ? `\nReturn JSON that strictly follows this JSON schema (${schemaName}):\n${JSON.stringify(schema)}\n`
      : "\nReturn valid JSON only.\n";
  const prompt = [
    `Model preference: ${String(model || "default")}.`,
    `System instructions: ${String(systemPrompt || "").trim()}`,
    `User request:\n${String(userPrompt || "").trim()}`,
    schemaBlock,
  ].join("\n\n");

  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload?.error || `LLM request failed (${response.status})`));
  }
  return String(payload?.result || "").trim();
};

const generateLlmContent = async ({
  modelCandidates,
  businessName,
  industry,
  tone,
  goal,
  prompt,
  ctaText,
  onModelAttempt,
}) => {
  const modelChain = dedupeModels(modelCandidates || []);
  if (modelChain.length === 0) {
    throw new Error("No LLM models configured.");
  }

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      heroHeadline: { type: "string" },
      heroSubhead: { type: "string" },
      brandPromise: { type: "string" },
      services: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "description"],
        },
      },
      valueProps: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["title", "description"],
        },
      },
      process: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            step: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
          },
          required: ["step", "title", "description"],
        },
      },
      stats: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            value: { type: "string" },
            label: { type: "string" },
          },
          required: ["value", "label"],
        },
      },
      testimonials: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            quote: { type: "string" },
            author: { type: "string" },
          },
          required: ["quote", "author"],
        },
      },
      faqs: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
        },
      },
      closingCtaHeadline: { type: "string" },
      pageCopy: {
        type: "object",
        additionalProperties: false,
        properties: {
          about: {
            type: "object",
            additionalProperties: false,
            properties: {
              heroTitle: { type: "string" },
              heroSubhead: { type: "string" },
              missionTitle: { type: "string" },
              missionBody: { type: "string" },
              aboutStory: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
              teamValues: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title", "description"],
                },
              },
            },
            required: [
              "heroTitle",
              "heroSubhead",
              "missionTitle",
              "missionBody",
              "aboutStory",
              "teamValues",
            ],
          },
          services: {
            type: "object",
            additionalProperties: false,
            properties: {
              heroTitle: { type: "string" },
              heroSubhead: { type: "string" },
              sectionTitle: { type: "string" },
              serviceDetails: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    outcome: { type: "string" },
                  },
                  required: ["title", "description", "outcome"],
                },
              },
              packageComparison: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    tier: { type: "string" },
                    fit: { type: "string" },
                    investment: { type: "string" },
                  },
                  required: ["tier", "fit", "investment"],
                },
              },
            },
            required: [
              "heroTitle",
              "heroSubhead",
              "sectionTitle",
              "serviceDetails",
              "packageComparison",
            ],
          },
          contact: {
            type: "object",
            additionalProperties: false,
            properties: {
              heroTitle: { type: "string" },
              heroSubhead: { type: "string" },
              contactTitle: { type: "string" },
              contactTrustCopy: { type: "string" },
              responseExpectations: {
                type: "array",
                minItems: 3,
                maxItems: 3,
                items: { type: "string" },
              },
            },
            required: [
              "heroTitle",
              "heroSubhead",
              "contactTitle",
              "contactTrustCopy",
              "responseExpectations",
            ],
          },
        },
        required: ["about", "services", "contact"],
      },
    },
    required: [
      "heroHeadline",
      "heroSubhead",
      "brandPromise",
      "services",
      "valueProps",
      "process",
      "stats",
      "testimonials",
      "faqs",
      "closingCtaHeadline",
      "pageCopy",
    ],
  };

  let lastError = null;
  for (const model of modelChain) {
    onModelAttempt?.(model);
    try {
      const outputText = await requestServerLlmText({
        model,
        systemPrompt:
          "You are a conversion-focused website strategist and copywriter. Return only valid JSON that matches the required schema.",
        userPrompt: `Create website copy for:
Business: ${businessName}
Industry: ${industry.label}
Tone: ${tone}
Primary goal: ${goal}
Prompt: ${prompt}
CTA: ${ctaText}

Return concise, specific copy with no markdown. Generate distinct copy for Home/About/Services/Contact so each page has unique purpose and messaging. Include useful section-level content for each page (about story and values, service details and package comparison, contact trust and response expectations). Focus on high-ticket positioning, trust signals, proof-driven language, and clear buying paths.`,
        schemaName: "site_copy",
        schema,
      });
      const parsed = parseJsonSafe(outputText);
      if (!parsed) {
        lastError = new Error(`LLM returned invalid JSON content for ${model}.`);
        continue;
      }
      return { content: parsed, modelUsed: model };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("LLM generation failed across all selected models.");
};

const makeProject = (config) => {
  const files = buildWebsiteFiles(config);
  const qualityScore = scoreBrief(config);
  return {
    id: crypto.randomUUID(),
    businessName: config.businessName.trim() || `${config.industry.label} Studio`,
    industry: config.industry.key,
    industryLabel: config.industry.label,
    tone: config.tone,
    goal: config.goal,
    prompt: config.prompt.trim(),
    options: {
      themePreset: config.themePreset,
      substylePreset: config.substylePreset,
      brandColor: config.brandColor,
      headingFontTheme: config.headingFontTheme || config.fontTheme || "sans",
      bodyFontTheme: config.bodyFontTheme || config.fontTheme || "sans",
      pageFontOverrides: normalizePageFontOverrides(config.pageFontOverrides),
      fontTheme: config.fontTheme,
      ctaText: config.ctaText,
      seoTitle: config.seoTitle,
      customDomain: config.customDomain,
      includePricing: config.includePricing,
      includeTestimonials: config.includeTestimonials,
      includeFaq: config.includeFaq,
      includeBlog: config.includeBlog,
      visualStyle: config.visualStyle,
      includePortfolio: config.includePortfolio,
      includeLogoCloud: config.includeLogoCloud,
      enableMotion: config.enableMotion,
      useLlm: Boolean(config.useLlm),
      llmPreset: config.llmPreset || "flagship",
      llmModel: config.llmModel || "gpt-4.1",
      llmResolvedModel: config.llmResolvedModel || "",
    },
    qualityScore,
    isFavorite: false,
    publishHistory: [],
    pages: PAGE_CONFIG.map((page) => page.label),
    files,
    html: files[DEFAULT_PAGE],
    createdAt: new Date().toISOString(),
  };
};

const buildLegacyPage = (businessName, pageTitle, copy) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(businessName)} | ${escapeHtml(pageTitle)}</title>
  <style>
    body { margin: 0; padding: 40px; font-family: Arial, sans-serif; color: #0f1e36; background: #f7f9fc; }
    .nav { display: flex; gap: 10px; margin-bottom: 20px; }
    .nav a { color: #0f7a56; text-decoration: none; }
    .box { background: #fff; border: 1px solid #d9e1ef; border-radius: 12px; padding: 20px; max-width: 760px; }
  </style>
</head>
<body>
  <div class="nav">
    <a href="index.html">Home</a><a href="about.html">About</a><a href="services.html">Services</a><a href="contact.html">Contact</a>
  </div>
  <div class="box">
    <h1>${escapeHtml(pageTitle)}</h1>
    <p>${escapeHtml(copy)}</p>
  </div>
</body>
</html>`;

const getProjectFiles = (project) => {
  if (project.files && project.files[DEFAULT_PAGE]) {
    return project.files;
  }

  const business = project.businessName || "Business";
  return {
    "index.html": project.html || buildLegacyPage(business, "Home", "Website homepage."),
    "about.html": buildLegacyPage(business, "About", "Information about our team and company values."),
    "services.html": buildLegacyPage(business, "Services", "Overview of services and solutions."),
    "contact.html": buildLegacyPage(business, "Contact", "Contact details and next steps."),
    "sitemap.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>",
    "robots.txt": "User-agent: *\\nAllow: /\\n",
  };
};

const normalizeProject = (project) => {
  const files = getProjectFiles(project);
  return {
    ...project,
    files,
    html: files[DEFAULT_PAGE],
    pages: project.pages || PAGE_CONFIG.map((page) => page.label),
    qualityScore: project.qualityScore || 70,
    isFavorite: Boolean(project.isFavorite),
    versions: Array.isArray(project.versions) ? project.versions : [],
    publishHistory: Array.isArray(project.publishHistory) ? project.publishHistory : [],
    goal: project.goal || GOALS[0],
    options: {
      themePreset: project.options?.themePreset || "corporate",
      substylePreset:
        project.options?.substylePreset ||
        getDefaultSubstyle(project.options?.themePreset || "corporate"),
      brandColor: project.options?.brandColor || "#14b987",
      headingFontTheme:
        project.options?.headingFontTheme || project.options?.fontTheme || "sans",
      bodyFontTheme:
        project.options?.bodyFontTheme || project.options?.fontTheme || "sans",
      pageFontOverrides: normalizePageFontOverrides(project.options?.pageFontOverrides),
      fontTheme: project.options?.fontTheme || project.options?.bodyFontTheme || "sans",
      ctaText: project.options?.ctaText || "Book a strategy call",
      seoTitle: project.options?.seoTitle || "",
      customDomain: project.options?.customDomain || "",
      includePricing: project.options?.includePricing ?? true,
      includeTestimonials: project.options?.includeTestimonials ?? true,
      includeFaq: project.options?.includeFaq ?? true,
      includeBlog: project.options?.includeBlog ?? false,
      visualStyle: project.options?.visualStyle || "glass",
      includePortfolio: project.options?.includePortfolio ?? true,
      includeLogoCloud: project.options?.includeLogoCloud ?? true,
      enableMotion: project.options?.enableMotion ?? true,
      useLlm: project.options?.useLlm ?? false,
      llmPreset: project.options?.llmPreset || "flagship",
      llmModel: project.options?.llmModel || "gpt-4.1",
      llmResolvedModel: project.options?.llmResolvedModel || "",
    },
  };
};

const createVersionSnapshot = (project, note = "Snapshot") => ({
  id: crypto.randomUUID(),
  note,
  createdAt: new Date().toISOString(),
  files: getProjectFiles(project),
});

const replaceInContent = (content, from, to, caseSensitive) => {
  if (!from) return content;
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const flags = caseSensitive ? "g" : "gi";
  return content.replace(new RegExp(escaped, flags), to);
};

const parsePageSections = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const main = doc.querySelector("main");
  if (!main) return [];

  const sections = Array.from(main.children).filter((node) => node.tagName === "SECTION");
  return sections.map((section, index) => {
    const heading = section.querySelector("h1, h2, h3");
    const title = heading?.textContent?.trim() || `Section ${index + 1}`;
    return {
      index,
      title: title.slice(0, 80),
      html: section.outerHTML,
    };
  });
};

const extractQuickEditFields = (html) => {
  if (!html) return { headline: "", subhead: "", cta: "" };
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.querySelector("main") || doc.body;
  const headline = root?.querySelector("h1")?.textContent?.trim() || "";
  const subhead =
    root?.querySelector(".sub")?.textContent?.trim() ||
    root?.querySelector("p")?.textContent?.trim() ||
    "";
  const cta = root?.querySelector("a.cta")?.textContent?.trim() || "";
  return { headline, subhead, cta };
};

const SECTION_REWRITE_OPTIONS = [
  {
    key: "hero",
    label: "Hero",
    pages: ["index.html", "about.html", "services.html", "contact.html"],
  },
  {
    key: "services",
    label: "Services",
    pages: ["index.html", "services.html"],
  },
  {
    key: "about_story",
    label: "About Story",
    pages: ["about.html"],
  },
  {
    key: "contact_block",
    label: "Contact block",
    pages: ["contact.html"],
  },
];

const getSectionOptionsForPage = (pageKey) =>
  SECTION_REWRITE_OPTIONS.filter((item) => item.pages.includes(pageKey));

const extractSectionRewriteFields = (html, sectionKey) => {
  if (!html) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (sectionKey === "hero") {
    const headline = doc.querySelector("h1")?.textContent?.trim() || "";
    const subhead = doc.querySelector(".sub")?.textContent?.trim() || "";
    const cta = doc.querySelector("a.cta")?.textContent?.trim() || "";
    return { headline, subhead, cta };
  }

  if (sectionKey === "services") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target =
      sections.find((section) => /service/i.test(section.querySelector("h2")?.textContent || "")) ||
      sections.find((section) => section.querySelector(".cards .card"));
    if (!target) return null;
    const title = target.querySelector("h2")?.textContent?.trim() || "";
    const points = Array.from(target.querySelectorAll(".card p"))
      .slice(0, 3)
      .map((node) => node.textContent?.trim() || "");
    return {
      title,
      point1: points[0] || "",
      point2: points[1] || "",
      point3: points[2] || "",
    };
  }

  if (sectionKey === "about_story") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target = sections.find((section) =>
      /our story/i.test(section.querySelector("h2")?.textContent || "")
    );
    if (!target) return null;
    const title = target.querySelector("h2")?.textContent?.trim() || "";
    const stories = Array.from(target.querySelectorAll(".card p"))
      .slice(0, 3)
      .map((node) => node.textContent?.trim() || "");
    return {
      title,
      story1: stories[0] || "",
      story2: stories[1] || "",
      story3: stories[2] || "",
    };
  }

  if (sectionKey === "contact_block") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target =
      sections.find((section) =>
        /what happens next/i.test(section.querySelector("h2")?.textContent || "")
      ) || doc.querySelector("section#connect");
    if (!target) return null;
    const title = target.querySelector("h2")?.textContent?.trim() || "Contact block";
    const blurb = target.querySelector("p.muted")?.textContent?.trim() || "";
    const points = Array.from(target.querySelectorAll(".card p, .contact-item p"))
      .slice(0, 3)
      .map((node) => node.textContent?.trim() || "");
    return {
      title,
      blurb,
      point1: points[0] || "",
      point2: points[1] || "",
      point3: points[2] || "",
    };
  }

  return null;
};

const applySectionRewriteFields = (html, sectionKey, fields) => {
  if (!html || !fields) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (sectionKey === "hero") {
    const headline = doc.querySelector("h1");
    const subhead = doc.querySelector(".sub");
    const cta = doc.querySelector("a.cta");
    if (headline && fields.headline?.trim()) headline.textContent = fields.headline.trim();
    if (subhead && fields.subhead?.trim()) subhead.textContent = fields.subhead.trim();
    if (cta && fields.cta?.trim()) cta.textContent = fields.cta.trim();
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  }

  if (sectionKey === "services") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target =
      sections.find((section) => /service/i.test(section.querySelector("h2")?.textContent || "")) ||
      sections.find((section) => section.querySelector(".cards .card"));
    if (!target) return html;
    const titleNode = target.querySelector("h2");
    if (titleNode && fields.title?.trim()) titleNode.textContent = fields.title.trim();
    const pointNodes = Array.from(target.querySelectorAll(".card p")).slice(0, 3);
    [fields.point1, fields.point2, fields.point3].forEach((value, index) => {
      if (pointNodes[index] && String(value || "").trim()) {
        pointNodes[index].textContent = String(value).trim();
      }
    });
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  }

  if (sectionKey === "about_story") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target = sections.find((section) =>
      /our story/i.test(section.querySelector("h2")?.textContent || "")
    );
    if (!target) return html;
    const titleNode = target.querySelector("h2");
    if (titleNode && fields.title?.trim()) titleNode.textContent = fields.title.trim();
    const storyNodes = Array.from(target.querySelectorAll(".card p")).slice(0, 3);
    [fields.story1, fields.story2, fields.story3].forEach((value, index) => {
      if (storyNodes[index] && String(value || "").trim()) {
        storyNodes[index].textContent = String(value).trim();
      }
    });
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  }

  if (sectionKey === "contact_block") {
    const sections = Array.from(doc.querySelectorAll("main section"));
    const target =
      sections.find((section) =>
        /what happens next/i.test(section.querySelector("h2")?.textContent || "")
      ) || doc.querySelector("section#connect");
    if (!target) return html;
    const titleNode = target.querySelector("h2");
    if (titleNode && fields.title?.trim()) titleNode.textContent = fields.title.trim();
    const blurbNode = target.querySelector("p.muted");
    if (blurbNode && fields.blurb?.trim()) blurbNode.textContent = fields.blurb.trim();
    const pointNodes = Array.from(target.querySelectorAll(".card p, .contact-item p")).slice(0, 3);
    [fields.point1, fields.point2, fields.point3].forEach((value, index) => {
      if (pointNodes[index] && String(value || "").trim()) {
        pointNodes[index].textContent = String(value).trim();
      }
    });
    return "<!doctype html>\n" + doc.documentElement.outerHTML;
  }

  return html;
};

const applyQuickEditFieldsToHtml = (html, fields) => {
  if (!html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.querySelector("main") || doc.body;
  if (!root) return html;

  const headlineNode = root.querySelector("h1");
  if (headlineNode && fields.headline.trim()) {
    headlineNode.textContent = fields.headline.trim();
  }

  const subheadNode = root.querySelector(".sub") || root.querySelector("p");
  if (subheadNode && fields.subhead.trim()) {
    subheadNode.textContent = fields.subhead.trim();
  }

  const ctaNode = root.querySelector("a.cta");
  if (ctaNode && fields.cta.trim()) {
    ctaNode.textContent = fields.cta.trim();
  }

  return "<!doctype html>\n" + doc.documentElement.outerHTML;
};

const rewritePageSections = (html, sectionUpdater) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const main = doc.querySelector("main");
  if (!main) return html;

  const sectionNodes = Array.from(main.children).filter((node) => node.tagName === "SECTION");
  const sectionHtml = sectionNodes.map((node) => node.outerHTML);
  const nextSections = sectionUpdater(sectionHtml);
  if (!Array.isArray(nextSections) || nextSections.length === 0) return html;

  sectionNodes.forEach((node) => node.remove());
  const footer = Array.from(main.children).find((node) => node.tagName === "FOOTER");

  if (footer) {
    nextSections
      .slice()
      .reverse()
      .forEach((section) => footer.insertAdjacentHTML("beforebegin", section));
  } else {
    nextSections.forEach((section) => main.insertAdjacentHTML("beforeend", section));
  }

  return "<!doctype html>\n" + doc.documentElement.outerHTML;
};

const analyzeProjectFiles = (files) => {
  const pageKeys = ["index.html", "about.html", "services.html", "contact.html"];
  let score = 100;
  let missingMeta = 0;
  let headingIssues = 0;
  let missingAlt = 0;
  let totalWords = 0;
  let totalLinks = 0;
  let ctaCount = 0;

  pageKeys.forEach((key) => {
    const html = files[key] || "";
    if (!/<meta[^>]+name=["']description["'][^>]*>/i.test(html)) {
      missingMeta += 1;
      score -= 6;
    }

    const h1Matches = html.match(/<h1\b/gi) || [];
    if (h1Matches.length !== 1) {
      headingIssues += 1;
      score -= 8;
    }

    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    imgTags.forEach((tag) => {
      if (!/\balt=["'][^"']*["']/i.test(tag)) {
        missingAlt += 1;
        score -= 2;
      }
    });

    const textOnly = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    totalWords += textOnly ? textOnly.split(" ").length : 0;

    totalLinks += (html.match(/<a\b/gi) || []).length;
    ctaCount += (html.match(/book|start|get|schedule|consult|request/gi) || []).length;
  });

  if (totalWords < 900) score -= 8;
  if (totalLinks < 12) score -= 6;
  if (ctaCount < 8) score -= 5;

  return {
    score: Math.max(0, Math.min(100, score)),
    metrics: {
      totalWords,
      totalLinks,
      ctaCount,
      missingMeta,
      headingIssues,
      missingAlt,
    },
  };
};

const PUBLISH_PAGE_KEYS = ["index.html", "about.html", "services.html", "contact.html"];

const countWords = (value) => {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
};

const runPublishChecklist = (files) => {
  const shortHeadlinePages = [];
  const missingCtaPages = [];
  const emptySections = [];

  PUBLISH_PAGE_KEYS.forEach((pageKey) => {
    const html = files[pageKey] || "";
    if (!html) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const h1Text = doc.querySelector("h1")?.textContent?.trim() || "";
    if (h1Text.length < 18) {
      shortHeadlinePages.push(pageKey);
    }

    const hasCta = Boolean(doc.querySelector("a.cta, button.cta, .cta"));
    if (!hasCta) {
      missingCtaPages.push(pageKey);
    }

    Array.from(doc.querySelectorAll("main section")).forEach((section, index) => {
      if (countWords(section.textContent || "") < 6) {
        emptySections.push({ page: pageKey, index });
      }
    });
  });

  const contactHtml = files["contact.html"] || "";
  const contactDoc = new DOMParser().parseFromString(contactHtml, "text/html");
  const hasContactEmail =
    Boolean(contactDoc.querySelector('a[href^="mailto:"]')) ||
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(contactHtml);
  const hasContactPhone =
    Boolean(contactDoc.querySelector('a[href^="tel:"]')) ||
    /\+?\d[\d\s().-]{7,}\d/.test(contactHtml);
  const missingContactInfo = !hasContactEmail || !hasContactPhone;

  const items = [
    {
      key: "missing_cta",
      label: "Primary CTA on each page",
      pass: missingCtaPages.length === 0,
      critical: true,
      message:
        missingCtaPages.length === 0
          ? "CTA found on all pages."
          : `Missing CTA on ${missingCtaPages.length} page(s).`,
    },
    {
      key: "short_headline",
      label: "Headlines are strong enough",
      pass: shortHeadlinePages.length === 0,
      critical: true,
      message:
        shortHeadlinePages.length === 0
          ? "Headlines meet minimum length."
          : `${shortHeadlinePages.length} page headline(s) are too short.`,
    },
    {
      key: "missing_contact_info",
      label: "Contact page has email and phone",
      pass: !missingContactInfo,
      critical: true,
      message: missingContactInfo ? "Missing email or phone on contact page." : "Contact info found.",
    },
    {
      key: "empty_sections",
      label: "Sections have meaningful text",
      pass: emptySections.length === 0,
      critical: false,
      message:
        emptySections.length === 0
          ? "No empty sections detected."
          : `${emptySections.length} section(s) appear empty or too thin.`,
    },
  ];

  const scorePenalty =
    Math.round((35 * missingCtaPages.length) / PUBLISH_PAGE_KEYS.length) +
    Math.round((25 * shortHeadlinePages.length) / PUBLISH_PAGE_KEYS.length) +
    (missingContactInfo ? 25 : 0) +
    Math.min(15, emptySections.length * 4);
  const readinessScore = Math.max(0, Math.min(100, 100 - scorePenalty));
  const readinessBand =
    readinessScore >= 85 ? "ready" : readinessScore >= 65 ? "almost" : "needs_work";
  const priorities = [
    {
      key: "missing_cta",
      label: "Add clear CTA buttons",
      impact: Math.round((35 * missingCtaPages.length) / PUBLISH_PAGE_KEYS.length),
      failed: missingCtaPages.length > 0,
    },
    {
      key: "short_headline",
      label: "Strengthen short headlines",
      impact: Math.round((25 * shortHeadlinePages.length) / PUBLISH_PAGE_KEYS.length),
      failed: shortHeadlinePages.length > 0,
    },
    {
      key: "missing_contact_info",
      label: "Add contact email and phone",
      impact: missingContactInfo ? 25 : 0,
      failed: missingContactInfo,
    },
    {
      key: "empty_sections",
      label: "Expand thin sections",
      impact: Math.min(15, emptySections.length * 4),
      failed: emptySections.length > 0,
    },
  ];
  const nextPriority =
    priorities.filter((item) => item.failed).sort((a, b) => b.impact - a.impact)[0] || null;

  return {
    items,
    criticalFailed: items.some((item) => item.critical && !item.pass),
    readinessScore,
    readinessBand,
    fixFirst: nextPriority ? nextPriority.label : "No blockers. Ready to publish.",
    details: {
      missingCtaPages,
      shortHeadlinePages,
      missingContactInfo,
      emptySections,
    },
  };
};

const applyPublishChecklistFixes = (files, checklist, fixContent) => {
  const next = { ...files };
  const headlineBase = String(fixContent?.heroHeadline || "Grow with confidence");
  const subheadBase = String(fixContent?.heroSubhead || "Get a conversion-focused website experience.");
  const ctaBase = String(fixContent?.ctaText || "Book a strategy call");
  const contactEmail = String(fixContent?.contactEmail || "hello@example.com");
  const contactPhone = String(fixContent?.contactPhone || "+1 (000) 000-0000");
  const emptySectionText = String(
    fixContent?.emptySectionText || "This section has been enhanced for clarity and conversion."
  );

  PUBLISH_PAGE_KEYS.forEach((pageKey) => {
    const html = next[pageKey] || "";
    if (!html) return;

    next[pageKey] = mutateHtmlDocument(html, (doc) => {
      let changed = false;

      if (checklist.details.shortHeadlinePages.includes(pageKey)) {
        const h1 = doc.querySelector("h1");
        if (h1) {
          const pageLabel =
            PAGE_CONFIG.find((page) => page.key === pageKey)?.label || "Page";
          h1.textContent = `${headlineBase} - ${pageLabel}`;
          changed = true;
        }
      }

      if (checklist.details.missingCtaPages.includes(pageKey)) {
        const section = doc.querySelector("main section");
        if (section && !section.querySelector("a.cta, button.cta, .cta")) {
          const cta = doc.createElement("a");
          cta.className = "cta";
          cta.setAttribute("href", "contact.html");
          cta.textContent = ctaBase;
          section.appendChild(cta);
          changed = true;
        }
      }

      if (checklist.details.emptySections.some((item) => item.page === pageKey)) {
        const sections = Array.from(doc.querySelectorAll("main section"));
        sections.forEach((section) => {
          if (countWords(section.textContent || "") >= 6) return;
          const filler = doc.createElement("p");
          filler.className = "muted";
          filler.textContent = subheadBase || emptySectionText;
          section.appendChild(filler);
          changed = true;
        });
      }

      if (pageKey === "contact.html" && checklist.details.missingContactInfo) {
        const connectSection =
          doc.querySelector("#connect") || doc.querySelector("main section:last-of-type");
        if (connectSection) {
          if (!doc.querySelector('a[href^="mailto:"]')) {
            const emailLink = doc.createElement("a");
            emailLink.className = "cta";
            emailLink.setAttribute("href", `mailto:${contactEmail}`);
            emailLink.textContent = contactEmail;
            connectSection.appendChild(emailLink);
            changed = true;
          }
          if (!doc.querySelector('a[href^="tel:"]')) {
            const phoneLink = doc.createElement("a");
            phoneLink.className = "cta";
            phoneLink.setAttribute("href", `tel:${contactPhone.replace(/[^\d+]/g, "")}`);
            phoneLink.textContent = contactPhone;
            connectSection.appendChild(phoneLink);
            changed = true;
          }
        }
      }

      return changed;
    });
  });

  return next;
};

const mutateHtmlDocument = (html, mutator) => {
  if (!html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const changed = Boolean(mutator(doc));
  if (!changed) return html;
  return "<!doctype html>\n" + doc.documentElement.outerHTML;
};

const ensureMetaDescription = (html, description) =>
  mutateHtmlDocument(html, (doc) => {
    const head = doc.querySelector("head");
    if (!head) return false;
    const existing = head.querySelector('meta[name="description"]');
    if (existing) return false;
    const tag = doc.createElement("meta");
    tag.setAttribute("name", "description");
    tag.setAttribute("content", description);
    head.appendChild(tag);
    return true;
  });

const ensureImageAltAttributes = (html) =>
  mutateHtmlDocument(html, (doc) => {
    const images = Array.from(doc.querySelectorAll("img"));
    let changed = false;
    images.forEach((image, index) => {
      const alt = image.getAttribute("alt");
      if (typeof alt === "string" && alt.trim()) return;
      image.setAttribute("alt", `Website image ${index + 1}`);
      changed = true;
    });
    return changed;
  });

const appendSectionBeforeFooter = (html, marker, sectionHtml) =>
  mutateHtmlDocument(html, (doc) => {
    if (doc.querySelector(`[data-optimizer="${marker}"]`)) return false;
    const main = doc.querySelector("main");
    if (!main) return false;
    const footer = main.querySelector("footer");
    if (footer) {
      footer.insertAdjacentHTML("beforebegin", sectionHtml);
    } else {
      main.insertAdjacentHTML("beforeend", sectionHtml);
    }
    return true;
  });

const estimateDataUrlBytes = (dataUrl) => {
  const raw = String(dataUrl || "").split(",")[1] || "";
  return Math.floor((raw.length * 3) / 4);
};

const formatBytes = (bytes) => {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const updatePageImages = (html, { target, src, alt }) =>
  mutateHtmlDocument(html, (doc) => {
    const allImages = Array.from(doc.querySelectorAll("img"));
    if (allImages.length === 0) return false;

    let candidates = [];
    if (target === "hero") {
      const hero = doc.querySelector(".hero img") || allImages[0];
      if (hero) candidates = [hero];
    } else if (target === "about") {
      const about = doc.querySelector(".about img") || allImages[1] || allImages[0];
      if (about) candidates = [about];
    } else if (target === "portfolio_one") {
      const portfolioPrimary =
        doc.querySelector(".portfolio-grid article:first-child img") || doc.querySelector(".portfolio-grid img");
      if (portfolioPrimary) {
        candidates = [portfolioPrimary];
      } else {
        const galleryPrimary = doc.querySelector(".gallery img") || allImages[0];
        if (galleryPrimary) candidates = [galleryPrimary];
      }
    } else if (target === "gallery") {
      candidates = Array.from(doc.querySelectorAll(".gallery img, .portfolio-grid img, .luxury-gallery img"));
      if (candidates.length === 0) candidates = allImages.slice(1);
    } else if (target === "all") {
      candidates = allImages;
    } else {
      candidates = [allImages[0]];
    }

    const unique = [];
    const seen = new Set();
    candidates.forEach((node) => {
      if (!node || seen.has(node)) return;
      seen.add(node);
      unique.push(node);
    });
    if (unique.length === 0) return false;

    let changed = false;
    unique.forEach((image) => {
      if (image.getAttribute("src") !== src) {
        image.setAttribute("src", src);
        changed = true;
      }
      if (image.hasAttribute("srcset")) {
        image.removeAttribute("srcset");
        changed = true;
      }
      if (alt && image.getAttribute("alt") !== alt) {
        image.setAttribute("alt", alt);
        changed = true;
      }
      image.setAttribute("loading", "lazy");
    });

    return changed;
  });

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let j = 0; j < 8; j += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const toDosDateTime = (date) => {
  const year = Math.min(Math.max(date.getFullYear(), 1980), 2107);
  const dosTime = (date.getSeconds() >> 1) | (date.getMinutes() << 5) | (date.getHours() << 11);
  const dosDate = date.getDate() | ((date.getMonth() + 1) << 5) | ((year - 1980) << 9);
  return { dosDate, dosTime };
};

const createZipBlob = (namedFiles) => {
  const encoder = new TextEncoder();
  const now = toDosDateTime(new Date());
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  namedFiles.forEach(({ name, content }) => {
    const nameBytes = encoder.encode(name);
    const dataBytes = encoder.encode(content);
    const checksum = crc32(dataBytes);

    const localHeader = new ArrayBuffer(30);
    const localView = new DataView(localHeader);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, now.dosTime, true);
    localView.setUint16(12, now.dosDate, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, dataBytes.length, true);
    localView.setUint32(22, dataBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);

    localParts.push(localHeader, nameBytes, dataBytes);

    const centralHeader = new ArrayBuffer(46);
    const centralView = new DataView(centralHeader);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, now.dosTime, true);
    centralView.setUint16(14, now.dosDate, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, dataBytes.length, true);
    centralView.setUint32(24, dataBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);

    centralParts.push(centralHeader, nameBytes);
    offset += 30 + nameBytes.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.byteLength, 0);
  const endRecord = new ArrayBuffer(22);
  const endView = new DataView(endRecord);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, namedFiles.length, true);
  endView.setUint16(10, namedFiles.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, endRecord], { type: "application/zip" });
};

export default function App() {
  const [businessName, setBusinessName] = useState("Nova Studio");
  const [prompt, setPrompt] = useState(
    "Build a high-converting website with clear service sections, trust signals, and lead capture."
  );
  const [industryKey, setIndustryKey] = useState(DEFAULT_INDUSTRY.key);
  const [tone, setTone] = useState(TONES[0]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [themePreset, setThemePreset] = useState("corporate");
  const [substylePreset, setSubstylePreset] = useState(
    getDefaultSubstyle("corporate")
  );

  const [brandColor, setBrandColor] = useState("#14b987");
  const [headingFontTheme, setHeadingFontTheme] = useState("display");
  const [bodyFontTheme, setBodyFontTheme] = useState("sans");
  const [pageFontOverrides, setPageFontOverrides] = useState(createDefaultPageFontOverrides());
  const [ctaText, setCtaText] = useState("Book a strategy call");
  const [seoTitle, setSeoTitle] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [useLlm, setUseLlm] = useState(true);
  const [llmPreset, setLlmPreset] = useState("flagship");
  const [llmModel, setLlmModel] = useState("gpt-4.1");
  const [llmCustomModel, setLlmCustomModel] = useState("");
  const [llmStatus, setLlmStatus] = useState("");
  const [visualStyle, setVisualStyle] = useState("glass");
  const [includePricing, setIncludePricing] = useState(true);
  const [includeTestimonials, setIncludeTestimonials] = useState(true);
  const [includeFaq, setIncludeFaq] = useState(true);
  const [includeBlog, setIncludeBlog] = useState(false);
  const [includePortfolio, setIncludePortfolio] = useState(true);
  const [includeLogoCloud, setIncludeLogoCloud] = useState(true);
  const [enableMotion, setEnableMotion] = useState(true);

  const [projectSearch, setProjectSearch] = useState("");
  const [sortMode, setSortMode] = useState("newest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const [domainSuggestions, setDomainSuggestions] = useState([]);
  const [domainCart, setDomainCart] = useState([]);
  const [ownedDomains, setOwnedDomains] = useState([]);
  const [domainMessage, setDomainMessage] = useState("");
  const [registrarProvider, setRegistrarProvider] = useState(REGISTRAR_PROVIDERS[0].key);
  const [liveRegistrarMode, setLiveRegistrarMode] = useState(false);
  const [registrarLoading, setRegistrarLoading] = useState(false);
  const [registrarHealthStatus, setRegistrarHealthStatus] = useState("");
  const [sellerMode, setSellerMode] = useState(false);
  const [resellerMargin, setResellerMargin] = useState(35);
  const [hostingMessage, setHostingMessage] = useState("");
  const [hostingStep, setHostingStep] = useState("idle");
  const [lastPublishProjectId, setLastPublishProjectId] = useState("");
  const [publishLogs, setPublishLogs] = useState([]);
  const [hostingBusyId, setHostingBusyId] = useState("");
  const [hostedSites, setHostedSites] = useState({});
  const [publishChecklist, setPublishChecklist] = useState(null);
  const [publishChecklistBusy, setPublishChecklistBusy] = useState(false);
  const [goLiveStep, setGoLiveStep] = useState("idle");
  const [goLiveMessage, setGoLiveMessage] = useState("");
  const [goLiveError, setGoLiveError] = useState("");

  const [previewPage, setPreviewPage] = useState(DEFAULT_PAGE);
  const [previewDevice, setPreviewDevice] = useState("desktop");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [projects, setProjects] = useState([]);
  const [draftProject, setDraftProject] = useState(null);

  const [previewHtml, setPreviewHtml] = useState("");
  const [editableHtml, setEditableHtml] = useState("");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [replaceFrom, setReplaceFrom] = useState("");
  const [replaceTo, setReplaceTo] = useState("");
  const [replaceCaseSensitive, setReplaceCaseSensitive] = useState(false);
  const [versionNote, setVersionNote] = useState("");
  const [selectedBlockTemplate, setSelectedBlockTemplate] = useState("feature_grid");
  const [imageUploadTarget, setImageUploadTarget] = useState("hero");
  const [applyUploadToAllPages, setApplyUploadToAllPages] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState("");
  const [isImageDropActive, setIsImageDropActive] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState("");
  const [insightMessage, setInsightMessage] = useState("");
  const [quickEditFields, setQuickEditFields] = useState({
    headline: "",
    subhead: "",
    cta: "",
  });
  const [quickEditBaseline, setQuickEditBaseline] = useState({
    headline: "",
    subhead: "",
    cta: "",
  });
  const [quickRewriteTone, setQuickRewriteTone] = useState("Professional");
  const [quickAiBusy, setQuickAiBusy] = useState(false);
  const [quickAiSuggestion, setQuickAiSuggestion] = useState(null);
  const [sectionRewriteTarget, setSectionRewriteTarget] = useState("hero");
  const [sectionAiBusy, setSectionAiBusy] = useState(false);
  const [sectionRewriteBefore, setSectionRewriteBefore] = useState(null);
  const [sectionAiSuggestion, setSectionAiSuggestion] = useState(null);
  const [sectionRewritePreset, setSectionRewritePreset] = useState("premium");
  const [lastSectionUndo, setLastSectionUndo] = useState(null);
  const [applySectionToMatchingPages, setApplySectionToMatchingPages] = useState(false);
  const [quickApplyAllPages, setQuickApplyAllPages] = useState(false);
  const [quickEditStatus, setQuickEditStatus] = useState("");
  const [quickEditStep, setQuickEditStep] = useState(1);
  const [lastQuickEditUndo, setLastQuickEditUndo] = useState(null);
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [showAdvancedLandingActions, setShowAdvancedLandingActions] = useState(false);

  const iframeRef = useRef(null);
  const iframeListenerRef = useRef(null);
  const projectImportRef = useRef(null);
  const imageUploadInputRef = useRef(null);
  const shortcutHandlersRef = useRef({
    generateOne: () => {},
    generateAll: () => {},
    saveInlineEdits: () => {},
  });

  const activeIndustry = INDUSTRIES.find((item) => item.key === industryKey) || DEFAULT_INDUSTRY;

  const qualityScore = useMemo(
    () =>
      scoreBrief({
        businessName,
        prompt,
        seoTitle,
        ctaText,
        includeFaq,
        includePricing,
      }),
    [businessName, prompt, seoTitle, ctaText, includeFaq, includePricing]
  );

  const projectCount = useMemo(() => projects.length, [projects.length]);
  const availableSubstyles = useMemo(
    () => THEME_SUBSTYLES[themePreset] || [],
    [themePreset]
  );
  const selectedRegistrar = useMemo(
    () => getRegistrarProviderByKey(registrarProvider),
    [registrarProvider]
  );
  const selectedLlmPreset = useMemo(() => getLlmPresetByKey(llmPreset), [llmPreset]);
  const llmModelOptions = useMemo(
    () => dedupeModels([llmModel, ...(selectedLlmPreset.models || [])]),
    [llmModel, selectedLlmPreset]
  );

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (favoritesOnly) {
      list = list.filter((project) => project.isFavorite);
    }

    if (projectSearch.trim()) {
      const needle = projectSearch.toLowerCase();
      list = list.filter((project) =>
        `${project.businessName} ${project.industryLabel} ${project.tone} ${project.goal} ${project.options?.themePreset || ""} ${project.options?.substylePreset || ""} ${project.options?.visualStyle || ""} ${project.options?.customDomain || ""}`
          .toLowerCase()
          .includes(needle)
      );
    }

    list.sort((a, b) => {
      if (sortMode === "score") return (b.qualityScore || 0) - (a.qualityScore || 0);
      if (sortMode === "name") return a.businessName.localeCompare(b.businessName);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [projects, projectSearch, favoritesOnly, sortMode]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || null,
    [projects, activeProjectId]
  );
  const quickEditDiffRows = useMemo(
    () => [
      {
        label: "Headline",
        before: quickEditBaseline.headline || "(empty)",
        after: quickEditFields.headline.trim() || "(empty)",
      },
      {
        label: "Subhead",
        before: quickEditBaseline.subhead || "(empty)",
        after: quickEditFields.subhead.trim() || "(empty)",
      },
      {
        label: "CTA",
        before: quickEditBaseline.cta || "(empty)",
        after: quickEditFields.cta.trim() || "(empty)",
      },
    ],
    [quickEditBaseline, quickEditFields]
  );
  const quickEditHasChanges = useMemo(
    () => quickEditDiffRows.some((row) => row.before !== row.after),
    [quickEditDiffRows]
  );
  const sectionOptionsForPage = useMemo(
    () => getSectionOptionsForPage(previewPage),
    [previewPage]
  );
  const sectionDiffRows = useMemo(() => {
    const before = sectionRewriteBefore || {};
    const after = sectionAiSuggestion || {};
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    return keys.map((key) => ({
      key,
      before: String(before[key] || ""),
      after: String(after[key] || ""),
    }));
  }, [sectionRewriteBefore, sectionAiSuggestion]);
  const sectionFieldCount = useMemo(() => {
    if (sectionAiSuggestion) {
      return Object.keys(sectionAiSuggestion).filter((key) => !key.startsWith("__")).length;
    }
    if (sectionRewriteBefore) return Object.keys(sectionRewriteBefore).length;
    return 0;
  }, [sectionAiSuggestion, sectionRewriteBefore]);
  const activeProjectForRewrite = useMemo(() => {
    if (activeProject) return activeProject;
    if (draftProject?.id === activeProjectId) return normalizeProject(draftProject);
    return null;
  }, [activeProject, draftProject, activeProjectId]);
  const sectionMatchingPages = useMemo(() => {
    if (!activeProjectForRewrite) return [];
    const files = getProjectFiles(activeProjectForRewrite);
    return PAGE_CONFIG.filter((page) => {
      if (!getSectionOptionsForPage(page.key).some((item) => item.key === sectionRewriteTarget)) {
        return false;
      }
      const html = files[page.key];
      return Boolean(extractSectionRewriteFields(html || "", sectionRewriteTarget));
    }).map((page) => page.key);
  }, [activeProjectForRewrite, sectionRewriteTarget]);
  const impactedFieldCount = useMemo(() => {
    if (sectionFieldCount === 0) return 0;
    const pageCount = applySectionToMatchingPages ? sectionMatchingPages.length : 1;
    return sectionFieldCount * pageCount;
  }, [sectionFieldCount, applySectionToMatchingPages, sectionMatchingPages.length]);
  const previewPageLabel = useMemo(
    () => PAGE_CONFIG.find((page) => page.key === previewPage)?.label || "Page",
    [previewPage]
  );
  const previewAddress = useMemo(() => {
    const rawDomain = String(customDomain || `${businessName || "preview"}.com`)
      .trim()
      .toLowerCase();
    const normalizedDomain = rawDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "preview.titonova.site";
    const path = previewPage === "index.html" ? "" : `/${previewPage}`;
    return `https://${normalizedDomain}${path}`;
  }, [businessName, customDomain, previewPage]);

  const pageSections = useMemo(() => {
    if (!previewHtml) return [];
    return parsePageSections(previewHtml);
  }, [previewHtml]);

  const siteAudit = useMemo(() => {
    if (!activeProject) return null;
    return analyzeProjectFiles(getProjectFiles(activeProject));
  }, [activeProject]);

  const smartInsights = useMemo(() => {
    if (!siteAudit) return [];
    const list = [];
    if (siteAudit.metrics.missingMeta > 0) {
      list.push({
        key: "meta",
        label: "Add missing meta descriptions",
        description: `${siteAudit.metrics.missingMeta} pages are missing description metadata.`,
      });
    }
    if (siteAudit.metrics.missingAlt > 0) {
      list.push({
        key: "alt",
        label: "Patch missing image alt text",
        description: `${siteAudit.metrics.missingAlt} images are missing alt attributes.`,
      });
    }
    if (siteAudit.metrics.ctaCount < 8) {
      list.push({
        key: "cta",
        label: "Increase CTA density",
        description: "Low CTA coverage can reduce conversion intent signals.",
      });
    }
    if (siteAudit.metrics.totalLinks < 12) {
      list.push({
        key: "links",
        label: "Add quick-link hub",
        description: "Internal linking depth is below the recommended baseline.",
      });
    }
    if (siteAudit.metrics.totalWords < 900) {
      list.push({
        key: "content",
        label: "Add authority content block",
        description: "Total copy length is short for SEO depth.",
      });
    }
    return list;
  }, [siteAudit]);

  const namecheapDiagnostics = useMemo(() => {
    if (registrarProvider !== "namecheap") return [];
    const status = String(registrarHealthStatus || "").toLowerCase();
    const hasConnectionFailure = status.includes("connection failed");
    const connected = status.includes("connected:");
    const apiKeyIssue =
      status.includes("api key is invalid") || status.includes("api access has not been enabled");
    const ipIssue = status.includes("whitelist") || status.includes("client ip") || status.includes("not allowed");
    const modeIssue = status.includes("sandbox");

    return [
      {
        label: "Live registrar mode",
        state: liveRegistrarMode ? "ok" : "warn",
        note: liveRegistrarMode ? "Enabled" : "Enable Live Registrar API before testing.",
      },
      {
        label: "Gateway connectivity",
        state: connected ? "ok" : hasConnectionFailure ? "fail" : "warn",
        note: connected ? "Gateway reachable." : "Start gateway with `npm run dev:gateway`.",
      },
      {
        label: "API credentials",
        state: apiKeyIssue ? "fail" : connected ? "ok" : "warn",
        note: apiKeyIssue
          ? "Verify API key, API access enablement, and account username."
          : "No API key error detected in latest check.",
      },
      {
        label: "Whitelisted client IP",
        state: ipIssue ? "fail" : "warn",
        note: ipIssue ? "Whitelist NAMECHEAP_CLIENT_IP in Namecheap dashboard." : "Check whitelist if auth still fails.",
      },
      {
        label: "Sandbox mode",
        state: modeIssue ? "fail" : "warn",
        note: modeIssue
          ? "Sandbox mismatch detected."
          : "If auth fails, try flipping NAMECHEAP_SANDBOX and retest.",
      },
    ];
  }, [registrarProvider, registrarHealthStatus, liveRegistrarMode]);

  const readFromStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  };

  const readDomainStore = () => {
    const raw = localStorage.getItem(DOMAIN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  };

  const writeDomainStore = (data) => {
    localStorage.setItem(DOMAIN_STORAGE_KEY, JSON.stringify(data));
  };

  const getUserDomainData = (userEmail) => {
    const data = readDomainStore();
    return (
      data[userEmail] || {
        owned: [],
        cart: [],
        seller: { active: false, margin: 35 },
        registrar: { provider: REGISTRAR_PROVIDERS[0].key, liveMode: false },
      }
    );
  };

  const saveUserDomainData = (userEmail, payload) => {
    const data = readDomainStore();
    data[userEmail] = payload;
    writeDomainStore(data);
  };

  const persistDomainData = (nextOwned, nextCart, nextSellerMode, nextMargin) => {
    if (!isSignedIn || !email) return;
    saveUserDomainData(email, {
      owned: nextOwned,
      cart: nextCart,
      seller: { active: nextSellerMode, margin: nextMargin },
      registrar: { provider: registrarProvider, liveMode: liveRegistrarMode },
    });
  };

  const writeToStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const getUserProjects = (userEmail) => {
    const data = readFromStorage();
    return data[userEmail] || [];
  };

  const saveUserProjects = (userEmail, userProjects) => {
    const data = readFromStorage();
    data[userEmail] = userProjects;
    writeToStorage(data);
  };

  const persistProjects = (updatedProjects) => {
    setProjects(updatedProjects);
    if (isSignedIn && email) {
      saveUserProjects(email, updatedProjects);
    }
  };

  const pushPublishLog = ({
    projectId,
    projectName,
    action,
    status,
    message,
    url = "",
    checklistScore = null,
  }) => {
    setPublishLogs((prev) =>
      [
        {
          id: crypto.randomUUID(),
          projectId,
          projectName,
          action,
          status,
          message,
          url,
          checklistScore,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 30)
    );
  };

  const recordPublishSnapshot = ({ projectId, files, url, note }) => {
    const snapshot = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      note,
      url,
      files,
    };

    const hasProject = projects.some((item) => item.id === projectId);
    if (hasProject) {
      const updated = projects.map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          publishHistory: [snapshot, ...(project.publishHistory || [])].slice(0, 12),
        };
      });
      persistProjects(updated);
      return;
    }

    if (draftProject?.id === projectId) {
      setDraftProject((prev) =>
        prev
          ? {
              ...prev,
              publishHistory: [snapshot, ...(prev.publishHistory || [])].slice(0, 12),
            }
          : prev
      );
    }
  };

  const addProjectsForUser = (userEmail, newProjects) => {
    const updated = [...newProjects, ...getUserProjects(userEmail)].map(normalizeProject);
    saveUserProjects(userEmail, updated);
    setProjects(updated);
  };

  const openProject = (project, page = DEFAULT_PAGE) => {
    const normalized = normalizeProject(project);
    const files = getProjectFiles(normalized);

    setActiveProjectId(normalized.id);
    setPreviewPage(page);
    setPreviewHtml(files[page] || files[DEFAULT_PAGE]);
    setEditableHtml(files[page] || files[DEFAULT_PAGE]);
    setIsInlineEditing(false);
  };

  useEffect(() => {
    const savedUser = normalizeEmail(localStorage.getItem(SESSION_USER_KEY));
    if (!savedUser) return;

    localStorage.setItem(SESSION_USER_KEY, savedUser);
    setEmail(savedUser);
    setIsSignedIn(true);

    const data = readFromStorage();
    setProjects((data[savedUser] || []).map(normalizeProject));
    const domainData = readDomainStore();
    const domains = domainData[savedUser] || {
      owned: [],
      cart: [],
      seller: { active: false, margin: 35 },
      registrar: { provider: REGISTRAR_PROVIDERS[0].key, liveMode: false },
    };
    setOwnedDomains(domains.owned || []);
    setDomainCart(domains.cart || []);
    setSellerMode(Boolean(domains.seller?.active));
    setResellerMargin(Number(domains.seller?.margin || 35));
    setRegistrarProvider(domains.registrar?.provider || REGISTRAR_PROVIDERS[0].key);
    setLiveRegistrarMode(Boolean(domains.registrar?.liveMode));
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(PUBLISH_LOG_STORAGE_KEY);
    const parsed = parseJsonSafe(raw || "");
    if (Array.isArray(parsed)) {
      setPublishLogs(parsed.slice(0, 30));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PUBLISH_LOG_STORAGE_KEY, JSON.stringify(publishLogs.slice(0, 30)));
  }, [publishLogs]);

  useEffect(() => {
    const rawDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) return;
    const parsed = parseJsonSafe(rawDraft);
    if (!parsed || typeof parsed !== "object") return;

    if (typeof parsed.businessName === "string") setBusinessName(parsed.businessName);
    if (typeof parsed.prompt === "string") setPrompt(parsed.prompt);
    if (INDUSTRIES.some((item) => item.key === parsed.industryKey)) setIndustryKey(parsed.industryKey);
    if (TONES.includes(parsed.tone)) setTone(parsed.tone);
    if (GOALS.includes(parsed.goal)) setGoal(parsed.goal);
    if (THEME_PRESETS.some((item) => item.key === parsed.themePreset)) setThemePreset(parsed.themePreset);
    if (typeof parsed.substylePreset === "string") setSubstylePreset(parsed.substylePreset);
    if (typeof parsed.brandColor === "string") setBrandColor(parsed.brandColor);
    if (Object.prototype.hasOwnProperty.call(FONT_THEMES, parsed.headingFontTheme)) {
      setHeadingFontTheme(parsed.headingFontTheme);
    }
    if (Object.prototype.hasOwnProperty.call(FONT_THEMES, parsed.bodyFontTheme)) {
      setBodyFontTheme(parsed.bodyFontTheme);
    }
    if (Object.prototype.hasOwnProperty.call(FONT_THEMES, parsed.fontTheme)) {
      if (!Object.prototype.hasOwnProperty.call(FONT_THEMES, parsed.headingFontTheme)) {
        setHeadingFontTheme(parsed.fontTheme);
      }
      if (!Object.prototype.hasOwnProperty.call(FONT_THEMES, parsed.bodyFontTheme)) {
        setBodyFontTheme(parsed.fontTheme);
      }
    }
    if (parsed.pageFontOverrides && typeof parsed.pageFontOverrides === "object") {
      setPageFontOverrides(normalizePageFontOverrides(parsed.pageFontOverrides));
    }
    if (typeof parsed.ctaText === "string") setCtaText(parsed.ctaText);
    if (typeof parsed.seoTitle === "string") setSeoTitle(parsed.seoTitle);
    if (typeof parsed.customDomain === "string") setCustomDomain(parsed.customDomain);
    if (VISUAL_STYLES.some((style) => style.key === parsed.visualStyle)) setVisualStyle(parsed.visualStyle);
    if (typeof parsed.includePricing === "boolean") setIncludePricing(parsed.includePricing);
    if (typeof parsed.includeTestimonials === "boolean") setIncludeTestimonials(parsed.includeTestimonials);
    if (typeof parsed.includeFaq === "boolean") setIncludeFaq(parsed.includeFaq);
    if (typeof parsed.includeBlog === "boolean") setIncludeBlog(parsed.includeBlog);
    if (typeof parsed.includePortfolio === "boolean") setIncludePortfolio(parsed.includePortfolio);
    if (typeof parsed.includeLogoCloud === "boolean") setIncludeLogoCloud(parsed.includeLogoCloud);
    if (typeof parsed.enableMotion === "boolean") setEnableMotion(parsed.enableMotion);
    if (typeof parsed.useLlm === "boolean") setUseLlm(parsed.useLlm);
    if (LLM_MODEL_PRESETS.some((preset) => preset.key === parsed.llmPreset)) setLlmPreset(parsed.llmPreset);
    if (typeof parsed.llmModel === "string") setLlmModel(parsed.llmModel);
    if (typeof parsed.llmCustomModel === "string") setLlmCustomModel(parsed.llmCustomModel);
    if (typeof parsed.savedAt === "string") setDraftSavedAt(parsed.savedAt);
  }, []);

  useEffect(() => {
    if (!activeProjectId || isInlineEditing) return;

    const activeProject = projects.find((project) => project.id === activeProjectId);
    if (!activeProject) return;

    const files = getProjectFiles(activeProject);
    const html = files[previewPage] || files[DEFAULT_PAGE];
    setPreviewHtml(html);
    setEditableHtml(html);
  }, [activeProjectId, previewPage, projects, isInlineEditing]);

  useEffect(() => {
    if (!previewHtml) {
      setQuickEditFields({ headline: "", subhead: "", cta: "" });
      setQuickEditBaseline({ headline: "", subhead: "", cta: "" });
      setQuickAiSuggestion(null);
      setSectionRewriteBefore(null);
      setSectionAiSuggestion(null);
      setApplySectionToMatchingPages(false);
      return;
    }
    const extracted = extractQuickEditFields(previewHtml);
    setQuickEditFields(extracted);
    setQuickEditBaseline(extracted);
    setQuickRewriteTone(tone);
    setQuickAiSuggestion(null);
    setSectionRewriteBefore(null);
    setSectionAiSuggestion(null);
    setApplySectionToMatchingPages(false);
    setQuickEditStatus("");
    setQuickEditStep(1);
  }, [previewHtml, previewPage, activeProjectId, tone]);

  useEffect(() => {
    if (sectionOptionsForPage.length === 0) return;
    if (sectionOptionsForPage.some((item) => item.key === sectionRewriteTarget)) return;
    setSectionRewriteTarget(sectionOptionsForPage[0].key);
  }, [sectionOptionsForPage, sectionRewriteTarget]);

  useEffect(() => {
    setShowAdvancedEditor(false);
  }, [activeProjectId]);

  useEffect(() => {
    if (availableSubstyles.some((item) => item.key === substylePreset)) return;
    setSubstylePreset(availableSubstyles[0]?.key || "");
  }, [availableSubstyles, substylePreset]);

  useEffect(() => {
    if (!llmModelOptions.includes(llmModel)) {
      setLlmModel(llmModelOptions[0] || "gpt-4.1");
    }
  }, [llmModel, llmModelOptions]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const derivedKeyword = toDomainKeyword(domainSearch.trim() || businessName || activeIndustry.label);

      if (!derivedKeyword) {
        setDomainSuggestions([]);
        return;
      }

      if (!liveRegistrarMode) {
        setDomainSuggestions(
          buildDomainSuggestions(derivedKeyword, {
            businessName,
            industryLabel: activeIndustry.label,
          })
        );
        return;
      }

      try {
        setRegistrarLoading(true);
        const liveResults = await searchDomainsLive({
          provider: registrarProvider,
          keyword: derivedKeyword,
          tlds: DOMAIN_TLDS.map((item) => item.tld),
        });
        if (cancelled) return;

        if (liveResults.length === 0) {
          setDomainSuggestions(
            buildDomainSuggestions(derivedKeyword, {
              businessName,
              industryLabel: activeIndustry.label,
            })
          );
        } else {
          setDomainSuggestions(
            liveResults.map((item) => ({
              name: item.name,
              price: Number(item.price || 0),
              available: Boolean(item.available),
            }))
          );
        }
      } catch {
        if (!cancelled) {
          setDomainSuggestions(
            buildDomainSuggestions(derivedKeyword, {
              businessName,
              industryLabel: activeIndustry.label,
            })
          );
          setDomainMessage("Live registrar search unavailable. Using local marketplace mode.");
        }
      } finally {
        if (!cancelled) setRegistrarLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [domainSearch, liveRegistrarMode, registrarProvider, businessName, activeIndustry.label]);

  useEffect(() => {
    let cancelled = false;

    const loadHosted = async () => {
      try {
        const sites = await listHostedProjects();
        if (cancelled) return;
        const mapped = Object.fromEntries(sites.map((site) => [site.siteId, site]));
        setHostedSites(mapped);
      } catch {
        if (!cancelled) {
          setHostedSites({});
        }
      }
    };

    loadHosted();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const payload = {
        businessName,
        prompt,
        industryKey,
        tone,
        goal,
        themePreset,
        substylePreset,
        brandColor,
        headingFontTheme,
        bodyFontTheme,
        pageFontOverrides,
        ctaText,
        seoTitle,
        customDomain,
        useLlm,
        llmPreset,
        llmModel,
        llmCustomModel,
        visualStyle,
        includePricing,
        includeTestimonials,
        includeFaq,
        includeBlog,
        includePortfolio,
        includeLogoCloud,
        enableMotion,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setDraftSavedAt(payload.savedAt);
    }, 380);

    return () => window.clearTimeout(timer);
  }, [
    businessName,
    prompt,
    industryKey,
    tone,
    goal,
    themePreset,
    substylePreset,
    brandColor,
    headingFontTheme,
    bodyFontTheme,
    pageFontOverrides,
    ctaText,
    seoTitle,
    customDomain,
    useLlm,
    llmPreset,
    llmModel,
    llmCustomModel,
    visualStyle,
    includePricing,
    includeTestimonials,
    includeFaq,
    includeBlog,
    includePortfolio,
    includeLogoCloud,
    enableMotion,
  ]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    if (isInlineEditing) {
      doc.designMode = "on";
      doc.body.contentEditable = "true";

      const handler = () => {
        const html = `<!doctype html>${doc.documentElement.outerHTML}`;
        setEditableHtml(html);
        setPreviewHtml(html);
      };

      iframeListenerRef.current = handler;
      doc.addEventListener("input", handler);
    } else {
      doc.designMode = "off";
      doc.body.contentEditable = "false";
      if (iframeListenerRef.current) {
        doc.removeEventListener("input", iframeListenerRef.current);
        iframeListenerRef.current = null;
      }
    }

    return () => {
      if (iframeListenerRef.current) {
        doc.removeEventListener("input", iframeListenerRef.current);
        iframeListenerRef.current = null;
      }
    };
  }, [isInlineEditing, previewHtml]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanupDocListeners = null;
    const attachPreviewHandlers = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const onLinkClick = (event) => {
        if (isInlineEditing) return;
        const target = event.target;
        if (!target || typeof target.closest !== "function") return;
        const anchor = target.closest("a[href]");
        if (!anchor) return;

        const targetPage = resolvePreviewPageFromHref(anchor.getAttribute("href"));
        if (!targetPage) return;
        event.preventDefault();
        setPreviewPage(targetPage);
      };

      doc.addEventListener("click", onLinkClick);
      cleanupDocListeners = () => {
        doc.removeEventListener("click", onLinkClick);
      };
    };

    const onLoad = () => {
      cleanupDocListeners?.();
      attachPreviewHandlers();
    };

    iframe.addEventListener("load", onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener("load", onLoad);
      cleanupDocListeners?.();
    };
  }, [previewHtml, isInlineEditing]);

  const buildProjectConfig = (industry) => ({
    businessName,
    industry,
    tone,
    prompt,
    goal,
    themePreset,
    substylePreset,
    brandColor,
    headingFontTheme,
    bodyFontTheme,
    pageFontOverrides,
    fontTheme: bodyFontTheme,
    ctaText,
    seoTitle,
    customDomain,
    useLlm,
    llmPreset,
    llmModel,
    llmCustomModel,
    visualStyle,
    includePricing,
    includeTestimonials,
    includeFaq,
    includeBlog,
    includePortfolio,
    includeLogoCloud,
    enableMotion,
  });

  const getLlmModelChain = (config) => {
    const preset = getLlmPresetByKey(config.llmPreset);
    return dedupeModels([config.llmCustomModel, config.llmModel, ...(preset.models || [])]);
  };

  const generateSingleProject = async (industry) => {
    let llmContent = null;
    let llmResolvedModel = "";
    const projectConfig = buildProjectConfig(industry);

    if (projectConfig.useLlm) {
      const llmResult = await generateLlmContent({
        modelCandidates: getLlmModelChain(projectConfig),
        businessName: projectConfig.businessName,
        industry,
        tone: projectConfig.tone,
        goal: projectConfig.goal,
        prompt: projectConfig.prompt,
        ctaText: projectConfig.ctaText,
        onModelAttempt: (model) => setLlmStatus(`Generating copy with ${model}...`),
      });
      llmContent = llmResult.content;
      llmResolvedModel = llmResult.modelUsed;
      setLlmStatus(`LLM complete using ${llmResolvedModel}.`);
    }

    const project = makeProject({ ...projectConfig, llmContent, llmResolvedModel });
    openProject(project, DEFAULT_PAGE);

    if (isSignedIn && email) {
      addProjectsForUser(email, [project]);
    } else {
      setDraftProject(project);
      setShowAuthModal(true);
    }

    return project;
  };

  const handleGenerateOne = async () => {
    setLoading(true);
    setError("");
    setLlmStatus("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await generateSingleProject(activeIndustry);
    } catch {
      setError("Failed to generate project. Check LLM key/model if TitoNova Cloud Engine mode is enabled.");
    } finally {
      setLlmStatus("");
      setLoading(false);
    }
  };

  const handleGenerateAndGoLive = async () => {
    setLoading(true);
    setError("");
    setLlmStatus("");
    setGoLiveError("");
    setGoLiveStep("preparing");
    setGoLiveMessage("Preparing website generation...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const project = await generateSingleProject(activeIndustry);
      setGoLiveStep("uploading");
      setGoLiveMessage(`Uploading ${project.businessName} to live hosting...`);
      const payload = await handlePublishProject(project);
      if (!payload?.url) {
        throw new Error("Publish failed");
      }
      setGoLiveStep("live");
      setGoLiveMessage(`Live at ${payload.url}`);
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch {
      setGoLiveStep("error");
      setGoLiveError("Generate + Go Live failed. Retry to run generation and publish again.");
      setError("Generate + Go Live failed. Check LLM settings and gateway connection.");
    } finally {
      setLlmStatus("");
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    setError("");
    setLlmStatus("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      const batch = await Promise.all(
        INDUSTRIES.map(async (industry) => {
          const projectConfig = buildProjectConfig(industry);
          let llmContent = null;
          let llmResolvedModel = "";

          if (projectConfig.useLlm) {
            setLlmStatus(`Generating ${industry.label} copy with LLM...`);
            try {
              const llmResult = await generateLlmContent({
                modelCandidates: getLlmModelChain(projectConfig),
                businessName: projectConfig.businessName,
                industry,
                tone: projectConfig.tone,
                goal: projectConfig.goal,
                prompt: projectConfig.prompt,
                ctaText: projectConfig.ctaText,
                onModelAttempt: (model) =>
                  setLlmStatus(`Generating ${industry.label} copy with ${model}...`),
              });
              llmContent = llmResult.content;
              llmResolvedModel = llmResult.modelUsed;
            } catch {
              llmContent = null;
              llmResolvedModel = "";
            }
          }

          return makeProject({ ...projectConfig, llmContent, llmResolvedModel });
        })
      );

      openProject(batch[0], DEFAULT_PAGE);

      if (isSignedIn && email) {
        addProjectsForUser(email, batch);
      } else {
        setDraftProject(batch[0]);
        setShowAuthModal(true);
      }
    } catch {
      setError("Failed to generate projects. Check LLM key/model if TitoNova Cloud Engine mode is enabled.");
    } finally {
      setLlmStatus("");
      setLoading(false);
    }
  };

  const handleSaveInlineEdits = () => {
    if (!activeProjectId || !email) return;

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;
      const files = { ...getProjectFiles(project), [previewPage]: editableHtml || previewHtml };
      const snapshot = createVersionSnapshot(
        { ...project, files },
        `Inline edit • ${PAGE_CONFIG.find((page) => page.key === previewPage)?.label || previewPage}`
      );
      return {
        ...project,
        files,
        html: files[DEFAULT_PAGE],
        versions: [snapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    persistProjects(updated);
    setIsInlineEditing(false);
  };

  const handleCreateSnapshot = () => {
    if (!activeProjectId) return;
    const note = versionNote.trim() || "Manual snapshot";

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;
      const snapshot = createVersionSnapshot(project, note);
      return {
        ...project,
        versions: [snapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    persistProjects(updated);
    setVersionNote("");
  };

  const handleRestoreVersion = (versionId) => {
    if (!activeProjectId) return;
    const targetProject = projects.find((project) => project.id === activeProjectId);
    if (!targetProject) return;
    const snapshot = (targetProject.versions || []).find((item) => item.id === versionId);
    if (!snapshot) return;

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;
      const restoreSnapshot = createVersionSnapshot(project, "Auto snapshot before restore");
      return {
        ...project,
        files: snapshot.files,
        html: snapshot.files[DEFAULT_PAGE] || project.html,
        versions: [restoreSnapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    persistProjects(updated);
    const restoredProject = updated.find((project) => project.id === activeProjectId);
    if (restoredProject) {
      openProject(restoredProject, previewPage);
    }
  };

  const handleGlobalReplace = () => {
    if (!activeProjectId || !replaceFrom.trim()) return;

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;
      const files = Object.fromEntries(
        Object.entries(getProjectFiles(project)).map(([name, content]) => [
          name,
          typeof content === "string"
            ? replaceInContent(content, replaceFrom, replaceTo, replaceCaseSensitive)
            : content,
        ])
      );
      const snapshot = createVersionSnapshot(
        project,
        `Global replace "${replaceFrom}" -> "${replaceTo}"`
      );
      return {
        ...project,
        files,
        html: files[DEFAULT_PAGE] || project.html,
        versions: [snapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    persistProjects(updated);
    const changed = updated.find((project) => project.id === activeProjectId);
    if (changed) {
      openProject(changed, previewPage);
    }
  };

  const handleApplyQuickEdits = () => {
    if (!activeProjectId) return;

    const input = {
      headline: quickEditFields.headline.trim(),
      subhead: quickEditFields.subhead.trim(),
      cta: quickEditFields.cta.trim(),
    };
    if (!input.headline && !input.subhead && !input.cta) {
      setQuickEditStatus("Enter at least one field before applying.");
      return;
    }

    const targetPages = quickApplyAllPages ? PAGE_CONFIG.map((page) => page.key) : [previewPage];
    const activeFromLibrary = projects.find((project) => project.id === activeProjectId);

    if (activeFromLibrary) {
      let changedProject = null;
      let undoPayload = null;
      const updated = projects.map((project) => {
        if (project.id !== activeProjectId) return project;
        const currentFiles = getProjectFiles(project);
        const nextFiles = { ...currentFiles };
        let didChange = false;

        targetPages.forEach((pageKey) => {
          const currentHtml = currentFiles[pageKey];
          if (typeof currentHtml !== "string") return;
          const nextHtml = applyQuickEditFieldsToHtml(currentHtml, input);
          if (nextHtml !== currentHtml) {
            didChange = true;
            nextFiles[pageKey] = nextHtml;
          }
        });

        if (!didChange) return project;

        const label =
          quickApplyAllPages
            ? "Quick edit applied to all pages"
            : `Quick edit • ${PAGE_CONFIG.find((page) => page.key === previewPage)?.label || previewPage}`;
        const snapshot = createVersionSnapshot(project, label);
        undoPayload = {
          projectId: project.id,
          files: currentFiles,
          page: previewPage,
        };
        changedProject = {
          ...project,
          files: nextFiles,
          html: nextFiles[DEFAULT_PAGE] || project.html,
          versions: [snapshot, ...(project.versions || [])].slice(0, 30),
        };
        return changedProject;
      });

      if (!changedProject) {
        setQuickEditStatus("No visible changes were applied.");
        return;
      }

      persistProjects(updated);
      openProject(changedProject, previewPage);
      setLastQuickEditUndo(undoPayload);
      setQuickEditStatus(
        quickApplyAllPages
          ? "Quick edits applied across all pages."
          : "Quick edits applied to this page."
      );
      setQuickEditBaseline(extractQuickEditFields(changedProject.files[previewPage] || ""));
      setQuickEditStep(1);
      return;
    }

    if (draftProject?.id === activeProjectId) {
      const currentFiles = getProjectFiles(draftProject);
      const nextFiles = { ...currentFiles };
      let didChange = false;

      targetPages.forEach((pageKey) => {
        const currentHtml = currentFiles[pageKey];
        if (typeof currentHtml !== "string") return;
        const nextHtml = applyQuickEditFieldsToHtml(currentHtml, input);
        if (nextHtml !== currentHtml) {
          didChange = true;
          nextFiles[pageKey] = nextHtml;
        }
      });

      if (!didChange) {
        setQuickEditStatus("No visible changes were applied.");
        return;
      }

      const normalizedDraft = normalizeProject(draftProject);
      const updatedDraft = {
        ...normalizedDraft,
        files: nextFiles,
        html: nextFiles[DEFAULT_PAGE] || normalizedDraft.html,
      };
      setLastQuickEditUndo({
        projectId: normalizedDraft.id,
        files: currentFiles,
        page: previewPage,
      });
      setDraftProject(updatedDraft);
      openProject(updatedDraft, previewPage);
      setQuickEditStatus(
        quickApplyAllPages
          ? "Quick edits applied across all pages."
          : "Quick edits applied to this page."
      );
      setQuickEditBaseline(extractQuickEditFields(updatedDraft.files[previewPage] || ""));
      setQuickEditStep(1);
    }
  };

  const handleRewriteQuickEditWithAi = async () => {
    const pageLabel = PAGE_CONFIG.find((page) => page.key === previewPage)?.label || "Page";
    const modelChain = dedupeModels([llmCustomModel, llmModel, ...(selectedLlmPreset.models || [])]);
    if (modelChain.length === 0) {
      setQuickEditStatus("No LLM model configured for rewrite.");
      return;
    }

    setQuickAiBusy(true);
    setQuickEditStatus("Generating TitoNova Cloud Engine rewrite...");

    let lastError = null;
    for (const model of modelChain) {
      try {
        const outputText = await requestServerLlmText({
          model,
          systemPrompt:
            "You are a conversion-focused website copywriter. Return only valid JSON matching schema.",
          userPrompt: `Rewrite this website page copy.
Page: ${pageLabel}
Tone: ${quickRewriteTone}
Business: ${businessName}
Industry: ${activeIndustry.label}
Goal: ${goal}

Current headline: ${quickEditFields.headline}
Current subhead: ${quickEditFields.subhead}
Current CTA: ${quickEditFields.cta}

Rules:
- Keep structure unchanged; only rewrite headline, subhead, and CTA.
- Headline <= 65 chars, CTA <= 28 chars.
- Keep concise and specific.`,
          schemaName: "quick_rewrite",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              headline: { type: "string" },
              subhead: { type: "string" },
              cta: { type: "string" },
            },
            required: ["headline", "subhead", "cta"],
          },
        });
        const parsed = parseJsonSafe(outputText);
        if (!parsed) {
          lastError = new Error(`Invalid rewrite JSON from ${model}.`);
          continue;
        }

        setQuickAiSuggestion({
          headline: String(parsed.headline || "").trim(),
          subhead: String(parsed.subhead || "").trim(),
          cta: String(parsed.cta || "").trim(),
          model,
        });
        setQuickEditStatus(`TitoNova Cloud Engine rewrite ready (${model}). Review and click Accept.`);
        setQuickAiBusy(false);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    setQuickAiBusy(false);
    setQuickEditStatus(`TitoNova Cloud Engine rewrite failed: ${String(lastError?.message || "Unknown error")}`);
  };

  const handleAcceptQuickAiRewrite = () => {
    if (!quickAiSuggestion) return;
    setQuickEditFields({
      headline: quickAiSuggestion.headline,
      subhead: quickAiSuggestion.subhead,
      cta: quickAiSuggestion.cta,
    });
    setQuickAiSuggestion(null);
    setQuickEditStatus("TitoNova Cloud Engine rewrite applied to fields. Continue to diff and apply.");
  };

  const handleRewriteSectionWithAi = async (presetKey = sectionRewritePreset) => {
    if (!previewHtml) {
      setQuickEditStatus("No page loaded for section rewrite.");
      return;
    }

    const beforeFields = extractSectionRewriteFields(previewHtml, sectionRewriteTarget);
    if (!beforeFields || Object.keys(beforeFields).length === 0) {
      setQuickEditStatus("Could not detect selected section on this page.");
      return;
    }

    const sectionLabel =
      sectionOptionsForPage.find((item) => item.key === sectionRewriteTarget)?.label ||
      sectionRewriteTarget;
    const selectedPreset =
      REWRITE_PRESETS.find((item) => item.key === presetKey) || REWRITE_PRESETS[0];
    const effectiveTone = selectedPreset?.tone || quickRewriteTone;
    if (selectedPreset?.tone) setQuickRewriteTone(selectedPreset.tone);
    const modelChain = dedupeModels([llmCustomModel, llmModel, ...(selectedLlmPreset.models || [])]);
    if (modelChain.length === 0) {
      setQuickEditStatus("No LLM model configured for section rewrite.");
      return;
    }

    const fieldPairs = Object.entries(beforeFields)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    setSectionAiBusy(true);
    setSectionRewriteBefore(beforeFields);
    setSectionAiSuggestion(null);
    setQuickEditStatus(`Rewriting ${sectionLabel} (${selectedPreset.label})...`);

    let lastError = null;
    for (const model of modelChain) {
      try {
        const schemaProperties = Object.fromEntries(
          Object.keys(beforeFields).map((key) => [key, { type: "string" }])
        );
        const outputText = await requestServerLlmText({
          model,
          systemPrompt:
            "You are a conversion-focused website copywriter. Return only valid JSON matching schema.",
          userPrompt: `Rewrite only the selected website section fields.
Section: ${sectionLabel}
Page: ${PAGE_CONFIG.find((page) => page.key === previewPage)?.label || previewPage}
Tone: ${effectiveTone}
Business: ${businessName}
Industry: ${activeIndustry.label}
Goal: ${goal}
Preset: ${selectedPreset.label}

Current fields:
${fieldPairs}

Rules:
- Rewrite only these fields.
- Keep response concise, specific, and conversion-focused.
- ${selectedPreset.instruction}
- Do not add keys.`,
          schemaName: "section_rewrite",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: schemaProperties,
            required: Object.keys(beforeFields),
          },
        });
        const parsed = parseJsonSafe(outputText);
        if (!parsed || typeof parsed !== "object") {
          lastError = new Error(`Invalid section rewrite JSON from ${model}.`);
          continue;
        }

        const normalized = Object.fromEntries(
          Object.keys(beforeFields).map((key) => [key, String(parsed[key] || "").trim()])
        );
        setSectionAiSuggestion({ ...normalized, __model: model });
        setQuickEditStatus(
          `${sectionLabel} rewrite ready (${selectedPreset.label}, ${model}). Preview and apply.`
        );
        setSectionAiBusy(false);
        return;
      } catch (error) {
        lastError = error;
      }
    }

    setSectionAiBusy(false);
    setQuickEditStatus(`Section rewrite failed: ${String(lastError?.message || "Unknown error")}`);
  };

  const handleApplySectionRewrite = () => {
    if (!activeProjectId || !sectionAiSuggestion || !previewHtml) return;
    const nextFields = Object.fromEntries(
      Object.entries(sectionAiSuggestion).filter(([key]) => !key.startsWith("__"))
    );
    const pagesToApply = applySectionToMatchingPages
      ? sectionMatchingPages
      : [previewPage];

    const activeFromLibrary = projects.find((project) => project.id === activeProjectId);
    if (activeFromLibrary) {
      let changedProject = null;
      let undoPayload = null;

      const updated = projects.map((project) => {
        if (project.id !== activeProjectId) return project;
        const currentFiles = getProjectFiles(project);
        const nextFiles = { ...currentFiles };
        let appliedCount = 0;
        pagesToApply.forEach((pageKey) => {
          const currentHtml = currentFiles[pageKey] || "";
          if (!currentHtml) return;
          const nextHtml = applySectionRewriteFields(currentHtml, sectionRewriteTarget, nextFields);
          if (nextHtml && nextHtml !== currentHtml) {
            nextFiles[pageKey] = nextHtml;
            appliedCount += 1;
          }
        });
        if (appliedCount === 0) return project;

        const snapshot = createVersionSnapshot(
          project,
          applySectionToMatchingPages
            ? `Section rewrite • ${sectionRewriteTarget} • ${appliedCount} pages`
            : `Section rewrite • ${sectionRewriteTarget}`
        );
        undoPayload = { projectId: project.id, files: currentFiles, page: previewPage };
        changedProject = {
          ...project,
          files: nextFiles,
          html: nextFiles[DEFAULT_PAGE] || project.html,
          versions: [snapshot, ...(project.versions || [])].slice(0, 30),
        };
        return changedProject;
      });

      if (!changedProject) {
        setQuickEditStatus("No section changes were applied.");
        return;
      }

      persistProjects(updated);
      openProject(changedProject, previewPage);
      setLastSectionUndo(undoPayload);
      setSectionRewriteBefore(nextFields);
      setSectionAiSuggestion(null);
      setQuickEditStatus(
        applySectionToMatchingPages
          ? `Section rewrite applied to ${pagesToApply.length} matching pages.`
          : "Section rewrite applied."
      );
      return;
    }

    if (draftProject?.id === activeProjectId) {
      const normalizedDraft = normalizeProject(draftProject);
      const currentFiles = getProjectFiles(normalizedDraft);
      const nextFiles = { ...currentFiles };
      let appliedCount = 0;
      pagesToApply.forEach((pageKey) => {
        const currentHtml = currentFiles[pageKey] || "";
        if (!currentHtml) return;
        const nextHtml = applySectionRewriteFields(currentHtml, sectionRewriteTarget, nextFields);
        if (nextHtml && nextHtml !== currentHtml) {
          nextFiles[pageKey] = nextHtml;
          appliedCount += 1;
        }
      });
      if (appliedCount === 0) {
        setQuickEditStatus("No section changes were applied.");
        return;
      }

      const updatedDraft = {
        ...normalizedDraft,
        files: nextFiles,
        html: nextFiles[DEFAULT_PAGE] || normalizedDraft.html,
      };
      setDraftProject(updatedDraft);
      openProject(updatedDraft, previewPage);
      setLastSectionUndo({
        projectId: normalizedDraft.id,
        files: currentFiles,
        page: previewPage,
      });
      setSectionRewriteBefore(nextFields);
      setSectionAiSuggestion(null);
      setQuickEditStatus(
        applySectionToMatchingPages
          ? `Section rewrite applied to ${appliedCount} matching pages.`
          : "Section rewrite applied."
      );
    }
  };

  const handleUndoSectionRewrite = () => {
    if (!lastSectionUndo?.projectId || !lastSectionUndo?.files) return;
    const targetId = lastSectionUndo.projectId;
    const undoFiles = lastSectionUndo.files;

    const inLibrary = projects.some((project) => project.id === targetId);
    if (inLibrary) {
      let restored = null;
      const updated = projects.map((project) => {
        if (project.id !== targetId) return project;
        const snapshot = createVersionSnapshot(project, "Undo section rewrite");
        restored = {
          ...project,
          files: undoFiles,
          html: undoFiles[DEFAULT_PAGE] || project.html,
          versions: [snapshot, ...(project.versions || [])].slice(0, 30),
        };
        return restored;
      });
      persistProjects(updated);
      if (restored) openProject(restored, lastSectionUndo.page || previewPage);
      setLastSectionUndo(null);
      setQuickEditStatus("Section rewrite undone.");
      return;
    }

    if (draftProject?.id === targetId) {
      const normalizedDraft = normalizeProject(draftProject);
      const restoredDraft = {
        ...normalizedDraft,
        files: undoFiles,
        html: undoFiles[DEFAULT_PAGE] || normalizedDraft.html,
      };
      setDraftProject(restoredDraft);
      openProject(restoredDraft, lastSectionUndo.page || previewPage);
      setLastSectionUndo(null);
      setQuickEditStatus("Section rewrite undone.");
    }
  };

  const handleUndoQuickEdit = () => {
    if (!lastQuickEditUndo?.projectId || !lastQuickEditUndo?.files) return;
    const targetId = lastQuickEditUndo.projectId;
    const undoFiles = lastQuickEditUndo.files;

    const inLibrary = projects.some((project) => project.id === targetId);
    if (inLibrary) {
      let restored = null;
      const updated = projects.map((project) => {
        if (project.id !== targetId) return project;
        const snapshot = createVersionSnapshot(project, "Undo quick edit");
        restored = {
          ...project,
          files: undoFiles,
          html: undoFiles[DEFAULT_PAGE] || project.html,
          versions: [snapshot, ...(project.versions || [])].slice(0, 30),
        };
        return restored;
      });
      persistProjects(updated);
      if (restored) {
        openProject(restored, lastQuickEditUndo.page || previewPage);
      }
      setQuickEditStatus("Last quick edit undone.");
      setLastQuickEditUndo(null);
      return;
    }

    if (draftProject?.id === targetId) {
      const normalizedDraft = normalizeProject(draftProject);
      const restoredDraft = {
        ...normalizedDraft,
        files: undoFiles,
        html: undoFiles[DEFAULT_PAGE] || normalizedDraft.html,
      };
      setDraftProject(restoredDraft);
      openProject(restoredDraft, lastQuickEditUndo.page || previewPage);
      setQuickEditStatus("Last quick edit undone.");
      setLastQuickEditUndo(null);
    }
  };

  const mutateActiveProjectFiles = (note, fileMutator) => {
    if (!activeProjectId) return false;
    let changed = false;

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;

      const currentFiles = getProjectFiles(project);
      const nextFiles = fileMutator(currentFiles, project);
      if (!nextFiles || !nextFiles[DEFAULT_PAGE]) return project;

      const didChange = Object.keys(currentFiles).some((key) => currentFiles[key] !== nextFiles[key]);
      if (!didChange) return project;

      changed = true;
      const snapshot = createVersionSnapshot(project, note);
      return {
        ...project,
        files: nextFiles,
        html: nextFiles[DEFAULT_PAGE] || project.html,
        versions: [snapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    if (!changed) return false;
    persistProjects(updated);
    const changedProject = updated.find((project) => project.id === activeProjectId);
    if (changedProject) openProject(changedProject, previewPage);
    return true;
  };

  const mutateActivePage = (note, htmlMutator) => {
    if (!activeProjectId) return;

    const updated = projects.map((project) => {
      if (project.id !== activeProjectId) return project;

      const currentFiles = getProjectFiles(project);
      const currentHtml = currentFiles[previewPage] || "";
      const nextHtml = htmlMutator(currentHtml);
      if (!nextHtml || nextHtml === currentHtml) return project;

      const snapshot = createVersionSnapshot(project, note);
      const files = { ...currentFiles, [previewPage]: nextHtml };
      return {
        ...project,
        files,
        html: files[DEFAULT_PAGE] || project.html,
        versions: [snapshot, ...(project.versions || [])].slice(0, 30),
      };
    });

    persistProjects(updated);
    const changed = updated.find((project) => project.id === activeProjectId);
    if (changed) openProject(changed, previewPage);
  };

  const getSelectedTemplateHtml = () =>
    BLOCK_TEMPLATES[selectedBlockTemplate]?.html || BLOCK_TEMPLATES.feature_grid.html;

  const handleInsertSectionAtEnd = () => {
    mutateActivePage(
      `Insert block (${selectedBlockTemplate}) at end`,
      (html) => rewritePageSections(html, (sections) => [...sections, getSelectedTemplateHtml()])
    );
  };

  const handleInsertSectionBelow = (index) => {
    mutateActivePage(
      `Insert block (${selectedBlockTemplate}) below section ${index + 1}`,
      (html) =>
        rewritePageSections(html, (sections) => {
          const next = [...sections];
          next.splice(index + 1, 0, getSelectedTemplateHtml());
          return next;
        })
    );
  };

  const handleRemoveSection = (index) => {
    mutateActivePage(`Remove section ${index + 1}`, (html) =>
      rewritePageSections(html, (sections) => {
        if (sections.length <= 1) return sections;
        return sections.filter((_, sectionIndex) => sectionIndex !== index);
      })
    );
  };

  const handleDuplicateSection = (index) => {
    mutateActivePage(`Duplicate section ${index + 1}`, (html) =>
      rewritePageSections(html, (sections) => {
        const next = [...sections];
        next.splice(index + 1, 0, sections[index]);
        return next;
      })
    );
  };

  const handleMoveSection = (index, direction) => {
    mutateActivePage(`Move section ${index + 1} ${direction}`, (html) =>
      rewritePageSections(html, (sections) => {
        const next = [...sections];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return next;
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        return next;
      })
    );
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const compressImageFile = async (file) => {
    if (typeof document === "undefined") {
      const dataUrl = await readFileAsDataUrl(file);
      return { dataUrl, inputBytes: file.size, outputBytes: file.size };
    }

    const sourceUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to decode image."));
        img.src = sourceUrl;
      });

      const maxSide = 1920;
      const sourceWidth = Number(image.naturalWidth || image.width || 0);
      const sourceHeight = Number(image.naturalHeight || image.height || 0);
      const ratio = Math.min(1, maxSide / Math.max(sourceWidth || 1, sourceHeight || 1));
      const width = Math.max(1, Math.round(sourceWidth * ratio));
      const height = Math.max(1, Math.round(sourceHeight * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        const fallback = await readFileAsDataUrl(file);
        return { dataUrl: fallback, inputBytes: file.size, outputBytes: file.size };
      }
      ctx.drawImage(image, 0, 0, width, height);

      const preferredType = file.type === "image/png" ? "image/webp" : "image/jpeg";
      const compressedUrl = canvas.toDataURL(preferredType, 0.82);
      const compressedBytes = estimateDataUrlBytes(compressedUrl);

      if (!compressedUrl || compressedBytes >= file.size) {
        const fallback = await readFileAsDataUrl(file);
        return { dataUrl: fallback, inputBytes: file.size, outputBytes: file.size };
      }

      return { dataUrl: compressedUrl, inputBytes: file.size, outputBytes: compressedBytes };
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  };

  const applyUploadedImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImageUploadStatus("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setImageUploadStatus("Image is too large. Use a file under 10MB.");
      return;
    }

    try {
      setImageUploadStatus("Compressing and applying image...");
      const compressed = await compressImageFile(file);
      const src = compressed.dataUrl;
      const altText = `${businessName || "Website"} image`;
      const note = `Upload image (${imageUploadTarget})`;

      const applied = applyUploadToAllPages
        ? mutateActiveProjectFiles(note, (files) => {
            const next = { ...files };
            PAGE_CONFIG.forEach((page) => {
              const key = page.key;
              next[key] = updatePageImages(next[key], {
                target: imageUploadTarget,
                src,
                alt: altText,
              });
            });
            return next;
          })
        : (() => {
            let didApply = false;
            mutateActivePage(note, (html) => {
              const next = updatePageImages(html, {
                target: imageUploadTarget,
                src,
                alt: altText,
              });
              didApply = next !== html;
              return next;
            });
            return didApply;
          })();

      if (!applied) {
        setImageUploadStatus("No matching image slot found for this target.");
        return;
      }

      setImageUploadStatus(
        `Uploaded ${file.name} (${formatBytes(compressed.inputBytes)} -> ${formatBytes(
          compressed.outputBytes
        )}) to ${applyUploadToAllPages ? "all pages" : "this page"}.`
      );
    } catch {
      setImageUploadStatus("Image upload failed. Try a different file.");
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    await applyUploadedImageFile(file);
  };

  const handleUploadDrop = async (event) => {
    event.preventDefault();
    setIsImageDropActive(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    await applyUploadedImageFile(file);
  };

  const applyInsight = (insightKey) => {
    if (!activeProject) return;

    if (insightKey === "meta") {
      const applied = mutateActiveProjectFiles("Smart fix: add missing meta descriptions", (files, project) => {
        const pageKeys = ["index.html", "about.html", "services.html", "contact.html"];
        const description = `${project.businessName} ${project.industryLabel} services focused on ${project.goal.toLowerCase()}.`;
        const next = { ...files };
        pageKeys.forEach((pageKey) => {
          next[pageKey] = ensureMetaDescription(next[pageKey], description);
        });
        return next;
      });
      setInsightMessage(applied ? "Applied metadata fix." : "No metadata fix was needed.");
      return;
    }

    if (insightKey === "alt") {
      const applied = mutateActiveProjectFiles("Smart fix: fill missing image alt text", (files) => {
        const pageKeys = ["index.html", "about.html", "services.html", "contact.html"];
        const next = { ...files };
        pageKeys.forEach((pageKey) => {
          next[pageKey] = ensureImageAltAttributes(next[pageKey]);
        });
        return next;
      });
      setInsightMessage(applied ? "Applied accessibility alt fix." : "No alt-text fix was needed.");
      return;
    }

    if (insightKey === "cta") {
      const applied = mutateActiveProjectFiles("Smart fix: add conversion CTA sections", (files, project) => {
        const ctaTextValue = escapeHtml(project.options?.ctaText || "Book a strategy call");
        const ctaSection = `
<section data-optimizer="cta-boost">
  <h2 class="title">Ready to move this project forward?</h2>
  <p class="muted">Start with a focused consultation and get a practical rollout plan.</p>
  <a class="cta" href="contact.html">${ctaTextValue}</a>
</section>`;
        const next = { ...files };
        ["index.html", "services.html", "contact.html"].forEach((pageKey) => {
          next[pageKey] = appendSectionBeforeFooter(next[pageKey], "cta-boost", ctaSection);
        });
        return next;
      });
      setInsightMessage(applied ? "Added CTA boost sections." : "CTA boost section already exists.");
      return;
    }

    if (insightKey === "links") {
      const applied = mutateActiveProjectFiles("Smart fix: add quick-link hub", (files, project) => {
        const emailValue = `hello@${slugify(project.businessName || "business") || "business"}.com`;
        const linksSection = `
<section data-optimizer="link-hub">
  <h2 class="title">Quick Links</h2>
  <div class="cards">
    <article class="card"><h3>Explore Services</h3><p><a href="services.html">See service packages</a></p></article>
    <article class="card"><h3>About Our Team</h3><p><a href="about.html">Meet the team</a></p></article>
    <article class="card"><h3>Talk to Us</h3><p><a href="mailto:${emailValue}">Email consultation desk</a></p></article>
  </div>
</section>`;
        const next = { ...files };
        next["index.html"] = appendSectionBeforeFooter(next["index.html"], "link-hub", linksSection);
        return next;
      });
      setInsightMessage(applied ? "Added internal link hub." : "Link hub already exists.");
      return;
    }

    if (insightKey === "content") {
      const applied = mutateActiveProjectFiles("Smart fix: add authority content", (files, project) => {
        const contentSection = `
<section data-optimizer="authority-copy">
  <h2 class="title">Execution Framework</h2>
  <p class="muted">${escapeHtml(
    project.businessName
  )} runs a repeatable process built around discovery, strategy alignment, delivery, and optimization.</p>
  <p class="muted">Each engagement includes weekly reporting, measurable milestones, and continuous testing so teams can improve outcomes over time.</p>
</section>`;
        const next = { ...files };
        next["about.html"] = appendSectionBeforeFooter(
          next["about.html"],
          "authority-copy",
          contentSection
        );
        next["services.html"] = appendSectionBeforeFooter(
          next["services.html"],
          "authority-copy",
          contentSection
        );
        return next;
      });
      setInsightMessage(applied ? "Added authority content blocks." : "Authority content is already present.");
    }
  };

  const handleRunAllInsights = () => {
    if (!activeProject || smartInsights.length === 0) return;
    const insightKeys = new Set(smartInsights.map((item) => item.key));
    const applied = mutateActiveProjectFiles("Smart optimization batch run", (files, project) => {
      const next = { ...files };
      const pageKeys = ["index.html", "about.html", "services.html", "contact.html"];
      const description = `${project.businessName} ${project.industryLabel} services focused on ${project.goal.toLowerCase()}.`;

      if (insightKeys.has("meta")) {
        pageKeys.forEach((pageKey) => {
          next[pageKey] = ensureMetaDescription(next[pageKey], description);
        });
      }

      if (insightKeys.has("alt")) {
        pageKeys.forEach((pageKey) => {
          next[pageKey] = ensureImageAltAttributes(next[pageKey]);
        });
      }

      if (insightKeys.has("cta")) {
        const ctaTextValue = escapeHtml(project.options?.ctaText || "Book a strategy call");
        const ctaSection = `
<section data-optimizer="cta-boost">
  <h2 class="title">Ready to move this project forward?</h2>
  <p class="muted">Start with a focused consultation and get a practical rollout plan.</p>
  <a class="cta" href="contact.html">${ctaTextValue}</a>
</section>`;
        ["index.html", "services.html", "contact.html"].forEach((pageKey) => {
          next[pageKey] = appendSectionBeforeFooter(next[pageKey], "cta-boost", ctaSection);
        });
      }

      if (insightKeys.has("links")) {
        const emailValue = `hello@${slugify(project.businessName || "business") || "business"}.com`;
        const linksSection = `
<section data-optimizer="link-hub">
  <h2 class="title">Quick Links</h2>
  <div class="cards">
    <article class="card"><h3>Explore Services</h3><p><a href="services.html">See service packages</a></p></article>
    <article class="card"><h3>About Our Team</h3><p><a href="about.html">Meet the team</a></p></article>
    <article class="card"><h3>Talk to Us</h3><p><a href="mailto:${emailValue}">Email consultation desk</a></p></article>
  </div>
</section>`;
        next["index.html"] = appendSectionBeforeFooter(next["index.html"], "link-hub", linksSection);
      }

      if (insightKeys.has("content")) {
        const contentSection = `
<section data-optimizer="authority-copy">
  <h2 class="title">Execution Framework</h2>
  <p class="muted">${escapeHtml(
    project.businessName
  )} runs a repeatable process built around discovery, strategy alignment, delivery, and optimization.</p>
  <p class="muted">Each engagement includes weekly reporting, measurable milestones, and continuous testing so teams can improve outcomes over time.</p>
</section>`;
        next["about.html"] = appendSectionBeforeFooter(
          next["about.html"],
          "authority-copy",
          contentSection
        );
        next["services.html"] = appendSectionBeforeFooter(
          next["services.html"],
          "authority-copy",
          contentSection
        );
      }
      return next;
    });
    setInsightMessage(applied ? "Applied all recommended smart optimizations." : "No changes were needed.");
  };

  const handleResetDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setBusinessName("Nova Studio");
    setPrompt(
      "Build a high-converting website with clear service sections, trust signals, and lead capture."
    );
    setIndustryKey(DEFAULT_INDUSTRY.key);
    setTone(TONES[0]);
    setGoal(GOALS[0]);
    setThemePreset("corporate");
    setSubstylePreset(getDefaultSubstyle("corporate"));
    setBrandColor("#14b987");
    setHeadingFontTheme("display");
    setBodyFontTheme("sans");
    setPageFontOverrides(createDefaultPageFontOverrides());
    setCtaText("Book a strategy call");
    setSeoTitle("");
    setCustomDomain("");
    setUseLlm(true);
    setLlmPreset("flagship");
    setLlmModel("gpt-4.1");
    setLlmCustomModel("");
    setVisualStyle("glass");
    setIncludePricing(true);
    setIncludeTestimonials(true);
    setIncludeFaq(true);
    setIncludeBlog(false);
    setIncludePortfolio(true);
    setIncludeLogoCloud(true);
    setEnableMotion(true);
    setDraftSavedAt("");
  };

  const applyTypographyPreset = (presetKey) => {
    const preset = TYPOGRAPHY_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    setHeadingFontTheme(preset.heading);
    setBodyFontTheme(preset.body);
    setPageFontOverrides(createDefaultPageFontOverrides());
  };

  const updatePageFontOverride = (pageKey, channel, value) => {
    if (!["heading", "body"].includes(channel)) return;
    const validValue = Object.prototype.hasOwnProperty.call(FONT_THEMES, value) ? value : "";
    setPageFontOverrides((prev) => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || { heading: "", body: "" }),
        [channel]: validValue,
      },
    }));
  };

  const handleToggleFavorite = (projectId) => {
    const updated = projects.map((project) =>
      project.id === projectId ? { ...project, isFavorite: !project.isFavorite } : project
    );
    persistProjects(updated);
  };

  const handleDuplicateProject = (project) => {
    const normalized = normalizeProject(project);
    const duplicate = {
      ...normalized,
      id: crypto.randomUUID(),
      businessName: `${normalized.businessName} Copy`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      versions: [],
      publishHistory: [],
    };
    persistProjects([duplicate, ...projects]);
  };

  const testRegistrarConnection = async () => {
    if (!liveRegistrarMode) {
      setRegistrarHealthStatus("Enable Live Registrar API to test gateway connectivity.");
      return;
    }

    setRegistrarHealthStatus("Testing registrar gateway...");
    try {
      const result = await checkRegistrarHealth({ provider: registrarProvider });
      if (result?.ok) {
        setRegistrarHealthStatus(
          `Connected: ${selectedRegistrar.label} (${result.mode || "gateway"})`
        );
      } else {
        setRegistrarHealthStatus("Gateway responded, but provider check is incomplete.");
      }
    } catch (error) {
      setRegistrarHealthStatus(`Connection failed: ${error.message}`);
    }
  };

  const addDomainToCart = (domain) => {
    if (!domain.available) return;
    if (domainCart.some((item) => item.name === domain.name)) return;
    const nextCart = [...domainCart, domain];
    setDomainCart(nextCart);
    persistDomainData(ownedDomains, nextCart, sellerMode, resellerMargin);
  };

  const removeDomainFromCart = (domainName) => {
    const nextCart = domainCart.filter((item) => item.name !== domainName);
    setDomainCart(nextCart);
    persistDomainData(ownedDomains, nextCart, sellerMode, resellerMargin);
  };

  const checkoutDomains = async () => {
    if (domainCart.length === 0) return;
    if (!isSignedIn || !email) {
      setDomainMessage("Use Local Sign In to complete domain checkout.");
      return;
    }

    let purchasedItems = [...domainCart];
    if (liveRegistrarMode) {
      try {
        const livePurchased = await purchaseDomainsLive({
          provider: registrarProvider,
          domains: domainCart.map((item) => item.name),
        });
        if (livePurchased.length > 0) {
          purchasedItems = livePurchased.map((item) => ({
            name: item.name,
            price: Number(item.price || 0),
            available: false,
          }));
        }
      } catch {
        setDomainMessage("Live checkout failed. Saved locally in simulator mode.");
      }
    }

    const merged = [...ownedDomains];
    purchasedItems.forEach((domain) => {
      if (!merged.find((item) => item.name === domain.name)) {
        const resalePrice = Number((domain.price * (1 + resellerMargin / 100)).toFixed(2));
        merged.push({
          ...domain,
          purchasedAt: new Date().toISOString(),
          status: sellerMode ? "inventory" : "active",
          listed: sellerMode,
          resalePrice,
        });
      }
    });

    setOwnedDomains(merged);
    setDomainCart([]);
    persistDomainData(merged, [], sellerMode, resellerMargin);
    setDomainMessage(`Checkout complete: ${merged.length} domains in portfolio.`);
  };

  const applyOwnedDomain = (domainName) => {
    setCustomDomain(domainName);
    setDomainMessage(`Applied ${domainName} as project domain.`);
  };

  const activateSellerMode = () => {
    if (!isSignedIn || !email) {
      setDomainMessage("Use Local Sign In to activate seller mode.");
      return;
    }
    setSellerMode(true);
    persistDomainData(ownedDomains, domainCart, true, resellerMargin);
    setDomainMessage("Seller mode activated. New domains will be added to inventory.");

    if (liveRegistrarMode) {
      activateSellerLive({ provider: registrarProvider, margin: resellerMargin }).catch(() => {
        setDomainMessage("Seller mode active locally. Live registrar activation failed.");
      });
    }
  };

  const updateResalePrice = (domainName, value) => {
    const next = ownedDomains.map((item) =>
      item.name === domainName ? { ...item, resalePrice: Number(value || 0) } : item
    );
    setOwnedDomains(next);
    persistDomainData(next, domainCart, sellerMode, resellerMargin);
  };

  const toggleDomainListing = async (domainName) => {
    const next = ownedDomains.map((item) =>
      item.name === domainName
        ? {
            ...item,
            listed: !item.listed,
            status: !item.listed ? "listed" : "inventory",
          }
        : item
    );
    setOwnedDomains(next);
    persistDomainData(next, domainCart, sellerMode, resellerMargin);

    if (liveRegistrarMode) {
      const changed = next.find((item) => item.name === domainName);
      if (changed) {
        try {
          await updateListingLive({
            provider: registrarProvider,
            domain: changed.name,
            listed: Boolean(changed.listed),
            resalePrice: Number(changed.resalePrice || changed.price || 0),
          });
        } catch {
          setDomainMessage("Listing updated locally. Live registrar listing update failed.");
        }
      }
    }
  };

  const getExportFileName = (project) => {
    const base = slugify(project.businessName || project.industryLabel || "website");
    return `${base || "website"}-${project.id.slice(0, 8)}.zip`;
  };

  const handleExport = (project) => {
    const normalized = normalizeProject(project);
    const files = getProjectFiles(normalized);

    const blob = createZipBlob([
      { name: "index.html", content: files["index.html"] },
      { name: "about.html", content: files["about.html"] },
      { name: "services.html", content: files["services.html"] },
      { name: "contact.html", content: files["contact.html"] },
      { name: "sitemap.xml", content: files["sitemap.xml"] || "" },
      { name: "robots.txt", content: files["robots.txt"] || "" },
      {
        name: "project-config.json",
        content: JSON.stringify(
          {
            businessName: normalized.businessName,
            industry: normalized.industryLabel,
            tone: normalized.tone,
            goal: normalized.goal,
            qualityScore: normalized.qualityScore,
            domain: {
              customDomain: normalized.options?.customDomain || "",
              effectiveDomain:
                normalizeDomain(normalized.options?.customDomain || "") ||
                `${slugify(normalized.businessName || "example")}.com`,
            },
            options: normalized.options,
            themePreset: normalized.options?.themePreset || "corporate",
            substylePreset: normalized.options?.substylePreset || "",
          },
          null,
          2
        ),
      },
    ]);

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = getExportFileName(normalized);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const applyFixedFilesToProject = (projectId, nextFiles, note) => {
    const inLibrary = projects.some((item) => item.id === projectId);
    if (inLibrary) {
      let changedProject = null;
      const updated = projects.map((item) => {
        if (item.id !== projectId) return item;
        const snapshot = createVersionSnapshot(item, note);
        changedProject = {
          ...item,
          files: nextFiles,
          html: nextFiles[DEFAULT_PAGE] || item.html,
          versions: [snapshot, ...(item.versions || [])].slice(0, 30),
        };
        return changedProject;
      });
      persistProjects(updated);
      if (changedProject) openProject(changedProject, previewPage);
      return changedProject;
    }

    if (draftProject?.id === projectId) {
      const normalizedDraft = normalizeProject(draftProject);
      const changedDraft = {
        ...normalizedDraft,
        files: nextFiles,
        html: nextFiles[DEFAULT_PAGE] || normalizedDraft.html,
      };
      setDraftProject(changedDraft);
      openProject(changedDraft, previewPage);
      return changedDraft;
    }
    return null;
  };

  const generateChecklistFixContent = async (project) => {
    const fallback = {
      heroHeadline: `${project.businessName} growth system`,
      heroSubhead:
        "Built for clarity, trust, and consistent conversion performance across all pages.",
      ctaText: project.options?.ctaText || "Book a strategy call",
      contactEmail: `hello@${slugify(project.businessName || "business") || "business"}.com`,
      contactPhone: "+1 (000) 000-0000",
      emptySectionText:
        "This section has been expanded with clear, conversion-focused information.",
    };
    const modelChain = dedupeModels([llmCustomModel, llmModel, ...(selectedLlmPreset.models || [])]);
    if (modelChain.length === 0) return fallback;

    let lastError = null;
    for (const model of modelChain) {
      try {
        const outputText = await requestServerLlmText({
          model,
          systemPrompt:
            "You are a conversion-focused website copywriter. Return only valid JSON matching schema.",
          userPrompt: `Generate concise fixes for a website publish checklist.
Business: ${project.businessName}
Industry: ${project.industryLabel}
Tone: ${project.tone}
Goal: ${project.goal}
Return practical text for headlines, CTA, contact info, and section filler copy.`,
          schemaName: "publish_fix_copy",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              heroHeadline: { type: "string" },
              heroSubhead: { type: "string" },
              ctaText: { type: "string" },
              contactEmail: { type: "string" },
              contactPhone: { type: "string" },
              emptySectionText: { type: "string" },
            },
            required: [
              "heroHeadline",
              "heroSubhead",
              "ctaText",
              "contactEmail",
              "contactPhone",
              "emptySectionText",
            ],
          },
        });
        const parsed = parseJsonSafe(outputText);
        if (!parsed) {
          lastError = new Error(`Checklist fix returned invalid JSON for ${model}.`);
          continue;
        }

        return {
          heroHeadline: String(parsed.heroHeadline || fallback.heroHeadline).trim(),
          heroSubhead: String(parsed.heroSubhead || fallback.heroSubhead).trim(),
          ctaText: String(parsed.ctaText || fallback.ctaText).trim(),
          contactEmail: String(parsed.contactEmail || fallback.contactEmail).trim(),
          contactPhone: String(parsed.contactPhone || fallback.contactPhone).trim(),
          emptySectionText: String(parsed.emptySectionText || fallback.emptySectionText).trim(),
        };
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      setHostingMessage(`TitoNova Cloud Engine fix fallback used: ${String(lastError.message || "generation failed")}`);
    }
    return fallback;
  };

  const handleFixPublishChecklist = async () => {
    if (!publishChecklist?.projectId) return;
    const targetProject =
      projects.find((item) => item.id === publishChecklist.projectId) ||
      (draftProject?.id === publishChecklist.projectId ? draftProject : null);
    if (!targetProject) {
      setHostingMessage("Checklist project no longer available.");
      setPublishChecklist(null);
      return;
    }

    const normalized = normalizeProject(targetProject);
    const files = getProjectFiles(normalized);
    const currentChecklist = runPublishChecklist(files);
    setPublishChecklistBusy(true);
    setHostingMessage(`Fixing publish checklist for ${normalized.businessName}...`);

    try {
      const fixContent = await generateChecklistFixContent(normalized);
      const nextFiles = applyPublishChecklistFixes(files, currentChecklist, fixContent);
      const changed = PUBLISH_PAGE_KEYS.some((key) => (nextFiles[key] || "") !== (files[key] || ""));
      if (!changed) {
        setHostingMessage("No checklist fixes were applied.");
        return;
      }

      applyFixedFilesToProject(
        normalized.id,
        nextFiles,
        "Auto fix: pre-publish checklist"
      );
      const afterChecklist = runPublishChecklist(nextFiles);
      setPublishChecklist({
        projectId: normalized.id,
        projectName: normalized.businessName,
        ...afterChecklist,
      });
      setHostingMessage("Checklist fixes applied. Re-run publish.");
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "publish-check",
        status: "success",
        message: "Auto-fix applied for checklist issues",
        checklistScore: afterChecklist.readinessScore,
      });
    } finally {
      setPublishChecklistBusy(false);
    }
  };

  const handlePublishAnyway = async () => {
    if (!publishChecklist?.projectId) return;
    const targetProject =
      projects.find((item) => item.id === publishChecklist.projectId) ||
      (draftProject?.id === publishChecklist.projectId ? draftProject : null);
    if (!targetProject) return;
    const normalized = normalizeProject(targetProject);
    pushPublishLog({
      projectId: normalized.id,
      projectName: normalized.businessName,
      action: "publish-override",
      status: "fail",
      message: "Warning: publish override accepted",
      checklistScore: publishChecklist.readinessScore,
    });
    const payload = await handlePublishProject(targetProject, { allowChecklistOverride: true });
    if (payload?.url) {
      window.open(payload.url, "_blank", "noopener,noreferrer");
    }
  };

  const handlePublishProject = async (project, options = {}) => {
    const allowChecklistOverride = Boolean(options.allowChecklistOverride);
    if (!project) {
      setHostingMessage("No project selected for publish.");
      return null;
    }
    const normalized = normalizeProject(project);
    const files = getProjectFiles(normalized);
    const checklist = runPublishChecklist(files);
    if (checklist.criticalFailed && !allowChecklistOverride) {
      setPublishChecklist({
        projectId: normalized.id,
        projectName: normalized.businessName,
        ...checklist,
      });
      setHostingStep("error");
      setHostingMessage("Publish blocked: critical checklist issues found. Fix with TitoNova Cloud Engine or publish anyway.");
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "publish-check",
        status: "fail",
        message: "Publish blocked by checklist gate",
        checklistScore: checklist.readinessScore,
      });
      return null;
    }

    setPublishChecklist({
      projectId: normalized.id,
      projectName: normalized.businessName,
      ...checklist,
    });
    const safeSiteId = `${slugify(normalized.businessName || "site")}-${normalized.id.slice(0, 8)}`;
    setLastPublishProjectId(normalized.id);

    setHostingBusyId(normalized.id);
    setHostingStep("preparing");
    setHostingMessage(`Preparing ${normalized.businessName} for publish...`);

    try {
      setHostingStep("uploading");
      setHostingMessage(`Uploading ${normalized.businessName}...`);
      const payload = await publishProjectLive({
        siteId: safeSiteId,
        projectName: normalized.businessName,
        customDomain: normalizeDomain(normalized.options?.customDomain || ""),
        files: {
          "index.html": files["index.html"],
          "about.html": files["about.html"],
          "services.html": files["services.html"],
          "contact.html": files["contact.html"],
          "robots.txt": files["robots.txt"] || "",
          "sitemap.xml": files["sitemap.xml"] || "",
        },
      });

      setHostedSites((prev) => ({
        ...prev,
        [safeSiteId]: payload,
      }));
      setHostingStep("live");
      setHostingMessage(`Published: ${payload.url}`);
      recordPublishSnapshot({
        projectId: normalized.id,
        files,
        url: payload.url,
        note: "Published live",
      });
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: allowChecklistOverride ? "publish-override" : "publish",
        status: "success",
        message: allowChecklistOverride ? "Publish completed with checklist override" : "Publish completed",
        url: payload.url,
        checklistScore: checklist.readinessScore,
      });
      return payload;
    } catch (error) {
      setHostingStep("error");
      setHostingMessage(`Publish failed: ${error.message}`);
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "publish",
        status: "fail",
        message: String(error.message || "Publish failed"),
        checklistScore: checklist.readinessScore,
      });
      return null;
    } finally {
      setHostingBusyId("");
    }
  };

  const getPublishableProject = () => {
    if (activeProjectId) {
      const activeFromLibrary = projects.find((item) => item.id === activeProjectId);
      if (activeFromLibrary) return activeFromLibrary;
      if (draftProject?.id === activeProjectId) return draftProject;
    }

    if (draftProject) return draftProject;
    if (projects.length > 0) return projects[0];
    return null;
  };

  const handleQuickPublishActive = async () => {
    const project = getPublishableProject();
    if (!project) {
      setHostingMessage("Generate or open a project first, then click Go Live.");
      return;
    }

    const payload = await handlePublishProject(project);
    if (payload?.url) {
      window.open(payload.url, "_blank", "noopener,noreferrer");
    }
  };

  const retryLastPublish = async () => {
    const project =
      projects.find((item) => item.id === lastPublishProjectId) ||
      (draftProject?.id === lastPublishProjectId ? draftProject : null);
    if (!project) {
      setHostingMessage("No previous publish target found. Open a project and publish again.");
      return;
    }
    const payload = await handlePublishProject(project);
    if (payload?.url) {
      window.open(payload.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleUnpublishProject = async (project) => {
    const normalized = normalizeProject(project);
    const safeSiteId = `${slugify(normalized.businessName || "site")}-${normalized.id.slice(0, 8)}`;

    setHostingBusyId(normalized.id);
    setHostingMessage(`Unpublishing ${normalized.businessName}...`);
    try {
      await unpublishProjectLive({ siteId: safeSiteId });
      setHostedSites((prev) => {
        const next = { ...prev };
        delete next[safeSiteId];
        return next;
      });
      setHostingMessage("Project unpublished.");
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "unpublish",
        status: "success",
        message: "Site unpublished",
      });
    } catch (error) {
      setHostingMessage(`Unpublish failed: ${error.message}`);
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "unpublish",
        status: "fail",
        message: String(error.message || "Unpublish failed"),
      });
    } finally {
      setHostingBusyId("");
    }
  };

  const handleRollbackLive = async (project) => {
    const normalized = normalizeProject(project);
    const safeSiteId = `${slugify(normalized.businessName || "site")}-${normalized.id.slice(0, 8)}`;
    const history = normalized.publishHistory || [];
    if (history.length < 2) {
      setHostingMessage("Rollback unavailable. Publish at least twice first.");
      return;
    }

    const previous = history[1];
    if (!previous?.files?.[DEFAULT_PAGE]) {
      setHostingMessage("Rollback snapshot is incomplete.");
      return;
    }

    setLastPublishProjectId(normalized.id);
    setHostingBusyId(normalized.id);
    setHostingStep("preparing");
    setHostingMessage(`Preparing rollback for ${normalized.businessName}...`);

    try {
      setHostingStep("uploading");
      setHostingMessage(`Uploading rollback version for ${normalized.businessName}...`);
      const payload = await publishProjectLive({
        siteId: safeSiteId,
        projectName: normalized.businessName,
        customDomain: normalizeDomain(normalized.options?.customDomain || ""),
        files: previous.files,
      });

      setHostedSites((prev) => ({
        ...prev,
        [safeSiteId]: payload,
      }));

      const hasProject = projects.some((item) => item.id === normalized.id);
      if (hasProject) {
        const updated = projects.map((item) => {
          if (item.id !== normalized.id) return item;
          const autoSnapshot = createVersionSnapshot(item, "Auto snapshot before live rollback");
          return {
            ...item,
            files: previous.files,
            html: previous.files[DEFAULT_PAGE] || item.html,
            versions: [autoSnapshot, ...(item.versions || [])].slice(0, 30),
            publishHistory: [
              {
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                note: "Rollback to previous live version",
                url: payload.url,
                files: previous.files,
              },
              ...(item.publishHistory || []),
            ].slice(0, 12),
          };
        });
        persistProjects(updated);
        const changed = updated.find((item) => item.id === normalized.id);
        if (changed && activeProjectId === normalized.id) {
          openProject(changed, previewPage);
        }
      }

      setHostingStep("live");
      setHostingMessage(`Rollback complete: ${payload.url}`);
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "rollback",
        status: "success",
        message: "Rollback completed",
        url: payload.url,
      });
    } catch (error) {
      setHostingStep("error");
      setHostingMessage(`Rollback failed: ${error.message}`);
      pushPublishLog({
        projectId: normalized.id,
        projectName: normalized.businessName,
        action: "rollback",
        status: "fail",
        message: String(error.message || "Rollback failed"),
      });
    } finally {
      setHostingBusyId("");
    }
  };

  const handleExportProjectJson = (project) => {
    const normalized = normalizeProject(project);
    const blob = new Blob([JSON.stringify(normalized, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(normalized.businessName || "project")}-${normalized.id.slice(
      0,
      8
    )}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProjectJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = normalizeProject({
        ...parsed,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
      persistProjects([imported, ...projects]);
    } catch {
      setError("Could not import project JSON file.");
    } finally {
      if (projectImportRef.current) {
        projectImportRef.current.value = "";
      }
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Delete all saved websites for all accounts on this browser?")) return;

    localStorage.removeItem(STORAGE_KEY);
    setProjects([]);
    setPreviewHtml("");
    setEditableHtml("");
    setActiveProjectId(null);
    setDraftProject(null);
    setError("");
  };

  const handleSignup = () => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password) {
      alert("Enter email and password");
      return;
    }

    setEmail(normalizedEmail);
    localStorage.setItem(SESSION_USER_KEY, normalizedEmail);
    setIsSignedIn(true);
    setShowAuthModal(false);

    if (draftProject) {
      addProjectsForUser(normalizedEmail, [draftProject]);
      setDraftProject(null);
    } else {
      setProjects(getUserProjects(normalizedEmail).map(normalizeProject));
    }
    const domains = getUserDomainData(normalizedEmail);
    setOwnedDomains(domains.owned || []);
    setDomainCart(domains.cart || []);
    setSellerMode(Boolean(domains.seller?.active));
    setResellerMargin(Number(domains.seller?.margin || 35));
  };

  const handleSignout = () => {
    localStorage.removeItem(SESSION_USER_KEY);
    setIsSignedIn(false);
    setShowAuthModal(false);
    setEmail("");
    setPassword("");
    setProjects([]);
    setOwnedDomains([]);
    setDomainCart([]);
    setSellerMode(false);
    setResellerMargin(35);
  };

  const applyQuickStartPreset = (presetKey) => {
    const preset = QUICK_START_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    setBusinessName(preset.businessName);
    setIndustryKey(preset.industryKey);
    setGoal(preset.goal);
    setTone(preset.tone);
    setCtaText(preset.ctaText);
    setPrompt(preset.prompt);
    setSeoTitle(`${preset.businessName} | ${preset.goal}`);
    setDomainSearch("");
    setDomainMessage(`Applied ${preset.label} preset. Review and generate.`);
  };

  shortcutHandlersRef.current.generateOne = handleGenerateOne;
  shortcutHandlersRef.current.generateAll = handleGenerateAll;
  shortcutHandlersRef.current.saveInlineEdits = handleSaveInlineEdits;

  useEffect(() => {
    const onKeyDown = (event) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (!modifier) return;
      if (event.target instanceof HTMLElement) {
        const tag = event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") {
          if (event.key.toLowerCase() !== "s") return;
        }
      }

      if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        if (!loading) shortcutHandlersRef.current.generateAll();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (!loading) shortcutHandlersRef.current.generateOne();
        return;
      }

      if (event.key.toLowerCase() === "s" && isInlineEditing && activeProjectId) {
        event.preventDefault();
        shortcutHandlersRef.current.saveInlineEdits();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, isInlineEditing, activeProjectId]);

  return (
    <div className="builder-shell">
      <header className="builder-topbar">
        <div className="brand-block">
          <div className="brand-dot">TN</div>
          <div>
            <strong>TitoNova Cloud Engine Pro</strong>
            <p>Advanced multi-page generation workspace</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="ghost" onClick={() => setShowAuthModal(true)}>
            {isSignedIn ? "Account" : "Local Sign In"}
          </button>
          {isSignedIn && (
            <button className="ghost" onClick={handleSignout}>
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="workspace-grid">
        <aside className="wizard-panel">
          <h2>TitoNova Cloud Engine Setup Wizard</h2>
          <p>Configure the full website strategy, branding system, and conversion goal.</p>
          <section className="wizard-section">
            <h3>1. Business Profile</h3>
            <div className="wizard-grid-2">
              <div className="wizard-field-full">
                <label htmlFor="business-name">Business name</label>
                <input
                  id="business-name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Example: Northpoint Studio"
                />
              </div>
              <div>
                <label htmlFor="industry-select">Industry</label>
                <select
                  id="industry-select"
                  value={industryKey}
                  onChange={(event) => setIndustryKey(event.target.value)}
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.key} value={industry.key}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="goal-select">Primary goal</label>
                <select id="goal-select" value={goal} onChange={(event) => setGoal(event.target.value)}>
                  {GOALS.map((goalOption) => (
                    <option key={goalOption} value={goalOption}>
                      {goalOption}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="theme-select">Theme preset</label>
                <select
                  id="theme-select"
                  value={themePreset}
                  onChange={(event) => setThemePreset(event.target.value)}
                >
                  {THEME_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="substyle-select">Substyle</label>
                <select
                  id="substyle-select"
                  value={substylePreset}
                  onChange={(event) => setSubstylePreset(event.target.value)}
                >
                  {availableSubstyles.map((substyle) => (
                    <option key={substyle.key} value={substyle.key}>
                      {substyle.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="wizard-field-full">
                <label>Tone</label>
                <div className="tone-row">
                  {TONES.map((toneOption) => (
                    <button
                      key={toneOption}
                      className={`tone-chip ${toneOption === tone ? "active" : ""}`}
                      onClick={() => setTone(toneOption)}
                    >
                      {toneOption}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="brand-color">Brand color</label>
                <div className="input-inline">
                  <input
                    id="brand-color"
                    type="color"
                    value={brandColor}
                    onChange={(event) => setBrandColor(event.target.value)}
                  />
                  <input
                    value={brandColor}
                    onChange={(event) => setBrandColor(event.target.value)}
                    aria-label="Brand color hex"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="visual-style">Visual style pack</label>
                <select
                  id="visual-style"
                  value={visualStyle}
                  onChange={(event) => setVisualStyle(event.target.value)}
                >
                  {VISUAL_STYLES.map((style) => (
                    <option key={style.key} value={style.key}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="wizard-section">
            <h3>2. Design & Typography</h3>
            <div className="wizard-grid-2">
              <div>
                <label htmlFor="heading-font-theme">Heading font style</label>
                <select
                  id="heading-font-theme"
                  value={headingFontTheme}
                  onChange={(event) => setHeadingFontTheme(event.target.value)}
                >
                  {FONT_THEME_OPTIONS.map((fontOption) => (
                    <option key={fontOption.key} value={fontOption.key}>
                      {fontOption.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="body-font-theme">Body font style</label>
                <select
                  id="body-font-theme"
                  value={bodyFontTheme}
                  onChange={(event) => setBodyFontTheme(event.target.value)}
                >
                  {FONT_THEME_OPTIONS.map((fontOption) => (
                    <option key={fontOption.key} value={fontOption.key}>
                      {fontOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="type-presets-row">
              {TYPOGRAPHY_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="ghost small"
                  onClick={() => applyTypographyPreset(preset.key)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="type-preview-strip">
              <p
                className="type-preview-heading"
                style={{ fontFamily: FONT_THEMES[headingFontTheme]?.stack || FONT_THEMES.display.stack }}
              >
                Build financial clarity with confidence
              </p>
              <p
                className="type-preview-body"
                style={{ fontFamily: FONT_THEMES[bodyFontTheme]?.stack || FONT_THEMES.sans.stack }}
              >
                Your business can present clear value, build trust, and guide visitors to take action.
              </p>
            </div>
            <div className="page-font-grid">
              <div className="page-font-grid-head">
                <strong>Per-page font overrides</strong>
                <button
                  type="button"
                  className="ghost small"
                  onClick={() => setPageFontOverrides(createDefaultPageFontOverrides())}
                >
                  Clear overrides
                </button>
              </div>
              {PAGE_CONFIG.map((page) => {
                const override = pageFontOverrides[page.key] || { heading: "", body: "" };
                return (
                  <div key={page.key} className="page-font-row">
                    <span>{page.label}</span>
                    <select
                      value={override.heading}
                      onChange={(event) =>
                        updatePageFontOverride(page.key, "heading", event.target.value)
                      }
                    >
                      <option value="">Heading: Use global</option>
                      {FONT_THEME_OPTIONS.map((fontOption) => (
                        <option key={`${page.key}-h-${fontOption.key}`} value={fontOption.key}>
                          Heading: {fontOption.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={override.body}
                      onChange={(event) =>
                        updatePageFontOverride(page.key, "body", event.target.value)
                      }
                    >
                      <option value="">Body: Use global</option>
                      {FONT_THEME_OPTIONS.map((fontOption) => (
                        <option key={`${page.key}-b-${fontOption.key}`} value={fontOption.key}>
                          Body: {fontOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="wizard-section">
            <h3>3. Content Engine</h3>
            <label className="inline-toggle">
              <input
                type="checkbox"
                checked={useLlm}
                onChange={(event) => setUseLlm(event.target.checked)}
              />
              Use TitoNova Cloud Engine copy generation
            </label>
            {useLlm && (
              <>
                <label htmlFor="llm-preset">TitoNova Cloud Engine quality preset</label>
                <select
                  id="llm-preset"
                  value={llmPreset}
                  onChange={(event) => setLlmPreset(event.target.value)}
                >
                  {LLM_MODEL_PRESETS.map((preset) => (
                    <option key={preset.key} value={preset.key}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <p className="llm-note">{selectedLlmPreset.description}</p>

                <label htmlFor="llm-model">LLM model</label>
                <select
                  id="llm-model"
                  value={llmModel}
                  onChange={(event) => setLlmModel(event.target.value)}
                >
                  {llmModelOptions.map((modelOption) => (
                    <option key={modelOption} value={modelOption}>
                      {modelOption}
                    </option>
                  ))}
                </select>

                <label htmlFor="llm-custom-model">Custom first-choice model (optional)</label>
                <input
                  id="llm-custom-model"
                  value={llmCustomModel}
                  onChange={(event) => setLlmCustomModel(event.target.value)}
                  placeholder="e.g. gpt-4.1"
                />
                <p className="llm-note">
                  Requires server-side <code>OPENAI_API_KEY</code> on the gateway. If the selected model is unavailable,
                  fallback models from the preset are used automatically.
                </p>
              </>
            )}
          </section>

          <section className="wizard-section">
            <h3>4. Website Modules</h3>
            <div className="toggle-grid">
              <label><input type="checkbox" checked={includePricing} onChange={(e) => setIncludePricing(e.target.checked)} /> Pricing</label>
              <label><input type="checkbox" checked={includeTestimonials} onChange={(e) => setIncludeTestimonials(e.target.checked)} /> Testimonials</label>
              <label><input type="checkbox" checked={includeFaq} onChange={(e) => setIncludeFaq(e.target.checked)} /> FAQ</label>
              <label><input type="checkbox" checked={includeBlog} onChange={(e) => setIncludeBlog(e.target.checked)} /> Blog</label>
              <label><input type="checkbox" checked={includePortfolio} onChange={(e) => setIncludePortfolio(e.target.checked)} /> Portfolio</label>
              <label><input type="checkbox" checked={includeLogoCloud} onChange={(e) => setIncludeLogoCloud(e.target.checked)} /> Logo cloud</label>
              <label><input type="checkbox" checked={enableMotion} onChange={(e) => setEnableMotion(e.target.checked)} /> Animations</label>
            </div>
          </section>

          <div className="quality-meter">
            <div className="quality-head">
              <strong>TitoNova Cloud Engine brief score</strong>
              <span>{qualityScore}/100</span>
            </div>
            <div className="quality-track">
              <span style={{ width: `${qualityScore}%` }} />
            </div>
          </div>

          <div className="wizard-stats">
            <div>
              <strong>{INDUSTRIES.length}</strong>
              <span>Industries</span>
            </div>
            <div>
              <strong>{projectCount}</strong>
              <span>Saved projects</span>
            </div>
            <div>
              <strong>{PAGE_CONFIG.length}</strong>
              <span>Pages/site</span>
            </div>
          </div>
        </aside>

        <section className="generator-panel">
          <div className="panel-card landing-hero">
            <h1>Launch a website in minutes</h1>
            <p>
              Pick a starter template, generate your pages, then publish live.
            </p>
            <div className="landing-simple-steps">
              <span className="landing-simple-step">1. Set profile</span>
              <span className="landing-simple-step">2. Generate site</span>
              <span className="landing-simple-step">3. Go live</span>
            </div>
            <span className="quick-preset-label">Quick start templates</span>
            <div className="quick-preset-row">
              {QUICK_START_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className="ghost small"
                  onClick={() => applyQuickStartPreset(preset.key)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className="go-live-btn"
                onClick={handleGenerateAndGoLive}
                disabled={loading}
              >
                {loading ? "Working..." : "Generate + Go Live"}
              </button>
            </div>
            {(goLiveStep !== "idle" || goLiveError) && (
              <div className="publish-status-wrap">
                <div className="publish-steps">
                  {PUBLISH_STEPS.map((step) => {
                    const active =
                      goLiveStep === step ||
                      (goLiveStep === "error" && step === "uploading");
                    const done =
                      step === "preparing"
                        ? ["uploading", "live", "error"].includes(goLiveStep)
                        : step === "uploading"
                          ? ["live", "error"].includes(goLiveStep)
                          : goLiveStep === "live";
                    return (
                      <span
                        key={`go-live-${step}`}
                        className={`publish-step ${active ? "active" : ""} ${done ? "done" : ""}`}
                      >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </span>
                    );
                  })}
                </div>
                {(goLiveMessage || goLiveError) && (
                  <div className="llm-status">{goLiveError || goLiveMessage}</div>
                )}
                {goLiveStep === "error" && (
                  <button type="button" className="ghost small" onClick={handleGenerateAndGoLive} disabled={loading}>
                    Retry Generate + Go Live
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="panel-card">
            <h1>Quick Project Brief</h1>
            <p>
              Add your core offer and call to action, then generate. You can fine-tune after preview.
            </p>

            <label htmlFor="prompt">Project prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
              placeholder="Describe services, audience, location, value proposition, and CTA style."
            />

            <div className="advanced-grid">
              <div>
                <label htmlFor="cta-text">Primary CTA</label>
                <input
                  id="cta-text"
                  value={ctaText}
                  onChange={(event) => setCtaText(event.target.value)}
                  placeholder="Book a strategy call"
                />
              </div>
              <div>
                <label htmlFor="seo-title">SEO title</label>
                <input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  placeholder="Brand | Industry Services"
                />
              </div>
              <div>
                <label htmlFor="custom-domain">Custom domain</label>
                <input
                  id="custom-domain"
                  value={customDomain}
                  onChange={(event) => setCustomDomain(event.target.value)}
                  placeholder="example.com"
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {llmStatus && <div className="llm-status">{llmStatus}</div>}

            <div className="action-row">
              <button onClick={handleGenerateOne} disabled={loading}>
                {loading ? "Generating..." : "Generate Website"}
              </button>
              <button
                className="go-live-btn"
                onClick={handleQuickPublishActive}
                disabled={!activeProjectId || hostingBusyId === activeProjectId}
              >
                {hostingBusyId === activeProjectId ? "Publishing..." : "Go Live Now"}
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => setShowAdvancedLandingActions((prev) => !prev)}
              >
                {showAdvancedLandingActions ? "Hide Advanced" : "Show Advanced"}
              </button>
            </div>
            <p className="muted">Go Live publishes the opened project and opens its live URL automatically.</p>

            {showAdvancedLandingActions && (
              <div className="command-center">
                <div className="action-row">
                  <button className="ghost" onClick={handleGenerateAll} disabled={loading}>
                    {loading ? "Generating..." : "Generate All Industries"}
                  </button>
                </div>
                <div className="command-row">
                  <strong>Builder Draft</strong>
                  <span className="muted">
                    {draftSavedAt ? `Autosaved ${new Date(draftSavedAt).toLocaleTimeString()}` : "No draft saved yet"}
                  </span>
                </div>
                <div className="shortcut-grid">
                  <span>
                    <kbd>Ctrl/Cmd + Enter</kbd> Generate website
                  </span>
                  <span>
                    <kbd>Ctrl/Cmd + Shift + Enter</kbd> Generate all industries
                  </span>
                  <span>
                    <kbd>Ctrl/Cmd + S</kbd> Save inline edits
                  </span>
                </div>
                <button className="ghost small" type="button" onClick={handleResetDraft}>
                  Reset builder draft
                </button>
              </div>
            )}
          </div>

          <div className="panel-card">
            <div className="card-header-row">
              <h2>Domain Marketplace</h2>
              <span className="muted">Search, cart, and checkout domains</span>
            </div>
            <div className="registrar-controls">
              <select
                value={registrarProvider}
                onChange={(event) => {
                  const next = event.target.value;
                  setRegistrarProvider(next);
                  setRegistrarHealthStatus("");
                  if (isSignedIn && email) {
                    saveUserDomainData(email, {
                      owned: ownedDomains,
                      cart: domainCart,
                      seller: { active: sellerMode, margin: resellerMargin },
                      registrar: { provider: next, liveMode: liveRegistrarMode },
                    });
                  }
                }}
              >
                {REGISTRAR_PROVIDERS.map((provider) => (
                  <option key={provider.key} value={provider.key}>
                    {provider.label}
                  </option>
                ))}
              </select>
              <label className="mini-toggle">
                <input
                  type="checkbox"
                  checked={liveRegistrarMode}
                  onChange={(event) => {
                    const next = event.target.checked;
                    setLiveRegistrarMode(next);
                    setRegistrarHealthStatus("");
                    if (isSignedIn && email) {
                      saveUserDomainData(email, {
                        owned: ownedDomains,
                        cart: domainCart,
                        seller: { active: sellerMode, margin: resellerMargin },
                        registrar: { provider: registrarProvider, liveMode: next },
                      });
                    }
                  }}
                />
                Live Registrar API
              </label>
              <button className="ghost small" onClick={testRegistrarConnection}>
                Test Connection
              </button>
              {registrarLoading && <span className="muted">Querying registrar...</span>}
            </div>
            <div className="registrar-hint">
              <strong>{selectedRegistrar.label} requirements</strong>
              <ul className="registrar-req-list">
                {selectedRegistrar.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="muted">
                Gateway path: <code>/api/registrar/*</code>
              </p>
            </div>
            {registrarHealthStatus && <div className="llm-status">{registrarHealthStatus}</div>}
            {registrarProvider === "namecheap" && (
              <div className="diagnostics-card">
                <strong>Namecheap Connection Diagnostics</strong>
                <div className="diagnostics-list">
                  {namecheapDiagnostics.map((item) => (
                    <div key={item.label} className="diagnostics-item">
                      <span className={`diag-badge ${item.state}`}>{item.state.toUpperCase()}</span>
                      <div>
                        <b>{item.label}</b>
                        <small>{item.note}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="seller-row">
              <span className={`domain-status ${sellerMode ? "ok" : "taken"}`}>
                {sellerMode ? "Seller Mode Active" : "Seller Mode Inactive"}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={resellerMargin}
                onChange={(event) => setResellerMargin(Number(event.target.value || 0))}
                className="margin-input"
                aria-label="Reseller margin percentage"
              />
              <span className="muted">Margin %</span>
              <button className="ghost small" onClick={activateSellerMode}>
                Activate Seller
              </button>
            </div>
            <div className="domain-search-row">
              <input
                placeholder="Search domain keyword..."
                value={domainSearch}
                onChange={(event) => setDomainSearch(event.target.value)}
              />
            </div>
            <p className="muted">
              Auto suggestions use your business name when search is empty.
            </p>
            {domainMessage && <div className="llm-status">{domainMessage}</div>}
            <div className="domain-suggestion-grid">
              {domainSuggestions.slice(0, 8).map((domain) => (
                <article key={domain.name} className="domain-card">
                  <div>
                    <h3>{domain.name}</h3>
                    <p>${domain.price.toFixed(2)}/year</p>
                  </div>
                  <div className="domain-actions">
                    <span className={`domain-status ${domain.available ? "ok" : "taken"}`}>
                      {domain.available ? "Available" : "Taken"}
                    </span>
                    <button
                      className="ghost small"
                      onClick={() => addDomainToCart(domain)}
                      disabled={!domain.available}
                    >
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
              {domainSuggestions.length === 0 && (
                <div className="empty">Add a business name or domain keyword to discover domain options.</div>
              )}
            </div>

            <div className="domain-cart">
              <h3>Cart ({domainCart.length})</h3>
              <div className="domain-cart-list">
                {domainCart.map((item) => (
                  <div key={item.name} className="domain-cart-item">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                    <button className="ghost small" onClick={() => removeDomainFromCart(item.name)}>
                      Remove
                    </button>
                  </div>
                ))}
                {domainCart.length === 0 && <div className="empty-mini">No domains in cart.</div>}
              </div>
              <button className="ghost" onClick={checkoutDomains} disabled={domainCart.length === 0}>
                Checkout Domains
              </button>
            </div>

            <div className="domain-owned">
              <h3>Owned Domains ({ownedDomains.length})</h3>
              <div className="domain-cart-list">
                {ownedDomains.slice(0, 8).map((item) => (
                  <div key={item.name} className="domain-cart-item">
                    <span>{item.name}</span>
                    <span>{item.listed ? `Listed $${Number(item.resalePrice || item.price).toFixed(2)}` : item.status}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={Number(item.resalePrice || item.price)}
                      onChange={(event) => updateResalePrice(item.name, event.target.value)}
                      className="resale-input"
                      aria-label={`Resale price for ${item.name}`}
                    />
                    <button className="ghost small" onClick={() => toggleDomainListing(item.name)}>
                      {item.listed ? "Unlist" : "List"}
                    </button>
                    <button className="ghost small" onClick={() => applyOwnedDomain(item.name)}>
                      Use for project
                    </button>
                  </div>
                ))}
                {ownedDomains.length === 0 && (
                  <div className="empty-mini">No owned domains yet.</div>
                )}
              </div>
            </div>
          </div>

          {isSignedIn && (
            <div className="panel-card">
              <div className="card-header-row">
                <h2>Project Library</h2>
                {projects.length > 0 && (
                  <button className="danger" onClick={handleClearAll}>
                    Clean up all websites
                  </button>
                )}
              </div>

              <div className="library-toolbar">
                <input
                  placeholder="Search by name, industry, tone, goal..."
                  value={projectSearch}
                  onChange={(event) => setProjectSearch(event.target.value)}
                />
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                  <option value="newest">Newest</option>
                  <option value="score">Best score</option>
                  <option value="name">Name</option>
                </select>
                <button
                  className="ghost"
                  type="button"
                  onClick={() => projectImportRef.current?.click()}
                >
                  Import JSON
                </button>
                <input
                  ref={projectImportRef}
                  type="file"
                  accept="application/json"
                  className="hidden-input"
                  onChange={handleImportProjectJson}
                />
                <label className="fav-toggle">
                  <input
                    type="checkbox"
                    checked={favoritesOnly}
                    onChange={(event) => setFavoritesOnly(event.target.checked)}
                  />
                  Favorites only
                </label>
              </div>

              {filteredProjects.length === 0 ? (
                <div className="empty">No projects match your current filters.</div>
              ) : (
                <div className="project-grid">
                  {filteredProjects.map((project) => {
                    const siteId = `${slugify(project.businessName || "site")}-${project.id.slice(0, 8)}`;
                    const hosted = hostedSites[siteId];
                    return (
                    <article key={project.id} className="project-card">
                      <div>
                        <h3>{project.businessName}</h3>
                        <p>
                          {project.industryLabel} • {project.tone} • {project.goal} •{" "}
                          {(project.options?.themePreset || "corporate").toUpperCase()} •{" "}
                          {(project.options?.substylePreset || "default").toUpperCase()} •{" "}
                          {(project.options?.visualStyle || "glass").toUpperCase()}
                          {project.options?.useLlm
                            ? ` • LLM:${project.options?.llmResolvedModel || project.options?.llmModel || "ON"}`
                            : ""}
                        </p>
                        <span>
                          Domain:{" "}
                          {normalizeDomain(project.options?.customDomain || "") || "(auto generated)"}
                        </span>
                        {hosted?.url && (
                          <span>
                            Live URL:{" "}
                            <a href={hosted.url} target="_blank" rel="noreferrer">
                              {hosted.url}
                            </a>
                          </span>
                        )}
                        <span>{new Date(project.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="project-meta-row">
                        <span className="score-chip">Score {project.qualityScore}</span>
                        <button
                          className={`ghost icon-btn ${project.isFavorite ? "is-favorite" : ""}`}
                          onClick={() => handleToggleFavorite(project.id)}
                          aria-label="Toggle favorite"
                        >
                          ★
                        </button>
                      </div>
                      <div className="project-actions">
                        <button className="ghost" onClick={() => openProject(project)}>
                          Open preview
                        </button>
                        <button className="ghost" onClick={() => handleExport(project)}>
                          Export ZIP
                        </button>
                        <button className="ghost" onClick={() => handleExportProjectJson(project)}>
                          Export JSON
                        </button>
                        <button className="ghost" onClick={() => handleDuplicateProject(project)}>
                          Duplicate
                        </button>
                        <button
                          className="go-live-btn"
                          onClick={async () => {
                            const payload = await handlePublishProject(project);
                            if (payload?.url) {
                              window.open(payload.url, "_blank", "noopener,noreferrer");
                            }
                          }}
                          disabled={hostingBusyId === project.id}
                        >
                          {hostingBusyId === project.id
                            ? "Publishing..."
                            : hosted?.url
                              ? "Update Live"
                              : "Go Live"}
                        </button>
                        {hosted?.url && (
                          <>
                            <a className="ghost button-link" href={hosted.url} target="_blank" rel="noreferrer">
                              Open Live
                            </a>
                            {(project.publishHistory?.length || 0) >= 2 && (
                              <button
                                className="ghost"
                                onClick={() => handleRollbackLive(project)}
                                disabled={hostingBusyId === project.id}
                              >
                                Rollback Live
                              </button>
                            )}
                            <button
                              className="ghost"
                              onClick={() => handleUnpublishProject(project)}
                              disabled={hostingBusyId === project.id}
                            >
                              Unpublish
                            </button>
                          </>
                        )}
                      </div>
                    </article>
                    );
                  })}
                </div>
              )}
              {hostingMessage && (
                <div className="publish-status-wrap">
                  <div className="publish-steps">
                    {PUBLISH_STEPS.map((step) => {
                      const active =
                        hostingStep === step ||
                        (hostingStep === "error" && step === "uploading");
                      const done =
                        step === "preparing"
                          ? ["uploading", "live", "error"].includes(hostingStep)
                          : step === "uploading"
                            ? ["live", "error"].includes(hostingStep)
                            : hostingStep === "live";
                      return (
                        <span
                          key={step}
                          className={`publish-step ${active ? "active" : ""} ${done ? "done" : ""}`}
                        >
                          {step.charAt(0).toUpperCase() + step.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                  <div className="llm-status">{hostingMessage}</div>
                  {hostingStep === "error" && (
                    <button className="ghost small" onClick={retryLastPublish}>
                      Retry Publish
                    </button>
                  )}
                </div>
              )}
              {publishChecklist && (
                <div className="publish-checklist-card">
                  <div className="card-header-row">
                    <h3>Quick Publish Checklist</h3>
                    <div className="checklist-header-meta">
                      <span
                        className={`readiness-chip ${publishChecklist.readinessBand}`}
                      >
                        {publishChecklist.readinessBand === "ready"
                          ? "Ready"
                          : publishChecklist.readinessBand === "almost"
                            ? "Almost ready"
                            : "Needs work"}
                      </span>
                      <span className={`domain-status ${publishChecklist.criticalFailed ? "taken" : "ok"}`}>
                        {publishChecklist.criticalFailed ? "Blocked" : "Ready"}
                      </span>
                    </div>
                  </div>
                  <div className="checklist-score-row">
                    <strong>Readiness Score: {publishChecklist.readinessScore}/100</strong>
                    <small>Fix first: {publishChecklist.fixFirst}</small>
                  </div>
                  <div className="publish-checklist-list">
                    {publishChecklist.items.map((item) => (
                      <div key={item.key} className="publish-checklist-item">
                        <span className={`diag-badge ${item.pass ? "ok" : "fail"}`}>
                          {item.pass ? "PASS" : "FAIL"}
                        </span>
                        <div>
                          <b>
                            {item.label}
                            {item.critical ? " (Critical)" : ""}
                          </b>
                          <small>{item.message}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="quick-edit-actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={handleFixPublishChecklist}
                      disabled={publishChecklistBusy}
                    >
                      {publishChecklistBusy ? "Fixing..." : "Fix with TitoNova Cloud Engine"}
                    </button>
                    {publishChecklist.criticalFailed && (
                      <button type="button" className="danger" onClick={handlePublishAnyway}>
                        Publish anyway
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div className="publish-log-card">
                <div className="card-header-row">
                  <h3>Publish Logs</h3>
                  {publishLogs.length > 0 && (
                    <button className="ghost small" onClick={() => setPublishLogs([])}>
                      Clear
                    </button>
                  )}
                </div>
                <div className="publish-log-list">
                  {publishLogs.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="publish-log-item">
                      <span className={`diag-badge ${entry.status === "success" ? "ok" : "fail"}`}>
                        {entry.status === "success" ? "OK" : "FAIL"}
                      </span>
                      <div>
                        <b>{entry.projectName} • {entry.action}</b>
                        <small>
                          {new Date(entry.createdAt).toLocaleString()} • {entry.message}
                        </small>
                        {typeof entry.checklistScore === "number" && (
                          <small>Checklist score: {entry.checklistScore}/100</small>
                        )}
                        {entry.url && (
                          <small>
                            <a href={entry.url} target="_blank" rel="noreferrer">
                              {entry.url}
                            </a>
                          </small>
                        )}
                      </div>
                    </div>
                  ))}
                  {publishLogs.length === 0 && (
                    <div className="empty-mini">No publish events yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="preview-panel">
          <div className="preview-header">
            <h2>Live Preview</h2>
            <p>Page-level canvas with responsive device emulation</p>
          </div>

          <div className="preview-toolbar">
            <div className="page-tabs">
              {PAGE_CONFIG.map((page) => (
                <button
                  key={page.key}
                  className={`ghost small ${previewPage === page.key ? "active" : ""}`}
                  onClick={() => setPreviewPage(page.key)}
                >
                  {page.label}
                </button>
              ))}
            </div>
            <div className="device-tabs">
              <button
                className={`ghost small ${previewDevice === "desktop" ? "active" : ""}`}
                onClick={() => setPreviewDevice("desktop")}
              >
                Desktop
              </button>
              <button
                className={`ghost small ${previewDevice === "tablet" ? "active" : ""}`}
                onClick={() => setPreviewDevice("tablet")}
              >
                Tablet
              </button>
              <button
                className={`ghost small ${previewDevice === "mobile" ? "active" : ""}`}
                onClick={() => setPreviewDevice("mobile")}
              >
                Mobile
              </button>
            </div>
          </div>

          <div className="preview-tools">
            <button className="ghost" onClick={() => setIsInlineEditing((prev) => !prev)}>
              {isInlineEditing ? "Stop inline edit" : "Inline edit"}
            </button>
            {isInlineEditing && (
              <button onClick={handleSaveInlineEdits}>Save edits to {previewPage}</button>
            )}
            <button className="ghost" onClick={() => setShowAdvancedEditor((prev) => !prev)}>
              {showAdvancedEditor ? "Hide advanced editor" : "Show advanced editor"}
            </button>
          </div>

          {activeProjectId && (
            <div className="tool-block quick-edit-flow">
              <h3>Quick Edit</h3>
              <p className="muted">Step {quickEditStep} of 3</p>
              {quickEditStep === 1 && (
                <div className="quick-step-block">
                  <strong>Step 1: Choose page</strong>
                  <div className="quick-page-pills">
                    {PAGE_CONFIG.map((page) => (
                      <button
                        key={`quick-page-${page.key}`}
                        type="button"
                        className={`ghost small ${previewPage === page.key ? "active" : ""}`}
                        onClick={() => setPreviewPage(page.key)}
                      >
                        {page.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {quickEditStep === 2 && (
                <div className="quick-step-block">
                  <strong>Step 2: Edit copy</strong>
                  <div className="quick-ai-row">
                    <select
                      value={quickRewriteTone}
                      onChange={(event) => setQuickRewriteTone(event.target.value)}
                    >
                      {TONES.map((item) => (
                        <option key={`quick-tone-${item}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="ghost" onClick={handleRewriteQuickEditWithAi} disabled={quickAiBusy}>
                      {quickAiBusy ? "Rewriting..." : "Rewrite with TitoNova Cloud Engine"}
                    </button>
                  </div>
                  <div className="quick-edit-grid">
                    <div>
                      <input
                        placeholder="Main headline"
                        value={quickEditFields.headline}
                        onChange={(event) =>
                          setQuickEditFields((prev) => ({ ...prev, headline: event.target.value }))
                        }
                      />
                      <small className={`char-hint ${quickEditFields.headline.length > 65 ? "warn" : ""}`}>
                        {quickEditFields.headline.length}/65 recommended
                      </small>
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Supporting paragraph / subhead"
                        value={quickEditFields.subhead}
                        onChange={(event) =>
                          setQuickEditFields((prev) => ({ ...prev, subhead: event.target.value }))
                        }
                      />
                      <small className={`char-hint ${quickEditFields.subhead.length > 180 ? "warn" : ""}`}>
                        {quickEditFields.subhead.length}/180 recommended
                      </small>
                    </div>
                    <div>
                      <input
                        placeholder="Primary button text (CTA)"
                        value={quickEditFields.cta}
                        onChange={(event) =>
                          setQuickEditFields((prev) => ({ ...prev, cta: event.target.value }))
                        }
                      />
                      <small className={`char-hint ${quickEditFields.cta.length > 28 ? "warn" : ""}`}>
                        {quickEditFields.cta.length}/28 recommended
                      </small>
                    </div>
                  </div>
                  {quickAiSuggestion && (
                    <div className="quick-diff-item">
                      <b>TitoNova Cloud Engine suggestion {quickAiSuggestion.model ? `(${quickAiSuggestion.model})` : ""}</b>
                      <small>Headline: {quickAiSuggestion.headline || "(empty)"}</small>
                      <small>Subhead: {quickAiSuggestion.subhead || "(empty)"}</small>
                      <small>CTA: {quickAiSuggestion.cta || "(empty)"}</small>
                      <button type="button" className="ghost small" onClick={handleAcceptQuickAiRewrite}>
                        Accept TitoNova Cloud Engine Rewrite
                      </button>
                    </div>
                  )}
                  <div className="section-rewrite-card">
                    <strong>Section Rewrite</strong>
                    <p className="muted">Pick one section, rewrite only that section, then apply.</p>
                    <div className="preset-chip-row">
                      {REWRITE_PRESETS.map((preset) => (
                        <button
                          key={`preset-${preset.key}`}
                          type="button"
                          className={`ghost small ${sectionRewritePreset === preset.key ? "active" : ""}`}
                          onClick={() => {
                            setSectionRewritePreset(preset.key);
                            setApplySectionToMatchingPages(true);
                            handleRewriteSectionWithAi(preset.key);
                          }}
                          disabled={sectionAiBusy || sectionOptionsForPage.length === 0}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="quick-ai-row">
                      <select
                        value={sectionRewriteTarget}
                        onChange={(event) => setSectionRewriteTarget(event.target.value)}
                      >
                        {sectionOptionsForPage.map((item) => (
                          <option key={`section-option-${item.key}`} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => handleRewriteSectionWithAi(sectionRewritePreset)}
                        disabled={sectionAiBusy || sectionOptionsForPage.length === 0}
                      >
                        {sectionAiBusy ? "Rewriting section..." : "TitoNova Cloud Engine Rewrite Section"}
                      </button>
                    </div>
                    {sectionDiffRows.length > 0 && (
                      <div className="section-diff-grid">
                        <article className="quick-diff-item">
                          <b>Before</b>
                          {sectionDiffRows.map((row) => (
                            <small key={`before-${row.key}`}>
                              {row.key}: {row.before || "(empty)"}
                            </small>
                          ))}
                        </article>
                        <article className="quick-diff-item">
                          <b>
                            After
                            {sectionAiSuggestion?.__model ? ` (${sectionAiSuggestion.__model})` : ""}
                          </b>
                          {sectionDiffRows.map((row) => (
                            <small key={`after-${row.key}`}>
                              {row.key}: {row.after || "(empty)"}
                            </small>
                          ))}
                        </article>
                      </div>
                    )}
                    <label className="mini-toggle">
                      <input
                        type="checkbox"
                        checked={applySectionToMatchingPages}
                        onChange={(event) => setApplySectionToMatchingPages(event.target.checked)}
                      />
                      Apply to matching sections across all pages
                    </label>
                    {applySectionToMatchingPages && (
                      <div className="section-confirm-list">
                        <b>
                          Affected pages ({sectionMatchingPages.length})
                        </b>
                        {sectionMatchingPages.map((pageKey) => (
                          <small key={`section-page-${pageKey}`}>
                            {PAGE_CONFIG.find((page) => page.key === pageKey)?.label || pageKey}
                          </small>
                        ))}
                        {sectionMatchingPages.length === 0 && (
                          <small>No matching sections detected.</small>
                        )}
                        <small>
                          Impact preview: {impactedFieldCount} field changes
                        </small>
                      </div>
                    )}
                    {!applySectionToMatchingPages && (
                      <div className="section-confirm-list">
                        <b>Affected pages (1)</b>
                        <small>
                          {PAGE_CONFIG.find((page) => page.key === previewPage)?.label || previewPage}
                        </small>
                        <small>Impact preview: {impactedFieldCount} field changes</small>
                      </div>
                    )}
                    <div className="quick-edit-actions">
                      <button
                        type="button"
                        onClick={handleApplySectionRewrite}
                        disabled={!sectionAiSuggestion || (applySectionToMatchingPages && sectionMatchingPages.length === 0)}
                      >
                        {applySectionToMatchingPages
                          ? `Apply to Matching Pages (${impactedFieldCount})`
                          : `Apply Section Change (${impactedFieldCount})`}
                      </button>
                      <button
                        type="button"
                        className="ghost"
                        onClick={handleUndoSectionRewrite}
                        disabled={!lastSectionUndo}
                      >
                        Undo Section Change
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {quickEditStep === 3 && (
                <div className="quick-step-block">
                  <strong>Step 3: Preview diff and apply</strong>
                  <div className="quick-diff-list">
                    {quickEditDiffRows.map((row) => (
                      <div key={`quick-diff-${row.label}`} className="quick-diff-item">
                        <b>{row.label}</b>
                        <small>Before: {row.before}</small>
                        <small>After: {row.after}</small>
                      </div>
                    ))}
                  </div>
                  <label className="mini-toggle">
                    <input
                      type="checkbox"
                      checked={quickApplyAllPages}
                      onChange={(event) => setQuickApplyAllPages(event.target.checked)}
                    />
                    Apply same text to all pages
                  </label>
                </div>
              )}
              <div className="quick-edit-actions">
                {quickEditStep > 1 && (
                  <button type="button" className="ghost" onClick={() => setQuickEditStep((prev) => prev - 1)}>
                    Back
                  </button>
                )}
                {quickEditStep < 3 && (
                  <button type="button" onClick={() => setQuickEditStep((prev) => prev + 1)}>
                    Next
                  </button>
                )}
                {quickEditStep === 3 && (
                  <button onClick={handleApplyQuickEdits} disabled={!quickEditHasChanges}>
                    Apply Quick Edit
                  </button>
                )}
                {lastQuickEditUndo && (
                  <button type="button" className="ghost" onClick={handleUndoQuickEdit}>
                    Undo last quick edit
                  </button>
                )}
              </div>
              {quickEditStatus && <div className="llm-status">{quickEditStatus}</div>}
            </div>
          )}

          {activeProject && showAdvancedEditor && (
            <div className="advanced-tools">
              <div className="tool-block">
                <h3>Global Replace</h3>
                <div className="replace-grid">
                  <input
                    placeholder="Find text..."
                    value={replaceFrom}
                    onChange={(event) => setReplaceFrom(event.target.value)}
                  />
                  <input
                    placeholder="Replace with..."
                    value={replaceTo}
                    onChange={(event) => setReplaceTo(event.target.value)}
                  />
                </div>
                <label className="mini-toggle">
                  <input
                    type="checkbox"
                    checked={replaceCaseSensitive}
                    onChange={(event) => setReplaceCaseSensitive(event.target.checked)}
                  />
                  Case-sensitive
                </label>
                <button className="ghost" onClick={handleGlobalReplace}>
                  Apply to all pages
                </button>
              </div>

              <div className="tool-block">
                <h3>Block Editor</h3>
                <div className="snapshot-row">
                  <select
                    value={selectedBlockTemplate}
                    onChange={(event) => setSelectedBlockTemplate(event.target.value)}
                  >
                    {Object.entries(BLOCK_TEMPLATES).map(([key, block]) => (
                      <option key={key} value={key}>
                        {block.label}
                      </option>
                    ))}
                  </select>
                  <button className="ghost" onClick={handleInsertSectionAtEnd}>
                    Insert At End
                  </button>
                </div>
                <div className="version-list">
                  {pageSections.map((section) => (
                    <div key={`${previewPage}-${section.index}`} className="version-item block-item">
                      <span>{section.title}</span>
                      <small>Section {section.index + 1}</small>
                      <div className="block-actions">
                        <button
                          className="ghost small"
                          onClick={() => handleMoveSection(section.index, "up")}
                        >
                          Up
                        </button>
                        <button
                          className="ghost small"
                          onClick={() => handleMoveSection(section.index, "down")}
                        >
                          Down
                        </button>
                        <button
                          className="ghost small"
                          onClick={() => handleDuplicateSection(section.index)}
                        >
                          Duplicate
                        </button>
                        <button
                          className="ghost small"
                          onClick={() => handleInsertSectionBelow(section.index)}
                        >
                          Insert Below
                        </button>
                        <button
                          className="ghost small"
                          onClick={() => handleRemoveSection(section.index)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  {pageSections.length === 0 && (
                    <div className="empty-mini">No editable sections found on this page.</div>
                  )}
                </div>
              </div>

              <div className="tool-block">
                <h3>Image Uploads</h3>
                <div className="upload-grid">
                  <select
                    value={imageUploadTarget}
                    onChange={(event) => setImageUploadTarget(event.target.value)}
                  >
                    {IMAGE_UPLOAD_TARGETS.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <label className="mini-toggle">
                    <input
                      type="checkbox"
                      checked={applyUploadToAllPages}
                      onChange={(event) => setApplyUploadToAllPages(event.target.checked)}
                    />
                    Apply to all pages
                  </label>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => imageUploadInputRef.current?.click()}
                  >
                    Choose image file
                  </button>
                  <input
                    ref={imageUploadInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden-input"
                    onChange={handleUploadImage}
                  />
                  <div
                    className={`upload-dropzone ${isImageDropActive ? "active" : ""}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setIsImageDropActive(true);
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      setIsImageDropActive(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      setIsImageDropActive(false);
                    }}
                    onDrop={handleUploadDrop}
                  >
                    Drag and drop image here
                  </div>
                </div>
                <small className="muted">
                  Images are compressed in-browser, embedded into page HTML, and included in export/publish.
                </small>
                {imageUploadStatus && <div className="llm-status">{imageUploadStatus}</div>}
              </div>

              <div className="tool-block">
                <h3>Version History</h3>
                <div className="snapshot-row">
                  <input
                    placeholder="Snapshot note..."
                    value={versionNote}
                    onChange={(event) => setVersionNote(event.target.value)}
                  />
                  <button className="ghost" onClick={handleCreateSnapshot}>
                    Save Snapshot
                  </button>
                </div>
                <div className="version-list">
                  {(activeProject.versions || []).slice(0, 6).map((version) => (
                    <div key={version.id} className="version-item">
                      <span>{version.note}</span>
                      <small>{new Date(version.createdAt).toLocaleString()}</small>
                      <button className="ghost small" onClick={() => handleRestoreVersion(version.id)}>
                        Restore
                      </button>
                    </div>
                  ))}
                  {(activeProject.versions || []).length === 0 && (
                    <div className="empty-mini">No snapshots yet.</div>
                  )}
                </div>
              </div>

              {siteAudit && (
                <div className="tool-block">
                  <h3>SEO & A11y Audit</h3>
                  <div className="audit-score">Score: {siteAudit.score}/100</div>
                  <div className="audit-grid">
                    <span>Words: {siteAudit.metrics.totalWords}</span>
                    <span>Links: {siteAudit.metrics.totalLinks}</span>
                    <span>CTA mentions: {siteAudit.metrics.ctaCount}</span>
                    <span>Missing meta: {siteAudit.metrics.missingMeta}</span>
                    <span>Heading issues: {siteAudit.metrics.headingIssues}</span>
                    <span>Missing alt: {siteAudit.metrics.missingAlt}</span>
                  </div>
                </div>
              )}

              {siteAudit && (
                <div className="tool-block">
                  <div className="card-header-row">
                    <h3>Smart Optimization</h3>
                    <button
                      className="ghost small"
                      type="button"
                      onClick={handleRunAllInsights}
                      disabled={smartInsights.length === 0}
                    >
                      Apply All
                    </button>
                  </div>
                  {smartInsights.length === 0 ? (
                    <div className="empty-mini">No optimization actions recommended.</div>
                  ) : (
                    <div className="insight-list">
                      {smartInsights.map((insight) => (
                        <div key={insight.key} className="version-item insight-item">
                          <span>{insight.label}</span>
                          <small>{insight.description}</small>
                          <button
                            className="ghost small"
                            type="button"
                            onClick={() => applyInsight(insight.key)}
                          >
                            Apply
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {insightMessage && <div className="llm-status">{insightMessage}</div>}
                </div>
              )}
            </div>
          )}

          <div className={`preview-frame device-${previewDevice}`}>
            <div className="preview-browser">
              <div className="preview-browser-chrome">
                <div className="preview-browser-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="preview-browser-address">{previewAddress}</div>
                <div className="preview-browser-meta">
                  <span>{previewPageLabel}</span>
                  <span>{previewDevice}</span>
                </div>
              </div>
              {previewHtml ? (
                <iframe
                  ref={iframeRef}
                  title="Website preview"
                  srcDoc={isInlineEditing ? editableHtml : previewHtml}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              ) : (
                <div className="preview-empty">Generate a website to preview your draft here.</div>
              )}
            </div>
          </div>
        </aside>
      </main>

      {showAuthModal && (
        <div className="modal-overlay">
          <div className="signup-modal">
            {isSignedIn ? (
              <>
                <h3>Account</h3>
                <p>Local profile mode is active on this browser only.</p>
                <input type="email" value={email} readOnly />
                <div className="modal-actions">
                  <button onClick={handleSignout}>Sign out</button>
                  <button className="ghost" onClick={() => setShowAuthModal(false)}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Continue with local profile</h3>
                <p>This mode stores profile data in this browser, not a secure backend.</p>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(normalizeEmail(event.target.value))}
                  placeholder="Email"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password (local only)"
                />
                <div className="modal-actions">
                  <button onClick={handleSignup}>Continue Locally</button>
                  <button className="ghost" onClick={() => setShowAuthModal(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
