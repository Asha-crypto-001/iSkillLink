import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardNavItem, DashboardRole, SidebarPeople } from './dashboardTypes';
import { cn } from '../../utils/cn';
import { Avatar } from '../ui/Avatar';
import logoUrl from '../../assets/logo.png';

interface DashboardSidebarProps {
  items: DashboardNavItem[];
  role: DashboardRole;
  people?: SidebarPeople;
  open?: boolean;
  onClose?: () => void;
}

const sectionLabel = 'px-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400';

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ items, people, open = false, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (item: DashboardNavItem) =>
    item.end ? location.pathname === item.href : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);

  const handleLogout = () => {
    logout();
    navigate('/auth');
    onClose?.();
  };

  // "Settings" items sit at the bottom with Logout; the rest are grouped under their headings.
  const mainItems = items.filter(item => item.group !== 'Settings');
  const settingsItems = items.filter(item => item.group === 'Settings');

  const renderItem = (item: DashboardNavItem) => {
    const active = isActive(item);
    const Icon = item.icon;
    const hasBadge = item.badge !== undefined && item.badge !== 0 && item.badge !== '';
    return (
      <li key={item.href}>
        <NavLink
          to={item.href}
          end={item.end}
          onClick={onClose}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex h-11 items-center gap-3 rounded-[12px] px-3 text-[15px] transition-colors',
            active ? 'bg-[#F5F6FA] font-semibold text-ink-900' : 'font-medium text-ink-500 hover:text-ink-900',
          )}
        >
          <Icon className={cn('h-[18px] w-[18px]', active ? 'text-forest-600' : 'text-ink-400')} aria-hidden="true" />
          <span className="flex-1">{item.label}</span>
          {hasBadge && (
            <span className="grid h-5 min-w-5 place-items-center rounded-pill bg-forest-500 px-1.5 text-[11px] font-bold text-white">
              {item.badge}<span className="sr-only"> new</span>
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <aside
      id="dashboard-sidebar"
      aria-label="Dashboard navigation"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 -translate-x-full flex-col border-r border-[#ECEEF3] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex h-20 items-center justify-between px-6">
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 rounded-control focus-visible:ring-2 focus-visible:ring-forest-600" aria-label="Go to the iSkillLink home page">
          <img src={logoUrl} alt="" className="h-8 w-8 object-contain" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-ink-900">iSkillLink</span>
        </button>
        <button type="button" onClick={onClose} className="rounded-control p-2.5 text-ink-500 hover:bg-[#F5F6FA] lg:hidden" aria-label="Close navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4 pt-2" aria-label="Primary">
        {mainItems.map((item, index) => {
          const group = item.group || 'Overview';
          const startsGroup = index === 0 || (mainItems[index - 1].group || 'Overview') !== group;
          if (!startsGroup) return null;
          const groupItems = mainItems.filter(i => (i.group || 'Overview') === group);
          return (
            <div key={group} className={cn(index > 0 && 'mt-6')}>
              <p className={sectionLabel}>{group}</p>
              <ul className="space-y-0.5 px-3">{groupItems.map(renderItem)}</ul>
            </div>
          );
        })}

        {people && people.people.length > 0 && (
          <div className="mt-6">
            <p className={sectionLabel}>{people.title}</p>
            <ul className="space-y-0.5 px-3">
              {people.people.slice(0, 4).map(person => (
                <li key={person.id}>
                  <button type="button" onClick={() => { navigate(person.href); onClose?.(); }} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2 text-left hover:bg-[#F5F6FA]">
                    <Avatar src={person.avatar_url} name={person.name} className="h-8 w-8 rounded-full" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">{person.name}</span>
                      {person.subtitle && <span className="block truncate text-xs text-ink-400">{person.subtitle}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t border-[#ECEEF3] py-4">
        <p className={sectionLabel}>Settings</p>
        <ul className="space-y-0.5 px-3">
          {settingsItems.map(renderItem)}
          <li>
            <button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 rounded-[12px] px-3 text-[15px] font-medium text-rose-500 hover:bg-rose-50">
              <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
              Log out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};
