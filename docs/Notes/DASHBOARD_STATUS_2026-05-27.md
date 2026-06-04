# DASHBOARD STATUS — 2026-05-27

Goal: stop guessing. Every dashboard gets: what it is, what’s broken, what it calls, how to prove it, and the next fix.

---

## 1) HYPER Agents IDE (hyper-agents-ide.onrender.com)

### What it is
- 3-panel agent control room: agents list (left), chat (center), skills/tools (right)
- Hosted on Render

### What’s working
- UI layout is clean and readable
- Train-skill form pattern is strong (Title / Body / Idempotency key)

### What’s broken (observed)
- “Failed to load agents”
- “Failed to load chat history”
- “Failed to load skills”

### Proof (how to verify)
- **Calls:** Agents IDE frontend → its backend API (agents, chat history, skills)
- **Expected:** 200 responses with JSON payloads
- **Check logs:** Render dashboard → service → Logs
- **Also check:** frontend env var for API origin matches the deployed backend, and backend returns CORS headers for the frontend origin

### Likely causes (ranked)
- Wrong API base URL / missing env var in Render/Vercel config
- CORS blocked (backend doesn’t allow the frontend origin)
- Backend routes not deployed / router misconfigured
- Cold start (contributes, but not sufficient by itself)

### Next fix
- Replace hard failure banners with “Warming up…” + auto-retry loop
- Add a compact “API health” indicator (green/yellow/red) with last error + retry timer

---

## 2) Hyperfocus Z0ne Showcase (showcase-web-omega.vercel.app)

### What it is
- Public ecosystem landing/portfolio hub (Vercel)
- Showcases HyperCode V2.4, Hyper-Vibe Course, Obsidian Brain, BROskiPets, HyperAgent-SDK

### What’s working
- Headline is strong (“Build your AI Brain”)
- Status ticker is a great “control room” vibe
- LIVE/BETA/WIP badge system is clear
- Neurodivergent-first messaging is differentiated

### Proof (how to verify)
- **Calls:** mostly static/SSR + any status endpoint used for the ticker
- **Expected:** site loads fast + ticker fetch returns 200
- **Check logs:** Vercel → Deployments → Functions/Logs (if ticker is dynamic)

### Next fix (high leverage)
- Add a short “what you can do in 60 seconds” demo section (gif/video/screenshot)
- Feature Hyper Station 1.0 as its own flagship card

---

## 3) WelshDog HyperCode IDE (localhost:8088)

### What it is
- Local “powerhouse” dashboard: Metrics, Services, Agents, Tasks, BROski Pulse, Docker Zone, MCP, Health, Pricing

### What’s working
- Data-rich layout and navigation depth feels real and mature
- Accessibility modes (Default / Dyslexia / High-C / Focus) are a standout feature
- BROski Pulse gamification panel is strong

### What’s broken (observed)
- Health shows CRITICAL / container down (`trae-ide-trae-ide-1`)
- Error rate is very high
- Tasks show “Could not validate credentials”
- 0 agents reporting

### Proof (how to verify)
- **Check container state:** Docker dashboard / compose status
- **Expected:** core container(s) running + health endpoints green
- **Check logs:** container logs for the down service + API error logs
- **Auth proof:** whichever credentials flow Tasks uses should return 200 and a valid token

### Likely causes (ranked)
- One broken container cascades health + agent reporting
- Auth credentials expired/misaligned (Tasks integration)
- Backend can’t reach a dependency (DB, Redis, MCP bridge)

### Next fix
- Add a “Reconnect all” button in Health panel (re-auth + refresh)
- Add a “Restart services” button for local dev (safe guardrails)

---

## 4) Hyper Vibe Coding Course (hyper-vibe-coding-course.vercel.app)

### What it is
- Gamified course platform (Vercel frontend + Supabase + HyperCode V2.4 Stripe API + Supabase webhook)

### What’s working
- Mentor bubble tone is perfect
- Reduce-motion option is a real accessibility win
- Vibe Labs are uniquely differentiated

### What’s broken (observed)
- Pricing CTA shows: “Checkout for X isn’t configured yet”

### Proof (how to verify)
- **Pricing path today:** `frontend/src/pages/Pricing.tsx` resolves Stripe Payment Link URLs from env vars
  - `VITE_STRIPE_STARTER_URL`, `VITE_STRIPE_PRO_URL`, etc.
- **Expected:** env var exists → browser redirects to Stripe Payment Link
- **If missing:** warning toast appears (by design)
- **Check env:** Vercel → Project → Settings → Environment Variables

### Correct architecture (no ghosts)
- **Checkout session creation:** HyperCode V2.4 `POST /api/stripe/checkout`
- **Fulfillment after payment:** Supabase Edge Function `stripe-webhook`

### Next fix (recommended)
- Implement hybrid fallback on Pricing:
  - If Payment Link env var missing → call backend `createCheckoutSession(...)` and redirect to returned `checkout_url`

---

## What to do next (ranked)

1) Prove revenue loop with a £1 smoke test (TEST → LIVE)
2) Wire Pricing hybrid fallback (never dead-end)
3) Fix Agents IDE “failed to load” with proper API base + retry UX
4) Fix HyperCode IDE CRITICAL container + credential validation

