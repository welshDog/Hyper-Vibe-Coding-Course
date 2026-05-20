---
name: handover-writer
description: Auto-generates session handover docs in the established HFZ format. Never lose context between sessions.
triggers:
  - end session
  - session done
  - wrap up
  - handover
  - save progress
  - session snapshot
  - what did we do
  - write the handover
---

# 📝 handover-writer — Never Lose Context

> At the end of every session, generate a handover doc. Always.
> This is your brain's save file 💾 — especially important for ADHD flow.

---

## 📁 WHERE TO WRITE IT

```
rewrites/SESSION_SNAPSHOT_[YYYY-MM-DD].md
```

If a file for today already exists, UPDATE it (don't create a duplicate).

---

## 📋 THE HANDOVER TEMPLATE

```markdown
# Session Snapshot — [DATE]
> Last updated: [TIME] BST | welshDog 🐶♾️

---

## ✅ DONE THIS SESSION

- [Every task completed with commit SHA if pushed]
- [File paths changed]
- [Decisions made]

---

## 🔴 BLOCKED / NEEDS DECISION

- [Waiting on Lyndz's go-decision]
- [Technical blockers]

---

## 🟡 IN PROGRESS (not finished)

- [Started but not complete]
- [Current state of WIP]

---

## 🎯 NEXT SESSION — START HERE

**First task:** [ONE clear specific task — no ambiguity]
**Priority 2:** [Second task]
**Priority 3:** [Third task]

---

## 🔑 KEY DECISIONS MADE

- [Pricing, architecture, or business decisions locked in]
- [Anything Claude should NOT revisit without being asked]

---

## ⚠️ RISKS / WATCH OUT FOR

- [Technical debt flagged]
- [Any live risks on production]

---

## 📦 COMMITS THIS SESSION

| SHA (short) | Message | Status |
|---|---|---|
| [sha] | [message] | ✅ Pushed |

---

## 🧠 NOTEBOOKLM UPDATE

Paste these files into NotebookLM to update the course brain:
- [ ] rewrites/SESSION_SNAPSHOT_[DATE].md
- [ ] [any new module rewrites]
- [ ] [any updated business-brain files]

---

*Session by welshDog 🐶♾️ + Claude | Llanelli, Wales*
*"Stop apologising for your brain. Start building."*
```

---

## 🤖 CLAUDE BEHAVIOUR RULES

- ALWAYS offer to write this at session end — don't wait to be asked
- Pull actual commit SHAs from git log for accuracy
- "Next session first task" must be ONE specific thing — not vague
- If Lyndz goes quiet mid-session, gently check in: "Want me to write the handover in case you need a break?"
- After writing, remind what to paste into NotebookLM

---

*Part of the HFZ Claude Skill Pack | welshDog 🐶♾️*
