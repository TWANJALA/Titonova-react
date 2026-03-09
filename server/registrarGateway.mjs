import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import dns from "node:dns/promises";

const PORT = Number(process.env.REGISTRAR_GATEWAY_PORT || 8787);
const GATEWAY_TOKEN = process.env.REGISTRAR_GATEWAY_TOKEN || "";
const HOST_BASE_URL = process.env.HOST_BASE_URL || `http://localhost:${PORT}`;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5173/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOSTED_ROOT = path.resolve(__dirname, "../hosted-sites");
const DATA_ROOT = path.resolve(__dirname, "../server-data");
const DATA_FILE = path.join(DATA_ROOT, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-me";
const JWT_EXPIRES_SECONDS = Number(process.env.JWT_EXPIRES_SECONDS || 60 * 60 * 24 * 7);
const OPENAI_API_KEY = String(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = String(process.env.OPENAI_MODEL || "gpt-5-mini").trim();
const STRIPE_SECRET_KEY = String(process.env.STRIPE_SECRET_KEY || "").trim();
const STRIPE_WEBHOOK_SECRET = String(process.env.STRIPE_WEBHOOK_SECRET || "").trim();

const BRIDGE_URLS = {
  namecheap: process.env.NAMECHEAP_ADAPTER_URL || "",
  godaddy: process.env.GODADDY_ADAPTER_URL || "",
  cloudflare: process.env.CLOUDFLARE_ADAPTER_URL || "",
};

const NAMECHEAP_CONFIG = {
  apiUser: process.env.NAMECHEAP_API_USER || "",
  apiKey: process.env.NAMECHEAP_API_KEY || "",
  userName: process.env.NAMECHEAP_USERNAME || "",
  clientIp: process.env.NAMECHEAP_CLIENT_IP || "",
  sandbox: String(process.env.NAMECHEAP_SANDBOX || "").toLowerCase() === "true",
  years: Number(process.env.NAMECHEAP_DEFAULT_YEARS || 1),
};

const NAMECHEAP_CONTACT_PROFILE = {
  firstName: process.env.NAMECHEAP_CONTACT_FIRST_NAME || "",
  lastName: process.env.NAMECHEAP_CONTACT_LAST_NAME || "",
  address1: process.env.NAMECHEAP_CONTACT_ADDRESS1 || "",
  city: process.env.NAMECHEAP_CONTACT_CITY || "",
  stateProvince: process.env.NAMECHEAP_CONTACT_STATE || "",
  postalCode: process.env.NAMECHEAP_CONTACT_POSTAL_CODE || "",
  country: process.env.NAMECHEAP_CONTACT_COUNTRY || "",
  phone: process.env.NAMECHEAP_CONTACT_PHONE || "",
  emailAddress: process.env.NAMECHEAP_CONTACT_EMAIL || "",
  organizationName: process.env.NAMECHEAP_CONTACT_ORG || "",
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};
const DEFAULT_DOMAIN_DNS_RECORDS = [
  { type: "A", host: "@", value: "76.76.21.21" },
  { type: "CNAME", host: "www", value: "cname.vercel-dns.com" },
];
const REQUIRED_DOMAIN_RECORDS = {
  A: "76.76.21.21",
  CNAME: "cname.vercel-dns.com",
};
const loginAttemptMap = new Map();
let prismaClientSingleton = null;
const PLAN_DEFS = {
  free: { key: "free", label: "Free", monthlyPrice: 0, generationLimit: 10, maxProjects: 3, maxMembers: 1 },
  pro: { key: "pro", label: "Pro", monthlyPrice: 29, generationLimit: 300, maxProjects: 50, maxMembers: 5 },
  agency: { key: "agency", label: "Agency", monthlyPrice: 99, generationLimit: 5000, maxProjects: 500, maxMembers: 50 },
};
const WORKSPACE_ROLES = ["owner", "admin", "editor", "viewer"];
const ADMIN_APPROVAL_PENDING = "pending-admin-approval";
const ADMIN_APPROVAL_APPROVED = "admin-approved";

const nowIso = () => new Date().toISOString();

const sanitizeEmail = (value) => String(value || "").trim().toLowerCase();
const SUPER_ADMIN_EMAILS = new Set(
  String(process.env.SUPER_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => sanitizeEmail(value))
    .filter(Boolean)
);
const isSuperAdminEmail = (email) => SUPER_ADMIN_EMAILS.has(sanitizeEmail(email));
const isUserApproved = (user) =>
  isSuperAdminEmail(user?.email) ||
  String(user?.email_verify_token || "").trim() === ADMIN_APPROVAL_APPROVED;
const userApprovalStatus = (user) => (isUserApproved(user) ? "approved" : "pending");

const safeJsonParse = (value, fallback = {}) => {
  try {
    return JSON.parse(String(value || ""));
  } catch {
    return fallback;
  }
};

const ensureDataStore = async () => {
  await fs.mkdir(DATA_ROOT, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify({ users: [], projects: [], websites: [], workspaces: [], workspace_members: [], subscriptions: [], generation_events: [] }, null, 2),
      "utf8"
    );
  }
};

const getPrismaClient = async () => {
  const usePrisma = String(process.env.PRISMA_ENABLE || "").toLowerCase() === "true";
  if (!usePrisma) return null;
  if (prismaClientSingleton) return prismaClientSingleton;
  try {
    const mod = await import("@prisma/client");
    const PrismaClient = mod?.PrismaClient;
    if (!PrismaClient) return null;
    prismaClientSingleton = new PrismaClient();
    return prismaClientSingleton;
  } catch {
    return null;
  }
};

const readDb = async () => {
  await ensureDataStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = safeJsonParse(raw, {});
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    websites: Array.isArray(parsed.websites) ? parsed.websites : [],
    workspaces: Array.isArray(parsed.workspaces) ? parsed.workspaces : [],
    workspace_members: Array.isArray(parsed.workspace_members) ? parsed.workspace_members : [],
    subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
    generation_events: Array.isArray(parsed.generation_events) ? parsed.generation_events : [],
  };
};

const writeDb = async (db) => {
  await ensureDataStore();
  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(
      {
        users: Array.isArray(db?.users) ? db.users : [],
        projects: Array.isArray(db?.projects) ? db.projects : [],
        websites: Array.isArray(db?.websites) ? db.websites : [],
        workspaces: Array.isArray(db?.workspaces) ? db.workspaces : [],
        workspace_members: Array.isArray(db?.workspace_members) ? db.workspace_members : [],
        subscriptions: Array.isArray(db?.subscriptions) ? db.subscriptions : [],
        generation_events: Array.isArray(db?.generation_events) ? db.generation_events : [],
      },
      null,
      2
    ),
    "utf8"
  );
};

const base64UrlEncode = (value) =>
  Buffer.from(String(value || ""), "utf8").toString("base64url");

const base64UrlDecode = (value) =>
  Buffer.from(String(value || ""), "base64url").toString("utf8");

const signJwt = (payload) => {
  const header = { alg: "HS256", typ: "JWT" };
  const issuedAt = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + Math.max(60, JWT_EXPIRES_SECONDS),
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(claims));
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(toSign).digest("base64url");
  return `${toSign}.${signature}`;
};

const verifyJwt = (token) => {
  const text = String(token || "").trim();
  const [encodedHeader, encodedPayload, signature] = text.split(".");
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error("Invalid token format");
  }
  const toSign = `${encodedHeader}.${encodedPayload}`;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(toSign).digest("base64url");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    throw new Error("Invalid token signature");
  }
  const payload = safeJsonParse(base64UrlDecode(encodedPayload), null);
  if (!payload || typeof payload !== "object") throw new Error("Invalid token payload");
  if (!Number.isFinite(payload.exp) || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return payload;
};

const hashPassword = (plain) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(plain || ""), salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
};

const verifyPassword = (plain, storedHash) => {
  const value = String(storedHash || "");
  const [, salt, expected] = value.split("$");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(String(plain || ""), salt, 64).toString("hex");
  const a = Buffer.from(actual, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  email_verified: Boolean(user.email_verified),
  is_super_admin: isSuperAdminEmail(user.email),
  is_approved: isUserApproved(user),
  approval_status: userApprovalStatus(user),
  active_workspace_id: user.active_workspace_id || null,
  created_at: user.created_at,
});

const getBearerToken = (req, payload = {}) => {
  const auth = String(req.headers.authorization || "");
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  if (payload?.token) return String(payload.token || "").trim();
  return "";
};

const requireUser = async (req, payload = {}) => {
  const token = getBearerToken(req, payload);
  if (!token) {
    const error = new Error("Authentication required");
    error.statusCode = 401;
    throw error;
  }
  let claims;
  try {
    claims = verifyJwt(token);
  } catch {
    const error = new Error("Invalid or expired session");
    error.statusCode = 401;
    throw error;
  }
  const prisma = await getPrismaClient();
  let user = null;
  let db = null;
  if (prisma) {
    user = await prisma.user.findUnique({ where: { id: claims.user_id } });
  } else {
    db = await readDb();
    user = db.users.find((item) => item.id === claims.user_id);
  }
  if (!user) {
    const error = new Error("User session no longer valid");
    error.statusCode = 401;
    throw error;
  }
  if (!isUserApproved(user)) {
    const error = new Error("Account pending super admin approval.");
    error.statusCode = 403;
    throw error;
  }
  return { user, claims, db, prisma, token };
};

const applyLoginRateLimit = (req, email) => {
  const ip = String(req.socket?.remoteAddress || "unknown");
  const key = `${sanitizeEmail(email)}::${ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 12;
  const record = loginAttemptMap.get(key) || { count: 0, start: now };
  if (now - record.start > windowMs) {
    loginAttemptMap.set(key, { count: 1, start: now });
    return;
  }
  if (record.count >= maxAttempts) {
    const error = new Error("Too many login attempts. Try again in a few minutes.");
    error.statusCode = 429;
    throw error;
  }
  loginAttemptMap.set(key, { ...record, count: record.count + 1 });
};

const getPlanByKey = (key) => PLAN_DEFS[String(key || "").toLowerCase()] || PLAN_DEFS.free;

const getLatestSubscription = (subscriptions, userId) =>
  [...(subscriptions || [])]
    .filter((item) => item.user_id === userId && String(item.status || "active") === "active")
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))[0] || null;

const toStartOfDayIso = () => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
};

const summarizeBillingStatus = ({ planKey, generationEvents = [], projects = [] }) => {
  const plan = getPlanByKey(planKey);
  const startOfDay = toStartOfDayIso();
  const usedToday = generationEvents.filter((item) => String(item.created_at || "") >= startOfDay).length;
  const remaining = Math.max(0, plan.generationLimit - usedToday);
  return {
    plan,
    limits: {
      generationsPerDay: plan.generationLimit,
      projects: plan.maxProjects,
      members: plan.maxMembers,
    },
    usage: {
      generationsToday: usedToday,
      generationsRemaining: remaining,
      projectCount: projects.length,
    },
    canGenerate: remaining > 0,
    canCreateProject: projects.length < plan.maxProjects,
  };
};

const sendJson = (res, status, payload) => {
  const data = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, x-registrar-token, authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(data);
};

const sendText = (res, status, body, contentType = "text/plain; charset=utf-8") => {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
};

const sendRedirect = (res, status, location) => {
  res.writeHead(status, {
    Location: location,
    "Access-Control-Allow-Origin": "*",
  });
  res.end();
};

const readJsonBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("Invalid JSON payload");
  }
};

const readRawBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

const verifyStripeSignature = (rawBody, signatureHeader, secret) => {
  const header = String(signatureHeader || "");
  const parts = Object.fromEntries(
    header
      .split(",")
      .map((entry) => entry.trim().split("="))
      .filter(([k, v]) => k && v)
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  const payload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const openAiGenerateJson = async (prompt) => {
  if (!OPENAI_API_KEY) {
    const error = new Error("OPENAI_API_KEY is not configured on server.");
    error.statusCode = 503;
    throw error;
  }
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Return valid JSON only. No markdown, no backticks. Include pages, layout, sections, components keys when requested.",
        },
        { role: "user", content: String(prompt || "").trim() },
      ],
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      String(payload?.error?.message || `OpenAI request failed (${response.status})`)
    );
    error.statusCode = response.status;
    throw error;
  }
  const outputText = Array.isArray(payload?.output)
    ? payload.output
        .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
        .map((content) => String(content?.text || ""))
        .join("")
        .trim()
    : "";
  return outputText || "{}";
};

const createStripeCheckoutSession = async ({ user, plan }) => {
  if (!STRIPE_SECRET_KEY) {
    const error = new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
    error.statusCode = 503;
    throw error;
  }
  const amountCents = Math.max(100, Math.round(Number(plan.monthlyPrice || 0) * 100));
  const appBase = String(APP_BASE_URL || HOST_BASE_URL).replace(/\/$/, "");
  const body = new URLSearchParams({
    mode: "subscription",
    success_url: `${appBase}/dashboard?billing=success&plan=${plan.key}`,
    cancel_url: `${appBase}/dashboard?billing=cancel&plan=${plan.key}`,
    "metadata[user_id]": String(user.id),
    "metadata[plan]": String(plan.key),
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(amountCents),
    "line_items[0][price_data][recurring][interval]": "month",
    "line_items[0][price_data][product_data][name]": `TitoNova ${plan.label} Plan`,
    "line_items[0][quantity]": "1",
    customer_email: String(user.email || ""),
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(String(payload?.error?.message || `Stripe checkout failed (${response.status})`));
    error.statusCode = response.status;
    throw error;
  }
  return payload;
};

const hasDomainAttachProvider = () =>
  Boolean(
    String(BRIDGE_URLS.cloudflare || "").trim() ||
      String(process.env.CLOUDFLARE_API_TOKEN || "").trim()
  );

const verifyDomainDnsRecords = async (domain) => {
  const normalized = String(domain || "").trim().toLowerCase();
  const findings = [];
  let rootA = [];
  let wwwCname = [];
  try {
    rootA = await dns.resolve4(normalized);
  } catch {
    rootA = [];
  }
  try {
    wwwCname = await dns.resolveCname(`www.${normalized}`);
  } catch {
    wwwCname = [];
  }
  const aMatch = rootA.includes(REQUIRED_DOMAIN_RECORDS.A);
  const cnameMatch = wwwCname.some(
    (value) =>
      String(value || "").replace(/\.$/, "").toLowerCase() ===
      REQUIRED_DOMAIN_RECORDS.CNAME.toLowerCase()
  );
  findings.push({ type: "A", host: "@", expected: REQUIRED_DOMAIN_RECORDS.A, actual: rootA, pass: aMatch });
  findings.push({
    type: "CNAME",
    host: "www",
    expected: REQUIRED_DOMAIN_RECORDS.CNAME,
    actual: wwwCname,
    pass: cnameMatch,
  });
  return {
    verified: aMatch && cnameMatch,
    checks: findings,
  };
};

const hash = (value) =>
  [...String(value || "")].reduce((acc, ch) => acc + ch.charCodeAt(0) * 17, 13);

const hasNamecheapCredentials = () =>
  Boolean(
    NAMECHEAP_CONFIG.apiUser &&
      NAMECHEAP_CONFIG.apiKey &&
      NAMECHEAP_CONFIG.userName &&
      NAMECHEAP_CONFIG.clientIp
  );

const hasNamecheapContactProfile = () =>
  Boolean(
    NAMECHEAP_CONTACT_PROFILE.firstName &&
      NAMECHEAP_CONTACT_PROFILE.lastName &&
      NAMECHEAP_CONTACT_PROFILE.address1 &&
      NAMECHEAP_CONTACT_PROFILE.city &&
      NAMECHEAP_CONTACT_PROFILE.stateProvince &&
      NAMECHEAP_CONTACT_PROFILE.postalCode &&
      NAMECHEAP_CONTACT_PROFILE.country &&
      NAMECHEAP_CONTACT_PROFILE.phone &&
      NAMECHEAP_CONTACT_PROFILE.emailAddress
  );

const NAMECHEAP_PRICE_BY_TLD = {
  ".com": 14.99,
  ".net": 16.49,
  ".org": 15.99,
  ".io": 39,
  ".co": 24,
  ".ai": 79,
  ".app": 18.49,
  ".dev": 14.99,
  ".studio": 29,
};

const priceForDomain = (domain) => {
  const tld = `.${String(domain || "").split(".").pop() || ""}`.toLowerCase();
  return NAMECHEAP_PRICE_BY_TLD[tld] || 19.99;
};

const decodeXml = (value) =>
  String(value || "")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

const parseXmlAttributes = (raw) => {
  const attrs = {};
  const regex = /([A-Za-z0-9:_-]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(raw))) {
    attrs[match[1]] = decodeXml(match[2]);
  }
  return attrs;
};

const extractApiErrors = (xml) => {
  const errors = [];
  const regex = /<Error\b[^>]*>([\s\S]*?)<\/Error>/g;
  let match;
  while ((match = regex.exec(xml))) {
    const value = decodeXml(match[1]).trim();
    if (value) errors.push(value);
  }
  return errors;
};

const extractTextTag = (xml, tagName) => {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? decodeXml(match[1]).trim() : "";
};

const namecheapApiUrl = () =>
  NAMECHEAP_CONFIG.sandbox
    ? "https://api.sandbox.namecheap.com/xml.response"
    : "https://api.namecheap.com/xml.response";

const callNamecheap = async (command, extraParams = {}) => {
  if (!hasNamecheapCredentials()) {
    const error = new Error(
      "Namecheap credentials are missing. Set NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME, NAMECHEAP_CLIENT_IP."
    );
    error.statusCode = 400;
    throw error;
  }

  const params = new URLSearchParams({
    ApiUser: NAMECHEAP_CONFIG.apiUser,
    ApiKey: NAMECHEAP_CONFIG.apiKey,
    UserName: NAMECHEAP_CONFIG.userName,
    ClientIp: NAMECHEAP_CONFIG.clientIp,
    Command: command,
    ...Object.fromEntries(
      Object.entries(extraParams)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ),
  });

  const response = await fetch(`${namecheapApiUrl()}?${params.toString()}`);
  const xml = await response.text();

  if (!response.ok) {
    const error = new Error(`Namecheap API HTTP ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  const statusAttr = (xml.match(/<ApiResponse\b[^>]*Status="([^"]+)"/i) || [])[1] || "";
  if (statusAttr.toUpperCase() !== "OK") {
    const errors = extractApiErrors(xml);
    const error = new Error(errors[0] || "Namecheap API returned non-OK status");
    error.statusCode = 400;
    throw error;
  }

  return xml;
};

const buildNamecheapContactParams = () => {
  if (!hasNamecheapContactProfile()) {
    const error = new Error(
      "Namecheap contact profile is incomplete. Set NAMECHEAP_CONTACT_FIRST_NAME, LAST_NAME, ADDRESS1, CITY, STATE, POSTAL_CODE, COUNTRY, PHONE, EMAIL."
    );
    error.statusCode = 400;
    throw error;
  }

  const contactKeys = ["Registrant", "Tech", "Admin", "AuxBilling"];
  const params = {};

  contactKeys.forEach((prefix) => {
    params[`${prefix}FirstName`] = NAMECHEAP_CONTACT_PROFILE.firstName;
    params[`${prefix}LastName`] = NAMECHEAP_CONTACT_PROFILE.lastName;
    params[`${prefix}Address1`] = NAMECHEAP_CONTACT_PROFILE.address1;
    params[`${prefix}City`] = NAMECHEAP_CONTACT_PROFILE.city;
    params[`${prefix}StateProvince`] = NAMECHEAP_CONTACT_PROFILE.stateProvince;
    params[`${prefix}PostalCode`] = NAMECHEAP_CONTACT_PROFILE.postalCode;
    params[`${prefix}Country`] = NAMECHEAP_CONTACT_PROFILE.country;
    params[`${prefix}Phone`] = NAMECHEAP_CONTACT_PROFILE.phone;
    params[`${prefix}EmailAddress`] = NAMECHEAP_CONTACT_PROFILE.emailAddress;
    if (NAMECHEAP_CONTACT_PROFILE.organizationName) {
      params[`${prefix}OrganizationName`] = NAMECHEAP_CONTACT_PROFILE.organizationName;
    }
  });

  return params;
};

const namecheapActions = {
  health: async () => {
    const xml = await callNamecheap("namecheap.users.getBalances");
    const available = extractTextTag(xml, "AvailableBalance");
    return {
      provider: "namecheap",
      sandbox: NAMECHEAP_CONFIG.sandbox,
      availableBalance: available || "unknown",
    };
  },

  search: async ({ keyword, tlds }) => {
    if (!keyword) throw new Error("keyword is required");
    const safeTlds = Array.isArray(tlds) && tlds.length > 0 ? tlds : [".com", ".net"];
    const domainList = safeTlds.map((tld) => `${keyword}${tld}`).join(",");

    const xml = await callNamecheap("namecheap.domains.check", {
      DomainList: domainList,
    });

    const matches = [...xml.matchAll(/<DomainCheckResult\b([^>]*)\/>/g)];
    const byDomain = new Map();

    matches.forEach((match) => {
      const attrs = parseXmlAttributes(match[1] || "");
      const domain = String(attrs.Domain || "").toLowerCase();
      if (!domain) return;
      const premiumPrice = Number(attrs.PremiumRegistrationPrice || 0);
      byDomain.set(domain, {
        name: domain,
        available: String(attrs.Available || "").toLowerCase() === "true",
        price: premiumPrice > 0 ? premiumPrice : priceForDomain(domain),
        currency: "USD",
      });
    });

    const fallback = safeTlds.map((tld) => {
      const domain = `${String(keyword || "").toLowerCase()}${String(tld || "").toLowerCase()}`;
      return (
        byDomain.get(domain) || {
          name: domain,
          available: false,
          price: priceForDomain(domain),
          currency: "USD",
        }
      );
    });

    return { domains: fallback };
  },

  purchase: async ({ domains }) => {
    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error("domains must be a non-empty array");
    }

    const years = Number.isFinite(NAMECHEAP_CONFIG.years) && NAMECHEAP_CONFIG.years > 0
      ? Math.floor(NAMECHEAP_CONFIG.years)
      : 1;
    const contact = buildNamecheapContactParams();
    const purchased = [];

    for (const domainName of domains) {
      const xml = await callNamecheap("namecheap.domains.create", {
        DomainName: domainName,
        Years: years,
        ...contact,
      });

      const charged = Number(extractTextTag(xml, "ChargedAmount") || 0);
      purchased.push({
        name: String(domainName || "").toLowerCase(),
        price: charged > 0 ? charged : Number((priceForDomain(domainName) * years).toFixed(2)),
        available: false,
        currency: "USD",
      });
    }

    return { purchased };
  },

  "seller/activate": async ({ margin }) => ({
    ok: true,
    provider: "namecheap",
    margin: Number(margin || 0),
    message: "Seller mode is managed by TitoNova inventory settings.",
  }),

  "seller/listing": async ({ domain, listed, resalePrice }) => ({
    ok: true,
    provider: "namecheap",
    listing: {
      domain,
      listed: Boolean(listed),
      resalePrice: Number(resalePrice || 0),
    },
  }),
};

const buildMockDomains = (keyword, tlds) => {
  const base = String(keyword || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalized = base || "brand";
  return tlds.map((tld, index) => {
    const name = `${normalized}${tld}`;
    const available = hash(name) % 5 !== 0;
    const basePrice = tld === ".ai" ? 79 : tld === ".io" ? 39 : 14.99;
    return {
      name,
      available,
      price: Number((basePrice + index * 0.75).toFixed(2)),
      currency: "USD",
    };
  });
};

const assertGatewayAuth = (req) => {
  if (!GATEWAY_TOKEN) return;

  const headerToken = req.headers["x-registrar-token"];
  const auth = req.headers.authorization || "";
  const bearerToken = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (headerToken !== GATEWAY_TOKEN && bearerToken !== GATEWAY_TOKEN) {
    const error = new Error("Unauthorized gateway request");
    error.statusCode = 401;
    throw error;
  }
};

const callBridge = async (provider, action, payload) => {
  const baseUrl = BRIDGE_URLS[provider];
  if (!baseUrl) {
    const error = new Error(
      `No adapter configured for ${provider}. Set ${provider.toUpperCase()}_ADAPTER_URL.`
    );
    error.statusCode = 400;
    throw error;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data?.error || `Adapter error (${response.status})`);
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

const safeSegment = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);

const safeFileName = (name) => {
  const normalized = String(name || "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error(`Invalid file path: ${name}`);
  }
  return normalized;
};

const ensureHostedRoot = async () => {
  await fs.mkdir(HOSTED_ROOT, { recursive: true });
};

const siteDir = (siteId) => path.join(HOSTED_ROOT, safeSegment(siteId || "site"));

const siteMetaPath = (siteId) => path.join(siteDir(siteId), "_site.json");

const readSiteMeta = async (siteId) => {
  try {
    const raw = await fs.readFile(siteMetaPath(siteId), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const listSiteMetas = async () => {
  await ensureHostedRoot();
  const entries = await fs.readdir(HOSTED_ROOT, { withFileTypes: true });
  const metas = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        try {
          const raw = await fs.readFile(path.join(HOSTED_ROOT, entry.name, "_site.json"), "utf8");
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
  );
  return metas.filter(Boolean).sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
};

const writeSiteMeta = async (siteId, meta) => {
  const safeId = safeSegment(siteId || "");
  if (!safeId) throw new Error("siteId is required");
  await fs.writeFile(siteMetaPath(safeId), JSON.stringify(meta, null, 2), "utf8");
};

const findSiteMetaByDomain = async (domain) => {
  const normalized = String(domain || "").trim().toLowerCase();
  if (!normalized) return null;
  const metas = await listSiteMetas();
  return metas.find((meta) => String(meta?.customDomain || "").trim().toLowerCase() === normalized) || null;
};

const hostingActions = {
  list: async () => ({
    sites: await listSiteMetas(),
  }),

  publish: async ({ siteId, projectName, customDomain, files }) => {
    const safeId = safeSegment(siteId || projectName || `site-${Date.now()}`);
    if (!safeId) throw new Error("siteId or projectName is required");
    if (!files || typeof files !== "object") throw new Error("files object is required");

    await ensureHostedRoot();
    const targetDir = siteDir(safeId);
    await fs.mkdir(targetDir, { recursive: true });

    const entries = Object.entries(files);
    if (entries.length === 0) throw new Error("At least one file is required for publish");

    for (const [name, content] of entries) {
      const safeName = safeFileName(name);
      const outputPath = path.join(targetDir, safeName);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, String(content ?? ""), "utf8");
    }

    if (!entries.some(([name]) => name === "index.html")) {
      throw new Error("index.html is required for hosted site");
    }

    const meta = {
      siteId: safeId,
      projectName: String(projectName || safeId),
      customDomain: String(customDomain || ""),
      publishedAt: new Date().toISOString(),
      fileCount: entries.length,
      url: `${HOST_BASE_URL}/sites/${safeId}/index.html`,
      provider: "gateway",
      hosting: {
        tier: "Fast Hosting",
        edge: true,
      },
      ssl: {
        enabled: true,
        status: "active",
      },
      cdn: {
        enabled: true,
        provider: "edge-cdn",
      },
      domain: {
        attached: Boolean(customDomain),
        records: DEFAULT_DOMAIN_DNS_RECORDS,
      },
    };

    await fs.writeFile(siteMetaPath(safeId), JSON.stringify(meta, null, 2), "utf8");
    return meta;
  },

  unpublish: async ({ siteId }) => {
    const safeId = safeSegment(siteId || "");
    if (!safeId) throw new Error("siteId is required");

    await fs.rm(siteDir(safeId), { recursive: true, force: true });
    return { ok: true, siteId: safeId };
  },
};

const generateActions = {
  "": async ({ prompt }) => {
    const safePrompt = String(prompt || "").trim();
    if (!safePrompt) throw new Error("prompt is required");
    const result = await openAiGenerateJson(safePrompt);
    return { ok: true, result, model: OPENAI_MODEL };
  },
};

const handleStripeWebhookEvent = async (event) => {
  if (!event || typeof event !== "object") return;
  const eventType = String(event.type || "");
  const object = event.data?.object || {};
  const metadata = object?.metadata || {};
  const userId = String(metadata?.user_id || "").trim();
  const plan = getPlanByKey(metadata?.plan || "free").key;
  const customerId = String(object?.customer || "").trim();
  const subscriptionId = String(
    object?.subscription || object?.id || ""
  ).trim();
  if (!userId) return;

  const prisma = await getPrismaClient();
  if (eventType === "checkout.session.completed") {
    if (prisma) {
      await prisma.subscription.create({
        data: {
          user_id: userId,
          plan,
          status: "active",
          stripe_customer_id: customerId || null,
          stripe_subscription_id: subscriptionId || null,
        },
      });
      return;
    }
    const db = await readDb();
    db.subscriptions.unshift({
      id: crypto.randomUUID(),
      user_id: userId,
      plan,
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      created_at: nowIso(),
    });
    await writeDb(db);
    return;
  }

  if (eventType === "customer.subscription.deleted") {
    if (prisma) {
      await prisma.subscription.create({
        data: {
          user_id: userId,
          plan: "free",
          status: "active",
          stripe_customer_id: customerId || null,
          stripe_subscription_id: subscriptionId || null,
        },
      });
      return;
    }
    const db = await readDb();
    db.subscriptions.unshift({
      id: crypto.randomUUID(),
      user_id: userId,
      plan: "free",
      status: "active",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      created_at: nowIso(),
    });
    await writeDb(db);
  }
};

const domainActions = {
  attach: async ({ domain, siteId }) => {
    const normalizedDomain = String(domain || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    const safeId = safeSegment(siteId || "");
    if (!normalizedDomain) throw new Error("domain is required");
    if (!safeId) throw new Error("siteId is required");

    const meta = await readSiteMeta(safeId);
    if (!meta) throw new Error("Hosted site not found for domain attach.");
    if (!hasDomainAttachProvider()) {
      const error = new Error(
        "Domain attach provider unavailable. Configure CLOUDFLARE_ADAPTER_URL or CLOUDFLARE_API_TOKEN."
      );
      error.statusCode = 503;
      throw error;
    }

    if (BRIDGE_URLS.cloudflare) {
      await callBridge("cloudflare", "domain/attach", {
        domain: normalizedDomain,
        siteId: safeId,
        records: DEFAULT_DOMAIN_DNS_RECORDS,
      });
    }

    const nextMeta = {
      ...meta,
      customDomain: normalizedDomain,
      domain: {
        attached: true,
        records: DEFAULT_DOMAIN_DNS_RECORDS,
      },
      ssl: {
        enabled: true,
        status: "active",
      },
      cdn: {
        enabled: true,
        provider: "edge-cdn",
      },
      provider: BRIDGE_URLS.cloudflare ? "cloudflare-bridge" : "manual-dns",
      updatedAt: new Date().toISOString(),
    };
    await writeSiteMeta(safeId, nextMeta);

    return {
      ok: true,
      provider: BRIDGE_URLS.cloudflare ? "cloudflare-bridge" : "manual-dns",
      attach: {
        domain: normalizedDomain,
        siteId: safeId,
        records: DEFAULT_DOMAIN_DNS_RECORDS,
        sslEnabled: true,
        cdnEnabled: true,
      },
      records: DEFAULT_DOMAIN_DNS_RECORDS,
      ssl: { enabled: true, status: "active" },
      cdn: { enabled: true, provider: "edge-cdn" },
      hosting: { tier: "Fast Hosting", edge: true },
    };
  },

  verify: async ({ domain }) => {
    const normalizedDomain = String(domain || "")
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    if (!normalizedDomain) throw new Error("domain is required");

    const meta = await findSiteMetaByDomain(normalizedDomain);
    const dnsCheck = await verifyDomainDnsRecords(normalizedDomain);
    const attached = Boolean(meta);
    const verified = attached && dnsCheck.verified;
    const records = Array.isArray(meta?.domain?.records) && meta.domain.records.length > 0
      ? meta.domain.records
      : DEFAULT_DOMAIN_DNS_RECORDS;

    return {
      ok: true,
      verified,
      attached,
      provider: BRIDGE_URLS.cloudflare ? "cloudflare-bridge" : "manual-dns",
      domain: normalizedDomain,
      records,
      checks: dnsCheck.checks,
      verification: {
        domain: normalizedDomain,
        records,
        sslEnabled: true,
        cdnEnabled: true,
        provider: BRIDGE_URLS.cloudflare ? "cloudflare-bridge" : "manual-dns",
      },
      ssl: { enabled: true, status: "active" },
      cdn: { enabled: true, provider: "edge-cdn" },
    };
  },
};

const registrarActions = {
  health: async ({ provider }) => {
    if (!provider) throw new Error("provider is required");

    if (provider === "mock") {
      return { ok: true, mode: "mock" };
    }

    if (provider === "namecheap" && hasNamecheapCredentials()) {
      const data = await namecheapActions.health();
      return { ok: true, mode: "native", ...data };
    }

    if (!BRIDGE_URLS[provider]) {
      return { ok: false, mode: "unconfigured", message: `${provider} adapter URL missing` };
    }

    const data = await callBridge(provider, "health", {});
    return { ok: true, mode: "bridge", ...data };
  },

  search: async ({ provider, keyword, tlds }) => {
    if (!provider) throw new Error("provider is required");
    if (!keyword) throw new Error("keyword is required");
    const safeTlds = Array.isArray(tlds) && tlds.length > 0 ? tlds : [".com", ".net"];

    if (provider === "mock") {
      return { domains: buildMockDomains(keyword, safeTlds) };
    }

    if (provider === "namecheap" && hasNamecheapCredentials()) {
      return namecheapActions.search({ keyword, tlds: safeTlds });
    }

    return callBridge(provider, "search", { keyword, tlds: safeTlds });
  },

  purchase: async ({ provider, domains }) => {
    if (!provider) throw new Error("provider is required");
    if (!Array.isArray(domains) || domains.length === 0) {
      throw new Error("domains must be a non-empty array");
    }

    if (provider === "mock") {
      return {
        purchased: domains.map((name) => ({
          name,
          price: Number((11 + (hash(name) % 50)).toFixed(2)),
          available: false,
          currency: "USD",
        })),
      };
    }

    if (provider === "namecheap" && hasNamecheapCredentials()) {
      return namecheapActions.purchase({ domains });
    }

    return callBridge(provider, "purchase", { domains });
  },

  "seller/activate": async ({ provider, margin }) => {
    if (!provider) throw new Error("provider is required");
    if (provider === "mock") {
      return { ok: true, provider, margin: Number(margin || 0) };
    }

    if (provider === "namecheap" && hasNamecheapCredentials()) {
      return namecheapActions["seller/activate"]({ margin });
    }

    return callBridge(provider, "seller/activate", { margin: Number(margin || 0) });
  },

  "seller/listing": async ({ provider, domain, listed, resalePrice }) => {
    if (!provider) throw new Error("provider is required");
    if (!domain) throw new Error("domain is required");

    if (provider === "mock") {
      return {
        ok: true,
        listing: {
          domain,
          listed: Boolean(listed),
          resalePrice: Number(resalePrice || 0),
        },
      };
    }

    if (provider === "namecheap" && hasNamecheapCredentials()) {
      return namecheapActions["seller/listing"]({ domain, listed, resalePrice });
    }

    return callBridge(provider, "seller/listing", {
      domain,
      listed: Boolean(listed),
      resalePrice: Number(resalePrice || 0),
    });
  },
};

const authActions = {
  signup: async (payload) => {
    const name = String(payload?.name || "").trim();
    const email = sanitizeEmail(payload?.email);
    const password = String(payload?.password || "");
    if (!name) throw new Error("name is required");
    if (!email || !email.includes("@")) throw new Error("valid email is required");
    if (password.length < 6) throw new Error("password must be at least 6 characters");

    const prisma = await getPrismaClient();
    let user;
    const superAdmin = isSuperAdminEmail(email);
    const approvalToken = superAdmin ? ADMIN_APPROVAL_APPROVED : ADMIN_APPROVAL_PENDING;
    if (prisma) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
      }
      user = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: hashPassword(password),
          email_verified: Boolean(superAdmin),
          email_verify_token: approvalToken,
        },
      });
      const workspace = await prisma.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          owner_user_id: user.id,
        },
      });
      await prisma.workspaceMember.create({
        data: {
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        },
      });
      await prisma.subscription.create({
        data: {
          user_id: user.id,
          plan: "free",
          status: "active",
        },
      });
      user = await prisma.user.update({
        where: { id: user.id },
        data: { active_workspace_id: workspace.id },
      });
    } else {
      const db = await readDb();
      if (db.users.some((item) => sanitizeEmail(item.email) === email)) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
      }

      user = {
        id: crypto.randomUUID(),
        name,
        email,
        password_hash: hashPassword(password),
        email_verified: Boolean(superAdmin),
        email_verify_token: approvalToken,
        active_workspace_id: "",
        created_at: nowIso(),
      };
      db.users.unshift(user);
      const workspace = {
        id: crypto.randomUUID(),
        name: `${name}'s Workspace`,
        owner_user_id: user.id,
        created_at: nowIso(),
      };
      db.workspaces.unshift(workspace);
      db.workspace_members.unshift({
        id: crypto.randomUUID(),
        workspace_id: workspace.id,
        user_id: user.id,
        role: "owner",
        created_at: nowIso(),
      });
      db.subscriptions.unshift({
        id: crypto.randomUUID(),
        user_id: user.id,
        plan: "free",
        status: "active",
        stripe_customer_id: "",
        stripe_subscription_id: "",
        created_at: nowIso(),
      });
      user.active_workspace_id = workspace.id;
      await writeDb(db);
    }

    const token = isUserApproved(user) ? signJwt({ user_id: user.id, email: user.email }) : "";
    return {
      ok: true,
      token,
      user: publicUser(user),
      requires_approval: !isUserApproved(user),
      message: isUserApproved(user)
        ? "Account created."
        : "Account created. Awaiting super admin approval before dashboard access.",
    };
  },

  login: async (payload, context) => {
    const email = sanitizeEmail(payload?.email);
    const password = String(payload?.password || "");
    if (!email || !password) {
      const error = new Error("email and password are required");
      error.statusCode = 400;
      throw error;
    }

    applyLoginRateLimit(context.req, email);
    const prisma = await getPrismaClient();
    let user;
    if (prisma) {
      user = await prisma.user.findUnique({ where: { email } });
    } else {
      const db = await readDb();
      user = db.users.find((item) => sanitizeEmail(item.email) === email);
    }
    if (!user || !verifyPassword(password, user.password_hash)) {
      const error = new Error("Invalid login");
      error.statusCode = 401;
      throw error;
    }
    if (!isUserApproved(user)) {
      const error = new Error("Account pending super admin approval.");
      error.statusCode = 403;
      throw error;
    }
    const token = signJwt({ user_id: user.id, email: user.email });
    return {
      ok: true,
      token,
      user: publicUser(user),
    };
  },

  me: async (payload, context) => {
    const { user } = await requireUser(context.req, payload);
    return { ok: true, user: publicUser(user) };
  },

  "request-email-verification": async (payload, context) => {
    const { user } = await requireUser(context.req, payload);
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    const prisma = await getPrismaClient();
    if (prisma) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email_verify_token: token, email_verify_expires_at: new Date(expiresAt) },
      });
    } else {
      const db = await readDb();
      const index = db.users.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        db.users[index] = {
          ...db.users[index],
          email_verify_token: token,
          email_verify_expires_at: expiresAt,
        };
        await writeDb(db);
      }
    }
    return {
      ok: true,
      message: "Verification email queued.",
      // Dev helper: in production, email this link and do not expose token.
      verification_url: `${HOST_BASE_URL}/verify-email?token=${token}`,
    };
  },

  "verify-email": async (payload) => {
    const token = String(payload?.token || "").trim();
    if (!token) throw new Error("token is required");
    const prisma = await getPrismaClient();
    if (prisma) {
      const user = await prisma.user.findFirst({ where: { email_verify_token: token } });
      if (!user) throw new Error("Invalid verification token");
      if (!user.email_verify_expires_at || new Date(user.email_verify_expires_at).getTime() < Date.now()) {
        throw new Error("Verification token expired");
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email_verify_token: ADMIN_APPROVAL_PENDING,
          email_verify_expires_at: null,
        },
      });
      return { ok: true, message: "Email confirmed. Awaiting super admin approval." };
    }
    const db = await readDb();
    const index = db.users.findIndex((item) => item.email_verify_token === token);
    if (index < 0) throw new Error("Invalid verification token");
    const expiresAt = new Date(db.users[index].email_verify_expires_at || 0).getTime();
    if (!expiresAt || expiresAt < Date.now()) throw new Error("Verification token expired");
    db.users[index] = {
      ...db.users[index],
      email_verify_token: ADMIN_APPROVAL_PENDING,
      email_verify_expires_at: "",
    };
    await writeDb(db);
    return { ok: true, message: "Email confirmed. Awaiting super admin approval." };
  },

  "admin/list-pending-users": async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    if (!isSuperAdminEmail(user.email)) {
      const error = new Error("Only super admin can list pending users.");
      error.statusCode = 403;
      throw error;
    }
    if (prisma) {
      const users = await prisma.user.findMany({ orderBy: { created_at: "desc" } });
      const pendingUsers = users.filter((item) => !isUserApproved(item)).map((item) => publicUser(item));
      return { ok: true, users: pendingUsers };
    }
    const pendingUsers = (db.users || []).filter((item) => !isUserApproved(item)).map((item) => publicUser(item));
    return { ok: true, users: pendingUsers };
  },

  "admin/approve-user": async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    if (!isSuperAdminEmail(user.email)) {
      const error = new Error("Only super admin can approve users.");
      error.statusCode = 403;
      throw error;
    }
    const targetEmail = sanitizeEmail(payload?.email);
    const targetUserId = String(payload?.user_id || "").trim();
    if (!targetEmail && !targetUserId) {
      const error = new Error("email or user_id is required");
      error.statusCode = 400;
      throw error;
    }
    if (prisma) {
      const target = targetUserId
        ? await prisma.user.findUnique({ where: { id: targetUserId } })
        : await prisma.user.findUnique({ where: { email: targetEmail } });
      if (!target) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      const approved = await prisma.user.update({
        where: { id: target.id },
        data: {
          email_verified: true,
          email_verify_token: ADMIN_APPROVAL_APPROVED,
          email_verify_expires_at: null,
        },
      });
      return { ok: true, user: publicUser(approved) };
    }
    const index = db.users.findIndex((item) =>
      targetUserId ? item.id === targetUserId : sanitizeEmail(item.email) === targetEmail
    );
    if (index < 0) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    db.users[index] = {
      ...db.users[index],
      email_verified: true,
      email_verify_token: ADMIN_APPROVAL_APPROVED,
      email_verify_expires_at: "",
    };
    await writeDb(db);
    return { ok: true, user: publicUser(db.users[index]) };
  },

  "request-password-reset": async (payload) => {
    const email = sanitizeEmail(payload?.email);
    if (!email || !email.includes("@")) throw new Error("valid email is required");
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
    const prisma = await getPrismaClient();
    if (prisma) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { password_reset_token: token, password_reset_expires_at: new Date(expiresAt) },
        });
      }
    } else {
      const db = await readDb();
      const index = db.users.findIndex((item) => sanitizeEmail(item.email) === email);
      if (index >= 0) {
        db.users[index] = {
          ...db.users[index],
          password_reset_token: token,
          password_reset_expires_at: expiresAt,
        };
        await writeDb(db);
      }
    }
    return {
      ok: true,
      message: "If the account exists, a reset email has been sent.",
      // Dev helper: in production, email this link and never return token.
      reset_url: `${HOST_BASE_URL}/reset-password?token=${token}`,
    };
  },

  "reset-password": async (payload) => {
    const token = String(payload?.token || "").trim();
    const password = String(payload?.password || "");
    if (!token) throw new Error("token is required");
    if (password.length < 6) throw new Error("password must be at least 6 characters");
    const prisma = await getPrismaClient();
    if (prisma) {
      const user = await prisma.user.findFirst({ where: { password_reset_token: token } });
      if (!user) throw new Error("Invalid reset token");
      if (!user.password_reset_expires_at || new Date(user.password_reset_expires_at).getTime() < Date.now()) {
        throw new Error("Reset token expired");
      }
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: hashPassword(password),
          password_reset_token: null,
          password_reset_expires_at: null,
        },
      });
      return { ok: true, message: "Password reset successful." };
    }
    const db = await readDb();
    const index = db.users.findIndex((item) => item.password_reset_token === token);
    if (index < 0) throw new Error("Invalid reset token");
    const expiresAt = new Date(db.users[index].password_reset_expires_at || 0).getTime();
    if (!expiresAt || expiresAt < Date.now()) throw new Error("Reset token expired");
    db.users[index] = {
      ...db.users[index],
      password_hash: hashPassword(password),
      password_reset_token: "",
      password_reset_expires_at: "",
    };
    await writeDb(db);
    return { ok: true, message: "Password reset successful." };
  },
};

const projectActions = {
  list: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    let projects = [];
    if (prisma) {
      projects = await prisma.project.findMany({
        where: { user_id: user.id },
        orderBy: { created_at: "desc" },
      });
    } else {
      projects = db.projects
        .filter((item) => item.user_id === user.id)
        .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    }
    return { ok: true, projects };
  },

  create: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const projectName = String(payload?.project_name || "").trim();
    const aiPrompt = String(payload?.ai_prompt || "").trim();
    if (!projectName) throw new Error("project_name is required");
    let project;
    if (prisma) {
      project = await prisma.project.create({
        data: {
          user_id: user.id,
          project_name: projectName,
          ai_prompt: aiPrompt,
        },
      });
    } else {
      project = {
        id: crypto.randomUUID(),
        user_id: user.id,
        project_name: projectName,
        ai_prompt: aiPrompt,
        created_at: nowIso(),
      };
      db.projects.unshift(project);
      await writeDb(db);
    }
    return { ok: true, project };
  },
};

const websiteActions = {
  list: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const projectId = String(payload?.project_id || "").trim();
    let websites = [];
    if (prisma) {
      if (projectId) {
        const owned = await prisma.project.findFirst({ where: { id: projectId, user_id: user.id } });
        if (!owned) {
          const error = new Error("Project not found");
          error.statusCode = 404;
          throw error;
        }
        websites = await prisma.website.findMany({
          where: { project_id: projectId },
          orderBy: { created_at: "desc" },
        });
      } else {
        websites = await prisma.website.findMany({
          where: { project: { user_id: user.id } },
          orderBy: { created_at: "desc" },
        });
      }
    } else {
      websites = db.websites.filter((item) => item && item.id);
      if (projectId) {
        const owned = db.projects.find((project) => project.id === projectId && project.user_id === user.id);
        if (!owned) {
          const error = new Error("Project not found");
          error.statusCode = 404;
          throw error;
        }
        websites = websites.filter((item) => item.project_id === projectId);
      } else {
        const allowedProjectIds = new Set(db.projects.filter((p) => p.user_id === user.id).map((p) => p.id));
        websites = websites.filter((item) => allowedProjectIds.has(item.project_id));
      }
      websites.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
    }
    return { ok: true, websites };
  },

  save: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const projectId = String(payload?.project_id || "").trim();
    if (!projectId) throw new Error("project_id is required");
    const project = prisma
      ? await prisma.project.findFirst({ where: { id: projectId, user_id: user.id } })
      : db.projects.find((item) => item.id === projectId && item.user_id === user.id);
    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      throw error;
    }
    let website;
    if (prisma) {
      website = await prisma.website.create({
        data: {
          project_id: projectId,
          html: String(payload?.html || ""),
          css: String(payload?.css || ""),
          pages: payload?.pages && typeof payload.pages === "object" ? payload.pages : {},
          domain: String(payload?.domain || ""),
        },
      });
    } else {
      website = {
        id: crypto.randomUUID(),
        project_id: projectId,
        html: String(payload?.html || ""),
        css: String(payload?.css || ""),
        pages: payload?.pages && typeof payload.pages === "object" ? payload.pages : {},
        domain: String(payload?.domain || ""),
        created_at: nowIso(),
      };
      db.websites.unshift(website);
      await writeDb(db);
    }
    return { ok: true, website };
  },
};

const billingActions = {
  plans: async () => ({
    ok: true,
    plans: Object.values(PLAN_DEFS),
  }),

  status: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    if (prisma) {
      const [subscription, projects, generationEvents] = await Promise.all([
        prisma.subscription.findFirst({
          where: { user_id: user.id, status: "active" },
          orderBy: { created_at: "desc" },
        }),
        prisma.project.findMany({ where: { user_id: user.id } }),
        prisma.generationEvent.findMany({ where: { user_id: user.id } }),
      ]);
      const summary = summarizeBillingStatus({
        planKey: subscription?.plan || "free",
        generationEvents,
        projects,
      });
      return { ok: true, subscription: subscription || { plan: "free", status: "active" }, ...summary };
    }
    const subscription = getLatestSubscription(db.subscriptions, user.id) || { plan: "free", status: "active" };
    const projects = db.projects.filter((item) => item.user_id === user.id);
    const generationEvents = db.generation_events.filter((item) => item.user_id === user.id);
    const summary = summarizeBillingStatus({
      planKey: subscription.plan || "free",
      generationEvents,
      projects,
    });
    return { ok: true, subscription, ...summary };
  },

  subscribe: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const plan = getPlanByKey(payload?.plan);
    if (!STRIPE_SECRET_KEY) {
      const error = new Error("Stripe billing is not configured. Set STRIPE_SECRET_KEY.");
      error.statusCode = 503;
      throw error;
    }
    const checkout = await createStripeCheckoutSession({ user, plan });
    if (prisma) {
      const subscription = await prisma.subscription.create({
        data: {
          user_id: user.id,
          plan: plan.key,
          status: "pending",
          stripe_customer_id: String(checkout?.customer || "") || null,
          stripe_subscription_id: String(checkout?.id || "") || null,
        },
      });
      return {
        ok: true,
        billingMode: "stripe",
        subscription,
        checkout_url: String(checkout?.url || ""),
        checkout_session_id: String(checkout?.id || ""),
      };
    }
    const subscription = {
      id: crypto.randomUUID(),
      user_id: user.id,
      plan: plan.key,
      status: "pending",
      stripe_customer_id: String(checkout?.customer || ""),
      stripe_subscription_id: String(checkout?.id || ""),
      created_at: nowIso(),
    };
    db.subscriptions.unshift(subscription);
    await writeDb(db);
    return {
      ok: true,
      billingMode: "stripe",
      subscription,
      checkout_url: String(checkout?.url || ""),
      checkout_session_id: String(checkout?.id || ""),
    };
  },

  "consume-generation": async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    if (prisma) {
      const [subscription, projects, generationEvents] = await Promise.all([
        prisma.subscription.findFirst({
          where: { user_id: user.id, status: "active" },
          orderBy: { created_at: "desc" },
        }),
        prisma.project.findMany({ where: { user_id: user.id } }),
        prisma.generationEvent.findMany({ where: { user_id: user.id } }),
      ]);
      const summary = summarizeBillingStatus({
        planKey: subscription?.plan || "free",
        generationEvents,
        projects,
      });
      if (!summary.canGenerate) {
        const error = new Error(`Generation limit reached for ${summary.plan.label}. Upgrade plan to continue.`);
        error.statusCode = 402;
        throw error;
      }
      await prisma.generationEvent.create({
        data: {
          user_id: user.id,
          project_name: String(payload?.project_name || ""),
        },
      });
      return { ok: true, ...summary, usage: { ...summary.usage, generationsRemaining: summary.usage.generationsRemaining - 1 } };
    }
    const subscription = getLatestSubscription(db.subscriptions, user.id) || { plan: "free", status: "active" };
    const projects = db.projects.filter((item) => item.user_id === user.id);
    const generationEvents = db.generation_events.filter((item) => item.user_id === user.id);
    const summary = summarizeBillingStatus({
      planKey: subscription.plan || "free",
      generationEvents,
      projects,
    });
    if (!summary.canGenerate) {
      const error = new Error(`Generation limit reached for ${summary.plan.label}. Upgrade plan to continue.`);
      error.statusCode = 402;
      throw error;
    }
    db.generation_events.unshift({
      id: crypto.randomUUID(),
      user_id: user.id,
      project_name: String(payload?.project_name || ""),
      created_at: nowIso(),
    });
    await writeDb(db);
    return { ok: true, ...summary, usage: { ...summary.usage, generationsRemaining: summary.usage.generationsRemaining - 1 } };
  },
};

const workspacesActions = {
  list: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    if (prisma) {
      const memberships = await prisma.workspaceMember.findMany({
        where: { user_id: user.id },
        include: { workspace: true },
      });
      return {
        ok: true,
        active_workspace_id: user.active_workspace_id || null,
        workspaces: memberships.map((item) => ({
          id: item.workspace_id,
          name: item.workspace?.name || "Workspace",
          role: item.role,
        })),
      };
    }
    const memberships = db.workspace_members.filter((item) => item.user_id === user.id);
    const workspaces = memberships.map((member) => {
      const workspace = db.workspaces.find((item) => item.id === member.workspace_id);
      return {
        id: member.workspace_id,
        name: workspace?.name || "Workspace",
        role: member.role,
      };
    });
    return { ok: true, active_workspace_id: user.active_workspace_id || null, workspaces };
  },

  create: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const name = String(payload?.name || "").trim() || "New Workspace";
    if (prisma) {
      const workspace = await prisma.workspace.create({
        data: {
          name,
          owner_user_id: user.id,
        },
      });
      await prisma.workspaceMember.create({
        data: {
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner",
        },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { active_workspace_id: workspace.id },
      });
      return { ok: true, workspace: { id: workspace.id, name: workspace.name, role: "owner" } };
    }
    const workspace = {
      id: crypto.randomUUID(),
      name,
      owner_user_id: user.id,
      created_at: nowIso(),
    };
    db.workspaces.unshift(workspace);
    db.workspace_members.unshift({
      id: crypto.randomUUID(),
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
      created_at: nowIso(),
    });
    const userIndex = db.users.findIndex((item) => item.id === user.id);
    if (userIndex >= 0) db.users[userIndex].active_workspace_id = workspace.id;
    await writeDb(db);
    return { ok: true, workspace: { id: workspace.id, name: workspace.name, role: "owner" } };
  },

  members: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const workspaceId = String(payload?.workspace_id || user.active_workspace_id || "").trim();
    if (!workspaceId) throw new Error("workspace_id is required");
    if (prisma) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { workspace_id: workspaceId, user_id: user.id },
      });
      if (!membership) throw new Error("Workspace access denied");
      const members = await prisma.workspaceMember.findMany({
        where: { workspace_id: workspaceId },
        include: { user: true },
      });
      return {
        ok: true,
        members: members.map((item) => ({
          user_id: item.user_id,
          name: item.user?.name || "",
          email: item.user?.email || "",
          role: item.role,
        })),
      };
    }
    const selfMembership = db.workspace_members.find((item) => item.workspace_id === workspaceId && item.user_id === user.id);
    if (!selfMembership) throw new Error("Workspace access denied");
    const members = db.workspace_members
      .filter((item) => item.workspace_id === workspaceId)
      .map((item) => {
        const memberUser = db.users.find((u) => u.id === item.user_id);
        return {
          user_id: item.user_id,
          name: memberUser?.name || "",
          email: memberUser?.email || "",
          role: item.role,
        };
      });
    return { ok: true, members };
  },

  invite: async (payload, context) => {
    const { user, db, prisma } = await requireUser(context.req, payload);
    const workspaceId = String(payload?.workspace_id || user.active_workspace_id || "").trim();
    const email = sanitizeEmail(payload?.email);
    const role = WORKSPACE_ROLES.includes(String(payload?.role || "")) ? String(payload.role) : "editor";
    if (!workspaceId) throw new Error("workspace_id is required");
    if (!email) throw new Error("email is required");
    if (prisma) {
      const selfMembership = await prisma.workspaceMember.findFirst({
        where: { workspace_id: workspaceId, user_id: user.id },
      });
      if (!selfMembership || !["owner", "admin"].includes(selfMembership.role)) throw new Error("Only owner/admin can invite members");
      const targetUser = await prisma.user.findUnique({ where: { email } });
      if (!targetUser) throw new Error("User not found. Ask them to sign up first.");
      const existing = await prisma.workspaceMember.findFirst({
        where: { workspace_id: workspaceId, user_id: targetUser.id },
      });
      if (existing) return { ok: true, member: { user_id: targetUser.id, role: existing.role }, message: "User already in workspace." };
      const member = await prisma.workspaceMember.create({
        data: {
          workspace_id: workspaceId,
          user_id: targetUser.id,
          role,
        },
      });
      return { ok: true, member };
    }
    const selfMembership = db.workspace_members.find((item) => item.workspace_id === workspaceId && item.user_id === user.id);
    if (!selfMembership || !["owner", "admin"].includes(selfMembership.role)) throw new Error("Only owner/admin can invite members");
    const targetUser = db.users.find((item) => sanitizeEmail(item.email) === email);
    if (!targetUser) throw new Error("User not found. Ask them to sign up first.");
    const existing = db.workspace_members.find((item) => item.workspace_id === workspaceId && item.user_id === targetUser.id);
    if (existing) return { ok: true, member: { user_id: targetUser.id, role: existing.role }, message: "User already in workspace." };
    const member = {
      id: crypto.randomUUID(),
      workspace_id: workspaceId,
      user_id: targetUser.id,
      role,
      created_at: nowIso(),
    };
    db.workspace_members.unshift(member);
    await writeDb(db);
    return { ok: true, member };
  },
};

const aiActions = {
  "score-variants": async (payload) => {
    const html = String(payload?.html || "");
    const prompt = String(payload?.prompt || "");
    if (!html) throw new Error("html is required");
    const mutate = (source, variantName) => {
      if (variantName === "Conversion") {
        return source.replace(/Ready to take the next step\?/i, "Ready to start seeing results?");
      }
      if (variantName === "SEO") {
        return source.replace(/<h1([^>]*)>/i, `<h1$1 data-seo-optimized="true">`);
      }
      return source.replace(/Contact Us/gi, "Get Started");
    };
    const scoreHtml = (value) => {
      const text = String(value || "").toLowerCase();
      const seo = (/<h1/i.test(value) ? 30 : 0) + (/(meta|seo|keyword)/i.test(text) ? 30 : 12) + (/<a /i.test(value) ? 20 : 8);
      const conversion = (/(contact|book|get started|launch|quote|schedule)/i.test(text) ? 35 : 12) + (/<button|class=\"cta|>cta</i.test(text) ? 35 : 10) + (/(testimonial|trust|review)/i.test(text) ? 20 : 8);
      const accessibility = (/<img/i.test(value) ? (/\balt=/.test(value) ? 35 : 10) : 25) + (/(aria-|role=|label)/i.test(value) ? 30 : 12) + (/<h[1-3]/i.test(value) ? 25 : 12);
      const total = Math.round((seo + conversion + accessibility) / 3);
      return { seo: Math.min(100, seo), conversion: Math.min(100, conversion), accessibility: Math.min(100, accessibility), total: Math.min(100, total) };
    };
    const variants = ["Balanced", "Conversion", "SEO"].map((name, index) => {
      const variantHtml = mutate(html, name);
      return {
        id: `variant-${index + 1}`,
        name,
        html: variantHtml,
        scores: scoreHtml(`${variantHtml} ${prompt}`),
      };
    });
    const best = variants.slice().sort((a, b) => b.scores.total - a.scores.total)[0];
    return { ok: true, variants, best_variant_id: best?.id || "" };
  },
};

const serveHostedSite = async (req, res) => {
  const pathname = new URL(req.url || "/", HOST_BASE_URL).pathname;
  const rest = pathname.replace(/^\/sites\//, "");
  if (!rest) {
    sendText(res, 200, "Hosted sites root", "text/plain; charset=utf-8");
    return;
  }

  const [rawSiteId, ...fileParts] = rest.split("/");
  const safeId = safeSegment(rawSiteId);
  if (!safeId) {
    sendJson(res, 400, { error: "Invalid site id" });
    return;
  }

  const requestedFile = fileParts.length === 0 || fileParts[fileParts.length - 1] === ""
    ? "index.html"
    : safeFileName(fileParts.join("/"));

  const filePath = path.join(siteDir(safeId), requestedFile);

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": content.length,
      "Access-Control-Allow-Origin": "*",
    });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: "Hosted file not found" });
  }
};

const handleApiAction = async (req, res, namespace, actions, options = {}) => {
  try {
    const authMode = options.authMode || "gateway";
    if (authMode === "gateway") {
      assertGatewayAuth(req);
    }
    const urlObj = new URL(req.url || "/", HOST_BASE_URL);
    const action = urlObj.pathname
      .replace(`/api/${namespace}/`, "")
      .replace(/\/+$/, "");
    const handler = actions[action];

    if (!handler) {
      sendJson(res, 404, { error: `Unsupported ${namespace} action: ${action}` });
      return;
    }

    const payload = req.method === "GET"
      ? Object.fromEntries(urlObj.searchParams.entries())
      : await readJsonBody(req);
    const result = await handler(payload || {}, { req, res });
    sendJson(res, 200, result || {});
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || `${namespace} gateway error` });
  }
};

const handleStripeWebhookRequest = async (req, res) => {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      sendJson(res, 503, { error: "Missing STRIPE_WEBHOOK_SECRET" });
      return;
    }
    const raw = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    if (!verifyStripeSignature(raw, signature, STRIPE_WEBHOOK_SECRET)) {
      sendJson(res, 400, { error: "Invalid Stripe signature" });
      return;
    }
    const event = safeJsonParse(raw.toString("utf8"), null);
    if (!event) {
      sendJson(res, 400, { error: "Invalid webhook payload" });
      return;
    }
    await handleStripeWebhookEvent(event);
    sendJson(res, 200, { ok: true });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || "Webhook error" });
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/registrar/")) {
    await handleApiAction(req, res, "registrar", registrarActions);
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/hosting/")) {
    await handleApiAction(req, res, "hosting", hostingActions);
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/domain/")) {
    await handleApiAction(req, res, "domain", domainActions);
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/auth/")) {
    await handleApiAction(req, res, "auth", authActions, { authMode: "none" });
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/projects/")) {
    await handleApiAction(req, res, "projects", projectActions, { authMode: "none" });
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/websites/")) {
    await handleApiAction(req, res, "websites", websiteActions, { authMode: "none" });
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/generate")) {
    try {
      const payload = await readJsonBody(req);
      const result = await generateActions[""](payload || {}, { req, res });
      sendJson(res, 200, result || {});
    } catch (error) {
      sendJson(res, error.statusCode || 400, { error: error.message || "Generate error" });
    }
    return;
  }

  if (req.method === "POST" && req.url?.startsWith("/api/billing/webhook")) {
    await handleStripeWebhookRequest(req, res);
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/workspaces/")) {
    await handleApiAction(req, res, "workspaces", workspacesActions, { authMode: "none" });
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/ai/")) {
    await handleApiAction(req, res, "ai", aiActions, { authMode: "none" });
    return;
  }

  if (req.method === "GET" && req.url?.startsWith("/sites/")) {
    await serveHostedSite(req, res);
    return;
  }

  if (req.method === "GET" && (req.url?.startsWith("/billing/success") || req.url?.startsWith("/billing/cancel"))) {
    const urlObj = new URL(req.url || "/", HOST_BASE_URL);
    const plan = urlObj.searchParams.get("plan") || "";
    const status = req.url.includes("/billing/success") ? "success" : "cancel";
    const appBase = String(APP_BASE_URL || HOST_BASE_URL).replace(/\/$/, "");
    sendRedirect(res, 302, `${appBase}/dashboard?billing=${status}&plan=${encodeURIComponent(plan)}`);
    return;
  }

  if (req.method === "GET" && (req.url?.startsWith("/api/billing/success") || req.url?.startsWith("/api/billing/cancel"))) {
    const urlObj = new URL(req.url || "/", HOST_BASE_URL);
    const plan = urlObj.searchParams.get("plan") || "";
    const status = req.url.includes("/success") ? "success" : "cancel";
    const appBase = String(APP_BASE_URL || HOST_BASE_URL).replace(/\/$/, "");
    sendRedirect(res, 302, `${appBase}/dashboard?billing=${status}&plan=${encodeURIComponent(plan)}`);
    return;
  }

  if ((req.method === "POST" || req.method === "GET") && req.url?.startsWith("/api/billing/")) {
    await handleApiAction(req, res, "billing", billingActions, { authMode: "none" });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[registrar-gateway] listening on http://localhost:${PORT}`);
});
