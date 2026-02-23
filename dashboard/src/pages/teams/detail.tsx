import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTeamsStore } from '@/stores/teamsStore';
import { getRegions } from '@/lib/regions.api';
import { getOrganizations } from '@/lib/organizations.api';
import { cn } from '@/lib/utils';
import type { AdminRegion, AdminOrganization } from '@/types/admin';

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

export function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTeam, isLoading, isSubmitting, error, fetchTeamById, updateTeam, clearError } =
    useTeamsStore();

  const [editing, setEditing] = useState(false);
  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [regionId, setRegionId] = useState('');

  useEffect(() => {
    if (id) fetchTeamById(id);
    getRegions({ limit: 100 }).then((res) => setRegions(res.data)).catch(() => {});
    getOrganizations({ limit: 100 }).then((res) => setOrganizations(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (selectedTeam) {
      setName(selectedTeam.name);
      setTag(selectedTeam.tag ?? '');
      setLogo(selectedTeam.logo ?? '');
      setWebsite(selectedTeam.website ?? '');
      setDescription(selectedTeam.description ?? '');
      setOrganizationId(selectedTeam.organizationId ?? '');
      setRegionId(selectedTeam.regionId ?? '');
    }
  }, [selectedTeam]);

  async function handleSave() {
    if (!selectedTeam) return;
    clearError();
    try {
      await updateTeam(selectedTeam.id, {
        name: name.trim(),
        tag: tag.trim() || undefined,
        logo: logo.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        organizationId: organizationId || null,
        regionId: regionId || null,
      });
      toast.success('Đã cập nhật đội tuyển');
      setEditing(false);
    } catch {
      // error set in store
    }
  }

  function handleCancel() {
    if (selectedTeam) {
      setName(selectedTeam.name);
      setTag(selectedTeam.tag ?? '');
      setLogo(selectedTeam.logo ?? '');
      setWebsite(selectedTeam.website ?? '');
      setDescription(selectedTeam.description ?? '');
      setOrganizationId(selectedTeam.organizationId ?? '');
      setRegionId(selectedTeam.regionId ?? '');
    }
    setEditing(false);
    clearError();
  }

  if (isLoading && !selectedTeam) return <DetailSkeleton />;

  if (!selectedTeam && !isLoading) {
    return (
      <div className="text-center py-16 text-text-dim">
        <p>Không tìm thấy đội tuyển.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/teams')} className="mt-4 cursor-pointer">
          Quay lại
        </Button>
      </div>
    );
  }

  const team = selectedTeam!;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/teams')}
          className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader
          title={team.name}
          description={`${team.tag ? `[${team.tag}] · ` : ''}Tạo ${format(new Date(team.createdAt), 'dd/MM/yyyy')}`}
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
              folder="teams"
              shape="square"
              size="xl"
              hint="PNG, JPG · tối đa 10 MB"
            />
          ) : (
            <div className="w-24 h-24 rounded-sm bg-bg-elevated overflow-hidden flex items-center justify-center">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display font-bold text-3xl text-text-dim">{team.name.charAt(0)}</span>
              )}
            </div>
          )}
          <div className="text-center">
            <p className="font-display font-bold text-text-primary">{team.name}</p>
            {team.tag && <Badge variant="default" className="mt-1">[{team.tag}]</Badge>}
          </div>
          {team.website && !editing && (
            <a
              href={team.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent-acid hover:underline truncate max-w-full"
            >
              {team.website}
            </a>
          )}
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6 space-y-5">
          {editing ? (
            <>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên đội <span className="text-danger">*</span></label>
                <input type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tag</label>
                <input type="text" className={inputClass} placeholder="TF" value={tag} onChange={(e) => setTag(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Website</label>
                <input type="url" className={inputClass} placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả</label>
                <textarea className={cn(inputClass, 'resize-none')} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tổ chức</label>
                <select className={inputClass} value={organizationId} onChange={(e) => setOrganizationId(e.target.value)}>
                  <option value="">-- Không có --</option>
                  {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Khu vực</label>
                <select className={inputClass} value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                  <option value="">-- Không có --</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.code})</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting} className="cursor-pointer">
                  <X className="w-3.5 h-3.5 mr-1.5" />Huỷ
                </Button>
                <Button type="button" variant="primary" size="sm" onClick={handleSave} disabled={isSubmitting} className="cursor-pointer">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />Đang lưu...</span>
                  ) : (
                    <><Check className="w-3.5 h-3.5 mr-1.5" />Lưu thay đổi</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <InfoRow label="Tên đội" value={team.name} />
              <InfoRow label="Tag" value={team.tag ?? '—'} />
              <InfoRow label="Website" value={team.website ?? '—'} />
              <InfoRow label="Mô tả" value={team.description ?? '—'} />
              <InfoRow label="Tổ chức" value={team.organization?.name ?? '—'} />
              <InfoRow label="Khu vực" value={team.region ? `${team.region.name} (${team.region.code})` : '—'} />
              <InfoRow label="Ngày tạo" value={format(new Date(team.createdAt), 'dd/MM/yyyy HH:mm')} />
              <InfoRow label="Cập nhật" value={format(new Date(team.updatedAt), 'dd/MM/yyyy HH:mm')} />
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
