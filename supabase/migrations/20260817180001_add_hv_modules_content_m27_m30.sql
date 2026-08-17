-- Batch 3 (final) content for the M21-M30 expansion. Must run after
-- 20260817180000_seed_hv_modules_m27_m30.sql.

-- M27-building-a-living-dashboard
update public.hv_modules
   set content = $modmd$# 📊 Building a Living Dashboard

**Module:** M27 | **Level:** Hyper-Pro | **XP:** 220 | **Coins:** 115 BROski$

> M18 taught you to build a personal workflow view. This module takes that same instinct to product scale — a real dashboard other people can rely on, backed by a real multi-table join, not a single source dump.

---

## 🎯 What You'll Learn

- The sharpened difference between a personal view (M18) and a product-scale dashboard
- How to write a real aggregation query joining 2+ tables (a DB view or RPC)
- How to pick the one question a dashboard should actually answer
- How to avoid the "kitchen sink" dashboard that answers nothing well
- Why a dashboard serving other people carries different stakes than a personal one

---

## 🧠 The Big Idea

M18's Personal Dev Dashboard answered questions for you alone, on your own terms. This module scales that instinct to "what does someone else need to know at a glance" — answered by one real join across real tables, not five disconnected widgets bolted together. A dashboard that tries to answer everything ends up answering nothing clearly.

---

## 🛠️ Personal vs. Product-Scale

| Layer | Personal (M18) | Product-scale (this module) |
|---|---|---|
| Data source | One tool's local state | A real DB view/RPC joining 2+ tables |
| Audience | Just you | Someone else, relying on it |
| Question answered | Whatever's convenient | One specific question, chosen on purpose |

---

## ⚡ Step-by-Step

### Step 1 — Pick the one question
Before any query, write down exactly what question this screen answers. If you can't state it in one sentence, it's not scoped yet.

### Step 2 — Identify the 2+ tables
Name the real tables/sources that together answer it. A dashboard backed by one table is usually just a list view wearing a dashboard's clothes.

### Step 3 — Write the real join
A DB view or RPC (the same pattern this course's own `hv_modules` + `hv_quizzes` join uses to grade you) that actually joins them server-side — don't fetch two datasets and glue them together in the frontend.

### Step 4 — Build exactly one screen
Render the join's result. Resist adding a second question's worth of widgets.

### Step 5 — Hand it to someone else
Show it to a real person who isn't you and confirm they can answer the one question from it, unassisted.

---

## 🌟 The Neurodivergent Edge

- **One question per screen is the same "no scope creep" discipline as every practical task** — applied to product design instead of code.
- **A server-side join is externalized correctness** — you're not trusting the frontend to glue two truths together consistently every time.
- **Building for someone else forces the "does this make sense to a stranger" pass** a personal dashboard lets you skip.

---

## ✨ Practical Task

Ship one dashboard screen that answers one specific question, backed by a real database view or RPC joining at least two tables. Confirm a real person who isn't you can answer that question from it unassisted.

---

## 📊 XP Check

- [ ] The one question this screen answers is written down in one sentence
- [ ] Backed by a real join (DB view/RPC) across 2+ tables, not frontend-glued data
- [ ] Exactly one screen shipped, no scope creep into a second question
- [ ] A real person who isn't you confirmed they could answer the question from it

**Complete all 4 → Claim your 220 XP + 115 BROski$ 🤑**
$modmd$,
       content_hash = '26e5cef02ecc6aa48d36c9daedfe6144',
       updated_at = now()
 where slug = 'building-a-living-dashboard';

-- M28-on-chain-basics-for-builders
update public.hv_modules
   set content = $modmd$# ⛓️ On-Chain Basics for Builders

**Module:** M28 | **Level:** Hyper-Pro | **XP:** 230 | **Coins:** 120 BROski$

> Enough real Web3 literacy to understand what a BROskiPet dNFT actually is — no hype, just minting, metadata, and the on-chain/off-chain split, using this ecosystem's real pet-evolution model as the worked case study.

---

## 🎯 What You'll Learn

- What minting actually does at the contract level
- The difference between on-chain state and off-chain metadata, and why almost everything lives off-chain
- How a metadata schema is structured (name, image, attributes)
- How BROskiPets' real evolution model splits on-chain ownership from off-chain game state
- Why "it's on the blockchain" doesn't mean "everything about it is on the blockchain"

---

## 🧠 The Big Idea

A dNFT's image, level, and stats almost never live on-chain — token ID and owner do. Everything else is metadata, referenced by a URI, usually stored off-chain. Understanding that split is most of understanding Web3 at all — once you see it, "the blockchain" stops feeling like magic and starts feeling like a specific, small piece of a larger system.

---

## 🛠️ Where Things Actually Live

| Layer | Lives where | Example |
|---|---|---|
| Ownership (token ID → address) | On-chain | Wallet address holds token #4021 |
| Metadata (name/image/attributes) | Usually off-chain | JSON at a URI the token points to |
| Evolving game state (level/mood/care) | Off-chain, in this repo's real Supabase tables | A BROskiPet's live pet-state row |

---

## ⚡ Step-by-Step

### Step 1 — Trace a real mint
Follow one BROskiPet mint end-to-end conceptually: what transaction happens on-chain, what token ID gets assigned, what address becomes the owner.

### Step 2 — Find where the metadata actually lives
Identify the URI a token points to and what's actually inside it (name, image, attributes array).

### Step 3 — Separate on-chain from off-chain
For BROskiPets specifically, write down which fields are on-chain (ownership) vs. off-chain (evolution state, mood, care stats).

### Step 4 — Design a metadata schema
For a toy dNFT idea of your own, write the JSON shape: name, image, attributes — matching the standard shape real marketplaces expect.

### Step 5 — Explain the split to someone else
In your own words, explain why a pet's level living off-chain doesn't make the pet "less real" — it's a design choice, not a shortcut.

---

## 🌟 The Neurodivergent Edge

- **The on-chain/off-chain split is a concrete mental model, not vague "blockchain magic"** — once you see it clearly, Web3 stops being mysterious.
- **Using this repo's own real BROskiPets as the case study** means you're learning from a system you can actually go look at, not a hypothetical.
- **Designing a metadata schema is the same "spec before you build" discipline as M26's reward ledger**, one level up.

---

## ✨ Practical Task

Trace a real BROskiPet mint end-to-end and write down which fields are on-chain vs. off-chain. Design a metadata schema (name/image/attributes) for a toy dNFT idea of your own.

---

## 📊 XP Check

- [ ] A real mint traced end-to-end, token ID and owner identified
- [ ] Metadata URI and its contents identified for a real token
- [ ] On-chain vs. off-chain fields written down explicitly for BROskiPets
- [ ] A toy metadata schema designed with name/image/attributes

**Complete all 4 → Claim your 230 XP + 120 BROski$ 🤑**
$modmd$,
       content_hash = '4858f4c70aa258c3e50bc102aeaf4811',
       updated_at = now()
 where slug = 'on-chain-basics-for-builders';

-- M29-safe-web3-integration-patterns
update public.hv_modules
   set content = $modmd$# 🔐 Safe Web3 Integration Patterns

**Module:** M29 | **Level:** Hyper-Pro | **XP:** 240 | **Coins:** 125 BROski$

> This repo has a real sacred rule: wagmi/rainbowkit lazy-loaded, /pets-only, never global. This module teaches you why that rule exists and how to apply it yourself — adding Web3 features without taxing every non-Web3 user for it.

---

## 🎯 What You'll Learn

- Why a global Web3 provider silently costs every visitor, even ones who never touch a wallet
- What a lazy-loading boundary actually does to a bundle
- How this repo's own real isolation rule (wagmi/rainbowkit, /pets-only) implements that principle
- How to verify the cost is actually zero for non-Web3 users, not just assume it
- Why this is a direct extension of M22's "bounded blast radius" applied to bundle size instead of file access

---

## 🧠 The Big Idea

Every Web3 library you import globally ships to every visitor, whether they ever connect a wallet or not — slower loads, bigger bundles, for a feature most users never touch. The fix isn't "don't use Web3," it's the same boundary discipline as everywhere else in this course: scope the blast radius, this time to a route.

---

## 🛠️ Import Patterns

| Pattern | What it does | Where this repo uses it |
|---|---|---|
| Global import | Ships to every page, every user | Never — explicitly forbidden by this repo's rules |
| Route-scoped lazy import | Only loads when that route is visited | wagmi/rainbowkit, `/pets` only |
| Bundle verification | Proves the cost is actually zero elsewhere | Network tab / bundle check on a non-`/pets` route |

---

## ⚡ Step-by-Step

### Step 1 — Pick a toy Web3 feature
Something small (a "connect wallet" button is enough) for a toy app or route of your choosing.

### Step 2 — Wrap it in a lazy boundary
Use your framework's lazy-loading/code-splitting mechanism so the Web3 library only loads on the route that needs it.

### Step 3 — Check a non-Web3 route's bundle
Open the network tab on a route that never touches Web3 and confirm the Web3 library isn't in what loaded.

### Step 4 — Check the Web3 route's bundle
Confirm it does load there, on demand, when that route is actually visited.

### Step 5 — Compare against this repo's real pattern
Look at how wagmi/rainbowkit are wired to `/pets` only in this codebase and confirm your toy version follows the same shape.

---

## 🌟 The Neurodivergent Edge

- **A lazy boundary is a blast-radius limit for bundle size** — same shape as M22's file-access boundary, different resource.
- **Verifying via the network tab beats trusting "it should be fine"** — same evidence-over-assumption habit as every module since M23.
- **Protecting non-Web3 users' load time by default** means you're not silently taxing people who never opted into the feature.

---

## ✨ Practical Task

Wrap a toy Web3 feature in a lazy-loading boundary. Prove via the network tab that a non-Web3 route pays zero bundle cost for it, and that the Web3 route loads it on demand.

---

## 📊 XP Check

- [ ] A toy Web3 feature built and wrapped in a lazy boundary
- [ ] Network tab confirms a non-Web3 route loads zero Web3 code
- [ ] Network tab confirms the Web3 route loads it on demand
- [ ] Compared against this repo's real wagmi/rainbowkit `/pets`-only pattern

**Complete all 4 → Claim your 240 XP + 125 BROski$ 🤑**
$modmd$,
       content_hash = '3bd8a6663ca8ca51618e60f87ff5109e',
       updated_at = now()
 where slug = 'safe-web3-integration-patterns';

-- M30-launch-day-ship-your-empire (capstone)
update public.hv_modules
   set content = $modmd$# 🎓 Launch Day: Ship Your Empire

**Module:** M30 | **Level:** Elite | **XP:** 280 | **Coins:** 160 BROski$

> M11 and M12 were the capstone for your first 12 modules. This is the capstone for all thirty. Bring every skill from M13-M29 together — Vibe Loop discipline, a Project Dossier, an approval gate, an observability dashboard, an incident runbook ready — and ship something real, publicly, today.

---

## 🎯 What You'll Learn

- How to fuse 17 modules' worth of separate skills into one real shipped artifact
- What "ready to launch" actually means beyond "the code works"
- How to write a graduation contribution post in M12's spirit, but for the full course
- Why a public artifact (a URL, a repo, a share) is the only real proof of "done"
- What you now have that you didn't at M12: crews, guardrails, logs, metrics, incident readiness, a reward economy, a dashboard, Web3 literacy

---

## 🧠 The Big Idea

Every module since M13 taught you one real capability. This capstone doesn't teach a new one — it makes you actually use the ones you have, together, on one real thing you ship today. "Launch day" isn't a lesson, it's the moment all of it either holds up or it doesn't.

---

## 🛠️ What You're Bringing

| Bring from | What it proves |
|---|---|
| M19 Vibe Loop | You worked in scoped, checkpointed passes, not one giant push |
| M22 Approval Gates | Nothing shipped without you actually reviewing the diff |
| M24 Observability | You have a dashboard that would tell you if this breaks |
| M25 Incident Runbook | You have a written plan for when — not if — something goes wrong |

---

## ⚡ Step-by-Step

### Step 1 — Pick the real thing you're shipping
A real feature, tool, or small app — something with a genuine "done" state, not open-ended.

### Step 2 — Write a Project Dossier for it
Same shape as M19's Mini-PRD: goal, non-goals, done means, files allowed.

### Step 3 — Build it with an approval gate live
Every write action gets a diff you actually review before it applies — M22's discipline, for real this time.

### Step 4 — Wire minimal observability
At least one real metric or log (M23/M24-scale, doesn't need to be elaborate) that would tell you if this breaks after launch.

### Step 5 — Write your incident runbook for it
A short M25-style plan: how you'd detect a problem, how you'd roll back.

### Step 6 — Ship it publicly and post your graduation contribution
A real, working URL, public repo, or public share — plus a short post in M12's spirit: what you built, what you learned across all 30 modules.

---

## 🌟 The Neurodivergent Edge

- **A capstone with a hard "ship publicly" requirement is an externally-verifiable finish line** — no ambiguity about whether you're actually done.
- **Reusing exact artifacts from earlier modules** (Dossier shape, runbook shape) means you're not inventing new formats under launch-day pressure.
- **Closing the loop from M12's contribution post to this one** gives you a real before/after of your own growth across the whole course.

---

## ✨ Practical Task

Ship one real thing publicly — a Project Dossier, an approval-gated build process, minimal observability, and a written incident runbook, all actually used, not just described. Post your graduation contribution.

---

## 📊 XP Check

- [ ] A real Project Dossier written before building
- [ ] Build happened behind a real approval gate (diffs reviewed before applying)
- [ ] At least one real metric or log wired for post-launch observability
- [ ] A written incident runbook exists for this specific thing
- [ ] Shipped publicly (real URL/repo/share) with a graduation contribution post

**Complete all 5 → Claim your 280 XP + 160 BROski$ 🤑🎓**
$modmd$,
       content_hash = '59b5cf27e2e8f2cd06e151fc4628f486',
       updated_at = now()
 where slug = 'launch-day-ship-your-empire';
