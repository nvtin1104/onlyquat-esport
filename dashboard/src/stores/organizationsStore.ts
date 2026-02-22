import { create } from 'zustand';
import type { AdminOrganization } from '@/types/admin';
import {
    getOrganizations,
    getOrganizationById,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    type GetOrgsParams,
    type CreateOrgDto,
    type UpdateOrgDto,
} from '@/lib/organizations.api';

interface OrganizationsState {
    // Data
    organizations: AdminOrganization[];
    total: number;
    page: number;
    limit: number;
    selectedOrg: AdminOrganization | null;

    // UI state
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Filters
    roleFilter: string;
    regionFilter: string;

    // Actions
    fetchOrgs: (params?: GetOrgsParams) => Promise<void>;
    fetchOrgById: (id: string) => Promise<void>;
    createOrg: (dto: CreateOrgDto) => Promise<AdminOrganization>;
    updateOrg: (id: string, dto: UpdateOrgDto) => Promise<AdminOrganization>;
    removeOrg: (id: string) => Promise<void>;
    setPage: (p: number) => void;
    setRoleFilter: (v: string) => void;
    setRegionFilter: (v: string) => void;
    clearSelectedOrg: () => void;
    clearError: () => void;
}

export const useOrganizationsStore = create<OrganizationsState>((set, get) => ({
    organizations: [],
    total: 0,
    page: 1,
    limit: 20,
    selectedOrg: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    roleFilter: '',
    regionFilter: '',

    fetchOrgs: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { page, limit, roleFilter, regionFilter } = get();
            const result = await getOrganizations({
                page,
                limit,
                role: roleFilter || undefined,
                regionId: regionFilter || undefined,
                ...params,
            });
            set({
                organizations: result.data,
                total: result.meta.total,
                page: result.meta.page,
                limit: result.meta.limit,
                isLoading: false,
            });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không thể tải danh sách tổ chức';
            set({ isLoading: false, error: msg });
        }
    },

    fetchOrgById: async (id: string) => {
        set({ isLoading: true, error: null, selectedOrg: null });
        try {
            const org = await getOrganizationById(id);
            set({ selectedOrg: org, isLoading: false });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không tìm thấy tổ chức';
            set({ isLoading: false, error: msg });
        }
    },

    createOrg: async (dto: CreateOrgDto) => {
        set({ isSubmitting: true, error: null });
        try {
            const org = await createOrganization(dto);
            set((state) => ({
                organizations: [org, ...state.organizations],
                total: state.total + 1,
                isSubmitting: false,
            }));
            return org;
        } catch (err: any) {
            const msg =
                Array.isArray(err.response?.data?.message)
                    ? err.response.data.message.join(', ')
                    : (err.response?.data?.message ?? 'Tạo tổ chức thất bại');
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    updateOrg: async (id: string, dto: UpdateOrgDto) => {
        set({ isSubmitting: true, error: null });
        try {
            const updated = await updateOrganization(id, dto);
            set((state) => ({
                organizations: state.organizations.map((o) => (o.id === id ? updated : o)),
                selectedOrg: state.selectedOrg?.id === id ? updated : state.selectedOrg,
                isSubmitting: false,
            }));
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Cập nhật tổ chức thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    removeOrg: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            await deleteOrganization(id);
            set((state) => ({
                organizations: state.organizations.filter((o) => o.id !== id),
                total: state.total - 1,
                isSubmitting: false,
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Xoá tổ chức thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    setPage: (p) => {
        set({ page: p });
        get().fetchOrgs({ page: p });
    },

    setRoleFilter: (v) => {
        set({ roleFilter: v, page: 1 });
        get().fetchOrgs({ page: 1, role: v || undefined });
    },

    setRegionFilter: (v) => {
        set({ regionFilter: v, page: 1 });
        get().fetchOrgs({ page: 1, regionId: v || undefined });
    },

    clearSelectedOrg: () => set({ selectedOrg: null }),
    clearError: () => set({ error: null }),
}));
