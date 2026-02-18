import { Edit } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TIER_COLORS } from '@/lib/utils';
import { games } from '@/data/mock-data';
import type { TierKey } from '@/types/admin';

const TIER_THRESHOLDS: Array<{ tier: TierKey; min: number; label: string }> = [
  { tier: 'S', min: 9.0, label: 'S Tier' },
  { tier: 'A', min: 8.0, label: 'A Tier' },
  { tier: 'B', min: 7.0, label: 'B Tier' },
  { tier: 'C', min: 6.0, label: 'C Tier' },
  { tier: 'D', min: 5.0, label: 'D Tier' },
  { tier: 'F', min: 0.0, label: 'F Tier' },
];

export function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Cai dat"
        description="Cau hinh he thong"
      />

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* General Info */}
        <div className="bg-bg-card border border-border-subtle rounded-sm p-5">
          <h2 className="font-display font-semibold text-base text-text-primary mb-4">
            Thong tin chung
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
                Ten ung dung
              </label>
              <Input
                defaultValue="Arcade Arena"
                placeholder="Ten ung dung..."
              />
            </div>
            <div>
              <label className="font-mono text-xs text-text-dim uppercase mb-1.5 block">
                Mo ta
              </label>
              <Input
                defaultValue="Nen tang danh gia tuyen thu esports Viet Nam"
                placeholder="Mo ta ung dung..."
              />
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm">
                Luu thay doi
              </Button>
            </div>
          </div>
        </div>

        {/* Games */}
        <div className="bg-bg-card border border-border-subtle rounded-sm p-5">
          <h2 className="font-display font-semibold text-base text-text-primary mb-4">
            Games
          </h2>
          <div className="flex flex-col gap-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between py-2.5 px-3 rounded-sm bg-bg-elevated"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="font-mono">
                    {game.shortName}
                  </Badge>
                  <span className="font-body text-sm text-text-primary">{game.name}</span>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Thresholds */}
        <div className="bg-bg-card border border-border-subtle rounded-sm p-5">
          <h2 className="font-display font-semibold text-base text-text-primary mb-4">
            Tier Thresholds
          </h2>
          <div className="flex flex-col gap-2">
            {TIER_THRESHOLDS.map(({ tier, min, label }) => (
              <div
                key={tier}
                className="flex items-center justify-between py-2.5 px-3 rounded-sm bg-bg-elevated"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-mono font-bold text-sm w-6"
                    style={{ color: TIER_COLORS[tier] }}
                  >
                    {tier}
                  </span>
                  <span className="font-body text-sm text-text-primary">{label}</span>
                </div>
                <span className="font-mono text-sm text-text-secondary">
                  {tier === 'F'
                    ? '< 5.0'
                    : `>= ${min.toFixed(1)}`}
                </span>
              </div>
            ))}
          </div>
          <p className="font-body text-xs text-text-dim mt-3">
            Cac nguong diem nay duoc dung de xac dinh tier cua tuyen thu dua tren rating trung binh.
          </p>
        </div>
      </div>
    </div>
  );
}
