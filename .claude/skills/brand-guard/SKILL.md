---
name: brand-guard
description: Lints any UI diff for brand violations — no orange, sacred palette, HFZ design rules. Pairs with design-brain.
triggers:
  - ui change
  - color
  - colour
  - styling
  - tailwind
  - brand
  - design review
  - css change
  - new component
---

# 🎨 brand-guard — The HFZ Brand Police

> Pair with design-brain. Run on every UI diff before committing.

---

## 🚨 THE ONE ABSOLUTE RULE

### NO ORANGE IN THE UI. EVER.

```
❌ orange-*    (any Tailwind orange shade)
❌ #f97316     (orange-500)
❌ #ea580c     (orange-600)
❌ rgb(249, 115, 22)
❌ "warm" or "sunset" colours that are secretly orange
✅ yellow-* is OK (BROski$ economy colour)
✅ amber-* is OK for warnings only
```

---

## 🎨 THE SACRED PALETTE

```
Primary brand:    Purple  → purple-500/600  (#8b5cf6 / #7c3aed)
Hero/fire:        Violet  → violet-500/600
Success:          Emerald → emerald-500     (#10b981)
Warning only:     Amber   → amber-500       (#f59e0b)
BROski$ economy:  Yellow  → yellow-400/500  (#facc15)
Quantum/legend:   Gold    → yellow-400 to orange-500 GRADIENT ONLY
Danger/error:     Red     → red-500         (#ef4444)
Background:       Gray    → gray-950/900/800
Text primary:     White
Text secondary:   Gray    → gray-400/300
```

---

## ✅ BRAND AUDIT CHECKLIST

```
[ ] No orange-* classes anywhere (search the diff)
[ ] No hardcoded hex outside the palette
[ ] Purple used for primary CTAs
[ ] Builder tier card uses purple border + glow
[ ] Hyper Legend uses gold/yellow gradient — NOT flat orange
[ ] BROski$ displays in yellow
[ ] Error states use red-500 only
[ ] Dark backgrounds only (gray-950 base)
[ ] No light mode components (HFZ is dark-first)
[ ] font-black for headings
[ ] rounded-xl or rounded-2xl (never sharp corners)
[ ] hover:scale-105 on CTA buttons
```

---

## 🃏 TIER COLOUR MAP

```
🌱 Starter    → green-500 to emerald-600
⚡ Pro        → blue-500 to cyan-600
🔥 Builder    → purple-500 to violet-600 (HERO — biggest, glowing)
🏛️ Architect  → indigo-500 to purple-600
⚛️ Legend     → yellow-400 to orange-500 (gradient ONLY)
```

---

*Part of the HFZ Claude Skill Pack | welshDog 🐶♾️*
