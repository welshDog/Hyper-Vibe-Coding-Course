import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface HUDState {
  xp: number;
  maxXP: number;
  tokens: number;
  streak: number;
  pendingXP: number | null;
  awardXP: (amount: number) => void;
}

export const HUDContext = createContext<HUDState | null>(null);

interface HUDProviderProps {
  children: ReactNode;
  userId?: string;
}

export function HUDProvider({ children, userId }: HUDProviderProps) {
  const [xp, setXP] = useState(0);
  const [maxXP] = useState(1000);
  const [tokens, setTokens] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pendingXP, setPendingXP] = useState<number | null>(null);

  const fetchHUDData = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/xp-events/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setXP(data.total_xp ?? 0);
        setTokens(data.tokens ?? 0);
        setStreak(data.streak_days ?? 0);
      }
    } catch {
      // silently fail — HUD still renders with cached state
    }
  }, [userId]);

  useEffect(() => {
    fetchHUDData();
    const interval = setInterval(fetchHUDData, 60_000);
    return () => clearInterval(interval);
  }, [fetchHUDData]);

  const awardXP = useCallback((amount: number) => {
    setXP((prev) => prev + amount);
    setPendingXP(amount);
    setTimeout(() => setPendingXP(null), 2500);
  }, []);

  return (
    <HUDContext.Provider value={{ xp, maxXP, tokens, streak, pendingXP, awardXP }}>
      {children}
    </HUDContext.Provider>
  );
}
