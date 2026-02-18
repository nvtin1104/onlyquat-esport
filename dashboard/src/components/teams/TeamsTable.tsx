import { cn, formatRating, getTierFromRating, TIER_COLORS } from '@/lib/utils';
import type { AdminTeam } from '@/types/admin';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MoreHorizontal } from 'lucide-react';

interface TeamsTableProps {
  teams: AdminTeam[];
  onViewRoster: (team: AdminTeam) => void;
  onDelete: (id: string) => void;
}

export function TeamsTable({ teams, onViewRoster, onDelete }: TeamsTableProps) {
  if (teams.length === 0) {
    return (
      <div className="py-16 text-center text-text-dim font-body text-sm">
        Khong tim thay doi tuyen nao.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">Logo</TableHead>
          <TableHead>Doi tuyen</TableHead>
          <TableHead>To chuc</TableHead>
          <TableHead>Khu vuc</TableHead>
          <TableHead className="text-right">Thanh vien</TableHead>
          <TableHead className="text-right">Rating TB</TableHead>
          <TableHead>Trang thai</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => {
          const tier = getTierFromRating(team.avgRating);
          const ratingColor = TIER_COLORS[tier];

          return (
            <TableRow
              key={team.id}
              className="hover:bg-bg-elevated cursor-pointer"
              onClick={() => onViewRoster(team)}
            >
              {/* Logo */}
              <TableCell>
                <Avatar
                  src={team.logoUrl}
                  alt={team.name}
                  fallback={team.tag}
                  size="lg"
                  className="w-12 h-12"
                />
              </TableCell>

              {/* Team name + tag */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text-primary">{team.name}</span>
                  <Badge variant="default">[{team.tag}]</Badge>
                </div>
              </TableCell>

              {/* Org */}
              <TableCell>
                <span className={cn('font-body text-sm', team.orgName ? 'text-text-primary' : 'text-text-dim')}>
                  {team.orgName ?? '—'}
                </span>
              </TableCell>

              {/* Region */}
              <TableCell>
                <Badge variant="info">{team.region}</Badge>
              </TableCell>

              {/* Player count */}
              <TableCell className="text-right">
                <span className="font-mono text-text-primary">{team.playerCount}</span>
              </TableCell>

              {/* Avg rating */}
              <TableCell className="text-right">
                <span
                  className="font-mono font-bold"
                  style={{ color: ratingColor }}
                >
                  {formatRating(team.avgRating)}
                </span>
              </TableCell>

              {/* Status */}
              <TableCell>
                <StatusBadge status={team.isActive ? 'active' : 'inactive'} />
              </TableCell>

              {/* Actions */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={cn(
                      'p-1.5 rounded-sm text-text-dim hover:text-text-primary',
                      'hover:bg-bg-elevated transition-colors duration-150'
                    )}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onViewRoster(team)}>
                      Xem roster
                    </DropdownMenuItem>
                    <DropdownMenuItem>Sua</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-danger hover:text-danger"
                      onSelect={() => onDelete(team.id)}
                    >
                      Xoa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
