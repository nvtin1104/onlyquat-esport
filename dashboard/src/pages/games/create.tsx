import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Button } from '@/components/ui/Button';
import { useGamesStore } from '@/stores/gamesStore';
import { cn } from '@/lib/utils';

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

export function GameCreatePage() {
  const navigate = useNavigate();
  const { createGame, isSubmitting, error, clearError } = useGamesStore();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; shortName?: string }>({});

  function validate() {
    const errs: { name?: string; shortName?: string } = {};
    if (!name.trim()) errs.name = 'Tên game là bắt buộc';
    if (!shortName.trim()) errs.shortName = 'Tên viết tắt là bắt buộc';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;

    const roles = rolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    try {
      const game = await createGame({
        name: name.trim(),
        shortName: shortName.trim(),
        logo: logo.trim() || undefined,
        website: website.trim() || undefined,
        roles: roles.length > 0 ? roles : undefined,
      });
      toast.success(`Đã tạo game "${game.name}"`);
      navigate(`/games/${game.id}`);
    } catch {
      // error set in store
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/games')}
          className="text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <PageHeader title="Tạo game" description="Thêm game mới vào hệ thống" />
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-sm p-6">
        {error && (
          <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="Tên game" required error={formErrors.name}>
            <input
              type="text"
              className={inputClass}
              placeholder="Valorant"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Tên viết tắt" required error={formErrors.shortName}>
            <input
              type="text"
              className={inputClass}
              placeholder="VAL"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
            />
          </FormField>

          <FormField label="Logo">
            <ImageUpload
              value={logo}
              onChange={setLogo}
              folder="games"
              shape="square"
              size="lg"
              hint="PNG, JPG · tối đa 10 MB"
            />
          </FormField>

          <FormField label="Website">
            <input
              type="url"
              className={inputClass}
              placeholder="https://playvalorant.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </FormField>

          <FormField label="Vai trò (phân cách bởi dấu phẩy)">
            <input
              type="text"
              className={inputClass}
              placeholder="Duelist, Controller, Initiator, Sentinel"
              value={rolesInput}
              onChange={(e) => setRolesInput(e.target.value)}
            />
            <p className="text-xs text-text-dim mt-1">Ví dụ: Duelist, Controller, Initiator</p>
          </FormField>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate('/games')}
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
                  <Loader2 className={cn('w-3.5 h-3.5 animate-spin')} />
                  Đang tạo...
                </span>
              ) : (
                'Tạo game'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
