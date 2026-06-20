# 🏗️ Build Your First App

**Module:** M4 | **Level:** Beginner | **XP:** 40 | **Coins:** 15 BROski$

> You've got the engine running and you know how to talk to it. Now let's BUILD something real. A working app. Your app. Shipped.

---

## 🎯 What You'll Learn

- Use the Natural Language → AI Code → Shipped workflow to build a full feature
- Build a Next.js frontend component connected to a FastAPI endpoint
- Use fast feedback loops: generate → test → iterate in under 5 minutes
- Earn your first "constant small win" — a working, interactive UI
- Understand why building is the best way to learn for neurodivergent minds

---

## 🧠 The Big Idea

You're not here to read about building. You're here to BUILD.

**The fast feedback loop:**
```
Describe feature → AI generates code → Paste + test locally → Works? Ship it. Broken? Fix prompt → repeat.
```

Typical loop time: **under 5 minutes per feature**. That's not an exaggeration.

**The pattern:** Next.js = your face. FastAPI = your brain. Together they talk via HTTP requests.

---

## 🛠️ The Stack You're Using

| Layer | Tool | Port |
|-------|------|------|
| Frontend | Next.js | 3000 |
| Backend | FastAPI | 8000 |
| Database | Supabase | 54321 |
| AI | Claude via MCP | 8001 |

---

## ⚡ Step-by-Step: Build a Task Widget

### Step 1 — Create the FastAPI endpoint
Prompt:
```
Create a FastAPI endpoint POST /tasks that accepts { title: string } 
and returns { id: uuid, title: string, created_at: datetime }.
No auth needed. Just the endpoint.
```

### Step 2 — Create the Next.js component
Prompt:
```
Create a React component <TaskWidget /> that:
- Has a text input and a submit button
- On submit, POST to http://localhost:8000/tasks
- Shows the returned task in a list below
- Uses Tailwind CSS
- Shows a loading state while the request runs
```

### Step 3 — Wire them together
Drop the component into your Next.js app (`app/page.tsx`). Run both services. Click the button.

### Step 4 — Celebrate
You just built a full-stack feature. Frontend talks to backend. Data flows both ways.
**That's the pattern. Now you can build ANYTHING.**

---

## 🌟 The Neurodivergent Edge

Building a working app is a **major milestone** for neurodivergent learners because:
- It provides the **constant small wins** needed to maintain hyperfocus
- It proves your brain IS capable (because it just built something real)
- It creates a **tangible reference point** — you can see it, touch it, show it

---

## ✨ Practical Task

Use the Natural Language → AI Code workflow to generate a simple "Hello World" button that changes colour when clicked.

Then extend it: make the button call your FastAPI endpoint and display the response.

---

## 📊 XP Check

- [ ] FastAPI endpoint created and returning data
- [ ] Next.js component built and rendering
- [ ] Frontend and backend connected (HTTP request flows)
- [ ] Full feature built using AI prompts, not manual code

**Complete all 4 → Claim your 40 XP + 15 BROski$ 🤑**
