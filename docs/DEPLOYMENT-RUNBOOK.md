# Launch Day Deployment Runbook

## Pre-Launch (24 hours before)
- [ ] Frontend builds locally (`frontend/`)
- [ ] Supabase migrations apply cleanly to the linked project
- [ ] Stripe webhook endpoint is configured and receiving events
- [ ] Supabase Edge Function secrets are set (at minimum: `COURSE_SYNC_SECRET`, `SHOP_SYNC_SECRET`, `V24_API_URL`)
- [ ] Supabase DB Webhook exists: `public.token_transactions` `INSERT` → `sync-tokens-to-v24`
- [ ] HyperCode V2.4 is deployed and reachable from Supabase (public URL / network path)
- [ ] HyperCode V2.4 has the required endpoints enabled:
  - [ ] `POST /api/v1/economy/award-from-course` (token sync)
  - [ ] `POST /api/v1/access/provision` (shop provisioning, if selling access)
- [ ] Vercel project is connected to the repo and production env vars are set
- [ ] Monitoring/analytics configured (if enabled)
- [ ] Support/Discord channels ready

## Launch Day (Morning)
- [ ] Confirm latest commit on `main` is deployed in Vercel
- [ ] Smoke test key flows on production URL:
  - [ ] Landing → Pricing loads
  - [ ] Login / signup works
  - [ ] Course catalog loads
  - [ ] Checkout redirects to Stripe
- [ ] Verify Stripe webhook is writing expected records in Supabase (enrollments/tokens)
- [ ] Verify token sync to V2.4:
  - [ ] Insert into `token_transactions` triggers `sync-tokens-to-v24` Edge Function
  - [ ] Edge Function logs show a successful award call (or `no_discord_id` if user is not linked yet)
- [ ] Monitor logs (Vercel + Supabase) for 1 hour after launch
- [ ] Send launch announcement

## Post-Launch (First Week)
- [ ] Track signups, activation, and purchase conversion
- [ ] Monitor errors and webhook failures daily
- [ ] Be ready for hotfixes (small PRs, fast deploys)
- [ ] Celebrate! 🎉
