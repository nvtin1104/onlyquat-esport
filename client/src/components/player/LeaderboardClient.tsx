'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Player, Game } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { TierDonut } from '@/components/charts/TierDonut';
import { cn, TIER_COLORS, formatRating, formatNumber } from '@/lib/utils';
import { staggerContainer, fadeUpItem } from '@/lib/animations';

interface LeaderboardClientProps {
  players: Player[];
  games: Game[];
}

export function LeaderboardClient({ players, games }: LeaderboardClientProps) {
  const [activeGame, setActiveGame] = useState<string>('all');

  const filtered =
    activeGame === 'all' ? players : players.filter((p) => p.gameId === activeGame);

  const sorted = [...filtered].sort((a, b) => b.rating - a.rating);

  function getGameShortName(gameId: string): string {
    return games.find((g) => g.id === gameId)?.shortName ?? gameId;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-2 block">
          Bảng xếp hạng
        </span>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-text-primary">
          Leaderboard
        </h1>
        <p className="font-body text-text-secondary mt-2">
          Xếp hạng tuyển thủ theo rating cộng đồng.
        </p>
      </div>

      {/* Game filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setActiveGame('all')}
          className={cn(
            'font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm border transition-all duration-200',
            activeGame === 'all'
              ? 'bg-accent-acid text-bg-base border-accent-acid'
              : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-acid/40'
          )}
        >
          Tất cả
        </button>
        {games.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGame(g.id)}
            className={cn(
              'font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-sm border transition-all duration-200',
              activeGame === g.id
                ? 'bg-accent-acid text-bg-base border-accent-acid'
                : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-acid/40'
            )}
          >
            {g.shortName}
          </button>
        ))}
      </div>

      {/* Layout: table + sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main table */}
        <div className="flex-1 min-w-0">
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="bg-bg-elevated border border-border-subtle rounded-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[3rem_1fr_6rem_7rem_6rem_5rem] px-4 py-3 border-b border-border-subtle">
                {['#', 'Tuyển thủ', 'Game', 'Role', 'Rating', 'Tier'].map((h) => (
                  <span key={h} className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                key={activeGame}
              >
                {sorted.map((player, i) => (
                  <motion.div key={player.id} variants={fadeUpItem}>
                    <Link
                      href={`/players/${player.slug}`}
                      className={cn(
                        'grid grid-cols-[3rem_1fr_6rem_7rem_6rem_5rem] px-4 py-4',
                        'border-b border-border-subtle last:border-b-0',
                        'border-l-2 border-l-transparent',
                        'hover:bg-bg-elevated hover:border-l-accent-acid',
                        'transition-all duration-200 group'
                      )}
                    >
                      {/* Rank */}
                      <span className="font-mono text-sm text-text-dim self-center">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Player */}
                      <div className="flex items-center gap-3 min-w-0 self-center">
                        <div className="w-9 h-9 rounded-sm overflow-hidden bg-bg-surface shrink-0 relative">
                          <Image
                            src={player.imageUrl}
                            alt={player.displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm text-text-primary group-hover:text-accent-acid transition-colors truncate">
                            {player.displayName}
                          </p>
                          {player.realName && (
                            <p className="font-mono text-[10px] text-text-dim truncate">
                              {player.realName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Game */}
                      <span className="font-mono text-xs text-text-secondary self-center">
                        {getGameShortName(player.gameId)}
                      </span>

                      {/* Role */}
                      <span className="font-mono text-xs text-text-secondary self-center">
                        {player.role}
                      </span>

                      {/* Rating */}
                      <span
                        className="font-mono text-sm font-bold self-center transition-colors"
                        style={{
                          color: TIER_COLORS[player.tier],
                        }}
                      >
                        {formatRating(player.rating)}
                      </span>

                      {/* Tier */}
                      <div className="self-center">
                        <Badge tier={player.tier} />
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {sorted.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <p className="font-body text-text-secondary">Không có tuyển thủ nào.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Mobile card layout */}
          <div className="md:hidden space-y-3">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              key={`mobile-${activeGame}`}
            >
              {sorted.map((player, i) => (
                <motion.div key={player.id} variants={fadeUpItem}>
                  <Link
                    href={`/players/${player.slug}`}
                    className="flex items-center gap-4 bg-bg-elevated border border-border-subtle rounded-sm p-4 hover:border-accent-acid transition-colors group"
                  >
                    {/* Rank */}
                    <span className="font-mono text-sm text-text-dim w-7 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-sm overflow-hidden bg-bg-surface shrink-0 relative">
                      <Image src={player.imageUrl} alt={player.displayName} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-text-primary group-hover:text-accent-acid transition-colors truncate">
                        {player.displayName}
                      </p>
                      <p className="font-mono text-[10px] text-text-dim uppercase">
                        {player.role} &middot; {getGameShortName(player.gameId)}
                      </p>
                    </div>

                    {/* Rating + Tier */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: TIER_COLORS[player.tier] }}
                      >
                        {formatRating(player.rating)}
                      </span>
                      <Badge tier={player.tier} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6">
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim mb-4">
              Phân Bố Tier
            </h3>
            <TierDonut players={sorted} />

            {/* Tier legend */}
            <div className="mt-4 space-y-2">
              {(['S', 'A', 'B', 'C', 'D', 'F'] as const).map((tier) => {
                const count = sorted.filter((p) => p.tier === tier).length;
                if (count === 0) return null;
                return (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: TIER_COLORS[tier] }}
                      />
                      <span className="font-mono text-xs text-text-secondary">{tier} Tier</span>
                    </div>
                    <span className="font-mono text-xs text-text-dim">
                      {count} ({Math.round((count / sorted.length) * 100)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats card */}
          <div className="bg-bg-elevated border border-border-subtle rounded-sm p-6 space-y-4">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
              Thống Kê
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-body text-sm text-text-secondary">Tổng tuyển thủ</span>
                <span className="font-mono text-sm text-text-primary font-bold">
                  {formatNumber(sorted.length)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-sm text-text-secondary">Rating TB</span>
                <span className="font-mono text-sm text-accent-acid font-bold">
                  {sorted.length > 0
                    ? formatRating(sorted.reduce((s, p) => s + p.rating, 0) / sorted.length)
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-sm text-text-secondary">Rating cao nhất</span>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: sorted[0] ? TIER_COLORS[sorted[0].tier] : '#888' }}
                >
                  {sorted[0] ? formatRating(sorted[0].rating) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-body text-sm text-text-secondary">Tổng lượt vote</span>
                <span className="font-mono text-sm text-text-primary font-bold">
                  {formatNumber(sorted.reduce((s, p) => s + p.totalRatings, 0))}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
