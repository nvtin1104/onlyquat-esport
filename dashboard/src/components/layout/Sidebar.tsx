import {
  ChevronLeft,
  ChevronRight,
  Coins,
  Gamepad2,
  LayoutDashboard,
  Settings,
  Shield,
  Star,
  Swords,
  UserCog,
  Users,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tong quan', to: '/' },
  { icon: Users, label: 'Tuyen thu', to: '/players' },
  { icon: Shield, label: 'Doi tuyen', to: '/teams' },
  { icon: Swords, label: 'Tran dau', to: '/matches' },
  { icon: Star, label: 'Danh gia', to: '/ratings', badge: '23' },
  { icon: Gamepad2, label: 'Minigame', to: '/minigame' },
  { icon: Coins, label: 'Diem thuong', to: '/points' },
  { icon: UserCog, label: 'Nguoi dung', to: '/users' },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: 'Cai dat', to: '/settings' },
];

function SidebarNavItem({
  item,
  collapsed,
  onNavClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const location = useLocation();
  const isActive =
    item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to);

  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-colors relative group',
        collapsed ? 'justify-center px-2' : 'px-4',
        isActive
          ? 'bg-bg-elevated border-l-[3px] border-accent-acid text-text-primary'
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border-l-[3px] border-transparent',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-5 h-5 shrink-0" />
      {!collapsed && (
        <span className="font-body text-sm truncate">{item.label}</span>
      )}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-accent-acid text-black text-[10px] px-1.5 py-0.5 font-bold leading-none">
          {item.badge}
        </span>
      )}
      {collapsed && item.badge && (
        <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-accent-acid text-black text-[8px] flex items-center justify-center font-bold leading-none">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar({ collapsed, onToggle, onNavClick }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-surface border-r border-border-subtle transition-all duration-300 overflow-hidden shrink-0',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-border-subtle shrink-0',
          collapsed ? 'justify-center px-2' : 'px-4',
        )}
      >
        {collapsed ? (
          <span className="font-display font-bold text-accent-acid text-base leading-none">
            AA
          </span>
        ) : (
          <span className="font-display font-bold text-lg text-accent-acid tracking-wide leading-none">
            ARCADE ARENA
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {mainNavItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavClick={onNavClick}
          />
        ))}
      </nav>

      {/* Separator + Settings */}
      <div className="shrink-0">
        <div className="border-t border-border-subtle" />
        {bottomNavItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavClick={onNavClick}
          />
        ))}

        {/* Toggle button */}
        <div className="border-t border-border-subtle">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'w-full flex items-center gap-2 px-4 py-3 text-text-dim hover:text-text-secondary hover:bg-bg-elevated transition-colors',
              collapsed && 'justify-center px-2',
            )}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="font-body text-xs">Thu gon</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
