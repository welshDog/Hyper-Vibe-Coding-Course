# 🏗️ MODULE 3 — Build Your First App
> **XP: 200 | COINS: 40 BROski$ | LEVEL: Intermediate**
> **MISSION: Ship a working Next.js prototype with FastAPI backbone**

---

## 1️⃣ STOP — Plain English First

Right now, your prompts are brilliant. Your ideas are solid.

But they're still just... words in a chat box.

**Today we change that.**

By the end of this module, you'll have a real URL, running on your machine, with real data coming back at you. Not a tutorial. Not a screenshot. **Your actual app.**

> This is the moment you stop being a student and start being a **Producer.**

---

## 2️⃣ WHY This Is a Big Deal

Here's what you're about to build with:

- **Next.js** — the same frontend framework Netflix uses for their UI
- **FastAPI** — the same high-speed backend pattern Uber uses for route data

You're not learning toy tech. You're learning the real stack, in the simplest possible way.

For your brain specifically? This module is fuel.

> Constant small wins = sustained hyperfocus. Every tick on this checklist is a dopamine hit that keeps the engine running.

---

## 3️⃣ HOW — 3 Micro-Milestones

### ⏱️ Total time: ~30 minutes

We're doing this in 3 steps. **Only look at the current step. Cover the others if you need to.**

---

### 🟢 Milestone 1 — Backend ALIVE (10 mins)

Think of your backend as the **Kitchen** 🍳. It does the cooking. Nobody sees it, but everything depends on it.

1. Open `apps/api/main.py`
2. Add this endpoint:

```python
@app.get("/hello")
def hello():
    return {"message": "Your empire is alive 🔥"}
```

3. Visit `http://localhost:8000/hello` in your browser

**✅ WIN: You see your message in the browser.**

> Your server just responded. That's the same tech Netflix runs on.

---

### 🟡 Milestone 2 — Frontend Connected (10 mins)

Now the **Menu Board** 🍽️ — what your users actually see.

1. Open `frontend/app/page.tsx`
2. Add a fetch call to your Kitchen:

```typescript
const res = await fetch('http://localhost:8000/hello')
const data = await res.json()
```

3. Display `data.message` somewhere on the page

**✅ WIN: Your backend message appears on your Next.js screen.**

> The Waiter (your API) just delivered the food from the Kitchen to the Menu Board. Front meets back. That's full-stack.

---

### 🔵 Milestone 3 — Make It Yours (10 mins)

This is the one that makes it real.

1. Open `frontend/app/globals.css` — change the colours to yours
2. Go back to `page.tsx` — change the text to your name or vision
3. Show it to someone (or screenshot it for yourself)

**✅ WIN: It's yours. You're a builder now.**

---

## 🎉 WHAT JUST HAPPENED? — Plain English Breakdown

Pause here. Seriously. Let this land.

You just built a **full-stack web application.** Here's what that means in plain English:

| What you built | What it actually is | Real-world equivalent |
|---|---|---|
| `/hello` endpoint | A door your app can knock on | Spotify's "get me this song" request |
| FastAPI backend | The engine doing the work | Uber's route calculation server |
| Next.js frontend | The screen the user sees | Netflix's browse page |
| The `fetch()` call | Two parts of your app talking | Your phone pinging the weather API |

> **"Your server just responded. That's the same tech Netflix runs on."**

You didn't just follow a tutorial. You understood the *shape* of how the internet works — and then you built a tiny version of it. That's not beginner stuff. That's architecture thinking.

🧠 **Your pattern-first brain just did what it does best.** You saw the system. You built the system.

---

## 4️⃣ ND TIP — Pattern-First Building 🧱

If the code ever looks like a wall of text — stop. Don't read line by line. That's Instruction Freeze waiting to happen.

Instead, see the app as **LEGO bricks:**

```
🟦 Frontend  = The Menu Board  (what users see)
🟨 Backend   = The Kitchen     (where the work happens)
🟧 API       = The Waiter      (carries messages between them)
```

When you see the *shape* first, the technical details click into place naturally — no brain-fog required.

---

## 5️⃣ QUIZ — Lock In Your Coins 🪙

**Q1: What framework powers your frontend "Menu Board"?**
- A) WordPress
- B) ✅ **Next.js**
- C) jQuery
- D) Windows Media Player

**Q2: In the café metaphor, what does the API do?**
- A) Cooks the food
- B) Eats the food
- C) ✅ **Carries orders between Kitchen and Menu Board**
- D) Takes the money

**Q3: What is FastAPI's role in your stack?**
- A) Styling your buttons
- B) ✅ **High-speed backend — the Kitchen**
- C) Storing your images
- D) Running your tests

**Q4: Why are micro-milestones important for ND builders?**
- A) ✅ **Each small win = dopamine hit = sustained hyperfocus**
- B) To make the module feel shorter
- C) Because big milestones are too hard
- D) To prove you memorised the docs

---

## 6️⃣ NEXT — What's Coming

> **Module 4: 💳 Stripe — Getting Paid for What You Build**

Your app exists. Now let's make it earn.

Bridge moment:
> "M3 = build the app. M4 = connect the money. Same stack, new superpower."

You've got a working prototype. M4 takes that and adds a real payment flow — the same one indie developers use to make their first £1 online.

---

## 7️⃣ HELP — When Things Go Wrong

**Problem:** `localhost:8000/hello` shows nothing / connection refused
**Fix:** Make sure Docker is running. Check `docker-compose up` in your terminal. The Kitchen needs to be on before orders can come in.

**Problem:** Frontend shows blank page after adding fetch
**Fix:** Check the browser console (F12 → Console tab). Look for a red error. Paste it to AI with: *"Explain this error in plain English and tell me the single next step."*

**Problem:** The colours I changed aren't showing
**Fix:** Hard refresh — `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac). Sometimes the browser caches the old version.

> 🧠 Every error is just the app telling you what it needs. You speak the language now — you can answer back.

---

## 🎮 REWARD — Claim Your XP

```
🏅 BADGE UNLOCKED: First App Builder
⚡ +200 XP
💰 +40 BROski$ coins
🧠 SKILL UNLOCKED: Full-Stack Thinking — Kitchen / Waiter / Menu Board
```

> **"Stop apologising for your brain. Your ability to see patterns is exactly what built this app today."**

---

*Module 3 complete. You're a builder now. See you in M4 — let's get paid. 💳*

---
> 📝 Rewrite by: Perplexity AI + @welshDog — May 16, 2026
> Structure: STOP → WHY → HOW → WHAT JUST HAPPENED → WIN → NEXT → HELP → REWARD ✅
