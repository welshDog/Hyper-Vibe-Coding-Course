-- Batch 2 content for the Builder OS expansion. Must run after
-- 20260817130000_seed_hv_modules_m16_m18.sql.

-- M16-energy-aware-build-mode
update public.hv_modules
   set content = $modmd$# 🔋 Energy-Aware Build Mode

**Module:** M16 | **Level:** Advanced | **XP:** 140 | **Coins:** 75 BROski$

> Not every day runs on full charge. This module builds a brain-battery check-in that filters your task list to match your actual energy — so a low-power day still moves you forward instead of grinding you down.

---

## 🎯 What You'll Learn

- Why forcing hard work on a low-energy day feeds the Shame Spiral
- How to build a `vibe-check` CLI that reads your brain battery
- How to filter HyperSplit's tasks by energy cost, not difficulty label
- Why untagged tasks should default to hidden, not "easy"
- How to design a Recovery mode that offers choices, not orders

---

## 🧠 The Big Idea

Most task lists assume infinite, constant energy. Yours isn't constant — and pretending otherwise is how burnout happens. Energy-Aware Build Mode adds one honest check-in before you start: "what's your brain battery right now?" Then it filters everything else around that answer, so the tasks you actually see are tasks you can actually do.

---

## 🛠️ The Energy Scale (0–5, shared across the system)

| Score | Label | Tasks shown |
|---|---|---|
| 5 | Hyperfocus | energy_cost 1–5 |
| 3–4 | Standard | energy_cost 1–3 |
| 1–2 | Low Power | energy_cost 1–2 |
| 0 | Recovery | no coding tasks |

---

## ⚡ Step-by-Step

### Step 1 — Build the check-in command
Create an `npm run vibe-check` CLI (Inquirer.js works well) — explicit, run-it-yourself, never auto-fired on every terminal open.

### Step 2 — Ask the real question
```
Brain battery right now? [5] Hyperfocus ... [0] Recovery
```

### Step 3 — Save the check-in
Log the score, timestamp, and an optional note to a `workflow_checkins` table, scoped by `user_id` with RLS — same pattern as every table in this course.

### Step 4 — Filter by the number, not the label
Filter HyperSplit's (M14) task list with `task.energy_cost <= vibeCheck.batteryScore`. Any task with no `energy_cost` set defaults to hidden — never silently treated as "easy."

### Step 5 — Build Recovery mode properly
At battery 0, hide all coding tasks entirely. Offer real choices, not an order: drink water, rest, stretch, step outside, or close the laptop without guilt.

---

## 🌟 The Neurodivergent Edge

- **Energy is data, not a diagnosis:** the tool shows you your own pattern — it never tells you what that pattern means.
- **Recovery mode is a real feature, not a placeholder:** hiding coding tasks at battery 0 is the accommodation, not a bug.
- **This is a workflow tool, not medical advice.** If you feel unsafe, contact local emergency or crisis support.

---

## ✨ Practical Task

Check in at battery 2. Complete one `energy_cost: 1` task. Confirm it logs as a Micro-Win (M13), and confirm nothing above `energy_cost: 2` is visible while you're checked in at 2.

---

## 📊 XP Check

- [ ] `vibe-check` command built and run for real
- [ ] Checked in at battery 2 and completed one matching task
- [ ] Confirmed it logged as a Micro-Win, and nothing above energy_cost 2 was visible

**Complete all 3 → Claim your 140 XP + 75 BROski$ 🤑**
$modmd$,
       content_hash = '77866abff438ad2479d2ade1e7c2cee6',
       updated_at = now()
 where slug = 'energy-aware-build-mode';

-- M17-focus-panic-mode
update public.hv_modules
   set content = $modmd$# 🪂 Focus Panic Mode

**Module:** M17 | **Level:** Advanced | **XP:** 150 | **Coins:** 80 BROski$

> Sometimes it's all too much. This module builds an Emergency Landing — one command that safely saves your messy, half-finished work and gives you explicit permission to walk away.

---

## 🎯 What You'll Learn

- Why overload without a recovery protocol leads to abandoned projects and shame
- How to safely stash tracked AND untracked work with one command
- Why panic mode should never force-close your browser or editor
- How to write a local recovery note that survives even if the network doesn't
- The real difference between a work-recovery tool and crisis support

---

## 🧠 The Big Idea

A Safe Landing turns a crash into a Safe Restart. When focus overload hits, the instinct is to slam the laptop shut — but that risks losing work outside Git and teaches your brain that stopping is chaotic and shameful. Focus Panic Mode makes stopping calm, safe, and reversible instead.

---

## 🛠️ Important Safety Correction

Do **not** force-close the browser or editor by default. That can kill unsaved work outside Git, interrupt uploads or forms mid-flight, and behaves differently across every OS and editor. Save and snapshot first — let the human close things manually, on their own terms, after confirmation.

---

## ⚡ Step-by-Step

### Step 1 — Build the panic command
Create `panic.sh` (or a cross-platform equivalent for your setup).

### Step 2 — Stash everything, including untracked files
```bash
git stash push --include-untracked -m "focus-panic: $(date +%Y-%m-%d_%H-%M)"
git stash list   # verify before declaring success
```

### Step 3 — Write a local recovery note
Record branch, working state, stash ref, and next safe step — write it locally even if Supabase or the network is unavailable.

### Step 4 — Ask, don't interrogate
Up to 2 optional questions, both skippable with Enter:
- "What made this feel too much?"
- "Next safe step for future you?"

### Step 5 — Confirm calmly, close nothing automatically
```
SAFE LANDING COMPLETE
Your worktree was stashed and verified.
You do not need to solve this tonight.
Future-you's first step: [next safe step]
```

---

## 🌟 The Neurodivergent Edge

- **Permission, not just a save:** the confirmation message explicitly tells you that stopping now is okay.
- **A stash is local only** — not backed up to GitHub. For work that matters, come back later, inspect the stash, commit normally, fetch, then push. Never force-push.
- **This is a work-recovery tool, not crisis support.** If you feel unsafe, contact local emergency or crisis services.

---

## ✨ Practical Task

On a disposable practice branch: make one tracked edit and one untracked file, then run Focus Panic Mode for real.

---

## 📊 XP Check

- [ ] `git status` is clean after running panic mode
- [ ] `git stash list` shows the panic stash with its timestamped message
- [ ] A local recovery note exists and names the next safe step

**Complete all 3 → Claim your 150 XP + 80 BROski$ 🤑**
$modmd$,
       content_hash = '44d4989e5a55149faa2f702bb1c9f62c',
       updated_at = now()
 where slug = 'focus-panic-mode';

-- M18-personal-dev-dashboard
update public.hv_modules
   set content = $modmd$# 🎛️ Personal Dev Dashboard

**Module:** M18 | **Level:** Advanced | **XP:** 160 | **Coins:** 90 BROski$

> One Control Room, not five scattered tools. This module brings your wins, energy, tasks, and snapshots into a single screen — so you never burn your first five minutes just remembering where you left off.

---

## 🎯 What You'll Learn

- Why context-switching between separate tools burns Executive Function before you even start building
- How to design a Focus View that shows only what matters right now
- How to build a typed data contract for a dashboard that pulls from multiple modules
- How to write a kind, non-alarming "panic-light" check for a rough week
- Why the dashboard must never block on a slow AI summary call

---

## 🧠 The Big Idea

Every module before this one (M13–M17) generates real data — wins, energy check-ins, task lists, snapshots, panic stashes. Left scattered, that data is an Information Scavenger Hunt every time you sit down. The Personal Dev Dashboard is the one screen that ends the hunt: it aggregates everything into a single, calm Focus View.

---

## 🛠️ Architecture Note

Build this inside the **existing** Hyper-Vibe-Coding-Course frontend (Vite + React + Supabase) as a real learner-facing route — not in an unrelated ops/admin repo, and never assuming a file path exists without checking the current `frontend/src` structure first.

---

## ⚡ Step-by-Step

### Step 1 — Build the default screen: Focus View only
1. **Next Action** — one Safe First Step from M14, with a "Start 5 minutes" button
2. **Brain Battery** — current M16 score + a "Run vibe check" link
3. **Last Save** — latest M15 snapshot + a "Resume here" button

Everything else (recent wins, energy trend, safe-landing history, full task backlog) goes behind a "See progress" toggle — not the first thing a tired brain has to parse.

### Step 2 — Define the data contract
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

### Step 3 — Fetch it properly
Pull this through one small Supabase view or RPC scoped to the signed-in `user_id` — avoid one giant client-side cross-table query stitched together in the browser.

### Step 4 — Build the panic-light rule, kindly
If `safeLandingsThisWeek > 2`, show a supportive card, not a red alarm: "You've been carrying a lot. Want to switch to Recovery Mode or reduce this week's task load?"

### Step 5 — Handle the edges
Never block rendering on an AI summary call — show saved data first, treat any AI enrichment as optional. Show a calm, honest empty state for new learners with no data yet.

---

## 🌟 The Neurodivergent Edge

- **One screen, not five tabs:** ending the Information Scavenger Hunt is the whole point.
- **Focus View by default:** the full history is one toggle away, never forced on you first.
- **Kind, not alarming:** the panic-light rule flags a rough week as a supportive nudge, never a red warning banner.

---

## ✨ Practical Task

Open the dashboard route and confirm that within 5 seconds you can see one safe first step, today's brain battery, and your last saved context. Verify the build is clean with `npm --prefix frontend run build`.

---

## 📊 XP Check

- [ ] Focus View built with all 3 core cards
- [ ] Data contract implemented via a scoped Supabase view/RPC
- [ ] Panic-light rule shows supportively, not as an alarm
- [ ] `npm --prefix frontend run build` verified clean

**Complete all 4 → Claim your 160 XP + 90 BROski$ 🤑**
$modmd$,
       content_hash = '61b3f50b5c1e5d555ccf5b9783f0d93a',
       updated_at = now()
 where slug = 'personal-dev-dashboard';
