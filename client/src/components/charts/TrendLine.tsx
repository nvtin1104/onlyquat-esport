'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

const mockTrend = [
  { month: 'Sep', rating: 9.2 },
  { month: 'Oct', rating: 9.4 },
  { month: 'Nov', rating: 9.3 },
  { month: 'Dec', rating: 9.6 },
  { month: 'Jan', rating: 9.7 },
  { month: 'Feb', rating: 9.8 },
];

interface TrendLineProps {
  data?: { month: string; rating: number }[];
}

export function TrendLine({ data = mockTrend }: TrendLineProps) {
  const ct = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          tick={{ fill: ct.axis, fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: ct.grid }}
          tickLine={false}
        />
        <YAxis
          domain={[7, 10]}
          tick={{ fill: ct.axis, fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: ct.grid }}
          tickLine={false}
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
        <Line
          type="monotone"
          dataKey="rating"
          stroke={ct.accent}
          strokeWidth={2}
          dot={{ fill: ct.accent, strokeWidth: 0, r: 4 }}
          activeDot={{ fill: ct.accent, strokeWidth: 0, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
