# TitoNova Cloud Engine Pro

TitoNova Cloud Engine Pro is a React + Vite website platform with multi-page generation/export, guided editing flows, domain marketplace operations, and built-in local hosting publish/unpublish.

## Scripts

- `npm run dev` starts the Vite app.
- `npm run dev:gateway` starts the local registrar API gateway on `http://localhost:8787`.
- `npm run build` builds production assets.
- `npm run lint` runs ESLint.

## Registrar API Integration

The frontend uses a normalized registrar client (`src/lib/registrarClient.js`) and expects these backend endpoints:

- `POST /api/registrar/health`
- `POST /api/registrar/search`
- `POST /api/registrar/purchase`
- `POST /api/registrar/seller/activate`
- `POST /api/registrar/seller/listing`

## Platform Hosting

The same gateway also provides platform hosting endpoints:

- `POST /api/hosting/list`
- `POST /api/hosting/publish`
- `POST /api/hosting/unpublish`

Published sites are served at:

- `GET /sites/:siteId/index.html`
- `GET /api/hosting/site/:siteId/index.html` (Vercel direct fallback mode)

Published files are stored locally in:

- `hosted-sites/`

### Local gateway

A gateway scaffold is included at `server/registrarGateway.mjs`.

- `mock` provider works immediately for local development.
- `namecheap` supports native gateway integration (no separate adapter required) when credentials are set.
- `godaddy` and `cloudflare` route through adapter URLs so secrets stay server-side.

Set adapter URLs in your server environment:

- `NAMECHEAP_ADAPTER_URL`
- `GODADDY_ADAPTER_URL`
- `CLOUDFLARE_ADAPTER_URL`

### Native Namecheap setup

If these are configured, Namecheap calls go directly from `registrarGateway.mjs` to Namecheap XML API:

- `NAMECHEAP_API_USER`
- `NAMECHEAP_API_KEY`
- `NAMECHEAP_USERNAME`
- `NAMECHEAP_CLIENT_IP`
- `NAMECHEAP_SANDBOX` (`true` for sandbox, `false` for production)
- `NAMECHEAP_DEFAULT_YEARS` (optional, default `1`)

For purchases, contact fields are required and are reused for Registrant/Admin/Tech/AuxBilling:

- `NAMECHEAP_CONTACT_FIRST_NAME`
- `NAMECHEAP_CONTACT_LAST_NAME`
- `NAMECHEAP_CONTACT_ADDRESS1`
- `NAMECHEAP_CONTACT_CITY`
- `NAMECHEAP_CONTACT_STATE`
- `NAMECHEAP_CONTACT_POSTAL_CODE`
- `NAMECHEAP_CONTACT_COUNTRY`
- `NAMECHEAP_CONTACT_PHONE`
- `NAMECHEAP_CONTACT_EMAIL`
- `NAMECHEAP_CONTACT_ORG` (optional)

Optional gateway auth:

- `REGISTRAR_GATEWAY_TOKEN`

If set, pass the same token to the frontend using:

- `VITE_REGISTRAR_GATEWAY_TOKEN`

Optional frontend base URL override:

- `VITE_REGISTRAR_API_BASE_URL`
- `VITE_HOSTING_API_BASE_URL`

Optional public host URL used in returned live links:

- `HOST_BASE_URL`

## Quick start for live-mode testing

1. Run `npm run dev:gateway`.
2. In another terminal, run `npm run dev`.
3. In the app, open **Domain Marketplace**.
4. Select provider `Mock Provider (dev)`.
5. Enable **Live Registrar API** and click **Test Connection**.
6. Generate a project and use **Project Library -> Publish Live**.
