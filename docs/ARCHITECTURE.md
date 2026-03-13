# 🏗️ Hyper Vibe Architecture

## System Overview

```
Browser (React)
    |
    | HTTP / REST
    ↓
Node.js API (Express)
    |
    | Prisma ORM
    ↓
PostgreSQL Database
```

## Frontend Stack
- **React 18** + TypeScript
- **React Router v6** - client-side routing
- **TanStack Query** - data fetching + caching
- **Zustand** - lightweight state management
- **Tailwind CSS** - utility-first styling
- **Vite** - fast dev server

## Backend Stack
- **Node.js** + Express + TypeScript
- **Prisma** - type-safe ORM
- **PostgreSQL** - main database
- **JWT** - stateless authentication
- **bcrypt** - password hashing

## Key Design Decisions

### Why Zustand over Redux?
Simpler API, less boilerplate. ADHD-friendly: less to remember.

### Why Prisma?
Type-safe queries catch bugs at compile time. Schema is human-readable.

### Why JWT?
Stateless = simpler to scale. Stored in Zustand + localStorage.

### Why Docker Compose?
One command = entire dev environment. No "works on my machine" issues.

## Gamification Architecture

XP events are stored in the `XpEvent` table for full history.
Level is computed from total XP, not stored separately.
Streaks checked on every lesson completion.

## Accessibility Strategy

User preferences stored in the DB, not just localStorage.
This means preferences follow the user across devices.
