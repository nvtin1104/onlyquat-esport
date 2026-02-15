import { cn } from '@/lib/utils';
import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-elevated border border-border-subtle rounded-sm overflow-hidden',
          hover && 'transition-all duration-400 hover:border-accent-acid hover:shadow-[0_0_40px_rgba(204,255,0,0.15)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
