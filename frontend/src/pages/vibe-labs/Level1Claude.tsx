import { VibeLabShell } from '../../components/vibe-labs/VibeLabShell'
import { LabSection } from '../../components/vibe-labs/LabSection'
import { PromptBlock } from '../../components/vibe-labs/PromptBlock'

export default function Level1Claude() {
  return (
    <VibeLabShell levelId={1}>
      <LabSection kind="stop" icon="🛑" title="Read this first">
        <p>
          Coding is not just for tech people anymore. You are now a builder with
          a crane. While others hammer chairs by hand, you build skyscrapers.
        </p>
        <p>
          <strong>Claude is your crane. You are the architect.</strong> That's
          vibe coding.
        </p>
      </LabSection>

      <LabSection kind="why" icon="⚡" title="Why this matters">
        <p>
          No degree. No years of study. No memorising syntax. You just need an
          idea and a prompt.
        </p>
        <ul className="space-y-hfz-2">
          <li>✅ Build a custom to-do list</li>
          <li>✅ Spin up a tip calculator</li>
          <li>✅ Launch a full app in one afternoon</li>
        </ul>
      </LabSection>

      <LabSection kind="how" icon="🔧" title="Your first build · ⏱️ ~30 min">
        <ol className="space-y-hfz-3">
          <li>
            <strong>1 · Set up your lab</strong> — install VS Code + the Claude
            extension. <span className="text-hfz-text-disabled">⏱️ 5 min</span>
          </li>
          <li>
            <strong>2 · Describe your idea</strong> — use Plan Mode. Bullet
            points, no code yet. <span className="text-hfz-text-disabled">⏱️ 5 min</span>
          </li>
          <li>
            <strong>3 · Build one block at a time</strong> — short prompts, one
            feature each. <span className="text-hfz-text-disabled">⏱️ 15 min</span>
          </li>
          <li>
            <strong>4 · Test after every change</strong> — run it each time so
            breaks are easy to find. <span className="text-hfz-text-disabled">⏱️ 5 min</span>
          </li>
        </ol>
        <PromptBlock label="Paste into Claude">
          {`Build a minimalist tip calculator with dark mode and a cyan accent.
A box to enter the bill, buttons for 10% / 15% / 20% tips,
and show the total I need to pay.`}
        </PromptBlock>
      </LabSection>

      <LabSection kind="win" icon="🏆" title="Your first moment">
        <p>
          <strong>The win is when your app appears on screen.</strong> Not in
          your head — on a live preview.
        </p>
        <p>Pause. Screenshot it. That's real. You guided a working app into existence.</p>
        <p>
          <strong>What you can now change:</strong> ask Claude for a custom tip
          %, a different accent, or bill-splitting. Same loop, your variation —
          that's the skill, not the app.
        </p>
      </LabSection>

      <LabSection kind="help" icon="🆘" title="If things break — this trips everyone up">
        <p>Stay calm. Tell Claude exactly what happened:</p>
        <PromptBlock>{`I expected X but got Y. Here is the error: ...`}</PromptBlock>
        <p>
          Lost in the project? Ask: <em>"Draw me a simple mind map of how all
          the files connect."</em> You're still on track.
        </p>
      </LabSection>

      <LabSection kind="next" icon="🔜" title="Where you're heading">
        <p>
          You built something with Claude. Next: <strong>Google AI Studio</strong> —
          full-stack power, one click, no setup.
        </p>
        <p className="font-mono text-hfz-code text-hfz-text-disabled">
          Claude → AI Studio → Trae IDE → Full Stack
        </p>
      </LabSection>
    </VibeLabShell>
  )
}
