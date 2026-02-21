import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { updateRoleSchema, type UpdateRoleFormValues } from '@/lib/schemas/user.schema';
import type { AdminUser, UserRole } from '@/types/admin';

const ALL_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'ROOT', label: 'Root', description: 'Toàn quyền hệ thống' },
  { value: 'ADMIN', label: 'Admin', description: 'Quản trị viên' },
  { value: 'STAFF', label: 'Staff', description: 'Nhân viên' },
  { value: 'USER', label: 'User', description: 'Người dùng thường' },
];

interface ChangeRoleDialogProps {
  user: AdminUser | null;
  open: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (userId: string, data: UpdateRoleFormValues) => Promise<void>;
}

export function ChangeRoleDialog({
  user,
  open,
  isLoading,
  onClose,
  onConfirm,
}: ChangeRoleDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { roles: [] },
  });

  const selectedRoles = watch('roles');

  useEffect(() => {
    if (user) reset({ roles: user.role });
    else reset({ roles: [] });
  }, [user, reset]);

  async function onSubmit(data: UpdateRoleFormValues) {
    if (!user) return;
    await onConfirm(user.id, data);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi role người dùng</DialogTitle>
          {user && (
            <DialogDescription>
              Thay đổi role của <strong className="text-text-primary">{user.username}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <div>
                <label className="font-mono text-xs text-text-dim uppercase mb-2 block">
                  Chọn role
                </label>
                <div className="space-y-2">
                  {ALL_ROLES.map((r) => {
                    const checked = field.value.includes(r.value);
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          if (checked) {
                            field.onChange(field.value.filter((v) => v !== r.value));
                          } else {
                            field.onChange([...field.value, r.value]);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-sm border text-left transition-colors',
                          checked
                            ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                            : 'border-border-subtle hover:border-border-hover text-text-secondary',
                        )}
                      >
                        <div>
                          <span className="font-medium text-sm">{r.label}</span>
                          <span className="text-xs text-text-dim ml-2">{r.description}</span>
                        </div>
                        {checked && (
                          <Badge className="bg-accent-acid/10 text-accent-acid border-accent-acid/30 text-[10px]">
                            ✓
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.roles && (
                  <p className="text-danger text-xs mt-1">{errors.roles.message}</p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || selectedRoles.length === 0}
            >
              {isLoading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
