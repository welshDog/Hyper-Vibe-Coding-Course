# Next Session Handover — 2026-08-01

# Session 7 — `/pets` Moy reskin + per-pet XP (spans 2026-07-31 → 2026-08-01)

## Live state

- Course frontend live site: `https://hypervibe.online/`
- Active Supabase project: `tlavrxiaegbtyfmjfdcz`
- Latest commit on `main`: `2fe0e0b` (merge of PR #42, per-pet XP)
- Local `main` was briefly 2 commits ahead of `origin/main` (a stray
  direct commit, correctly rejected by branch protection on push) — reset
  to `origin/main` this session, confirmed zero functional content lost.

## What shipped

**`/pets` reskin** (PR #37, #38, #40) — full pastel/chunky Moy-style visual
reskin, hero-pet spotlight layout, several rounds of live-QA fixes. See
`SESSION_SNAPSHOT_2026-08-01.md` for the full breakdown.

**Per-pet XP** (PR #39 spec, #41 plan, #42 implementation) — each
BROskiPet now earns its own XP via a DB trigger fan-out instead of sharing
one account-wide bar. No backfill — existing pets start at 0.

## The one thing worth remembering from *how* this shipped

Built via `subagent-driven-development`: 4 tasks, each with its own
fresh-subagent implementation + task-scoped review, all came back clean.
The skill's **mandatory final whole-branch review** (a separate pass, after
all tasks are done, dispatched on the most capable model) then caught a
real Critical bug that all three clean per-task reviews had missed:
`EvolveButton.tsx` — a file none of the 4 tasks had touched — was still
reading the old account-wide XP source, so it would show an "Evolve"
button that the server (correctly, under the new per-pet rule) then
rejected. Task-scoped review is a diff-scoped gate; it structurally cannot
catch "unrelated file X now contradicts the new backend contract." Only a
whole-branch pass, briefed on the full design intent, catches that class
of bug. **Do not skip the final whole-branch review step on future
subagent-driven-development work, even when every task review comes back
clean.**

## Exact migration applied

- `20260731190000_per_pet_xp.sql` — adds `pets.xp` + CHECK constraint,
  `fan_out_pet_xp()` trigger function + trigger on `user_xp`, `evolve_pet`
  v2 reading `pets.xp`. Applied via Supabase MCP `apply_migration` against
  `tlavrxiaegbtyfmjfdcz`, verified live (grants, trigger firing, no
  backfill on a real pet).

## Known open item — do this first

**Per-pet-XP manual authenticated-UI check was never completed** — no real
login credentials were available in the agent environment for the full
plan-mandated Step 4 (log in as a real user who owns a pet, confirm the
hero card and Evolution Path reflect that pet's own XP, not the account
total). This is flagged in PR #42's own description. It's a 2-minute check
on `hypervibe.online` with any real account that owns a BROskiPet — do it
before trusting this feature is fully proven in production.

## Also open (not new this session, carried over — unchanged)

1. Quiz `explanation` text still ships to the client unstripped (only
   `answer_index` is stripped) — carried over from Session 2 (07-30).
2. `shop-purchase`'s CORS fix has no automated regression guard — carried
   over from Session 2 (07-30).
3. Real Discord OAuth credentials for `discord-link` — carried over from
   Session 5 (07-30).
4. Quest-completion tracking (`/quest_complete` + per-user state) if ever
   revisiting the Discord bot roadmap — carried over from Session 5 (07-30).
5. New follow-up from this session: `user_xp`'s pre-existing `authenticated`
   UPDATE policy is now an indirect write path into `pets.xp` via the new
   trigger (pre-dates this branch, not fixed here) — worth dropping since
   nothing in the frontend needs client writes to `user_xp`.

## First task next session

1. Per-pet-XP manual UI check on `hypervibe.online` (see above) — do this
   first, it's the one loose end from tonight.
2. Then pick from the carried-over list (items 1-3 above) — whichever's
   most pressing to Lyndz.
