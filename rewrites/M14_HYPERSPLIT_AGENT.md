# M14 -- HyperSplit Agent

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +120 XP / +60 BROski$
Build status: Draft spec

## STOP -- What is this?

An AI agent that slices a big scary goal ("add Stripe payments") into a
list of tiny, ordered, 15-20 minute subquests, each with a Safe First Step.

## Why this matters

Executive function planning, not coding itself, is often the real blocker.
HyperSplit offloads decomposition so focus is saved for building.

## Task schema (structured output, not just prose)

```json
{
  "title": "Install the Stripe SDK",
  "estimate_minutes": 10,
  "difficulty": 1,
  "energy_cost": 1,
  "safe_first_step": "Open your terminal in the project folder.",
  "definition_of_done": "stripe appears in package.json.",
  "blocked_by": []
}
```

## How to build

1. Define a HyperSplitter agent manifest with role "Neurodivergent Project Manager."
2. System instruction: "Break every goal into <=20 minute tasks. Every task
   must include estimate_minutes, difficulty (1-5), energy_cost (1-5),
   safe_first_step, and definition_of_done. Return JSON only. Order tasks
   by dependency. Never invent credentials, completed setup, or file paths
   -- if info is missing, generate a small discovery task first."
3. Feed it a real stalled project goal.
4. Store the returned task list (see M18 shared schema: workflow_tasks).

## Guardrails

- Enforce a hard max of 20 minutes per task; re-split anything larger.
- Dependency order matters -- prerequisite steps come first.
- JSON-only output keeps this predictable for the dashboard (M18).

## Help

Symptom: Agent still returns big tasks.
Cause: prompt isn't strict enough.
Fix: "Any task over 20 minutes is invalid. Split it before replying."

## Definition of done

Generate 10-15 ordered tasks for one real stalled project; each task has
an estimate, difficulty, energy_cost, safe_first_step, and definition_of_done.
Complete task 1 before closing the session.

## Next

M15 -- Session Snapshot & Morning Briefing: never lose your place again.
