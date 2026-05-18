import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { setupErrorTracking } from './utils/errorHandler'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from './lib/wagmi'

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

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            <App />
            <SpeedInsights />
            <Analytics />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </StrictMode>,
)
