# M20 -- Context Is Currency

Level: Advanced | Track: Vibe Coding Craft | Reward: +150 XP / +80 BROski$
Build status: Draft spec

## STOP -- What is this?

A version-controlled "Project Dossier" that tells your AI crew exactly
how the app is built, so it stops guessing and starts shipping correctly.

## Why this matters

Agents hallucinate and guess wrong when they don't know your real stack,
rules, or conventions. Accurate context is the highest-leverage input you
can give an AI collaborator.

## Where this lives

Do not assume a specific SDK config field exists. Use a plain,
version-controlled folder and load it into whatever AI tool you use
according to that tool's own documented method:

```text
docs/ai-context/
  STACK.md          -- runtime, framework, package manager, database
  ARCHITECTURE.md   -- key folders, data flow, important boundaries
  RULES.md          -- commands, safety rules, forbidden changes
  STYLE_GUIDE.md    -- UI tokens, accessibility, component conventions
  CURRENT_TASK.md   -- active goal, non-goals, allowed files, done criteria
```

## Critical safety rule

Never put API keys, .env values, tokens, customer data, or production
secrets into any context file. Document environment variable NAMES only,
never their values.

## Sample RULES.md

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

## The No-Guess Test

```text
Read the Project Dossier only.

1. What framework and database does this project use?
2. What command should I run before calling a change ready?
3. Name one forbidden action from RULES.md.
4. Which files am I allowed to change for CURRENT_TASK.md?

If anything is unclear, say "missing from dossier" -- do not guess.
```

## Preventing context bloat

One file, one job. Keep it scannable. Remove stale claims. Link to
source files instead of pasting large code blocks. Add a freshness header:

```md
Last verified: 2026-08-02
Source of truth: package.json, supabase/migrations/, README.md
```

## Help

Symptom: Agent is confused or "forgetting" context.
Cause: files are too long or vague.
Fix: keep each file short, bulleted, and single-purpose.

## Definition of done

Add STACK.md, RULES.md, and STYLE_GUIDE.md. Give the agent a UI task with
no extra chat context. It correctly names the stack, follows style rules,
names the correct verification command, and asks when a required fact is
missing.

## Next

This completes the Builder OS Expansion (M13-M20). Revisit the master
plan in BUILDER_OS_M13_M20_PLAN.md for the recommended build order.
