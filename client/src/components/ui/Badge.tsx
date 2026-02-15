import { cn } from '@/lib/utils';
import { TIER_COLORS } from '@/lib/utils';
import type { TierKey } from '@/types';

interface BadgeProps {
  tier: TierKey;
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ tier, size = 'sm', className }: BadgeProps) {
  const color = TIER_COLORS[tier];

  return (
    <span
      className={cn(
        'font-mono font-bold inline-flex items-center justify-center rounded-sm',
        size === 'sm' && 'text-[10px] px-2 py-0.5',
        size === 'md' && 'text-xs px-3 py-1',
        className
      )}
      style={{
        color,
        backgroundColor: `${color}1A`,
        border: `1px solid ${color}33`,
      }}
    >
      {tier}
    </span>
  );
}
