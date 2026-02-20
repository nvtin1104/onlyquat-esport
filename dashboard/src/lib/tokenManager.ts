/**
 * In-memory accessToken store.
 * Keeps accessToken out of localStorage → reduces XSS exposure.
 * refreshToken vẫn cần persist (localStorage qua Zustand) để restore session sau F5.
 */
let _accessToken: string | null = null;

export const tokenManager = {
  get: () => _accessToken,
  set: (token: string | null) => {
    _accessToken = token;
  },
  clear: () => {
    _accessToken = null;
  },
};
