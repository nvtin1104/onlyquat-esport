import { useEffect, useState } from 'react';
import { Shield, PlusCircle, MoreHorizontal, AlertCircle, Loader2, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { PERMISSION_METADATA, PERMISSION_MODULES } from '@/constants/permissions';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { groupPermissionSchema, type GroupPermissionFormValues } from '@/lib/schemas/permission.schema';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { GroupPermission } from '@/types/permissions';

// ── Components ───────────────────────────────────────────────────────────────

function PermissionPicker({
    selected,
    onChange,
}: {
    selected: string[];
    onChange: (codes: string[]) => void;
}) {
    const [activeModule, setActiveModule] = useState(PERMISSION_MODULES[0].id);

    const toggleCode = (code: string) => {
        if (selected.includes(code)) {
            onChange(selected.filter((c) => c !== code));
        } else {
            onChange([...selected, code]);
        }
    };

    const currentModulePerms = PERMISSION_METADATA.filter((p) => p.module === activeModule);

    return (
        <div className="flex border border-border-subtle rounded-sm h-[320px] overflow-hidden bg-bg-elevated">
            {/* Module List */}
            <div className="w-1/3 border-r border-border-subtle overflow-y-auto bg-bg-base/50">
                {PERMISSION_MODULES.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => setActiveModule(m.id)}
                        className={cn(
                            'w-full px-3 py-2 text-left text-xs font-medium transition-colors',
                            activeModule === m.id
                                ? 'bg-accent-acid/10 text-accent-acid border-r-2 border-accent-acid'
                                : 'text-text-dim hover:text-text-primary hover:bg-bg-elevated'
                        )}
                    >
                        {m.name}
                        <span className="ml-2 text-[10px] opacity-70">
                            ({PERMISSION_METADATA.filter((p) => p.module === m.id && selected.includes(p.code)).length})
                        </span>
                    </button>
                ))}
            </div>

            {/* Permissions Checkbox List */}
            <div className="w-2/3 p-3 overflow-y-auto space-y-2">
                {currentModulePerms.map((p) => (
                    <label
                        key={p.code}
                        className={cn(
                            'flex items-start gap-3 p-2 rounded-sm border cursor-pointer transition-colors group',
                            selected.includes(p.code)
                                ? 'border-accent-acid/30 bg-accent-acid/5 text-text-primary'
                                : 'border-transparent hover:bg-bg-base/50 text-text-secondary'
                        )}
                    >
                        <input
                            type="checkbox"
                            className="mt-1 accent-accent-acid"
                            checked={selected.includes(p.code)}
                            onChange={() => toggleCode(p.code)}
                        />
                        <div>
                            <p className="text-sm font-medium leading-none">{p.name}</p>
                            <p className="text-[10px] text-text-dim mt-1">{p.description}</p>
                            <p className="text-[9px] font-mono opacity-50 mt-0.5">{p.code}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function PermissionGroupsPage() {
    const { groups, isLoading, isSubmitting, error, fetchGroups, createGroup, updateGroup, deleteGroup, clearError } = usePermissionsStore();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupPermission | null>(null);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<GroupPermissionFormValues>({
        resolver: zodResolver(groupPermissionSchema),
        defaultValues: {
            name: '',
            description: '',
            permissions: [],
            isActive: true,
        },
    });

    const handleOpenCreate = () => {
        setEditingGroup(null);
        reset({ name: '', description: '', permissions: [], isActive: true });
        setDialogOpen(true);
    };

    const handleOpenEdit = (group: GroupPermission) => {
        setEditingGroup(group);
        reset({
            name: group.name,
            description: group.description || '',
            permissions: group.permissions,
            isActive: group.isActive,
        });
        setDialogOpen(true);
    };

    const onSubmit = async (data: GroupPermissionFormValues) => {
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, data);
            } else {
                await createGroup(data);
            }
            setDialogOpen(false);
        } catch {
            // Error handled by store
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc chắn muốn xoá nhóm quyền này?')) {
            try {
                await deleteGroup(id);
            } catch (err: any) {
                alert(err.message);
            }
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản lý nhóm quyền"
                description="Định nghĩa các tập hợp quyền hạn (Role/Group) cho hệ thống"
                actions={
                    <Button variant="primary" size="sm" onClick={handleOpenCreate}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tạo nhóm mới
                    </Button>
                }
            />

            {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                    <button onClick={clearError} className="text-danger/70 hover:text-danger text-xs">✕</button>
                </div>
            )}

            {isLoading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-acid opacity-50" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className={cn(
                                'bg-bg-surface border border-border-subtle rounded-sm p-4 hover:border-border-hover transition-all flex flex-col',
                                !group.isActive && 'opacity-60 grayscale-[0.5]'
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-bg-elevated rounded-sm text-accent-acid border border-border-subtle">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text-primary text-sm tracking-tight">{group.name}</h3>
                                        <div className="flex gap-1 mt-0.5">
                                            {group.isSystem && <Badge variant="info" className="text-[9px] px-1 h-3.5 uppercase">Hệ thống</Badge>}
                                            {!group.isActive && <Badge variant="danger" className="text-[9px] px-1 h-3.5 uppercase">Disabled</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(group)}
                                        className="p-1.5 text-text-dim hover:text-text-primary hover:bg-bg-elevated rounded-sm transition-colors"
                                    >
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    {!group.isSystem && (
                                        <button
                                            onClick={() => handleDelete(group.id)}
                                            className="p-1.5 text-text-dim hover:text-danger hover:bg-danger/5 rounded-sm transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-text-secondary line-clamp-2 min-h-[32px] mb-4">
                                {group.description || 'Không có mô tả.'}
                            </p>

                            <div className="mt-auto pt-4 border-t border-border-subtle/50 flex items-center justify-between text-[10px] text-text-dim font-mono">
                                <span>{group.permissions.length} QUYỀN HẠN</span>
                                <span>ID: {group.id.split('-')[0]}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? 'Chỉnh sửa nhóm quyền' : 'Tạo nhóm quyền mới'}</DialogTitle>
                        <DialogDescription>
                            {editingGroup ? 'Cập nhật tên, mô tả và danh sách quyền hạn cho nhóm này.' : 'Định nghĩa một nhóm quyền hạn mới để gán cho người dùng.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit) as any} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase text-text-dim tracking-wider">Tên nhóm</label>
                                <Input
                                    {...register('name')}
                                    placeholder="Ví dụ: Moderator Giải Đấu"
                                    className={errors.name ? 'border-danger' : ''}
                                />
                                {errors.name && <p className="text-[10px] text-danger mt-1">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-mono uppercase text-text-dim tracking-wider">Trạng thái</label>
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center gap-2 h-10 border border-border-subtle rounded-sm px-3 bg-bg-elevated cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center transition-colors', field.value ? 'bg-accent-acid border-accent-acid' : 'bg-transparent border-border-subtle')}>
                                                {field.value && <CheckCircle2 className="w-3 h-3 text-bg-base" />}
                                            </div>
                                            <span className="text-sm font-medium">{field.value ? 'Đang hoạt động' : 'Đang tạm khoá'}</span>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase text-text-dim tracking-wider">Mô tả</label>
                            <Textarea
                                {...register('description')}
                                placeholder="Mô tả chức năng của nhóm quyền này..."
                                rows={2}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-mono uppercase text-text-dim tracking-wider">Chọn quyền hạn</label>
                                <Controller
                                    name="permissions"
                                    control={control}
                                    render={({ field }) => (
                                        <span className="text-[10px] font-mono text-accent-acid">Đã chọn {field.value.length}</span>
                                    )}
                                />
                            </div>
                            <Controller
                                name="permissions"
                                control={control}
                                render={({ field }) => (
                                    <PermissionPicker selected={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.permissions && <p className="text-[10px] text-danger mt-1">{errors.permissions.message}</p>}
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                                Huỷ
                            </Button>
                            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Đang lưu...
                                    </span>
                                ) : (
                                    editingGroup ? 'Cập nhật' : 'Tạo nhóm'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
