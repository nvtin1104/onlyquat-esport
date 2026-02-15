'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

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
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis
          dataKey="month"
          tick={{ fill: '#555555', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: '#2A2A2B' }}
          tickLine={false}
        />
        <YAxis
          domain={[7, 10]}
          tick={{ fill: '#555555', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: '#2A2A2B' }}
          tickLine={false}
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
        <Line
          type="monotone"
          dataKey="rating"
          stroke="#CCFF00"
          strokeWidth={2}
          dot={{ fill: '#CCFF00', strokeWidth: 0, r: 4 }}
          activeDot={{ fill: '#CCFF00', strokeWidth: 0, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
