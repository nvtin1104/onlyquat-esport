import { cn } from '@/lib/utils';
import { type InputHTMLAttributes, forwardRef } from 'react';
import { Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon = false, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
          <input
            ref={ref}
            className={cn(
              'w-full bg-bg-surface border border-border-subtle rounded-sm pl-10 pr-4 py-3',
              'font-body text-sm text-text-primary placeholder:text-text-dim',
              'focus:outline-none focus:border-accent-acid transition-colors duration-300',
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-bg-surface border border-border-subtle rounded-sm px-4 py-3',
          'font-body text-sm text-text-primary placeholder:text-text-dim',
          'focus:outline-none focus:border-accent-acid transition-colors duration-300',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
