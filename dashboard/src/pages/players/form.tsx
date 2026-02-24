import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlayerForm } from './components/PlayerForm';
import type { PlayerFormValues } from './components/PlayerForm';
import { usePlayersStore } from '@/stores/playersStore';

export function PlayerFormPage() {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedPlayer,
    isLoading,
    isSubmitting,
    fetchPlayerBySlug,
    createPlayer,
    updatePlayer,
    clearSelectedPlayer,
  } = usePlayersStore();

  const isEditing = !!slug;

  useEffect(() => {
    if (slug) {
      fetchPlayerBySlug(slug);
    }
    return () => clearSelectedPlayer();
  }, [slug]);

  async function handleSubmit(data: PlayerFormValues) {
    try {
      if (isEditing && slug) {
        await updatePlayer(slug, {
          displayName: data.displayName,
          realName: data.realName || undefined,
          nationality: data.nationality || undefined,
          isPro: data.isPro,
          isActive: data.isActive,
          gameId: data.gameId,
          teamId: data.teamId || null,
        });
        toast.success('Cập nhật tuyển thủ thành công');
      } else {
        const player = await createPlayer({
          displayName: data.displayName,
          slug: data.slug,
          realName: data.realName || undefined,
          nationality: data.nationality || undefined,
          isPro: data.isPro,
          isActive: data.isActive,
          gameId: data.gameId,
          teamId: data.teamId || undefined,
        });
        toast.success('Tạo tuyển thủ thành công');
        navigate(`/players/${player.slug}/edit`, { replace: true });
        return;
      }
      navigate('/players');
    } catch (err: any) {
      toast.error(err.message ?? 'Có lỗi xảy ra');
    }
  }

  function handleCancel() {
    navigate('/players');
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-text-dim font-mono text-sm">
        Đang tải...
      </div>
    );
  }

  if (isEditing && !isLoading && !selectedPlayer) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display font-bold text-xl text-text-primary mb-2">
          Không tìm thấy tuyển thủ
        </p>
        <p className="font-body text-sm text-text-secondary mb-6">
          Tuyển thủ "{slug}" không tồn tại.
        </p>
        <button
          type="button"
          onClick={() => navigate('/players')}
          className="font-mono text-xs text-accent-acid hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PlayerForm
        player={isEditing ? selectedPlayer ?? undefined : undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
