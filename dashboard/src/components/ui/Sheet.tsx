import {
  createContext,
  useContext,
  forwardRef,
  useEffect,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('Sheet components must be used inside <Sheet>');
  return ctx;
}

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

function Sheet({ open = false, onOpenChange = () => {}, children }: SheetProps) {
  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

interface SheetTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetTrigger = forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ onClick, ...props }, ref) => {
    const { onOpenChange } = useSheetContext();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onOpenChange(true);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
SheetTrigger.displayName = 'SheetTrigger';

const SheetContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useSheetContext();

    useEffect(() => {
      if (!open) return;
      function handleKey(e: KeyboardEvent) {
        if (e.key === 'Escape') onOpenChange(false);
      }
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }, [open, onOpenChange]);

    if (!open) return null;

    return createPortal(
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/60 z-50"
          onClick={() => onOpenChange(false)}
        />
        {/* Slide panel */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            'fixed top-0 right-0 h-full w-[400px] max-w-full',
            'bg-bg-base border-l border-border-subtle z-50 p-6',
            'flex flex-col shadow-2xl',
            'animate-in slide-in-from-right duration-300',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </>,
      document.body
    );
  }
);
SheetContent.displayName = 'SheetContent';

const SheetHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5 mb-6', className)}
      {...props}
    />
  )
);
SheetHeader.displayName = 'SheetHeader';

const SheetTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn('font-display text-lg font-semibold text-text-primary', className)}
      {...props}
    />
  )
);
SheetTitle.displayName = 'SheetTitle';

const SheetClose = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, onClick, ...props }, ref) => {
    const { onOpenChange } = useSheetContext();
    return (
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
          onOpenChange(false);
          onClick?.(e);
        }}
        className={cn(
          'absolute top-4 right-4 p-1 rounded-sm text-text-dim hover:text-text-primary',
          'hover:bg-bg-elevated transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-acid/50',
          className
        )}
        aria-label="Close"
        {...props}
      >
        <X className="w-4 h-4" />
      </button>
    );
  }
);
SheetClose.displayName = 'SheetClose';

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose };
export type { SheetProps };
