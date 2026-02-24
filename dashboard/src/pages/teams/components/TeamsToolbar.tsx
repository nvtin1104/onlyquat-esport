import { useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { SearchInput } from '@/components/shared/SearchInput';
import { Select } from '@/components/ui/Select';
import { useTeamsStore } from '@/stores/teamsStore';
import { getOrganizations } from '@/lib/organizations.api';
import { getRegions } from '@/lib/regions.api';
import { useState } from 'react';
import type { AdminOrganization, AdminRegion } from '@/types/admin';

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên đội' },
  { value: 'createdAt', label: 'Ngày tạo' },
];

export function TeamsToolbar() {
  const {
    search, setSearch,
    organizationFilter, setOrganizationFilter,
    regionFilter, setRegionFilter,
    sortBy, setSortBy,
    sortOrder, setSortOrder,
  } = useTeamsStore();

  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [regions, setRegions] = useState<AdminRegion[]>([]);

  useEffect(() => {
    getOrganizations({ limit: 100 }).then((r) => setOrganizations(r.data)).catch(() => {});
    getRegions({ limit: 100 }).then((r) => setRegions(r.data)).catch(() => {});
  }, []);

  const orgOptions = [
    { value: '', label: 'Tất cả tổ chức' },
    ...organizations.map((o) => ({ value: o.id, label: o.name })),
  ];

  const regionOptions = [
    { value: '', label: 'Tất cả khu vực' },
    ...regions.map((r) => ({ value: r.id, label: r.name })),
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      <SearchInput
        placeholder="Tìm kiếm đội tuyển..."
        value={search}
        onChange={setSearch}
        className="flex-1 min-w-[200px]"
      />
      <Select
        options={orgOptions}
        value={organizationFilter}
        onChange={setOrganizationFilter}
        className="w-[160px]"
      />
      <Select
        options={regionOptions}
        value={regionFilter}
        onChange={setRegionFilter}
        className="w-[150px]"
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
