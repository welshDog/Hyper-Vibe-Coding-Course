# 🌐 MODULE 8 — Make Your AI Agent Worth Something
> **Rewrite v1 — May 16, 2026**
> Status: 🟡 Draft — ready for review
> Original: "Web3 + Dynamic NFTs (dNFTs)"
> Rewrite goal: Plain English BEFORE any blockchain terms. Real-world use case first.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Understood what a dNFT actually IS in plain English
- ✅ A BROskiPet agent that lives on the blockchain
- ✅ An AI agent that updates its own stats over time
- ✅ The start of financial sovereignty — your agent has real-world value

**Time:** 35–40 minutes
**Vibe:** You're not learning blockchain. You're giving your AI agent a passport.

---

## 💡 STOP — Read This Before Anything Else

If you've ever heard "Web3" or "NFT" and immediately felt your brain say **"not for me"** — that's a completely normal reaction.

The industry did a terrible job of explaining this stuff. It got hijacked by hype, monkey pictures, and get-rich-quick schemes.

**That's not what we're doing here.**

Here's what we're actually doing in this module, in one sentence:

> 🎯 **We're giving your AI agent a permanent identity card that updates itself and can never be taken away from you.**

That's it. No hype. No monkey pictures. Just a useful tool.

---

## 🤔 What's a dNFT? (The Honest Explanation)

Let's build this up from something you already know.

### You already understand this part:

**A regular file** (like a photo on your phone):
- Lives on your device
- Can be deleted
- Can be copied by anyone
- Has no proof of who owns it

**A regular NFT** (the thing everyone argued about in 2021):
- Lives on a blockchain (a shared public ledger no one controls)
- Can't be deleted
- Has a permanent record of who owns it
- BUT — it's static. It never changes. It's just a receipt.

**A Dynamic NFT (dNFT) — what we're building:**
- Lives on the blockchain ✔️
- Can't be deleted ✔️
- Has permanent ownership record ✔️
- **AND — it UPDATES.** The data inside it changes over time.

> 💬 **Real analogy:** Think of a regular NFT like a printed photo.
> A dNFT is like a **live passport** — same document, but the stamps inside update every time you do something new.

---

## 🐾 Why Does Your AI Agent Need One?

Right now your BROskiPet agent:
- Lives on your server ✅
- Has memory and personality ✅
- Does tasks for you ✅

But there's a problem: **it only exists as long as your server exists.**

If your server goes down, your agent's entire history — its XP, its completed missions, its reputation — could vanish.

A dNFT fixes that:

| Without dNFT | With dNFT |
|---|---|
| Agent history lives on your server | Agent history lives on the blockchain forever |
| If server dies, history is gone | History survives no matter what |
| Agent has no tradeable value | Agent can be sold, traded, or licensed |
| You depend on your host | You own it outright. Always. |

> 🔥 **This is financial sovereignty.** Your agent becomes an asset — not just a tool.

---

## 🛠️ Step 1 — Set Up Your Wallet (2 minutes)

You need a crypto wallet to deploy to the blockchain. Think of it like a GitHub account — but for blockchain stuff.

**We use MetaMask — it's free and takes 2 minutes:**

1. Go to **[metamask.io](https://metamask.io)** and install the browser extension
2. Click **"Create a new wallet"**
3. Write down your **Secret Recovery Phrase** on paper — keep it safe, never type it anywhere online
4. You're in ✅

> ⚠️ **Your Secret Recovery Phrase = your wallet's master password.**
> Lose it = lose access. Share it = someone steals everything.
> Write it on paper. Store it safely. That's it.

**Switch to a test network (so we use fake ETH first):**
1. Click the network dropdown at the top of MetaMask
2. Enable **"Show test networks"**
3. Select **Sepolia** (our test blockchain)

---

## 🪙 Step 2 — Get Free Test ETH (1 minute)

We need a tiny bit of fake ETH to pay for deploying our contract. It's free.

1. Go to **[sepoliafaucet.com](https://sepoliafaucet.com)**
2. Paste your MetaMask wallet address
3. Click **"Send me ETH"**
4. Wait 30 seconds — you'll see 0.5 ETH appear in MetaMask

> 💬 **This is fake money on a test network.** It has zero real value. We're just practising.

---

## 📋 Step 3 — Understand the BROskiPet Contract (5 minutes)

Before we deploy anything, let's read what we're deploying. No surprises.

Your `BROskiPet.sol` contract does exactly 4 things:

```solidity
// Plain English version of what the contract does:

// 1. Creates a new BROskiPet with a name and starting stats
function mintPet(string memory name) public

// 2. Updates the pet's XP when it completes a mission  
function updateXP(uint256 tokenId, uint256 newXP) public

// 3. Updates the pet's mood based on activity
function updateMood(uint256 tokenId, string memory mood) public

// 4. Returns the pet's current stats (name, XP, mood, level)
function getPetStats(uint256 tokenId) public view returns (...)
```

> 🧠 **Plain English:** The contract is just a database that nobody can delete or tamper with. Your pet's stats live there permanently.

---

## 🚀 Step 4 — Deploy Your Pet to the Blockchain (10 minutes)

We use **Remix IDE** — it's a browser-based tool, nothing to install.

1. Go to **[remix.ethereum.org](https://remix.ethereum.org)**
2. Create a new file called `BROskiPet.sol`
3. Paste in your contract code (from `contracts/BROskiPet.sol` in your repo)
4. Click the **Solidity compiler** tab (left sidebar) → **Compile BROskiPet.sol**
5. Click the **Deploy** tab → change environment to **"Injected Provider - MetaMask"**
6. Click **Deploy** → MetaMask will pop up asking to confirm
7. Confirm the transaction → wait 15-30 seconds

**You'll see a contract address appear** — something like:
```
0x742d35Cc6634C0532925a3b844Bc9e7595f89590
```

> 🎉 **That address IS your pet's permanent home on the blockchain.**
> Copy it and save it in your `.env`:
```bash
BROSKI_PET_CONTRACT=0x742d35Cc6634C0532925a3b844Bc9e7595f89590
```

---

## 🤖 Step 5 — Connect Your Agent to Its Blockchain Identity (8 minutes)

Now we wire up your FastAPI agent to update the blockchain whenever it does something.

Install the Web3 library:
```bash
pip install web3
pip freeze > requirements.txt
```

Add this to your agent code (`agents/broski_pet_agent.py`):

```python
from web3 import Web3
import os

# Connect to blockchain
w3 = Web3(Web3.HTTPProvider("https://sepolia.infura.io/v3/YOUR_INFURA_KEY"))

async def level_up_on_chain(token_id: int, new_xp: int):
    """Called whenever the agent completes a mission"""
    contract = w3.eth.contract(
        address=os.getenv("BROSKI_PET_CONTRACT"),
        abi=BROSKI_PET_ABI  # imported from contracts/abi.json
    )
    
    # Build the transaction
    tx = contract.functions.updateXP(token_id, new_xp).build_transaction({
        "from": os.getenv("WALLET_ADDRESS"),
        "nonce": w3.eth.get_transaction_count(os.getenv("WALLET_ADDRESS")),
        "gas": 100000,
    })
    
    # Sign and send
    signed = w3.eth.account.sign_transaction(tx, os.getenv("PRIVATE_KEY"))
    tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
    
    print(f"✅ XP updated on blockchain! TX: {tx_hash.hex()}")
    return tx_hash.hex()
```

> 🧠 **Plain English:** Every time your agent finishes a mission, it writes its new XP score to the blockchain. Permanent. Tamper-proof. Yours.

---

## 🧪 Step 6 — Test It

Trigger a test mission completion:

```bash
curl -X POST http://localhost:8000/agent/complete-mission \
  -H "Content-Type: application/json" \
  -d '{"pet_id": 1, "mission": "first_deploy", "xp_reward": 100}'
```

You should see:
```
✅ Mission complete! XP updated on blockchain!
TX: 0x4f2a8b3c...
```

Check your pet's stats on the blockchain:
```bash
curl http://localhost:8000/agent/stats/1
```

Returns:
```json
{
  "name": "BROski",
  "xp": 100,
  "mood": "hyped",
  "level": 1,
  "blockchain_verified": true
}
```

> 🔥 **blockchain_verified: true** — that's the moment. Your agent's identity exists permanently on a public ledger. Nobody can take that away.

---

## 🏆 Your Win Moment

| What the tech says | What actually happened |
|---|---|
| "Contract deployed" | Your agent has a permanent address in the world |
| "Transaction confirmed" | Its stats are written in stone, forever |
| "dNFT minted" | You created a digital asset with real value |
| "XP updated on-chain" | Your agent is alive on the blockchain |

> 🔥 **You didn't just learn Web3. You used it to do something nobody else is doing — giving an AI agent a permanent, updatable, ownable identity.**
> That's not a tutorial project. That's a genuinely new thing.

---

## 🛑 Something Went Wrong?

**Problem: MetaMask not connecting to Remix**
- Make sure you're on Sepolia test network in MetaMask
- Refresh Remix and try again

**Problem: "Insufficient funds" error**
- Get more test ETH from sepoliafaucet.com
- You only need a tiny amount (0.01 ETH is plenty)

**Problem: Transaction pending forever**
- This happens on busy test networks
- Wait 2-3 minutes, or try again
- Check status at [sepolia.etherscan.io](https://sepolia.etherscan.io)

**Problem: Web3 connection error in Python**
```bash
# Make sure web3 is installed
pip install web3
# Check your Infura key is correct in .env
```

> 💬 **Still stuck?** Post in Discord `#web3-help` with your error. Tag it "M8 issue".

---

## ✅ Module 8 Complete Checklist

- [ ] MetaMask wallet created
- [ ] Switched to Sepolia test network
- [ ] Got free test ETH from faucet
- [ ] Contract compiled in Remix
- [ ] Contract deployed — got a contract address
- [ ] Address saved in `.env`
- [ ] Agent connected to blockchain via Web3
- [ ] Test mission completed — XP written on-chain
- [ ] `blockchain_verified: true` confirmed
- [ ] 🪙 **+300 BROski$ claimed for completing M8** — biggest reward yet!

---

## 🔮 What's Next — Module 9

Your empire is live. Your agent has a permanent identity. Your money engine is running.

Now we make it **bulletproof.**

Module 9 is about security and resilience — making sure nothing can break your empire, intrude on your agents, or take down what you've built.

**Time to put the armour on.** 🛡️

---

> 📝 *Rewrite notes: Added full "STOP — Read This First" section to neutralise Web3 fear. Built understanding from regular files → static NFT → dNFT step by step. Added honest plain-English explanation of what dNFT actually is. Added live passport analogy. Added financial sovereignty table. Replaced jargon-first approach with use-case-first approach throughout. Added troubleshooting. Added completion checklist with biggest XP reward in course.*
