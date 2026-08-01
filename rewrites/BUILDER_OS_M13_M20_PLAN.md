# Hyper-Vibe Builder OS Expansion — M13 to M20

## Purpose

The Core Path (M1-M12) teaches learners to build.
The Builder OS Expansion teaches learners how to keep building when
energy, memory, confidence, context, and AI output fluctuate.

This is a post-graduation expansion, not a replacement for the Core Path.
M12 remains the graduation point. M13-M20 are optional unlockable quests
for learners who want a sustainable, brain-friendly dev workflow.

## Positioning on the course page

- M1-M12: Core Path — Learn to build and graduate
- M13-M18: Neurodivergent Builder OS — Build in a brain-friendly way
- M19-M20: Vibe Coding Craft — Collaborate with AI reliably

Default UI state: Builder OS section is collapsed on /courses until
expanded by the learner. Modules are marked "Coming Soon" until built.

## The learner journey

M13 — I can see my progress (Micro-Wins Dev Flow)
M14 — I can start without overwhelm (HyperSplit Agent)
M15 — I can return without losing my place (Session Snapshot)
M16 — I can choose work that fits my energy (Energy-Aware Build Mode)
M17 — I can stop safely and recover (Focus Panic Mode)
M18 — I can see my whole working state (Personal Dev Dashboard)
M19 — I can build, test, and checkpoint reliably (The Vibe Loop)
M20 — My AI crew knows the project truth (Context Is Currency)

## Shared build principle (teach in every module)

Plan small -> Build small -> Test truth -> Save checkpoint

## Non-negotiable rules

- M12 stays the graduation point. Never imply learners are "not done" without M13-M20.
- Each module must work manually (Level A) before automation is added (Level B).
- No secrets, .env values, tokens, or private/customer data in lesson content,
  AI context files, or Supabase tables.
- All learner data (tasks, snapshots, check-ins, wins, safe-landings) must be
  scoped by user_id with Row Level Security enabled.
- Confirm the active Supabase project ref before any migration (course DB
  reference has changed before — verify tlav vs any older project).
- Use the existing COURSE_MASTER_TRACKER.md for status tracking — do not
  create a competing tracker file.
- Ship order follows the build spine below, not the module numbers.

## Recommended build spine (smallest working system first)

1. M14 HyperSplit — task schema: title, estimate, energy_cost, safe_first_step, definition_of_done
2. M15 Session Snapshot — intent, changed files, blockers, next safe step
3. M18 Personal Dashboard — Focus View only: Next Action + Last Save
4. M13 Micro-Wins — manual logging first, Git hook automation later
5. M16 Energy-Aware Mode — 0-5 check-in + task filter
6. M17 Focus Panic Mode — local-first safe stash + recovery note (never force-close apps)
7. M19 The Vibe Loop — Mini-PRD + build/test/checkpoint habit, formalised
8. M20 Context Is Currency — versioned docs/ai-context dossier, no secrets

## Shared data model (one system, not eight apps)

workflow_tasks, workflow_snapshots, workflow_checkins,
workflow_micro_wins, workflow_safe_landings

Every table: id, user_id, created_at, updated_at + RLS scoped to owner.

## Phased rollout

Phase 1 — Curriculum locked (this PR): plan + 8 module specs + tracker update, docs only.
Phase 2 — Course shell: collapsed Builder OS section added to /courses, Coming Soon state.
Phase 3 — Workflow Kit v1: M14 + M15 + M18 built and dogfooded for 7 days.
Phase 4 — Safety + pacing: M13, M16, M17 added.
Phase 5 — AI craft: M19, M20 added.

## Module spec files

See sibling files in this folder:
- M13_MICRO_WINS_DEV_FLOW.md
- M14_HYPERSPLIT_AGENT.md
- M15_SESSION_SNAPSHOT.md
- M16_ENERGY_AWARE_BUILD_MODE.md
- M17_FOCUS_PANIC_MODE.md
- M18_PERSONAL_DEV_DASHBOARD.md
- M19_THE_VIBE_LOOP.md
- M20_CONTEXT_IS_CURRENCY.md
