import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, type = 'text', ...props }, ref) => (
    <div className="relative flex items-center">
      {icon && (
        <div className="absolute left-3 flex items-center pointer-events-none text-text-dim">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full bg-bg-card border border-border-subtle rounded-sm px-3 py-2',
          'font-body text-sm text-text-primary placeholder:text-text-dim',
          'focus:outline-none focus:border-accent-acid focus:ring-1 focus:ring-accent-acid/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150',
          icon && 'pl-9',
          className
        )}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';

export { Input };
export type { InputProps };
