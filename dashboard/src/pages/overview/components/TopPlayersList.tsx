import { Link } from 'react-router-dom';
import { TierBadge } from '@/components/shared/TierBadge';
import { GameBadge } from '@/components/shared/GameBadge';
import { mockPlayers as topPlayers } from '@/data/mock-data';
import { TIER_COLORS, formatRating, cn } from '@/lib/utils';

export function TopPlayersList() {
  const players = topPlayers.slice(0, 5);

  return (
    <div className="rounded-sm p-4 border bg-bg-card border-border-subtle">
      <h2 className="font-display font-bold text-sm text-text-primary mb-4">Top tuyen thu</h2>

      <ul>
        {players.map((player) => {
          const color = TIER_COLORS[player.tier];
          return (
            <li
              key={player.id}
              className="flex items-center gap-3 py-3 border-b border-border-subtle last:border-0"
            >
              {/* Rank */}
              <span
                className={cn(
                  'font-mono font-bold text-lg w-6 text-center flex-shrink-0',
                  player.rank <= 3 ? 'text-accent-acid' : 'text-text-dim',
                )}
              >
                {player.rank}
              </span>

              {/* Name + game */}
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-text-primary truncate">
                  {player.displayName}
                </p>
                <div className="mt-0.5">
                  <GameBadge game={player.gameShort} />
                </div>
              </div>

              {/* Rating + tier */}
              <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                <span className="font-mono font-bold text-sm" style={{ color }}>
                  {formatRating(player.rating)}
                </span>
                <TierBadge tier={player.tier} size="sm" />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 pt-3 border-t border-border-subtle">
        <Link to="/players" className="text-sm font-body text-accent-acid hover:underline">
          Xem bang xep hang →
        </Link>
      </div>
    </div>
  );
}
