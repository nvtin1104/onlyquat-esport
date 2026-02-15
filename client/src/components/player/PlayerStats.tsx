'use client';

import { RadarChart } from '@/components/charts/RadarChart';
import { StatBar } from '@/components/ui/StatBar';
import { STAT_LABELS } from '@/lib/constants';
import type { PlayerStats as PlayerStatsType } from '@/types';

interface PlayerStatsProps {
  stats: PlayerStatsType;
}

export function PlayerStats({ stats }: PlayerStatsProps) {
  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="bg-bg-elevated border border-border-subtle rounded-sm p-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-4">
          Stats Overview
        </h3>
        <RadarChart stats={stats} />
      </div>

      {/* Stat Bars */}
      <div className="bg-bg-elevated border border-border-subtle rounded-sm p-4 space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-acid mb-4">
          Chi tiết chỉ số
        </h3>
        {(Object.keys(stats) as Array<keyof PlayerStatsType>).map((key) => (
          <StatBar
            key={key}
            label={STAT_LABELS[key] ?? key}
            value={stats[key]}
            size="md"
            glow
          />
        ))}
      </div>
    </div>
  );
}
