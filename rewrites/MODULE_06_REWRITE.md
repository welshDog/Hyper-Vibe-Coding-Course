# 🚀 MODULE 6 — Give Your Agent a Passport
> **Rewrite v1 — May 16, 2026**
> Status: 🟡 Draft — ready for review
> Original: "Agent Architecture & Manifests"
> Rewrite goal: Clean M5→M6 bridge. manifest.json plain English FIRST. Deploy anywhere framing.

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Understood what a manifest.json actually IS in plain English
- ✅ Written your first agent manifest from scratch
- ✅ Validated it with the HyperAgent CLI
- ✅ Attached a tool plugin to give your agent real-world powers
- ✅ An agent that can deploy anywhere — Discord, production, anywhere

**Time:** 30–35 minutes
**Vibe:** M5 = meet your crew. M6 = give them ID cards and superpowers. 🆔

---

## 🌉 The Bridge From Module 5

In Module 5 you met your agent crew — Agent X, the Orchestrator, the Healer.

They're alive. They're running. They're watching your empire.

But there's one problem:

> **Right now your agents only work on YOUR machine, in YOUR environment.**
> Move them somewhere else — a different server, a Discord bot, a production backend — and they break.
> They don't know where they are. They don't have an identity.

Module 6 fixes that with one file: **`manifest.json`**

```
M5 = Meet your agents         (local, alive, working)
M6 = Give them an identity    (portable, validated, deployable anywhere)
```

> 🧠 **One sentence:** The manifest.json is your agent's CV, passport, and instruction manual — all in one file.

---

## 📰 What IS a manifest.json? (Plain English First)

Forget the word "manifest" for a second.

Think about what happens when you hire someone for a job:
- You give them a **job description** (what they do)
- You give them a **list of tools** they're allowed to use
- You give them a **desk** (where their memory lives)
- You give them a **name badge** (so the system recognises them)

The `manifest.json` does ALL of that for your agent:

```json
{
  "name": "agent-x",               // Name badge 🏷️
  "version": "1.0.0",              // Which version of this agent
  "description": "Meta-Architect agent that designs and deploys other agents",
  "entry_point": "agents/agent_x.py", // Where to find it
  "memory": {
    "backend": "redis",            // Where it stores its memory
    "namespace": "agent-x"
  },
  "tools": [                       // What tools it can use
    "code_generator",
    "web_search",
    "file_writer"
  ],
  "environment": [
    "OPENAI_API_KEY",              // What env vars it needs
    "REDIS_URL"
  ]
}
```

> 💬 **Plain English:** This file is how the system knows what your agent is, what it can do, where it lives, and what it needs to run — on ANY machine, anywhere in the world.

---

## 🛠️ Step 1 — Create Your First Manifest

> ⏱️ **Time: 8 minutes**

Create a new file in your project:
```bash
mkdir -p agents/agent-x
touch agents/agent-x/manifest.json
```

Paste this in:
```json
{
  "name": "agent-x",
  "version": "1.0.0",
  "description": "My Meta-Architect agent — designs and deploys specialist agents",
  "entry_point": "agents/agent_x.py",
  "memory": {
    "backend": "redis",
    "namespace": "agent-x-memory"
  },
  "tools": [
    "code_generator",
    "web_search",
    "file_writer"
  ],
  "environment": [
    "OPENAI_API_KEY",
    "REDIS_URL",
    "DATABASE_URL"
  ],
  "health_check": "http://localhost:8001/health",
  "auto_recover": true
}
```

Save the file. ✅

> 🧠 **What `auto_recover: true` does:** If this agent crashes, the Healer from M5 will automatically try to restart it. Your manifest and your monitoring are now connected.

---

## ✅ Step 2 — Validate It With the CLI

> ⏱️ **Time: 5 minutes**

This is where we find out if we wrote it correctly. No guessing.

```bash
# Install HyperAgent CLI if you haven't already
npm install -g @w3lshdog/hyper-agent

# Validate your manifest
hyper-agent validate agents/agent-x/manifest.json
```

**If it's correct you'll see:**
```
✅ manifest.json is valid
✅ entry_point found: agents/agent_x.py
✅ memory backend: redis — connection verified
✅ tools: all 3 registered
✅ environment variables: all present in .env
🎉 Agent X is ready to deploy anywhere!
```

**If something's wrong you'll see exactly what to fix:**
```
❌ entry_point not found: agents/agent_x.py
🔧 Fix: Make sure the file exists at that path
```

> 🧠 **Plain English:** The CLI reads your manifest and checks every single thing before you deploy. Like a pre-flight checklist on an aeroplane — you don't take off until everything is green.

---

## 🔒 Step 3 — Run in Strict Mode

> ⏱️ **Time: 3 minutes**

Strict mode runs deeper checks — it's what you use before pushing to production:

```bash
hyper-agent validate agents/agent-x/manifest.json --strict
```

Strict mode additionally checks:
- ✅ All environment variables have actual values (not empty strings)
- ✅ Memory backend is reachable
- ✅ Health check endpoint is responding
- ✅ No conflicting tool names

```
🔒 STRICT MODE PASSED
Your agent is production-ready.
```

> 💬 **This is the difference between "it works on my machine" and "it works everywhere."**
> Strict mode is your quality gate. Run it every time before you deploy.

---

## 💪 Step 4 — Attach a Tool Plugin

> ⏱️ **Time: 8 minutes**

Right now your agent can think. Let's give it the ability to search the web.

Add the web search plugin:
```bash
hyper-agent plugin add web_search --agent agents/agent-x/manifest.json
```

This updates your manifest automatically:
```json
"tools": [
  "code_generator",
  "web_search",     // ✅ already there
  "file_writer",
  "web_search_live"  // ✅ just added — real-time web access
]
```

Test it:
```bash
curl -X POST http://localhost:8001/agent/tool \
  -H "Content-Type: application/json" \
  -d '{"tool": "web_search_live", "query": "latest FastAPI version"}'
```

Returns:
```json
{
  "result": "FastAPI latest stable version is 0.115.x",
  "source": "fastapi.tiangolo.com",
  "agent": "agent-x",
  "tool_used": "web_search_live"
}
```

> 🔥 **Your agent just searched the internet.**
> It used a tool. It returned a real answer. It cited its source.
> That's not a chatbot. That's an autonomous agent with real-world powers.

---

## 🌍 Step 5 — Deploy Anywhere (The Payoff)

> ⏱️ **Time: 3 minutes**

Now your manifest is validated, your agent can deploy to ANY environment:

```bash
# Deploy to local Docker (what you've been using)
hyper-agent deploy agents/agent-x/manifest.json --env local

# Deploy to production server
hyper-agent deploy agents/agent-x/manifest.json --env production

# Deploy as a Discord bot
hyper-agent deploy agents/agent-x/manifest.json --env discord
```

Same manifest. Same agent. Different environments. **Zero rewriting.**

> 🎯 **That's the "Write Once, Deploy Anywhere" standard.**
> Your agent has an identity now. It travels with you.

---

## 🏆 Your Win Moment

| What the tech says | What actually happened |
|---|---|
| "manifest.json valid" | Your agent has a proper identity card |
| "Strict mode passed" | It's production-ready, not just "works on my machine" |
| "Plugin attached" | Your agent has real-world superpowers |
| "Deploy anywhere" | Your creation is now portable — it goes where you go |

> 🔥 **You just graduated from "Vibe Coder" to "Agent Architect."**
> Your agents have identities, tools, and the ability to deploy anywhere.
> That's a professional-grade standard. Owned by you.

---

## 🛑 Something Went Wrong?

**Problem: `entry_point not found` error**
```bash
# Check the file actually exists
ls agents/agent_x.py
# If not, check your path spelling in manifest.json
```

**Problem: `memory backend not reachable`**
```bash
# Make sure Redis is running
docker-compose ps | grep redis
# If not:
docker-compose restart redis
```

**Problem: `plugin add` command not found**
```bash
# Update HyperAgent CLI
npm update -g @w3lshdog/hyper-agent
```

> 💬 **Still stuck?** Post in `#agent-help` on Discord. Tag it "M6 issue".

---

## ✅ Module 6 Complete Checklist

- [ ] manifest.json created for Agent X
- [ ] `hyper-agent validate` returned all green
- [ ] `--strict` mode passed
- [ ] Web search plugin attached and tested
- [ ] Agent successfully deployed with `--env local`
- [ ] 🪙 **+300 BROski$ claimed — "Agent Architect" Level 3 badge** 🆔

---

## 🔮 What's Next — Module 7

Your agents have identities, tools, and sovereignty.

But there's one threat we haven't talked about yet — **what happens when someone tries to trick your agent into doing something it shouldn't?**

Module 7 is about prompt injection — the con artist attack — and how VenomEep stops it cold.

**Time to put the armour on your agent's brain.** 🛡️

---

> 📝 *Rewrite notes: Added explicit M5→M6 bridge ("M5 = meet agents, M6 = give them identity"). Replaced "manifest" jargon with job description/passport analogy before showing any code. Added line-by-line plain English comments inside the JSON. Made strict mode feel like a quality gate not a scary thing. Added "deploy anywhere" as the emotional payoff moment. Warm bridge to M7 prompt injection.*
