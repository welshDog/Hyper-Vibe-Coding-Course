import { useState, type FormEvent } from 'react'
import { signUpForEarlyAccess, type EarlyAccessOutcome } from '../lib/earlyAccess'

/** Tiny Tester warm-up — Perplexity prompt that returns a tiny app idea +
 *  first 3 steps. Sits above the reward so visitors feel the value before
 *  the form ask. URL provided in the spec — kept verbatim so the prompt is
 *  the one tested with the audience. */
const PERPLEXITY_PROMPT_URL =
  'https://www.perplexity.ai/search?q=I+am+new+to+AI+coding.+Give+me+one+tiny+app+idea+I+can+build+today,+explain+it+in+plain+English,+and+give+me+the+first+3+steps.'

/**
 * /early-access — Founding Member waitlist landing page.
 *
 * One-page, mobile-first, dark theme. Own chrome (no global Layout) — same
 * pattern as LandingPage and the /vibe-labs hub. Captures name + email and
 * inserts into `public.early_access_signups` via the helper, which folds the
 * "already signed up" Postgres unique-violation into a friendly success state.
 */
export default function EarlyAccess() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<EarlyAccessOutcome | null>(null)

  const success = outcome?.ok === true
  const errorMessage =
    outcome?.ok === false
      ? outcome.reason === 'invalid_name'
        ? "We need a name to greet you with — even just your first name's grand."
        : outcome.reason === 'invalid_email'
          ? "That email doesn't look quite right — give it another go?"
          : "Something went sideways saving your spot. Try again in a moment or ping us on Discord."
      : null

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const result = await signUpForEarlyAccess({ name, email })
    setOutcome(result)
    setBusy(false)
    if (result.ok) {
      // Clear the form on success so the celebration card stands alone.
      setName('')
      setEmail('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white selection:bg-purple-500/40">
      {/* ───── Hero ───── */}
      <header className="px-6 pt-20 pb-12 text-center max-w-3xl mx-auto">
        <div className="text-5xl mb-6" aria-hidden="true">🐶♾️</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
          Get Early Access to the{' '}
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            HyperFocus Zone
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Built for <span className="text-purple-300 font-bold">ADHD, dyslexic &amp; autistic minds</span>.
          No gatekeeping. No syntax walls. Just you, AI, and an empire you built.
        </p>
        <a
          href="#join"
          className="mt-8 inline-block px-8 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        >
          Reserve My Spot 🚀
        </a>
        <p className="mt-4 text-xs text-gray-500">
          ✅ 200 BROski$ on launch · Founding Member badge for life
        </p>
      </header>

      {/* ───── What is this? ───── */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-10">
          What is this, actually?
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {[
            {
              emoji: '🧠',
              title: 'ND-first by design',
              body: 'Short sentences. Chunked tasks. Emojis as scaffolding. Built by an ND dev who lived the bootcamp pain.',
            },
            {
              emoji: '💰',
              title: 'BROski$ economy + AI pets',
              body: 'Earn tokens for every win. Your BROskiPet levels up with you. Dopamine loop that actually serves the learning.',
            },
            {
              emoji: '⚛️',
              title: 'Quantum + a real crew',
              body: 'IBM Quantum module on the top tier. Discord crew that gets you. Not just videos — a place to belong.',
            },
          ].map((b) => (
            <li
              key={b.title}
              className="rounded-2xl bg-gray-900/80 border border-gray-800 p-6 hover:border-purple-500/40 transition-colors duration-200"
            >
              <div className="text-3xl mb-3" aria-hidden="true">{b.emoji}</div>
              <h3 className="font-black text-lg mb-2">{b.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{b.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───── Tiny Tester (warm-up) ───── */}
      <section className="px-6 py-8">
        <div className="max-w-2xl mx-auto rounded-2xl bg-gray-900/80 border border-purple-500/30 p-6 sm:p-8 text-center">
          <div className="text-4xl mb-3" aria-hidden="true">🧪</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-2">Tiny Tester</h2>
          <p className="text-gray-300 text-base sm:text-lg mb-5">
            Two minutes. One AI prompt. One tiny app idea you can build today.
          </p>
          <a
            href={PERPLEXITY_PROMPT_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-block px-7 py-3 rounded-2xl font-black text-base bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
          >
            Get My App Idea 🚀
          </a>
          <p className="mt-3 text-xs text-gray-500">
            Opens Perplexity in a new tab — your spot here is safe.
          </p>
        </div>
      </section>

      {/* ───── Early Bird Reward ───── */}
      <section className="px-6 py-12">
        <div className="max-w-2xl mx-auto rounded-2xl bg-gradient-to-br from-purple-900/40 to-violet-900/40 border border-purple-500/40 p-8 text-center shadow-2xl shadow-purple-500/20">
          <div className="inline-flex items-center gap-2 bg-yellow-900/40 border border-yellow-500/50 rounded-full px-4 py-1 text-xs font-bold text-yellow-300 mb-4">
            🏆 FOUNDING MEMBER REWARD
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Join early. Get spoiled.
          </h2>
          <p className="text-gray-300 mb-6">
            Every Founding Member on the list when we open the doors gets:
          </p>
          <ul className="space-y-3 text-left max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 flex-shrink-0" aria-hidden="true">💰</span>
              <span><span className="font-bold text-yellow-300">200 BROski$</span> dropped in your wallet on launch day</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0" aria-hidden="true">🛡️</span>
              <span><span className="font-bold text-purple-300">Founding Member ♾️ badge</span> on your profile for life</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 flex-shrink-0" aria-hidden="true">🚪</span>
              <span>First access — before the public launch goes live</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ───── Email form ───── */}
      <section id="join" className="px-6 py-16 max-w-xl mx-auto scroll-mt-8">
        <h2 className="text-3xl sm:text-4xl font-black text-center mb-2">
          Save Your Spot
        </h2>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Two fields. Takes 10 seconds. No spam — promise.
        </p>

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-green-900/40 border border-emerald-500/50 p-8 text-center shadow-2xl shadow-emerald-500/20"
          >
            <div className="text-5xl mb-3" aria-hidden="true">🎉</div>
            <p className="text-2xl font-black mb-2">You&apos;re in! 🐶♾️</p>
            <p className="text-emerald-200 text-sm">
              {outcome.alreadySignedUp
                ? "You were already on the list, BROski — your spot is locked. 🔒"
                : "We've saved your seat. We'll DM you the moment the doors open."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="ea-name" className="block text-sm font-bold mb-2 text-gray-300">
                Your name
              </label>
              <input
                id="ea-name"
                type="text"
                autoComplete="given-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60 transition-colors"
                placeholder="Bro"
              />
            </div>
            <div>
              <label htmlFor="ea-email" className="block text-sm font-bold mb-2 text-gray-300">
                Your email
              </label>
              <input
                id="ea-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 disabled:opacity-60 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl bg-amber-900/30 border border-amber-500/40 px-4 py-3 text-amber-200 text-sm"
              >
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-4 px-6 rounded-2xl font-black text-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300/60 disabled:opacity-60 disabled:hover:scale-100"
            >
              {busy ? 'Saving your spot…' : "I'm In 🚀"}
            </button>
            <p className="text-center text-xs text-gray-500">
              We&apos;ll only email you about the launch. Unsubscribe anytime.
            </p>
          </form>
        )}
      </section>

      {/* ───── Footer ───── */}
      <footer className="px-6 py-12 border-t border-gray-900 text-center">
        <p className="text-gray-400 italic mb-2">
          &ldquo;Stop apologising for your brain. Start building.&rdquo;
        </p>
        <p className="text-xs text-gray-600">
          Built by{' '}
          <a
            href="https://github.com/welshDog"
            className="text-purple-400 hover:text-purple-300 font-bold"
            target="_blank"
            rel="noreferrer"
          >
            @welshDog
          </a>{' '}
          · Llanelli, Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁧 · 🐶♾️
        </p>
      </footer>
    </div>
  )
}
