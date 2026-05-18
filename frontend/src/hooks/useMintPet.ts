// useMintPet — orchestrates the BROskiPet mint flow.
//
// Two modes:
//   A) Wallet-signed (default — VITE_MINT_VIA_RELAY unset/false):
//        1. POST /mint-pet-auth — Edge Function deducts BROski$, issues nonce,
//           signs an EIP-712 MintAuth.
//        2. User submits mintWithAuth(auth, signature) — pays gas.
//
//   B) Backend-relayed (VITE_MINT_VIA_RELAY=true):
//        1. POST /mint-pet-auth with { relay: true } — Edge Function deducts
//           BROski$, signs the auth, AND submits the on-chain tx itself.
//           User's wallet is never asked to sign a tx (no gas needed).
//        2. Hook receives tx_hash directly from the response.
//
// The Edge Function is the trust boundary. Anything it signs is treated as
// authorized by the contract, which verifies BACKEND_SIGNER_ROLE.

import { useCallback, useMemo, useRef, useState } from 'react'
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi'

import { useAuthStore } from '../context/auth'
import {
  BROSKIPET_ABI,
  BROSKIPET_CHAIN_ID,
  BROSKIPET_CONTRACT_ADDRESS,
  type MintPetAuthResponse,
} from '../lib/contracts/broskiPet'
import { supabase } from '../lib/supabase'
import { ERC_8021_SUFFIX } from '../lib/builderCode'

const SUPABASE_URL    = import.meta.env.VITE_SUPABASE_URL as string
const MINT_VIA_RELAY  = String(import.meta.env.VITE_MINT_VIA_RELAY ?? '').toLowerCase() === 'true'

type MintPetParams = {
  /** Display name supplied by the user. Must match the metadata JSON. */
  petName: string
  /** IPFS CID of the rendered Baby-stage metadata. Backend validates length. */
  ipfsCid: string
  /** Species id (matches lib/species.ts SpeciesId). Used by the Edge Fn to
   *  populate the pets row in relay mode. */
  speciesId: string
  // NOTE: rarity is intentionally NOT a param. It is rolled server-side by
  // mint-pet-auth (anti-exploit) and returned in the response.
}

type MintPetState = 'idle' | 'authorizing' | 'awaiting-signature' | 'mining' | 'success' | 'error'

export type MintPetError = {
  code: 'not-connected' | 'wrong-chain' | 'auth-failed' | 'tx-rejected' | 'confirm-failed' | 'unknown'
  message: string
  /** HTTP status from the Edge Function, if applicable. */
  status?: number
  cause?: unknown
}

/** Captured at mintPet() time so confirmMint(txHash) can persist after the
 *  receipt confirms in wallet-signed mode. Cleared on reset(). */
type MintContext = {
  petId:         string
  petName:       string
  speciesId:     string
  rarity:        string
  ipfsCid:       string
  walletAddress: `0x${string}`
}

export function useMintPet() {
  const user = useAuthStore((s) => s.user)
  const { address, isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()
  const { writeContractAsync } = useWriteContract()

  const [state, setState] = useState<MintPetState>('idle')
  const [error, setError] = useState<MintPetError | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [mintedRarity, setMintedRarity] = useState<string | null>(null)
  const lastContext = useRef<MintContext | null>(null)
  const confirmedTxHashes = useRef<Set<string>>(new Set())

  const isContractConfigured = useMemo(
    () => Boolean(BROSKIPET_CONTRACT_ADDRESS),
    [],
  )

  const mintPet = useCallback(
    async ({ petName, ipfsCid, speciesId }: MintPetParams) => {
      setError(null)
      setTxHash(null)
      setMintedRarity(null)

      if (!user) {
        const err: MintPetError = { code: 'not-connected', message: 'Sign in first.' }
        setError(err); setState('error'); throw err
      }
      if (!isConnected || !address) {
        const err: MintPetError = { code: 'not-connected', message: 'Connect your wallet first.' }
        setError(err); setState('error'); throw err
      }
      if (!isContractConfigured) {
        const err: MintPetError = {
          code: 'unknown',
          message: 'BROskiPet contract address is not configured (VITE_BROSKIPET_CONTRACT_ADDRESS).',
        }
        setError(err); setState('error'); throw err
      }

      // Auto-switch to the BROskiPet chain — only relevant when the user has
      // to sign the tx themselves (mode A). In relay mode the user never
      // submits anything on-chain, so chain switching is a no-op.
      if (!MINT_VIA_RELAY && currentChainId !== BROSKIPET_CHAIN_ID) {
        try {
          await switchChainAsync({ chainId: BROSKIPET_CHAIN_ID })
        } catch (cause) {
          const err: MintPetError = {
            code: 'wrong-chain',
            message: `Please switch your wallet to chain ${BROSKIPET_CHAIN_ID}.`,
            cause,
          }
          setError(err); setState('error'); throw err
        }
      }

      // ── 1. Authorize via Edge Function ────────────────────────────────────
      setState('authorizing')

      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        const err: MintPetError = { code: 'not-connected', message: 'Session expired — sign in again.' }
        setError(err); setState('error'); throw err
      }

      const authResp = await fetch(`${SUPABASE_URL}/functions/v1/mint-pet-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          wallet_address: address,
          ipfs_cid:       ipfsCid,
          pet_name:       petName,
          species_id:     speciesId,
          relay:          MINT_VIA_RELAY,
          // Pre-spend handshake: mint-pet-auth rejects a contract/chain
          // mismatch BEFORE spending BROski$ (prevents silent token loss).
          expected_contract: BROSKIPET_CONTRACT_ADDRESS,
          expected_chain_id: BROSKIPET_CHAIN_ID,
        }),
      })

      if (!authResp.ok) {
        let message = `Mint authorization failed (${authResp.status})`
        try {
          const body = (await authResp.json()) as { message?: string; error?: string }
          message = body.message ?? body.error ?? message
        } catch { /* keep default */ }
        const err: MintPetError = {
          code: 'auth-failed',
          message,
          status: authResp.status,
        }
        setError(err); setState('error'); throw err
      }

      const payload = (await authResp.json()) as MintPetAuthResponse

      // Rarity is decided server-side (anti-exploit). Trust ONLY the value the
      // Edge Function returns — never a client choice.
      const serverRarity = payload.rarity ?? 'common'
      setMintedRarity(serverRarity)

      // Stash context so confirmMint() can persist the row in wallet-signed
      // mode once the receipt confirms.
      lastContext.current = {
        petId:         payload.auth.petId,
        petName,
        speciesId,
        rarity:        serverRarity,
        ipfsCid,
        walletAddress: address,
      }

      // Sanity-check: the Edge Function must point at the same contract the
      // frontend is configured for, otherwise the signature won't verify.
      if (
        payload.contract.toLowerCase() !== BROSKIPET_CONTRACT_ADDRESS.toLowerCase() ||
        payload.chain_id !== BROSKIPET_CHAIN_ID
      ) {
        const err: MintPetError = {
          code: 'auth-failed',
          message: 'Backend / frontend contract mismatch — contact support.',
        }
        setError(err); setState('error'); throw err
      }

      // ── 2. On-chain submit ────────────────────────────────────────────────
      // Mode B (relayed): backend already submitted the tx. Use its hash.
      if (MINT_VIA_RELAY) {
        if (!payload.tx_hash) {
          const err: MintPetError = {
            code: 'auth-failed',
            message: 'Relay mode requested but backend did not return a tx hash. Check Edge Function config.',
          }
          setError(err); setState('error'); throw err
        }
        setTxHash(payload.tx_hash)
        setState('mining')
        return { hash: payload.tx_hash, costPaid: payload.cost_paid }
      }

      // Mode A (wallet-signed): user submits the tx themselves and pays gas.
      setState('awaiting-signature')

      try {
        const hash = await writeContractAsync({
          address: BROSKIPET_CONTRACT_ADDRESS,
          abi: BROSKIPET_ABI,
          functionName: 'mintWithAuth',
          args: [
            {
              to: payload.auth.to,
              petId: payload.auth.petId,
              ipfsCID: payload.auth.ipfsCID,
              nonce: BigInt(payload.auth.nonce),
              expiry: BigInt(payload.auth.expiry),
            },
            payload.signature,
          ],
          chainId: BROSKIPET_CHAIN_ID,
          dataSuffix: ERC_8021_SUFFIX,
        })

        setTxHash(hash)
        setState('mining')
        return { hash, costPaid: payload.cost_paid }
      } catch (cause) {
        const err: MintPetError = {
          code: 'tx-rejected',
          message: cause instanceof Error ? cause.message : 'Wallet rejected the transaction.',
          cause,
        }
        setError(err); setState('error'); throw err
      }
    },
    [
      address, currentChainId, isConnected, isContractConfigured,
      switchChainAsync, user, writeContractAsync,
    ],
  )

  const reset = useCallback(() => {
    setState('idle'); setError(null); setTxHash(null); setMintedRarity(null)
    lastContext.current = null
    confirmedTxHashes.current.clear()
  }, [])

  /**
   * Phase 2A.5 — wallet-signed persistence.
   *
   * Call once a wallet-signed mintWithAuth tx confirms on-chain. Verifies the
   * receipt server-side and INSERTs into public.pets. Idempotent: safe to call
   * with the same hash twice. No-op in relay mode (mint-pet-auth already
   * persisted).
   */
  const confirmMint = useCallback(
    async (confirmedHash: `0x${string}`) => {
      if (MINT_VIA_RELAY) {
        // Relay mode persists inside mint-pet-auth — nothing to do here.
        return { persisted: true, alreadyByRelay: true as const }
      }
      if (confirmedTxHashes.current.has(confirmedHash)) {
        return { persisted: true, alreadyByConfirm: true as const }
      }
      const ctx = lastContext.current
      if (!ctx) {
        return { persisted: false, reason: 'no-context' as const }
      }

      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        return { persisted: false, reason: 'no-session' as const }
      }

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/mint-pet-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          tx_hash:        confirmedHash,
          pet_id:         ctx.petId,
          wallet_address: ctx.walletAddress,
          species_id:     ctx.speciesId,
          rarity:         ctx.rarity,
          pet_name:       ctx.petName,
          ipfs_cid:       ctx.ipfsCid,
        }),
      })

      if (resp.ok) {
        confirmedTxHashes.current.add(confirmedHash)
        return { persisted: true } as const
      }

      // 425 Too Early — receipt not mined yet. Caller should retry shortly.
      if (resp.status === 425) {
        return { persisted: false, reason: 'too-early' as const }
      }

      let message = `Confirm failed (${resp.status})`
      try {
        const body = (await resp.json()) as { error?: string }
        if (body.error) message = body.error
      } catch { /* keep default */ }
      const err: MintPetError = {
        code: 'confirm-failed',
        message,
        status: resp.status,
      }
      setError(err)
      return { persisted: false, reason: 'failed' as const, error: err }
    },
    [],
  )

  return {
    mintPet,
    confirmMint,
    reset,
    state,
    error,
    txHash,
    mintedRarity,
    isReady: isConnected && isContractConfigured,
  }
}
