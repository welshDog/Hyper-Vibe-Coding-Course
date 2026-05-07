// wagmi + RainbowKit configuration for the BROskiPet dNFT.
//
// Chain selection:
//   - Default: Base Sepolia (testnet) — cheap, EVM, the 2026 launch chain
//   - Switch to mainnet by setting VITE_BROSKIPET_CHAIN_ID=8453
//
// Wallet integrations come from RainbowKit's `getDefaultConfig` — Coinbase
// Wallet, MetaMask, WalletConnect, Rainbow, etc. are all included out of the box.
//
// Required env:
//   VITE_WALLETCONNECT_PROJECT_ID  — free key from cloud.walletconnect.com
//
// Optional env:
//   VITE_BROSKIPET_CHAIN_ID        — 84532 (Base Sepolia, default) or 8453 (Base mainnet)

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base, baseSepolia } from 'wagmi/chains'
import type { Chain } from 'wagmi/chains'

const WALLETCONNECT_PROJECT_ID =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined)?.trim() ?? ''

const RAW_CHAIN_ID = Number(import.meta.env.VITE_BROSKIPET_CHAIN_ID ?? '84532')

export const SUPPORTED_CHAINS: readonly [Chain, ...Chain[]] =
  RAW_CHAIN_ID === 8453 ? [base, baseSepolia] : [baseSepolia, base]

export const ACTIVE_CHAIN: Chain =
  RAW_CHAIN_ID === 8453 ? base : baseSepolia

export const wagmiConfig = getDefaultConfig({
  appName: 'BROski Pets',
  projectId: WALLETCONNECT_PROJECT_ID || 'placeholder-set-VITE_WALLETCONNECT_PROJECT_ID',
  chains: SUPPORTED_CHAINS,
  ssr: false,
})
