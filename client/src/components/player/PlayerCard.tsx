'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Player } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { RatingNumber } from '@/components/ui/RatingNumber';
import { StatBar } from '@/components/ui/StatBar';
import { formatNumber } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  rank?: number;
  showStats?: boolean;
}

export function PlayerCard({ player, rank, showStats = true }: PlayerCardProps) {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { y: 0, boxShadow: 'var(--shadow-card)' },
        hover: {
          y: -8,
          boxShadow: 'var(--shadow-card-hover)',
          transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        },
      }}
      className="group bg-bg-elevated border border-border-subtle rounded-sm overflow-hidden transition-colors duration-400 hover:border-accent-acid"
    >
      <Link href={`/players/${player.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-bg-surface">
          {rank && (
            <span className="absolute top-3 left-3 z-10 font-mono text-[10px] font-bold bg-bg-base/80 text-accent-acid px-2 py-1 rounded-sm">
              #{String(rank).padStart(2, '0')}
            </span>
          )}
          <Badge
            tier={player.tier}
            className="absolute top-3 right-3 z-10"
          />
          <Image
            src={player.imageUrl}
            alt={player.displayName}
            fill
            className="object-cover transition-all duration-400 dark:grayscale-[50%] group-hover:grayscale-0 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bg-elevated to-transparent" />
        </div>

        {/* Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-base text-text-primary group-hover:text-accent-acid transition-colors">
              {player.displayName}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
              {player.role} &middot; {player.gameId === 'g1' ? 'LoL' : player.gameId === 'g2' ? 'VAL' : player.gameId === 'g3' ? 'Dota2' : 'CS2'}
            </p>
          </div>

          <div className="flex items-baseline gap-1">
            <RatingNumber value={player.rating} size="md" />
            <span className="font-mono text-xs text-text-dim">/10</span>
            <span className="font-mono text-[10px] text-text-dim ml-auto">
              {formatNumber(player.totalRatings)} votes
            </span>
          </div>

          {showStats && (
            <div className="space-y-1.5 pt-1">
              <StatBar label="Aim" value={player.stats.aim} />
              <StatBar label="IQ" value={player.stats.gameIq} />
              <StatBar label="Clutch" value={player.stats.clutch} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
