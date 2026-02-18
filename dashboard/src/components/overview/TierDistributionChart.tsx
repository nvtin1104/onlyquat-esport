import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { tierDistribution } from '@/data/mock-data';
import { TierBadge } from '@/components/shared/TierBadge';
import type { TierKey } from '@/lib/utils';

const total = tierDistribution.reduce((sum, d) => sum + d.count, 0);

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { tier: string; count: number; color: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div
      className="rounded p-3 border"
      style={{ backgroundColor: '#0A0A0A', borderColor: '#2A2A2B' }}
    >
      <p className="font-mono text-xs font-bold" style={{ color: item.color }}>
        Tier {item.tier}
      </p>
      <p className="font-mono text-sm text-text-primary mt-0.5">{item.count} tuyen thu</p>
    </div>
  );
}

export function TierDistributionChart() {
  return (
    <div
      className="rounded-sm p-4 border"
      style={{ backgroundColor: '#0A0A0A', borderColor: '#2A2A2B' }}
    >
      <h2 className="font-display font-bold text-sm text-text-primary mb-4">Phan bo tier</h2>

      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={tierDistribution}
              dataKey="count"
              nameKey="tier"
              innerRadius="60%"
              outerRadius="80%"
              strokeWidth={0}
            >
              {tierDistribution.map((entry) => (
                <Cell key={entry.tier} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono font-bold text-2xl text-text-primary">{total}</span>
          <span className="font-body text-xs text-text-secondary">tuyen thu</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {tierDistribution.map((item) => (
          <div key={item.tier} className="flex items-center gap-1.5">
            <TierBadge tier={item.tier as TierKey} size="sm" />
            <span className="font-mono text-xs text-text-secondary">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
