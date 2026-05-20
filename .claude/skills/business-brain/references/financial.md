# 📊 Hyper-Vibe Financial Brain

> Cost model, break-even analysis, and revenue projections.
> Reference this for any financial decision or business plan section.

---

## 🏗️ Monthly Running Costs

> Quoted in GBP. **Note:** Supabase Pro and Vercel Pro are USD-denominated ($25 and $20). At ~£1 ≈ $1.25 these become ~£20 and ~£16 today — quoted as £25/£20 for headroom. Refresh quarterly.

| Service | Cost | Notes |
|---|---|---|
| Supabase Pro | £25/mo *(≈ $25 USD)* | DB, Auth, Edge Functions, Storage |
| Vercel Pro | £20/mo *(≈ $20 USD)* | Frontend hosting, CI/CD, Edge network |
| Stripe (UK domestic) | **1.5% + 20p per sale** | NOT the US 2.9% + 30p — see `pricing.md` |
| IBM Quantum API | £50–£200/mo | Only activates for Legend tier usage. Free tier covers light experimentation. |
| Discord bots / hosting | £10/mo | broski-bot, NemoClaw, Guardian — `profile: discord` stack |
| Domain + DNS | £5/mo | Platform identity (~£60/yr amortised) |
| **LLM API spend** | **£0–£100/mo** | Anthropic/OpenAI for BROski AI assistant features. Scales with active student usage — TBD until first paying cohort load is measured. |
| **Transactional email** | **£0–£15/mo** | Resend / Postmark — free tier covers ~3k emails/mo, paid plan above. Needed for the 6-step onboarding sequence in `marketing.md`. |
| **TOTAL FIXED (low)** | **~£110/mo** | Cold-start, no Legend traffic, free email tier |
| **TOTAL FIXED (high)** | **~£375/mo** | Heavy quantum + LLM + email load |
| **TOTAL ANNUAL** | **£1,800 – £4,500/yr** | Low to high operational load |

> Stripe is excluded from the fixed-cost row because it scales with revenue (a "good problem" — only paid when money comes in). Net revenue per sale is in `pricing.md`.

---

## ⚡ Break-Even (Monthly)

**At £110/mo fixed costs (cold-start scenario):**

| What you need | Gross | Net (UK Stripe) | Covers costs? |
|---|---|---|---|
| 2× Builder sales (£97 one-time) | £194 | **£190.70** | ✅ Yes — clears even high-cost months |
| 1× Architect sale (£167 one-time) | £167 | **£164.30** | ✅ Yes |
| 1× Legend sale (£247 one-time) | £247 | **£243.10** | ✅ Yes |
| 10× Builder monthly subs (£12/mo) | £120 | **£116.20** | ✅ Covers low-cost months |

**At £375/mo fixed costs (heavy load):**

| What you need | Gross | Net (UK Stripe) | Covers costs? |
|---|---|---|---|
| 4× Builder sales (£97) | £388 | **£381.40** | ✅ Yes |
| 2× Architect sales (£167) | £334 | **£328.60** | ⚠️ Tight |
| 27× Builder monthly subs (£12/mo) | £324 | **£313.74** | ⚠️ Just under — supplement with one-time |

**The subscription floor (plan-tier prices):**

| Active Monthly Subs | Blended Revenue (~£14 gross, ~£13.39 net) | vs Low-cost months | vs Heavy load |
|---|---|---|---|
| 10 | £140 / £133.90 net | ✅ Covers | ❌ Short |
| 25 | £350 / £334.75 net | ✅ ✅ Self-sustaining (low load) | ⚠️ Short under heavy load |
| 50 | £700 / £669.50 net | ✅ Costs + reinvestment | ✅ Yes |
| 100 | £1,400 / £1,339 net | ✅ Salary contribution possible | ✅ Yes |

> 💡 **The blended £14/mo assumes a 75/20/5 Builder/Architect/Legend mix.** If your real cohort skews differently, recalc using the figures in `pricing.md`.

**TARGET: 25 active monthly subscribers under low-cost load = platform pays for itself forever.**

> ⚠️ At heavy load (lots of Legend students hitting quantum + heavy LLM use) the threshold rises to ~35 subs OR steady one-time sales offsetting variable costs.

---

## 📈 3-Year Revenue Projections

### Blended average sale value: £85 (weighted toward Builder tier, plan prices)

> **Plan-vs-code note:** These projections use the **plan prices** (£29/£49/£97/£167/£247). If the 5-tier code migration ships, these stand. If the deployed 3-tier prices (£29/£79/£149) remain, the blended average drops to ~£72 — re-run before promising any number externally.

### Scenario A — Slow Burn

| Year | Sales | Avg Subs | Annual Revenue | Net (after low-cost £1,800/yr) |
|---|---|---|---|---|
| Year 1 | ~80 | ~20 | £10,800 | **~£9,000** |
| Year 2 | ~120 | ~40 | £17,520 | **~£15,720** |
| Year 3 | ~160 | ~65 | £23,640 | **~£21,840** |

### Scenario B — Steady Growth

| Year | Sales | Avg Subs | Annual Revenue | Net (after low-cost £1,800/yr) |
|---|---|---|---|---|
| Year 1 | ~200 | ~45 | £27,600 | **~£25,800** |
| Year 2 | ~350 | ~90 | £48,360 | **~£46,560** |
| Year 3 | ~500 | ~140 | £72,000 | **~£70,200** |

### Scenario C — Growth Mode

| Year | Sales | Avg Subs | Annual Revenue | Net (after mid-load £3,000/yr) |
|---|---|---|---|---|
| Year 1 | ~420 | ~100 | £56,400 | **~£53,400** |
| Year 2 | ~800 | ~220 | £118,560 | **~£115,560** |
| Year 3 | ~1,200 | ~380 | £196,800 | **~£193,800** |

> **Tax note:** these are gross net-of-cost figures, **not take-home**. UK sole trader: ~20% income tax above £12,570 personal allowance + Class 2/4 NI. UK VAT registration threshold £90,000 (as of 2024 — verify current threshold). Stripe Tax can handle cross-border digital VAT for ~0.5%.

> **Churn note:** monthly sub model assumes 15%/mo churn (industry standard for self-paced courses). Sustaining 25 subs at 15% churn = need ~4 new sub signups every month *just to stay flat* — factor that effort into the growth plan.

---

## 🛡️ Financial Rules for Claude

- Always check if a new feature adds to monthly costs before recommending it
- IBM Quantum costs must always be offset by Legend tier revenue (the £247 / £243.10 net covers ~1 month of quantum at the high end)
- LLM API costs are the most volatile variable — monitor monthly, build a per-student cost ceiling before scaling
- Never recommend a pricing change that breaks the monthly sub > one-time cost logic
- Subscription revenue = the safety net, not the primary model
- Reinvestment threshold: once monthly net revenue > £1,000 consistently, reinvest 20% into marketing or new modules
- Keep 1 month running costs (~£375 at heavy load) as emergency float at all times
- Always use UK Stripe rate (1.5% + 20p) — never quote US rate for UK sales
- Always cite the assumption when blending averages (the £85 sale / £14 sub averages assume specific mixes — see `pricing.md`)
- Always cross-reference plan-vs-deployed when projecting (see top of `pricing.md`)
