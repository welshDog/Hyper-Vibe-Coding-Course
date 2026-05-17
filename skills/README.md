# 🧠 AI Skills — Hyper-Vibe Coding Course

> These SKILL.md files give any AI partner (Perplexity, Claude, Cursor, ChatGPT) structured, step-by-step instructions for key platform tasks.
> Built by @welshDog — May 17, 2026

---

## 📦 Available Skills

| Skill | Purpose | Triggers |
|---|---|---|
| [`vercel-deploy`](./vercel-deploy/SKILL.md) | Deploy, preview, rollback, env var sync on Vercel | "deploy", "is it live", "rollback", "preview" |
| [`stripe-billing`](./stripe-billing/SKILL.md) | Products, pricing, payment links, webhooks, refunds | "stripe", "payment", "checkout", "token pack" |
| [`railway-deploy`](./railway-deploy/SKILL.md) | Backend service deploys, logs, env vars, scaling | "railway", "deploy backend", "service down" |
| [`shop-ops`](./shop-ops/SKILL.md) | Token packs, shop page, fulfilment, QA, refunds | "shop", "add product", "token balance" |

---

## 🔧 How to Use

1. An AI partner reads the relevant `SKILL.md` before starting a task
2. It follows the step-by-step workflow
3. It checks the guardrails before taking any action
4. It confirms success using the success checklist at the bottom
5. It pushes all changes to GitHub before marking anything as done

---

## 📐 Skill File Structure

Every `SKILL.md` follows this format:

```
---
YAML frontmatter (name, triggers, metadata)
---

# Purpose
# When to Use
# Step-by-Step Workflow
# Guardrails
# Success Checks
# Key Links
```

---

## ➕ Adding a New Skill

1. Create a new folder under `skills/`
2. Add a `SKILL.md` following the structure above
3. Add it to the table in this README
4. Tell Lyndz what the trigger phrases are

---

> 🐶♾️ Built by @welshDog + Perplexity AI — May 17, 2026
> "Stop apologising for your brain. Start building."
