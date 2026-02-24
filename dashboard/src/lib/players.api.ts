import { api } from './api';
import type { AdminPlayer, PlayersListResponse } from '@/types/admin';

export interface GetPlayersParams {
  page?: number;
  limit?: number;
  search?: string;
  gameId?: string;
  teamId?: string;
  tier?: string;
  isPro?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePlayerDto {
  displayName: string;
  slug?: string;
  realName?: string;
  nationality?: string;
  imageUrl?: string;
  stats?: Record<string, unknown>;
  mechanics?: number;
  tactics?: number;
  composure?: number;
  teamwork?: number;
  consistency?: number;
  isPro?: boolean;
  isActive?: boolean;
  gameId: string;
  teamId?: string;
  userId?: string;
}

export interface UpdatePlayerDto {
  displayName?: string;
  realName?: string;
  nationality?: string;
  imageUrl?: string;
  stats?: Record<string, unknown>;
  mechanics?: number;
  tactics?: number;
  composure?: number;
  teamwork?: number;
  consistency?: number;
  isPro?: boolean;
  isActive?: boolean;
  gameId?: string;
  teamId?: string | null;
  userId?: string | null;
}

export async function getPlayers(params: GetPlayersParams = {}): Promise<PlayersListResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.gameId) q.set('gameId', params.gameId);
  if (params.teamId) q.set('teamId', params.teamId);
  if (params.tier) q.set('tier', params.tier);
  if (params.isPro !== undefined) q.set('isPro', String(params.isPro));
  if (params.isActive !== undefined) q.set('isActive', String(params.isActive));
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  const res = await api.get<PlayersListResponse>(`/players?${q.toString()}`);
  return res.data;
}

export async function getPlayerBySlug(slug: string): Promise<AdminPlayer> {
  const res = await api.get<AdminPlayer>(`/players/${slug}`);
  return res.data;
}

export async function createPlayer(dto: CreatePlayerDto): Promise<AdminPlayer> {
  const res = await api.post<AdminPlayer>('/players', dto);
  return res.data;
}

export async function updatePlayer(slug: string, dto: UpdatePlayerDto): Promise<AdminPlayer> {
  const res = await api.patch<AdminPlayer>(`/players/${slug}`, dto);
  return res.data;
}

export async function deletePlayer(slug: string): Promise<AdminPlayer> {
  const res = await api.delete<AdminPlayer>(`/players/${slug}`);
  return res.data;
}
