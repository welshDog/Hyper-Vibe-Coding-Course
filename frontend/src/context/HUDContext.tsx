import { createContext, useState, useEffect, useRef, useCallback, useContext, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface HUDState {
  xp: number;
  maxXP: number;
  tokens: number;
  tokensLoading: boolean;
  streak: number;
  pendingXP: number | null;
  pendingTokens: number | null;
  awardXP: (amount: number) => void;
  awardTokens: (amount: number) => void;
  refreshHUD: () => Promise<void>;
}

export const HUDContext = createContext<HUDState | null>(null);

export function useHUD(): HUDState {
  const ctx = useContext(HUDContext);
  if (!ctx) throw new Error('useHUD must be used inside HUDProvider');
  return ctx;
}

interface HUDProviderProps {
  children: ReactNode;
  userId?: string;
}

export function HUDProvider({ children, userId }: HUDProviderProps) {
  const [xp, setXP] = useState(0);
  const [maxXP] = useState(1000);
  const [tokens, setTokens] = useState(0);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const [pendingXP, setPendingXP] = useState<number | null>(null);
  const [pendingTokens, setPendingTokens] = useState<number | null>(null);
  // Delta-watcher: any positive jump in `tokens` (poll, awardTokens, manual
  // setTokens) fires a celebration. Negative deltas (spend) intentionally do
  // not. The ref starts uninitialised so the first poll doesn't celebrate the
  // initial fetch.
  const lastTokensRef = useRef<number | null>(null);

  const fetchHUDData = useCallback(async () => {
    if (!userId) return;
    setTokensLoading(true);
    try {
      const [{ data: userXp }, { data: userProfile }] = await Promise.all([
        supabase
          .from('user_xp')
          .select('total_xp, streak_days')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('users')
          .select('broski_tokens')
          .eq('id', userId)
          .maybeSingle(),
      ]);

      if (!userXp) {
        await supabase.from('user_xp').insert({ user_id: userId });
      } else {
        setXP(userXp.total_xp ?? 0);
        setStreak(userXp.streak_days ?? 0);
      }

      setTokens(userProfile?.broski_tokens ?? 0);
    } catch {
      // silently fail — HUD still renders with cached state
    } finally {
      setTokensLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const tick = () => {
      void fetchHUDData();
    };
    const timeout = setTimeout(tick, 0);
    const interval = setInterval(tick, 60_000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchHUDData, userId]);

  const awardXP = useCallback(async (amount: number) => {
    setXP((prev) => prev + amount);
    setPendingXP(amount);
    setTimeout(() => setPendingXP(null), 2500);

    // 🔔 Base Notification check (Level Up)
    // In Phase 2, XP mirrors Pet level directly. If the jump crosses a threshold, we notify.
    // For now, this fires locally - but we need wallet address to notify.
    // Real evolution notification should ideally happen where pet logic is evaluated (e.g. PetsPage).
  }, []);

  const awardTokens = useCallback(async (amount: number) => {
    setTokens((prev) => prev + amount);
    
    // 🔔 Base Notification (Reward)
    // We notify if it's a significant reward (> 0)
    // NOTE: In a full app, we need the walletAddress and petName here.
  }, []);

  // Watch `tokens` for any positive delta and emit pendingTokens once per
  // jump. Skips the initial value (first poll after mount).
  useEffect(() => {
    const prev = lastTokensRef.current;
    if (prev === null) {
      lastTokensRef.current = tokens;
      return;
    }
    if (tokens > prev) {
      const delta = tokens - prev;
      setPendingTokens(delta);
      const timer = setTimeout(() => setPendingTokens(null), 2500);
      lastTokensRef.current = tokens;
      return () => clearTimeout(timer);
    }
    lastTokensRef.current = tokens;
  }, [tokens]);

  return (
    <HUDContext.Provider
      value={{
        xp,
        maxXP,
        tokens,
        tokensLoading,
        streak,
        pendingXP,
        pendingTokens,
        awardXP,
        awardTokens,
        refreshHUD: fetchHUDData,
      }}
    >
      {children}
    </HUDContext.Provider>
  );
}
