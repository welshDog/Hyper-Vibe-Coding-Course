# 🛠️ Development Guide (Phase 2)

## 🏗️ Architecture
We use **Vite** for the frontend build system and **Playwright** for End-to-End (E2E) testing.
The source code lives in `frontend/`.

## 🚀 Quick Start
```bash
# 1. Install Dependencies
cd frontend
npm install

# 2. Start Dev Server
npm run dev
# -> http://localhost:5173

# 3. Run Tests
npx playwright test
```

## 🧪 Testing Strategy
We use Playwright to test the *actual* rendered page, not just the HTML source.
- **Location**: `frontend/tests/`
- **Critical Flows**:
  - Landing page loads correctly
  - CTA buttons link to Gumroad/Discord
  - Analytics script is present
  - Mobile viewport responsiveness

## 📦 Building for Production
The CI pipeline handles this automatically, but you can build locally:
```bash
npm run build
# Output: dist/
```

## 🔄 Migration Notes (From Phase 1)
- The old `frontend/public/index.html` has been moved to `frontend/index.html`.
- Python-based E2E tests have been replaced by `landing.spec.ts`.
- CI now runs `npm ci` and `npx playwright test`.
