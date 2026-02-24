import { useState } from 'react';
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
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/utils';
import type { AdminGame } from '@/types/admin';

interface GamesTableProps {
  games: AdminGame[];
  onViewDetail: (game: AdminGame) => void;
  onDelete: (game: AdminGame) => void;
}

function GameLogo({ src, name }: { src?: string | null; name: string }) {
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

export function GamesTable({ games, onViewDetail, onDelete }: GamesTableProps) {
  return (
    <div className="rounded-sm border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Game</TableHead>
              <TableHead className="hidden sm:table-cell">Vai trò</TableHead>
              <TableHead className="hidden md:table-cell">Tổ chức</TableHead>
              <TableHead className="hidden lg:table-cell">Ngày tạo</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-dim py-10">
                  Không có game nào.
                </TableCell>
              </TableRow>
            ) : (
              games.map((game) => (
                <TableRow
                  key={game.id}
                  className="cursor-pointer"
                  onClick={() => onViewDetail(game)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <GameLogo src={game.logo} name={game.name} />
                      <div>
                        <p className="font-medium text-text-primary">{game.name}</p>
                        <p className="text-xs text-text-dim font-mono">{game.shortName}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {game.roles.length > 0 ? (
                        game.roles.map((role) => (
                          <Badge key={role} variant="default" className="text-xs">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-text-dim text-sm">—</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    {game.organization ? (
                      <span className="text-sm text-text-secondary">{game.organization.name}</span>
                    ) : (
                      <span className="text-sm text-text-dim">—</span>
                    )}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-text-dim text-xs">
                    {format(new Date(game.createdAt), 'dd/MM/yyyy')}
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
                        <DropdownMenuItem onSelect={() => onViewDetail(game)}>
                          <ExternalLink className="w-3.5 h-3.5 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => onDelete(game)}
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
