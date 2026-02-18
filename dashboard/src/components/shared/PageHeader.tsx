import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex justify-between items-start mb-6', className)}>
      <div>
        <h1 className="font-display font-bold text-2xl text-text-primary">{title}</h1>
        {description && (
          <p className="font-body text-sm text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
