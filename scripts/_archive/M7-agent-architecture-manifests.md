# 🛠️ Agent Architecture & Manifests

**Module:** M7 | **Level:** Advanced | **XP:** 70 | **Coins:** 25 BROski$

> Every agent in the HyperCode ecosystem is defined by a manifest. Learn to write them, read them, and use them to deploy agents like a pro.

---

## 🎯 What You'll Learn

- Understand the HyperAgent-SDK manifest format
- Write a complete `manifest.json` from scratch
- Define skills, MCP tools, triggers, and memory backends
- Register a new agent in the swarm using the manifest
- Move from single-agent to cluster deployment using `cluster.json`

---

## 🧠 The Big Idea

A **manifest** is a contract. It tells the swarm:
- What this agent does
- What tools it can call
- What triggers it
- Where it stores memory
- How to start, stop, and monitor it

**The pattern:** Manifest → SDK reads it → Agent spawns with correct wiring.

No manifest = no agent. Wrong manifest = broken agent. Correct manifest = agent that runs itself.

---

## 📄 Manifest Structure

```json
{
  "name": "my-agent",
  "version": "0.1.0",
  "description": "What this agent does in one sentence",
  "runtime": { "port": 8020, "timeout_ms": 30000 },
  "memory": { "backend": "supabase", "tables": ["agent_memory"] },
  "triggers": [
    { "type": "cron", "schedule": "0 * * * *", "skill": "hourly_job" },
    { "type": "webhook", "path": "/webhook/event", "skill": "handle_event" }
  ],
  "skills": [
    {
      "name": "hourly_job",
      "description": "Runs every hour",
      "input": {}
    }
  ],
  "mcp_tools": [],
  "env_required": ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
}
```

---

## ⚡ Step-by-Step

### Step 1 — Anatomy of a manifest
Read the `course-content-agent/manifest.json` we built. Understand every field.

### Step 2 — Write a manifest from scratch
Design a `notification-agent` that:
- Watches a Supabase table for changes
- Sends a Discord webhook when a row is inserted
- Runs on a cron every 10 minutes as a fallback

### Step 3 — Register in the swarm
```bash
npm run register-agent -- --manifest agents/notification-agent/manifest.json
```

### Step 4 — Cluster deployment
Create `cluster.json` referencing multiple agents:
```json
{
  "cluster": "hyper-vibe-course",
  "agents": [
    { "path": "agents/course-content-agent", "enabled": true },
    { "path": "agents/notification-agent", "enabled": true }
  ]
}
```

---

## 🌟 The Neurodivergent Edge

Manifests are **visual, structured, and pattern-based**. Once you understand the shape of one manifest, you understand ALL manifests. Your pattern brain will love this.

---

## ✨ Practical Task

Write a manifest for an agent that does something useful for YOUR workflow. It doesn't have to be complex — a Discord notifier, a daily task reminder, a file watcher. Write the manifest. Then implement one skill.

---

## 📊 XP Check

- [ ] Existing manifest fully understood (every field explained)
- [ ] New manifest written from scratch
- [ ] At least one skill implemented
- [ ] Agent registered in the swarm (or cluster.json created)

**Complete all 4 → Claim your 70 XP + 25 BROski$ 🤑**
