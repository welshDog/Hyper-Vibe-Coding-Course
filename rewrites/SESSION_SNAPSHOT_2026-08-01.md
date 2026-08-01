# Session Snapshot — 2026-08-01
> Last updated: Claude (Cowork) ⚡

---

## ✅ DONE THIS SESSION (spans 2026-07-31 → 2026-08-01)

**`/pets` Moy-style pastel reskin, shipped and QA'd live**
- New `pet-*` Tailwind token namespace + a scoped `.pet-theme-scope`
  CSS-var override block — cascades into the shared `HVZCard`/`HVZButton`/
  `HVZTag`/`HVZProgress` primitives via additive opt-in props, zero edits
  to their internals, zero visual change on Shop/Tokens/Profile/Landing.
- Layout moved from "grid of equal pet cards" to a hero-pet spotlight +
  demoted horizontally-scrollable mini-card picker strip.
- Multiple rounds against live user QA on the deployed page (duplicate
  sections, an XP-number duplication bug, layout dead zones, hero-card
  sizing, an Evolution Path "Baby row" fix), each shipped as its own PR.
- Also fixed in the same arc: a pre-existing `PetMentorBubble` collision
  bug (the auto-opened chat panel could block a lesson page's "Next"
  button) and an `evolve_pet` RPC reading the wrong XP pool entirely.
- PRs: #37 (reskin), #38 (evolve_pet fix), #40 (regression fixes + mentor
  bubble collision).

**Per-pet XP — every BROskiPet earns its own counter**
- Full process: `superpowers:brainstorming` → design spec (PR #39) →
  `superpowers:writing-plans` → implementation plan (PR #41) →
  `superpowers:subagent-driven-development` (PR #42).
- Postgres trigger (`trg_fan_out_pet_xp` on `user_xp`) fans every
  `total_xp` increase out to all of a user's `pets.xp` rows; `evolve_pet()`
  now gates on the pet's own `xp`. No backfill by design — existing pets
  start at 0 and earn forward.
- 4 implementation tasks, each built by a fresh subagent and reviewed
  individually — all clean. The mandatory **final whole-branch review**
  (dispatched on the most capable model, per the skill's own required
  process) then caught a real Critical bug none of the per-task reviews
  could see: `EvolveButton.tsx` — a file no task had touched — was still
  gating on the old account-wide XP, so it would show an "Evolve" button
  the server then correctly rejected. Fixed in one fix-wave, regression
  test added and **mutation-verified** by the re-reviewer (reverted the
  fix, confirmed the new assertion goes red), re-reviewed clean.
- Full Playwright suite green (one confirmed pre-existing flaky test,
  unrelated to pets, ruled out as a regression via retry).
- Live SQL check (rolled back) confirmed the no-backfill design works on
  real data.
- Shipped via PR #42, merged to `main` (`2fe0e0b`).

**Git hygiene incident, caught and cleared**
- A leftover uncommitted local edit to `PetCard.tsx` (identical content to
  what PR #42 already shipped) got committed directly to local `main`,
  outside the PR flow. Direct push was correctly rejected by GitHub branch
  protection. Confirmed the diff against `origin/main` was empty (no
  functional content at stake) and reset local `main` to `origin/main`
  with explicit confirmation — nothing lost.

---

## 🔴 BLOCKED / NEEDS DECISION

- Nothing blocked.

---

## 🟡 IN PROGRESS (not finished)

- **Per-pet XP manual authenticated-UI check** — log in as a real user who
  owns a pet on `hypervibe.online`, confirm the hero card/evolution path
  reflect that pet's own XP (not the account total). Couldn't be done in
  the agent environment (no real login credentials). Flagged in PR #42's
  description.
- Quiz `explanation` text still ships to the client unstripped (only
  `answer_index` is stripped) — unchecked whether any explanation phrases
  the correct answer clearly enough to read before attempting. Carried
  over from Session 2 (07-30).
- `shop-purchase`'s CORS fix has no automated regression guard (Playwright
  mocking can't enforce real browser CORS preflight semantics). Carried
  over from Session 2 (07-30).
- `discord-link`'s `DISCORD_CLIENT_ID`/`DISCORD_CLIENT_SECRET` still
  aren't configured — web-app Discord OAuth linking probably doesn't work
  in any deployed version (the bot's own `/link` slash command is
  separate and already works). Carried over from Session 5 (07-30).
- Follow-up filed in PR #42, not fixed: `user_xp`'s pre-existing
  `authenticated` UPDATE policy is an indirect write path into `pets.xp`
  via the new trigger — worth dropping since nothing in the frontend needs
  client writes to `user_xp`.
- `HyperCode-V2.4`'s `broski-bot` container still points at a deleted
  Supabase project — different repo, flagged not fixed.

---

## 🎯 NEXT SESSION — START HERE

**First task:** do the per-pet-XP manual authenticated-UI check on
`hypervibe.online` (log in as a real pet owner, confirm the hero card
shows that pet's own XP) — it's the one verification step this session
couldn't complete. After that, pick from the carried-over list: quiz-
explanation content review, a non-Playwright regression test for the
`shop-purchase` CORS fix, or real Discord OAuth credentials for
`discord-link`.

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
