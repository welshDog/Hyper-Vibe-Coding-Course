# 🔗 Web3 Integration & On-Chain

**Module:** M9 | **Level:** Hyper-Pro | **XP:** 80 | **Coins:** 35 BROski$

> The BROski$ economy is real. On-chain NFTs are real. This module connects your AI ecosystem to the blockchain.

---

## 🎯 What You'll Learn

- Understand the BROski$ token economy architecture
- Integrate Stripe payments that trigger on-chain token minting
- Implement dynamic NFT metadata that evolves with agent state
- Connect Supabase off-chain data to on-chain smart contracts
- Build the payment → token → NFT pipeline end-to-end

---

## 🧠 The Big Idea

Web3 in the HyperCode ecosystem isn't about speculation. It's about **ownership**.

- **BROski$ tokens** = proof of work, proof of learning, proof of contribution
- **dNFTs** (dynamic NFTs) = your AI pet's on-chain identity that evolves
- **The pipeline:** User pays Stripe → Edge Function fires → Supabase updated → On-chain minted

---

## 💰 The BROski$ Economy

| Action | BROski$ Earned |
|--------|---------------|
| Complete a module | 10–100 coins |
| Daily login | +5 coins |
| Create a task | +2 coins |
| Contribute to repo | +20 coins |
| Purchase (Stripe) | Variable pack |

| Pack | Price | Coins |
|------|-------|-------|
| Starter | £4.99 | 500 |
| Builder | £14.99 | 2,000 |
| Hyper | £49.99 | 10,000 |

---

## ⚡ Step-by-Step

### Step 1 — Wire Stripe Checkout
```typescript
// app/api/checkout/route.ts
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
  metadata: { user_id: userId, pack: packName }
});
```

### Step 2 — Handle the webhook
```typescript
// Supabase Edge Function: stripe-webhook
const event = stripe.webhooks.constructEvent(body, sig, secret);
if (event.type === 'checkout.session.completed') {
  const { user_id, pack } = event.data.object.metadata;
  const coins = PACK_COINS[pack];
  await supabase.from('profiles').update({ brosk_coins: supabase.rpc('increment', { amount: coins }) }).eq('id', user_id);
}
```

### Step 3 — Dynamic NFT metadata endpoint
```typescript
// app/api/nft/[tokenId]/route.ts
const pet = await supabase.from('pets').select('*').eq('token_id', tokenId).single();
return Response.json({
  name: pet.name,
  description: `Level ${pet.level} BROski Pet`,
  image: generatePetImage(pet),
  attributes: [
    { trait_type: 'Level', value: pet.level },
    { trait_type: 'Mood', value: pet.mood },
    { trait_type: 'XP', value: pet.xp }
  ]
});
```

---

## 🌟 The Neurodivergent Edge

The token economy is designed for **ADHD reward loops**. Small, frequent, tangible rewards. The coins you earn by completing modules have **real value** in the ecosystem.

---

## ✨ Practical Task

Set up Stripe in test mode. Create a checkout for the Starter pack. Complete a test payment. Verify your `brosk_coins` balance increases in Supabase.

---

## 📊 XP Check

- [ ] Stripe Checkout working in test mode
- [ ] Webhook handler deployed (Supabase Edge Function)
- [ ] Coins update in DB on successful payment
- [ ] NFT metadata endpoint returning dynamic attributes

**Complete all 4 → Claim your 80 XP + 35 BROski$ 🤑**
