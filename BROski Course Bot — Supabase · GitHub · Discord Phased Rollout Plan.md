# BROski Course Bot — Supabase · GitHub · Discord Phased Rollout Plan

## Overview

This report designs a three-phase rollout for the BROski Course Bot, integrating Supabase, GitHub, Stripe-powered course data, and Discord to support Sync → Quests → Announcements. It assumes the existing Hyper-Vibe Coding Course stack (Vercel frontend, Supabase backend, Stripe payments, HyperCode V2.4, HyperAgent SDK) and the previously created BROski Course Bot application in the Discord Developer Portal.[^1][^2]

The goal is to:
- Sync course progress and XP from Supabase into Discord profiles.
- Provide quest and mission flows students can complete via Discord.
- Broadcast announcements, wins, and progression using Discord channels and roles.

***

## Architecture Snapshot

### Existing Course Platform

The Hyper-Vibe Coding Course uses:
- Vercel for the frontend Vite SPA.
- Supabase for Auth, Postgres database, and Edge Functions.
- Stripe for token pack payments and webhooks feeding into Supabase.
- HyperCode V2.4 as the AI backend engine.
- HyperAgent SDK for AI tutor agents.

The architecture as documented is:

> User visits → Vercel (Vite SPA) → Supabase Auth/DB → Stripe payment → Stripe → Supabase Webhook → DB INSERT → HyperCode V2.4 token sync + access provisioned.[^2]

This means course progress, XP, and token balances are in Supabase tables, and Stripe sync plus token provisioning already happens through backend flows.[^3][^2]

### Discord Bot Context

The BROski Course Bot is a Discord application configured in the Discord Developer Portal with a clear learning + gamification description (XP, badges, leaderboard, quests). It can be implemented either as:[^1]
- A gateway bot using discord.py (or discord.js) that connects via bot token and runs on a server or container.[^4][^5]
- A slash-command bot whose interactions are handled by a Supabase Edge Function used as the Discord interactions endpoint URL.[^6][^7]

Supabase provides an official guide for building a Discord bot backed by Edge Functions, including creating the Discord app, setting BOT TOKEN and CLIENT_ID, registering slash commands via the Discord API, and deploying a function as `discord-bot` with `supabase functions deploy discord-bot --no-verify-jwt` and configuring the interactions endpoint URL in the Discord Developer Portal.[^6]

Given the existing Supabase project, using Edge Functions for command handling and Supabase for data makes sense, while still allowing a long-running gateway bot for presence and background jobs.

***

## Phase 1 — Sync: Discord ↔ Supabase Course Data

### Objectives

- Link a Discord user to their Supabase course profile.
- Sync key metrics (XP, modules completed, tokens, quests) from Supabase into Discord.
- Make progress visible via simple commands and roles.

### Data Model

In Supabase, define or confirm tables such as:
- `profiles`: user id, email, display_name, Discord user id, etc.
- `course_progress`: user id, module id, status, XP awarded.
- `missions` / `quests`: mission id, description, XP reward, status.
- `discord_xp_log`: user id, XP change, reason, timestamp.

Supabase documentation and existing project patterns show how to store user data and progress in Postgres tables with RLS policies.[^8][^2]

### Step-by-Step Implementation

#### 1. Choose Bot Execution Model

Option A: Edge-function-only bot
- Use Supabase Edge Functions to handle Discord interactions.
- Implement slash commands such as `/link`, `/xp`, `/progress`, `/quests`.
- Supabase guide shows how to deploy a `discord-bot` function and set it as the interactions endpoint.[^6]

Option B: Hybrid model
- Use an Edge Function to handle slash commands.
- Run a separate gateway bot (discord.py) for presence, background jobs, and non-command behavior.[^5][^4]

Given the Hyper-Vibe stack already uses Supabase Edge Functions, the hybrid model is recommended: Supabase handles commands; a gateway bot handles continuous tasks and complex messaging.

#### 2. Environment Variables and Secrets

Supabase Edge Functions require environment variables. Set:
- `DISCORD_BOT_TOKEN` — from Discord Developer Portal → Bot section.[^6]
- `DISCORD_PUBLIC_KEY` — required for verifying interaction signatures.[^6]
- `DISCORD_CLIENT_ID` — from General Information.[^6]

Use `supabase secrets set` to store these values, or `.env.local` when running locally.[^7][^6]

For the gateway bot (if used), store tokens in environment variables (Docker secrets, Replit Secrets, .env, etc.), never in source files.[^9][^5]

#### 3. Link Command (`/link`)

Implement a slash command `/link` that:
- Takes an email or course username.
- Looks up the Supabase `profiles` table for the authenticated user.
- Stores the Discord user id (`interaction.user.id`) in the `profiles.discord_user_id` column.

Supabase’s Discord bot examples show how to receive and parse slash command payloads in Edge Functions.[^7][^6]

Pseudo-steps:
1. Edge Function checks signature via Discord public key.
2. Parses slash command name and options.
3. Uses Supabase client (service role) to query `profiles` by email or user id.
4. Updates `discord_user_id` column.
5. Returns an ephemeral message: "Linked your Discord account to your Hyper Vibe profile."

#### 4. Progress and XP Commands

Implement commands:
- `/xp` → returns current XP total from `course_progress` or aggregated view.
- `/progress` → returns module completion summary.

Use Supabase client inside Edge Function or bot process to fetch aggregates for the linked `discord_user_id`.

Using Supabase client libraries, queries look like:
- `select sum(xp) from course_progress where user_id = ...`.

Ensure RLS allows only server-side code with service role to see sensitive data, while end-user queries are scoped by user id.[^8]

#### 5. Role Sync (Optional)

Map XP or completion thresholds to Discord roles:
- "Level 1", "Level 2", "Hyperfocus Hero".

Gateway bot:
- On XP change or module completion, the bot adds/removes roles via Discord API.

Bot best practice guides emphasize rate-limit awareness, error handling, and keeping tokens safe.[^5]

#### 6. Security and RLS

Use Supabase Advisors to confirm:
- No `USING (true)` policies on relevant tables.
- `SECURITY DEFINER` functions are limited and necessary for tasks such as `complete_module` or referral logic, with `EXECUTE` grants locked down.[^10]

Guard the `discord_user_id` column with RLS rules that ensure users can only read their own data.

***

## Phase 2 — Quests: Missions, XP Rewards, Course Actions

### Objectives

- Expose course missions and quests via Discord.
- Let students claim or complete quests through Discord commands.
- Award XP and tokens that feed back into the course platform.

### Quest Design

Quests can be:
- "Complete Module 1" → XP + role.
- "Attend live workshop" → XP + badge.
- "Help another student" → XP + special role.

These map into Supabase tables like `missions` and `mission_completions` with columns for `user_id`, `mission_id`, `completed_at`, `xp_reward`.

### Step-by-Step Implementation

#### 1. Quest Listing Command (`/quests`)

Implement `/quests` slash command in the Edge Function:
- Fetch active missions for the user from Supabase.
- Show them as a list with status (completed / pending) and XP rewards.

Supabase’s Discord bot example shows patterns for returning structured responses from slash commands, including lists and ephemeral messages.[^6]

#### 2. Quest Completion Command (`/quest_complete`)

Implement `/quest_complete` with parameters like `mission_id` or mission name.

Flow:
1. Edge Function verifies the command.
2. Checks mission exists and is assigned to this user.
3. Verifies completion criteria (via Supabase table or external event)
4. Writes a row to `mission_completions` and awards XP.
5. Returns a message: "Quest completed, +XP, level updated." with optional embed.

Supabase functions and triggers can encapsulate XP logic, with RLS ensuring safe write operations.[^8]

#### 3. Integrations with Course Events

Tie quest completion to course events already tracked in Supabase. For example:
- Module completion events in `course_progress` trigger automated quest completion.
- Workshop attendance logged in a `events_attendance` table auto-awards XP.

Stripe sync engine can feed subscription or purchase data into Supabase tables, but quests themselves focus on learning actions rather than payment events.[^3]

#### 4. Bot-side Feedback

Gateway bot can send celebratory messages to Discord channels when quests are completed:
- Use embeds with XP, new level, and mission description.
- Optionally post to a "wins" channel.

Discord bot best practice articles highlight the importance of respecting rate limits and providing clear feedback for commands.[^11][^5]

***

## Phase 3 — Announcements: Broadcasts, Milestones, and Hype

### Objectives

- Use Discord as the hype layer for course milestones.
- Broadcast new modules, live sessions, rewards, and leaderboard changes.
- Keep neurodivergent learners engaged through regular positive reinforcement.

### Announcement Types

- **Course updates** — new module, new quest, patch notes.
- **Live events** — upcoming streams, co-working, Q&A.
- **Milestones** — student XP milestones, community achievements.

### Step-by-Step Implementation

#### 1. Announcement Channels and Permissions

Decide channels:
- `#course-updates` — system announcements.
- `#wins` — automated quest and XP celebrations.
- `#events` — scheduled events.

Configure Discord roles and permissions so only the bot and admins can post announcements, while everyone can react and discuss.

Discord configuration tutorials recommend using dedicated channels for bot output to avoid cluttering general chat.[^4][^5]

#### 2. Supabase Triggers for Events

Use Supabase triggers or Edge Functions to detect:
- New module published (insert into `modules` table).
- New quest added (insert into `missions` table).
- XP milestones crossed.

On such events, either:
- Call a HTTP endpoint handled by the gateway bot (webhook style).
- Or let the bot poll an events table on a schedule and announce changes.

Supabase webhook and event handling approaches are documented in Stripe integration and Edge Function guides.[^12][^3]

#### 3. Announcement Formatting

Use Discord embeds for clarity:
- Title: "New Module: Async Mastery".
- Description: 2–3 bullet points.
- Fields: XP rewards, prerequisites, link to course page.

Bot design tutorials show how structured embeds improve readability.[^4]

#### 4. Leaderboard Announcements

Periodically (daily/weekly), generate leaderboards from `course_progress` and `discord_xp_log`:
- Top 10 students by XP.
- Most quests completed.

Post structured messages with ranks and XP, optionally with role rewards.

Best practices emphasize handling rate limits and avoiding spam by batching announcements.[^5]

***

## GitHub Integration and DevOps

### GitHub Repos

The Hyper-Vibe ecosystem uses multiple repos including Hyper-Vibe Coding Course and HyperCode V2.4, suggesting GitHub as the main source of truth for code.[^2]

Recommended structure:
- `hyper-vibe-course-frontend` — Vercel app.
- `hyper-vibe-course-bot` — Discord bot code (gateway + Edge Function code in `supabase/functions/discord-bot`).
- Shared libraries or environments as needed.

### CI/CD

Use GitHub Actions to:
- Deploy Supabase Edge Functions on push/merge to main.
- Restart or redeploy the gateway bot container when bot code changes.
- Run tests for XP logic and quest flows.

Supabase’s Edge Functions and Discord guides show locally running functions and deploying them via CLI; these commands can be wired into CI workflows.[^7][^6]

***

## Security and Reliability

Key considerations:
- **Bot token safety** — store in secrets, never in Git history or client bundles.[^9][^5]
- **Supabase RLS** — lock tables behind per-user policies; use service role only in server-side contexts.[^8]
- **Discord command validation** — verify signatures via `DISCORD_PUBLIC_KEY` in Edge Functions.[^6]
- **Rate limits** — respect Discord API rate limits for role changes and announcements.[^11][^5]
- **Stripe sync isolation** — keep payment logic focused on subscription and token provisioning, not quests or XP to reduce risk.[^13][^3]

Supabase Advisors warning pages can be used to catch overly permissive RLS and risky `SECURITY DEFINER` functions used in course logic.[^10]

***

## Phased Rollout Checklist

### Phase 1 — Sync

- [ ] Confirm Supabase tables for profiles, progress, missions, XP.
- [ ] Implement `/link`, `/xp`, `/progress` slash commands via Edge Function.
- [ ] Store Discord user id in Supabase profiles.
- [ ] Optional: role sync based on XP.

### Phase 2 — Quests

- [ ] Implement `/quests` listing and `/quest_complete`.
- [ ] Wire quest completion to course events.
- [ ] Award XP and roles via Supabase triggers and bot actions.

### Phase 3 — Announcements

- [ ] Set up `#course-updates`, `#wins`, `#events` channels.
- [ ] Use Supabase triggers or scheduled jobs for module and quest announcements.
- [ ] Post leaderboard messages periodically.

***

## Conclusion

The BROski Course Bot can be rolled out in three phases that mirror the Hyper-Vibe Coding Course architecture: secure Supabase-backed sync of progress and XP, quest flows tied to real learning events, and high-signal announcements that keep students engaged via Discord. Supabase Edge Functions and existing Stripe-synced data provide a robust backend, while a carefully scoped Discord bot turns course progress into social, gamified momentum.[^2][^3][^6]

---

## References

1. [Discord Developer Portal](https://discord.com/developers/applications/1492297844449873950/information) - Build games, experiences, and integrations for millions of users on Discord.

2. [welshDog/Hyper-Vibe-Coding-Course](https://github.com/welshDog/Hyper-Vibe-Coding-Course) - Vibe Coding Course Platform - Neurodivergent-friendly, gamified, full-stack learning hub built the H...

3. [Sync Stripe Data to Your Supabase Database in One Click](https://supabase.com/blog/stripe-sync-engine-integration) - Today we are announcing a partnership with Stripe and official support for the Stripe Sync Engine in...

4. [How to Make a Discord Bot in Python](https://realpython.com/how-to-make-a-discord-bot-python/) - In this tutorial, you'll learn how to make a Discord bot in Python so that you can make the most of ...

5. [Build & Host a Discord Bot on Replit (2026)](https://www.lowcode.agency/blog/replit-discord-bot) - What Are the Best Practices for Building a Replit Discord Bot? Handle errors gracefully, respect rat...

6. [Building a Discord Bot | Supabase Docs](https://supabase.com/docs/guides/functions/examples/discord-bot) - Go to Bot section, click on Add Bot, and finally on Yes, do it! to confirm. A new application is cre...

7. [How To Build A Discord Command Bot With Supabase Edge ...](https://johna.hashnode.dev/how-to-build-a-discord-command-bot-with-supabase-edge-function) - This tutorial will guide you through an easy and stress-free process of building your Discord comman...

8. [Supabase for Vibe Coders](https://supabase.com/solutions/vibe-coders) - The Vibe Coding Toolkit Supabase gives you the tools to easily manage databases, authentication, and...

9. [supabase-community/supabase-community-bot](https://github.com/supabase-community/supabase-community-bot) - This is a community bot for the Supabase Discord server. The technology behind is Node with the help...

10. [Advisors | Hyper Vibe Coding Course | hyperfocus Org | Supabase](https://supabase.com/dashboard/project/tlavrxiaegbtyfmjfdcz/advisors/security?preset=WARN&id=) - [Skip to content](https://supabase.com/dashboard/project/tlavrxiaegbtyfmjfdcz/advisors/security?pres...

11. [What considerations should I make for a production grade ...](https://www.reddit.com/r/Discord_Bots/comments/kd2pho/what_considerations_should_i_make_for_a/) - Hi All,

I am a self-taught programmer who recently got into creating a discord bot and was thinking...

12. [Getting SaaS-y with Stripe: Subscriptions and Webhook ...](https://www.youtube.com/watch?v=Vzkb42ao1B0) - Supabase is an extremely powerful and cheap option for building your next big startup idea. we look ...

13. [Stripe & Supabase SaaS Starter Kit](https://vercel.com/templates/next.js/stripe-supabase-saas-starter-kit) - This is the ultimate Next.js SAAS starter kit that includes a landing page, integrations with Supaba...

