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
  dotClass: string;
  textClass: string;
}

const STATUS_CONFIG: Record<StatusType, StatusConfig> = {
  active: {
    dotClass: 'bg-success',
    textClass: 'text-success',
  },
  approved: {
    dotClass: 'bg-success',
    textClass: 'text-success',
  },
  inactive: {
    dotClass: 'bg-text-dim',
    textClass: 'text-text-dim',
  },
  pending: {
    dotClass: 'bg-warning',
    textClass: 'text-warning',
  },
  rejected: {
    dotClass: 'bg-danger',
    textClass: 'text-danger',
  },
  live: {
    dotClass: 'bg-danger animate-pulse',
    textClass: 'text-danger',
  },
  upcoming: {
    dotClass: 'bg-info',
    textClass: 'text-info',
  },
  completed: {
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
