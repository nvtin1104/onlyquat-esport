import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import { tokenManager } from '@/lib/tokenManager';
import type { AuthUser, LoginResponse, RefreshResponse } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

interface AuthState {
  // ── Persisted ──────────────────────────────────────────────────────────────
  user: AuthUser | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // ── In-memory (không persist) ──────────────────────────────────────────────
  isInitializing: boolean; // Fix #2 & #4: verify token khi rehydrate
  isLoading: boolean;
  error: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Persisted
      user: null,
      refreshToken: null,
      isAuthenticated: false,

      // In-memory
      isInitializing: true,
      isLoading: false,
      error: null,

      // ── Fix #2 & #4: Verify/refresh token khi app khởi động ───────────────
      initialize: async () => {
        const { refreshToken, logout } = get();

        if (!refreshToken) {
          set({ isInitializing: false, isAuthenticated: false });
          return;
        }

        try {
          const { data } = await axios.post<RefreshResponse>(
            `${BASE_URL}/auth/refresh`,
            { refreshToken },
          );
          // Chỉ lưu accessToken trong memory
          tokenManager.set(data.accessToken);
          set({ isAuthenticated: true, isInitializing: false });
        } catch {
          // refreshToken hết hạn hoặc invalid → logout
          logout();
          set({ isInitializing: false });
        }
      },

      // ── Fix #5: Token chỉ lưu 1 nơi (Zustand persist) ────────────────────
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<LoginResponse>('/auth/admin/login', {
            email,
            password,
          });

          // accessToken → memory only (Fix #1)
          tokenManager.set(data.accessToken);

          set({
            user: data.user,
            refreshToken: data.refreshToken, // persisted qua Zustand
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          const msg =
            err.response?.data?.message ??
            'Đăng nhập thất bại. Vui lòng thử lại.';
          set({ isLoading: false, error: msg, isAuthenticated: false });
          throw err;
        }
      },

      logout: () => {
        tokenManager.clear();
        set({
          user: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'oq-admin-auth',
      // Fix #5: chỉ persist những gì cần thiết, KHÔNG persist accessToken
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
