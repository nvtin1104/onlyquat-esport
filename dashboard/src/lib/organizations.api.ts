import { api } from './api';
import type { AdminOrganization, OrganizationsListResponse } from '@/types/admin';

export interface GetOrgsParams {
    page?: number;
    limit?: number;
    role?: string;
    regionId?: string;
}

export interface CreateOrgDto {
    name: string;
    shortName?: string;
    logo?: string;
    website?: string;
    description?: string;
    descriptionI18n?: Record<string, string>;
    mediaLinks?: Array<{ url: string; description?: string }>;
    roles: string[];
    regionId?: string;
}

export interface UpdateOrgDto extends Partial<Omit<CreateOrgDto, 'roles'>> {
    roles?: string[];
}

export async function getOrganizations(params: GetOrgsParams = {}): Promise<OrganizationsListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.role) q.set('role', params.role);
    if (params.regionId) q.set('regionId', params.regionId);
    const res = await api.get<OrganizationsListResponse>(`/organizations?${q.toString()}`);
    return res.data;
}

export async function getOrganizationById(id: string): Promise<AdminOrganization> {
    const res = await api.get<AdminOrganization>(`/organizations/${id}`);
    return res.data;
}

export async function createOrganization(dto: CreateOrgDto): Promise<AdminOrganization> {
    const res = await api.post<AdminOrganization>('/organizations', dto);
    return res.data;
}

export async function updateOrganization(id: string, dto: UpdateOrgDto): Promise<AdminOrganization> {
    const res = await api.patch<AdminOrganization>(`/organizations/${id}`, dto);
    return res.data;
}

export async function deleteOrganization(id: string): Promise<AdminOrganization> {
    const res = await api.delete<AdminOrganization>(`/organizations/${id}`);
    return res.data;
}
