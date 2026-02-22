import { useState, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { updateRoleSchema, type UpdateRoleFormValues, PUBLIC_ROLES, ADMIN_ROLES } from '@/lib/schemas/user.schema';
import type { AdminUser } from '@/types/admin';

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
  // Detect initial account type from user's current roles
  const detectAccountType = (roles: string[]): 0 | 1 => {
    const adminRoles = ['ROOT', 'ADMIN', 'STAFF'];
    return roles.some((r) => adminRoles.includes(r)) ? 0 : 1;
  };

  const [accountType, setAccountType] = useState<0 | 1>(1);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: { roles: [] },
  });

  const selectedRoles = useWatch({ control, name: 'roles' });

  useEffect(() => {
    if (user) {
      const type = detectAccountType(user.role);
      setAccountType(type);
      reset({ roles: user.role });
    } else {
      setAccountType(1);
      reset({ roles: [] });
    }
  }, [user, reset]);

  function handleAccountTypeChange(type: 0 | 1) {
    setAccountType(type);
    // Reset roles to sensible defaults when switching type
    setValue('roles', type === 1 ? ['USER'] : ['STAFF']);
  }

  async function onSubmit(data: UpdateRoleFormValues) {
    if (!user) return;
    await onConfirm(user.id, data);
  }

  const availableRoles = accountType === 0 ? ADMIN_ROLES : PUBLIC_ROLES;
  const isAdminType = accountType === 0;

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
          {/* Account Type selector — first */}
          <div>
            <label className="font-mono text-xs text-text-dim uppercase mb-2 block">
              Loại tài khoản
            </label>
            <div className="flex gap-3">
              {([
                { value: 1 as const, label: 'Public', hint: 'Người dùng / tuyển thủ / tổ chức...' },
                { value: 0 as const, label: 'Admin', hint: 'Quản trị nội bộ hệ thống' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAccountTypeChange(opt.value)}
                  className={cn(
                    'flex-1 flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors cursor-pointer',
                    accountType === opt.value
                      ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                      : 'border-border-subtle hover:border-border-hover text-text-secondary',
                  )}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-[11px] text-text-dim">{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Role selector — changes based on account type */}
          <Controller
            name="roles"
            control={control}
            render={({ field }) => (
              <div>
                <label className="font-mono text-xs text-text-dim uppercase mb-2 block">
                  Chọn role
                  {isAdminType && (
                    <span className="normal-case ml-2 text-text-dim italic font-normal">(chỉ chọn 1)</span>
                  )}
                </label>
                <div className="space-y-2">
                  {availableRoles.map((r) => {
                    const checked = field.value.includes(r.value);
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => {
                          if (isAdminType) {
                            field.onChange([r.value]);
                          } else {
                            checked
                              ? field.onChange(field.value.filter((v) => v !== r.value))
                              : field.onChange([...field.value, r.value]);
                          }
                        }}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-sm border text-left transition-colors cursor-pointer',
                          checked
                            ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                            : 'border-border-subtle hover:border-border-hover text-text-secondary',
                        )}
                      >
                        <div>
                          <span className="font-medium text-sm">{r.label}</span>
                          <span className="text-xs text-text-dim ml-2">{r.hint}</span>
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
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading || selectedRoles.length === 0}
              className="cursor-pointer"
            >
              {isLoading ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
