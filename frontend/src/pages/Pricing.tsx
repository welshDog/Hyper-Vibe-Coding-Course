import { Check } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../context/auth'
import { buildStripePaymentLinkUrl } from '../lib/payments'

type PricingTier = {
  name: string
  description: string
  priceMonthly: string
  features: string[]
  cta: string
  mostPopular?: boolean
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    description: 'Try the platform with limited previews.',
    priceMonthly: '$0',
    features: [
      'Browse course catalog',
      'Free lesson previews',
      'Basic progress tracking',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    description: 'Full access to all courses and premium features.',
    priceMonthly: '$29',
    features: [
      'All courses included',
      'Certificates',
      'Priority support',
      'Offline downloads',
      'Premium community channels',
    ],
    cta: 'Upgrade to Pro',
    mostPopular: true,
  },
]

export default function Pricing() {
  const { user } = useAuthStore()

  const stripePaymentLinkUrl = useMemo(() => {
    return buildStripePaymentLinkUrl({ prefilledEmail: user?.email })
  }, [user?.email])

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-primary">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Start free, upgrade when you’re ready
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
            Simple, transparent pricing. Cancel anytime.
          </p>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {PRICING_TIERS.map((tier) => {
            const isPro = tier.name === 'Pro'
            const ctaDisabled = isPro && !stripePaymentLinkUrl

            return (
              <div
                key={tier.name}
                className={[
                  'rounded-3xl p-8 ring-1 ring-gray-200',
                  tier.mostPopular ? 'bg-gray-50 ring-2 ring-primary' : 'bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-x-4">
                  <h2
                    className={[
                      'text-lg font-semibold leading-8',
                      tier.mostPopular ? 'text-primary' : 'text-gray-900',
                    ].join(' ')}
                  >
                    {tier.name}
                  </h2>
                  {tier.mostPopular ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most popular
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-sm leading-6 text-gray-600">{tier.description}</p>

                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.priceMonthly}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>

                {isPro ? (
                  <a href={stripePaymentLinkUrl ?? '#'} target="_blank" rel="noreferrer">
                    <Button className="mt-6 w-full" disabled={ctaDisabled}>
                      {tier.cta}
                    </Button>
                  </a>
                ) : (
                  <Link to="/register">
                    <Button variant="outline" className="mt-6 w-full">
                      {tier.cta}
                    </Button>
                  </Link>
                )}

                {ctaDisabled ? (
                  <p className="mt-3 text-xs text-gray-500">
                    Add VITE_STRIPE_PAYMENT_LINK_URL to enable checkout.
                  </p>
                ) : null}

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

