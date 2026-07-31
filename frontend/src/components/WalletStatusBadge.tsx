import { useAccount } from 'wagmi'
import { useAuthStore } from '../context/auth'

/**
 * Wallet + session truth — for the MINT context only.
 *
 * ⚠️ Imports wagmi's useAccount → MUST render inside <Web3Provider> (i.e. the
 * /pets route only). Never put this in global chrome or the funnel; doing so
 * pulls the lazy web3 chunk app-wide and reverts the Sprint 2 perf fix.
 *
 * Minting needs BOTH: a Supabase session (to spend BROski$) AND a connected
 * wallet (to receive the NFT). This pill surfaces a disagreement instead of
 * hiding it — read-only, it changes no mint behaviour.
 */
export function WalletStatusBadge() {
  const { isConnected } = useAccount()
  const hasSession = useAuthStore((s) => Boolean(s.user))

  let label: string
  let tone: 'green' | 'gray' | 'amber' | 'red'

  if (hasSession && isConnected) {
    label = 'Wallet ready'
    tone = 'green'
  } else if (hasSession && !isConnected) {
    label = 'Wallet not connected'
    tone = 'amber'
  } else if (!hasSession && isConnected) {
    label = 'Wallet mismatch — sign in to mint'
    tone = 'red'
  } else {
    label = 'Sign in + connect wallet to mint'
    tone = 'gray'
  }

  // "gray" is the only tone that needs a pets-reskin override — it used
  // light-on-dark tokens (near-white text/border) that vanish once /pets
  // flips to a pastel background. green/amber/red already read fine on
  // either background since they're solid status colors, not theme tokens.
  const TONE = {
    green: 'text-hfz-mint border-hfz-mint/40 bg-hfz-mint/10',
    gray: 'text-pet-ink-soft border-pet-ink/20 bg-pet-ink/5',
    amber: 'text-hfz-amber border-hfz-amber/40 bg-hfz-amber/10',
    red: 'text-hfz-danger border-hfz-danger/40 bg-hfz-danger/10',
  } as const
  const DOT = {
    green: 'bg-hfz-mint',
    gray: 'bg-pet-ink-soft',
    amber: 'bg-hfz-amber',
    red: 'bg-hfz-danger',
  } as const

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Mint readiness: ${label}`}
      data-wallet-status={tone}
      className={`inline-flex w-fit items-center gap-1.5 rounded-hfz-full border px-hfz-3 py-1 text-hfz-caption font-semibold ${TONE[tone]}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-hfz-full ${DOT[tone]} ${
          tone === 'amber' ? 'motion-safe:animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  )
}
