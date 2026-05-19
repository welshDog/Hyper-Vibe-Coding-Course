// Web3Provider — the entire wallet/web3 stack, isolated behind one lazy import.
//
// Why this file exists:
//   wagmi + @rainbow-me/rainbowkit + viem + metamask-sdk is ~540 kB gzip. It
//   was wired at the app root in main.tsx, so EVERY cold visit (landing, Vibe
//   Labs — none of which use a wallet) paid that download/parse.
//
//   Verified blast radius: only the Pets mint flow consumes wagmi
//   (pages/Pets.tsx → MintPetButton → useMintPet + RainbowKit ConnectButton).
//   @tanstack/react-query is used ONLY as wagmi's required peer (no useQuery /
//   useMutation anywhere else), so it lives here too.
//
//   App.tsx mounts this via React.lazy and wraps ONLY the /pets route, so the
//   whole graph is fetched on demand — the public funnel never loads it.
//
//   ⚠️ If any non-Pets route ever needs wagmi hooks, wrap that route here too —
//   wagmi hooks throw without a WagmiProvider ancestor.

import '@rainbow-me/rainbowkit/styles.css'
import type { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '../lib/wagmi'

const queryClient = new QueryClient()

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
