import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { UsersTable } from '@/components/users/UsersTable';
import { ChangeRoleDialog } from '@/components/users/ChangeRoleDialog';
import { BanUserDialog } from '@/components/users/BanUserDialog';
import { mockUsers } from '@/data/mock-data';
import type { AdminUser } from '@/types/admin';

const ROLE_OPTIONS = [
  { value: '', label: 'Tat ca role' },
  { value: 'user', label: 'User' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'admin', label: 'Admin' },
];

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [changeRoleTarget, setChangeRoleTarget] = useState<AdminUser | null>(null);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);

  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banOpen, setBanOpen] = useState(false);

  const filtered = users
    .filter((u) =>
      search
        ? u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .filter((u) => (roleFilter ? u.role === roleFilter : true));

  function handleChangeRole(user: AdminUser) {
    setChangeRoleTarget(user);
    setChangeRoleOpen(true);
  }

  function handleChangeRoleConfirm(userId: string, newRole: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, role: newRole as AdminUser['role'] } : u
      )
    );
    setChangeRoleOpen(false);
    setChangeRoleTarget(null);
  }

  function handleBan(user: AdminUser) {
    setBanTarget(user);
    setBanOpen(true);
  }

  function handleBanConfirm(userId: string, _reason: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
    setBanOpen(false);
    setBanTarget(null);
  }

  function handleViewDetail(_user: AdminUser) {
    // Placeholder - would navigate to detail page
  }

  return (
    <div>
      <PageHeader
        title="Nguoi dung"
        description="Quan ly nguoi dung"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput
          placeholder="Tim kiem username, email..."
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
      </div>

      <UsersTable
        users={filtered}
        onChangeRole={handleChangeRole}
        onBan={handleBan}
        onViewDetail={handleViewDetail}
      />

      <ChangeRoleDialog
        user={changeRoleTarget}
        open={changeRoleOpen}
        onClose={() => {
          setChangeRoleOpen(false);
          setChangeRoleTarget(null);
        }}
        onConfirm={handleChangeRoleConfirm}
      />

      <BanUserDialog
        user={banTarget}
        open={banOpen}
        onClose={() => {
          setBanOpen(false);
          setBanTarget(null);
        }}
        onConfirm={handleBanConfirm}
      />
    </div>
  );
}
