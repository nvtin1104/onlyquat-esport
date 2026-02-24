import { create } from 'zustand';
import type { AdminPlayer } from '@/types/admin';
import {
  getPlayers,
  getPlayerBySlug,
  createPlayer,
  updatePlayer,
  deletePlayer,
  type GetPlayersParams,
  type CreatePlayerDto,
  type UpdatePlayerDto,
} from '@/lib/players.api';

interface PlayersState {
  players: AdminPlayer[];
  total: number;
  page: number;
  limit: number;
  selectedPlayer: AdminPlayer | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // filters & sort
  search: string;
  gameFilter: string;
  teamFilter: string;
  tierFilter: string;
  statusFilter: string; // '' | 'active' | 'inactive'
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  fetchPlayers: (params?: GetPlayersParams) => Promise<void>;
  fetchPlayerBySlug: (slug: string) => Promise<void>;
  createPlayer: (dto: CreatePlayerDto) => Promise<AdminPlayer>;
  updatePlayer: (slug: string, dto: UpdatePlayerDto) => Promise<AdminPlayer>;
  removePlayer: (slug: string) => Promise<void>;
  setPage: (p: number) => void;
  setSearch: (v: string) => void;
  setGameFilter: (v: string) => void;
  setTeamFilter: (v: string) => void;
  setTierFilter: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setSortBy: (v: string) => void;
  setSortOrder: (v: 'asc' | 'desc') => void;
  clearSelectedPlayer: () => void;
  clearError: () => void;
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: [],
  total: 0,
  page: 1,
  limit: 20,
  selectedPlayer: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  search: '',
  gameFilter: '',
  teamFilter: '',
  tierFilter: '',
  statusFilter: '',
  sortBy: 'rating',
  sortOrder: 'desc',

  fetchPlayers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { page, limit, search, gameFilter, teamFilter, tierFilter, statusFilter, sortBy, sortOrder } = get();
      const result = await getPlayers({
        page,
        limit,
        search: search || undefined,
        gameId: gameFilter || undefined,
        teamId: teamFilter || undefined,
        tier: tierFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        sortBy,
        sortOrder,
        ...params,
      });
      set({
        players: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không thể tải danh sách tuyển thủ';
      set({ isLoading: false, error: msg });
    }
  },

  fetchPlayerBySlug: async (slug) => {
    set({ isLoading: true, error: null, selectedPlayer: null });
    try {
      const player = await getPlayerBySlug(slug);
      set({ selectedPlayer: player, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không tìm thấy tuyển thủ';
      set({ isLoading: false, error: msg });
    }
  },

  createPlayer: async (dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const player = await createPlayer(dto);
      set((state) => ({
        players: [player, ...state.players],
        total: state.total + 1,
        isSubmitting: false,
      }));
      return player;
    } catch (err: any) {
      const msg =
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : (err.response?.data?.message ?? 'Tạo tuyển thủ thất bại');
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  updatePlayer: async (slug, dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await updatePlayer(slug, dto);
      set((state) => ({
        players: state.players.map((p) => (p.slug === slug ? updated : p)),
        selectedPlayer: state.selectedPlayer?.slug === slug ? updated : state.selectedPlayer,
        isSubmitting: false,
      }));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Cập nhật tuyển thủ thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  removePlayer: async (slug) => {
    set({ isSubmitting: true, error: null });
    try {
      await deletePlayer(slug);
      set((state) => ({
        players: state.players.filter((p) => p.slug !== slug),
        total: state.total - 1,
        isSubmitting: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Xoá tuyển thủ thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  setPage: (p) => {
    set({ page: p });
    get().fetchPlayers({ page: p });
  },

  setSearch: (v) => {
    set({ search: v, page: 1 });
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => get().fetchPlayers({ page: 1 }), 400);
  },

  setGameFilter: (v) => {
    set({ gameFilter: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  setTeamFilter: (v) => {
    set({ teamFilter: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  setTierFilter: (v) => {
    set({ tierFilter: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  setStatusFilter: (v) => {
    set({ statusFilter: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  setSortBy: (v) => {
    set({ sortBy: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  setSortOrder: (v) => {
    set({ sortOrder: v, page: 1 });
    get().fetchPlayers({ page: 1 });
  },

  clearSelectedPlayer: () => set({ selectedPlayer: null }),
  clearError: () => set({ error: null }),
}));
