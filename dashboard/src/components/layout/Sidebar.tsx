import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coins,
  Gamepad2,
  KeyRound,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  Settings,
  Shield,
  Star,
  Swords,
  UserCog,
  Users,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavClick?: () => void;
}

interface SubNavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
  badge?: string;
  children?: SubNavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const navGroups: NavGroup[] = [
  {
    label: 'Tổng quan',
    defaultOpen: true,
    items: [{ icon: LayoutDashboard, label: 'Bảng điều khiển', to: '/' }],
  },
  {
    label: 'Thông tin cơ bản',
    defaultOpen: true,
    items: [
      { icon: Building2, label: 'Tổ chức', to: '/organizations' },
      { icon: MapPin, label: 'Khu vực', to: '/regions' },
    ],
  },
  {
    label: 'Thi đấu',
    defaultOpen: true,
    items: [
      { icon: Shield, label: 'Đội tuyển', to: '/teams' },
      { icon: Users, label: 'Tuyển thủ', to: '/players' },
      { icon: Swords, label: 'Trận đấu', to: '/matches' },
    ],
  },
  {
    label: 'Hoạt động',
    defaultOpen: true,
    items: [
      { icon: Star, label: 'Đánh giá', to: '/ratings', badge: '23' },
      { icon: Gamepad2, label: 'Minigame', to: '/minigame' },
      { icon: Coins, label: 'Điểm thưởng', to: '/points' },
    ],
  },
  {
    label: 'Hệ thống',
    defaultOpen: true,
    items: [
      {
        icon: UserCog,
        label: 'Người dùng',
        to: '/users',
        children: [
          { icon: Users, label: 'Danh sách người dùng', to: '/users' },
          { icon: PlusCircle, label: 'Tạo người dùng', to: '/users/create' },
          { icon: KeyRound, label: 'Phân quyền', to: '/users/permissions' },
          { icon: Shield, label: 'Nhóm quyền', to: '/permissions/groups' },
        ],
      },
      { icon: Settings, label: 'Cài đặt', to: '/settings' },
    ],
  },
];

// Animated expand/collapse using height transition
function AnimatedCollapse({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(open ? undefined : 0);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      const scrollHeight = ref.current.scrollHeight;
      setHeight(scrollHeight);
      const timer = setTimeout(() => setHeight(undefined), 250);
      return () => clearTimeout(timer);
    } else {
      const scrollHeight = ref.current.scrollHeight;
      setHeight(scrollHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight(0));
      });
    }
  }, [open]);

  return (
    <div
      ref={ref}
      style={{ height: height === undefined ? 'auto' : height }}
      className="overflow-hidden transition-[height] duration-250 ease-in-out"
    >
      {children}
    </div>
  );
}

function SidebarSubItem({
  item,
  collapsed,
  onNavClick,
}: {
  item: SubNavItem;
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === item.to;
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onNavClick}
      className={cn(
        'flex items-center gap-2.5 py-2 pl-11 pr-4 text-sm transition-colors relative',
        isActive
          ? 'text-text-primary bg-bg-elevated border-l-[3px] border-accent-acid'
          : 'text-text-dim hover:text-text-secondary hover:bg-bg-elevated border-l-[3px] border-transparent',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {!collapsed && (
        <span className="font-body text-xs truncate">{item.label}</span>
      )}
    </NavLink>
  );
}

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
  const hasChildren = item.children && item.children.length > 0;

  const isActive =
    item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to);

  const isChildActive = hasChildren
    ? item.children!.some((c) => location.pathname.startsWith(c.to))
    : false;

  const [open, setOpen] = useState(isActive || isChildActive);

  // Auto-open when navigating to a child
  useEffect(() => {
    if (isActive || isChildActive) setOpen(true);
  }, [isActive, isChildActive]);

  const Icon = item.icon;

  if (!hasChildren) {
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

  // Item with children
  return (
    <div>
      <button
        type="button"
        onClick={() => !collapsed && setOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 transition-colors relative group',
          collapsed ? 'justify-center px-2' : 'px-4',
          isActive || isChildActive
            ? 'text-text-primary'
            : 'text-text-secondary hover:text-text-primary',
          (isActive || isChildActive) && !collapsed
            ? 'bg-bg-elevated border-l-[3px] border-accent-acid'
            : 'border-l-[3px] border-transparent hover:bg-bg-elevated',
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="font-body text-sm truncate flex-1 text-left">
              {item.label}
            </span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                open && 'rotate-180',
              )}
            />
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-accent-acid text-black text-[8px] flex items-center justify-center font-bold leading-none">
            {item.badge}
          </span>
        )}
      </button>

      {!collapsed && (
        <AnimatedCollapse open={open}>
          {item.children!.map((child) => (
            <SidebarSubItem
              key={child.to}
              item={child}
              collapsed={collapsed}
              onNavClick={onNavClick}
            />
          ))}
        </AnimatedCollapse>
      )}
    </div>
  );
}

function SidebarGroup({
  group,
  collapsed,
  onNavClick,
}: {
  group: NavGroup;
  collapsed: boolean;
  onNavClick?: () => void;
}) {
  const [open, setOpen] = useState(group.defaultOpen ?? true);

  return (
    <div className="mb-1">
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-1.5 text-text-dim hover:text-text-secondary transition-colors group"
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            {group.label}
          </span>
          <ChevronDown
            className={cn(
              'w-3 h-3 opacity-60 group-hover:opacity-100 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </button>
      )}

      {collapsed ? (
        <div>
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavClick={onNavClick}
            />
          ))}
        </div>
      ) : (
        <AnimatedCollapse open={open}>
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              onNavClick={onNavClick}
            />
          ))}
        </AnimatedCollapse>
      )}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle, onNavClick }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-surface border-r border-border-subtle overflow-hidden shrink-0',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-border-subtle shrink-0 overflow-hidden',
          collapsed ? 'justify-center px-2' : 'px-4',
        )}
      >
        {collapsed ? (
          <span className="font-display font-bold text-accent-acid text-base leading-none">
            AA
          </span>
        ) : (
          <span className="font-display font-bold text-lg text-accent-acid tracking-wide leading-none whitespace-nowrap">
            ARCADE ARENA
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {navGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            group={group}
            collapsed={collapsed}
            onNavClick={onNavClick}
          />
        ))}
      </nav>

      {/* Toggle button */}
      <div className="shrink-0 border-t border-border-subtle">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'w-full flex items-center gap-2 px-4 py-3 text-text-dim hover:text-text-secondary hover:bg-bg-elevated transition-colors',
            collapsed && 'justify-center px-2',
          )}
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="font-body text-xs">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
