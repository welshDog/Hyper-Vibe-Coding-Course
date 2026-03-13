# 📓 Dev Log: Hyper Vibe Rebuild

## What Changed vs The Original

| Original | Rebuild |
|----------|--------|
| Static GitHub Pages landing | Full-stack React + Node app |
| External tools (Gumroad, Airtable) | Custom backend + PostgreSQL |
| Markdown curriculum docs | Database-driven lessons with JSON content |
| No auth | JWT auth with accessibility preferences |
| Planned gamification (external) | Native XP/streaks/badge system |
| Manual setup | `docker-compose up` one-command setup |

## Why These Choices?

### Monorepo Structure
Keeps frontend + backend + database in sync.
Easier to refactor when everything is in one place.

### Explicit Naming Convention
All variables use full names: `userProgress` not `up`, `courseId` not `cid`.
This is intentional for neurodivergent devs - no mental decoding needed.

### Flat File Structure
No deep nesting. Max 3 levels deep.
Reduces cognitive load when navigating.

## Known TODOs

- [ ] Add Stripe payment integration
- [ ] Add email verification on register
- [ ] Add video lesson support
- [ ] Add quiz/assessment system
- [ ] Mobile responsive polish
- [ ] Deploy pipeline (Railway + Vercel)
