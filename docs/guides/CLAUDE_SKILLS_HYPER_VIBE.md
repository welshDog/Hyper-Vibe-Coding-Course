# Claude Skills — Hyper Vibe Coding Platform
> Canonical copy: `Claude/CLAUDE_SKILLS_HYPER_VIBE.md`
> This guide defines the core Claude skills and prompt patterns used across the HYPER VIBE COURSES platform.

---

## 1. Claude Usage Principles

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
   - Always load `CLAUDE.md` at the start of a session for full stack context.

---

## 2. Skill Levels

### Level 1 – Noob (Prompt Follower)
Copies proven prompts and fills in blanks. Uses Claude mainly to generate full HTML/CSS/JS snippets or small React components. Works inside Replit, VS Code, Cursor, or web IDE.

**Core patterns:**
- "Build X with these features"
- "Turn this rough idea into working code"

### Level 2 – Builder (Flow Driver)
Breaks big ideas into smaller Claude tasks. Uses follow-up prompts for refactors and improvements. Begins to debug by pasting errors and asking for fixes.

**Core patterns:**
- "Refactor this file to be clearer and more modular"
- "Explain this error and suggest 2 fixes"

### Level 3 – Debugger (System Aware)
Uses Claude to reason about errors, architecture, and trade-offs. Starts using tags/structure in prompts to disambiguate sections.

**Core patterns:**
- "Summarise what this codebase does across files"
- "Propose 3 architectures and compare pros/cons"

### Level 4 – Shipper (Product Minded)
Treats Claude as a pair-engineer and product collaborator. Drives end-to-end features: spec → implementation → tests → refactor.

**Core patterns:**
- "Act as a staff engineer: critique this design and propose a better version"
- "Generate tests that cover these edge cases"

### Level 5 – Hyper (Taste-Driven System Builder)
Builds reusable Claude flows and project templates. Encodes design system, tone, and quality bar into project instructions. Uses Claude for code, copy, UX, and docs as one coherent system.

**Core patterns:**
- "Here is our design system and vibe. Keep everything aligned to this."
- "Given this roadmap, scope a 1-week MVP and implement only the critical path"

---

## 3. Core Prompt Templates

### 3.1 App Scaffolding

```text
You are a senior full-stack engineer who builds clean, modern web apps.

Project: [short project name]
Tech stack: React 19 + Vite + TypeScript + Tailwind + Supabase
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
- Match the existing Hyper Vibe stack (see CLAUDE.md).

Task:
1. Propose a file & folder structure.
2. For each folder, explain its responsibility.
3. Then generate the initial files with TODO comments filled with your best guess.

Do NOT write the full final UI yet. Focus on a clean scaffold and comments.
```

### 3.2 Feature Implementation

```text
You are acting as a senior engineer inside the Hyper Vibe Coding Course project.

Stack: React 19 + Vite + TypeScript + Tailwind + Supabase + Zustand + React Router v7
See CLAUDE.md for full project context.

Files involved: [list key files]

Current behavior:
[short description of what it does now]

Desired behavior:
[short description of what we want]

Task:
1. Describe the changes you will make at a high level.
2. Show the updated code for only the files that need edits.
3. Include brief comments where logic might be surprising.

Keep styles and patterns consistent with the existing code.
Mobile-first. Use cn() from lib/utils.ts for conditional classes.
```

### 3.3 Debugging & Error Handling

```text
You are a debugging assistant for the Hyper Vibe Coding Course platform.
Stack: React 19 + Vite + TypeScript + Supabase.

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
You are a product designer + front-end dev on the Hyper Vibe platform.

Design system:
- Feeling: focused, dark-energy, sharp — like a coding tool not a toy
- Colors: primary = defined in tailwind.config.js, accent = bright contrast
- Fonts: system-ui for body, no custom display font yet
- Spacing: 4/8/16/32px Tailwind scale
- Animation: snappy — 150ms transitions, no bouncy spring effects
- Tone: BROski — direct, warm, ADHD-friendly

Task:
1. Describe how you will adapt the existing UI.
2. Update the styles (Tailwind classes) to match the system.
3. Ensure mobile looks great.
4. No decorative fluff — every element earns its place.
```

### 3.5 Learning Projects & Labs

```text
You are a friendly coding coach for the Hyper Vibe Courses platform.

Student level: [Noob / Builder / Debugger / Shipper / Hyper]
Goal: Help them build [app name] in small steps.

Task:
1. Break the build into 5–7 steps.
2. For each step, give:
   - A clear objective.
   - A Claude prompt template they can paste.
   - A "success check" to verify it works.

Keep the tone encouraging, BROski-coded, and clear.
No step should take more than 2 focused hours.
```

### 3.6 Copy & Marketing Prompt (Level 5 pattern)

```text
You are writing copy for the Hyper Vibe Courses platform.

Brand voice: BROski — direct, energetic, no fluff, ADHD-friendly.
Audience: Aspiring developers who want to build with AI, not memorise syntax.
Avoid: corporate speak, filler words, "unlock your potential", "journey".
Use: short sentences, active verbs, honest claims, occasional energy words.

Task:
Write [landing page hero / email subject / course description / CTA button text] for:
[context / feature / offer]

Give 3 variations. Mark the strongest one.
```

---

## 4. Claude Projects and Knowledge Setup

For each real product or course, create a Claude Project with:

- **Project Instructions**
  - Who the user is (e.g., course author, student type).
  - Tech stack norms (TypeScript, Tailwind, design system rules).
  - Tone (BROski, encouraging, practical).

- **Knowledge Files**
  - `CLAUDE.md` — full stack + project context
  - Design system doc for the brand.
  - `docs/ARCHITECTURE.md` and `docs/PRD.md`.
  - `Claude/CLAUDE_SKILLS_HYPER_VIBE.md` — this file.

This turns Claude into a high-context collaborator instead of a stateless chat.

---

## 5. Teaching Path: From Noob to Hyper

| Course | Levels | Focus |
|--------|--------|-------|
| Vibe Coding Foundations | L1–2 | Basic prompting, app building in Replit |
| Hyper Prompt Master | L2–4 | Deep prompting, debugging, refactors |
| MVP Sprint | L4–5 | End-to-end product building, system prompts |

Instructors: each exercise should explicitly train at least one Claude skill level and one prompt pattern from §3.

---

## 6. Quick Reference — Prompt Starters

| Situation | Start with |
|-----------|-----------|
| New feature | "You are a senior engineer in the Hyper Vibe project (see CLAUDE.md). I need to add…" |
| Bug / error | "Here's an error from the Hyper Vibe frontend. Diagnose and fix it…" |
| Refactor | "Refactor this file to be cleaner. Keep all existing behaviour. Don't add features." |
| Design review | "Review this component for accessibility, mobile layout, and brand alignment." |
| Marketing copy | "Write 3 versions of [copy piece] in BROski tone. Be direct and energetic." |
| Sprint planning | "Given this PRD section, scope the smallest working version. What's the critical path?" |
