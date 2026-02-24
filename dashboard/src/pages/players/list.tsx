import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RowSelectionState } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { PlayersToolbar } from './components/PlayersToolbar';
import { PlayersTable } from './components/PlayersTable';
import { BulkActionsBar } from './components/BulkActionsBar';
import { usePlayersStore } from '@/stores/playersStore';

export function PlayersPage() {
  const navigate = useNavigate();
  const {
    players,
    total,
    page,
    limit,
    isLoading,
    fetchPlayers,
    removePlayer,
    setPage,
  } = usePlayersStore();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const selectedSlugs = Object.keys(rowSelection).filter((s) => rowSelection[s]);
  const selectedCount = selectedSlugs.length;

  function handleEdit(slug: string) {
    navigate(`/players/${slug}/edit`);
  }

  function handleDeleteRequest(slug: string) {
    setDeleteTarget(slug);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await removePlayer(deleteTarget);
      toast.success('Đã xoá tuyển thủ');
    } catch {
      toast.error('Xoá tuyển thủ thất bại');
    } finally {
      setDeleteTarget(null);
      setRowSelection({});
    }
  }

  async function handleBulkDeleteConfirm() {
    setBulkDeleteOpen(false);
    let successCount = 0;
    for (const slug of selectedSlugs) {
      try {
        await removePlayer(slug);
        successCount++;
      } catch {
        // tiếp tục
      }
    }
    if (successCount > 0) toast.success(`Đã xoá ${successCount} tuyển thủ`);
    setRowSelection({});
  }

  function handleToggleStatus() {
    toast.info('Tính năng đang phát triển');
    setRowSelection({});
  }

  const deletingPlayer = deleteTarget
    ? players.find((p) => p.slug === deleteTarget)
    : null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="pb-20">
      <PageHeader
        title="Tuyển thủ"
        description={`Quản lý ${total} tuyển thủ`}
        actions={
          <Link to="/players/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Thêm tuyển thủ
            </Button>
          </Link>
        }
      />

      <PlayersToolbar />

      <PlayersTable
        data={players}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedCount}
        onDelete={() => setBulkDeleteOpen(true)}
        onToggleStatus={handleToggleStatus}
        onClear={() => setRowSelection({})}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Xoá tuyển thủ"
        description={
          deletingPlayer
            ? `Bạn có chắc chắn muốn xoá tuyển thủ "${deletingPlayer.displayName}"? Hành động này không thể hoàn tác.`
            : 'Bạn có chắc chắn muốn xoá tuyển thủ này?'
        }
        confirmText="Xoá"
        variant="destructive"
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteOpen(false)}
        title="Xoá nhiều tuyển thủ"
        description={`Bạn có chắc chắn muốn xoá ${selectedCount} tuyển thủ đã chọn? Hành động này không thể hoàn tác.`}
        confirmText="Xoá tất cả"
        variant="destructive"
      />
    </div>
  );
}
