import { cn } from '@/lib/utils';

type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'live'
  | 'upcoming'
  | 'completed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

interface StatusConfig {
  color: string;
  dotClass: string;
  textClass: string;
  pulse?: boolean;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  active: {
    color: '#22c55e',
    dotClass: 'bg-success',
    textClass: 'text-success',
  },
  approved: {
    color: '#22c55e',
    dotClass: 'bg-success',
    textClass: 'text-success',
  },
  inactive: {
    color: '',
    dotClass: 'bg-text-dim',
    textClass: 'text-text-dim',
  },
  pending: {
    color: '#eab308',
    dotClass: 'bg-warning',
    textClass: 'text-warning',
  },
  rejected: {
    color: '#ef4444',
    dotClass: 'bg-danger',
    textClass: 'text-danger',
  },
  live: {
    color: '#ef4444',
    dotClass: 'bg-danger animate-pulse',
    textClass: 'text-danger',
    pulse: true,
  },
  upcoming: {
    color: '#3b82f6',
    dotClass: 'bg-info',
    textClass: 'text-info',
  },
  completed: {
    color: '',
    dotClass: 'bg-text-secondary',
    textClass: 'text-text-secondary',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'flex items-center gap-1.5 font-mono text-[10px] uppercase',
        config.textClass,
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', config.dotClass)} />
      {status}
    </span>
  );
}
