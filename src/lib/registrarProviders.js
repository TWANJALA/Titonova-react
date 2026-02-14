export const REGISTRAR_PROVIDERS = [
  {
    key: "namecheap",
    label: "Namecheap",
    requirements: [
      "Gateway env: NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_USERNAME, NAMECHEAP_CLIENT_IP",
      "Contact profile env vars required for live purchases",
    ],
  },
  {
    key: "godaddy",
    label: "GoDaddy",
    requirements: [
      "Server-side API key and secret",
      "Provider adapter for search/purchase/listing",
    ],
  },
  {
    key: "cloudflare",
    label: "Cloudflare Registrar",
    requirements: [
      "Server-side API token with registrar permissions",
      "Provider adapter for search/purchase/listing",
    ],
  },
  {
    key: "mock",
    label: "Mock Provider (dev)",
    requirements: ["No credentials required", "Uses deterministic local simulation"],
  },
];

export const getRegistrarProviderByKey = (key) =>
  REGISTRAR_PROVIDERS.find((provider) => provider.key === key) || REGISTRAR_PROVIDERS[0];
