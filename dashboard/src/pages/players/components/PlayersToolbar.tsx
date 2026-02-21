import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/shared/SearchInput';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { games, gameRoles } from '@/data/mock-data';

interface PlayersToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  gameFilter: string;
  onGameFilterChange: (v: string) => void;
  roleFilter: string;
  onRoleFilterChange: (v: string) => void;
  tierFilter: string;
  onTierFilterChange: (v: string) => void;
  statusFilter: string;
  onStatusFilterChange: (v: string) => void;
}

const TIER_OPTIONS = [
  { value: '', label: 'Tat ca tier' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'F', label: 'F' },
];

export function PlayersToolbar({
  search,
  onSearchChange,
  gameFilter,
  onGameFilterChange,
  roleFilter,
  onRoleFilterChange,
  tierFilter,
  onTierFilterChange,
  statusFilter,
  onStatusFilterChange,
}: PlayersToolbarProps) {
  const gameOptions = [
    { value: '', label: 'Tat ca game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  const availableRoles = gameFilter && gameRoles[gameFilter] ? gameRoles[gameFilter] : [];
  const roleOptions = [
    { value: '', label: 'Tat ca vai tro' },
    ...availableRoles.map((r) => ({ value: r, label: r })),
  ];

  function handleGameChange(v: string) {
    onGameFilterChange(v);
    // reset role when game changes
    if (roleFilter) onRoleFilterChange('');
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Row 1: Search + filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput
          placeholder="Tim kiem tuyen thu..."
          value={search}
          onChange={onSearchChange}
          className="flex-1 min-w-[200px]"
        />
        <Select
          options={gameOptions}
          value={gameFilter}
          onChange={handleGameChange}
          className="w-[130px]"
        />
        <Select
          options={roleOptions}
          value={roleFilter}
          onChange={onRoleFilterChange}
          disabled={!gameFilter}
          className="w-[130px]"
        />
        <Select
          options={TIER_OPTIONS}
          value={tierFilter}
          onChange={onTierFilterChange}
          className="w-[130px]"
        />
      </div>

      {/* Row 2: Status tabs */}
      <Tabs value={statusFilter} onValueChange={onStatusFilterChange}>
        <TabsList>
          <TabsTrigger value="">Tat ca</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
