# TitoNova Production Deploy Checklist

## 1) Secure Key Architecture + Rotation
- [ ] Remove all client-exposed AI keys (`VITE_OPENAI_API_KEY`) from deployed envs.
- [ ] Set server-only `OPENAI_API_KEY` in runtime secrets manager.
- [ ] Rotate any previously exposed OpenAI keys immediately.
- [ ] Set `JWT_SECRET` to a strong random value (32+ bytes).
- [ ] Set `PRISMA_ENABLE=true` and production `DATABASE_URL`.
- [ ] Confirm `.env.local` and secret files are excluded from git.

## 2) Stripe Billing + Webhook Gating
- [ ] Set `STRIPE_SECRET_KEY`.
- [ ] Set `STRIPE_WEBHOOK_SECRET`.
- [ ] Configure Stripe webhook endpoint to `POST /api/billing/webhook`.
- [ ] Subscribe flow opens real Stripe Checkout URL.
- [ ] Webhook `checkout.session.completed` activates plan.
- [ ] Webhook `customer.subscription.deleted` downgrades to free plan.

## 3) Domain Attach / Verify Hardening
- [ ] Configure domain provider integration:
  - `CLOUDFLARE_ADAPTER_URL` or
  - `CLOUDFLARE_API_TOKEN` with implementation support.
- [ ] Confirm `/api/domain/attach` fails closed when provider is not configured.
- [ ] Confirm `/api/domain/verify` checks real DNS records:
  - `A @ -> 76.76.21.21`
  - `CNAME www -> cname.vercel-dns.com`

## 4) Final Click-Path QA
- [ ] Guest generate works.
- [ ] Post-generate auth prompt appears for guest.
- [ ] Signup/login works.
- [ ] Billing: plan upgrade opens Stripe checkout.
- [ ] Webhook updates subscription status to active.
- [ ] Generation gating enforces per-plan daily limits.
- [ ] Workspace create/invite/member list works.
- [ ] AI variant scoring returns variants and one-click improve applies best.
- [ ] Publish hosted site succeeds.
- [ ] Domain attach + verify returns pass with real DNS.

## 5) Release Checks
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run prisma:generate` passes.
- [ ] Apply DB migration in production (`npm run prisma:migrate`).
- [ ] Monitor logs for `/api/generate`, `/api/billing/webhook`, `/api/domain/*`.

<!-- deploy-trigger: 2026-03-08T14:50:00-06:00 -->
<!-- deploy-trigger: 2026-03-08T15:16:27-0500 -->
