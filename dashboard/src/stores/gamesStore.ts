import { create } from 'zustand';
import type { AdminGame } from '@/types/admin';
import {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame,
  type GetGamesParams,
  type CreateGameDto,
  type UpdateGameDto,
} from '@/lib/games.api';

interface GamesState {
  games: AdminGame[];
  total: number;
  page: number;
  limit: number;
  selectedGame: AdminGame | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // filters & sort
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';

  fetchGames: (params?: GetGamesParams) => Promise<void>;
  fetchGameById: (id: string) => Promise<void>;
  createGame: (dto: CreateGameDto) => Promise<AdminGame>;
  updateGame: (id: string, dto: UpdateGameDto) => Promise<AdminGame>;
  removeGame: (id: string) => Promise<void>;
  setPage: (p: number) => void;
  setSearch: (v: string) => void;
  setSortBy: (v: string) => void;
  setSortOrder: (v: 'asc' | 'desc') => void;
  clearSelectedGame: () => void;
  clearError: () => void;
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

export const useGamesStore = create<GamesState>((set, get) => ({
  games: [],
  total: 0,
  page: 1,
  limit: 20,
  selectedGame: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',

  fetchGames: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const { page, limit, search, sortBy, sortOrder } = get();
      const result = await getGames({
        page,
        limit,
        search: search || undefined,
        sortBy,
        sortOrder,
        ...params,
      });
      set({
        games: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        isLoading: false,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không thể tải danh sách game';
      set({ isLoading: false, error: msg });
    }
  },

  fetchGameById: async (id) => {
    set({ isLoading: true, error: null, selectedGame: null });
    try {
      const game = await getGameById(id);
      set({ selectedGame: game, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Không tìm thấy game';
      set({ isLoading: false, error: msg });
    }
  },

  createGame: async (dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const game = await createGame(dto);
      set((state) => ({ games: [game, ...state.games], total: state.total + 1, isSubmitting: false }));
      return game;
    } catch (err: any) {
      const msg =
        Array.isArray(err.response?.data?.message)
          ? err.response.data.message.join(', ')
          : (err.response?.data?.message ?? 'Tạo game thất bại');
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  updateGame: async (id, dto) => {
    set({ isSubmitting: true, error: null });
    try {
      const updated = await updateGame(id, dto);
      set((state) => ({
        games: state.games.map((g) => (g.id === id ? updated : g)),
        selectedGame: state.selectedGame?.id === id ? updated : state.selectedGame,
        isSubmitting: false,
      }));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Cập nhật game thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  removeGame: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await deleteGame(id);
      set((state) => ({
        games: state.games.filter((g) => g.id !== id),
        total: state.total - 1,
        isSubmitting: false,
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Xoá game thất bại';
      set({ isSubmitting: false, error: msg });
      throw new Error(msg);
    }
  },

  setPage: (p) => {
    set({ page: p });
    get().fetchGames({ page: p });
  },

  setSearch: (v) => {
    set({ search: v, page: 1 });
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => get().fetchGames({ page: 1 }), 400);
  },

  setSortBy: (v) => {
    set({ sortBy: v, page: 1 });
    get().fetchGames({ page: 1 });
  },

  setSortOrder: (v) => {
    set({ sortOrder: v, page: 1 });
    get().fetchGames({ page: 1 });
  },

  clearSelectedGame: () => set({ selectedGame: null }),
  clearError: () => set({ error: null }),
}));
