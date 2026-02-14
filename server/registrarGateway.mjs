import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.REGISTRAR_GATEWAY_PORT || 8787);
const GATEWAY_TOKEN = process.env.REGISTRAR_GATEWAY_TOKEN || "";
const HOST_BASE_URL = process.env.HOST_BASE_URL || `http://localhost:${PORT}`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HOSTED_ROOT = path.resolve(__dirname, "../hosted-sites");

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

const handleApiAction = async (req, res, namespace, actions) => {
  try {
    assertGatewayAuth(req);
    const action = (req.url || "")
      .replace(`/api/${namespace}/`, "")
      .replace(/\/+$/, "");
    const handler = actions[action];

    if (!handler) {
      sendJson(res, 404, { error: `Unsupported ${namespace} action: ${action}` });
      return;
    }

    const body = await readJsonBody(req);
    const result = await handler(body || {});
    sendJson(res, 200, result || {});
  } catch (error) {
    sendJson(res, error.statusCode || 400, { error: error.message || `${namespace} gateway error` });
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

  if (req.method === "GET" && req.url?.startsWith("/sites/")) {
    await serveHostedSite(req, res);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[registrar-gateway] listening on http://localhost:${PORT}`);
});
