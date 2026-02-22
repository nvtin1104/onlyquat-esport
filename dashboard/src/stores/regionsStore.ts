import { create } from 'zustand';
import type { AdminRegion } from '@/types/admin';
import {
    getRegions,
    getRegionById,
    createRegion,
    updateRegion,
    deleteRegion,
    type GetRegionsParams,
    type CreateRegionDto,
    type UpdateRegionDto,
} from '@/lib/regions.api';

interface RegionsState {
    // Data
    regions: AdminRegion[];
    total: number;
    page: number;
    limit: number;
    selectedRegion: AdminRegion | null;

    // UI state
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions
    fetchRegions: (params?: GetRegionsParams) => Promise<void>;
    fetchRegionById: (id: string) => Promise<void>;
    createRegion: (dto: CreateRegionDto) => Promise<AdminRegion>;
    updateRegion: (id: string, dto: UpdateRegionDto) => Promise<AdminRegion>;
    removeRegion: (id: string) => Promise<void>;
    setPage: (p: number) => void;
    clearSelectedRegion: () => void;
    clearError: () => void;
}

export const useRegionsStore = create<RegionsState>((set, get) => ({
    regions: [],
    total: 0,
    page: 1,
    limit: 20,
    selectedRegion: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchRegions: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { page, limit } = get();
            const result = await getRegions({
                page,
                limit,
                ...params,
            });
            set({
                regions: result.data,
                total: result.meta.total,
                page: result.meta.page,
                limit: result.meta.limit,
                isLoading: false,
            });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không thể tải danh sách khu vực';
            set({ isLoading: false, error: msg });
        }
    },

    fetchRegionById: async (id: string) => {
        set({ isLoading: true, error: null, selectedRegion: null });
        try {
            const region = await getRegionById(id);
            set({ selectedRegion: region, isLoading: false });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không tìm thấy khu vực';
            set({ isLoading: false, error: msg });
        }
    },

    createRegion: async (dto: CreateRegionDto) => {
        set({ isSubmitting: true, error: null });
        try {
            const region = await createRegion(dto);
            set((state) => ({
                regions: [region, ...state.regions],
                total: state.total + 1,
                isSubmitting: false,
            }));
            return region;
        } catch (err: any) {
            const msg =
                Array.isArray(err.response?.data?.message)
                    ? err.response.data.message.join(', ')
                    : (err.response?.data?.message ?? 'Tạo khu vực thất bại');
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    updateRegion: async (id: string, dto: UpdateRegionDto) => {
        set({ isSubmitting: true, error: null });
        try {
            const updated = await updateRegion(id, dto);
            set((state) => ({
                regions: state.regions.map((r) => (r.id === id ? updated : r)),
                selectedRegion: state.selectedRegion?.id === id ? updated : state.selectedRegion,
                isSubmitting: false,
            }));
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Cập nhật khu vực thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    removeRegion: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            await deleteRegion(id);
            set((state) => ({
                regions: state.regions.filter((r) => r.id !== id),
                total: state.total - 1,
                isSubmitting: false,
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Xoá khu vực thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    setPage: (p) => {
        set({ page: p });
        get().fetchRegions({ page: p });
    },

    clearSelectedRegion: () => set({ selectedRegion: null }),
    clearError: () => set({ error: null }),
}));
