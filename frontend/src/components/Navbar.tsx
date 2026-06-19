import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { HVZBrand, HVZButton } from './ui/hvz';
import { LoyaltyTierBadge } from './LoyaltyTierBadge';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthStatusBadge } from './AuthStatusBadge';

const PUBLIC_LINKS: { label: string; href: string }[] = [
  { label: 'Courses', href: '/courses' },
  { label: '🧪 Vibe Labs', href: '/vibe-labs' },
  { label: 'Pets', href: '/pets' },
  { label: 'Pricing', href: '/pricing' },
  { label: '🏆 Leaderboard', href: '/leaderboard' },
];

const AUTHED_LINKS: { label: string; href: string }[] = [
  { label: 'Dashboard', href: '/dashboard' },
  // Hidden until Quests is populated (2026-06-19) — /quests route still live.
  // { label: '⚔️ Quests', href: '/quests' },
  { label: '🛒 Shop', href: '/shop' },
];

export function Navbar() {
  const { user, loading, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [openedAtPath, setOpenedAtPath] = useState<string | null>(null);
  const isMenuOpen = openedAtPath === location.pathname;
  const toggleMenu = () =>
    setOpenedAtPath((prev) => (prev === location.pathname ? null : location.pathname));

  const [tier, setTier] = useState<'bronze' | 'silver' | 'gold' | 'hyper' | null>(null);
  const [broskiTokens, setBroskiTokens] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      queueMicrotask(() => setTier(null));
      queueMicrotask(() => setBroskiTokens(null));
      queueMicrotask(() => setAvatarUrl(null));
      return;
    }
    supabase
      .from('user_loyalty_tier')
      .select('tier')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.tier) setTier(data.tier as 'bronze' | 'silver' | 'gold' | 'hyper');
      });
  }, [user?.id]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    let cancelled = false;
    supabase
      .from('users')
      .select('broski_tokens, avatar_url')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) return;
        setBroskiTokens(typeof data.broski_tokens === 'number' ? data.broski_tokens : null);
        setAvatarUrl(typeof data.avatar_url === 'string' ? data.avatar_url : null);
      }, () => { if (cancelled) return; });
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinkClass =
    'text-hfz-text-primary/80 hover:text-hfz-cyan transition-colors duration-hfz-fast text-[15px] font-medium';
  const mobileLinkClass =
    'block px-4 py-3 text-base font-medium text-hfz-text-primary/85 border-l-2 border-transparent hover:border-hfz-violet-light hover:bg-hfz-violet/10 hover:text-hfz-text-primary transition-colors';

  return (
    <nav
      className="sticky top-0 z-50 border-b border-hfz-border-violet"
      style={{
        background: 'rgba(10,14,26,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-hfz-page mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">

          {/* Left — brand + nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" aria-label="Home" className="no-underline">
              <HVZBrand size="sm" />
            </Link>
            <div className="hidden sm:flex sm:items-center sm:gap-6">
              {PUBLIC_LINKS.map((l) => (
                <Link key={l.href} to={l.href} className={navLinkClass}>
                  {l.label}
                </Link>
              ))}
              {user && AUTHED_LINKS.filter((l) => l.href !== '/shop').map((l) => (
                <Link key={l.href} to={l.href} className={navLinkClass}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — auth area (desktop) */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            <AuthStatusBadge />
            {/* loading → show nothing at all, no flash */}
            {!loading && (
              user ? (
                // ✅ Logged in
                <>
                  {tier && <LoyaltyTierBadge tier={tier} size="sm" />}
                  <Link to="/shop" className={navLinkClass}>🛒 Shop</Link>
                  {typeof broskiTokens === 'number' && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-hfz-full border border-hfz-gold/30 bg-hfz-gold/10">
                      <span aria-hidden>🪙</span>
                      <span className="font-mono font-bold text-hfz-gold-light text-sm">
                        {broskiTokens.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <Link to="/profile" className="flex items-center gap-2 no-underline">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={(user.full_name ?? user.email) ?? 'avatar'}
                        className="h-8 w-8 rounded-full object-cover border border-hfz-border-violet-strong"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-hfz-violet/20 border border-hfz-border-violet-strong flex items-center justify-center text-hfz-violet-light font-bold text-sm">
                        {(user.full_name ?? user.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-[15px] text-hfz-text-primary/85 font-medium">
                      {(user.full_name ?? user.email)?.split(' ')[0] ?? 'Profile'}
                    </span>
                  </Link>
                  <HVZButton variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </HVZButton>
                </>
              ) : (
                // 🔓 Logged out
                <>
                  <Link to="/login" className="no-underline">
                    <HVZButton variant="ghost" size="sm">Sign in</HVZButton>
                  </Link>
                  <Link to="/register" className="no-underline">
                    <HVZButton variant="primary" size="sm">Start free →</HVZButton>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="sm:hidden -mr-2 flex items-center gap-2">
            <AuthStatusBadge />
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="p-2 rounded-hfz-sm text-hfz-text-secondary hover:text-hfz-cyan hover:bg-hfz-violet/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="sm:hidden border-t border-hfz-border-violet bg-hfz-space-black">
          <div className="py-2">
            {PUBLIC_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className={mobileLinkClass}>{l.label}</Link>
            ))}
            {user && AUTHED_LINKS.map((l) => (
              <Link key={l.href} to={l.href} className={mobileLinkClass}>{l.label}</Link>
            ))}
          </div>
          <div className="px-4 py-4 border-t border-hfz-border-violet">
            {/* loading → show nothing, no flash on mobile either */}
            {!loading && (
              user ? (
                // ✅ Logged in (mobile)
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={(user.full_name ?? user.email) ?? 'avatar'}
                      className="h-10 w-10 rounded-full object-cover border border-hfz-border-violet-strong"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-hfz-violet/20 border border-hfz-border-violet-strong flex items-center justify-center text-hfz-violet-light font-bold">
                      {(user.full_name ?? user.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-hfz-text-primary truncate">
                      {user.full_name ?? user.email}
                    </div>
                    {typeof broskiTokens === 'number' && (
                      <div className="text-sm font-bold text-hfz-gold-light font-mono mt-0.5">
                        🪙 {broskiTokens.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <HVZButton variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </HVZButton>
                </div>
              ) : (
                // 🔓 Logged out (mobile)
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="no-underline">
                    <HVZButton variant="ghost" size="md" fullWidth>Sign in</HVZButton>
                  </Link>
                  <Link to="/register" className="no-underline">
                    <HVZButton variant="primary" size="md" fullWidth>Start free →</HVZButton>
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
