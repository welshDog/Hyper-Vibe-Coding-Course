import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupErrorTracking } from './utils/errorHandler'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'

// Web3 (wagmi/rainbowkit/metamask-sdk + its react-query peer) is NOT mounted
// here anymore. It lives in src/components/Web3Provider.tsx, lazy-loaded by
// App.tsx and wrapped around the /pets route only — so the public funnel
// (landing, Vibe Labs) never downloads the ~540 kB wallet stack.

// Initialize error tracking
setupErrorTracking();

function validateEnvironment() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
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
