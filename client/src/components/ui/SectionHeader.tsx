import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeader({ label, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-10', className)}>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-2 block">
          {label}
        </span>
      )}
      <h2 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
        {title}
      </h2>
      {description && (
        <p className="font-body text-text-secondary mt-2 max-w-xl">
          {description}
        </p>
      )}
    </div>
  );
}
