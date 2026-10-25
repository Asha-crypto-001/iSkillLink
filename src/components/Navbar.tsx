import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronDown, User, LogOut,
  Menu, X, GraduationCap, ArrowRight,
  Settings, PlusCircle, Camera, Sparkles
} from 'lucide-react';
import { ProfilePhotoUploadModal } from './ProfilePhotoUploadModal';
import logoUrl from '../assets/logo.png';
import { Avatar } from './ui/Avatar';

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
  const dropdownRef = useRef<HTMLDivElement | null>(null);


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

  return (
    <>
      <header className={`sticky top-0 z-40 transition-shadow duration-200 ${isScrolled ? 'shadow-level-2' : 'shadow-none'}`}>
        {/* Main bar — glass premium */}
        <div className="bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border-b border-ink-200/70">
          <div className="container-app">
            <div className="flex items-center justify-between gap-4 h-[64px] lg:h-[68px]">
              {/* Brand lockup */}
              <button
                onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 text-left group shrink-0 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 rounded-control -ml-1 px-1 py-1 min-h-[44px]"
                aria-label="iSkillLink home"
              >
                <img src={logoUrl} alt="" className="w-9 h-9 lg:w-10 lg:h-10 object-contain transition-transform group-hover:scale-105" aria-hidden="true" />
                <span className="leading-none">
                  <span className="block font-display text-[19px] lg:text-[21px] font-bold tracking-[-0.02em] text-ink-900">iSkillLink</span>
                  <span className="block text-[12px] font-medium text-ink-500 mt-0.5">Where Skills Meet Opportunity</span>
                </span>
              </button>

              {/* Center nav */}
              <nav className="hidden lg:flex items-center gap-1 p-1 rounded-pill bg-ink-50 border border-ink-200/70" aria-label="Primary">
                {navLinks.map(link => {
                  const isActive = currentView === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setCurrentView(link.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`px-3.5 py-1.5 text-[14px] font-semibold whitespace-nowrap rounded-pill transition-all focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-1 ${
                        isActive
                          ? 'bg-white text-ink-900 shadow-soft border border-ink-200'
                          : 'text-ink-600 hover:text-ink-900 hover:bg-white/70 border border-transparent'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>

              {/* Right actions — modern, spacious, 44px */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenSkillRequest}
                  className="hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 min-h-[44px] md:min-h-[40px] rounded-pill bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 hover:text-ink-900 text-[14px] font-semibold shadow-soft transition focus-visible:ring-2 focus-visible:ring-forest-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-forest-600" aria-hidden="true" />
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
                      onKeyDown={(e) => { if (e.key === 'Escape') setUserDropdownOpen(false); if (e.key === 'ArrowDown' && !userDropdownOpen) setUserDropdownOpen(true); }}
                      className={`flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-pill border transition focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 ${
                        userDropdownOpen
                          ? 'bg-ink-900 text-white border-ink-900 shadow-level-1'
                          : 'bg-white text-ink-800 border-ink-200 hover:border-ink-300 shadow-soft'
                      }`}
                    >
                      <span className="relative">
                        <Avatar src={user.avatar_url} name={user.name} className="w-8 h-8 rounded-full border border-ink-200" />
                        {unreadNotificationCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" aria-hidden="true" />}
                      </span>
                      <span className="text-left leading-none hidden sm:block pr-1">
                        <span className="block text-[14px] font-bold max-w-[108px] truncate">{user.name.split(' ')[0]}</span>
                        <span className={`block text-[12px] font-bold uppercase tracking-wider ${userDropdownOpen ? 'text-forest-300' : user.role === 'admin' ? 'text-amber-600' : user.role === 'educator' ? 'text-forest-700' : 'text-ink-500'}`}>{user.role}</span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform hidden sm:block ${userDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {userDropdownOpen && (
                      <div role="menu" aria-label="User menu" onKeyDown={(e)=>{ if(e.key==='Escape') setUserDropdownOpen(false); }} className="absolute right-0 mt-3 w-80 bg-white rounded-card shadow-level-3 border border-ink-200 overflow-hidden z-50 animate-fadeIn">
                        <div className="p-4 bg-gradient-to-br from-ink-50 to-white border-b border-ink-100 flex items-center gap-3">
                          <Avatar src={user.avatar_url} name={user.name} className="w-11 h-11 rounded-xl border border-ink-200 shadow-soft shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-ink-900 truncate">{user.name}</div>
                            <div className="text-xs text-ink-500 truncate">{user.email}</div>
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-pill bg-forest-50 border border-forest-200 text-forest-700 text-[12px] font-bold uppercase tracking-wider">{user.role}</span>
                          </div>
                          <button onClick={() => { setShowPhotoModal(true); setUserDropdownOpen(false); }} className="ml-auto p-2 rounded-xl bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 transition focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Change photo">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="p-2 space-y-1">
                          <button onClick={() => { setCurrentView(getDashboardTarget()); setUserDropdownOpen(false); }} className="w-full p-3 rounded-xl bg-ink-900 hover:bg-black text-white font-bold text-sm flex items-center justify-between transition shadow-soft focus-visible:ring-2 focus-visible:ring-ink-900">
                            <span className="flex items-center gap-2">
                              {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                              {user.role === 'educator' && <GraduationCap className="w-4 h-4 text-forest-300" />}
                              {user.role === 'learner' && <User className="w-4 h-4 text-forest-300" />}
                              <span>{getDashboardLabel()}</span>
                            </span>
                            <ArrowRight className="w-4 h-4 opacity-70" />
                          </button>
                          <button onClick={() => { onOpenSkillRequest(); setUserDropdownOpen(false); }} className="w-full p-2.5 rounded-xl text-ink-700 hover:bg-ink-50 font-medium flex items-center gap-2 text-left transition text-sm focus-visible:ring-2 focus-visible:ring-forest-700">
                            <PlusCircle className="w-4 h-4 text-forest-700" />
                            <span>Submit Custom Skill Request</span>
                          </button>
                          <button onClick={() => { setShowPhotoModal(true); setUserDropdownOpen(false); }} className="w-full p-2.5 rounded-xl text-ink-700 hover:bg-ink-50 font-medium flex items-center gap-2 text-left transition text-sm focus-visible:ring-2 focus-visible:ring-forest-700">
                            <Camera className="w-4 h-4 text-ink-500" />
                            <span>Update Profile Picture</span>
                          </button>
                        </div>

                        {notifications.length > 0 && (
                          <div className="px-3 py-3 bg-ink-50/70 border-t border-ink-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[12px] font-bold text-ink-500 uppercase tracking-wider">Recent Activity</span>
                              {unreadNotificationCount > 0 && <span className="text-[12px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-pill border border-rose-200">{unreadNotificationCount} new</span>}
                            </div>
                            <div className="space-y-1.5 max-h-32 overflow-y-auto">
                              {notifications.slice(0, 2).map(n => (
                                <button key={n.id} onClick={() => { markNotificationAsRead(n.id); setCurrentView(getDashboardTarget()); setUserDropdownOpen(false); }} className="w-full text-left p-3 rounded-xl bg-white border border-ink-200 hover:border-forest-200 hover:shadow-soft transition focus-visible:ring-2 focus-visible:ring-forest-700">
                                  <div className="font-semibold text-ink-900 text-xs flex items-center justify-between gap-2">
                                    <span className="truncate">{n.title}</span>
                                    {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-forest-600 shrink-0" aria-hidden="true" />}
                                  </div>
                                  <p className="text-ink-500 text-xs truncate mt-1">{n.message}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="p-2 border-t border-ink-100 bg-ink-50/50">
                          <button onClick={() => { logout(); setUserDropdownOpen(false); }} className="w-full p-2.5 rounded-xl text-rose-700 hover:bg-white hover:shadow-soft border border-transparent hover:border-rose-100 font-bold text-sm flex items-center gap-2 transition focus-visible:ring-2 focus-visible:ring-rose-500">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onOpenAuth('login')} className="px-4 py-2 min-h-[44px] md:min-h-[40px] whitespace-nowrap text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-50 rounded-pill transition focus-visible:ring-2 focus-visible:ring-forest-700">
                      Sign In
                    </button>
                    <button onClick={() => onOpenAuth('register')} className="px-5 py-2 min-h-[44px] md:min-h-[40px] whitespace-nowrap text-sm font-bold rounded-pill bg-forest-700 hover:bg-forest-800 text-white shadow-soft flex items-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-forest-700">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 text-white/90" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div className="flex lg:hidden items-center gap-2">
                {user && (
                  <button onClick={() => setShowPhotoModal(true)} className="relative after:absolute after:-inset-1.5 after:content-[''] p-0.5 rounded-full ring-2 ring-forest-200 hover:ring-forest-300 transition focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Update photo">
                    <Avatar src={user.avatar_url} name={user.name} className="w-8 h-8 rounded-full" />
                  </button>
                )}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`p-2.5 rounded-xl border transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest-700 ${mobileMenuOpen ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'}`}
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                  aria-haspopup="dialog"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu — modern bottom sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-xl animate-fadeIn" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
            <div className="relative bg-white w-full max-h-[88vh] overflow-y-auto rounded-b-display shadow-level-3 border-b border-ink-200 animate-slideUp flex flex-col">
              <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-ink-100 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={logoUrl} alt="" className="w-8 h-8 object-contain" aria-hidden="true" />
                  <span className="font-bold text-ink-900">iSkillLink</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-ink-50 border border-ink-200 text-ink-700 hover:bg-ink-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 pt-4 pb-6 space-y-4">
                {user && (
                  <div className="p-4 rounded-card bg-ink-50 border border-ink-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar_url} name={user.name} className="w-10 h-10 rounded-xl border border-ink-200 shadow-sm" />
                      <div>
                        <div className="font-bold text-sm text-ink-900">{user.name}</div>
                        <div className="text-xs font-bold text-forest-700 uppercase tracking-wide">{user.role} Portal</div>
                      </div>
                    </div>
                    <button onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }} className="px-3 py-2 bg-white border border-ink-200 rounded-xl text-xs font-bold text-ink-700 flex items-center gap-1.5 shadow-soft min-h-[44px] md:min-h-[40px] focus-visible:ring-2 focus-visible:ring-forest-700">
                      <Camera className="w-3.5 h-3.5 text-forest-700" aria-hidden="true" />
                      <span>Photo</span>
                    </button>
                  </div>
                )}

                <nav aria-label="Mobile primary" className="space-y-1">
                  {navLinks.map(link => {
                    const isActive = currentView === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => { setCurrentView(link.id); setMobileMenuOpen(false); }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition flex items-center justify-between min-h-[48px] focus-visible:ring-2 focus-visible:ring-forest-700 ${
                          isActive ? 'bg-forest-700 text-white shadow-soft' : 'text-ink-700 hover:bg-ink-50 border border-transparent'
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-ink-100 space-y-2">
                  <button onClick={() => { onOpenSkillRequest(); setMobileMenuOpen(false); }} className="w-full py-3.5 px-4 text-sm font-bold rounded-xl bg-white border border-ink-200 hover:bg-ink-50 text-ink-800 flex items-center justify-center gap-2 min-h-[48px] focus-visible:ring-2 focus-visible:ring-forest-700">
                    <PlusCircle className="w-4 h-4 text-forest-700" aria-hidden="true" />
                    <span>Submit Custom Skill Request</span>
                  </button>

                  {user ? (
                    <>
                      <button onClick={() => { setCurrentView(getDashboardTarget()); setMobileMenuOpen(false); }} className="w-full py-3.5 px-4 text-sm font-bold rounded-xl bg-ink-900 hover:bg-black text-white flex items-center justify-center gap-2 min-h-[48px] focus-visible:ring-2 focus-visible:ring-ink-900">
                        {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                        {user.role === 'educator' && <GraduationCap className="w-4 h-4" />}
                        {user.role === 'learner' && <User className="w-4 h-4" />}
                        <span>Open {getDashboardLabel()}</span>
                      </button>
                      <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full py-3.5 px-4 text-sm font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 min-h-[48px] focus-visible:ring-2 focus-visible:ring-rose-500">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="py-3.5 text-sm font-bold rounded-xl text-ink-800 bg-white border border-ink-200 hover:bg-ink-50 min-h-[48px] focus-visible:ring-2 focus-visible:ring-forest-700">
                        Sign In
                      </button>
                      <button onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }} className="py-3.5 text-sm font-bold rounded-xl bg-forest-700 text-white hover:bg-forest-800 min-h-[48px] focus-visible:ring-2 focus-visible:ring-forest-700">
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

      <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </>
  );
};
