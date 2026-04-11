import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../context/auth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoyaltyTierBadge } from '../components/LoyaltyTierBadge';
import type { Enrollment, Course } from '../types/database';
import { PlayCircle, CheckCircle, Award, ShoppingBag } from 'lucide-react';

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

type ShopPurchaseWithItem = {
  id: string;
  item_id: string;
  spent_tokens: number;
  purchased_at: string;
  shop_items: { name: string } | null;
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, url, size = 'lg' }: { name: string; url?: string | null; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-10 w-10 text-sm';
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${dim} rounded-full object-cover ring-4 ring-white shadow`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-primary flex items-center justify-center text-white font-bold ring-4 ring-white shadow`}>
      {initial}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, setUser } = useAuthStore();

  // Edit form state
  const [fullName, setFullName]   = useState(user?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  // Related data
  const [enrollments, setEnrollments]     = useState<EnrolledCourse[]>([]);
  const [achievements, setAchievements]   = useState<Achievement[]>([]);
  const [loyaltyTier, setLoyaltyTier]     = useState<LoyaltyTierRow | null>(null);
  const [shopPurchases, setShopPurchases] = useState<ShopPurchaseWithItem[]>([]);
  const [loadingData, setLoadingData]     = useState(true);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? '');
      setAvatarUrl(user.avatar_url ?? '');
    }
  }, [user]);

  // Fetch enrollments, achievements, loyalty tier, and shop purchases in parallel
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
          .select('id, item_id, spent_tokens, purchased_at, shop_items(name)')
          .eq('user_id', user!.id)
          .order('purchased_at', { ascending: false }),
      ]);
      if (!enrollRes.error)    setEnrollments((enrollRes.data ?? []) as EnrolledCourse[]);
      if (!achRes.error)       setAchievements(achRes.data ?? []);
      if (!tierRes.error && tierRes.data) setLoyaltyTier(tierRes.data as LoyaltyTierRow);
      if (!purchasesRes.error) setShopPurchases((purchasesRes.data ?? []) as ShopPurchaseWithItem[]);
      setLoadingData(false);
    }
    void fetchData();
  }, [user]);

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);

    const updates = {
      full_name:  fullName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setSaveMsg({ ok: false, text: 'Could not save — try again.' });
    } else {
      // Push updated user into Zustand so navbar + rest of app refresh instantly
      setUser({ ...user, ...data });
      setSaveMsg({ ok: true, text: 'Profile updated!' });
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setSaving(false);
  };

  if (!user) return null;

  const displayName = user.full_name ?? user.email ?? 'You';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    month: 'long', year: 'numeric',
  });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-6">
        <Avatar name={displayName} url={user.avatar_url} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {memberSince}</p>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        <Link to="/tokens" className="flex flex-col items-center py-4 hover:bg-yellow-50 transition-colors">
          <span className="text-2xl font-black text-yellow-500">
            💰 {(user.broski_tokens ?? 0).toLocaleString()}
          </span>
          <span className="text-xs text-gray-500 mt-1">BROski$</span>
        </Link>
        <div className="flex flex-col items-center py-4">
          <span className="text-2xl font-black text-primary">{enrollments.length}</span>
          <span className="text-xs text-gray-500 mt-1">
            {enrollments.length === 1 ? 'Course' : 'Courses'}
          </span>
        </div>
        <div className="flex flex-col items-center py-4">
          <span className="text-2xl font-black text-purple-600">{achievements.length}</span>
          <span className="text-xs text-gray-500 mt-1">
            {achievements.length === 1 ? 'Badge' : 'Badges'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-4 gap-1.5">
          {loyaltyTier ? (
            <LoyaltyTierBadge tier={loyaltyTier.tier} size="sm" />
          ) : (
            <span className="text-sm font-bold text-gray-400">—</span>
          )}
          <span className="text-xs text-gray-500">Tier</span>
        </div>
      </div>

      {/* ── Edit form ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Edit profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a direct image URL. Leave blank to use your initial.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
            {saveMsg && (
              <p className={`text-sm font-medium ${saveMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                {saveMsg.ok ? '✓' : '✗'} {saveMsg.text}
              </p>
            )}
          </div>
        </form>
      </section>

      {/* ── Enrolled courses ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">My courses</h2>
        {loadingData ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No courses yet.</p>
            <Link to="/courses" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
              Browse the catalogue →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {enrollments.map((enr) => {
              const isComplete = enr.progress_percentage >= 100;
              return (
                <li key={enr.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {isComplete
                      ? <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      : <PlayCircle  className="h-5 w-5 text-primary flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {enr.courses.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                          <div
                            className="h-1.5 bg-primary rounded-full transition-all"
                            style={{ width: `${enr.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(enr.progress_percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link to={`/learn/${enr.course_id}`}>
                    <Button size="sm" variant={isComplete ? 'outline' : 'default'}>
                      {isComplete ? 'Review' : 'Continue'}
                    </Button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Badges ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Badges earned</h2>
        {loadingData ? (
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 w-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Complete lessons to earn badges.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                title={`Earned ${new Date(ach.earned_at).toLocaleDateString('en-GB')}`}
                className="flex flex-col items-center justify-center w-20 h-20 bg-purple-50 border border-purple-200 rounded-xl text-center px-1 hover:bg-purple-100 transition-colors"
              >
                <span className="text-2xl">🏅</span>
                <span className="text-xs font-medium text-purple-700 leading-tight mt-1 truncate w-full text-center">
                  {ach.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── My Purchases ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">My purchases</h2>
        {loadingData ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : shopPurchases.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
            <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No purchases yet — visit the Shop!</p>
            <Link
              to="/shop"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              Browse the BROski$ Shop →
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Item</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Spent</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shopPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {p.shop_items?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-yellow-600 tabular-nums">
                      -{p.spent_tokens.toLocaleString()} 🪙
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">
                      {new Date(p.purchased_at).toLocaleDateString('en-GB', {
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
