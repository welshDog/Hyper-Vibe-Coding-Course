# LOOP_STRIPE.md — Stripe Webhook Loop Runbook
> Claude follows this EXACTLY for any Stripe-related loop.

---

## Smoke Test Flow
```bash
stripe listen --forward-to https://[project].supabase.co/functions/v1/stripe-webhook
# Copy the printed whsec_... into Supabase STRIPE_WEBHOOK_SECRET
stripe trigger checkout.session.completed
```

## Status Decoder

| Status | Meaning | Fix |
|---|---|---|
| POST 401 | stripe-webhook has verify-jwt=true | Redeploy with --no-verify-jwt |
| POST 400 signature fail | Wrong signing secret | Use whsec from `stripe listen`, not Dashboard |
| POST 200 | Webhook working ✅ | Move on |
| payments.status = unmatched | price/email mismatch fixture | Normal — delivery parsing proven |

## Sacred Rules
- Webhooks deployed with `--no-verify-jwt` always
- CLI events: use signing secret printed by `stripe listen`
- Dashboard endpoint: use signing secret shown on that endpoint page
- These are DIFFERENT secrets — never mix them
- Stripe webhook is RATE-LIMIT EXEMPT — always
