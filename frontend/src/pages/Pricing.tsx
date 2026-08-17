import { useMemo, useState } from 'react'
import { useAuthStore } from '../context/auth'
import { createCheckoutSession } from '../lib/payments'
import { STRIPE_PRICE_IDS, type TierId } from '../lib/stripe-price-ids'

/** Shorthand so each tier's price fields read from the single source of
 *  truth in stripe-price-ids.ts instead of a second hardcoded copy. */
const priceOf = (id: TierId) => STRIPE_PRICE_IDS[id]

// ─────────────────────────────────────────────────────────────────────────────
// Stripe Payment Link URLs — set in Vercel env vars per environment (R2 in
// STRIPE_INTEGRATION_REPORT_2026-05-20). If any is missing at runtime, the CTA
// surfaces an error toast — NEVER a silent '#' fallback that locks the buyer
// out of checkout invisibly.
// ─────────────────────────────────────────────────────────────────────────────
const STRIPE_LINKS: Record<string, string | undefined> = {
  starter: import.meta.env.VITE_STRIPE_STARTER_URL,
  pro: import.meta.env.VITE_STRIPE_PRO_URL,
  builder: import.meta.env.VITE_STRIPE_BUILDER_URL,
  builderMonthly: import.meta.env.VITE_STRIPE_BUILDER_MONTHLY_URL,
  architect: import.meta.env.VITE_STRIPE_ARCHITECT_URL,
  architectMonthly: import.meta.env.VITE_STRIPE_ARCHITECT_MONTHLY_URL,
  hyperLegend: import.meta.env.VITE_STRIPE_HYPER_LEGEND_URL,
  hyperLegendMonthly: import.meta.env.VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL,
}

type BillingMode = 'once' | 'monthly'

interface Tier {
  id: string
  emoji: string
  name: string
  tagline: string
  priceOnce: number
  priceMonthly: number | null
  /** 12 × monthly − one-time. Drives the "save £X over a year" nudge. */
  yearlySaving: number | null
  broskiTokens: number
  modules: string
  /** Builder is the hero — larger card, purple ring + glow. */
  hero: boolean
  /** Top banner ribbon copy (null = no banner). */
  badge: string | null
  /** Banner + CTA gradient. Legend's yellow→orange is the documented
   *  brand-guard exception; every other tier uses purple/blue/indigo/green. */
  gradient: string
  /** Card ring colour — purple for hero, subtle gray-700 for others. */
  ring: string
  /** Card outer glow on the hero only. */
  glow: string
  /** Tailwind text colour for CTA label (black on yellow for AA contrast). */
  ctaText: string
  features: string[]
  /** Optional "what you don't get" — keeps tier shape visible at a glance. */
  notIncluded: string[]
  oneTimeKey: keyof typeof STRIPE_LINKS
  monthlyKey: keyof typeof STRIPE_LINKS | null
}

const TIERS: Tier[] = [
  {
    id: 'starter',
    emoji: '🌱',
    name: 'Starter',
    tagline: 'Through the door. Zero risk.',
    priceOnce: priceOf('starter').amountOnce,
    priceMonthly: null,
    yearlySaving: null,
    broskiTokens: 100,
    modules: 'M1',
    hero: false,
    badge: null,
    gradient: 'from-green-500 to-emerald-600',
    ring: 'ring-green-500/30',
    glow: '',
    ctaText: 'text-white',
    features: [
      'Module 1: Designing Your Focus Zone',
      '100 BROski$ on signup',
      'Discord community access',
      'Completion badge',
    ],
    notIncluded: [
      'BROskiPets & AI memory',
    ],
    oneTimeKey: 'starter',
    monthlyKey: null,
  },
  {
    id: 'pro',
    emoji: '⚡',
    name: 'Pro',
    tagline: 'Getting serious. Still safe.',
    priceOnce: priceOf('pro').amountOnce,
    priceMonthly: null,
    yearlySaving: null,
    broskiTokens: 300,
    modules: 'M1 – M4',
    hero: false,
    badge: null,
    gradient: 'from-blue-500 to-cyan-600',
    ring: 'ring-blue-500/30',
    glow: '',
    ctaText: 'text-white',
    features: [
      'Everything in Starter',
      'M2: Your First Vibe (Docker)',
      'M3: Prompt Like a Pro',
      'M4: Build Your First App',
      '300 BROski$ on signup',
      'Quiz packs + practical tasks',
      'Completion certificate',
    ],
    notIncluded: [
      'BROskiPets',
    ],
    oneTimeKey: 'pro',
    monthlyKey: null,
  },
  {
    id: 'builder',
    emoji: '🔥',
    name: 'Builder',
    tagline: 'The full Vibe Coding journey.',
    priceOnce: priceOf('builder').amountOnce,
    priceMonthly: priceOf('builder').amountMonthly!,
    yearlySaving: priceOf('builder').amountMonthly! * 12 - priceOf('builder').amountOnce,
    broskiTokens: 800,
    modules: 'M1 – M9',
    hero: true,
    badge: '🏆 Most Popular',
    gradient: 'from-purple-500 to-violet-600',
    ring: 'ring-purple-500',
    glow: 'shadow-2xl shadow-purple-500/40',
    ctaText: 'text-white',
    features: [
      'Everything in Pro',
      'M5: Full Stack Vibe (Supabase)',
      'M6: HyperCode The Hyper Way',
      'M7: Agent Architecture & Manifests',
      'M8: Soulful Entities (AI Pets)',
      'M9: Web3 & On-Chain Evolution',
      '800 BROski$ on signup',
      'Your BROskiPet evolves with you',
      'Priority Discord support',
      'BROski Elite 🔥 badge',
    ],
    notIncluded: [
      'Architect lab + Script Generator',
    ],
    oneTimeKey: 'builder',
    monthlyKey: 'builderMonthly',
  },
  {
    id: 'architect',
    emoji: '🏛️',
    name: 'Architect',
    tagline: 'Builders who ship at scale.',
    priceOnce: priceOf('architect').amountOnce,
    priceMonthly: priceOf('architect').amountMonthly!,
    yearlySaving: priceOf('architect').amountMonthly! * 12 - priceOf('architect').amountOnce,
    broskiTokens: 1500,
    modules: 'M1 – M11',
    hero: false,
    badge: null,
    gradient: 'from-indigo-500 to-purple-600',
    ring: 'ring-indigo-500/40',
    glow: '',
    ctaText: 'text-white',
    features: [
      'Everything in Builder',
      'M10: Security & SRE Observability',
      'M11: Ship, Scale & Graduate',
      '1,500 BROski$ on signup',
      'BROskiPet custom evolution',
      'Grafana monitoring lab',
      'Script Generator (Hyper Studio)',
      'VIP Discord channel',
    ],
    notIncluded: [],
    oneTimeKey: 'architect',
    monthlyKey: 'architectMonthly',
  },
  {
    id: 'hyper-legend',
    emoji: '🐶',
    name: 'Hyper Legend',
    tagline: 'The full empire. Top of the ladder.',
    priceOnce: priceOf('hyper-legend').amountOnce,
    priceMonthly: priceOf('hyper-legend').amountMonthly!,
    yearlySaving: priceOf('hyper-legend').amountMonthly! * 12 - priceOf('hyper-legend').amountOnce,
    broskiTokens: 2500,
    modules: 'M1 – M20',
    hero: false,
    // brand-guard: yellow→orange is the documented Legend exception.
    badge: '♾️ Legend Status',
    gradient: 'from-yellow-400 to-orange-500',
    ring: 'ring-yellow-400/50',
    glow: '',
    // Yellow background → black text needed for AA contrast.
    ctaText: 'text-black',
    features: [
      'Everything in Architect',
      'M12: The Ride or Die Contribution',
      'Bonus: M13 – M20 Builder OS + Vibe Coding Craft tracks',
      '2,500 BROski$ on signup',
      'Hall of Legends on GitHub',
      'Direct welshDog Q&A',
      'Legend ♾️ status for life',
      '1-year free updates',
    ],
    notIncluded: [],
    oneTimeKey: 'hyperLegend',
    monthlyKey: 'hyperLegendMonthly',
  },
]

/** Resolve the right Stripe Payment Link for a tier + current billing toggle.
 *  Returns `undefined` if the env var isn't configured — callers MUST treat
 *  that as an error (toast), not a silent dead link. */
function resolveCheckoutUrl(tier: Tier, billing: BillingMode): string | undefined {
  if (billing === 'monthly' && tier.monthlyKey) {
    return STRIPE_LINKS[tier.monthlyKey]
  }
  return STRIPE_LINKS[tier.oneTimeKey]
}

/** Resolve the Stripe Price ID for Checkout Session fallback. */
function resolveStripePriceId(tier: Tier): string | undefined {
  const tierKey = tier.id as keyof typeof STRIPE_PRICE_IDS
  const prices = STRIPE_PRICE_IDS[tierKey]
  if (!prices) return undefined
  return prices.once
}

export default function Pricing() {
  const [billing, setBilling] = useState<BillingMode>('once')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)

  const monthlyOnlyTiersHidden = useMemo(
    () => TIERS.filter((t) => t.monthlyKey !== null).length,
    [],
  )

  const handleCheckout = async (tier: Tier) => {
    // Starter / Pro have no monthly key — fall back to their one-time link
    // even if the global toggle is on "monthly".
    let effectiveBilling: BillingMode =
      billing === 'monthly' && tier.monthlyKey ? 'monthly' : 'once'
    let url = resolveCheckoutUrl(tier, effectiveBilling)

    if (!url && effectiveBilling === 'monthly') {
      effectiveBilling = 'once'
      url = resolveCheckoutUrl(tier, effectiveBilling)
    }

    if (url) {
      setCheckoutError(null)
      window.location.assign(url)
      return
    }

    // Payment Link not configured → fall back to API-created Checkout Session.
    // Security: only redirect to /payment-success via Stripe-hosted flow.
    if (!user?.id) {
      setCheckoutError('Log in to checkout — your purchase needs to link to your account.')
      return
    }

    const stripePriceId = resolveStripePriceId(tier)
    if (!stripePriceId) {
      setCheckoutError(
        `Checkout for ${tier.name} (${effectiveBilling === 'monthly' ? 'monthly' : 'one-time'}) isn't configured yet. Ping the team on Discord and we'll sort your access.`,
      )
      return
    }

    try {
      setCheckoutError(null)
      const checkoutUrl = await createCheckoutSession(stripePriceId, user.id)
      window.location.assign(checkoutUrl)
    } catch {
      setCheckoutError("Hmm, let's try that again 🔄 — checkout failed. Ping support if it sticks.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <header className="text-center pt-16 pb-8 px-4">
        <div className="text-5xl mb-4" aria-hidden="true">🐶♾️</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">Pick Your Vibe Level</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Built for <span className="text-purple-400 font-bold">ADHD, dyslexic &amp; autistic minds</span>.
          No gatekeeping. No syntax walls. Just you, AI, and an empire you built.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/40 rounded-full px-4 py-2 text-sm text-emerald-300">
          ✅ Platform LIVE · BROski$ economy active
        </div>
        <p className="mt-4 text-gray-500 text-sm max-w-xl mx-auto">
          Every module is free to read the moment you make an account — these
          tiers are about BROski$ tokens, Discord support, certificates and
          status, not paywalled content.
        </p>
      </header>

      {/* Billing toggle */}
      <div className="px-4 mb-10 flex flex-col items-center gap-2">
        <div
          role="tablist"
          aria-label="Billing frequency"
          className="inline-flex p-1 rounded-full bg-gray-900 border border-gray-800"
        >
          <button
            role="tab"
            aria-selected={billing === 'once'}
            onClick={() => setBilling('once')}
            className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
              billing === 'once'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            One-time
          </button>
          <button
            role="tab"
            aria-selected={billing === 'monthly'}
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 text-sm font-bold rounded-full transition-all duration-200 ${
              billing === 'monthly'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {billing === 'once'
            ? 'Own it forever. ND-friendly — no subscription guilt.'
            : `Available on ${monthlyOnlyTiersHidden} tiers. One-time saves more long-term.`}
        </p>
      </div>

      {/* Error toast */}
      {checkoutError && (
        <div className="max-w-2xl mx-auto px-4 mb-6">
          <div
            role="alert"
            className="rounded-xl bg-amber-900/30 border border-amber-500/40 px-5 py-4 text-amber-200 text-sm text-center"
          >
            ⚠️ {checkoutError}
          </div>
        </div>
      )}

      {/* Tier Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
        {TIERS.map((tier) => {
          const showMonthly = billing === 'monthly' && tier.priceMonthly !== null
          const displayPrice = showMonthly ? tier.priceMonthly! : tier.priceOnce
          const displaySuffix = showMonthly ? '/mo' : ''
          const oneTimeOnly = tier.priceMonthly === null
          return (
            <article
              key={tier.id}
              className={`relative flex flex-col rounded-2xl bg-gray-900/80 backdrop-blur-sm overflow-hidden ring-1 ${tier.ring} ${
                tier.hero
                  ? `lg:scale-105 lg:-my-2 ring-2 ${tier.glow} z-10`
                  : 'shadow-lg shadow-black/40'
              }`}
            >
              {tier.badge && (
                <div
                  className={`bg-gradient-to-r ${tier.gradient} ${
                    tier.id === 'hyper-legend' ? 'text-black' : 'text-white'
                  } text-xs font-black text-center py-2 tracking-wider`}
                >
                  {tier.badge}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-5">
                  <div className="text-4xl mb-2" aria-hidden="true">{tier.emoji}</div>
                  <h2 className="text-2xl font-black">{tier.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">{tier.tagline}</p>
                  <div className="text-xs text-gray-500 mt-1">Suggested path: {tier.modules}</div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">£{displayPrice}</span>
                    <span className="text-gray-500 text-sm">
                      {showMonthly ? displaySuffix : 'one-time'}
                    </span>
                  </div>
                  {billing === 'monthly' && oneTimeOnly && (
                    <p className="mt-1 text-xs text-gray-500">One-time only</p>
                  )}
                  {!showMonthly && tier.yearlySaving !== null && tier.priceMonthly !== null && (
                    <p className="mt-1 text-xs text-emerald-400">
                      Save £{tier.yearlySaving}/year vs £{tier.priceMonthly}/mo ✅
                    </p>
                  )}
                  {showMonthly && tier.yearlySaving !== null && (
                    <p className="mt-1 text-xs text-amber-300">
                      One-time saves you £{tier.yearlySaving} over a year ✨
                    </p>
                  )}
                  {/* BROski$ pill */}
                  <div className="mt-3 inline-flex items-center gap-1 bg-yellow-900/30 border border-yellow-500/40 rounded-full px-3 py-1 text-xs font-bold text-yellow-300">
                    💰 {tier.broskiTokens.toLocaleString()} BROski$
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => void handleCheckout(tier)}
                  className={`w-full py-3 px-6 rounded-xl font-black text-lg mb-6 transition-all duration-200 bg-gradient-to-r ${tier.gradient} ${tier.ctaText} shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/40`}
                >
                  Get {tier.name} {tier.emoji}
                </button>

                {/* Features */}
                <ul className="space-y-2 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((f) => (
                    <li key={`not-${f}`} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 flex-shrink-0" aria-hidden="true">✗</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          )
        })}
      </div>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-300">Common Questions</h3>
        <div className="space-y-4 text-left">
          {[
            ['Do I need coding experience?', 'Zero. Module 1 starts with setting up your brain — not your IDE. If you can type, you can Vibe Code.'],
            ['Can I upgrade later?', 'Yes! Just pay the difference. Ping us on Discord and we\'ll sort it.'],
            ['What if I get stuck?', 'Every module has a ✨ Practical Task and BROski AI is in your corner 24/7. Plus Discord crew.'],
            ['Is this ND-friendly?', 'Built by an ND dev, for ND devs. Short sentences, chunked tasks, emojis, BROski$ rewards. Always.'],
            ['One-time vs monthly?', 'One-time = own it forever, no recurring guilt. Monthly is for cash-flow-constrained learners — but 12 months of monthly always costs more.'],
          ].map(([q, a]) => (
            <div key={q} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="font-bold text-white mb-1">{q}</p>
              <p className="text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-gray-600 text-xs">
          Payments powered by Stripe 🔒 · All prices include VAT · Built by welshDog 🐶♾️ Llanelli, Wales
        </p>
      </section>
    </div>
  )
}
