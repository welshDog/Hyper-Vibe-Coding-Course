# 🏗️ Builder Codes Plan — Get Base Attribution + Rewards
> **Agent BROski Mission** | May 2026 | Priority: HIGH 🔥
> This is how we get BROski transactions counted by Base and unlock rewards.

---

## 🧠 What Are Builder Codes?

- **ERC-721 NFTs** — each code is a unique identifier like `abc123`
- They tag your app's transactions onchain via **ERC-8021 attribution suffix**
- Base reads the suffix AFTER the transaction — zero impact on contracts
- Rewards, analytics, and app discovery are all tied to this

### Benefits
| Benefit | What it means for BROski |
|---|---|
| 💰 Rewards | Base pays builders whose apps drive transactions |
| 📊 Analytics | See real users, transactions, gas in Base Dashboard |
| 🔍 Visibility | App shows in Base leaderboards + App Store discovery |

---

## ✅ Step 1 — Get Your Builder Code (Lyndz does this)

1. Go to **https://www.base.dev**
2. Connect your wallet
3. Go to **Settings → Builder Codes**
4. Mint your free Builder Code (e.g. `broski123`)
5. Set your **payout address** (where rewards get sent)
6. Copy the code — you'll need it in Step 2

> ⚠️ This is a one-time wallet action. Gas is minimal.

---

## ✅ Step 2 — Install the ox library

```bash
cd frontend
npm install ox
```

---

## ✅ Step 3 — Create the attribution suffix file

Create `frontend/src/lib/builderCode.ts`:

```ts
import { Attribution } from 'ox/erc8021'

// 🔵 Your Builder Code from base.dev > Settings > Builder Codes
const BUILDER_CODE = import.meta.env.VITE_BUILDER_CODE || 'YOUR-BUILDER-CODE-HERE'

// Generate ERC-8021 compliant data suffix
export const ERC_8021_SUFFIX = Attribution.toDataSuffix({
  codes: [BUILDER_CODE]
})

export default ERC_8021_SUFFIX
```

---

## ✅ Step 4 — Add to .env

In `frontend/.env`:
```env
VITE_BUILDER_CODE=your-builder-code-here
```

Also add `VITE_BUILDER_CODE` to **Vercel env vars** and **Railway env vars**.

---

## ✅ Step 5 — Wire into transactions (EOA wallets)

For regular wallet (EOA) transactions using wagmi `useWriteContract`:

```ts
import { useWriteContract } from 'wagmi'
import { ERC_8021_SUFFIX } from '../lib/builderCode'

const { writeContract } = useWriteContract()

// Add dataSuffix to any contract write:
writeContract({
  address: '0xContractAddress',
  abi: yourABI,
  functionName: 'levelUp',
  args: [petId],
  dataSuffix: ERC_8021_SUFFIX  // ⬅ this is all you add!
})
```

---

## ✅ Step 6 — Wire into batch transactions (Smart Wallets)

For smart wallet batch transactions using `useSendCalls`:

```ts
import { useSendCalls } from 'wagmi/experimental'
import { ERC_8021_SUFFIX } from '../lib/builderCode'

const { sendCalls } = useSendCalls()

sendCalls({
  calls: [
    { to: '0xContractA', data: '0x...' },
    { to: '0xContractB', data: '0x...' },
  ],
  capabilities: {
    dataSuffix: {
      value: ERC_8021_SUFFIX,
      optional: true  // ⬅ optional:true = falls back gracefully if wallet doesn't support
    }
  }
})
```

---

## 🐾 Where to wire it in BROski app

Search for these patterns and add `dataSuffix` to each:

```bash
# Find all contract writes in the frontend:
grep -r "writeContract\|sendCalls\|sendTransaction" frontend/src --include="*.tsx" --include="*.ts" -l
```

Priority targets:
| Action | Why |
|---|---|
| Pet level up transaction | Most common user action |
| Pet evolution transaction | High value event |
| Reward claim transaction | High value event |
| Mint / adopt pet | New user onboarding |

---

## ✅ Step 7 — Verify attribution is working

**Method 1 — Base Dashboard:**
- Go to https://dashboard.base.org/apps/6a03b7792be96789d34cef8d
- Check **Onchain** tab → Total Transactions should start counting

**Method 2 — Basescan:**
- Find your transaction hash on https://basescan.org
- View **Input Data** field
- Last 16 bytes should show `8021` repeating

**Method 3 — Builder Code Validation Tool:**
- Go to https://www.base.dev
- Paste transaction hash
- Click **Check Attribution**

---

## ⚠️ Rules & Gotchas

| Rule | Detail |
|---|---|
| Only counts on Base mainnet + Base Sepolia | Other chains ignored for rewards |
| Gas cost is tiny | Only 16 gas per non-zero byte added |
| No contract changes needed | Suffix is appended to calldata only |
| `optional: true` for smart wallets | Graceful fallback if wallet doesn't support |
| One code per app is fine | You can have multiple but one is enough |
| Payout address = your wallet | Set it right when minting the code |
| Never hardcode the code | Use `VITE_BUILDER_CODE` env var |

---

## 📊 What success looks like in Base Dashboard

Once wired up and users transact:
- **Transacting users** counter starts going up 📈
- **Transactions** counter goes up 📈
- **Gas sponsored** shows (if using paymaster)
- **Notifications** counter shows engagement
- App becomes eligible for **Base reward programs** 💰

---

## 📚 Reference

| Resource | URL |
|---|---|
| Builder Codes docs | https://docs.base.org/apps/builder-codes/builder-codes |
| Get your Builder Code | https://www.base.dev |
| ERC-8021 spec | https://eips.ethereum.org/EIPS/eip-8021 |
| Dune analytics dashboard | https://dune.com/base_ds/base-builder-codes |
| Base Dashboard (our app) | https://dashboard.base.org/apps/6a03b7792be96789d34cef8d |
| ox library | https://oxlib.sh |

---

## 🤖 Agent BROski Checklist

- [ ] Lyndz mints Builder Code at base.dev
- [ ] Lyndz adds `VITE_BUILDER_CODE` to `.env`
- [ ] Lyndz adds `VITE_BUILDER_CODE` to Vercel + Railway env vars
- [ ] Agent installs `ox` in frontend: `npm install ox`
- [ ] Agent creates `frontend/src/lib/builderCode.ts`
- [ ] Agent finds all `writeContract` and `sendCalls` in codebase
- [ ] Agent adds `dataSuffix: ERC_8021_SUFFIX` to each
- [ ] Agent verifies with Basescan or base.dev validation tool
- [ ] Dashboard shows first attributed transaction 🎉

---

*Agent BROski — this is how we get Base in our wallets. Let's get it! 🐾♾*
