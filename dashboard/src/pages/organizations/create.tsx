import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { getRegions } from '@/lib/regions.api';
import { cn } from '@/lib/utils';
import type { AdminRegion, OrganizationType } from '@/types/admin';

function FormField({
    label,
    error,
    required,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                {label}
                {required && <span className="text-danger ml-1">*</span>}
            </label>
            {children}
            {error && <p className="text-danger text-xs">{error}</p>}
        </div>
    );
}

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

const ROLE_OPTIONS: { value: OrganizationType; label: string; hint: string }[] = [
    { value: 'ORGANIZER', label: 'Nhà tổ chức', hint: 'Tổ chức giải đấu' },
    { value: 'SPONSOR', label: 'Nhà tài trợ', hint: 'Tài trợ sự kiện' },
    { value: 'CLUB', label: 'Câu lạc bộ', hint: 'Câu lạc bộ esports' },
    { value: 'AGENCY', label: 'Đại lý', hint: 'Đại lý dịch vụ' },
];

export function OrganizationCreatePage() {
    const navigate = useNavigate();
    const { createOrg, isSubmitting, error, clearError } = useOrganizationsStore();

    const [regions, setRegions] = useState<AdminRegion[]>([]);
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [logo, setLogo] = useState('');
    const [website, setWebsite] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionEn, setDescriptionEn] = useState('');
    const [descriptionVi, setDescriptionVi] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<OrganizationType[]>([]);
    const [regionId, setRegionId] = useState('');
    const [formErrors, setFormErrors] = useState<{ name?: string; roles?: string }>({});

    useEffect(() => {
        getRegions({ limit: 100 })
            .then((res) => setRegions(res.data))
            .catch(() => {});
    }, []);

    function toggleRole(role: OrganizationType) {
        setSelectedRoles((prev) =>
            prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
        );
    }

    function validate() {
        const errs: { name?: string; roles?: string } = {};
        if (!name.trim()) errs.name = 'Tên tổ chức là bắt buộc';
        if (selectedRoles.length === 0) errs.roles = 'Chọn ít nhất một vai trò';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        clearError();
        if (!validate()) return;

        const descriptionI18n: Record<string, string> = {};
        if (descriptionEn.trim()) descriptionI18n.en = descriptionEn.trim();
        if (descriptionVi.trim()) descriptionI18n.vi = descriptionVi.trim();

        try {
            const org = await createOrg({
                name: name.trim(),
                shortName: shortName.trim() || undefined,
                logo: logo.trim() || undefined,
                website: website.trim() || undefined,
                description: description.trim() || undefined,
                descriptionI18n: Object.keys(descriptionI18n).length > 0 ? descriptionI18n : undefined,
                roles: selectedRoles,
                regionId: regionId || undefined,
            });
            toast.success(`Đã tạo tổ chức "${org.name}"`);
            navigate(`/organizations/${org.id}`);
        } catch {
            // error đã set trong store
        }
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
                <PageHeader title="Tạo tổ chức" description="Thêm tổ chức esports mới" />
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-sm p-6">
                {error && (
                    <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <FormField label="Tên tổ chức" required error={formErrors.name}>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Team Flash"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormField>

                    {/* Short name */}
                    <FormField label="Tên viết tắt">
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="TF"
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                        />
                    </FormField>

                    {/* Logo */}
                    <FormField label="Logo URL">
                        <input
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com/logo.png"
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
                        />
                    </FormField>

                    {/* Website */}
                    <FormField label="Website">
                        <input
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </FormField>

                    {/* Description */}
                    <FormField label="Mô tả">
                        <textarea
                            className={cn(inputClass, 'resize-none')}
                            rows={3}
                            placeholder="Mô tả tổ chức..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>

                    {/* Description EN */}
                    <FormField label="Mô tả tiếng Anh">
                        <textarea
                            className={cn(inputClass, 'resize-none')}
                            rows={3}
                            placeholder="Organization description in English..."
                            value={descriptionEn}
                            onChange={(e) => setDescriptionEn(e.target.value)}
                        />
                    </FormField>

                    {/* Description VI */}
                    <FormField label="Mô tả tiếng Việt">
                        <textarea
                            className={cn(inputClass, 'resize-none')}
                            rows={3}
                            placeholder="Mô tả tổ chức bằng tiếng Việt..."
                            value={descriptionVi}
                            onChange={(e) => setDescriptionVi(e.target.value)}
                        />
                    </FormField>

                    {/* Roles */}
                    <FormField label="Vai trò" required error={formErrors.roles}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {ROLE_OPTIONS.map((r) => {
                                const checked = selectedRoles.includes(r.value);
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
                    </FormField>

                    {/* Region */}
                    <FormField label="Khu vực">
                        <select
                            className={inputClass}
                            value={regionId}
                            onChange={(e) => setRegionId(e.target.value)}
                        >
                            <option value="">-- Chọn khu vực --</option>
                            {regions.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name} ({r.code})
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/organizations')}
                            className="cursor-pointer"
                        >
                            Huỷ
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isSubmitting}
                            className="cursor-pointer"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Đang tạo...
                                </span>
                            ) : (
                                'Tạo tổ chức'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
