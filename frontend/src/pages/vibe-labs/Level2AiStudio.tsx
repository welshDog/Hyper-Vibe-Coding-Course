import { VibeLabShell } from '../../components/vibe-labs/VibeLabShell'
import { LabSection } from '../../components/vibe-labs/LabSection'
import { PromptBlock } from '../../components/vibe-labs/PromptBlock'

export default function Level2AiStudio() {
  return (
    <VibeLabShell levelId={2}>
      <LabSection kind="stop" icon="🛑" title="What is Google AI Studio?">
        <p>
          Claude taught you the loop. Google AI Studio is the next level — a
          browser AI builder powered by <strong>Gemini</strong> and the
          Antigravity coding agent.
        </p>
        <p>You describe the app. It builds it, live, in your browser. No install. No terminal.</p>
      </LabSection>

      <LabSection kind="why" icon="⚡" title="Why AI Studio after Claude?">
        <p>Claude is great for reasoning. AI Studio is full-stack power with zero setup:</p>
        <ul className="space-y-hfz-2">
          <li>✅ Real-time multiplayer apps</li>
          <li>✅ Firebase database — one click</li>
          <li>✅ User auth in seconds</li>
          <li>✅ Annotation Mode — click an element, describe the fix</li>
        </ul>
      </LabSection>

      <LabSection kind="how" icon="🔧" title="Your first build · ⏱️ ~30 min">
        <ol className="space-y-hfz-3">
          <li>
            <strong>1 · Open Build Mode</strong> at aistudio.google.com/vibe-code.{' '}
            <span className="text-hfz-text-disabled">⏱️ 2 min</span>
          </li>
          <li>
            <strong>2 · Describe your idea</strong> — plain English, specific on
            look and goal. <span className="text-hfz-text-disabled">⏱️ 8 min</span>
          </li>
          <li>
            <strong>3 · Refine in chat</strong> — tweak colours, features,
            layout by typing. <span className="text-hfz-text-disabled">⏱️ 12 min</span>
          </li>
          <li>
            <strong>4 · Annotation Mode</strong> — click any element, describe
            the change. <span className="text-hfz-text-disabled">⏱️ 8 min</span>
          </li>
        </ol>
        <PromptBlock label="Paste into AI Studio Build Mode">
          {`Build a Hyperfocus Timer web app, dark background, violet primary.
A 25-minute focus timer, a 5-minute break timer, Start/Stop buttons,
and a session history list with a timestamp for each completed session.`}
        </PromptBlock>
      </LabSection>

      <LabSection kind="win" icon="🏆" title="Your Level 2 moment">
        <p>
          <strong>The win: a live preview AND your first Firebase feature.</strong>{' '}
          Click <em>Add Database</em> — your timer now saves sessions for real.
        </p>
        <p>You just went full stack without writing a line of SQL.</p>
        <p>
          <strong>What you can now change:</strong> tell AI Studio to save a new
          field or add a screen. You own a full-stack loop now, not one timer.
        </p>
      </LabSection>

      <LabSection kind="help" icon="🆘" title="If things break — totally normal">
        <p>Tell Gemini exactly what you see:</p>
        <PromptBlock>{`I expected X but got Y. Here is what I see on screen: ...`}</PromptBlock>
        <p>
          Use Annotation Mode for visual bugs — click the broken element, describe
          the fix. You're still on track.
        </p>
      </LabSection>

      <LabSection kind="next" icon="🔜" title="Where you're heading">
        <p>
          Two Big AIs down. Next: <strong>Trae IDE</strong> — your AI crew goes
          autonomous. It tests and fixes its own errors.
        </p>
      </LabSection>
    </VibeLabShell>
  )
}
