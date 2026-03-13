# 🏷️ GITHUB ISSUES TEMPLATE - SPRINT TASKS

Copy-paste these issues into your GitHub repo to track Week 1-4 progress.

Use GitHub Projects board to organize into:
- Backlog
- Week 1
- Week 2
- Week 3
- Week 4
- In Progress
- Done

---

## WEEK 1: REPOSITORY FOUNDATION

### MONDAY TASKS

#### Issue: Reorganize repository structure for Phase 1
```
Title: Reorganize repository structure for Phase 1
Type: Task
Labels: Week 1, Organization, Priority-1
Assignee: You

Description:

## Goal
Transform root-level markdown files into organized structure.

## Tasks
- [ ] Create new folders: `docs/course/`, `docs/guides/`, `frontend/public/`, `backend/app/`, etc.
- [ ] Move course content files into `docs/guides/`:
  - `00_QUICK_START_GUIDE.md` → `docs/guides/QUICK_START.md`
  - `01_COURSE1_COMPLETE_CURRICULUM.md` → `docs/course/CURRICULUM.md`
  - `03_EMAIL_SEQUENCES.md` → `docs/guides/EMAIL_SEQUENCES.md`
  - `04_GAMIFICATION_SYSTEM.md` → `docs/guides/GAMIFICATION.md`
  - `05_MARKETING_ASSETS.md` → `docs/guides/MARKETING.md`
  - `06_4WEEK_LAUNCH_PLAN.md` → `docs/guides/LAUNCH_PLAN.md`
- [ ] Move landing page: `02_LANDING_PAGE.html` → `frontend/public/index.html`
- [ ] Create LICENSE file (MIT)
- [ ] Create CHANGELOG.md template
- [ ] Update README.md to point to docs/

## Acceptance Criteria
- [ ] No files at root except config + README + LICENSE + CHANGELOG
- [ ] All docs organized in `docs/` folder
- [ ] Course content in `docs/course/`
- [ ] Marketing guides in `docs/guides/`
- [ ] Landing page in `frontend/public/`
- [ ] All tests pass: `git status` is clean

## Time Estimate
2-3 hours
```

---

### TUESDAY TASKS

#### Issue: Write SETUP.md documentation
```
Title: Write SETUP.md - Installation and environment setup guide
Type: Documentation
Labels: Week 1, Documentation, Priority-1
Assignee: You

Description:

## Goal
Create comprehensive setup guide so users can get started in 5-10 minutes.

## Content Required
- Prerequisites (Node 18+, Python 3.10+, Git)
- Clone instructions
- Frontend setup (`npm install`)
- Backend setup (`pip install -r requirements.txt`)
- Environment file creation from `.env.example`
- Verification steps (run dev server, test API health)
- Troubleshooting section

## Acceptance Criteria
- [ ] File exists at `docs/SETUP.md`
- [ ] Contains 300+ words
- [ ] All steps are testable
- [ ] Includes command-line examples
- [ ] Troubleshooting section for common issues

## Time Estimate
1.5 hours
```

#### Issue: Write ARCHITECTURE.md - System design overview
```
Title: Write ARCHITECTURE.md - System design and component overview
Type: Documentation
Labels: Week 1, Documentation, Priority-1
Assignee: You

Description:

## Goal
Explain how the entire system works at a high level.

## Content Required
- Phase 0-3 timeline and what each does
- Tech stack breakdown (React/Vite, FastAPI, Supabase)
- Development environments (local, staging, production)
- Data flow diagram (frontend → backend → database)
- Deployment strategy for each part
- Key architectural decisions and why

## Acceptance Criteria
- [ ] File exists at `docs/ARCHITECTURE.md`
- [ ] Contains 500+ words
- [ ] Includes ASCII diagram of data flow
- [ ] Clear explanation of each component
- [ ] Deployment pipeline documented

## Time Estimate
1.5 hours
```

#### Issue: Write ENVIRONMENT.md - Environment variables guide
```
Title: Write ENVIRONMENT.md - Environment variables documentation
Type: Documentation
Labels: Week 1, Documentation
Assignee: You

Description:

## Goal
Document all environment variables needed for development and production.

## Content Required
- Frontend `.env.local` variables (API URL, course platform key, etc.)
- Backend `.env` variables (database, JWT secret, Supabase, etc.)
- Explanation of what each variable does
- Example values (safe examples, not real secrets)
- Which are required vs. optional

## Acceptance Criteria
- [ ] File exists at `docs/ENVIRONMENT.md`
- [ ] All env vars documented
- [ ] `.env.example` files created in `frontend/` and `backend/`
- [ ] Clear which vars are required

## Time Estimate
1 hour
```

#### Issue: Write DEPLOYMENT.md - Deployment strategies
```
Title: Write DEPLOYMENT.md - Deployment guide for all parts
Type: Documentation
Labels: Week 1, Documentation
Assignee: You

Description:

## Goal
Document how to deploy frontend, backend, and database.

## Content Required
- GitHub Pages deployment (landing page + docs)
- Vercel deployment (frontend app)
- Fly.io / Render deployment (backend API)
- Database migrations strategy
- Environment secrets management
- CI/CD pipeline overview

## Acceptance Criteria
- [ ] File exists at `docs/DEPLOYMENT.md`
- [ ] Contains 300+ words
- [ ] Includes step-by-step deployment instructions
- [ ] Covers all three components (FE, BE, DB)
- [ ] Security best practices noted

## Time Estimate
1.5 hours
```

---

### WEDNESDAY TASKS

#### Issue: Create course-content folder structure and populate Week 1
```
Title: Create course-content structure with week 1-4 folders
Type: Task
Labels: Week 1, Organization
Assignee: You

Description:

## Goal
Move course curriculum into properly organized `docs/course-content/` structure.

## Tasks
- [ ] Create folders: `docs/course-content/week-1/`, `week-2/`, `week-3/`, `week-4/`
- [ ] For each week, create files:
  - `01_OBJECTIVES.md`
  - `02_VIDEO_SCRIPTS.md`
  - `03_PROJECT_BRIEF.md`
  - `04_QUIZ.md`
  - `05_RESOURCES.md`
- [ ] Populate Week 1 completely (move from 01_COURSE1_COMPLETE_CURRICULUM.md)
- [ ] Create placeholder content for Weeks 2-4 (title + "Coming soon")
- [ ] Create `docs/course-content/README.md` (overview)

## Acceptance Criteria
- [ ] All folders exist
- [ ] Week 1 populated with full content
- [ ] Weeks 2-4 have placeholder structure
- [ ] README exists in course-content/
- [ ] File organization is clear

## Time Estimate
2.5 hours
```

---

### THURSDAY TASKS

#### Issue: Write FAQ.md - Frequently asked questions
```
Title: Write FAQ.md - Common questions and answers
Type: Documentation
Labels: Week 1, Documentation
Assignee: You

Description:

## Goal
Create FAQ section to reduce support burden.

## Content Required
- Setup questions (how to get started, troubleshooting)
- Course questions (videos, enrollment, retakes)
- Technical questions (API, database, deployment)
- Community questions (Discord, contributing)

## Acceptance Criteria
- [ ] File exists at `docs/FAQ.md`
- [ ] Minimum 10 Q&A pairs
- [ ] Covers setup, course, tech, community sections
- [ ] Links to relevant docs
- [ ] Easy to scan format

## Time Estimate
1.5 hours
```

#### Issue: Write CONTRIBUTING.md - How to contribute guide
```
Title: Write CONTRIBUTING.md - Contribution guidelines
Type: Documentation
Labels: Week 1, Documentation
Assignee: You

Description:

## Goal
Explain how people can contribute to the project.

## Content Required
- Types of contributions (bugs, docs, features, course content)
- Development setup (points to SETUP.md)
- Code standards (formatting, testing, commit messages)
- Pull request process
- Community guidelines

## Acceptance Criteria
- [ ] File exists at `docs/CONTRIBUTING.md`
- [ ] Explains all contribution types
- [ ] Clear PR process
- [ ] Community guidelines present
- [ ] Points to relevant tools (ESLint, Prettier, etc.)

## Time Estimate
1 hour
```

#### Issue: Update CI workflow for new repo structure
```
Title: Update .github/workflows/ci.yml for new structure
Type: Task
Labels: Week 1, CI/CD
Assignee: You

Description:

## Goal
Ensure CI pipeline still works with reorganized structure.

## Tasks
- [ ] Verify markdownlint still runs
- [ ] Update paths if needed
- [ ] Prepare workflow for frontend linting (Week 3)
- [ ] Prepare workflow for backend testing (Week 3)

## Acceptance Criteria
- [ ] CI workflow runs successfully
- [ ] Markdown lint passes
- [ ] No broken paths
- [ ] Ready for Phase 1 additions

## Time Estimate
1 hour
```

---

### FRIDAY-SUNDAY TASKS

#### Issue: Week 1 Review and final commit
```
Title: Week 1 Review - Repository foundation complete
Type: Task
Labels: Week 1, Review
Assignee: You

Description:

## Goal
Final review and commit of Week 1 work.

## Checklist
- [ ] Review entire repo structure
- [ ] Verify no broken links in docs
- [ ] Run markdownlint locally
- [ ] Commit with message: "docs: week 1 complete - repo reorganization"
- [ ] Create GitHub release v0.1.0-week1
- [ ] Plan Week 2 in detail

## Acceptance Criteria
- [ ] All Week 1 issues closed
- [ ] Repo is clean and organized
- [ ] CI passes
- [ ] Ready to start Week 2

## Time Estimate
1.5 hours
```

---

---

## WEEK 2: COURSE CONTENT + LANDING PAGE DEPLOYMENT

### MONDAY TASKS

#### Issue: Finalize Week 1 curriculum - Complete
```
Title: Finalize Week 1 curriculum - Objectives, scripts, project, quiz
Type: Task
Labels: Week 2, Course-Content, Priority-1
Assignee: You

Description:

## Goal
Complete all Week 1 course materials.

## Tasks
- [ ] Finalize `01_OBJECTIVES.md` (100% complete)
- [ ] Finalize `02_VIDEO_SCRIPTS.md` (all 4 video scripts)
- [ ] Finalize `03_PROJECT_BRIEF.md` (with rubric)
- [ ] Finalize `04_QUIZ.md` (10 questions)
- [ ] Create `05_RESOURCES.md` (links and references)

## Acceptance Criteria
- [ ] All files completed
- [ ] Learning objectives are clear
- [ ] Video scripts have timings
- [ ] Project brief is detailed with step-by-step
- [ ] Grading rubric is clear
- [ ] Quiz questions are well-written

## Time Estimate
3 hours
```

---

### TUESDAY-WEDNESDAY TASKS

#### Issue: Deploy landing page to GitHub Pages
```
Title: Deploy landing page to GitHub Pages
Type: Task
Labels: Week 2, Deployment, Priority-1
Assignee: You

Description:

## Goal
Get landing page live and accessible.

## Tasks
- [ ] Review `frontend/public/index.html` for responsiveness
- [ ] Test in browser dev tools (mobile + desktop)
- [ ] Add SEO meta tags
- [ ] Verify GitHub Pages settings
- [ ] Trigger Pages deployment
- [ ] Test landing page loads at GitHub URL
- [ ] Add custom domain (optional)
- [ ] Verify HTTPS enabled
- [ ] Test email signup form

## Acceptance Criteria
- [ ] Landing page live at GitHub Pages URL
- [ ] Mobile responsive ✓
- [ ] HTTPS enabled ✓
- [ ] Email signup working ✓
- [ ] All links functional ✓

## Time Estimate
3 hours
```

---

### THURSDAY TASKS

#### Issue: Draft Week 2 curriculum
```
Title: Draft Week 2 curriculum - Interactive Apps
Type: Task
Labels: Week 2, Course-Content
Assignee: You

Description:

## Goal
Extract and populate Week 2 content from main curriculum.

## Tasks
- [ ] Move Week 2 objectives from main curriculum
- [ ] Move Week 2 video scripts
- [ ] Move Week 2 project brief (Mood Tracker)
- [ ] Move Week 2 quiz
- [ ] Create resources for Week 2

## Acceptance Criteria
- [ ] All Week 2 files created
- [ ] Content extracted and moved
- [ ] Structure matches Week 1

## Time Estimate
2 hours
```

#### Issue: Write course platform setup guide
```
Title: Write course platform setup guide
Type: Documentation
Labels: Week 2, Documentation
Assignee: You

Description:

## Goal
Document how to add courses to Teachable/Podia/etc.

## Content Required
- Choosing which platform
- Account setup
- Creating course structure
- Uploading videos
- Connecting email
- Setting up payments
- Integration options

## Acceptance Criteria
- [ ] File exists at `docs/guides/COURSE_PLATFORM_SETUP.md`
- [ ] Step-by-step instructions
- [ ] Screenshots (optional)

## Time Estimate
1.5 hours
```

---

### FRIDAY-SUNDAY TASKS

#### Issue: Week 2 Review - Content and landing page complete
```
Title: Week 2 Review - Course content + landing page live
Type: Task
Labels: Week 2, Review
Assignee: You

Description:

## Goal
Verify everything from Week 2 is working.

## Checklist
- [ ] Landing page live and tested
- [ ] Week 1 curriculum complete
- [ ] Week 2 curriculum drafted
- [ ] Email signup integrated
- [ ] All Week 2 issues closed
- [ ] Commit: "docs: week 2 complete - landing page deployed"

## Time Estimate
1.5 hours
```

---

---

## WEEK 3: FRONTEND + INFRASTRUCTURE

### MONDAY TASKS

#### Issue: Initialize Vite + React + TypeScript frontend
```
Title: Initialize frontend with Vite, React, and TypeScript
Type: Task
Labels: Week 3, Frontend, Priority-1
Assignee: You

Description:

## Goal
Set up production-ready frontend project.

## Tasks
- [ ] Run: `npm create vite@latest frontend -- --template react-ts`
- [ ] Install dependencies: `npm install`
- [ ] Install Tailwind: `npm install tailwindcss postcss autoprefixer`
- [ ] Initialize Tailwind: `npx tailwindcss init -p`
- [ ] Install dev tools: eslint, prettier, testing-library, vitest
- [ ] Create folder structure (components, pages, hooks, utils, styles)
- [ ] Create `.env.example` with required vars

## Acceptance Criteria
- [ ] Frontend dev server runs: `npm run dev`
- [ ] Vite loads without errors
- [ ] Folder structure matches specification

## Time Estimate
2 hours
```

---

### TUESDAY TASKS

#### Issue: Create core component library
```
Title: Build core component library - Button, Card, Input
Type: Task
Labels: Week 3, Frontend
Assignee: You

Description:

## Goal
Create reusable components for entire app.

## Components Required
1. **Button** (`src/components/common/Button.tsx`)
   - Variants: primary, secondary
   - States: default, disabled, loading
   - Tailwind styling with design system colors

2. **Card** (`src/components/common/Card.tsx`)
   - Basic card wrapper
   - Shadow and rounded corners
   - Flexible content

3. **Input** (`src/components/common/Input.tsx`)
   - Text input with label
   - Validation states
   - Responsive design

## Acceptance Criteria
- [ ] All 3 components created
- [ ] Components are typed (TypeScript)
- [ ] Props are documented
- [ ] Components render without errors

## Time Estimate
2 hours
```

#### Issue: Create TypeScript types and API client
```
Title: Define TypeScript types and API client utilities
Type: Task
Labels: Week 3, Frontend
Assignee: You

Description:

## Goal
Set up type-safe API communication.

## Tasks
- [ ] Create `src/types/index.ts`:
  - Course interface
  - Week interface
  - Lesson interface
  - User interface
- [ ] Create `src/utils/api.ts`:
  - Axios client with base URL
  - Fetch course endpoint
  - Fetch lesson endpoint

## Acceptance Criteria
- [ ] Type definitions complete
- [ ] API client functional
- [ ] Types exported for use

## Time Estimate
1.5 hours
```

---

### WEDNESDAY TASKS

#### Issue: Set up CI/CD with linting and testing
```
Title: Configure ESLint, Prettier, and Vitest for frontend
Type: Task
Labels: Week 3, CI/CD, Frontend
Assignee: You

Description:

## Goal
Ensure code quality enforcement.

## Tasks
- [ ] Create `.eslintrc.json`
- [ ] Create `.prettierrc.json`
- [ ] Create `vitest.config.ts`
- [ ] Update GitHub Actions workflow (`.github/workflows/ci.yml`)
- [ ] Write example unit test for Button component
- [ ] Run tests: `npm run test` should pass

## Acceptance Criteria
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Vitest working
- [ ] CI workflow includes linting and tests
- [ ] Tests pass

## Time Estimate
2 hours
```

---

### THURSDAY TASKS

#### Issue: Initialize FastAPI backend
```
Title: Initialize FastAPI backend with basic structure
Type: Task
Labels: Week 3, Backend, Priority-1
Assignee: You

Description:

## Goal
Set up production-ready backend.

## Tasks
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Install FastAPI: `pip install fastapi uvicorn sqlalchemy python-dotenv pyjwt`
- [ ] Create `backend/src/main.py` with health endpoint
- [ ] Create `backend/requirements.txt`
- [ ] Create `backend/.env.example`
- [ ] Create folder structure (models, routes, utils, config)
- [ ] Test: `uvicorn src.main:app --reload` should run

## Acceptance Criteria
- [ ] Backend runs locally
- [ ] Health endpoint returns 200
- [ ] Requirements.txt updated

## Time Estimate
1.5 hours
```

#### Issue: Extract and populate Week 3-4 curriculum
```
Title: Extract Week 3-4 curriculum from main document
Type: Task
Labels: Week 3, Course-Content
Assignee: You

Description:

## Goal
Populate remaining weeks with course content.

## Tasks
- [ ] Move Week 3 objectives
- [ ] Move Week 3 video scripts
- [ ] Move Week 3 project brief (Design Systems Timer)
- [ ] Move Week 4 objectives
- [ ] Move Week 4 video scripts
- [ ] Move Week 4 project brief (Capstone)

## Acceptance Criteria
- [ ] All files created and populated
- [ ] Content matches curriculum document

## Time Estimate
2 hours
```

---

### FRIDAY-SUNDAY TASKS

#### Issue: Week 3 Review - Frontend and backend scaffolded
```
Title: Week 3 Review - Frontend, backend, and CI/CD ready
Type: Task
Labels: Week 3, Review
Assignee: You

Description:

## Goal
Verify all Phase 1 tech is ready for Phase 2.

## Checklist
- [ ] Frontend dev server runs locally
- [ ] Backend health endpoint works
- [ ] CI/CD pipeline passes
- [ ] All tests pass
- [ ] Week 3-4 curriculum populated
- [ ] Commit: "feat: week 3 complete - frontend + backend scaffolded"

## Time Estimate
1.5 hours
```

---

---

## WEEK 4: POLISH + LAUNCH PREP

### MONDAY TASKS

#### Issue: Complete Week 3-4 curriculum
```
Title: Finalize Week 3-4 curriculum - All content complete
Type: Task
Labels: Week 4, Course-Content, Priority-1
Assignee: You

Description:

## Goal
Finish all remaining curriculum content.

## Tasks
- [ ] Complete Week 3: 01_OBJECTIVES, 02_VIDEO_SCRIPTS, 03_PROJECT_BRIEF, 04_QUIZ, 05_RESOURCES
- [ ] Complete Week 4: All files with capstone details
- [ ] Create capstone rubric document
- [ ] Add example capstone projects

## Acceptance Criteria
- [ ] All weeks 100% complete
- [ ] Rubric is clear
- [ ] Examples provided

## Time Estimate
2 hours
```

---

### TUESDAY TASKS

#### Issue: Document gamification system
```
Title: Document complete gamification system
Type: Documentation
Labels: Week 4, Documentation
Assignee: You

Description:

## Goal
Specify how points, badges, and levels work.

## Content
- Points breakdown (605 total)
- Badge list with unlock criteria
- Level progression (Beginner → Hyper-Pro)
- Leaderboard design
- Discord integration
- Announcement templates

## Acceptance Criteria
- [ ] `docs/guides/GAMIFICATION.md` complete
- [ ] All systems documented
- [ ] Discord role mapping clear

## Time Estimate
2 hours
```

---

### WEDNESDAY TASKS

#### Issue: Finalize marketing assets
```
Title: Complete all marketing assets and launch copy
Type: Task
Labels: Week 4, Marketing
Assignee: You

Description:

## Goal
Prepare all marketing materials for launch.

## Content
- Reddit posts (3 versions)
- Twitter threads (2 versions)
- Email copy
- Paid ad copy (Facebook, Google, LinkedIn)
- Launch day checklist
- Post-launch follow-up plan

## Acceptance Criteria
- [ ] `docs/guides/MARKETING.md` complete
- [ ] `docs/LAUNCH_CHECKLIST.md` created
- [ ] All copy is conversion-focused

## Time Estimate
2 hours
```

---

### THURSDAY TASKS

#### Issue: Prepare beta testing
```
Title: Prepare beta testing program
Type: Task
Labels: Week 4, Testing
Assignee: You

Description:

## Goal
Set up to test with 5-10 friends before public launch.

## Tasks
- [ ] Create `docs/BETA_TESTER_GUIDE.md`
- [ ] Create Discord #beta-feedback channel
- [ ] Create Google Form for feedback
- [ ] Email 5-10 friends to recruit as beta testers
- [ ] Send them: Landing page, guide, Discord invite

## Acceptance Criteria
- [ ] Beta guide created
- [ ] 5-10 testers recruited
- [ ] Feedback collection system ready
- [ ] Discord channel set up

## Time Estimate
1.5 hours
```

---

### FRIDAY-SUNDAY TASKS

#### Issue: Final launch preparation
```
Title: Final review and launch readiness check
Type: Task
Labels: Week 4, Review, Priority-1
Assignee: You

Description:

## Goal
Verify everything is ready for launch.

## Final Checklist
- [ ] All curriculum complete (Weeks 1-4)
- [ ] Landing page live
- [ ] CI/CD passing
- [ ] Frontend scaffolded
- [ ] Backend scaffolded
- [ ] Documentation complete
- [ ] Gamification spec documented
- [ ] Marketing assets ready
- [ ] Beta testers recruited
- [ ] Launch checklist prepared
- [ ] GitHub repo clean
- [ ] All issues closed
- [ ] Create release v1.0.0-phase1

## Commit & Push
```bash
git commit -m "feat: week 4 complete - launch ready!"
git tag v1.0.0-phase1
git push origin main --tags
```

## Acceptance Criteria
- [ ] Score estimate: 480+/593 (81%)
- [ ] Ready to launch Week 1 publicly

## Time Estimate
2 hours
```

---

---

## HOW TO USE THESE ISSUES

1. **Copy each issue** into your GitHub repo
2. **Create a GitHub Project** board:
   - Columns: Backlog | Week 1 | Week 2 | Week 3 | Week 4 | In Progress | Done
3. **Assign issues** to the correct week
4. **Track progress** as you complete each task
5. **Update status** as you move through sprint

---

**Ready to start? Create these issues in your GitHub repo and get to work!** 🚀
