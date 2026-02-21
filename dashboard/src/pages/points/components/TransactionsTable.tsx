import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/shared/SearchInput';
import { cn } from '@/lib/utils';
import type { PointTransaction } from '@/types/admin';

interface TransactionsTableProps {
  transactions: PointTransaction[];
}

type BadgeVariant = 'success' | 'info' | 'warning' | 'default';

function getTypeBadge(type: string): { label: string; variant: BadgeVariant } {
  switch (type) {
    case 'earn_rating':
      return { label: 'Danh gia', variant: 'success' };
    case 'earn_daily':
      return { label: 'Hang ngay', variant: 'info' };
    case 'spend_predict':
      return { label: 'Du doan', variant: 'warning' };
    case 'admin_gift':
      return { label: 'Admin', variant: 'default' };
    default:
      return { label: type, variant: 'default' };
  }
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((tx) =>
    search ? tx.username.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          placeholder="Tim kiem nguoi dung..."
          value={search}
          onChange={setSearch}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-sm border border-border-subtle overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nguoi dung</TableHead>
              <TableHead>Loai</TableHead>
              <TableHead>So diem</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Thoi gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-dim py-8">
                  Khong co giao dich nao.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tx) => {
                const { label, variant } = getTypeBadge(tx.type);
                const isPositive = tx.amount >= 0;
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.username}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tx.type === 'admin_gift' ? 'default' : variant}
                        className={
                          tx.type === 'admin_gift'
                            ? 'bg-accent-acid/10 text-accent-acid border-accent-acid/30'
                            : undefined
                        }
                      >
                        {label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-mono font-bold',
                          isPositive ? 'text-success' : 'text-danger'
                        )}
                      >
                        {isPositive ? '+' : ''}{tx.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-text-secondary">{tx.balance}</span>
                    </TableCell>
                    <TableCell className="text-text-dim text-xs">
                      {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
