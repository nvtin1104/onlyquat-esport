import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal, Building2 } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import type { AdminOrganization, OrganizationType } from '@/types/admin';

interface OrganizationsTableProps {
    organizations: AdminOrganization[];
    onViewDetail: (org: AdminOrganization) => void;
    onDelete: (org: AdminOrganization) => void;
}

const ROLE_CONFIG: Record<OrganizationType, { label: string; className: string }> = {
    ORGANIZER: { label: 'Nhà tổ chức', className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    SPONSOR: { label: 'Nhà tài trợ', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    CLUB: { label: 'Câu lạc bộ', className: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
    AGENCY: { label: 'Đại lý', className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

function RoleBadges({ roles }: { roles: OrganizationType[] }) {
    return (
        <div className="flex flex-wrap gap-1">
            {roles.map((r) => {
                const cfg = ROLE_CONFIG[r];
                return (
                    <Badge key={r} className={cfg.className}>
                        {cfg.label}
                    </Badge>
                );
            })}
        </div>
    );
}

export function OrganizationsTable({ organizations, onViewDetail, onDelete }: OrganizationsTableProps) {
    return (
        <div className="rounded-sm border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tổ chức</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead className="hidden md:table-cell">Khu vực</TableHead>
                            <TableHead className="hidden sm:table-cell">Chủ sở hữu</TableHead>
                            <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {organizations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-text-dim py-10">
                                    Không có tổ chức nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            organizations.map((org) => (
                                <TableRow
                                    key={org.id}
                                    className="cursor-pointer"
                                    onClick={() => onViewDetail(org)}
                                >
                                    {/* Org info */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {org.logo ? (
                                                <img
                                                    src={org.logo}
                                                    alt={org.name}
                                                    className="w-8 h-8 rounded-sm object-cover border border-border-subtle shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-sm border border-border-subtle bg-bg-elevated flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-text-dim" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-text-primary">{org.name}</p>
                                                {org.shortName && (
                                                    <p className="text-xs text-text-dim">{org.shortName}</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Roles */}
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <RoleBadges roles={org.roles} />
                                    </TableCell>

                                    {/* Region */}
                                    <TableCell className="hidden md:table-cell">
                                        {org.region ? (
                                            <span className="text-sm text-text-secondary">{org.region.name}</span>
                                        ) : (
                                            <span className="text-sm text-text-dim">—</span>
                                        )}
                                    </TableCell>

                                    {/* Owner */}
                                    <TableCell className="hidden sm:table-cell">
                                        {org.owner ? (
                                            <span className="text-sm text-text-secondary">{org.owner.username}</span>
                                        ) : (
                                            <span className="text-sm text-text-dim font-mono text-xs">{org.ownerId.slice(0, 8)}…</span>
                                        )}
                                    </TableCell>

                                    {/* Created at */}
                                    <TableCell className="hidden lg:table-cell text-text-dim text-xs">
                                        {format(new Date(org.createdAt), 'dd/MM/yyyy')}
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
                                                <DropdownMenuItem onSelect={() => onViewDetail(org)}>
                                                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => onDelete(org)}
                                                    className="text-danger hover:text-danger"
                                                >
                                                    Xóa
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
        </div>
    );
}
