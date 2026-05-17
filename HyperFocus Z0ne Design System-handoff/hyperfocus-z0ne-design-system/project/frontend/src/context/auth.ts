import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  initialize: () => () => void; // returns cleanup fn
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,

  initialize: () => {
    // Step 1: Get current session from localStorage immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Step 2: Subscribe to ALL auth events globally
    // SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        loading: false,
      });
    });

    // Step 3: Return cleanup function for React strict mode / unmount
    return () => subscription.unsubscribe();
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },
}));
