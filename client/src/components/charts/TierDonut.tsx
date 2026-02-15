'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Player, TierKey } from '@/types';
import { TIER_COLORS } from '@/lib/utils';

interface TierDonutProps {
  players: Player[];
}

export function TierDonut({ players }: TierDonutProps) {
  const tierCounts = players.reduce<Record<string, number>>((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(tierCounts).map(([tier, count]) => ({
    name: `${tier} Tier`,
    value: count,
    color: TIER_COLORS[tier as TierKey],
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
            backgroundColor: '#1A1A1B',
            border: '1px solid #2A2A2B',
            borderRadius: '2px',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
