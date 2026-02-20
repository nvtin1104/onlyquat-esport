'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Player, TierKey } from '@/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface TierDonutProps {
  players: Player[];
}

export function TierDonut({ players }: TierDonutProps) {
  const ct = useChartTheme();

  const tierCounts = players.reduce<Record<string, number>>((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(tierCounts).map(([tier, count]) => ({
    name: `${tier} Tier`,
    value: count,
    color: ct.tierColors[tier as TierKey],
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
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
      </PieChart>
    </ResponsiveContainer>
  );
}
