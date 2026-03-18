import { readJsonBody, sendJson } from "../_pageGraphStorage.js";

const sanitizeText = (value, fallback = "") =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim() || fallback;

const buildServiceItemsFromPrompt = (prompt) => {
  const tokens = sanitizeText(prompt)
    .split(/[,.;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (tokens.length >= 3) {
    return tokens.slice(0, 3);
  }
  return ["Strategy", "Execution", "Optimization"];
};

const inferIndustrySubtitle = (prompt) => {
  const text = sanitizeText(prompt).toLowerCase();
  if (/(health|care|clinic|hcbs|nursing|rehab)/.test(text)) return "Healthcare services built for trust and outcomes";
  if (/(law|legal|attorney|firm|case)/.test(text)) return "Legal services designed for intake and conversion";
  if (/(clean|janitor|maid|housekeeping)/.test(text)) return "Cleaning services that convert leads into bookings";
  if (/(saas|software|platform|app)/.test(text)) return "Modern SaaS messaging with clear product positioning";
  if (/(restaurant|food|dining|cafe)/.test(text)) return "Restaurant growth pages optimized for reservations";
  return "Built for conversion-focused growth";
};

const toGraphId = (value) =>
  sanitizeText(value, "homepage")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "homepage";

const buildGraphFromPrompt = ({ prompt, pageId, graph }) => {
  const basePrompt = sanitizeText(prompt, "AI Generated Website");
  const basePageId = toGraphId(pageId || graph?.id || "homepage");
  const baseTitle = sanitizeText(graph?.title, "Homepage");
  const serviceItems = buildServiceItemsFromPrompt(basePrompt);
  const subtitle = inferIndustrySubtitle(basePrompt);

  return {
    version: "1.0",
    id: basePageId,
    title: baseTitle,
    components: [
      {
        id: "hero-section",
        type: "Hero",
        props: {
          title: basePrompt,
          subtitle,
          cta: "Schedule a Tour",
          buttonUrl: "#contact",
        },
      },
      {
        id: "services-section",
        type: "Services",
        props: {
          title: "Core Services",
          items: serviceItems,
        },
      },
      {
        id: "proof-section",
        type: "TextBlock",
        props: {
          title: "Why Clients Choose Us",
          body: `Trusted by teams who need ${basePrompt.toLowerCase()} with clear outcomes and fast onboarding.`,
        },
      },
      {
        id: "cta-section",
        type: "CTA",
        props: {
          title: "Ready to take the next step?",
          buttonText: "Book a Demo",
          buttonUrl: "#contact",
        },
      },
    ],
  };
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const prompt = sanitizeText(payload?.prompt || "");
    const pageId = sanitizeText(payload?.pageId || payload?.graph?.id || "homepage");
    const graph = payload?.graph && typeof payload.graph === "object" ? payload.graph : {};

    const nextGraph = buildGraphFromPrompt({ prompt, pageId, graph });
    sendJson(res, 200, {
      ok: true,
      graph: nextGraph,
      components: nextGraph.components,
    });
  } catch (error) {
    sendJson(res, 400, {
      error: String(error?.message || "Failed to generate AI graph."),
    });
  }
}
