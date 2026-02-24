import { api } from './api';
import type { AdminGame, GamesListResponse } from '@/types/admin';

export interface GetGamesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateGameDto {
  name: string;
  shortName: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  roles?: string[];
  organizationId?: string;
}

export interface UpdateGameDto {
  name?: string;
  shortName?: string;
  logo?: string;
  website?: string;
  mediaLinks?: Array<{ url: string; label?: string }>;
  roles?: string[];
  organizationId?: string | null;
}

export async function getGames(params: GetGamesParams = {}): Promise<GamesListResponse> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.search) q.set('search', params.search);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  const res = await api.get<GamesListResponse>(`/games?${q.toString()}`);
  return res.data;
}

export async function getGameById(id: string): Promise<AdminGame> {
  const res = await api.get<AdminGame>(`/games/${id}`);
  return res.data;
}

export async function createGame(dto: CreateGameDto): Promise<AdminGame> {
  const res = await api.post<AdminGame>('/games', dto);
  return res.data;
}

export async function updateGame(id: string, dto: UpdateGameDto): Promise<AdminGame> {
  const res = await api.patch<AdminGame>(`/games/${id}`, dto);
  return res.data;
}

export async function deleteGame(id: string): Promise<AdminGame> {
  const res = await api.delete<AdminGame>(`/games/${id}`);
  return res.data;
}
