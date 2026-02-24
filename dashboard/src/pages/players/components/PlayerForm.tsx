import { useEffect, type ReactNode } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { TierBadge } from '@/components/shared/TierBadge';
import { RatingNumber } from '@/components/shared/RatingNumber';
import { useGamesStore } from '@/stores/gamesStore';
import { useTeamsStore } from '@/stores/teamsStore';
import { cn, formatNumber } from '@/lib/utils';
import type { AdminPlayer } from '@/types/admin';

const playerSchema = z.object({
  displayName: z.string().min(2, 'Tối thiểu 2 ký tự').max(30, 'Tối đa 30 ký tự'),
  realName: z.string().max(50, 'Tối đa 50 ký tự').optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Chỉ cho phép chữ thường, số và dấu -'),
  nationality: z.string().min(1, 'Vui lòng chọn quốc tịch'),
  bio: z.string().max(500, 'Tối đa 500 ký tự').optional(),
  gameId: z.string().min(1, 'Vui lòng chọn game'),
  teamId: z.string().optional(),
  isPro: z.boolean(),
  isActive: z.boolean(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  player?: AdminPlayer;
  onSubmit: (data: PlayerFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

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

export function PlayerForm({ player, onSubmit, onCancel, isSubmitting }: PlayerFormProps) {
  const isEditing = !!player;
  const { games, fetchGames } = useGamesStore();
  const { teams, fetchTeams } = useTeamsStore();

  useEffect(() => {
    if (games.length === 0) fetchGames({ limit: 100 });
    if (teams.length === 0) fetchTeams({ limit: 100 });
  }, []);

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
      teamId: player?.teamId ?? '',
      isPro: player?.isPro ?? true,
      isActive: player?.isActive ?? true,
    },
    mode: 'onChange',
  });

  const watchedDisplayName = watch('displayName');

  // Tự động tạo slug từ tên hiển thị khi tạo mới
  useEffect(() => {
    if (!isEditing && watchedDisplayName) {
      const timer = setTimeout(() => {
        setValue('slug', slugify(watchedDisplayName), { shouldValidate: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [watchedDisplayName, isEditing, setValue]);

  const gameOptions = [
    { value: '', label: 'Chọn game' },
    ...games.map((g) => ({ value: g.id, label: g.name })),
  ];

  const teamOptions = [
    { value: '', label: 'Không có đội' },
    ...teams.map((t) => ({ value: t.id, label: t.tag ? `${t.tag} - ${t.name}` : t.name })),
  ];

  const breadcrumb = isEditing
    ? `Tuyển thủ > ${player.displayName} > Chỉnh sửa`
    : 'Tuyển thủ > Thêm mới';

  const pageTitle = isEditing ? 'Chỉnh sửa tuyển thủ' : 'Thêm tuyển thủ mới';

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs text-text-dim mb-1">{breadcrumb}</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-text-primary">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Huỷ
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isValid || !isDirty || isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </div>

      {/* 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-5">
        {/* CỘT TRÁI */}
        <div className="space-y-5">
          <Card title="Thông tin cơ bản">
            <FormField label="Tên hiển thị" error={errors.displayName?.message} required>
              <Input
                {...register('displayName')}
                placeholder="DragonSlayer99"
                className={cn(errors.displayName && 'border-danger')}
              />
            </FormField>

            <FormField label="Tên thật" error={errors.realName?.message}>
              <Input
                {...register('realName')}
                placeholder="Nguyễn Văn A"
              />
            </FormField>

            <FormField label="Slug" error={errors.slug?.message} required>
              <Input
                {...register('slug')}
                placeholder="dragonslayer99"
                className={cn('font-mono', errors.slug && 'border-danger')}
                readOnly={isEditing}
              />
            </FormField>

            <FormField label="Quốc tịch" error={errors.nationality?.message} required>
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

            <FormField label="Tiểu sử" error={errors.bio?.message}>
              <Textarea
                {...register('bio')}
                placeholder="Giới thiệu ngắn về tuyển thủ..."
                rows={3}
              />
            </FormField>
          </Card>

          <Card title="Thông tin thi đấu">
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

            <FormField label="Đội tuyển" error={errors.teamId?.message}>
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

        {/* CỘT PHẢI */}
        <div className="space-y-5">
          <Card title="Hình ảnh">
            <div className="flex flex-col items-center gap-3">
              <div className="w-[200px] h-[200px] rounded-sm bg-bg-elevated border border-border-subtle flex flex-col items-center justify-center gap-2 text-text-dim">
                <User className="w-12 h-12" />
                <span className="font-mono text-xs">200 x 200</span>
              </div>
              <Button type="button" variant="secondary" size="sm">
                Tải ảnh đại diện
              </Button>
            </div>
          </Card>

          <Card title="Trạng thái">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-text-secondary">Hoạt động</span>
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

            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-text-secondary">Chuyên nghiệp</span>
              <Controller
                name="isPro"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Thống kê chỉ đọc khi chỉnh sửa */}
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
                  <span className="font-body text-xs text-text-dim">Xếp hạng</span>
                  <span className="font-mono text-sm text-text-primary">#{player.rank}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-text-dim">Tổng đánh giá</span>
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
