import { Link } from 'react-router-dom';
import { UserPlus, Swords, ClipboardList, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  icon: LucideIcon;
  label: string;
  to: string;
}

const actions: QuickAction[] = [
  { icon: UserPlus, label: '+ Them tuyen thu', to: '/players/new' },
  { icon: Swords, label: '+ Tao tran dau', to: '/matches' },
  { icon: ClipboardList, label: 'Duyet danh gia', to: '/ratings' },
  { icon: Gift, label: 'Tang diem', to: '/points' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map(({ icon: Icon, label, to }) => (
        <Link
          key={to}
          to={to}
          className="border rounded-sm p-4 text-center cursor-pointer transition bg-bg-card border-border-subtle hover:border-border-hover"
        >
          <Icon className="w-8 h-8 mx-auto mb-2 text-accent-acid" />
          <p className="font-body text-sm text-text-primary">{label}</p>
        </Link>
      ))}
    </div>
  );
}
