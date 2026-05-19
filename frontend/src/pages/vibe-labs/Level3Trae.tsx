import { VibeLabShell } from '../../components/vibe-labs/VibeLabShell'
import { LabSection } from '../../components/vibe-labs/LabSection'
import { PromptBlock } from '../../components/vibe-labs/PromptBlock'

export default function Level3Trae() {
  return (
    <VibeLabShell levelId={3}>
      <LabSection kind="stop" icon="🛑" title="What is Trae IDE?">
        <p>
          Claude reasons. AI Studio builds. <strong>Trae is Mission Control.</strong>{' '}
          A free AI-native IDE that plans the architecture, runs the tests, fixes
          the bugs, and deploys to Vercel — by itself.
        </p>
        <p>You define the task. Trae's crew handles the rest.</p>
      </LabSection>

      <LabSection kind="why" icon="⚡" title="Why Trae after AI Studio?">
        <p>AI Studio builds apps. Trae builds like a real engineering team:</p>
        <ul className="space-y-hfz-2">
          <li>✅ SOLO Mode — autonomous from plan to deploy</li>
          <li>✅ Builder Mode — reads your whole project, steps + previews</li>
          <li>✅ Built-in browser preview · Auto Accept</li>
          <li>✅ Custom agents + MCP (Supabase, GitHub, Slack…)</li>
          <li>✅ Multi-model: Claude 4, Gemini 2.5, DeepSeek, GPT</li>
        </ul>
      </LabSection>

      <LabSection kind="how" icon="🔧" title="Your first SOLO build · ⏱️ ~30 min">
        <ol className="space-y-hfz-3">
          <li>
            <strong>1 · Download Trae</strong> at trae.ai, pick a model (Claude 4
            Sonnet / Gemini 2.5 Pro). <span className="text-hfz-text-disabled">⏱️ 8 min</span>
          </li>
          <li>
            <strong>2 · New project → SOLO Mode</strong> — end-to-end handling.{' '}
            <span className="text-hfz-text-disabled">⏱️ 2 min</span>
          </li>
          <li>
            <strong>3 · Describe the full project</strong> — goal, style, feature
            list. <span className="text-hfz-text-disabled">⏱️ 10 min</span>
          </li>
          <li>
            <strong>4 · Review, don't rewrite</strong> — check the live preview,
            ask for changes in plain English. <span className="text-hfz-text-disabled">⏱️ 10 min</span>
          </li>
        </ol>
        <PromptBlock label="Paste into Trae SOLO Mode">
          {`Build a Hyperfocus z0ne Daily Dashboard. Dark background, violet + cyan.
- Pomodoro timer (25 min focus, 5 min break)
- A daily to-do list with checkboxes
- A BROski$ balance display starting at 0
- A wins log I can type and save daily wins into
Deploy it to Vercel when it's ready.`}
        </PromptBlock>
      </LabSection>

      <LabSection kind="win" icon="🏆" title="Your Level 3 moment">
        <p>
          <strong>The win: Trae hands you a live Vercel URL.</strong> Not a local
          preview — a real URL you can share.
        </p>
        <p>That's a deployed app built entirely from a prompt. Production-level vibe coding.</p>
        <p>
          <strong>What you can now change:</strong> re-brief the crew for a
          feature or fix, then redeploy. You can ship changes, not just a first
          build.
        </p>
      </LabSection>

      <LabSection kind="help" icon="🆘" title="If SOLO Mode goes off track — normal">
        <p>Tell Trae exactly what went wrong:</p>
        <PromptBlock>{`Stop. The layout is broken. Here is what I expected.
Start over from the last working preview.`}</PromptBlock>
        <p>
          Totally wrong? Use the <strong>rollback button</strong> to undo recent
          agent changes. You're still on track.
        </p>
      </LabSection>

      <LabSection kind="next" icon="🔜" title="Where you're heading">
        <p>
          Full stack of Big AIs unlocked. Next: <strong>Big AI Comparisons</strong> —
          learn which tool to reach for, and when.
        </p>
      </LabSection>
    </VibeLabShell>
  )
}
