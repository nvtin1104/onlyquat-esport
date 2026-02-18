import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_DELAY = 3000;

const variantStyles: Record<ToastVariant, { container: string; icon: ReactNode }> = {
  success: {
    container: 'border-success/30 bg-success/10',
    icon: <CheckCircle className="w-4 h-4 text-success shrink-0" />,
  },
  error: {
    container: 'border-danger/30 bg-danger/10',
    icon: <XCircle className="w-4 h-4 text-danger shrink-0" />,
  },
  info: {
    container: 'border-info/30 bg-info/10',
    icon: <Info className="w-4 h-4 text-info shrink-0" />,
  },
};

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => dismiss(id), DISMISS_DELAY);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          aria-atomic="false"
          className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((t) => {
            const style = variantStyles[t.variant];
            return (
              <div
                key={t.id}
                role="alert"
                className={cn(
                  'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-sm',
                  'border bg-bg-card shadow-lg min-w-[260px] max-w-[380px]',
                  'animate-in slide-in-from-bottom-2 fade-in-0 duration-200',
                  style.container
                )}
              >
                {style.icon}
                <span className="font-body text-sm text-text-primary flex-1">{t.message}</span>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="text-text-dim hover:text-text-primary transition-colors duration-150 shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export { ToastProvider, useToast };
export type { ToastVariant, ToastItem };
