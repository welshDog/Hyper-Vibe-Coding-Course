import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { LoyaltyTierBadge } from '../components/LoyaltyTierBadge';
import { ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import { HVZCard, HVZTag, type TagColor } from '../components/ui/hvz';

// ── Types ─────────────────────────────────────────────────────────────────────

type ShopItem = {
  id: string;
  name: string;
  description: string;
  price_tokens: number;
  price_gbp: number | null;
  category: string;
  is_available: boolean;
  created_at: string;
};

type ShopPurchase = {
  id: string;
  item_id: string;
  spent_tokens: number;
  purchased_at: string;
};

type LoyaltyTierRow = {
  tier: 'bronze' | 'silver' | 'gold' | 'hyper';
  lifetime_earned: number;
};

type PurchaseResult = {
  success: boolean;
  item_name: string;
  spent_tokens: number;
  new_balance: number;
  error?: string;
  agent_access_pending?: boolean;
};

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { heading: string; tone: TagColor }> = {
  agent_access:  { heading: '🤖 Agent Access',       tone: 'cyan' },
  prompt_pack:   { heading: '🧠 Prompt Packs',       tone: 'violet' },
  bonus_content: { heading: '🎬 Bonus Content',      tone: 'pink' },
  coaching:      { heading: '🎯 Coaching & Feedback', tone: 'amber' },
  cosmetic:      { heading: '✨ Cosmetic Upgrades',  tone: 'pink' },
};

const CATEGORY_ORDER = ['agent_access', 'prompt_pack', 'bonus_content', 'coaching', 'cosmetic'];

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight p-5 flex flex-col gap-3 animate-pulse">
      <div className="h-4 bg-hfz-violet/15 rounded w-1/3" />
      <div className="h-5 bg-hfz-violet/15 rounded w-2/3" />
      <div className="h-3 bg-hfz-violet/15 rounded w-full" />
      <div className="h-3 bg-hfz-violet/15 rounded w-4/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 bg-hfz-violet/15 rounded w-16" />
        <div className="h-9 bg-hfz-violet/15 rounded w-20" />
      </div>
    </div>
  );
}

// ── Inline notification banner ────────────────────────────────────────────────

type Notification = { type: 'success' | 'error'; text: string };

function NotificationBanner({ note, onDismiss }: { note: Notification; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [note, onDismiss]);

  const isSuccess = note.type === 'success';

  return (
    <div
      role="status"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-hfz-md text-sm font-medium"
      style={{
        background: isSuccess ? 'rgba(16,245,160,0.12)' : 'rgba(239,68,68,0.12)',
        border: `1px solid ${isSuccess ? 'rgba(16,245,160,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: isSuccess ? 'var(--color-success-mint)' : 'var(--color-danger-red)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isSuccess
          ? '0 0 20px rgba(16,245,160,0.25)'
          : '0 0 20px rgba(239,68,68,0.25)',
      }}
    >
      {isSuccess ? '✓' : '⚠️'} {note.text}
    </div>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ShopItem;
  owned: boolean;
  balance: number;
  purchasing: boolean;
  onBuy: (itemId: string) => void;
}

function ItemCard({ item, owned, balance, purchasing, onBuy }: ItemCardProps) {
  const catConfig = CATEGORY_CONFIG[item.category];
  const canAfford = balance >= item.price_tokens;
  const shortfall = item.price_tokens - balance;

  let buttonContent: React.ReactNode;
  let buttonStyle: React.CSSProperties;
  const baseBtnClass = 'px-4 py-2 rounded-hfz-sm text-sm font-semibold min-w-[80px] min-h-[40px] flex items-center justify-center gap-1.5 transition-all duration-hfz-fast ease-hfz-smooth';

  if (owned) {
    buttonContent = (
      <>
        <CheckCircle className="h-4 w-4" />
        Owned
      </>
    );
    buttonStyle = {
      background: 'rgba(16,245,160,0.12)',
      border: '1px solid rgba(16,245,160,0.4)',
      color: 'var(--color-success-mint)',
      cursor: 'default',
    };
  } else if (purchasing) {
    buttonContent = <Loader2 className="h-4 w-4 animate-spin" />;
    buttonStyle = {
      background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
      color: '#fff',
      border: 0,
      opacity: 0.7,
      cursor: 'wait',
    };
  } else if (!canAfford) {
    buttonContent = `Need ${shortfall.toLocaleString()} more 🪙`;
    buttonStyle = {
      background: 'rgba(139,156,200,0.08)',
      border: '1px solid rgba(139,156,200,0.15)',
      color: 'var(--color-text-disabled)',
      cursor: 'not-allowed',
    };
  } else {
    buttonContent = 'Buy →';
    buttonStyle = {
      background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
      color: '#fff',
      border: 0,
      cursor: 'pointer',
    };
  }

  return (
    <HVZCard padding={20} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {catConfig && (
        <div className="self-start mb-3">
          <HVZTag color={catConfig.tone}>
            {catConfig.heading.split(' ').slice(1).join(' ')}
          </HVZTag>
        </div>
      )}

      <div className="flex-1">
        <p
          className="font-display font-bold text-hfz-text-primary leading-snug text-base"
          style={{ background: 'none', WebkitTextFillColor: 'unset' }}
        >
          {item.name}
        </p>
        <p className="text-sm text-hfz-text-secondary mt-1.5 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-hfz-border-violet">
        <div>
          <span className="font-display font-extrabold text-hfz-gold-light text-lg">
            🪙 {item.price_tokens.toLocaleString()}
          </span>
          {item.price_gbp != null && (
            <span className="text-xs text-hfz-text-secondary ml-1.5">
              / £{Number(item.price_gbp).toFixed(2)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => !owned && canAfford && !purchasing && onBuy(item.id)}
          disabled={owned || !canAfford || purchasing}
          aria-label={owned ? `${item.name} owned` : `Buy ${item.name}`}
          title={!canAfford && !owned ? `Need ${shortfall.toLocaleString()} more BROski$` : undefined}
          className={baseBtnClass}
          style={buttonStyle}
        >
          {buttonContent}
        </button>
      </div>
    </HVZCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { user, setUser } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [tier, setTier] = useState<LoyaltyTierRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const balance = user?.broski_tokens ?? 0;

  const dismissNotification = useCallback(() => setNotification(null), []);

  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      const [itemsRes, purchasesRes, tierRes] = await Promise.all([
        supabase
          .from('shop_items')
          .select('*')
          .eq('is_available', true)
          .order('price_tokens', { ascending: true }),
        supabase
          .from('shop_purchases')
          .select('id, item_id, spent_tokens, purchased_at')
          .eq('user_id', user!.id)
          .order('purchased_at', { ascending: false }),
        supabase
          .from('user_loyalty_tier')
          .select('tier, lifetime_earned')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);

      if (!itemsRes.error) setItems(itemsRes.data ?? []);
      if (!purchasesRes.error) {
        setOwnedIds(new Set((purchasesRes.data ?? []).map((p: ShopPurchase) => p.item_id)));
      }
      if (!tierRes.error && tierRes.data) {
        setTier(tierRes.data as LoyaltyTierRow);
      }
      setLoading(false);
    }

    void fetchAll();
  }, [user]);

  async function handleBuy(itemId: string) {
    if (!user || purchasingId) return;
    setPurchasingId(itemId);

    try {
      const { data, error } = await supabase.functions.invoke<PurchaseResult>('shop-purchase', {
        body: { item_id: itemId },
      });

      if (error || !data?.success) {
        const text = data?.error ?? error?.message ?? "Hmm, let's try that again 🔄";
        setNotification({ type: 'error', text });
        return;
      }

      setOwnedIds((prev) => new Set([...prev, itemId]));
      setUser({ ...user, broski_tokens: data.new_balance });

      const itemName = items.find((i) => i.id === itemId)?.name ?? data.item_name;
      const notificationText = data.agent_access_pending
        ? `🤖 Agent access queued! Check Discord for your Mission Control link.`
        : `🎉 NICE ONE BROski♾️ — unlocked ${itemName} (-${data.spent_tokens.toLocaleString()} 🪙)`;

      setNotification({ type: 'success', text: notificationText });
    } catch (err) {
      console.error('shop-purchase invoke failed:', err);
      setNotification({ type: 'error', text: "Hmm, let's try that again 🔄 — purchase didn't go through." });
    } finally {
      setPurchasingId(null);
    }
  }

  const grouped = CATEGORY_ORDER.reduce<Record<string, ShopItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        {notification && (
          <NotificationBanner note={notification} onDismiss={dismissNotification} />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-hfz-md flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(123,47,190,0.25), rgba(0,212,255,0.18))',
                border: '1px solid rgba(168,85,247,0.3)',
              }}
            >
              <ShoppingBag className="h-7 w-7 text-hfz-cyan" aria-hidden />
            </div>
            <div>
              <HVZTag color="gold">🛒 BROski$ Shop</HVZTag>
              <h1
                className="font-display font-extrabold text-2xl text-hfz-text-primary mt-2"
                style={{ background: 'none', WebkitTextFillColor: 'unset' }}
              >
                Spend your tokens on real things
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {tier && <LoyaltyTierBadge tier={tier.tier} size="md" />}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-hfz-full font-bold font-mono"
              style={{
                background: 'rgba(245,158,11,0.12)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: 'var(--color-gold-light)',
                minHeight: 44,
              }}
            >
              <span aria-hidden>🪙</span>
              <span>{balance.toLocaleString()}</span>
              <span className="text-xs font-semibold opacity-70">BROski$</span>
            </div>
          </div>
        </div>

        {/* Items by category */}
        {loading ? (
          <div className="flex flex-col gap-10">
            {CATEGORY_ORDER.map((cat) => (
              <section key={cat}>
                <div className="h-7 w-40 bg-hfz-violet/15 rounded animate-pulse mb-5" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : items.length === 0 ? (
          <HVZCard padding={40}>
            <div className="text-center">
              <p className="text-5xl mb-4" aria-hidden>🛒</p>
              <p
                className="font-display font-bold text-hfz-text-primary text-lg"
                style={{ background: 'none', WebkitTextFillColor: 'unset' }}
              >
                Shop coming soon
              </p>
              <p className="text-sm text-hfz-text-secondary mt-2">
                Your power-ups will show up here — new drops regularly. 🎯
              </p>
            </div>
          </HVZCard>
        ) : (
          <div className="flex flex-col gap-10">
            {Object.entries(grouped).map(([cat, catItems]) => {
              const config = CATEGORY_CONFIG[cat];
              return (
                <section key={cat}>
                  <h2
                    className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-5"
                    style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                  >
                    {config?.heading ?? cat}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {catItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        owned={ownedIds.has(item.id)}
                        balance={balance}
                        purchasing={purchasingId === item.id}
                        onBuy={handleBuy}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Earn-more tip */}
        {!loading && (
          <HVZCard padding={20}>
            <div className="flex items-center gap-4">
              <span className="text-3xl flex-shrink-0" aria-hidden>💡</span>
              <div>
                <p
                  className="font-display font-bold text-hfz-text-primary text-base"
                  style={{ background: 'none', WebkitTextFillColor: 'unset' }}
                >
                  Earn more BROski$
                </p>
                <p className="text-sm text-hfz-text-secondary mt-1 leading-relaxed">
                  Complete lessons (+10), finish modules (+50), hit a 7-day streak (+100), or grab a token pack from the{' '}
                  <a
                    href="/tokens"
                    className="text-hfz-cyan hover:text-hfz-violet-light transition-colors font-semibold"
                  >
                    Tokens page
                  </a>
                  .
                </p>
              </div>
            </div>
          </HVZCard>
        )}
      </div>
    </div>
  );
}
