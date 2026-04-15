import { useEffect, useState } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { createCheckoutSession } from '../lib/payments';
import type { TokenTransaction } from '../types/database';

// ── Milestone definitions ─────────────────────────────────────────────────────
// Add more milestones here as the economy grows. First matching threshold shows.
const MILESTONES = [
  {
    threshold: 1500,
    emoji: '🚀',
    title: "You're in Hyper territory!",
    subtitle: 'You\'ve hit 1,500 BROski$. Book a 1-to-1 project review — you\'ve earned it.',
    colour: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  },
  {
    threshold: 500,
    emoji: '🔥',
    title: '500 BROski$ milestone!',
    subtitle: 'Enough to book a 1-to-1 project review slot. Let\'s get you some feedback.',
    colour: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
  {
    threshold: 200,
    emoji: '⚡',
    title: 'Power user unlocked!',
    subtitle: '200 BROski$ — you can unlock a full bonus deep-dive module right now.',
    colour: 'bg-gradient-to-r from-blue-500 to-purple-500',
  },
  {
    threshold: 50,
    emoji: '🎯',
    title: 'First milestone!',
    subtitle: 'You\'ve got 50 BROski$ — enough for an AI Prompt Pack. Keep going!',
    colour: 'bg-gradient-to-r from-green-400 to-teal-500',
  },
] as const;

function MilestoneBanner({ balance }: { balance: number }) {
  const milestone = MILESTONES.find((m) => balance >= m.threshold);
  if (!milestone) return null;
  return (
    <div className={`${milestone.colour} rounded-2xl p-5 text-white flex items-center gap-4 shadow-lg`}>
      <span className="text-4xl flex-shrink-0">{milestone.emoji}</span>
      <div>
        <p className="font-black text-lg leading-snug">{milestone.title}</p>
        <p className="text-white/80 text-sm mt-0.5">{milestone.subtitle}</p>
      </div>
    </div>
  );
}

// ── Token pack definitions ────────────────────────────────────────────────────
// price_id values map to STRIPE_PRICE_STARTER / BUILDER / HYPER in HyperCode V2.4 .env
// Prices locked April 14, 2026 — do not change without updating Stripe products too.

const TOKEN_PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 200,
    price: '£5',
    emoji: '⚡',
    colour: 'border-blue-200 bg-blue-50',
    btnColour: 'bg-blue-600 hover:bg-blue-700',
  },
  {
    id: 'builder',
    name: 'Builder Pack',
    tokens: 800,
    price: '£15',
    emoji: '🔥',
    colour: 'border-purple-200 bg-purple-50',
    btnColour: 'bg-purple-600 hover:bg-purple-700',
    badge: 'Most Popular',
  },
  {
    id: 'hyper',
    name: 'Hyper Pack',
    tokens: 2500,
    price: '£35',
    emoji: '🚀',
    colour: 'border-yellow-200 bg-yellow-50',
    btnColour: 'bg-yellow-500 hover:bg-yellow-600',
  },
] as const;

// ── How to earn BROski$ ───────────────────────────────────────────────────────
const EARN_WAYS = [
  { emoji: '📚', action: 'Complete a lesson', amount: '+10 BROski$' },
  { emoji: '🏆', action: 'Finish a module', amount: '+50 BROski$' },
  { emoji: '🔥', action: '7-day learning streak', amount: '+100 BROski$' },
  { emoji: '🤝', action: 'Refer a friend who buys', amount: '+200 BROski$' },
  { emoji: '🎯', action: 'Submit a capstone project', amount: '+150 BROski$' },
];

// ── What you can spend BROski$ on ─────────────────────────────────────────────
const SPEND_WAYS = [
  { emoji: '🤖', item: 'AI Prompt Pack (per module)', cost: '50 BROski$' },
  { emoji: '📖', item: 'Bonus deep-dive module', cost: '200 BROski$' },
  { emoji: '⏩', item: 'Early access to next course', cost: '300 BROski$' },
  { emoji: '🎤', item: '1-to-1 project review slot', cost: '500 BROski$' },
  { emoji: '🎨', item: 'Custom BROski avatar/badge', cost: '100 BROski$' },
];

function reasonLabel(reason: string): string {
  const map: Record<string, string> = {
    lesson_complete: '📚 Lesson complete',
    module_complete: '🏆 Module complete',
    streak_7: '🔥 7-day streak',
    referral: '🤝 Referral reward',
    capstone: '🎯 Capstone submitted',
    stripe_purchase: '💳 Token pack purchase',
    refund: '↩️ Refund',
    spend_ai_prompt: '🤖 AI Prompt Pack',
    spend_bonus_module: '📖 Bonus module',
    spend_early_access: '⏩ Early access',
    spend_review: '🎤 Project review',
    spend_avatar: '🎨 Custom avatar',
  };
  return map[reason] ?? reason;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TokensPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);
  const [packError, setPackError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error) setTransactions(data ?? []);
      setLoadingTx(false);
    }
    void fetchTransactions();
  }, [user]);

  const balance = user?.broski_tokens ?? 0;

  async function handleBuyPack(packId: string) {
    if (!user || buyingPackId) return;
    setPackError(null);
    setBuyingPackId(packId);
    try {
      const url = await createCheckoutSession(packId, user.id);
      window.location.href = url;
    } catch {
      setPackError('Checkout failed — try again or contact support.');
      setBuyingPackId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12">

      {/* ── Balance hero ─────────────────────────────────────────────────── */}
      <div className="text-center">
        <p className="text-6xl font-black text-yellow-500 tracking-tight">
          💰 {balance.toLocaleString()}
        </p>
        <p className="text-xl font-semibold text-gray-700 mt-2">BROski$ balance</p>
        <p className="text-sm text-gray-500 mt-1">
          Earn by learning. Spend on power-ups. No expiry.
        </p>
      </div>

      {/* ── Milestone banner (only shows when threshold hit) ─────────────── */}
      <MilestoneBanner balance={balance} />

      {/* ── Buy packs ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Buy token packs</h2>
        {packError && (
          <p className="text-sm text-red-600 mb-2">{packError}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TOKEN_PACKS.map((pack) => {
            const isLoading = buyingPackId === pack.id;
            const anyLoading = buyingPackId !== null;
            return (
              <div
                key={pack.id}
                className={`relative rounded-xl border-2 p-5 flex flex-col gap-3 ${pack.colour}`}
              >
                {'badge' in pack && pack.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    {pack.badge}
                  </span>
                )}
                <div className="text-3xl">{pack.emoji}</div>
                <div>
                  <p className="font-bold text-gray-900">{pack.name}</p>
                  <p className="text-2xl font-black text-gray-900">
                    {pack.tokens.toLocaleString()} <span className="text-base font-semibold">BROski$</span>
                  </p>
                </div>
                <button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={anyLoading}
                  className={`w-full py-2 rounded-lg text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${pack.btnColour}`}
                >
                  {isLoading ? 'Redirecting…' : `Buy for ${pack.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Earn + spend ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to earn</h2>
          <ul className="space-y-3">
            {EARN_WAYS.map((w) => (
              <li key={w.action} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{w.emoji}</span>
                  {w.action}
                </span>
                <span className="text-sm font-bold text-green-700">{w.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">What you can unlock</h2>
          <ul className="space-y-3">
            {SPEND_WAYS.map((w) => (
              <li key={w.item} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <span>{w.emoji}</span>
                  {w.item}
                </span>
                <span className="text-sm font-bold text-gray-900">{w.cost}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Transaction history ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction history</h2>
        {loadingTx ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-4xl mb-3">🪙</p>
            <p className="font-semibold">No transactions yet</p>
            <p className="text-sm mt-1">Complete a lesson to earn your first BROski$!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Activity</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800">{reasonLabel(tx.reason)}</td>
                    <td className={`px-4 py-3 text-right font-bold tabular-nums ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                      {new Date(tx.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
