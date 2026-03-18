const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export const config = {
  api: {
    bodyParser: false,
  },
};

const readRequestBody = async (req) => {
  if (req.method === "GET" || req.method === "HEAD") return undefined;
  if (req.body != null) {
    if (Buffer.isBuffer(req.body)) return req.body;
    if (typeof req.body === "string") return Buffer.from(req.body);
    return Buffer.from(JSON.stringify(req.body));
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return chunks.length > 0 ? Buffer.concat(chunks) : undefined;
};

const normalizeBaseUrl = (value) => {
  const normalized = String(value || "").trim().replace(/\/$/, "");
  if (!normalized) return "";
  if (!/^https?:\/\//i.test(normalized)) return "";
  return normalized.replace(/\/api$/i, "");
};

const resolveGatewayBaseUrl = () => {
  const candidates = [
    process.env.API_GATEWAY_URL,
    process.env.REGISTRAR_GATEWAY_URL,
    process.env.HOSTING_API_BASE_URL,
    process.env.REGISTRAR_API_BASE_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) return normalized;
  }

  return "";
};

const getRequestOrigin = (req) => {
  const forwardedProtoRaw = String(req.headers["x-forwarded-proto"] || "").trim();
  const forwardedHostRaw = String(req.headers["x-forwarded-host"] || "").trim();
  const hostRaw = String(forwardedHostRaw || req.headers.host || "").trim();
  if (!hostRaw) return "";
  const proto = String(forwardedProtoRaw || "https").split(",")[0].trim() || "https";
  const host = hostRaw.split(",")[0].trim();
  return `${proto}://${host}`.replace(/\/$/, "");
};

const buildRequestPath = (req, forcedPath = "") =>
  String(forcedPath || "").trim()
    ? String(forcedPath).startsWith("/api")
      ? String(forcedPath)
      : `/api${String(forcedPath)}`
    : String(req.url || "/api").startsWith("/api")
      ? String(req.url || "/api")
      : `/api${req.url || ""}`;

export const inspectGatewayTarget = (req, forcedPath = "") => {
  const gatewayBaseUrl = resolveGatewayBaseUrl();
  const requestPath = buildRequestPath(req, forcedPath);
  const targetUrl = gatewayBaseUrl ? `${gatewayBaseUrl}${requestPath}` : "";
  const requestOrigin = getRequestOrigin(req);
  let isSelfTarget = false;
  if (requestOrigin && targetUrl) {
    try {
      const requestOriginUrl = new URL(requestOrigin);
      const target = new URL(targetUrl);
      isSelfTarget = requestOriginUrl.protocol === target.protocol && requestOriginUrl.host === target.host;
    } catch {
      isSelfTarget = false;
    }
  }
  return {
    gatewayBaseUrl,
    requestPath,
    targetUrl,
    requestOrigin,
    isSelfTarget,
  };
};

export const shouldProxyToGateway = (req, forcedPath = "") => {
  const target = inspectGatewayTarget(req, forcedPath);
  return Boolean(target.gatewayBaseUrl) && !target.isSelfTarget;
};

const buildForwardHeaders = (headers) => {
  const nextHeaders = new Headers();
  Object.entries(headers || {}).forEach(([key, value]) => {
    if (value == null) return;
    if (HOP_BY_HOP_HEADERS.has(String(key || "").toLowerCase())) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => nextHeaders.append(key, entry));
      return;
    }
    nextHeaders.set(key, String(value));
  });
  return nextHeaders;
};

export const proxyToGateway = async (req, res, forcedPath = "") => {
  const target = inspectGatewayTarget(req, forcedPath);
  if (!target.gatewayBaseUrl) {
    res.status(503).json({
      error: "No production gateway URL is configured.",
      details:
        "Set API_GATEWAY_URL or REGISTRAR_GATEWAY_URL in Vercel. Fallbacks also checked: HOSTING_API_BASE_URL and REGISTRAR_API_BASE_URL.",
    });
    return;
  }
  if (target.isSelfTarget) {
    res.status(503).json({
      error: "Gateway URL points back to this deployment (proxy loop prevented).",
      details:
        "API_GATEWAY_URL/REGISTRAR_GATEWAY_URL resolves to the same host as this request. Configure an external gateway URL, or rely on direct /api/hosting fallback endpoints.",
      target: target.targetUrl,
      requestOrigin: target.requestOrigin,
    });
    return;
  }

  const timeoutMs = Math.max(1000, Number(process.env.GATEWAY_PROXY_TIMEOUT_MS || 15000));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const body = await readRequestBody(req);
    const upstreamResponse = await fetch(target.targetUrl, {
      method: req.method,
      headers: buildForwardHeaders(req.headers),
      body,
      redirect: "manual",
      signal: controller.signal,
    });

    upstreamResponse.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(String(key || "").toLowerCase())) return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.status(upstreamResponse.status).send(buffer);
  } catch (error) {
    const isTimeout = String(error?.name || "").toLowerCase() === "aborterror";
    res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? "Gateway proxy timed out." : "Gateway proxy request failed.",
      details: String(error?.message || "Unknown proxy failure"),
      target: target.targetUrl,
      timeoutMs,
    });
  } finally {
    clearTimeout(timeout);
  }
};
