# LOOP_FRONTEND_EVAL.md — Course Frontend-Integrity Eval Loop
> Keeps the deployable course site green: no push that breaks the production
> build. Sibling to LOOP_EVO_EVAL / LOOP_MANIFEST_EVAL / LOOP_METADATA_EVAL.

---

## The Loop (LOOP_TEMPLATE shape)

**REPO:** Hyper-Vibe-Coding-Course

**GOAL:** Every push keeps the frontend production build green — no type/import
break ships a broken course site.

**SUCCESS TEST:** `npm --prefix frontend run build` exits `0`. Today: **builds clean (~14s).**

---

## Trigger — local git pre-push GATE

GitHub Actions is billing-locked, so the live trigger is local (same pattern as evo / SDK / pets):

- **Hook:** `scripts/git_hooks/pre-push` → installed at `.git/hooks/pre-push`
- Runs `vite build` before **every push**; **blocks** if it fails (prints the build error).
- Skips cleanly if `frontend/node_modules` is absent (warns to `npm --prefix frontend install`).
- **Install (after clone):** `cp scripts/git_hooks/pre-push .git/hooks/pre-push` (`chmod +x` on *nix)
- **Override:** `git push --no-verify` (emergency only)

> ⚠️ **Style lint is NOT gated yet** — the repo carries eslint debt (`prefer-const`,
> unused-vars) that doesn't break the app. The build gate catches "does it actually
> break". A lint gate is a future loop once the debt is cleared.

## Closing the circle
`HYPERFOCUS-LOOPS/scripts/run_course_eval_loop.py` runs the build + records the verdict
in `LOOP_REGISTRY.md` (green → `done`, fail → `blocked`).

## Exit / Done
- **Done** = pre-push gate green + loop logged.
- **Blocked** = the build failed → fix the type/import error, re-run, push. NICE ONE BROski♾️
