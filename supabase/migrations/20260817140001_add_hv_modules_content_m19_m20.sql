-- Batch 3 (final) content for the Builder OS expansion. Must run after
-- 20260817140000_seed_hv_modules_m19_m20.sql.

-- M19-the-vibe-loop
update public.hv_modules
   set content = $modmd$# 🔁 The Vibe Loop

**Module:** M19 | **Level:** Advanced | **XP:** 150 | **Coins:** 80 BROski$

> Chatting with an AI for hours until it breaks something and nobody knows why is not a workflow. This module replaces Infinite Chat with a repeatable 5-step rhythm: Plan → Prompt → Build → Test → Checkpoint.

---

## 🎯 What You'll Learn

- Why "Infinite Chat" is the biggest vibe-coding trap
- How to write a Mini-PRD that scopes exactly one change
- How to bound an AI agent's instructions to only the allowed files
- Why testing is the Live Truth that proves a change actually works
- How to recover cleanly when context drift breaks previous work

---

## 🧠 The Big Idea

Most AI-assisted coding sessions drift: one request becomes five, the agent starts touching files nobody asked about, and eventually something breaks with no clear point to roll back to. The Vibe Loop fixes this by making every change small, scoped, and provable — plan it, prompt it, build it, test it, checkpoint it, repeat.

---

## 🛠️ The 5 Steps

| Step | What happens |
|---|---|
| 1. Plan | Write a tiny Mini-PRD |
| 2. Prompt | Give the agent bounded instructions |
| 3. Build | One small code change |
| 4. Test | Run objective proof |
| 5. Checkpoint | Commit, push, log the win, save a snapshot |

---

## ⚡ Step-by-Step

### Step 1 — Write the Mini-PRD
```md
# Mini-PRD: Green Login Button

## Goal
Show a green success state after successful login.

## Non-goals
Do not change authentication, routing, or database code.

## Done means
A passing test proves the success state appears.

## Files allowed
src/components/LoginButton.tsx
src/components/LoginButton.test.tsx
```

### Step 2 — Write the bounded builder prompt
```text
Implement only this Mini-PRD.
Change only the allowed files.
Do not install packages, refactor unrelated code, edit secrets, or
change configuration.
Before coding, state your plan in 3 bullets.
After coding, state the exact test/build command to run.
```

### Step 3 — Build
Let the agent make one small, scoped code change — nothing outside the Mini-PRD's allowed files.

### Step 4 — Test with a real project command
For this repo's frontend, the ship gate is:
```bash
npm --prefix frontend run build
```
Add focused component tests as the project's test setup allows.

### Step 5 — Checkpoint
```text
Green test -> review diff -> commit with a clear message
-> log Micro-Win (M13) -> create Session Snapshot (M15)
-> git fetch, then push (never force-push)
```

---

## 🌟 The Neurodivergent Edge

- **Small loops, not marathon sessions:** each cycle is short enough to actually finish, which protects momentum instead of burning it.
- **Testing replaces trust:** you never have to just believe a change worked — the test proves it.
- **A clean recovery path exists:** context drift isn't a crisis, it's a known failure mode with a known fix (see Help below).

---

## ✨ Practical Task

Build a Toggle Switch on a feature branch, running the full Vibe Loop for real: Mini-PRD, bounded prompt, one build, a passing test, then a real commit + push + Micro-Win log + Session Snapshot.

---

## 📊 XP Check

- [ ] Mini-PRD written before any code changed
- [ ] Test passes and the frontend build passes
- [ ] Diff matches the Mini-PRD exactly
- [ ] Committed, pushed, logged as a Micro-Win, saved in a Session Snapshot

**Complete all 4 → Claim your 150 XP + 80 BROski$ 🤑**
$modmd$,
       content_hash = '084ac3887520f198c33e0d8ca9ed2615',
       updated_at = now()
 where slug = 'the-vibe-loop';

-- M20-context-is-currency
update public.hv_modules
   set content = $modmd$# 🗂️ Context Is Currency

**Module:** M20 | **Level:** Advanced | **XP:** 150 | **Coins:** 80 BROski$

> An AI that doesn't know your real stack will guess — and guess wrong. This module builds a version-controlled Project Dossier that tells your AI crew exactly how the app is built, so it stops guessing and starts shipping correctly.

---

## 🎯 What You'll Learn

- Why accurate context is the highest-leverage input you can give an AI collaborator
- How to structure a Project Dossier that any AI tool can load
- The one critical rule for keeping secrets out of context files, permanently
- How to test whether your dossier actually works with the No-Guess Test
- How to prevent context bloat as the dossier grows

---

## 🧠 The Big Idea

Agents hallucinate and guess wrong when they don't know your real stack, rules, or conventions. A Project Dossier is version-controlled, lives in your repo, and becomes the single source of truth every AI tool reads before it suggests a single line of code.

---

## 🛠️ Where This Lives

Don't assume a specific SDK config field exists — use a plain, version-controlled folder and load it into whatever AI tool you use, according to that tool's own documented method:

```text
docs/ai-context/
  STACK.md          -- runtime, framework, package manager, database
  ARCHITECTURE.md   -- key folders, data flow, important boundaries
  RULES.md          -- commands, safety rules, forbidden changes
  STYLE_GUIDE.md    -- UI tokens, accessibility, component conventions
  CURRENT_TASK.md   -- active goal, non-goals, allowed files, done criteria
```

**Critical safety rule:** never put API keys, `.env` values, tokens, customer data, or production secrets into any context file. Document environment variable *names* only, never their values.

---

## ⚡ Step-by-Step

### Step 1 — Write RULES.md first
```md
# Non-Negotiable Rules

- Read this dossier before suggesting code changes.
- Never read, edit, print, or commit .env files.
- Do not add packages without asking first.
- Do not refactor unrelated files.
- Make one small change at a time.
- Run the documented test/build command before declaring success.
- If context is missing, ask one focused question. Do not guess.
```

### Step 2 — Write STACK.md and STYLE_GUIDE.md
Keep each one short, bulleted, and single-purpose — this is a reference document, not a novel.

### Step 3 — Add a freshness header to every file
```md
Last verified: 2026-08-17
Source of truth: package.json, supabase/migrations/, README.md
```

### Step 4 — Run the No-Guess Test
```text
Read the Project Dossier only.

1. What framework and database does this project use?
2. What command should I run before calling a change ready?
3. Name one forbidden action from RULES.md.
4. Which files am I allowed to change for CURRENT_TASK.md?

If anything is unclear, say "missing from dossier" -- do not guess.
```

### Step 5 — Fix what fails
If the agent guesses instead of citing the dossier, or gets an answer wrong, the file is too long or too vague — trim it and try again.

---

## 🌟 The Neurodivergent Edge

- **Context you write once, reuse forever:** you stop re-explaining your own project to every new AI session.
- **One file, one job:** short, scannable files are easier for both you and the AI to actually use — link to source files instead of pasting large code blocks.
- **"Missing from dossier" beats a guess:** an agent that admits it doesn't know is safer than one that confidently invents an answer.

---

## ✨ Practical Task

Add `STACK.md`, `RULES.md`, and `STYLE_GUIDE.md` to your own project. Give an AI agent a UI task with no extra chat context and confirm it correctly names the stack, follows the style rules, names the right verification command, and asks when a required fact is missing.

---

## 📊 XP Check

- [ ] STACK.md, RULES.md, STYLE_GUIDE.md all written
- [ ] No secrets or `.env` values anywhere in the dossier
- [ ] Ran the No-Guess Test and the agent passed
- [ ] Agent said "missing from dossier" instead of guessing, at least once

**Complete all 4 → Claim your 150 XP + 80 BROski$ 🤑**
$modmd$,
       content_hash = '564171e1cd72abbc574236255d90830a',
       updated_at = now()
 where slug = 'context-is-currency';
