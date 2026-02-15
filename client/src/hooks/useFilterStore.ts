import { create } from 'zustand';

interface FilterState {
  search: string;
  game: string;
  role: string;
  tier: string;
  sort: 'rating' | 'name' | 'rank';
  setSearch: (search: string) => void;
  setGame: (game: string) => void;
  setRole: (role: string) => void;
  setTier: (tier: string) => void;
  setSort: (sort: 'rating' | 'name' | 'rank') => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: '',
  game: '',
  role: '',
  tier: '',
  sort: 'rating',
  setSearch: (search) => set({ search }),
  setGame: (game) => set({ game }),
  setRole: (role) => set({ role }),
  setTier: (tier) => set({ tier }),
  setSort: (sort) => set({ sort }),
  reset: () => set({ search: '', game: '', role: '', tier: '', sort: 'rating' }),
}));
