import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-hfz-space-black py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-hfz-text-primary mb-3 font-display">
            📜 Terms of Service
          </h1>
          <p className="text-hfz-text-secondary text-lg">
            Short. Clear. Human. No 40-page legal novels here. 🧠
          </p>
          <p className="text-hfz-text-disabled text-sm mt-2">Last updated: May 2026</p>
        </div>

        {/* TL;DR Card */}
        <div className="bg-hfz-midnight border border-hfz-violet/30 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-hfz-gold mb-3">⚡ TL;DR (The Quick Version)</h2>
          <ul className="space-y-2 text-hfz-text-primary text-base leading-relaxed">
            <li>✅ Be cool. Don't abuse the platform or other users</li>
            <li>✅ BROski$ tokens have no real-world cash value</li>
            <li>✅ Your content (projects, quests) stays yours</li>
            <li>✅ We can suspend accounts that break the rules</li>
            <li>✅ We're based in Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿 — UK law applies</li>
          </ul>
        </div>

        {/* Section: Using the Platform */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🚀 Using HyperFocus Z0ne</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>🔞 You must be 13 or older to use this platform</li>
            <li>🔑 Keep your account credentials safe — you're responsible for your account</li>
            <li>🤝 Treat other community members with respect</li>
            <li>🛑 Don't try to hack, scrape, or abuse the platform</li>
            <li>✅ One account per person please</li>
          </ul>
        </div>

        {/* Section: BROski$ Tokens */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🪙 BROski$ Tokens</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>🎮 BROski$ are a <strong>platform reward currency</strong> — not real money</li>
            <li>🚫 They cannot be exchanged for cash or transferred to other users</li>
            <li>🐾 They can be spent in the BROski$ Shop on pets, boosts, and upgrades</li>
            <li>⚠️ If your account is closed for breaking rules, your BROski$ balance is forfeited</li>
          </ul>
        </div>

        {/* Section: Payments */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">💳 Payments + Subscriptions</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>💷 All prices are in <strong>GBP (£)</strong></li>
            <li>🔄 Subscriptions renew automatically — cancel anytime from your profile</li>
            <li>💰 Payments are processed securely by <strong>Stripe</strong></li>
            <li>🙋 If something goes wrong with a payment, get in touch and we'll sort it</li>
            <li>↩️ Refunds are handled case by case — email us within 14 days</li>
          </ul>
        </div>

        {/* Section: Your Content */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🎨 Your Content</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>✅ Anything you build on this platform is <strong>yours</strong></li>
            <li>📢 By sharing projects publicly, you give us permission to feature them (with credit)</li>
            <li>🚫 Don't post content that's illegal, harmful, or belongs to someone else without permission</li>
          </ul>
        </div>

        {/* Section: Our Content */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🔒 Our Content</h2>
          <ul className="space-y-2 text-hfz-text-primary leading-relaxed">
            <li>📚 Course content, videos, and materials are owned by HyperFocus Z0ne</li>
            <li>🚫 Don't resell, copy, or redistribute our course content</li>
            <li>✅ Personal use and learning is absolutely fine — that's what it's for!</li>
          </ul>
        </div>

        {/* Section: Changes */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-4">🔄 Changes to These Terms</h2>
          <p className="text-hfz-text-secondary leading-relaxed">
            If we update these terms, we'll let you know by email or a notice on the site. 
            Continuing to use HyperFocus Z0ne after changes means you're cool with them.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-hfz-midnight border border-hfz-violet/20 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-hfz-text-primary mb-3">📬 Questions?</h2>
          <p className="text-hfz-text-secondary leading-relaxed">
            Email us at{' '}
            <a href="mailto:hello@hyperfocuszone.com" className="text-hfz-violet-light hover:text-hfz-cyan transition-colors">
              hello@hyperfocuszone.com
            </a>
            {' '}— we're a small Welsh team and we'll reply fast. 🏴󠁧󠁢󠁷󠁬󠁳󠁿
          </p>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link to="/privacy" className="text-hfz-text-secondary hover:text-hfz-violet-light transition-colors text-sm">
            ← Privacy Policy
          </Link>
          <span className="text-hfz-text-disabled mx-3">·</span>
          <Link to="/" className="text-hfz-text-secondary hover:text-hfz-violet-light transition-colors text-sm">
            Back to HyperFocus Z0ne →
          </Link>
        </div>

      </div>
    </div>
  );
}
