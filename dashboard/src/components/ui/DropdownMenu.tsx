import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  forwardRef,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error('DropdownMenu components must be used inside <DropdownMenu>');
  return ctx;
}

interface DropdownMenuProps {
  children: ReactNode;
}

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

const DropdownMenuTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ onClick, ...props }, ref) => {
    const { setOpen, open, triggerRef } = useDropdownContext();

    function handleRef(el: HTMLButtonElement | null) {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    }

    return (
      <button
        ref={handleRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          setOpen(!open);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end' | 'center';
}

function DropdownMenuContent({ className, align = 'start', children, ...props }: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdownContext();
  const contentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const GAP = 4;
      let left = rect.left;
      if (align === 'end') left = rect.right;
      else if (align === 'center') left = rect.left + rect.width / 2;
      setPosition({ top: rect.bottom + GAP, left, width: rect.width });
    }
  }, [open, align, triggerRef]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen, triggerRef]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, setOpen]);

  if (!open) return null;

  const alignStyle: React.CSSProperties = (() => {
    switch (align) {
      case 'end':
        return { top: position.top, right: window.innerWidth - position.left, minWidth: position.width };
      case 'center':
        return { top: position.top, left: position.left, transform: 'translateX(-50%)', minWidth: position.width };
      default:
        return { top: position.top, left: position.left, minWidth: position.width };
    }
  })();

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        'fixed z-50 bg-bg-card border border-border-subtle rounded-sm py-1 shadow-lg min-w-[160px]',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        className
      )}
      style={alignStyle}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onSelect?: () => void;
}

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, onClick, onSelect, ...props }, ref) => {
    const { setOpen } = useDropdownContext();
    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        onClick={(e) => {
          onSelect?.();
          setOpen(false);
          onClick?.(e);
        }}
        className={cn(
          'w-full text-left px-3 py-2 text-sm font-body text-text-primary cursor-pointer',
          'hover:bg-bg-elevated transition-colors duration-100',
          'focus-visible:outline-none focus-visible:bg-bg-elevated',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn('my-1 h-px bg-border-subtle mx-1', className)}
      {...props}
    />
  )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
export type { DropdownMenuProps, DropdownMenuContentProps, DropdownMenuItemProps };
