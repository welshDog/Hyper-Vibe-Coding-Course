# 🛡️ Security & SRE Observability

**Module:** M10 | **Level:** Hyper-Pro | **XP:** 80 | **Coins:** 35 BROski$

> You built the empire. Now let's make sure it doesn't fall. Security. Monitoring. Self-healing. This is how pros run production.

---

## 🎯 What You'll Learn

- Implement Row Level Security (RLS) on every Supabase table
- Set up the full observability stack: Prometheus + Grafana + Loki + Tempo
- Configure alerting for critical service failures
- Conduct a security audit of your agent architecture
- Understand the principle of least privilege for service accounts

---

## 🧠 The Big Idea

**SRE** (Site Reliability Engineering) = the practice of keeping systems alive, fast, and secure in production.

For an AI agent ecosystem, this means:
- **Visibility:** You can SEE what every agent is doing in real-time
- **Alerting:** You know BEFORE users do when something breaks
- **Recovery:** The system fixes itself where possible
- **Security:** Only the right entities can access the right data

---

## 📊 The Observability Stack

| Tool | Role | What it monitors |
|------|------|------------------|
| Prometheus | Metrics scraper | CPU, memory, request rates per container |
| Grafana | Visualisation | Dashboards for all of the above |
| Loki | Log aggregation | All container logs, searchable |
| Tempo | Distributed tracing | Request flow across agents |
| Alertmanager | Alerting | Fires Slack/Discord/email on thresholds |

---

## ⚡ Step-by-Step

### Step 1 — Enable RLS on every table
```sql
-- Run this for EVERY table you create
alter table your_table enable row level security;

-- Users can only see their own data
create policy "users_own_data" on your_table
  for all to authenticated
  using (auth.uid() = user_id);
```

### Step 2 — Verify Prometheus is scraping
Open [http://localhost:9090](http://localhost:9090) → Status → Targets.
All targets should show `UP`. Any `DOWN` = investigate.

### Step 3 — Build your first Grafana dashboard
Open [http://localhost:3001](http://localhost:3001).
Create a dashboard with panels for:
- Container up/down status
- FastAPI request rate (req/s)
- Error rate (5xx responses)

### Step 4 — Set up an alert
In Grafana: Alerting → Alert Rules → New Rule.
Alert: "FastAPI error rate > 5% for 2 minutes" → send to Discord webhook.

### Step 5 — Security audit checklist
- [ ] No API keys in git history (`git log -p | grep API_KEY`)
- [ ] All tables have RLS enabled
- [ ] Service role key ONLY in agent `.env` files (never frontend)
- [ ] All Docker containers `cap_drop: ["ALL"]` + `no-new-privileges:true`

---

## 🌟 The Neurodivergent Edge

Grafana dashboards are **visual, colour-coded, and pattern-rich** — perfect for ADHD brains that scan for anomalies instinctively. You'll spot problems before alerts fire.

---

## ✨ Practical Task

Run the security audit checklist above on your current setup. Fix any findings. Screenshot your Grafana dashboard showing all containers healthy.

---

## 📊 XP Check

- [ ] RLS enabled on all Supabase tables
- [ ] Prometheus showing all targets UP
- [ ] Grafana dashboard built with at least 3 panels
- [ ] One alert rule configured
- [ ] Security audit checklist completed

**Complete all 5 → Claim your 80 XP + 35 BROski$ 🤑**
