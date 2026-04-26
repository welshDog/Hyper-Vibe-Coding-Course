import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Rift {
  id: string;
  topic: string;
  multiplier: number;
  expires_at: string;
}

interface RiftState {
  activeRift: Rift | null;
  timeLeft: number;
}

export function useRift(): RiftState {
  const [activeRift, setActiveRift] = useState<Rift | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Poll for active rift every 30 seconds
  useEffect(() => {
    const fetchRift = async () => {
      try {
        const { data } = await supabase
          .from('rifts')
          .select('id, topic, multiplier, expires_at')
          .eq('is_closed', false)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();
        setActiveRift((data as Rift | null) ?? null);
      } catch {
        setActiveRift(null);
      }
    };

    fetchRift();
    const interval = setInterval(fetchRift, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeRift) return;

    const calc = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(activeRift.expires_at).getTime() - Date.now()) / 1000)
      );
      setTimeLeft(diff);
      if (diff === 0) setActiveRift(null);
    };

    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [activeRift]);

  return { activeRift, timeLeft };
}
