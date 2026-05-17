# 🧪 FULL PAY TEST RUNBOOK
**Created:** May 17, 2026 · **Owner:** @welshDog
**Purpose:** Validate #1 payment gate + #2 content unlock + webhook→enrollments path in one real run.

> Run this BEFORE promoting to production. Path A first — it’s the cleanest test.

---

## ⚠️ #1 GOTCHA — Read This First

The webhook matches Stripe checkout email → `users.email`.

**Your account:** `lyndzwills@gmail.com` (users.id = `63df5bcb…`, tokens = 0, tier = free, 0 enrollments)

✅ At Stripe checkout, the email field **MUST** be `lyndzwills@gmail.com`.

❌ Different email = webhook can’t find you = no grant. Looks broken — isn’t.

---

## 0 — Prereqs (Confirm Before Running)

- [ ] Stripe in **TEST mode** — test keys in Supabase (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- [ ] Stripe Dashboard → Developers → Webhooks: endpoint = your `stripe-webhook` Edge Function URL
- [ ] Webhook events include `checkout.session.completed`
- [ ] `VITE_HYPERCODE_API_URL` set in Vercel (for course-checkout path)
- [ ] `/api/stripe/checkout` backend reachable

---

## ✅ PATH A — Single Course (Do This First)

> Cleanest test. Directly validates the v34 fix + #1/#2 chain with fewest moving parts.

1. Home page → log in as `lyndzwills@gmail.com` (✅ login already done)
2. Go to `/catalog` → open **"Hyperfocus HTML & CSS Quick Wins"** (£19.99, id `571b7e40…`) — cheapest paid course
3. Click **Buy / Enroll** → Stripe Checkout opens
4. Enter card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Postcode: any
   - **Email: `lyndzwills@gmail.com`** — critical ❗
5. Pay → lands on `/payment-success?course_id=571b7e40…`
6. **Expect:** polls ~15s → flips to “You’re in” → “Start learning” button → `/catalog/571b7e40…`
7. Open the course → lessons **unlocked** (not locked 🔒 state)

---

## ✅ PATH B — Tier Upgrade (Run After Path A Passes)

> Has an extra price-ID-matching risk — run Path A first.

1. Home → `/pricing` → pick a tier → Stripe (Payment Link or checkout)
2. Same card + same email (`lyndzwills@gmail.com`)
3. ⚠️ **Tier path only grants if** the Payment Link’s Stripe price ID is one of the 5 in `PRICE_TO_TIER`
   - If webhook logs show no `✅ Awarded` line → it’s a price-ID mismatch, not a code bug
   - Check webhook logs (below) to diagnose

---

## 🔍 Post-Test — What Proves It Worked

### Check Supabase Edge Function logs:
`Supabase Dashboard → Edge Functions → stripe-webhook → Logs`

| Log line | Meaning |
|---|---|
| `✅ Enrolled user 63df5bcb… in N course(s)` | Path A worked ✅ |
| `✅ Awarded … BROski$ … Tier: …` | Path B worked ✅ |
| `❌ User not found for email:` | Wrong email used at checkout |
| `❌ Webhook signature invalid` | `STRIPE_WEBHOOK_SECRET` mismatch |
| *(nothing logged at all)* | Webhook endpoint not pointed at function, or wrong events selected |

### After running — say "check it"
Post the logs and say **"check it"** — I’ll query Supabase for:
- `users` row: `tokens`, `tier`, enrollment count
- `enrollments` table: new row for `571b7e40…`
- `token_transactions`: any reward rows
…and diagnose anything that didn’t land.

---

## 🧠 My Honest Take

**Do Path A first.** It exercises:
- ✅ #1 fix — `/payment-success` no longer self-grants
- ✅ #2 fix — module content unlocks after real payment
- ✅ Webhook → `enrollments` path end-to-end

Path B has the extra price-ID-matching variable that can’t be verified from outside. Path A is clean, fast, and proves the most important chain.

---

## 🔗 Related Files

- [`rewrites/PRODUCTION_LAUNCH_CHECKLIST.md`](./PRODUCTION_LAUNCH_CHECKLIST.md) — full go-live owner actions
- [`rewrites/VERCEL_PREVIEW_REVIEW_2026-05-17.md`](./VERCEL_PREVIEW_REVIEW_2026-05-17.md) — full bug report
- [`rewrites/SESSION_SNAPSHOT_2026-05-17.md`](./SESSION_SNAPSHOT_2026-05-17.md) — session state

---

> 🐶♾️ Built by @welshDog + Perplexity AI — May 17, 2026
> **"Stop apologising for your brain. Start building."**
