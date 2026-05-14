// MintPetButton — drives the full BROskiPet mint flow.
//
// Composition:
//   - useMintPet()              → state machine: idle → authorizing → awaiting-signature → mining
//   - useWaitForTransactionReceipt → flips local "mined" once the tx confirms
//   - RainbowKit ConnectButton → wallet connect (MetaMask + Coinbase + WC mobile + more)
//
// Refuses to mint if the species CID is still a placeholder — protects users
// from spending 100 BROski$ on a CID the contract would later treat as junk.

import { useEffect, useState, type ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useWaitForTransactionReceipt } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useNavigate } from 'react-router-dom'

import { useMintPet } from '../../hooks/useMintPet'
import { useAuthStore } from '../../context/auth'
import { useHUD } from '../../hooks/useHUD'
import { isRealCid, type SpeciesConfig, type Rarity } from '../../lib/species'
import { ACTIVE_CHAIN } from '../../lib/wagmi'
import { HVZButton } from '../ui/hvz'

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

function LockedGlass({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/55 px-4 py-3">
      <div className="absolute inset-0 bg-hfz-space-black/20 backdrop-blur-md" />
      <div className="absolute -inset-16 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <span
        aria-label="Mint locked"
        className="absolute right-3 top-3 rounded-hfz-full border border-hfz-border-violet bg-hfz-space-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-hfz-text-secondary"
      >
        🔒 Locked
      </span>
      <div className="relative z-10 opacity-70">
        {children}
      </div>
    </div>
  )
}

export function MintPetButton({ species, petName, rarity, onMinted }: Props) {
  const navigate = useNavigate()
  const userId = useAuthStore((s) => s.user?.id)
  const hasSession = !!userId

  const { tokens, tokensLoading, refreshHUD } = useHUD()

  const { isConnected, address } = useAccount()
  const { mintPet, confirmMint, state, error, txHash, isReady, reset } = useMintPet()

  // Wait for on-chain receipt — flips to confirmed once mined.
  const {
    isLoading: receiptPending,
    isSuccess: receiptConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId: ACTIVE_CHAIN.id,
  })

  // Fire confirmMint once the receipt confirms (Phase 2A.5 — wallet-signed
  // persistence). Then fire onMinted so Pets.tsx refetches a collection that
  // already has the row in it. Relay mode short-circuits inside confirmMint.
  // We only retry once on "too-early" (RPC lag between wagmi receipt and our
  // server-side getTransactionReceipt) — Pets.tsx already does a follow-up
  // refetch 1.5s later that catches the rest.
  useEffect(() => {
    if (!(receiptConfirmed && txHash)) return
    let cancelled = false

    const persistThenNotify = async () => {
      try {
        const result = await confirmMint(txHash)
        if (!cancelled && !result.persisted && 'reason' in result && result.reason === 'too-early') {
          await new Promise((r) => setTimeout(r, 1200))
          if (!cancelled) await confirmMint(txHash)
        }
      } catch {
        // Persistence failure is non-fatal for the user — the on-chain mint
        // succeeded and Pets.tsx's belt-and-braces refetch + future
        // reconciliation job will pick it up.
      } finally {
        if (!cancelled) {
          onMinted?.({ txHash, petName, species: species.id })
          void refreshHUD()
          
          // 🔔 Base Notification: Fire on successful mint!
          try {
            const { sendPetNotification } = await import('../../lib/baseNotifications')
            await sendPetNotification({
              walletAddress: address as string,
              petName: petName,
              type: 'level_up', // Mint counts as first level/stage
              detail: `Baby Stage (Level 1)`,
            })
          } catch (err) {
            console.error('Base notification failed on mint:', err)
          }
        }
      }
    }

    void persistThenNotify()
    return () => { cancelled = true }
  }, [receiptConfirmed, txHash, confirmMint, onMinted, petName, species.id, refreshHUD, address])

  const cidIsReal     = isRealCid(species.babyMetadataCid)
  const canAfford     = !tokensLoading && tokens >= MINT_COST
  const nameValid     = petName.trim().length >= 1 && petName.trim().length <= 32
  const isWorking     = state === 'authorizing' || state === 'awaiting-signature' || state === 'mining' || receiptPending
  const isDone        = state === 'mining' && receiptConfirmed

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center justify-between rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/60 px-4 py-2.5 text-sm w-full">
          <span className="text-hfz-text-secondary">Your BROski$</span>
          <span className="font-mono font-bold text-hfz-text-secondary">
            Sign in
          </span>
        </div>
        <p className="text-xs text-hfz-text-secondary text-center">
          Sign in to check your BROski$ balance
        </p>
        <HVZButton
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/login')}
        >
          Sign in to unlock mint
        </HVZButton>
        <LockedGlass>
          <HVZButton
            variant="ghost"
            size="lg"
            fullWidth
            disabled
            aria-disabled="true"
          >
            Connect wallet (unlock first)
          </HVZButton>
        </LockedGlass>
      </div>
    )
  }

  if (!canAfford) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center justify-between rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/60 px-4 py-2.5 text-sm w-full">
          <span className="text-hfz-text-secondary">Your BROski$</span>
          <span className="font-mono font-bold text-red-400">
            {tokensLoading ? '...' : `${tokens} / ${MINT_COST} needed`}
          </span>
        </div>
        <LockedGlass>
          <HVZButton
            variant="ghost"
            size="lg"
            fullWidth
            disabled
            aria-disabled="true"
          >
            Need {MINT_COST} BROski$ to unlock
          </HVZButton>
        </LockedGlass>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="flex items-center justify-between rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/60 px-4 py-2.5 text-sm w-full">
          <span className="text-hfz-text-secondary">Your BROski$</span>
          <span className="font-mono font-bold text-hfz-gold-light">
            {tokensLoading ? '...' : `${tokens} / ${MINT_COST} needed`}
          </span>
        </div>
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
      </div>
    )
  }

  // ── Connected: full mint UX ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Balance bar */}
      <div className="flex items-center justify-between rounded-hfz-md border border-hfz-border-violet bg-hfz-space-black/60 px-4 py-2.5 text-sm">
        <span className="text-hfz-text-secondary">Your BROski$</span>
        <span className="font-mono font-bold text-hfz-gold-light">
          {tokensLoading ? '...' : `${tokens} / ${MINT_COST} needed`}
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
          : 'Mint Your Pet$'}
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
