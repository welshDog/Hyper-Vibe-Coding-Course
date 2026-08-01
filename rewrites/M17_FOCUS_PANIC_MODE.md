# M17 -- Focus Panic Mode

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +150 XP / +80 BROski$
Build status: Draft spec

## STOP -- What is this?

An "Emergency Landing" for coding overload: one command that safely saves
your messy work, records why you're stopping, and gives explicit
permission to walk away.

## Why this matters

Overload without a recovery protocol leads to abandoned projects and
shame. A Safe Landing turns a crash into a Safe Restart.

## Important safety correction

Do NOT force-close the browser or editor by default. That can kill
unsaved work outside Git, interrupt uploads/forms, and behaves
differently across OS/editors. Save and snapshot first; let the human
close things manually after confirmation.

## How to build

1. Create `panic.sh` (or cross-platform equivalent).
2. Stash all work, including untracked files, with a timestamped message:

```bash
git stash push --include-untracked -m "focus-panic: $(date +%Y-%m-%d_%H-%M)"
git stash list   # verify before declaring success
```

3. Write a local recovery note (branch, working state, stash ref, next
   safe step) even if Supabase/network is unavailable.
4. Ask up to 2 optional questions, skippable with Enter:
   "What made this feel too much?" / "Next safe step for future you?"
5. Print a calm confirmation, do not auto-close anything:

```
SAFE LANDING COMPLETE
Your worktree was stashed and verified.
You do not need to solve this tonight.
Future-you's first step: [next safe step]
```

## Caveats to teach

- A stash is local only, not backed up to GitHub. For important work,
  return later, inspect the stash, commit normally, fetch, then push.
  Never force-push.
- This is a work-recovery tool, not crisis support. If you feel unsafe,
  contact local emergency or crisis services.

## Help

Symptom: Script didn't close all tabs/apps.
Cause: intentional -- panic mode should not force-close by default.
Fix: close manually; your code is already safely stashed.

## Definition of done

On a disposable practice branch, make one tracked edit and one untracked
file, run Focus Panic Mode. `git status` is clean, `git stash list` shows
the panic stash, and a local recovery note names the next safe step.

## Next

M18 -- Personal Dev Dashboard: bring wins, energy, tasks and snapshots
into one Control Room.
