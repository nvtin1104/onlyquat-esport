'use client';

import type { PlayerStats } from '@/types';
import { STAT_LABELS } from '@/lib/constants';
import { useChartTheme } from '@/hooks/useChartTheme';

interface CompareChartProps {
  statsA: PlayerStats;
  statsB: PlayerStats;
  nameA: string;
  nameB: string;
}

export function CompareChart({ statsA, statsB, nameA, nameB }: CompareChartProps) {
  const ct = useChartTheme();
  const statKeys = ['aim', 'gameIq', 'clutch', 'teamplay', 'consistency'] as const;

  return (
    <div className="space-y-4">
      {statKeys.map((key) => {
        const valA = statsA[key];
        const valB = statsB[key];
        const aWins = valA > valB;
        const bWins = valB > valA;

        return (
          <div key={key} className="flex items-center gap-3">
            <span
              className="font-mono text-sm w-8 text-right"
              style={{ color: aWins ? ct.accent : ct.axis }}
            >
              {valA}
            </span>
            <div className="flex-1 flex h-[6px] rounded-full overflow-hidden bg-border-subtle">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${valA}%`,
                  backgroundColor: ct.accent,
                  opacity: aWins ? 1 : 0.4,
                }}
              />
            </div>
            <span className="font-mono text-[10px] uppercase text-text-dim w-20 text-center">
              {STAT_LABELS[key]}
            </span>
            <div className="flex-1 flex h-[6px] rounded-full overflow-hidden bg-border-subtle justify-end">
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${valB}%`,
                  backgroundColor: ct.lava,
                  opacity: bWins ? 1 : 0.4,
                }}
              />
            </div>
            <span
              className="font-mono text-sm w-8"
              style={{ color: bWins ? ct.lava : ct.axis }}
            >
              {valB}
            </span>
          </div>
        );
      })}
      <div className="flex justify-between font-mono text-[10px] text-text-dim pt-2">
        <span>{nameA}</span>
        <span>{nameB}</span>
      </div>
    </div>
  );
}
