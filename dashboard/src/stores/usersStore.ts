import { create } from 'zustand';
import type { AdminUser } from '@/types/admin';
import {
    getUsers,
    getUserById,
    adminCreateUser,
    updateUserRole,
    banUser,
    deleteUser,
    type GetUsersParams,
} from '@/lib/users.api';
import type { CreateUserFormValues, UpdateRoleFormValues } from '@/lib/schemas/user.schema';

interface UsersState {
    // Data
    users: AdminUser[];
    total: number;
    page: number;
    limit: number;
    selectedUser: AdminUser | null;

    // UI state
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Filters
    search: string;
    roleFilter: string;
    statusFilter: string;

    // Actions
    fetchUsers: (params?: GetUsersParams) => Promise<void>;
    fetchUserById: (id: string) => Promise<void>;
    createUser: (data: CreateUserFormValues) => Promise<AdminUser>;
    updateRole: (id: string, data: UpdateRoleFormValues) => Promise<AdminUser>;
    toggleBan: (id: string) => Promise<AdminUser>;
    removeUser: (id: string) => Promise<void>;
    setSearch: (v: string) => void;
    setRoleFilter: (v: string) => void;
    setStatusFilter: (v: string) => void;
    setPage: (p: number) => void;
    clearSelectedUser: () => void;
    clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    total: 0,
    page: 1,
    limit: 20,
    selectedUser: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    search: '',
    roleFilter: '',
    statusFilter: '',

    fetchUsers: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { page, limit } = get();
            const result = await getUsers({ page, limit, ...params });
            set({
                users: result.data,
                total: result.meta.total,
                page: result.meta.page,
                limit: result.meta.limit,
                isLoading: false,
            });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không thể tải danh sách người dùng';
            set({ isLoading: false, error: msg });
        }
    },

    fetchUserById: async (id: string) => {
        set({ isLoading: true, error: null, selectedUser: null });
        try {
            const user = await getUserById(id);
            set({ selectedUser: user, isLoading: false });
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Không tìm thấy người dùng';
            set({ isLoading: false, error: msg });
        }
    },

    createUser: async (data: CreateUserFormValues) => {
        set({ isSubmitting: true, error: null });
        try {
            const user = await adminCreateUser(data);
            set((state) => ({
                users: [user, ...state.users],
                total: state.total + 1,
                isSubmitting: false,
            }));
            return user;
        } catch (err: any) {
            const msg =
                Array.isArray(err.response?.data?.message)
                    ? err.response.data.message.join(', ')
                    : (err.response?.data?.message ?? 'Tạo người dùng thất bại');
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    updateRole: async (id: string, data: UpdateRoleFormValues) => {
        set({ isSubmitting: true, error: null });
        try {
            const updated = await updateUserRole(id, data);
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? updated : u)),
                selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
                isSubmitting: false,
            }));
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Cập nhật role thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    toggleBan: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            const updated = await banUser(id);
            set((state) => ({
                users: state.users.map((u) => (u.id === id ? updated : u)),
                selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
                isSubmitting: false,
            }));
            return updated;
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Thao tác ban/unban thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    removeUser: async (id: string) => {
        set({ isSubmitting: true, error: null });
        try {
            await deleteUser(id);
            set((state) => ({
                users: state.users.filter((u) => u.id !== id),
                total: state.total - 1,
                isSubmitting: false,
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message ?? 'Xoá người dùng thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    setSearch: (v) => set({ search: v }),
    setRoleFilter: (v) => set({ roleFilter: v }),
    setStatusFilter: (v) => set({ statusFilter: v }),
    setPage: (p) => set({ page: p }),
    clearSelectedUser: () => set({ selectedUser: null }),
    clearError: () => set({ error: null }),
}));
