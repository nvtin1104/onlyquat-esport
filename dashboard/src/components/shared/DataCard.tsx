import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  change?: number;
  subtext?: string;
  className?: string;
}

export function DataCard({ icon: Icon, value, label, change, subtext, className }: DataCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        'bg-bg-card border border-border-subtle rounded-sm p-4',
        'hover:border-border-hover transition',
        className,
      )}
    >
      <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-acid" />
      </div>

      <p className="font-mono font-bold text-3xl text-text-primary mt-3">{value}</p>
      <p className="font-body text-sm text-text-secondary mt-1">{label}</p>

      {change !== undefined && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5 font-mono text-xs mt-1',
            isPositive && 'text-success',
            isNegative && 'text-danger',
            !isPositive && !isNegative && 'text-text-dim',
          )}
        >
          {isPositive && <ArrowUpRight className="w-3 h-3" />}
          {isNegative && <ArrowDownRight className="w-3 h-3" />}
          {change > 0 ? '+' : ''}{change}%
        </span>
      )}

      {subtext && <p className="text-xs text-text-dim mt-1">{subtext}</p>}
    </div>
  );
}
