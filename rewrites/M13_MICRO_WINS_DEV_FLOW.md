# M13 -- Micro-Wins Dev Flow

Level: Advanced | Track: Neurodivergent Builder OS | Reward: +100 XP / +50 BROski$
Build status: Draft spec (Level A manual version first)

## STOP -- What is this?

A Git commit tripwire that logs a tiny win every time you save your work,
so your progress is visible even on days your brain says "I did nothing."

## Why this matters

The Shame Spiral tells neurodivergent builders that unfinished big features
mean zero progress. A Live Truth log of Micro-Wins is unarguable evidence
that you moved forward.

## Level A -- Manual version (build first)

1. Create a `micro_wins.md` file in your project.
2. After each commit, add one line: date, one-line win, how it felt.
3. Review the file weekly to see your real trend.

Definition of done: 3 manual entries logged for 3 real commits.

## Level B -- Automated version

Tools: Git post-commit hook (fires after commit, not on save), Supabase, HyperAgent-SDK.

Table schema:

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

Steps:
1. Create the table above in Supabase with RLS scoped to user_id.
2. Add `.git/hooks/post-commit` that captures the commit SHA and message.
3. Send commit data to a small API/Edge Function -- never embed a Supabase
   service-role key inside a Git hook or commit it to the repo.
4. Use commit_sha as a unique key so retries/rebases can't double-award XP.
5. Optionally call HyperAgent-SDK to turn the message into a hype line;
   the win must still log if that call fails.

## Safety rules

- Never put secrets or API keys in the hook script.
- `.git/hooks` is local only; it does not travel with a clone. Provide a
  template hook + install script for team/shared use.

## Help

Symptom: Nothing happens on commit.
Cause: post-commit file isn't executable.
Fix: `chmod +x .git/hooks/post-commit`

## XP Check

- [ ] Logged 3 manual wins (Level A)
- [ ] Created micro_wins table with RLS
- [ ] Automated hook fires and logs without duplicate XP

## Next

M14 -- HyperSplit Agent: turn big scary goals into safe tiny steps.
