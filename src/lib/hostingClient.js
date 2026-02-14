const HOSTING_API_BASE = import.meta.env.VITE_HOSTING_API_BASE_URL || import.meta.env.VITE_REGISTRAR_API_BASE_URL || "";
const HOSTING_GATEWAY_TOKEN = import.meta.env.VITE_REGISTRAR_GATEWAY_TOKEN || "";

const buildUrl = (path) => {
  const trimmed = path.replace(/^\/+/, "");
  return HOSTING_API_BASE
    ? `${HOSTING_API_BASE.replace(/\/$/, "")}/api/hosting/${trimmed}`
    : `/api/hosting/${trimmed}`;
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const postHosting = async (path, body) => {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(HOSTING_GATEWAY_TOKEN ? { "x-registrar-token": HOSTING_GATEWAY_TOKEN } : {}),
    },
    body: JSON.stringify(body || {}),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.error || `Hosting API error (${response.status})`);
  }

  return payload || {};
};

export const publishProjectLive = async ({ siteId, projectName, customDomain, files }) =>
  postHosting("publish", { siteId, projectName, customDomain, files });

export const unpublishProjectLive = async ({ siteId }) => postHosting("unpublish", { siteId });

export const listHostedProjects = async () => {
  const payload = await postHosting("list", {});
  return Array.isArray(payload?.sites) ? payload.sites : [];
};
