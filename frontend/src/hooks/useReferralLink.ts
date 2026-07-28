import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStore } from '../context/auth';
import { supabase } from '../lib/supabase';
import {
  buildReferralLink,
  fallbackCopy,
  fetchReferralCode,
  REFERRAL_LINK_COPY_ERROR,
  REFERRAL_LINK_LOAD_ERROR,
} from '../lib/referralLink';

const COPIED_RESET_MS = 2000;

export function useReferralLink() {
  const { user } = useAuthStore();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      setReferralCode(null);
      setLoading(false);
      setError(null);
      setCopied(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(null);

    void fetchReferralCode(supabase)
      .then((code) => {
        if (!active) return;
        setReferralCode(code);
      })
      .catch(() => {
        if (!active) return;
        setReferralCode(null);
        setError(REFERRAL_LINK_LOAD_ERROR);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const referralLink = useMemo(() => buildReferralLink(referralCode), [referralCode]);

  const copyReferralLink = useCallback(async () => {
    if (!referralLink) return false;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(referralLink);
      } else if (!fallbackCopy(referralLink)) {
        throw new Error('Clipboard write failed');
      }
    } catch {
      if (!fallbackCopy(referralLink)) {
        setError(REFERRAL_LINK_COPY_ERROR);
        return false;
      }
    }

    setError(null);
    setCopied(true);

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, COPIED_RESET_MS);

    return true;
  }, [referralLink]);

  return {
    referralCode,
    referralLink,
    loading,
    error,
    copied,
    copyReferralLink,
  };
}
