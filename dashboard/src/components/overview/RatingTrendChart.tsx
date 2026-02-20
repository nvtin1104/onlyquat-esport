import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ratingTrend } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';
import { useChartTheme } from '@/lib/hooks/useChartTheme';

interface TooltipPayloadItem {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded p-3 border bg-bg-card border-border-subtle">
      <p className="font-mono text-xs text-text-secondary mb-1">{label}</p>
      <p className="font-mono text-sm font-bold text-accent-acid">
        {formatNumber(payload[0].value)}
      </p>
    </div>
  );
}

export function RatingTrendChart() {
  const chart = useChartTheme();

  return (
    <div className="rounded-sm p-4 border bg-bg-card border-border-subtle">
      <h2 className="font-display font-bold text-sm text-text-primary mb-4">
        Xu huong danh gia
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={ratingTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={chart.gridStroke} strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={chart.tickStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={chart.tickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatNumber(v)}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke={chart.stroke}
            strokeWidth={2}
            fill={chart.fill}
            fillOpacity={0.08}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
