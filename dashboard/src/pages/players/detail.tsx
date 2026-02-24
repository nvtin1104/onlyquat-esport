import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, User, Pencil, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { AvatarPicker } from '@/components/shared/AvatarPicker';
import { TierBadge } from '@/components/shared/TierBadge';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GameBadge } from '@/components/shared/GameBadge';
import { RatingNumber } from '@/components/shared/RatingNumber';
import { Button } from '@/components/ui/Button';
import { usePlayersStore } from '@/stores/playersStore';
import { useGamesStore } from '@/stores/gamesStore';
import { useTeamsStore } from '@/stores/teamsStore';
import { cn, formatNumber } from '@/lib/utils';

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputClass =
  'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

// ─── Schema ───────────────────────────────────────────────────────────────────

const updatePlayerSchema = z.object({
  displayName: z.string().min(2, 'Tối thiểu 2 ký tự').max(30, 'Tối đa 30 ký tự'),
  realName: z.string().max(50, 'Tối đa 50 ký tự').optional(),
  nationality: z.string().optional(),
  imageUrl: z.string().optional(),
  gameId: z.string().min(1, 'Vui lòng chọn game'),
  teamId: z.string().optional(),
  isPro: z.boolean(),
  isActive: z.boolean(),
});

type UpdatePlayerFormData = z.infer<typeof updatePlayerSchema>;

// ─── Constants ────────────────────────────────────────────────────────────────

const NATIONALITY_OPTIONS = [
  { value: '', label: 'Chọn quốc tịch' },
  { value: 'VN', label: 'Việt Nam' },
  { value: 'KR', label: 'Hàn Quốc' },
  { value: 'CN', label: 'Trung Quốc' },
  { value: 'JP', label: 'Nhật Bản' },
  { value: 'TH', label: 'Thái Lan' },
  { value: 'PH', label: 'Philippines' },
  { value: 'other', label: 'Khác' },
];

const NATIONALITY_MAP: Record<string, string> = {
  VN: 'Việt Nam',
  KR: 'Hàn Quốc',
  CN: 'Trung Quốc',
  JP: 'Nhật Bản',
  TH: 'Thái Lan',
  PH: 'Philippines',
  other: 'Khác',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-border-subtle shrink-0" />
        <div className="flex-1 flex flex-col items-center md:items-start gap-2">
          <div className="w-48 h-5 rounded-sm bg-border-subtle" />
          <div className="w-32 h-4 rounded-sm bg-border-subtle/70" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-16 rounded-sm bg-border-subtle" />
            <div className="h-5 w-16 rounded-sm bg-border-subtle" />
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-40">
          <div className="h-8 w-full rounded-sm bg-border-subtle" />
          <div className="h-8 w-full rounded-sm bg-border-subtle/60" />
        </div>
      </div>
      <div className="bg-bg-surface border border-border-subtle rounded-sm p-6 space-y-4">
        <div className="h-3 w-32 rounded-sm bg-border-subtle" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-border-subtle">
            <div className="h-2.5 w-20 rounded-sm bg-border-subtle" />
            <div className="h-3 w-36 rounded-sm bg-border-subtle/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border-subtle last:border-0">
      <span className="text-xs text-text-dim font-mono uppercase tracking-wide shrink-0">{label}</span>
      <div className="text-right max-w-xs ml-4">{children}</div>
    </div>
  );
}

// ─── PlayerAvatar ─────────────────────────────────────────────────────────────

function PlayerAvatar({ src, name, size = 'xl' }: { src?: string | null; name: string; size?: 'sm' | 'lg' | 'xl' }) {
  const [imgError, setImgError] = useState(false);
  const sizeMap = { sm: 'w-8 h-8', lg: 'w-16 h-16', xl: 'w-20 h-20' } as const;
  const iconMap = { sm: 'w-4 h-4', lg: 'w-6 h-6', xl: 'w-8 h-8' } as const;
  return (
    <div className={cn('rounded-full bg-bg-elevated overflow-hidden flex items-center justify-center shrink-0', sizeMap[size])}>
      {src && !imgError ? (
        <img src={src} alt={name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
      ) : (
        <User className={cn('text-text-dim', iconMap[size])} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PlayerDetailPage() {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    selectedPlayer: player,
    isLoading,
    isSubmitting,
    error,
    fetchPlayerBySlug,
    updatePlayer,
    removePlayer,
    clearSelectedPlayer,
  } = usePlayersStore();

  const { games, fetchGames } = useGamesStore();
  const { teams, fetchTeams } = useTeamsStore();

  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdatePlayerFormData>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      displayName: '',
      realName: '',
      nationality: '',
      imageUrl: '',
      gameId: '',
      teamId: '',
      isPro: true,
      isActive: true,
    },
  });

  useEffect(() => {
    if (slug) fetchPlayerBySlug(slug);
    if (games.length === 0) fetchGames({ limit: 100 });
    if (teams.length === 0) fetchTeams({ limit: 100 });
    return () => clearSelectedPlayer();
  }, [slug]);

  useEffect(() => {
    if (player && editMode) {
      reset({
        displayName: player.displayName,
        realName: player.realName ?? '',
        nationality: player.nationality ?? '',
        imageUrl: player.imageUrl ?? '',
        gameId: player.gameId,
        teamId: player.teamId ?? '',
        isPro: player.isPro,
        isActive: player.isActive,
      });
    }
  }, [player, editMode, reset]);

  async function onSubmit(data: UpdatePlayerFormData) {
    if (!player) return;
    try {
      await updatePlayer(player.slug, {
        displayName: data.displayName,
        realName: data.realName || undefined,
        nationality: data.nationality || undefined,
        imageUrl: data.imageUrl || undefined,
        gameId: data.gameId,
        teamId: data.teamId || null,
        isPro: data.isPro,
        isActive: data.isActive,
      });
      toast.success('Đã cập nhật tuyển thủ');
      setEditMode(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Cập nhật thất bại');
    }
  }

  async function handleDelete() {
    if (!player) return;
    if (!window.confirm(`Bạn có chắc muốn xóa tuyển thủ "${player.displayName}" không?`)) return;
    try {
      await removePlayer(player.slug);
      toast.success(`Đã xóa tuyển thủ "${player.displayName}"`);
      navigate('/players');
    } catch (err: any) {
      toast.error(err.message ?? 'Xóa tuyển thủ thất bại');
    }
  }

  function cancelEdit() {
    setEditMode(false);
    reset();
  }

  const gameOptions = [
    { value: '', label: 'Chọn game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  const teamOptions = [
    { value: '', label: 'Không có đội' },
    ...teams.map((t) => ({ value: t.id, label: t.tag ? `${t.tag} - ${t.name}` : t.name })),
  ];

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/players')}
            className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <PageHeader title="Chi tiết tuyển thủ" description="Đang tải..." />
        </div>
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="w-8 h-8 text-danger" />
        <p className="text-text-secondary">{error ?? 'Không tìm thấy tuyển thủ'}</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/players')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/players')}
          className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader title="Chi tiết tuyển thủ" description={`Slug: ${player.slug}`} />
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Hero Card ─────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-acid/10 to-transparent pointer-events-none opacity-50 dark:opacity-20" />

          <PlayerAvatar src={player.imageUrl} name={player.displayName} size="xl" />

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
            <h1 className="font-bold text-text-primary text-2xl tracking-tight">
              {player.displayName}
            </h1>
            {player.realName && (
              <p className="text-sm text-text-secondary mt-0.5">{player.realName}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center md:justify-start">
              <TierBadge tier={player.tier} size="sm" />
              {player.game && <GameBadge game={player.game.shortName} />}
              <StatusBadge status={player.isActive ? 'active' : 'inactive'} />
              {player.isPro && (
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-accent-acid/10 border border-accent-acid/20 text-accent-acid uppercase tracking-wide">
                  Pro
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 z-10 w-full md:w-40 mt-4 md:mt-0">
            {!editMode ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer"
                  onClick={cancelEdit}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Huỷ
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 cursor-pointer"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full cursor-pointer"
              disabled={isSubmitting}
              onClick={handleDelete}
            >
              Xóa tuyển thủ
            </Button>
          </div>
        </div>

        {/* ── Details / Edit Form ──────────────────────────────────── */}
        <div className="bg-bg-surface border border-border-subtle rounded-sm p-6 w-full">
          <p className="font-mono text-xs text-text-dim uppercase tracking-wide mb-4">
            Thông tin tuyển thủ
          </p>

          {editMode ? (
            <div className="space-y-4">
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <AvatarPicker
                    label="Ảnh đại diện"
                    name={player.displayName}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    folder="players"
                    shape="circle"
                    size="xl"
                    hint="PNG, JPG · tối đa 5 MB"
                  />
                )}
              />

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                  Tên hiển thị <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={cn(inputClass, errors.displayName && 'border-danger focus:border-danger')}
                  {...register('displayName')}
                />
                {errors.displayName && <p className="text-xs text-danger">{errors.displayName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên thật</label>
                <input
                  type="text"
                  className={cn(inputClass)}
                  {...register('realName')}
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Quốc tịch</label>
                <select className={cn(inputClass)} {...register('nationality')}>
                  {NATIONALITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                  Game <span className="text-danger">*</span>
                </label>
                <select
                  className={cn(inputClass, errors.gameId && 'border-danger focus:border-danger')}
                  {...register('gameId')}
                >
                  {gameOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                {errors.gameId && <p className="text-xs text-danger">{errors.gameId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Đội tuyển</label>
                <select className={cn(inputClass)} {...register('teamId')}>
                  {teamOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="isPro"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded accent-accent-acid cursor-pointer"
                      />
                    )}
                  />
                  <span className="font-mono text-xs text-text-dim uppercase tracking-wide">Chuyên nghiệp</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4 rounded accent-accent-acid cursor-pointer"
                      />
                    )}
                  />
                  <span className="font-mono text-xs text-text-dim uppercase tracking-wide">Hoạt động</span>
                </label>
              </div>
            </div>
          ) : (
            <>
              <DetailRow label="ID">
                <span className="font-mono text-xs text-text-secondary break-all">{player.id}</span>
              </DetailRow>
              <DetailRow label="Slug">
                <span className="font-mono text-xs text-text-secondary">{player.slug}</span>
              </DetailRow>
              <DetailRow label="Tên hiển thị">
                <span className="text-sm text-text-primary">{player.displayName}</span>
              </DetailRow>
              <DetailRow label="Tên thật">
                <span className="text-sm text-text-secondary">{player.realName ?? '—'}</span>
              </DetailRow>
              <DetailRow label="Quốc tịch">
                <span className="text-sm text-text-secondary">
                  {player.nationality ? (NATIONALITY_MAP[player.nationality] ?? player.nationality) : '—'}
                </span>
              </DetailRow>
              <DetailRow label="Game">
                {player.game ? (
                  <GameBadge game={player.game.shortName} />
                ) : (
                  <span className="text-sm text-text-dim">—</span>
                )}
              </DetailRow>
              <DetailRow label="Đội tuyển">
                {player.team ? (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-bg-elevated text-text-secondary border border-border-subtle">
                    {player.team.name}
                  </span>
                ) : (
                  <span className="text-sm text-text-dim">—</span>
                )}
              </DetailRow>
              <DetailRow label="Tier">
                <TierBadge tier={player.tier} size="sm" />
              </DetailRow>
              <DetailRow label="Rating">
                <RatingNumber value={player.rating} size="sm" />
              </DetailRow>
              <DetailRow label="Xếp hạng">
                <span className="font-mono text-sm text-text-primary">#{player.rank}</span>
              </DetailRow>
              <DetailRow label="Tổng đánh giá">
                <span className="font-mono text-sm text-text-secondary">{formatNumber(player.totalRatings)}</span>
              </DetailRow>
              <DetailRow label="Mechanics">
                <span className="font-mono text-sm text-text-secondary">{player.mechanics}</span>
              </DetailRow>
              <DetailRow label="Tactics">
                <span className="font-mono text-sm text-text-secondary">{player.tactics}</span>
              </DetailRow>
              <DetailRow label="Composure">
                <span className="font-mono text-sm text-text-secondary">{player.composure}</span>
              </DetailRow>
              <DetailRow label="Teamwork">
                <span className="font-mono text-sm text-text-secondary">{player.teamwork}</span>
              </DetailRow>
              <DetailRow label="Consistency">
                <span className="font-mono text-sm text-text-secondary">{player.consistency}</span>
              </DetailRow>
              <DetailRow label="Chuyên nghiệp">
                <span className={cn('font-mono text-xs', player.isPro ? 'text-accent-acid' : 'text-text-dim')}>
                  {player.isPro ? 'Có' : 'Không'}
                </span>
              </DetailRow>
              <DetailRow label="Trạng thái">
                <StatusBadge status={player.isActive ? 'active' : 'inactive'} />
              </DetailRow>
              <DetailRow label="Ngày tạo">
                <span className="text-xs text-text-dim">
                  {format(new Date(player.createdAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </DetailRow>
              <DetailRow label="Cập nhật">
                <span className="text-xs text-text-dim">
                  {format(new Date(player.updatedAt), 'dd/MM/yyyy HH:mm')}
                </span>
              </DetailRow>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
