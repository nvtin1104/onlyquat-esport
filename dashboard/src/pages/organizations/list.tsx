import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/PageHeader';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { OrganizationsTable } from './components/OrganizationsTable';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { getRegions } from '@/lib/regions.api';
import type { AdminOrganization, AdminRegion } from '@/types/admin';

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'ORGANIZER', label: 'Nhà tổ chức' },
    { value: 'SPONSOR', label: 'Nhà tài trợ' },
    { value: 'CLUB', label: 'Câu lạc bộ' },
    { value: 'AGENCY', label: 'Đại lý' },
];

export function OrganizationsPage() {
    const navigate = useNavigate();
    const {
        organizations,
        total,
        page,
        limit,
        isLoading,
        isSubmitting,
        error,
        roleFilter,
        regionFilter,
        fetchOrgs,
        removeOrg,
        setPage,
        setRoleFilter,
        setRegionFilter,
        clearError,
    } = useOrganizationsStore();

    const [regions, setRegions] = useState<AdminRegion[]>([]);

    useEffect(() => {
        fetchOrgs({ page: 1 });
        // Load regions for filter dropdown
        getRegions({ limit: 100 })
            .then((res) => setRegions(res.data))
            .catch(() => {});
    }, []);

    const regionOptions = [
        { value: '', label: 'Tất cả khu vực' },
        ...regions.map((r) => ({ value: r.id, label: r.name })),
    ];

    async function handleDelete(org: AdminOrganization) {
        if (!window.confirm(`Bạn có chắc muốn xóa tổ chức "${org.name}" không?`)) return;
        try {
            await removeOrg(org.id);
            toast.success(`Đã xóa tổ chức "${org.name}"`);
        } catch (err: any) {
            toast.error(err.message ?? 'Xóa tổ chức thất bại');
        }
    }

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            <PageHeader
                title="Tổ chức"
                description={`Tổng cộng ${total} tổ chức`}
                actions={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/organizations/create')}
                        className="cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Tạo tổ chức
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select
                    options={ROLE_OPTIONS}
                    value={roleFilter}
                    onChange={setRoleFilter}
                    className="sm:w-48"
                />
                <Select
                    options={regionOptions}
                    value={regionFilter}
                    onChange={setRegionFilter}
                    className="sm:w-48"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchOrgs({ page: 1 })}
                    className="sm:ml-auto cursor-pointer"
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
                <OrganizationsTable
                    organizations={organizations}
                    onViewDetail={(org) => navigate(`/organizations/${org.id}`)}
                    onDelete={handleDelete}
                />
            )}

            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                    <span className="text-sm text-text-dim">
                        Trang <span className="text-text-primary font-medium">{page}</span> /{' '}
                        <span className="text-text-primary font-medium">{totalPages}</span> — {total} tổ chức
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
