# 🧠 MODULE 1 — Turn On Your AI Brain
> **Rewrite v1 — May 16, 2026**
> Status: 🟡 Draft — ready for review
> Original: "Launch the 32-Container Stack"
> Rewrite goal: Beginner-safe, dopamine-fuelled, ADHD-friendly first win

---

## 🎯 Module Goal

By the end of this module you will have:
- ✅ Turned on your AI Brain for the first time
- ✅ Seen it respond in your browser
- ✅ Earned your first BROski$ XP
- ✅ Proved to yourself that you can do this

**Time:** Under 10 minutes. No prior experience needed.

---

## 💡 Before We Start — What's Actually Happening?

Forget the word "containers" for now.

Think of it like this:

> 🏠 You're switching on a house.
> Each room has a job — one room handles your AI, one room stores your data, one room watches over everything and keeps it healthy.
> You don't need to build the house. It's already built.
> **You just need to flip the switch.**

That's it. One command turns everything on.

---

## 🚀 Step 1 — Make Sure You're Ready

You need three things:
- **Docker Desktop** running (the green icon in your taskbar)
- **A terminal** open (VS Code terminal is perfect)
- **Your project folder** cloned from GitHub

> 💬 **Not sure if Docker is running?**
> Look for the whale icon 🐳 in your taskbar/menu bar. If it's green — you're good.
> If not — open Docker Desktop and wait 30 seconds for it to start.

---

## ⚡ Step 2 — The One Command

Type this exactly. Then hit Enter.

```bash
docker-compose up -d
```

That's it. Seriously.

**What just happened?**
Docker read a blueprint file and started up your entire AI Brain in the background.
The `-d` means "detached" — it runs quietly so you can keep using your terminal.

> 🧠 **Plain English:** You just told your computer "wake up everything and run it quietly in the background." Done.

---

## 👀 Step 3 — Check Your Brain is Alive

Open your browser and go to:

```
http://localhost:3000
```

**You should see the HyperFocus Z0NE dashboard.**

If you see it — **your AI Brain is alive.** 🎉

> 🔥 **This is your first win. Seriously celebrate this.**
> Most developers have never built anything like what you just turned on.
> You did it in under 5 minutes.

---

## 🧪 Step 4 — Say Hello to Your Brain

In your terminal, type:

```bash
curl http://localhost:8000/health
```

You should get back something like:

```json
{"status": "healthy", "message": "BROski AI Brain is online 🧠"}
```

**Your FastAPI backend just talked back to you.** That's the engine that powers everything — the same kind of stack that runs Netflix and Uber Eats. You're running that now. On your own machine. Owned by you.

---

## 🏆 Step 5 — Your First BROski$ Reward

Head to the dashboard at `http://localhost:3000` and click **"Claim First Launch XP"**.

You just earned:
- 🪙 **+100 BROski$** — First Launch bonus
- ⭐ **"System Awakened" badge**
- 📈 **+1 Streak Day**

> 💬 Every time you do something in this course, the system rewards you.
> Small wins → momentum → big builds. That's the BROski way.

---

## 🛑 Something Went Wrong?

**Problem: Nothing shows at localhost:3000**

```bash
# Check if everything started
docker-compose ps

# Look for any containers that say "Exit" instead of "Up"
# Then restart just that one:
docker-compose restart [container-name]
```

**Problem: "Cannot connect to Docker"**
- Make sure Docker Desktop is fully started (green icon, not orange)
- Wait 30 seconds and try again

**Problem: Port already in use**
```bash
# Find what's using port 3000
lsof -i :3000   # Mac/Linux
netstat -ano | findstr :3000  # Windows
```

> 💬 **Still stuck?** Drop your error message in the Discord `#setup-help` channel.
> The BROski crew has seen every error. We've got you.

---

## ✅ Module 1 Complete — What You Just Did

Let's be real about what happened here:

| What the tech says | What actually happened |
|---|---|
| "docker-compose up -d" | You turned on your AI Brain |
| "32 services running" | Your personal AI empire is online |
| "localhost:3000 responding" | You own a production-grade system |
| "FastAPI health check passing" | Your backend is alive and talking |

**You didn't just run a command. You proved something to yourself.**

---

## 🔮 What's Next — Module 2

In Module 2 you learn the most powerful skill in this whole course:

> **How to talk to your AI Brain in plain English and make it build things for you.**

No memorising syntax. No Stack Overflow rabbit holes.
Just you, your brain, and natural language as code.

**See you there.** 🐶♾️

---

> 📝 *Rewrite notes: Replaced all "32-container" language with "AI Brain" metaphor throughout. Added plain-English explainers after every technical step. Added troubleshooting section. Added celebratory framing at the win moment. Kept all technical commands accurate — only the framing changed.*
