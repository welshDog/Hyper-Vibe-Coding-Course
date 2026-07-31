// PetCardSkeleton — shape-matched skeleton for PetCard while useMyPets loads.
// Shimmer sweep > pulse: stays subtle on dark surfaces and matches Emil's
// "reveal, not pulse" rule. Inert + aria-hidden so AT users skip it.

import { HVZCard } from '../ui/hvz'

type Props = { size?: 'full' | 'mini' }

export function PetCardSkeleton({ size = 'full' }: Props) {
  if (size === 'mini') {
    return (
      <HVZCard variant="chunky" padding={16}>
        <div aria-hidden className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-hfz-sm bg-pet-ink/10 shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 motion-safe:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-3 w-3/5 rounded bg-pet-ink/10" />
            <div className="h-2 w-2/5 rounded bg-pet-ink/10" />
            <div className="h-4 w-20 rounded-full bg-pet-ink/10" />
          </div>
        </div>
      </HVZCard>
    )
  }

  return (
    <HVZCard variant="chunky">
      <div aria-hidden className="flex flex-col sm:flex-row gap-4">
        <div className="h-20 w-20 rounded-hfz-md bg-pet-ink/10 shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 motion-safe:animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-3/5 rounded bg-pet-ink/10" />
              <div className="h-3 w-2/5 rounded bg-pet-ink/10" />
            </div>
            <div className="h-5 w-16 rounded-full bg-pet-ink/10" />
          </div>
          <div className="space-y-2">
            <div className="h-2.5 w-1/3 rounded bg-pet-ink/10" />
            <div className="h-2 w-full rounded-full bg-pet-ink/10" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-pet-ink/10" />
            <div className="h-5 w-16 rounded-full bg-pet-ink/10" />
          </div>
        </div>
      </div>
    </HVZCard>
  )
}
