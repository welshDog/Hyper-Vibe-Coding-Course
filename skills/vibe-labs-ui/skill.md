# 🎨 Skill: vibe-labs-ui

Tailwind CSS + Framer Motion + Dark Theme UI for Hyperfocus z0ne Vibe Labs.

> ⚠️ **Master Brand Bible** — all tokens pulled from CLAUDE_DESIGN_STYLE.md. Do NOT use old palette.

---

## Brand Tokens (Master — CLAUDE_DESIGN_STYLE.md)

```
Background:      #0A0E1A   ← deep navy (NOT #0a0a0a)
Surface/Card:    #0F1B35   ← lifted surface
Primary purple:  #7B2FBE   ← (NOT #7c3aed)
Accent cyan:     #00D4FF   ← primary accent (NOT orange)
Gold (tokens):   #F59E0B   ← BROski$ / XP displays only
Text:            #FFFFFF
Muted text:      #94A3B8
Border:          1px solid rgba(123,47,190,0.3)
Border radius:   12px
Font headline:   Space Grotesk (MANDATORY for all h1/h2/h3)
Font body:       Inter or Geist
Font code:       JetBrains Mono
```

---

## Tailwind Config Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      '#0A0E1A',
          surface: '#0F1B35',
          primary: '#7B2FBE',
          cyan:    '#00D4FF',
          gold:    '#F59E0B',
          muted:   '#94A3B8',
        }
      },
      fontFamily: {
        // Space Grotesk MANDATORY for headlines
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        sans:    ['Inter', 'Geist', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7B2FBE, #00D4FF)',
      },
      borderRadius: {
        brand: '12px',
      }
    }
  }
}
```

---

## Core Components

### Hero Section
```tsx
<section className="bg-gradient-to-br from-[#7B2FBE] to-[#0A0E1A] py-20 px-6 text-center">
  <span className="text-sm uppercase tracking-widest text-cyan-400 font-heading">
    Level 1
  </span>
  <h1 className="font-heading text-5xl font-bold text-white mt-2">
    Claude Vibe Lab
  </h1>
  <p className="text-slate-400 mt-4 max-w-xl mx-auto">
    Your first AI-powered build. No code required.
  </p>
</section>
```

### Progress Bar
```tsx
// Completed = gold tick ✅
// Current = purple filled dot
// Locked = grey dot
<div className="flex items-center gap-2 justify-center py-6">
  {levels.map((level, i) => (
    <>
      <div className={`w-4 h-4 rounded-full ${
        level.done    ? 'bg-[#F59E0B]' :   // gold = completed
        level.current ? 'bg-[#7B2FBE]' :   // purple = active
                        'bg-slate-700'       // grey = locked
      }`} />
      {i < 4 && <div className="w-12 h-px bg-slate-700" />}
    </>
  ))}
</div>
```

### Reward Card
```tsx
<div className="border border-[#7B2FBE]/30 bg-[#0F1B35] rounded-xl p-6 max-w-sm mx-auto text-center">
  <p className="text-2xl">🏅 Level Complete!</p>
  <p className="text-white font-bold mt-2">
    <span className="text-[#F59E0B]">+100 XP</span>
    &nbsp;·&nbsp;
    <span className="text-[#F59E0B]">+50 BROski$</span>
  </p>
  <p className="text-slate-400 text-sm mt-1">Badge: Claude Lab L1</p>
  {/* Primary button = gradient. Sacred Rule #4: solid feel, no pill */}
  <button className="mt-4 w-full bg-gradient-to-r from-[#7B2FBE] to-[#00D4FF] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
    Claim Reward →
  </button>
</div>
```

### Code Prompt Block
```tsx
<div className="relative bg-[#0F1B35] border border-[#7B2FBE]/30 rounded-xl p-4 font-mono text-sm">
  {/* Copy button — must be readable, min 16px (caption-only exception) */}
  <button className="absolute top-3 right-3 text-xs text-slate-400 hover:text-white transition-colors">
    Copy
  </button>
  <pre className="text-cyan-400 whitespace-pre-wrap">{prompt}</pre>
</div>
```

### CTA Button (Primary)
```tsx
{/* Gradient primary. NO orange hover. Sacred Rule #4. */}
<button className="bg-gradient-to-r from-[#7B2FBE] to-[#00D4FF] hover:opacity-90 transition-opacity text-white font-bold px-8 py-4 rounded-xl w-full md:w-auto font-heading">
  Go to Level 2 → Google AI Studio
</button>
```

---

## Framer Motion Patterns

### XP Bar Animation
```tsx
import { motion } from 'framer-motion'

<div className="w-full bg-slate-800 rounded-full h-3">
  <motion.div
    className="bg-gradient-to-r from-[#7B2FBE] to-[#00D4FF] h-3 rounded-full"
    initial={{ width: 0 }}
    animate={{ width: `${xpPercent}%` }}
    transition={{ duration: 1, ease: 'easeOut' }}
  />
</div>
```

### Reward Card Pop-in
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
>
  {/* Reward card here */}
</motion.div>
```

### Page Fade-in
```tsx
<motion.main
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {children}
</motion.main>
```

---

## Mobile Rules
- Single column on mobile (< 768px)
- Progress bar: horizontal scroll on mobile
- Code blocks: horizontal scroll, no text wrapping
- CTA button: full width on mobile
- Reward card: full width on mobile

---

## Level Hero Gradients (Master Palette)

| Level | Gradient |
|-------|----------|
| 1 — Claude | `from-[#7B2FBE] to-[#0A0E1A]` |
| 2 — Google AI Studio | `from-[#1E40AF] via-[#7B2FBE] to-[#0A0E1A]` |
| 3 — Trae IDE | `from-[#00D4FF] via-[#7B2FBE] to-[#0A0E1A]` |
| 4 — Comparisons | `from-[#0A0E1A] via-[#0F1B35] to-[#0A0E1A]` |
| 5 — Full Stack | `from-[#F59E0B] via-[#7B2FBE] to-[#0A0E1A]` |

---

## Sacred Rules (from CLAUDE_DESIGN_STYLE.md)

1. Space Grotesk on ALL headlines. No exceptions.
2. Background = #0A0E1A. Never pure black.
3. Cards = #0F1B35 with purple/30 border.
4. Primary buttons = gradient #7B2FBE→#00D4FF. No orange. Solid feel, not pill.
5. 🔴 Red = panic for ND brains. Use 💡 for lessons, ⚠️ for warnings.
6. Gold (#F59E0B) reserved for BROski$/XP displays only.
7. Cyan (#00D4FF) is accent. Not a primary colour. Don't overuse.

---

*Part of the Hyperfocus z0ne design system. Master: CLAUDE_DESIGN_STYLE.md. Built by @welshDog ♾️*
