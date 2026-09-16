import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, ChevronDown, User, LogOut,
  Menu, X, GraduationCap, ArrowRight,
  Settings, PlusCircle, Phone, Mail, Camera
} from 'lucide-react';
import { ProfilePhotoUploadModal } from './ProfilePhotoUploadModal';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
  onOpenAuth: (defaultMode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSkillRequest,
  onOpenAuth
}) => {
  const {
    user,
    logout,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead
  } = useAuth();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Body scroll lock for mobile menu + Esc handling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setMobileMenuOpen(false);
      };
      document.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const getDashboardTarget = () => {
    if (user?.role === 'admin' || user?.role === 'secondary_admin') return 'admin-dashboard';
    if (user?.role === 'educator') return 'educator-dashboard';
    return 'learner-dashboard';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Lead Admin Dashboard';
    if (user?.role === 'secondary_admin') return 'Admin Dashboard';
    if (user?.role === 'educator') return 'Educator Portal';
    return 'Learner Dashboard';
  };

  const navLinks = [
    { id: 'find-skill', label: 'Explore Skills' },
    { id: 'become-educator', label: 'Teach on iSkill' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      {/* Stable header — no auto-hide, no ribbon collapse (Phase 2 precise: predictable nav) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-ink-200 shadow-soft">
        {/* Static utility ribbon — always visible, h-9, no CLS */}
        <div className="bg-ink-950 text-ink-200 text-xs px-4 sm:px-8 border-b border-ink-800 h-9 flex items-center overflow-hidden">
          <div className="container-app flex items-center justify-between gap-4 !px-0 w-full">
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold uppercase text-[11px] tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" aria-hidden="true"></span>
                iSkillLink Uganda
              </span>
              <span className="text-ink-600 hidden sm:inline">•</span>
              <span className="text-ink-200 hidden sm:inline text-xs">
                HQ: Mbarara City
              </span>
              <span className="text-ink-600 hidden md:inline">•</span>
              <span className="text-ink-300 hidden md:inline text-xs">
                Founded by Ashabahebwa Hassan
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs shrink-0 font-medium text-ink-200">
              <a
                href="mailto:iskilllink0@gmail.com"
                className="hidden md:flex items-center gap-1 text-ink-200 hover:text-amber-300 transition"
              >
                <Mail className="w-3 h-3 text-forest-400" />
                <span>iskilllink0@gmail.com</span>
              </a>
              <span className="text-ink-700 hidden md:inline">|</span>
              <a
                href="https://wa.me/256744024529"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition flex items-center gap-1 text-forest-400"
              >
                <Phone className="w-3 h-3" />
                <span className="text-ink-100 hover:text-amber-300">+256 744 024 529</span>
              </a>
              <span className="text-ink-700 hidden lg:inline">|</span>
              <a
                href="tel:+256772233621"
                className="hidden lg:inline hover:text-amber-300 transition text-ink-400"
              >
                +256 772 233 621
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="container-app">
          <div className="flex items-center justify-between h-[64px]">
            {/* Brand */}
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            >
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-control shadow-soft border border-ink-200 p-1 group-hover:border-forest-200 transition shrink-0">
                <img
                  src="./logo.png"
                  alt="iSkillLink Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <div>
                <div className="text-lg sm:text-xl font-bold tracking-tight text-ink-900 font-display flex items-center gap-1.5 leading-none">
                  iSkillLink
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest bg-forest-50 text-forest-700 px-1.5 py-0.5 rounded border border-forest-200">
                    UG
                  </span>
                </div>
                <div className="text-[11px] text-ink-500 font-medium tracking-tight mt-0.5">
                  Where Skills Meet Opportunity
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links — with aria-current */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5" aria-label="Primary">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3.5 py-2 text-[13px] font-semibold transition-all rounded-control ${
                      isActive
                        ? 'text-forest-800 font-bold bg-forest-50 border border-forest-200 shadow-soft'
                        : 'text-ink-700 hover:text-ink-900 hover:bg-ink-50 border border-transparent'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-forest-700 rounded-full" aria-hidden="true"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={onOpenSkillRequest}
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold rounded-control bg-ink-50 hover:bg-ink-100 text-ink-800 border border-ink-200 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-forest-700" />
                <span>Custom Request</span>
              </button>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="menu"
                    aria-label="User menu"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setUserDropdownOpen(false);
                      if (e.key === 'ArrowDown' && !userDropdownOpen) setUserDropdownOpen(true);
                    }}
                    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-pill border transition shadow-soft ${
                      userDropdownOpen
                        ? 'bg-ink-900 text-white border-ink-900 ring-2 ring-forest-600/30'
                        : 'bg-white hover:bg-ink-50 text-ink-800 border-ink-200'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-forest-600"
                      />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" aria-hidden="true"></span>
                      )}
                    </div>

                    <div className="text-left leading-none">
                      <div className="text-[13px] font-bold max-w-[110px] truncate">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                        userDropdownOpen
                          ? 'text-amber-400'
                          : user.role === 'admin'
                          ? 'text-amber-700'
                          : user.role === 'educator'
                          ? 'text-forest-700'
                          : 'text-ink-500'
                      }`}>
                        {user.role}
                      </div>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdownOpen && (
                    <div role="menu" aria-label="User menu" onKeyDown={(e)=>{ if(e.key==='Escape') setUserDropdownOpen(false); }} className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-level-3 border border-ink-200 overflow-hidden z-50 animate-fadeIn">
                      <div className="p-4 bg-ink-50 border-b border-ink-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={user.name}
                            className="w-10 h-10 rounded-card object-cover border border-forest-600 shadow-soft shrink-0"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-[13px] text-ink-900 truncate">{user.name}</div>
                            <div className="text-xs text-ink-500 truncate">{user.email}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowPhotoModal(true);
                            setUserDropdownOpen(false);
                          }}
                          className="p-2 rounded-control bg-white border border-ink-200 hover:bg-forest-50 text-ink-700 hover:text-forest-700 transition shrink-0"
                          title="Change Profile Photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-2 space-y-1 text-[13px]">
                        <button
                          onClick={() => {
                            setCurrentView(getDashboardTarget());
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold flex items-center justify-between transition shadow-soft"
                        >
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                            {user.role === 'educator' && <GraduationCap className="w-4 h-4 text-forest-200" />}
                            {user.role === 'learner' && <User className="w-4 h-4 text-forest-200" />}
                            <span>{getDashboardLabel()}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        <button
                          onClick={() => {
                            onOpenSkillRequest();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-control text-ink-700 hover:bg-ink-50 font-medium flex items-center gap-2 text-left transition"
                        >
                          <PlusCircle className="w-4 h-4 text-forest-700" />
                          <span>Submit Custom Skill Request</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowPhotoModal(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-control text-ink-700 hover:bg-ink-50 font-medium flex items-center gap-2 text-left transition"
                        >
                          <Camera className="w-4 h-4 text-ink-500" />
                          <span>Update Profile Picture</span>
                        </button>
                      </div>

                      {notifications.length > 0 && (
                        <div className="px-3 py-2 bg-ink-50/80 border-t border-ink-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Recent Activity</span>
                            {unreadNotificationCount > 0 && (
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-pill border border-rose-200">
                                {unreadNotificationCount} unread
                              </span>
                            )}
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {notifications.slice(0, 2).map((n) => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markNotificationAsRead(n.id);
                                  setCurrentView(getDashboardTarget());
                                  setUserDropdownOpen(false);
                                }}
                                className="p-2.5 rounded-control bg-white border border-ink-200 text-xs cursor-pointer hover:border-forest-200 transition"
                              >
                                <div className="font-semibold text-ink-900 flex items-center justify-between gap-2">
                                  <span className="truncate">{n.title}</span>
                                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0" aria-hidden="true"></span>}
                                </div>
                                <p className="text-ink-500 text-xs truncate mt-0.5">{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="p-2 border-t border-ink-100 bg-ink-50/50">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2 rounded-control text-rose-700 hover:bg-rose-50 font-bold text-[13px] flex items-center gap-2 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-4 py-2.5 text-[13px] font-bold text-ink-700 hover:text-ink-900 hover:bg-ink-50 rounded-control transition min-h-[44px]"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-5 py-2.5 text-[13px] font-bold rounded-control bg-forest-700 hover:bg-forest-800 text-white shadow-soft transition flex items-center gap-1.5 min-h-[44px]"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="p-0.5 rounded-full ring-2 ring-forest-600/50"
                  title="Update Photo"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-control text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-haspopup="dialog"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu — overlay + sheet (no inline push, Phase 2: predictable) */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <div className="relative bg-white w-full max-h-[85vh] overflow-y-auto rounded-b-display shadow-level-3 border-b border-ink-200 animate-slideUp flex flex-col">
              <div className="sticky top-0 bg-white border-b border-ink-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-forest-50 border border-forest-200 rounded-control flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-forest-700" />
                  </div>
                  <span className="font-bold text-ink-900 font-display">Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-control hover:bg-ink-50 text-ink-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 pt-4 pb-6 space-y-4">
                {user && (
                  <div className="p-4 rounded-card bg-ink-50 border border-ink-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-10 h-10 rounded-card object-cover border border-forest-600"
                      />
                      <div>
                        <div className="font-bold text-[13px] text-ink-900">{user.name}</div>
                        <div className="text-xs font-bold text-forest-700 uppercase tracking-wide">{user.role} Portal</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }}
                      className="px-3 py-2 bg-white border border-ink-200 rounded-control text-xs font-bold text-ink-700 flex items-center gap-1 shadow-soft min-h-[36px]"
                    >
                      <Camera className="w-3.5 h-3.5 text-forest-700" />
                      <span>Photo</span>
                    </button>
                  </div>
                )}

                <nav aria-label="Mobile primary" className="space-y-1">
                  {navLinks.map((link) => {
                    const isActive = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setCurrentView(link.id);
                          setMobileMenuOpen(false);
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full text-left px-4 py-3 rounded-control text-[13px] font-bold transition flex items-center justify-between min-h-[44px] ${
                          isActive
                            ? 'bg-forest-50 text-forest-800 border border-forest-200'
                            : 'text-ink-700 hover:bg-ink-50 border border-transparent'
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-forest-700" aria-hidden="true"></span>}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-ink-100 space-y-2">
                  <button
                    onClick={() => { onOpenSkillRequest(); setMobileMenuOpen(false); }}
                    className="w-full py-3 px-4 text-[13px] font-bold rounded-control bg-ink-50 hover:bg-ink-100 text-ink-800 text-center flex items-center justify-center gap-2 border border-ink-200 min-h-[44px]"
                  >
                    <PlusCircle className="w-4 h-4 text-forest-700" />
                    <span>Submit Custom Skill Request</span>
                  </button>

                  {user ? (
                    <>
                      <button
                        onClick={() => { setCurrentView(getDashboardTarget()); setMobileMenuOpen(false); }}
                        className="w-full py-3 px-4 text-[13px] font-bold rounded-control bg-forest-700 text-white text-center flex items-center justify-center gap-2 min-h-[44px]"
                      >
                        {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                        {user.role === 'educator' && <GraduationCap className="w-4 h-4" />}
                        {user.role === 'learner' && <User className="w-4 h-4" />}
                        <span>Open {getDashboardLabel()}</span>
                      </button>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="w-full py-3 px-4 text-[13px] font-bold rounded-control text-rose-700 bg-rose-50 hover:bg-rose-100 text-center min-h-[44px]"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                        className="py-3 text-[13px] font-bold rounded-control text-ink-800 bg-white border border-ink-200 text-center hover:bg-ink-50 min-h-[44px]"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                        className="py-3 text-[13px] font-bold rounded-control bg-forest-700 text-white text-center hover:bg-forest-800 min-h-[44px]"
                      >
                        Get Started
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </>
  );
};
