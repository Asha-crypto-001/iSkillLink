import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronDown, ChevronRight, LogOut, Menu, X, ArrowUpRight, ArrowRight,
  Camera, LayoutDashboard, ClipboardList,
  Scissors, Zap, Utensils, Smartphone, Hammer, Code
} from 'lucide-react';
import { ProfilePhotoUploadModal } from './ProfilePhotoUploadModal';
import logoUrl from '../assets/logo.png';
import { Avatar } from './ui/Avatar';

// Popular trades for the Explore menu (ids from the seeded categories).
const EXPLORE_TRADES = [
  { label: 'Fashion & tailoring', text: 'Pattern cutting, sewing, kitenge', categoryId: 'cat-fashion', icon: Scissors },
  { label: 'Solar & electrical', text: 'Home wiring and solar installs', categoryId: 'cat-electrical', icon: Zap },
  { label: 'Cooking & baking', text: 'Cakes, pastry and catering', categoryId: 'cat-culinary', icon: Utensils },
  { label: 'Phone repair', text: 'Screens, batteries and boards', categoryId: 'cat-repair', icon: Smartphone },
  { label: 'Carpentry', text: 'Furniture and joinery', categoryId: 'cat-carpentry', icon: Hammer },
  { label: 'Web development', text: 'Websites and apps', categoryId: 'cat-tech', icon: Code }
];

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const exploreRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileMenuOpen(false); };
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
    { id: 'find-skill', label: 'Explore skills' },
    { id: 'become-educator', label: 'Teach' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const roleLabel = (() => {
    if (user?.role === 'admin') return 'Lead admin';
    if (user?.role === 'secondary_admin') return 'Admin';
    if (user?.role === 'educator') return 'Educator';
    return 'Learner';
  })();

  const menuItemClass = 'w-full flex items-center gap-3 px-3 min-h-[44px] rounded-control text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-ink-900 text-left transition focus-visible:ring-2 focus-visible:ring-forest-700';

  return (
    <>
      {/* A floating frosted-glass capsule; the strip around it lets the page show through */}
      <header className="sticky top-0 z-40 px-3 sm:px-5 pt-3 pointer-events-none">
        <div
          className={`pointer-events-auto mx-auto max-w-container rounded-pill border bg-white/75 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,border-color,background-color] duration-200 ${
            isScrolled
              ? 'border-ink-200/80 bg-white/85 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.22)]'
              : 'border-ink-200/60 shadow-[0_4px_20px_-12px_rgba(15,23,42,0.14)]'
          }`}
        >
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 h-14 lg:h-16 pl-4 pr-2 sm:pl-5">
            {/* Brand */}
            <button
              onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-2.5 rounded-control -ml-1 px-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-forest-700"
              aria-label="iSkillLink home"
            >
              <img src={logoUrl} alt="" className="w-8 h-8 lg:w-9 lg:h-9 object-contain" aria-hidden="true" />
              <span className="font-display text-[19px] lg:text-[21px] font-bold tracking-[-0.02em] text-ink-900">iSkillLink</span>
            </button>

            {/* Primary links */}
            <nav className="hidden lg:flex items-center justify-center gap-1" aria-label="Primary">
              <div
                ref={exploreRef}
                className="relative"
                onMouseEnter={() => setExploreOpen(true)}
                onMouseLeave={() => setExploreOpen(false)}
                onKeyDown={(e) => { if (e.key === 'Escape') setExploreOpen(false); }}
              >
                <button
                  onClick={() => setExploreOpen(open => !open)}
                  aria-expanded={exploreOpen}
                  aria-controls="explore-menu"
                  className={`flex items-center gap-1 px-3.5 min-h-[40px] rounded-pill text-[15px] whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-forest-700 ${
                    currentView === 'find-skill' || exploreOpen ? 'font-semibold text-ink-900 bg-ink-100/70' : 'font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100/70'
                  }`}
                >
                  Explore skills
                  <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>

                {exploreOpen && (
                  // pt-3 keeps the hover area continuous between the button and the panel
                  <div id="explore-menu" className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50">
                    <div className="w-[34rem] rounded-card border border-ink-200 bg-white p-2 shadow-level-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-0.5">
                        {EXPLORE_TRADES.map(({ label, text, categoryId, icon: Icon }) => (
                          <button
                            key={categoryId}
                            onClick={() => { navigate(`/find-skill?category=${categoryId}`); setExploreOpen(false); }}
                            className="group flex items-start gap-3 rounded-control p-3 text-left hover:bg-ink-50 transition focus-visible:ring-2 focus-visible:ring-forest-700"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-forest-50 text-forest-700 group-hover:bg-forest-700 group-hover:text-white transition" aria-hidden="true">
                              <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-ink-900">{label}</span>
                              <span className="block text-xs text-ink-500 mt-0.5">{text}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3 rounded-control bg-ink-50 px-3 py-2.5">
                        <button onClick={() => { setCurrentView('find-skill'); setExploreOpen(false); }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-700 hover:text-forest-800 min-h-[36px]">
                          Browse all trades<ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button onClick={() => { onOpenSkillRequest(); setExploreOpen(false); }} className="text-sm text-ink-600 hover:text-ink-900 min-h-[36px]">
                          Can’t find yours? <span className="font-semibold underline underline-offset-2">Request it</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.filter(link => link.id !== 'find-skill').map(link => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3.5 min-h-[40px] rounded-pill text-[15px] whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-forest-700 ${
                      isActive
                        ? 'font-semibold text-ink-900 after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0.5 after:h-1 after:w-1 after:rounded-full after:bg-forest-600'
                        : 'font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100/70'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={onOpenSkillRequest}
                className="hidden xl:inline-flex items-center px-3 min-h-[40px] rounded-pill text-[15px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100/70 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-forest-700"
              >
                Request a skill
              </button>
              <span className="hidden xl:block h-5 w-px bg-ink-200 mx-1.5" aria-hidden="true" />

              {user ? (
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="menu"
                    aria-label="Account menu"
                    onKeyDown={(e) => { if (e.key === 'Escape') setUserDropdownOpen(false); if (e.key === 'ArrowDown' && !userDropdownOpen) setUserDropdownOpen(true); }}
                    className={`flex items-center gap-2 pl-1 pr-2.5 min-h-[44px] rounded-pill border bg-white transition focus-visible:ring-2 focus-visible:ring-forest-700 ${userDropdownOpen ? 'border-ink-300 shadow-soft' : 'border-ink-200 hover:border-ink-300'}`}
                  >
                    <span className="relative">
                      <Avatar src={user.avatar_url} name={user.name} className="w-8 h-8 rounded-full" />
                      {unreadNotificationCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" aria-hidden="true" />}
                    </span>
                    <span className="text-sm font-semibold text-ink-900 max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {userDropdownOpen && (
                    <div role="menu" aria-label="Account menu" onKeyDown={(e) => { if (e.key === 'Escape') setUserDropdownOpen(false); }} className="absolute right-0 mt-2 w-72 bg-white rounded-card shadow-level-3 border border-ink-200 p-1.5 z-50 animate-fadeIn">
                      <div className="flex items-center gap-3 px-3 py-3">
                        <Avatar src={user.avatar_url} name={user.name} className="w-10 h-10 rounded-full shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink-900 truncate">{user.name}</div>
                          <div className="text-xs text-ink-500 truncate">{user.email}</div>
                        </div>
                        <span className="ml-auto shrink-0 rounded-pill bg-ink-100 px-2 py-0.5 text-caption text-ink-700">{roleLabel}</span>
                      </div>

                      <div className="border-t border-ink-100 pt-1.5 mt-0.5 space-y-0.5">
                        <button role="menuitem" onClick={() => { setCurrentView(getDashboardTarget()); setUserDropdownOpen(false); }} className={menuItemClass}>
                          <LayoutDashboard className="w-4 h-4 text-ink-500" aria-hidden="true" />
                          {getDashboardLabel()}
                        </button>
                        <button role="menuitem" onClick={() => { onOpenSkillRequest(); setUserDropdownOpen(false); }} className={menuItemClass}>
                          <ClipboardList className="w-4 h-4 text-ink-500" aria-hidden="true" />
                          Request a skill
                        </button>
                        <button role="menuitem" onClick={() => { setShowPhotoModal(true); setUserDropdownOpen(false); }} className={menuItemClass}>
                          <Camera className="w-4 h-4 text-ink-500" aria-hidden="true" />
                          Change profile photo
                        </button>
                      </div>

                      {notifications.length > 0 && (
                        <div className="border-t border-ink-100 mt-1.5 pt-2 px-1.5">
                          <div className="flex items-center justify-between px-1.5 mb-1">
                            <span className="text-caption text-ink-500">Recent activity</span>
                            {unreadNotificationCount > 0 && <span className="text-caption text-rose-700">{unreadNotificationCount} new</span>}
                          </div>
                          {notifications.slice(0, 2).map(n => (
                            <button key={n.id} role="menuitem" onClick={() => { markNotificationAsRead(n.id); setCurrentView(getDashboardTarget()); setUserDropdownOpen(false); }} className="w-full text-left px-1.5 py-2 rounded-control hover:bg-ink-50 transition focus-visible:ring-2 focus-visible:ring-forest-700">
                              <span className="flex items-center gap-2 text-xs font-semibold text-ink-900">
                                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0" aria-hidden="true" />}
                                <span className="truncate">{n.title}</span>
                              </span>
                              <span className="block text-xs text-ink-500 truncate mt-0.5">{n.message}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-ink-100 mt-1.5 pt-1.5">
                        <button role="menuitem" onClick={() => { logout(); setUserDropdownOpen(false); }} className={`${menuItemClass} text-rose-700 hover:text-rose-800 hover:bg-rose-50`}>
                          <LogOut className="w-4 h-4" aria-hidden="true" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <button onClick={() => onOpenAuth('login')} className="px-4 min-h-[44px] md:min-h-[40px] rounded-pill text-[15px] font-medium text-ink-700 hover:text-ink-900 hover:bg-ink-100/70 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-forest-700">
                    Sign in
                  </button>
                  <button onClick={() => onOpenAuth('register')} className="group flex items-center gap-2.5 pl-5 pr-1.5 min-h-[44px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2">
                    Get started
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-forest-800 transition-transform group-hover:rotate-45" aria-hidden="true">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden ml-1 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-pill border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 transition focus-visible:ring-2 focus-visible:ring-forest-700"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-haspopup="dialog"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu — a sheet under the bar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-[4.25rem] z-50 pointer-events-auto" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <div className="absolute inset-x-3 sm:inset-x-5 top-1.5 max-h-[calc(100vh-5.5rem)] overflow-y-auto rounded-display border border-ink-200 bg-white shadow-level-3 animate-slideUp">
              <div className="px-4 py-4 space-y-4">
                {user && (
                  <div className="flex items-center gap-3 px-1">
                    <Avatar src={user.avatar_url} name={user.name} className="w-10 h-10 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink-900 truncate">{user.name}</div>
                      <div className="text-xs text-ink-500">{roleLabel}</div>
                    </div>
                    <button onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }} className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-pill border border-ink-200 text-ink-700 hover:bg-ink-50" aria-label="Change profile photo">
                      <Camera className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                )}

                <nav aria-label="Mobile primary" className={`divide-y divide-ink-100 border-b border-ink-100 ${user ? "border-t" : ""}`}>
                  {navLinks.map(link => {
                    const isActive = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center justify-between px-1 min-h-[52px] text-base text-left transition ${isActive ? 'font-semibold text-forest-700' : 'font-medium text-ink-800 hover:text-ink-950'}`}
                      >
                        {link.label}
                        <ChevronRight className={`w-4 h-4 ${isActive ? 'text-forest-600' : 'text-ink-400'}`} aria-hidden="true" />
                      </button>
                    );
                  })}
                  <button onClick={() => { onOpenSkillRequest(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-between px-1 min-h-[52px] text-base font-medium text-ink-800 text-left">
                    Request a skill
                    <ChevronRight className="w-4 h-4 text-ink-400" aria-hidden="true" />
                  </button>
                </nav>

                {user ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setCurrentView(getDashboardTarget()); setMobileMenuOpen(false); }} className="min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold">
                      Dashboard
                    </button>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="min-h-[48px] rounded-pill border border-ink-200 text-rose-700 text-sm font-semibold hover:bg-rose-50">
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="min-h-[48px] rounded-pill border border-ink-200 text-ink-900 text-sm font-semibold hover:bg-ink-50">
                      Sign in
                    </button>
                    <button onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} className="min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold">
                      Get started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </>
  );
};
