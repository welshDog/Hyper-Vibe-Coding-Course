// =============================================================
// 🔥 HYPER VIBE CODING COURSE — STRIPE PRODUCTS & PRICES CONFIG
// Updated by BROski AI — May 27, 2026
// Option A: Starter / Pro / Builder / Architect / Hyper Legend
// All prices in GBP (pence). Divide by 100 for £ value.
// =============================================================

export const STRIPE_PRODUCTS = {
  starter: {
    productId: 'prod_Uag5dQGGbvG6LD',
    name: '🌱 Starter — Hyper Vibe Coding Course',
    description: 'Module 1: Designing Your Focus Zone. 100 BROski$ on signup. Discord access. Completion badge. Neurodivergent-first.',
    prices: {
      oneTime: {
        priceId: 'price_1TbUiz2LoEeIEPVE51tuHofX',
        amount: 2900, // £29.00
        currency: 'gbp',
        type: 'one_time',
      },
    },
    broskiTokensAwarded: 100,
    modulesUnlocked: [1],
    tier: 'starter',
  },

  pro: {
    productId: 'prod_Uag5ZysD9y4Mol',
    name: '⚡ Pro — Hyper Vibe Coding Course',
    description: 'Modules 1–4. 300 BROski$ on signup. Quiz packs, practical tasks, completion certificate. Neurodivergent-first.',
    prices: {
      oneTime: {
        priceId: 'price_1TbUjB2LoEeIEPVEa3AEQywy',
        amount: 4900, // £49.00
        currency: 'gbp',
        type: 'one_time',
      },
    },
    broskiTokensAwarded: 300,
    modulesUnlocked: [1, 2, 3, 4],
    tier: 'pro',
  },

  builder: {
    productId: 'prod_Uag51l5DjYVGSU',
    name: '🔥 Builder — Hyper Vibe Coding Course',
    description: 'Modules 1–9. 800 BROski$ on signup. BROskiPet evolves with you. Priority Discord. BROski Elite badge.',
    prices: {
      oneTime: {
        priceId: 'price_1TbUjN2LoEeIEPVEEyy4FxrL',
        amount: 9700, // £97.00
        currency: 'gbp',
        type: 'one_time',
      },
      monthly: {
        priceId: 'price_1TbUjT2LoEeIEPVECfWtHePf',
        amount: 1200, // £12.00/month
        currency: 'gbp',
        type: 'recurring',
        interval: 'month',
      },
    },
    broskiTokensAwarded: 800,
    modulesUnlocked: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    tier: 'builder',
  },

  architect: {
    productId: 'prod_Uag5QO1IWjMSUi',
    name: '🏛️ Architect — Hyper Vibe Coding Course',
    description: 'Modules 1–11. 1500 BROski$ on signup. Grafana lab, Script Generator, VIP Discord, BROskiPet custom evolution.',
    prices: {
      oneTime: {
        priceId: 'price_1TbUjf2LoEeIEPVEyHtcTurh',
        amount: 16700, // £167.00
        currency: 'gbp',
        type: 'one_time',
      },
      monthly: {
        priceId: 'price_1TbUjl2LoEeIEPVEKKa17fza',
        amount: 1800, // £18.00/month
        currency: 'gbp',
        type: 'recurring',
        interval: 'month',
      },
    },
    broskiTokensAwarded: 1500,
    modulesUnlocked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    tier: 'architect',
  },

  hyperLegend: {
    productId: 'prod_Uag64hL17kjDwY',
    name: '⚛️ Hyper Legend — Hyper Vibe Coding Course',
    description: 'Modules 1–13 + Quantum. 2500 BROski$ on signup. IBM Quantum access. Hall of Legends. Legend status for life.',
    prices: {
      oneTime: {
        priceId: 'price_1TbUjw2LoEeIEPVEIU4LKdZp',
        amount: 24700, // £247.00
        currency: 'gbp',
        type: 'one_time',
      },
      monthly: {
        priceId: 'price_1TbUk22LoEeIEPVEB6hpSFZt',
        amount: 2500, // £25.00/month
        currency: 'gbp',
        type: 'recurring',
        interval: 'month',
      },
    },
    broskiTokensAwarded: 2500,
    modulesUnlocked: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    tier: 'hyper_legend',
  },
} as const;

// Price ID → tier lookup (used by the Supabase webhook)
export const PRICE_TO_TIER: Record<string, { tier: string; tokens: number; modules: number[] }> = {
  // 🌱 Starter
  'price_1TbUiz2LoEeIEPVE51tuHofX': { tier: 'starter',      tokens: 100,  modules: [1] },
  // ⚡ Pro
  'price_1TbUjB2LoEeIEPVEa3AEQywy': { tier: 'pro',          tokens: 300,  modules: [1,2,3,4] },
  // 🔥 Builder
  'price_1TbUjN2LoEeIEPVEEyy4FxrL': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9] },
  'price_1TbUjT2LoEeIEPVECfWtHePf': { tier: 'builder',      tokens: 800,  modules: [1,2,3,4,5,6,7,8,9] },
  // 🏛️ Architect
  'price_1TbUjf2LoEeIEPVEyHtcTurh': { tier: 'architect',    tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },
  'price_1TbUjl2LoEeIEPVEKKa17fza': { tier: 'architect',    tokens: 1500, modules: [1,2,3,4,5,6,7,8,9,10,11] },
  // ⚛️ Hyper Legend
  'price_1TbUjw2LoEeIEPVEIU4LKdZp': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
  'price_1TbUk22LoEeIEPVEB6hpSFZt': { tier: 'hyper_legend', tokens: 2500, modules: [1,2,3,4,5,6,7,8,9,10,11,12,13] },
};
