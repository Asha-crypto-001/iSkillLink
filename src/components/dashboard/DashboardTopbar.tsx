import React, { useState } from 'react';
import { Bell, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ProfilePhotoUploadModal } from '../ProfilePhotoUploadModal';

interface DashboardTopbarProps {
  onMenuClick: () => void;
}

export const DashboardTopbar: React.FC<DashboardTopbarProps> = ({ onMenuClick }) => {
  const { user, activeRole, notifications, unreadNotificationCount, markNotificationAsRead, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  // Admins have no profile page; learners and educators edit theirs on the Profile tab.
  const profilePath = activeRole === 'educator'
    ? '/dashboard/educator/profile'
    : activeRole === 'learner'
      ? '/dashboard/learner/profile'
      : null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button type="button" onClick={onMenuClick} className="rounded-control p-3 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open navigation" aria-controls="dashboard-sidebar">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <div className="relative">
          <button type="button" onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} className="relative rounded-control p-3 text-ink-600 hover:bg-ink-100" aria-label={unreadNotificationCount ? `${unreadNotificationCount} unread notifications` : 'Notifications'} aria-expanded={notificationsOpen} aria-haspopup="menu">
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadNotificationCount > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-pill bg-forest-700 px-1 text-[12px] font-bold text-white">{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</span>}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-card border border-ink-200 bg-white p-1.5 shadow-level-2" role="menu">
              {notifications.length === 0 ? (
                <p className="px-3 py-4 text-sm text-ink-500">No notifications yet.</p>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 8).map((n) => (
                    <button key={n.id} type="button" onClick={() => { setNotificationsOpen(false); markNotificationAsRead(n.id); if (n.link) navigate(n.link); }} className="w-full rounded-control px-3 py-2 text-left hover:bg-ink-50" role="menuitem">
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600" aria-hidden="true" />}
                        <span className="truncate">{n.title}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-500">{n.message}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="relative">
          <button type="button" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} className="flex items-center gap-2 rounded-control p-1.5 hover:bg-ink-100" aria-expanded={profileOpen} aria-haspopup="menu">
            <Avatar src={user?.avatar_url} name={user?.name} className="h-8 w-8 rounded-pill" />
            <span className="hidden max-w-32 truncate text-sm font-semibold text-ink-800 sm:block">{user?.name || 'Account'}</span>
            <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-card border border-ink-200 bg-white p-1.5 shadow-level-2" role="menu">
              {profilePath && <button type="button" onClick={() => { setProfileOpen(false); navigate(profilePath); }} className="w-full rounded-control px-3 min-h-[44px] md:min-h-[40px] text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem">Your profile</button>}
              <button type="button" onClick={() => { setProfileOpen(false); setShowPhotoModal(true); }} className="w-full rounded-control px-3 min-h-[44px] md:min-h-[40px] text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem">Change photo</button>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          )}
        </div>
      </div>
      <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </header>
  );
};
