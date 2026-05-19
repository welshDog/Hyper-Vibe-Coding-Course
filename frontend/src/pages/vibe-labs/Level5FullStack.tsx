import { VibeLabShell } from '../../components/vibe-labs/VibeLabShell'
import { LabSection } from '../../components/vibe-labs/LabSection'
import { PromptBlock } from '../../components/vibe-labs/PromptBlock'

export default function Level5FullStack() {
  return (
    <VibeLabShell levelId={5}>
      <LabSection kind="stop" icon="🛑" title="You've made it">
        <ul className="space-y-hfz-2">
          <li>Level 1 — vibed your first app with Claude. 🧠</li>
          <li>Level 2 — went full stack with AI Studio. 🚀</li>
          <li>Level 3 — ran an autonomous crew with Trae. 🤖</li>
          <li>Level 4 — learned which tool, and when. ⚔️</li>
        </ul>
        <p>
          Now we combine everything into one real, shipped product —{' '}
          <strong>the Hyperfocus z0ne Full Stack capstone.</strong>
        </p>
      </LabSection>

      <LabSection kind="why" icon="⚡" title="Why this level matters">
        <p>
          Most people learn tools one by one and never connect them. You've
          already broken that pattern. This proves you can plan with Claude,
          build with AI Studio, ship with Trae — and decide when to use each.
        </p>
        <p>
          That's not vibe coding anymore. That's{' '}
          <strong>systems thinking — the Meta-Architect mindset.</strong>
        </p>
      </LabSection>

      <LabSection kind="how" icon="🔧" title="The 3-tool build · ⏱️ ~1–2 hrs">
        <p>
          Your capstone: a <strong>Hyperfocus z0ne Personal Dashboard</strong> —
          Pomodoro + session history, daily wins log with BROski$, task board,
          XP bar. Dark mode: #0A0E1A bg · #7B2FBE violet · #00D4FF cyan.
        </p>
        <p className="font-display text-hfz-body-lg text-hfz-text-primary">
          Step 1 — Claude: plan the architecture{' '}
          <span className="text-hfz-text-disabled">⏱️ 15 min</span>
        </p>
        <PromptBlock label="Claude">
          {`Plan the full architecture for a Hyperfocus z0ne Personal Dashboard.
List every component, every Supabase table, every Edge Function I'll need.
Identify any risks or tricky parts before I build.`}
        </PromptBlock>
        <p className="font-display text-hfz-body-lg text-hfz-text-primary">
          Step 2 — Google AI Studio: build the front end{' '}
          <span className="text-hfz-text-disabled">⏱️ 30 min</span>
        </p>
        <PromptBlock label="Google AI Studio">
          {`Build the front end of a Hyperfocus z0ne Personal Dashboard using
Vite + React, #0A0E1A dark background, #7B2FBE violet and #00D4FF cyan.
Components: [paste Claude's list]. Connect Supabase (client-side).
Make it feel like a game dashboard, not a boring productivity app.`}
        </PromptBlock>
        <p className="font-display text-hfz-body-lg text-hfz-text-primary">
          Step 3 — Trae SOLO Mode: ship it{' '}
          <span className="text-hfz-text-disabled">⏱️ 45 min</span>
        </p>
        <PromptBlock label="Trae SOLO Mode">
          {`Take this Vite + React project. Add full Supabase auth (login + signup),
all Supabase Edge Functions from this plan, a mobile responsive layout,
and deploy to Vercel with environment variables set up.`}
        </PromptBlock>
      </LabSection>

      <LabSection kind="win" icon="🏆" title="Your Level 5 moment">
        <p>
          <strong>
            The win is sharing your Vercel URL in the Hyperfocus z0ne community.
          </strong>
        </p>
        <p>
          Not a screenshot. A real app, built by you, powered by your brain,
          deployed to the world. That's the Meta-Architect moment.
        </p>
        <p>
          <strong>What you can now change:</strong> everything — you ran plan →
          build → ship end-to-end. Next idea = same loop, your content. That's
          Meta-Architect.
        </p>
      </LabSection>

      <LabSection kind="help" icon="🆘" title="When you're stuck — there's always a next step">
        <p>Hit a wall on the capstone:</p>
        <ol className="space-y-hfz-2">
          <li>Ask Claude to explain the problem in plain English.</li>
          <li>Ask AI Studio to rebuild the broken component.</li>
          <li>Ask Trae to fix and redeploy.</li>
        </ol>
        <p>
          Overwhelmed? The always-right prompt:{' '}
          <em>"Stop. Show me just the next ONE thing I need to do."</em>
        </p>
      </LabSection>

      <LabSection kind="next" icon="💡" title="What comes after this">
        <p>You've completed the Vibe Coding Labs path. Hyperfocus z0ne goes deeper:</p>
        <ul className="space-y-hfz-2">
          <li>
            <strong>HyperCode V2.4</strong> — 29 containers, agent swarm, full DevOps.
          </li>
          <li>
            <strong>BROski$ Token System</strong> — real gamified rewards.
          </li>
          <li>
            <strong>BROski Pets dNFT</strong> — NFTs that level up as you learn.
          </li>
          <li>
            <strong>HyperAgent SDK</strong> — build your own agent orchestration.
          </li>
        </ul>
        <p>The door is open. Your crew is waiting.</p>
      </LabSection>
    </VibeLabShell>
  )
}
