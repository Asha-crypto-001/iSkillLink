import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardNavItem, DashboardRole } from './dashboardTypes';
import { cn } from '../../utils/cn';

interface DashboardSidebarProps {
  items: DashboardNavItem[];
  role: DashboardRole;
  open?: boolean;
  onClose?: () => void;
}

const roleLabels: Record<DashboardRole, string> = {
  learner: 'Learner workspace',
  educator: 'Educator workspace',
  admin: 'Admin workspace',
  secondary_admin: 'Admin workspace',
  guest: 'Dashboard',
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ items, role, open = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: DashboardNavItem) =>
    item.end ? location.pathname === item.href : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onClose?.();
  };

  return (
    <aside
      id="dashboard-sidebar"
      aria-label="Dashboard navigation"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-ink-200 bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex h-20 items-center justify-between border-b border-ink-200 px-6">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 rounded-control focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Go to home">
          <span className="grid h-9 w-9 place-items-center rounded-control bg-forest-700 text-sm font-extrabold text-white">iS</span>
          <span className="font-display text-lg font-bold tracking-tight text-ink-950">iSkillLink</span>
        </button>
        <button type="button" onClick={onClose} className="rounded-control p-2 text-ink-500 hover:bg-ink-100 lg:hidden" aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-ink-100 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">{roleLabels[role]}</p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-900">{user?.name || 'Welcome'}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Primary">
        {items.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors',
                active ? 'bg-forest-50 text-forest-800' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active ? 'text-forest-700' : 'text-ink-400')} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && <span className="rounded-pill bg-ink-100 px-2 py-0.5 text-xs text-ink-600">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ink-200 p-3">
        <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-semibold text-ink-600 hover:bg-ink-50 hover:text-ink-950">
          <LogOut className="h-[18px] w-[18px] text-ink-400" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
