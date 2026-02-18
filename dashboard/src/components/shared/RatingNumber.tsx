import { cn, getTierFromRating, TIER_COLORS, formatRating } from '@/lib/utils';

interface RatingNumberProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function RatingNumber({ value, size = 'md', className }: RatingNumberProps) {
  const tier = getTierFromRating(value);
  const color = TIER_COLORS[tier];

  return (
    <span
      className={cn('font-mono font-bold', sizeClasses[size], className)}
      style={{ color }}
    >
      {formatRating(value)}
    </span>
  );
}
