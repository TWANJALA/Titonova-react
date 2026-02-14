const DEFAULT_TIMEOUT_MS = 15000;
const REGISTRAR_API_BASE = import.meta.env.VITE_REGISTRAR_API_BASE_URL || "";
const REGISTRAR_GATEWAY_TOKEN = import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "";

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const normalizeDomain = (item) => ({
  name: item?.name || "",
  price: Number(item?.price || 0),
  available: Boolean(item?.available),
  currency: item?.currency || "USD",
});

const buildRegistrarUrl = (path) => {
  const trimmed = path.replace(/^\/+/, "");
  return REGISTRAR_API_BASE
    ? `${REGISTRAR_API_BASE.replace(/\/$/, "")}/api/registrar/${trimmed}`
    : `/api/registrar/${trimmed}`;
};

export const registrarRequest = async (path, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(buildRegistrarUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(REGISTRAR_GATEWAY_TOKEN ? { "x-registrar-token": REGISTRAR_GATEWAY_TOKEN } : {}),
      },
      body: JSON.stringify(body || {}),
      signal: controller.signal,
    });

    const payload = await parseJsonSafe(response);
    if (!response.ok) {
      const message = payload?.error || `Registrar API error (${response.status})`;
      throw new Error(message);
    }

    return payload || {};
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Registrar API timeout");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const checkRegistrarHealth = async ({ provider }) =>
  registrarRequest("health", { provider });

export const searchDomainsLive = async ({ provider, keyword, tlds }) => {
  const payload = await registrarRequest("search", { provider, keyword, tlds });
  return Array.isArray(payload?.domains) ? payload.domains.map(normalizeDomain) : [];
};

export const purchaseDomainsLive = async ({ provider, domains }) => {
  const payload = await registrarRequest("purchase", { provider, domains });
  return Array.isArray(payload?.purchased) ? payload.purchased.map(normalizeDomain) : [];
};

export const activateSellerLive = async ({ provider, margin }) =>
  registrarRequest("seller/activate", { provider, margin });

export const updateListingLive = async ({ provider, domain, listed, resalePrice }) =>
  registrarRequest("seller/listing", { provider, domain, listed, resalePrice });
