import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { RegionsTable } from './components/RegionsTable';
import { useRegionsStore } from '@/stores/regionsStore';
import type { AdminRegion } from '@/types/admin';

export function RegionsPage() {
    const navigate = useNavigate();
    const {
        regions,
        total,
        page,
        limit,
        isLoading,
        isSubmitting,
        error,
        fetchRegions,
        removeRegion,
        setPage,
        clearError,
    } = useRegionsStore();

    useEffect(() => {
        fetchRegions({ page: 1 });
    }, []);

    async function handleDelete(region: AdminRegion) {
        if (!window.confirm(`Bạn có chắc muốn xóa khu vực "${region.name}" không?`)) return;
        try {
            await removeRegion(region.id);
            toast.success(`Đã xóa khu vực "${region.name}"`);
        } catch (err: any) {
            toast.error(err.message ?? 'Xóa khu vực thất bại');
        }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <PageHeader
                title="Khu vực"
                description={`Tổng cộng ${total} khu vực`}
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/regions/create')}
                        className="cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tạo khu vực
                    </Button>
                }
            />

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

            <div className="flex justify-end mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRegions({ page: 1 })}
                    className="cursor-pointer"
                    disabled={isLoading || isSubmitting}
                >
                    Làm mới
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="w-6 h-6 animate-spin text-accent-acid" />
                </div>
            ) : (
                <RegionsTable
                    regions={regions}
                    onViewDetail={(r) => navigate(`/regions/${r.id}`)}
                    onDelete={handleDelete}
                />
            )}

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <span className="text-sm text-text-dim">
                        Trang <span className="text-text-primary font-medium">{page}</span> /{' '}
                        <span className="text-text-primary font-medium">{totalPages}</span> — {total} khu vực
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
