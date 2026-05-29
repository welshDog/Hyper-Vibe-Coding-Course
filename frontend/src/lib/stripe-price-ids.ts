export type TierId = 'starter' | 'pro' | 'builder' | 'architect' | 'hyper-legend'

export type PriceIdByBilling = {
  once: string
  monthly?: string
}

export const STRIPE_PRICE_IDS: Record<TierId, PriceIdByBilling> = {
  starter: { once: 'price_1TbUiz2LoEeIEPVE51tuHofX' },
  pro: { once: 'price_1TbUjB2LoEeIEPVEa3AEQywy' },
  builder: {
    once: 'price_1TbUjN2LoEeIEPVEEyy4FxrL',
    monthly: 'price_1TbUjT2LoEeIEPVECfWtHePf',
  },
  architect: {
    once: 'price_1TbUjf2LoEeIEPVEyHtcTurh',
    monthly: 'price_1TbUjl2LoEeIEPVEKKa17fza',
  },
  'hyper-legend': {
    once: 'price_1TbUjw2LoEeIEPVEIU4LKdZp',
    monthly: 'price_1TbUk22LoEeIEPVEB6hpSFZt',
  },
}
