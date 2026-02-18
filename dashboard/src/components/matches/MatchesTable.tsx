import { cn } from '@/lib/utils';
import type { AdminMatch } from '@/types/admin';
import { format, parseISO } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
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
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GameBadge } from '@/components/shared/GameBadge';
import { MoreHorizontal } from 'lucide-react';

interface MatchesTableProps {
  matches: AdminMatch[];
  onUpdateResult: (match: AdminMatch) => void;
  onDelete: (id: string) => void;
}

function formatMatchTime(iso: string) {
  try {
    return format(parseISO(iso), 'dd/MM/yyyy HH:mm');
  } catch {
    return iso;
  }
}

interface MatchRowProps {
  match: AdminMatch;
  onUpdateResult: (match: AdminMatch) => void;
  onDelete: (id: string) => void;
}

function MatchRow({ match, onUpdateResult, onDelete }: MatchRowProps) {
  const isWinnerA = match.winner === match.teamA.tag;
  const isWinnerB = match.winner === match.teamB.tag;

  return (
    <TableRow className="hover:bg-bg-elevated">
      {/* Game */}
      <TableCell>
        <GameBadge game={match.game} />
      </TableCell>

      {/* Match teams */}
      <TableCell>
        <div className="flex items-center gap-1.5 font-body text-sm">
          <span className="font-bold text-text-primary">[{match.teamA.tag}]</span>
          <span className="font-bold text-text-primary">{match.teamA.name}</span>
          <span className="text-text-dim mx-1">vs</span>
          <span className="font-bold text-text-primary">[{match.teamB.tag}]</span>
          <span className="font-bold text-text-primary">{match.teamB.name}</span>
        </div>
      </TableCell>

      {/* Tournament */}
      <TableCell>
        <span className="text-text-secondary text-sm font-body">{match.tournament}</span>
      </TableCell>

      {/* Time */}
      <TableCell>
        <span className="font-mono text-xs text-text-secondary">
          {formatMatchTime(match.scheduledAt)}
        </span>
      </TableCell>

      {/* Status / Result */}
      <TableCell>
        {match.status === 'upcoming' && (
          <StatusBadge status="upcoming" />
        )}
        {match.status === 'live' && (
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-danger">
            <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
            LIVE
          </span>
        )}
        {match.status === 'completed' && match.winner !== undefined && (
          <div className="font-mono text-xs text-text-secondary">
            <span className={cn(isWinnerA && 'text-accent-acid font-bold')}>
              [{match.teamA.tag}]
            </span>
            {' '}
            <span className="text-text-primary font-bold">
              {match.scoreA ?? 0} - {match.scoreB ?? 0}
            </span>
            {' '}
            <span className={cn(isWinnerB && 'text-accent-acid font-bold')}>
              [{match.teamB.tag}]
            </span>
          </div>
        )}
        {match.status === 'completed' && match.winner === undefined && (
          <StatusBadge status="completed" />
        )}
      </TableCell>

      {/* Actions */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        {match.status === 'upcoming' && (
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
              <DropdownMenuItem>Sua</DropdownMenuItem>
              <DropdownMenuItem>Bat dau</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-danger hover:text-danger"
                onSelect={() => onDelete(match.id)}
              >
                Xoa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {match.status === 'live' && (
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
              <DropdownMenuItem onSelect={() => onUpdateResult(match)}>
                Cap nhat ket qua
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {match.status === 'completed' && (
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
              <DropdownMenuItem>Xem chi tiet</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

interface MatchTabTableProps {
  matches: AdminMatch[];
  onUpdateResult: (match: AdminMatch) => void;
  onDelete: (id: string) => void;
}

function MatchTabTable({ matches, onUpdateResult, onDelete }: MatchTabTableProps) {
  if (matches.length === 0) {
    return (
      <div className="py-12 text-center text-text-dim font-body text-sm">
        Khong co tran dau nao.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Game</TableHead>
          <TableHead>Tran dau</TableHead>
          <TableHead>Giai dau</TableHead>
          <TableHead>Thoi gian</TableHead>
          <TableHead>Ket qua</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            onUpdateResult={onUpdateResult}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}

export function MatchesTable({ matches, onUpdateResult, onDelete }: MatchesTableProps) {
  const upcoming = matches.filter((m) => m.status === 'upcoming');
  const live = matches.filter((m) => m.status === 'live');
  const completed = matches.filter((m) => m.status === 'completed');

  return (
    <Tabs defaultValue="upcoming">
      <div className="px-4 pt-4 border-b border-border-subtle">
        <TabsList>
          <TabsTrigger value="upcoming">
            Sap dien ra
            {upcoming.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded-sm">
                {upcoming.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="live">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              Dang dien ra
              {live.length > 0 && (
                <span className="font-mono text-[10px] bg-danger/10 text-danger px-1.5 py-0.5 rounded-sm">
                  {live.length}
                </span>
              )}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Da ket thuc
            {completed.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-bg-elevated px-1.5 py-0.5 rounded-sm">
                {completed.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="upcoming">
        <MatchTabTable
          matches={upcoming}
          onUpdateResult={onUpdateResult}
          onDelete={onDelete}
        />
      </TabsContent>

      <TabsContent value="live">
        <MatchTabTable
          matches={live}
          onUpdateResult={onUpdateResult}
          onDelete={onDelete}
        />
      </TabsContent>

      <TabsContent value="completed">
        <MatchTabTable
          matches={completed}
          onUpdateResult={onUpdateResult}
          onDelete={onDelete}
        />
      </TabsContent>
    </Tabs>
  );
}
