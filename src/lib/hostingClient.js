const HOSTING_API_BASE = import.meta.env.VITE_HOSTING_API_BASE_URL || import.meta.env.VITE_REGISTRAR_API_BASE_URL || "";
const HOSTING_GATEWAY_TOKEN = import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "";
const DEFAULT_TIMEOUT_MS = 15000;

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
  const envBaseUrls = [HOSTING_API_BASE, import.meta.env.VITE_REGISTRAR_API_BASE_URL || ""].filter((value) =>
    isUsableApiBaseUrl(value, isLocalHost)
  );
  const sameOriginBase =
    typeof window !== "undefined" ? String(window.location.origin || "").replace(/\/$/, "") : "";
  const sameOriginFallbackUrls = [
    sameOriginBase ? buildUrl(sameOriginBase, path) : "",
    buildUrl("", path),
  ];
  const localFallbackUrls = [
    ...sameOriginFallbackUrls,
    buildUrl("http://localhost:8787", path),
    buildUrl("http://localhost:4173", path),
  ];
  return Array.from(
    new Set(
      [
        ...envBaseUrls.map((baseUrl) => buildUrl(baseUrl, path)),
        ...(isLocalHost ? localFallbackUrls : sameOriginFallbackUrls),
      ].filter(Boolean)
    )
  );
};

const postHosting = async (path, body) => {
  const requestBody = JSON.stringify(body || {});
  const candidateUrls = buildCandidateUrls(path);
  let lastError = null;

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

  throw new Error(
    `${String(lastError?.message || "Hosting gateway unreachable.")} Start \`npm run dev:gateway\` and retry. Tried: ${candidateUrls.join(", ")}`
  );
};

export const publishProjectLive = async ({ siteId, projectName, customDomain, files }) =>
  postHosting("publish", { siteId, projectName, customDomain, files });

export const unpublishProjectLive = async ({ siteId }) => postHosting("unpublish", { siteId });

export const listHostedProjects = async () => {
  const payload = await postHosting("list", {});
  return Array.isArray(payload?.sites) ? payload.sites : [];
};
