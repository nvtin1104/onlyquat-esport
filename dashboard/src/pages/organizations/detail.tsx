import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Building2, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { getRegions } from '@/lib/regions.api';
import { cn } from '@/lib/utils';
import type { AdminRegion, OrganizationType } from '@/types/admin';

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

const ROLE_CONFIG: Record<OrganizationType, { label: string; className: string }> = {
    ORGANIZER: { label: 'Nhà tổ chức', className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    SPONSOR: { label: 'Nhà tài trợ', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
    CLUB: { label: 'Câu lạc bộ', className: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
    AGENCY: { label: 'Đại lý', className: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
};

const ROLE_OPTIONS: { value: OrganizationType; label: string; hint: string }[] = [
    { value: 'ORGANIZER', label: 'Nhà tổ chức', hint: 'Tổ chức giải đấu' },
    { value: 'SPONSOR', label: 'Nhà tài trợ', hint: 'Tài trợ sự kiện' },
    { value: 'CLUB', label: 'Câu lạc bộ', hint: 'Câu lạc bộ esports' },
    { value: 'AGENCY', label: 'Đại lý', hint: 'Đại lý dịch vụ' },
];

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-border-subtle last:border-0">
            <span className="text-xs text-text-dim font-mono uppercase tracking-wide shrink-0">{label}</span>
            <div className="text-right max-w-xs ml-4">{children}</div>
        </div>
    );
}

export function OrganizationDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        selectedOrg: org,
        isLoading,
        isSubmitting,
        error,
        fetchOrgById,
        updateOrg,
        removeOrg,
        clearSelectedOrg,
    } = useOrganizationsStore();

    const [regions, setRegions] = useState<AdminRegion[]>([]);
    const [editMode, setEditMode] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState('');
    const [editShortName, setEditShortName] = useState('');
    const [editLogo, setEditLogo] = useState('');
    const [editWebsite, setEditWebsite] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editDescriptionEn, setEditDescriptionEn] = useState('');
    const [editDescriptionVi, setEditDescriptionVi] = useState('');
    const [editRoles, setEditRoles] = useState<OrganizationType[]>([]);
    const [editRegionId, setEditRegionId] = useState('');

    useEffect(() => {
        if (id) fetchOrgById(id);
        getRegions({ limit: 100 })
            .then((res) => setRegions(res.data))
            .catch(() => {});
        return () => clearSelectedOrg();
    }, [id]);

    useEffect(() => {
        if (org) {
            setEditName(org.name);
            setEditShortName(org.shortName ?? '');
            setEditLogo(org.logo ?? '');
            setEditWebsite(org.website ?? '');
            setEditDescription(org.description ?? '');
            setEditDescriptionEn(org.descriptionI18n?.en ?? '');
            setEditDescriptionVi(org.descriptionI18n?.vi ?? '');
            setEditRoles([...org.roles]);
            setEditRegionId(org.regionId ?? '');
        }
    }, [org]);

    function toggleRole(role: OrganizationType) {
        setEditRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
        );
    }

    async function handleSave() {
        if (!org) return;
        if (editRoles.length === 0) {
            toast.error('Chọn ít nhất một vai trò');
            return;
        }
        const descriptionI18n: Record<string, string> = {};
        if (editDescriptionEn.trim()) descriptionI18n.en = editDescriptionEn.trim();
        if (editDescriptionVi.trim()) descriptionI18n.vi = editDescriptionVi.trim();

        try {
            await updateOrg(org.id, {
                name: editName.trim() || undefined,
                shortName: editShortName.trim() || undefined,
                logo: editLogo.trim() || undefined,
                website: editWebsite.trim() || undefined,
                description: editDescription.trim() || undefined,
                descriptionI18n: Object.keys(descriptionI18n).length > 0 ? descriptionI18n : undefined,
                roles: editRoles,
                regionId: editRegionId || undefined,
            });
            toast.success('Đã cập nhật tổ chức');
            setEditMode(false);
        } catch (err: any) {
            toast.error(err.message ?? 'Cập nhật thất bại');
        }
    }

    async function handleDelete() {
        if (!org) return;
        if (!window.confirm(`Bạn có chắc muốn xóa tổ chức "${org.name}" không?`)) return;
        try {
            await removeOrg(org.id);
            toast.success(`Đã xóa tổ chức "${org.name}"`);
            navigate('/organizations');
        } catch (err: any) {
            toast.error(err.message ?? 'Xóa tổ chức thất bại');
        }
    }

    function cancelEdit() {
        if (!org) return;
        setEditMode(false);
        setEditName(org.name);
        setEditShortName(org.shortName ?? '');
        setEditLogo(org.logo ?? '');
        setEditWebsite(org.website ?? '');
        setEditDescription(org.description ?? '');
        setEditDescriptionEn(org.descriptionI18n?.en ?? '');
        setEditDescriptionVi(org.descriptionI18n?.vi ?? '');
        setEditRoles([...org.roles]);
        setEditRegionId(org.regionId ?? '');
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
            </div>
        );
    }

    if (error || !org) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle className="w-8 h-8 text-danger" />
                <p className="text-text-secondary">{error ?? 'Không tìm thấy tổ chức'}</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/organizations')}>
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
                    onClick={() => navigate('/organizations')}
                    className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <PageHeader title="Chi tiết tổ chức" description={`ID: ${org.id}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo / summary card */}
                <div className="lg:col-span-1 bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col items-center text-center gap-3">
                    {org.logo ? (
                        <img
                            src={org.logo}
                            alt={org.name}
                            className="w-20 h-20 rounded-sm object-cover border border-border-subtle"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-sm border border-border-subtle bg-bg-elevated flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-text-dim" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-text-primary text-lg">{org.name}</p>
                        {org.shortName && (
                            <p className="text-text-secondary text-sm">{org.shortName}</p>
                        )}
                        {org.region && (
                            <p className="text-text-dim text-xs mt-1">{org.region.name}</p>
                        )}
                    </div>

                    {/* Role badges */}
                    <div className="flex flex-wrap gap-1 justify-center">
                        {org.roles.map((r) => {
                            const cfg = ROLE_CONFIG[r];
                            return (
                                <Badge key={r} className={cfg.className}>
                                    {cfg.label}
                                </Badge>
                            );
                        })}
                    </div>

                    <div className="w-full space-y-2 mt-2">
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
                                    onClick={handleSave}
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
                            Xóa tổ chức
                        </Button>
                    </div>
                </div>

                {/* Details / Edit form */}
                <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6">
                    <p className="font-mono text-xs text-text-dim uppercase tracking-wide mb-4">Thông tin tổ chức</p>

                    {editMode ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                                    Tên tổ chức <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên viết tắt</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={editShortName}
                                    onChange={(e) => setEditShortName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Logo URL</label>
                                <input
                                    type="url"
                                    className={inputClass}
                                    placeholder="https://example.com/logo.png"
                                    value={editLogo}
                                    onChange={(e) => setEditLogo(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Website</label>
                                <input
                                    type="url"
                                    className={inputClass}
                                    placeholder="https://example.com"
                                    value={editWebsite}
                                    onChange={(e) => setEditWebsite(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả</label>
                                <textarea
                                    className={cn(inputClass, 'resize-none')}
                                    rows={3}
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả tiếng Anh</label>
                                <textarea
                                    className={cn(inputClass, 'resize-none')}
                                    rows={3}
                                    value={editDescriptionEn}
                                    onChange={(e) => setEditDescriptionEn(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả tiếng Việt</label>
                                <textarea
                                    className={cn(inputClass, 'resize-none')}
                                    rows={3}
                                    value={editDescriptionVi}
                                    onChange={(e) => setEditDescriptionVi(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                                    Vai trò <span className="text-danger">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {ROLE_OPTIONS.map((r) => {
                                        const checked = editRoles.includes(r.value);
                                        return (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => toggleRole(r.value)}
                                                className={cn(
                                                    'flex flex-col items-start px-3 py-2 rounded-sm border text-left transition-colors cursor-pointer',
                                                    checked
                                                        ? 'border-accent-acid/50 bg-accent-acid/5 text-text-primary'
                                                        : 'border-border-subtle hover:border-border-hover text-text-secondary',
                                                )}
                                            >
                                                <span className="text-sm font-medium">{r.label}</span>
                                                <span className="text-[11px] text-text-dim">{r.hint}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Khu vực</label>
                                <select
                                    className={inputClass}
                                    value={editRegionId}
                                    onChange={(e) => setEditRegionId(e.target.value)}
                                >
                                    <option value="">-- Không chọn --</option>
                                    {regions.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name} ({r.code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <>
                            <DetailRow label="ID">
                                <span className="font-mono text-xs text-text-secondary break-all">{org.id}</span>
                            </DetailRow>
                            <DetailRow label="Tên">
                                <span className="text-sm text-text-primary">{org.name}</span>
                            </DetailRow>
                            <DetailRow label="Tên viết tắt">
                                <span className="text-sm text-text-secondary">{org.shortName ?? '—'}</span>
                            </DetailRow>
                            <DetailRow label="Website">
                                {org.website ? (
                                    <a
                                        href={org.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-acid hover:underline break-all"
                                    >
                                        {org.website}
                                    </a>
                                ) : (
                                    <span className="text-sm text-text-dim">—</span>
                                )}
                            </DetailRow>
                            <DetailRow label="Mô tả">
                                <span className="text-sm text-text-secondary">{org.description ?? '—'}</span>
                            </DetailRow>
                            <DetailRow label="Mô tả EN">
                                <span className="text-sm text-text-secondary">{org.descriptionI18n?.en ?? '—'}</span>
                            </DetailRow>
                            <DetailRow label="Mô tả VI">
                                <span className="text-sm text-text-secondary">{org.descriptionI18n?.vi ?? '—'}</span>
                            </DetailRow>
                            <DetailRow label="Vai trò">
                                <div className="flex flex-wrap gap-1 justify-end">
                                    {org.roles.map((r) => {
                                        const cfg = ROLE_CONFIG[r];
                                        return (
                                            <Badge key={r} className={cfg.className}>
                                                {cfg.label}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </DetailRow>
                            <DetailRow label="Khu vực">
                                <span className="text-sm text-text-secondary">
                                    {org.region ? `${org.region.name} (${org.region.code})` : '—'}
                                </span>
                            </DetailRow>
                            <DetailRow label="Chủ sở hữu">
                                <span className="text-sm text-text-secondary">
                                    {org.owner?.username ?? org.ownerId}
                                </span>
                            </DetailRow>
                            <DetailRow label="Quản lý">
                                <span className="text-sm text-text-secondary">
                                    {org.manager?.username ?? (org.managerId ? org.managerId : '—')}
                                </span>
                            </DetailRow>
                            <DetailRow label="Ngày tạo">
                                <span className="text-xs text-text-dim">
                                    {format(new Date(org.createdAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </DetailRow>
                            <DetailRow label="Cập nhật">
                                <span className="text-xs text-text-dim">
                                    {format(new Date(org.updatedAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </DetailRow>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
