# ✅ WHATS_DONE — Hyper-Vibe-Coding-Course

> Last synced: 2026-08-17 by Claude (Cowork) ⚡

## 2026-08-17 — `/pets` cosmetic overlay art: full rollout complete, closes issue #51

Bro asked to fix `/pets` before picking up the Stripe LIVE-mode cutover.
Investigation found the page itself was in good shape (zero TODOs, no
broken images) — the one real, concrete gap was issue #51: `shop_items`
cosmetic art (aura/background/badge/frame) was originally opaque
shop-preview/promo-card art, never designed to composite over a pet.
A prior session (PRs #49/#52) proved the fix — a separate
`overlay_image_url` column holding real transparent/full-bleed art — and
shipped it for one proof-case item per category. This session finished
the rollout for all 16 remaining items, closing the issue.

- **Real bug found and fixed first, own PR (#89)**: the aura layer applied
  `opacity-80 mix-blend-screen` unconditionally regardless of whether the
  equipped aura had real overlay art or was still on the opaque fallback
  path — exactly the mistake the frame layer's own code comment three
  lines below it warns against. Flame Aura (the one aura shipped with
  real overlay art) was live, right now, rendering through the wrong
  path. Split it the same way frame already is: overlay path → normal
  blend at ~0.3 opacity, fallback path → unchanged. Live-verified via
  `getComputedStyle` on both paths before and after.
- **Full rollout shipped in 4 category batches (PRs #90-#93)**, each
  investigated on its own merits rather than assuming one crop-box
  hypothesis fit every item in a category:
  - **Badge** (PR #90): crop-based, same pattern as the proof-case item.
    2 of 4 needed a custom crop after the shared hypothesis clipped their
    medallions — caught via visual check before committing.
  - **Background** (PR #91): discovered none of the 4 remaining items had
    the vignette-border problem the proof-case item had — already
    full-bleed. `overlay_image_url` set to the same clean `image_url`
    rather than generating redundant duplicate assets.
  - **Aura** (PR #92): mixed — 2 items had genuine dead margin (cropped),
    2 were already full-bleed (same-path marker, no new asset).
  - **Frame** (PR #93, final): all 4 had baked promo-card text/opaque
    backgrounds that cropping can't remove (confirmed via direct
    inspection — same class of problem the proof-case item had).
    Procedurally generated via Pillow/numpy (rounded-rect border + glow
    + gradient), restyled per frame's theme — RGB channel-split glitch,
    rainbow holo, gold crack lines, Welsh gold/red. Verified via
    checkerboard-composite test (real alpha transparency, no baked text)
    before wiring in, same method proven on the original proof-case item.
- **Verified live, not just deployed**: every batch DB-checked
  (`overlay_image_url` correct per item), regression-tested
  (`pets-portrait-overlay-resolution.spec.ts` + 2 other specs, 18/18 pass
  by the final batch), and live-checked on production after each deploy.
  The highest-value proof: Bolt's actively-equipped Glitch RGB Frame
  (previously showing ghosted "SYS_CRITICAL"/etc. promo text over the
  pet) confirmed rendering clean transparent border art after PR #93.
- **Final state**: `SELECT` confirms all **20/20** pet-slot cosmetics
  (5 each of aura/background/badge/frame) have `overlay_image_url` set.
  Issue #51 is functionally closed; issue #55 (a condensed brief whose
  code tasks turned out to already be shipped from an earlier session)
  has nothing left either. Both left open pending Bro's confirmation to
  close them out.

## 2026-08-17 — Course expanded M1-M20 → M1-M30 (Agent Ops & Guardrails + Token Economies & On-Chain Craft tracks) — full 30-module course now live

Added the final 10 course modules (M21-M30), closing out the arc started
by the M13-M20 batch earlier the same day. Shipped in 3 reviewable
batches (PRs #85, #86, #87), same exact migration pattern as every prior
batch — no new infra, no backend logic changes beyond the two
prerequisite fixes below.

- **Two prerequisite bugs fixed before content shipped, both confirmed
  with Bro first**:
  1. `Pricing.tsx`'s Hyper Legend tier copy was stale at "M1-M12"/"M13-M20
     Bonus" even after the M13-M20 batch shipped — fixed as its own PR
     (`fix/pricing-hyper-legend-module-count`, PR #83), then updated again
     in the final M27-M30 batch to `M1-M30` now the whole course is live.
  2. **A real hard ceiling in the XP leveling system, found by a Plan
     agent during research**: `complete_module()`'s SQL `case` block and
     `Dashboard.tsx`'s `levelThresholds` both capped out at Level 6 /
     2,000 XP — finishing all 20 modules that existed that morning
     already put a learner at 1,925/2,000, so any M21+ reward would hit
     "max level" 8-9 modules before the course actually ended. A
     **third**, previously-unknown instance of the same bug was found
     live in `HUDContext.tsx`'s top-nav XP bar (`maxXP` was a static
     `1000`, never tied to leveling at all — already visibly broken as
     "1,925 / 1,000" during this session). All three fixed together
     (PR #84), extending the ceiling to Level 8 / 4,000 XP — sized so
     hitting true max XP lines up with finishing the M30 capstone
     (confirmed live: `total_xp=2905` correctly computed `level=7` on
     the real signed-in account after completing M30).
- **No source document for M21-M30, unlike M13-M20** (which adapted
  PR #46's specs) — confirmed via a dedicated repo-wide search before
  authoring that nothing commits to these topics anywhere. Content was
  originated fresh, grounded in real systems this ecosystem already runs:
  multi-agent handoff patterns, Prometheus/Grafana (the same stack this
  ecosystem's own services use), this repo's real `award_tokens()` dedup
  rule, BROskiPets' real on-chain/off-chain split, and the real
  wagmi/rainbowkit `/pets`-only lazy-load isolation rule.
- **Two five-module tracks**: Track A "Agent Ops & Guardrails" (M21
  Multi-Agent Crews, M22 Approval Gates & Guardrails, M23 Watching Your
  Agents: Action Logs, M24 Prometheus + Grafana for Vibe Coders, M25
  Incident Response ND Style) and Track B "Token Economies & On-Chain
  Craft" (M26 Designing a Reward Economy, M27 Building a Living
  Dashboard, M28 On-Chain Basics for Builders, M29 Safe Web3 Integration
  Patterns, M30 Launch Day: Ship Your Empire — the capstone, mirroring
  M11/M12's role for the original 12 modules).
- **Verified live, not just deployed** — same standard as every prior
  batch: at least one real module completion per batch (M21, M22, M23 in
  Batch 1; M24 in Batch 2; M30 in Batch 3), real quiz answers, real
  "Mark as Complete" clicks, DB-verified `content_hash = md5(content)`
  and correct `xp_awarded`/`coins_awarded`/`quiz_score` for every module
  in all three batches before merge.
- Bumped "20 modules" → "30 modules" copy in `LandingPage.tsx`/
  `Welcome.tsx`, held until the final batch (PR #87) so the site never
  claimed a module count that didn't exist yet — same discipline as the
  M13-M20 batch.

Migration pattern per batch (module rows → content → quizzes, strict
order, each layer's `WHERE`/`SELECT` keyed off `code`): see
`supabase/migrations/20260817160000_seed_hv_modules_m21_m23.sql` onward.

## 2026-08-17 — Course expanded M1-M12 → M1-M20 (Builder OS + Vibe Coding Craft modules)

Added 8 new live course modules (M13-M20), shipped in 3 reviewable
batches (PRs #79, #80, #81) following the exact pattern the real M1-M12
modules already use — no new infra, no frontend code changes beyond two
cosmetic "12 modules" → "20 modules" string updates (`LandingPage.tsx`,
`Welcome.tsx`), held until the final batch so the site never claimed a
module count that didn't exist yet.

- **Source material**: PR #46 (`docs/builder-os-m13-m20`, opened by a
  separate assistant session 2026-08-01) contained 8 detailed but
  unadapted specs. Verified real via `gh pr view` before trusting it.
  Content was adapted into the course's actual live template (confirmed
  from the real M1-M12 seed migrations first) rather than merging the
  raw specs — PR #46 closed as superseded once all 8 modules shipped,
  not merged, to avoid a second stale-docs copy sitting in `rewrites/`.
- **One real content bug caught before seeding**: M13's spec header said
  "+100 XP / +50 BROski$" but its own SQL example schema defaulted
  `xp_earned`/`broski_earned` to 10/5 — resolved in favor of the header
  (the schema default described the feature being taught, not the
  module's own reward); checked all 7 other specs for the same class of
  conflict, found none.
- **A real naming collision flagged, not touched**: `scripts/M13-ai-agents-2-0-...md`
  already existed under the same M13 code from an older, unrelated
  numbering track. `script_path` on the new rows points at the real PR
  #46 source file instead, since the live pipeline never reads
  `script_path` at runtime anyway (content lives in `hv_modules.content`,
  not on disk).
- **Zero backend code changes needed** — `get_quiz_for_module()` and
  `complete_module()` were already fully `module_id`-driven with no
  module-count assumption anywhere, confirmed before writing a line of
  content.
- **Verified live, not just deployed**: every one of the 20 modules was
  actually completed for real on the live signed-in account — content
  rendered correctly, all 8 new quizzes scored 100% server-side
  (`answer_index` never leaked to the client), and every `xp_reward`/
  `coin_reward` landed exactly right in `module_completions`/`user_xp`/
  `users.broski_tokens`. `/courses` shows 20/20 complete, M1 through M20
  in correct numeric catalog order.

Migration pattern per batch (module rows → content → quizzes, strict
order, each layer's `WHERE`/`SELECT` keyed off `code`): see
`supabase/migrations/20260817120000_seed_hv_modules_m13_m15.sql` onward.

## 2026-08-17 — Stripe payment path was never real; fixed, proven live with a real transaction

Full detail in `rewrites/NEXT_SESSION_HANDOVER_2026-08-17.md`. Summary:

- **The Stripe webhook has never successfully granted a purchase, in TEST
  or LIVE, since the code was written.** `awardTokensAndUnlock()` /
  `enrollUser()` / `revokeAccess()` / `logUnmatchedPayment()` all wrote to
  columns that didn't exist on the live tables
  (`users.subscription_tier`/`subscription_status`, `enrollments.status`,
  `payments.user_email`, plus a field-name mismatch on
  `amount`/`stripe_payment_intent_id`). Every write failed silently while
  the function still returned `200` to Stripe. Fixed via 3 migrations
  (applied live, committed) + webhook code, redeployed, and **proven with
  a real Stripe TEST purchase → refund** on Lyndz's real account: £29
  Starter buy correctly granted tokens/tier/6 course enrollments, then a
  real refund correctly revoked all 6. PR #76.
- **Two privilege-escalation bugs found and closed along the way**:
  `public.users` and `public.enrollments` both had table-wide `UPDATE`
  grants to `authenticated` (enrollments even to `anon`) with RLS that
  only checks row ownership, not which columns changed — a signed-in user
  could've self-set their own `subscription_tier`/`broski_tokens`/`role`,
  or self-restored a refunded `enrollments.status` back to `active`. Both
  trimmed to the only legitimate client writes (nothing for enrollments,
  `full_name`/`avatar_url` only for users).
- **TEST/LIVE dual-mode webhook secrets** added, with a guard against a
  half-configured LIVE secret silently minting a broken Stripe client and
  granting nothing (`503` instead, so Stripe retries). LIVE cutover is now
  a config-only change.
- **Dropped the Hyper Legend tier's fake "M13 Quantum" promise** (only
  M1-12 are real) and reframed pricing copy honestly across all tiers:
  content is free with any account, these tiers sell BROski$
  tokens/Discord/certificates/status, not module access.
- **Landing page funnel fixed** — primary CTA points at the working
  `/pricing` checkout instead of a waitlist form, "Beta" framing dropped
  from both `LandingPage.tsx`'s own footer and the separate shared
  `components/Footer.tsx` (PR #77, caught by re-checking the live bundle
  after PR #76 merged), dead footer links removed, real Discord invite
  wired in, 3 unverified testimonials removed pending confirmation
  they're real/consented.
- **Separate production fix (Vercel config only, no PR)**: 3 of 5 tiers'
  one-time Stripe Payment Link env vars were misnamed
  (`VITE_STRIPE_BUILDER_URL` vs the stored `VITE_STRIPE_BUILDER_ONE_TIME_URL`)
  — every "Get Builder/Architect/Hyper Legend" one-time button was
  silently broken in production. Fixed, redeployed, all 8 tier checkout
  links verified live.
- **Stripe LIVE mode**: confirmed active on account `acct_1QUHFk2LoEeIEPVE`
  ("WelshDog"), 5 LIVE products exist, but zero LIVE prices attached and
  zero LIVE webhook endpoints — exact checklist (8 prices, 6 events, the
  deployed webhook URL) is in the handover doc. Cutover is pure config
  once Lyndz hands back the LIVE secrets/price IDs.
- **Found, not fixed**: `rewrites/PAY_TEST_RUNBOOK.md` /
  `PRODUCTION_LAUNCH_CHECKLIST.md` / `GO_LIVE_CHECKLIST_2026-05-17.md` are
  all stale (May 2026) — reference a retired `/catalog` flow and the old
  `lyndzwills@gmail.com` account (current real login is
  `lyndzwills00001@hotmail.co.uk` on the rebuilt `tlavrxiaegbtyfmjfdcz`
  project). Don't trust them as-is.

## 2026-08-15 — Wave 1 P1/P2 cleanup + shop→pets freshness bug fixed

Closed out every remaining Wave 1 truth-audit finding that didn't depend on
external (Railway) access. Full detail in
`rewrites/NEXT_SESSION_HANDOVER_2026-08-15.md`; summary here.

- **RPC grant drift fixed (PR #68)** — `claim_level_reward`/`complete_quest`
  were called live but not executable by `authenticated` (confirmed via
  `has_function_privilege`); every level-reward claim and quest completion
  was silently failing. Same class as the `is_admin()` incident. Fixed via
  `supabase/migrations/20260814210000_grant_claim_level_reward_complete_quest_execute.sql`,
  applied live and re-verified.
- **`discord-link` OAuth callback hardened (PR #69)** — origin allowlist was
  missing `https://hypervibe.online` (Discord linking was actually broken in
  prod, not just under-hardened), and `state` was only checked client-side.
  New `discord_oauth_states` table backs a real mint-then-consume
  server-side check (`GET` mints, `POST` consumes) — forged/replayed/
  cross-user states now rejected server-side. Split into `handler.ts` (DI,
  14 `deno test` cases) + `index.ts`. Deployed live (v19), smoke-tested.
- **`waitlist` RLS mismatch fixed (PR #70)** — the landing-page waitlist form
  was silently broken (`deny_all_waitlist_public_insert`, live but never in
  any migration — a deliberate later lockdown, not accidental drift; zero
  rows ever inserted). Put the direction to Lyndz (reopen/retire/merge);
  chose reopen with real validation, matching the pattern this project
  already uses correctly on `early_access_signups`. Smoke-tested live via
  the public anon key.
- **`user_loyalty_tier` grants reviewed and trimmed (PR #71)** — live grants
  were the full Postgres default set (`SELECT/INSERT/UPDATE/DELETE/
  TRUNCATE/TRIGGER/REFERENCES` to both `anon` and `authenticated`), never
  reviewed. `security_invoker = true` (shipped 04-11) already made
  `authenticated` SELECT safe; trimmed to exactly that — `anon` loses
  everything (zero legitimate use, confirmed against every caller including
  the discord bot and two edge functions, all of which use the admin key
  and are unaffected). Verified with `has_table_privilege`.
- **`playtest_responses` reviewed, no action needed** — same policy family
  as `waitlist`, but already correctly scoped (audit's own verdict).
- **`/shop` → `/pets` same-session freshness bug fixed (PR #73)** — not a
  Wave 1 item, an older carryover bug-hunt candidate. `useOwnedCosmetics`
  fetched once on mount only; a purchase completed in a *different* tab
  left an already-open `/pets` tab stale with nothing to signal a refetch.
  The intended fix was already half-written (`refetchCosmetics`
  destructured, comment describing the exact fix) but the actual line was
  `void refetchCosmetics` — a dead reference, not a call. Wired a real
  `visibilitychange` listener. New regression test proves both directions
  (fails on the old code, passes on the fix); full pets suite (23 tests)
  green.

**Found but not fixed:** any anon `SELECT` on `waitlist` or
`user_loyalty_tier` now throws a raw `42501` instead of an empty result,
because `anon` has no `SELECT` grant on `public.users` (needed to evaluate
an existing admin-check policy). Fails closed, doesn't affect any live path
today. Worth a real fix later, not started.

**P0 unchanged:** `V24_API_URL`/Railway access is still blocked — reconfirmed
this session, nothing has changed since 08-06.

## 2026-08-06 — `generate-v2-config` service-auth hardening + honest P0 blocker

Continuation of the 2026-08-06 Wave 1 truth-audit fix pack. The original
auth-lockdown work (browser CORS removed, bearer-JWT path removed,
`X-Sync-Secret` required) was already deployed as version 19 with a clean
`401` negative-path proof. This session added defense-in-depth hardening on
top of that, then hit a genuine external blocker while trying to complete
the live positive-path proof — documented honestly rather than faked.

**Hardening shipped — `supabase/functions/generate-v2-config/`**
- `handler.ts`, `handler_test.ts`, `index.ts`
- Fail-closed config checks extended to `SHOP_SYNC_SECRET`, `V24_API_URL`,
  and admin-key resolution (`resolveAdminKey`, now actually wired to
  `resolveSupabaseAdminKey` in `index.ts` instead of a dummy string).
  Previously only `V24_SYNC_SECRET` was checked before continuing.
- Inbound `X-Sync-Secret` comparison replaced with a SHA-256-digest
  constant-time compare instead of a direct `!==`.
- Discord-link lookup, purchase lookup, downstream provisioning fetch, and
  downstream response parse are now wrapped in try/catch, returning a
  controlled `502` instead of letting a DB/network exception become an
  uncontrolled function failure.
- `deno test` grew from 8 to **17 tests, all green** (9 new: 3 fail-closed
  config variants, 1 equal-length wrong-secret rejection, 4 exception-safety
  cases for the DB/network wrapping, plus admin-key edge cases).
- Deployed live: `generate-v2-config` is now **version 20**, `verify_jwt: false`.
- Committed as `ef62307` and pushed to `feat/pets-cosmetics-visual-polish`.

**P0 blocker found and logged — not faked**
- Running the negative-path check post-deploy returned `503 Service
  misconfigured` instead of the expected `401`, because the new fail-closed
  check correctly caught that `V24_API_URL` has **never been deployed** as a
  live Supabase secret for `tlavrxiaegbtyfmjfdcz` (confirmed via
  `supabase secrets list`: `SHOP_SYNC_SECRET` and `V24_SYNC_SECRET` are both
  live, `V24_API_URL` isn't there).
- Read-only investigation before touching anything:
  - No `V24_API_URL`/host reference anywhere in the `HyperCode-V2.4` repo.
  - The one candidate value (`.env`'s `VITE_HYPERCODE_API_URL
    =https://hypercode-v24-production.up.railway.app`) is confirmed dead —
    Railway returns its own `404 Application not found` for that host.
  - `HyperCode-V2.4/RAILWAY_VARS.md` references a real Railway project
    (`3d66bd92-cac3-4fde-ae9a-07f269b58791`) with documented pause/resume
    commands, implying a real deployment exists — but this session's Railway
    MCP access returned `"you don't have the required role (viewer)"` on
    that project. It exists; it's just inaccessible from this workspace.
  - No matching project on the accessible Vercel team (`BROskis`, 8 projects
    checked) either.
- **Did not** guess a host, set a placeholder, or otherwise fake the proof.
  Logged as a P0 external-dependency blocker in both Wave 1 truth-pack docs
  with the exact safe handoff: whoever holds the Railway access needs to
  open that project, confirm workspace/permissions, resume it if scaled to
  0, verify `/api/v1/access/provision` responds, and hand back only the
  base HTTPS URL (no secrets) so `V24_API_URL` can be set and the proof
  re-run.
- `V24_SYNC_SECRET` itself was never pasted into chat, logged, or exposed —
  handled correctly as a secret-holder-only value throughout.

**Docs updated**
- `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md` — summary counts,
  new P0 entry with full investigation trail, fix-slice list updated.
- `docs/TRUTH_PACK/2026-08-06_wave1_edge_function_matrix.md` — `generate-v2-config`
  row updated with the hardening detail and the operational `503` caveat.

**Fix pack status: not closed.** Code side is done and live. Waiting on
Railway access to a confirmed V2.4 base URL before the positive production
proof can honestly run.

## 2026-08-06 (continued) — PR #57 merged, post-merge audit, 4 real bugs found + fixed

Rest of the same day, after PR #57 (pets cosmetics + Wave 1 audit +
`generate-v2-config` hardening above) merged to `main`. All changes below
went branch → PR → CI → merge → branch deleted (`main` is protected —
direct pushes are rejected).

**PR #57 merged** (`70f75b8`) — pets cosmetics visual polish, frontend QA
fixes, the Wave 1 DB/Edge security audit, and the `generate-v2-config`
hardening, all bundled into one branch. Confirmed live on Vercel
(`hypervibe.online`) immediately after.

**PR #58 — post-merge test report** (`24b03ce`)
Full verification pass: Playwright 264/264 across all 3 browsers (4 initial
failures confirmed flaky on retry, not regressions), `deno test` 17/17,
build/typecheck clean, Supabase security + performance advisors reviewed
(nothing new — all pre-existing/already tracked). Live QA across 8 pages
on `hypervibe.online` with a real signed-in account. Found and documented
(not yet fixed at that point): 4 pre-existing `set-state-in-effect` lint
violations, and a floating "+BROski$" toast overlapping the Sign Out
button. Full report: `docs/POST_MERGE_TEST_REPORT_2026-08-06.md`.

**PR #59 — fixed the 4 `set-state-in-effect` violations** (`ddaf8c5`)
- `usePetMoodSync.ts` (3x — quiz-fail/module-complete/broken-code mood
  triggers) and `useReferralLink.ts` (1x — logout state reset) converted
  from setState-in-effect to React's official "adjust state during render"
  pattern.
- **Gotcha #1**: this repo's `react-hooks/refs` lint rule disallows reading
  `ref.current` during render outside a narrow null-check pattern — had to
  track previous values with `useState`, not `useRef`.
- **Gotcha #2**: an early version deferred `useReferralLink`'s entire fetch
  kickoff (`queueMicrotask`/`setTimeout`, matching the existing
  `useXpEvents.ts` pattern elsewhere in this repo) to satisfy the lint rule
  — this silently broke `referral-rpc.spec.ts`'s network-call-count
  assertion, reproducibly on WebKit only (3/3 fails), because React
  StrictMode's dev-mode double-invoke cancels a deferred kickoff before it
  ever fires on the first pass, roughly halving real network calls vs. the
  original synchronous-and-uncancellable dispatch. Fixed by firing the
  fetch immediately/un-deferred and only deferring the `setLoading`/
  `setError` calls. Verified: 17/17 relevant tests across all 3 browsers
  (including the WebKit case retried 3x clean). Both gotchas saved to
  memory (`hv-course-react-hooks-lint-gotchas`).

**PR #60 — fixed the TokenBurst/Sign-Out toast overlap** (`4e1ee0d`)
`TokenBurst.tsx`'s "+N BROski$" celebration toast was `fixed top-12`,
spilling past HUD's own bar into the Navbar row directly underneath —
visually covering Sign Out for the ~2s it animates. Flagged in an earlier
live review, reconfirmed live on `/pricing` and `/dashboard`. Moved to
`top-3`. Verified with real DOM measurement (a probe element +
`getBoundingClientRect()` against the actual Sign Out button) on the live
site both before and after the fix — not just Tailwind class arithmetic.

**PR #61 — fixed real `/pets` horizontal overflow** (`481ce19`)
Found while auditing a live-reported `/pets` layout complaint.
`Pets.tsx`'s root div used the standard Tailwind full-bleed idiom
(`-mx-4 sm:-mx-6 lg:-mx-8` cancelling a padded ancestor), but walking the
live DOM ancestor chain found **zero padding anywhere** to cancel against
(`Layout.tsx`'s `<main className="flex-grow">` and everything above it are
unpadded) — so the negative margins just inflated the div past the
viewport on the right, causing a real horizontal scrollbar on every page
load. Removed the negative margins entirely (the unpadded `<main>` already
spans full width on its own, so they were never needed). Confirmed via
live `document.documentElement.scrollWidth` vs `window.innerWidth`,
pre-fix and post-fix, in both production and local dev.

**PR #62 — capped `PetMentorBubble`'s panel height** (`c21ce10`)
Same `/pets` audit found the auto-open mentor chat panel geometrically
overlapping the customise panel's "Get more in the shop" link and an
"Equip Hyperfocus Pulse Aura" button — and since the panel is
`pointer-events-auto` (a real interactive chat), those controls were
genuinely unclickable underneath it, not just visually covered. The panel
was bottom-anchored with only its inner message log height-capped
(`max-h-[44vh]`), so it could grow past its bottom-right footprint with
enough message history. Capped the whole panel at
`max-h-[calc(100dvh-7rem)]`. Extended
`frontend/tests/pets-mentor-bubble.spec.ts` with a regression test
(max-height assertion, trial-clicks on the previously-blocked controls,
keyboard-accessibility checks) — 9/9 across all 3 browsers. Re-ran
`learning.spec.ts` as a regression check since this exact component
previously caused a real "Next" button collision on lesson pages (fixed
then by an existing, untouched auto-close-on-scroll safeguard) — 3
Firefox timeouts, retried 6/6 clean, confirmed pre-existing flake.
**Final resolution**: the live regression check could still reproduce
overlap, but only at this session's own broken ~495px-tall browser-tool
test viewport (`resize_window` doesn't actually work in this environment —
see memory `claude-in-chrome-resize-window-broken`); math predicted no
overlap above ~753px real viewport height, and Lyndz confirmed on his
actual screen: no overlap at normal window size. Fix is sufficient as
shipped.

**PR #63 — handover doc brought up to end-of-day state** (`12e553c`)
`rewrites/NEXT_SESSION_HANDOVER_2026-08-06.md` rewritten to cover all of
the above (it previously only reflected the mid-session
`generate-v2-config` state, before PRs #58–#62 existed).

**Net result: 3 real, live-verified frontend bugs found and fixed in one
session, all via live DOM measurement rather than guessed CSS tweaks**
(TokenBurst overlap, `/pets` overflow, PetMentorBubble collision), plus
one pre-existing lint-debt cleanup (4 `set-state-in-effect` violations)
with two non-obvious gotchas now documented in memory for next time.
`generate-v2-config`'s `V24_API_URL` P0 blocker is still open — see the
2026-08-06 handover for the exact unblock steps.

## 2026-08-05 — Active quiz containment + `/pets` live proof + frontend QA docs

This session closed the one meaningful production-verification loose end from
the 2026-08-01 handover, then fixed two small but real frontend UX issues on
top of that. Important split: some work was **verified live in production**,
while some was **fixed and verified locally only** and is not deployed yet.

**Per-pet-XP production proof — completed live**
- The outstanding manual authenticated `/pets` check from the 2026-08-01
  handover is now done on `https://hypervibe.online`.
- Verified on a real signed-in pet-owning account that the hero/evolution UI
  reflects the selected pet's own XP, not just the account total
  (`Luna XP : 414`, Stage Baby, Next target Learner).
- A later live pass on the same real account (after it had 2 pets and more
  shop purchases) also confirmed multi-pet switching works and a real Feed
  action updated Bolt's XP from `0` to `2`.

**Active course-module quiz explanation containment — fixed locally**
- The active `/courses/:slug` flow still accepted and rendered `explanation`
  text from `get_quiz_for_module()` if the backend RPC sent it. The active
  module page now sanitises the payload before storing it and no longer
  renders explanation text in the client UI.
- Failed-quiz copy was tightened so it tells the learner to review the lesson,
  not "review the explanations below".
- Regression added first in `frontend/tests/course-module.spec.ts`, then the
  fix was made in `frontend/src/pages/CourseModule.tsx`.
- Verified locally: full `course-module` Playwright spec green across
  Chromium/Firefox/WebKit + `npm run build` green.
- **Still open separately:** the legacy `/learn/:courseId` lesson-player quiz
  flow was deliberately left untouched on this pass.

**`/pets` UI polish — fixed locally**
- Live QA found a misleading Play empty-state message: `/pets` could say
  "You don't have any toys yet" while `/shop` showed owned generic toys like
  Laser Pointer / Code Ball / The Deploy Button.
- Important nuance: this was fixed as a **copy/expectation** issue, not by
  pretending generic shop toys are automatically pet-care-compatible. The
  empty-state now says `play items`, which matches the actual frontend rule.
- The mini pet-picker cards also had weak/inconsistent browser semantics when
  selected. `HVZCard` now exposes `aria-pressed` for clickable selected cards,
  so the chosen pet is no longer just visually highlighted.
- Regressions added first:
  - `frontend/tests/pets-care-actions.spec.ts`
  - `frontend/tests/pets-selection.spec.ts`
- Fixes landed in:
  - `frontend/src/components/pets/PetCareSection.tsx`
  - `frontend/src/components/ui/hvz/HVZCard.tsx`
- Verified locally: affected pets suite green across Chromium/Firefox/WebKit
  (`27` tests) + `npm run build` green.

**Session docs brought back into sync**
- Added fresh operational truth docs for this session:
  - `rewrites/SESSION_SNAPSHOT_2026-08-05.md`
  - `rewrites/NEXT_SESSION_HANDOVER_2026-08-05.md`
- Those docs explicitly separate:
  - what was verified live in production
  - what was fixed and verified locally only
  - what still remains open next session

**Quick local browser smoke — green**
- Ran a lightweight local browser smoke against the patched frontend on
  `http://localhost:4173`.
- Confirmed `/`, `/pets`, and `/courses` render without a blank screen or
  fatal runtime crash.
- One non-fatal wallet/provider-related console abort was observed on
  `/pets`; it did not block rendering.

## 2026-07-31 → 2026-08-01 — `/pets` Moy-style reskin + per-pet XP

Two linked pieces of work on the BROski Pets page, run back to back.

**Full visual reskin of `/pets` toward a pastel/chunky pet-sim look**
(PR #37, #40) — new `pet-*` Tailwind token namespace + a scoped
`.pet-theme-scope` CSS-var override block that cascades into the shared
`HVZCard`/`HVZButton`/`HVZTag`/`HVZProgress` primitives with zero edits to
their internals (so Shop/Tokens/Profile/Landing render identically).
Layout changed from "grid of equal pet cards" to a single hero-pet
spotlight + a demoted horizontally-scrollable mini-card picker strip.
Shipped in rounds against live user QA feedback (duplicate sections, an
XP-number duplication bug, layout rebalancing, hero-card sizing, an
Evolution Path "Baby row" fix) — PR #40 closed those out plus a
pre-existing `PetMentorBubble` collision bug (the auto-opened chat panel
could block a lesson page's "Next" button).

**Per-pet XP** (spec: PR #39, plan: PR #41, implementation: PR #42) — every
BROskiPet now earns its own XP instead of all of a user's pets sharing one
account-wide bar. A Postgres trigger (`trg_fan_out_pet_xp` on `user_xp`)
fans every `total_xp` increase out to all of that user's `pets.xp` rows;
`evolve_pet()` now gates on the pet's own `xp`, not the account total. No
backfill — existing pets start at `xp = 0` and earn forward from here
(deliberate design choice, documented in the spec).

Built via full spec → plan → `subagent-driven-development`: 4 tasks, each
implemented and reviewed independently, then a mandatory final
whole-branch review (dispatched on the most capable model) caught a real
**Critical** bug none of the per-task reviews could see because it spanned
a file no task touched — `EvolveButton.tsx` was still gating on the old
account-wide XP, so it would show an "Evolve" button the server then
rejected. Fixed, regression-tested (the fix was mutation-verified by the
re-reviewer — reverted it and confirmed the new test goes red), and
independently re-reviewed clean before merge.

- Also fixed along the way (PR #38, ahead of the full per-pet-XP work):
  `evolve_pet` was reading the wrong XP pool entirely — a same-day hotfix
  that the later per-pet-XP migration then built on top of correctly.
- **Known open item**: the plan's manual authenticated-UI check (log in as
  a real user who owns a pet, confirm the hero card/evolution path reflect
  that pet's own XP) was never completed — no real login credentials
  available in the agent environment. Flagged in PR #42's description;
  worth doing on the next real session, live on `hypervibe.online`.
- A stray uncommitted local edit to `PetCard.tsx` (same content that PR
  #42 already shipped) got committed directly to local `main` outside the
  PR flow and correctly rejected by GitHub's branch protection on push;
  local `main` was reset to `origin/main` to clear it — no functional
  change lost, since the content was already identical.

## 2026-07-31 — `cogs/signups.py` `subscription_tier` bug fixed and live-verified

The one open item from the 07-30 bot deployment (below): the "Catch
Stragglers" notifier queried `users.subscription_tier`, a column that has
never existed on `public.users` — confirmed live via Supabase MCP
(`42703 column "subscription_tier" does not exist`). Tier is actually
computed by the `public.user_loyalty_tier` view (same source
`course-profile` Edge Function already reads correctly) — `signups.py` was
the only consumer still assuming a raw column.

- Added `db.get_new_signups(since)`: fetches new `users` rows, then
  batch-queries `user_loyalty_tier` for each user's real `tier`, merging
  before returning. `signups.py` now calls `db.get_new_signups(...)`
  instead of querying `_client` directly — matching the `db.func()`
  convention every other cog already follows.
- Shipped via `fix/signups-subscription-tier` → PR #35 → merge (`db68131`),
  the required branch-protected flow.
- **Verified live**: Railway auto-redeployed on the `main` merge
  (deployment `8e7af80a`, `SUCCESS` in ~66s); runtime logs show all 5 cogs
  loaded and the new query hitting Supabase with the corrected column list,
  returning `HTTP/2 200 OK`.

## 2026-07-30 — BROski Course Bot deployed live for the first time (Railway)

`discord-bot/` (Python `discord.py` gateway bot — `/link`, `/xp`,
`/xp-leaderboard`, `/quest`, `/badges`, weekly quest auto-post, badge-unlock
announcements) had existed in the repo but was never deployed anywhere.
Investigated first (found no Dockerfile/Procfile/Railway config for it, and
a Railway project someone assumed was it — `broski-bot` in `HyperCode-V2.4`
— turned out to be a different repo entirely, itself pointed at a Supabase
project deleted 2026-07-18, unrelated, flagged not fixed).

- Migrated off `SUPABASE_SERVICE_ROLE_KEY` to a scoped named secret key
  (`discord_bot`), renamed to `SUPABASE_ADMIN_KEY` in code so the name
  itself signals it isn't the legacy key.
- Deployed to a new dedicated Railway project (`hyper-vibe-discord-bot`).
- Three real bugs hit and fixed during first deploy, each root-caused
  properly rather than guessed at:
  1. `ModuleNotFoundError: No module named 'audioop'` — Python 3.13
     (Railway default) removed it from stdlib; `discord.py==2.3.2` still
     imports it unconditionally. Fixed via `RAILPACK_PYTHON_VERSION=3.12`
     (first tried `NIXPACKS_PYTHON_VERSION`, which silently no-opped —
     this project's builder is Railpack, a different override var,
     confirmed via Railway's own docs).
  2. `discord.errors.LoginFailure: Improper token has been passed` — first
     token value was missing its trailing character. Fixed with a freshly
     reset token from the Discord Developer Portal.
  3. `SupabaseException: Invalid API key` — thrown client-side, before any
     network call. `supabase==2.4.0` predates the `sb_secret_*` key format
     and rejects anything not shaped like a legacy JWT. Bumped to `2.31.0`
     (verified `db.py`'s actual usage is core, stable PostgREST-client API,
     unchanged across that range).
- **Verified fully live** via real Discord gateway logs: logged in as
  `BROski Course Bot#7951`, 10 slash commands synced to the guild, all 5
  cogs loaded.
- **Found, not fixed**: `signups` cog's background task queries
  `users.subscription_tier`, a column that doesn't exist — doesn't crash
  the bot, but the "Catch Stragglers" notifier silently never fires.

## 2026-07-30 — Security hardening marathon: live exploit closed, corrupted commit caught, all 8 Edge Functions off the legacy key

Full detail lives in `CHANGELOG.md` `[Unreleased]` and
`rewrites/NEXT_SESSION_HANDOVER_2026-07-30.md`. Summary:

- **Closed a live token-economy exploit.** `complete_module()` trusted a
  client-computed quiz score and awarded full XP/BROski$ for any module_id
  regardless of score — a signed-in user could script-loop every module and
  mint unlimited rewards. Rebuilt to grade answers server-side against the
  real answer key (new `get_quiz_for_module()` RPC strips `answer_index`
  before it reaches the browser) and gate reward on ≥70%, matching the UI's
  own "Passing score: 70%" label that was never actually enforced. Verified
  live: a real failing attempt (0%) wrote nothing and granted nothing; a
  real passing attempt (100%) granted the exact XP/coin amounts.
- **`mc_missions` RLS** — any authenticated student had full read/write/
  delete on the admin-only ops table; now gated by `is_admin()`.
- **`get_or_create_referral_code()` / `hv_quizzes`** — closed a leftover
  `anon` execute grant and an anon-readable quiz-answers policy.
- **Found and fixed a `shop-purchase` CORS bug** (unrelated to the above):
  `Access-Control-Allow-Headers` was missing `apikey`/`x-client-info`, which
  every `supabase.functions.invoke()` call sends automatically — preflight
  always succeeded, but the browser silently refused to send the real
  request, so purchases were failing with zero server-side trace. Fixed,
  verified live with a real purchase.
- **Caught and fixed a corrupted commit on `main`** (`84ddd2b`, a stray
  GitHub web-editor paste that wiped `discord-link/index.ts` to one line)
  — restored to match the already-live deploy, then **added branch
  protection** (`enforce_admins: true`, PR required for everyone including
  the owner) so a repeat can't land on `main` unreviewed again. See
  `CLAUDE.md` §4 for the new required push flow.
- **Migrated all 8 Edge Functions off `SUPABASE_SERVICE_ROLE_KEY`** onto
  scoped named secret keys via the shared resolver
  (`supabase/functions/_shared/supabaseAdminKey.mjs`): `stripe-webhook`,
  `shop-purchase`, `discord-link`, `generate-v2-config`, `mint-pet-auth`,
  `mint-pet-confirm`, `course-profile`, `sync-tokens-to-v24`. Every one
  deployed and verified against production, not just theorized. Two of
  them had real access-control bugs fixed alongside the key swap:
  - `course-profile` had zero caller-identity check — any signed-in
    student could query any other student's `discord_id` and get back
    their BROski$ balance/tier/XP/email. Switched to a service-to-service
    shared-secret model (it was never meant to be end-user-facing —
    confirmed via `RISK_FLAGS.md` that the intended caller is V2.4's own
    backend, which currently doesn't even exist as a live integration).
  - `sync-tokens-to-v24` accepted any POST claiming to be a Supabase DB
    webhook with no verification — forgeable token-award requests. Added
    a `WEBHOOK_SECRET`/`X-Webhook-Secret` check. (Confirmed via
    `information_schema.triggers` that the DB Webhook trigger doesn't
    exist yet either — zero live traffic, safe to harden outright.)
- **Investigated the remaining legacy consumers** (`discord-bot/`,
  `agents/course-content-agent/`, `scripts/Test-ShopPurchase.ps1`) — all
  three are dormant/local-only, not deployed anywhere. Left as-is; migrate
  whenever they actually go live. Separately (different repo, not touched
  here): found `HyperCode-V2.4`'s `broski-bot` container has been running
  for a while pointed at the Supabase project that was deleted 2026-07-18
  (`yhtmuibgdnxhbgboajhc`) — explains its ongoing health-check failures.
  Flagged for a future `HyperCode-V2.4` session.

## 2026-07-28 — Referral-code RPC hardened against cross-user UUID targeting

The referral-link RPC is now locked to the signed-in user and no longer accepts
an arbitrary UUID from the client. This closes the IDOR-shaped hole where a
future execute grant on `get_or_create_referral_code(p_user_id uuid)` would have
let a caller target another user's referral-code row.

- **Root cause:** the original referral migration created
  `public.get_or_create_referral_code(p_user_id uuid)` as a
  `SECURITY DEFINER` function in `public`, but the function body trusted the
  caller-supplied UUID completely. That meant the function shape itself was
  unsafe even before the missing-grant issue was fixed.
- **DB fix shipped as one migration:**  
  `supabase/migrations/20260728215609_harden_referral_code_rpc.sql`
  - explicitly drops the old `public.get_or_create_referral_code(uuid)`
  - creates `public.get_or_create_referral_code()` with **no args**
  - binds `v_user_id` to `auth.uid()`
  - raises a clear exception for unauthenticated calls
  - keeps `SECURITY DEFINER`, but narrows exposure with  
    `REVOKE ALL ... FROM PUBLIC` and  
    `GRANT EXECUTE ... TO authenticated`
  - uses `SET search_path = pg_catalog, public`
- **Frontend callers updated:** the three user-facing referral surfaces now call
  the zero-argument RPC only:
  - `frontend/src/pages/Welcome.tsx`
  - `frontend/src/pages/Dashboard.tsx`
  - `frontend/src/pages/TokensPage.tsx`
- **Test-first proof added:** new focused Playwright regression
  `frontend/tests/referral-rpc.spec.ts` first failed against the old body shape
  because the request still posted `p_user_id`, then passed once the callers
  were switched to `supabase.rpc('get_or_create_referral_code')`.
- **Live verification against project `tlavrxiaegbtyfmjfdcz`:**
  - authenticated temp user call #1 → `200` with code `BROB1DCB353`
  - authenticated temp user call #2 → `200` with the **same** code
  - anonymous call → `400` / `P0001` with message  
    `"Authentication required to get or create a referral code."`
  - attempted old-shape call with `p_user_id` → `404` / `PGRST202`  
    (`Could not find the function ... (p_user_id) in the schema cache`)
  - temp probe user was deleted after verification
- **Deployment/apply path:** the first Supabase MCP `apply_migration` path timed
  out while initializing the history table, so the migration was applied via
  the repo-approved fallback connector `supabase_apply_migration` against the
  same live project. No `supabase db push` used.

## 2026-07-28 — Profile progress now tells the truth for hv_modules users

The `/profile` page no longer tells a user with real hv_modules completions that
they have `0 Courses` just because the legacy `enrollments` table is empty.
Fixed as a read-side-only change, exactly per the architecture decision: **treat
`module_completions` as the source of truth for hv_modules progress, do not backfill
`enrollments`, and do not mint fake achievements.**

- **Root cause:** `Profile.tsx` was reading only `public.enrollments` and
  `public.achievements`, which are the older lesson/course surfaces. The real
  hv_modules quest path (`/courses/:slug` → `complete_module()`) writes
  `module_completions`, `user_xp`, `users.broski_tokens`, and `xp_events` — so
  a learner could have genuine module progress and still see a misleading zero
  in Profile.
- **Fix:** added a tiny read-side adapter
  (`frontend/src/lib/profileProgress.ts`) and wired `Profile.tsx` to do two
  extra direct client reads that match existing repo patterns:
  `hv_modules` for total module count and `module_completions` for the signed-in
  user's completed count. No RPC, no view, no schema change, no write-path change.
- **UI now separates truthfully:** the stat strip shows `Progress` (`3/12`,
  etc.) instead of pretending hv_modules are legacy purchased courses, while
  the existing `Badges` stat still reflects only real `achievements`. The
  `My courses` empty state now explicitly says legacy enrollments live there and
  shows the learner's real module progress instead of a misleading blank state.
- **Legacy behavior preserved:** the legacy enrollment list still reads
  `public.enrollments`, and badges still read `public.achievements`. This fix
  does **not** bridge the two systems and does **not** auto-award anything.
- **Verification:** a new unit test covers the progress-summary adapter
  (`frontend/unit-tests/profileProgress.test.ts`), a mocked Playwright regression
  covers the signed-in `/profile` route
  (`frontend/tests/profile-progress.spec.ts`), and the frontend production build
  is green. Full app `tsc --noEmit` is still red in unrelated pre-existing files
  (`src/hooks/useOwnedCosmetics.ts`, `src/pages/LessonPlayer.tsx`) and was not
  changed by this fix.

## 2026-07-25 — Module completion write path: root-caused + fixed + verified live

A live QA pass ("befor beta testing report" / Comet bug report) flagged module
completion as launch-blocking: clicking "Mark as Complete" looked like it worked
(button went active, no error) but wrote nothing — no XP, no BROski$, no completion
record. Traced, root-caused, fixed, and shipped as `3a04d0c`, pushed to `origin/main`.

- **Third instance tonight of the same missing-EXECUTE-grant pattern** as
  `is_admin()` and the still-open `get_or_create_referral_code()` finding —
  `public.complete_module(uuid, integer)` is SECURITY DEFINER but `authenticated`
  had never been (re-)granted EXECUTE. Confirmed via the live network response:
  `{"code":"42501","message":"permission denied for function complete_module"}`.
  Notably, the *original* migration (`20260426220000_module_completion.sql`)
  already contained the correct grant — this is migration-history-vs-live-DB
  drift (same class as the tlav rebuild history), not a developer oversight.
  Re-granted and migration-tracked:
  `supabase/migrations/20260724231130_grant_complete_module_execute.sql`.
  Safe to grant — same shape as `is_admin()`: no caller-supplied `user_id`, only
  ever acts on `auth.uid()`.
- **Frontend was silently masking the failure** — `useModuleCompletion.ts` caught
  the RPC error and returned a fake `{status: 'already_completed'}`, and the
  caller flipped `isCompleted` to `true` on that status too. A hard permission
  failure and a real completion looked pixel-identical on screen while the
  database recorded nothing. Fixed: the hook now throws the real error;
  `CourseModule.tsx` catches it into a dedicated `completionError` state with an
  inline "That didn't save — nothing was lost, give it another try" message
  (kept separate from the page-level `error` state, which is for load failures
  and would otherwise nuke the whole module view on a completion-click failure).
- **`/pets` "Recent activity" fixed as a same-session follow-up** — the XpFeed
  component reads `public.xp_events`, which already had a `module_complete`
  event mapping ready to render but nothing ever inserted into it.
  `complete_module()` now logs an `xp_events` row alongside its existing writes
  (`amount` = BROski$ coins, matching what `EventRow` renders):
  `supabase/migrations/20260724232353_complete_module_logs_xp_event.sql`
  (`CREATE OR REPLACE`, same OID, grant preserved — verified).
- **Verified live end to end, twice** — completed two real modules (M1, M2)
  through the actual UI. RPC returns `200` with real `{status, xp, coins}`;
  `module_completions`/`user_xp`/`users.broski_tokens`/`xp_events` all show the
  correct rows; `/courses` progress ticks up, module card shows "✓ Quest
  complete"; `/pets` Recent Activity shows "📚 Module complete · +N BROski$";
  all of it persists across a full page reload.
- **First real pet minted on this account, verified across all four layers**
  (chain, DB, IPFS, UI) — Luna the Blizzard Lizard, Base Sepolia, contract
  `0x4daF9e1e...73A69a`, token ID 3. RPC receipt shows a genuine ERC-721 mint
  (status success, Transfer from the zero address); a live `ownerOf(3)` call
  confirms current custody, not just mint history; pinned IPFS metadata
  matches the DB row; block timestamp and DB `created_at` agree to within 2
  seconds. Bonus proof point: 5 real `module_complete` entries in her Recent
  Activity feed from actual use, confirming the completion-bug fix above holds
  under real usage. **Minor cosmetic note, not a bug:** the pinned metadata's
  "Minted At" trait is a shared baby-stage template placeholder (reads May
  2026), not per-token — harmless now, would need real per-token timestamps if
  rarity/provenance tooling is ever built on top of that trait.
- **Flagged, not fixed — needs its own scoped task, not a same-session patch:**
  `/profile` still shows "0 Courses / 0 Badges" for hv_modules completions.
  That stat block and the "My courses" list read `public.enrollments`/
  `public.achievements` (the older lesson-based system, `LessonPlayer.tsx` /
  `/learn/:courseId`), which `complete_module()` never touches. This is an
  architecture question — which system is source of truth for "a course" —
  not a bug, and deserves a deliberate decision rather than a rushed bridge.
- **Queued, not urgent:** given three separate functions tonight (`is_admin()`,
  `complete_module()`, and the still-open `get_or_create_referral_code()`) all
  hit the identical migration-history-vs-live-grant drift, a full audit —
  diff every `GRANT`/`REVOKE` statement across migration history against
  `has_function_privilege()` on the live DB for every SECURITY DEFINER
  function — would catch any other silently-broken function before a user
  finds it. Worth doing, not blocking anything right now.

## 2026-07-24 — Auth hardening batch (beta-readiness upgrade)

Root-caused and fixed the login incident from earlier the same day, then closed out
all three follow-up items in order. Shipped as `89b2793`, pushed to `origin/main`.

- **`is_admin()` grant is migration-tracked, not just a live SQL fix** — the ad-hoc
  `GRANT EXECUTE` that unblocked every user's login is now
  `supabase/migrations/20260724182817_grant_is_admin_execute.sql`, so it survives a
  future schema reset instead of silently regressing.
- **Password reset is complete end to end** — `ForgotPassword` + `ResetPassword`
  added to `frontend/src/pages/Auth.tsx`, routes wired in `App.tsx`. This was the
  actual missing piece behind the original incident (recovery email worked, but
  there was no page to land on). Verified live against `tlavrxiaegbtyfmjfdcz`:
  real recovery email sent, real recovery link clicked through, password updated,
  redirected to `/dashboard`. Expired-link state and duplicate-password rejection
  also verified.
- **`/signup` 500 (duplicate key on `users_email_key`) is root-caused and
  recurrence-protected** — `public.users` had a `UNIQUE(email)` but no FK back to
  `auth.users`, so a deleted auth account left a permanent orphan profile row that
  blocked that email from ever signing up again. Found 4 live orphans (incl.
  `lyndzwills@gmail.com` — the exact signup that was failing), confirmed zero
  dependent data on any of them, deleted them, and added
  `users_id_fkey ... REFERENCES auth.users(id) ON DELETE CASCADE`
  (`supabase/migrations/20260724184328_fix_signup_orphaned_profiles.sql`) so this
  class of bug can't recur.
- **Found but deliberately NOT fixed the same way:** `get_or_create_referral_code(p_user_id uuid)`
  has the same missing-EXECUTE-grant 403 as `is_admin()` did, but it isn't safe to
  blanket-grant — it takes an arbitrary `user_id` with no internal check against
  the caller, so a naive grant would let any signed-in user overwrite someone
  else's referral code. **Next task: a real code fix (validate `p_user_id = auth.uid()`,
  or drop the parameter), not another permission patch.**

## 2026-07-19 — Quizzes re-seeded from git (root-cause fix)

- **hv_quizzes was empty after the yhtmui→tlav rebuild** — quiz content had only ever
  lived in the old DB, never in git, so the rebuild lost it. **Root fix:** quiz content
  is now a committed seed migration (`supabase/migrations/20260718210000_seed_hv_quizzes.sql`),
  so it survives future rebuilds.
- **M3 (🎤 Prompt Like a Pro) + M4 (🏗️ Build Your First App) live on tlav** — 5 questions each,
  keyed to the correct live modules, applied idempotently. Disk = DB.
- **Caught two drift traps before applying:** (1) master-pack numbering ≠ live tlav numbering
  (a new intro module shifted everything down); (2) matching titles hid *different lesson content* —
  questions were rewritten from the LIVE lesson text (`scripts/_archive/M3-*.md`, `M4-*.md`),
  every answer grounded in a real line. **Lesson: verify content, not the label.**
- **Still open:** M1, M2, M5–M12 `hv_quizzes` (author from live content — HELD list in the seed file);
  the separate `quiz_questions` lesson-level system is still empty. See `docs/QUIZ_SEED_HANDOFF_2026-07-18.md`.

## Done & Locked — Do NOT re-suggest

- Course platform architecture: Supabase + Vercel + Web3
- Frontend dev command: `npm run dev:frontend` (NOT `npm run dev`)
- Sacred import rules enforced: `from app.X import Y`
- .env files never committed to git
- Stripe webhook rate-limit exempt confirmed

## Sacred Rules (NEVER break)

- `npm run dev:frontend` — NOT `npm run dev`
- `.env` files — NEVER committed to git
- Stripe webhook — rate-limit EXEMPT, always
- `from app.X import Y` — NEVER `from backend.app.X`
