import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardNavItem, DashboardRole } from './dashboardTypes';
import { cn } from '../../utils/cn';
import { Avatar } from '../ui/Avatar';
import logoUrl from '../../assets/logo.png';

interface DashboardSidebarProps {
  items: DashboardNavItem[];
  role: DashboardRole;
  open?: boolean;
  onClose?: () => void;
}

const roleLabels: Record<DashboardRole, string> = {
  learner: 'Learner',
  educator: 'Educator',
  admin: 'Lead admin',
  secondary_admin: 'Admin',
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
        'fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-ink-200/70 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex h-[4.5rem] items-center justify-between px-5">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 min-h-[44px] rounded-control focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Go to the iSkillLink home page">
          <img src={logoUrl} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
          <span className="font-display text-lg font-bold tracking-tight text-ink-950">iSkillLink</span>
        </button>
        <button type="button" onClick={onClose} className="rounded-control p-3 text-ink-500 hover:bg-ink-100 lg:hidden" aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-4 flex items-center gap-3 rounded-card bg-ink-50 p-3">
        <Avatar src={user?.avatar_url} name={user?.name} className="h-11 w-11 rounded-full" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{user?.name || 'Welcome'}</p>
          <p className="text-xs text-ink-500">{roleLabels[role]}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Primary">
        <ul className="space-y-1">
          {items.map((item, index) => {
            const heading = (item.group || 'Menu') !== (index > 0 ? items[index - 1].group || 'Menu' : '') ? item.group || 'Menu' : null;
            const active = isActive(item);
            const Icon = item.icon;
            const hasBadge = item.badge !== undefined && item.badge !== 0 && item.badge !== '';
            return (
              <li key={item.href}>
                {heading && <p className={cn('px-3 pb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400', index > 0 && 'pt-5')}>{heading}</p>}
                <NavLink
                  to={item.href}
                  end={item.end}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-control px-3 text-sm font-semibold transition-colors',
                    active ? 'bg-ink-900 text-white shadow-soft' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950',
                  )}
                >
                  <Icon className={cn('h-[18px] w-[18px]', active ? 'text-sun-300' : 'text-ink-400')} aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  {hasBadge && (
                    <span className={cn('grid h-5 min-w-5 place-items-center rounded-pill px-1.5 text-[12px] font-bold', active ? 'bg-white/20 text-white' : 'bg-forest-700 text-white')}>
                      {item.badge}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 p-4">
        {(role === 'learner' || role === 'educator') && <div className="relative isolate overflow-hidden rounded-card bg-forest-950 p-4 text-white">
          <span aria-hidden="true" className="absolute -right-6 -top-8 -z-10 h-24 w-24 rounded-full border border-white/15 bg-white/5" />
          <p className="text-sm font-semibold">Need a hand?</p>
          <p className="mt-0.5 text-xs text-forest-100/80">Our team in Mbarara answers on WhatsApp.</p>
          <a
            href="https://wa.me/256744024529"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-pill bg-sun-300 px-3.5 text-xs font-semibold text-ink-950 hover:bg-sun-200 focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />Message us
          </a>
        </div>}
        <button type="button" onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-semibold text-ink-600 hover:bg-ink-50 hover:text-ink-950">
          <LogOut className="h-[18px] w-[18px] text-ink-400" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
