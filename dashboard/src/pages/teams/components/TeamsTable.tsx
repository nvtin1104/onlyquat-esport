import { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminTeam } from '@/types/admin';
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

interface TeamsTableProps {
  teams: AdminTeam[];
  onViewDetail: (team: AdminTeam) => void;
  onDelete: (team: AdminTeam) => void;
}

function TeamLogo({ src, name }: { src?: string | null; name: string }) {
  const [error, setError] = useState(false);
  return (
    <div className="w-8 h-8 rounded-sm bg-bg-elevated overflow-hidden flex items-center justify-center shrink-0">
      {src && !error ? (
        <img src={src} alt={name} onError={() => setError(true)} className="w-full h-full object-cover" />
      ) : (
        <span className="font-mono font-medium text-xs text-text-dim uppercase select-none">
          {name.charAt(0)}
        </span>
      )}
    </div>
  );
}

export function TeamsTable({ teams, onViewDetail, onDelete }: TeamsTableProps) {
  return (
    <div className="rounded-sm border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Đội tuyển</TableHead>
              <TableHead className="hidden md:table-cell">Tổ chức</TableHead>
              <TableHead className="hidden sm:table-cell">Khu vực</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-dim py-10">
                  Không có đội tuyển nào.
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow
                  key={team.id}
                  className="cursor-pointer"
                  onClick={() => onViewDetail(team)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TeamLogo src={team.logo} name={team.name} />
                      <div>
                        <p className="font-medium text-text-primary">{team.name}</p>
                        {team.tag && (
                          <Badge variant="default" className="text-xs mt-0.5">[{team.tag}]</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {team.organization ? (
                      <span className="text-sm text-text-secondary">{team.organization.name}</span>
                    ) : (
                      <span className="text-sm text-text-dim">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {team.region ? (
                      <Badge variant="info">{team.region.name}</Badge>
                    ) : (
                      <span className="text-sm text-text-dim">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-text-dim text-xs">
                    {format(new Date(team.createdAt), 'dd/MM/yyyy')}
                  </TableCell>

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
                        <DropdownMenuItem onSelect={() => onViewDetail(team)}>
                          <ExternalLink className="w-3.5 h-3.5 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onDelete(team)}
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
