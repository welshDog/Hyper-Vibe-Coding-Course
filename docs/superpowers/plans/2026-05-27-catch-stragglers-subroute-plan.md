# Catch Stragglers (Mission Control Sub-route) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/admin/mission-control/catch-stragglers` route that renders the existing Catch Stragglers UI and can call the Mission Control backend via env-based API base.

**Architecture:** Admin-only React Router route under `AdminRoute role="admin"`. A small page component renders `CatchStragglers`. Fetch calls in `CatchStragglers.jsx` use `VITE_MISSION_CONTROL_API_URL` when provided.

**Tech Stack:** React 19 + React Router DOM 7 + Vite.

---

## File Map

**Create**
- `frontend/src/pages/admin/catch-stragglers.tsx`

**Modify**
- `frontend/src/App.tsx`
- `frontend/src/pages/MissionControl.tsx`
- `frontend/components/mission-control/CatchStragglers.jsx`
- `frontend/.env.example`

---

### Task 1: Add Catch Stragglers Page

**Files:**
- Create: `frontend/src/pages/admin/catch-stragglers.tsx`

- [ ] **Step 1: Create the page**

```tsx
import CatchStragglers from '../../../components/mission-control/CatchStragglers.jsx'

export default function CatchStragglersPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <CatchStragglers />
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Verify TypeScript can import the JSX component**

Expected: no TS errors in editor for the import.

---

### Task 2: Register Route + Lazy Import

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Add lazy import**

Add near other admin page imports:

```ts
const CatchStragglersPage = lazy(() => import('./pages/admin/catch-stragglers'))
```

- [ ] **Step 2: Add route under AdminRoute**

Add alongside existing mission control routes:

```tsx
<Route path="admin/mission-control/catch-stragglers" element={<CatchStragglersPage />} />
```

---

### Task 3: Add Link From Mission Control Launchpad

**Files:**
- Modify: `frontend/src/pages/MissionControl.tsx`

- [ ] **Step 1: Add Link import**

```ts
import { Link } from 'react-router-dom'
```

- [ ] **Step 2: Add CTA link to sub-route**

Add a secondary button near the “Open Mission Control” button:

```tsx
<Link
  to="/admin/mission-control/catch-stragglers"
  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-hfz-violet-light/10 border border-hfz-violet-light/40 text-hfz-violet-light font-bold hover:bg-hfz-violet-light/20 hover:border-hfz-violet-light transition-colors shrink-0"
>
  Open Catch Stragglers (local)
</Link>
```

---

### Task 4: Add Env-Based API Base In CatchStragglers

**Files:**
- Modify: `frontend/components/mission-control/CatchStragglers.jsx`

- [ ] **Step 1: Add API base helpers**

```js
const API_BASE = (import.meta.env.VITE_MISSION_CONTROL_API_URL || '').replace(/\/$/, '')
const api = (path) => (API_BASE ? `${API_BASE}${path}` : path)
```

- [ ] **Step 2: Update fetch calls**

Replace:
- `fetch('/api/agent/catch-stragglers')`
- `fetch('/api/agent/send-dm', ...)`
- `fetch('/api/agent/snooze-dm', ...)`

With:
- `fetch(api('/api/agent/catch-stragglers'))`
- `fetch(api('/api/agent/send-dm'), ...)`
- `fetch(api('/api/agent/snooze-dm'), ...)`

---

### Task 5: Document Env Var

**Files:**
- Modify: `frontend/.env.example`

- [ ] **Step 1: Add optional API URL**

Add below `VITE_MISSION_CONTROL_URL`:

```env
# Optional: if Mission Control backend is not same-origin, set this.
VITE_MISSION_CONTROL_API_URL=http://localhost:8088
```

---

### Task 6: Verify Build

- [ ] **Step 1: Install deps (if needed)**

Run (from repo root):

```powershell
cd frontend
npm install
```

- [ ] **Step 2: Run build**

```powershell
cd frontend
npm run build
```

Expected: build succeeds.

