# M16 -- Energy-Aware Build Mode

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +140 XP / +75 BROski$
Build status: Draft spec

## STOP -- What is this?

A "brain battery" check-in that filters your task list so you only see
work that matches your current energy, instead of forcing hard tasks on
low-power days.

## Why this matters

Forcing complex work while exhausted feeds the Shame Spiral and drives
burnout. Matching task difficulty to energy keeps progress sustainable.

## Energy scale (0-5, shared across the system)

| Score | Label | Tasks shown |
|---|---|---|
| 5 | Hyperfocus | energy_cost 1-5 |
| 3-4 | Standard | energy_cost 1-3 |
| 1-2 | Low Power | energy_cost 1-2 |
| 0 | Recovery | no coding tasks |

## How to build

1. Build a `npm run vibe-check` CLI (Inquirer.js) -- explicit command,
   not auto-fired on every terminal open.
2. Prompt: "Brain battery right now? [5] Hyperfocus ... [0] Recovery"
3. Save score + timestamp + optional note to workflow_checkins (user_id scoped, RLS on).
4. Filter M14 tasks: `task.energy_cost <= vibeCheck.batteryScore`.
5. Default untagged tasks to hidden, not "easy."
6. Recovery mode: hide all coding tasks; offer a choice, not an order:
   "drink water / rest / stretch / step outside / close the laptop without guilt."

## Safety rules

- Do not diagnose burnout from a count. Show data; let the user decide.
- Add: "This is a workflow tool, not medical advice. If you feel unsafe,
  contact local emergency or crisis support."

## Help

Symptom: Hard tasks still show at Low Power.
Cause: tasks lack energy_cost or filter uses the label instead of the score.
Fix: default missing energy_cost to hidden; enforce numeric filter only.

## Definition of done

Check in at battery 2, complete one energy_cost-1 task, confirm it logs
as a Micro-Win (M13) and no task above energy_cost 2 is visible.

## Next

M17 -- Focus Panic Mode: a safe way to stop when it's all too much.
