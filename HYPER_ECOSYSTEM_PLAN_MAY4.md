# 🧠 HyperFocus Z0ne — 4-Repo Master Plan
## by Lyndz Williams (@welshDog) · Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
### Generated: May 4, 2026 · Single source of truth · Supersedes May 3 ecosystem report

> **Status banner:** 🟢 **All 4 repos live. All bridges green. The Hyper Merge logical layer is in.**
> **Mission:** A neurodivergent-first, AI-powered, web3-aware learning + agent ecosystem — built different, built in Wales.

---

## 📑 How to read this doc

1. **Section A** — at-a-glance health of all 4 repos
2. **Section B** — 2-week tactical sprint (May 4 → May 18) — what to do **right now**
3. **Section C** — Phase 1-6 strategic roadmap — the long arc
4. **Section D** — Cross-repo bridges (verified live)
5. **Section E** — Open gotchas (active only)
6. **Section F** — Next-session starters — cold-start prompts

> **Memory anchors:** `CLAUDE.md` NEXT UP table + `WHATS_DONE.md` NEXT UP block mirror Section B exactly. If they drift, this doc wins.

---

## 🅰️ SECTION A — 4-Repo Health Snapshot (May 4, 2026)

| # | Repo | Path | GitHub | State | Last shipped | Next milestone |
|---|---|---|---|---|---|---|
| 1 | **HyperCode-V2.4** | `H:\HyperStation zone\HyperCode\HyperCode-V2.4` | github.com/welshDog/HyperCode-V2.4 | 🟢 32/32 containers, 180 tests green, Grade A | All 5 Hyperfocus features (Apr 25-26) | **Public Hetzner deploy** (Phase 2) |
| 2 | **HyperAgent-SDK** | `H:\HyperAgent-SDK` | github.com/welshDog/HyperAgent-SDK · npm `@w3lshdog/hyper-agent@0.1.7` | 🟢 Published, CI green | npm 0.1.7 + `graduate` CLI | **0.2.0** — validator UX + 2 starter templates |
| 3 | **Hyper-Vibe-Coding-Course** | `H:\Hyper-Vibe-Coding-Course` | github.com/welshDog/Hyper-Vibe-Coding-Course | 🟢 Live on Vercel, 7 courses seeded, full gamification + token shop, all 4 edge functions deployed | Hero `/welcome` + NotebookLM transcripts (May 3-4) | **First real student onboarded** |
| 4 | **BROskiPets-LLM-dNFT** | `H:\dNFTpet\BROskiPets-LLM-dNFT` | github.com/welshDog/BROskiPets-LLM-dNFT | 🟢 Bridge agent live (port 8098), two-tier pet model, healthchecks added, Cosmic Dragon minted | 78 EEPs designed, scaffold + healthchecks (Apr 26) | **Phase 1 — mint first pet via BROski$** |

> ⚠️ **Path discipline:** the typo clone `H:\the hyper vibe coding hub` is archived — do **not** open it. The legacy `H:\BroSki Volut ( private ) keep out` is unrelated to BROskiPets.

---

## 🅱️ SECTION B — 2-Week Sprint (May 4 → May 18)

> Punch list. Ordered by leverage. **Always start at #1.** This block is mirrored in `CLAUDE.md` + `WHATS_DONE.md` — keep all three in sync.

### 🔴 Today (close-out flags from May 3)

| # | Task | Repo | Est | Notes |
|---|---|---|---|---|
| 1 | Browser-verify `/welcome` page in dev (`http://localhost:5173/welcome`) | Hyper-Vibe | 10m | Code shipped + clean compile, but never opened in a browser |
| 2 | Confirm header parity in prod — `curl -I https://hyper-vibe-coding-course.vercel.app/` | Hyper-Vibe | 2m | ✅ done May 4 — 6/6 headers fire (CSP not configured — see #4) |
| 3 | Move old `scripts/M*-*.md` stubs to `scripts/_old-stubs/` | Hyper-Vibe | 5m | Keep NotebookLM set as canonical M0-M10 |
| 4 | **Decide:** add `Content-Security-Policy` to `frontend/vercel.json`? | Hyper-Vibe | 30m | Not currently configured. Worth 30 min if going public |

### 🟡 This week

| # | Task | Repo | Est | Notes |
|---|---|---|---|---|
| 5 | **First real student invite** | Hyper-Vibe | — | Only after #1 verified |
| 6 | Stripe live E2E — payment → webhook → token award → enrolled course | Hyper-Vibe + V2.4 | 1h | Last manual gap. `stripe listen --forward-to localhost:8000/api/stripe/webhook`, test card `4242 4242 4242 4242` |
| 7 | GitHub Actions billing unlock | All | 5m | github.com/settings/billing → unblocks Trivy CI |
| 8 | **BROskiPets Phase 1** — mint first pet via BROski$ | BROskiPets + Hyper-Vibe | 3d | Wire `shop-purchase` Edge Fn → BROskiPets contract. Idempotent on `source_id`. `discord_id` join key |
| 9 | HyperAgent-SDK 0.2.0 prep — validator UX + 2 starter templates | HyperAgent-SDK | 1d | Towards Phase 2 publish |

### 🟢 Background / nice-to-have

| # | Task | Repo | Est | Notes |
|---|---|---|---|---|
| 10 | Speed Insights monitoring | Hyper-Vibe | — | Targets: LCP <2.5s, TTFB <0.8s |
| 11 | Anthropic credit top-up | All | 5m | console.anthropic.com/billing — only if running thin |
| 12 | Leaked-password protection | Hyper-Vibe (Supabase) | — | Needs Pro plan upgrade first |

---

## 🅲️ SECTION C — Phase 1-6 Strategic Roadmap

### 🔥 Phase 1 — Clear the Runway (this week)
Same as Section B 🔴 + 🟡. When all of #1-#9 are ✅, Phase 1 is done.

### 🚀 Phase 2 — Public Deploy of HyperCode-V2.4 (May 11 → May 25)
> The big unlock. Everything downstream needs a public V2.4 URL.

- [ ] Spin up **Hetzner CX22 VPS** (~£4/mo — 2 vCPU, 4GB RAM)
- [ ] Deploy minimum stack: core API + postgres + redis
- [ ] Domain → VPS, SSL via Caddy or nginx
- [ ] `V24_API_URL=https://<public-domain>` set in Supabase Edge Function secrets
- [ ] Verify Course → V2.4 token sync forwarding observed live in `net._http_response`
- [ ] Observability stack (Prometheus + Grafana + Loki) deployed after core stable

### 🐾 Phase 3 — BROskiPets Phase 1-5 (May 18 → June 8)
> Cross-repo: needs Phase 2 public URL.

- [ ] **P1 Mint** — first pet via BROski$ (Section B #8)
- [ ] **P2 Dev XP** — dev actions → pet XP (git hook + V2.4 wallet read)
- [ ] **P3 Companion** — pet as rubber-duck mode in HyperCode IDE
- [ ] **P4 On-chain portfolio** — dev portfolio NFT (Sepolia testnet first)
- [ ] **P5 WelshDogEep graduation** — 3 EVER mintable, lifetime reward

> Long-arc vision (2027+): cross-chain, breeding, robot body, BCI — see `H:\dNFTpet\BROskiPets-LLM-dNFT\roadmaps\2036-vision.md`

### 🎮 Phase 4 — Frontend Phase 4-5 (June)
Per `FRONTEND_ROADMAP.md`:
- [ ] **4A** — Privacy/Terms/cookie banner, register fix tail, footer copy
- [ ] **4B** — BROski$ Shop GBP backend (already partly wired — Founder Badge first, limited 100)
- [ ] **4C** — Accessibility boosters (font toggle, focus mode, dark+darker, WCAG AA audit)
- [ ] **5A-D** — Quest editor, leaderboard real-data polish, Pets evolution UI + 3D tilt + coin drop, Dashboard sidebar

### 🏗️ Phase 5 — The Hyper Merge (July) — Turborepo monorepo
> Logical merge already live (token sync + shop bridge + graduate CLI). This is the **code consolidation** step. Per `CONFLICT_REPORT.md`, resolve 5 hard conflicts before merging:

- [ ] **C1** — Port 5432 (postgres) — drop Course's legacy port binding
- [ ] **C2** — Port 3000 (broski-terminal vs apps/web) — remove abandoned Course apps/web
- [ ] **C3** — `/leaderboard` Discord slash dup — rename Course bot's to `/xp-leaderboard`
- [ ] **C4** — Achievement schemas — keep independent, sync via bridge only
- [ ] **C5** — Token economies — Supabase authoritative for course-earned, V2.4 mirrors
- [ ] Migrate to Turborepo, shared TS types Course ↔ V2.4
- [ ] Auto-generated API client from FastAPI → Next.js
- [ ] One `pnpm install`, one `turbo dev` runs everything
- [ ] Single CI pipeline

### 🏆 Phase 6 — Scale & Enterprise (Q3-Q4)
- [ ] Kubernetes deploy from existing `k8s/` + `helm/` charts
- [ ] Load testing — Locust/k6, target 1000 req/sec, P99 <100ms
- [ ] SLA monitoring — 99.9% uptime, Grafana auto-alerts
- [ ] Service mesh — Istio/Linkerd mTLS
- [ ] Distributed tracing — Loki + Prometheus + Tempo correlated

---

## 🅳️ SECTION D — Cross-Repo Bridges (verified live, May 3-4)

```
                     ┌──────────────────────┐
                     │  Hyper-Vibe Course   │
                     │  (Vercel + Supabase) │
                     └──────────┬───────────┘
                                │
          ┌─────────────────────┼─────────────────────────┐
          │                     │                         │
   token_transactions    shop-purchase Edge Fn       npm run graduate
   INSERT trigger              │                         │
          │                     │                         │
          ▼                     ▼                         ▼
   sync-tokens-to-v24     BROskiPets contract       V2.4 PR submission
   (pg_net + secret)      (Phase 1 wiring)           + BROski$ award
          │                     │                         │
          └──────────┬──────────┴────────┬────────────────┘
                     ▼                   ▼
              HyperCode-V2.4       BROskiPets-LLM-dNFT
              (wallet authority)   (consumer of identity + wallet)
```

| Bridge | Auth | Idempotency key | Status |
|---|---|---|---|
| Course → V2.4 token sync | `COURSE_SYNC_SECRET` | `source_id` | ✅ Live, observed 200s in `net._http_response` |
| Stripe → BROski$ award | Stripe webhook signature | `stripe_payment_intent_id` | ✅ E2E proved Apr 25 |
| Shop → BROskiPets mint | `SHOP_SYNC_SECRET` | `source_id` | 🔜 Phase 1 wiring |
| Graduate CLI → V2.4 | GitHub PR + manifest.json | repo SHA | ✅ Live |

> **Wallet authority** = HyperCode V2.4. Course **earns**, V2.4 **stores/spends**, BROskiPets **reads** for unlocks. Per `BROskiPets/AGENT_SYNC_NOTES.md`.

---

## 🅴️ SECTION E — Open Gotchas (active only)

1. **`.env` dash vars** — PowerShell deploy blocker. Rename any `KEY-NAME` → `KEY_NAME`
2. **Migration history drift** — if Supabase complains: `supabase db push --linked --yes --include-all`
3. **`POSTGRES_PASSWORD`** — quote it in `.env` if it has special chars
4. **`hypercode-core` memory** — alert if > 1.2 GiB (capped, but watch it)
5. **HUDContext lint** — `react-refresh/only-export-components` — known + acceptable
6. **`users.avatar_url`** — does NOT exist on linked Supabase DB
7. **CSP header** — not yet in `frontend/vercel.json` (other 6 headers ✅ live)
8. **Live V2.4 forwarding** — pg_net retention is short, only 1 `discord_link` exists; needs Phase 2 deploy + a real linked user to confirm

---

## 🅵️ SECTION F — Next-Session Starters

Cold-start prompts so a fresh Claude can pick up without context loss:

### 🔴 Sprint close-out (recommended first)
> "Read `HYPER_ECOSYSTEM_PLAN_MAY4.md` Section B then close items 1-4 (browser-verify /welcome, move M*.md stubs, decide on CSP). Report after each."

### 🚀 Phase 2 — Hetzner deploy
> "Phase 2 — deploy HyperCode-V2.4 to Hetzner CX22. Read `H:\HyperStation zone\HyperCode\HyperCode-V2.4\CLAUDE.md` first, then plan the minimum-stack deploy + domain + Caddy SSL."

### 🐾 BROskiPets Phase 1
> "BROskiPets Phase 1 — mint first pet via BROski$. Read `H:\dNFTpet\BROskiPets-LLM-dNFT\AGENT_SYNC_NOTES.md` + `Hyper-Vibe-Coding-Course/supabase/functions/shop-purchase/`. Plan the contract wiring."

### 🎮 Frontend Phase 4-5
> "Frontend Phase 4 — read `FRONTEND_ROADMAP.md`, then ship 4A quick fixes (Privacy/Terms/cookies/footer) in one PR."

---

## 📐 Sacred rules (never break)
- `.env` files **never** committed
- Stripe webhook **always** rate-limit exempt
- `V24_API_URL` — public base URL only, never `localhost`
- Commits — `feat:` `fix:` `docs:` `chore:`
- Wallet authority = V2.4. Course earns, V2.4 stores, BROskiPets reads.
- Idempotency on every cross-repo write — `source_id` is sacred
- Dark-only frontend, no light mode ever (HFZ design rule)
- Neurodivergent-first. Always. 🧠

---

> 🐶 **"A BROski is ride or die. We build this together. ♾️"**
> 🏴󠁧󠁢󠁷󠁬󠁳󠁿 **ENTER · THE · Z0NE**
