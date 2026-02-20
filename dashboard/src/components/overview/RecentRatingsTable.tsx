import { Link } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { mockRatings as recentRatings } from '@/data/mock-data';
import { getTierFromRating, TIER_COLORS } from '@/lib/utils';

export function RecentRatingsTable() {
  const rows = recentRatings.slice(0, 5);

  return (
    <div className="rounded-sm p-4 border bg-bg-card border-border-subtle">
      <h2 className="font-display font-bold text-sm text-text-primary mb-4">Danh gia gan day</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nguoi dung</TableHead>
            <TableHead>Tuyen thu</TableHead>
            <TableHead>Diem</TableHead>
            <TableHead>Thoi gian</TableHead>
            <TableHead>Trang thai</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((rating) => {
            const tier = getTierFromRating(rating.overall);
            const color = TIER_COLORS[tier];
            return (
              <TableRow key={rating.id}>
                <TableCell className="font-body text-sm text-text-primary">
                  {rating.userName}
                </TableCell>
                <TableCell className="font-body text-sm text-text-secondary">
                  {rating.playerName}
                </TableCell>
                <TableCell>
                  <span className="font-mono font-bold text-sm" style={{ color }}>
                    {rating.overall.toFixed(1)}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs text-text-dim">
                  {rating.timeAgo}
                </TableCell>
                <TableCell>
                  <StatusBadge status={rating.status} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-3 pt-3 border-t border-border-subtle">
        <Link to="/ratings" className="text-sm font-body text-accent-acid hover:underline">
          Xem tat ca danh gia →
        </Link>
      </div>
    </div>
  );
}
