import { useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePlayersStore } from '@/stores/playersStore';
import { useGamesStore } from '@/stores/gamesStore';

const TIER_OPTIONS = [
  { value: '', label: 'Tất cả tier' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'F', label: 'F' },
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Rating' },
  { value: 'displayName', label: 'Tên' },
  { value: 'totalRatings', label: 'Đánh giá' },
  { value: 'rank', label: 'Xếp hạng' },
  { value: 'createdAt', label: 'Ngày tạo' },
];

export function PlayersToolbar() {
  const {
    search, setSearch,
    gameFilter, setGameFilter,
    tierFilter, setTierFilter,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
  } = usePlayersStore();

  const { games, fetchGames } = useGamesStore();

  useEffect(() => {
    if (games.length === 0) fetchGames({ limit: 100 });
  }, []);

  const gameOptions = [
    { value: '', label: 'Tất cả game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Row 1: Search + filters + sort */}
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput
          placeholder="Tìm kiếm tuyển thủ..."
          value={search}
          onChange={setSearch}
          className="flex-1 min-w-[200px]"
        />
        <Select
          options={gameOptions}
          value={gameFilter}
          onChange={setGameFilter}
          className="w-[140px]"
        />
        <Select
          options={TIER_OPTIONS}
          value={tierFilter}
          onChange={setTierFilter}
          className="w-[120px]"
        />
        <Select
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
          className="w-[130px]"
        />
        <button
          type="button"
          title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="h-9 px-2.5 rounded-sm border border-border-subtle bg-bg-elevated text-text-dim hover:text-text-primary hover:border-border-hover transition-colors flex items-center"
        >
          {sortOrder === 'asc'
            ? <ArrowUp className="w-4 h-4" />
            : <ArrowDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Row 2: Status tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Hoạt động</TabsTrigger>
          <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
