import { api } from './api';
import type { AdminUser, UsersListResponse } from '@/types/admin';
import type { CreateUserFormValues, UpdateRoleFormValues } from './schemas/user.schema';

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
}

// GET /users — list with pagination + search/filter
export async function getUsers(params: GetUsersParams = {}): Promise<UsersListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search?.trim()) query.set('search', params.search.trim());
    if (params.role) query.set('role', params.role);
    if (params.status) query.set('status', params.status);
    const res = await api.get<UsersListResponse>(`/users?${query.toString()}`);
    return res.data;
}

// GET /users/:id
export async function getUserById(id: string): Promise<AdminUser> {
    const res = await api.get<AdminUser>(`/users/${id}`);
    return res.data;
}

// POST /users — admin create
export async function adminCreateUser(
    dto: Omit<CreateUserFormValues, 'confirmPassword'>,
): Promise<AdminUser> {
    const res = await api.post<AdminUser>('/users', {
        email: dto.email,
        username: dto.username,
        password: dto.password,
        name: dto.name || undefined,
        roles: dto.roles,
        accountType: dto.accountType,
    });
    return res.data;
}

// PATCH /users/:id/role
export async function updateUserRole(
    id: string,
    dto: UpdateRoleFormValues,
): Promise<AdminUser> {
    const res = await api.patch<AdminUser>(`/users/${id}/role`, { roles: dto.roles });
    return res.data;
}

// PATCH /users/:id/ban
export async function banUser(id: string): Promise<AdminUser> {
    const res = await api.patch<AdminUser>(`/users/${id}/ban`);
    return res.data;
}

// DELETE /users/:id
export async function deleteUser(id: string): Promise<{ message: string }> {
    const res = await api.delete<{ message: string }>(`/users/${id}`);
    return res.data;
}
