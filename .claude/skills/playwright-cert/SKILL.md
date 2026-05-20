---
name: playwright-cert
description: One-shot a11y + auth E2E via the HFZ Playwright harness. Kills "human must test" excuses.
triggers:
  - test
  - playwright
  - e2e
  - end to end
  - accessibility
  - a11y
  - auth test
  - run tests
  - does it work
---

# 🎭 playwright-cert — No More "Human Must Test" Excuses

> Every feature ships with a test. Every test runs green before merge. Always.

---

## 🏗️ THE HFZ TEST HARNESS

```
tests/
  auth.spec.ts              → Mocked auth harness (reference for ALL new tests)
  stripe-checkout.spec.ts   → Stripe Path A regression (added 2026-05-20)
  vibe-labs-a11y.spec.ts    → A11y + navigation tests
```

**Golden rule:** Mirror `auth.spec.ts` for any test needing auth.

---

## ✅ TEST CHECKLIST — Before Every Merge

```
[ ] npx playwright test — ALL green
[ ] No skipped tests without documented reason
[ ] New feature = new test (no exceptions)
[ ] Auth flows use mocked-auth harness (not real credentials)
[ ] Stripe flows mock API response + intercept redirect
[ ] No real API keys in test files EVER
```

---

## 🧪 WHAT TO TEST PER FEATURE

### New pricing tier:
```
- Tier card renders with correct price
- CTA fires with correct tier slug
- Monthly toggle switches price correctly
- Checkout redirects to Stripe (mocked)
- '#' fallback shows error (not silent fail)
```

### Auth flow:
```
- Sign up renders + submits
- Sign in renders + submits
- Protected route redirects unauthenticated user
- Token balance visible after auth
```

### Module progress:
```
- Module loads for enrolled user
- Progress saves on lesson complete
- BROski$ awarded on module complete
- Certificate generates on course complete
```

---

## 🔧 RUNNING TESTS

```bash
npx playwright test                                    # All tests
npx playwright test tests/stripe-checkout.spec.ts      # Specific file
npx playwright test --ui                               # Debug mode
npx playwright test --headed                           # See the browser
```

---

## 🚨 TEST COUNT TRUTH

```
As of 2026-05-20: 251 passed / 6 skipped
Never cite stale test counts in marketing copy.
Always run tests to get current count before updating docs.
```

---

## 🤖 CLAUDE BEHAVIOUR RULES

- NEVER say "a human should test this" without first writing an automated test
- Every new Playwright test added to relevant spec file
- Test naming: `[feature]-[type].spec.ts`
- After writing tests: run them, confirm green, THEN commit
- If genuinely unmockable (real Stripe card flow) — document WHY in the test file

---

*Part of the HFZ Claude Skill Pack | welshDog 🐶♾️*
