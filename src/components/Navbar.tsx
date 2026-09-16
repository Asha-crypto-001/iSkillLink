import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Bell, ChevronDown, User, LogOut, CheckCircle2,
  Menu, X, Sparkles, Briefcase, GraduationCap, ArrowRight,
  Settings, MessageSquare, PlusCircle, Phone, Mail, Camera,
  MapPin, Compass, ExternalLink, UserCheck
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [ribbonCollapsed, setRibbonCollapsed] = useState(false);
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

  // Scroll-direction awareness: auto-hide header on scroll down, reveal on scroll up; collapse ribbon on mobile for viewport recovery
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const isMobile = window.innerWidth < 640;
      // Header auto-hide: hide when scrolling down past 80px, show when scrolling up
      if (currentY > lastScrollY && currentY > 80) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }
      // Ribbon collapse on mobile: hide ribbon after 40px to recover ~30px vertical space
      if (isMobile) {
        setRibbonCollapsed(currentY > 40);
      } else {
        setRibbonCollapsed(false);
      }
      setLastScrollY(currentY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        {/* Heritage Ribbon (Nostalgic Top Tape) — collapses on mobile to recover 30-40px */}
        <div className={`bg-[#101b17] text-stone-300 text-[11px] px-4 sm:px-8 border-b border-[#1c2e27] tracking-normal overflow-hidden transition-all duration-300 ease-in-out ${ribbonCollapsed ? 'max-h-0 opacity-0 py-0 border-transparent' : 'max-h-10 opacity-100 py-1'}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* Heritage Registry Origin */}
            <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold uppercase text-[10px] tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                iSkillLink Uganda
              </span>
              <span className="text-stone-600 hidden sm:inline">•</span>
              <span className="text-stone-300 hidden sm:inline text-[11px]">
                HQ: Mbarara City
              </span>
              <span className="text-stone-600 hidden md:inline">•</span>
              <span className="text-stone-400 hidden md:inline text-[11px]">
                Founded by Ashabahebwa Hassan
              </span>
            </div>

            {/* Quick Contact & WhatsApp hotline */}
            <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium text-stone-300">
              <a
                href="mailto:iskilllink0@gmail.com"
                className="hidden md:flex items-center gap-1 text-stone-300 hover:text-amber-300 transition"
              >
                <Mail className="w-3 h-3 text-emerald-400" />
                <span>iskilllink0@gmail.com</span>
              </a>
              <span className="text-stone-700 hidden md:inline">|</span>
              <a
                href="https://wa.me/256744024529"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-300 transition flex items-center gap-1 text-emerald-400"
              >
                <Phone className="w-3 h-3" />
                <span className="text-stone-200 hover:text-amber-300">+256 744 024 529</span>
              </a>
              <span className="text-stone-700 hidden lg:inline">|</span>
              <a
                href="tel:+256772233621"
                className="hidden lg:inline hover:text-amber-300 transition text-stone-400"
              >
                +256 772 233 621
              </a>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[68px]">
            {/* Brand Logo & Seal */}
            <button
              onClick={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
            >
              {/* Official Brand Logo */}
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-xl shadow-xs border border-stone-200/90 p-1 group-hover:scale-105 group-hover:border-emerald-500/50 transition shrink-0">
                <img
                  src="./logo.png"
                  alt="iSkillLink Logo"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              {/* Brand Typography */}
              <div>
                <div className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 font-serif flex items-center gap-1.5 leading-none">
                  iSkillLink
                  <span className="text-[9px] font-sans font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                    UG
                  </span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium tracking-tight mt-0.5">
                  Where Skills Meet Opportunity
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setCurrentView(link.id)}
                    className={`relative px-3.5 py-2 text-[13px] font-semibold transition-all rounded-lg ${
                      isActive
                        ? 'text-emerald-900 font-bold bg-emerald-50/80 shadow-xs'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/70'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-emerald-700 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions Area */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Custom Skill Request Shortcut */}
              <button
                onClick={onOpenSkillRequest}
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-300/80 transition"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-800" />
                <span>Custom Request</span>
              </button>

              {user ? (
                /* Unified Nostalgic User Profile Capsule */
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
                    className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border transition shadow-xs ${
                      userDropdownOpen
                        ? 'bg-stone-900 text-white border-stone-900 ring-2 ring-emerald-600/30'
                        : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
                    }`}
                  >
                    {/* User Avatar with subtle verified ring */}
                    <div className="relative">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-emerald-600"
                      />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>

                    {/* Compact Name & Role Tag */}
                    <div className="text-left leading-none">
                      <div className="text-xs font-bold max-w-[110px] truncate">
                        {user.name.split(' ')[0]}
                      </div>
                      <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                        userDropdownOpen
                          ? 'text-amber-400'
                          : user.role === 'admin'
                          ? 'text-amber-700'
                          : user.role === 'educator'
                          ? 'text-emerald-700'
                          : 'text-stone-500'
                      }`}>
                        {user.role}
                      </div>
                    </div>

                    <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu Card — keyboard navigable */}
                  {userDropdownOpen && (
                    <div role="menu" aria-label="User menu" onKeyDown={(e)=>{ if(e.key==='Escape') setUserDropdownOpen(false); }} className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Header Profile */}
                      <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border border-emerald-600 shadow-sm shrink-0"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-stone-900 truncate">{user.name}</div>
                            <div className="text-[11px] text-stone-500 truncate">{user.email}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowPhotoModal(true);
                            setUserDropdownOpen(false);
                          }}
                          className="p-2 rounded-lg bg-white border border-stone-200 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 transition shrink-0"
                          title="Change Profile Photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Menu Links */}
                      <div className="p-2 space-y-1 text-xs">
                        {/* Direct Portal CTA */}
                        <button
                          onClick={() => {
                            setCurrentView(getDashboardTarget());
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center justify-between transition shadow-xs"
                        >
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                            {user.role === 'educator' && <GraduationCap className="w-4 h-4 text-emerald-300" />}
                            {user.role === 'learner' && <User className="w-4 h-4 text-emerald-300" />}
                            <span>{getDashboardLabel()}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        <button
                          onClick={() => {
                            onOpenSkillRequest();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 font-medium flex items-center gap-2 text-left transition"
                        >
                          <PlusCircle className="w-4 h-4 text-emerald-700" />
                          <span>Submit Custom Skill Request</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowPhotoModal(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2.5 rounded-xl text-stone-700 hover:bg-stone-100 font-medium flex items-center gap-2 text-left transition"
                        >
                          <Camera className="w-4 h-4 text-stone-600" />
                          <span>Update Profile Picture</span>
                        </button>
                      </div>

                      {/* Notifications Preview in Dropdown */}
                      {notifications.length > 0 && (
                        <div className="px-3 py-2 bg-stone-50/80 border-t border-stone-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Recent Activity</span>
                            {unreadNotificationCount > 0 && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
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
                                className="p-2 rounded-lg bg-white border border-stone-200 text-[11px] cursor-pointer hover:border-emerald-400 transition"
                              >
                                <div className="font-semibold text-stone-900 flex items-center justify-between">
                                  <span className="truncate">{n.title}</span>
                                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>}
                                </div>
                                <p className="text-stone-500 text-[10px] truncate mt-0.5">{n.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sign Out Action */}
                      <div className="p-2 border-t border-stone-100 bg-stone-50/50">
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full p-2 rounded-lg text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Logged Out Actions: Perfectly Balanced */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3 h-3 text-amber-300" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions: Compact & Clear */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="p-0.5 rounded-full ring-2 ring-emerald-600/50"
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
                className="p-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-haspopup="menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Out Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl">
            {user && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-stone-900">{user.name}</div>
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">{user.role} Portal</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }}
                  className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-[11px] font-bold text-stone-700 flex items-center gap-1 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Photo</span>
                </button>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = currentView === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setCurrentView(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>}
                  </button>
                );
              })}
            </div>

            {/* Mobile Actions Bottom */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <button
                onClick={() => { onOpenSkillRequest(); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-center flex items-center justify-center gap-1.5 border border-stone-200"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Submit Custom Skill Request</span>
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => { setCurrentView(getDashboardTarget()); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-800 text-white text-center flex items-center justify-center gap-1.5"
                  >
                    {user.role === 'admin' && <Settings className="w-4 h-4 text-amber-300" />}
                    {user.role === 'educator' && <GraduationCap className="w-4 h-4" />}
                    {user.role === 'learner' && <User className="w-4 h-4" />}
                    <span>Open {getDashboardLabel()}</span>
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                    className="py-2.5 text-xs font-bold rounded-xl text-stone-800 bg-white border border-stone-300 text-center hover:bg-stone-50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                    className="py-2.5 text-xs font-bold rounded-xl bg-emerald-800 text-white text-center hover:bg-emerald-900"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </>
  );
};
