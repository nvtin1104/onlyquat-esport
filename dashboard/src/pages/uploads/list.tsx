import { useEffect, useRef, useState } from 'react';
import {
    Upload,
    Loader2,
    FileIcon,
    Check,
    Copy,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useUploadsStore } from '@/stores/uploadsStore';
import { cn } from '@/lib/utils';
import type { AdminFileUpload } from '@/types/admin';

const FOLDER_OPTIONS = [
    { value: '', label: 'Tất cả thư mục' },
    { value: 'general', label: 'General' },
    { value: 'avatars', label: 'Avatars' },
    { value: 'logos', label: 'Logos' },
    { value: 'banners', label: 'Banners' },
];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function FileCard({ file, onDelete }: { file: AdminFileUpload; onDelete: (id: string) => void }) {
    const [copied, setCopied] = useState(false);
    const isImage = file.mimeType.startsWith('image/');

    function handleCopy() {
        navigator.clipboard.writeText(file.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="flex flex-col bg-bg-surface border border-border-subtle rounded-sm overflow-hidden group hover:border-border-hover transition-colors duration-150">
            {/* Preview area */}
            <div className="relative h-40 bg-bg-elevated flex items-center justify-center shrink-0 overflow-hidden">
                {isImage ? (
                    <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <FileIcon className="w-10 h-10 text-text-dim" />
                )}
            </div>

            {/* Info area */}
            <div className="flex flex-col gap-2 p-3 flex-1">
                <p
                    className="font-body text-sm text-text-primary truncate"
                    title={file.originalName}
                >
                    {file.originalName}
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default">{file.folder}</Badge>
                    <span className="font-mono text-[10px] text-text-dim">{formatFileSize(file.size)}</span>
                </div>

                <p className="font-body text-xs text-text-dim">{formatDate(file.createdAt)}</p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 cursor-pointer"
                        onClick={handleCopy}
                        title="Copy URL"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="hidden sm:inline">{copied ? 'Đã copy' : 'Copy URL'}</span>
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => onDelete(file.id)}
                        title="Xoá tệp"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function UploadsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const {
        files,
        total,
        page,
        limit,
        folderFilter,
        isLoading,
        isSubmitting,
        error,
        fetchFiles,
        uploadFile,
        removeFile,
        setFolderFilter,
        setPage,
        clearError,
    } = useUploadsStore();

    useEffect(() => {
        fetchFiles({ page: 1 });
    }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        // Reset input so same file can be re-selected
        e.target.value = '';
        try {
            await uploadFile(file, folderFilter || undefined);
            toast.success(`Đã tải lên "${file.name}" thành công`);
        } catch (err: unknown) {
            const e = err as Error;
            toast.error(e.message ?? 'Tải tệp lên thất bại');
        }
    }

    async function handleConfirmDelete(id: string) {
        const file = files.find((f) => f.id === id);
        setDeleteTarget(null);
        try {
            await removeFile(id);
            toast.success(`Đã xoá "${file?.originalName ?? 'tệp'}"`);
        } catch (err: unknown) {
            const e = err as Error;
            toast.error(e.message ?? 'Xoá tệp thất bại');
        }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <PageHeader
                title="Media & Files"
                description={`Tổng cộng ${total} tệp`}
            />

            {/* Error banner */}
            {error && (
                <div className="mb-4 px-3 py-2 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={clearError}
                        className="text-danger/70 hover:text-danger text-xs ml-4 cursor-pointer"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Upload area + filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="cursor-pointer shrink-0"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Upload className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Đang tải lên...' : 'Tải lên tệp'}
                </Button>

                <div className="w-full sm:w-48">
                    <Select
                        options={FOLDER_OPTIONS}
                        value={folderFilter}
                        onChange={(v) => setFolderFilter(v)}
                        disabled={isLoading}
                    />
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchFiles({ page: 1 })}
                    className="cursor-pointer sm:ml-auto shrink-0"
                    disabled={isLoading || isSubmitting}
                >
                    Làm mới
                </Button>
            </div>

            {/* Delete confirmation inline banner */}
            {deleteTarget && (
                <div className="mb-4 px-3 py-2.5 bg-danger/10 border border-danger/30 rounded-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className="font-body text-sm text-danger flex-1">
                        Bạn có chắc muốn xoá tệp này? Hành động này không thể hoàn tác.
                    </span>
                    <div className="flex gap-2 shrink-0">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleConfirmDelete(deleteTarget)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            Xác nhận xoá
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => setDeleteTarget(null)}
                            disabled={isSubmitting}
                        >
                            Huỷ
                        </Button>
                    </div>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
                </div>
            ) : files.length === 0 ? (
                <div className={cn(
                    'flex flex-col items-center justify-center h-48 gap-3',
                    'border border-dashed border-border-subtle rounded-sm',
                )}>
                    <FileIcon className="w-8 h-8 text-text-dim" />
                    <p className="font-body text-sm text-text-dim">Chưa có tệp nào được tải lên</p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="cursor-pointer"
                    >
                        <Upload className="w-4 h-4" />
                        Tải lên tệp đầu tiên
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                        <FileCard
                            key={file.id}
                            file={file}
                            onDelete={(id) => setDeleteTarget(id)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <span className="text-sm text-text-dim">
                        Trang <span className="text-text-primary font-medium">{page}</span> /{' '}
                        <span className="text-text-primary font-medium">{totalPages}</span> — {total} tệp
                    </span>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}
