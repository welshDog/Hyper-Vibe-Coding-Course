---
name: business-brain
description: >
  Pricing, financial modelling, marketing copy, growth strategy, and business decisions for the
  Hyper-Vibe Coding Course. Triggers when Lyndz asks about: price tiers, what to charge,
  break-even, running costs, infrastructure spend, profitability, BROski$ tokenomics pricing,
  monthly subscriptions vs one-time, three-year projections, the "going the lights" question
  (covering operational costs), Founding Member launch, course tier structure, target audience
  / "Alex" avatar, ND-first edtech positioning, competitor benchmarks (Udemy, bootcamps),
  marketing channels (Reddit, Discord, TikTok), tone of voice, email sequences, referral
  programme, employer partnerships, IBM Quantum co-marketing, the Financial Sustainability
  Report, business plan, sponsor pitches, or ANY business / commercial / pricing / marketing /
  strategy / cost decision on the Hyper-Vibe platform. ALWAYS read this skill before changing
  a price, writing customer-facing copy, or updating any business document.
---

# 🧠 Hyper-Vibe Business Brain

> The constitution for every business, pricing, financial, marketing, and strategy decision
> on the Hyper-Vibe Coding Course. Last updated: 2026-05-20 (audit pass).

---

## 👤 WHO WE ARE

- **Product:** Hyper-Vibe Coding Course — neurodivergent-first AI & full-stack coding education
- **Founder:** Lyndz (welshDog) — ADHD + Dyslexia + Autistic, Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧
- **Mission:** *"Stop apologising for your brain. Start building."*
- **Tagline:** Built by an ND dev, for ND devs.
- **Platform:** hyper-vibe-coding-course.vercel.app
- **GitHub:** github.com/welshDog/Hyper-Vibe-Coding-Course

---

## 🎯 TARGET AUDIENCE (full avatar in `references/marketing.md`)

- **Primary:** ADHD / dyslexic / autistic adults 18–45, frustrated with traditional bootcamps and Udemy. UK-leaning but global.
- **Secondary:** Neurotypical learners who prefer the ND-friendly style.
- **Tertiary:** Employers / orgs upskilling ND staff.

---

## 🏗️ WHAT WE SELL

### The five-tier plan (target — full psychology in `references/pricing.md`)

| Tier | Price | Monthly | Modules |
|---|---|---|---|
| 🌱 Starter | £29 one-time | — | M1 only |
| ⚡ Pro | £49 one-time | — | M1–M4 |
| 🔥 Builder *(hero)* | £97 one-time | £12/mo | M1–M9 |
| 🏛️ Architect | £167 one-time | £18/mo | M1–M11 |
| ⚛️ Hyper Legend | £247 one-time | £25/mo | M1–M13 + Quantum |

> ⚠️ **Plan ≠ deployed code.** The live `Pricing.tsx` currently sells a 3-tier model
> (£29/£79/£149) with different module mappings. Migrating the code to the 5-tier plan is
> tracked in `references/strategy.md` "Next session priority". **Surface this gap to Lyndz
> before any pricing / projection work and confirm whether to model the plan or the live
> reality.** Don't silently pick a side.

### Key product features

- BROski$ token economy (gamified rewards) · BROskiPets (AI companions, evolve with student)
- IBM Quantum module (Legend tier) · Hall of Legends on GitHub (Legend tier)
- Discord community + BROski AI support · Completion certificates · Real projects

---

## 💰 BUSINESS MODEL — one-liner

- **Primary revenue:** One-time course purchases (immediate cash flow, no payback wait)
- **Secondary revenue:** Monthly subscriptions (recurring floor, compounds over time)
- **Target:** 25 active monthly subscribers = platform pays for itself regardless of new sales
- **Stripe fees:** UK domestic Standard tier = **1.5% + 20p per sale** (NOT the US rate of 2.9% + 30p — full breakdown in `references/pricing.md`)
- **Monthly sub billing (plan):** Builder £12 · Architect £18 · Legend £25

> Full cost model, break-even, and 3-year projections in `references/financial.md`.

---

## 🏆 UNIQUE SELLING PROPOSITION

1. **Only** ND-first AI coding course in the UK at this price point
2. Gamified BROski$ economy creates stickiness no other course has
3. Living platform — constantly updated, students get new content
4. Real community — not just videos, actual Discord crew
5. Quantum module — no other self-paced course at this price includes IBM QPU access
6. Built by someone who IS the target audience — authentic, not performative

---

## ⚙️ TECH STACK (for context)

- **Frontend:** **Vite** + React + TypeScript on Vercel  *(NOT Next.js — common mistake)*
- **Backend (course):** Supabase — Postgres, Auth, Edge Functions, Storage
- **Backend (compute):** HyperCode V2.4 — FastAPI on Docker (48+ containers)
- **Payments:** Stripe Payment Links + V2.4 `/api/stripe/checkout` + Supabase webhook
- **Community:** Discord (broski-bot, profile: discord)
- **Repo:** `H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course` — public on GitHub

---

## 📋 BUSINESS RULES FOR CLAUDE — never debate, never break

1. **One-time pricing is the HERO** — never push subscriptions over ownership. ND learners hate subscription guilt.
2. **Always think "does this scale without adding cost?"** before recommending a feature.
3. **Always think "does this serve ND learners first?"** before recommending UX or copy changes.
4. **Charm pricing always** — prices end in 7 or 9 (£29, £49, £97, £167, £247).
5. **Never make monthly cheaper long-term than one-time** — 12× monthly must exceed the one-time price.
6. **Never recommend removing the one-time option** — it's core to ND trust.
7. **Tone:** casual, mate-style ("hey Bro", "let's crack on", "nice one"), celebrate wins, validate the struggle.
8. **Pricing decisions** → `references/pricing.md` (psychology + rules)
9. **Financial decisions** → `references/financial.md` (cost model + projections)
10. **Marketing copy** → `references/marketing.md` (tone + channels + swipe file)
11. **Strategic decisions** → `references/strategy.md` (roadmap + decision framework + risks)
12. **Plan-vs-code drift is sacred to surface** — if business-brain says one thing and live code says another, name it. Never silently pick a side.

---

## 🧠 Strategic Decision Framework (use for every major call)

Before any feature, pricing change, partnership, or pivot — answer these 4:

1. **Does it serve ND learners first?**  *(if no → reconsider or redesign)*
2. **Does it pay for itself?**  *(if no → find the revenue model before building)*
3. **Does it add to monthly costs?**  *(if yes → quantify and offset in pricing)*
4. **Can we build it lean first, then scale?**  *(if no → too complex for now, park it)*

Full version with examples in `references/strategy.md`.

---

## 🔗 Reference files (read these for depth)

| File | When to read |
|---|---|
| `references/pricing.md` | Before any price change, tier addition, or discount. Stripe fee impact, anchor effect, monthly-vs-one-time copy. |
| `references/financial.md` | Before any cost commitment, projection update, or break-even check. Includes the missing-cost-lines audit. |
| `references/marketing.md` | Before any customer-facing copy, channel pick, launch campaign, or email sequence. |
| `references/strategy.md` | Before any roadmap decision, partnership, risk-register update, or status communication. |

---

## ✅ Output format (when invoked for a business task)

```
## 🧭 Context check
[1–3 lines: which references this touches, any plan-vs-code drift to surface]

## 💡 Recommendation
[The actual answer. Short. With the why.]

## 🔢 Numbers (if applicable)
[Tables. Real maths. Cite the assumption.]

## 🚦 Next action
[What Lyndz does now. One line.]
```

No walls of text. Always celebrate the win when the numbers land. 🤙

---

*Built by welshDog 🐶♾️ · Llanelli, Wales · "Stop apologising for your brain. Start building."*
