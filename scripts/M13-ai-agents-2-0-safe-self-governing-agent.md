---
code: M13
title: Ship a Safe, Self-Governing Agent
emoji: 🛡️
level: Elite
slug: ai-agents-2-0-safe-self-governing-agent
xp_reward: 600
coin_reward: 600
summary: The capstone. Give your agent a referee (Safety Shepherd) and a flight recorder (Governance Ledger) so it can run a whole mission on its own — and you can still trust and audit every single move. This is Level 3+.
---

# 🛡️ MODULE 13 — Ship a Safe, Self-Governing Agent

> **🚀 AI Agents 2.0 — the finale.** M11 mapped the ladder. M12 climbed it. M13 is the top rung: an agent that runs free *and* stays accountable. Finish this and you've built a Level 3+ crew.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Wired a **policy referee** (Safety Shepherd) onto your agent's actions
- ✅ Watched it return **ALLOW / BLOCK / ESCALATE** on real moves
- ✅ Given your agent an **identity** so every action has an owner
- ✅ Read the **Governance Ledger** — the append-only record of what your crew did
- ✅ Shipped a true **Level 3+ self-governing agent** 🏁

**Time:** 30 minutes
**Vibe:** You stop babysitting the agent and start *governing* it. Run free, fully accountable. 🛡️

> 📺 **Final module of the AI Agents 2.0 trilogy — and the last module in the course.** Finish it and you've topped the ladder.

---

## 💡 Before We Start — Why "More Trust" Is the Wrong Answer

The instinct everyone has: *"To let an agent run on its own, I need to trust it more."*

**Wrong.** That's how agents go rogue.

> 🏎️ **Think Formula 1, not a trust fall.**
> An F1 car goes 200mph **because** of the barriers, the marshals, and the black-box recorder — not despite them.
> Take the safety systems away and nobody drives fast. They crawl.
>
> **Same with agents.** You unlock autonomy by adding a **referee** and a **recorder** — *then* you can let it run.

Level 3+ = **freedom to act + a gate on the dangerous moves + a record of everything.** Let's wire all three.

---

## 🧱 The Three Pieces of Self-Governance

| Piece | Job | HyperCode service |
|---|---|---|
| **The Referee** | Judges each action: `ALLOW` / `BLOCK` / `ESCALATE` | **Safety Shepherd** (`:8096`) |
| **The Identity** | Every action acts *as someone*, not anonymously | **Identity Agent** (`X-BROSKI-IDENTITY`) |
| **The Recorder** | Append-only log of who did what, and was it allowed | **Governance Ledger** (`/api/v1/governance/ledger`) |

> 🧠 **Plain English:** Referee decides, Identity signs, Recorder remembers. Wire those three and your agent can run a whole mission without you hovering.

---

## ⚡ Step 1 — Meet the Referee

> ⏱️ **Time: 5 minutes**

Safety Shepherd is a pure policy brain. Check it's awake:

```bash
docker-compose --profile safety up -d safety-shepherd
curl http://localhost:8096/health
```

```json
{ "service": "safety-shepherd", "mode": "monitor", "status": "ok" }
```

It runs in three **modes** — this is the dial that turns autonomy up:

| Mode | What it does | Use when |
|---|---|---|
| `off` | No checks. Agent runs unrefereed. | Never, for real missions |
| `monitor` | Judges + logs, but doesn't block | Learning what your agent does |
| `enforce` | Actually **blocks/escalates** risky moves | Production Level 3 |

> 🧠 **Plain English:** `monitor` is training wheels — it tells you what it *would* block. `enforce` is the real thing. You climb to L3 by turning this dial.

---

## ⚖️ Step 2 — Watch ALLOW / BLOCK / ESCALATE

> ⏱️ **Time: 7 minutes**

Ask the referee to judge a few actions. A safe read:

```bash
curl -X POST http://localhost:8096/check \
  -H "Content-Type: application/json" \
  -d '{"agent": "agent-x", "action": "read_file", "target": "README.md"}'
```

```json
{ "verdict": "ALLOW", "reason": "read-only, low risk" }
```

Now something dangerous:

```bash
curl -X POST http://localhost:8096/check \
  -H "Content-Type: application/json" \
  -d '{"agent": "agent-x", "action": "delete_database", "target": "production"}'
```

```json
{ "verdict": "BLOCK", "reason": "destructive action on protected target" }
```

And something that needs a human's nod:

```bash
curl -X POST http://localhost:8096/check \
  -H "Content-Type: application/json" \
  -d '{"agent": "agent-x", "action": "spend_tokens", "amount": 5000}'
```

```json
{ "verdict": "ESCALATE", "reason": "above auto-approve threshold", "routed_to": "approval_requests" }
```

> 🔥 **That's the magic of Agents 2.0.** The agent doesn't have to be perfect. It has a referee that catches the three bad moves — so it can run free on everything else. `ESCALATE` lands in your dashboard's approval queue, waiting for your one-click yes/no.

> 🧠 **Plain English:** ALLOW = go. BLOCK = never. ESCALATE = "ask the human." That's a Level 3 agent's whole conscience in three words.

---

## 🪪 Step 3 — Give Your Agent an Identity

> ⏱️ **Time: 6 minutes**

An anonymous agent is unaccountable. So every agent acts **as someone** — carrying an identity header on its requests.

```bash
# Who am I, agent?
curl http://localhost:8000/api/v1/identity/me \
  -H "X-BROSKI-IDENTITY: agent-x"
```

```json
{
  "identity": "agent-x",
  "permissions": ["read", "run_flow", "award_tokens"],
  "wallet_linked": true
}
```

> 🧠 **Plain English:** Now when `agent-x` does something, the system knows *which* agent, what it's *allowed* to do, and whose wallet it touches. No more anonymous robots. Every action has a name on it.

> 💬 **Why this matters for L3+:** an agent that can act on its own MUST be identifiable. "The AI did it" is not an answer. "agent-x did it, here's its permission set" is.

---

## 🏛️ Step 4 — Read the Flight Recorder

> ⏱️ **Time: 7 minutes**

Every governed action gets written to the **Governance Ledger** — append-only, tamper-evident, the truth of what your crew did.

```bash
# The full audit trail
curl http://localhost:8000/api/v1/governance/ledger
```

```json
{
  "entries": [
    {"ts": "2026-06-20T10:01Z", "identity": "agent-x", "action": "read_file",       "verdict": "ALLOW",    "target": "README.md"},
    {"ts": "2026-06-20T10:02Z", "identity": "agent-x", "action": "delete_database",  "verdict": "BLOCK",    "target": "production"},
    {"ts": "2026-06-20T10:03Z", "identity": "agent-x", "action": "spend_tokens",     "verdict": "ESCALATE", "amount": 5000}
  ]
}
```

> 🔥 **There it is — your self-governing crew, on the record.** Who acted, what they did, whether it was allowed. You can hand this to anyone — a teammate, an auditor, your future self — and prove exactly what your agents did and why it was safe.

> 🧠 **Plain English:** This is the difference between "trust me" and "check the log." Level 3+ agents earn autonomy by being *auditable*, not by being trusted blindly.

---

## 🏁 Step 5 — Turn the Dial to Level 3

> ⏱️ **Time: 5 minutes**

You've got all three pieces. Now let an agent run a full mission **on its own**, refereed:

```bash
# Flip the referee to enforce (real blocking)
# (set SAFETY_SHEPHERD_MODE=enforce in your .env, then restart core)
docker-compose up -d hypercode-core

# Run a mission that will hit a gate
curl -X POST http://localhost:8000/api/v1/flows/welcome-new-user/run \
  -H "X-BROSKI-IDENTITY: agent-x"
```

The mission runs end-to-end on its own. When it reaches a risky step, the referee **escalates** to your dashboard instead of just doing it — and the whole run lands in the ledger.

> 🎉 **That's a Level 3+ self-governing agent.** Runs the mission itself. Stops only at the gates. Signs every action with an identity. Records all of it. You're not babysitting — you're governing.

---

## 🏆 Your Win Moment

| What you wired | What it actually means |
|---|---|
| Safety Shepherd `enforce` | Your agent has a referee that catches the bad moves |
| ALLOW / BLOCK / ESCALATE | Autonomy with a conscience, in three words |
| `X-BROSKI-IDENTITY` | Every action has an owner — no anonymous robots |
| Governance Ledger | A flight recorder you can hand to anyone |

> 🔥 **You just shipped the thing the whole industry is scared to build.**
> Not "an AI we hope behaves" — a crew that runs free *and* can prove it stayed safe.
> That's AI Agents 2.0. And you built it on your own stack.

**Claim your reward: +600 BROski$ — "Agent Governor" badge unlocked 🛡️**

---

## 🛑 Something Went Wrong?

**Problem: `localhost:8096/check` refused**
```bash
docker-compose --profile safety up -d safety-shepherd
curl http://localhost:8096/health
```

**Problem: `/api/v1/governance/ledger` is empty**
> The ledger only fills once governed actions run. Send a few `/check` calls (Step 2) or run a flow with `enforce` on, then re-read it.

**Problem: `/identity/me` returns 401 / unknown identity**
```bash
# The identity header must match a registered agent identity
curl http://localhost:8000/api/v1/identity/me -H "X-BROSKI-IDENTITY: agent-x"
```

**Problem: enforce mode blocks everything**
> Good — that means it's working. Flip back to `monitor` while you tune your policy, then re-enable `enforce` for production.

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M13 governance".

---

## ✅ Module 13 Complete Checklist

- [ ] Safety Shepherd healthy on `:8096`
- [ ] I saw ALLOW, BLOCK, and ESCALATE verdicts
- [ ] My agent carries an identity (`X-BROSKI-IDENTITY`)
- [ ] I read the Governance Ledger and saw my actions logged
- [ ] I ran a mission in `enforce` mode — a real Level 3+ agent
- [ ] 🪙 **+600 BROski$ claimed — "Agent Governor" badge** 🛡️

---

## 🎓 You Finished the Course

That's it, BROski. M1 → M13. You went from "turn on your AI brain" to **governing a self-running agent crew**.

> 🏁 **You didn't just learn AI Agents 2.0. You shipped one.**
> Referee, identity, ledger — the same pattern the serious labs are still writing whitepapers about. You ran the curl commands.

**Go build something nobody's allowed to say is impossible. 🐶♾️🔥**

---

> 📝 *Author notes (AI Agents 2.0 track, M13 of 3 — course finale): F1-safety analogy = "autonomy through guardrails, not blind trust." Grounded entirely in shipped infra — Safety Shepherd modes + ALLOW/BLOCK/ESCALATE → approval_requests (P0-2), Identity Agent + X-BROSKI-IDENTITY + /api/v1/identity/me (P1-1), Governance Ledger + /api/v1/governance/ledger (P1-2). Capstone reward (+600, Agent Governor). Closes the course and the entire AGENT-START roadmap (P2-4 = last task).*
