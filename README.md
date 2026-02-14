# Titonova AI Website Builder

React + Vite website builder with multi-page export, block editing, theme presets/substyles, domain marketplace flows, and built-in local hosting publish/unpublish.

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

Published files are stored locally in:

- `hosted-sites/`

### Local gateway

A gateway scaffold is included at `server/registrarGateway.mjs`.

- `mock` provider works immediately for local development.
- `namecheap`, `godaddy`, and `cloudflare` route through adapter URLs so secrets stay server-side.

Set adapter URLs in your server environment:

- `NAMECHEAP_ADAPTER_URL`
- `GODADDY_ADAPTER_URL`
- `CLOUDFLARE_ADAPTER_URL`

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
