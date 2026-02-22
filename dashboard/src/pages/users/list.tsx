import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { UsersTable } from './components/UsersTable';
import { UsersSkeleton } from './components/UsersSkeleton';
import { ChangeRoleDialog } from './components/ChangeRoleDialog';
import { BanUserDialog } from './components/BanUserDialog';
import { useUsersStore } from '@/stores/usersStore';
import type { AdminUser } from '@/types/admin';
import type { UpdateRoleFormValues } from '@/lib/schemas/user.schema';

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả role' },
  { value: 'ROOT', label: 'Root' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'ORGANIZER', label: 'Organizer' },
  { value: 'CREATOR', label: 'Creator' },
  { value: 'PARTNER', label: 'Partner' },
  { value: 'PLAYER', label: 'Player' },
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

  // Initial load
  useEffect(() => {
    fetchUsers({ page: 1 });
  }, []);

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
            className="cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo người dùng
          </Button>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-danger/70 hover:text-danger text-xs ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          placeholder="Tìm username, email, tên..."
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
          onClick={() => fetchUsers({ page: 1 })}
          className="sm:ml-auto cursor-pointer"
        >
          Làm mới
        </Button>
      </div>

      {/* Table or Skeleton */}
      {isLoading ? (
        <UsersSkeleton rows={limit} />
      ) : (
        <UsersTable
          users={users}
          onChangeRole={setChangeRoleTarget}
          onBan={setBanTarget}
          onViewDetail={(u) => navigate(`/users/${u.id}`)}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <span className="text-sm text-text-dim">
            Trang <span className="text-text-primary font-medium">{page}</span> / <span className="text-text-primary font-medium">{totalPages}</span> — {total} người dùng
          </span>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
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
