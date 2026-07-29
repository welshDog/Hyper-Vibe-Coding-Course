import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupErrorTracking } from './utils/errorHandler'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { resolveBrowserSupabaseConfig } from './lib/supabase/config'

// Web3 (wagmi/rainbowkit/metamask-sdk + its react-query peer) is NOT mounted
// here anymore. It lives in src/components/Web3Provider.tsx, lazy-loaded by
// App.tsx and wrapped around the /pets route only — so the public funnel
// (landing, Vibe Labs) never downloads the ~540 kB wallet stack.

// Initialize error tracking
setupErrorTracking();

function validateEnvironment() {
  resolveBrowserSupabaseConfig({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  })
}

validateEnvironment();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <SpeedInsights />
      <Analytics />
    </ErrorBoundary>
  </StrictMode>,
)
