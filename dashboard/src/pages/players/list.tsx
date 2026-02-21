import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PlayersToolbar } from './components/PlayersToolbar';
import { PlayersTable } from './components/PlayersTable';
import { BulkActionsBar } from './components/BulkActionsBar';
import { mockPlayers } from '@/data/mock-data';
import type { AdminPlayer } from '@/types/admin';

export function PlayersPage() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Filtered data
  const filteredPlayers = useMemo<AdminPlayer[]>(() => {
    let result = [...mockPlayers];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          (p.realName?.toLowerCase().includes(q) ?? false)
      );
    }

    if (gameFilter) {
      result = result.filter((p) => p.gameId === gameFilter);
    }

    if (roleFilter) {
      result = result.filter((p) => p.role === roleFilter);
    }

    if (tierFilter) {
      result = result.filter((p) => p.tier === tierFilter);
    }

    if (statusFilter === 'active') {
      result = result.filter((p) => p.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter((p) => !p.isActive);
    }

    return result;
  }, [search, gameFilter, roleFilter, tierFilter, statusFilter]);

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  const selectedCount = selectedIds.length;

  function handleEdit(id: string) {
    navigate(`/players/${id}/edit`);
  }

  function handleDeleteRequest(id: string) {
    setDeleteTarget(id);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      console.log('Delete player:', deleteTarget);
      setDeleteTarget(null);
      setRowSelection({});
    }
  }

  function handleBulkDelete() {
    setBulkDeleteOpen(true);
  }

  function handleBulkDeleteConfirm() {
    console.log('Bulk delete players:', selectedIds);
    setBulkDeleteOpen(false);
    setRowSelection({});
  }

  function handleToggleStatus() {
    console.log('Toggle status for players:', selectedIds);
    setRowSelection({});
  }

  function handleClearSelection() {
    setRowSelection({});
  }

  const deletingPlayer = deleteTarget
    ? mockPlayers.find((p) => p.id === deleteTarget)
    : null;

  return (
    <div className="pb-20">
      <PageHeader
        title="Tuyen thu"
        description="Quan ly 2,547 tuyen thu"
        actions={
          <Link to="/players/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Them tuyen thu
            </Button>
          </Link>
        }
      />

      <PlayersToolbar
        search={search}
        onSearchChange={setSearch}
        gameFilter={gameFilter}
        onGameFilterChange={setGameFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        tierFilter={tierFilter}
        onTierFilterChange={setTierFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <PlayersTable
        data={filteredPlayers}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={handleBulkDelete}
        onToggleStatus={handleToggleStatus}
        onClear={handleClearSelection}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Xoa tuyen thu"
        description={
          deletingPlayer
            ? `Ban co chac chan muon xoa tuyen thu "${deletingPlayer.displayName}"? Hanh dong nay khong the hoan tac.`
            : 'Ban co chac chan muon xoa tuyen thu nay?'
        }
        confirmText="Xoa"
        variant="destructive"
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteOpen(false)}
        title="Xoa nhieu tuyen thu"
        description={`Ban co chac chan muon xoa ${selectedCount} tuyen thu da chon? Hanh dong nay khong the hoan tac.`}
        confirmText="Xoa tat ca"
        variant="destructive"
      />
    </div>
  );
}
