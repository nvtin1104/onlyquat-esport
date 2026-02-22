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

    // Filters (kept in store for controlled inputs, sent to API on fetch)
    search: string;
    roleFilter: string;
    statusFilter: string;

    // Internal debounce timer
    _searchTimer: ReturnType<typeof setTimeout> | null;

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
    _searchTimer: null,

    fetchUsers: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const { page, limit, search, roleFilter, statusFilter } = get();
            const result = await getUsers({
                page,
                limit,
                search: search || undefined,
                role: roleFilter || undefined,
                status: statusFilter || undefined,
                ...params,
            });
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

    // Debounced search: update the search value immediately for the input,
    // but wait 400ms before triggering an API call
    setSearch: (v) => {
        const prev = get()._searchTimer;
        if (prev) clearTimeout(prev);

        const timer = setTimeout(() => {
            get().fetchUsers({ page: 1 });
        }, 400);

        set({ search: v, page: 1, _searchTimer: timer });
    },

    // Filters are applied immediately
    setRoleFilter: (v) => {
        set({ roleFilter: v, page: 1 });
        get().fetchUsers({ page: 1, role: v || undefined });
    },

    setStatusFilter: (v) => {
        set({ statusFilter: v, page: 1 });
        get().fetchUsers({ page: 1, status: v || undefined });
    },

    setPage: (p) => {
        set({ page: p });
        get().fetchUsers({ page: p });
    },

    clearSelectedUser: () => set({ selectedUser: null }),
    clearError: () => set({ error: null }),
}));
