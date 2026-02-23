import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Button } from '@/components/ui/Button';
import { useTeamsStore } from '@/stores/teamsStore';
import { getRegions } from '@/lib/regions.api';
import { getOrganizations } from '@/lib/organizations.api';
import { cn } from '@/lib/utils';
import type { AdminRegion, AdminOrganization } from '@/types/admin';

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

export function TeamCreatePage() {
  const navigate = useNavigate();
  const { createTeam, isSubmitting, error, clearError } = useTeamsStore();

  const [regions, setRegions] = useState<AdminRegion[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    getRegions({ limit: 100 }).then((res) => setRegions(res.data)).catch(() => {});
    getOrganizations({ limit: 100 }).then((res) => setOrganizations(res.data)).catch(() => {});
  }, []);

  function validate() {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = 'Tên đội tuyển là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    try {
      const team = await createTeam({
        name: name.trim(),
        tag: tag.trim() || undefined,
        logo: logo.trim() || undefined,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        organizationId: organizationId || undefined,
        regionId: regionId || undefined,
      });
      toast.success(`Đã tạo đội tuyển "${team.name}"`);
      navigate(`/teams/${team.id}`);
    } catch {
      // error set in store
    }
  }

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
        <PageHeader title="Tạo đội tuyển" description="Thêm đội tuyển mới vào hệ thống" />
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-sm p-6">
        {error && (
          <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Tên đội tuyển" required error={formErrors.name}>
            <input
              type="text"
              className={inputClass}
              placeholder="Team Flash"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Tag">
            <input
              type="text"
              className={inputClass}
              placeholder="TF"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />
          </FormField>

          <FormField label="Logo">
            <ImageUpload
              value={logo}
              onChange={setLogo}
              folder="teams"
              shape="square"
              size="lg"
              hint="PNG, JPG · tối đa 10 MB"
            />
          </FormField>

          <FormField label="Website">
            <input
              type="url"
              className={inputClass}
              placeholder="https://teamflash.gg"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </FormField>

          <FormField label="Mô tả">
            <textarea
              className={cn(inputClass, 'resize-none')}
              rows={3}
              placeholder="Mô tả đội tuyển..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField label="Tổ chức">
            <select
              className={inputClass}
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
            >
              <option value="">-- Chọn tổ chức --</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Khu vực">
            <select
              className={inputClass}
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
            >
              <option value="">-- Chọn khu vực --</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.code})</option>
              ))}
            </select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/teams')}
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
                'Tạo đội tuyển'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
