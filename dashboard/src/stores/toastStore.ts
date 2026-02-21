import { toast as sonnerToast } from 'sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export const toast = {
    success: (msg: string, duration?: number) => sonnerToast.success(msg, { duration: duration ?? 3000 }),
    error: (msg: string, duration?: number) => sonnerToast.error(msg, { duration: duration ?? 5000 }),
    info: (msg: string, duration?: number) => sonnerToast.info(msg, { duration: duration ?? 3000 }),
    warning: (msg: string, duration?: number) => sonnerToast.warning(msg, { duration: duration ?? 4000 }),
};
