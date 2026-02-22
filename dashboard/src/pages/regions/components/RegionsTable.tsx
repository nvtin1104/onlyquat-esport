import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal, MapPin } from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/Table';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import type { AdminRegion } from '@/types/admin';

interface RegionsTableProps {
    regions: AdminRegion[];
    onViewDetail: (region: AdminRegion) => void;
    onDelete: (region: AdminRegion) => void;
}

export function RegionsTable({ regions, onViewDetail, onDelete }: RegionsTableProps) {
    return (
        <div className="rounded-sm border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên / Mã</TableHead>
                            <TableHead className="hidden sm:table-cell">Logo</TableHead>
                            <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                            <TableHead className="w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {regions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-text-dim py-10">
                                    Không có khu vực nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            regions.map((region) => (
                                <TableRow
                                    key={region.id}
                                    className="cursor-pointer"
                                    onClick={() => onViewDetail(region)}
                                >
                                    {/* Name + Code */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium text-text-primary">{region.name}</p>
                                                <span className="inline-flex items-center font-mono text-[10px] px-1.5 py-0.5 rounded-sm border bg-bg-elevated text-text-dim border-border-subtle mt-0.5">
                                                    {region.code}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Logo */}
                                    <TableCell className="hidden sm:table-cell">
                                        {region.logo ? (
                                            <img
                                                src={region.logo}
                                                alt={region.name}
                                                className="w-8 h-8 rounded-sm object-cover border border-border-subtle"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-sm border border-border-subtle bg-bg-elevated flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-text-dim" />
                                            </div>
                                        )}
                                    </TableCell>

                                    {/* Created at */}
                                    <TableCell className="hidden md:table-cell text-text-dim text-xs">
                                        {format(new Date(region.createdAt), 'dd/MM/yyyy')}
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
                                                <DropdownMenuItem onSelect={() => onViewDetail(region)}>
                                                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                                    Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onSelect={() => onDelete(region)}
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
