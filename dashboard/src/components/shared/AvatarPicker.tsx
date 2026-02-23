import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Check, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile, getUploads } from '@/lib/uploads.api';
import { Avatar } from '@/components/ui/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import type { AdminFileUpload } from '@/types/admin';

// ── Library Modal ─────────────────────────────────────────────────────────────

interface LibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValue?: string;
  onSelect: (url: string) => void;
}

function LibraryModal({ open, onOpenChange, currentValue, onSelect }: LibraryModalProps) {
  const [files, setFiles] = useState<AdminFileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    getUploads({ folder: 'avatars', limit: 60 })
      .then((res) => setFiles(res.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chọn từ thư viện</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-text-dim">
            <Images className="w-10 h-10 opacity-40" />
            <p className="text-sm">Chưa có ảnh nào trong thư viện</p>
            <p className="text-xs opacity-60">Upload ảnh mới để bắt đầu</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto py-2 pr-1">
            {files.map((file) => {
              const isSelected = currentValue === file.url;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => { onSelect(file.url); onOpenChange(false); }}
                  className={cn(
                    'relative rounded-sm overflow-hidden aspect-square border-2 transition-all',
                    isSelected
                      ? 'border-accent-acid'
                      : 'border-transparent hover:border-border-hover',
                  )}
                >
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent-acid/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── AvatarPicker ──────────────────────────────────────────────────────────────

export interface AvatarPickerProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarPicker({
  value,
  onChange,
  name = 'Avatar',
  label,
  size = 'lg',
}: AvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadFile(file, 'avatars');
      onChange(result.url);
    } catch {
      setError('Upload thất bại. Thử lại.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const hasValue = !!value;

  return (
    <div className="flex flex-col items-center gap-4 w-56">
      {label && (
        <p className="self-start font-mono text-xs text-text-dim uppercase tracking-wide">{label}</p>
      )}

      {/* Preview — shown only when value exists */}
      {hasValue && (
        <Avatar
          src={value}
          alt={name}
          fallback={name}
          size={size}
          className="border-2 border-border-subtle"
        />
      )}

      {/* Drop zone — hidden when preview is showing */}
      {!hasValue && (
        <div
          className={cn(
            'w-full border-2 border-dashed rounded-sm transition-colors',
            'flex flex-col items-center justify-center gap-3 py-8 cursor-pointer',
            isDragging
              ? 'border-accent-acid bg-accent-acid/5'
              : 'border-border-subtle hover:border-accent-acid/50 bg-bg-elevated/30',
            isUploading && 'pointer-events-none opacity-60',
          )}
          onClick={() => !isUploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin text-accent-acid" />
          ) : (
            <>
              <Upload className="w-5 h-5 text-text-dim" />
              <p className="text-xs text-text-secondary text-center leading-relaxed">
                Kéo thả ảnh vào đây<br />
                <span className="text-accent-acid font-medium">hoặc nhấn để chọn file</span>
              </p>
              <p className="text-[10px] text-text-dim">PNG, JPG · tối đa 10 MB</p>
            </>
          )}
        </div>
      )}

      {/* Uploading spinner over preview */}
      {hasValue && isUploading && (
        <Loader2 className="w-4 h-4 animate-spin text-accent-acid" />
      )}

      {error && <p className="text-[11px] text-danger">{error}</p>}

      {/* Actions row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="flex items-center gap-1.5 text-[11px] text-text-dim hover:text-text-primary transition-colors cursor-pointer"
        >
          <Images className="w-3.5 h-3.5" />
          Chọn từ thư viện
        </button>

        {hasValue && (
          <>
            <span className="w-px h-3 bg-border-subtle" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1 text-[11px] text-text-dim hover:text-danger transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Xoá ảnh
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <LibraryModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        currentValue={value}
        onSelect={onChange}
      />
    </div>
  );
}
