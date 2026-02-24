import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { GamesTable } from './components/GamesTable';
import { GamesToolbar } from './components/GamesToolbar';
import { useGamesStore } from '@/stores/gamesStore';
import type { AdminGame } from '@/types/admin';

export function GamesPage() {
  const navigate = useNavigate();
  const {
    games,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchGames,
    removeGame,
    setPage,
    clearError,
  } = useGamesStore();

  useEffect(() => {
    fetchGames({ page: 1 });
  }, []);

  async function handleDelete(game: AdminGame) {
    if (!window.confirm(`Bạn có chắc muốn xóa game "${game.name}" không?`)) return;
    try {
      await removeGame(game.id);
      toast.success(`Đã xóa game "${game.name}"`);
    } catch (err: any) {
      toast.error(err.message ?? 'Xóa game thất bại');
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PageHeader
        title="Game"
        description={`Tổng cộng ${total} game`}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/games/create')}
            className="cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Tạo game
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

      <GamesToolbar />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
        </div>
      ) : (
        <GamesTable
          games={games}
          onViewDetail={(game) => navigate(`/games/${game.id}`)}
          onDelete={handleDelete}
        />
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <span className="text-sm text-text-dim">
            Trang <span className="text-text-primary font-medium">{page}</span> /{' '}
            <span className="text-text-primary font-medium">{totalPages}</span> — {total} game
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
