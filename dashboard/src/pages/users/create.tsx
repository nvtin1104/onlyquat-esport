import { useNavigate } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { createUserSchema, type CreateUserFormValues, PUBLIC_ROLES, ADMIN_ROLES } from '@/lib/schemas/user.schema';
import { useUsersStore } from '@/stores/usersStore';

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
        setValue,
        formState: { errors },
    } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: '',
            username: '',
            password: '',
            name: '',
            roles: ['USER'],
            accountType: 1,
        },
    });

    // Watch accountType to conditionally render different role sets
    const accountType = useWatch({ control, name: 'accountType' });
    const currentRoles = useWatch({ control, name: 'roles' });

    // When account type switches, reset roles to sensible defaults
    function handleAccountTypeChange(type: 0 | 1, onChange: (v: 0 | 1) => void) {
        onChange(type);
        setValue('roles', type === 1 ? ['USER'] : ['STAFF']);
    }

    async function onSubmit(data: CreateUserFormValues) {
        clearError();
        try {
            const user = await createUser(data);
            navigate(`/users/${user.id}`);
        } catch {
            // error đã set trong store
        }
    }

    const availableRoles = accountType === 0 ? ADMIN_ROLES : PUBLIC_ROLES;
    const isAdminType = accountType === 0;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/users')}
                    className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <PageHeader title="Tạo người dùng" description="Thêm tài khoản người dùng mới" />
            </div>

            <div>
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

                        {/* Password — no confirm needed */}
                        <FormField label="Mật khẩu" required error={errors.password?.message}>
                            <input
                                type="password"
                                className={inputClass}
                                placeholder="••••••••"
                                {...register('password')}
                            />
                        </FormField>

                        {/* Account type — FIRST before roles */}
                        <Controller
                            name="accountType"
                            control={control}
                            render={({ field }) => (
                                <FormField label="Loại tài khoản" required>
                                    <div className="flex gap-3">
                                        {([
                                            { value: 1 as const, label: 'Public', hint: 'Người dùng / tuyển thủ / tổ chức...' },
                                            { value: 0 as const, label: 'Admin', hint: 'Quản trị nội bộ hệ thống' },
                                        ] as const).map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleAccountTypeChange(opt.value, field.onChange)}
                                                className={cn(
                                                    'flex-1 flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors cursor-pointer',
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

                        {/* Roles — conditional based on accountType */}
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <FormField
                                    label="Role"
                                    required
                                    error={errors.roles?.message}
                                >
                                    {isAdminType && (
                                        <p className="text-[11px] text-text-dim mb-2 italic">
                                            Tài khoản Admin chỉ được chọn 1 role.
                                        </p>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {availableRoles.map((r) => {
                                            const checked = field.value.includes(r.value);
                                            return (
                                                <button
                                                    key={r.value}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isAdminType) {
                                                            // Admin: single select
                                                            field.onChange([r.value]);
                                                        } else {
                                                            // Public: multi select (toggle)
                                                            checked
                                                                ? field.onChange(field.value.filter((v) => v !== r.value))
                                                                : field.onChange([...field.value, r.value]);
                                                        }
                                                    }}
                                                    className={cn(
                                                        'flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors cursor-pointer',
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

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/users')}
                                className="cursor-pointer"
                            >
                                Huỷ
                            </Button>
                            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting} className="cursor-pointer">
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
