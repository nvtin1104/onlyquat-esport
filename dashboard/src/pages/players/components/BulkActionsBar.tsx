import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onToggleStatus: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onToggleStatus,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-bg-surface border-t border-border-subtle',
        'px-6 py-3',
        'flex items-center justify-between',
        'animate-in slide-in-from-bottom-2 duration-200'
      )}
    >
      <span className="font-body text-sm text-text-secondary">
        Da chon{' '}
        <span className="font-medium text-text-primary">{selectedCount}</span>{' '}
        tuyen thu
      </span>
      <div className="flex items-center gap-2">
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Xoa
        </Button>
        <Button variant="secondary" size="sm" onClick={onToggleStatus}>
          Doi trang thai
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Bo chon
        </Button>
      </div>
    </div>
  );
}
