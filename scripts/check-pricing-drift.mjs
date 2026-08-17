#!/usr/bin/env node
// =============================================================
// Pricing drift check — catches the "one tier map changed, the
// others didn't" class of bug across the three places tier/price
// data lives:
//   1. supabase/functions/stripe-webhook/index.ts   (Deno, PRICE_TO_TIER)
//   2. stripe/products.config.ts                    (Node/TS, PRICE_TO_TIER + STRIPE_PRODUCTS)
//   3. frontend/src/lib/stripe-price-ids.ts          (Vite, STRIPE_PRICE_IDS)
//
// These live in three different runtimes (Deno / plain Node / Vite),
// so this is a regex-based text check rather than a real import —
// it's line-format-sensitive by design. If you change how these
// literals are formatted, update the regexes below; a failure here
// means "go look", not "the check is broken".
//
// Run: node scripts/check-pricing-drift.mjs
// =============================================================
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (p) => readFileSync(path.join(repoRoot, p), 'utf8')

const webhookSrc = read('supabase/functions/stripe-webhook/index.ts')
const productsSrc = read('stripe/products.config.ts')
const frontendSrc = read('frontend/src/lib/stripe-price-ids.ts')

/** Parses a `'price_x': { tier: 'y', tokens: N, modules: [1,2,...] }` map. */
function parsePriceToTier(src, label) {
  const re = /'(price_[A-Za-z0-9]+)':\s*\{\s*tier:\s*'([a-z_]+)',\s*tokens:\s*(\d+),\s*modules:\s*\[([\d,\s]*)\]\s*\}/g
  const out = new Map()
  let m
  while ((m = re.exec(src))) {
    const [, priceId, tier, tokens, modules] = m
    out.set(priceId, {
      tier,
      tokens: Number(tokens),
      modules: modules.split(',').map((s) => s.trim()).filter(Boolean).map(Number),
    })
  }
  if (out.size === 0) throw new Error(`${label}: matched zero PRICE_TO_TIER entries — regex is out of sync with the file format`)
  return out
}

/** Parses STRIPE_PRODUCTS' per-product { priceId, amount } pairs (pence). */
function parseProductAmounts(src) {
  const re = /priceId:\s*'(price_[A-Za-z0-9]+)',\s*\n\s*amount:\s*(\d+),/g
  const out = new Map()
  let m
  while ((m = re.exec(src))) out.set(m[1], Number(m[2]))
  if (out.size === 0) throw new Error('products.config.ts: matched zero { priceId, amount } pairs')
  return out
}

/** Parses frontend STRIPE_PRICE_IDS: tierKey -> { once, monthly?, amountOnce, amountMonthly? }. */
function parseFrontendPrices(src) {
  const re = /'?([a-z-]+)'?:\s*\{\s*once:\s*'(price_[A-Za-z0-9]+)',(?:\s*monthly:\s*'(price_[A-Za-z0-9]+)',)?\s*amountOnce:\s*(\d+)(?:,\s*amountMonthly:\s*(\d+))?/g
  const out = new Map()
  let m
  while ((m = re.exec(src))) {
    const [, tierKey, once, monthly, amountOnce, amountMonthly] = m
    out.set(tierKey, {
      once,
      monthly: monthly ?? null,
      amountOnce: Number(amountOnce),
      amountMonthly: amountMonthly ? Number(amountMonthly) : null,
    })
  }
  if (out.size === 0) throw new Error('stripe-price-ids.ts: matched zero tier entries — regex is out of sync with the file format')
  return out
}

const webhookMap = parsePriceToTier(webhookSrc, 'stripe-webhook/index.ts')
const productsMap = parsePriceToTier(productsSrc, 'products.config.ts')
const productAmounts = parseProductAmounts(productsSrc)
const frontendMap = parseFrontendPrices(frontendSrc)

const errors = []

// 1. Every webhook price ID must exist in products.config.ts with matching data.
for (const [priceId, entry] of webhookMap) {
  const configEntry = productsMap.get(priceId)
  if (!configEntry) {
    errors.push(`price ${priceId}: in stripe-webhook/index.ts but missing from stripe/products.config.ts`)
    continue
  }
  if (
    configEntry.tier !== entry.tier ||
    configEntry.tokens !== entry.tokens ||
    configEntry.modules.join(',') !== entry.modules.join(',')
  ) {
    errors.push(
      `price ${priceId}: webhook says ${JSON.stringify(entry)}, products.config.ts says ${JSON.stringify(configEntry)}`,
    )
  }
}
for (const priceId of productsMap.keys()) {
  if (!webhookMap.has(priceId)) {
    errors.push(`price ${priceId}: in stripe/products.config.ts but missing from stripe-webhook/index.ts`)
  }
}

// 2. Every frontend tier's price IDs must exist in the webhook map, and the
//    frontend's pound amounts must match products.config.ts's pence amounts.
for (const [tierKey, entry] of frontendMap) {
  for (const [billing, priceId] of [['once', entry.once], ['monthly', entry.monthly]]) {
    if (!priceId) continue
    if (!webhookMap.has(priceId)) {
      errors.push(`frontend tier '${tierKey}' (${billing}): price ${priceId} not found in stripe-webhook/index.ts's PRICE_TO_TIER`)
      continue
    }
    const pence = productAmounts.get(priceId)
    const pounds = billing === 'once' ? entry.amountOnce : entry.amountMonthly
    if (pence == null) {
      errors.push(`frontend tier '${tierKey}' (${billing}): price ${priceId} has no { priceId, amount } pair in products.config.ts to check against`)
    } else if (pounds == null || pence !== pounds * 100) {
      errors.push(`frontend tier '${tierKey}' (${billing}): stripe-price-ids.ts says £${pounds}, products.config.ts says ${pence}p`)
    }
  }
}

if (errors.length > 0) {
  console.error(`❌ Pricing drift detected (${errors.length}):\n`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`✅ Pricing data agrees across stripe-webhook/index.ts, products.config.ts, and stripe-price-ids.ts (${webhookMap.size} price IDs checked).`)
