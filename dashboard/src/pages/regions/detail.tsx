import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, MapPin, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useRegionsStore } from '@/stores/regionsStore';

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-border-subtle last:border-0">
            <span className="text-xs text-text-dim font-mono uppercase tracking-wide">{label}</span>
            <div className="text-right max-w-xs">{children}</div>
        </div>
    );
}

export function RegionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { selectedRegion: region, isLoading, isSubmitting, error, fetchRegionById, updateRegion, removeRegion, clearSelectedRegion } =
        useRegionsStore();

    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editLogo, setEditLogo] = useState('');

    useEffect(() => {
        if (id) fetchRegionById(id);
        return () => clearSelectedRegion();
    }, [id]);

    useEffect(() => {
        if (region) {
            setEditName(region.name);
            setEditLogo(region.logo ?? '');
        }
    }, [region]);

    async function handleSave() {
        if (!region) return;
        try {
            await updateRegion(region.id, {
                name: editName.trim() || undefined,
                logo: editLogo.trim() || undefined,
            });
            toast.success('Đã cập nhật khu vực');
            setEditMode(false);
        } catch (err: any) {
            toast.error(err.message ?? 'Cập nhật thất bại');
        }
    }

    async function handleDelete() {
        if (!region) return;
        if (!window.confirm(`Bạn có chắc muốn xóa khu vực "${region.name}" không?`)) return;
        try {
            await removeRegion(region.id);
            toast.success(`Đã xóa khu vực "${region.name}"`);
            navigate('/regions');
        } catch (err: any) {
            toast.error(err.message ?? 'Xóa khu vực thất bại');
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
            </div>
        );
    }

    if (error || !region) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <AlertCircle className="w-8 h-8 text-danger" />
                <p className="text-text-secondary">{error ?? 'Không tìm thấy khu vực'}</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/regions')}>
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
                    onClick={() => navigate('/regions')}
                    className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                </button>
                <PageHeader title="Chi tiết khu vực" description={`ID: ${region.id}`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo card */}
                <div className="lg:col-span-1 bg-bg-surface border border-border-subtle rounded-sm p-6 flex flex-col items-center text-center gap-3">
                    {region.logo ? (
                        <img
                            src={region.logo}
                            alt={region.name}
                            className="w-20 h-20 rounded-sm object-cover border border-border-subtle"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-sm border border-border-subtle bg-bg-elevated flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-text-dim" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-text-primary text-lg">{region.name}</p>
                        <span className="inline-flex items-center font-mono text-[11px] px-2 py-0.5 rounded-sm border bg-bg-elevated text-text-dim border-border-subtle mt-1">
                            {region.code}
                        </span>
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
                                    onClick={() => {
                                        setEditMode(false);
                                        setEditName(region.name);
                                        setEditLogo(region.logo ?? '');
                                    }}
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
                            Xóa khu vực
                        </Button>
                    </div>
                </div>

                {/* Details / Edit form */}
                <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-sm p-6">
                    <p className="font-mono text-xs text-text-dim uppercase tracking-wide mb-4">Thông tin khu vực</p>

                    {editMode ? (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                                    Tên khu vực <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
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
                            <p className="text-[11px] text-text-dim italic">Mã khu vực không thể thay đổi sau khi tạo.</p>
                        </div>
                    ) : (
                        <>
                            <DetailRow label="ID">
                                <span className="font-mono text-xs text-text-secondary break-all">{region.id}</span>
                            </DetailRow>
                            <DetailRow label="Tên">
                                <span className="text-sm text-text-primary">{region.name}</span>
                            </DetailRow>
                            <DetailRow label="Mã">
                                <span className="font-mono text-sm text-text-primary">{region.code}</span>
                            </DetailRow>
                            <DetailRow label="Logo">
                                {region.logo ? (
                                    <a
                                        href={region.logo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-accent-acid hover:underline break-all"
                                    >
                                        {region.logo}
                                    </a>
                                ) : (
                                    <span className="text-sm text-text-dim">—</span>
                                )}
                            </DetailRow>
                            <DetailRow label="Ngày tạo">
                                <span className="text-xs text-text-dim">
                                    {format(new Date(region.createdAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </DetailRow>
                            <DetailRow label="Cập nhật">
                                <span className="text-xs text-text-dim">
                                    {format(new Date(region.updatedAt), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </DetailRow>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
