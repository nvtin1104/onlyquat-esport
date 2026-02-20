'use client';

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { PlayerStats } from '@/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface RadarChartProps {
  stats: PlayerStats;
  compareStats?: PlayerStats;
}

export function RadarChart({ stats, compareStats }: RadarChartProps) {
  const ct = useChartTheme();

  const data = [
    { stat: 'Aim', A: stats.aim, ...(compareStats && { B: compareStats.aim }) },
    { stat: 'Game IQ', A: stats.gameIq, ...(compareStats && { B: compareStats.gameIq }) },
    { stat: 'Clutch', A: stats.clutch, ...(compareStats && { B: compareStats.clutch }) },
    { stat: 'Teamplay', A: stats.teamplay, ...(compareStats && { B: compareStats.teamplay }) },
    { stat: 'Consistency', A: stats.consistency, ...(compareStats && { B: compareStats.consistency }) },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadar data={data}>
        <PolarGrid stroke={ct.grid} />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: ct.axis, fontSize: 11, fontFamily: 'JetBrains Mono' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: ct.tooltip.bg,
            border: `1px solid ${ct.tooltip.border}`,
            borderRadius: '2px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
            color: ct.tooltip.text,
          }}
        />
        <Radar
          name="Player A"
          dataKey="A"
          stroke={ct.accent}
          fill={ct.accent}
          fillOpacity={0.2}
          strokeWidth={2}
        />
        {compareStats && (
          <Radar
            name="Player B"
            dataKey="B"
            stroke={ct.lava}
            fill={ct.lava}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )}
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
