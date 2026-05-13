# 🔵 Base_Skill.md — Master Base App & AI Agent Playbook
> **BROski Agent Reference** | Built: May 2026 | Maintained by: welshDog + Agent BROski♾
> Source of truth for everything Base-related in the HyperFocus ecosystem.

---

## 🧠 What Is Base?

- **Base** is an Ethereum L2 blockchain built by Coinbase.
- It uses **OP Stack** — fast, cheap, EVM-compatible.
- Live on **mainnet** and **Base Sepolia** (testnet).
- Docs: https://docs.base.org
- Dashboard: https://dashboard.base.org
- Full LLM docs index: https://docs.base.org/llms.txt

---

## ✅ Step 1 — App Registration

### What you need
- A live public URL for your app
- A Base Dashboard account

### How to register
1. Go to https://dashboard.base.org
2. Create a new app → enter name + URL
3. Go to **Settings > API Key** → generate your `x-api-key`
4. Copy your **App ID** (e.g. `6a03b7792be96789d34cef8d`)

### Add the verification meta tag
Add this to your `<head>` in `index.html` (Vite) or `layout.tsx` (Next.js App Router):

```html
<meta name="base:app_id" content="YOUR_APP_ID_HERE" />
```

> ⚠️ The homepage must be publicly accessible (no auth walls) when Base verifies it.
> ⚠️ For Vite apps, the file is `frontend/index.html` — NOT a Next.js route file.

---

## 🛠️ Step 2 — Build Stack

### Recommended stack
| Layer | Tool |
|---|---|
| Framework | Next.js (App Router) or Vite + React |
| Chain library | `viem` |
| Wallet hooks | `wagmi` |
| Query | `@tanstack/react-query` |
| Smart wallet | `@base-org/account` |
| Testnet | Base Sepolia |
| Mainnet | Base Mainnet |

### Install
```bash
npm install wagmi viem @tanstack/react-query @base-org/account
```

### Wagmi config (Base)
```ts
import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})
```

---

## 👛 Step 3 — Wallet Connection

### Connect wallet with wagmi
```tsx
import { useConnect, useAccount, useDisconnect } from 'wagmi'

const { connect, connectors } = useConnect()
const { address, isConnected } = useAccount()
const { disconnect } = useDisconnect()
```

### Detect smart wallet capabilities (EIP-5792)
```ts
import { useCapabilities } from 'wagmi/experimental'

const { data: capabilities } = useCapabilities()
const canBatch = capabilities?.[base.id]?.atomicBatch?.supported
```

> ⚠️ Smart wallets (Base Account) support batching. EOAs do NOT — always add fallback.

---

## 📖 Step 4 — Contract Reads

```ts
import { useReadContract } from 'wagmi'

const { data } = useReadContract({
  address: '0xContractAddress',
  abi: yourABI,
  functionName: 'getValue',
  args: [],
})
```

---

## ✍️ Step 5 — Contract Writes

```ts
import { useWriteContract } from 'wagmi'

const { writeContract } = useWriteContract()

writeContract({
  address: '0xContractAddress',
  abi: yourABI,
  functionName: 'setValue',
  args: [42n],
})
```

---

## ⚡ Step 6 — Batch Transactions (Smart Wallets Only)

```ts
import { useSendCalls } from 'wagmi/experimental'

const { sendCalls } = useSendCalls()

sendCalls({
  calls: [
    { to: '0xContractA', data: '0x...', value: 0n },
    { to: '0xContractB', data: '0x...', value: 0n },
  ],
})
```

> 💡 Only works for smart wallets. Check `canBatch` capability first — then fallback to sequential writes for EOAs.

---

## 🔔 Step 7 — Notifications API

### Prerequisites
- App registered on Base Dashboard
- API key from **Settings > API Key**
- App URL must match what's registered

### Base URL
```
https://dashboard.base.org/api/v1/
```

### Auth header (ALL requests)
```
x-api-key: YOUR_API_KEY
```

### Rate limit
- **20 requests per minute per IP** (shared across all 3 endpoints)
- Exceeding returns `429 Too Many Requests`

---

### 🔍 Check single user status
```bash
POST https://dashboard.base.org/api/v1/notifications/app/user/status

{
  "app_url": "https://your-app.vercel.app",
  "wallet_address": "0xAbc..."
}
```
**Response:**
```json
{ "appPinned": true, "notificationsEnabled": true }
```

---

### 👥 Get all opted-in users
```bash
GET https://dashboard.base.org/api/v1/notifications/app/users
  ?app_url=https://your-app.vercel.app
  &notification_enabled=true
  &limit=500
  &cursor=NEXT_PAGE_CURSOR
```
**Response:**
```json
{
  "success": true,
  "users": [
    { "address": "0xA11ce...", "notificationsEnabled": true }
  ],
  "nextCursor": "abc123"
}
```

---

### 📨 Send a notification
```bash
POST https://dashboard.base.org/api/v1/notifications/send

{
  "app_url": "https://your-app.vercel.app",
  "wallet_addresses": ["0xA11ce...", "0xB0B0..."],
  "title": "🐾 BROski Alert!",
  "message": "Your pet just levelled up! Check it out now.",
  "target_path": "/pets"
}
```

### 📏 Limits
| Field | Limit |
|---|---|
| `title` | 30 characters max |
| `message` | 200 characters max |
| `wallet_addresses` | 1,000 per request max |
| `target_path` | 500 characters max, must start with `/` |

### ♻️ Deduplication
- Identical notifications (same app URL + wallet + title + message + path) within **24 hours** are auto-deduplicated — no duplicate push sent.

### ❌ Error codes
| Code | Meaning |
|---|---|
| 400 | Bad request — missing field, wrong format, exceeded limit |
| 401 | Invalid or missing API key |
| 403 | App URL not registered to your project |
| 404 | Project not found |
| 429 | Rate limit hit |
| 503 | Notification service temporarily down — retry |

---

## 🤖 Step 8 — AI Agents on Base

### What Base AI agents can do
- Hold funds and sign transactions autonomously
- Pay for services using **x402** (stablecoin micropayments)
- Trade on Base markets
- Register identity so other agents and services trust them
- Use **Base Skills** — installable toolpacks for agents

### Key docs
| Topic | URL |
|---|---|
| AI Agents overview | https://docs.base.org/ai-agents |
| Wallet setup | https://docs.base.org/ai-agents/setup/wallet-setup |
| x402 payments | https://docs.base.org/ai-agents/payments/pay-for-services-with-x402 |
| Agent registration | https://docs.base.org/ai-agents/setup/agent-registration |
| Trading | https://docs.base.org/ai-agents/trading |
| Base Skills | https://github.com/base/skills |

### Install Base Skills
```bash
npx skills add base/base-skills
```

### Available skills
| Skill | What it does |
|---|---|
| `cdp-payment-skills` | Coinbase CDP payments |
| `sponge-x402` | x402 payment protocol |
| `alchemy-agentic-gateway` | Alchemy trading gateway |
| `coingecko` | Price data from CoinGecko |
| `swap-execution` | Execute token swaps |
| `bankr` | Wallet management |
| `cdp-agentic-wallet` | CDP wallet for agents |
| `sponge-wallet` | Lightweight wallet skill |

### Base MCP Server (for AI tooling)
```
https://docs.base.org/mcp
```
Add this to your AI agent config for direct Base docs access.

---

## 🏗️ Step 9 — Deploy on Base

### Testnet (Base Sepolia)
- Chain ID: `84532`
- RPC: `https://sepolia.base.org`
- Faucet: https://docs.base.org/base-chain/network-information/network-faucets

### Mainnet (Base)
- Chain ID: `8453`
- RPC: `https://mainnet.base.org`

### Deploy contract
```bash
# using Hardhat or Foundry — point network to Base
forge create --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  src/MyContract.sol:MyContract
```

---

## ⚠️ Gotchas & Rules

| Gotcha | Fix |
|---|---|
| Vercel auth wall blocks Base verification | Turn off deployment protection before verifying |
| Wrong index.html (Vite) | Put meta tag in `frontend/index.html`, not a subfolder |
| Smart wallet batching for EOAs | Always check `canBatch` capability first |
| Notification API rate limit | Max 20 req/min — batch your sends |
| App URL mismatch | Must exactly match registered URL in Base Dashboard |
| 24h notification dedup | Don't resend identical notifications within 24h |
| API key local only | Store in `.env` — never commit to GitHub |
| API key in production | Manually add to Vercel/Railway env vars |

---

## 🐾 BROski Project Context

| Thing | Value |
|---|---|
| App Name | BROski dnft Pet$ |
| App ID | `6a03b7792be96789d34cef8d` |
| Live URL | https://hyper-vibe-coding-course-dnjpk2crx-bro-skis.vercel.app |
| Repo | welshDog/Hyper-Vibe-Coding-Course |
| Framework | Vite + React (NOT Next.js) |
| API key location | `H:\HYPERFOCUSZONE\HperCore\Hyper-Vibe-Coding-Course\.env` |
| Verified on Base | ✅ May 13 2026 |

---

## 🤖 Agent BROski Checklist

Before any Base feature work:
- [ ] App URL registered on Base Dashboard ✅
- [ ] `base:app_id` meta tag in `frontend/index.html` ✅
- [ ] API key in `.env` (local) ✅
- [ ] API key in Vercel/Railway env vars (for production) ❓
- [ ] Vercel protection disabled or bypassed for Base scanners
- [ ] Check `canBatch` before any batch transaction
- [ ] Notification title ≤ 30 chars, message ≤ 200 chars
- [ ] Never commit `.env` to GitHub

---

*Last updated: May 13 2026 | Built with BROski♾ energy*
