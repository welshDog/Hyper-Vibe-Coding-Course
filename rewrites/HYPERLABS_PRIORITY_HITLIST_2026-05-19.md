# 🎯 HyperLabs (Vibe Labs) — Priority Hit-List

> Scoped handover for the **Vibe Labs page** track only. NOT the M1–M10
> course-module track — different surface, different review, different
> cadence. Don't merge the two in planning.
> Date: 2026-05-19 · Pairs with `HYPERLABS_PAGE_REVIEW_2026-05-19.md`,
> `SESSION_SNAPSHOT_2026-05-19.md`, `NEXT_SESSION_HANDOVER_2026-05-19.md`.

---

## Rating: **9.5 / 10** (evidence, not vibes)

Original review = 9/10 after Sprints 1&2. This session moved it up:

| Sprint | Shipped | Verified |
|---|---|---|
| 1 — route code-split + error boundary | `0cd772a` | live |
| 2 — web3 deferred (`/pets`-only) | `4c16b0c` | live · entry 1,270→~61 kB gzip |
| 3 — 16px floor · self-host fonts · 44px targets · a11y cert | `7a5585a` `df8eac2` `45e0acd` `87331c5` `a5ec6da` | live · axe GREEN ×2 · **Lighthouse A11Y 100 / BP 100 ×2** |
| 4 — anon→signup conversion | `a12ecd0` | **live (Vercel-MCP READY)** · anon-flow e2e 3/3 |
| + lock-in beat ×5 labs | _this commit_ | tsc/eslint/build green · axe regression ✓ |

**Why 9.5 not 10 (honest):** real-field CWV, `/pets` wallet smoke, and the
real post-login reconcile are **human gates** not yet verified. No inflation.

---

## 🟢 Do next

1. **Confirm fonts/CWV with real users** — Vercel → Speed Insights (LCP/INP/CLS
   before/after Sprint 1–3). Replaces the review's *estimated* CWV.
2. **`/pets` wallet smoke** — Connect Wallet → RainbowKit → mint inits
   (human; MetaMask can't be automated).
3. **Real post-login reconcile integration check** — sign up → confirm email →
   log in with anon localStorage progress → assert banked in order + toast.
   (Server RPC is idempotent + level-locked + real-user tested 2026-05-19;
   this closes the last Sprint-4 honest gap.)

## 🟡 Do later (correctly parked — do NOT pull forward)

- LandingPage band anon-awareness ("you've earned 3 — bank them"). Deferred
  from Sprint 4 by decision.
- Delete the dead `styles/globals.css` `@font-face` block (unimported; live
  fonts live in `index.css`, flagged inline there).
- LandingPage's ~25 inline sub-16px font sizes — catalogued in Sprint 3,
  deferred (own pass, needs per-element visual judgement).
- Review §6 backlog: shareable badge OG cards · "Wall of Ships" UGC marquee ·
  L1 interactive mini-demo · per-route `<title>`/meta/OG · prefetch next
  level's chunk on hover.

## ⚪ Leave alone (locked — do not re-architect)

- The 7-beat arc, level registry, Atomic Scoping framing.
- Server-authoritative reward model (`claim_level_reward` RPC = sole truth).
- The funnel shape (free taste → earn → bank-gated signup).
- Three-chrome-system separation; web3 `/pets`-only isolation.

---

## ⚠️ Load-bearing (carried from the main handover)

- **Parallel git workflow** — Lyndz's tooling auto-commits/pushes; always
  `git fetch` + check `origin/main` before pushing; never force-push.
- **Vercel Attack Challenge Mode** — don't curl-poll prod; deploy-truth =
  Vercel MCP `get_deployment` (team `team_Uy6hGYD4AZqclHqUeEsmZuDP`).
- **Lighthouse** — local `vite preview` + system Chrome; cwd-relative output.
- Reusable cert: `tests/vibe-labs-a11y.spec.ts` + `tests/vibe-labs-anon-flow.spec.ts`
  via `npm run test:e2e`. Copy the pattern for the auth E2E.

## Next session — first move

Close the 3 🟢 human gates (Speed Insights read · `/pets` wallet · real
reconcile check). Page backbone is done; remaining work is verification +
parked polish, not rebuilds.

---

*Built by Lyndz Williams + Claude (Opus 4.7) ♾️🚀*
*Hyperfocus z0ne — Stop apologising for your brain. Start building.*
