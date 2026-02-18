import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  showValue?: boolean;
  className?: string;
}

export function StatBar({ label, value, max = 100, showValue = true, className }: StatBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-mono text-[10px] uppercase text-text-dim w-12 shrink-0 truncate">
        {label}
      </span>

      <div className="flex-1 h-[3px] bg-border-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-acid rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showValue && (
        <span className="font-mono text-xs text-text-secondary w-8 text-right shrink-0">
          {value}
        </span>
      )}
    </div>
  );
}
