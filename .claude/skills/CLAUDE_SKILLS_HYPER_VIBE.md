# Claude Skills – Hyper Vibe Coding Platform

This guide defines the core Claude skills and prompt patterns used across the HYPER VIBE COURSES platform. It is written for students and instructors building apps via vibe coding: natural language → AI-generated code, guided by taste and experimentation.

---

## 0. Project Skills Map (this repo)

This repo contains local, project-specific SKILL.md files you can load into your agent toolchain.

**Agent skills (repo-local):**
- `.agents/skills/e2e-broskipets/SKILL.md`
- `.agents/skills/mint-via-relay/SKILL.md`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`

**Claude-style skills (repo-local):**
- `.claude/skills/hyper-vibe-course/SKILL.md`
- `.claude/skills/frontend-auth-debug/SKILL.md`
- `.claude/skills/supabase-edge-functions/SKILL.md`
- `.claude/skills/stripe-checkout-frontend/SKILL.md`
- `.claude/skills/vercel-vite-deploy/SKILL.md`
- `.claude/skills/course-content-cms/SKILL.md`
- `.claude/skills/extracted/hyper-vibe-video-skill/SKILL.md`

## 1. Claude Usage Principles

1. **Role → Context → Task → Taste**

1. **Role → Context → Task → Taste**
   - Always set a clear role (e.g., "You are a senior front-end engineer…").
   - Provide real context: project name, audience, tech stack, and constraints.
   - Define the immediate task, not the whole roadmap.
   - Add taste and aesthetic: mood, references, what to avoid.

2. **Short cycles, not mega-prompts**
   - Ask Claude for one coherent step at a time.
   - Build → run → observe → ask Claude to refine based on real feedback.

3. **Behavior over implementation**
   - Describe what the app should *do* and *feel* like; let Claude pick libraries and patterns unless you have strong preferences.

4. **Projects + Knowledge**
   - Use a dedicated Claude Project per real app/course.
   - Keep system rules, design system, and best prompts in Project Knowledge.

---

## 2. Skill Levels

### Level 1 – Noob (Prompt Follower)

- Copies proven prompts and fills in blanks.
- Uses Claude mainly to generate full HTML/CSS/JS snippets or small React components.
- Works inside Replit, VS Code, Cursor, or web IDE.

**Core patterns:**
- "Build X with these features".
- "Turn this rough idea into working code".

### Level 2 – Builder (Flow Driver)

- Breaks big ideas into smaller Claude tasks.
- Uses follow-up prompts for refactors and improvements.
- Begins to debug by pasting errors and asking for fixes.

**Core patterns:**
- "Refactor this file to be clearer and more modular".
- "Explain this error and suggest 2 fixes".

### Level 3 – Debugger (System Aware)

- Uses Claude to reason about errors, architecture, and trade-offs.
- Starts using tags/structure in prompts to disambiguate sections.

**Core patterns:**
- "Summarise what this codebase does across files".
- "Propose 3 architectures and compare pros/cons".

### Level 4 – Shipper (Product Minded)

- Treats Claude as a pair-engineer and product collaborator.
- Drives end-to-end features: spec → implementation → tests → refactor.

**Core patterns:**
- "Act as a staff engineer: critique this design and propose a better version".
- "Generate tests that cover these edge cases".

### Level 5 – Hyper (Taste-Driven System Builder)

- Builds reusable Claude flows and project templates.
- Encodes design system, tone, and quality bar into project instructions.
- Uses Claude for code, copy, UX, and docs as one coherent system.

**Core patterns:**
- "Here is our design system and vibe. Keep everything aligned to this.".
- "Given this roadmap, scope a 1‑week MVP and implement only the critical path".

---

## 3. Core Prompt Templates

Each module of the Vibe Coding Foundations course (and future courses) can re-use these patterns with different content.

### 3.1 App Scaffolding

```text
You are a senior full-stack engineer who builds clean, modern web apps.

Project: [short project name]
Tech stack: [e.g. React + Vite + TypeScript + Tailwind]
Audience: [who is this for?]

Goal:
- Build an MVP that does:
  - [feature 1]
  - [feature 2]
  - [feature 3]

Constraints:
- Mobile first layout.
- Accessible (focus states, good contrast, semantic HTML).
- Simple, readable code.

Task:
1. Propose a file & folder structure.
2. For each folder, explain its responsibility.
3. Then generate the initial files with TODO comments filled with your best guess.

Do NOT write the full final UI yet. Focus on a clean scaffold and comments.
```

### 3.2 Feature Implementation

```text
You are acting as a senior engineer inside this existing project.

Context:
- Project: [name]
- Stack: [stack]
- Files involved: [list key files]

Current behavior:
[short description of what it does now]

Desired behavior:
[short description of what we want]

Task:
1. Describe the changes you will make at a high level.
2. Show the updated code for only the files that need edits.
3. Include brief comments where logic might be surprising.

Keep styles and patterns consistent with the existing code.
```

### 3.3 Debugging & Error Handling

```text
You are a debugging assistant.

I ran this code and got this error:
[error message / stacktrace]

Relevant code:
[code snippet]

Task:
1. Explain in simple language what is going wrong.
2. List 2–3 likely root causes.
3. Propose a minimal fix.
4. Show the corrected code.

Use clear headings for each step.
```

### 3.4 Design & Aesthetic Prompt

```text
You are a product designer + front-end dev.

Goal: Apply this design system to the existing UI.

Design system:
- Feeling: [e.g. calm + focused / dark + edgy].
- Colors: [primary, secondary, accent].
- Fonts: [display, body].
- Spacing: [e.g. 4/8/16/32 px scale].
- Animation: [fast & snappy / smooth & calm].

Task:
1. Describe how you will adapt the existing UI.
2. Update the styles (Tailwind classes or CSS) to match the system.
3. Ensure mobile looks great.
```

### 3.5 Learning Projects & Labs

```text
You are a friendly coding coach.

Student level: [Noob / Builder / Debugger / Shipper / Hyper]
Goal: Help them build [app name] in small steps.

Task:
1. Break the build into 5–7 steps.
2. For each step, give:
   - A clear objective.
   - A Claude prompt template they can paste.
   - A "success check" to verify it works.

Keep the tone encouraging and clear.
```

---

## 4. Claude Projects and Knowledge Setup

For each real product or course, create a Claude Project with:

- **Project Instructions**
  - Who the user is (e.g., course author, student type).
  - Tech stack norms (TypeScript, Tailwind, design system rules).
  - Tone (BROski, encouraging, practical).

- **Knowledge Files**
  - Design system doc for the brand.
  - Architecture overview (from `docs/ARCHITECTURE.md` and the platform blueprint).
  - Curriculum outline for the relevant course.
  - Any existing code structure notes.

This turns Claude into a high-context collaborator instead of a stateless chat.

---

## 5. Teaching Path: From Noob to Hyper

In the Hyper Vibe Courses platform, each course can target a band of Claude skills:

- **Course 1 – Vibe Coding Foundations**: Level 1–2, basic prompting and app building.[cite:33]
- **Course 2 – Hyper Prompt Master**: Level 2–4, deep prompting, debugging, refactors.[cite:33]
- **Course 3 – MVP Sprint**: Level 4–5, end-to-end product building and system prompts.[cite:33]

Instructors can reference this guide when writing labs, ensuring each exercise explicitly trains at least one Claude skill level and one prompt pattern.
