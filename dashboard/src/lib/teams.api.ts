import { api } from './api';
import type { AdminTeam, TeamsListResponse } from '@/types/admin';

export interface GetTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
  regionId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTeamDto {
  name: string;
  slug?: string;
  tag?: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  description?: string;
  organizationId?: string;
  regionId?: string;
}

export interface UpdateTeamDto {
  name?: string;
  slug?: string;
  tag?: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  description?: string;
  organizationId?: string | null;
  regionId?: string | null;
}

export async function getTeams(params: GetTeamsParams = {}): Promise<TeamsListResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.organizationId) q.set('organizationId', params.organizationId);
  if (params.regionId) q.set('regionId', params.regionId);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  const res = await api.get<TeamsListResponse>(`/teams?${q.toString()}`);
  return res.data;
}

export async function getTeamById(id: string): Promise<AdminTeam> {
  const res = await api.get<AdminTeam>(`/teams/${id}`);
  return res.data;
}

export async function createTeam(dto: CreateTeamDto): Promise<AdminTeam> {
  const res = await api.post<AdminTeam>('/teams', dto);
  return res.data;
}

export async function updateTeam(id: string, dto: UpdateTeamDto): Promise<AdminTeam> {
  const res = await api.patch<AdminTeam>(`/teams/${id}`, dto);
  return res.data;
}

export async function deleteTeam(id: string): Promise<AdminTeam> {
  const res = await api.delete<AdminTeam>(`/teams/${id}`);
  return res.data;
}
