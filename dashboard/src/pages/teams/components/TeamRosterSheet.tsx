import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { AdminTeam, AdminPlayer } from '@/types/admin';
import { getPlayers } from '@/lib/players.api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/Sheet';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { TierBadge } from '@/components/shared/TierBadge';
import { RatingNumber } from '@/components/shared/RatingNumber';
import { formatRating } from '@/lib/utils';

interface TeamRosterSheetProps {
  team: AdminTeam | null;
  open: boolean;
  onClose: () => void;
}

export function TeamRosterSheet({ team, open, onClose }: TeamRosterSheetProps) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!team) { setPlayers([]); return; }
    setLoading(true);
    getPlayers({ teamId: team.id, limit: 50 })
      .then((res) => setPlayers(res.data))
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, [team?.id]);

  function handlePlayerClick(slug: string) {
    onClose();
    navigate(`/players/${slug}`);
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent>
        <SheetClose />

        {team && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3 pr-8">
                <Avatar
                  src={team.logo ?? undefined}
                  alt={team.name}
                  fallback={team.tag ?? team.name}
                  size="lg"
                  className="w-12 h-12"
                />
                <div>
                  <SheetTitle>{team.name}</SheetTitle>
                  {team.tag && <Badge variant="default" className="mt-1">[{team.tag}]</Badge>}
                </div>
              </div>
            </SheetHeader>

            {/* Team info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim font-body">Tổ chức</span>
                <span className="text-text-primary font-body">
                  {team.organization?.name ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-dim font-body">Khu vực</span>
                <Badge variant="info">{team.region?.code ?? '—'}</Badge>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Members heading */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
                Thành viên
              </h3>
              {!loading && (
                <span className="font-mono text-xs text-text-dim">{players.length} tuyển thủ</span>
              )}
            </div>

            {/* Players list */}
            <div className="flex-1 overflow-y-auto -mx-1 px-1">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-text-dim gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              ) : players.length === 0 ? (
                <p className="text-text-dim text-sm font-body py-4 text-center">
                  Chưa có thành viên nào.
                </p>
              ) : (
                <div>
                  {players.map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => handlePlayerClick(player.slug)}
                      className="w-full flex items-center gap-3 py-3 border-b border-border-subtle last:border-b-0 hover:bg-bg-elevated/50 rounded-sm px-1 transition-colors cursor-pointer text-left"
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
                        <p className="text-xs text-text-dim font-body">{player.game?.shortName ?? ''}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="font-mono font-bold text-sm text-text-primary">
                            {formatRating(player.rating)}
                          </span>
                        </div>
                        <TierBadge tier={player.tier} size="sm" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
