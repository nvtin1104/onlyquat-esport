import { format } from 'date-fns';
import {
  Pencil,
  Image,
  Trophy,
  UserPlus,
  UserMinus,
  Building2,
  ArrowRightLeft,
  TrendingUp,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import type { TeamHistoryItem, PlayerHistoryItem, TeamHistoryEventType, PlayerHistoryEventType } from '@/types/history';

type HistoryItem = TeamHistoryItem | PlayerHistoryItem;

// ─── Event config ────────────────────────────────────────────────────────────

type EventConfig = { icon: React.ReactNode; label: string; color: string };

const TEAM_EVENT_CONFIG: Record<TeamHistoryEventType, EventConfig> = {
  NAME_CHANGE:  { icon: <Pencil className="w-3.5 h-3.5" />, label: 'Đổi tên',         color: 'text-blue-400 bg-blue-400/10' },
  LOGO_CHANGE:  { icon: <Image className="w-3.5 h-3.5" />,  label: 'Đổi logo',         color: 'text-purple-400 bg-purple-400/10' },
  ACHIEVEMENT:  { icon: <Trophy className="w-3.5 h-3.5" />, label: 'Thành tích',        color: 'text-yellow-400 bg-yellow-400/10' },
  PLAYER_JOIN:  { icon: <UserPlus className="w-3.5 h-3.5" />,  label: 'Tuyển thủ gia nhập', color: 'text-green-400 bg-green-400/10' },
  PLAYER_LEAVE: { icon: <UserMinus className="w-3.5 h-3.5" />, label: 'Tuyển thủ rời đội',  color: 'text-red-400 bg-red-400/10' },
  ORG_CHANGE:   { icon: <Building2 className="w-3.5 h-3.5" />, label: 'Đổi tổ chức',       color: 'text-orange-400 bg-orange-400/10' },
};

const PLAYER_EVENT_CONFIG: Record<PlayerHistoryEventType, EventConfig> = {
  DISPLAY_NAME_CHANGE: { icon: <Pencil className="w-3.5 h-3.5" />,        label: 'Đổi tên hiệu',    color: 'text-blue-400 bg-blue-400/10' },
  TEAM_JOIN:           { icon: <UserPlus className="w-3.5 h-3.5" />,       label: 'Gia nhập đội',    color: 'text-green-400 bg-green-400/10' },
  TEAM_LEAVE:          { icon: <UserMinus className="w-3.5 h-3.5" />,      label: 'Rời đội',          color: 'text-red-400 bg-red-400/10' },
  TEAM_TRANSFER:       { icon: <ArrowRightLeft className="w-3.5 h-3.5" />, label: 'Chuyển nhượng',    color: 'text-accent-acid bg-accent-acid/10' },
  ACHIEVEMENT:         { icon: <Trophy className="w-3.5 h-3.5" />,         label: 'Thành tích',       color: 'text-yellow-400 bg-yellow-400/10' },
  TIER_CHANGE:         { icon: <TrendingUp className="w-3.5 h-3.5" />,     label: 'Thay đổi hạng',   color: 'text-purple-400 bg-purple-400/10' },
};

function renderMetaSummary(item: HistoryItem): string {
  const m = item.metadata;
  if (!m) return '';

  const et = (item as any).eventType as string;

  if (et === 'NAME_CHANGE' || et === 'DISPLAY_NAME_CHANGE') {
    return `${m.oldName ?? '?'} → ${m.newName ?? '?'}`;
  }
  if (et === 'LOGO_CHANGE') return 'Cập nhật logo';
  if (et === 'ORG_CHANGE') {
    if (m.oldOrgName && m.newOrgName) return `${m.oldOrgName} → ${m.newOrgName}`;
    if (m.newOrgName) return `Gia nhập ${m.newOrgName}`;
    if (m.oldOrgName) return `Rời ${m.oldOrgName}`;
    return 'Đổi tổ chức';
  }
  if (et === 'ACHIEVEMENT') {
    const parts = [m.title ?? ''];
    if (m.placement) parts.push(`#${m.placement}`);
    if (m.tournamentName) parts.push(m.tournamentName);
    return parts.filter(Boolean).join(' · ');
  }
  if (et === 'PLAYER_JOIN' || et === 'TEAM_JOIN') return m.playerName ?? m.teamName ?? '';
  if (et === 'PLAYER_LEAVE' || et === 'TEAM_LEAVE') return m.playerName ?? m.teamName ?? '';
  if (et === 'TEAM_TRANSFER') {
    if (m.fromTeamName && m.toTeamName) return `${m.fromTeamName} → ${m.toTeamName}`;
    if (m.toTeamName) return `Chuyển tới ${m.toTeamName}`;
    if (m.fromTeamName) return `Rời ${m.fromTeamName}`;
    return 'Chuyển nhượng';
  }
  if (et === 'TIER_CHANGE') return `${m.oldTier ?? '?'} → ${m.newTier ?? '?'}`;
  return '';
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HistoryTimelineProps {
  items: HistoryItem[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isTeam?: boolean;
  canDelete?: boolean;
  onPageChange: (page: number) => void;
  onDelete?: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HistoryTimeline({
  items,
  total,
  page,
  totalPages,
  isLoading,
  isTeam = true,
  canDelete = false,
  onPageChange,
  onDelete,
}: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-text-dim">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Đang tải lịch sử...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-text-dim text-sm">Chưa có lịch sử nào.</div>
    );
  }

  // Determine config based on isTeam prop
  const configMap = isTeam ? TEAM_EVENT_CONFIG : PLAYER_EVENT_CONFIG;

  return (
    <div className="space-y-0">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle/60" />

        <div className="space-y-0">
          {items.map((item) => {
            const et = (item as any).eventType as string;
            const cfg = (configMap as any)[et] as EventConfig ?? {
              icon: null,
              label: et,
              color: 'text-text-dim bg-border-subtle',
            };
            const summary = renderMetaSummary(item);

            return (
              <div key={item.id} className="relative flex gap-4 pl-2 py-3 group">
                {/* Icon dot */}
                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-text-primary">{cfg.label}</span>
                      {summary && (
                        <span className="ml-2 text-sm text-text-dim truncate">{summary}</span>
                      )}
                      {item.note && (
                        <p className="mt-0.5 text-xs text-text-dim italic">{item.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-text-dim whitespace-nowrap">
                        {format(new Date(item.happenedAt), 'dd/MM/yyyy')}
                      </span>
                      {canDelete && onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-text-dim hover:text-danger transition-all cursor-pointer"
                          title="Xoá"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pt-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}

      <p className="text-xs text-text-dim text-right pt-1">{total} sự kiện</p>
    </div>
  );
}
