import { Users, Star, Swords, Coins } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataCard } from '@/components/shared/DataCard';
import { RatingTrendChart } from './components/RatingTrendChart';
import { TierDistributionChart } from './components/TierDistributionChart';
import { RecentRatingsTable } from './components/RecentRatingsTable';
import { TopPlayersList } from './components/TopPlayersList';
import { QuickActions } from './components/QuickActions';
import { kpiData } from '@/data/mock-data';
import { formatNumber } from '@/lib/utils';

export function OverviewPage() {
  return (
    <div>
      <PageHeader
        title="Tong quan"
        description="Chao mung tro lai, Admin"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataCard
          icon={Users}
          value={kpiData.totalPlayers.value}
          change={kpiData.totalPlayers.change}
          label={kpiData.totalPlayers.label}
        />
        <DataCard
          icon={Star}
          value={formatNumber(kpiData.totalRatings.value)}
          change={kpiData.totalRatings.change}
          label={kpiData.totalRatings.label}
        />
        <DataCard
          icon={Coins}
          value={formatNumber(kpiData.totalPoints.value)}
          change={kpiData.totalPoints.change}
          label={kpiData.totalPoints.label}
        />
        <DataCard
          icon={Swords}
          value={kpiData.totalMatches.value}
          subtext={`${kpiData.totalMatches.liveCount ?? 0} dang dien ra`}
          label={kpiData.totalMatches.label}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RatingTrendChart />
        <TierDistributionChart />
      </div>

      {/* Table + Top Players */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3">
          <RecentRatingsTable />
        </div>
        <div className="lg:col-span-2">
          <TopPlayersList />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
