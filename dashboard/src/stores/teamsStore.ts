import { create } from 'zustand';
import type { AdminTeam } from '@/types/admin';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  type GetTeamsParams,
  type CreateTeamDto,
  type UpdateTeamDto,
} from '@/lib/teams.api';

interface TeamsState {
  teams: AdminTeam[];
  total: number;
  page: number;
  limit: number;
  selectedTeam: AdminTeam | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // filters & sort
  search: string;
  organizationFilter: string;
  regionFilter: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  fetchTeams: (params?: GetTeamsParams) => Promise<void>;
  fetchTeamById: (id: string) => Promise<void>;
  createTeam: (dto: CreateTeamDto) => Promise<AdminTeam>;
  updateTeam: (id: string, dto: UpdateTeamDto) => Promise<AdminTeam>;
  removeTeam: (id: string) => Promise<void>;
  setPage: (p: number) => void;
  setSearch: (v: string) => void;
  setOrganizationFilter: (v: string) => void;
  setRegionFilter: (v: string) => void;
  setSortBy: (v: string) => void;
  setSortOrder: (v: 'asc' | 'desc') => void;
  clearSelectedTeam: () => void;
  clearError: () => void;
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: [],
  total: 0,
  page: 1,
  limit: 20,
  selectedTeam: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  search: '',
  organizationFilter: '',
  regionFilter: '',
  sortBy: 'name',
  sortOrder: 'asc',

  fetchTeams: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { page, limit, search, organizationFilter, regionFilter, sortBy, sortOrder } = get();
      const result = await getTeams({
        page,
        limit,
        search: search || undefined,
        organizationId: organizationFilter || undefined,
        regionId: regionFilter || undefined,
        sortBy,
        sortOrder,
        ...params,
      });
      set({
        teams: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không thể tải danh sách đội tuyển';
      set({ isLoading: false, error: msg });
    }
  },

  fetchTeamById: async (id) => {
    set({ isLoading: true, error: null, selectedTeam: null });
    try {
      const team = await getTeamById(id);
      set({ selectedTeam: team, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không tìm thấy đội tuyển';
      set({ isLoading: false, error: msg });
    }
  },

  createTeam: async (dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const team = await createTeam(dto);
      set((state) => ({ teams: [team, ...state.teams], total: state.total + 1, isSubmitting: false }));
      return team;
    } catch (err: any) {
      const msg =
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : (err.response?.data?.message ?? 'Tạo đội tuyển thất bại');
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  updateTeam: async (id, dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await updateTeam(id, dto);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? updated : t)),
        selectedTeam: state.selectedTeam?.id === id ? updated : state.selectedTeam,
        isSubmitting: false,
      }));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Cập nhật đội tuyển thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  removeTeam: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteTeam(id);
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id),
        total: state.total - 1,
        isSubmitting: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Xoá đội tuyển thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  setPage: (p) => {
    set({ page: p });
    get().fetchTeams({ page: p });
  },

  setSearch: (v) => {
    set({ search: v, page: 1 });
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => get().fetchTeams({ page: 1 }), 400);
  },

  setOrganizationFilter: (v) => {
    set({ organizationFilter: v, page: 1 });
    get().fetchTeams({ page: 1 });
  },

  setRegionFilter: (v) => {
    set({ regionFilter: v, page: 1 });
    get().fetchTeams({ page: 1 });
  },

  setSortBy: (v) => {
    set({ sortBy: v, page: 1 });
    get().fetchTeams({ page: 1 });
  },

  setSortOrder: (v) => {
    set({ sortOrder: v, page: 1 });
    get().fetchTeams({ page: 1 });
  },

  clearSelectedTeam: () => set({ selectedTeam: null }),
  clearError: () => set({ error: null }),
}));
