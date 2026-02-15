'use client';

import { useFilterStore } from '@/hooks/useFilterStore';
import { Input } from '@/components/ui/Input';
import { PlayerGrid } from '@/components/player/PlayerGrid';
import type { Player, Game } from '@/types';
import { cn } from '@/lib/utils';

interface PlayersPageClientProps {
  players: Player[];
  games: Game[];
}

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F'] as const;
const SORT_OPTIONS: { value: 'rating' | 'name' | 'rank'; label: string }[] = [
  { value: 'rating', label: 'Rating' },
  { value: 'name', label: 'Tên' },
  { value: 'rank', label: 'Rank' },
];

const selectClass = cn(
  'bg-bg-surface border border-border-subtle rounded-sm px-3 py-2',
  'font-mono text-sm text-text-primary',
  'focus:outline-none focus:border-accent-acid transition-colors duration-300',
  'appearance-none cursor-pointer'
);

export function PlayersPageClient({ players, games }: PlayersPageClientProps) {
  const { search, game, tier, sort, setSearch, setGame, setTier, setSort } =
    useFilterStore();

  // Filter
  const filtered = players
    .filter((p) => {
      const matchSearch =
        search.trim() === '' ||
        p.displayName.toLowerCase().includes(search.toLowerCase());
      const matchGame = game === '' || p.gameId === game;
      const matchTier = tier === '' || p.tier === tier;
      return matchSearch && matchGame && matchTier;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.displayName.localeCompare(b.displayName);
      if (sort === 'rank') return a.rank - b.rank;
      // default: rating descending
      return b.rating - a.rating;
    });

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Input
            icon
            placeholder="Tìm tuyển thủ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Game filter */}
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className={selectClass}
          aria-label="Lọc theo game"
        >
          <option value="">Tất cả game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.shortName}
            </option>
          ))}
        </select>

        {/* Tier filter */}
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          className={selectClass}
          aria-label="Lọc theo tier"
        >
          <option value="">Tất cả tier</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              Tier {t}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'rating' | 'name' | 'rank')}
          className={selectClass}
          aria-label="Sắp xếp theo"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="font-mono text-xs text-text-dim">
        Hiển thị{' '}
        <span className="text-accent-acid font-bold">{filtered.length}</span>{' '}
        tuyển thủ
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <PlayerGrid players={filtered} />
      ) : (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-text-dim">
            Không tìm thấy tuyển thủ phù hợp.
          </p>
        </div>
      )}
    </div>
  );
}
