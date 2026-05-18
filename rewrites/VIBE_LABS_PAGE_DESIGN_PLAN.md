# 🎨 Vibe Coding Labs — Page Design Plan

## Overview
Five connected pages. One learning path. One brand.
Each page is a level in the Vibe Coding Labs series inside Hyperfocus z0ne.

---

## Brand Rules

- **Background:** Near-black (#0a0a0a)
- **Primary:** Purple (#7c3aed)
- **Accent:** Orange (#f97316)
- **Text:** White (#ffffff) and soft grey (#a1a1aa)
- **Font:** Inter or Geist — clean, modern, readable
- **Tone:** Friendly, casual, short sentences, lots of whitespace
- **Emojis:** Yes. Used as visual anchors, not decoration.

---

## Global Page Structure

Every page follows the same layout:

```
[HERO]          — Title + tagline + level badge
[PROGRESS BAR]  — Shows which level you're on (1–5)
[CONTENT]       — STOP / WHY / HOW / WIN / NEXT / HELP / REWARD
[REWARD CARD]   — XP + BROski$ + Badge
[NEXT PAGE CTA] — Big button to the next level
[FOOTER]        — Built by Lyndz + Perplexity ♾️
```

---

## Level Pages

### Level 1 — Claude Vibe Lab
- Hero colour: Purple gradient
- Badge: 🧠 Claude Vibe Lab
- CTA button: "Go to Level 2 → Google AI Studio"
- Key visual: VS Code + Claude chat side by side

### Level 2 — Google AI Studio Lab
- Hero colour: Blue to purple gradient
- Badge: 🚀 Google AI Studio Lab
- CTA button: "Go to Level 3 → Trae IDE"
- Key visual: AI Studio build mode screenshot

### Level 3 — Trae IDE + Agents Lab
- Hero colour: Orange to purple gradient
- Badge: 🤖 Trae IDE Lab
- CTA button: "Go to Level 4 → Big AI Comparisons"
- Key visual: Trae SOLO Mode with live browser preview

### Level 4 — Big AI Comparisons
- Hero colour: Dark gradient, stars
- Badge: ⚔️ Big AI Stack Master
- CTA button: "Go to Level 5 → Full Stack"
- Key visual: 3-column comparison card (Claude / AI Studio / Trae)

### Level 5 — Hyperfocus z0ne Full Stack
- Hero colour: Gold to purple gradient
- Badge: 🌟 Meta-Architect
- CTA button: "Enter Hyperfocus z0ne Full Course"
- Key visual: Deployed dashboard screenshot

---

## Shared Components

### Progress Bar
```
● ─── ● ─── ● ─── ● ─── ●
L1    L2    L3    L4    L5
```
Current level: purple. Completed levels: orange tick.

### Reward Card
```
┌─────────────────────────┐
│  🏅 Level Complete!      │
│  +100 XP   +50 BROski$  │
│  Badge: Claude Lab L1    │
│  [Claim Reward →]        │
└─────────────────────────┘
```

### Code Prompt Blocks
```
Background: #1a1a2e
Border: 1px solid #7c3aed
Font: JetBrains Mono or Fira Code
Copy button: top right corner
```

### CTA Button
```
Background: Purple (#7c3aed)
Hover: Orange (#f97316)
Text: White, bold
Border radius: 12px
Padding: 16px 32px
```

---

## Mobile Rules
- Single column layout on mobile
- Progress bar scrolls horizontally
- Reward card is full width
- Code blocks scroll horizontally
- CTA button is full width on mobile

---

## Navigation Between Levels
- Each page ends with a big CTA to the next level
- Progress bar always visible at the top
- "Back to Labs" link in the nav
- Completed levels show ✅ in the progress bar

---

## NotebookLM Integration
- Each page has a "Deep dive with NotebookLM" button
- Opens a pre-loaded notebook with that level's sources

---

## Tech Stack
- Framework: Next.js
- Styling: Tailwind CSS
- Animations: Framer Motion (XP bar, progress bar, reward card)
- Database: Supabase (XP, BROski$, completed levels per user)
- Deployment: Vercel

---

## File Map

```
/app
  /vibe-labs
    /level-1-claude
    /level-2-google-studio
    /level-3-trae-ide
    /level-4-comparisons
    /level-5-full-stack
    /index
```

---

## Landing Page (Vibe Labs Index)

Hero:
> "Pick your first Big AI. Build something real. Level up your brain."

5 level cards in a grid:
- Card = level name + badge + one-line description + Start button
- Locked levels show 🔒 until previous level is claimed

---

*Built by Lyndz Williams and Perplexity AI ♾️🚀*
*Hyperfocus z0ne — Stop apologising for your brain. Start building.*
