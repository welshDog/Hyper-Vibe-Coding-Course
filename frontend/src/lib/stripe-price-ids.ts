export type TierId = 'starter' | 'pro' | 'builder' | 'architect' | 'hyper-legend'

export type PriceIdByBilling = {
  once: string
  monthly?: string
}

/** Single frontend source of truth for tier pricing — Pricing.tsx reads
 *  amountOnce/amountMonthly from here instead of hardcoding a second copy.
 *  Must stay in sync with the webhook's PRICE_TO_TIER
 *  (supabase/functions/stripe-webhook/index.ts) and stripe/products.config.ts
 *  — see scripts/check-pricing-drift.ts. */
export type TierPricing = PriceIdByBilling & {
  /** £, whole pounds, one-time price. */
  amountOnce: number
  /** £/month, whole pounds. Absent for tiers with no monthly option. */
  amountMonthly?: number
}

export const STRIPE_PRICE_IDS: Record<TierId, TierPricing> = {
  starter: { once: 'price_1TbUiz2LoEeIEPVE51tuHofX', amountOnce: 29 },
  pro: { once: 'price_1TbUjB2LoEeIEPVEa3AEQywy', amountOnce: 49 },
  builder: {
    once: 'price_1TbUjN2LoEeIEPVEEyy4FxrL',
    monthly: 'price_1TbUjT2LoEeIEPVECfWtHePf',
    amountOnce: 97,
    amountMonthly: 12,
  },
  architect: {
    once: 'price_1TbUjf2LoEeIEPVEyHtcTurh',
    monthly: 'price_1TbUjl2LoEeIEPVEKKa17fza',
    amountOnce: 167,
    amountMonthly: 18,
  },
  'hyper-legend': {
    once: 'price_1TbUjw2LoEeIEPVEIU4LKdZp',
    monthly: 'price_1TbUk22LoEeIEPVEB6hpSFZt',
    amountOnce: 247,
    amountMonthly: 25,
  },
}
