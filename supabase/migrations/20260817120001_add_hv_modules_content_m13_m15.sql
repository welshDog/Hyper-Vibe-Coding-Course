-- Batch 1 content for the Builder OS expansion. Must run after
-- 20260817120000_seed_hv_modules_m13_m15.sql (the WHERE slug = ... below
-- silently no-ops if that module row doesn't exist yet).
--
-- content_hash is md5(content), computed and pasted as a literal string --
-- matching the exact precedent in 20260719000000_add_hv_modules_content_and_backfill.sql
-- (not computed via a SQL md5() call at insert time).

-- M13-micro-wins-dev-flow
update public.hv_modules
   set content = $modmd$# 🏆 Micro-Wins Dev Flow

**Module:** M13 | **Level:** Advanced | **XP:** 100 | **Coins:** 50 BROski$

> Your brain doesn't lie about progress — it just can't see it. This module builds you a tripwire that catches every real win, even the ones that feel like "I did nothing today."

---

## 🎯 What You'll Learn

- Why the Shame Spiral lies to you about unfinished work
- How to run a manual Micro-Wins log for real accountability
- How to build an automated Git commit tripwire with Supabase
- How to make XP awards idempotent so retries/rebases can't double-pay
- How to keep secrets out of Git hooks, permanently

---

## 🧠 The Big Idea

Most dev-progress tracking only counts *shipped features*. That's a disaster for a neurodivergent brain, because most real days don't end in a shipped feature — they end in "I understood the bug" or "I finally set up the test harness." The Shame Spiral takes that ambiguity and turns it into "I did nothing today," which is false and demoralizing.

A Micro-Win is any real, committed change to your project — no matter how small. Logging every one of them, automatically, gives you a Live Truth log: unarguable evidence you moved forward, even on the days your brain insists otherwise.

---

## 🛠️ The Two Levels

| Level | What it is | Build it when |
|---|---|---|
| A — Manual | A `micro_wins.md` file you hand-update after each commit | Right now, zero setup |
| B — Automated | A Git post-commit hook that logs to Supabase and awards XP | Once Level A feels natural |

---

## ⚡ Step-by-Step

### Step 1 — Build Level A (do this first)
Create `micro_wins.md` in your project root. After every commit, add one line:
```
2026-08-17 | Fixed the login redirect bug | felt like a small win, took an hour
```
Definition of done: 3 real entries logged against 3 real commits.

### Step 2 — Review your trend
At the end of the week, read the whole file top to bottom. This is the proof: you moved forward more than your brain told you.

### Step 3 — Design the automated table
Once Level A feels natural, create this table in Supabase (RLS scoped to `user_id`, same pattern as every other table in this course):
```sql
create table public.micro_wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  project_name text not null,
  commit_sha text not null unique,
  original_message text not null,
  win_description text not null,
  xp_earned integer not null default 10,
  broski_earned integer not null default 5,
  created_at timestamptz not null default now()
);
```
`commit_sha` is `unique` on purpose — it's your idempotency key. A rebase or a retried push can never award XP twice for the same commit.

### Step 4 — Wire the hook
Add `.git/hooks/post-commit` (fires after the commit is made, not on save) that captures the commit SHA and message, then POSTs it to a small Edge Function — never a Supabase service-role key inside the hook itself, and never committed to the repo.

### Step 5 — Make it hype (optional)
Feed the commit message to an AI agent to turn it into a one-line hype note. If that call fails, the win must still log — the tripwire itself is never allowed to depend on the AI call succeeding.

---

## 🌟 The Neurodivergent Edge

- **Externalized memory:** you don't have to *remember* you made progress — the log remembers for you.
- **Fights all-or-nothing thinking:** a Micro-Win doesn't need to be impressive to count. It just needs to be real.
- **Idempotency = safety:** `commit_sha unique` means messy rebase days can't accidentally punish or over-reward you — the system is honest either way.

---

## ✨ Practical Task

Build Level A right now. Create `micro_wins.md`, make 3 real commits to any project, and log a one-line win after each one. Read the file back before closing this module — that's the whole point.

---

## 📊 XP Check

- [ ] `micro_wins.md` created
- [ ] 3 manual wins logged against 3 real commits
- [ ] Reviewed the file and can name one real thing you built this week

**Complete all 3 → Claim your 100 XP + 50 BROski$ 🤑**
$modmd$,
       content_hash = '76cdf1f8f2c3d28627a15f530e078932',
       updated_at = now()
 where slug = 'micro-wins-dev-flow';

-- M14-hypersplit-agent
update public.hv_modules
   set content = $modmd$# 🧩 HyperSplit Agent

**Module:** M14 | **Level:** Advanced | **XP:** 120 | **Coins:** 60 BROski$

> "Add Stripe payments" is not a task. It's a wall. This module builds an agent that turns every wall into a staircase — tiny, ordered, 15–20 minute steps, each with a Safe First Step so you never stare at a blank cursor again.

---

## 🎯 What You'll Learn

- Why executive-function planning — not coding — is usually the real blocker
- How to design a "Neurodivergent Project Manager" agent manifest
- How to force structured JSON output instead of vague prose
- How to enforce a hard 20-minute task ceiling with re-splitting
- How to chain HyperSplit's output into a real workflow (feeds a future dashboard)

---

## 🧠 The Big Idea

Staring at "build the whole feature" is where most stalled projects die — not because the coding is hard, but because *deciding what to do first* is hard. HyperSplit offloads that decision entirely. You feed it one big scary goal; it hands back an ordered list of tiny, doable, honestly-estimated tasks. Your only job becomes: do the next one.

---

## 🛠️ Task Schema

Every task HyperSplit returns must match this shape — structured output, not prose:

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

---

## ⚡ Step-by-Step

### Step 1 — Define the agent manifest
Give it a role: "Neurodivergent Project Manager." Its whole job is decomposition, never implementation.

### Step 2 — Write the system instruction
```
Break every goal into <=20 minute tasks. Every task must include
estimate_minutes, difficulty (1-5), energy_cost (1-5), safe_first_step,
and definition_of_done. Return JSON only. Order tasks by dependency.
Never invent credentials, completed setup, or file paths -- if info is
missing, generate a small discovery task first.
```

### Step 3 — Feed it a real stalled goal
Pick something on your own project that's been sitting untouched. That's the real test — not a toy example.

### Step 4 — Store the task list
Save the returned tasks so they persist across sessions — this is the data a personal dev dashboard would read from later in the track.

### Step 5 — Complete task 1 before you close the session
The whole point of HyperSplit is momentum. Don't just generate the list — start it.

---

## 🌟 The Neurodivergent Edge

- **Decision fatigue, gone:** the agent decides *what's next*, so your limited daily willpower goes into *doing*, not *deciding*.
- **The 20-minute ceiling is the accommodation:** it's short enough to start even on a low-energy day, and any task that's too big gets automatically re-split rather than left to intimidate you.
- **Safe First Step kills blank-cursor freeze:** every task tells you the literal first physical action, not just the goal.

---

## ✨ Practical Task

Generate 10–15 ordered tasks for one real stalled project of yours. Confirm every task has an estimate, difficulty, energy_cost, safe_first_step, and definition_of_done — then complete task 1 before you move on.

---

## 📊 XP Check

- [ ] Agent manifest + system instruction written
- [ ] 10–15 real tasks generated for a real stalled goal
- [ ] Task 1 actually completed

**Complete all 3 → Claim your 120 XP + 60 BROski$ 🤑**
$modmd$,
       content_hash = 'f50307874615268f49df6875f3500c39',
       updated_at = now()
 where slug = 'hypersplit-agent';

-- M15-session-snapshot-morning-briefing
update public.hv_modules
   set content = $modmd$# 📸 Session Snapshot & Morning Briefing

**Module:** M15 | **Level:** Advanced | **XP:** 130 | **Coins:** 70 BROski$

> A save-game button for your brain. Bookmark exactly where you were and why — so tomorrow-you resumes in seconds instead of losing the first hour to Context Fog.

---

## 🎯 What You'll Learn

- Why Context Fog eats 30–60 minutes of morning focus
- What actually needs capturing at session-end (hint: it's the "why," not just the diff)
- How to build a Session Snapshot table with a safe local fallback
- How to build a Morning Briefing command that hands you 3 tiny starting tasks
- How to keep secrets out of every snapshot, permanently

---

## 🧠 The Big Idea

Git already remembers *what* changed. It has no idea *why* you were doing it, what you were about to try next, or what was blocking you. That gap is Context Fog — and it's the single biggest tax on a neurodivergent dev's morning. A Session Snapshot closes the gap by capturing intent alongside state, every time you stop.

---

## 🛠️ What Gets Captured

Plain Git CLI only — no tokens, no network access required:
```bash
git log -3 --oneline
git diff --name-only HEAD~1
git status --short
```

```json
{
  "project_name": "hyper-vibe-coding-course",
  "branch": "main",
  "recent_commits": ["abc123 Add progress badge"],
  "changed_files": ["src/components/ProgressBadge.jsx"],
  "working_tree_status": "2 uncommitted files",
  "intent": "Finish the empty state before styling the badge.",
  "safe_first_step": "Open ProgressBadge.jsx and read the TODO.",
  "blockers": ["Need the final empty-state copy."],
  "created_at": "2026-08-17T00:00:00Z"
}
```

---

## ⚡ Step-by-Step

### Step 1 — Run the 30-second exit ritual
Before you close your editor, answer 4 questions:
1. What was I trying to achieve?
2. What changed, or what did I learn?
3. What's the smallest safe first step next time?
4. Is there one blocker?

### Step 2 — Save the snapshot
Store the Git state + your 4 answers in Supabase, scoped by `user_id` with RLS — same pattern as every table in this course. If Supabase is unreachable, fall back to a local file and show "saved locally — sync later." Never lose a snapshot to a flaky connection.

### Step 3 — Build the morning briefing command
`npm run vibe-start` should fetch your latest snapshot and hand back exactly 3 tiny, 5-minute starting tasks — not a wall of yesterday's context, just the next physical action.

### Step 4 — Close the loop
Start your next real session with the briefing command, and actually complete the first 5-minute task before doing anything else.

---

## 🌟 The Neurodivergent Edge

- **Intent survives, not just diffs:** "why" is what actually kills Context Fog — a diff alone can't tell you what you were thinking.
- **Graceful degradation matters:** a snapshot system that fails loudly when Supabase hiccups will get abandoned in a week — the local fallback is the accommodation, not a nice-to-have.
- **3 tasks, not 30:** the briefing is deliberately small. A wall of "here's everything" recreates the exact overwhelm this module exists to prevent.

---

## ✨ Practical Task

End one real coding session with a full snapshot — Git state, intent, one blocker, one safe first step. Start your next session with the briefing command and complete that first 5-minute action before anything else.

---

## 📊 XP Check

- [ ] Ended a real session with a full snapshot
- [ ] Local fallback tested (or confirmed unnecessary)
- [ ] Started the next session via briefing and completed task 1

**Complete all 3 → Claim your 130 XP + 70 BROski$ 🤑**
$modmd$,
       content_hash = '753dd4c7c2ea5a5492d40a35a9ead608',
       updated_at = now()
 where slug = 'session-snapshot-morning-briefing';
