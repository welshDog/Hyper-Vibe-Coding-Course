# DASHBOARD STATUS — 2026-05-31

Goal: stop guessing. Every dashboard gets: what it is, what’s changed, how to verify, and the next fix.

---

## 1) Grafana Observability (localhost:3001)

### What it is
- Self-hosted Grafana for the whole ecosystem (metrics + logs + traces).

### What’s working
- Grafana upgraded and dashboards render.
- Prometheus now scrapes the observability backbone (Grafana/Loki/Tempo/Promtail/Pyroscope) so “up/down” and alerts are real.
- Mission Control fixes landed:
  - Error Rate panel uses `status` label (not `status_code`) and safe division.
  - Services Up/Down scoped by a `core_jobs` variable.
- New “Ecosystem Launchpad” dashboard exists as a navigation hub inside Grafana.

### Proof (how to verify)
- Health/version:
  - `curl.exe -s http://localhost:3001/api/health`
- Dashboards:
  - Open `http://localhost:3001/dashboards`
  - Folder: Mission Control
  - Dashboards: “HyperCode Mission Control”, “HyperCode Ecosystem Launchpad”

### Next fix
- Commit/push the latest monitoring changes in `HyperCode-V2.4/` so outside help has the up-to-date truth.

---

## 2) Prometheus (localhost:9090)

### What it is
- Metrics collector and alert rule engine.

### What’s working
- New scrapes enabled for: `grafana`, `loki`, `tempo`, `promtail`, `pyroscope`, `crew-orchestrator`.
- Alerting coverage expanded for the observability backbone.
- Alert name collision resolved:
  - Container-based rule: `GrafanaRestartLoop` (from cAdvisor)
  - Process-based rule: `GrafanaProcessRestartLoop` (from Grafana /metrics)

### Proof (how to verify)
- Targets up:
  - Open `http://localhost:9090/targets`
- Rules loaded:
  - Open `http://localhost:9090/rules`

---

## 3) Hyper Vibe Coding Course (hyper-vibe-coding-course.vercel.app)

### What it is
- Gamified course platform (Vercel frontend + Supabase + HyperCode Stripe API + Supabase webhook).

### What’s working
- `/courses/:slug` “blank content” issue fixed via retry-on-auth hydration and test coverage.

### Next fix
- Go-live polish:
  - Confirm/repair the Vercel `VITE_STRIPE_*` env vars (Payment Links)
  - Verify Pricing always routes: Payment Link when present, otherwise Checkout Session fallback

---

## 4) HYPER Agents IDE (hyper-agents-ide.onrender.com)

### What it is
- Control room UI/API for agents list, chat history, and skills.

### What’s broken (observed earlier)
- “Failed to load agents/chat history/skills”.

### Next fix
- Align API base URL + CORS and add “warming up + retry” UX instead of hard failure.

---

## What to do next (ranked)

1) Commit/push monitoring changes in `HyperCode-V2.4/`
2) Finish Stripe go-live polish on Vercel (Payment Links + `VITE_STRIPE_*`)
3) Fix Agents IDE load failures (API base URL + CORS + retry UX)
4) Fix HyperCode IDE credential validation + restore agent reporting

