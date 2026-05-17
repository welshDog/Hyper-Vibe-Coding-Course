/**
 * AuthInitializer — mount this ONCE at the top of the app (in main.tsx or App.tsx)
 * It calls initialize() which:
 *   1. Reads the session from localStorage immediately
 *   2. Subscribes to onAuthStateChange globally
 *   3. Cleans up the subscription when the component unmounts
 *
 * This is what keeps the user logged in across ALL pages.
 */
import { useEffect } from 'react';
import { useAuthStore } from '../context/auth';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, []);

  return <>{children}</>;
}
