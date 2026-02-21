import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UsersTable } from '@/components/users/UsersTable';
import { ChangeRoleDialog } from '@/components/users/ChangeRoleDialog';
import { BanUserDialog } from '@/components/users/BanUserDialog';
import { useUsersStore } from '@/stores/usersStore';
import type { AdminUser } from '@/types/admin';
import type { UpdateRoleFormValues } from '@/lib/schemas/user.schema';

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả role' },
  { value: 'ROOT', label: 'Root' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'USER', label: 'User' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'UNACTIVE', label: 'Chưa kích hoạt' },
  { value: 'BANNED', label: 'Bị cấm' },
];

export function UsersPage() {
  const navigate = useNavigate();
  const {
    users,
    total,
    page,
    limit,
    isLoading,
    isSubmitting,
    error,
    search,
    roleFilter,
    statusFilter,
    fetchUsers,
    updateRole,
    toggleBan,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    setPage,
    clearError,
  } = useUsersStore();

  const [changeRoleTarget, setChangeRoleTarget] = useState<AdminUser | null>(null);
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);

  // Client-side filtering on top of server data
  const filtered = users
    .filter((u) =>
      search
        ? u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.name ?? '').toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .filter((u) => (roleFilter ? u.role.includes(roleFilter as any) : true))
    .filter((u) => (statusFilter ? u.status === statusFilter : true));

  useEffect(() => {
    fetchUsers({ page, limit });
  }, [page]);

  async function handleUpdateRole(userId: string, data: UpdateRoleFormValues) {
    await updateRole(userId, data);
    setChangeRoleTarget(null);
  }

  async function handleBan(userId: string) {
    await toggleBan(userId);
    setBanTarget(null);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Người dùng"
        description={`Tổng cộng ${total} người dùng`}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/users/create')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo người dùng
          </Button>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-danger/70 hover:text-danger text-xs ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          placeholder="Tìm kiếm username, email, tên..."
          value={search}
          onChange={setSearch}
          className="sm:w-72"
        />
        <Select
          options={ROLE_OPTIONS}
          value={roleFilter}
          onChange={setRoleFilter}
          className="sm:w-44"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          className="sm:w-48"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchUsers({ page: 1, limit })}
          className="sm:ml-auto"
        >
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-text-dim">
          Đang tải...
        </div>
      ) : (
        <UsersTable
          users={filtered}
          onChangeRole={setChangeRoleTarget}
          onBan={setBanTarget}
          onViewDetail={(u) => navigate(`/users/${u.id}`)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-text-dim">
            Trang {page} / {totalPages} ({total} người dùng)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-sm border border-border-subtle text-text-secondary hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-sm border border-border-subtle text-text-secondary hover:bg-bg-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ChangeRoleDialog
        user={changeRoleTarget}
        open={!!changeRoleTarget}
        isLoading={isSubmitting}
        onClose={() => setChangeRoleTarget(null)}
        onConfirm={handleUpdateRole}
      />
      <BanUserDialog
        user={banTarget}
        open={!!banTarget}
        isLoading={isSubmitting}
        onClose={() => setBanTarget(null)}
        onConfirm={handleBan}
      />
    </div>
  );
}
