import { useState } from 'react';
import { mockTeams } from '@/data/mock-data';
import type { AdminTeam } from '@/types/admin';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { TeamsTable } from './components/TeamsTable';
import { TeamRosterSheet } from './components/TeamRosterSheet';
import { Plus } from 'lucide-react';

export function TeamsPage() {
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<AdminTeam | null>(null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockTeams.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.tag.toLowerCase().includes(q) ||
      (t.orgName?.toLowerCase().includes(q) ?? false) ||
      t.region.toLowerCase().includes(q)
    );
  });

  function handleViewRoster(team: AdminTeam) {
    setSelectedTeam(team);
    setRosterOpen(true);
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  function handleConfirmDelete() {
    console.log('Delete team:', deleteId);
    setDeleteId(null);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Doi tuyen"
        description={`Quan ly ${mockTeams.length} doi tuyen`}
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            + Them doi tuyen
          </Button>
        }
      />

      <div className="mb-4">
        <SearchInput
          placeholder="Tim kiem doi tuyen..."
          value={search}
          onChange={setSearch}
          className="max-w-sm"
        />
      </div>

      <div className="bg-bg-card border border-border-subtle rounded-sm overflow-hidden">
        <TeamsTable
          teams={filtered}
          onViewRoster={handleViewRoster}
          onDelete={handleDelete}
        />
      </div>

      <TeamRosterSheet
        team={selectedTeam}
        open={rosterOpen}
        onClose={() => {
          setRosterOpen(false);
          setSelectedTeam(null);
        }}
      />

      <ConfirmDialog
        open={deleteId !== null}
        title="Xoa doi tuyen"
        description="Ban co chac chan muon xoa doi tuyen nay? Hanh dong nay khong the hoan tac."
        confirmText="Xoa"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
