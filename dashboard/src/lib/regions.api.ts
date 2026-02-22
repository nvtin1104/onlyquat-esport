import { api } from './api';
import type { AdminRegion, RegionsListResponse } from '@/types/admin';

export interface GetRegionsParams {
    page?: number;
    limit?: number;
}

export interface CreateRegionDto {
    name: string;
    code: string;
    logo?: string;
}

export interface UpdateRegionDto {
    name?: string;
    logo?: string;
}

export async function getRegions(params: GetRegionsParams = {}): Promise<RegionsListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    const res = await api.get<RegionsListResponse>(`/regions?${q.toString()}`);
    return res.data;
}

export async function getRegionById(id: string): Promise<AdminRegion> {
    const res = await api.get<AdminRegion>(`/regions/${id}`);
    return res.data;
}

export async function createRegion(dto: CreateRegionDto): Promise<AdminRegion> {
    const res = await api.post<AdminRegion>('/regions', dto);
    return res.data;
}

export async function updateRegion(id: string, dto: UpdateRegionDto): Promise<AdminRegion> {
    const res = await api.patch<AdminRegion>(`/regions/${id}`, dto);
    return res.data;
}

export async function deleteRegion(id: string): Promise<AdminRegion> {
    const res = await api.delete<AdminRegion>(`/regions/${id}`);
    return res.data;
}
