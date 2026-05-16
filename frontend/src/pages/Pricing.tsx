import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// PASTE YOUR STRIPE PAYMENT LINK URLs INTO THESE CONSTANTS
// Get them from: Stripe Dashboard → Payment Links → Create Link
// ============================================================
const STRIPE_LINKS = {
  starter: import.meta.env.VITE_STRIPE_STARTER_URL || '#',
  builder: import.meta.env.VITE_STRIPE_BUILDER_URL || '#',
  hyperLegend: import.meta.env.VITE_STRIPE_HYPER_LEGEND_URL || '#',
  // Monthly subscription variants
  builderMonthly: import.meta.env.VITE_STRIPE_BUILDER_MONTHLY_URL || '#',
  hyperLegendMonthly: import.meta.env.VITE_STRIPE_HYPER_LEGEND_MONTHLY_URL || '#',
};

const TIERS = [
  {
    id: 'starter',
    emoji: '🌱',
    name: 'Starter',
    tagline: 'Set up your brain & your empire',
    priceOnce: '£29',
    priceMonthly: null,
    broskiTokens: 200,
    modules: 'M1 – M4',
    moduleCount: 4,
    highlight: false,
    badge: null,
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500/40',
    btnColor: 'bg-green-600 hover:bg-green-500',
    features: [
      '🧘 M1: Designing Your Focus Zone',
      '🌱 M2: Your First Vibe (Docker empire)',
      '🎤 M3: Prompt Like a Pro',
      '🏗️ M4: Build Your First App',
      '200 BROski$ tokens on signup',
      'Quiz pack + practical tasks',
      'Completion certificate',
      'Discord community access',
    ],
    notIncluded: [
      'Full Stack modules',
      'Agent architecture',
      'BROskiPets & AI memory',
      'Web3 / On-chain modules',
      'Quantum Vibe bonus module',
    ],
    stripeKey: 'starter',
    paymentType: 'one-time',
  },
  {
    id: 'builder',
    emoji: '🔥',
    name: 'Builder',
    tagline: 'The full Vibe Coding journey',
    priceOnce: '£79',
    priceMonthly: '£9/mo',
    broskiTokens: 800,
    modules: 'M1 – M11',
    moduleCount: 11,
    highlight: true,
    badge: '🏆 Most Popular',
    color: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-500/70',
    btnColor: 'bg-purple-600 hover:bg-purple-500',
    features: [
      '✅ Everything in Starter',
      '🧠 M5: Full Stack Vibe (Supabase)',
      '🔥 M6: HyperCode The Hyper Way',
      '🛠️ M7: Agent Architecture & Manifests',
      '🐕 M8: Soulful Entities (AI Pets)',
      '🔗 M9: Web3 & On-Chain Evolution',
      '🛡️ M10: Security & SRE Observability',
      '🚀 M11: Ship, Scale & Graduate',
      '800 BROski$ tokens on signup',
      'Your BROskiPet evolves with you',
      'Priority Discord support',
      'BROski Elite 🔥 badge on graduation',
    ],
    notIncluded: [
      'Quantum Vibe bonus module',
      'IBM Quantum cloud QPU access',
    ],
    stripeKey: 'builder',
    paymentType: 'both',
  },
  {
    id: 'hyper-legend',
    emoji: '⚛️',
    name: 'Hyper Legend',
    tagline: 'The full empire — including Quantum',
    priceOnce: '£149',
    priceMonthly: '£15/mo',
    broskiTokens: 2500,
    modules: 'M1 – M13 + Quantum',
    moduleCount: 13,
    highlight: false,
    badge: '⚛️ Quantum Included',
    color: 'from-yellow-400 to-orange-500',
    borderColor: 'border-yellow-400/60',
    btnColor: 'bg-yellow-500 hover:bg-yellow-400 text-black',
    features: [
      '✅ Everything in Builder',
      '🤝 M12: The Ride or Die Contribution',
      '⚛️ BONUS M13: Quantum Vibe IDE',
      'Drag-and-drop quantum circuits',
      'Web3 wallet quantum seed generator',
      'IBM Quantum cloud QPU access',
      '2500 BROski$ tokens on signup',
      'BROski Legend ♾️ status for life',
      'Name in the Hall of Legends on GitHub',
      'Direct access to welshDog for Q&A',
      '1-year free updates to all new modules',
    ],
    notIncluded: [],
    stripeKey: 'hyperLegend',
    paymentType: 'both',
  },
];

export default function Pricing() {
  const [billingToggle, setBillingToggle] = useState<Record<string, 'once' | 'monthly'>>({
    builder: 'once',
    'hyper-legend': 'once',
  });
  const navigate = useNavigate();

  const getStripeUrl = (tier: typeof TIERS[0]) => {
    if (tier.paymentType === 'one-time') {
      return STRIPE_LINKS[tier.stripeKey as keyof typeof STRIPE_LINKS];
    }
    const isMonthly = billingToggle[tier.id] === 'monthly';
    if (isMonthly) {
      const monthlyKey = (tier.stripeKey + 'Monthly') as keyof typeof STRIPE_LINKS;
      return STRIPE_LINKS[monthlyKey] || STRIPE_LINKS[tier.stripeKey as keyof typeof STRIPE_LINKS];
    }
    return STRIPE_LINKS[tier.stripeKey as keyof typeof STRIPE_LINKS];
  };

  const handleCheckout = (tier: typeof TIERS[0]) => {
    const url = getStripeUrl(tier);
    if (url && url !== '#') {
      window.location.href = url;
    } else {
      // Fallback to payment success for test mode
      navigate('/payment-success');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="text-center pt-16 pb-10 px-4">
        <div className="text-5xl mb-4">🐶♾️</div>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Pick Your Vibe Level
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Built for <span className="text-purple-400 font-bold">ADHD, dyslexic &amp; autistic minds</span>.
          No gatekeeping. No syntax walls. Just you, AI, and an empire you built.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-green-900/30 border border-green-500/40 rounded-full px-4 py-2 text-sm text-green-400">
          ✅ 72/72 tests passing · Platform LIVE · BROski$ economy active
        </div>
      </div>

      {/* Tier Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative rounded-2xl border-2 ${
              tier.highlight
                ? `${tier.borderColor} shadow-2xl shadow-purple-500/20 scale-105`
                : tier.borderColor
            } bg-gray-900/80 backdrop-blur-sm overflow-hidden flex flex-col`}
          >
            {/* Badge */}
            {tier.badge && (
              <div className={`bg-gradient-to-r ${tier.color} text-white text-xs font-bold text-center py-2 tracking-wider`}>
                {tier.badge}
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              {/* Header */}
              <div className="mb-6">
                <div className="text-4xl mb-2">{tier.emoji}</div>
                <h2 className="text-2xl font-black">{tier.name}</h2>
                <p className="text-gray-400 text-sm mt-1">{tier.tagline}</p>
                <div className="text-xs text-gray-500 mt-1">Modules: {tier.modules} ({tier.moduleCount} total)</div>
              </div>

              {/* Price */}
              <div className="mb-4">
                {tier.paymentType === 'one-time' ? (
                  <div>
                    <span className="text-4xl font-black">{tier.priceOnce}</span>
                    <span className="text-gray-500 text-sm ml-2">one-time</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => setBillingToggle((p) => ({ ...p, [tier.id]: 'once' }))}
                        className={`text-sm px-3 py-1 rounded-full border transition-all ${
                          billingToggle[tier.id] === 'once'
                            ? 'bg-white text-black border-white font-bold'
                            : 'border-gray-600 text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        One-time
                      </button>
                      <button
                        onClick={() => setBillingToggle((p) => ({ ...p, [tier.id]: 'monthly' }))}
                        className={`text-sm px-3 py-1 rounded-full border transition-all ${
                          billingToggle[tier.id] === 'monthly'
                            ? 'bg-white text-black border-white font-bold'
                            : 'border-gray-600 text-gray-400 hover:border-gray-400'
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                    <div>
                      <span className="text-4xl font-black">
                        {billingToggle[tier.id] === 'monthly' ? tier.priceMonthly : tier.priceOnce}
                      </span>
                      {billingToggle[tier.id] === 'once' && (
                        <span className="text-gray-500 text-sm ml-2">one-time</span>
                      )}
                    </div>
                  </div>
                )}
                {/* BROski$ tokens */}
                <div className="mt-2 inline-flex items-center gap-1 bg-yellow-900/30 border border-yellow-500/40 rounded-full px-3 py-1 text-xs text-yellow-400">
                  💰 {tier.broskiTokens.toLocaleString()} BROski$ on signup
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleCheckout(tier)}
                className={`w-full py-3 px-6 rounded-xl font-black text-lg transition-all duration-200 mb-6 ${
                  tier.btnColor
                } text-white shadow-lg hover:scale-105 active:scale-95`}
              >
                Get {tier.name} {tier.emoji}
              </button>

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
                {tier.notIncluded.map((f, i) => (
                  <li key={`not-${i}`} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 flex-shrink-0">✗</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ strip */}
      <div className="max-w-2xl mx-auto px-4 pb-16 text-center">
        <h3 className="text-xl font-bold mb-4 text-gray-300">Common Questions</h3>
        <div className="space-y-4 text-left">
          {[
            ['Do I need coding experience?', 'Zero. Module 1 starts with setting up your brain — not your IDE. If you can type, you can Vibe Code.'],
            ['Can I upgrade later?', 'Yes! Just pay the difference. Contact us on Discord and we\'ll sort it.'],
            ['What if I get stuck?', 'Every module has a ✨ Practical Task and BROski AI is in your corner 24/7. Plus Discord crew.'],
            ['Is this ND-friendly?', 'Built by an ND dev, for ND devs. Short sentences, chunked tasks, emojis, BROski$ rewards. Always.'],
          ].map(([q, a]) => (
            <div key={q} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <p className="font-bold text-white mb-1">{q}</p>
              <p className="text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-gray-600 text-xs">
          Payments powered by Stripe 🔒 · All prices include VAT · Built by welshDog 🐶♾️ Llanelli, Wales
        </p>
      </div>
    </div>
  );
}
