import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FindSkillPage } from './pages/FindSkillPage';
import { EducatorProfilePage } from './pages/EducatorProfilePage';
import { BecomeEducatorPage } from './pages/BecomeEducatorPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { EducatorDashboard } from './pages/EducatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { EducatorProfileModal } from './components/EducatorProfileModal';
import { BookingModal } from './components/BookingModal';
import { SkillRequestModal } from './components/SkillRequestModal';
import { Educator } from './types';
import { api } from './services/api';

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

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedEducatorForModal, setSelectedEducatorForModal] = useState<Educator | null>(null);
  const [selectedEducatorForBooking, setSelectedEducatorForBooking] = useState<Educator | null>(null);
  const [showSkillRequestModal, setShowSkillRequestModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentView = getViewFromPath(location.pathname);
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

  const handleViewEducator = (educator: Educator) => {
    setSelectedEducatorForModal(educator);
  };

  const handleRequestBooking = (educator: Educator) => {
    setSelectedEducatorForBooking(educator);
  };

  const handleBookingSuccess = () => {
    setSelectedEducatorForBooking(null);
    showToast('Booking request submitted successfully! Funds held safely in escrow.');
    navigate('/dashboard/learner');
  };

  const handleSkillRequestSuccess = () => {
    showToast('Custom skill request submitted! Matches computed.');
  };

  const handleSelectEducatorById = async (educatorId: string) => {
    try {
      const edu = await api.getEducatorById(educatorId);
      setSelectedEducatorForModal(edu);
    } catch (e) {
      console.error('Failed to load educator:', e);
    }
  };

  const handleAuthSuccess = (role: string) => {
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

  const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (user && (user.role === 'admin' || user.role === 'secondary_admin')) {
      return <>{children}</>;
    }
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Restricted Administrator Area</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          This operations portal is private and restricted strictly to Founder <strong>Ashabahebwa Hassan</strong> and authorized secondary administrators.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow hover:bg-slate-800 transition"
          >
            Admin Sign In
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 font-sans flex flex-col justify-between selection:bg-forest-100 selection:text-forest-900 overflow-x-clip max-w-[100vw]">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Single accessible toast region — Phase 5 polish: dismissible, pause on hover/focus, 44px target, no double announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{toastMessage}</div>
      {toastMessage && (
        <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-5 sm:max-w-sm z-50 bg-ink-900 text-white px-4 py-3 rounded-control shadow-level-3 border border-ink-800 text-[13px] font-semibold flex items-center gap-3 animate-fadeIn">
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
          onOpenAuth={() => navigate('/auth')}
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
            <BecomeEducatorPage
              onApplicationSubmitted={() => showToast('Educator application received in verification queue!')}
              setCurrentView={setCurrentView}
            />
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
            <LearnerDashboard
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
              onViewEducator={handleViewEducator}
            />
          } />
          <Route path="/dashboard/learner/*" element={
            <LearnerDashboard
              onOpenSkillRequest={() => setShowSkillRequestModal(true)}
              onViewEducator={handleViewEducator}
            />
          } />
          <Route path="/dashboard/educator" element={
            <EducatorDashboard onViewProfileModal={handleViewEducator} />
          } />
          <Route path="/dashboard/educator/*" element={
            <EducatorDashboard onViewProfileModal={handleViewEducator} />
          } />
          <Route path="/dashboard/admin" element={
            <AdminGuard><AdminDashboard /></AdminGuard>
          } />
          <Route path="/dashboard/admin/*" element={
            <AdminGuard><AdminDashboard /></AdminGuard>
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

      {selectedEducatorForModal && (
        <EducatorProfileModal
          educator={selectedEducatorForModal}
          onClose={() => setSelectedEducatorForModal(null)}
          onRequestBooking={handleRequestBooking}
        />
      )}

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
