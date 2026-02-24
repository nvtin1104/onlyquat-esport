import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type RowSelectionState,
} from '@tanstack/react-table';
import { MoreHorizontal, Users } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { TierBadge } from '@/components/shared/TierBadge';
import { GameBadge } from '@/components/shared/GameBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { TIER_COLORS, formatNumber } from '@/lib/utils';
import type { AdminPlayer } from '@/types/admin';

interface PlayersTableProps {
  data: AdminPlayer[];
  isLoading?: boolean;
  onEdit: (slug: string) => void;
  onDelete: (slug: string) => void;
  rowSelection: RowSelectionState;
  onRowSelectionChange: (selection: RowSelectionState) => void;
}

const columnHelper = createColumnHelper<AdminPlayer>();

export function PlayersTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  rowSelection,
  onRowSelectionChange,
}: PlayersTableProps) {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(checked) => row.toggleSelected(checked)}
          />
        ),
        size: 44,
      }),
      columnHelper.accessor('rank', {
        id: 'rank',
        header: '#',
        cell: (info) => (
          <span className="font-mono text-text-dim">{info.getValue()}</span>
        ),
        size: 50,
      }),
      columnHelper.display({
        id: 'player',
        header: 'Tuyển thủ',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar
                src={p.imageUrl}
                alt={p.displayName}
                fallback={p.displayName}
                size="md"
              />
              <div>
                <div className="font-body font-medium text-text-primary">{p.displayName}</div>
                {p.realName && (
                  <div className="text-xs text-text-dim">{p.realName}</div>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'game',
        header: 'Game',
        cell: ({ row }) => {
          const g = row.original.game;
          if (!g) return <span className="text-text-dim">—</span>;
          return <GameBadge game={g.shortName} />;
        },
      }),
      columnHelper.display({
        id: 'team',
        header: 'Đội',
        cell: ({ row }) => {
          const t = row.original.team;
          if (!t) return <span className="text-text-dim">—</span>;
          return (
            <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-bg-elevated text-text-secondary border border-border-subtle">
              {t.name}
            </span>
          );
        },
      }),
      columnHelper.accessor('rating', {
        id: 'rating',
        header: 'Rating',
        cell: (info) => {
          const val = info.getValue();
          const tier = info.row.original.tier;
          const color = TIER_COLORS[tier];
          return (
            <span className="font-mono font-bold" style={{ color }}>
              {val.toFixed(1)}
            </span>
          );
        },
      }),
      columnHelper.accessor('tier', {
        id: 'tier',
        header: 'Tier',
        cell: (info) => <TierBadge tier={info.getValue()} size="sm" />,
      }),
      columnHelper.accessor('totalRatings', {
        id: 'totalRatings',
        header: 'Đánh giá',
        cell: (info) => (
          <span className="font-mono text-text-secondary">{formatNumber(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor('isActive', {
        id: 'status',
        header: 'Trạng thái',
        cell: (info) => (
          <StatusBadge status={info.getValue() ? 'active' : 'inactive'} />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-sm text-text-dim hover:text-text-primary hover:bg-bg-elevated transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => navigate(`/players/${p.slug}`)}>
                  Xem
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(p.slug)}>
                  Sửa
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onDelete(p.slug)}
                  className="text-danger hover:bg-danger/10"
                >
                  Xoá
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 50,
      }),
    ],
    [navigate, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      onRowSelectionChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 20 },
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const fromRow = pageIndex * pageSize + 1;
  const toRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-dim font-mono text-sm">
        Đang tải...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Không có tuyển thủ"
        description="Không tìm thấy tuyển thủ nào phù hợp với điều kiện lọc."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-sm border border-border-subtle overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-bg-card">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-selected={row.getIsSelected()}
                className="hover:bg-bg-elevated transition-colors duration-150 data-[selected=true]:bg-accent-acid/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <span className="font-mono text-sm text-text-dim">
          Hiển thị {totalRows > 0 ? fromRow : 0}–{toRow} / {totalRows}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <span className="font-mono text-sm text-text-secondary">
            Trang {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
