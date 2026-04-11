import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { LoyaltyTierBadge } from '../components/LoyaltyTierBadge';
import { ShoppingBag, Loader2, CheckCircle } from 'lucide-react';

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
};

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { heading: string; badgeClasses: string }> = {
  prompt_pack:   { heading: '🧠 Prompt Packs',       badgeClasses: 'bg-blue-100 text-blue-700'    },
  bonus_content: { heading: '🎬 Bonus Content',       badgeClasses: 'bg-purple-100 text-purple-700' },
  coaching:      { heading: '🎯 Coaching & Feedback', badgeClasses: 'bg-orange-100 text-orange-700' },
  cosmetic:      { heading: '✨ Cosmetic Upgrades',   badgeClasses: 'bg-pink-100 text-pink-700'    },
};

// Deterministic display order
const CATEGORY_ORDER = ['prompt_pack', 'bonus_content', 'coaching', 'cosmetic'];

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="h-5 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 bg-gray-100 rounded w-16" />
        <div className="h-9 bg-gray-100 rounded w-20" />
      </div>
    </div>
  );
}

// ── Inline notification banner (no toast library needed) ──────────────────────

type Notification = { type: 'success' | 'error'; text: string };

function NotificationBanner({ note, onDismiss }: { note: Notification; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [note, onDismiss]);

  return (
    <div
      role="status"
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
        note.type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      {note.type === 'success' ? '✓' : '✗'} {note.text}
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
  let buttonClasses: string;

  if (owned) {
    buttonContent = (
      <span className="flex items-center gap-1.5">
        <CheckCircle className="h-4 w-4" />
        Owned
      </span>
    );
    buttonClasses = 'bg-green-50 text-green-700 border border-green-200 cursor-default';
  } else if (purchasing) {
    buttonContent = <Loader2 className="h-4 w-4 animate-spin mx-auto" />;
    buttonClasses = 'bg-primary/70 text-white cursor-wait';
  } else if (!canAfford) {
    buttonContent = `Need ${shortfall.toLocaleString()} more`;
    buttonClasses = 'bg-gray-100 text-gray-400 cursor-not-allowed';
  } else {
    buttonContent = 'Buy';
    buttonClasses = 'bg-primary text-white hover:bg-primary/90 transition-colors';
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Category badge */}
      {catConfig && (
        <span className={`self-start text-xs font-semibold px-2 py-0.5 rounded-full ${catConfig.badgeClasses}`}>
          {catConfig.heading.split(' ').slice(1).join(' ')}
        </span>
      )}

      {/* Name + description */}
      <div className="flex-1">
        <p className="font-bold text-gray-900 leading-snug">{item.name}</p>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.description}</p>
      </div>

      {/* Price + buy button */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-lg font-black text-gray-900">
            {item.price_tokens.toLocaleString()} 🪙
          </span>
          {item.price_gbp != null && (
            <span className="text-xs text-gray-400 ml-1">
              / £{Number(item.price_gbp).toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={() => !owned && canAfford && !purchasing && onBuy(item.id)}
          disabled={owned || !canAfford || purchasing}
          title={!canAfford && !owned ? `Need ${shortfall.toLocaleString()} more BROski$` : undefined}
          className={`px-4 py-2 rounded-lg text-sm font-semibold min-w-[72px] text-center ${buttonClasses}`}
        >
          {buttonContent}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { user, setUser } = useAuthStore();
  const [items, setItems]         = useState<ShopItem[]>([]);
  const [ownedIds, setOwnedIds]   = useState<Set<string>>(new Set());
  const [tier, setTier]           = useState<LoyaltyTierRow | null>(null);
  const [loading, setLoading]     = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  const balance = user?.broski_tokens ?? 0;

  const dismissNotification = useCallback(() => setNotification(null), []);

  // ── Fetch items, purchases, tier in parallel ─────────────────────────────
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

      if (!itemsRes.error)    setItems(itemsRes.data ?? []);
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

  // ── Purchase handler ──────────────────────────────────────────────────────
  async function handleBuy(itemId: string) {
    if (!user || purchasingId) return;
    setPurchasingId(itemId);

    try {
      const { data, error } = await supabase.functions.invoke<PurchaseResult>('shop-purchase', {
        body: { item_id: itemId },
      });

      if (error || !data?.success) {
        const text = data?.error ?? error?.message ?? 'Purchase failed — try again.';
        setNotification({ type: 'error', text });
        return;
      }

      // Optimistically update owned set + balance in Zustand
      setOwnedIds((prev) => new Set([...prev, itemId]));
      setUser({ ...user, broski_tokens: data.new_balance });

      const itemName = items.find((i) => i.id === itemId)?.name ?? data.item_name;
      setNotification({
        type: 'success',
        text: `🪙 Unlocked ${itemName}! -${data.spent_tokens.toLocaleString()} BROski$`,
      });
    } catch (err) {
      console.error('shop-purchase invoke failed:', err);
      setNotification({ type: 'error', text: 'Something went wrong — try again.' });
    } finally {
      setPurchasingId(null);
    }
  }

  // ── Group items by category in display order ──────────────────────────────
  const grouped = CATEGORY_ORDER.reduce<Record<string, ShopItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

      {notification && (
        <NotificationBanner note={notification} onDismiss={dismissNotification} />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-gray-900">BROski$ Shop</h1>
            <p className="text-sm text-gray-500">Spend your tokens on real things</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {tier && <LoyaltyTierBadge tier={tier.tier} size="md" />}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200 font-bold text-yellow-700">
            <span>🪙</span>
            <span>{balance.toLocaleString()} BROski$</span>
          </div>
        </div>
      </div>

      {/* ── Items by category ───────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-10">
          {CATEGORY_ORDER.map((cat) => (
            <section key={cat}>
              <div className="h-7 w-40 bg-gray-100 rounded animate-pulse mb-5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </section>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🛒</p>
          <p className="font-semibold text-gray-700">Shop coming soon</p>
          <p className="text-sm text-gray-500 mt-1">New items drop regularly — check back soon!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, catItems]) => {
            const config = CATEGORY_CONFIG[cat];
            return (
              <section key={cat}>
                <h2 className="text-xl font-bold text-gray-900 mb-5">
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

      {/* ── Balance tip ─────────────────────────────────────────────────── */}
      {!loading && (
        <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-5 flex items-center gap-4">
          <span className="text-3xl flex-shrink-0">💡</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Earn more BROski$</p>
            <p className="text-xs text-gray-600 mt-0.5">
              Complete lessons (+10), finish modules (+50), hit a 7-day streak (+100),
              or grab a token pack from the{' '}
              <a href="/tokens" className="font-medium text-primary hover:underline">Tokens page</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
