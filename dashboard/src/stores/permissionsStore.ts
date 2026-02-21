import { create } from 'zustand';
import * as api from '@/lib/permissions.api';
import type {
    GroupPermission,
    UserPermissionsResponse,
    RoleDefaultsResponse,
} from '@/types/permissions';
import type { GroupPermissionFormValues } from '@/lib/schemas/permission.schema';

interface PermissionsState {
    // Data
    groups: GroupPermission[];
    roleDefaults: RoleDefaultsResponse[];
    userPermissions: UserPermissionsResponse | null;

    // UI State
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions - Groups
    fetchGroups: (activeOnly?: boolean) => Promise<void>;
    fetchRoleDefaults: () => Promise<void>;
    createGroup: (data: GroupPermissionFormValues) => Promise<GroupPermission>;
    updateGroup: (id: string, data: Partial<GroupPermissionFormValues>) => Promise<GroupPermission>;
    deleteGroup: (id: string) => Promise<void>;

    // Actions - User Permissions
    fetchUserPermissions: (userId: string) => Promise<void>;
    grantCustom: (userId: string, code: string) => Promise<void>;
    revokeCustom: (userId: string, code: string) => Promise<void>;
    assignGroup: (userId: string, groupId: string) => Promise<void>;
    removeGroup: (userId: string, groupId: string) => Promise<void>;
    rebuildCache: (userId: string) => Promise<void>;

    // Helpers
    clearError: () => void;
    clearUserPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set, get) => ({
    groups: [],
    roleDefaults: [],
    userPermissions: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchGroups: async (activeOnly) => {
        set({ isLoading: true, error: null });
        try {
            const groups = await api.getGroupPermissions(activeOnly);
            set({ groups, isLoading: false });
        } catch (err: any) {
            set({ isLoading: false, error: err.response?.data?.message || 'Không thể tải danh sách nhóm quyền' });
        }
    },

    fetchRoleDefaults: async () => {
        try {
            const roleDefaults = await api.getRoleDefaults();
            set({ roleDefaults });
        } catch (err: any) {
            console.error('Failed to fetch role defaults', err);
        }
    },

    createGroup: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
            const group = await api.createGroup(data);
            set((state) => ({ groups: [...state.groups, group], isSubmitting: false }));
            return group;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Tạo nhóm quyền thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    updateGroup: async (id, data) => {
        set({ isSubmitting: true, error: null });
        try {
            const group = await api.updateGroup(id, data);
            set((state) => ({
                groups: state.groups.map((g) => (g.id === id ? group : g)),
                isSubmitting: false,
            }));
            return group;
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Cập nhật nhóm quyền thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    deleteGroup: async (id) => {
        set({ isSubmitting: true, error: null });
        try {
            await api.deleteGroup(id);
            set((state) => ({
                groups: state.groups.filter((g) => g.id !== id),
                isSubmitting: false,
            }));
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Xoá nhóm quyền thất bại';
            set({ isSubmitting: false, error: msg });
            throw new Error(msg);
        }
    },

    fetchUserPermissions: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const userPermissions = await api.getUserPermissions(userId);
            set({ userPermissions, isLoading: false });
        } catch (err: any) {
            set({ isLoading: false, error: err.response?.data?.message || 'Không thể tải quyền của người dùng' });
        }
    },

    grantCustom: async (userId, code) => {
        set({ isSubmitting: true });
        try {
            await api.grantCustomPermission(userId, code);
            const updated = await api.getUserPermissions(userId);
            set({ userPermissions: updated, isSubmitting: false });
        } catch (err: any) {
            set({ isSubmitting: false, error: err.response?.data?.message || 'Gán quyền thất bại' });
        }
    },

    revokeCustom: async (userId, code) => {
        set({ isSubmitting: true });
        try {
            await api.revokeCustomPermission(userId, code);
            const updated = await api.getUserPermissions(userId);
            set({ userPermissions: updated, isSubmitting: false });
        } catch (err: any) {
            set({ isSubmitting: false, error: err.response?.data?.message || 'Thu hồi quyền thất bại' });
        }
    },

    assignGroup: async (userId, groupId) => {
        set({ isSubmitting: true });
        try {
            await api.assignGroupToUser(userId, groupId);
            const updated = await api.getUserPermissions(userId);
            set({ userPermissions: updated, isSubmitting: false });
        } catch (err: any) {
            set({ isSubmitting: false, error: err.response?.data?.message || 'Gán nhóm quyền thất bại' });
        }
    },

    removeGroup: async (userId, groupId) => {
        set({ isSubmitting: true });
        try {
            await api.removeGroupFromUser(userId, groupId);
            const updated = await api.getUserPermissions(userId);
            set({ userPermissions: updated, isSubmitting: false });
        } catch (err: any) {
            set({ isSubmitting: false, error: err.response?.data?.message || 'Gỡ nhóm quyền thất bại' });
        }
    },

    rebuildCache: async (userId) => {
        set({ isSubmitting: true });
        try {
            await api.rebuildPermissionCache(userId);
            const updated = await api.getUserPermissions(userId);
            set({ userPermissions: updated, isSubmitting: false });
        } catch (err: any) {
            set({ isSubmitting: false, error: err.response?.data?.message || 'Làm mới cache thất bại' });
        }
    },

    clearError: () => set({ error: null }),
    clearUserPermissions: () => set({ userPermissions: null }),
}));
