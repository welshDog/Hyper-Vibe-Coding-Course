# M18 -- Personal Dev Dashboard

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +160 XP / +90 BROski$
Build status: Draft spec

## STOP -- What is this?

A single "Control Room" screen inside the existing course frontend that
aggregates wins, energy, tasks, and snapshots so a learner never has to
hunt across tools to remember where they are.

## Why this matters

Context-switching between separate tools burns Executive Function before
any real building starts ("Information Scavenger Hunt" fatigue).

## Architecture note

Build inside the existing Hyper-Vibe-Coding-Course frontend (Vite +
React + Supabase) as a learner-facing route -- do not build this inside
an unrelated ops/admin repo, and do not assume a file path exists
without checking the current frontend/src structure first.

## Default screen -- Focus View only

1. Next Action -- one Safe First Step from M14, with a "Start 5 minutes" button
2. Brain Battery -- current M16 score + "Run vibe check"
3. Last Save -- latest M15 snapshot + "Resume here"

Everything else (recent wins, energy trend, safe-landing history, full
task backlog) goes behind a "See progress" toggle.

## Data contract

```ts
type DashboardPayload = {
  nextAction: {
    title: string
    safeFirstStep: string
    estimateMinutes: number
    energyCost: number
  } | null
  currentEnergy: { score: number; loggedAt: string } | null
  latestSnapshot: { intent: string; createdAt: string } | null
  recentWins: Array<{ description: string; createdAt: string }>
  safeLandingsThisWeek: number
}
```

Fetch via a small Supabase view/RPC scoped to the signed-in user_id --
avoid one giant client-side cross-table query.

## Panic-light rule (kind, not shaming)

If safe-landings this week > 2, show a supportive card, not a red alarm:
"You've been carrying a lot. Want to switch to Recovery Mode or reduce
this week's task load?"

## Safety rules

- Enforce Supabase RLS by user_id on every query.
- Never block rendering on the HyperCode/LLM summary call; show saved
  data first, treat AI summary as optional enrichment.
- Show a calm empty state for new learners with no data yet.

## Definition of done

Open the dashboard route and within 5 seconds see one safe first step,
today's brain battery, and the last saved context. Verify with:
`npm --prefix frontend run build`

## Next

M19 -- The Vibe Loop: the repeatable plan/build/test/checkpoint rhythm.
