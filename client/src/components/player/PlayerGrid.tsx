'use client';

import { motion } from 'framer-motion';
import type { Player } from '@/types';
import { PlayerCard } from './PlayerCard';
import { staggerContainer, fadeUpItem } from '@/lib/animations';

interface PlayerGridProps {
  players: Player[];
  showRank?: boolean;
}

export function PlayerGrid({ players, showRank = false }: PlayerGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {players.map((player) => (
        <motion.div key={player.id} variants={fadeUpItem}>
          <PlayerCard
            player={player}
            rank={showRank ? player.rank : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
