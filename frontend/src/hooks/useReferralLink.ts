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
  // Tracks the previous logged-in state as real state (not a ref) so it can
  // be read during render — refs are only safe to read in effects/handlers.
  const [wasLoggedIn, setWasLoggedIn] = useState<boolean | undefined>(undefined);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // Resetting local state back to defaults when the user logs out is a pure
  // derivation from the `user` prop, not a side effect — adjusted during
  // render instead of a setState-only effect. See
  // https://react.dev/learn/you-might-not-need-an-effect
  if (wasLoggedIn !== isLoggedIn) {
    setWasLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      setReferralCode(null);
      setLoading(false);
      setError(null);
      setCopied(false);
    }
  }

  useEffect(() => {
    let active = true;

    if (!user) {
      return () => {
        active = false;
      };
    }

    // Start the fetch immediately and un-deferred — a React StrictMode
    // dev-mode double-invoke would otherwise cancel a deferred kickoff
    // before it ever fires. Only the initial setState calls are deferred a
    // tick (queueMicrotask) so they aren't synchronous within the effect body.
    const fetchPromise = fetchReferralCode(supabase);

    queueMicrotask(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
    });

    void fetchPromise
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
