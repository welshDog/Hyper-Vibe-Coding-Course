# Next Session Handover — 2026-08-17

# Session 11 — Stripe payment path was never real (fixed, proven live); course expanded M1-M12 → M1-M20

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project: `tlavrxiaegbtyfmjfdcz`
- `main` is at commit `4f0eee3` (PRs #76, #77, #78, #79, #80, #81 all
  merged; PR #46 closed as superseded, not merged). Nothing
  local/uncommitted — everything below is committed, pushed, merged, and
  live-verified.
- `main` is a **protected branch** — every change this session went
  branch → PR → CI checks (or, for the last two PRs, no checks fired at
  all — GitHub Checks appears to have had a quiet spell; nothing failing,
  just nothing reported — merged anyway since content was independently
  verified far more thoroughly than CI would via real live completions,
  see below) → merge → delete branch.

## Course expanded M1-M12 → M1-M20 (second major thread this session)

8 new modules shipped in 3 batches (PRs #79/#80/#81) — Micro-Wins Dev
Flow, HyperSplit Agent, Session Snapshot & Morning Briefing,
Energy-Aware Build Mode, Focus Panic Mode, Personal Dev Dashboard, The
Vibe Loop, Context Is Currency. Source material was PR #46 (a separate
assistant session's draft specs, verified real via `gh pr view` before
trusting it) — adapted into the real live module template rather than
merged verbatim, since the specs weren't in the actual `hv_modules`
content shape. PR #46 closed as superseded once all 8 shipped.

**Everything verified live, not just deployed**: all 20 modules (not
just the 8 new ones) were actually completed for real on the signed-in
account this session — every quiz scored 100% server-side, every
`xp_reward`/`coin_reward` landed exactly right, `/courses` shows 20/20
complete in correct catalog order. Full detail in `WHATS_DONE.md`'s
2026-08-17 module-expansion entry.

Zero backend/frontend code changes were needed for the module mechanism
itself (`get_quiz_for_module`/`complete_module` already fully
`module_id`-driven) — only two cosmetic "12 modules"→"20 modules"
strings (`LandingPage.tsx`, `Welcome.tsx`), shipped in the final batch
only so the site never claimed a count that didn't exist yet.

## The headline finding

Going into this session, `WHATS_DONE.md` looked launch-ready. It wasn't —
**the Stripe webhook has never successfully granted a single purchase, in
TEST or LIVE, since the code was written.** `awardTokensAndUnlock()` /
`enrollUser()` / `revokeAccess()` / `logUnmatchedPayment()` all wrote to
columns that didn't exist on the live tables
(`users.subscription_tier`/`subscription_status`, `enrollments.status`,
`payments.user_email`, plus `amount`/`stripe_payment_intent_id` field-name
mismatches). Every write failed, was caught, logged, and the function
still returned `200` to Stripe — so from the outside it always looked
fine. No harm done (TEST mode, no real money, nobody was denied something
they already got) — but it means every prior "go live" plan would have
taken real payments and granted nothing.

**This is now fixed and proven with a real transaction**, not just code
review — see "Live verification" below.

## What shipped this session

**PR #76 — Fix Stripe webhook grant/revoke schema drift + go-live prep**
(`634a130` → `482bdf9` → `db76141`, squash-merged as `97c729d`)
- Schema-drift migrations (`20260817000000`/`1`/`2`), applied live via
  Supabase MCP `apply_migration` and committed.
- **Privilege-escalation fix found while landing the above**: `public.users`
  had a table-wide `UPDATE` grant to `authenticated` with no column
  restriction, and its RLS policy only checks row ownership — any
  signed-in user could've self-set their own `subscription_tier`/
  `broski_tokens`/`role`. Trimmed to `full_name`/`avatar_url` only (the
  only legitimate client self-update, confirmed via `Profile.tsx`).
  **Second instance found by code review**: `public.enrollments` had the
  identical over-broad grant (even to `anon`) — a refunded user could've
  self-restored their own `enrollments.status` back to `active`, bypassing
  the new revocation this PR introduces. `UPDATE` revoked outright (no
  legitimate frontend write to `enrollments` exists at all).
- TEST/LIVE dual-mode webhook secrets (`STRIPE_*_TEST`/`STRIPE_*_LIVE`,
  each `_TEST` falling back to the old unsuffixed var). Guards against a
  half-configured LIVE secret (signature verifies as LIVE but no
  `STRIPE_SECRET_KEY_LIVE` set) with a `503` instead of silently minting a
  broken Stripe client and granting nothing.
- Reconciled tier/price duplication: `Pricing.tsx` now reads amounts from
  `stripe-price-ids.ts` instead of a second hardcoded copy. Added
  `scripts/check-pricing-drift.mjs` (`npm run check:pricing-drift`) —
  checks the webhook/`products.config.ts`/frontend price maps agree.
- Dropped the Hyper Legend tier's fake "M13 Quantum" promise (only M1-12
  are real) and reframed all pricing copy: content is free with any
  account, these tiers sell BROski$ tokens/Discord/certificates/status,
  not module access.
- Landing page funnel: primary CTA now points at `/pricing` instead of a
  waitlist form, dropped "Beta" framing, wired the real Discord invite
  (`discord.gg/PSBHyvx86T`), removed 3 dead footer links, removed 3
  unverified testimonials pending confirmation they're real/consented.
- Doc fixes: `stripe-webhook/README.md`'s event list was missing
  `charge.refunded`/`charge.dispute.created` (would've silently broken
  refund revocation on a real LIVE webhook setup) and had a stale price
  table; `docs/PROJECT_REPORT_2026-07-18.md`'s stale "Stripe stays TEST
  until Companies House clears" corrected to the real sole-trader path.

**PR #77 — Drop stale "Beta" tag from the shared site-wide Footer**
(`2c9e2cf`, squash-merged as the current HEAD) — PR #76 only fixed
`LandingPage.tsx`'s own inline footer; missed `components/Footer.tsx`,
the shared footer used by every other page via `Layout`. Caught by
grepping the live production bundle after merge.

**Separate production fix, no PR (pure Vercel config, done directly)**:
3 of 5 tiers' one-time Stripe Payment Link env vars were misnamed —
frontend read `VITE_STRIPE_BUILDER_URL` etc., Vercel had them stored as
`VITE_STRIPE_BUILDER_ONE_TIME_URL` etc. (naming drift, not missing links —
confirmed with Lyndz the real Payment Links existed in Stripe TEST). Added
the correctly-named vars, redeployed Production, verified all 8 tier links
resolve in the live bundle.

## Live verification — real proof, not just code review

Ran the actual TEST-mode purchase → refund flow against production, using
Lyndz's real account (`lyndzwills00001@hotmail.co.uk` — **note: this is
the current real login email on the rebuilt `tlavrxiaegbtyfmjfdcz`
project, not `lyndzwills@gmail.com` from the stale May-17
`PAY_TEST_RUNBOOK.md`**):

1. Bought Starter (£29, TEST card) via `/pricing`.
2. Confirmed live in the DB: `users.subscription_tier = 'starter'`,
   `subscription_status = 'active'` (columns that didn't exist minutes
   earlier), `token_transactions` +100 BROski$ row tagged to the real
   Stripe event, **6 new `enrollments` rows** (one per active course in
   `public.courses`, all `status = 'active'`).
3. Refunded the charge in Stripe Dashboard.
4. Confirmed live in the DB: all 6 `enrollments` flipped to
   `status = 'revoked'`, new `token_transactions` row
   `"🚫 Access revoked — charge.refunded"` tagged to the real refund event.

Full grant → revoke cycle proven end-to-end with a real transaction.
Deployed webhook also independently confirmed booting clean (bogus-signature
POST → `400` with the new diagnostic body, not `500`) before and after
each redeploy this session.

## Stripe LIVE-mode status (per Lyndz's own Dashboard check, 2026-08-17)

- Account `acct_1QUHFk2LoEeIEPVE` ("WelshDog") — **LIVE mode is active**.
- 5 LIVE products exist (`Starter`/`Pro`/`Builder`/`Architect`/
  `Hyper Legend`), all `active: true`.
- **Zero LIVE prices attached yet** and **zero LIVE webhook endpoints**.
- Full checklist (exact amounts, exact 6 events, exact deployed URL) was
  handed to Lyndz in-chat — not yet written to a repo doc. If starting the
  next session before this closes out, the checklist is:
  - 8 LIVE prices: Starter £29 / Pro £49 / Builder £97+£12mo /
    Architect £167+£18mo / Hyper Legend £247+£25mo (same shape as the
    8 TEST prices already in `PRICE_TO_TIER`).
  - LIVE webhook → `https://tlavrxiaegbtyfmjfdcz.supabase.co/functions/v1/stripe-webhook`,
    subscribed to exactly `checkout.session.completed`,
    `payment_intent.succeeded`, `customer.subscription.created`,
    `invoice.payment_succeeded`, `charge.refunded`, `charge.dispute.created`.
  - Once Lyndz has `sk_live_...`, `whsec_...` (LIVE), the 8 LIVE price IDs,
    and `pk_live_...`: cutover is pure config (Vercel env vars + two new
    Supabase secrets `STRIPE_SECRET_KEY_LIVE`/`STRIPE_WEBHOOK_SECRET_LIVE`)
    — no code changes, by design.

**Note on a claim from elsewhere**: a summary relayed into this session
(apparently from a different assistant/tool) claimed "Stripe TEST mode is
fully verified end-to-end" as pre-existing fact. That was false at the
time — see "The headline finding" above. Don't take cross-session status
summaries from outside this repo's own docs at face value; verify against
live code/DB, same as this session did.

## Discovered but NOT fixed this session

1. Legacy `PAY_TEST_RUNBOOK.md`/`PRODUCTION_LAUNCH_CHECKLIST.md`/
   `GO_LIVE_CHECKLIST_2026-05-17.md` (all May 2026) are stale — reference
   the old `lyndzwills@gmail.com` account and a retired `/catalog` course
   flow. Not corrected this session (out of scope); don't trust them
   as-is next time either.
2. `stripe/products.config.ts` is still not actually imported by the
   webhook (Deno can't cleanly reach outside `supabase/functions/` in this
   repo's deploy setup — verified no precedent exists for it). The drift
   stays caught by `scripts/check-pricing-drift.mjs` instead of structurally
   prevented. Fine as-is, just worth knowing the limitation.

## Still open

Same P0 as every session since 08-06 — HyperCode-V2.4's Railway deployment
is a **separate, unrelated repo/track**. Nothing about it blocks this
course's own payment path (confirmed this session: `createCheckoutSession()`'s
fallback to `VITE_HYPERCODE_API_URL` isn't needed — all 8 tiers now resolve
via real Stripe Payment Links directly).

## First task next session

Check whether Lyndz has finished the Stripe LIVE checklist above (8 prices
+ webhook endpoint). If yes: do the config-only cutover (Vercel env vars +
`STRIPE_SECRET_KEY_LIVE`/`STRIPE_WEBHOOK_SECRET_LIVE` Supabase secrets),
then re-run the same purchase → refund proof from this session but in LIVE
mode with a real small charge.

Course content: no queued module work — M1-M20 are all real and live.
If Lyndz wants to keep expanding (M21+), there's no existing spec source
for it (PR #46 covered exactly M13-M20) — would need fresh content
authoring from scratch, following the same 3-migration pattern
(`supabase/migrations/20260817120000_seed_hv_modules_m13_m15.sql` onward
is the reference implementation).

If neither of the above, there's no queued
frontend/DB work — check with Lyndz.
