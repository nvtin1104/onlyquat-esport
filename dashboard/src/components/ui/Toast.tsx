import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore, type ToastType } from '@/stores/toastStore';
import { cn } from '@/lib/utils';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-info" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
};

const bgClasses: Record<ToastType, string> = {
  success: 'border-success/30 bg-bg-elevated/90 after:bg-success',
  error: 'border-danger/30 bg-bg-elevated/90 after:bg-danger',
  info: 'border-info/30 bg-bg-elevated/90 after:bg-info',
  warning: 'border-warning/30 bg-bg-elevated/90 after:bg-warning',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-[380px]">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto relative overflow-hidden rounded-sm border p-4 shadow-2xl backdrop-blur-md",
              "flex items-start gap-3 transition-all",
              "after:absolute after:left-0 after:top-0 after:h-full after:w-[3px]",
              bgClasses[toast.type]
            )}
          >
            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm font-medium text-text-primary leading-tight">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="mt-0.5 shrink-0 text-text-dim hover:text-text-primary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
