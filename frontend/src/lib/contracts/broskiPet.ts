// BROskiPet contract — ABI subset + address resolver.
//
// We only inline the functions / events the frontend actually calls. Re-export
// the full ABI from the Foundry build artifact when you need read-after-mint
// helpers (events, evolve, etc.). Keeping it minimal also keeps the bundle small.

import { ACTIVE_CHAIN } from '../wagmi'

export const BROSKIPET_CONTRACT_ADDRESS = (
  (import.meta.env.VITE_BROSKIPET_CONTRACT_ADDRESS as string | undefined)?.trim() ?? ''
) as `0x${string}`

if (
  BROSKIPET_CONTRACT_ADDRESS &&
  !/^0x[a-fA-F0-9]{40}$/.test(BROSKIPET_CONTRACT_ADDRESS)
) {
  throw new Error(
    `[broskiPet] VITE_BROSKIPET_CONTRACT_ADDRESS is not a valid 0x address: ${BROSKIPET_CONTRACT_ADDRESS}`,
  )
}

/**
 * True only when the frontend points at a real, non-zero BROskiPet contract.
 * Empty, malformed, or the `0x000…0` placeholder (the `.env.example` default)
 * all read as NOT configured.
 *
 * Why this matters: `mint-pet-auth` spends 100 BROski$ *before* it returns the
 * backend's contract address, so the frontend can only detect a contract
 * mismatch AFTER the spend. A stale/placeholder env must therefore hard-stop
 * the mint flow *before* that Edge Function is ever called — never let a
 * misconfig reach a paid call. `useMintPet` gates on this pre-auth.
 */
export const IS_BROSKIPET_CONFIGURED =
  /^0x[a-fA-F0-9]{40}$/.test(BROSKIPET_CONTRACT_ADDRESS) &&
  BROSKIPET_CONTRACT_ADDRESS.toLowerCase() !==
    '0x0000000000000000000000000000000000000000'

export const BROSKIPET_CHAIN_ID = ACTIVE_CHAIN.id

/** Minimal ABI — only the functions/events the UI uses. */
export const BROSKIPET_ABI = [
  {
    type: 'function',
    name: 'mintWithAuth',
    stateMutability: 'nonpayable',
    inputs: [
      {
        name: 'auth',
        type: 'tuple',
        components: [
          { name: 'to',      type: 'address' },
          { name: 'petId',   type: 'string'  },
          { name: 'ipfsCID', type: 'string'  },
          { name: 'nonce',   type: 'uint256' },
          { name: 'expiry',  type: 'uint256' },
        ],
      },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'totalMinted',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mintedBy',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'maxPerWallet',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'PetMinted',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'owner',   type: 'address', indexed: true },
      { name: 'petId',   type: 'string',  indexed: false },
      { name: 'ipfsCID', type: 'string',  indexed: false },
      { name: 'nonce',   type: 'uint256', indexed: false },
    ],
    anonymous: false,
  },
] as const

/** Shape the Edge Function (`mint-pet-auth`) returns. */
export type MintAuth = {
  to: `0x${string}`
  petId: string
  ipfsCID: string
  nonce: bigint
  expiry: bigint
}

export type MintPetAuthResponse = {
  auth: {
    to: `0x${string}`
    petId: string
    ipfsCID: string
    nonce: string
    expiry: string
  }
  signature: `0x${string}`
  cost_paid: number
  chain_id: number
  contract: `0x${string}`
  /** True when the Edge Function relayed the on-chain tx itself (Path A gas sponsorship). */
  relayed?: boolean
  /** Present only when `relayed` is true. The hash of the submitted mintWithAuth tx. */
  tx_hash?: `0x${string}`
  /** Server-rolled rarity tier (common|uncommon|rare|legendary). Authoritative —
   *  the client no longer chooses rarity; it is revealed after the mint. */
  rarity?: string
}
