import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types/admin';

interface UsersTableProps {
  users: AdminUser[];
  onChangeRole: (user: AdminUser) => void;
  onBan: (user: AdminUser) => void;
  onViewDetail: (user: AdminUser) => void;
}

function getRoleBadge(role: AdminUser['role']): { label: string; className: string } {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        className: 'bg-accent-acid/10 text-accent-acid border-accent-acid/30',
      };
    case 'moderator':
      return {
        label: 'Moderator',
        className: 'bg-info/10 text-info border-info/30',
      };
    default:
      return {
        label: 'User',
        className: 'bg-bg-elevated text-text-dim border-border-subtle',
      };
  }
}

export function UsersTable({ users, onChangeRole, onBan, onViewDetail }: UsersTableProps) {
  return (
    <div className="rounded-sm border border-border-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nguoi dung</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Diem</TableHead>
            <TableHead>Danh gia</TableHead>
            <TableHead>Ngay tham gia</TableHead>
            <TableHead>Trang thai</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-text-dim py-8">
                Khong co nguoi dung nao.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              return (
                <TableRow key={user.id}>
                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        alt={user.username}
                        fallback={user.username}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-text-primary">{user.username}</p>
                        <p className="text-xs text-text-dim">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge className={roleBadge.className}>
                      {roleBadge.label}
                    </Badge>
                  </TableCell>

                  {/* Points */}
                  <TableCell>
                    <span className="font-mono">{user.points.toLocaleString()}</span>
                  </TableCell>

                  {/* Ratings */}
                  <TableCell>
                    <span className="font-mono text-text-secondary">{user.ratingsCount}</span>
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="text-text-dim text-xs">
                    {format(new Date(user.joinedAt), 'dd/MM/yyyy')}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {user.isActive ? (
                      <StatusBadge status="active" />
                    ) : (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-danger">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
                        banned
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          'p-1.5 rounded-sm text-text-dim hover:text-text-primary',
                          'hover:bg-bg-elevated transition-colors duration-100'
                        )}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onViewDetail(user)}>
                          Xem chi tiet
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onChangeRole(user)}>
                          Doi role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onBan(user)}
                          className="text-danger hover:text-danger"
                        >
                          {user.isActive ? 'Ban' : 'Unban'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
