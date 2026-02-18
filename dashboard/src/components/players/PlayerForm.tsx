import { useEffect, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { TierBadge } from '@/components/shared/TierBadge';
import { RatingNumber } from '@/components/shared/RatingNumber';
import { games, gameRoles, mockTeams } from '@/data/mock-data';
import { cn, formatNumber } from '@/lib/utils';
import type { AdminPlayer } from '@/types/admin';

const playerSchema = z.object({
  displayName: z.string().min(2, 'Toi thieu 2 ky tu').max(30, 'Toi da 30 ky tu'),
  realName: z.string().max(50, 'Toi da 50 ky tu').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Chi cho phep chu thuong, so va dau -'),
  nationality: z.string().min(2, 'Vui long chon quoc tich'),
  bio: z.string().max(500, 'Toi da 500 ky tu').optional(),
  gameId: z.string().min(1, 'Vui long chon game'),
  role: z.string().min(1, 'Vui long chon vai tro'),
  teamId: z.string().optional(),
  isActive: z.boolean(),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  player?: AdminPlayer;
  onSubmit: (data: PlayerFormValues) => void;
  onCancel: () => void;
}

const NATIONALITY_OPTIONS = [
  { value: '', label: 'Chon quoc tich' },
  { value: 'VN', label: 'Viet Nam' },
  { value: 'KR', label: 'Han Quoc' },
  { value: 'CN', label: 'Trung Quoc' },
  { value: 'JP', label: 'Nhat Ban' },
  { value: 'TH', label: 'Thai Lan' },
  { value: 'PH', label: 'Philippines' },
  { value: 'other', label: 'Khac' },
];

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-body text-sm text-text-secondary font-medium">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-sm p-5 space-y-4">
      <h3 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const isEditing = !!player;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      displayName: player?.displayName ?? '',
      realName: player?.realName ?? '',
      slug: player?.slug ?? '',
      nationality: player?.nationality ?? '',
      bio: '',
      gameId: player?.gameId ?? '',
      role: player?.role ?? '',
      teamId: player?.teamId ?? '',
      isActive: player?.isActive ?? true,
    },
    mode: 'onChange',
  });

  const watchedDisplayName = watch('displayName');
  const watchedGameId = watch('gameId');

  // Auto-generate slug from displayName (debounced via useEffect)
  useEffect(() => {
    if (!isEditing && watchedDisplayName) {
      const timer = setTimeout(() => {
        setValue('slug', slugify(watchedDisplayName), { shouldValidate: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [watchedDisplayName, isEditing, setValue]);

  // Reset role when game changes
  useEffect(() => {
    setValue('role', '', { shouldValidate: false });
  }, [watchedGameId, setValue]);

  const roleOptions = watchedGameId && gameRoles[watchedGameId]
    ? gameRoles[watchedGameId].map((r) => ({ value: r, label: r }))
    : [];

  const gameOptions = [
    { value: '', label: 'Chon game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  const teamOptions = [
    { value: '', label: 'Khong co doi' },
    ...mockTeams.map((t) => ({ value: t.id, label: `${t.tag} - ${t.name}` })),
  ];

  const breadcrumb = isEditing
    ? `Tuyen thu > ${player.displayName} > Chinh sua`
    : 'Tuyen thu > Them moi';

  const pageTitle = isEditing ? 'Chinh sua tuyen thu' : 'Them tuyen thu moi';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs text-text-dim mb-1">{breadcrumb}</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-text-primary">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Huy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || !isDirty}
            >
              Luu
            </Button>
          </div>
        </div>
      </div>

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-5">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <Card title="Thong tin co ban">
            <FormField label="Ten hien thi" error={errors.displayName?.message} required>
              <Input
                {...register('displayName')}
                placeholder="DragonSlayer99"
                className={cn(errors.displayName && 'border-danger')}
              />
            </FormField>

            <FormField label="Ten that" error={errors.realName?.message}>
              <Input
                {...register('realName')}
                placeholder="Nguyen Van A"
              />
            </FormField>

            <FormField label="Slug" error={errors.slug?.message} required>
              <Input
                {...register('slug')}
                placeholder="dragonslayer99"
                className={cn('font-mono', errors.slug && 'border-danger')}
              />
            </FormField>

            <FormField label="Quoc tich" error={errors.nationality?.message} required>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <Select
                    options={NATIONALITY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    className={cn(errors.nationality && 'border-danger')}
                  />
                )}
              />
            </FormField>

            <FormField label="Tieu su" error={errors.bio?.message}>
              <Textarea
                {...register('bio')}
                placeholder="Gioi thieu ngan ve tuyen thu..."
                rows={3}
              />
            </FormField>
          </Card>

          <Card title="Thong tin thi dau">
            <FormField label="Game" error={errors.gameId?.message} required>
              <Controller
                name="gameId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={gameOptions}
                    value={field.value}
                    onChange={field.onChange}
                    className={cn(errors.gameId && 'border-danger')}
                  />
                )}
              />
            </FormField>

            <FormField label="Vai tro" error={errors.role?.message} required>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[{ value: '', label: 'Chon vai tro' }, ...roleOptions]}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={!watchedGameId}
                    className={cn(errors.role && 'border-danger')}
                  />
                )}
              />
            </FormField>

            <FormField label="Doi tuyen" error={errors.teamId?.message}>
              <Controller
                name="teamId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={teamOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          <Card title="Hinh anh">
            {/* Avatar preview */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-[200px] h-[200px] rounded-sm bg-bg-elevated border border-border-subtle flex flex-col items-center justify-center gap-2 text-text-dim">
                <User className="w-12 h-12" />
                <span className="font-mono text-xs">200 x 200</span>
              </div>
              <Button type="button" variant="secondary" size="sm">
                Tai anh dai dien
              </Button>
            </div>

            {/* Banner preview */}
            <div className="space-y-2 mt-2">
              <div className="w-full h-20 rounded-sm bg-bg-elevated border border-border-subtle flex flex-col items-center justify-center gap-1 text-text-dim">
                <ImageIcon className="w-6 h-6" />
                <span className="font-mono text-xs">Banner</span>
              </div>
              <Button type="button" variant="secondary" size="sm" className="w-full">
                Tai banner
              </Button>
            </div>
          </Card>

          <Card title="Trang thai">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-text-secondary">Hoat dong</span>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Read-only stats when editing */}
            {isEditing && player && (
              <div className="space-y-3 pt-3 border-t border-border-subtle mt-1">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-text-dim">Rating</span>
                  <RatingNumber value={player.rating} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-text-dim">Tier</span>
                  <TierBadge tier={player.tier} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-text-dim">Xep hang</span>
                  <span className="font-mono text-sm text-text-primary">#{player.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-text-dim">Tong danh gia</span>
                  <span className="font-mono text-sm text-text-secondary">
                    {formatNumber(player.totalRatings)}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}

export type { PlayerFormValues };
