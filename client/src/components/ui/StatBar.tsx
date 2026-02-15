'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showValue?: boolean;
  size?: 'sm' | 'md';
  glow?: boolean;
  className?: string;
}

export function StatBar({
  label,
  value,
  maxValue = 100,
  showValue = true,
  size = 'sm',
  glow = false,
  className,
}: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-mono text-[10px] uppercase text-text-dim w-12 shrink-0 tracking-wider">
        {label}
      </span>
      <div
        className={cn(
          'flex-1 bg-border-subtle rounded-full overflow-hidden',
          size === 'sm' ? 'h-[3px]' : 'h-[5px]'
        )}
      >
        <motion.div
          className="h-full bg-accent-acid rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={
            glow
              ? { boxShadow: '0 0 8px var(--accent-acid-glow)' }
              : undefined
          }
        />
      </div>
      {showValue && (
        <span className="font-mono text-xs text-text-secondary w-8 text-right">
          {value}
        </span>
      )}
    </div>
  );
}
