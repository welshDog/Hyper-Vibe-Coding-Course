// MintPetButton — drives the full BROskiPet mint flow.
//
// Composition:
//   - useMintPet()              → state machine: idle → authorizing → awaiting-signature → mining
//   - useWaitForTransactionReceipt → flips local "mined" once the tx confirms
//   - get-pet-balance Edge Fn  → live BROski$ balance gate
//   - RainbowKit ConnectButton → wallet connect (MetaMask + Coinbase + WC mobile + more)
//
// Refuses to mint if the species CID is still a placeholder — protects users
// from spending 100 BROski$ on a CID the contract would later treat as junk.

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { useMintPet } from '../../hooks/useMintPet'
import { supabase } from '../../lib/supabase'
import { isRealCid, type SpeciesConfig, type Rarity } from '../../lib/species'
import { ACTIVE_CHAIN } from '../../lib/wagmi'
import { HVZButton } from '../ui/hvz'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL as string
const MINT_COST       = 100

type Props = {
  species:   SpeciesConfig
  petName:   string
  rarity:    Rarity
  onMinted?: (info: { txHash: `0x${string}`; petName: string; species: string }) => void
}

type StepLabel = { label: string; emoji: string }

const STEP_TRAIL: StepLabel[] = [
  { label: 'Reserve',       emoji: '💸' },
  { label: 'Sign',          emoji: '✍️' },
  { label: 'Mine',          emoji: '⛓️' },
  { label: 'Confirm',       emoji: '🎉' },
]

export function MintPetButton({ species, petName, rarity, onMinted }: Props) {
  const { isConnected, address } = useAccount()
  const { mintPet, state, error, txHash, isReady, reset } = useMintPet()

  // Wait for on-chain receipt — flips to confirmed once mined.
  const {
    isLoading: receiptPending,
    isSuccess: receiptConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId: ACTIVE_CHAIN.id,
  })

  // Live balance via Edge Function. Re-fetched on connect + after mint state changes.
  const [balance, setBalance]               = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  useEffect(() => {
    if (!address) { setBalance(null); return }
    let cancelled = false
    setBalanceLoading(true)
    ;(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) { if (!cancelled) setBalance(null); return }
        const res = await fetch(`${SUPABASE_URL}/functions/v1/get-pet-balance`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) { if (!cancelled) setBalance(null); return }
        const body = await res.json() as { broski_tokens?: number }
        if (!cancelled) setBalance(typeof body.broski_tokens === 'number' ? body.broski_tokens : null)
      } finally {
        if (!cancelled) setBalanceLoading(false)
      }
    })()
    return () => { cancelled = true }
    // re-fetch on connect + when a mint goes through state transitions
  }, [address, state])

  // Fire onMinted exactly once when receipt confirms.
  useEffect(() => {
    if (receiptConfirmed && txHash) {
      onMinted?.({ txHash, petName, species: species.id })
    }
  }, [receiptConfirmed, txHash, onMinted, petName, species.id])

  const cidIsReal     = isRealCid(species.babyMetadataCid)
  const canAfford     = (balance ?? 0) >= MINT_COST
  const nameValid     = petName.trim().length >= 1 && petName.trim().length <= 32
  const isWorking     = state === 'authorizing' || state === 'awaiting-signature' || state === 'mining' || receiptPending
  const isDone        = state === 'mining' && receiptConfirmed

  // ── Not connected: show RainbowKit connect button ────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <HVZButton
              variant="primary"
              size="lg"
              fullWidth
              onClick={openConnectModal}
              disabled={!mounted}
            >
              Connect wallet to mint 🔗
            </HVZButton>
          )}
        </ConnectButton.Custom>
        <p className="text-xs text-hfz-text-secondary text-center">
          MetaMask, Coinbase Wallet, Rainbow, WalletConnect — anything EVM
        </p>
      </div>
    )
  }

  // ── Connected: full mint UX ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Balance bar */}
      <div className="flex items-center justify-between rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/60 px-4 py-2.5 text-sm">
        <span className="text-hfz-text-secondary">Your BROski$</span>
        <span className={`font-mono font-bold ${canAfford ? 'text-hfz-gold-light' : 'text-red-400'}`}>
          {balanceLoading
            ? '...'
            : `${balance ?? 0} / ${MINT_COST} needed`}
        </span>
      </div>

      {/* Placeholder CID warning */}
      {!cidIsReal && (
        <div className="rounded-hfz-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-300">
          ⚠️ <strong>{species.displayName}</strong> metadata not pinned yet — run{' '}
          <code className="font-mono text-xs">pinata_upload_all.py</code> and swap the placeholder CID
          in <code className="font-mono text-xs">src/lib/species.ts</code> before live mints.
        </div>
      )}

      {/* Mint button */}
      <HVZButton
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => mintPet({
          petName:   petName.trim(),
          ipfsCid:   species.babyMetadataCid,
          speciesId: species.id,
          rarity,
        })}
        disabled={!isReady || !canAfford || !cidIsReal || !nameValid || isWorking || isDone}
      >
        {!nameValid       ? 'Enter a pet name'
          : !cidIsReal    ? 'Metadata not pinned yet'
          : !canAfford    ? `Need ${MINT_COST} BROski$`
          : state === 'authorizing'        ? 'Reserving your pet…'
          : state === 'awaiting-signature' ? 'Confirm in your wallet…'
          : state === 'mining' && receiptPending ? 'Minting onchain…'
          : isDone        ? 'Pet minted! 🎉'
          : `Mint ${species.displayName} (${MINT_COST} BROski$) 🐾`}
      </HVZButton>

      {/* Step trail */}
      {(isWorking || isDone) && (
        <ol className="flex justify-between gap-1 text-[11px] uppercase tracking-wider">
          {STEP_TRAIL.map((step, idx) => {
            const reached =
              (idx === 0 && state !== 'idle') ||
              (idx === 1 && (state === 'awaiting-signature' || state === 'mining' || isDone)) ||
              (idx === 2 && (state === 'mining' || isDone)) ||
              (idx === 3 && isDone)
            return (
              <li key={step.label} className={`flex flex-col items-center gap-1 ${reached ? 'text-hfz-violet-light' : 'text-hfz-text-secondary/40'}`}>
                <span className="text-base" aria-hidden>{step.emoji}</span>
                <span className="font-semibold">{step.label}</span>
              </li>
            )
          })}
        </ol>
      )}

      {/* Success card */}
      {isDone && txHash && (
        <div className="rounded-hfz-md border border-green-500/40 bg-green-500/10 px-4 py-3 text-center">
          <p className="font-bold text-green-300">{petName} minted as a {rarity} {species.displayName}! 🎉</p>
          <a
            href={`https://${ACTIVE_CHAIN.id === 8453 ? '' : 'sepolia.'}basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block text-xs text-green-400 underline hover:text-green-300"
          >
            View on Basescan →
          </a>
        </div>
      )}

      {/* Error */}
      {state === 'error' && error && (
        <div className="rounded-hfz-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
          <p className="font-semibold text-red-300">{error.message}</p>
          <button
            onClick={reset}
            className="mt-1 text-xs text-red-400 underline hover:text-red-300"
          >
            Try again
          </button>
        </div>
      )}

      {/* Wallet info — let the user disconnect / switch via RainbowKit modal */}
      <div className="flex justify-center text-xs text-hfz-text-secondary">
        <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
      </div>
    </div>
  )
}
