import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  children: React.ReactNode;
}

/**
 * Gọi initialize() 1 lần khi app mount để verify token.
 * Fix #3: lắng nghe auth:logout event từ api.ts → navigate thay vì window.location.href.
 */
export function AuthInitializer({ children }: Props) {
  const initialize = useAuthStore((s) => s.initialize);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    initialize();

    function handleLogout() {
      logout();
      navigate('/login', { replace: true });
    }

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
