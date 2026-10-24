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
  const { user, activeRole, unreadNotificationCount, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
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
      <button type="button" onClick={onMenuClick} className="rounded-control p-2 text-ink-600 hover:bg-ink-100 lg:hidden" aria-label="Open navigation" aria-controls="dashboard-sidebar">
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden lg:block" aria-hidden="true" />
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate('/dashboard/notifications')} className="relative rounded-control p-2.5 text-ink-600 hover:bg-ink-100" aria-label={unreadNotificationCount ? `${unreadNotificationCount} unread notifications` : 'Notifications'}>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadNotificationCount > 0 && <span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-pill bg-forest-700 px-1 text-[12px] font-bold text-white">{unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}</span>}
        </button>
        <div className="relative">
          <button type="button" onClick={() => setProfileOpen((value) => !value)} className="flex items-center gap-2 rounded-control p-1.5 hover:bg-ink-100" aria-expanded={profileOpen} aria-haspopup="menu">
            <Avatar src={user?.avatar_url} name={user?.name} className="h-8 w-8 rounded-pill" />
            <span className="hidden max-w-32 truncate text-sm font-semibold text-ink-800 sm:block">{user?.name || 'Account'}</span>
            <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-card border border-ink-200 bg-white p-1.5 shadow-level-2" role="menu">
              {profilePath && <button type="button" onClick={() => { setProfileOpen(false); navigate(profilePath); }} className="w-full rounded-control px-3 min-h-[40px] text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem">Your profile</button>}
              <button type="button" onClick={() => { setProfileOpen(false); setShowPhotoModal(true); }} className="w-full rounded-control px-3 min-h-[40px] text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem">Change photo</button>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-control px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50" role="menuitem"><LogOut className="h-4 w-4" /> Sign out</button>
            </div>
          )}
        </div>
      </div>
      <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </header>
  );
};
