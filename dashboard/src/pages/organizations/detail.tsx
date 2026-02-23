import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Building2, Pencil, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { UserPicker, type UserPickerValue } from '@/components/shared/UserPicker';
import { RichTextEditor } from '@/components/shared/RichTextEditor';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { getRegions } from '@/lib/regions.api';
import { cn } from '@/lib/utils';
import type { AdminRegion, OrganizationType } from '@/types/admin';

// ─── Styles ─────────────────────────────────────────────────────────────────

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

const ROLE_CONFIG: Record<OrganizationType, { label: string; className: string }> = {
    ORGANIZER: {
        label: 'Nhà tổ chức',
        className: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30',
    },
    SPONSOR: {
        label: 'Nhà tài trợ',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30',
    },
    CLUB: {
        label: 'Câu lạc bộ',
        className: 'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/30',
    },
    AGENCY: {
        label: 'Đại lý',
        className: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30',
    },
};

const ROLE_OPTIONS: { value: OrganizationType; label: string; hint: string }[] = [
    { value: 'ORGANIZER', label: 'Nhà tổ chức', hint: 'Tổ chức giải đấu' },
    { value: 'SPONSOR', label: 'Nhà tài trợ', hint: 'Tài trợ sự kiện' },
    { value: 'CLUB', label: 'Câu lạc bộ', hint: 'Câu lạc bộ esports' },
    { value: 'AGENCY', label: 'Đại lý', hint: 'Đại lý dịch vụ' },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            {/* Left card */}
            <div className="lg:col-span-1 bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-sm bg-border-subtle" />
                <div className="w-32 h-4 rounded-sm bg-border-subtle" />
                <div className="w-20 h-3 rounded-sm bg-border-subtle/70" />
                <div className="flex gap-2 mt-1">
                    <div className="h-5 w-20 rounded-sm bg-border-subtle" />
                    <div className="h-5 w-16 rounded-sm bg-border-subtle" />
                </div>
                <div className="w-full h-8 rounded-sm bg-border-subtle mt-2" />
                <div className="w-full h-8 rounded-sm bg-border-subtle/60" />
            </div>
            {/* Right card */}
            <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6 space-y-4">
                <div className="h-3 w-32 rounded-sm bg-border-subtle" />
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-border-subtle">
                        <div className="h-2.5 w-20 rounded-sm bg-border-subtle" />
                        <div className="h-3 w-36 rounded-sm bg-border-subtle/60" />
                    </div>
                ))}
            </div>
        </div>
    );
}



// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-border-subtle last:border-0">
            <span className="text-xs text-text-dim font-mono uppercase tracking-wide shrink-0">{label}</span>
            <div className="text-right max-w-xs ml-4">{children}</div>
        </div>
    );
}

// ─── OrgLogo ──────────────────────────────────────────────────────────────────

const orgLogoSizeMap = {
    sm: 'w-8 h-8',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
} as const;

function OrgLogo({ src, name, size = 'xl' }: { src?: string | null; name: string; size?: keyof typeof orgLogoSizeMap }) {
    const [error, setError] = useState(false);
    const wrap = orgLogoSizeMap[size];
    const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-xl';
    return (
        <div className={cn('rounded-full bg-bg-elevated overflow-hidden flex items-center justify-center shrink-0', wrap)}>
            {src && !error ? (
                <img src={src} alt={name} onError={() => setError(true)} className="w-full h-full object-cover" />
            ) : (
                <span className={cn('font-mono font-medium text-text-dim uppercase select-none', textSize)}>
                    {name.charAt(0)}
                </span>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
    const [editOwner, setEditOwner] = useState<UserPickerValue | null>(null);
    const [editManager, setEditManager] = useState<UserPickerValue | null>(null);

    useEffect(() => {
        if (id) fetchOrgById(id);
        getRegions({ limit: 100 })
            .then((res) => setRegions(res.data))
            .catch(() => { });
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
            setEditOwner(org.owner ? { id: org.ownerId, username: org.owner.username, avatar: org.owner.avatar } : null);
            setEditManager(
                org.manager ? { id: org.managerId!, username: org.manager.username, avatar: org.manager.avatar } : null,
            );
        }
    }, [org]);

    function toggleRole(role: OrganizationType) {
        setEditRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
        );
    }

    async function handleSave() {
        if (!org) return;
        if (editRoles.length === 0) { toast.error('Chọn ít nhất một vai trò'); return; }
        if (!editOwner) { toast.error('Chủ sở hữu không được để trống'); return; }

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
                ownerId: editOwner.id,
                managerId: editManager?.id ?? null,
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
        setEditOwner(org.owner ? { id: org.ownerId, username: org.owner.username, avatar: org.owner.avatar } : null);
        setEditManager(org.manager ? { id: org.managerId!, username: org.manager.username, avatar: org.manager.avatar } : null);
    }

    // ─── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
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
                    <PageHeader title="Chi tiết tổ chức" description="Đang tải..." />
                </div>
                <DetailSkeleton />
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

            <div className="flex flex-col gap-6 max-w-6xl mx-auto">
                {/* ── Horizontal Hero Card ─────────────────────────────────── */}
                <div className="relative overflow-hidden bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Subtle gradient background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-acid/10 to-transparent pointer-events-none opacity-50 dark:opacity-20" />

                    {/* Left: Logo */}
                    <OrgLogo src={org.logo} name={org.name} size="xl" />

                    {/* Middle: Info */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
                        <h1 className="font-bold text-text-primary text-2xl tracking-tight">
                            {org.name}
                        </h1>

                        <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                            {org.shortName && (
                                <span className="font-medium text-text-primary px-1.5 py-0.5 rounded-sm bg-bg-elevated border border-border-subtletext-xs">
                                    {org.shortName}
                                </span>
                            )}
                            {org.region && (
                                <span>Khu vực: {org.region.name}</span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3 justify-center md:justify-start">
                            {org.roles.map((r) => {
                                const cfg = ROLE_CONFIG[r];
                                return <Badge key={r} className={cfg.className}>{cfg.label}</Badge>;
                            })}
                        </div>
                    </div>

                    {/* Right: Actions */}
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

                {/* ── Details / Edit form ─────────────────────────────────── */}
                <div className="bg-bg-surface border border-border-subtle rounded-sm p-6 w-full">
                    <p className="font-mono text-xs text-text-dim uppercase tracking-wide mb-4">
                        Thông tin tổ chức
                    </p>

                    {editMode ? (
                        <div className="space-y-4">
                            {/* Name */}
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

                            {/* Short name */}
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Tên viết tắt</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={editShortName}
                                    onChange={(e) => setEditShortName(e.target.value)}
                                />
                            </div>

                            {/* Logo */}
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Logo</label>
                                <ImageUpload
                                    value={editLogo}
                                    onChange={setEditLogo}
                                    folder="logos"
                                    shape="circle"
                                    size="lg"
                                    hint="PNG, JPG · tối đa 10 MB"
                                />
                            </div>

                            {/* Website */}
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

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả</label>
                                <RichTextEditor
                                    value={editDescription}
                                    onChange={setEditDescription}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả EN</label>
                                    <RichTextEditor
                                        value={editDescriptionEn}
                                        onChange={setEditDescriptionEn}
                                        minHeight="100px"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-mono text-xs text-text-dim uppercase tracking-wide">Mô tả VI</label>
                                    <RichTextEditor
                                        value={editDescriptionVi}
                                        onChange={setEditDescriptionVi}
                                        minHeight="100px"
                                    />
                                </div>
                            </div>

                            {/* Roles */}
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

                            {/* Region */}
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

                            {/* Owner — required */}
                            <UserPicker
                                label="Chủ sở hữu *"
                                value={editOwner}
                                onChange={setEditOwner}
                                nullable={false}
                            />

                            {/* Manager — optional */}
                            <UserPicker
                                label="Quản lý"
                                value={editManager}
                                onChange={setEditManager}
                                nullable
                            />
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
                                        return <Badge key={r} className={cfg.className}>{cfg.label}</Badge>;
                                    })}
                                </div>
                            </DetailRow>
                            <DetailRow label="Khu vực">
                                <span className="text-sm text-text-secondary">
                                    {org.region ? `${org.region.name} (${org.region.code})` : '—'}
                                </span>
                            </DetailRow>
                            <DetailRow label="Chủ sở hữu">
                                <span className="text-sm text-text-secondary font-medium">
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
