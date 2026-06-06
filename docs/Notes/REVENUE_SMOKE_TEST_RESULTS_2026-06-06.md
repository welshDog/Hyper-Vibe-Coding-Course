# REVENUE SMOKE TEST — RESULTS — 2026-06-06

> Manual Stripe webhook smoke test executed on the prod Supabase Edge Function
> via a Workbench resend of a real LIVE-mode `checkout.session.completed`
> event. No new charges created. Idempotency proven end-to-end.

---

## TL;DR

| Check | Result |
|---|---|
| Webhook receives signed Stripe event | ✅ 200 OK |
| Signature verification | ✅ (otherwise would 400) |
| `source_id` dedup hit on replay | ✅ no new rows |
| No duplicate `payments` row | ✅ count unchanged (3) |
| No duplicate `token_transactions` row | ✅ count unchanged (24) |
| Original row untouched | ✅ same id + created_at |

---

## Setup

| Field | Value |
|---|---|
| Supabase project | `yhtmuibgdnxhbgboajhc` (course) |
| Edge Function | `stripe-webhook` v56, `verify_jwt: false` (ACTIVE) |
| Webhook URL | `https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook` |
| Stripe account | `acct_1QUHFk2LoEeIEPVE` (WelshDog, LIVE mode) |
| Test method | Stripe Workbench "Resend" on an existing LIVE event |
| Target event | `evt_1TeZt82LoEeIEPVEDqDCHXPt` (pro tier purchase, 2026-06-04) |
| Original row in DB | `token_transactions.id = d038a20a-4de5-4a7c-94c0-00487d3a586f` |

### Why Workbench resend (not Stripe CLI / new test charge)

- Stripe public API has **no** "resend event" operation (dashboard / Workbench only).
- Stripe MCP key is connected to LIVE mode — a fresh test would have created
  a real charge.
- Supabase MCP scope doesn't expose Edge Function secrets, so a synthetic
  signed payload wasn't viable.
- Resending an already-signed real event proves the **full** signed-receive
  path AND exercises the idempotency branch in one shot.

---

## Baseline (pre-resend)

```
payments_count       = 3
token_transactions   = 24    (3 with source_id LIKE 'evt_%')
last_payment_at      = 2026-05-28T20:09:24.986+00:00
last_tx_at           = 2026-06-04T11:56:44.779+00:00
target_event_row     = { id: d038a20a-..., amount: 300,
                         reason: '💰 pro tier purchase — Stripe price price_1TbUjB2LoEeIEPVEa3AEQywy',
                         source_id: evt_1TeZt82LoEeIEPVEDqDCHXPt,
                         created_at: 2026-06-04T11:56:44.779+00:00 }
edge_function_logs   = empty (no recent webhook traffic — clean conditions)
```

## Action

Workbench → Events → `evt_1TeZt82LoEeIEPVEDqDCHXPt` → Webhook delivery to the
Supabase URL → **Resend**.

## Post-resend snapshot

```
payments_count            = 3            (Δ 0)
token_transactions        = 24           (Δ 0)
tx_with_source_evt        = 3            (Δ 0)
rows_for_target_event     = 1            (Δ 0 — no duplicate)
target_row_id             = d038a20a-... (unchanged)
target_row_created_at     = 2026-06-04T11:56:44.779+00:00  (unchanged)
last_tx_at                = 2026-06-04T11:56:44.779+00:00  (unchanged)
```

## Edge Function log (resend hit)

```
ts          2026-06-06 23:27:12 UTC
method      POST
url         https://yhtmuibgdnxhbgboajhc.supabase.co/functions/v1/stripe-webhook
status      200
function    7c71a1e4-c2b7-47ad-b114-3c52dbe658ae (stripe-webhook v56)
exec_ms     1925
```

A 200 here means the function returned without throwing. Combined with the
zero-delta row counts, this confirms the code path took the
`existingEvent → return { received: true, skipped: true }` branch (rather
than `awardTokensAndUnlock`).

---

## What this proves

1. **Signed-receive path is live.** Stripe-signed event hits the function and
   `stripe.webhooks.constructEventAsync(...)` accepts the signature.
   (A bad signature would return 400 with `signature_verification_failed`.)
2. **Idempotency is enforced.** The
   `SELECT id FROM token_transactions WHERE source_id = event.id` early-out
   in `index.ts:88-97` fires on the replay and short-circuits before
   `awardTokensAndUnlock` runs.
3. **No duplicate writes.** Both `payments` and `token_transactions` row
   counts are byte-for-byte the same as before the Resend click. The target
   event's single row in `token_transactions` is unmodified.
4. **Original positive case is real.** The 3 existing `evt_%` rows in
   `token_transactions` (evt_1TeZt8…, evt_1TcSE7…, evt_1TcAF5…) are evidence
   that the same code path successfully wrote rows for genuinely new events.
   That's the "fresh write" leg of the smoke test, proven from prod history.

---

## What this does NOT prove

- A **fresh** end-to-end write was not exercised in this session (we
  intentionally avoided creating a new live charge). The positive case rests
  on the 3 historical rows. If you want a brand-new write proven on demand,
  the lowest-cost option is a Stripe TEST-mode payment_link + completing it
  with a 4242 test card against a TEST-mode webhook endpoint configured to
  point at the same Edge Function — that needs an additional Stripe webhook
  endpoint (test secret) wired into the function, which is a separate piece
  of work.
- Refund / dispute / subscription branches were not exercised here.
- The `payments` table was NOT touched by this event in the first place —
  the `awardTokensAndUnlock` path doesn't write `payments` (only
  `logUnmatchedPayment` does, when email/priceId don't match
  `PRICE_TO_TIER`). Baseline `payments_count = 3` reflects historical
  unmatched payments, not this event.

---

## Outstanding (next-session backlog)

- **TEST-mode endpoint.** Wire a Stripe Dashboard TEST-mode webhook endpoint
  to the same Edge Function URL, store both LIVE and TEST webhook secrets,
  and pick the correct one at runtime by `event.livemode`. Unlocks
  charge-free fresh-write smoke via `stripe trigger`.
- **Refund / dispute smoke.** Resend a real `charge.refunded` or
  `charge.dispute.created` event and verify `enrollments.status = 'revoked'`
  for the buyer (`revokeAccess` branch).
- **Cleanup of historical `payments` rows.** Three rows in `payments` are
  all `status = 'unmatched'` from the early-purchase window — worth a one-
  time audit to confirm whether they correspond to real buyers whose tokens
  weren't credited (and if so, manual `awardTokensAndUnlock` replay).

---

## Sources

- Function: `Hyper-Vibe-Coding-Course/supabase/functions/stripe-webhook/index.ts`
- Idempotency check: `index.ts:88-97`
- `awardTokensAndUnlock` writer: `index.ts:185-244`
- `logUnmatchedPayment` writer: `index.ts:356-378`
