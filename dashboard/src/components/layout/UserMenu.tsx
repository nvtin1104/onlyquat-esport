import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleLogout() {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  const displayName = user?.name ?? user?.username ?? 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-accent-acid/20 flex items-center justify-center text-accent-acid text-sm font-bold select-none">
          {initial}
        </div>
        <span className="hidden sm:block text-sm text-text-primary font-body">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-dim transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-bg-card border border-border-subtle rounded-sm py-1 shadow-lg min-w-[180px] z-50">
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-xs font-medium text-text-primary truncate">
              {displayName}
            </p>
            <p className="text-xs text-text-dim truncate">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-body text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <User className="w-4 h-4 text-text-dim" />
            Hồ sơ
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-body text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Settings className="w-4 h-4 text-text-dim" />
            Cài đặt
          </button>

          <div className="my-1 border-t border-border-subtle" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-body text-danger hover:bg-bg-elevated transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
