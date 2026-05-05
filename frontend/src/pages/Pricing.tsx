import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HVZButton, HVZCard, HVZTag } from '../components/ui/hvz'
import { useAuthStore } from '../context/auth'
import { createCheckoutSession } from '../lib/payments'

type Accent = 'violet' | 'gold' | 'ghost'

type PricingTier = {
  name: string
  description: string
  priceMonthly: string
  priceKey: string
  features: string[]
  cta: string
  accent: Accent
  badge?: string
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    description: 'Try the platform, ship something real, no card needed.',
    priceMonthly: '£0',
    priceKey: '',
    features: [
      'Browse the full course catalog',
      'Free lesson previews',
      'Basic XP + progress tracking',
    ],
    cta: 'Get started',
    accent: 'ghost',
  },
  {
    name: 'Pro',
    description: 'Full access to all courses and BROski$ rewards.',
    priceMonthly: '£9',
    priceKey: 'pro_monthly',
    features: [
      'All courses included',
      'BROski$ token rewards',
      'Priority support',
      'Community channels',
      'Certificate on completion',
    ],
    cta: "Let's GO →",
    accent: 'violet',
    badge: '🔥 Most popular',
  },
  {
    name: 'Hyper',
    description: 'The full BROski experience — go elite.',
    priceMonthly: '£29',
    priceKey: 'hyper_monthly',
    features: [
      'Everything in Pro',
      'Agent sandbox access',
      'Monthly 1:1 code review',
      'Hyper bonus lessons',
      'Early access to new courses',
    ],
    cta: 'Go Hyper ♾️',
    accent: 'gold',
    badge: '♾️ Elite tier',
  },
]

export default function Pricing() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout(tier: PricingTier) {
    if (!user) {
      navigate('/login')
      return
    }
    setError(null)
    setLoadingTier(tier.name)
    try {
      const url = await createCheckoutSession(tier.priceKey, user.id)
      window.location.assign(url)
    } catch {
      setError("Hmm, let's try that again 🔄 — checkout failed. Ping support if it sticks.")
      setLoadingTier(null)
    }
  }

  return (
    <div className="bg-hfz-space-black min-h-screen py-20 sm:py-24 lg:py-28">
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <HVZTag color="violet">💸 Pricing</HVZTag>
          <h1
            className="font-display font-extrabold tracking-hfz-tight mt-4 text-hfz-text-primary"
            style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              background: 'none',
              WebkitTextFillColor: 'unset',
              textWrap: 'balance',
            }}
          >
            Start free.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-violet-lt), var(--color-neon-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Upgrade when you're hooked.
            </span>
          </h1>
          <p className="mt-5 text-hfz-body-lg text-hfz-text-secondary leading-[1.8] max-w-[55ch] mx-auto">
            Simple, transparent pricing. Month-to-month, cancel anytime — no annual lock-in.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 mb-8 text-center text-sm text-hfz-danger max-w-md mx-auto"
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-md lg:max-w-none mx-auto items-stretch">
          {PRICING_TIERS.map((tier) => {
            const isFree = tier.priceKey === ''
            const isLoading = loadingTier === tier.name
            const anyLoading = loadingTier !== null

            const accentClass = {
              violet: 'border-hfz-violet-light shadow-hfz-glow-violet lg:scale-[1.03]',
              gold: 'border-hfz-gold/60 shadow-hfz-glow-gold',
              ghost: '',
            }[tier.accent]

            return (
              <HVZCard
                key={tier.name}
                padding={32}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
                className={`${accentClass} transition-transform`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-6">
                    {tier.accent === 'gold' ? (
                      <HVZTag color="gold">{tier.badge}</HVZTag>
                    ) : (
                      <HVZTag color="violet">{tier.badge}</HVZTag>
                    )}
                  </div>
                )}

                <div>
                  <h2
                    className="font-display font-bold text-hfz-h3 leading-tight"
                    style={{
                      background: 'none',
                      WebkitTextFillColor: 'unset',
                      color:
                        tier.accent === 'gold'
                          ? 'var(--color-gold-light)'
                          : tier.accent === 'violet'
                          ? 'var(--color-violet-lt)'
                          : 'var(--color-text-primary)',
                    }}
                  >
                    {tier.name}
                  </h2>
                  <p className="mt-2 text-sm text-hfz-text-secondary leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-6 flex items-baseline gap-2">
                  <span
                    className="font-display font-extrabold tracking-hfz-tight text-hfz-text-primary"
                    style={{ fontSize: 48, lineHeight: 1 }}
                  >
                    {tier.priceMonthly}
                  </span>
                  <span className="text-sm font-semibold text-hfz-text-secondary">/ month</span>
                </div>

                <ul role="list" className="mt-7 flex-1 flex flex-col gap-3 list-none p-0 m-0">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] text-hfz-text-primary/90">
                      <Check
                        className={`h-5 w-5 flex-none mt-0.5 ${
                          tier.accent === 'gold'
                            ? 'text-hfz-gold-light'
                            : 'text-hfz-mint'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isFree ? (
                    <Link to={user ? '/courses' : '/register'} className="block no-underline">
                      <HVZButton variant="ghost" size="md" fullWidth>
                        {tier.cta}
                      </HVZButton>
                    </Link>
                  ) : (
                    <HVZButton
                      variant={tier.accent === 'gold' ? 'gold' : 'primary'}
                      size="md"
                      fullWidth
                      disabled={anyLoading}
                      onClick={() => handleCheckout(tier)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Wiring up the Z0ne...
                        </>
                      ) : (
                        tier.cta
                      )}
                    </HVZButton>
                  )}
                </div>
              </HVZCard>
            )
          })}
        </div>

        <p className="mt-12 text-center text-sm text-hfz-text-secondary">
          All plans pay out in <span className="text-hfz-gold-light font-semibold">🪙 BROski$</span> — even Free.
        </p>
      </div>
    </div>
  )
}
