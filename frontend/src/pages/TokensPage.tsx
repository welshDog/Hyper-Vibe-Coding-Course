import { useEffect, useState } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { createCheckoutSession } from '../lib/payments';
import { useReferralLink } from '../hooks/useReferralLink';
import type { TokenTransaction } from '../types/database';
import { HVZButton, HVZCard, HVZTag, type TagColor } from '../components/ui/hvz';

// ── Milestone definitions ─────────────────────────────────────────────────────
const MILESTONES = [
  {
    threshold: 1500,
    emoji: '🚀',
    title: "You're in Hyper territory!",
    subtitle:
      "You've hit 1,500 BROski$. Book a 1-to-1 project review — you've earned it.",
    tone: 'gold' as TagColor,
  },
  {
    threshold: 500,
    emoji: '🔥',
    title: '500 BROski$ milestone!',
    subtitle:
      "Enough to book a 1-to-1 project review slot. Let's get you some feedback.",
    tone: 'pink' as TagColor,
  },
  {
    threshold: 200,
    emoji: '⚡',
    title: 'Power user unlocked!',
    subtitle: '200 BROski$ — you can unlock a full bonus deep-dive module right now.',
    tone: 'violet' as TagColor,
  },
  {
    threshold: 50,
    emoji: '🎯',
    title: 'First milestone!',
    subtitle: "You've got 50 BROski$ — enough for an AI Prompt Pack. Keep going!",
    tone: 'mint' as TagColor,
  },
] as const;

function MilestoneBanner({ balance }: { balance: number }) {
  const milestone = MILESTONES.find((m) => balance >= m.threshold);
  if (!milestone) return null;
  return (
    <HVZCard padding={20} glow={milestone.tone === 'gold' ? 'gold' : 'violet'}>
      <div className="flex items-center gap-4">
        <span className="text-4xl flex-shrink-0" aria-hidden>
          {milestone.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <HVZTag color={milestone.tone}>Milestone</HVZTag>
          <p
            className="font-display font-bold text-hfz-text-primary text-lg leading-snug mt-2"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            {milestone.title}
          </p>
          <p className="text-sm text-hfz-text-secondary mt-1 leading-relaxed">
            {milestone.subtitle}
          </p>
        </div>
      </div>
    </HVZCard>
  );
}

// ── Referral card ─────────────────────────────────────────────────────────────
function ReferralCard() {
  const { referralLink, copied, error, copyReferralLink } = useReferralLink();

  return (
    <HVZCard padding={24} glow="violet">
      <div className="flex items-start gap-4">
        <span className="text-3xl flex-shrink-0" aria-hidden>🤝</span>
        <div className="flex-1 min-w-0">
          <HVZTag color="violet">Refer a friend — earn 100 BROski$</HVZTag>
          <p className="text-sm text-hfz-text-secondary mt-2 mb-4">
            Share your link. When a friend signs up, you both win instantly.
          </p>
          {referralLink ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-hfz-midnight border border-hfz-border-violet rounded-hfz-sm px-3 py-2 text-hfz-cyan font-mono truncate">
                {referralLink}
              </code>
              <HVZButton
                variant="primary"
                size="sm"
                onClick={() => {
                  void copyReferralLink();
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </HVZButton>
            </div>
          ) : (
            <div className="h-8 rounded-hfz-sm bg-hfz-midnight animate-pulse w-full" />
          )}
          {error && (
            <span className="sr-only" role="status" aria-live="polite">
              {error}
            </span>
          )}
        </div>
      </div>
    </HVZCard>
  );
}

// ── Token packs ───────────────────────────────────────────────────────────────
const TOKEN_PACKS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    tokens: 200,
    price: '£5',
    emoji: '⚡',
    accent: 'cyan' as TagColor,
    variant: 'primary' as const,
  },
  {
    id: 'builder',
    name: 'Builder Pack',
    tokens: 800,
    price: '£15',
    emoji: '🔥',
    accent: 'violet' as TagColor,
    variant: 'primary' as const,
    badge: 'Most popular',
  },
  {
    id: 'hyper',
    name: 'Hyper Pack',
    tokens: 2500,
    price: '£35',
    emoji: '🚀',
    accent: 'gold' as TagColor,
    variant: 'gold' as const,
  },
] as const;

const EARN_WAYS = [
  { emoji: '📚', action: 'Complete a lesson', amount: '+10' },
  { emoji: '🏆', action: 'Finish a module', amount: '+50' },
  { emoji: '🔥', action: '7-day learning streak', amount: '+100' },
  { emoji: '🤝', action: 'Refer a friend who signs up', amount: '+100' },
  { emoji: '🎯', action: 'Submit a capstone project', amount: '+150' },
];

const SPEND_WAYS = [
  { emoji: '🤖', item: 'AI Prompt Pack (per module)', cost: '50' },
  { emoji: '📖', item: 'Bonus deep-dive module', cost: '200' },
  { emoji: '⏩', item: 'Early access to next course', cost: '300' },
  { emoji: '🎤', item: '1-to-1 project review slot', cost: '500' },
  { emoji: '🎨', item: 'Custom BROski avatar/badge', cost: '100' },
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
      window.location.assign(url);
    } catch {
      setPackError("Hmm, let's try that again 🔄 — checkout failed. Ping support if it sticks.");
      setBuyingPackId(null);
    }
  }

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {/* Balance hero */}
        <div className="text-center">
          <HVZTag color="gold">🪙 Your BROski$ balance</HVZTag>
          <p
            className="font-display font-extrabold tracking-hfz-tight mt-4"
            style={{
              fontSize: 'clamp(56px, 10vw, 96px)',
              lineHeight: 1,
              background: 'linear-gradient(135deg, var(--color-broski-gold), var(--color-gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🪙 {balance.toLocaleString()}
          </p>
          <p className="text-base text-hfz-text-secondary mt-3 max-w-[40ch] mx-auto">
            Earn by learning. Spend on power-ups. No expiry.
          </p>
        </div>

        <MilestoneBanner balance={balance} />

        {/* Referral card */}
        {user?.id && <ReferralCard />}

        {/* Buy packs */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-5"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Top up — token packs
          </h2>
          {packError && (
            <p role="alert" className="text-sm text-hfz-danger mb-4">
              {packError}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TOKEN_PACKS.map((pack) => {
              const isLoading = buyingPackId === pack.id;
              const anyLoading = buyingPackId !== null;
              const isHyper = pack.variant === 'gold';
              const hasBadge = 'badge' in pack && pack.badge;
              return (
                <HVZCard
                  key={pack.id}
                  padding={24}
                  glow={isHyper ? 'gold' : false}
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                >
                  {hasBadge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <HVZTag color="violet">{pack.badge}</HVZTag>
                    </div>
                  )}
                  <div className="text-3xl mb-3" aria-hidden>{pack.emoji}</div>
                  <p
                    className="font-display font-bold text-hfz-text-primary text-lg"
                    style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                  >
                    {pack.name}
                  </p>
                  <p
                    className="font-display font-extrabold text-hfz-text-primary mt-1 mb-1"
                    style={{ fontSize: 32, lineHeight: 1.1 }}
                  >
                    {pack.tokens.toLocaleString()}{' '}
                    <span className="text-base font-semibold text-hfz-gold-light">BROski$</span>
                  </p>
                  <div className="mt-auto pt-4">
                    <HVZButton
                      variant={pack.variant}
                      size="md"
                      fullWidth
                      disabled={anyLoading}
                      onClick={() => handleBuyPack(pack.id)}
                    >
                      {isLoading ? 'Wiring up checkout...' : `Buy for ${pack.price}`}
                    </HVZButton>
                  </div>
                </HVZCard>
              );
            })}
          </div>
        </section>

        {/* Earn + spend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <section>
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              How to earn
            </h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {EARN_WAYS.map((w) => (
                <li
                  key={w.action}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-hfz-md bg-hfz-mint/10 border border-hfz-mint/30"
                >
                  <span className="flex items-center gap-2 text-sm text-hfz-text-primary">
                    <span aria-hidden>{w.emoji}</span>
                    {w.action}
                  </span>
                  <span className="text-sm font-bold text-hfz-mint font-mono">
                    {w.amount}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2
              className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
              style={{ background: 'none', WebkitTextFillColor: 'unset' }}
            >
              What you can unlock
            </h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {SPEND_WAYS.map((w) => (
                <li
                  key={w.item}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-hfz-md bg-hfz-midnight border border-hfz-border-violet"
                >
                  <span className="flex items-center gap-2 text-sm text-hfz-text-primary">
                    <span aria-hidden>{w.emoji}</span>
                    {w.item}
                  </span>
                  <span className="text-sm font-bold text-hfz-gold-light font-mono">
                    🪙 {w.cost}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Transaction history */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Transaction history
          </h2>
          {loadingTx ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse"
                />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <HVZCard padding={32}>
              <div className="text-center">
                <p className="text-4xl mb-3" aria-hidden>🪙</p>
                <p className="font-display font-bold text-hfz-text-primary text-lg" style={{ background: 'none', WebkitTextFillColor: 'unset' }}>
                  No transactions yet
                </p>
                <p className="text-sm text-hfz-text-secondary mt-1">
                  Your BROski$ activity will show up here — go earn some! 🎯
                </p>
              </div>
            </HVZCard>
          ) : (
            <HVZCard padding={0} style={{ overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead className="border-b border-hfz-border-violet bg-hfz-violet/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary">
                      Activity
                    </th>
                    <th className="text-right px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary">
                      Amount
                    </th>
                    <th className="text-right px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hfz-border-violet">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-hfz-violet/5 transition-colors">
                      <td className="px-4 py-3 text-hfz-text-primary">{reasonLabel(tx.reason)}</td>
                      <td
                        className={`px-4 py-3 text-right font-bold tabular-nums font-mono ${
                          tx.amount > 0 ? 'text-hfz-mint' : 'text-hfz-danger'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-hfz-text-secondary hidden sm:table-cell font-mono text-xs">
                        {new Date(tx.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </HVZCard>
          )}
        </section>
      </div>
    </div>
  );
}
