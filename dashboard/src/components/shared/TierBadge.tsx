import { cn, TIER_COLORS, type TierKey } from '@/lib/utils';

interface TierBadgeProps {
  tier: TierKey;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
  lg: 'text-sm px-4 py-1.5',
};

export function TierBadge({ tier, size = 'md', className }: TierBadgeProps) {
  const color = TIER_COLORS[tier];

  return (
    <span
      className={cn('inline-flex font-mono font-bold rounded-sm', sizeClasses[size], className)}
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}4D`,
      }}
    >
      {tier}
    </span>
  );
}
