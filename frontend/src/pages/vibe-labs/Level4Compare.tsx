import { VibeLabShell } from '../../components/vibe-labs/VibeLabShell'
import { LabSection } from '../../components/vibe-labs/LabSection'

const TOOLS = [
  {
    name: 'Claude',
    role: 'The Reasoner',
    accent: 'text-hfz-violet-light',
    best: 'Thinking, architecture, explaining, code review',
    weak: 'No built-in live preview or one-click DB',
  },
  {
    name: 'Google AI Studio',
    role: 'The Full-Stack Speedster',
    accent: 'text-hfz-cyan',
    best: 'Browser builds, real-time apps, fast prototyping',
    weak: 'Less reasoning depth on complex logic',
  },
  {
    name: 'Trae IDE',
    role: 'The Autonomous Crew',
    accent: 'text-hfz-gold',
    best: 'Autonomous builds, agent pipelines, deploy',
    weak: 'Steeper setup; needs a clear brief',
  },
]

const PICKS = [
  ['Reasoning + code review', 'Claude'],
  ['Fast full-stack browser build', 'Google AI Studio'],
  ['Autonomous agents + deploy', 'Trae IDE'],
  ['Explaining code in plain English', 'Claude'],
  ['Firebase + auth in one click', 'Google AI Studio'],
  ['Ship without touching code', 'Trae SOLO Mode'],
]

export default function Level4Compare() {
  return (
    <VibeLabShell levelId={4}>
      <LabSection kind="stop" icon="🛑" title="Why this page exists">
        <p>
          You've used all three. The trap most people fall into:{' '}
          <strong>they pick one tool and use it for everything.</strong> That's
          a hammer to paint a wall.
        </p>
        <p>This page is about knowing which superpower to reach for.</p>
      </LabSection>

      <LabSection kind="why" icon="⚡" title="The quick answer">
        <div className="overflow-hidden rounded-hfz-md border border-hfz-border-soft">
          {PICKS.map(([need, tool], i) => (
            <div
              key={need}
              className={`flex items-center justify-between gap-hfz-4 px-hfz-4 py-hfz-3 text-hfz-body ${
                i % 2 ? 'bg-hfz-midnight/40' : 'bg-hfz-midnight/70'
              }`}
            >
              <span className="text-hfz-text-secondary">{need}</span>
              <span className="shrink-0 font-mono text-hfz-label text-hfz-cyan">
                {tool}
              </span>
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection kind="how" icon="🧠" title="The three superpowers">
        <div className="grid gap-hfz-4 sm:grid-cols-3">
          {TOOLS.map((t) => (
            <div
              key={t.name}
              className="rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight p-hfz-5"
            >
              <p className={`font-display text-hfz-h4 ${t.accent}`}>{t.name}</p>
              <p className="mt-1 text-hfz-caption uppercase tracking-hfz-label text-hfz-text-disabled">
                {t.role}
              </p>
              <p className="mt-hfz-3 text-hfz-body text-hfz-text-secondary">
                <strong>Best:</strong> {t.best}
              </p>
              <p className="mt-hfz-2 text-hfz-body text-hfz-text-secondary">
                <strong>Watch:</strong> {t.weak}
              </p>
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection kind="win" icon="🔀" title="The pro move — combine them">
        <p>The real power is the handoff:</p>
        <ol className="space-y-hfz-2">
          <li>
            <strong>Claude</strong> — plan the architecture, list components +
            risks.
          </li>
          <li>
            <strong>AI Studio</strong> — build the front end from that plan,
            wire the DB.
          </li>
          <li>
            <strong>Trae SOLO</strong> — add backend + auth, deploy to Vercel.
          </li>
        </ol>
        <p>That's a full production app across three tools. No manual coding.</p>
        <p>
          <strong>What you can now decide:</strong> which tool for which job.
          You're choosing the weapon now, not following one.
        </p>
      </LabSection>

      <LabSection kind="help" icon="🆘" title="5 common mistakes — everyone makes these">
        <ul className="space-y-hfz-2">
          <li>Using Claude to build full apps from scratch — it's a reasoner.</li>
          <li>Using AI Studio for deep backend logic — fast but shallow there.</li>
          <li>Jumping into Trae with a vague brief — SOLO needs specifics.</li>
          <li>Picking one tool forever — the power is knowing when to switch.</li>
          <li>Forgetting Claude for code review — even on Trae-built code.</li>
        </ul>
      </LabSection>

      <LabSection kind="next" icon="🔜" title="The final level">
        <p>
          You know the full stack and when to use each. Next:{' '}
          <strong>Hyperfocus z0ne Full Stack</strong> — combine all three into
          one shipped capstone.
        </p>
      </LabSection>
    </VibeLabShell>
  )
}
