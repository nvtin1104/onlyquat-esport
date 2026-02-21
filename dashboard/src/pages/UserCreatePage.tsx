import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { createUserSchema, type CreateUserFormValues } from '@/lib/schemas/user.schema';
import { useUsersStore } from '@/stores/usersStore';
import type { UserRole } from '@/types/admin';

const ALL_ROLES: { value: UserRole; label: string; hint: string }[] = [
    { value: 'ROOT', label: 'Root', hint: 'Toàn quyền hệ thống' },
    { value: 'ADMIN', label: 'Admin', hint: 'Quản trị viên' },
    { value: 'STAFF', label: 'Staff', hint: 'Nhân viên' },
    { value: 'USER', label: 'User', hint: 'Người dùng thường' },
];

function FormField({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                {label}
                {required && <span className="text-danger ml-1">*</span>}
            </label>
            {children}
            {error && <p className="text-danger text-xs">{error}</p>}
        </div>
    );
}

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

export function UserCreatePage() {
    const navigate = useNavigate();
    const { createUser, isSubmitting, error, clearError } = useUsersStore();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            confirmPassword: '',
            name: '',
            roles: ['USER'],
            accountType: 1,
        },
    });

    async function onSubmit(data: CreateUserFormValues) {
        clearError();
        try {
            const user = await createUser(data);
            navigate(`/users/${user.id}`);
        } catch {
            // error đã set trong store
        }
    }

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/users')}
                    className="text-text-dim hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <PageHeader title="Tạo người dùng" description="Thêm tài khoản người dùng mới" />
            </div>

            <div className="max-w-xl">
                <div className="bg-bg-surface border border-border-subtle rounded-sm p-6">
                    {error && (
                        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <FormField label="Email" required error={errors.email?.message}>
                            <input
                                type="email"
                                className={inputClass}
                                placeholder="user@example.com"
                                {...register('email')}
                            />
                        </FormField>

                        {/* Username */}
                        <FormField label="Username" required error={errors.username?.message}>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="john_doe"
                                {...register('username')}
                            />
                        </FormField>

                        {/* Display name */}
                        <FormField label="Tên hiển thị" error={errors.name?.message}>
                            <input
                                type="text"
                                className={inputClass}
                                placeholder="Nguyễn Văn A"
                                {...register('name')}
                            />
                        </FormField>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField label="Mật khẩu" required error={errors.password?.message}>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="••••••••"
                                    {...register('password')}
                                />
                            </FormField>
                            <FormField label="Xác nhận MK" required error={errors.confirmPassword?.message}>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="••••••••"
                                    {...register('confirmPassword')}
                                />
                            </FormField>
                        </div>

                        {/* Roles */}
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <FormField label="Role" required error={errors.roles?.message}>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_ROLES.map((r) => {
                                            const checked = field.value.includes(r.value);
                                            return (
                                                <button
                                                    key={r.value}
                                                    type="button"
                                                    onClick={() =>
                                                        checked
                                                            ? field.onChange(field.value.filter((v) => v !== r.value))
                                                            : field.onChange([...field.value, r.value])
                                                    }
                                                    className={cn(
                                                        'flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors',
                                                        checked
                                                            ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                                                            : 'border-border-subtle hover:border-border-hover text-text-secondary',
                                                    )}
                                                >
                                                    <span className="text-sm font-medium">{r.label}</span>
                                                    <span className="text-[11px] text-text-dim">{r.hint}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </FormField>
                            )}
                        />

                        {/* Account type */}
                        <Controller
                            name="accountType"
                            control={control}
                            render={({ field }) => (
                                <FormField label="Loại tài khoản" required>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 1 as const, label: 'Public', hint: 'Tài khoản người dùng thường' },
                                            { value: 0 as const, label: 'Admin', hint: 'Tài khoản quản trị (accountType=0)' },
                                        ].map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => field.onChange(opt.value)}
                                                className={cn(
                                                    'flex-1 flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors',
                                                    field.value === opt.value
                                                        ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                                                        : 'border-border-subtle hover:border-border-hover text-text-secondary',
                                                )}
                                            >
                                                <span className="text-sm font-medium">{opt.label}</span>
                                                <span className="text-[11px] text-text-dim">{opt.hint}</span>
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            )}
                        />

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/users')}
                            >
                                Huỷ
                            </Button>
                            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Đang tạo...
                                    </span>
                                ) : (
                                    'Tạo người dùng'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
