# Course API Cleanup + Auth Bugs (P0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `apps/api` single-truth (archive TS/Prisma scaffold) and close BUG-013/BUG-014 in `frontend/src/pages/Auth.tsx`.

**Architecture:** Keep `apps/api/src/index.js` as the only runnable server. Archive the unused TS/Prisma scaffold into a clearly named folder. Update Auth register validation and UX with existing Zod/react-hook-form patterns.

**Tech Stack:** Vite + React, react-hook-form + Zod, Node (Express), git.

---

### Task 1: Archive unused TS/Prisma API scaffold

**Files:**
- Create: `apps/api/src/_archive_ts_prisma_api/index.ts`
- Create: `apps/api/src/_archive_ts_prisma_api/middleware/requireAuth.ts`
- Create: `apps/api/src/_archive_ts_prisma_api/routes/courses.ts`
- Create: `apps/api/src/_archive_ts_prisma_api/seed.ts`
- Delete: `apps/api/src/index.ts`
- Delete: `apps/api/src/middleware/requireAuth.ts`
- Delete: `apps/api/src/routes/courses.ts`
- Delete: `apps/api/src/seed.ts`

- [ ] **Step 1: Copy TS files into archive folder (no edits)**
- [ ] **Step 2: Delete original TS scaffold files**
- [ ] **Step 3: Verify `apps/api/package.json` still points to `src/index.js`**
- [ ] **Step 4: Add `apps/api/README.md` clarifying runtime entrypoint**
- [ ] **Step 5: Commit**

### Task 2: Fix BUG-013 (password strength validation)

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`

- [ ] **Step 1: Locate the register Zod schema**
- [ ] **Step 2: Add password rules**

```ts
password: z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'One uppercase letter required')
  .regex(/[0-9]/, 'One number required')
```

- [ ] **Step 3: Ensure UI shows validation errors (existing pattern)**
- [ ] **Step 4: Commit**

### Task 3: Fix BUG-014 (post-signup success UX)

**Files:**
- Modify: `frontend/src/pages/Auth.tsx`

- [ ] **Step 1: Add a success state**

```ts
const [successMsg, setSuccessMsg] = useState<string | null>(null)
```

- [ ] **Step 2: On successful signup, set the message and avoid immediate redirect**
- [ ] **Step 3: Render the success message in the register view**
- [ ] **Step 4: Commit**

### Task 4: Verification

**Files:**
- None

- [ ] **Step 1: Frontend lint**
  - Run: `npm run lint`
  - CWD: `hyper-vibe-coding-course/frontend`
  - Expected: exit code 0
- [ ] **Step 2: Frontend build**
  - Run: `npm run build`
  - CWD: `hyper-vibe-coding-course/frontend`
  - Expected: exit code 0
- [ ] **Step 3: Update bug tracker (optional, if used as source-of-truth)**
  - Mark BUG-013 and BUG-014 as fixed in `docs/BUG_TRACKER.md`
- [ ] **Step 4: Final commit**

