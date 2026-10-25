import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FindSkillPage } from './pages/FindSkillPage';
import { EducatorProfilePage } from './pages/EducatorProfilePage';
import { BecomeEducatorPage } from './pages/BecomeEducatorPage';
import { EducatorApplicationPage } from './pages/EducatorApplicationPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { EducatorDashboard } from './pages/EducatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { BookingModal } from './components/BookingModal';
import { SkillRequestModal } from './components/SkillRequestModal';
import { RequireAuth } from './components/RequireAuth';
import { Educator } from './types';

const viewToPath: Record<string, string> = {
  'home': '/',
  'find-skill': '/find-skill',
  'become-educator': '/become-educator',
  'how-it-works': '/how-it-works',
  'about': '/about',
  'contact': '/contact',
  'learner-dashboard': '/dashboard/learner',
  'educator-dashboard': '/dashboard/educator',
  'admin-dashboard': '/dashboard/admin',
  'auth': '/auth',
};

function getViewFromPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'home';
  if (pathname.startsWith('/find-skill')) return 'find-skill';
  if (pathname.startsWith('/become-educator')) return 'become-educator';
  if (pathname.startsWith('/how-it-works')) return 'how-it-works';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/dashboard/learner')) return 'learner-dashboard';
  if (pathname.startsWith('/dashboard/educator')) return 'educator-dashboard';
  if (pathname.startsWith('/dashboard/admin')) return 'admin-dashboard';
  if (pathname.startsWith('/auth')) return 'auth';
  if (pathname.startsWith('/educators/')) return 'find-skill';
  return 'home';
}

/** Shown to signed-in users who are not administrators. */
const AdminRestricted: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-ink-900">This area is for administrators</h2>
      <p className="text-sm text-ink-600 leading-relaxed">Your account doesn’t have access to platform operations.</p>
      <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-xl bg-ink-900 text-white text-sm font-bold shadow hover:bg-ink-800 transition">
        Back to iSkillLink
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedEducatorForBooking, setSelectedEducatorForBooking] = useState<Educator | null>(null);
  const [showSkillRequestModal, setShowSkillRequestModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentView = getViewFromPath(location.pathname);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('request') === 'skill' && user) {
      setShowSkillRequestModal(true);
      params.delete('request');
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
  }, [location.search, user]);
  const isDashboardRoute = location.pathname.startsWith('/dashboard/');
  const isAuthRoute = location.pathname === '/auth';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 5000);
  };
  useEffect(() => {
    if (!toastMessage) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setToastMessage(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toastMessage]);

  const setCurrentView = (view: string) => {
    const path = viewToPath[view] || '/';
    navigate(path);
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    if (categoryId && categoryId !== 'all') {
      navigate(`/find-skill?category=${encodeURIComponent(categoryId)}`);
    } else {
      navigate('/find-skill');
    }
  };

  // The profile page is the one place an educator is shown in full (shareable, back button works).
  const handleViewEducator = (educator: Educator) => {
    navigate(`/educators/${educator.id}`);
  };

  const handleRequestBooking = (educator: Educator) => {
    setSelectedEducatorForBooking(educator);
  };

  const handleBookingSuccess = () => {
    setSelectedEducatorForBooking(null);
    showToast('Booking request sent. Once the educator confirms, pay into escrow from your dashboard.');
    navigate('/dashboard/learner');
  };

  const handleSkillRequestSuccess = () => {
    showToast('Request sent. We’ll look for someone and get back to you.');
  };

  const handleSelectEducatorById = (educatorId: string) => {
    navigate(`/educators/${educatorId}`);
  };

  const handleAuthSuccess = (role: string) => {
    const next = new URLSearchParams(location.search).get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      navigate(next, { replace: true });
      return;
    }
    if (role === 'admin' || role === 'secondary_admin') navigate('/dashboard/admin');
    else if (role === 'educator') navigate('/dashboard/educator');
    else navigate('/dashboard/learner');
  };

  // Derive category from URL for FindSkillPage when directly navigated
  const getInitialCategoryId = (): string => {
    const params = new URLSearchParams(location.search);
    const catFromUrl = params.get('category');
    if (catFromUrl) return catFromUrl;
    return selectedCategoryId;
  };

  return (
    <div className="min-h-screen bg-white text-ink-900 font-sans flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900 overflow-x-clip max-w-[100vw]">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Single accessible toast region — Phase 5 polish: dismissible, pause on hover/focus, 44px target, no double announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{toastMessage}</div>
      {toastMessage && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-5 sm:max-w-sm z-50 bg-ink-900 text-white px-4 py-3 rounded-control shadow-level-3 border border-ink-800 text-[14px] font-semibold flex items-center gap-3 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-forest-400 shrink-0" aria-hidden="true"></span>
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-1 p-2 min-h-[44px] min-w-[44px] rounded-control hover:bg-ink-800 text-ink-200 focus-visible:ring-2 focus-visible:ring-forest-400 flex items-center justify-center shrink-0"
            aria-label="Dismiss notification"
          >
            <span aria-hidden="true" className="text-lg leading-none">×</span>
          </button>
        </div>
      )}

      {!isDashboardRoute && !isAuthRoute && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenSkillRequest={() => setShowSkillRequestModal(true)}
          onOpenAuth={(mode) => navigate(mode === 'register' ? '/auth?mode=register' : '/auth')}
        />
      )}

      <main id="main-content" className="flex-1 focus:outline-none overflow-x-clip min-w-0" tabIndex={-1}>
        <Routes>
          <Route path="/" element={
            <HomePage
              setCurrentView={setCurrentView}
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
              onSelectCategory={handleSelectCategory}
              onViewEducator={handleViewEducator}
              onRequestBooking={handleRequestBooking}
            />
          } />
          <Route path="/find-skill" element={
            <FindSkillPage
              initialCategoryId={getInitialCategoryId()}
              onViewEducator={handleViewEducator}
              onRequestBooking={handleRequestBooking}
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
            />
          } />
          <Route path="/educators/:id" element={<EducatorProfilePage />} />
          <Route path="/become-educator" element={
            <BecomeEducatorPage setCurrentView={setCurrentView} />
          } />
          <Route path="/how-it-works" element={
            <HowItWorksPage
              setCurrentView={setCurrentView}
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
            />
          } />
          <Route path="/about" element={
            <AboutPage
              setCurrentView={setCurrentView}
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
            />
          } />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dashboard/learner" element={
            <RequireAuth>
              <LearnerDashboard
                onOpenSkillRequest={() => setShowSkillRequestModal(true)}
                onViewEducator={handleViewEducator}
              />
            </RequireAuth>
          } />
          <Route path="/dashboard/learner/*" element={
            <RequireAuth>
              <LearnerDashboard
                onOpenSkillRequest={() => setShowSkillRequestModal(true)}
                onViewEducator={handleViewEducator}
              />
            </RequireAuth>
          } />
          <Route path="/dashboard/educator" element={
            <RequireAuth>
              <EducatorDashboard onViewProfileModal={handleViewEducator} />
            </RequireAuth>
          } />
          <Route path="/dashboard/educator/apply" element={
            <RequireAuth roles={['educator']} denied={<Navigate to="/become-educator" replace />}>
              <EducatorApplicationPage onApplicationSubmitted={() => showToast('Application sent. We’ll be in touch on WhatsApp.')} />
            </RequireAuth>
          } />
          <Route path="/dashboard/educator/*" element={
            <RequireAuth>
              <EducatorDashboard onViewProfileModal={handleViewEducator} />
            </RequireAuth>
          } />
          <Route path="/dashboard/admin" element={
            <RequireAuth roles={['admin', 'secondary_admin']} denied={<AdminRestricted />}><AdminDashboard /></RequireAuth>
          } />
          <Route path="/dashboard/admin/*" element={
            <RequireAuth roles={['admin', 'secondary_admin']} denied={<AdminRestricted />}><AdminDashboard /></RequireAuth>
          } />
          <Route path="/auth" element={<AuthPage onSuccess={handleAuthSuccess} />} />
          {/* Legacy redirects */}
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/learner-dashboard" element={<Navigate to="/dashboard/learner" replace />} />
          <Route path="/educator-dashboard" element={<Navigate to="/dashboard/educator" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/dashboard/admin" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {selectedEducatorForBooking && (
        <BookingModal
          educator={selectedEducatorForBooking}
          onClose={() => setSelectedEducatorForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {showSkillRequestModal && (
        <SkillRequestModal
          onClose={() => setShowSkillRequestModal(false)}
          onRequestCreated={handleSkillRequestSuccess}
          onSelectEducator={handleSelectEducatorById}
        />
      )}

      {!isDashboardRoute && !isAuthRoute && <Footer setCurrentView={setCurrentView} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
