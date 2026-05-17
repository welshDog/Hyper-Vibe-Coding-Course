import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { LoyaltyTierBadge } from '../components/LoyaltyTierBadge';
import { ShoppingBag, Loader2, CheckCircle, ExternalLink, Gift, Sparkles } from 'lucide-react';
import { HVZCard, HVZTag, type TagColor } from '../components/ui/hvz';

// ── Types ─────────────────────────────────────────────────────────────────────

type ShopItemMetadata = {
  type?: string;        // 'agent_access' triggers V2.4 provisioning
  v24_tier?: string;    // 'sandbox' | 'level4'
  content_url?: string; // direct download / access URL for content items
  cosmetic?: string;    // cosmetic id this purchase equips (e.g. 'gold_frame')
};

type ShopItem = {
  id: string;
  name: string;
  description: string;
  price_tokens: number;
  price_gbp: number | null;
  category: string;
  is_available: boolean;
  created_at: string;
  metadata: ShopItemMetadata | null;
};

type FulfillmentMetadata = {
  provision_status?: 'pending' | 'provisioned' | 'failed';
  mission_control_url?: string | null;
  api_key_hint?: string | null;
  expires_at?: string | null;
};

type ShopPurchase = {
  id: string;
  item_id: string;
  spent_tokens: number;
  purchased_at: string;
  fulfillment_metadata: FulfillmentMetadata | null;
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

// Categories whose deliverable is a direct content URL.
const CONTENT_CATEGORIES = new Set(['prompt_pack', 'bonus_content']);

// ── Loyalty tier discounts ────────────────────────────────────────────────────
// UI preview only — the shop-purchase Edge Function is the source of truth and
// re-derives the charge from the user's tier server-side.
// ⚠️ KEEP IN SYNC with TIER_DISCOUNT_PCT in
//    supabase/functions/shop-purchase/index.ts
const TIER_DISCOUNT_PCT: Record<string, number> = {
  bronze: 0,
  silver: 5,
  gold:   10,
  hyper:  15,
};

// Floor → matches the server; rounding always favours the buyer.
function discountedPrice(base: number, tier: string | null | undefined): number {
  const pct = TIER_DISCOUNT_PCT[tier ?? 'bronze'] ?? 0;
  return Math.floor(base * (1 - pct / 100));
}

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

// ── Buy confirmation modal ────────────────────────────────────────────────────

function ConfirmModal({
  item,
  balance,
  tier,
  discountPct,
  purchasing,
  onConfirm,
  onCancel,
}: {
  item: ShopItem;
  balance: number;
  tier: string;
  discountPct: number;
  purchasing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !purchasing) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, purchasing]);

  const effectivePrice = discountedPrice(item.price_tokens, tier);
  const hasDiscount = discountPct > 0 && effectivePrice < item.price_tokens;
  const saved = item.price_tokens - effectivePrice;
  const after = balance - effectivePrice;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,7,15,0.7)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={() => !purchasing && onCancel()}
      role="dialog"
      aria-modal="true"
      aria-label={`Confirm purchase of ${item.name}`}
    >
      <div
        className="w-full max-w-sm rounded-hfz-md p-6 flex flex-col gap-4"
        style={{
          background: 'var(--color-midnight, #0F1B35)',
          border: '1px solid rgba(168,85,247,0.35)',
          boxShadow: '0 0 40px rgba(168,85,247,0.25)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <HVZTag color="gold">🪙 Confirm spend</HVZTag>
          <h2
            className="font-display font-bold text-lg text-hfz-text-primary mt-3"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Buy “{item.name}”?
          </h2>
        </div>

        <div
          className="rounded-hfz-sm p-3.5 flex flex-col gap-2 text-sm"
          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-hfz-text-secondary">{hasDiscount ? 'List price' : 'Cost'}</span>
            <span
              className={`font-mono ${hasDiscount ? 'text-hfz-text-disabled line-through' : 'font-bold text-hfz-gold-light'}`}
            >
              🪙 {item.price_tokens.toLocaleString()}
            </span>
          </div>
          {hasDiscount && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-hfz-mint">{tier} tier −{discountPct}%</span>
                <span className="font-mono text-hfz-mint">−{saved.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-hfz-border-violet pt-2">
                <span className="text-hfz-text-secondary">You pay</span>
                <span className="font-bold text-hfz-gold-light font-mono">
                  🪙 {effectivePrice.toLocaleString()}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-hfz-text-secondary">Balance after</span>
            <span className="font-bold text-hfz-text-primary font-mono tabular-nums">
              {after.toLocaleString()} BROski$
            </span>
          </div>
        </div>

        <p className="text-xs text-hfz-text-secondary leading-relaxed">
          BROski$ are spent instantly. If anything goes wrong on our side, you're auto-refunded. 🛡️
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={purchasing}
            className="flex-1 px-4 py-2.5 rounded-hfz-sm text-sm font-semibold min-h-[44px] transition-all duration-hfz-fast"
            style={{
              background: 'transparent',
              border: '1px solid rgba(139,156,200,0.3)',
              color: 'var(--color-text-secondary, #8B9CC8)',
              cursor: purchasing ? 'not-allowed' : 'pointer',
              opacity: purchasing ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={purchasing}
            className="flex-1 px-4 py-2.5 rounded-hfz-sm text-sm font-semibold min-h-[44px] flex items-center justify-center gap-1.5 transition-all duration-hfz-fast"
            style={{
              background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
              color: '#fff',
              border: 0,
              cursor: purchasing ? 'wait' : 'pointer',
              opacity: purchasing ? 0.7 : 1,
            }}
          >
            {purchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>Spend 🪙 {effectivePrice.toLocaleString()}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Fulfillment block (what "Owned" actually delivers) ─────────────────────────

const DELIVERY_LINK_CLASS =
  'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-hfz-sm text-sm font-semibold min-h-[40px] no-underline transition-all duration-hfz-fast ease-hfz-smooth';

function FulfillmentBlock({
  item,
  purchase,
}: {
  item: ShopItem;
  purchase: ShopPurchase | undefined;
}) {
  // ── Agent access — driven by async V2.4 provisioning state ──────────────────
  if (item.metadata?.type === 'agent_access') {
    const fm = purchase?.fulfillment_metadata;
    const status = fm?.provision_status;

    if (status === 'provisioned' && fm?.mission_control_url) {
      const expires = fm.expires_at
        ? new Date(fm.expires_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })
        : null;
      return (
        <div className="flex flex-col gap-2">
          <a
            href={fm.mission_control_url}
            target="_blank"
            rel="noopener noreferrer"
            className={DELIVERY_LINK_CLASS}
            style={{
              background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
              color: '#fff',
            }}
          >
            🚀 Open Mission Control
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="text-xs text-hfz-text-secondary font-mono">
            {fm.api_key_hint ? <>🔑 {fm.api_key_hint}</> : '🔑 key sent to Discord'}
            {expires && <> · expires {expires}</>}
          </p>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <p
          className="text-sm font-medium rounded-hfz-sm px-3 py-2.5 leading-relaxed"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--color-danger-red)',
          }}
        >
          ⚠️ Sandbox provisioning hit a snag — we're on it. Ping support on Discord if it doesn't clear soon.
        </p>
      );
    }

    // pending / queued / not-yet-written
    return (
      <p
        className="text-sm font-medium rounded-hfz-sm px-3 py-2.5 leading-relaxed flex items-center gap-2"
        style={{
          background: 'rgba(0,212,255,0.08)',
          border: '1px solid rgba(0,212,255,0.25)',
          color: 'var(--color-neon-cyan)',
        }}
      >
        <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
        Spinning up your sandbox — we'll DM your Mission Control link on Discord. 🤖
      </p>
    );
  }

  // ── Content items — direct URL, or graceful "dropping soon" ─────────────────
  if (CONTENT_CATEGORIES.has(item.category)) {
    const url = item.metadata?.content_url;
    if (url) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={DELIVERY_LINK_CLASS}
          style={{
            background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
            color: '#fff',
            alignSelf: 'flex-start',
          }}
        >
          Open it
          <ExternalLink className="h-4 w-4" />
        </a>
      );
    }
    return (
      <p
        className="text-sm font-medium rounded-hfz-sm px-3 py-2.5 leading-relaxed flex items-center gap-2"
        style={{
          background: 'rgba(217,70,239,0.08)',
          border: '1px solid rgba(217,70,239,0.25)',
          color: 'var(--color-reward-pink)',
        }}
      >
        <Gift className="h-4 w-4 flex-shrink-0" />
        Delivery dropping soon — we'll DM you on Discord. 🎁
      </p>
    );
  }

  // ── Cosmetic — equipped on the profile ──────────────────────────────────────
  if (item.category === 'cosmetic') {
    return (
      <a
        href="/profile"
        className={DELIVERY_LINK_CLASS}
        style={{
          background: 'rgba(16,245,160,0.12)',
          border: '1px solid rgba(16,245,160,0.4)',
          color: 'var(--color-success-mint)',
          alignSelf: 'flex-start',
        }}
      >
        <Sparkles className="h-4 w-4" />
        Equipped — see your Profile
      </a>
    );
  }

  // ── Everything else (e.g. coaching) — owned, fulfilled offline ──────────────
  return (
    <p
      className="text-sm font-medium rounded-hfz-sm px-3 py-2.5 leading-relaxed flex items-center gap-2"
      style={{
        background: 'rgba(16,245,160,0.1)',
        border: '1px solid rgba(16,245,160,0.3)',
        color: 'var(--color-success-mint)',
      }}
    >
      <CheckCircle className="h-4 w-4 flex-shrink-0" />
      Unlocked — we'll reach out on Discord to book you in. 🎯
    </p>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: ShopItem;
  owned: boolean;
  purchase: ShopPurchase | undefined;
  balance: number;
  tier: string;
  discountPct: number;
  purchasing: boolean;
  onBuy: (itemId: string) => void;
}

function ItemCard({ item, owned, purchase, balance, tier, discountPct, purchasing, onBuy }: ItemCardProps) {
  const catConfig = CATEGORY_CONFIG[item.category];
  const effectivePrice = discountedPrice(item.price_tokens, tier);
  const hasDiscount = discountPct > 0 && effectivePrice < item.price_tokens;
  const canAfford = balance >= effectivePrice;
  const shortfall = effectivePrice - balance;

  let buttonContent: React.ReactNode;
  let buttonStyle: React.CSSProperties;
  const baseBtnClass = 'px-4 py-2 rounded-hfz-sm text-sm font-semibold min-w-[80px] min-h-[40px] flex items-center justify-center gap-1.5 transition-all duration-hfz-fast ease-hfz-smooth';

  if (purchasing) {
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
      <div className="flex items-center gap-2 flex-wrap self-start mb-3">
        {catConfig && (
          <HVZTag color={catConfig.tone}>
            {catConfig.heading.split(' ').slice(1).join(' ')}
          </HVZTag>
        )}
        {owned && (
          <HVZTag color="mint">
            <CheckCircle className="h-3 w-3" /> Owned
          </HVZTag>
        )}
      </div>

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

      <div className="pt-4 mt-3 border-t border-hfz-border-violet">
        {owned ? (
          <FulfillmentBlock item={item} purchase={purchase} />
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {hasDiscount && (
                  <span className="text-sm text-hfz-text-disabled line-through font-mono">
                    {item.price_tokens.toLocaleString()}
                  </span>
                )}
                <span className="font-display font-extrabold text-hfz-gold-light text-lg">
                  🪙 {effectivePrice.toLocaleString()}
                </span>
                {item.price_gbp != null && (
                  <span className="text-xs text-hfz-text-secondary">
                    / £{Number(item.price_gbp).toFixed(2)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-xs font-semibold text-hfz-mint mt-0.5">
                  {tier} −{discountPct}% applied
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => canAfford && !purchasing && onBuy(item.id)}
              disabled={!canAfford || purchasing}
              aria-label={`Buy ${item.name}`}
              title={!canAfford ? `Need ${shortfall.toLocaleString()} more BROski$` : undefined}
              className={baseBtnClass}
              style={buttonStyle}
            >
              {buttonContent}
            </button>
          </div>
        )}
      </div>
    </HVZCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const { user, setUser } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [purchases, setPurchases] = useState<ShopPurchase[]>([]);
  const [tier, setTier] = useState<LoyaltyTierRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const pollAttempts = useRef(0);

  const balance = user?.broski_tokens ?? 0;
  const tierName = tier?.tier ?? 'bronze';
  const discountPct = TIER_DISCOUNT_PCT[tierName] ?? 0;

  const dismissNotification = useCallback(() => setNotification(null), []);

  const purchaseByItem = useMemo(() => {
    const m = new Map<string, ShopPurchase>();
    for (const p of purchases) m.set(p.item_id, p);
    return m;
  }, [purchases]);

  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('shop_purchases')
      .select('id, item_id, spent_tokens, purchased_at, fulfillment_metadata')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false });
    if (!error) setPurchases((data ?? []) as ShopPurchase[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      const [itemsRes, tierRes] = await Promise.all([
        supabase
          .from('shop_items')
          .select('*')
          .eq('is_available', true)
          .order('price_tokens', { ascending: true }),
        supabase
          .from('user_loyalty_tier')
          .select('tier, lifetime_earned')
          .eq('user_id', user!.id)
          .maybeSingle(),
      ]);

      if (!itemsRes.error) setItems((itemsRes.data ?? []) as ShopItem[]);
      if (!tierRes.error && tierRes.data) setTier(tierRes.data as LoyaltyTierRow);
      await fetchPurchases();
      setLoading(false);
    }

    void fetchAll();
  }, [user, fetchPurchases]);

  // Poll while an owned agent_access purchase is still provisioning, so the
  // Mission Control link appears without a manual reload. Capped so a purchase
  // that stays pending (e.g. no Discord linked) doesn't poll forever.
  const hasPendingAgent = useMemo(() => {
    return items.some((it) => {
      if (it.metadata?.type !== 'agent_access') return false;
      const p = purchaseByItem.get(it.id);
      if (!p) return false;
      const s = p.fulfillment_metadata?.provision_status;
      return s !== 'provisioned' && s !== 'failed';
    });
  }, [items, purchaseByItem]);

  useEffect(() => {
    if (!hasPendingAgent) {
      pollAttempts.current = 0;
      return;
    }
    if (pollAttempts.current >= 10) return;
    const id = setInterval(() => {
      pollAttempts.current += 1;
      if (pollAttempts.current > 10) {
        clearInterval(id);
        return;
      }
      void fetchPurchases();
    }, 6000);
    return () => clearInterval(id);
  }, [hasPendingAgent, fetchPurchases]);

  const requestBuy = useCallback(
    (itemId: string) => {
      const it = items.find((i) => i.id === itemId);
      if (it) setConfirmItem(it);
    },
    [items],
  );

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

      // Optimistically mark owned; fetchPurchases() pulls real fulfillment state
      // (incl. Mission Control link) — and the poll picks up async provisioning.
      setPurchases((prev) => [
        {
          id: `optimistic-${itemId}`,
          item_id: itemId,
          spent_tokens: data.spent_tokens,
          purchased_at: new Date().toISOString(),
          fulfillment_metadata: data.agent_access_pending
            ? { provision_status: 'pending' }
            : null,
        },
        ...prev.filter((p) => p.item_id !== itemId),
      ]);
      setUser({ ...user, broski_tokens: data.new_balance });
      pollAttempts.current = 0;
      void fetchPurchases();

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
      setConfirmItem(null);
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

        {confirmItem && (
          <ConfirmModal
            item={confirmItem}
            balance={balance}
            tier={tierName}
            discountPct={discountPct}
            purchasing={purchasingId === confirmItem.id}
            onConfirm={() => void handleBuy(confirmItem.id)}
            onCancel={() => setConfirmItem(null)}
          />
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
            {discountPct > 0 ? (
              <HVZTag color="mint">−{discountPct}% every buy</HVZTag>
            ) : (
              <HVZTag color="violet">Reach Silver → 5% off 🔓</HVZTag>
            )}
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
                        owned={purchaseByItem.has(item.id)}
                        purchase={purchaseByItem.get(item.id)}
                        balance={balance}
                        tier={tierName}
                        discountPct={discountPct}
                        purchasing={purchasingId === item.id}
                        onBuy={requestBuy}
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
