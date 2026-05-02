# 🌌 HyperFocus Z0ne — Design System

> **Built for brains that build differently.**
> Enter the Z0ne. Build the future.

A unified design system for the **HyperFocus Z0ne** ecosystem — a neurodivergent-first developer platform built by [@welshDog](https://github.com/welshDog) (Lyndz Williams) in Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿. Every token, component, and rule in this system exists because the people using HyperFocus Z0ne have ADHD, dyslexia, or are autistic. Design is not decoration here — it's accessibility.

---

## 🧠 The Three Products — One Brain

| Product | What it is | Vibe |
|---|---|---|
| 🎓 **Hyper Vibe Z0ne** | Gamified coding course on-ramp — lessons, XP, BROski$ tokens, AI tutor agents | Learner energy, warm, encouraging |
| 🧠 **HyperCore** | 29-container multi-agent AI platform — FastAPI core, Docker, real-time agent orchestration | Serious pro SaaS, precision, dense |
| 🐾 **BROski$Pets** | LLM-powered dNFT companions — 78 EEPs, on-chain evolution, gamified rewards | Fun, collector, holographic |

The promise: **No shame. No walls of text. No "you failed."** Just momentum, celebration, and a platform that was made for these brains.

---

## 📚 Sources

This design system was distilled from the following materials:

- **`CLAUDE_DESIGN_STYLE.md`** (commit `5af4f32`) — the master Brand Bible at the root of `welshDog/Hyper-Vibe-Coding-Course`. This is the single source of truth for tokens and rules. (Imported & cross-referenced — not currently bundled in this project; ask if you need it.)
- **GitHub:** [welshDog/Hyper-Vibe-Coding-Course](https://github.com/welshDog/Hyper-Vibe-Coding-Course) — frontend Vite/React app, live at [hyper-vibe-coding-course.vercel.app](https://hyper-vibe-coding-course.vercel.app)
- **GitHub:** [welshDog/BROskiPets-LLM-dNFT](https://github.com/welshDog/BROskiPets-LLM-dNFT) — Python/Solidity dNFT pet agents
- **Logo:** `uploads/HyperFocus z0ne Logo.jpg` — primary circle mark with brain + HFZ triangle monogram
- **Reference frontend code:** snapshot at `frontend/src/` (course platform components)

> ⚠️ **Note:** the live `frontend/tailwind.config.js` ships a *light* theme as Vite defaults, but the brand bible (`CLAUDE_DESIGN_STYLE.md`) is explicit: HyperFocus Z0ne is a **dark-only brand**. This design system follows the bible, not the legacy Vite defaults.

---

## 📂 Index — what's in this folder

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← Agent Skill manifest (Claude Code-compatible)
├── colors_and_type.css        ← Full design tokens: colors, type, spacing, radii, easings
├── assets/                    ← Logo, brand imagery
│   └── logo-mark.jpg          ← Primary circle mark
├── preview/                   ← Design-system-tab preview cards (small HTML samplers)
├── ui_kits/
│   ├── hyper-vibe/            ← Course platform UI kit (dashboard, modules, lesson)
│   ├── hypercore/             ← Multi-agent dashboard UI kit (29 agents, log stream)
│   └── broski-pets/           ← Pet collector UI kit (pack, evolution, activity)
└── frontend/                  ← Reference snapshot from the live course repo
```

### UI kits — manifest

| Kit | What it covers | Key components |
|---|---|---|
| **`ui_kits/hyper-vibe/`** | Course on-ramp: hero, module catalog, lesson reader, gamified HUD | `HVZHud`, `HVZHero`, `HVZCourseCard`, `HVZSidebar`, `HVZLessonContent`, `HVZButton`, `HVZCard`, `HVZTag`, `HVZProgress`, `HVZBrand` |
| **`ui_kits/hypercore/`** | Agent platform ops: container roster, system metrics, live log stream | `HCSidebar`, `HCBrand`, `HCStatus`, `HCMetric`, `HCAgentCard`, `HCLogStream` |
| **`ui_kits/broski-pets/`** | dNFT collector view: pack inventory, evolution chain, stat block, activity feed | `PetCard`, `PetSprite`, `PetDetail`, `PetActivityRow` (reuses `HVZHud` + `HVZProgress` from Hyper Vibe) |

All kits load tokens from `colors_and_type.css` and use React 18 + Babel inline. Components are exported to `window` so kits can compose freely (e.g. BROski$Pets reuses Hyper Vibe primitives).

---

## ✍️ CONTENT FUNDAMENTALS — Voice & Tone

**Tone:** *Friendly Welsh mentor.* Casual + encouraging. Technically precise where it matters, never corporate. The voice should sound like a supportive friend who happens to be a brilliant coder — not a SaaS dashboard.

### Voice rules
- ✅ **Short sentences first.** Optional deeper explanation after, never before.
- ✅ **Celebrate every win.** No win is too small. Every quest, lesson, level-up gets a moment.
- ✅ **Progress language:** "level up", "quest complete", "you just unlocked", "ship it", "momentum".
- ✅ **Supportive on errors:** *"not quite — here's a nudge"* not *"WRONG"*. Errors are NEVER the user's fault in copy.
- ✅ **You-first.** Address the user directly. "You're 3 lessons from done." Not "The user has 3 lessons remaining."
- ✅ **Chunk content.** Max 3 lines before a visual break.

### Forbidden patterns
- ❌ No corporate speak — never "leverage", "synergy", "utilise", "stakeholder"
- ❌ No shame language — never "you failed", "incorrect", "error" (as a header)
- ❌ No walls of text — chunked everything
- ❌ No ALL CAPS body text (dyslexia-hostile). ALL CAPS only for badges, monograms (≤4 chars), tiny status labels.

### Emoji
**Yes — but as punctuation, not decoration.** Brand-specific emoji set runs throughout: 🧠 🎓 🐾 ⚡ 🎯 🚀 ♾️ 🔥 🪙 🎉 🏴󠁧󠁢󠁷󠁬󠁳󠁿. They function as scannable wayfinding for ADHD eyes, not noise. Don't over-clutter — typically 1 emoji per heading or button, max 2 in a sentence.

The signature: **`BROski♾️`** — the platform's term of endearment for its users. Lowercase except the B, infinity sign as suffix.

### Casing
- **Sentence case** for buttons, body, headings ("Start your quest", not "Start Your Quest" or "START YOUR QUEST").
- **Title Case** is fine for proper nouns — *Hyper Vibe Z0ne*, *HyperCore*, *BROski$Pets*.
- **Z0ne** with a zero, not an O. Always. It's part of the brand.
- **BROski$** with capital B, R, O — and dollar sign for the token.

### Micro-copy library — copy these literally
| Surface | ❌ Don't say | ✅ Say |
|---|---|---|
| Button (primary CTA) | "Submit" | "Let's GO →" |
| Error toast | "Error 400" | "Hmm, let's try that again 🔄" |
| Empty state | "No items" | "Your quests will show up here — go earn some! 🎯" |
| Loading | "Loading..." | "Wiring up the Z0ne..." |
| Success toast | "Success" | "NICE ONE BROski♾️ +50 XP 🎉" |
| Onboarding hello | "Welcome." | "Hey bro, let's get you set up 🐶" |

### Taglines (pick by context)
- **Primary brand:** *Built for brains that build differently.*
- **Action:** *Enter the Z0ne. Build the future.*
- **Course:** *Learn by building. Level up by shipping.*
- **Pets:** *Your pet earns while you learn.*
- **HyperCore:** *29 agents. One brain. Zero limits.*

---

## 🎨 VISUAL FOUNDATIONS

### Mood & motif
HyperFocus Z0ne lives at the intersection of **deep-space sci-fi**, **arcade neon**, and **clinical agent-platform precision**. Every surface starts black. Glow does the work color usually would. The visual world should feel like a friendly Marvel-tech control room — not a corporate dashboard, not a kid's game.

### Backgrounds
- **Always dark.** Sacred rule — there is **no light mode**. Bases: `#0A0E1A` (space-black) global, `#0F1B35` (midnight-blue) cards, `#1A0A2E` (deep-violet) for BROski$Pets surfaces only, `#0D1424` (slightly lighter) for lesson player to reduce eye strain.
- **Hero sections:** subtle radial gradient from deep-violet to space-black, plus a slow-drifting starfield (150–200 tiny dots, 60s cycle, opacity 0.3–0.6). Never noisy.
- **No full-page glassmorphism.** Glass panels only for modals, overlays, floating tooltips. Background image use is rare and dark — never a busy photograph behind UI.
- **No textures or hand-drawn illustrations.** The brand language is digital-native: gradients, glows, neon strokes, holographic foil — not paper or sketchy.

### Color vibe
**Cool, electric, holographic.** The palette is dominated by violet (`#7B2FBE` → `#A855F7`) and cyan (`#00D4FF` → `#00FFFF`), with gold (`#F59E0B` → `#FCD34D`) reserved exclusively for BROski$ tokens, XP, and celebratory moments. Pink (`#D946EF`) is for rare achievements; mint green (`#10F5A0`) for healthy/complete states. **Red appears only for critical errors** — red equals panic for ND brains. See `colors_and_type.css` for the full token list.

### Type
- **Space Grotesk** for display + headlines (weights 600/700/800)
- **Inter** for UI + body (weights 400/500/600/700) — never below 16px for body
- **JetBrains Mono** for code, terminals, monograms (weights 400/500/600)
- Line-height 1.6 minimum on body, **1.8 for long-form lesson reading**
- Letter-spacing +0.02em body, +0.05em on caps/labels

### Spacing & layout
- **8px base grid** — every spacing token is a multiple of 8 (or 4 for very fine work). See `--space-1` … `--space-10` in `colors_and_type.css`.
- **Min 48px between major sections.** Breathing room is non-negotiable for ADHD scanning.
- **Max content width:** 1280px desktop, 960px lesson player. Never full-width walls.
- **Sidebar:** 240px fixed (course dashboard), collapsible to 64px icon-only.
- **Mobile-first** — every layout works at 375px.

### Borders
- Cards: `1px solid rgba(168, 85, 247, 0.2)` (subtle violet tint, never gray)
- Inputs: `1px solid rgba(168, 85, 247, 0.3)` — focus state goes solid `#A855F7` plus glow
- Terminal: `1px solid rgba(0, 212, 255, 0.2)` (cyan tint to mark machine surfaces)
- **Never plain `#333` borders.** Borders carry brand color even when subtle.

### Corner radii
- `6px` — inputs, tags, small buttons
- `12px` — cards, panels (default)
- `16px` — modals, hero cards
- `24px` — feature cards, pet cards
- `9999px` — pills, badges, avatars
- ❌ **Never pill-radius (`9999px`) primary action buttons.** Solid block feel only — toy-shaped CTAs read as childish.

### Cards — anatomy
```
Surface       #0F1B35 (midnight-blue)
Border        1px solid rgba(168, 85, 247, 0.2)
Radius        12px
Shadow        0 4px 24px rgba(0, 0, 0, 0.4)
Padding       24px
Hover         translateY(-2px) + violet glow (see below)
```

### Shadows & glow system
HyperFocus Z0ne uses **glow** where most systems use shadow. Two layers:
- **Shadow (depth):** `0 4px 24px rgba(0, 0, 0, 0.4)` — quiet, almost imperceptible. Just lifts the card off the bg.
- **Glow (state):** `0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)` — appears on hover, focus, active. Color matches the element's role (violet for primary, cyan for tech, gold for tokens, mint for success).
- ❌ **Never inner shadow** for "pressed" states — use scale or color shift instead.
- ❌ **Never more than 2 glowing elements visible at once** (outside BROski$Pets, where the rules are looser).

### Hover & press states
- **Hover:** `translateY(-2px)` + glow appears + gradient brightens slightly. 250ms `--ease-smooth`.
- **Press / active:** `transform: scale(0.98)` + glow intensifies briefly.
- **Cards may also tilt** on hover (3D card tilt — perspective(800px) rotateX(4deg) rotateY(-4deg)). Used on pet cards and feature cards.
- **Disabled:** bg `#3D4F6E`, text `#1A2540`, no hover, no glow. Pointer-events allowed for tooltip explaining why.

### Animation philosophy
**Fast feedback. Bouncy on celebration. Smooth on UI.** Three timing buckets:
- `--ease-smooth` (cubic-bezier(0.4, 0, 0.2, 1)) — standard transitions, hover, panels
- `--ease-bounce` (cubic-bezier(0.34, 1.56, 0.64, 1)) — XP fills, level-up bursts, reward pops
- `--ease-sharp` (cubic-bezier(0.4, 0, 1, 1)) — dropdowns, tooltips

Durations: 150ms hover, 300ms panels, 600ms reveals, 1200ms celebrations.

**Signature animations** (live in `colors_and_type.css` keyframes):
- **Border pulse** (active/selected) — 2s violet glow breathing
- **Holographic foil** (Legendary pet cards only) — 3s shifting rainbow gradient
- **Sonar pulse loader** (replaces spinners) — 3 staggered cyan rings expanding
- **XP liquid fill** — bouncy progress bar fill, 1.2s `--ease-bounce`
- **Level-up burst** — purple ring scaling 0 → 3.0 over 0.5s, full-screen
- **Coin drop** — gold coins arc from trigger to balance counter, 0.8s, stagger 0.1s
- **Idle breath** — pet cards scale 1.0 ↔ 1.02 over 3s
- **Cursor sparkle trail** — BROski$Pets hero only, 6–8 particles following cursor

**Reduce-motion override:** every keyframe respects `prefers-reduced-motion` (see `colors_and_type.css`).

### Transparency & blur
Used **sparingly**. Glass panels only for modals/overlays/tooltips: `rgba(15, 27, 53, 0.7)` + `backdrop-filter: blur(12px)` + violet hairline border. Never on main layout cards — kills perf and looks cluttered.

### Imagery
**Cool, holographic, sci-fi.** Brain renders, circuit traces, glowing gyri, starfields. Pet illustrations are colorful neon characters with rarity rings. **Never** stock photography, never warm tones, never grain filters, never b&w. If imagery isn't available, use a placeholder block — never auto-generate AI-art SVGs.

### Layout rules — fixed elements
- **Top HUD bar** is sticky on logged-in views (XP bar, BROski$ balance, streak). Always visible. Background `#111827` with violet/30 bottom border.
- **Sidebar** is fixed-position, never scrolls with content.
- **Lesson player has no sidebar** — full focus mode.
- **Toasts** anchor top-right, slide in from right, auto-dismiss 4s.

### What we avoid (anti-patterns)
- ❌ Bluish-purple gradients with low contrast (we want vivid violet → cyan, not muddy)
- ❌ Cards with rounded corners + colored left-border accents (legacy SaaS trope)
- ❌ Emoji-only feature cards — emoji are punctuation, not the centerpiece
- ❌ Generic Inter-everywhere designs — Space Grotesk does the heavy lifting on display
- ❌ Hand-rolled SVG illustrations of complex things — use placeholders, ask for real art
- ❌ Light gray on white anywhere — we are dark-only

---

## 🎯 ICONOGRAPHY

**Primary system:** [Lucide Icons](https://lucide.dev/) — already used by the live frontend (`lucide-react` import in `Navbar.tsx`). Stroke weight 1.5–2px, sharp corners, geometric. Loaded via CDN: `https://unpkg.com/lucide@latest`.

**Why Lucide:** matches the brand's clean, technical, slightly geometric feel without being bossy or playful. Stroke icons feel right alongside the neon glow effects — filled icons would compete.

**Sizes:** 16px (inline w/ text), 20px (UI defaults), 24px (nav), 32px+ (feature highlights only).

**Color usage:**
- Default state: `--text-secondary` (#8B9CC8) — quiet
- Active/hover: `--neon-cyan` or `--hyper-violet-light`
- Status icons take their semantic color (mint = healthy, amber = warn, red = error)

**Brand emoji set** — used as scannable wayfinding alongside icons:
🧠 (brain / HyperCore) · 🎓 (course) · 🐾 (pets) · ⚡ (speed/momentum) · 🎯 (quests) · 🚀 (ship/launch) · ♾️ (BROski) · 🔥 (streak) · 🪙 (token) · 🎉 (celebration) · ✨ (rare/sparkle) · 🏴󠁧󠁢󠁷󠁬󠁳󠁿 (Welsh roots)

**Future plan** (per the design bible): a custom **HFZ icon set** based on Phosphor — brain, lightning, circuit nodes, coin, portal, pet paw — to give the Z0ne its own glyph personality. Not built yet; until then, Lucide + emoji.

**SVG vs PNG:** SVG everywhere. The only PNG-acceptable asset is the master logo raster (we have the JPG version at `assets/logo-mark.jpg`). All other icons must be SVG (Lucide ships them inline) for crisp scaling at any size.

> **Substitution flag:** the design bible mentions a future "HFZ icon set". It does not exist yet — Lucide is the documented stand-in. Flag if/when the custom set ships so we can swap.

---

## ♿ ACCESSIBILITY BASELINE (non-negotiable)

- **WCAG AA minimum** for text contrast — AA+ preferred
- **Focus rings always visible** — the system uses `outline: 2px solid var(--neon-cyan)`; never `outline: none` without a custom replacement
- **All animations respect `prefers-reduced-motion`** — already wired in `colors_and_type.css`
- **Alt text on every image** — descriptive, not "image of…"
- **ARIA labels** on every icon-only button
- **Tab order** logical, never skips interactive elements
- **Min text size 16px** body, 14px labels — never smaller
- **Min touch target** 44px on mobile

---

## 🔧 SESSION-START CHECKLIST

Every time you open a design file or start a new component, run this:

```
[ ] Read CLAUDE_DESIGN_STYLE.md (or this README) if it's been > a week
[ ] Check assets/ folder for latest logo before designing
[ ] Use color tokens from colors_and_type.css — never raw hex
[ ] Mobile view first — design at 375px before expanding
[ ] Run a contrast check on every text + bg combo before finalising
[ ] Add prefers-reduced-motion fallback for any new animation
```

---

## 🐶 A note from Lyndz

> *This ecosystem was built by a neurodivergent brain, for neurodivergent brains. Every pixel, every animation, every word in the UI is a deliberate choice to make someone feel like they belong here — like the Z0ne was made for them. Because it was.*
>
> *Keep it weird. Keep it warm. Keep it Welsh. 🏴󠁧󠁢󠁷󠁬󠁳󠁿*
>
> — @welshDog

---

**HyperFocus Z0ne** — Enter the Z0ne. Build the future.
