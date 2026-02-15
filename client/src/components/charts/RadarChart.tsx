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

interface RadarChartProps {
  stats: PlayerStats;
  compareStats?: PlayerStats;
}

export function RadarChart({ stats, compareStats }: RadarChartProps) {
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
        <PolarGrid stroke="#2A2A2B" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: '#555555', fontSize: 11, fontFamily: 'JetBrains Mono' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1A1B',
            border: '1px solid #2A2A2B',
            borderRadius: '2px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
          }}
        />
        <Radar
          name="Player A"
          dataKey="A"
          stroke="#CCFF00"
          fill="#CCFF00"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        {compareStats && (
          <Radar
            name="Player B"
            dataKey="B"
            stroke="#FF4D00"
            fill="#FF4D00"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )}
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
