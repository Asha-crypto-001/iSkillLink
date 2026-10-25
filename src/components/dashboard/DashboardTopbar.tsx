import React, { useEffect, useRef, useState } from 'react';
import {
  Bell, Menu, ChevronDown, LogOut, Search, CalendarPlus, CalendarCheck, Wallet, Sparkles, ShieldCheck, MessageSquare, User, Camera, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ProfilePhotoUploadModal } from '../ProfilePhotoUploadModal';
import { Notification } from '../../types';
import { formatTimeAgo } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

/** An icon and tint for each kind of notification, so the list can be scanned at a glance. */
function notificationLook(n: Notification) {
  if (n.title.startsWith('New message')) return { Icon: MessageSquare, tint: 'bg-violet-50 text-violet-600' };
  switch (n.type) {
    case 'booking_request': return { Icon: CalendarPlus, tint: 'bg-sky-50 text-sky-600' };
    case 'booking_accepted': return { Icon: CalendarCheck, tint: 'bg-forest-50 text-forest-700' };
    case 'payment_update': return { Icon: Wallet, tint: 'bg-clay-50 text-clay-700' };
    case 'match_found': return { Icon: Sparkles, tint: 'bg-amber-50 text-amber-600' };
    case 'verification_update': return { Icon: ShieldCheck, tint: 'bg-forest-50 text-forest-700' };
    default: return { Icon: Bell, tint: 'bg-ink-100 text-ink-600' };
  }
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({ onMenuClick }) => {
  const { user, activeRole, notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsRead, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [search, setSearch] = useState('');
  const menusRef = useRef<HTMLDivElement | null>(null);

  // Close either menu on an outside click or Escape.
  useEffect(() => {
    if (!profileOpen && !notificationsOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (menusRef.current && !menusRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setProfileOpen(false); setNotificationsOpen(false); }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen, notificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const openNotification = (n: Notification) => {
    setNotificationsOpen(false);
    if (!n.is_read) markNotificationAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  // Admins have no profile page; learners and educators edit theirs on the Profile tab.
  const profilePath = activeRole === 'educator'
    ? '/dashboard/educator/profile'
    : activeRole === 'learner'
      ? '/dashboard/learner/profile'
      : null;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const menuItem = 'flex w-full items-center gap-2.5 rounded-control px-3 min-h-[44px] md:min-h-[40px] text-left text-sm text-ink-700 hover:bg-ink-50';

  return (
    <header className="sticky top-0 z-30 flex h-[4.5rem] items-center justify-between bg-ink-50/85 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <button type="button" onClick={onMenuClick} className="rounded-control p-3 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open navigation" aria-controls="dashboard-sidebar">
        <Menu className="h-5 w-5" />
      </button>
      {activeRole === 'learner' || activeRole === 'educator' ? (
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); navigate(search.trim() ? `/find-skill?search=${encodeURIComponent(search.trim())}` : '/find-skill'); }}
          className="hidden w-full max-w-md md:block"
        >
          <label htmlFor="dashboard-search" className="sr-only">Search skills and educators</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              id="dashboard-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills or educators…"
              className="h-11 w-full rounded-pill border border-ink-200/70 bg-white pl-11 pr-4 text-sm text-ink-900 shadow-soft placeholder:text-ink-400 focus:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-100"
            />
          </div>
        </form>
      ) : (
        <p className="hidden text-sm text-ink-500 lg:block">{today}</p>
      )}
      <div className="ml-4 flex items-center gap-2" ref={menusRef}>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }}
            className={cn('relative grid h-11 w-11 place-items-center rounded-full border border-ink-200/70 bg-white text-ink-600 shadow-soft transition hover:text-ink-900', notificationsOpen && 'border-ink-300 text-ink-900')}
            aria-label={unreadNotificationCount ? `Notifications, ${unreadNotificationCount} unread` : 'Notifications'}
            aria-expanded={notificationsOpen}
            aria-haspopup="menu"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-pill border-2 border-white bg-forest-700 px-1 text-[12px] font-bold text-white">{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</span>}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-card border border-ink-200 bg-white shadow-level-3" role="menu" aria-label="Notifications">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <p className="font-semibold text-ink-900">Notifications</p>
                {unreadNotificationCount > 0 && (
                  <button type="button" onClick={markAllNotificationsRead} className="text-xs font-semibold text-forest-700 hover:text-forest-800">Mark all as read</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-ink-50 text-ink-400" aria-hidden="true"><Bell className="h-5 w-5" /></span>
                  <p className="mt-3 text-sm font-semibold text-ink-900">You’re all caught up</p>
                  <p className="mt-0.5 text-xs text-ink-500">Bookings, payments and messages show up here.</p>
                </div>
              ) : (
                <ul className="max-h-[26rem] overflow-y-auto p-1.5">
                  {notifications.slice(0, 12).map((n) => {
                    const { Icon, tint } = notificationLook(n);
                    return (
                      <li key={n.id}>
                        <button type="button" onClick={() => openNotification(n)} className={cn('flex w-full gap-3 rounded-control px-3 py-3 text-left transition hover:bg-ink-50', !n.is_read && 'bg-forest-50/50')} role="menuitem">
                          <span className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full', tint)} aria-hidden="true">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className={cn('text-sm text-ink-900', n.is_read ? 'font-medium' : 'font-semibold')}>{n.title}</span>
                              {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest-600" aria-label="Unread" />}
                            </span>
                            <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-600">{n.message}</span>
                            <span className="mt-1 block text-[12px] text-ink-400">{formatTimeAgo(n.created_at)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }}
            className={cn('flex h-11 items-center gap-2 rounded-pill border border-ink-200/70 bg-white p-1 pr-3 shadow-soft transition hover:border-ink-300', profileOpen && 'border-ink-300')}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <Avatar src={user?.avatar_url} name={user?.name} className="h-8 w-8 rounded-full" />
            <span className="hidden max-w-[9rem] truncate text-sm font-semibold text-ink-800 sm:block">{user?.name?.split(' ')[0] || 'Account'}</span>
            <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-card border border-ink-200 bg-white p-1.5 shadow-level-3" role="menu">
              <div className="border-b border-ink-100 px-3 pb-2.5 pt-1.5">
                <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
              <div className="pt-1.5">
                {profilePath && <button type="button" onClick={() => { setProfileOpen(false); navigate(profilePath); }} className={menuItem} role="menuitem"><User className="h-4 w-4 text-ink-400" aria-hidden="true" />Your profile</button>}
                <button type="button" onClick={() => { setProfileOpen(false); setShowPhotoModal(true); }} className={menuItem} role="menuitem"><Camera className="h-4 w-4 text-ink-400" aria-hidden="true" />Change photo</button>
                <button type="button" onClick={() => { setProfileOpen(false); navigate('/'); }} className={menuItem} role="menuitem"><Home className="h-4 w-4 text-ink-400" aria-hidden="true" />iSkillLink home</button>
                <button type="button" onClick={handleLogout} className={menuItem} role="menuitem"><LogOut className="h-4 w-4 text-ink-400" aria-hidden="true" />Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </header>
  );
};
