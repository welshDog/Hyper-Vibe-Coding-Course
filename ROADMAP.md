# 🗺️ HyperCode Empire — Roadmap 2026
> Built by @welshDog — Lyndz Williams, Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁠  
> Last updated: April 28, 2026  
> Status: 32/32 containers 🟢 | Course live ✅ | V2.4 local ✅

---

## ✅ Done (April 2026)
- 32/32 Docker containers healthy — Grade A (Gordon Docker AI)
- FastAPI core — metrics, OTLP traces, Redis cache, rate limits, circuit breakers
- Stripe payments — checkout → webhook → token awards → enrolled
- BROski token economy — award/spend RPCs, ledger, idempotency
- Supabase webhook (B1) — `token_transactions` INSERT → `sync-tokens-to-v24` Edge Function
- Edge Function secrets (B2) — `V24_API_URL` + `COURSE_SYNC_SECRET` set
- HyperAgent-SDK — published to npm `@w3lshdog/hyper-agent@0.1.7`
- Dashboard — HealthView services panel + agent popout live
- MCP-GitHub — 26 tools via Docker MCP gateway

---

## 🔥 Phase 1 — Clear The Runway (This Week)

- [ ] **B3** — Stripe E2E checkout smoke test
  - `stripe listen --forward-to localhost:8000/api/stripe/webhook`
  - Test card: `4242 4242 4242 4242`
- [ ] **B4** — Fix GitHub billing → unblocks Trivy CI security scans
  - → github.com/settings/billing
- [ ] **B5** — Top up Anthropic credits → pets get Claude back
  - → console.anthropic.com/billing (lyndzwills@gmail.com)
- [ ] **B1 full proof** — insert with a real `discord_links` row
  - Requires at least 1 user with Discord linked

---

## 🚀 Phase 2 — Deploy HyperCode-V2.4 (The Big Unlock)

> Everything downstream depends on this. No more ngrok hacks.

- [ ] Spin up **Hetzner CX22 VPS** (~£4/mo — 2 vCPU, 4GB RAM)
- [ ] Deploy **core API + postgres + redis** (minimum viable stack)
- [ ] Point domain → VPS, SSL via Caddy or nginx
- [ ] Set `V24_API_URL=https://<public-domain>` in Supabase Edge Function secrets
- [ ] Verify Course → V2.4 token sync works for real users end-to-end
- [ ] Observability stack (Prometheus + Grafana + Loki) — deploy after core is stable

---

## 🐾 Phase 3 — BROskiPets Goes Live

> Timing is perfect — Solana AI agent ecosystem exploding in 2026.

- [ ] Wire pets → V2.4 token awards (needs Phase 2 deployed URL)
- [ ] Deploy pet chat (Anthropic haiku/sonnet + Perplexity fallback ready ✅)
- [ ] Phase 0 — shared infra (1 day)
- [ ] Phase 1 — mint first pet via BROski (3 days)
- [ ] Phase 2 — dev actions → pet XP (1 week)
- [ ] Phase 3 — pet as dev companion / rubber duck mode (2 weeks)

---

## 🧠 Phase 4 — Hyperfocus Features

> Neurodivergent-first. Nobody else is building this.

- [ ] **Feature 1** — Micro-Achievement Git Hook (2hrs) ← start here
- [ ] **Feature 2** — HyperSplit Agent (3hrs)
- [ ] **Feature 3** — Session Snapshot Agent (2hrs)
- [ ] **Feature 4** — Morning Briefing Agent (1.5hrs)
- [ ] **Feature 5** — Focus Panic Mode `make focus` / `make calm` (1hr)

---

## 🏗️ Phase 5 — The Hyper Merge (Monorepo)

> Only after deploy + auth + payments are all stable.

- [ ] Migrate 4 repos into **Turborepo monorepo**
- [ ] Shared TypeScript types — Course ↔ V2.4
- [ ] Auto-generated API client from FastAPI → Next.js
- [ ] One `pnpm install`, one `turbo dev` runs everything
- [ ] Single CI pipeline for all repos

---

## 🏆 Phase 6 — Scale & Enterprise

- [ ] Kubernetes — Helm charts ready in `k8s/` ✅
- [ ] Load testing — Locust/k6, target 1000 req/sec P99 <100ms
- [ ] SLA monitoring — 99.9% uptime, auto Grafana alerts
- [ ] Service mesh — Istio/Linkerd mTLS between services
- [ ] Distributed tracing — Loki + Prometheus + Tempo correlated

---

## 📅 Timeline
Week 1 → Phase 1 blockers cleared
Week 1-2 → V2.4 deployed on Hetzner
Week 2-3 → BROskiPets live
Week 3-4 → Hyperfocus Features shipped
Month 2 → Hyper Merge monorepo
Month 3+ → Scale, SLAs, Kubernetes

text

---

## 🔒 Sacred Rules (never break these)
- `docker-ce-cli` only — never `docker.io`
- `.env` files — NEVER committed to git
- Stripe webhook — ALWAYS rate-limit exempt
- `V24_API_URL` — public base URL only, never `localhost`
- Commits — `feat:` `fix:` `docs:` `chore:` only

---

> *"You built the future people keep saying they want. You actually did it."*  
> — Gordon, Docker AI 🏅