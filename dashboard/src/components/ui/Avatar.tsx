import { forwardRef, useState, useCallback, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

const R2_PUBLIC_URL = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** Extract key from either a full URL or a raw path */
function extractKey(src: string): string {
  try {
    const url = new URL(src);
    return url.pathname.replace(/^\//, '');
  } catch {
    return src.replace(/^\//, '');
  }
}

/**
 * 3-step fallback:
 *   0 → stored src as-is
 *   1 → extract path from src, prepend VITE_R2_PUBLIC_URL
 *   2 → null (show initials)
 */
function useAvatarSrc(src: string | undefined) {
  const [step, setStep] = useState(0);
  const onError = useCallback(() => setStep((s) => s + 1), []);

  const resolvedSrc = (() => {
    if (!src) return null;
    if (step === 0) return src;
    if (step === 1 && R2_PUBLIC_URL) {
      const key = extractKey(src);
      return key ? `${R2_PUBLIC_URL}/${key}` : null;
    }
    return null;
  })();

  return { resolvedSrc, onError };
}

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallback: string;
  size?: AvatarSize;
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = 'md', ...props }, ref) => {
    const { resolvedSrc, onError } = useAvatarSrc(src);

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-full bg-bg-elevated overflow-hidden flex items-center justify-center shrink-0',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {resolvedSrc ? (
          <img
            src={resolvedSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={onError}
          />
        ) : (
          <span className="font-mono font-medium text-text-dim uppercase select-none">
            {fallback.charAt(0)}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };
export type { AvatarProps, AvatarSize };
