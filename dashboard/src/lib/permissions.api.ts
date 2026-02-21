import { api } from './api';
import type {
    GroupPermission,
    UserPermissionsResponse,
    RoleDefaultsResponse,
} from '@/types/permissions';
import type { GroupPermissionFormValues } from './schemas/permission.schema';

// ── Groups ───────────────────────────────────────────────────────────────────

export async function getGroupPermissions(activeOnly?: boolean): Promise<GroupPermission[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const res = await api.get<GroupPermission[]>('/admin/permissions', { params });
    return res.data;
}

export async function getGroupById(id: string): Promise<GroupPermission> {
    const res = await api.get<GroupPermission>(`/admin/permissions/groups/${id}`);
    return res.data;
}

export async function createGroup(dto: GroupPermissionFormValues): Promise<GroupPermission> {
    const res = await api.post<GroupPermission>('/admin/permissions/groups', dto);
    return res.data;
}

export async function updateGroup(id: string, dto: Partial<GroupPermissionFormValues>): Promise<GroupPermission> {
    const res = await api.patch<GroupPermission>(`/admin/permissions/groups/${id}`, dto);
    return res.data;
}

export async function deleteGroup(id: string): Promise<void> {
    await api.delete(`/admin/permissions/groups/${id}`);
}

// ── User Permissions ─────────────────────────────────────────────────────────

export async function getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    const res = await api.get<UserPermissionsResponse>(`/admin/permissions/user/${userId}`);
    return res.data;
}

export async function grantCustomPermission(userId: string, permissionCode: string): Promise<string[]> {
    const res = await api.post<string[]>(`/admin/permissions/user/${userId}/grant`, { permissionCode });
    return res.data;
}

export async function revokeCustomPermission(userId: string, permissionCode: string): Promise<string[]> {
    const res = await api.post<string[]>(`/admin/permissions/user/${userId}/revoke`, { permissionCode });
    return res.data;
}

export async function assignGroupToUser(userId: string, groupId: string): Promise<string[]> {
    const res = await api.post<string[]>(`/admin/permissions/user/${userId}/assign-group`, { groupId });
    return res.data;
}

export async function removeGroupFromUser(userId: string, groupId: string): Promise<string[]> {
    const res = await api.delete<string[]>(`/admin/permissions/user/${userId}/remove-group/${groupId}`);
    return res.data;
}

export async function rebuildPermissionCache(userId: string): Promise<string[]> {
    const res = await api.post<string[]>(`/admin/permissions/user/${userId}/rebuild`);
    return res.data;
}

export async function getRoleDefaults(): Promise<RoleDefaultsResponse[]> {
    const res = await api.get<RoleDefaultsResponse[]>('/admin/permissions/roles');
    return res.data;
}
