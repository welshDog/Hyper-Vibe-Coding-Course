# M19 -- The Vibe Loop

Level: Advanced | Track: Vibe Coding Craft | Reward: +150 XP / +80 BROski$
Build status: Draft spec

## STOP -- What is this?

A repeatable 5-step cycle for building with AI: Plan -> Prompt -> Build ->
Test -> Checkpoint. Replaces "Infinite Chat" with a controlled, provable
rhythm.

## Why this matters

The biggest vibe-coding trap is chatting for hours until the AI breaks
something and nobody knows why. Testing is the "Live Truth" that proves
a change actually works before moving on.

## The 5 steps

1. Plan -- write a tiny Mini-PRD
2. Prompt -- give the agent bounded instructions
3. Build -- one small code change
4. Test -- run objective proof
5. Checkpoint -- commit, push, log the win, save a snapshot

## Mini-PRD template

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

## Builder prompt template

```text
Implement only this Mini-PRD.
Change only the allowed files.
Do not install packages, refactor unrelated code, edit secrets, or
change configuration.
Before coding, state your plan in 3 bullets.
After coding, state the exact test/build command to run.
```

## Test step (use real project commands)

For this repo's frontend, the ship gate is:

```bash
npm --prefix frontend run build
```

Add focused component tests as the project's test setup allows.

## Checkpoint step

```text
Green test -> review diff -> commit with a clear message
-> log Micro-Win (M13) -> create Session Snapshot (M15)
-> git fetch, then push (never force-push)
```

## Help

Symptom: AI keeps suggesting changes that break previous work (context drift).
Fix: Stop. Revert/stash the failed experiment. Read the last passing
checkpoint. Write a new, smaller Mini-PRD for only the failing behaviour.

## Definition of done

Build a Toggle Switch on a feature branch. The test passes, the frontend
build passes, the diff matches the Mini-PRD, and the change is committed,
pushed, logged as a Micro-Win, and saved in a Session Snapshot.

## Next

M20 -- Context Is Currency: give your AI crew the project truth so it
stops guessing.
