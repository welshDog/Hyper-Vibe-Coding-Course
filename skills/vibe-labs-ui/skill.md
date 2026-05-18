# 🎨 Skill: vibe-labs-ui

Tailwind CSS + Framer Motion + Dark Theme UI for Hyperfocus z0ne Vibe Labs.

---

## Brand Tokens

```
Background:  #0a0a0a
Primary:     #7c3aed  (purple)
Accent:      #f97316  (orange)
Text:        #ffffff
Muted text:  #a1a1aa
Card bg:     #1a1a2e
Border:      1px solid #7c3aed
Border radius: 12px
Font:        Inter or Geist
Code font:   JetBrains Mono or Fira Code
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
          bg:      '#0a0a0a',
          primary: '#7c3aed',
          accent:  '#f97316',
          card:    '#1a1a2e',
          muted:   '#a1a1aa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
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
<section className="bg-gradient-to-br from-[#7c3aed] to-[#0a0a0a] py-20 px-6 text-center">
  <span className="text-sm uppercase tracking-widest text-orange-400">Level 1</span>
  <h1 className="text-5xl font-bold text-white mt-2">Claude Vibe Lab</h1>
  <p className="text-zinc-400 mt-4 max-w-xl mx-auto">Your first AI-powered build. No code required.</p>
</section>
```

### Progress Bar
```tsx
// 5-step progress bar
// Completed = orange tick ✅
// Current = purple filled dot
// Locked = grey dot
<div className="flex items-center gap-2 justify-center py-6">
  {levels.map((level, i) => (
    <>
      <div className={`w-4 h-4 rounded-full ${
        level.done ? 'bg-orange-500' : 
        level.current ? 'bg-purple-600' : 'bg-zinc-700'
      }`} />
      {i < 4 && <div className="w-12 h-px bg-zinc-700" />}
    </>
  ))}
</div>
```

### Reward Card
```tsx
<div className="border border-purple-600 bg-[#1a1a2e] rounded-xl p-6 max-w-sm mx-auto text-center">
  <p className="text-2xl">🏅 Level Complete!</p>
  <p className="text-white font-bold mt-2">+100 XP &nbsp;·&nbsp; +50 BROski$</p>
  <p className="text-zinc-400 text-sm mt-1">Badge: Claude Lab L1</p>
  <button className="mt-4 w-full bg-purple-600 hover:bg-orange-500 transition-colors text-white font-bold py-3 rounded-xl">
    Claim Reward →
  </button>
</div>
```

### Code Prompt Block
```tsx
<div className="relative bg-[#1a1a2e] border border-purple-600 rounded-xl p-4 font-mono text-sm">
  <button className="absolute top-3 right-3 text-xs text-zinc-400 hover:text-white">Copy</button>
  <pre className="text-green-400 whitespace-pre-wrap">{prompt}</pre>
</div>
```

### CTA Button
```tsx
<button className="bg-purple-600 hover:bg-orange-500 transition-colors text-white font-bold px-8 py-4 rounded-xl w-full md:w-auto">
  Go to Level 2 → Google AI Studio
</button>
```

---

## Framer Motion Patterns

### XP Bar Animation
```tsx
import { motion } from 'framer-motion'

<div className="w-full bg-zinc-800 rounded-full h-3">
  <motion.div
    className="bg-purple-600 h-3 rounded-full"
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
- Code blocks: horizontal scroll, no wrapping
- CTA button: full width on mobile
- Reward card: full width on mobile

---

## Level Hero Gradients

| Level | Gradient |
|-------|----------|
| 1 — Claude | `from-purple-700 to-[#0a0a0a]` |
| 2 — Google AI Studio | `from-blue-700 via-purple-700 to-[#0a0a0a]` |
| 3 — Trae IDE | `from-orange-600 via-purple-700 to-[#0a0a0a]` |
| 4 — Comparisons | `from-[#0a0a0a] via-zinc-900 to-[#0a0a0a]` |
| 5 — Full Stack | `from-yellow-500 via-purple-700 to-[#0a0a0a]` |

---

*Part of the Hyperfocus z0ne design system. Built by @welshDog ♾️*
