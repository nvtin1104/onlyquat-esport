import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { useRegionsStore } from '@/stores/regionsStore';

function FormField({
    label,
    error,
    required,
    hint,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="font-mono text-xs text-text-dim uppercase tracking-wide">
                {label}
                {required && <span className="text-danger ml-1">*</span>}
            </label>
            {children}
            {hint && <p className="text-[11px] text-text-dim italic">{hint}</p>}
            {error && <p className="text-danger text-xs">{error}</p>}
        </div>
    );
}

const inputClass =
    'w-full bg-bg-elevated border border-border-subtle rounded-sm px-3 py-2 text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent-acid transition-colors';

export function RegionCreatePage() {
    const navigate = useNavigate();
    const { createRegion, isSubmitting, error, clearError } = useRegionsStore();

    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [logo, setLogo] = useState('');
    const [formErrors, setFormErrors] = useState<{ name?: string; code?: string }>({});

    function validate() {
        const errs: { name?: string; code?: string } = {};
        if (!name.trim()) errs.name = 'Tên khu vực là bắt buộc';
        if (!code.trim()) errs.code = 'Mã khu vực là bắt buộc';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        clearError();
        if (!validate()) return;
        try {
            const region = await createRegion({
                name: name.trim(),
                code: code.trim().toUpperCase(),
                logo: logo.trim() || undefined,
            });
            toast.success(`Đã tạo khu vực "${region.name}"`);
            navigate(`/regions/${region.id}`);
        } catch {
            // error đã set trong store
        }
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
                <PageHeader title="Tạo khu vực" description="Thêm khu vực địa lý mới" />
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-sm p-6">
                {error && (
                    <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField label="Tên khu vực" required error={formErrors.name}>
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="Việt Nam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </FormField>

                    <FormField
                        label="Mã"
                        required
                        error={formErrors.code}
                        hint="Mã sẽ được tự động chuyển thành chữ hoa (VD: VN, SEA, APAC)"
                    >
                        <input
                            type="text"
                            className={inputClass}
                            placeholder="VN"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                        />
                    </FormField>

                    <FormField label="Logo URL">
                        <input
                            type="url"
                            className={inputClass}
                            placeholder="https://example.com/logo.png"
                            value={logo}
                            onChange={(e) => setLogo(e.target.value)}
                        />
                    </FormField>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigate('/regions')}
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
                                'Tạo khu vực'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
