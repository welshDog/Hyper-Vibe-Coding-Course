# 🚀 Hyperfocus Zone x Vercel — "Build Real, Ship Safe" Course Module

> **Module:** Ship Safe — Secrets, Previews & Production  
> **Author:** @welshDog + Perplexity AI  
> **Date:** May 28, 2026  
> **Status:** Draft — tweak later  

---

## 🛑 STOP — What This Is

This is a real-world lesson on **how professional devs manage secrets, environments, and deployment safety on Vercel**.  
No fluff. No setup hell. You'll finish with a live project that handles secrets properly and ships confidently.

---

## 💡 WHY This Matters

Every leaked token = potential breach.  
Every wrong env var = broken production.  
Vercel's environment system is how teams ship features fast **without breaking live apps**.

---

## 📦 Module: "Ship Safe — Secrets, Previews & Production"

### 🔵 Lesson 1 — Environments 101

**Three lanes, three vibes:**

| Environment | What it is | Who sees it |
|---|---|---|
| **Local** | Your machine | Just you |
| **Preview** | Every git push / PR | Your team + testers |
| **Production** | Live to the world | Everyone |

⏱️ Time: **5 min read + 2 min hands-on**

**WIN:** You can name the 3 environments without looking at notes 🎯

---

### 🔵 Lesson 2 — Adding Secrets Safely

**CLI method (safest — token never in clipboard):**

```bash
vercel env add DISCORD_BOT_TOKEN production --sensitive
vercel env add DISCORD_BOT_TOKEN preview --sensitive
```

**Dashboard method:** Settings → Environment Variables → Toggle **Sensitive** → Save.

**Rules to never break:**
- Never use `NEXT_PUBLIC_` prefix on secrets (exposes to browser)
- Never `console.log(process.env)`
- Never commit `.env*` to git

⏱️ Time: **3 min**

**WIN:** `DISCORD_BOT_TOKEN` is live in production, sensitive-flagged, never visible again ✅

---

### 🔵 Lesson 3 — Pull Vars Locally

```bash
vercel env pull .env.local
```

One command. Pulls all env vars to your machine safely.  
`.env.local` is auto-gitignored. Nothing leaks.

⏱️ Time: **2 min**

**WIN:** Local dev works without touching production secrets 🔐

---

### 🔵 Lesson 4 — Preview vs Production Tokens

**Always use separate tokens per environment.**

| Token | Environment | Why |
|---|---|---|
| Real Discord bot token | Production | Live students |
| Test Discord bot token | Preview | PR testing, no real DMs |
| Real DB URL | Production | Live data |
| Staging DB URL | Preview | Safe to break |

⏱️ Time: **5 min**

**WIN:** Breaking a PR can't affect real students 🛡️

---

### 🔵 Lesson 5 — Secret Rotation (When Things Go Wrong)

**Order matters — don't skip steps:**

1. Generate **new** token from provider (Discord, etc.)
2. Update Vercel → Settings → Env Vars → Edit → paste new value
3. **Redeploy production**
4. Verify new deploy is live and working
5. **Only then** revoke the old token

⏱️ Time: **5 min**

**WIN:** You can rotate any secret without downtime 🔄

---

### 🟡 Lesson 6 — AI Gateway (Bonus / Advanced)

**One API key, 200+ models.**

```bash
vercel env add AI_GATEWAY_API_KEY production --sensitive
```

```typescript
// Auto-routed via AI SDK
const result = streamText({ model: 'anthropic/claude-opus-4.1', messages });
```

Use this when your app needs live AI model calls — chatbots, feedback generation, smart course hints.

⏱️ Time: **10 min**

**WIN:** Your app can call any AI model without managing multiple API keys 🤖

---

### 🟡 Lesson 7 — Observability (Know What's Happening)

**Two tools, two jobs:**

| Tool | What it shows |
|---|---|
| **Speed Insights** | Core Web Vitals — LCP, INP, CLS (real user data) |
| **Web Analytics** | Visitor counts, top pages, referrers (privacy-first, no cookies) |

Enable both in Vercel dashboard → Analytics tab → one click.

⏱️ Time: **5 min**

**WIN:** You can see real performance data from real students 📊

---

## 🏁 Module WIN Moment

> **"My project is live, secrets are locked, previews are safe, and I can see real performance data."**

That's the moment. Celebrate it.

---

## 🔜 Bridge to Next Module

Once you've shipped safe, the next level is **event sourcing + audit trails** — logging every action in Mission Control so nothing ever goes missing. That's `mc_events`.

---

## ✅ Hyperfocus Zone Checklist

- [ ] `DISCORD_BOT_TOKEN` set as Sensitive in Vercel Production
- [ ] Separate test token set for Preview
- [ ] `.env.local` pulled via CLI
- [ ] No secrets in git, no `NEXT_PUBLIC_` leaks
- [ ] Speed Insights + Web Analytics enabled
- [ ] AI Gateway added when model calls needed
- [ ] `mc_events` migration done

---

*🐶♾️ Built by @welshDog + Perplexity AI — May 28, 2026*  
*"Stop apologising for your brain. Start building."*
