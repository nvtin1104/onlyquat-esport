import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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

const pointsByType = [
  { type: 'Dang nhap', value: 45000 },
  { type: 'Danh gia', value: 32000 },
  { type: 'Du doan', value: 28000 },
  { type: 'Chi tieu', value: -18000 },
];

export function PointsCharts() {
  const chart = useChartTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Area chart - points by week */}
      <div className="rounded-sm p-4 border bg-bg-card border-border-subtle">
        <h3 className="font-display font-bold text-sm text-text-primary mb-4">
          Diem theo tuan
        </h3>
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

      {/* Bar chart - points by type */}
      <div className="rounded-sm p-4 border bg-bg-card border-border-subtle">
        <h3 className="font-display font-bold text-sm text-text-primary mb-4">
          Diem theo loai
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pointsByType} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={chart.gridStroke} strokeDasharray="3 3" />
            <XAxis dataKey="type" tick={chart.tickStyle} axisLine={false} tickLine={false} />
            <YAxis
              tick={chart.tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatNumber(Math.abs(v))}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {pointsByType.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? chart.positiveBar : chart.negativeBar}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
