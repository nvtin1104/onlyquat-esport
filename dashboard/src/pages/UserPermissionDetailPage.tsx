import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Key, AlertCircle, Loader2, ArrowLeft, RefreshCcw, Info, Plus, XCircle, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import { usePermissionsStore } from '@/stores/permissionsStore';
import { useUsersStore } from '@/stores/usersStore';
import { PERMISSION_METADATA, PERMISSION_MODULES } from '@/constants/permissions';

// ── Components ───────────────────────────────────────────────────────────────

function EffectivePermissionList({ permissions }: { permissions: string[] }) {
    const [activeModule, setActiveModule] = useState(PERMISSION_MODULES[0].id);

    const grouped = useMemo(() => {
        return PERMISSION_METADATA.filter((p) => permissions.includes(p.code));
    }, [permissions]);

    const modulePerms = grouped.filter((p) => p.module === activeModule);

    return (
        <div className="flex border border-border-subtle rounded-sm h-[400px] overflow-hidden bg-bg-surface shadow-sm">
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
                                    ? 'bg-accent-acid/10 text-accent-acid border-r-2 border-accent-acid'
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

            <div className="w-2/3 p-4 overflow-y-auto bg-bg-surface">
                <div className="mb-4">
                    <h4 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-1">Effective Permissions</h4>
                </div>

                {modulePerms.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center opacity-30">
                        <Shield className="h-8 w-8 mb-2" />
                        <p className="text-xs">Không có quyền này</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {modulePerms.map((p) => (
                            <div key={p.code} className="p-3 border border-border-subtle rounded-sm bg-bg-elevated/30 flex items-start gap-3 border-l-2 border-l-accent-acid/50">
                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-accent-acid" />
                                <div>
                                    <p className="text-sm font-medium leading-none text-text-primary">{p.name}</p>
                                    <p className="text-[11px] text-text-dim mt-1">{p.description}</p>
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

export function UserPermissionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { users, fetchUsers } = useUsersStore();
    const {
        groups,
        userPermissions,
        isLoading,
        error,
        fetchGroups,
        fetchUserPermissions,
        assignGroup,
        removeGroup,
        revokeCustom,
        rebuildCache,
        clearError,
        clearUserPermissions
    } = usePermissionsStore();

    useEffect(() => {
        if (id) {
            fetchGroups(true);
            fetchUserPermissions(id);
            fetchUsers(); // To get user info (or find in existing)
        }
        return () => clearUserPermissions();
    }, [id, fetchGroups, fetchUserPermissions, fetchUsers, clearUserPermissions]);

    const user = users.find(u => u.id === id);

    if (!id) return null;

    const handleToggleGroup = (groupId: string, isAssigned: boolean) => {
        if (isAssigned) {
            removeGroup(id, groupId);
        } else {
            assignGroup(id, groupId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Button variant="outline" size="sm" className="p-2 h-8 w-8" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-text-dim">Quay lại</span>
            </div>

            <PageHeader
                title={`Chi tiết phân quyền`}
                description={`Quản lý quyền hạn cá nhân và nhóm quyền cho account ${user?.username || id}`}
            />

            {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2 rounded-sm flex items-center justify-between">
                    <span className="text-xs font-medium">{error}</span>
                    <button onClick={clearError} className="text-xs opacity-70 hover:opacity-100">✕</button>
                </div>
            )}

            {isLoading && !userPermissions ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-accent-acid" />
                </div>
            ) : (
                <>
                    {/* User Profile Summary */}
                    <div className="bg-bg-surface border border-border-subtle rounded-sm p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <Avatar alt={user?.username || 'user'} fallback={user?.username || '?'} size="lg" />
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">{user?.username || 'Loading...'}</h2>
                                <div className="flex gap-2 mt-1">
                                    <Badge className="bg-bg-elevated border-border-subtle text-[10px] tracking-tight">{id}</Badge>
                                    <Badge className="bg-accent-acid/10 text-accent-acid border-accent-acid/20 text-[10px]">{user?.role.join(', ')}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => id && rebuildCache(id)}>
                            <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                            Sync Permissions
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Groups Area */}
                        <div className="space-y-4">
                            <div className="bg-bg-surface border border-border-subtle rounded-sm p-4">
                                <h3 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-4 flex items-center justify-between">
                                    QUẢN LÝ NHÓM QUYỀN
                                    <Shield className="h-3 w-3 opacity-30" />
                                </h3>

                                <div className="space-y-2">
                                    {groups.map((group) => {
                                        const isAssigned = userPermissions?.groups.some(g => g.id === group.id);
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
                                                    onClick={() => handleToggleGroup(group.id, !!isAssigned)}
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

                            {/* Custom Overrides Area */}
                            <div className="bg-bg-surface border border-border-subtle rounded-sm p-4">
                                <h3 className="text-[10px] font-mono uppercase text-text-dim tracking-wider mb-4">OVERRIDES HÀNH (CUSTOM)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {userPermissions?.additionalPermissions.length === 0 && (
                                        <p className="text-xs text-text-dim italic">Không có quyền ghi đè cá nhân.</p>
                                    )}
                                    {userPermissions?.additionalPermissions.map((code) => {
                                        const meta = PERMISSION_METADATA.find(p => p.code === code);
                                        return (
                                            <Badge
                                                key={code}
                                                className="bg-accent-acid text-bg-base pl-2 pr-1 h-7 flex items-center gap-2"
                                            >
                                                <span className="text-xs">{meta?.name || code}</span>
                                                <button
                                                    onClick={() => id && revokeCustom(id, code)}
                                                    className="hover:bg-black/20 p-0.5 rounded-full"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Effective Permissions Area */}
                        <div className="space-y-4">
                            <EffectivePermissionList permissions={userPermissions?.effectivePermissions || []} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
