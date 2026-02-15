'use client';

import { useCountUp } from '@/hooks/useCountUp';
import { useInView } from '@/hooks/useInView';

const stats = [
  { value: 2547, suffix: '+', label: 'Tuyển thủ' },
  { value: 185420, suffix: '+', label: 'Đánh giá' },
  { value: 52000, suffix: '+', label: 'Cộng đồng' },
  { value: 48, suffix: '', label: 'Giải đấu' },
];

function StatCounter({ value, suffix, label, start }: {
  value: number;
  suffix: string;
  label: string;
  start: boolean;
}) {
  const count = useCountUp(value, 2000, start);

  const display = value >= 1000
    ? (count / 1000).toFixed(count >= value ? 0 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : count.toString();

  return (
    <div className="text-center">
      <div className="font-mono font-bold text-3xl md:text-4xl text-text-primary">
        {display.toLocaleString()}{suffix}
      </div>
      <div className="font-body text-sm text-text-dim mt-1">{label}</div>
    </div>
  );
}

export function StatsRibbon() {
  const [ref, inView] = useInView<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className="bg-bg-surface border-y border-border-subtle py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCounter key={stat.label} {...stat} start={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
