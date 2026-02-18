import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full bg-bg-card border border-border-subtle rounded-sm px-3 py-2',
        'font-body text-sm text-text-primary placeholder:text-text-dim',
        'focus:outline-none focus:border-accent-acid focus:ring-1 focus:ring-accent-acid/30',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-150 resize-y min-h-[80px]',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };
