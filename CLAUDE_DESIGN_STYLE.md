# 🌌 CLAUDE_DESIGN_STYLE.md
# HyperFocus Z0ne — Master Design System & Brand Bible
> Read this first. Every design session. No exceptions.
> Built by @welshDog — Lyndz Williams, Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿
> Last updated: May 2026

---

## 🧠 Who We Are

**HyperFocus Z0ne** is a unified ecosystem for neurodivergent coders — ADHD, autistic, and dyslexic brains.
We build tools that feel like a supportive Welsh mentor, not a corporate dashboard.

### The Three Products
| Product | What It Is | Vibe |
|---|---|---|
| 🎓 **Hyper Vibe Z0ne** | Coding course on-ramp | Learner energy, warm, encouraging |
| 🧠 **HyperCore** | Multi-agent AI platform (29 Docker containers) | Serious pro SaaS, precision |
| 🐾 **BROski$Pets** | Gamified dNFT token companion layer | Fun, collector, holographic |

### The Brand Promise
> "Built for brains that build differently."
> Enter the Z0ne. Build the future.

---

## 🎨 COLOUR PALETTE — The Z0ne Spectrum

### Core Brand Colours
| Token | Hex | Usage |
|---|---|---|
| `--space-black` | `#0A0E1A` | Primary background, deep base |
| `--midnight-blue` | `#0F1B35` | Cards, panels, surfaces |
| `--deep-violet` | `#1A0A2E` | BROski$Pets surfaces, premium feel |
| `--hyper-violet` | `#7B2FBE` | Primary brand colour, buttons, CTAs |
| `--hyper-violet-light` | `#A855F7` | Hover states, gradients, glows |
| `--neon-cyan` | `#00D4FF` | Speed, agents, tech, live data |
| `--pure-cyan` | `#00FFFF` | Highlights, focal points, apertures |
| `--broski-gold` | `#F59E0B` | BROski$ tokens, XP, rewards |
| `--broski-gold-light` | `#FCD34D` | Gold hover, coin animations |
| `--reward-pink` | `#D946EF` | Achievements, unlocks, rare items |
| `--success-mint` | `#10F5A0` | Completed, healthy, green states |
| `--warning-amber` | `#FBBF24` | Alerts, caution — not panic |
| `--text-primary` | `#F0F4FF` | All primary text on dark bg |
| `--text-secondary` | `#8B9CC8` | Labels, hints, metadata, timestamps |
| `--text-disabled` | `#3D4F6E` | Inactive, placeholder |

### Gradient Recipes
```css
/* Primary CTA — Hyper Action */
background: linear-gradient(135deg, #7B2FBE 0%, #00D4FF 100%);

/* BROski$ Gold Shimmer */
background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F59E0B 100%);

/* Holographic Foil (BROskiPets) */
background: linear-gradient(135deg, #D946EF, #A855F7, #00D4FF, #10F5A0, #D946EF);
background-size: 300% 300%;
animation: holographic 3s ease infinite;

/* Hero Deep Space */
background: radial-gradient(ellipse at 50% 0%, #1A0A2E 0%, #0A0E1A 70%);
```

### Rarity Colour System (BROski$Pets)
| Rarity | Border Colour | Glow Colour |
|---|---|---|
| Common | `#60A5FA` (steel blue) | `#3B82F6` |
| Rare | `#A855F7` (violet) | `#7B2FBE` |
| Epic | `#D946EF` (pink-purple) | `#BE185D` |
| Legendary | Rainbow holographic shimmer | Full hue-rotate |

---

## 🔤 TYPOGRAPHY

### Font Stack
| Role | Font | Fallback | Size |
|---|---|---|---|
| **Headlines / Brand** | Space Grotesk Bold | system-ui | 32px–72px |
| **UI / Body** | Inter | system-ui | 16px minimum |
| **Code / Terminal** | JetBrains Mono | monospace | 14px minimum |
| **Monogram / Badge** | Space Grotesk | monospace | varies |

### Rules — Never Break These
- ❌ Body text NEVER below 16px — ADHD/dyslexia readability
- ✅ Line height: 1.6 minimum for body, 1.8 for long-form reading
- ✅ Letter spacing: +0.02em on body, +0.05em on labels/caps
- ❌ Never ALL CAPS for body text — harder to read for dyslexic brains
- ✅ ALL CAPS ok for: badges, status labels, monograms (max 4 chars)
- ✅ Font weight: 400 body, 600 UI labels, 700–800 headlines
- ❌ Never use more than 2 font families on one page

### Type Scale
```
Display:   72px / Space Grotesk 800  → Hero headlines only
H1:        48px / Space Grotesk 700
H2:        36px / Space Grotesk 700
H3:        24px / Space Grotesk 600
H4:        20px / Inter 600
Body LG:   18px / Inter 400  (lesson content, long reads)
Body:      16px / Inter 400  (default UI)
Label:     14px / Inter 600  (metadata, timestamps, tags)
Caption:   12px / Inter 400  (fine print only — use sparingly)
Code:      14px / JetBrains Mono 400
```

---

## 📐 SPACING & LAYOUT

### Spacing Scale (8px base grid)
```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   24px
--space-6:   32px
--space-7:   48px
--space-8:   64px
--space-9:   96px
--space-10:  128px
```

### Border Radius
```
--radius-sm:   6px   → Inputs, tags, small buttons
--radius-md:   12px  → Cards, panels (default)
--radius-lg:   16px  → Modal overlays, hero cards
--radius-xl:   24px  → Feature cards, pet cards
--radius-full: 9999px → Pills, badges, avatars
```
> ⚠️ NEVER use full pill radius on primary action buttons — they should feel solid, not toyish.

### Layout Grid
- Desktop: 12-column, 24px gutters, 1280px max-width
- Tablet: 8-column, 16px gutters
- Mobile: 4-column, 16px gutters
- Dashboard sidebar: 240px fixed, collapsible to 64px icon-only

---

## ✨ EFFECTS & ANIMATIONS

### The Z0ne Effect Library

#### Hover Glow (all interactive cards + buttons)
```css
transition: box-shadow 0.25s ease, transform 0.25s ease;
&:hover {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.4),
              0 0 40px rgba(168, 85, 247, 0.2);
  transform: translateY(-2px);
}
```

#### Neon Border Pulse (active/selected state)
```css
@keyframes borderPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(168,85,247,0.6); }
  50%       { box-shadow: 0 0 20px rgba(168,85,247,1.0),
                          0 0 40px rgba(168,85,247,0.4); }
}
animation: borderPulse 2s ease-in-out infinite;
```

#### Holographic Foil (BROski$Pets cards — Legendary tier)
```css
@keyframes holographic {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
background: linear-gradient(135deg, #D946EF, #A855F7, #00D4FF, #10F5A0, #FCD34D, #D946EF);
background-size: 300% 300%;
animation: holographic 3s ease infinite;
```

#### 3D Card Tilt (pet cards + feature cards)
```css
transition: transform 0.3s ease;
&:hover {
  transform: perspective(800px) rotateX(4deg) rotateY(-4deg) translateY(-4px);
}
```

#### Sonar Pulse Loader (replaces all spinners)
```css
@keyframes sonarPulse {
  0%   { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.0); opacity: 0; }
}
/* 3 rings staggered 0.4s apart */
```

#### XP Liquid Fill (progress bars)
```css
@keyframes liquidFill {
  0%   { width: 0%; }
  100% { width: var(--progress); }
}
/* Background: linear-gradient(90deg, #7B2FBE, #00D4FF) */
animation: liquidFill 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
```

#### Level-Up Burst (full screen — 0.5s)
```css
@keyframes levelBurst {
  0%   { transform: scale(0); opacity: 1; }
  60%  { transform: scale(1.8); opacity: 0.6; }
  100% { transform: scale(3.0); opacity: 0; }
}
/* Purple ring expands from centre, then fades */
```

#### Coin Drop (BROski$ reward)
```css
/* Gold coins arc from trigger point to balance counter */
/* Use GSAP MotionPath or CSS custom properties for arc */
/* Duration: 0.8s, stagger: 0.1s per coin, 3-5 coins per reward */
```

#### Starfield Background (hero sections only)
```css
/* 150-200 tiny dots, CSS-only or canvas */
/* Speed: very slow drift — 60s cycle */
/* Opacity: 0.3–0.6 — subtle, not distracting */
```

#### Cursor Sparkle Trail (BROski$Pets hero only)
```css
/* 6-8 tiny particles, 4px, brand colours */
/* Follow cursor with 80ms lag */
/* Fade out over 600ms */
```

### Animation Timing Tokens
```
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1)  → Reward pops, level-ups
--ease-smooth:   cubic-bezier(0.4, 0, 0.2, 1)        → Standard UI transitions
--ease-sharp:    cubic-bezier(0.4, 0, 1, 1)           → Dropdowns, tooltips
--duration-fast: 150ms  → Hover states
--duration-mid:  300ms  → Panel transitions
--duration-slow: 600ms  → Page transitions, reveals
--duration-anim: 1200ms → Progress fills, celebrations
```

---

## 🧩 COMPONENT LIBRARY

### Cards
```
Surface:        #0F1B35 (midnight-blue)
Border:         1px solid rgba(168,85,247,0.2)
Border-radius:  12px
Shadow:         0 4px 24px rgba(0,0,0,0.4)
Hover:          Lift + violet glow (see Hover Glow effect)
Padding:        24px
```

### Buttons
```
Primary:   Gradient #7B2FBE → #00D4FF, white text, radius 8px, 12px 24px padding
Ghost:     Transparent, 1px violet border, violet text — glows on hover
Danger:    #EF4444 base, same radius/padding
Disabled:  #3D4F6E bg, #1A2540 text — NO hover effects
Size SM:   10px 16px padding, 14px font
Size MD:   12px 24px padding, 16px font (default)
Size LG:   16px 32px padding, 18px font
```
> ❌ Never pill-radius primary buttons. They must feel solid, not playful.

### Glass Panel (modals + overlays ONLY)
```
Background:      rgba(15, 27, 53, 0.7)
Backdrop-filter: blur(12px)
Border:          1px solid rgba(168,85,247,0.25)
Border-radius:   16px
```
> ⚠️ Glass panels ONLY for: modals, overlays, floating tooltips.
> Never use for main layout cards — kills performance and looks cluttered.

### Input Fields
```
Background:    rgba(255,255,255,0.05)
Border:        1px solid rgba(168,85,247,0.3)
Border-radius: 8px
Focus:         Border becomes #A855F7, soft violet glow
Padding:       12px 16px
Font:          Inter 16px
Placeholder:   #3D4F6E
```

### Terminal / Log Panel
```
Background:  #020408
Font:        JetBrains Mono 14px
Text:        #00FF88 (default log), #FF6B6B (error), #FCD34D (warning)
Border:      1px solid rgba(0,212,255,0.2)
Scanline:    repeating-linear-gradient(transparent, transparent 2px,
             rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)
Cursor:      Blinking cyan block
```

### Status / Badge
```
Healthy:   #10F5A0 text + rgba(16,245,160,0.15) bg — pulsing green dot
Warning:   #FBBF24 text + rgba(251,191,36,0.15) bg
Error:     #EF4444 text + rgba(239,68,68,0.15) bg
Inactive:  #8B9CC8 text + rgba(139,156,200,0.1) bg
```

### Progress Bar (XP/BROski$)
```
Track:     rgba(255,255,255,0.08), radius 99px, height 8px
Fill:      linear-gradient(90deg, #7B2FBE, #00D4FF)
Animation: liquidFill (see effects)
Label:     Inter 12px, text-secondary, right-aligned above bar
```

---

## 🏠 PAGE-BY-PAGE DESIGN RULES

### All Pages — Shared Rules
- ✅ Clear "next step" visible at all times — never leave user stranded
- ✅ Max 3 font sizes per section — no visual chaos
- ✅ Breathing room — min 48px between major sections
- ✅ Mobile-first — all layouts work at 375px width
- ❌ Never more than 2 glowing elements visible at once
- ❌ No full-page glassmorphism — only panels/modals
- ❌ No walls of text — max 3 sentences before a visual break

### Landing Page
- Hero: starfield bg + parallax + single clear H1 + 2 CTAs max
- Above fold: must communicate value in under 5 seconds
- Social proof: scrolling marquee, not static blocks
- Pricing: 3 tiers max, most popular = glowing violet border

### Course Dashboard
- Left sidebar: 240px, dark, icon + label nav, active = violet glow indicator
- Content: max 960px wide — never full-width walls of content
- Progress: always visible in header — streak + XP + BROski$ balance

### Lesson Player
- Background: slightly lighter than global (#0D1424) — reduces eye strain
- Body text: 18px Inter, line-height 1.8 — optimised for long reads
- Code blocks: full-width, JetBrains Mono, neon token colours
- No sidebar during active lesson — full focus mode
- Celebration: always celebrate correct answers before anything else

### Agent Dashboard (HyperCore)
- Data density: HIGH — engineers expect more info per screen
- Glows: used ONLY for status (green healthy, amber warn, red error)
- No decorative effects — pure function here
- Log stream: always visible on right panel, auto-scroll with pause on hover

### BROski$Pets Page
- This is where the FUN LIVES — more effects allowed here than anywhere else
- Holographic shimmer: on every pet card hover
- Cursor sparkle: ON (only page where this is enabled)
- Coin animations: ON
- Deep violet base (#1A0A2E) instead of standard space black
- Every pet card MUST show: rarity ring, XP, BROski$ balance, level badge

---

## 🖼️ THE LOGO — HyperFocus Z0ne

### Primary Mark
Brain inside a circle — detailed neon gyri outlines, cyan-to-purple-to-green colour shift.
Central equilateral triangle in neon cyan with **HFZ** monogram and spiral symbol above it.
Brain stem becomes circuit traces at the bottom.
Outer purple ring frames the circle.
Deep space navy background.

### Logo Usage Rules
| Use Case | Version |
|---|---|
| App icon, favicon, social avatar | Circle mark only — no wordmark |
| Website header | Mark + "HyperFocus Z0ne" wordmark |
| Docs, slides, reports | Mark + wordmark + tagline |
| Merch, print | Full version on black only |
| Light backgrounds | ❌ Do NOT use — dark-only brand |

### Clear Space
Minimum clear space around the logo = 1x the height of the "Z" in the monogram.
Never place the logo on busy/textured backgrounds without a dark overlay.

### Colours — Never Change
- Outer ring: `#7B2FBE` violet
- Brain glow: cyan `#00D4FF` to violet `#A855F7`
- Triangle: neon cyan `#00D4FF`
- HFZ text: `#00D4FF`
- Background: `#0A0E1A` or pure black only

### Sub-Brand Marks (same circle frame, different content)
```
Hyper Vibe Z0ne  → Brain + graduation cap icon inside triangle
HyperCore        → Brain + circuit chip split (no triangle)
BROski$Pets      → Pet character inside circle, rainbow rarity ring
HyperAgent       → Circuit node / agent graph inside triangle
```

---

## 🐾 BROSKI$PETS SPECIAL RULES

- Every pet = unique visual + name + rarity tier
- Rarity ring ALWAYS visible — it's the pet's identity signal
- Holographic foil = Legendary tier ONLY — overuse kills the magic
- Pet animations: idle breathing (scale 1.0 ↔ 1.02, 3s cycle)
- BROski$ = always shown in gold — never any other colour
- "Earn to unlock" silhouettes = dark with violet question mark, NOT grey
- Coin drop animation triggers on EVERY token award event, no exceptions

---

## 🗣️ BRAND VOICE (for all copy Claude generates)

**Tone:** Friendly Welsh mentor. Casual + encouraging. Technically precise when needed.

### Voice Rules
- ✅ Short sentences first, optional deeper explanation after
- ✅ Celebrate every win — no win is too small
- ✅ Progress language: "level up", "quest complete", "you just unlocked"
- ✅ Supportive on errors: "not quite — here's a nudge" not "WRONG"
- ❌ No corporate speak — never "leverage", "synergy", "utilise"
- ❌ No shame language — never "you failed", "incorrect", "error"
- ❌ No walls of text — chunk everything

### Micro-copy Examples
```
Button:     "Let's GO →"  not  "Submit"
Error:      "Hmm, let's try that again 🔄"  not  "Error 400"
Empty state:"Your quests will show up here — go earn some! 🎯"
Loading:    "Wiring up the Z0ne..."  not  "Loading..."
Success:    "NICE ONE BROski♾️ +50 XP 🎉"  not  "Success"
Onboarding: "Hey bro, let's get you set up 🐶"
```

### Taglines (pick by context)
```
Primary:    "Built for brains that build differently."
Action:     "Enter the Z0ne. Build the future."
Course:     "Learn by building. Level up by shipping."
Pets:       "Your pet earns while you learn."
HyperCore:  "29 agents. One brain. Zero limits."
```

---

## 🚫 SACRED DESIGN RULES — NEVER DEBATE, NEVER BREAK

1. ❌ **No light mode** — HyperFocus Z0ne is a dark-only brand
2. ❌ **No full glassmorphism layouts** — panels/modals only
3. ❌ **No text below 16px** — ADHD/dyslexia accessibility non-negotiable
4. ❌ **No pill buttons on primary actions** — solid block feel only
5. ❌ **No red for anything except critical errors** — red = panic for ND brains
6. ❌ **No more than 2 glowing elements visible at once** — outside BROski$Pets
7. ✅ **Always chunk content** — max 3 lines before a visual break
8. ✅ **Always show next step** — no dead-ends anywhere in the UI
9. ✅ **Always celebrate completions** — every quest, lesson, level-up gets a moment
10. ✅ **BROski$ always gold** — never any other colour for the token

---

## 📁 ASSET LOCATIONS

```
/brand/
  logo-primary.svg          ← Full logo with wordmark
  logo-mark.svg             ← Circle mark only (app icon)
  logo-mark-favicon.png     ← 32x32 favicon
  logo-hyper-vibe.svg       ← Hyper Vibe Z0ne sub-brand
  logo-hypercore.svg        ← HyperCore sub-brand
  logo-broski-pets.svg      ← BROski$Pets sub-brand
  palette.css               ← All CSS custom properties
  typography.css            ← Font imports + scale
  effects.css               ← All animation keyframes
  icons/                    ← Custom HFZ icon set (Phosphor-based)
```

---

## 📝 ANY OTHER NOTES

### 🧠 Designing for Neurodivergent Brains — Always
This isn't just aesthetic. Every decision in this doc exists because the people using HyperFocus Z0ne have ADHD, dyslexia, or are autistic. That means:
- **Reduce friction at every turn** — one clear action per screen, never two competing CTAs
- **Predictable layouts** — same sidebar, same header, every page. No surprises.
- **Reward progress constantly** — dopamine hits matter here more than anywhere else
- **Error states are NEVER the user's fault** in the copy — always a "let's try again" not a blame
- **Reading difficulty is real** — chunked content, big text, generous spacing is not optional

### 🌍 Accessibility Baseline (non-negotiable)
- **WCAG AA minimum** for all text contrast — AA+ preferred
- **Focus rings always visible** — never `outline: none` without a custom replacement
- **All animations respect** `prefers-reduced-motion` — wrap every keyframe in a media query
- **Alt text on every image** — descriptive, not "image of..."
- **ARIA labels** on all icon-only buttons — no exceptions
- **Tab order** must be logical and never skip interactive elements

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 🔧 Design Workflow — Session Start Checklist
Every time you open a design file or start a new component, run through this:
```
[ ] Read this file top to bottom if it's been more than a week
[ ] Check /brand/ folder for latest logo assets before designing
[ ] Confirm you're using the correct colour tokens — no raw hex hardcoding
[ ] Check WHATS_DONE.md — don't redesign something already built
[ ] Mobile view first — always design at 375px before expanding
[ ] Run contrast checker before finalising any text colour combo
[ ] Add prefers-reduced-motion before shipping any animation
```

### 🤝 Handing Off to Developers
When passing designs to a dev (or to Claude to build):
- **Export measurements in px** not rem — Claude converts, designers don't need to
- **Name every layer** — no "Rectangle 47" ever
- **Include hover + active + disabled states** for every interactive component
- **Write the micro-copy in the design file** — not "button text here"
- **Annotate animations** — specify duration, easing token, trigger event
- **Link to this file** in every Figma page description

### 💡 New Component Checklist
Before shipping any new UI component to production:
```
[ ] Dark background only — tested on #0A0E1A
[ ] Text 16px minimum
[ ] Hover state defined
[ ] Focus state defined (keyboard nav)
[ ] Mobile layout tested at 375px
[ ] prefers-reduced-motion handled
[ ] ARIA label if icon-only
[ ] Matches existing spacing tokens (no magic numbers)
[ ] Tested with a simulated dyslexia filter (browser extension)
```

### 🚀 Future Design Directions (on the roadmap)
These aren't built yet — but keep them in mind so new work doesn't block them:
- **HFZ Design Token export** → Figma tokens → JSON → Tailwind config (auto-sync pipeline)
- **Component Storybook** → Every component documented with all states, live on `/design-system`
- **BROski$Pets 3D card flip** → WebGL or CSS 3D, full holographic back-of-card design
- **Adaptive difficulty UI** → Course UI subtly shifts based on student's focus score (more whitespace, larger text when score dips)
- **Dark + Darker mode** → Two dark options: standard `#0A0E1A` and ultra-dark `#020408` for night owls
- **Custom HFZ icon set** → Phosphor-based but with Z0ne personality — brain, lightning, circuit nodes, coin, portal, pet paw

### 🐶 A Note from Lyndz
> This ecosystem was built by a neurodivergent brain, for neurodivergent brains.
> Every pixel, every animation, every word in the UI is a deliberate choice to make
> someone feel like they belong here — like the Z0ne was made for them.
> Because it was.
>
> Keep it weird. Keep it warm. Keep it Welsh. 🏴󠁧󠁢󠁷󠁬󠁳󠁿
> — @welshDog

---

<div align="center">

**HyperFocus Z0ne** — Enter the Z0ne. Build the future.
Built by @welshDog — Lyndz Williams 🏴󠁧󠁢󠁷󠁬󠁳󠁿
*The Z0ne is where neurodivergent builders belong.*

</div>
