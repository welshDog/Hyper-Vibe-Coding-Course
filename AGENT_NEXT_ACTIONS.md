# Agent Next Actions

Last updated: 2026-08-05

This file is the single source of truth for "what to do next" so any agent (Claude, Comet, etc.) picking up this repo doesn't need to re-read old chat history. Check WHATS_DONE.md and the latest handover doc first for context, then use this file for open next steps.

## Course Track (Hyper Vibe Coding Course)

- [ ] Draft full specs for Modules M11-M23 (extended tracks: Neurodivergent Tools, BROskiPets, Monorepo, Creator path). Create COURSE_MASTER_TRACKER_V2.md to track these alongside the existing M1-M10 tracker.
- [ ] Record scripts for M1-M10 (status: scripts ready, not yet recorded per COURSE_MASTER_TRACKER.md).
- [ ] Build out the NotebookLM / Agent teaching-prompt system for the Neurodivergent Tools modules - system prompt + style rules for an AI teaching agent. Save as PROMPTS/notebooklm-teaching-agent.md (or similar) once drafted.

## BROskiPets Track

- [ ] Break Wave-1 design spec (Hunger/Cleanliness) into an implementation task list: DB schema changes, RPCs, frontend flows, and tests.
- [ ] Break Wave-2 design spec (Happiness + derived care mood) into the same implementation task breakdown.
- [ ] Write up the /pets page "next-10 polish" punch list as a committed spec (currently only discussed, not saved to repo).
- [ ] Draft the shop item/booster effect system spec (item schema, effect matrix, focus/streak mechanics) - currently only discussed in chat.

## How to Use This File

- When starting a new session, read this file top to bottom before planning work.
- When an item is completed, move it into WHATS_DONE.md and delete it from here (or check it off and archive periodically).
- Add new brainstormed-but-uncommitted ideas here as soon as they're identified, so nothing lives only in chat.
