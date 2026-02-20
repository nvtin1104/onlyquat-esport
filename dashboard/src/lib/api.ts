import axios from 'axios';
import { tokenManager } from './tokenManager';
import type { RefreshResponse } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const PERSIST_KEY = 'oq-admin-auth';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Fix #1 & #5: Đọc accessToken từ memory, không từ localStorage ────────────
api.interceptors.request.use((config) => {
  const token = tokenManager.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Fix #3: Dùng CustomEvent thay vì window.location.href ────────────────────
function emitLogout() {
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

// Đọc refreshToken từ Zustand persist JSON (tránh circular import)
function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    return JSON.parse(raw)?.state?.refreshToken ?? null;
  } catch {
    return null;
  }
}

// ── Queue cho concurrent 401 ──────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Đã có request refresh đang chạy → đưa vào queue
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      emitLogout();
      return Promise.reject(error);
    }

    try {
      // Dùng axios raw (không phải api instance) để tránh interceptor loop
      const { data } = await axios.post<RefreshResponse>(
        `${BASE_URL}/auth/refresh`,
        { refreshToken },
      );
      tokenManager.set(data.accessToken);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      tokenManager.clear();
      emitLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
