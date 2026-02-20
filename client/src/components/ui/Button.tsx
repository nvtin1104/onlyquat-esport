'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'font-display font-bold uppercase tracking-wider transition-all duration-400 inline-flex items-center justify-center',
          'hover:-translate-y-0.5',
          variant === 'primary' && [
            'bg-accent-acid text-bg-base',
            'hover:shadow-[var(--shadow-acid-glow)]',
            '[clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]',
          ],
          variant === 'secondary' && [
            'border border-border-subtle text-text-primary bg-transparent',
            'hover:border-accent-acid hover:text-accent-acid',
          ],
          variant === 'ghost' && [
            'text-text-secondary bg-transparent',
            'hover:text-text-primary',
          ],
          size === 'sm' && 'px-4 py-2 text-xs',
          size === 'md' && 'px-6 py-3 text-sm',
          size === 'lg' && 'px-8 py-4 text-sm',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
