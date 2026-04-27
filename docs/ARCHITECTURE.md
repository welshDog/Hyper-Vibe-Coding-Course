# 🏗️ System Architecture (Current)

## Overview
Hyper Vibe is a Vite + React frontend backed by Supabase (Auth + Postgres + Edge Functions). Payments are handled via Stripe, with enrollment and fulfillment performed by a Supabase Edge Function.

## 🧩 Components

### 1) Frontend (Vite + React)
- **Tech**: React 18 + TypeScript + Vite + Tailwind
- **Location**: `frontend/`
- **Runtime**: Browser SPA with React Router
- **Responsibilities**:
  - Marketing + product UI (landing, pricing, courses, dashboard)
  - Supabase Auth flows (login/signup) and client-side reads/writes under RLS
  - Redirecting users into Stripe checkout (via backend endpoint)

### 2) Database + Auth (Supabase)
- **Tech**: Supabase Auth + Postgres + RLS
- **Schema & migrations**: `supabase/migrations/`
- **Seed data**: `supabase/seed-*.sql`
- **Responsibilities**:
  - Source of truth for users, courses, lessons, enrollments, XP/tokens, etc.
  - RLS policies enforce ownership and public-read behavior where intended
  - Triggers keep `public.users` synchronized with `auth.users`

### 3) Server-side functions
- **Supabase Edge Functions**: `supabase/functions/`
  - **stripe-webhook**: Receives Stripe webhook events and applies enrollments / token grants in Postgres
  - **sync-tokens-to-v24**: Triggered by a Supabase DB Webhook on `public.token_transactions` inserts; mirrors token awards into HyperCode V2.4
- **Vercel API routes**: `api/`
  - Serverless endpoints used for small “backend-y” features (e.g. BROski AI gateway)
- **Optional local API**: `apps/api/`
  - Node/Express API used for local development and experiments (not the primary production backend)

### 4) Deployment
- **Frontend & Vercel routes**: Vercel Git integration (builds `frontend/`, serves `api/` routes)
- **Supabase**: Migrations are applied via Supabase CLI against the linked project

## 🔄 Key Data Flows

### Auth
1. User signs up / logs in in the frontend.
2. Supabase Auth creates/updates `auth.users`.
3. Trigger copies key profile fields into `public.users` for application queries.

### Course purchase → enrollment
1. User starts checkout from the frontend.
2. Frontend calls the checkout endpoint (`VITE_HYPERCODE_API_URL`, e.g. `POST /api/stripe/checkout`) and redirects to Stripe.
3. Stripe sends webhook events to the Supabase `stripe-webhook` Edge Function.
4. The Edge Function validates the purchase and inserts an enrollment for the correct user/course (idempotent insert).

### Course rewards → HyperCode V2.4 wallet
1. Course awards BROski$ by inserting into `public.token_transactions`.
2. Supabase DB Webhook triggers Edge Function `sync-tokens-to-v24`.
3. Edge Function calls HyperCode V2.4: `POST /api/v1/economy/award-from-course` with `X-Sync-Secret`.
4. HyperCode V2.4 enforces idempotency using `source_id = token_transactions.id` and updates the V2.4 wallet.

## 🛡️ Security Model (High Level)
- **RLS-first**: All sensitive tables in Supabase rely on RLS for access control.
- **Webhook authority**: Enrollment is granted server-side from Stripe-owned signals (webhook), not from user-supplied IDs.
- **No secrets in the browser**: Frontend uses `SUPABASE_ANON_KEY` only; secret keys stay in Supabase/Vercel.
