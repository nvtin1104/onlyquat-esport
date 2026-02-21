import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Shield } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChangeRoleDialog } from './components/ChangeRoleDialog';
import { BanUserDialog } from './components/BanUserDialog';
import { useUsersStore } from '@/stores/usersStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { UserRole, UserStatus, AdminUser } from '@/types/admin';
import type { UpdateRoleFormValues } from '@/lib/schemas/user.schema';

const ROLE_LABEL: Record<UserRole, string> = {
    ROOT: 'Root', ADMIN: 'Admin', STAFF: 'Staff', USER: 'User',
};
const ROLE_CLASS: Record<UserRole, string> = {
    ROOT: 'bg-danger/10 text-danger border-danger/30',
    ADMIN: 'bg-accent-acid/10 text-accent-acid border-accent-acid/30',
    STAFF: 'bg-info/10 text-info border-info/30',
    USER: 'bg-bg-elevated text-text-dim border-border-subtle',
};
const STATUS_CLASS: Record<UserStatus, string> = {
    ACTIVE: 'text-success', UNACTIVE: 'text-text-dim', BANNED: 'text-danger',
};
const STATUS_LABEL: Record<UserStatus, string> = {
    ACTIVE: 'Hoạt động', UNACTIVE: 'Chưa kích hoạt', BANNED: 'Bị cấm',
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-border-subtle last:border-0">
            <span className="text-xs text-text-dim font-mono uppercase tracking-wide">{label}</span>
            <div className="text-right">{children}</div>
        </div>
    );
}

export function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { selectedUser: user, isLoading, isSubmitting, error, fetchUserById, updateRole, toggleBan, clearSelectedUser } =
        useUsersStore();

    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [banDialogOpen, setBanDialogOpen] = useState(false);

    useEffect(() => {
        if (id) fetchUserById(id);
        return () => clearSelectedUser();
    }, [id]);

    async function handleUpdateRole(userId: string, data: UpdateRoleFormValues) {
        await updateRole(userId, data);
        setRoleDialogOpen(false);
    }

    async function handleBan(userId: string) {
        await toggleBan(userId);
        setBanDialogOpen(false);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle className="w-8 h-8 text-danger" />
                <p className="text-text-secondary">{error ?? 'Không tìm thấy người dùng'}</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    type="button"
                    onClick={() => navigate('/users')}
                    className="text-text-dim hover:text-text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <PageHeader
                    title="Chi tiết người dùng"
                    description={`ID: ${user.id}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <div className="lg:col-span-1 bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col items-center text-center gap-3">
                    <Avatar alt={user.username} fallback={user.username} size="lg" />
                    <div>
                        <p className="font-semibold text-text-primary text-lg">{user.username}</p>
                        {user.name && <p className="text-text-secondary text-sm">{user.name}</p>}
                        <p className="text-text-dim text-xs mt-1">{user.email}</p>
                    </div>

                    {/* Status */}
                    <span className={cn('flex items-center gap-1.5 font-mono text-[11px] uppercase', STATUS_CLASS[user.status])}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {STATUS_LABEL[user.status]}
                    </span>

                    {/* Roles */}
                    <div className="flex flex-wrap gap-1 justify-center">
                        {user.role.map((r) => (
                            <Badge key={r} className={ROLE_CLASS[r]}>{ROLE_LABEL[r]}</Badge>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-2 mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setRoleDialogOpen(true)}
                        >
                            Đổi role
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-accent-acid hover:bg-accent-acid/10 border-accent-acid/30"
                            onClick={() => navigate(`/users/${user.id}/permissions`)}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Phân quyền
                        </Button>
                        <Button
                            variant={user.status === 'BANNED' ? 'outline' : 'destructive'}
                            size="sm"
                            className="w-full"
                            onClick={() => setBanDialogOpen(true)}
                        >
                            {user.status === 'BANNED' ? 'Bỏ cấm' : 'Cấm người dùng'}
                        </Button>
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6">
                    <p className="font-mono text-xs text-text-dim uppercase tracking-wide mb-4">Thông tin tài khoản</p>

                    <DetailRow label="ID">
                        <span className="font-mono text-xs text-text-secondary break-all">{user.id}</span>
                    </DetailRow>
                    <DetailRow label="Email">
                        <span className="text-sm text-text-primary">{user.email}</span>
                    </DetailRow>
                    <DetailRow label="Username">
                        <span className="text-sm text-text-primary">{user.username}</span>
                    </DetailRow>
                    <DetailRow label="Tên hiển thị">
                        <span className="text-sm text-text-secondary">{user.name ?? '—'}</span>
                    </DetailRow>
                    <DetailRow label="Loại tài khoản">
                        <span className="text-sm text-text-secondary">
                            {user.accountType === 0 ? 'Admin (0)' : 'Public (1)'}
                        </span>
                    </DetailRow>
                    <DetailRow label="Trạng thái">
                        <span className={cn('text-sm font-medium', STATUS_CLASS[user.status])}>
                            {STATUS_LABEL[user.status]}
                        </span>
                    </DetailRow>
                    <DetailRow label="Ngày tạo">
                        <span className="text-xs text-text-dim">
                            {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                    </DetailRow>
                    <DetailRow label="Cập nhật">
                        <span className="text-xs text-text-dim">
                            {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm')}
                        </span>
                    </DetailRow>
                </div>
            </div>

            {/* Dialogs */}
            <ChangeRoleDialog
                user={user}
                open={roleDialogOpen}
                isLoading={isSubmitting}
                onClose={() => setRoleDialogOpen(false)}
                onConfirm={handleUpdateRole}
            />
            <BanUserDialog
                user={user}
                open={banDialogOpen}
                isLoading={isSubmitting}
                onClose={() => setBanDialogOpen(false)}
                onConfirm={handleBan}
            />
        </div>
    );
}
