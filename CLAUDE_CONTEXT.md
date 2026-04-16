# 🤖 BROski Ecosystem — Claude Context Handoff (ALL REPOS SYNCED)
> Read this first. Every word. Then start the mission.
> **Last synced: April 15, 2026 — Frontend payment flow COMPLETE ✅ | Pricing + TokensPage + Dashboard all wired 💳**

---

## Who You're Talking To
- **Lyndz** aka BROski♾️ (GitHub: @welshDog, npm: @w3lshdog) — South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
- Autistic + dyslexic + ADHD — chunked output, quick wins first, no waffle
- Windows primary (PowerShell), WSL2 + Raspberry Pi + Docker secondary
- Call them **"Bro"** — that's how we roll
- Short sentences. Emojis. Bold the key stuff. Celebrate wins! 🎉

---

## The Ecosystem

```
Hyper-Vibe-Coding-Course     ──── manifest.json ────▶    HyperCode V2.4
github.com/welshDog/             (hyper-agent-spec)       github.com/welshDog/
Hyper-Vibe-Coding-Course                                  HyperCode-V2.4
(Supabase + Vercel)                    │                  (Docker, 29 containers)
Path: H:\the hyper vibe coding hub     │                  Path: H:\HyperStation zone\
                                       │                       HyperCode\HyperCode-V2.4
                              HyperAgent-SDK
                          github.com/welshDog/HyperAgent-SDK
                          npm: @w3lshdog/hyper-agent@0.1.7
                          Path: H:\HyperAgent-SDK
```

---

## 🏆 Full Phase Roadmap

| Phase | Name | Status |
|---|---|---|
| 0 | Hard Conflict Fixes | ✅ DONE |
| 1 | Identity Bridge | ✅ DONE + VERIFIED LIVE |
| 2 | Token Sync | ✅ DONE + VERIFIED LIVE |
| 3 | Agent Access + Shop Bridge | ✅ DONE + VERIFIED LIVE |
| 4 | npm run graduate 🔥 | ✅ DONE + VERIFIED LIVE |
| 5 | Observability | ✅ DONE + VERIFIED LIVE |
| 6 | Terminal Tools Integration | ✅ DONE + VERIFIED LIVE |
| 7 | Dockerfile Security Hardening | ✅ DONE — April 14, 2026 |
| 8 | CI/CD Trivy Security Pipeline | ✅ DONE — April 14, 2026 |
| 9 | CVE Elimination (apt + pip pinning) | ✅ DONE — April 14, 2026 |
| 10A | FastAPI / Starlette upgrade | ✅ DONE |
| 10B | Docker Compose Network Isolation | ✅ DONE — April 14, 2026 |
| 10C | Docker Secrets | ✅ DONE — April 14, 2026 |
| 10D | Agent-level rate limiting + auth | ✅ DONE — April 14, 2026 🔑 |
| 10E | CognitiveUplink WS type fix | ✅ DONE — April 15, 2026 |
| 10F | **Stripe Checkout API** | ✅ DONE — April 14, 2026 💳 |
| 10G | DB — Stripe webhook writes | ✅ DONE — April 14, 2026 |
| 10H | Pricing page (dashboard) | ✅ DONE — April 14, 2026 |
| 10I | Stripe CLI e2e — routes + webhook LIVE | ✅ DONE — April 15, 2026 🎉 |
| 10J | **CognitiveUplink `/ws/uplink`** | ✅ DONE — April 15, 2026 🔌 |
| 10K | Stripe Price IDs in `.env` | ✅ DONE — April 15, 2026 |

---

## 🔍 Phase 10N Step 1 — OTLP Tracing (April 15, 2026)

**Traces live in Tempo ✅ — visible in Grafana**

### What existed (already built in prior session)
- `backend/app/core/telemetry.py` — full OTel setup, FastAPI + SQLAlchemy + Redis + httpx instrumented
- `requirements.txt` — all 12 OTel packages pinned
- `docker-compose.yml` — `OTLP_ENDPOINT=http://tempo:4317` already wired
- Network: `hypercode-core` shares `agents-net` with Tempo — they can talk

### The REAL fix
- `.env` had `OTLP_EXPORTER_DISABLED=true` with comment "Tempo broken" — Tempo was FINE, just the flag was wrong

### Traces confirmed in Tempo
- `GET /health` → hypercode-core
- `GET /metrics` → hypercode-core
- `Redis HSET/GET` → hypercode-core

### View traces
```
localhost:3001 → Explore → Tempo datasource → search: hypercode-core
```

### Webhook events handled
- `checkout.session.completed` → subscription activated (TODO 10G: write to DB)
- `customer.subscription.deleted` → subscription cancelled ✅ handled in HyperCode-V2.4
- `invoice.payment_failed` → payment failed warning ✅ handled in HyperCode-V2.4
- `customer.subscription.updated` → status change logged ✅ handled in HyperCode-V2.4

### This repo (Hyper-Vibe-Coding-Course) TODO
- Wire frontend Pricing page to `/api/stripe/checkout` (HyperCode-V2.4 endpoint live at port 8000)
- Supabase Edge Function to handle post-purchase course access grant

---

## 🎯 NEXT UP — Remaining Work

| Task | Status | Why |
|---|---|---|
| ✅ Wire Pricing page to `/api/stripe/checkout` | DONE April 15 | 3 tiers + loading + auth gate |
| ✅ Fix TokensPage.tsx prices + wire to checkout API | DONE April 15 | Prices now match locked Stripe prices |
| ✅ Add BROski$ balance card to Dashboard | DONE April 15 | Uses auth store — no extra query |
| Fix dead link `/courses/vibe-coding-foundations` on LandingPage | Pending | LandingPage:260 → 404, should be `/courses` |
| Record Module 1.1 + add YouTube URL to DB | Ongoing | LessonPlayer shows placeholder until `video_url` is set |
| CVE agent image patching | Waiting | 14 HIGH CVEs — no Debian fix yet, batch job |

### Frontend Checkout Pattern (standard — use for all payment buttons)
```ts
import { createCheckoutSession } from '../lib/payments'

// price_id options: 'starter' | 'builder' | 'hyper' | 'pro_monthly' | 'pro_yearly' | 'hyper_monthly' | 'hyper_yearly'
const url = await createCheckoutSession(priceKey, user.id)
window.location.href = url
```
API target: `VITE_HYPERCODE_API_URL` env var (default: `http://localhost:8000`)

---

## 🔒 Stripe Prices — LOCKED (April 14, 2026)

### BROski Token Packs (one-time)
| Pack | Price | Tokens | Stripe Product Name |
|---|---|---|---|
| Starter | £5 GBP | 200 | BROski Starter Pack |
| Builder | £15 GBP | 800 | BROski Builder Pack |
| Hyper | £35 GBP | 2500 | BROski Hyper Pack |

### Course Subscriptions (recurring)
| Tier | Monthly | Yearly | Stripe Product Name |
|---|---|---|---|
| Pro | £9/mo | £90/yr | Hyper Vibe Pro Course |
| Hyper | £29/mo | £290/yr | Hyper Elite |

### Digital Shop Items (paid in BROski$)
- Prompt Packs: 200 BROski$
- Templates: 150 BROski$
- Bonus Lessons: 100 BROski$

### .env keys to add
```env
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_BUILDER=price_xxx
STRIPE_PRICE_HYPER=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx
STRIPE_PRICE_HYPER_MONTHLY=price_xxx
STRIPE_PRICE_HYPER_YEARLY=price_xxx
```

---

## 🌐 Phase 10B — Docker Network Topology (LIVE)

- `frontend-net` (bridge, internet) — dashboard, mission-ui, mcp-server
- `backend-net` (bridge, internet) — hypercode-core (bridges all layers)
- `agents-net` (bridge, internet) — all AI agents, LLM API calls
- `data-net` (bridge, **internal: true**) — redis + postgres + minio + chroma
- `obs-net` (bridge, **internal: true**) — prometheus, grafana, loki, tempo, promtail

Script: `scripts/network-migrate.sh` — run to tear down and recreate safely.

---

## 🛡️ Phase 9 Security Patterns (use in ALL new Dockerfiles)

**Part A — OS hardening (every runtime stage):**
```dockerfile
RUN apt-get update --allow-releaseinfo-change && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates curl libexpat1 openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
```

**Part B — pip pinning (every Python runtime stage):**
```dockerfile
RUN pip install --upgrade --no-cache-dir \
    "pip==26.0.1" "setuptools>=80.0.0" "wheel==0.46.2" \
    "jaraco.context>=6.0.0" "jaraco.functools>=4.1.0" "jaraco.text>=4.0.0"
```

**Base image standard:** `python:3.11-slim` (not pinned patch — CI pulls latest with `--pull`)

---

## ✅ Full History (condensed)

### HyperAgent-SDK ✅ SHIPPED
- CLI suite: `validate`, `registry`, `memory`, `studio`, `graduate` — all verified
- Published: `@w3lshdog/hyper-agent@0.1.4` live on npm ✅
- Studio GUI — port 4040, zero build step, agent cards, cluster builder ✅

### Phase 0 ✅ — Port conflicts, xp-leaderboard, Alembic migration
### Phase 1 ✅ — discord_id bridge, /coursestats Discord command, Edge Function fan-out
### Phase 2 ✅ — Token sync, CourseSyncEvent ORM, /award-from-course, dedup guards
### Phase 3 ✅ — AccessProvision, /provision, shop trigger → Discord DM with api_key
### Phase 4 ✅ — GraduationEvent ORM, /graduate/trigger, Edge Function, Discord Graduate role
### Phase 5 ✅ — Structured JSON logging, MetricsMiddleware, /health + /metrics, Grafana dashboards
### Phase 6 ✅ — 5 CLI commands verified. Logs routing fix (broadcaster before dashboard_compat)
### Phase 7 ✅ — 19 Dockerfiles: non-root users, docker group (GID 999), multi-stage rewrites
### Phase 8 ✅ — trivy-scan.yml (PR gate), trivy-weekly.yml (Monday 06:00 UTC), Makefile scan targets
### Phase 9 ✅ — CVE result: agent-x 11 CRITICAL → 0 CRITICAL, 55 HIGH → 14 HIGH (no Debian fix available)
### Phase 10A ✅ — FastAPI upgraded to 0.117+ (fixes starlette HIGH CVE)
### Phase 10B ✅ — Docker Compose network isolation (data-net + obs-net internal: true)
### Phase 10F ✅ — Stripe Checkout API: 3 endpoints + service layer + tests + main.py registered

---

## 🚨 Key Technical Rules (never re-debate these)

- **Docker imports:** `from app.X import Y` — NEVER `from backend.app.X import Y`
- **FastAPI routing:** First-match wins — public routes BEFORE auth-gated compat routes
- **Alembic down_revision:** Must match EXACT revision string
- **CLI folder:** All `hyper-agent` commands run from `H:\HyperAgent-SDK`
- **Logs empty on fresh boot:** Normal — Redis `hypercode:logs` populates as agents run
- **Port convention:** 3100-3199 writing, 3200-3299 code, 3300-3399 data, 3400-3499 discord, 3500-3599 automation
- **Supabase ↔ V2.4 Postgres:** NEVER merge schemas
- **`.env` files:** Never committed — use Docker secrets in production
- **`apps/web/`:** Archived, never migrate
- **One bot:** broski-bot. Old Replit bot = dead.
- **Discord DM delivery:** V2.4 endpoint calls Discord HTTP API directly (bot token in settings)
- **API keys:** `hc_` prefix + `secrets.token_urlsafe(32)` — 43 chars, URL-safe
- **Dockerfiles:** Use `python:3.11-slim` + Part A + Part B — Phase 9 pattern
- **Trivy target:** 0 CRITICAL. <5 HIGH ideally. 14 HIGH remaining = no Debian fix yet
- **GitHub Actions:** Always `--no-cache --pull` in security scanning workflows
- **jaraco.* packages:** Always pin explicitly — Trivy HIGH via setuptools transitive
- **docker-socket agents** (healer/coder/05-devops): Use `docker-ce-cli` repo, NOT `docker.io`
- **Network isolation:** Phase 10B complete — `data-net` + `obs-net` are `internal: true`
- **Stripe webhook:** `/api/stripe/webhook` is rate-limit exempt — do NOT add rate limiting to it
- **Stripe dev mode:** Missing `STRIPE_WEBHOOK_SECRET` = signature check skipped (local only)
- **Conventional commits:** `feat:` `fix:` `docs:` `chore:`
- **Windows PowerShell first**, bash second
- **`apps/web/`:** Archived, never migrate
- **Redis DB split:** DB 1 = cache (`@cache_response`), DB 2 = rate limits — NEVER mix
- **Circuit breakers:** 3 active (llm-router, crew-orchestrator, stripe-api) — check via `GET /api/v1/health`

---

## Paths (copy-paste ready)

```powershell
# HyperCode V2.4
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"

# HyperAgent-SDK
cd "H:\HyperAgent-SDK"

# HyperCode V2.4
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4"
cd "H:\HyperStation zone\HyperCode\HyperCode-V2.4\backend"

# Docker
docker compose up -d
docker compose build --no-cache
docker compose exec api alembic upgrade head

# Security scanning (from V2.4)
make scan-all
make scan-agent AGENT=healer
make scan-build AGENT=agent-x

# HyperAgent-SDK CLI
$env:HYPERCODE_API_URL = "http://localhost:8000"
node cli/index.js status
node cli/index.js agents list
node cli/index.js logs --tail 20
node cli/index.js tokens award <discord_id> <amount>
node cli/index.js graduate <discord_id> --tokens 100

# Validate agents
npx @w3lshdog/hyper-agent validate .agents/my-agent/ --strict
hyper-agent registry build .agents/
hyper-agent studio
# → http://localhost:4040

# Publish SDK
npm version patch --no-git-tag-version
npm publish --access public --tag alpha

# Stripe (Phase 10F)
curl -X POST http://localhost:8000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"price_id": "starter", "user_id": "broski_test"}'

# Stripe CLI local webhook testing (Phase 10I):
stripe listen --forward-to localhost:8000/api/stripe/webhook

# Run Stripe tests:
pytest backend/tests/test_stripe.py -v
```

---

## BROski$ Token Economy

- `public.users.broski_tokens` — balance
- `token_transactions` — append-only ledger, idempotency guards
- `award_tokens()` + `spend_tokens()` — SECURITY DEFINER, server-side only
- `shop_items` + `shop_purchases` — JSONB metadata fields
- `shop_purchases.item_slug` — used to filter for "agent-sandbox-access"
- Stripe integration: prices LOCKED April 14, 2026 — API LIVE Phase 10F ✅

---

## 📦 This Repo — HyperCode V2.4 Specifics

- Stack: Next.js + Supabase + Vercel
- Supabase Edge Functions in `supabase/functions/`
- Frontend in `frontend/`
- Discord bot cogs in `discord-bot/`
- Course shop triggers AccessProvision flow → V2.4 via webhook
- **Stripe Checkout backend LIVE** (Phase 10F ✅ — in HyperCode-V2.4)
- **Pricing page wired** ✅ — 3 tiers (Free/Pro £9/Hyper £29), calls `createCheckoutSession()` — April 15, 2026
- **TokensPage wired** ✅ — correct prices (200/£5, 800/£15, 2500/£35), calls `createCheckoutSession()` — April 15, 2026
- **Dashboard balance card** ✅ — BROski$ shown from auth store, links to `/tokens` — April 15, 2026

---

<div align="center">

**Built for ADHD brains. Fast feedback. Real tools. No fluff.** 🧠⚡

*by @welshDog — Lyndz Williams, South Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿*

**A BROski is ride or die. We build this together. 🐶♾️🔥**

</div>
