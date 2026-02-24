import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TeamHistoryEventType, PlayerHistoryEventType, AddTeamHistoryDto, AddPlayerHistoryDto } from '@/types/history';

const inputClass =
  'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

// ─── Team Modal ───────────────────────────────────────────────────────────────

const TEAM_EVENT_OPTIONS: { value: TeamHistoryEventType; label: string }[] = [
  { value: 'ACHIEVEMENT', label: 'Thành tích' },
  { value: 'NAME_CHANGE', label: 'Đổi tên' },
  { value: 'LOGO_CHANGE', label: 'Đổi logo' },
  { value: 'PLAYER_JOIN', label: 'Tuyển thủ gia nhập' },
  { value: 'PLAYER_LEAVE', label: 'Tuyển thủ rời đội' },
  { value: 'ORG_CHANGE', label: 'Đổi tổ chức' },
];

interface AddTeamHistoryModalProps {
  onClose: () => void;
  onSubmit: (dto: AddTeamHistoryDto) => Promise<void>;
}

export function AddTeamHistoryModal({ onClose, onSubmit }: AddTeamHistoryModalProps) {
  const [eventType, setEventType] = useState<TeamHistoryEventType>('ACHIEVEMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [prize, setPrize] = useState('');
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [oldOrgName, setOldOrgName] = useState('');
  const [newOrgName, setNewOrgName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [note, setNote] = useState('');
  const [happenedAt, setHappenedAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    let metadata: Record<string, any> = {};

    if (eventType === 'ACHIEVEMENT') {
      if (!title.trim()) return;
      metadata = {
        title: title.trim(),
        description: description.trim() || undefined,
        placement: placement ? Number(placement) : undefined,
        tournamentName: tournamentName.trim() || undefined,
        prize: prize.trim() || undefined,
      };
    } else if (eventType === 'NAME_CHANGE') {
      metadata = { oldName: oldName.trim(), newName: newName.trim() };
    } else if (eventType === 'LOGO_CHANGE') {
      metadata = {};
    } else if (eventType === 'ORG_CHANGE') {
      metadata = { oldOrgName: oldOrgName.trim() || undefined, newOrgName: newOrgName.trim() || undefined };
    } else if (eventType === 'PLAYER_JOIN' || eventType === 'PLAYER_LEAVE') {
      metadata = { playerName: playerName.trim(), role: 'player' };
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        eventType,
        metadata,
        note: note.trim() || undefined,
        happenedAt: happenedAt || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalWrapper title="Thêm lịch sử đội tuyển" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Loại sự kiện *">
          <select className={inputClass} value={eventType} onChange={(e) => setEventType(e.target.value as TeamHistoryEventType)}>
            {TEAM_EVENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {eventType === 'ACHIEVEMENT' && (
          <>
            <Field label="Tên thành tích *">
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vô địch VPL 2025..." />
            </Field>
            <Field label="Mô tả">
              <textarea className={cn(inputClass, 'resize-none')} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Xếp hạng">
                <input type="number" min={1} className={inputClass} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1" />
              </Field>
              <Field label="Giải thưởng">
                <input className={inputClass} value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="$10,000" />
              </Field>
            </div>
            <Field label="Giải đấu">
              <input className={inputClass} value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
            </Field>
          </>
        )}

        {eventType === 'NAME_CHANGE' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tên cũ">
              <input className={inputClass} value={oldName} onChange={(e) => setOldName(e.target.value)} />
            </Field>
            <Field label="Tên mới">
              <input className={inputClass} value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Field>
          </div>
        )}

        {eventType === 'ORG_CHANGE' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tổ chức cũ">
              <input className={inputClass} value={oldOrgName} onChange={(e) => setOldOrgName(e.target.value)} />
            </Field>
            <Field label="Tổ chức mới">
              <input className={inputClass} value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} />
            </Field>
          </div>
        )}

        {(eventType === 'PLAYER_JOIN' || eventType === 'PLAYER_LEAVE') && (
          <Field label="Tên tuyển thủ">
            <input className={inputClass} value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
          </Field>
        )}

        <Field label="Ngày xảy ra">
          <input type="date" className={inputClass} value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} />
        </Field>

        <Field label="Ghi chú">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuỳ chọn..." />
        </Field>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">Huỷ</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</span> : 'Lưu'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Player Modal ─────────────────────────────────────────────────────────────

const PLAYER_EVENT_OPTIONS: { value: PlayerHistoryEventType; label: string }[] = [
  { value: 'ACHIEVEMENT', label: 'Thành tích' },
  { value: 'DISPLAY_NAME_CHANGE', label: 'Đổi tên hiệu' },
  { value: 'TEAM_JOIN', label: 'Gia nhập đội' },
  { value: 'TEAM_LEAVE', label: 'Rời đội' },
  { value: 'TEAM_TRANSFER', label: 'Chuyển nhượng' },
  { value: 'TIER_CHANGE', label: 'Thay đổi hạng' },
];

interface AddPlayerHistoryModalProps {
  onClose: () => void;
  onSubmit: (dto: AddPlayerHistoryDto) => Promise<void>;
}

export function AddPlayerHistoryModal({ onClose, onSubmit }: AddPlayerHistoryModalProps) {
  const [eventType, setEventType] = useState<PlayerHistoryEventType>('ACHIEVEMENT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [placement, setPlacement] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [prize, setPrize] = useState('');
  const [oldName, setOldName] = useState('');
  const [newName, setNewName] = useState('');
  const [fromTeamName, setFromTeamName] = useState('');
  const [toTeamName, setToTeamName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [oldTier, setOldTier] = useState('');
  const [newTier, setNewTier] = useState('');
  const [note, setNote] = useState('');
  const [happenedAt, setHappenedAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    let metadata: Record<string, any> = {};

    if (eventType === 'ACHIEVEMENT') {
      if (!title.trim()) return;
      metadata = {
        title: title.trim(),
        description: description.trim() || undefined,
        placement: placement ? Number(placement) : undefined,
        tournamentName: tournamentName.trim() || undefined,
        prize: prize.trim() || undefined,
      };
    } else if (eventType === 'DISPLAY_NAME_CHANGE') {
      metadata = { oldName: oldName.trim(), newName: newName.trim() };
    } else if (eventType === 'TEAM_JOIN') {
      metadata = { teamName: teamName.trim(), role: 'player' };
    } else if (eventType === 'TEAM_LEAVE') {
      metadata = { teamName: teamName.trim() };
    } else if (eventType === 'TEAM_TRANSFER') {
      metadata = { fromTeamName: fromTeamName.trim() || undefined, toTeamName: toTeamName.trim() || undefined, role: 'player' };
    } else if (eventType === 'TIER_CHANGE') {
      metadata = { oldTier: oldTier.trim(), newTier: newTier.trim() };
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        eventType,
        metadata,
        note: note.trim() || undefined,
        happenedAt: happenedAt || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ModalWrapper title="Thêm lịch sử tuyển thủ" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Loại sự kiện *">
          <select className={inputClass} value={eventType} onChange={(e) => setEventType(e.target.value as PlayerHistoryEventType)}>
            {PLAYER_EVENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {eventType === 'ACHIEVEMENT' && (
          <>
            <Field label="Tên thành tích *">
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="MVP VPL 2025..." />
            </Field>
            <Field label="Mô tả">
              <textarea className={cn(inputClass, 'resize-none')} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Xếp hạng">
                <input type="number" min={1} className={inputClass} value={placement} onChange={(e) => setPlacement(e.target.value)} placeholder="1" />
              </Field>
              <Field label="Giải thưởng">
                <input className={inputClass} value={prize} onChange={(e) => setPrize(e.target.value)} placeholder="$5,000" />
              </Field>
            </div>
            <Field label="Giải đấu">
              <input className={inputClass} value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
            </Field>
          </>
        )}

        {eventType === 'DISPLAY_NAME_CHANGE' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tên cũ">
              <input className={inputClass} value={oldName} onChange={(e) => setOldName(e.target.value)} />
            </Field>
            <Field label="Tên mới">
              <input className={inputClass} value={newName} onChange={(e) => setNewName(e.target.value)} />
            </Field>
          </div>
        )}

        {(eventType === 'TEAM_JOIN' || eventType === 'TEAM_LEAVE') && (
          <Field label="Tên đội">
            <input className={inputClass} value={teamName} onChange={(e) => setTeamName(e.target.value)} />
          </Field>
        )}

        {eventType === 'TEAM_TRANSFER' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Đội cũ">
              <input className={inputClass} value={fromTeamName} onChange={(e) => setFromTeamName(e.target.value)} />
            </Field>
            <Field label="Đội mới">
              <input className={inputClass} value={toTeamName} onChange={(e) => setToTeamName(e.target.value)} />
            </Field>
          </div>
        )}

        {eventType === 'TIER_CHANGE' && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hạng cũ">
              <input className={inputClass} value={oldTier} onChange={(e) => setOldTier(e.target.value)} placeholder="B" />
            </Field>
            <Field label="Hạng mới">
              <input className={inputClass} value={newTier} onChange={(e) => setNewTier(e.target.value)} placeholder="A" />
            </Field>
          </div>
        )}

        <Field label="Ngày xảy ra">
          <input type="date" className={inputClass} value={happenedAt} onChange={(e) => setHappenedAt(e.target.value)} />
        </Field>

        <Field label="Ghi chú">
          <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tuỳ chọn..." />
        </Field>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting} className="cursor-pointer">Huỷ</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting} className="cursor-pointer">
            {isSubmitting ? <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</span> : 'Lưu'}
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Shared helper components ────────────────────────────────────────────────

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-bg-surface border border-border-subtle rounded-sm shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="font-display font-semibold text-text-primary">{title}</h2>
          <button type="button" onClick={onClose} className="text-text-dim hover:text-text-primary transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-xs text-text-dim uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}
