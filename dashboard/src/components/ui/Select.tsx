import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, value, onChange, disabled, ...props }, ref) => (
    <div className="relative flex items-center">
      <select
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'w-full appearance-none bg-bg-card border border-border-subtle rounded-sm px-3 py-2 pr-9',
          'font-body text-sm text-text-primary',
          'focus:outline-none focus:border-accent-acid focus:ring-1 focus:ring-accent-acid/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150 cursor-pointer',
          !value && 'text-text-dim',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-bg-card text-text-primary"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 w-4 h-4 text-text-dim pointer-events-none" />
    </div>
  )
);
Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
