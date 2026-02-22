import { create } from 'zustand';
import type { AdminFileUpload } from '@/types/admin';
import {
    getUploads,
    uploadFile as apiUploadFile,
    deleteUpload,
    type GetUploadsParams,
} from '@/lib/uploads.api';

interface UploadsState {
    // Data
    files: AdminFileUpload[];
    total: number;
    page: number;
    limit: number;
    folderFilter: string;

    // UI state
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions
    fetchFiles: (params?: GetUploadsParams) => Promise<void>;
    uploadFile: (file: File, folder?: string) => Promise<AdminFileUpload>;
    removeFile: (id: string) => Promise<void>;
    setFolderFilter: (v: string) => void;
    setPage: (p: number) => void;
    clearError: () => void;
}

export const useUploadsStore = create<UploadsState>((set, get) => ({
    files: [],
    total: 0,
    page: 1,
    limit: 20,
    folderFilter: '',
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchFiles: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { page, limit, folderFilter } = get();
            const result = await getUploads({
                page,
                limit,
                folder: folderFilter || undefined,
                ...params,
            });
            set({
                files: result.data,
                total: result.meta.total,
                page: result.meta.page,
                limit: result.meta.limit,
                isLoading: false,
            });
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            const msg = e.response?.data?.message ?? 'Không thể tải danh sách tệp';
            set({ isLoading: false, error: msg });
        }
    },

    uploadFile: async (file: File, folder?: string) => {
        set({ isSubmitting: true, error: null });
        try {
            const uploaded = await apiUploadFile(file, folder);
            set((state) => ({
                files: [uploaded, ...state.files],
                total: state.total + 1,
                isSubmitting: false,
            }));
            return uploaded;
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string | string[] } } };
            const raw = e.response?.data?.message;
            const msg = Array.isArray(raw)
                ? raw.join(', ')
                : (raw ?? 'Tải tệp lên thất bại');
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    removeFile: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            await deleteUpload(id);
            set((state) => ({
                files: state.files.filter((f) => f.id !== id),
                total: state.total - 1,
                isSubmitting: false,
            }));
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            const msg = e.response?.data?.message ?? 'Xoá tệp thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    setFolderFilter: (v: string) => {
        set({ folderFilter: v, page: 1 });
        get().fetchFiles({ page: 1, folder: v || undefined });
    },

    setPage: (p: number) => {
        set({ page: p });
        const { folderFilter } = get();
        get().fetchFiles({ page: p, folder: folderFilter || undefined });
    },

    clearError: () => set({ error: null }),
}));
