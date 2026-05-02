# 🔤 HyperFocus Z0ne — Brand fonts

The design system warning **"Missing brand fonts"** clears once these three families are present in `assets/fonts/`. Until then, the system falls back to the Google Fonts CDN (already wired in `colors_and_type.css`) — that works for previews, but production builds should self-host for performance + offline + GDPR.

All three families are Open Font License (OFL) — free for commercial use, redistributable.

---

## 📁 Target folder structure

```
assets/
└── fonts/
    ├── space-grotesk/
    │   ├── SpaceGrotesk-Regular.woff2     (400)
    │   ├── SpaceGrotesk-Medium.woff2      (500)
    │   ├── SpaceGrotesk-SemiBold.woff2    (600)   ← H3
    │   ├── SpaceGrotesk-Bold.woff2        (700)   ← H1, H2
    │   └── SpaceGrotesk-ExtraBold.woff2   (800)   ← Display
    ├── inter/
    │   ├── Inter-Regular.woff2            (400)   ← Body
    │   ├── Inter-Medium.woff2             (500)
    │   ├── Inter-SemiBold.woff2           (600)   ← H4, Labels, Buttons
    │   ├── Inter-Bold.woff2               (700)
    │   └── Inter-ExtraBold.woff2          (800)
    └── jetbrains-mono/
        ├── JetBrainsMono-Regular.woff2    (400)   ← Default mono
        ├── JetBrainsMono-Medium.woff2     (500)
        └── JetBrainsMono-SemiBold.woff2   (600)
```

**Format:** `.woff2` only. WOFF2 is supported by all browsers we target, ships smaller than WOFF/TTF, and is the only format we'll declare in `@font-face`. Do **not** upload `.ttf` or `.otf` — that defeats the whole reason to self-host.

**Naming:** `<FamilyPascalCase>-<WeightName>.woff2`. Match exactly — the loader expects these names.

---

## ⚖️ Weight inventory · why each one

| Family | Weights needed | Used for |
|---|---|---|
| **Space Grotesk** | **400, 500, 600, 700, 800** | Display headings, H1–H3, brand wordmark |
| **Inter** | **400, 500, 600, 700, 800** | All UI body, labels, buttons, H4 |
| **JetBrains Mono** | **400, 500, 600** | Code, terminal output, monograms, stat numerals |

Don't ship the unused weights (Thin, ExtraLight, Light, Black). Per-file overhead × per-route adds up.

---

## ⬇️ Where to download

All three are first-party on Google Fonts. Use **[google-webfonts-helper](https://gwfh.mranftl.com/fonts)** — it bundles the woff2 files in the right names automatically. Pick **Modern Browsers** (woff2 only) and **Latin** subset (Latin-Ext if your audience needs it).

| Family | Google Fonts link | Direct GitHub source |
|---|---|---|
| Space Grotesk | `fonts.google.com/specimen/Space+Grotesk` | `github.com/floriankarsten/space-grotesk` |
| Inter | `fonts.google.com/specimen/Inter` | `github.com/rsms/inter` |
| JetBrains Mono | `fonts.google.com/specimen/JetBrains+Mono` | `github.com/JetBrains/JetBrainsMono` |

---

## 🧩 Loader CSS — drop into `colors_and_type.css`

Once the files are uploaded, **replace** the `@import url('https://fonts.googleapis.com/...')` line at the top of `colors_and_type.css` with this `@font-face` block. Everything below it (the variables, the `html` rule, etc.) stays untouched — `--font-display`, `--font-body`, `--font-mono` already point at these family names.

```css
/* Space Grotesk — display + headings */
@font-face { font-family: 'Space Grotesk'; src: url('./assets/fonts/space-grotesk/SpaceGrotesk-Regular.woff2')    format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Space Grotesk'; src: url('./assets/fonts/space-grotesk/SpaceGrotesk-Medium.woff2')     format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'Space Grotesk'; src: url('./assets/fonts/space-grotesk/SpaceGrotesk-SemiBold.woff2')   format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: 'Space Grotesk'; src: url('./assets/fonts/space-grotesk/SpaceGrotesk-Bold.woff2')       format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Space Grotesk'; src: url('./assets/fonts/space-grotesk/SpaceGrotesk-ExtraBold.woff2')  format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }

/* Inter — body + UI */
@font-face { font-family: 'Inter'; src: url('./assets/fonts/inter/Inter-Regular.woff2')    format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('./assets/fonts/inter/Inter-Medium.woff2')     format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('./assets/fonts/inter/Inter-SemiBold.woff2')   format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('./assets/fonts/inter/Inter-Bold.woff2')       format('woff2'); font-weight: 700; font-style: normal; font-display: swap; }
@font-face { font-family: 'Inter'; src: url('./assets/fonts/inter/Inter-ExtraBold.woff2')  format('woff2'); font-weight: 800; font-style: normal; font-display: swap; }

/* JetBrains Mono — code + terminal */
@font-face { font-family: 'JetBrains Mono'; src: url('./assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2')  format('woff2'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'JetBrains Mono'; src: url('./assets/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2')   format('woff2'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'JetBrains Mono'; src: url('./assets/fonts/jetbrains-mono/JetBrainsMono-SemiBold.woff2') format('woff2'); font-weight: 600; font-style: normal; font-display: swap; }
```

**Notes**
- `font-display: swap` — text renders in fallback first, swaps to brand font when ready. Better LCP, no FOIT.
- `font-style: normal` everywhere — **the brand uses no italic faces** (dyslexia-hostile). Don't ship italic .woff2 files.
- For the Vite/Next frontend, paths should be relative to the served `public/` or imported from `src/assets/fonts/`. Adjust the URL prefix to match your bundler.

---

## ⚡ Preload the critical faces

Drop into `<head>` to avoid the late-paint flash on hero text:

```html
<link rel="preload" href="/assets/fonts/space-grotesk/SpaceGrotesk-ExtraBold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/space-grotesk/SpaceGrotesk-Bold.woff2"      as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter/Inter-Regular.woff2"                  as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter/Inter-SemiBold.woff2"                 as="font" type="font/woff2" crossorigin>
```

Only preload what's above the fold. JetBrains Mono doesn't need preloading — terminal panels are below-the-fold by design.

---

## ✅ Acceptance checklist

- [ ] All 13 `.woff2` files are in `assets/fonts/<family>/`
- [ ] Each file matches the exact name in the table above
- [ ] No `.ttf`, `.otf`, `.woff` (v1), or italic faces uploaded
- [ ] `@import url('https://fonts.googleapis.com/...')` removed from `colors_and_type.css`
- [ ] `@font-face` block from this file pasted in its place
- [ ] DevTools → Network → Fonts shows local files, no `fonts.gstatic.com` requests
- [ ] DevTools → Computed → `font-family` shows `"Space Grotesk"` (not the system fallback) on H1

Once all 13 files land, the system will switch from "Missing brand fonts" to "Self-hosted ✓".

---

## 🪪 Licenses

| Family | License | Attribution required |
|---|---|---|
| Space Grotesk | SIL Open Font License 1.1 | No (good practice in /credits) |
| Inter | SIL Open Font License 1.1 | No |
| JetBrains Mono | SIL Open Font License 1.1 | No |

Copy each font's `OFL.txt` into the family folder alongside the .woff2 files when redistributing.
