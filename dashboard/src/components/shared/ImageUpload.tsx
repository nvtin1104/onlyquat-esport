import { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/uploads.api';

const R2_PUBLIC_URL = (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** Build fallback URL from key using dashboard-configured R2 base */
function buildFallbackUrl(key: string): string {
  if (!R2_PUBLIC_URL || !key) return '';
  // key may start with "/" — normalise
  return `${R2_PUBLIC_URL}/${key.replace(/^\//, '')}`;
}

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
  shape?: 'circle' | 'square';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

/** 3-step fallback: stored url → key+R2_PUBLIC_URL → null (show placeholder) */
function useImageSrc(value: string | undefined) {
  const [step, setStep] = useState(0);

  const src = (() => {
    if (!value) return null;
    if (step === 0) return value;                 // 1. stored url
    if (step === 1) return buildFallbackUrl(value); // 2. key + VITE_R2_PUBLIC_URL
    return null;                                   // 3. show placeholder
  })();

  const onError = useCallback(() => setStep((s) => s + 1), []);
  // reset when value changes
  const reset = useCallback(() => setStep(0), []);

  return { src, onError, reset };
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  label,
  hint,
  shape = 'circle',
  size = 'md',
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { src: imgSrc, onError: onImgError, reset: resetImg } = useImageSrc(value);

  async function handleFile(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const result = await uploadFile(file, folder);
      resetImg();
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
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      {label && (
        <p className="self-start font-mono text-xs text-text-dim uppercase tracking-wide">{label}</p>
      )}

      {/* Preview / Drop zone */}
      <div
        className={cn(
          'relative group border-2 border-dashed border-border-subtle bg-bg-elevated',
          'flex items-center justify-center overflow-hidden cursor-pointer',
          'hover:border-accent-acid/50 transition-colors',
          sizeMap[size],
          shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        )}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isUploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-accent-acid" />
        ) : imgSrc ? (
          <>
            <img src={imgSrc} alt="preview" className="w-full h-full object-cover" onError={onImgError} />
            {/* Hover overlay */}
            <div className={cn(
              'absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
              shape === 'circle' ? 'rounded-full' : 'rounded-sm',
            )}>
              <Upload className="w-4 h-4 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-text-dim">
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase">Upload</span>
          </div>
        )}
      </div>

      {/* Clear button */}
      {value && !isUploading && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex items-center gap-1 text-[11px] text-text-dim hover:text-danger transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
          Xoá ảnh
        </button>
      )}

      {/* Error */}
      {error && <p className="text-[11px] text-danger">{error}</p>}

      {/* Hint */}
      {hint && !error && (
        <p className="text-[11px] text-text-dim text-center">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
