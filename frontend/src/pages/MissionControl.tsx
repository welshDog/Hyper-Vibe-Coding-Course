// MissionControl — the easter-egg landing page.
//
// What it is NOT: a duplicate Catch Stragglers / Missions Kanban inside
// the course. That would mean re-implementing a backend (the course is
// a Vite SPA on Vercel, no FastAPI runs here) and re-shipping ~600
// lines of UI already proven in the sibling repo.
//
// What it IS: a stealth launchpad. The footer's `weird` link drops the
// admin onto this page; this page hands them off (new tab) to the
// real operator deck in **WelshDog-Mission-Control**, where the full
// Express `/api/send-dm` backend + glass-panel Catch Stragglers UI
// live (commits 00aa770 / ceadad2 / c5b36c2 in that repo, May 23).
//
// Auth: guarded upstream by `<AdminRoute role="admin" />` in App.tsx
// — the page itself doesn't re-check; that match the convention of
// every other route inside the AdminRoute block (Admin, signups).
//
// Bundle: route-level lazy-loaded; lucide-react icons are tree-shaken
// from the existing vendor-ui chunk (no new dep).
import { ExternalLink, Rocket, UserCheck, Stethoscope, Sunrise, Activity, Sparkles } from 'lucide-react';

// Env-driven so prod can swap the host without a code change.
// Defaults to the dev port (5174) so a local admin clicking `weird`
// during dev lands on whatever MC instance is running locally.
const MC_URL = (import.meta.env.VITE_MISSION_CONTROL_URL as string | undefined) || 'http://localhost:5174';

const PANELS: Array<{ Icon: typeof UserCheck; label: string; desc: string }> = [
  {
    Icon: UserCheck,
    label: 'Catch Stragglers',
    desc: 'Find students idle 7+ days → draft tone-tagged DMs (warm · curious · terse) → approve and send. 24h-per-user rate limit, every send audited to mc_missions.',
  },
  {
    Icon: Stethoscope,
    label: 'Health Pulse',
    desc: 'Scans course signals (stuck on a level, quiet day) and auto-creates mission cards. Heartbeat row drops even on quiet days so the loop is provable.',
  },
  {
    Icon: Sunrise,
    label: 'Morning Brief',
    desc: 'Last-24h aggregate — missions detected, missions shipped, level progress events. Defensive: missing tables surface as "skipped" rather than crashing.',
  },
  {
    Icon: Activity,
    label: 'Missions Kanban',
    desc: 'detected → investigating → fixing → shipped. Cards auto-stamp resolved_at when they land in shipped (and un-stamp if pulled back).',
  },
];

export default function MissionControl() {
  return (
    <main className="min-h-screen">
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hfz-violet-light/10 border border-hfz-violet-light/30 mb-5">
            <Sparkles className="w-3 h-3 text-hfz-cyan" aria-hidden="true" />
            <span className="font-mono text-[11px] tracking-hfz-caps uppercase text-hfz-violet-light">
              You found it
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-hfz-cyan/10 border border-hfz-cyan/30 items-center justify-center shrink-0 mt-2">
              <Rocket className="w-6 h-6 text-hfz-cyan" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-hfz-text-primary leading-[1.05] tracking-tight">
                Mission <span className="text-hfz-cyan">Control</span>
              </h1>
              <p className="mt-4 text-hfz-body-lg text-hfz-text-secondary max-w-2xl">
                Course-ops command deck — the closed loop of detect → action → ship.
                The real surface lives in a sibling app so it can carry a real backend
                without dragging the course bundle.
              </p>
            </div>
          </div>
        </header>

        {/* ── Launch CTA ──────────────────────────────────────────── */}
        <section
          className="rounded-2xl border border-hfz-border-violet bg-[#0F0E1E]/60 backdrop-blur-md p-6 sm:p-8 mb-10"
          aria-label="Launch Mission Control"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-hfz-h3 font-bold text-hfz-text-primary mb-1">
                Open the operator deck
              </h2>
              <p className="text-hfz-body text-hfz-text-secondary">
                Agent Actions strip · Missions Kanban · live Activity Ticker. Auth uses
                the same Supabase project, so you stay signed in.
              </p>
              <p className="mt-3 font-mono text-[12px] text-hfz-violet-light/70 truncate">
                → {MC_URL}
              </p>
            </div>
            <a
              href={MC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-hfz-cyan/10 border border-hfz-cyan/40 text-hfz-cyan font-bold hover:bg-hfz-cyan/20 hover:border-hfz-cyan transition-colors shrink-0"
            >
              Open Mission Control
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ── What's inside ────────────────────────────────────────── */}
        <section aria-labelledby="mc-panels-heading">
          <h3
            id="mc-panels-heading"
            className="font-mono text-[11px] font-bold uppercase tracking-hfz-caps text-hfz-violet-light mb-4"
          >
            What lives in there
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PANELS.map(({ Icon, label, desc }) => (
              <article
                key={label}
                className="rounded-xl border border-hfz-border-violet bg-[#0F0E1E]/40 p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg bg-hfz-cyan/10 border border-hfz-cyan/30 flex items-center justify-center shrink-0"
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4 text-hfz-cyan" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-hfz-h4 font-semibold text-hfz-text-primary">{label}</h4>
                    <p className="mt-1.5 text-hfz-body text-hfz-text-secondary leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Why a separate app (the explanation, not a footnote) ── */}
        <section className="mt-10 rounded-xl border border-hfz-border-violet/60 bg-[#0F0E1E]/30 p-5">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-hfz-caps text-hfz-violet-light mb-2">
            Why it lives elsewhere
          </h3>
          <p className="text-hfz-body text-hfz-text-secondary leading-relaxed">
            Catch Stragglers needs a server (Discord bot token must never reach the
            browser). The course is a Vite SPA on Vercel — no Node runtime. So the
            operator surface lives in <span className="text-hfz-cyan font-mono">WelshDog-Mission-Control</span>,
            a small Vite + Express app. One repo, one backend, one place to harden.
          </p>
        </section>

        {/* ── Stealth-door footer ─────────────────────────────────── */}
        <footer className="mt-12 pt-6 border-t border-hfz-border-violet text-center">
          <p className="font-mono text-[11px] uppercase tracking-hfz-caps text-hfz-violet-light/70">
            🐶♾️ Stealth door · © {new Date().getFullYear()} HyperFocus Z0ne
          </p>
        </footer>
      </div>
    </main>
  );
}
