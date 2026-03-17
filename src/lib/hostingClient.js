const HOSTING_API_BASE = import.meta.env.VITE_HOSTING_API_BASE_URL || import.meta.env.VITE_REGISTRAR_API_BASE_URL || "";
const HOSTING_GATEWAY_TOKEN = import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "";
const DEFAULT_TIMEOUT_MS = 15000;
const ENABLE_LOCAL_GATEWAY_FALLBACK = String(import.meta.env.VITE_ENABLE_LOCAL_GATEWAY_FALLBACK || "true").toLowerCase() !== "false";

const buildUrl = (baseUrl, path) => {
  const trimmed = path.replace(/^\/+/, "");
  return baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/api/hosting/${trimmed}`
    : `/api/hosting/${trimmed}`;
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const isLocalHostName = (hostname) => /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)$/i.test(String(hostname || "").trim());

const isUsableApiBaseUrl = (value, allowLocal) => {
  const normalized = String(value || "").trim();
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    return allowLocal || !isLocalHostName(parsed.hostname);
  } catch {
    return false;
  }
};

const buildCandidateUrls = (path) => {
  const isLocalHost =
    typeof window !== "undefined" && isLocalHostName(String(window.location.hostname || ""));
  const envBaseUrls = [
    HOSTING_API_BASE,
    import.meta.env.VITE_REGISTRAR_API_BASE_URL || "",
    import.meta.env.VITE_API_GATEWAY_URL || "",
    import.meta.env.VITE_REGISTRAR_GATEWAY_URL || "",
  ].filter((value) => isUsableApiBaseUrl(value, isLocalHost));
  const sameOriginBase =
    typeof window !== "undefined" ? String(window.location.origin || "").replace(/\/$/, "") : "";
  const sameOriginFallbackUrls = [
    sameOriginBase ? buildUrl(sameOriginBase, path) : "",
    buildUrl("", path),
  ];
  const localGatewayFallbackUrls = [
    buildUrl("http://127.0.0.1:8787", path),
    buildUrl("http://localhost:8787", path),
    buildUrl("http://localhost:4173", path),
  ];
  const includeLocalGatewayFallback = isLocalHost || ENABLE_LOCAL_GATEWAY_FALLBACK;
  return Array.from(
    new Set(
      [
        ...envBaseUrls.map((baseUrl) => buildUrl(baseUrl, path)),
        ...sameOriginFallbackUrls,
        ...(includeLocalGatewayFallback ? localGatewayFallbackUrls : []),
      ].filter(Boolean)
    )
  );
};

const postHosting = async (path, body) => {
  const requestBody = JSON.stringify(body || {});
  const candidateUrls = buildCandidateUrls(path);
  let lastError = null;
  const responseStatuses = [];

  for (const url of candidateUrls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(HOSTING_GATEWAY_TOKEN ? { "x-registrar-token": HOSTING_GATEWAY_TOKEN } : {}),
        },
        body: requestBody,
        signal: controller.signal,
      });

      const payload = await parseJsonSafe(response);
      if (response.ok) return payload || {};
      responseStatuses.push({ url, status: response.status });
      lastError = new Error(payload?.error || `Hosting API error (${response.status}) via ${url}`);
    } catch (error) {
      lastError =
        error?.name === "AbortError"
          ? new Error(`Hosting API timeout via ${url}`)
          : error;
    } finally {
      clearTimeout(timeout);
    }
  }

  const all404 =
    responseStatuses.length > 0 &&
    responseStatuses.every((item) => Number(item.status) === 404);
  const hint = all404
    ? " All candidates returned HTTP 404. Verify your deployment includes `api/[...path].js` and configure `API_GATEWAY_URL` or `REGISTRAR_GATEWAY_URL` for `/api` proxying."
    : "";

  throw new Error(
    `${String(lastError?.message || "Hosting gateway unreachable.")}${hint} Start \`npm run dev:gateway\` and retry. Tried: ${candidateUrls.join(", ")}`
  );
};

export const publishProjectLive = async ({ siteId, projectName, customDomain, files }) =>
  postHosting("publish", { siteId, projectName, customDomain, files });

export const unpublishProjectLive = async ({ siteId }) => postHosting("unpublish", { siteId });

export const listHostedProjects = async () => {
  const payload = await postHosting("list", {});
  return Array.isArray(payload?.sites) ? payload.sites : [];
};
