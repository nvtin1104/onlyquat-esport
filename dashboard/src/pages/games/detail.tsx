import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useGamesStore } from '@/stores/gamesStore';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 bg-border-subtle rounded-sm" />
      <div className="h-64 bg-border-subtle rounded-sm" />
    </div>
  );
}

export function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedGame, isLoading, isSubmitting, error, fetchGameById, updateGame, clearError } =
    useGamesStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [rolesInput, setRolesInput] = useState('');

  useEffect(() => {
    if (id) fetchGameById(id);
  }, [id]);

  useEffect(() => {
    if (selectedGame) {
      setName(selectedGame.name);
      setShortName(selectedGame.shortName);
      setLogo(selectedGame.logo ?? '');
      setWebsite(selectedGame.website ?? '');
      setRolesInput(selectedGame.roles.join(', '));
    }
  }, [selectedGame]);

  async function handleSave() {
    if (!selectedGame) return;
    clearError();
    const roles = rolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    try {
      await updateGame(selectedGame.id, {
        name: name.trim(),
        shortName: shortName.trim(),
        logo: logo.trim() || undefined,
        website: website.trim() || undefined,
        roles,
      });
      toast.success('Đã cập nhật game');
      setEditing(false);
    } catch {
      // error set in store
    }
  }

  function handleCancel() {
    if (selectedGame) {
      setName(selectedGame.name);
      setShortName(selectedGame.shortName);
      setLogo(selectedGame.logo ?? '');
      setWebsite(selectedGame.website ?? '');
      setRolesInput(selectedGame.roles.join(', '));
    }
    setEditing(false);
    clearError();
  }

  if (isLoading && !selectedGame) return <DetailSkeleton />;

  if (!selectedGame && !isLoading) {
    return (
      <div className="text-center py-16 text-text-dim">
        <p>Không tìm thấy game.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/games')} className="mt-4 cursor-pointer">
          Quay lại
        </Button>
      </div>
    );
  }

  const game = selectedGame!;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/games')}
          className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={game.name}
          description={`${game.shortName} · Tạo ${format(new Date(game.createdAt), 'dd/MM/yyyy')}`}
        />
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="ml-auto cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Chỉnh sửa
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-danger/70 hover:text-danger text-xs ml-4 cursor-pointer">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Logo */}
        <div className="bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col items-center gap-4">
          {editing ? (
            <ImageUpload
              value={logo}
              onChange={setLogo}
              folder="games"
              shape="square"
              size="lg"
              hint="PNG, JPG · tối đa 10 MB"
            />
          ) : (
            <div className="w-24 h-24 rounded-sm bg-bg-elevated overflow-hidden flex items-center justify-center">
              {game.logo ? (
                <img src={game.logo} alt={game.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-3xl text-text-dim">{game.name.charAt(0)}</span>
              )}
            </div>
          )}
          <div className="text-center">
            <p className="font-display font-bold text-text-primary">{game.name}</p>
            <p className="text-xs text-text-dim font-mono mt-0.5">{game.shortName}</p>
          </div>
          {game.website && !editing && (
            <a
              href={game.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-acid hover:underline truncate max-w-full"
            >
              {game.website}
            </a>
          )}
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6 space-y-5">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên game <span className="text-danger">*</span></label>
                <input type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên viết tắt <span className="text-danger">*</span></label>
                <input type="text" className={inputClass} value={shortName} onChange={(e) => setShortName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Website</label>
                <input type="url" className={inputClass} placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Vai trò (phân cách bởi dấu phẩy)</label>
                <input type="text" className={inputClass} placeholder="Duelist, Controller, ..." value={rolesInput} onChange={(e) => setRolesInput(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting} className="cursor-pointer">
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Huỷ
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className={cn('w-3.5 h-3.5 animate-spin')} />Đang lưu...</span>
                  ) : (
                    <><Check className="w-3.5 h-3.5 mr-1.5" />Lưu thay đổi</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Tên game" value={game.name} />
              <InfoRow label="Tên viết tắt" value={game.shortName} />
              <InfoRow label="Website" value={game.website ?? '—'} />
              <InfoRow label="Tổ chức" value={game.organization?.name ?? '—'} />
              <div>
                <span className="font-mono text-xs text-text-dim uppercase tracking-wide block mb-2">Vai trò</span>
                {game.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {game.roles.map((r) => (
                      <Badge key={r} variant="default">{r}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-dim text-sm">—</span>
                )}
              </div>
              <InfoRow label="Ngày tạo" value={format(new Date(game.createdAt), 'dd/MM/yyyy HH:mm')} />
              <InfoRow label="Cập nhật" value={format(new Date(game.updatedAt), 'dd/MM/yyyy HH:mm')} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border-subtle/50 last:border-0">
      <span className="font-mono text-xs text-text-dim uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-text-primary text-right">{value}</span>
    </div>
  );
}
