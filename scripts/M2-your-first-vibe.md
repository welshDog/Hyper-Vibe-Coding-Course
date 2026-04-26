# 🌱 Your First Vibe

**Module:** M2 | **Level:** Beginner | **XP:** 50 | **Coins:** 20 BROski$

> The biggest win in coding is getting your first thing RUNNING. Not perfect. RUNNING. This module gets your entire AI empire alive in one session.

---

## 🎯 What You'll Learn

- Install Docker Desktop and understand why it's the engine of everything
- Clone the HyperCode V2.4 repository
- Configure your `.env` file with API keys and secrets
- Run `docker compose up -d` and launch 32 containers simultaneously
- Verify Mission Control, BROski Terminal, and core agent interfaces are live

---

## 🧠 The Big Idea

Think of Docker as a **shipping container for software**. Your entire AI empire — 32 services, databases, AI agents, dashboards — lives inside one repo. One command boots the whole thing.

**The pattern:** `docker compose up -d` = flip the power switch on your empire.

When the Docker whale icon is running in your taskbar, your mission begins. When it's sleeping, nothing works. Simple.

---

## 🛠️ What You're Launching

| Service | Port | What it is |
|---------|------|------------|
| Mission Control | 8088 | Your main dashboard |
| BROski Terminal | 3000 | AI chat interface |
| FastAPI Core | 8000 | Brain of the operation |
| Supabase (local) | 54321 | Your database |
| Grafana | 3001 | System health monitor |

---

## ⚡ Step-by-Step

### Step 1 — Install Docker Desktop
Download from [docker.com](https://docker.com/products/docker-desktop). Install. Restart your machine.
Check the whale icon appears in your taskbar — that's your engine running.

### Step 2 — Clone the Repo
```bash
git clone https://github.com/welshDog/HyperCode-V2.4.git
cd HyperCode-V2.4
```

### Step 3 — Set Up Your .env
```bash
cp .env.example .env
```
Open `.env` and fill in your API keys. **Never share this file. Never commit it.**

### Step 4 — Boot the Empire
```bash
docker compose up -d
```
This pulls images and starts all containers. First run takes ~5 minutes. After that, it's instant.

### Step 5 — Verify It's Alive
Open your browser:
- [http://localhost:8088](http://localhost:8088) → Mission Control should load
- [http://localhost:3000](http://localhost:3000) → BROski Terminal
- [http://localhost:8000/docs](http://localhost:8000/docs) → FastAPI Swagger

---

## 🌟 The Neurodivergent Edge

Traditional dev setup: install this, then that, then configure this, then debug that = **instruction freeze**.

HyperCode setup: one repo, one file to fill in, one command = **immediate win**.

The dopamine hit of seeing Mission Control load for the first time? **That's intentional.** That's the first BROski$ reward.

---

## ✨ Practical Task

Run `docker compose up -d` and verify Mission Control loads at `http://localhost:8088`.

**When that page loads — you are officially a HyperCode operator.** 🚀

---

## 📊 XP Check

- [ ] Docker Desktop installed + whale icon running
- [ ] Repo cloned
- [ ] `.env` configured
- [ ] `docker compose up -d` ran successfully
- [ ] Mission Control visible at localhost:8088

**Complete all 5 → Claim your 50 XP + 20 BROski$ 🤑**
