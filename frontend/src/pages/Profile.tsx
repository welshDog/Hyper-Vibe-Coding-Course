import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { Input } from '../components/ui/Input';
import { LoyaltyTierBadge } from '../components/LoyaltyTierBadge';
import type { Enrollment, Course } from '../types/database';
import { PlayCircle, CheckCircle, Award, ShoppingBag } from 'lucide-react';
import {
  HVZButton,
  HVZCard,
  HVZTag,
  HVZProgress,
} from '../components/ui/hvz';
import DiscordLinkSection from '../components/DiscordLinkSection';

// ── Types ─────────────────────────────────────────────────────────────────────

type EnrolledCourse = Enrollment & { courses: Course };

type Achievement = {
  id: string;
  slug: string;
  label: string;
  earned_at: string;
};

type LoyaltyTierRow = {
  tier: 'bronze' | 'silver' | 'gold' | 'hyper';
  lifetime_earned: number;
};

type FulfillmentMetadata = {
  provision_status?: 'pending' | 'provisioned' | 'failed';
  mission_control_url?: string | null;
};

type ShopPurchaseWithItem = {
  id: string;
  item_id: string;
  spent_tokens: number;
  purchased_at: string;
  fulfillment_metadata: FulfillmentMetadata | null;
  shop_items: Array<{
    name: string;
    category: string;
    metadata: { type?: string; content_url?: string; cosmetic?: string } | null;
  }> | null;
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({
  name,
  url,
  size = 'lg',
  frame = null,
}: {
  name: string;
  url?: string | null;
  size?: 'sm' | 'lg';
  frame?: 'gold' | null;
}) {
  const dim = size === 'lg' ? 'h-24 w-24 text-3xl' : 'h-10 w-10 text-sm';
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  const frameStyle: React.CSSProperties =
    frame === 'gold'
      ? {
          border: '2px solid var(--color-gold-light)',
          boxShadow:
            '0 0 0 4px rgba(245,158,11,0.2), 0 0 24px rgba(245,158,11,0.45)',
        }
      : {
          border: '2px solid var(--color-violet-lt)',
          boxShadow:
            '0 0 0 4px rgba(168,85,247,0.15), 0 0 20px rgba(168,85,247,0.3)',
        };

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${dim} rounded-full object-cover`}
        style={frameStyle}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center font-display font-extrabold text-white`}
      style={{
        background: 'linear-gradient(135deg, var(--color-hyper-violet), var(--color-neon-cyan))',
        ...frameStyle,
      }}
    >
      {initial}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loyaltyTier, setLoyaltyTier] = useState<LoyaltyTierRow | null>(null);
  const [shopPurchases, setShopPurchases] = useState<ShopPurchaseWithItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const nextFullName = user?.full_name ?? '';
    const nextAvatarUrl = user?.avatar_url ?? '';
    queueMicrotask(() => {
      setFullName(nextFullName);
      setAvatarUrl(nextAvatarUrl);
    });
  }, [user?.id, user?.full_name, user?.avatar_url]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const [enrollRes, achRes, tierRes, purchasesRes] = await Promise.all([
        supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('user_id', user!.id)
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('achievements')
          .select('id, slug, label, earned_at')
          .eq('user_id', user!.id)
          .order('earned_at', { ascending: false }),
        supabase
          .from('user_loyalty_tier')
          .select('tier, lifetime_earned')
          .eq('user_id', user!.id)
          .maybeSingle(),
        supabase
          .from('shop_purchases')
          .select('id, item_id, spent_tokens, purchased_at, fulfillment_metadata, shop_items(name, category, metadata)')
          .eq('user_id', user!.id)
          .order('purchased_at', { ascending: false }),
      ]);
      if (!enrollRes.error) setEnrollments((enrollRes.data ?? []) as EnrolledCourse[]);
      if (!achRes.error) setAchievements(achRes.data ?? []);
      if (!tierRes.error && tierRes.data) setLoyaltyTier(tierRes.data as LoyaltyTierRow);
      if (!purchasesRes.error) setShopPurchases((purchasesRes.data ?? []) as ShopPurchaseWithItem[]);
      setLoadingData(false);
    }
    void fetchData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    const updates = {
      full_name: fullName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setSaveMsg({ ok: false, text: "Hmm, let's try that again 🔄" });
    } else {
      setUser({ ...user, ...data });
      setSaveMsg({ ok: true, text: 'Profile updated! 🎉' });
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setSaving(false);
  };

  if (!user) return null;

  const displayName = user.full_name ?? user.email ?? 'You';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const ownsGoldFrame = shopPurchases.some(
    (p) => p.shop_items?.[0]?.metadata?.cosmetic === 'gold_frame',
  );

  function renderDelivery(p: ShopPurchaseWithItem) {
    const si = p.shop_items?.[0];
    const cat = si?.category;
    const meta = si?.metadata;
    const fm = p.fulfillment_metadata;

    if (meta?.type === 'agent_access') {
      if (fm?.provision_status === 'provisioned' && fm.mission_control_url) {
        return (
          <a
            href={fm.mission_control_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-hfz-cyan hover:text-hfz-violet-light transition-colors font-semibold no-underline"
          >
            Mission Control ↗
          </a>
        );
      }
      if (fm?.provision_status === 'failed') {
        return <span className="text-hfz-danger">Failed — ping support</span>;
      }
      return <span className="text-hfz-cyan">Provisioning…</span>;
    }

    if (cat === 'prompt_pack' || cat === 'bonus_content') {
      return meta?.content_url ? (
        <a
          href={meta.content_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-hfz-cyan hover:text-hfz-violet-light transition-colors font-semibold no-underline"
        >
          Open ↗
        </a>
      ) : (
        <span className="text-hfz-pink">Dropping soon 🎁</span>
      );
    }

    if (cat === 'cosmetic') {
      return <span className="text-hfz-mint">Equipped ✨</span>;
    }

    return <span className="text-hfz-text-secondary">We'll DM you</span>;
  }

  return (
    <div className="bg-hfz-space-black min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Hero */}
        <div className="flex items-center gap-6 flex-wrap">
          <Avatar
            name={displayName}
            url={user.avatar_url}
            size="lg"
            frame={ownsGoldFrame ? 'gold' : null}
          />
          <div className="flex-1 min-w-0">
            <HVZTag color="violet">👤 Your Z0ne</HVZTag>
            <h1
              className="font-display font-extrabold text-2xl sm:text-3xl text-hfz-text-primary mt-2 truncate"
              style={{
                background: 'none',
                WebkitTextFillColor: 'unset',
                letterSpacing: '-0.01em',
              }}
            >
              {displayName}
            </h1>
            <p className="text-sm text-hfz-text-secondary mt-1 truncate">{user.email}</p>
            <p className="text-xs text-hfz-text-disabled mt-1 font-mono uppercase tracking-hfz-label">
              Member since {memberSince}
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <HVZCard padding={0} style={{ overflow: 'hidden' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <Link
              to="/tokens"
              className="flex flex-col items-center justify-center py-5 px-3 no-underline border-r border-hfz-border-violet hover:bg-hfz-gold/5 transition-colors"
            >
              <span className="font-display font-extrabold text-2xl text-hfz-gold-light">
                🪙 {(user.broski_tokens ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-hfz-text-secondary mt-1 font-mono uppercase tracking-hfz-label">
                BROski$
              </span>
            </Link>
            <div className="flex flex-col items-center justify-center py-5 px-3 sm:border-r border-hfz-border-violet">
              <span className="font-display font-extrabold text-2xl text-hfz-violet-light">
                {enrollments.length}
              </span>
              <span className="text-xs text-hfz-text-secondary mt-1 font-mono uppercase tracking-hfz-label">
                {enrollments.length === 1 ? 'Course' : 'Courses'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 px-3 border-t sm:border-t-0 border-r border-hfz-border-violet">
              <span className="font-display font-extrabold text-2xl text-hfz-cyan">
                {achievements.length}
              </span>
              <span className="text-xs text-hfz-text-secondary mt-1 font-mono uppercase tracking-hfz-label">
                {achievements.length === 1 ? 'Badge' : 'Badges'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-5 px-3 gap-1.5 border-t sm:border-t-0 border-hfz-border-violet">
              {loyaltyTier ? (
                <LoyaltyTierBadge tier={loyaltyTier.tier} size="sm" />
              ) : (
                <span className="text-sm font-bold text-hfz-text-disabled">—</span>
              )}
              <span className="text-xs text-hfz-text-secondary font-mono uppercase tracking-hfz-label">
                Tier
              </span>
            </div>
          </div>
        </HVZCard>

        {/* Edit form */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Edit profile
          </h2>
          <HVZCard padding={24}>
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-semibold text-hfz-text-primary mb-2"
                >
                  Display name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="What should we call you?"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label
                  htmlFor="avatarUrl"
                  className="block text-sm font-semibold text-hfz-text-primary mb-2"
                >
                  Avatar URL{' '}
                  <span className="text-hfz-text-secondary font-normal text-xs">(optional)</span>
                </label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
                <p className="text-xs text-hfz-text-secondary mt-2">
                  Paste a direct image URL. Leave blank to use your initial.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <HVZButton type="submit" variant="primary" size="md" disabled={saving}>
                  {saving ? 'Wiring up...' : 'Save changes'}
                </HVZButton>
                {saveMsg && (
                  <p
                    role="status"
                    className={`text-sm font-medium m-0 ${
                      saveMsg.ok ? 'text-hfz-mint' : 'text-hfz-danger'
                    }`}
                  >
                    {saveMsg.text}
                  </p>
                )}
              </div>
            </form>
          </HVZCard>
        </section>

        {/* Connected accounts */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Connected accounts
          </h2>
          <DiscordLinkSection />
        </section>

        {/* My courses */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            My courses
          </h2>
          {loadingData ? (
            <div className="flex flex-col gap-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse"
                />
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <HVZCard padding={32}>
              <div className="text-center">
                <p className="text-base text-hfz-text-secondary mb-3">
                  Your courses will show up here — go pick one! 🎯
                </p>
                <Link to="/courses" className="no-underline">
                  <HVZButton variant="ghost" size="sm">
                    Browse the catalog →
                  </HVZButton>
                </Link>
              </div>
            </HVZCard>
          ) : (
            <ul className="list-none p-0 m-0 flex flex-col gap-3">
              {enrollments.map((enr) => {
                const isComplete = enr.progress_percentage >= 100;
                return (
                  <li key={enr.id}>
                    <HVZCard padding={16} glow={isComplete ? 'mint' : false}>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-hfz-mint flex-shrink-0" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-hfz-cyan flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-hfz-text-primary truncate m-0">
                              {enr.courses.title}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="w-24 sm:w-32">
                                <HVZProgress
                                  value={enr.progress_percentage}
                                  max={100}
                                  gradient={isComplete ? 'mint' : 'xp'}
                                  height={6}
                                />
                              </div>
                              <span className="text-xs text-hfz-text-secondary font-mono">
                                {Math.round(enr.progress_percentage)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/catalog/${enr.course_id}`} className="no-underline">
                          <HVZButton variant={isComplete ? 'ghost' : 'primary'} size="sm">
                            {isComplete ? 'Review' : 'Continue →'}
                          </HVZButton>
                        </Link>
                      </div>
                    </HVZCard>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Badges */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            Badges earned
          </h2>
          {loadingData ? (
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 w-20 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse"
                />
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <HVZCard padding={32}>
              <div className="text-center">
                <Award className="h-8 w-8 text-hfz-text-disabled mx-auto mb-3" aria-hidden />
                <p className="text-base text-hfz-text-secondary m-0">
                  Complete lessons to earn badges. 🏅
                </p>
              </div>
            </HVZCard>
          ) : (
            <div className="flex flex-wrap gap-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  title={`Earned ${new Date(ach.earned_at).toLocaleDateString('en-GB')}`}
                  className="flex flex-col items-center justify-center w-24 h-24 rounded-hfz-md text-center px-2 transition-all duration-hfz-fast hover:scale-105"
                  style={{
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.3)',
                  }}
                >
                  <span className="text-2xl" aria-hidden>🏅</span>
                  <span className="text-xs font-semibold text-hfz-violet-light leading-tight mt-1.5 truncate w-full text-center">
                    {ach.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Purchases */}
        <section>
          <h2
            className="font-display font-bold text-hfz-h3 text-hfz-text-primary mb-4"
            style={{ background: 'none', WebkitTextFillColor: 'unset' }}
          >
            My purchases
          </h2>
          {loadingData ? (
            <div className="flex flex-col gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-hfz-md border border-hfz-border-violet bg-hfz-midnight animate-pulse"
                />
              ))}
            </div>
          ) : shopPurchases.length === 0 ? (
            <HVZCard padding={32}>
              <div className="text-center">
                <ShoppingBag className="h-8 w-8 text-hfz-text-disabled mx-auto mb-3" aria-hidden />
                <p className="text-base text-hfz-text-secondary mb-3">
                  No purchases yet — visit the Shop! 🛒
                </p>
                <Link to="/shop" className="no-underline">
                  <HVZButton variant="ghost" size="sm">
                    Browse the BROski$ Shop →
                  </HVZButton>
                </Link>
              </div>
            </HVZCard>
          ) : (
            <HVZCard padding={0} style={{ overflow: 'hidden' }}>
              <table className="w-full text-sm">
                <thead className="border-b border-hfz-border-violet bg-hfz-violet/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary">
                      Item
                    </th>
                    <th className="text-left px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary">
                      Delivery
                    </th>
                    <th className="text-right px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary">
                      Spent
                    </th>
                    <th className="text-right px-4 py-3 font-mono uppercase text-xs tracking-hfz-caps text-hfz-text-secondary hidden sm:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hfz-border-violet">
                  {shopPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-hfz-violet/5 transition-colors">
                      <td className="px-4 py-3 text-hfz-text-primary font-medium">
                        {p.shop_items?.[0]?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {renderDelivery(p)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-hfz-gold-light tabular-nums font-mono">
                        -{p.spent_tokens.toLocaleString()} 🪙
                      </td>
                      <td className="px-4 py-3 text-right text-hfz-text-secondary hidden sm:table-cell font-mono text-xs">
                        {new Date(p.purchased_at).toLocaleDateString('en-GB', {
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
