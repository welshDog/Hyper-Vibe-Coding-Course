# Launch Day Deployment Runbook

## Pre-Launch (24 hours before)
- [ ] Frontend builds locally (`frontend/`)
- [ ] Supabase migrations apply cleanly to the linked project
- [ ] Stripe webhook endpoint is configured and receiving events
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
- [ ] Monitor logs (Vercel + Supabase) for 1 hour after launch
- [ ] Send launch announcement

## Post-Launch (First Week)
- [ ] Track signups, activation, and purchase conversion
- [ ] Monitor errors and webhook failures daily
- [ ] Be ready for hotfixes (small PRs, fast deploys)
- [ ] Celebrate! 🎉
