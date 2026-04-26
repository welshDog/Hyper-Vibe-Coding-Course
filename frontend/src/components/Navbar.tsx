import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { LoyaltyTierBadge } from './LoyaltyTierBadge';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      })
      .catch(() => {
        if (cancelled) return;
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">Hyper Vibe</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/courses"
                className="border-transparent text-gray-500 hover:border-primary hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Courses
              </Link>
              <Link
                to="/pricing"
                className="border-transparent text-gray-500 hover:border-primary hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/leaderboard"
                className="border-transparent text-gray-500 hover:border-primary hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                🏆 Leaderboard
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:border-primary hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/quests"
                  className="border-transparent text-gray-500 hover:border-primary hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  ⚔️ Quests
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative flex items-center gap-3">
                {tier && <LoyaltyTierBadge tier={tier} size="sm" />}
                <Link
                  to="/shop"
                  className="text-sm text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  🛒 Shop
                </Link>
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={(user.full_name ?? user.email) ?? 'avatar'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(user.full_name ?? user.email)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-sm text-gray-700 hover:text-primary transition-colors font-medium">
                      {(user.full_name ?? user.email)?.split(' ')[0] ?? 'Profile'}
                    </span>
                  </Link>
                  {typeof broskiTokens === 'number' ? (
                    <div className="text-sm font-bold text-gray-700">
                      🪙 {broskiTokens.toLocaleString()}
                    </div>
                  ) : null}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/courses"
              className="bg-primary/5 border-primary text-primary block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Courses
            </Link>
            <Link
              to="/pricing"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              Pricing
            </Link>
            <Link
              to="/leaderboard"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
            >
              🏆 Leaderboard
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                Dashboard
              </Link>
            )}
            {user && (
              <Link
                to="/quests"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                ⚔️ Quests
              </Link>
            )}
            {user && (
              <Link
                to="/shop"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                🛒 Shop
              </Link>
            )}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={(user.full_name ?? user.email) ?? 'avatar'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {(user.full_name ?? user.email)?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.full_name ?? user.email}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  {typeof broskiTokens === 'number' ? (
                    <div className="text-sm font-bold text-gray-700 mt-0.5">
                      🪙 {broskiTokens.toLocaleString()}
                    </div>
                  ) : null}
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-auto">
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-1 px-4">
                <Link to="/login" className="block w-full">
                  <Button variant="ghost" className="w-full justify-start">Sign in</Button>
                </Link>
                <Link to="/register" className="block w-full mt-2">
                  <Button className="w-full justify-start">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
