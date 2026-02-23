import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { TeamsTable } from './components/TeamsTable';
import { useTeamsStore } from '@/stores/teamsStore';
import type { AdminTeam } from '@/types/admin';

export function TeamsPage() {
  const navigate = useNavigate();
  const {
    teams,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchTeams,
    removeTeam,
    setPage,
    clearError,
  } = useTeamsStore();

  useEffect(() => {
    fetchTeams({ page: 1 });
  }, []);

  async function handleDelete(team: AdminTeam) {
    if (!window.confirm(`Bạn có chắc muốn xóa đội tuyển "${team.name}" không?`)) return;
    try {
      await removeTeam(team.id);
      toast.success(`Đã xóa đội tuyển "${team.name}"`);
    } catch (err: any) {
      toast.error(err.message ?? 'Xóa đội tuyển thất bại');
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Đội tuyển"
        description={`Tổng cộng ${total} đội tuyển`}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/teams/create')}
            className="cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo đội tuyển
          </Button>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="text-danger/70 hover:text-danger text-xs ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTeams({ page: 1 })}
          disabled={isLoading}
          className="cursor-pointer"
        >
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
        </div>
      ) : (
        <TeamsTable
          teams={teams}
          onViewDetail={(team) => navigate(`/teams/${team.id}`)}
          onDelete={handleDelete}
        />
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <span className="text-sm text-text-dim">
            Trang <span className="text-text-primary font-medium">{page}</span> /{' '}
            <span className="text-text-primary font-medium">{totalPages}</span> — {total} đội tuyển
          </span>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
