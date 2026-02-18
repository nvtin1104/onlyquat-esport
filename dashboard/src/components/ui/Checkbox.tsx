import { forwardRef, type HTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        'w-4 h-4 rounded-sm border flex items-center justify-center shrink-0',
        'transition-all duration-150 cursor-pointer focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-accent-acid/50',
        checked
          ? 'bg-accent-acid border-accent-acid'
          : 'bg-transparent border-border-subtle hover:border-border-hover',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {checked && <Check className="w-3 h-3 text-black stroke-[3]" />}
    </button>
  )
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
export type { CheckboxProps };
