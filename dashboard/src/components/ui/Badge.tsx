import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'tier-s'
  | 'tier-a'
  | 'tier-b'
  | 'tier-c'
  | 'tier-d'
  | 'tier-f';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-bg-elevated text-text-secondary border-border-subtle',
  success: 'bg-success/10 text-success border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
  info: 'bg-info/10 text-info border-info/30',
  'tier-s': 'bg-tier-s/10 text-tier-s border-tier-s/30',
  'tier-a': 'bg-tier-a/10 text-tier-a border-tier-a/30',
  'tier-b': 'bg-tier-b/10 text-tier-b border-tier-b/30',
  'tier-c': 'bg-tier-c/10 text-tier-c border-tier-c/30',
  'tier-d': 'bg-tier-d/10 text-tier-d border-tier-d/30',
  'tier-f': 'bg-tier-f/10 text-tier-f border-tier-f/30',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-sm border',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps, BadgeVariant };
