---
name: HyperFocus Z0ne Design System
description: Design system, content rules, and three React UI kits for the HyperFocus Z0ne ecosystem (Hyper Vibe Z0ne course platform, HyperCore agent dashboard, BROski$Pets dNFT companions). Dark-only, neurodivergent-first, gamified.
---

# HyperFocus Z0ne — Agent Skill

You are designing for **HyperFocus Z0ne**, a neurodivergent-first developer ecosystem by @welshDog (Lyndz Williams, Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿). The audience has ADHD, dyslexia, and/or is autistic. **Design is accessibility here, not decoration.**

## When to use this skill
- The user mentions HyperFocus Z0ne, Hyper Vibe Z0ne, HyperCore, BROski$, BROski$Pets, or @welshDog
- The user shares a `welshDog/Hyper-Vibe-*` or `welshDog/BROskiPets-*` repo
- The user asks for "ND-friendly", "gamified coding course", "agent dashboard", or "dNFT companion" UI

## Three products — pick the right voice
| Product | Vibe | UI kit |
|---|---|---|
| 🎓 Hyper Vibe Z0ne — gamified coding course | Warm, encouraging, learner energy | `ui_kits/hyper-vibe/` |
| 🧠 HyperCore — 29-agent FastAPI/Docker platform | Serious, dense, terminal precision | `ui_kits/hypercore/` |
| 🐾 BROski$Pets — LLM-powered dNFT companions | Fun, collector, holographic | `ui_kits/broski-pets/` |

## Mandatory reads before designing
1. **`README.md`** — full brand bible, voice, visual foundations, iconography, a11y
2. **`colors_and_type.css`** — every token. Never raw hex.
3. **The relevant `ui_kits/<product>/README.md`** + `index.html` for componentry

## Sacred rules (do not break)
- **Dark only.** Bases `#0A0E1A` global, `#0F1B35` cards, `#1A0A2E` (BROski$Pets only), `#0D1424` (lesson player).
- **Z0ne** with a zero, **BROski$** caps + dollar, **BROski♾️** as user term of endearment.
- **No shame copy.** Errors are nudges. "Hmm, let's try that again 🔄" not "Error 400".
- **No ALL CAPS body text** (dyslexia-hostile). Caps only on tiny labels, badges, monograms ≤4 chars.
- **Sentence case** for everything except proper nouns.
- **Glow > shadow** for state. Max 2 glowing elements at once (BROski$Pets is the exception).
- **Min 16px body, 44px touch targets, line-height 1.6+** (1.8 on lesson copy).
- **Min 48px between major sections.** Breathing room is non-negotiable.
- **`prefers-reduced-motion` honored** on every animation (handled globally in `colors_and_type.css`).
- **No light mode. No corporate speak. No emoji-only feature cards. No left-border-accent SaaS cards.**

## Type stack
- Display: **Space Grotesk** (600/700/800)
- Body/UI: **Inter** (400/500/600/700)
- Mono/terminal: **JetBrains Mono** (400/500/600)

## Color shorthand
- Primary: violet `#7B2FBE → #A855F7`
- Tech/links: cyan `#00D4FF → #00FFFF`
- BROski$ tokens / XP / celebration: gold `#F59E0B → #FCD34D` only
- Rare/legendary: pink `#D946EF`
- Healthy/complete: mint `#10F5A0`
- Red `#EF4444` is reserved for **critical errors only** — red = panic for ND brains

## Iconography
**Lucide icons** (stroke 1.5–2px) + a brand emoji set (🧠 🎓 🐾 ⚡ 🎯 🚀 ♾️ 🔥 🪙 🎉 ✨ 🏴󠁧󠁢󠁷󠁬󠁳󠁿). Emoji are punctuation, not decoration — typically 1 per heading or button. Never grayscale icons.

## Copy quick-reference
| Surface | ✅ Say |
|---|---|
| Primary CTA | "Let's GO →" |
| Loading | "Wiring up the Z0ne..." |
| Empty state | "Your quests will show up here — go earn some! 🎯" |
| Success toast | "NICE ONE BROski♾️ +50 XP 🎉" |
| Error | "Hmm, let's try that again 🔄" |

## Taglines (use in context)
- Brand: *Built for brains that build differently.*
- Course: *Learn by building. Level up by shipping.*
- Pets: *Your pet earns while you learn.*
- HyperCore: *29 agents. One brain. Zero limits.*

## How to extend
- New components → drop into the matching `ui_kits/<product>/` folder, export to `window`, register the rendered preview as an asset.
- Cross-product components → put in `ui_kits/hyper-vibe/Primitives.jsx` (already the shared base — HUD, button, card, progress, tag, brand).
- Always pass tokens from `colors_and_type.css` via CSS vars; never inline raw hex.

## Session-start checklist
```
[ ] Re-read README.md if > a week since last session
[ ] Use tokens from colors_and_type.css — never raw hex
[ ] Mobile-first — design at 375px before expanding
[ ] Contrast-check every text + bg combo
[ ] prefers-reduced-motion fallback on any new animation
[ ] Voice check: friendly Welsh mentor, not corporate SaaS
```

> Keep it weird. Keep it warm. Keep it Welsh. 🏴󠁧󠁢󠁷󠁬󠁳󠁿
