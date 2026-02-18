import { mockPlayers } from '@/data/mock-data';
import type { AdminTeam } from '@/types/admin';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/Sheet';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { TierBadge } from '@/components/shared/TierBadge';
import { RatingNumber } from '@/components/shared/RatingNumber';
import { formatRating } from '@/lib/utils';
import { X, UserPlus } from 'lucide-react';

interface TeamRosterSheetProps {
  team: AdminTeam | null;
  open: boolean;
  onClose: () => void;
}

export function TeamRosterSheet({ team, open, onClose }: TeamRosterSheetProps) {
  const players = team
    ? mockPlayers.filter((p) => p.teamId === team.id)
    : [];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent>
        <SheetClose />

        {team && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3 pr-8">
                <Avatar
                  src={team.logoUrl}
                  alt={team.name}
                  fallback={team.tag}
                  size="lg"
                  className="w-12 h-12"
                />
                <div>
                  <SheetTitle>{team.name}</SheetTitle>
                  <Badge variant="default" className="mt-1">[{team.tag}]</Badge>
                </div>
              </div>
            </SheetHeader>

            {/* Team info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim font-body">To chuc</span>
                <span className="text-text-primary font-body">
                  {team.orgName ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim font-body">Khu vuc</span>
                <Badge variant="info">{team.region}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim font-body">Rating TB</span>
                <RatingNumber value={team.avgRating} size="sm" />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Members heading */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
                Thanh vien
              </h3>
              <span className="font-mono text-xs text-text-dim">{players.length} tuyen thu</span>
            </div>

            {/* Players list */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {players.length === 0 ? (
                <p className="text-text-dim text-sm font-body py-4 text-center">
                  Chua co thanh vien nao.
                </p>
              ) : (
                <div>
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-b-0"
                    >
                      <Avatar
                        src={player.imageUrl}
                        alt={player.displayName}
                        fallback={player.displayName}
                        size="md"
                        className="w-10 h-10"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary truncate">
                          {player.displayName}
                        </p>
                        <p className="text-xs text-text-dim font-body">{player.role}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-text-primary">
                            {formatRating(player.rating)}
                          </span>
                        </div>
                        <TierBadge tier={player.tier} size="sm" />
                        <button
                          type="button"
                          title="Xoa khoi doi"
                          onClick={() => console.log('Remove player', player.id, 'from team', team.id)}
                          className="p-1 rounded-sm text-text-dim hover:text-danger hover:bg-danger/10 transition-colors duration-150"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add player button */}
            <div className="mt-auto pt-4">
              <Button variant="primary" size="sm" className="w-full">
                <UserPlus className="w-4 h-4" />
                + Them tuyen thu vao doi
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
