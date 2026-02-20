import { Bell, Menu, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { UserMenu } from './UserMenu';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-6 shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-text-dim pointer-events-none" />
          <input
            type="text"
            placeholder="Tim kiem..."
            className="w-64 pl-9 pr-3 py-1.5 bg-bg-card border border-border-subtle rounded-sm text-sm font-body text-text-primary placeholder:text-text-dim focus:outline-none focus:border-border-hover transition-colors"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative">
          <button
            type="button"
            className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-bold pointer-events-none">
            5
          </span>
        </div>

        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
