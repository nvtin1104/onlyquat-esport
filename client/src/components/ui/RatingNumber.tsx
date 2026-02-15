import { cn } from '@/lib/utils';
import { TIER_COLORS, getTierFromRating, formatRating } from '@/lib/utils';

interface RatingNumberProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showTierColor?: boolean;
  className?: string;
}

export function RatingNumber({
  value,
  size = 'md',
  showTierColor = true,
  className,
}: RatingNumberProps) {
  const tier = getTierFromRating(value);
  const color = showTierColor ? TIER_COLORS[tier] : undefined;

  return (
    <span
      className={cn(
        'font-mono font-bold transition-all duration-400',
        size === 'sm' && 'text-lg',
        size === 'md' && 'text-2xl',
        size === 'lg' && 'text-4xl',
        className
      )}
      style={color ? { color } : undefined}
    >
      {formatRating(value)}
    </span>
  );
}
