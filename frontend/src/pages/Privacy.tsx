import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-hfz-space-black py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-hfz-text-primary mb-3 font-display">
            🔒 Privacy Policy
          </h1>
          <p className="text-hfz-text-secondary text-lg">
            Plain English. No legal waffle. Built for real humans. 🧠
          </p>
          <p className="text-hfz-text-disabled text-sm mt-2">Last updated: May 2026</p>
        </div>

        {/* TL;DR Card */}
        <div className="bg-hfz-midnight border border-hfz-violet/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-hfz-gold mb-3">⚡ TL;DR (The Quick Version)</h2>
          <ul className="space-y-2 text-hfz-text-primary text-base leading-relaxed">
            <li>✅ We collect only what we need to run your account</li>
            <li>✅ We never sell your data. Ever.</li>
            <li>✅ You can delete your account and all your data anytime</li>
            <li>✅ We use Supabase (EU servers) + Stripe for payments</li>
            <li>✅ Cookies are used to keep you logged in — that's it</li>
          </ul>
        </div>

        {/* Section: What We Collect */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">📦 What We Collect</h2>
          <p className="text-hfz-text-secondary mb-3">When you sign up or use HyperFocus Z0ne, we collect:</p>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>📧 <strong>Your email address</strong> — to log you in and send important updates</li>
            <li>🐾 <strong>Your pet + XP data</strong> — to track your progress and rewards</li>
            <li>💰 <strong>Payment info</strong> — handled entirely by <strong>Stripe</strong> (we never see your card details)</li>
            <li>🖥️ <strong>Usage data</strong> — which pages you visit, so we can improve the platform</li>
          </ul>
        </div>

        {/* Section: How We Use It */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🎯 How We Use It</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>🔑 To run your account and keep you logged in</li>
            <li>🏆 To award BROski$, XP, and track your quests</li>
            <li>💳 To process payments via Stripe</li>
            <li>📬 To send you important updates (no spam — we hate it too)</li>
            <li>🛠️ To fix bugs and improve the platform</li>
          </ul>
        </div>

        {/* Section: Cookies */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🍪 Cookies</h2>
          <p className="text-hfz-text-secondary mb-3">We use cookies for one reason:</p>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>🔐 <strong>Session cookies</strong> — to keep you logged in between visits</li>
          </ul>
          <p className="text-hfz-text-secondary mt-3 text-sm">No tracking cookies. No ad cookies. No creepy third-party profiling.</p>
        </div>

        {/* Section: Your Rights */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">⚖️ Your Rights (GDPR)</h2>
          <p className="text-hfz-text-secondary mb-3">You have full control over your data:</p>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>👁️ <strong>See</strong> what data we hold about you</li>
            <li>✏️ <strong>Update</strong> your info anytime from your profile</li>
            <li>🗑️ <strong>Delete</strong> your account and all data — just email us</li>
            <li>📤 <strong>Export</strong> your data on request</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-3">📬 Get In Touch</h2>
          <p className="text-hfz-text-secondary leading-relaxed">
            Questions about your data? Email us at{' '}
            <a href="mailto:hello@hyperfocuszone.com" className="text-hfz-violet-light hover:text-hfz-cyan transition-colors">
              hello@hyperfocuszone.com
            </a>
          </p>
          <p className="text-hfz-text-secondary text-sm mt-2">We're a small Welsh team — we'll get back to you fast. 🏴󠁧󠁢󠁷󠁬󠁳󠁿</p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link to="/" className="text-hfz-text-secondary hover:text-hfz-violet-light transition-colors text-sm">
            ← Back to HyperFocus Z0ne
          </Link>
          <span className="text-hfz-text-disabled mx-3">·</span>
          <Link to="/terms" className="text-hfz-text-secondary hover:text-hfz-violet-light transition-colors text-sm">
            Terms of Service →
          </Link>
        </div>

      </div>
    </div>
  );
}
