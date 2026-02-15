'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Team, Player } from '@/types';
import { Card } from '@/components/ui/Card';
import { staggerContainer, fadeUpItem } from '@/lib/animations';

interface TeamsGridProps {
  teams: Team[];
  players: Player[];
}

export function TeamsGrid({ teams, players }: TeamsGridProps) {
  function getTeamPlayerCount(team: Team): number {
    return players.filter((p) => p.teamId === team.id).length;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {teams.map((team) => {
        const playerCount = getTeamPlayerCount(team);
        return (
          <motion.div key={team.id} variants={fadeUpItem}>
            <Link href={`/teams/${team.slug}`} className="block group">
              <Card className="hover:border-accent-acid">
                <div className="p-6 flex flex-col gap-4">
                  {/* Logo + identity row */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-sm overflow-hidden bg-bg-surface border border-border-subtle shrink-0">
                      <Image
                        src={team.logoUrl}
                        alt={team.name}
                        fill
                        className="object-contain p-1 transition-all duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-display font-bold text-lg text-text-primary group-hover:text-accent-acid transition-colors truncate">
                        {team.name}
                      </h2>
                      <p className="font-mono text-xs text-accent-acid font-bold tracking-wider">
                        [{team.tag}]
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border-subtle" />

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                        Region
                      </span>
                      <span className="font-mono text-xs text-text-primary">
                        {team.region}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                        Tuyển thủ
                      </span>
                      <span className="font-mono text-xs font-bold text-accent-acid">
                        {playerCount}
                      </span>
                    </div>
                  </div>

                  {/* View link indicator */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim group-hover:text-accent-acid transition-colors">
                      Xem đội hình
                    </span>
                    <span className="font-mono text-[10px] text-text-dim group-hover:text-accent-acid group-hover:translate-x-0.5 transition-all">
                      →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
