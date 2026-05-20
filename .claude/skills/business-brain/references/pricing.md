# 💰 Hyper-Vibe Pricing Brain

> Pricing psychology, tier logic, and rules for any pricing decision.
> Reference this before changing ANY price or tier.

---

## 🎯 Core Pricing Philosophy

1. **One-time = hero.** ND learners hate subscription guilt. "Own it forever" beats "pay monthly" every time.
2. **Monthly = accessibility option.** Not the default. There for cash-flow-constrained learners.
3. **Charm pricing always.** £97 not £100. £167 not £170. £247 not £250. Ends in 7 or 9.
4. **Anchor effect.** Builder (£97) feels cheap next to Architect (£167) and Legend (£247).
5. **Floor pricing.** Every price must cover a share of running costs. Never price below sustainability.

---

## ⚠️ Plan vs deployed — read this first

This document describes the **5-tier plan**. The current live `Pricing.tsx` sells a **3-tier model** at lower prices (£29 / £79 / £149). Until the migration ships:

| Tier | Plan (this doc) | Deployed code |
|---|---|---|
| 🌱 Starter | £29 · M1 only · 100 BROski$ | £29 · M1–M4 · 200 BROski$ |
| ⚡ Pro | £49 · M1–M4 · 300 BROski$ | ❌ does not exist |
| 🔥 Builder | £97 / £12mo · M1–M9 · 800 BROski$ | £79 / £9mo · M1–M11 · 800 BROski$ |
| 🏛️ Architect | £167 / £18mo · M1–M11 · 1500 BROski$ | ❌ does not exist |
| ⚛️ Hyper Legend | £247 / £25mo · M1–M13+Q · 2500 BROski$ | £149 / £15mo · M1–M13+Q · 2500 BROski$ |

**When projecting or quoting, ALWAYS clarify which side you're using.** Migration is tracked in `strategy.md` "Next session priority". Until it ships, customer-facing copy uses the deployed numbers.

---

## 💎 The Five Tiers (plan)

### 🌱 Starter — £29 (one-time only)
- **Psychology:** Impulse buy. Zero risk. Gets them through the door.
- **Goal:** Convert fence-sitters. Upsell to Pro or Builder after M1 win.
- **Includes:** M1 only, 100 BROski$, Discord access, completion badge
- **Does NOT include:** Projects, BROskiPet, full stack, certificate

### ⚡ Pro — £49 (one-time only)
- **Psychology:** "Getting serious" — still feels safe vs Builder
- **Goal:** Capture buyers who want more than Starter but aren't ready for £97
- **Includes:** M1–M4, 300 BROski$, quiz packs, practical tasks, certificate, Discord
- **Does NOT include:** BROskiPet, full stack, agent architecture

### 🔥 Builder — £97 one-time | £12/mo
- **Psychology:** THE HERO TIER. Sits dead centre. Biggest card. Glowing border.
- **Goal:** This is where 60–70% of buyers should land.
- **Includes:** M1–M9, 800 BROski$, BROskiPet, priority Discord, Elite 🔥 badge
- **Monthly nudge copy:** "Or pay £12/mo — but one-time saves you £47 over a year ✅"

### 🏛️ Architect — £167 one-time | £18/mo
- **Psychology:** Makes Builder look like a steal. Serious builders upgrade here.
- **Goal:** 20–25% of buyers. Premium feel without Legend price.
- **Includes:** M1–M11, 1,500 BROski$, BROskiPet custom evolution, Grafana lab, Script Generator, VIP Discord
- **Monthly nudge copy:** "Or pay £18/mo — one-time saves you £49 over a year ✅"

### ⚛️ Hyper Legend — £247 one-time | £25/mo
- **Psychology:** The DREAM tier. Gold shimmer. Aspirational. Some go straight here.
- **Goal:** 10–15% of buyers. Highest LTV customer.
- **Includes:** M1–M13 + Quantum, 2,500 BROski$, IBM Quantum QPU, Hall of Legends, Legend ♾️ status for life, direct welshDog Q&A, 1-year free updates
- **Monthly nudge copy:** "Or pay £25/mo — one-time saves you £53 over a year ✅"

---

## 🧮 Stripe Fee Impact (UK rate)

> Stripe Standard, **UK domestic card** = **1.5% + 20p**. (EEA cards: 2.5% + 20p. International: 3.25% + 20p. Stripe Tax: +~0.5% if enabled.) The US rate of 2.9% + 30p does NOT apply to UK sellers receiving UK card payments.

### One-time (plan prices)

| Sale | Stripe fee (1.5% + 20p) | Net received |
|---|---|---|
| £29  | £0.64 | **£28.37** |
| £49  | £0.94 | **£48.07** |
| £97  | £1.66 | **£95.35** |
| £167 | £2.71 | **£164.30** |
| £247 | £3.91 | **£243.10** |

### Monthly subs (plan prices)

| Sub | Stripe fee (1.5% + 20p) | Net per month |
|---|---|---|
| £12  | £0.38 | **£11.62** |
| £18  | £0.47 | **£17.53** |
| £25  | £0.58 | **£24.43** |

### Blended monthly subscriber average

A weighted mix of **~75% Builder / 20% Architect / 5% Legend** gives a **blended £13.85/mo gross**, ~**£13.39/mo net** after Stripe. We round this to £14 across financial projections. If your real cohort skews differently (e.g. more Legend = higher avg), refresh the projection accordingly.

---

## 🚫 Pricing Rules — Never Break These

- Never discount below £19 for any tier (devalues the brand)
- Never make monthly cheaper long-term than one-time
- Never remove the one-time option — it's core to ND trust
- Never add a 6th tier without reviewing the anchor effect
- Always show monthly cost savings vs one-time on the pricing page
- Launch discounts max 20% — and time-limited only (e.g. "Founding Member" week)
- Never quote Stripe fees as US rate (2.9% + 30p) for UK sales — net revenue is **better** than that
- Always cross-reference the plan-vs-deployed table at the top of this doc when quoting net per sale

---

## 🏷️ Competitor Benchmarks

| Competitor | Price | What you get |
|---|---|---|
| Makers Bootcamp UK | £8,500 | 16 weeks full-time |
| London Bootcamps avg | £4k–£13k | In-person, full-time |
| Udemy full course | £10–£200 | Videos only, no community |
| Codecademy Pro | £15/mo | Self-paced, no ND focus |
| **Hyper-Vibe Builder** *(plan)* | **£97** | **Full stack + community + BROski$ + AI Pets** |

**Positioning:** Premium self-paced. 10–100× cheaper than bootcamps. 10× more valuable than Udemy.

---

*Surface plan-vs-code drift on every pricing question. Don't silently pick a side.*
