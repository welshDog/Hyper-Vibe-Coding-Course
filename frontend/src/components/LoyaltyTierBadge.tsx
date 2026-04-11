type Tier = 'bronze' | 'silver' | 'gold' | 'hyper';

interface LoyaltyTierBadgeProps {
  tier: Tier;
  size?: 'sm' | 'md';
}

const TIER_CONFIG: Record<Tier, { emoji: string; label: string; classes: string }> = {
  bronze: { emoji: '🥉', label: 'Bronze', classes: 'bg-orange-100 text-orange-700' },
  silver: { emoji: '🥈', label: 'Silver', classes: 'bg-gray-100 text-gray-600'    },
  gold:   { emoji: '🥇', label: 'Gold',   classes: 'bg-yellow-100 text-yellow-700' },
  hyper:  { emoji: '💎', label: 'Hyper',  classes: 'bg-purple-100 text-purple-700' },
};

export function LoyaltyTierBadge({ tier, size = 'md' }: LoyaltyTierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${config.classes} ${sizeClasses}`}
      title={`${config.label} tier`}
    >
      <span aria-hidden="true">{config.emoji}</span>
      {config.label}
    </span>
  );
}
