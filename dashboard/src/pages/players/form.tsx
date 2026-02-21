import { useParams, useNavigate } from 'react-router-dom';
import { PlayerForm } from './components/PlayerForm';
import type { PlayerFormValues } from './components/PlayerForm';
import { mockPlayers } from '@/data/mock-data';

export function PlayerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const player = id ? mockPlayers.find((p) => p.id === id) : undefined;

  function handleSubmit(data: PlayerFormValues) {
    console.log(id ? 'Update player:' : 'Create player:', data);
    navigate('/players');
  }

  function handleCancel() {
    navigate('/players');
  }

  // 404-like handling: if id provided but player not found
  if (id && !player) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-display font-bold text-xl text-text-primary mb-2">
          Khong tim thay tuyen thu
        </p>
        <p className="font-body text-sm text-text-secondary mb-6">
          Tuyen thu voi ID "{id}" khong ton tai.
        </p>
        <button
          type="button"
          onClick={() => navigate('/players')}
          className="font-mono text-xs text-accent-acid hover:underline"
        >
          Quay lai danh sach
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <PlayerForm
        player={player}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
