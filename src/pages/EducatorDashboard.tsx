import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Educator, Booking, Review, LearnerRequest, Payment } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate, formatTimeAgo } from '../utils/formatters';
import { Badge, PaymentStatusBadge, StatusBadge } from '../components/ui/Badge';
import { VERIFICATION_STEPS, isStepPassed, verificationProgress } from '../utils/verification';
import { APPLY_PATH, REGISTRATION_TITLE } from '../utils/educatorApplication';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  BookingJourney, DashboardBanner, DashboardHeader, DashboardShell, DateTile, MessagesPanel, Panel, PillArrow, ProfileSummaryCard, StatRow, btn,
  greetingForNow, lastMonths
} from '../components/dashboard';
import {
  GraduationCap, Calendar, Clock, Star, MessageSquare, Settings, CheckCircle2, ArrowRight, Users, Wallet,
  Camera, User, Eye, MapPin, Inbox, ShieldCheck, Circle, Sparkles, LayoutGrid
} from 'lucide-react';
import { skillPhoto } from '../utils/skillPhotos';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useMessages } from '../hooks/useMessages';
import { bookingStage, isBookingPaid, upcomingBookings } from '../utils/bookingStage';
import { cn } from '../utils/cn';

interface EducatorDashboardProps {
  onViewProfileModal?: (educator: Educator) => void;
}

type EducatorTab = 'overview' | 'bookings' | 'leads' | 'messages' | 'earnings' | 'reviews' | 'profile';

const FORMAT_LABELS: Record<string, string> = { 'in-person': 'At your workshop', hybrid: 'Online and workshop', online: 'Online' };
const METHOD_LABELS: Record<string, string> = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', bank_transfer: 'Bank transfer', cash_escrow: 'Cash' };
const longDate = (date: string) => new Date(`${date}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const EducatorDashboard: React.FC<EducatorDashboardProps> = () => {
  const { user, educatorProfile, notifications } = useAuth();
  const educatorId: string | undefined = educatorProfile?.id;
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): EducatorTab => {
    const seg = location.pathname.split('/')[3];
    if (['bookings', 'leads', 'messages', 'earnings', 'reviews', 'profile'].includes(seg)) return seg as EducatorTab;
    return 'overview';
  };
  const activeTab = getActiveTab();
  const goTo = (tab: EducatorTab) => navigate(tab === 'overview' ? '/dashboard/educator' : `/dashboard/educator/${tab}`);

  const [educator, setEducator] = useState<Educator | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openRequests, setOpenRequests] = useState<LearnerRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [actionError, setActionError] = useState('');
  const { messages, send, markConversationRead, unreadCount } = useMessages(user?.id, activeTab === 'messages');

  /** `quiet` refreshes in the background without the loading skeleton. */
  const loadDashboardData = async (quiet = false) => {
    // Accounts without an educator profile have nothing to load; they are prompted to apply instead.
    if (!educatorId) {
      setLoading(false);
      return;
    }
    try {
      if (!quiet) setLoading(true);
      const [edu, bks, revs, reqs, pays] = await Promise.all([
        api.getEducatorById(educatorId),
        api.getBookings({ educator_id: educatorId }),
        api.getReviews(educatorId),
        api.getLearnerRequests({ status: 'open' }),
        api.getPayments({ educator_id: educatorId })
      ]);
      setEducator(edu);
      setBookings(bks);
      setReviews(revs);
      setOpenRequests(reqs);
      setPayments(pays);
    } catch (err) {
      console.error('Error loading educator dashboard:', err);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [educatorId]);

  // Opening a tab shows the latest, and the dashboard keeps itself current while open.
  useEffect(() => {
    if (!loading) loadDashboardData(true);
  }, [activeTab]);
  useAutoRefresh(() => loadDashboardData(true), 30000, !!educatorId);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setActionError('');
      await api.updateBookingStatus(bookingId, status);
      loadDashboardData(true);
    } catch (e: any) {
      console.error('Failed to update booking status:', e);
      setActionError(e.message || 'Could not update the booking. Please try again.');
    }
  };

  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleUpdateProgress = useCallback((bookingId: string, progress: number) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, milestone_progress: progress } : b));
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    progressTimeoutRef.current = setTimeout(async () => {
      try {
        setActionError('');
        await api.updateBookingProgress(bookingId, progress);
      } catch (e: any) {
        console.error('Failed to update progress:', e);
        setActionError(e.message || 'Could not save milestone progress. Please try again.');
      }
    }, 300);
  }, []);

  const handleReplyReview = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text) return;
    try {
      setActionError('');
      await api.replyToReview(reviewId, text);
      loadDashboardData(true);
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    } catch (e: any) {
      console.error('Error submitting reply:', e);
      setActionError(e.message || 'Could not post your reply. Please try again.');
    }
  };

  // Editable profile fields (PATCH /api/educators/:id accepts these from the owner).
  const [profileForm, setProfileForm] = useState({ title: '', hourly_rate_ugx: 0, location: '', service_area: '', equipment_provided: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  useEffect(() => {
    if (!educator) return;
    setProfileForm({
      title: educator.title || '',
      hourly_rate_ugx: educator.hourly_rate_ugx || 0,
      location: educator.location || '',
      service_area: educator.service_area || '',
      equipment_provided: educator.equipment_provided || ''
    });
  }, [educator?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educator) return;
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await api.updateEducator(educator.id, { ...profileForm, hourly_rate_ugx: Number(profileForm.hourly_rate_ugx) });
      setEducator(prev => prev ? { ...prev, ...updated } : updated);
      setProfileMessage({ tone: 'success', text: 'Saved. Learners see the new details straight away.' });
    } catch (err: any) {
      setProfileMessage({ tone: 'error', text: err.message || 'Could not save your profile. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const introductionLink = (req: LearnerRequest) =>
    `https://wa.me/256744024529?text=${encodeURIComponent(`Hello iSkillLink, I'm ${user?.name} (${educator?.title}). Please introduce me to the learner who requested "${req.skill_name}" (request ${req.id}).`)}`;

  const heldPayout = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.payout_amount_ugx, 0);
  const paidOut = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.payout_amount_ugx, 0);
  const platformFees = payments.filter(p => p.status === 'paid' || p.status === 'completed').reduce((sum, p) => sum + p.platform_fee_ugx, 0);

  const isLive = educator?.status === 'active' || educator?.status === 'approved';
  // Registered as an educator but hasn't sent the application from their account yet.
  const applicationNotSent = !!educator && educator.title === REGISTRATION_TITLE;
  const progress = verificationProgress(educator?.verification);
  const nextStepIndex = VERIFICATION_STEPS.findIndex(step => !isStepPassed(educator?.verification, step));
  const reviewCount = educator?.total_reviews || 0;
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Leads in the educator's own skill come first; a word match on title/skills is enough here.
  const tradeText = [educator?.title, ...(educator?.skills || []).map(s => s.skill_name)].join(' ').toLowerCase();
  const matchesTrade = (req: LearnerRequest) =>
    req.skill_name.toLowerCase().split(/[^a-z]+/).some(word => word.length > 3 && tradeText.includes(word));
  const sortedLeads = [...openRequests].sort((a, b) => Number(matchesTrade(b)) - Number(matchesTrade(a)));

  const learnerFirst = (b: Booking) => b.learnerUser?.name?.split(' ')[0] || 'the learner';
  const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'accepted');
  const awaitingPayment = bookings.filter(b => (b.status === 'confirmed' || b.status === 'in_progress') && !isBookingPaid(b));
  const paidUpcoming = upcomingBookings(bookings).filter(b => (b.status === 'confirmed' || b.status === 'in_progress') && isBookingPaid(b));
  const finished = bookings.filter(b => ['completed', 'declined', 'cancelled'].includes(b.status)).sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
  const unrepliedReviews = reviews.filter(r => !r.educator_reply);
  const completedSessions = bookings.filter(b => b.status === 'completed').length;

  // Learners the educator can message: everyone who has booked them.
  const contacts = Array.from(new Map(
    bookings.filter(b => b.learnerUser).map(b => [b.learnerUser!.id, {
      id: b.learnerUser!.id,
      name: b.learnerUser!.name,
      subtitle: b.skill_name,
      avatar_url: b.learnerUser!.avatar_url,
      phone: b.learnerUser!.phone
    }])
  ).values());
  const messageLink = (b: Booking) => b.learnerUser ? `/dashboard/educator/messages?with=${b.learnerUser.id}` : '/dashboard/educator/messages';

  const earningsByMonth = lastMonths(6).map(month => ({
    label: month.label,
    value: payments.filter(p => (p.status === 'paid' || p.status === 'completed') && p.created_at.startsWith(month.key)).reduce((sum, p) => sum + p.payout_amount_ugx, 0)
  }));

  const navItems = [
    { label: 'Dashboard', href: '/dashboard/educator', icon: LayoutGrid, end: true },
    { label: 'Inbox', href: '/dashboard/educator/messages', icon: MessageSquare, badge: unreadCount || undefined },
    { label: 'Bookings', href: '/dashboard/educator/bookings', icon: Calendar, badge: pendingBookings.length || undefined },
    { label: 'Leads', href: '/dashboard/educator/leads', icon: Users },
    { label: 'Earnings', href: '/dashboard/educator/earnings', icon: Wallet },
    { label: 'Reviews', href: '/dashboard/educator/reviews', icon: Star, badge: unrepliedReviews.length || undefined },
    { label: 'Profile', href: '/dashboard/educator/profile', icon: Settings, group: 'Settings' }
  ];

  const TAB_HEADERS: Record<Exclude<EducatorTab, 'overview'>, { title: string; description: string }> = {
    bookings: { title: 'Bookings', description: 'Accept requests, then mark each session done after it happens. Our team then sends 90% to your MoMo.' },
    leads: { title: 'Leads', description: 'Learners who described what they want to learn. Ask us and we’ll introduce you.' },
    messages: { title: 'Messages', description: 'Talk to your learners about times, tools and what to bring.' },
    earnings: { title: 'Earnings', description: 'Learners pay into escrow after you accept. Once the session is done, we send 90% to your MoMo and keep 10%.' },
    reviews: { title: 'Reviews', description: 'Shown on your public profile. A short, kind reply goes a long way.' },
    profile: { title: 'Profile', description: 'What learners see before they book you.' }
  };

  if (loading) {
    return (
      <DashboardShell role="educator" navItems={navItems}>
        <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-live="polite">
          <Skeleton className="h-48 w-full rounded-[20px]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </DashboardShell>
    );
  }

  if (!educatorId) {
    return (
      <DashboardShell role="educator">
        <div className="mx-auto max-w-4xl">
          <DashboardBanner
            eyebrow="Teach on iSkillLink"
            title={`Welcome, ${firstName}`}
            description="Complete the educator application so our team can check your skills and list you for learners."
            actions={<button onClick={() => navigate(APPLY_PATH)} className={btn.sun}>Start your application<PillArrow /></button>}
          />
        </div>
      </DashboardShell>
    );
  }

  /** What the educator can do next with a booking. */
  const bookingActions = (b: Booking) => {
    if (b.status === 'pending' || b.status === 'accepted') {
      return (
        <div className="flex gap-2">
          <button onClick={() => handleUpdateBookingStatus(b.id, 'declined')} className={cn(btn.outline, 'min-h-[40px] flex-1 px-4')}>Decline</button>
          <button onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} className={cn(btn.primary, 'min-h-[40px] flex-1 px-4')}>Accept</button>
        </div>
      );
    }
    if ((b.status === 'confirmed' || b.status === 'in_progress') && isBookingPaid(b)) {
      return (
        <button onClick={() => handleUpdateBookingStatus(b.id, 'completed')} className={cn(btn.primary, 'min-h-[40px] w-full')}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Mark session done
        </button>
      );
    }
    return null;
  };

  // One card on the bookings board.
  const boardCard = (b: Booking) => {
    const stage = bookingStage(b, 'educator');
    const muted = stage.stopped;
    return (
      <article key={b.id} className={cn('rounded-[20px] border border-[#ECEEF3] bg-white p-4 shadow-soft', muted && 'opacity-70')}>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-pill bg-sky-50 px-2.5 py-0.5 text-[12px] font-semibold text-sky-700">{b.skill_name}</span>
          <span className="rounded-pill bg-[#EEF0F5] px-2.5 py-0.5 text-[12px] font-semibold text-ink-600">{FORMAT_LABELS[b.format] || b.format}</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Avatar src={b.learnerUser?.avatar_url} name={b.learnerUser?.name} className="h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink-900">{b.learnerUser?.name || 'A learner'}</p>
            <p className="truncate text-xs text-ink-500">{formatShortDate(b.scheduled_date)} · {b.start_time} · {b.duration_hours} h</p>
          </div>
        </div>
        {b.notes && <p className="mt-3 rounded-[14px] bg-[#F7F8FB] px-3 py-2 text-sm leading-relaxed text-ink-700">“{b.notes}”</p>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-bold text-ink-900">{formatUGX(b.educator_payout_ugx)}</span>
          <Badge variant={stage.variant} size="sm" dot>{stage.label}</Badge>
        </div>
        {(b.status === 'confirmed' || b.status === 'in_progress') && isBookingPaid(b) && (
          <div className="mt-3">
            <p className="text-[12px] text-ink-500">Progress {b.learnerUser ? `${learnerFirst(b)} sees` : 'shown to the learner'}</p>
            <div className="mt-1.5 grid grid-cols-5 gap-1" role="group" aria-label="Session progress">
              {[0, 25, 50, 75, 100].map(pct => (
                <button key={pct} onClick={() => handleUpdateProgress(b.id, pct)} aria-pressed={b.milestone_progress === pct}
                  className={cn('min-h-[36px] rounded-pill text-[12px] font-semibold transition', b.milestone_progress === pct ? 'bg-forest-500 text-white' : 'bg-[#F1F2F6] text-ink-600 hover:bg-[#E8EAF0]')}>
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        )}
        {bookingActions(b) && <div className="mt-4">{bookingActions(b)}</div>}
        {b.learnerUser && !muted && (
          <button onClick={() => navigate(messageLink(b))} className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-800">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />Message {learnerFirst(b)}
          </button>
        )}
      </article>
    );
  };

  const BOARD = [
    { key: 'requests', title: 'Requests', dot: 'bg-amber-500', items: pendingBookings, empty: 'New booking requests land here.' },
    { key: 'payment', title: 'Waiting for payment', dot: 'bg-clay-500', items: awaitingPayment, empty: 'Accepted sessions wait here until the learner pays.' },
    { key: 'upcoming', title: 'Upcoming', dot: 'bg-sky-500', items: paidUpcoming, empty: 'Paid sessions show here.' },
    { key: 'done', title: 'Done', dot: 'bg-forest-500', items: finished, empty: 'Finished sessions show here.' }
  ];

  // The banner: the most useful next thing for this educator.
  const banner = (() => {
    if (educator?.status === 'suspended') {
      return {
        title: 'Your profile is on hold',
        description: <>Learners can’t book you right now. {educator.verification_notes ? `Reason: ${educator.verification_notes}. ` : ''}Message us on WhatsApp to sort it out.</>,
        actions: <a href="https://wa.me/256744024529" target="_blank" rel="noopener noreferrer" className={btn.sun}>WhatsApp iSkillLink<PillArrow /></a>
      };
    }
    if (applicationNotSent) {
      return {
        title: 'Finish your application to start teaching',
        description: 'Tell us about your craft, what you teach and your workshop. It takes about ten minutes, then we arrange your checks on WhatsApp.',
        actions: <button onClick={() => navigate(APPLY_PATH)} className={btn.sun}>Continue your application<PillArrow /></button>
      };
    }
    if (!isLive) {
      return {
        title: `${progress.passed} of ${progress.total} checks done`,
        description: 'Learners can book you as soon as all four pass. We’ll contact you on WhatsApp to arrange each one.',
        actions: <button onClick={() => navigate(`/educators/${educator?.id}`)} className={btn.sun}>Preview your profile<PillArrow /></button>
      };
    }
    if (pendingBookings.length > 0) {
      const b = pendingBookings[0];
      return {
        title: pendingBookings.length === 1 ? `${b.learnerUser?.name?.split(' ')[0] || 'A learner'} wants to book you` : `${pendingBookings.length} learners want to book you`,
        description: pendingBookings.length === 1
          ? <>{b.skill_name} on {longDate(b.scheduled_date)} at {b.start_time}. Accept it so they can pay and lock in the time.</>
          : 'Accept the ones that suit you so learners can pay and lock in the time.',
        actions: <><button onClick={() => goTo('bookings')} className={btn.sun}>Review requests<PillArrow /></button><button onClick={() => navigate(messageLink(b))} className={btn.glass}>Message {learnerFirst(b)}</button></>
      };
    }
    if (paidUpcoming[0]) {
      const b = paidUpcoming[0];
      return {
        title: `Next up: ${b.skill_name}`,
        description: <>With {b.learnerUser?.name || 'your learner'} on {longDate(b.scheduled_date)} at {b.start_time}. They’ve paid, so the money is held for you.</>,
        actions: <><button onClick={() => navigate(messageLink(b))} className={btn.sun}>Message {learnerFirst(b)}<PillArrow /></button><button onClick={() => goTo('bookings')} className={btn.glass}>See bookings</button></>
      };
    }
    return {
      title: 'Teach your skill, grow your name',
      description: 'Your profile is live. Share it with people who want to learn your skill, or look at open requests from learners.',
      actions: <><button onClick={() => navigate(`/educators/${educator?.id}`)} className={btn.sun}>View your profile<PillArrow /></button><button onClick={() => goTo('leads')} className={btn.glass}>See leads</button></>
    };
  })();
  const nextSession = paidUpcoming[0] || pendingBookings[0];

  return (
    <DashboardShell role="educator" navItems={navItems} sidebarPeople={{ title: 'Your learners', people: contacts.map(c => ({ ...c, subtitle: c.subtitle, href: `/dashboard/educator/messages?with=${c.id}` })) }}>
      <div className="mx-auto max-w-[78rem] space-y-6">
        {activeTab !== 'overview' && (
          <DashboardHeader
            eyebrow={isLive ? 'Educator' : 'Application in review'}
            title={TAB_HEADERS[activeTab].title}
            description={TAB_HEADERS[activeTab].description}
            actions={activeTab === 'profile' || activeTab === 'reviews'
              ? <button onClick={() => navigate(`/educators/${educator?.id}`)} className={btn.outline}><Eye className="h-4 w-4" aria-hidden="true" />View public profile</button>
              : undefined}
          />
        )}

        {actionError && <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>}

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="grid items-start gap-6 pt-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
              <DashboardBanner eyebrow={`Welcome back, ${firstName}`} title={banner.title} description={banner.description} actions={banner.actions} />

              {isLive ? (
                <>
                  <StatRow className="sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4" stats={[
                    { label: 'Learners taught', value: educator?.total_students ?? 0, detail: 'With a finished session', icon: Users, accent: 'sky' },
                    { label: 'Coming up', value: paidUpcoming.length + awaitingPayment.length, detail: `${pendingBookings.length} waiting for your reply`, icon: Calendar, accent: 'violet' },
                    { label: 'Paid out', value: formatUGX(paidOut), detail: heldPayout > 0 ? `${formatUGX(heldPayout)} held for you` : 'Sent to your MoMo', icon: Wallet, accent: 'forest' },
                    { label: 'Rating', value: educator?.rating ? `${educator.rating.toFixed(1)}★` : '–', detail: `From ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`, icon: Star, accent: 'amber' }
                  ]} />

                  <Panel
                    id="requests"
                    title={pendingBookings.length > 0 ? `Booking requests (${pendingBookings.length})` : 'Booking requests'}
                    action={<button onClick={() => goTo('bookings')} className={btn.quiet}>All bookings<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
                    bodyClassName="space-y-3"
                  >
                    {pendingBookings.length > 0 ? pendingBookings.map(b => (
                      <div key={b.id} className="flex flex-col gap-4 rounded-[20px] border border-amber-200 bg-amber-50/50 p-4 md:flex-row md:items-center">
                        <DateTile date={b.scheduled_date} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink-900">{b.learnerUser?.name || 'A learner'} wants to learn {b.skill_name}</p>
                          <p className="mt-0.5 text-sm text-ink-600">{b.start_time} · {b.duration_hours} {b.duration_hours === 1 ? 'hour' : 'hours'} · you’d receive {formatUGX(b.educator_payout_ugx)}</p>
                          {b.notes && <p className="mt-1 text-sm italic text-ink-500">“{b.notes}”</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'declined')} className={btn.outline}>Decline</button>
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} className={btn.primary}>Accept</button>
                        </div>
                      </div>
                    )) : (
                      <p className="py-2 text-sm text-ink-500">Nothing to reply to. New booking requests show up here.</p>
                    )}
                  </Panel>

                  <section aria-labelledby="upcoming-heading">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 id="upcoming-heading" className="text-lg font-bold text-ink-900">Upcoming sessions</h2>
                      <button onClick={() => goTo('bookings')} className="text-sm font-semibold text-forest-600 hover:text-forest-700">See all</button>
                    </div>
                    {[...awaitingPayment, ...paidUpcoming].length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {upcomingBookings([...awaitingPayment, ...paidUpcoming]).slice(0, 3).map(b => {
                          const stage = bookingStage(b, 'educator');
                          const categoryId = educator?.skills?.find(sk => sk.skill_name === b.skill_name)?.category_id;
                          return (
                            <article key={b.id} className="dash-card flex flex-col p-3">
                              <img src={skillPhoto(categoryId, b.skill_name)} alt="" className="h-32 w-full rounded-[14px] object-cover" loading="lazy" />
                              <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
                                <Badge variant={stage.variant} size="sm" dot className="self-start">{stage.label}</Badge>
                                <h3 className="mt-2 line-clamp-2 font-semibold leading-snug text-ink-900">{b.skill_name}</h3>
                                <p className="mt-0.5 text-xs text-ink-400">{formatShortDate(b.scheduled_date)} · {b.start_time} · {b.duration_hours} h</p>
                                <div className="mt-3 flex items-center gap-2.5 border-t border-[#F0F1F5] pt-3">
                                  <Avatar src={b.learnerUser?.avatar_url} name={b.learnerUser?.name} className="h-8 w-8 rounded-full" />
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-ink-900">{b.learnerUser?.name || 'A learner'}</p>
                                    <p className="text-xs text-ink-400">Learner</p>
                                  </div>
                                  <button onClick={() => navigate(messageLink(b))} className="grid h-8 w-8 place-items-center rounded-full border border-[#E3E5EC] text-ink-500 hover:text-forest-600" aria-label={`Message ${b.learnerUser?.name || 'the learner'}`}>
                                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="dash-card px-6 py-8 text-center text-sm text-ink-500">No sessions booked yet. Accepted bookings show up here.</div>
                    )}
                  </section>

                  <Panel id="payouts-table" title="Recent payouts" action={<button onClick={() => goTo('earnings')} className="text-sm font-semibold text-forest-600 hover:text-forest-700">See all</button>} bodyClassName="p-0 sm:p-0 pt-0 sm:pt-0">
                    {payments.length > 0 ? (
                      <div className="overflow-x-auto pb-2">
                        <table className="w-full min-w-[34rem] text-left text-sm">
                          <thead>
                            <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-400">
                              <th className="px-6 py-3 font-semibold">Learner</th>
                              <th className="px-3 py-3 font-semibold">Session</th>
                              <th className="px-3 py-3 font-semibold">Status</th>
                              <th className="px-6 py-3 text-right font-semibold">You get</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F1F5]">
                            {[...payments].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4).map(p => {
                              const booking = bookings.find(b => b.id === p.booking_id);
                              return (
                                <tr key={p.id}>
                                  <td className="px-6 py-3.5">
                                    <span className="flex items-center gap-2.5">
                                      <Avatar src={booking?.learnerUser?.avatar_url} name={booking?.learnerUser?.name} className="h-8 w-8 rounded-full" />
                                      <span>
                                        <span className="block font-semibold text-ink-900">{booking?.learnerUser?.name || 'A learner'}</span>
                                        <span className="block text-xs text-ink-400">{formatShortDate(p.created_at)}</span>
                                      </span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-3.5"><span className="rounded-pill bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-600">{booking?.skill_name || 'Session'}</span></td>
                                  <td className="px-3 py-3.5"><PaymentStatusBadge status={p.status} audience="educator" /></td>
                                  <td className="px-6 py-3.5 text-right font-semibold text-ink-900">{formatUGX(p.payout_amount_ugx)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="px-6 pb-6 text-sm text-ink-500">No payments yet. They show up here when a learner pays for a session.</p>
                    )}
                  </Panel>
                </>
              ) : !applicationNotSent && educator?.status !== 'suspended' && (
                <Panel id="checks" title="Your four checks" description="We’ll contact you on WhatsApp to arrange each one." bodyClassName="space-y-3">
                  {VERIFICATION_STEPS.map((step, index) => {
                    const passed = isStepPassed(educator?.verification, step);
                    const isNext = index === nextStepIndex;
                    return (
                      <div key={step.key} className={cn('flex items-start gap-4 rounded-[20px] border p-4', passed ? 'border-forest-200 bg-forest-50/50' : isNext ? 'border-ink-300 bg-white shadow-soft' : 'border-[#ECEEF3] bg-white')}>
                        {passed
                          ? <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-forest-600" aria-hidden="true" />
                          : <Circle className={cn('mt-0.5 h-6 w-6 shrink-0', isNext ? 'text-forest-700' : 'text-ink-300')} aria-hidden="true" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-ink-900">Check {index + 1}: {step.label}</p>
                            <Badge variant={passed ? 'success' : isNext ? 'warning' : 'neutral'} size="sm">{passed ? 'Done' : isNext ? 'Next' : 'Waiting'}</Badge>
                          </div>
                          <p className="mt-0.5 text-sm text-ink-600">{step.applicantDetail}</p>
                        </div>
                      </div>
                    );
                  })}
                </Panel>
              )}
            </div>

            <div className="space-y-6">
              <ProfileSummaryCard
                title="Statistic"
                name={user?.name}
                avatarUrl={user?.avatar_url}
                percent={isLive ? (educator?.rating ? educator.rating * 20 : undefined) : (progress.passed / progress.total) * 100}
                percentLabel={isLive ? 'average rating' : 'of your checks done'}
                greeting={greetingForNow(firstName)}
                subline={educator?.title}
                stats={[
                  { label: 'Sessions', value: completedSessions },
                  { label: 'Learners', value: educator?.total_students ?? 0 },
                  { label: 'Rating', value: educator?.rating ? educator.rating.toFixed(1) : '–' }
                ]}
                chartTitle={isLive ? 'Earnings' : undefined}
                bars={earningsByMonth}
                formatValue={formatUGX}
                emptyChartText="Your earnings show here after your first paid session."
              />

              <Panel id="activity" title="Recent activity" bodyClassName="px-5 py-4 sm:px-6">
                {notifications.length > 0 ? (
                  <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-ink-200">
                    {notifications.slice(0, 5).map(n => (
                      <li key={n.id} className="relative flex gap-3">
                        <span className={cn('relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-4 ring-white', n.is_read ? 'bg-[#EEF0F5] text-ink-500' : 'bg-forest-700 text-white')} aria-hidden="true">
                          {n.title.startsWith('New message') ? <MessageSquare className="h-3.5 w-3.5" /> : n.type === 'payment_update' ? <Wallet className="h-3.5 w-3.5" /> : n.type === 'booking_request' ? <Calendar className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                        </span>
                        <button type="button" onClick={() => n.link && navigate(n.link)} className="min-w-0 flex-1 text-left">
                          <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                          <p className="line-clamp-2 text-xs text-ink-500">{n.message}</p>
                          <p className="mt-0.5 text-[12px] text-ink-400">{formatTimeAgo(n.created_at)}</p>
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-ink-500">Bookings, payments and messages show up here.</p>
                )}
              </Panel>

              {contacts.length > 0 && (
                <Panel id="learners" title="Your learners" bodyClassName="p-2 sm:p-2">
                  <ul>
                    {contacts.slice(0, 4).map(person => (
                      <li key={person.id} className="flex items-center gap-3 rounded-[16px] px-3 py-2.5 hover:bg-[#F7F8FB]">
                        <Avatar src={person.avatar_url} name={person.name} className="h-10 w-10 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{person.name}</p>
                          <p className="truncate text-xs text-ink-500">{person.subtitle}</p>
                        </div>
                        <button onClick={() => navigate(`/dashboard/educator/messages?with=${person.id}`)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-pill border border-forest-200 px-3 text-xs font-semibold text-forest-800 hover:bg-forest-50">
                          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />Message
                        </button>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          </div>
        )}

        {/* ===== BOOKINGS (board) ===== */}
        {activeTab === 'bookings' && (
          bookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" />}
              title="No bookings yet"
              description={isLive ? 'When a learner books you, the request shows up here.' : 'Learners can book you once your four checks pass.'}
            />
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {BOARD.map(column => (
                <section key={column.key} className="rounded-[20px] bg-[#EBEDF2]/70 p-3" aria-labelledby={`col-${column.key}`}>
                  <h2 id={`col-${column.key}`} className="flex items-center gap-2 px-2 pb-3 pt-1 text-sm font-semibold text-ink-800">
                    <span className={cn('h-2 w-2 rounded-full', column.dot)} aria-hidden="true" />
                    {column.title}
                    <span className="ml-auto rounded-pill bg-white px-2 py-0.5 text-[12px] font-semibold text-ink-600">{column.items.length}</span>
                  </h2>
                  <div className="space-y-3">
                    {column.items.length > 0 ? column.items.map(boardCard) : (
                      <p className="rounded-[16px] border border-dashed border-[#D8DBE4] px-4 py-6 text-center text-xs text-ink-500">{column.empty}</p>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )
        )}

        {/* ===== LEADS ===== */}
        {activeTab === 'leads' && (
          sortedLeads.length === 0 ? (
            <EmptyState icon={<Clock className="h-6 w-6" />} title="No open requests right now" description="When a learner posts a request, it shows up here. Requests for your skill are listed first." />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedLeads.map(req => (
                <article key={req.id} className="dash-card flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-ink-900">{req.skill_name}</h2>
                        {matchesTrade(req) && <Badge variant="success" size="sm">Matches your skill</Badge>}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">{req.learning_goal}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-bold text-forest-800">{formatUGX(req.budget_ugx)}</p>
                      <p className="text-[12px] text-ink-500">Budget</p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 rounded-[18px] bg-[#F7F8FB] p-4 text-sm">
                    <div><dt className="text-xs text-ink-500">Learner</dt><dd className="text-ink-800">{req.learner_name}</dd></div>
                    <div><dt className="text-xs text-ink-500">Where</dt><dd className="text-ink-800">{req.location}</dd></div>
                    <div><dt className="text-xs text-ink-500">How</dt><dd className="text-ink-800">{FORMAT_LABELS[req.format_preference]?.replace('your', 'a') || req.format_preference}</dd></div>
                    <div><dt className="text-xs text-ink-500">When</dt><dd className="text-ink-800">{req.preferred_schedule || 'Flexible'}</dd></div>
                  </dl>
                  <div className="mt-5 flex justify-end">
                    <a href={introductionLink(req)} target="_blank" rel="noopener noreferrer" className={btn.outline}>Ask us to introduce you<ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
                  </div>
                </article>
              ))}
            </div>
          )
        )}

        {/* ===== MESSAGES ===== */}
        {activeTab === 'messages' && user && (
          <MessagesPanel
            currentUserId={user.id}
            contacts={contacts}
            messages={messages}
            onSend={send}
            onMarkRead={markConversationRead}
            emptyTitle="No conversations yet"
            emptyDescription="When a learner books you, you can talk to them here about the time, tools and what to bring."
            emptyAction={<button onClick={() => goTo('leads')} className={btn.primary}>See leads</button>}
            suggestions={['Thanks for booking! See you then.', 'Please bring a notebook.', 'Can we move the time?']}
          />
        )}

        {/* ===== EARNINGS ===== */}
        {activeTab === 'earnings' && (
          <>
            <StatRow className="xl:grid-cols-3" stats={[
              { label: 'Held for you', value: formatUGX(heldPayout), detail: 'Sent after each session is done', icon: ShieldCheck, accent: 'clay' },
              { label: 'Paid out to you', value: formatUGX(paidOut), detail: 'Sent to your MoMo', icon: Wallet, accent: 'forest' },
              { label: 'iSkillLink fee (10%)', value: formatUGX(platformFees), detail: 'Kept from paid sessions', icon: Inbox, accent: 'ink' }
            ]} />
            <Panel title="Payouts" bodyClassName="p-0 sm:p-0">
              {payments.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-ink-500">No payments yet. They show up here when a learner pays for a session.</p>
              ) : (
                <ul className="divide-y divide-[#F0F1F5]">
                  {[...payments].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(p => {
                    const booking = bookings.find(b => b.id === p.booking_id);
                    return (
                      <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                        <Avatar src={booking?.learnerUser?.avatar_url} name={booking?.learnerUser?.name} className="hidden h-10 w-10 rounded-full sm:block" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink-900">{booking ? `${booking.skill_name} with ${booking.learnerUser?.name || 'a learner'}` : 'Session'}</p>
                          <p className="text-xs text-ink-500">{formatShortDate(p.created_at)} · {METHOD_LABELS[p.method] || p.method} · learner paid {formatUGX(p.amount_ugx)}, fee {formatUGX(p.platform_fee_ugx)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <PaymentStatusBadge status={p.status} audience="educator" />
                          <span className="font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </>
        )}

        {/* ===== REVIEWS ===== */}
        {activeTab === 'reviews' && (
          reviews.length === 0 ? (
            <EmptyState icon={<Star className="h-6 w-6" />} title="No reviews yet" description="Learners can review you after a session is marked done." />
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <section className="dash-card p-6 text-center" aria-label="Rating summary">
                <p className="text-5xl font-bold text-ink-950">{(educator?.rating || 0).toFixed(1)}</p>
                <div className="mt-2 flex justify-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-5 w-5', i < Math.round(educator?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-ink-200')} />)}
                </div>
                <p className="mt-2 text-sm text-ink-500">From {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
                <ul className="mt-5 space-y-1.5 text-left">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                    return (
                      <li key={stars} className="flex items-center gap-2 text-xs text-ink-600">
                        <span className="w-6">{stars}★</span>
                        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEF0F5]"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${(count / reviews.length) * 100}%` }} /></span>
                        <span className="w-4 text-right">{count}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
              <div className="space-y-4">
                {reviews.map(r => (
                  <article key={r.id} className="dash-card p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.learner_avatar} name={r.learner_name} className="h-10 w-10 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink-900">{r.learner_name}</p>
                        <p className="text-xs text-ink-500">{formatShortDate(r.created_at)}</p>
                      </div>
                      <div className="flex gap-0.5" role="img" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200')} aria-hidden="true" />)}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-ink-700">“{r.comment}”</p>
                    {r.educator_reply ? (
                      <div className="mt-4 rounded-[16px] bg-forest-50/70 p-3 text-sm text-ink-700">
                        <span className="block text-xs font-semibold text-forest-800">Your reply</span>
                        {r.educator_reply}
                      </div>
                    ) : (
                      <div className="mt-4 flex items-center gap-2">
                        <label htmlFor={`reply-${r.id}`} className="sr-only">Reply to {r.learner_name}</label>
                        <input
                          id={`reply-${r.id}`}
                          type="text"
                          value={replyText[r.id] || ''}
                          onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleReplyReview(r.id); }}
                          placeholder="Reply publicly: thank them, or answer a concern"
                          className="min-h-[44px] flex-1 rounded-pill border border-[#E3E5EC] bg-[#F7F8FB] px-4 text-base text-ink-900 focus:border-forest-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-100 sm:text-sm"
                        />
                        <button onClick={() => handleReplyReview(r.id)} disabled={!replyText[r.id]?.trim()} className={btn.primary}>Reply</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === 'profile' && (
          <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <section className="dash-card p-6 text-center" aria-label="Your photo">
              <Avatar src={user?.avatar_url} name={user?.name} className="mx-auto h-24 w-24 rounded-full" />
              <p className="mt-4 text-xl font-bold text-ink-900">{user?.name}</p>
              <p className="text-sm text-ink-500">{educator?.title}</p>
              <div className="mt-3 flex justify-center">{educator?.status && <StatusBadge status={educator.status} />}</div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-500"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{educator?.location}</p>
              <button type="button" onClick={() => setShowPhotoModal(true)} className={cn(btn.outline, 'mt-5')}>
                <Camera className="h-4 w-4" aria-hidden="true" />{user?.avatar_url ? 'Change photo' : 'Add a photo'}
              </button>
            </section>
            <Panel title="What learners see" description="Changes show on your public profile straight away.">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {profileMessage && <Alert tone={profileMessage.tone} onDismiss={() => setProfileMessage(null)}>{profileMessage.text}</Alert>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="What you teach (your title)" htmlFor="edu-title" required>
                    <Input id="edu-title" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} required />
                  </Field>
                  <Field label="Your rate per hour (UGX)" htmlFor="edu-rate" required hint="Learners see this before they book.">
                    <Input id="edu-rate" type="number" inputMode="numeric" min={5000} step={1000} value={profileForm.hourly_rate_ugx || ''} onChange={(e) => setProfileForm({ ...profileForm, hourly_rate_ugx: Number(e.target.value) })} required />
                  </Field>
                  <Field label="Where your workshop is" htmlFor="edu-location" required>
                    <Input id="edu-location" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} required />
                  </Field>
                  <Field label="Where else you teach" htmlFor="edu-area">
                    <Input id="edu-area" value={profileForm.service_area} onChange={(e) => setProfileForm({ ...profileForm, service_area: e.target.value })} placeholder="e.g. Anywhere in Mbarara city" />
                  </Field>
                  <Field label="Tools learners will use" htmlFor="edu-tools" className="sm:col-span-2" hint="e.g. Two industrial straight-stitch machines, an overlocker and a cutting table.">
                    <Textarea id="edu-tools" rows={3} value={profileForm.equipment_provided} onChange={(e) => setProfileForm({ ...profileForm, equipment_provided: e.target.value })} />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={savingProfile}>Save changes</Button>
                </div>
              </form>
            </Panel>
          </div>
        )}

        <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
      </div>
    </DashboardShell>
  );
};
