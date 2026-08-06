# Post-Merge Test Report — 2026-08-06

> Scope: full verification pass after merging PR #57 (`70f75b8` on `main`) —
> pets cosmetics polish, frontend QA fixes, the Wave 1 DB/Edge security
> truth audit, and `generate-v2-config` auth hardening. Covers automated
> tests, static checks, database/edge advisors, and live production QA on
> `hypervibe.online`.

## TL;DR

| Area | Result |
|---|---|
| Frontend Playwright suite | ✅ 264/264 passing (3 browsers; 4 initial flakes confirmed non-reproducing on retry) |
| `generate-v2-config` deno tests | ✅ 17/17 passing |
| TypeScript typecheck | ✅ clean, 0 errors |
| Production build | ✅ succeeds (57s), 1 pre-existing third-party warning, unrelated to this session |
| ESLint | ⚠️ 22 problems, **all pre-existing**, none in files this session touched |
| Supabase security advisors | ⚠️ 8 findings, all already known/tracked in the Wave 1 truth audit |
| Supabase performance advisors | ⚠️ 88 findings, pre-existing DB-wide backlog, unrelated to this session |
| Live site (`hypervibe.online`) | ✅ healthy, real signed-in QA pass, no new console errors |
| `generate-v2-config` live behavior | ✅ auto-redeployed to v21 on merge, confirmed identical to tested v20 (still safely `503` pending `V24_API_URL`) |

No regressions found from this session's shipped work. Everything flagged below is either pre-existing or informational.

---

## 1. Automated test suites

### 1.1 Frontend Playwright — full suite

`npx playwright test` (all 24 spec files × 3 browser projects: Chromium, Firefox, WebKit).

- **First full run:** 264 tests, **260 passed / 4 failed**, 22.5 minutes.
- Failures: 1 in Chromium (`shop.spec.ts:542`, agent-access polling), 3 in Firefox (`pets-care-actions.spec.ts:205` and `:225`, `pets-xpfeed.spec.ts:104`). **WebKit ran 100% clean.**
- All 4 failures were `Test timeout of 60000ms exceeded` on toast/fake-timer assertions — the signature of worker contention under `fullyParallel: true` with a single dev server, not a logic defect.
- **Retried all 4 individually** (plus their Chromium counterparts where applicable): **8/8 passed**, 12–47s each — no timeouts. Confirms flake, not regression.
- **Effective result: 264/264.**

None of the 4 flaky tests are in files this session's PR modified except `pets-care-actions.spec.ts`, which was already green in the 2026-08-05 session per `WHATS_DONE.md` — consistent with a pre-existing timing sensitivity in that spec, not something introduced today.

### 1.2 `generate-v2-config` — Deno contract tests

`deno test supabase/functions/generate-v2-config/handler_test.ts` — **17/17 passing**, run twice (once during the hardening work, once fresh for this report). Covers method/auth/schema gates, fail-closed config checks, constant-time secret comparison behavior, Discord-conflict/qualifying-purchase logic, and exception-safety on DB/downstream failures.

### 1.3 TypeScript

`npx tsc --noEmit` — **clean, zero errors.**

### 1.4 Production build

`npm run build` — **succeeds**, 57.03s, 3055 modules. One warning, pre-existing and unrelated to this session:

```
[INVALID_ANNOTATION] A comment "/*#__PURE__*/" in
"node_modules/@base-org/account/node_modules/ox/_esm/core/Base64.js"
contains an annotation Rolldown cannot interpret due to its position.
```

This is a third-party dependency issue (Rolldown's dead-code-elimination parser vs. a `@base-org/account` transitive dep), not app code. Non-blocking.

### 1.5 ESLint

`npm run lint` — **22 problems (12 errors, 10 warnings)**. Checked every flagged file against PR #57's diff — **none were touched by this session's work.** All pre-existing on `main`:

- **`tests/shop.spec.ts`** — 8 errors: 7× `prefer-const` on `purchases`, 1× unused var `frameCard`. Test-file-only, cosmetic.
- **`src/hooks/usePetMoodSync.ts`** (3 errors) and **`src/hooks/useReferralLink.ts`** (1 error) — `react-hooks/set-state-in-effect`: calling `setState` synchronously inside a `useEffect` body.

  Worth flagging specifically: `AGENT-START.md`'s own "Load-bearing rules" table calls this out — *"`set-state-in-effect` = lint fail — Hard commit block — avoid entirely."* Four instances currently exist on `main` in violation of that stated rule. Not introduced this session, but since the rule exists specifically to be enforced, it's worth a follow-up pass to fix these four call sites (each is a simple pattern: move the `setState` call out of the `useEffect` body into the event/callback that triggers the condition, or derive the value during render instead).
- Remaining warnings: `@ts-nocheck`/`@ts-ignore` usage, a few `any` types, and one `react-hooks/exhaustive-deps` missing-dependency warning — all low-severity, all pre-existing.

---

## 2. Database & Edge Function advisors (Supabase `tlavrxiaegbtyfmjfdcz`)

### 2.1 Security advisors — 8 findings, all already tracked

- 1× `INFO`: `hv_quizzes` has RLS enabled with no policies — matches the Wave 1 truth audit's documented "intentional, quiz access goes through RPC not direct table reads" note.
- 7× `WARN`: `SECURITY DEFINER` functions executable by `authenticated` (`complete_module`, `equip_pet_cosmetic`, `evolve_pet`, `get_or_create_referral_code`, `get_quiz_for_module`, `is_admin`, `unequip_pet_cosmetic`, `use_care_item`) — these are exactly the functions the Wave 1 truth audit already catalogued as the intentional browser-callable RPC surface (`docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`, Function grant audit section). Nothing new.
- 1× `WARN`: leaked-password protection disabled — already tracked in memory as Pro-gated/deferred pending funds.

**No new security findings from this session's changes.** `generate-v2-config` doesn't appear here because it's an Edge Function, not a PostgREST RPC — its posture is covered separately in the truth-pack docs.

### 2.2 Performance advisors — 88 findings, pre-existing backlog

56× `multiple_permissive_policies`, 30× `unused_index`, 1× `unindexed_foreign_keys`, 1× `auth_rls_initplan`. All are database-wide RLS/index hygiene items unrelated to anything shipped this session (pets cosmetics migration, `generate-v2-config`). Not itemized individually here — this is an existing backlog, not new debt.

---

## 3. Live production verification (`hypervibe.online`)

### 3.1 HTTP-level smoke

`/`, `/pets`, `/courses` all return `200` via Vercel, correct SPA shell (title, meta, hashed asset refs), referenced JS/CSS bundles load `200`.

### 3.2 Authenticated browser QA (real signed-in account, Lyndon)

Visited and screenshotted: `/`, `/pets`, `/courses`, `/shop`, `/leaderboard`, `/dashboard`, `/pricing`, `/vibe-labs/level-1`. All render correctly with real live data (Level 4, 825 XP, 1,838 BROski$, 2 pets — Bolt & Luna, 12/12 module progress).

**Pets cosmetics — the core of this session's PR — verified directly:** zoomed in on Bolt's portrait with Frame + Aura equipped. Overlay renders as a translucent glow/border around the pet, not an opaque card covering him. This is exactly the bug class the Dark Lab/Flame Aura/Holo Badge overlay-crop work (and the earlier #50/#52 fixes) targeted — confirmed working correctly live.

**Console:** only one recurring warning across every page — `[Reown Config] Failed to fetch remote project configuration... HTTP status code: 403` (WalletConnect/AppKit remote config). This matches the pre-existing "non-fatal wallet/provider-related console abort" already noted in the 2026-08-05 handover. No new errors anywhere.

### 3.3 Investigated: floating "+BROski$" badge over "Sign out"

An earlier live review (`docs/Live reviews/BROski live review1`) flagged a "leftover toast/notification that isn't dismissing" overlapping the Sign Out button on Pricing/Leaderboard/Dashboard. I reproduced it on `/dashboard` and watched it directly:

- It **does** appear and **does** visually overlap the Sign Out button on page load.
- It is **not permanently stuck** — it cleared on its own within ~8–10 seconds in this test.

So the original "isn't dismissing" characterization is out of date / was likely caught mid-animation. Still a real, minor issue: for those ~8–10 seconds, the toast sits directly on top of a nav button a user might want to click. Low severity, but a legitimate small UI polish item (either reposition the toast or give Sign Out a higher stacking context) — not blocking, not part of this session's scope, just documenting since I had it in front of me.

### 3.4 Observation: homepage hero "YOUR ZONE · LIVE" panel

On a logged-out homepage view (nav showed "Sign in" / "Start free", not the authenticated nav), the hero section's "YOUR ZONE · LIVE" panel displayed static example stats (Lvl 7, 2,840/4,000 XP, 12-day streak) that don't match the real signed-in account's actual state (Level 4, 825 XP, 0-day streak) seen elsewhere. Given the nav confirmed that view was logged-out, this reads as an intentional marketing mockup/demo panel rather than a data-binding bug — but labeling static example data "LIVE" is a slightly misleading copy choice worth a second look if it wasn't intentional. Flagging as a copy nit, not a functional bug — I don't have evidence it's broken, only that the label is potentially confusing.

### 3.5 `generate-v2-config` live redeploy check

Merging PR #57 triggered Supabase's GitHub integration to auto-redeploy `generate-v2-config` again — it's now **version 21** (was v20 from my manual deploy earlier in the session), `verify_jwt: false`, `updated_at` matching the merge time. Re-ran the negative-path check against v21: identical behavior to v20 — `503 Service misconfigured` (still correctly fail-closed pending the external `V24_API_URL` blocker, no regression from the redeploy).

---

## 4. What's still open (unchanged by this report)

- `V24_API_URL` P0 blocker — unresolved, external dependency, tracked in `docs/TRUTH_PACK/2026-08-06_wave1_db_edge_truth_audit.md`.
- Wave 1 truth audit P1/P2 items (RPC grant drift, `discord-link` callback hardening, etc.) — unchanged.
- `set-state-in-effect` lint violations (4 instances, pre-existing) — worth a small follow-up pass given it's a documented hard-block rule.
- Toast/Sign-out button overlap on dashboard load (~8-10s) — minor, pre-existing, not part of this session's scope.

## 5. What this report adds no new risk to

Nothing in this verification pass surfaced a regression from PR #57 or the `generate-v2-config` hardening. The 4 Playwright flakes were confirmed non-reproducing. Build, typecheck, and both edge/DB advisor categories are clean or match already-documented pre-existing state.
