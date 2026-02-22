import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import type { AdminUser, UserRole, UserStatus } from '@/types/admin';

interface UsersTableProps {
  users: AdminUser[];
  onChangeRole: (user: AdminUser) => void;
  onBan: (user: AdminUser) => void;
  onViewDetail: (user: AdminUser) => void;
}

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  ROOT: { label: 'Root', className: 'bg-danger/10 text-danger border-danger/30' },
  ADMIN: { label: 'Admin', className: 'bg-accent-acid/10 text-accent-acid border-accent-acid/30' },
  STAFF: { label: 'Staff', className: 'bg-info/10 text-info border-info/30' },
  ORGANIZER: { label: 'Organizer', className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  CREATOR: { label: 'Creator', className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  PARTNER: { label: 'Partner', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  PLAYER: { label: 'Player', className: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  USER: { label: 'User', className: 'bg-bg-elevated text-text-dim border-border-subtle' },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Hoạt động', className: 'text-success' },
  UNACTIVE: { label: 'Chưa kích hoạt', className: 'text-text-dim' },
  BANNED: { label: 'Bị cấm', className: 'text-danger' },
};

function RoleBadges({ roles }: { roles: UserRole[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((r) => {
        const cfg = ROLE_CONFIG[r] ?? ROLE_CONFIG.USER;
        return (
          <Badge key={r} className={cfg.className}>
            {cfg.label}
          </Badge>
        );
      })}
    </div>
  );
}

function StatusCell({ status }: { status: UserStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNACTIVE;
  return (
    <span className={cn('flex items-center gap-1.5 font-mono text-[10px] uppercase', cfg.className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

export function UsersTable({ users, onChangeRole, onBan, onViewDetail }: UsersTableProps) {
  return (
    <div className="rounded-sm border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Người dùng</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Loại TK</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-text-dim py-10">
                Không có người dùng nào.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow
                key={user.id}
                className="cursor-pointer"
                onClick={() => onViewDetail(user)}
              >
                {/* User info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar alt={user.username} fallback={user.username} size="sm" />
                    <div>
                      <p className="font-medium text-text-primary">{user.username}</p>
                      <p className="text-xs text-text-dim">{user.email}</p>
                      {user.name && (
                        <p className="text-xs text-text-secondary">{user.name}</p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Roles */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RoleBadges roles={user.role} />
                </TableCell>

                {/* Status */}
                <TableCell><StatusCell status={user.status} /></TableCell>

                {/* Account type */}
                <TableCell>
                  <span className="text-xs text-text-dim font-mono">
                    {user.accountType === 0 ? 'Admin' : 'Public'}
                  </span>
                </TableCell>

                {/* Created at */}
                <TableCell className="text-text-dim text-xs">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                </TableCell>

                {/* Actions */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        'p-1.5 rounded-sm text-text-dim hover:text-text-primary',
                        'hover:bg-bg-elevated transition-colors duration-100',
                      )}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onViewDetail(user)}>
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onChangeRole(user)}>
                        Đổi role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onBan(user)}
                        className="text-danger hover:text-danger"
                      >
                        {user.status === 'BANNED' ? 'Bỏ cấm' : 'Cấm người dùng'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
