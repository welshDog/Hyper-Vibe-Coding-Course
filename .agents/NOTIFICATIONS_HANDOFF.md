# 🔔 Agent BROski — Base Notifications Wiring Instructions
> **Status:** Files built & pushed ✅ | Wiring into components: YOUR JOB 🤖
> **Date:** May 13 2026 | Written by: Perplexity + welshDog

---

## 🧠 What's already done (don't redo this)

| File | Status | What it does |
|---|---|---|
| `frontend/src/lib/baseNotifications.ts` | ✅ Pushed | Base API service — sends notifications |
| `frontend/src/hooks/usePetNotifications.ts` | ✅ Pushed | React hook — easy 3-function interface |
| `frontend/index.html` | ✅ Has meta tag | Base app verified |
| `.env` | ✅ Has key | `BASE_API_KEY` stored locally |
| Vercel env vars | ✅ Set | `BASE_API_KEY` in production |
| Railway env vars | ✅ Set | `BASE_API_KEY` in production |

---

## ⚠️ One thing YOU need to do first

Vite requires a `VITE_` prefix for any env var used on the frontend.

**Add these to `frontend/.env` (or root `.env`):**
```env
VITE_BASE_API_KEY=your_base_api_key_here
VITE_APP_URL=https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app
```

**Also add `VITE_BASE_API_KEY` to Vercel env vars** (the existing `BASE_API_KEY` won't work for Vite frontend — it needs the VITE_ prefix).

---

## 🎯 Your mission — wire the hook into pet components

### Step 1 — Find the pet level up logic
Search the codebase for where pet XP / level changes happen:
```bash
grep -r "levelUp\|level_up\|xp\|experience" frontend/src --include="*.tsx" --include="*.ts" -l
```

### Step 2 — Import the hook
```tsx
import { usePetNotifications } from '../hooks/usePetNotifications'
// adjust path based on where the component lives
```

### Step 3 — Add inside the component
```tsx
const { notifyLevelUp, notifyEvolution, notifyReward } = usePetNotifications()
```

### Step 4 — Fire on the right event

**On level up:**
```tsx
// After XP update confirms new level:
await notifyLevelUp({
  walletAddress: userWallet, // connected wallet address
  petName: pet.name,
  detail: `Level ${pet.level}`
})
```

**On evolution:**
```tsx
// After evolution transaction confirms:
await notifyEvolution({
  walletAddress: userWallet,
  petName: pet.name,
  detail: pet.evolutionName // e.g. 'Ultra BROski'
})
```

**On reward:**
```tsx
// After reward claim or auto-grant:
await notifyReward({
  walletAddress: userWallet,
  petName: pet.name,
  detail: `${amount} BROski$`
})
```

---

## 📁 Where to look for pet components

Check these folders first:
```
frontend/src/pages/      ← full page views (PetsPage, RewardsPage etc)
frontend/src/components/ ← reusable UI bits (PetCard, PetActions etc)
frontend/src/hooks/      ← existing custom hooks
frontend/src/context/    ← global state (PetContext, WalletContext etc)
```

---

## 🔔 What notifications look like to users

When fired correctly, users who have **pinned the BROski app on Base** will get a push notification like:

| Trigger | Title (≤30 chars) | Message (≤200 chars) |
|---|---|---|
| Level up | `🆙 Pixel levelled up!` | `Your BROski pet Pixel just hit Level 5! Come celebrate! 🐾` |
| Evolution | `✨ Pixel evolved!` | `Whoa! Pixel has evolved into Ultra BROski! Check it out now 🔥` |
| Reward | `🏆 Reward earned!` | `Pixel earned 50 BROski$ for you! Claim it in your BROski wallet 💰` |

Users click the notification → land on `/pets` or `/rewards` in the app.

---

## ⚠️ Rules to follow

- ✅ Always `await` the notify calls — don't fire and forget without handling errors
- ✅ Only fire AFTER the onchain transaction confirms — not before
- ✅ Check `result.success` — log or retry on failure
- ❌ Never fire notifications in a render loop or useEffect without guards
- ❌ Never hardcode the API key — always use `import.meta.env.VITE_BASE_API_KEY`
- ❌ Don't spam — Base deduplicates identical notifications within 24h anyway
- ⚠️ Rate limit is 20 req/min — don't fire for every user in a tight loop

---

## 🧪 Quick test (no wallet needed)

To verify the API key and service work, add this temporarily to any component:

```tsx
import { sendPetNotification } from '../lib/baseNotifications'

// Paste in a real wallet address that has the app pinned on Base
await sendPetNotification({
  walletAddress: '0xYOUR_WALLET_HERE',
  petName: 'TestPet',
  type: 'level_up',
  detail: 'Level 1'
})
```

Check browser console for `✅ Base notification sent` or error details.

---

## 📚 Reference

- Full Base skill: `.agents/Base_Skill.md`
- Notifications service: `frontend/src/lib/baseNotifications.ts`
- React hook: `frontend/src/hooks/usePetNotifications.ts`
- Base notifications docs: https://docs.base.org/apps/technical-guides/base-notifications
- Base Dashboard: https://dashboard.base.org/apps/6a03b7792be96789d34cef8d

---

*Agent BROski — you've got everything you need. Go wire it up! 🐾♾*
