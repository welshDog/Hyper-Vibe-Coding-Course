# 🚀 Hyper-Vibe Strategy Brain

> Roadmap, goals, growth plan, and decision-making framework.
> Reference this for any strategic decision — features, partnerships, pivots.

---

## 🎯 The North Star

**Mission:** "Stop apologising for your brain. Start building."

**3-Year Vision:** Become the #1 neurodivergent-first coding education platform in the UK — then globally.

**Year 1 Goal:** Self-sustaining platform. 25+ monthly subscribers. 200+ one-time sales.

**Year 2 Goal:** Profitable. £48k+ revenue. 350+ sales. Community of 500+ active students.

**Year 3 Goal:** Scale. £72k+ revenue. Employer partnerships. Corporate ND upskilling contracts.

---

## 📅 Current Status (refreshed 2026-05-20)

### ✅ Done
- Core platform built (Vite + React + Supabase + Stripe — *not* Next.js as previously listed)
- 5-tier pricing model **designed** (not yet shipped to code — see "In Progress")
- Module rewrites: M1, M4, M8, M9 complete; HV course DB restructured to May model + quizzes regenerated (May 17)
- BROski$ token economy live; BROskiPets system built
- Stripe Checkout + webhook wired (V2.4 + Supabase Edge — see `STRIPE_INTEGRATION_REPORT_2026-05-20.md`)
- **251 backend tests passing, 6 skipped** (May 19 V2.4 status board) — replaces the stale "72/72" figure that's still in the live Pricing.tsx marketing copy
- HyperLabs funnel LIVE end-to-end + a11y-certified (Lighthouse 100/100) — May 19
- HyperLabs hub home-escape link landed — May 20

### 🟡 In Progress
- **5-tier code migration** — `Pricing.tsx` still ships the 3-tier model (£29/£79/£149); plan calls for 5 tiers at higher anchor prices. THIS IS THE NEXT BUSINESS DECISION FOR LYNDZ. See R-Plan below.
- **Stripe Payment Links setup** — Pricing.tsx already reads `VITE_STRIPE_*_URL` Payment Link env vars in code; the 5 vars are not in `.env.example` (R2 in the Stripe integration report). Finish line = document them + verify on Vercel for every environment.
- M2+M2b merge decision
- Pricing page rewrite (5 tiers — pending price-migration go-decision)

### 🔜 Next Up
- M3, M5, M6, M7, M10 rewrites
- Module graduation ceremony UX
- Email onboarding sequence (needs transactional email provider — see `financial.md`)
- Founding Member launch campaign (see `marketing.md` for tone + discount cap)
- LEGENDS.md Hall of Fame on GitHub

---

## 🏆 Growth Levers (in priority order)

1. **Community first** — Discord is the moat. More value in community = lower churn
2. **Build in public** — Tweet/TikTok the build process. ND devs love authenticity
3. **Reddit organic** — r/ADHD + r/learnprogramming + r/neurodivergent = free reach
4. **Founding Member campaign** — First 100 students get 20% off + special badge (max 25% per `marketing.md` rules)
5. **Referral programme** — 200 BROski$ per successful referral
6. **Employer partnerships** — Year 2 play: pitch to ND-friendly employers as upskilling tool
7. **IBM Quantum co-marketing** — Legend tier is genuinely unique. IBM may want to co-promote

---

## 🧠 Strategic Decision Framework

Before any major decision, ask these 4 questions:

1. **Does it serve ND learners first?**
   If no → reconsider or redesign

2. **Does it pay for itself?**
   If no → find the revenue model before building

3. **Does it add to monthly costs?**
   If yes → quantify and offset in pricing (see `financial.md`)

4. **Can we build it lean first, then scale?**
   If no → it's too complex for now, park it

---

## 🤝 Partnership Opportunities

| Partner | Opportunity | Priority |
|---|---|---|
| IBM Quantum | Co-marketing Legend tier, QPU access | 🔴 High |
| ADHD UK / ADHD Foundation | Community partnership, credibility | 🟡 Medium |
| ND-friendly employers (GCHQ, BT, NHS Digital) | Corporate upskilling contracts | 🟢 Year 2 |
| Neurodivergent YouTubers/TikTokers | Affiliate / co-promotion | 🟡 Medium |
| Obsidian community | BROski-Obsidian-Brain crossover | 🟡 Medium |

---

## ⚠️ Risks to Watch

| ID | Risk | Mitigation |
|---|---|---|
| **R-Plan** | **Plan-vs-code price gap** — `business-brain` describes a 5-tier model (£29/£49/£97/£167/£247); live `Pricing.tsx` sells 3 tiers (£29/£79/£149). Every projection in `financial.md` assumes the plan prices. | Confirm with Lyndz: ship 5-tier code (raises prices) or rewrite plan to deployed reality. Don't run partner/sponsor maths on unverified prices. |
| **R1** | **Double-webhook risk** (from `STRIPE_INTEGRATION_REPORT_2026-05-20.md`) — V2.4 `/api/stripe/webhook` AND Supabase Edge `stripe-webhook` are both implemented. If Stripe Dashboard fans out to both, every paid sale grants 2× BROski$ (Supabase Edge has no idempotency guard). | 5-min Stripe Dashboard check: Developers → Webhooks. Disable the redundant endpoint. |
| **R2** | **5 missing Vercel env vars** for Pricing.tsx Payment Links (`VITE_STRIPE_*_URL`) — fresh deploy = Path B silently broken. **Status update 2026-05-20:** Pricing.tsx live with 5 tiers. 3 new Stripe Payment Links needed in Vercel env before Pro + Architect checkouts go live (`VITE_STRIPE_PRO_URL`, `VITE_STRIPE_ARCHITECT_URL`, `VITE_STRIPE_ARCHITECT_MONTHLY_URL` — all now in `.env.example`). | Add to `.env.example` ✅ done · create the 3 new Payment Links in Stripe Dashboard · set the URLs in Vercel for every env (preview + prod) · verify each tier CTA hits a real checkout. |
| Slow initial sales | Medium likelihood, low impact | Break-even at just 2 Builder sales — very low threshold |
| Founder burnout (ADHD real!) | Medium likelihood, high impact | Chunked tasks, celebrate wins, rest is productive |
| Competition enters ND space | Low likelihood, medium impact | First-mover + BROski$ economy = high switching cost |
| Platform costs spike (Supabase/Vercel tier increase) | Low likelihood, low impact | Costs modelled with headroom; can absorb one tier increase |
| LLM API cost spike (variable per student) | Medium likelihood, medium impact | Set per-student LLM budget; cache common responses; offload to local model where possible |
| Module quality drops | Low likelihood, high impact | Always follow the 7-step teaching philosophy in CLAUDE.md |

---

## 📋 Session End Checklist (Business Sessions)

- [ ] Update this file with any new decisions made
- [ ] Update `financial.md` if costs or prices changed
- [ ] Update `pricing.md` if tier psychology or rules changed
- [ ] Update `marketing.md` if tone, channel, or swipe-file copy changed
- [ ] Cross-check plan-vs-deployed gap is still surfaced
- [ ] Push all changes to GitHub
- [ ] Note next priority task here:

**Next session priority:** Lyndz decision on the 5-tier code migration (R-Plan). Once confirmed, ship Pricing.tsx + V2.4 `STRIPE_PRICE_PRO`/`STRIPE_PRICE_ARCHITECT` slots + Supabase webhook PRICE_TO_TIER refresh (or fix R4 — read from env not hardcode).

---

*Built by welshDog 🐶♾️ · Llanelli, Wales · refreshed by Claude during 2026-05-20 business-brain audit*
*"Stop apologising for your brain. Start building."*
