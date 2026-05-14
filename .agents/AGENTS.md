# 🧠 AGENTS.md — Hyper-Vibe-Coding-Course

> **Dream it. Vibe it. Build it. HYPERFOCUS z0ne ♾️**

---

## 🗺️ What is this repo?

**Hyper-Vibe-Coding-Course** is the course frontend for the Hyperfocus z0ne ecosystem.

- Students learn, earn XP, and collect BROski$ here.
- Stripe powers course purchases and access unlocks.
- Progress feeds into BROskiPets-LLM-dNFT for pet unlocks.
- Relay minting routes through HyperCode-V2.4 edge functions.

---

## 🏗️ Ecosystem Architecture

```
HyperCode-V2.4 (backend / wallet authority)
    ↕
Hyper-Vibe-Coding-Course (frontend / earns XP + BROski$) ⬅️ YOU ARE HERE
    ↕
BROskiPets-LLM-dNFT (reads progress → unlocks pets / Web3 minting)
    ↕
HyperAgent-SDK (shared agent interface / write once deploy anywhere)
    ↕
BROski-Obsidian-Brain (meta-layer / living knowledge vault)
```

---

## 🎯 Current Sprint (May 2026)

1. Set `VITE_MINT_VIA_RELAY=true` on Vercel → Phase 2A live
2. E2E tests: BROskiPets minting (Base Sepolia) + Stripe Checkout
3. Invite first real students

---

## 🛠️ Skills Available (Antigravity)

| Skill | Location | Purpose |
|-------|----------|---------|
| `mint-via-relay` | `.agents/skills/mint-via-relay/` | Enable + validate Phase 2A relay minting flag |
| `e2e-broskipets` | `.agents/skills/e2e-broskipets/` | Run E2E tests for mint flow + Stripe checkout |
| `supabase` | `.agents/skills/supabase/` | Supabase workflows (Auth, DB, Edge Functions, CLI) |
| `supabase-postgres-best-practices` | `.agents/skills/supabase-postgres-best-practices/` | Postgres performance + RLS best practices |

> Add new skills to `.agents/skills/<skill-name>/SKILL.md`

---

## 🔧 Tools & Connections

- **Vercel** — Frontend hosting + env var management
- **Stripe** — Payments + webhooks for course access
- **Supabase** — DB, Auth, course access grants
- **Base Sepolia** — NFT mint relay target
- **HyperCode-V2.4** — Provides `mint-pet-confirm` edge function
- **HyperAgent-SDK** — Shared agent interfaces
- **GitHub Actions** — CI/CD pipeline

---

## 📜 Sacred Rules (never break these)

- Short sentences. No walls of text.
- **Bold key info** where it adds clarity.
- PowerShell first for all commands.
- Bullet points over paragraphs.
- Never debate the sacred rules.

---

## 🏆 Major Wins So Far

- Stripe LIVE ✅
- Course frontend deployed ✅
- XP + BROski$ earning system built ✅
- Relay minting skill ready ✅
- E2E test skill ready ✅

---

## 🚀 How to Boot Into Hyperfocus Mode

1. Read `CLAUDE.md` — master brain, sacred rules, architecture.
2. Read `CLAUDE_CONTEXT.md` — current context snapshot.
3. Read `WHATS_DONE.md` — latest wins and sprint state.
4. Check `.agents/skills/` — available skills for this repo.
5. Ask: **"What are we shipping first today?"**

---

*Built with ADHD superpowers by Lyndz @ Hyperfocus Zone, S.Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿♾️*
