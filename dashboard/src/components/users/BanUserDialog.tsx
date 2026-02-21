import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { banUserSchema, type BanUserFormValues } from '@/lib/schemas/user.schema';
import type { AdminUser } from '@/types/admin';

interface BanUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
}

export function BanUserDialog({
  user,
  open,
  isLoading,
  onClose,
  onConfirm,
}: BanUserDialogProps) {
  const isBanning = user?.status !== 'BANNED';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BanUserFormValues>({
    resolver: isBanning ? zodResolver(banUserSchema) : undefined,
    defaultValues: { reason: '' },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit() {
    if (!user) return;
    await onConfirm(user.id);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBanning ? 'Cấm người dùng' : 'Bỏ cấm người dùng'}
          </DialogTitle>
          {user && (
            <DialogDescription>
              Bạn muốn {isBanning ? 'cấm' : 'bỏ cấm'}{' '}
              <strong className="text-text-primary">{user.username}</strong>?
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isBanning && (
            <div>
              <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
                Lý do cấm
              </label>
              <Textarea
                {...register('reason')}
                placeholder="Nhập lý do cấm người dùng..."
                rows={3}
              />
              {errors.reason && (
                <p className="text-danger text-xs mt-1">{errors.reason.message}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isLoading}
            >
              {isLoading
                ? 'Đang xử lý...'
                : isBanning
                  ? 'Xác nhận cấm'
                  : 'Xác nhận bỏ cấm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
