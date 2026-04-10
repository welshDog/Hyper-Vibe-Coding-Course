// Structured curriculum data extracted from docs/course/CURRICULUM.md
// Used by ScriptGenerator (instructor tool) and future course scaffolding

export type ModuleType = 'lesson' | 'lab' | 'project' | 'quiz';

export type ScriptSection = {
  label: string;
  duration: string;
  content: string;
};

export type Module = {
  id: string;
  weekId: string;
  order: number;
  title: string;
  type: ModuleType;
  durationMinutes: number;
  videoDurationMinutes?: number;
  keyConceptSummary: string;
  script?: {
    totalDuration: string;
    sections: ScriptSection[];
  };
  deliverable?: string;
  badgesAwarded?: string[];
  xpAwarded?: number;
};

export type Week = {
  id: string;
  order: number;
  title: string;
  tagline: string;
  xpAvailable: number;
  modules: Module[];
};

export type Course = {
  id: string;
  title: string;
  subtitle: string;
  durationWeeks: number;
  hoursPerWeek: string;
  level: string;
  tool: string;
  weeks: Week[];
};

// ─── Vibe Coding Foundations ─────────────────────────────────────────────────

export const VIBE_CODING_FOUNDATIONS: Course = {
  id: 'vibe-coding-foundations',
  title: 'Vibe Coding Foundations',
  subtitle: 'Build 3 Apps With Zero Prior Coding Knowledge',
  durationWeeks: 4,
  hoursPerWeek: '5-7 hours',
  level: 'Complete Beginner',
  tool: 'Replit (free tier)',
  weeks: [
    {
      id: 'week-1',
      order: 1,
      title: 'What Is Vibe Coding?',
      tagline: 'From "I can\'t code" to "I shipped something".',
      xpAvailable: 125,
      modules: [
        {
          id: 'module-1-1',
          weekId: 'week-1',
          order: 1,
          title: 'The Vibe Coding Mindset',
          type: 'lesson',
          durationMinutes: 15,
          videoDurationMinutes: 8,
          keyConceptSummary:
            'Shift from "learning syntax" to "directing AI with taste". Code is the implementation detail — taste is the superpower.',
          xpAwarded: 50,
          badgesAwarded: ['first_vibe'],
          script: {
            totalDuration: '8 min',
            sections: [
              {
                label: 'Opening Hook',
                duration: '30 sec',
                content: `"Hey BROski! Welcome to Vibe Coding Foundations.

You're probably thinking: 'I don't know how to code. I'm not a coder. This isn't for me.'

WRONG. This is 100% for you. Here's why:

For 70 years, coding meant memorizing syntax. If you forgot a semicolon, your entire program broke. You had to think like a computer.

Not anymore.

Now? AI does the thinking. You do the VIBING.

Today, you'll build your first real webpage. No tutorials. No syntax. Just you + AI having a conversation.

Let's gooo."`,
              },
              {
                label: 'The Old Way vs The New Way',
                duration: '1 min',
                content: `Show side-by-side comparison on screen:
• Traditional coding: "function pushButton() { color = rgb(255,0,0); }"
• Vibe coding: "Make a button that turns red when I click it. Surprise me with cool colors."

"See the difference? You're no longer a robot typist. You're a creative director."`,
              },
              {
                label: 'Why It Works',
                duration: '1.5 min',
                content: `"AI is now SO good at coding that the bottleneck isn't syntax — it's taste.

Taste means: knowing what's cool, what's boring, what works, what doesn't.

That's something NO AI can do. Only humans have taste.

So your job isn't to code. Your job is to guide AI using taste and creativity.

It's like being a film director. You don't have to operate the camera — you tell the cinematographer WHAT to shoot and HOW to make it feel.

Same energy here."`,
              },
              {
                label: 'Your 3 Superpowers in 2026',
                duration: '1.5 min',
                content: `"Three things you now have:

1. NO syntax to memorize. AI handles it.
2. INSTANT feedback. Build → show AI → 5 sec tweak cycle.
3. UNLIMITED creativity. Not limited by what you remember from tutorials.

By end of this week, you'll have a real, deployed webpage.
In 4 weeks? You'll have a portfolio of 3+ apps.
In 3 months? You'll be shipping SaaS MVPs.

This is not hype. This is the actual 2026 skill curve."`,
              },
              {
                label: 'Outro CTA',
                duration: '30 sec',
                content: `"Ready to vibe? Let's build your first app.

Click 'Next' → set up Replit → and let's ship something COOL."`,
              },
            ],
          },
        },
        {
          id: 'module-1-2',
          weekId: 'week-1',
          order: 2,
          title: 'Your First Prompt',
          type: 'lab',
          durationMinutes: 20,
          keyConceptSummary:
            'Hands-on: write a prompt, paste AI code into Replit, deploy a live URL in under 20 minutes.',
          xpAwarded: 30,
          deliverable: 'First deployed app URL shared in #projects',
        },
        {
          id: 'module-1-3',
          weekId: 'week-1',
          order: 3,
          title: 'Anatomy of a Good Prompt',
          type: 'lesson',
          durationMinutes: 12,
          videoDurationMinutes: 6,
          keyConceptSummary:
            'The 3-ingredient prompt formula: Role + Context + Taste. With these, every prompt delivers vibes instead of templates.',
          xpAwarded: 45,
          script: {
            totalDuration: '6 min',
            sections: [
              {
                label: 'Opening Hook',
                duration: '30 sec',
                content: `"You've now seen AI coding in action. You pasted a prompt, got code, shared it with friends, they were shocked.

But here's the thing: not all prompts are created equal.

Some prompts give you boring, generic code.
Some prompts give you VIBES.

What's the difference? Let me show you."`,
              },
              {
                label: 'The Bad Prompt',
                duration: '1 min',
                content: `Show on screen:
Bad: "Create a website"
↓
Result: Boring template, gray colors, Arial font, feels corporate

"See how vague that was? AI had ZERO direction on taste."`,
              },
              {
                label: 'The Good Prompt',
                duration: '1 min',
                content: `Show on screen:
Good: "Create a dark mode website for a music producer. Use neon colors, bold typography, make it feel like a nightclub website. Include vinyl record imagery. Surprise me with animations."
↓
Result: Cohesive aesthetic, personality, actually cool

"Notice what changed? We gave CONTEXT (music producer), MOOD (nightclub vibes), CONSTRAINTS (dark mode, neon), and permission to SURPRISE us."`,
              },
              {
                label: 'The Secret Sauce — 3 Ingredients',
                duration: '1.5 min',
                content: `"The 3 ingredients of a perfect prompt:

1. ROLE: 'You are a designer who...' or 'Build this like a startup would...'
   Gives AI your vibe/style direction

2. CONTEXT: 'For a coffee shop manager in New York...'
   AI understands WHAT you're building and WHO it's for

3. TASTE: 'Make it feel calm, cozy, warm. Use earth tones.'
   AI knows HOW it should FEEL, not just function

When you nail all three? Magic."`,
              },
              {
                label: 'Red Flags to Avoid',
                duration: '1 min',
                content: `Bad patterns:
✗ Asking AI to "make it professional" (too vague)
✗ Asking for ALL colors at once (pick 2-3 dominant)
✗ Over-specifying technical details (let AI decide)
✗ No personality hints (AI defaults to boring)

Good patterns:
✓ "Make it feel playful, not corporate"
✓ "Use neon pink + deep purple + black"
✓ "I trust you to add cool animations"
✓ "Make it look like a high-end design studio"`,
              },
              {
                label: 'Outro CTA',
                duration: '30 sec',
                content: `"Your prompting skills improve your code quality by 10x.

Spend 2 min crafting a great prompt.
Get 20x better results.

Math checks out. Let's go."`,
              },
            ],
          },
        },
        {
          id: 'module-1-4',
          weekId: 'week-1',
          order: 4,
          title: 'Project: Personal Landing Page',
          type: 'project',
          durationMinutes: 90,
          keyConceptSummary:
            'Build and deploy a personal landing page. Must be publicly deployed with a real URL by end of week.',
          xpAwarded: 0,
          deliverable: 'Live URL of personal landing page shared in #projects',
        },
      ],
    },
    {
      id: 'week-2',
      order: 2,
      title: 'Build Your First Data App',
      tagline: 'Make something that actually stores and shows information.',
      xpAvailable: 150,
      modules: [
        {
          id: 'module-2-1',
          weekId: 'week-2',
          order: 1,
          title: 'What Is State? (The Vibe Version)',
          type: 'lesson',
          durationMinutes: 12,
          videoDurationMinutes: 7,
          keyConceptSummary:
            '"State" = your app\'s memory. Mood tracker needs to remember moods. Data without state is just a pretty picture.',
          xpAwarded: 50,
        },
        {
          id: 'module-2-2',
          weekId: 'week-2',
          order: 2,
          title: 'Local Storage Without the Pain',
          type: 'lesson',
          durationMinutes: 15,
          videoDurationMinutes: 8,
          keyConceptSummary:
            "localStorage lets data survive a page refresh. No backend required. Prompt AI to wire it up — you don't need to understand the code.",
          xpAwarded: 50,
        },
        {
          id: 'module-2-3',
          weekId: 'week-2',
          order: 3,
          title: 'Project: Mood Tracker',
          type: 'project',
          durationMinutes: 90,
          keyConceptSummary:
            'Interactive mood tracker with local storage. Students log daily moods and see a simple visualization.',
          xpAwarded: 0,
          deliverable: 'Live mood tracker with working data persistence',
        },
      ],
    },
    {
      id: 'week-3',
      order: 3,
      title: 'Aesthetic & Personality',
      tagline: 'Make it YOURS. Not a template. An expression.',
      xpAvailable: 150,
      modules: [
        {
          id: 'module-3-1',
          weekId: 'week-3',
          order: 1,
          title: 'Design Systems in 10 Minutes',
          type: 'lesson',
          durationMinutes: 10,
          videoDurationMinutes: 6,
          keyConceptSummary:
            'Color palettes, font pairings, spacing rhythm. You don\'t need a degree — you need 3 decisions: primary color, font personality, "how much whitespace".',
          xpAwarded: 50,
        },
        {
          id: 'module-3-2',
          weekId: 'week-3',
          order: 2,
          title: 'Project: Custom Timer',
          type: 'project',
          durationMinutes: 120,
          keyConceptSummary:
            "Build a timer app with YOUR aesthetic. This is about pushing visual personality — not another gray Pomodoro clone.",
          xpAwarded: 0,
          deliverable: 'Deployed timer with distinctive visual personality',
        },
      ],
    },
    {
      id: 'week-4',
      order: 4,
      title: 'Ship Your Capstone',
      tagline: 'Pick an idea. Build it. Share it. Graduate.',
      xpAvailable: 200,
      modules: [
        {
          id: 'module-4-1',
          weekId: 'week-4',
          order: 1,
          title: 'Scoping Like a Pro',
          type: 'lesson',
          durationMinutes: 10,
          videoDurationMinutes: 5,
          keyConceptSummary:
            "The #1 project killer is scope creep. Pick ONE core feature. Ship THAT. Add extras after. Every shipped thing beats every perfect draft.",
          xpAwarded: 30,
        },
        {
          id: 'module-4-2',
          weekId: 'week-4',
          order: 2,
          title: 'Capstone Project',
          type: 'project',
          durationMinutes: 180,
          keyConceptSummary:
            "Build any simple tool you want. Must be deployed, must solve a real (even tiny) problem for a real (even just you) person.",
          xpAwarded: 0,
          deliverable: 'Final capstone app with description of what problem it solves',
          badgesAwarded: ['shipper', 'halfway_there', 'hyper'],
        },
      ],
    },
  ],
};

export const ALL_COURSES: Course[] = [VIBE_CODING_FOUNDATIONS];
