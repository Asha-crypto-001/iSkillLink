import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, ChevronDown, User, LogOut,
  Menu, X, GraduationCap, ArrowRight,
  Settings, PlusCircle, Phone, Mail, Camera, Sparkles
} from 'lucide-react';
import { ProfilePhotoUploadModal } from './ProfilePhotoUploadModal';
import logoUrl from '../assets/logo.png';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const pageContext = location.pathname.startsWith('/find-skill')
    ? 'Explore skills'
    : location.pathname.startsWith('/educators/')
      ? 'Educator profile'
      : location.pathname.startsWith('/become-educator')
        ? 'Teach on iSkillLink'
        : location.pathname.startsWith('/how-it-works')
          ? 'How it works'
          : location.pathname.startsWith('/about')
            ? 'About iSkillLink'
            : location.pathname.startsWith('/contact')
              ? 'Contact'
              : '';

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        setIsScrolled(currentScrollY > 8);
        if (currentScrollY <= 16) {
          setIsCollapsed(false);
        } else if (currentScrollY > lastScrollY + 6) {
          setIsCollapsed(true);
        } else if (currentScrollY < lastScrollY - 6) {
          setIsCollapsed(false);
        }
        lastScrollY = currentScrollY;
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
    { id: 'find-skill', label: 'Explore Skills' },
    { id: 'become-educator', label: 'Teach on iSkill' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 transition-shadow duration-200 ${isScrolled ? 'shadow-level-2' : 'shadow-none'}`}>
        {/* Utility ribbon — modern minimal */}
        <div className={`overflow-hidden bg-ink-950 text-ink-200 text-xs border-b border-ink-900 transition-[max-height,opacity] duration-200 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-8 opacity-100'}`}>
          <div className="container-app h-8 flex items-center justify-between gap-3 !py-0">
            <div className="flex items-center gap-2.5 overflow-hidden whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-forest-300 font-bold uppercase text-[10px] tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse" aria-hidden="true" />
                iSkillLink Uganda
              </span>
              <span className="hidden sm:inline w-px h-3 bg-ink-800" aria-hidden="true" />
              <span className="hidden sm:inline text-ink-300 text-xs font-medium">HQ: Mbarara City</span>
              <span className="hidden lg:inline-flex items-center gap-1.5 text-ink-400 text-xs">
                <span className="w-1 h-1 rounded-full bg-ink-700" />
                Founded by Ashabahebwa Hassan
              </span>
            </div>

            <div className="hidden md:flex items-center gap-3 text-xs font-medium text-ink-300 shrink-0">
              <a href="mailto:iskilllink0@gmail.com" className="inline-flex items-center gap-1.5 hover:text-white transition focus-visible:ring-2 focus-visible:ring-forest-400 rounded-control px-1.5 py-1 -mx-1">
                <Mail className="w-3 h-3 text-forest-400" aria-hidden="true" />
                <span className="hidden lg:inline">iskilllink0@gmail.com</span>
              </a>
              <span className="w-px h-3 bg-ink-800 hidden lg:block" aria-hidden="true" />
              <a href="https://wa.me/256744024529" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-white hover:text-amber-300 transition focus-visible:ring-2 focus-visible:ring-amber-300 rounded-control px-1.5 py-1 -mx-1">
                <Phone className="w-3 h-3 text-forest-400" aria-hidden="true" />
                <span>+256 744 024 529</span>
              </a>
            </div>

            {/* Mobile: only WhatsApp icon */}
            <a href="https://wa.me/256744024529" target="_blank" rel="noopener noreferrer" className="md:hidden inline-flex items-center justify-center w-7 h-7 rounded-full bg-forest-700 text-white hover:bg-forest-800 transition focus-visible:ring-2 focus-visible:ring-forest-400" aria-label="WhatsApp +256 744 024 529">
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main bar — glass premium */}
        <div className="bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 border-b border-ink-200/70">
          <div className="container-app">
            <div className={`flex items-center justify-between gap-4 transition-[height] duration-200 ${isCollapsed ? 'h-[56px]' : 'h-[64px] lg:h-[68px]'}`}>
              {/* Brand — Google Sans, premium lockup */}
              <button
                onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 text-left group shrink-0 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 rounded-control -ml-1 px-1 py-1"
                aria-label="iSkillLink home"
              >
                <span className="relative flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 bg-white rounded-xl shadow-soft border border-ink-200 p-1 group-hover:border-forest-200 group-hover:shadow-level-1 transition">
                  <img src={logoUrl} alt="" className="w-full h-full object-contain rounded-lg" aria-hidden="true" />
                </span>
                <span className="leading-none">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[18px] lg:text-[20px] font-bold tracking-tight text-ink-900" style={{ fontFamily: "'Google Sans', sans-serif", letterSpacing: '-0.02em' }}>iSkillLink</span>
                    <span className="inline-flex h-[17px] w-[23px] shrink-0 translate-y-px items-center justify-center rounded-[5px] bg-ink-900 px-0 text-[9px] font-bold leading-none tracking-normal text-white">UG</span>
                  </span>
                  <span className="block text-[11px] font-medium tracking-tight text-ink-500 -mt-0.5" style={{ fontFamily: "'Google Sans', sans-serif" }}>Where Skills Meet Opportunity</span>
                </span>
              </button>

              {/* Center nav — pill, Google Sans medium */}
              <nav className="hidden lg:flex items-center gap-1 p-1 rounded-pill bg-ink-50 border border-ink-200/70" aria-label="Primary">
                {navLinks.map(link => {
                  const isActive = currentView === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setCurrentView(link.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-pill transition-all focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-1 ${
                        isActive
                          ? 'bg-white text-ink-900 shadow-soft border border-ink-200'
                          : 'text-ink-600 hover:text-ink-900 hover:bg-white/70 border border-transparent'
                      }`}
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
              {pageContext && (
                <span className="hidden max-w-40 truncate text-xs font-semibold text-ink-500 xl:block" aria-current="page">
                  {pageContext}
                </span>
              )}

              {/* Right actions — modern, spacious, 44px */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenSkillRequest}
                  className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-pill bg-white border border-ink-200 text-ink-700 hover:bg-ink-50 hover:text-ink-900 text-[13px] font-semibold shadow-soft transition focus-visible:ring-2 focus-visible:ring-forest-700"
                  style={{ fontFamily: "'Google Sans', sans-serif" }}
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
                      style={{ fontFamily: "'Google Sans', sans-serif" }}
                    >
                      <span className="relative">
                        <img src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-ink-200" />
                        {unreadNotificationCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" aria-hidden="true" />}
                      </span>
                      <span className="text-left leading-none hidden sm:block pr-1">
                        <span className="block text-[13px] font-bold max-w-[108px] truncate">{user.name.split(' ')[0]}</span>
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${userDropdownOpen ? 'text-forest-300' : user.role === 'admin' ? 'text-amber-600' : user.role === 'educator' ? 'text-forest-700' : 'text-ink-500'}`}>{user.role}</span>
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-60 transition-transform hidden sm:block ${userDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>

                    {userDropdownOpen && (
                      <div role="menu" aria-label="User menu" onKeyDown={(e)=>{ if(e.key==='Escape') setUserDropdownOpen(false); }} className="absolute right-0 mt-3 w-80 bg-white rounded-card shadow-level-3 border border-ink-200 overflow-hidden z-50 animate-fadeIn">
                        <div className="p-4 bg-gradient-to-br from-ink-50 to-white border-b border-ink-100 flex items-center gap-3">
                          <img src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={user.name} className="w-11 h-11 rounded-xl object-cover border border-ink-200 shadow-soft shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-ink-900 truncate" style={{ fontFamily: "'Google Sans', sans-serif" }}>{user.name}</div>
                            <div className="text-xs text-ink-500 truncate">{user.email}</div>
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-pill bg-forest-50 border border-forest-200 text-forest-700 text-[10px] font-bold uppercase tracking-wider">{user.role}</span>
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
                              <span style={{ fontFamily: "'Google Sans', sans-serif" }}>{getDashboardLabel()}</span>
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
                              <span className="text-[11px] font-bold text-ink-500 uppercase tracking-wider">Recent Activity</span>
                              {unreadNotificationCount > 0 && <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-pill border border-rose-200">{unreadNotificationCount} new</span>}
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
                    <button onClick={() => onOpenAuth('login')} className="px-4 py-2 min-h-[40px] text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-50 rounded-pill transition focus-visible:ring-2 focus-visible:ring-forest-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      Sign In
                    </button>
                    <button onClick={() => onOpenAuth('register')} className="px-5 py-2 min-h-[40px] text-sm font-bold rounded-pill bg-forest-700 hover:bg-forest-800 text-white shadow-soft flex items-center gap-1.5 transition focus-visible:ring-2 focus-visible:ring-forest-700" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 text-white/90" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div className="flex lg:hidden items-center gap-2">
                {user && (
                  <button onClick={() => setShowPhotoModal(true)} className="p-0.5 rounded-full ring-2 ring-forest-200 hover:ring-forest-300 transition focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Update photo">
                    <img src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
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
                  <span className="w-8 h-8 bg-ink-900 text-white rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-ink-900" style={{ fontFamily: "'Google Sans', sans-serif" }}>Menu</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 rounded-xl bg-ink-50 border border-ink-200 text-ink-700 hover:bg-ink-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-forest-700" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 pt-4 pb-6 space-y-4">
                {user && (
                  <div className="p-4 rounded-card bg-ink-50 border border-ink-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt={user.name} className="w-10 h-10 rounded-xl object-cover border border-ink-200 shadow-sm" />
                      <div>
                        <div className="font-bold text-sm text-ink-900" style={{ fontFamily: "'Google Sans', sans-serif" }}>{user.name}</div>
                        <div className="text-xs font-bold text-forest-700 uppercase tracking-wide">{user.role} Portal</div>
                      </div>
                    </div>
                    <button onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }} className="px-3 py-2 bg-white border border-ink-200 rounded-xl text-xs font-bold text-ink-700 flex items-center gap-1.5 shadow-soft min-h-[40px] focus-visible:ring-2 focus-visible:ring-forest-700">
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
                        style={{ fontFamily: "'Google Sans', sans-serif" }}
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
