// Husky install gate (official husky v9 pattern).
//
// Locally this wires up git hooks as normal. On Vercel / CI there is no
// `.git` at frontend/ (the git root is the repo root, one level up), which
// spewed `prepare > husky — .git can't be found` on every build. Skipping
// husky in CI / production removes that noise without touching local DX.
if (
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NODE_ENV === 'production'
) {
  process.exit(0);
}

const husky = (await import('husky')).default;
husky();
