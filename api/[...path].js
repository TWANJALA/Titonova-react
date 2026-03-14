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
    process.env.VITE_HOSTING_API_BASE_URL,
    process.env.VITE_REGISTRAR_API_BASE_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeBaseUrl(candidate);
    if (normalized) return normalized;
  }

  return "";
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

export default async function handler(req, res) {
  const gatewayBaseUrl = resolveGatewayBaseUrl();

  if (!gatewayBaseUrl) {
    res.status(503).json({
      error: "No production gateway URL is configured.",
      details:
        "Set API_GATEWAY_URL or REGISTRAR_GATEWAY_URL in Vercel. Fallbacks also checked: HOSTING_API_BASE_URL, REGISTRAR_API_BASE_URL, VITE_HOSTING_API_BASE_URL, VITE_REGISTRAR_API_BASE_URL.",
    });
    return;
  }

  const requestPath = String(req.url || "/api").startsWith("/api") ? String(req.url || "/api") : `/api${req.url || ""}`;
  const targetUrl = `${gatewayBaseUrl}${requestPath}`;

  try {
    const body = await readRequestBody(req);
    const upstreamResponse = await fetch(targetUrl, {
      method: req.method,
      headers: buildForwardHeaders(req.headers),
      body,
      redirect: "manual",
    });

    upstreamResponse.headers.forEach((value, key) => {
      if (HOP_BY_HOP_HEADERS.has(String(key || "").toLowerCase())) return;
      res.setHeader(key, value);
    });

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.status(upstreamResponse.status).send(buffer);
  } catch (error) {
    res.status(502).json({
      error: "Gateway proxy request failed.",
      details: String(error?.message || "Unknown proxy failure"),
      target: targetUrl,
    });
  }
}
