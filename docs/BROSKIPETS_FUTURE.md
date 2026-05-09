# 🐾 BROskiPets Future Integration Plan
> **Status: PARKED — Ship Phase 0 first, come back to this when ready.**
> Last updated: May 9, 2026

---

## 🔒 The 3 Sacred Rules (Never Bend These)

1. **Hyper-Vibe owns pets.** V2.4 reads them. No FastAPI mint routes ever.
2. **Base is the canonical chain.** EEPVengers.sol lives on Base Sepolia → Base mainnet. Ethereum Sepolia is archived.
3. **Redis DB 1 + 2 are sacred.** DB 1 = cache. DB 2 = rate limits. Pet state lives in Supabase `pets` table only.

---

## ✅ Phase 0 — Get Pets Breathing (15 min) ← DO THIS FIRST

```powershell
# 1. Deploy the Edge Function
supabase functions deploy mint-pet-confirm

# 2. Vercel dashboard
# VITE_MINT_VIA_RELAY=true → Production + Preview + Dev → Save → Redeploy

# 3. Fund relayer wallet
# Send Base Sepolia ETH to relayer address
```

**Done = pets are live. Stop here. Park the rest.**

---

## 🗺️ Full Phase Roadmap (Future Work)

| Phase | The Win | Est. Time |
|-------|---------|-----------|
| **0** | Deploy `mint-pet-confirm` + `VITE_MINT_VIA_RELAY=true` | 15 min ← **DO NOW** |
| **1** | Move `EEPVengers.sol` Ethereum Sepolia → Base Sepolia | 1–2 days |
| **2** | `course-profile-v2` Edge Fn + Discord `/coursestats` pet display | 2 days |
| **3** | `pet_mirror` table in V2.4 Postgres (read-only) + webhook sync | 1 day |
| **4** | Git hooks → pet XP + `award-pet-xp` Edge Function | 3–4 days |
| **5** | Pet shop items (food, toys, skins, boosts) in existing shop | 2–3 days |
| **6** | LLM pet chat via Ollama (`qwen2.5:7b`) on agents-net | 3–4 days |
| **7** | Grafana pet metrics dashboard | 1 day |

---

## 🔑 The 3 Files That Actually Matter (When Ready)

```
1. /supabase/functions/course-profile-v2/index.ts
   → Add pets[] array to course-profile response

2. /backend/app/db/migrations/005_pet_mirror.py
   → Lightweight read-only pet cache in V2.4 Postgres (NOT Redis)

3. /agents/broski-bot/commands/coursestats.py
   → Add pet display to Discord /coursestats command
```

---

## 📐 API Contract (course-profile-v2 response shape)

```json
{
  "user_id": "...",
  "discord_id": "...",
  "broski_tokens": 1250,
  "pets": [
    {
      "pet_id": "EEP-001",
      "name": "Sparky",
      "species": "Corgi",
      "rarity": "Epic",
      "xp": 3400,
      "evolution_stage": "Trained"
    }
  ],
  "active_pet_id": "EEP-001"
}
```

V2.4 calls this endpoint → displays pet in Discord `/coursestats` → **zero new infrastructure.**

---

## 🏗️ Phase 3 — pet_mirror Alembic Migration (When Ready)

```python
# backend/app/db/migrations/005_pet_mirror.py
# V2.4 read-only mirror — Hyper-Vibe is ALWAYS authoritative

"""add pet_mirror table

Revision ID: 005
Revises: 004
"""

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'pet_mirror',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.String, nullable=False, index=True),
        sa.Column('pet_id', sa.String, nullable=False),
        sa.Column('name', sa.String),
        sa.Column('species', sa.String),
        sa.Column('rarity', sa.String),
        sa.Column('xp', sa.Integer, default=0),
        sa.Column('evolution_stage', sa.String),
        sa.Column('last_synced', sa.DateTime, server_default=sa.func.now()),
    )

def downgrade():
    op.drop_table('pet_mirror')
```

---

## 🔗 Phase 3 — Webhook Sync Architecture

```
Hyper-Vibe Edge Function: pets-webhook
  → fires on pets table INSERT/UPDATE
  → POST to V2.4: /api/v1/pets/sync
  → Header: X-Sync-Secret (same pattern as course sync)

V2.4 FastAPI handler:
  → validates X-Sync-Secret
  → upserts pet_mirror table
  → NEVER writes back to Hyper-Vibe
```

**V2.4 is read-only for pets. Always.**

---

## 💰 Token Economy for Pets

Uses EXISTING `award_tokens()` and `spend_tokens()` — don't rebuild these.

| Action | Tokens |
|--------|--------|
| Mint a pet | `spend_tokens(500)` |
| Feed streak | `award_tokens(50)` |
| Play game win | `award_tokens(score)` |
| Evolution milestone | `award_tokens(200)` |

---

## 🤖 Phase 6 — LLM Pet Chat

**Only add a new container when you actually need this.**

- Reuse existing Ollama container from V2.4 on `agents-net`
- Model: `qwen2.5:7b` (already pulled)
- Prompt injection guard: 15+ pattern blocklist (already in `agent.py`)
- `AGENT_ROLE` on `EEPVengers.sol` — use it, don't modify the contract

```python
# agents/broski-pets/agent.py — mounts from BROskiPets-LLM-dNFT repo
# docker-compose.agents.yml — add broski-pets service here only when ready
```

---

## ⛓️ Phase 1 — Base Sepolia Redeploy (When Ready)

```bash
# In BROskiPets-LLM-dNFT/contracts/
# Update foundry.toml to point at Base Sepolia
# Then:
forge script script/Deploy.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $DEPLOYER_KEY \
  --broadcast

# Update .env:
# CONTRACT_ADDRESS=<new Base Sepolia address>
# Archive the old Ethereum Sepolia address in comments
```

---

## 🧠 Notes for Future Lyndz

- **MERGE_ROADMAP.md rule**: repos stay separate, loosely coupled via API contracts
- **pet_mirror is a cache** — if it drifts, re-sync from Hyper-Vibe. It's not the truth.
- **LLM chat is Phase 6** — don't add the container until Phases 0–3 are solid
- **Redis DB 3 doesn't exist** — any plan that mentions it is wrong. Bin it.
- **Port 8082 doesn't exist** — broski-pets uses Ollama on agents-net, no new port

---

*Parked May 9, 2026 — built by @welshDog 🏴󠁧󠁢󠁷󠁬󠁳󠁿🐶♾️*
