import { ArrowUp, ArrowDown } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { useGamesStore } from '@/stores/gamesStore';

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên game' },
  { value: 'createdAt', label: 'Ngày tạo' },
];

export function GamesToolbar() {
  const {
    search, setSearch,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
  } = useGamesStore();

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <SearchInput
        placeholder="Tìm kiếm game..."
        value={search}
        onChange={setSearch}
        className="flex-1 min-w-[200px]"
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
  );
}
