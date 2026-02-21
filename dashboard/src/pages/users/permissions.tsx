import { useEffect, useState, useMemo } from 'react';
import { Search, Shield, Key, AlertCircle, Loader2, User as UserIcon, CheckCircle2, XCircle, RefreshCcw, Info, Plus, Save, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { useUsersStore } from '@/stores/usersStore';
import { PERMISSION_METADATA, PERMISSION_MODULES } from '@/constants/permissions';
import type { AdminUser } from '@/types/admin';
import { PermissionPicker } from '../permissions/groups';
import { toast } from '@/stores/toastStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/Dialog';

// ── Components ───────────────────────────────────────────────────────────────

function EffectivePermissionList({ permissions }: { permissions: string[] }) {
    const [activeModule, setActiveModule] = useState(PERMISSION_MODULES[0].id);

    const grouped = useMemo(() => {
        return PERMISSION_METADATA.filter((p) => permissions.includes(p.code));
    }, [permissions]);

    const modulePerms = grouped.filter((p) => p.module === activeModule);

    return (
        <div className="flex border border-border-subtle rounded-sm h-[400px] overflow-hidden bg-bg-surface shadow-sm">
            {/* Module List */}
            <div className="w-1/3 border-r border-border-subtle overflow-y-auto bg-bg-base/30">
                {PERMISSION_MODULES.map((m) => {
                    const count = grouped.filter((p) => p.module === m.id).length;
                    return (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setActiveModule(m.id)}
                            className={cn(
                                'w-full px-3 py-2.5 text-left text-xs font-medium transition-all flex items-center justify-between',
                                activeModule === m.id
                                    ? 'bg-accent-acid/10 text-accent-acid border-r-2 border-accent-acid shadow-[inset_-1px_0_0_0_currentColor]'
                                    : 'text-text-dim hover:text-text-primary hover:bg-bg-elevated/50'
                            )}
                        >
                            <span>{m.name}</span>
                            {count > 0 && (
                                <span className="text-[9px] px-1 bg-accent-acid/20 rounded-full font-mono">{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Permissions List */}
            <div className="w-2/3 p-4 overflow-y-auto bg-bg-surface">
                <div className="mb-4">
                    <h4 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-1">Effective Permissions</h4>
                    <p className="text-[10px] text-text-dim italic">Các quyền người dùng thực sự có sau khi gộp từ nhóm và cá nhân.</p>
                </div>

                {modulePerms.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center opacity-30">
                        <Shield className="h-8 w-8 mb-2" />
                        <p className="text-xs">Không có quyền này trong module {PERMISSION_MODULES.find(m => m.id === activeModule)?.name}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {modulePerms.map((p) => (
                            <div key={p.code} className="p-3 border border-border-subtle rounded-sm bg-bg-elevated/30 flex items-start gap-3 border-l-2 border-l-accent-acid/50">
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-accent-acid" />
                                <div>
                                    <p className="text-sm font-medium leading-none text-text-primary">{p.name}</p>
                                    <p className="text-[11px] text-text-dim mt-1">{p.description}</p>
                                    <p className="text-[9px] font-mono opacity-50 mt-1 uppercase tracking-tighter">{p.code}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function UserPermissionsPage() {
    const { users, fetchUsers, isLoading: usersLoading } = useUsersStore();
    const {
        groups,
        userPermissions,
        isLoading: permsLoading,
        isSubmitting,
        error,
        fetchGroups,
        fetchUserPermissions,
        assignGroup,
        removeGroup,
        grantCustom,
        revokeCustom,
        rebuildCache,
        clearError,
    } = usePermissionsStore();

    const [search, setSearch] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // Staged changes
    const [stagedGroupIds, setStagedGroupIds] = useState<string[]>([]);
    const [stagedAdditionalPerms, setStagedAdditionalPerms] = useState<string[]>([]);
    const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);

    useEffect(() => {
        fetchGroups(true);
        fetchUsers();
    }, [fetchGroups, fetchUsers]);

    // Update staged changes when userPermissions changes from store
    useEffect(() => {
        if (userPermissions && userPermissions.userId === selectedUserId) {
            setStagedGroupIds(userPermissions.groups.map(g => g.id));
            setStagedAdditionalPerms(userPermissions.additionalPermissions);
        }
    }, [userPermissions, selectedUserId]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        fetchUsers({ search: val });
    };

    const handleSelectUser = (user: AdminUser) => {
        setSelectedUserId(user.id);
        fetchUserPermissions(user.id);
    };

    const handleToggleGroup = (groupId: string) => {
        setStagedGroupIds(prev =>
            prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
        );
    };

    const handleRevokeStaged = (code: string) => {
        setStagedAdditionalPerms(prev => prev.filter(p => p !== code));
    };

    const handleAddOverrides = (codes: string[]) => {
        setStagedAdditionalPerms(codes);
    };

    const handleReset = () => {
        if (userPermissions) {
            setStagedGroupIds(userPermissions.groups.map(g => g.id));
            setStagedAdditionalPerms(userPermissions.additionalPermissions);
        }
    };

    const hasChanges = useMemo(() => {
        if (!userPermissions) return false;
        const currentGroups = userPermissions.groups.map(g => g.id).sort().join(',');
        const newGroups = [...stagedGroupIds].sort().join(',');
        const currentPerms = [...userPermissions.additionalPermissions].sort().join(',');
        const newPerms = [...stagedAdditionalPerms].sort().join(',');

        return currentGroups !== newGroups || currentPerms !== newPerms;
    }, [userPermissions, stagedGroupIds, stagedAdditionalPerms]);

    const handleSave = async () => {
        if (!selectedUserId || !userPermissions) return;

        try {
            // 1. Handle Groups
            const currentGroupIds = userPermissions.groups.map(g => g.id);
            const toAdd = stagedGroupIds.filter(id => !currentGroupIds.includes(id));
            const toRemove = currentGroupIds.filter(id => !stagedGroupIds.includes(id));

            for (const gid of toAdd) await assignGroup(selectedUserId, gid);
            for (const gid of toRemove) await removeGroup(selectedUserId, gid);

            // 2. Handle Additional Permissions
            const currentPerms = userPermissions.additionalPermissions;
            const permsToAdd = stagedAdditionalPerms.filter(p => !currentPerms.includes(p));
            const permsToRemove = currentPerms.filter(p => !stagedAdditionalPerms.includes(p));

            for (const p of permsToAdd) await grantCustom(selectedUserId, p);
            for (const p of permsToRemove) await revokeCustom(selectedUserId, p);

            // 3. Rebuild Cache
            await rebuildCache(selectedUserId);
            toast.success('Cập nhật quyền hạn thành công!');
        } catch (err) {
            // Store handles error
        }
    };

    const effectivePermissions = useMemo(() => {
        // Calculate effective permissions from staged state
        const fromGroups = groups
            .filter(g => stagedGroupIds.includes(g.id))
            .flatMap(g => g.permissions);

        return Array.from(new Set([...fromGroups, ...stagedAdditionalPerms]));
    }, [groups, stagedGroupIds, stagedAdditionalPerms]);

    const selectedUser = users.find(u => u.id === selectedUserId);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Phân quyền người dùng"
                description="Quản lý chi tiết quyền hạn, nhóm quyền và ghi đè quyền cho từng thành viên"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: User Selection */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-bg-surface border border-border-subtle rounded-sm p-4 h-full">
                        <h3 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-4">CHỌN NGƯỜI DÙNG</h3>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-dim" />
                            <input
                                type="text"
                                placeholder="Tìm username hoặc email..."
                                value={search}
                                onChange={handleSearchChange}
                                className="w-full bg-bg-elevated border border-border-subtle rounded-sm pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-accent-acid transition-colors"
                            />
                        </div>

                        <div className="space-y-1 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
                            {usersLoading && <div className="text-center py-4 opacity-50"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>}

                            {!usersLoading && users.length === 0 && (
                                <div className="text-center py-8 opacity-40">
                                    <UserIcon className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-xs">Không tìm thấy user</p>
                                </div>
                            )}

                            {users.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelectUser(user)}
                                    className={cn(
                                        'w-full px-3 py-2.5 border rounded-sm text-left transition-all flex items-center gap-3',
                                        selectedUserId === user.id
                                            ? 'border-accent-acid bg-accent-acid/10 shadow-sm'
                                            : 'border-transparent hover:bg-bg-elevated'
                                    )}
                                >
                                    <Avatar alt={user.username || 'user'} fallback={user.username || '?'} size="sm" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate text-text-primary">{user.username}</p>
                                        <p className="text-[10px] text-text-dim truncate">{user.email}</p>
                                    </div>
                                    {selectedUserId === user.id && <div className="ml-auto w-1 h-4 bg-accent-acid rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Permission Details */}
                <div className="lg:col-span-8 space-y-6">
                    {(!selectedUserId || !userPermissions) ? (
                        <div className="bg-bg-surface border border-border-subtle rounded-sm border-dashed p-12 text-center h-[600px] flex flex-col items-center justify-center opacity-50">
                            <Key className="h-12 w-12 mb-4 text-text-dim" />
                            <h2 className="text-lg font-medium">Chưa chọn người dùng</h2>
                            <p className="text-sm max-w-xs mx-auto mt-2">Hãy chọn một tài khoản từ danh sách bên trái để bắt đầu quản lý quyền hạn.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2 rounded-sm flex items-center justify-between">
                                    <span className="text-xs font-medium">{error}</span>
                                    <button onClick={clearError} className="text-xs opacity-70 hover:opacity-100">✕</button>
                                </div>
                            )}

                            {/* User Header */}
                            <div className="bg-bg-surface border border-border-subtle rounded-sm p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Avatar alt={selectedUser?.username || 'user'} fallback={selectedUser?.username || '?'} size="lg" />
                                    <div>
                                        <h2 className="text-xl font-bold text-text-primary leading-none">{selectedUser?.username}</h2>
                                        <div className="flex gap-2 mt-1.5">
                                            <Badge className="bg-bg-elevated border-border-subtle text-[10px] h-4">{selectedUser?.id.split('-')[0]}</Badge>
                                            <Badge className="bg-accent-acid/10 text-accent-acid border-accent-acid/20 text-[10px] h-4">{selectedUser?.role.join(', ')}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {hasChanges && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={handleReset} disabled={isSubmitting}>
                                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                Hủy
                                            </Button>
                                            <Button variant="primary" size="sm" onClick={handleSave} disabled={isSubmitting}>
                                                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                                Lưu thay đổi
                                            </Button>
                                        </>
                                    )}
                                    {!hasChanges && (
                                        <Button variant="outline" size="sm" onClick={() => rebuildCache(selectedUserId)} disabled={isSubmitting}>
                                            <RefreshCcw className={cn("h-3.5 w-3.5 mr-2", isSubmitting && "animate-spin")} />
                                            Làm mới Cache
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Groups Panel */}
                                <div className="bg-bg-surface border border-border-subtle rounded-sm p-4">
                                    <h3 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-4 flex items-center justify-between">
                                        NHÓM QUYỀN ĐÃ GÁN
                                        <Info className="h-3 w-3 opacity-50 cursor-help" />
                                    </h3>

                                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                        {groups.map((group) => {
                                            const isAssigned = stagedGroupIds.includes(group.id);
                                            return (
                                                <div
                                                    key={group.id}
                                                    className={cn(
                                                        'p-3 border rounded-sm flex items-center justify-between transition-colors',
                                                        isAssigned ? 'border-accent-acid/30 bg-accent-acid/5' : 'border-border-subtle grayscale opacity-60'
                                                    )}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium">{group.name}</p>
                                                        <p className="text-[10px] text-text-dim">{group.permissions.length} quyền hạn</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleGroup(group.id)}
                                                        className={cn(
                                                            'p-2 rounded-sm transition-all',
                                                            isAssigned
                                                                ? 'text-danger hover:bg-danger/10'
                                                                : 'text-accent-acid hover:bg-accent-acid/10'
                                                        )}
                                                    >
                                                        {isAssigned ? <XCircle className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Additional Permissions (Overrides) */}
                                <div className="bg-bg-base/30 border border-border-subtle rounded-sm p-4">
                                    <h3 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-4 flex items-center justify-between">
                                        QUYỀN HẠN CÁ NHÂN (OVERRIDES)
                                        <Shield className="h-3 w-3 opacity-50" />
                                    </h3>

                                    <div className="flex flex-wrap gap-1.5 min-h-[100px] content-start mb-4">
                                        {stagedAdditionalPerms.length === 0 && (
                                            <p className="text-[10px] text-text-dim italic text-center w-full mt-6 opacity-50">Chưa có quyền cá nhân.</p>
                                        )}
                                        {stagedAdditionalPerms.map((code) => {
                                            const meta = PERMISSION_METADATA.find(p => p.code === code);
                                            return (
                                                <Badge
                                                    key={code}
                                                    className="bg-bg-elevated border-border-subtle pl-2 pr-1 h-6 flex items-center gap-1 group"
                                                >
                                                    <span className="text-[10px] font-medium">{meta?.name || code}</span>
                                                    <button
                                                        onClick={() => handleRevokeStaged(code)}
                                                        className="text-text-dim hover:text-danger p-0.5 rounded-full hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all font-bold text-[8px]"
                                                    >
                                                        ✕
                                                    </button>
                                                </Badge>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full border-dashed text-[10px]"
                                        onClick={() => setIsOverrideDialogOpen(true)}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Thêm quyền ghi đè
                                    </Button>
                                </div>
                            </div>

                            {/* Effective View */}
                            <div className="space-y-2">
                                <EffectivePermissionList permissions={effectivePermissions} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Override Selection Dialog */}
            <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thêm quyền ghi đè (Overrides)</DialogTitle>
                        <DialogDescription>
                            Chọn các quyền cụ thể để gán riêng cho người dùng này. Các quyền này sẽ được cộng dồn với quyền từ các nhóm đã gán.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <PermissionPicker
                            selected={stagedAdditionalPerms}
                            onChange={handleAddOverrides}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="primary" size="sm" onClick={() => setIsOverrideDialogOpen(false)}>
                            Xong
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
