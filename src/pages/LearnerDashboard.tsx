import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking, LearnerRequest, Payment, Educator, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { SimulatePaymentModal } from '../components/SimulatePaymentModal';
import { ReviewModal } from '../components/ReviewModal';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import {
  Calendar, Clock, CreditCard, MessageSquare, Star, CheckCircle2, PlusCircle, ArrowRight, Camera, Search, Sparkles,
  Wallet, MapPin, ShieldCheck, LayoutGrid, ClipboardList, Settings, Circle
} from 'lucide-react';
import { skillPhoto } from '../utils/skillPhotos';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge, PaymentStatusBadge, StatusBadge } from '../components/ui/Badge';
import {
  BookingJourney, DashboardBanner, DashboardHeader, DashboardShell, DateTile, MessagesPanel, Panel, PillArrow, ProfileSummaryCard, StatRow, btn,
  greetingForNow, lastMonths
} from '../components/dashboard';
import { CategoryIcon } from '../utils/categoryIcons';
import { categoryColor } from '../utils/categoryColors';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { useMessages } from '../hooks/useMessages';
import { bookingStage, isBookingPaid, upcomingBookings } from '../utils/bookingStage';
import { cn } from '../utils/cn';

interface LearnerDashboardProps {
  onOpenSkillRequest: () => void;
  onViewEducator: (educator: Educator) => void;
}

type LearnerTab = 'overview' | 'requests' | 'bookings' | 'payments' | 'messages' | 'reviews' | 'profile';

const FORMAT_LABELS: Record<string, string> = { 'in-person': 'At the workshop', hybrid: 'Online and workshop', online: 'Online' };
const METHOD_LABELS: Record<string, string> = { mtn_momo: 'MTN MoMo', airtel_money: 'Airtel Money', bank_transfer: 'Bank transfer', cash_escrow: 'Cash' };
const longDate = (date: string) => new Date(`${date}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onOpenSkillRequest
}) => {
  const { user, learnerProfile, updateProfile } = useAuth();
  // The API already scopes results to the signed-in learner; the id only narrows admin views.
  const learnerId: string | undefined = learnerProfile?.id;
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): LearnerTab => {
    const seg = location.pathname.split('/')[3];
    if (['requests', 'bookings', 'payments', 'messages', 'reviews', 'profile'].includes(seg)) return seg as LearnerTab;
    return 'overview';
  };
  const activeTab = getActiveTab();
  const goTo = (tab: LearnerTab) => navigate(tab === 'overview' ? '/dashboard/learner' : `/dashboard/learner/${tab}`);

  const [requests, setRequests] = useState<LearnerRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  // null until the learner picks: then it opens on Upcoming, or on Past when nothing is coming up.
  const [chosenBookingFilter, setBookingFilter] = useState<'upcoming' | 'past' | null>(null);
  const { messages, send, markConversationRead, unreadCount } = useMessages(user?.id, activeTab === 'messages');

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);

  /** `quiet` refreshes in the background without the loading skeleton. */
  const loadLearnerData = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const [reqs, bks, pays] = await Promise.all([
        api.getLearnerRequests({ learner_id: learnerId }),
        api.getBookings({ learner_id: learnerId }),
        api.getPayments({ learner_id: learnerId })
      ]);
      setRequests(reqs);
      setBookings(bks);
      setPayments(pays);
    } catch (err) {
      console.error('Error loading learner dashboard data:', err);
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadLearnerData();
  }, [learnerId, user?.id]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Opening a tab shows the latest, and the dashboard keeps itself current while open.
  useEffect(() => {
    if (!loading) loadLearnerData(true);
  }, [activeTab]);
  useAutoRefresh(() => loadLearnerData(true), 30000, !!user);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      await updateProfile({ name: profileName.trim(), phone: profilePhone.trim() });
      setProfileMessage({ tone: 'success', text: 'Saved.' });
    } catch (err: any) {
      setProfileMessage({ tone: 'error', text: err.message || 'Could not save your details. Please try again.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkSessionComplete = async (bookingId: string) => {
    try {
      setActionError('');
      await api.updateBookingStatus(bookingId, 'completed');
      loadLearnerData(true);
    } catch (e: any) {
      console.error('Error completing session:', e);
      setActionError(e.message || 'Could not mark the session as completed. Please try again.');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const firstNameOf = (b: Booking) => b.educator?.user?.name?.split(' ')[0] || 'your educator';
  const upcoming = upcomingBookings(bookings);
  const pastBookings = bookings
    .filter(b => ['completed', 'declined', 'cancelled'].includes(b.status))
    .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
  const toPay = bookings.filter(b => (b.status === 'confirmed' || b.status === 'in_progress') && !isBookingPaid(b));
  const awaitingReview = bookings.filter(b => b.status === 'completed' && !b.review);
  const reviewedBookings = bookings.filter(b => b.review);
  const nextBooking = upcoming[0];
  const bookingFilter = chosenBookingFilter ?? (upcoming.length > 0 || pastBookings.length === 0 ? 'upcoming' : 'past');
  const nextPaid = upcoming.find(isBookingPaid);
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const heldInEscrow = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_ugx, 0);
  const released = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount_ugx, 0);
  const openRequests = requests.filter(r => r.status === 'open');
  // A match the learner hasn't booked yet: the educator has no booking with them.
  const unbookedMatches = requests.filter(r => r.matched_educator && !bookings.some(b => b.educator_id === r.matched_educator!.id));

  // People the learner can message: every educator they have booked.
  const contacts = Array.from(new Map(
    bookings.filter(b => b.educator?.user).map(b => [b.educator!.user!.id, {
      id: b.educator!.user!.id,
      name: b.educator!.user!.name,
      subtitle: b.educator!.title,
      avatar_url: b.educator!.user!.avatar_url,
      phone: b.educator!.user!.phone
    }])
  ).values());
  // Hours booked and hours learned (finished sessions), and learning hours per month for the chart.
  const learnedHours = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.duration_hours, 0);
  const bookedHours = learnedHours + upcoming.reduce((sum, b) => sum + b.duration_hours, 0);
  const hoursByMonth = lastMonths(6).map(month => ({
    label: month.label,
    value: bookings.filter(b => b.status === 'completed' && b.scheduled_date.startsWith(month.key)).reduce((sum, b) => sum + b.duration_hours, 0)
  }));

  // Skills the learner is working on: from bookings first (with the educator's category), then requests.
  const learningSkills = (() => {
    const skills = new Map<string, { name: string; detail: string; iconName?: string; color: string; categoryId?: string }>();
    bookings.filter(b => b.status !== 'declined' && b.status !== 'cancelled').forEach(b => {
      const categoryId = b.educator?.skills?.find(s => s.skill_name === b.skill_name)?.category_id;
      const category = categories.find(c => c.id === categoryId);
      const count = bookings.filter(x => x.skill_name === b.skill_name && x.status === 'completed').length;
      if (!skills.has(b.skill_name)) {
        skills.set(b.skill_name, {
          name: b.skill_name,
          detail: count > 0 ? `${count} ${count === 1 ? 'session' : 'sessions'} done` : 'Session booked',
          iconName: category?.icon_name,
          categoryId,
          color: categoryId ? categoryColor(categoryId) : 'bg-forest-50 text-forest-700'
        });
      }
    });
    requests.forEach(r => {
      if (!skills.has(r.skill_name)) skills.set(r.skill_name, { name: r.skill_name, detail: r.matched_educator ? 'Matched' : 'Requested', color: 'bg-amber-50 text-amber-600' });
    });
    return [...skills.values()];
  })();

  const messageLink = (b: Booking) => b.educator?.user ? `/dashboard/learner/messages?with=${b.educator.user.id}` : '/dashboard/learner/messages';

  const bookingLabel = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    return booking ? `${booking.skill_name}${booking.educator?.user?.name ? ` with ${booking.educator.user.name}` : ''}` : 'Session';
  };

  /** The single rule for what a learner can do next with a booking (send → confirm → pay → learn → review). */
  const renderNextStep = (b: Booking) => {
    const name = firstNameOf(b);
    if (b.status === 'pending' || b.status === 'accepted') {
      return <span className="text-sm text-ink-500">Waiting for {name} to accept</span>;
    }
    if (b.status === 'confirmed' || b.status === 'in_progress') {
      if (!isBookingPaid(b)) {
        return <button onClick={() => setPaymentModalBooking(b)} className={btn.primary}><CreditCard className="h-4 w-4" aria-hidden="true" />Pay {formatUGX(b.total_amount_ugx)}</button>;
      }
      if (b.scheduled_date > today) {
        return <span className="text-sm text-ink-500">Paid · see you {formatShortDate(b.scheduled_date)}</span>;
      }
      return <button onClick={() => handleMarkSessionComplete(b.id)} className={btn.primary}><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Mark session done</button>;
    }
    if (b.status === 'completed') {
      return b.review
        ? <span className="text-sm text-ink-500">Reviewed · thank you</span>
        : <button onClick={() => setReviewModalBooking(b)} className={btn.dark}><Star className="h-4 w-4 text-sun-300" aria-hidden="true" />Write a review</button>;
    }
    return <span className="text-sm text-ink-500">{b.status === 'declined' ? `${name} couldn’t take this one. Nothing was charged.` : 'Cancelled'}</span>;
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard/learner', icon: LayoutGrid, end: true },
    { label: 'Inbox', href: '/dashboard/learner/messages', icon: MessageSquare, badge: unreadCount || undefined },
    { label: 'Bookings', href: '/dashboard/learner/bookings', icon: Calendar, badge: toPay.length || undefined },
    { label: 'My requests', href: '/dashboard/learner/requests', icon: ClipboardList, badge: unbookedMatches.length || undefined },
    { label: 'Payments', href: '/dashboard/learner/payments', icon: CreditCard },
    { label: 'Reviews', href: '/dashboard/learner/reviews', icon: Star, badge: awaitingReview.length || undefined },
    { label: 'Profile', href: '/dashboard/learner/profile', icon: Settings, group: 'Settings' }
  ];

  const TAB_HEADERS: Record<Exclude<LearnerTab, 'overview'>, { title: string; description: string }> = {
    requests: { title: 'My requests', description: 'What you asked us to find. When we match you with someone, they show up here.' },
    bookings: { title: 'Bookings', description: 'Every session you’ve booked, and the next step for each.' },
    payments: { title: 'Payments', description: 'iSkillLink holds your money until your session is done. If a session doesn’t happen, we refund you in full.' },
    messages: { title: 'Messages', description: 'Talk to your educators about times, tools and what to bring.' },
    reviews: { title: 'Reviews', description: 'An honest review helps the next learner choose, and helps good educators get booked.' },
    profile: { title: 'Profile', description: 'How educators and our team see and reach you.' }
  };

  if (loading) {
    return (
      <DashboardShell role="learner" navItems={navItems}>
        <div className="mx-auto max-w-6xl space-y-6" aria-busy="true" aria-live="polite">
          <Skeleton className="h-48 w-full rounded-[20px]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-card" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </DashboardShell>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';

  // What the banner says: the one most useful next thing.
  const banner = (() => {
    if (toPay[0]) {
      const b = toPay[0];
      return {
        title: `${firstNameOf(b)} accepted your booking`,
        description: <>Pay {formatUGX(b.total_amount_ugx)} into escrow to lock in {b.skill_name} on {longDate(b.scheduled_date)}. We hold it until the session is done.</>,
        actions: <><button onClick={() => setPaymentModalBooking(b)} className={btn.sun}>Pay now<PillArrow /></button><button onClick={() => navigate(messageLink(b))} className={btn.glass}>Message {firstNameOf(b)}</button></>
      };
    }
    if (nextPaid) {
      return {
        title: `Your next session is ${longDate(nextPaid.scheduled_date).split(' ')[0]}`,
        description: <>{nextPaid.skill_name} with {nextPaid.educator?.user?.name || 'your educator'}, {longDate(nextPaid.scheduled_date)} at {nextPaid.start_time}.</>,
        actions: <><button onClick={() => navigate(messageLink(nextPaid))} className={btn.sun}>Message {firstNameOf(nextPaid)}<PillArrow /></button><button onClick={() => goTo('bookings')} className={btn.glass}>See bookings</button></>
      };
    }
    if (awaitingReview[0]) {
      const b = awaitingReview[0];
      return {
        title: `How was ${b.skill_name}?`,
        description: <>A short review of {b.educator?.user?.name || 'your educator'} helps the next learner choose.</>,
        actions: <><button onClick={() => setReviewModalBooking(b)} className={btn.sun}>Write a review<PillArrow /></button><button onClick={() => navigate('/find-skill')} className={btn.glass}>Book another session</button></>
      };
    }
    if (nextBooking) {
      return {
        title: `Waiting for ${firstNameOf(nextBooking)} to accept`,
        description: <>Your request for {nextBooking.skill_name} on {longDate(nextBooking.scheduled_date)} is with them. We’ll let you know as soon as they reply.</>,
        actions: <><button onClick={() => goTo('bookings')} className={btn.sun}>See your booking<PillArrow /></button><button onClick={() => navigate('/find-skill')} className={btn.glass}>Explore skills</button></>
      };
    }
    if (unbookedMatches[0]) {
      const r = unbookedMatches[0];
      return {
        title: `We found ${r.matched_educator!.name.split(' ')[0]} for you`,
        description: <>{r.matched_educator!.name} teaches {r.skill_name}. Have a look at their profile and book a time.</>,
        actions: <><button onClick={() => navigate(`/educators/${r.matched_educator!.id}`)} className={btn.sun}>View profile<PillArrow /></button><button onClick={() => goTo('requests')} className={btn.glass}>My requests</button></>
      };
    }
    return {
      title: 'Learn a skill at a real workbench',
      description: 'Book hands-on sessions with people who do the work every day, or tell us what you want to learn and we’ll find them.',
      actions: <><button onClick={() => navigate('/find-skill')} className={btn.sun}>Find an educator<PillArrow /></button><button onClick={onOpenSkillRequest} className={btn.glass}>Tell us what you need</button></>
    };
  })();

  // The overview's to-do list: everything that is waiting on the learner.
  const todos = [
    ...toPay.map(b => ({ key: `pay-${b.id}`, icon: CreditCard, tint: 'bg-orange-50 text-orange-500', title: `Pay for ${b.skill_name}`, detail: `${firstNameOf(b)} accepted · ${formatShortDate(b.scheduled_date)}`, action: <button onClick={() => setPaymentModalBooking(b)} className={cn(btn.primary, 'min-h-[36px] px-4 text-xs')}>Pay</button> })),
    ...unbookedMatches.map(r => ({ key: `match-${r.id}`, icon: Sparkles, tint: 'bg-amber-50 text-amber-600', title: `We found ${r.matched_educator!.name}`, detail: `For your ${r.skill_name} request`, action: <button onClick={() => navigate(`/educators/${r.matched_educator!.id}`)} className={cn(btn.outline, 'min-h-[36px] px-4 text-xs')}>View</button> })),
    ...(unreadCount > 0 ? [{ key: 'messages', icon: MessageSquare, tint: 'bg-violet-50 text-violet-600', title: `${unreadCount} new ${unreadCount === 1 ? 'message' : 'messages'}`, detail: 'From your educators', action: <button onClick={() => goTo('messages')} className={cn(btn.outline, 'min-h-[36px] px-4 text-xs')}>Read</button> }] : []),
    ...awaitingReview.map(b => ({ key: `review-${b.id}`, icon: Star, tint: 'bg-amber-50 text-amber-600', title: `Review ${b.educator?.user?.name || 'your educator'}`, detail: b.skill_name, action: <button onClick={() => setReviewModalBooking(b)} className={cn(btn.outline, 'min-h-[36px] px-4 text-xs')}>Review</button> }))
  ];

  const categoryOf = (b: Booking) => b.educator?.skills?.find(sk => sk.skill_name === b.skill_name)?.category_id;
  const sessionCards = [...upcoming, ...pastBookings.filter(b => b.status === 'completed')].slice(0, 3);
  const sessionCard = (b: Booking) => {
    const stage = bookingStage(b, 'learner');
    return (
      <article key={b.id} className="dash-card flex flex-col p-3">
        <img src={skillPhoto(categoryOf(b), b.skill_name)} alt="" className="h-36 w-full rounded-[14px] object-cover" loading="lazy" />
        <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
          <Badge variant={stage.variant} size="sm" dot className="self-start">{stage.label}</Badge>
          <h3 className="mt-2 line-clamp-2 font-semibold leading-snug text-ink-900">{b.skill_name}</h3>
          <p className="mt-0.5 text-xs text-ink-400">{formatShortDate(b.scheduled_date)} · {b.start_time} · {b.duration_hours} h</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EEF0F5]" aria-hidden="true">
            <div className="h-full rounded-full bg-forest-500" style={{ width: `${(stage.done / stage.steps.length) * 100}%` }} />
          </div>
          <div className="mt-auto flex items-center gap-2.5 border-t border-[#F0F1F5] pt-3 mt-3">
            <Avatar src={b.educator?.user?.avatar_url} name={b.educator?.user?.name} className="h-8 w-8 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{b.educator?.user?.name || 'Your educator'}</p>
              <p className="text-xs text-ink-400">Educator</p>
            </div>
            <button onClick={() => goTo('bookings')} className="grid h-8 w-8 place-items-center rounded-full border border-[#E3E5EC] text-ink-500 hover:text-ink-900" aria-label={`Open ${b.skill_name}`}>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  const bookingCard = (b: Booking) => {
    const stage = bookingStage(b, 'learner');
    return (
      <article key={b.id} className="rounded-card border border-[#ECEEF3] bg-white p-5 transition hover:border-ink-300">
        <div className="flex gap-4">
          <DateTile date={b.scheduled_date} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-ink-900">{b.skill_name}</h3>
                <p className="mt-0.5 text-sm text-ink-600">with <span className="font-semibold text-ink-900">{b.educator?.user?.name || 'your educator'}</span>{b.educator?.title ? ` · ${b.educator.title}` : ''}</p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-lg font-bold text-ink-900">{formatUGX(b.total_amount_ugx)}</p>
                <Badge variant={stage.variant} size="sm" dot className="mt-1">{stage.label}</Badge>
              </div>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-ink-400" aria-hidden="true" />{b.start_time} · {b.duration_hours} {b.duration_hours === 1 ? 'hour' : 'hours'}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-ink-400" aria-hidden="true" />{b.format === 'online' ? 'Online' : b.location_or_link}</span>
              <span className="hidden sm:inline">{FORMAT_LABELS[b.format] || b.format}</span>
            </p>
          </div>
        </div>
        <BookingJourney stage={stage} className="mt-5" />
        {isBookingPaid(b) && b.status !== 'completed' && b.milestone_progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-ink-600"><span>{firstNameOf(b)}’s progress notes</span><span className="font-semibold text-ink-900">{b.milestone_progress}%</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#EEF0F5]"><div className="h-full rounded-full bg-forest-500" style={{ width: `${b.milestone_progress}%` }} /></div>
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F0F1F5] pt-4">
          {b.educator?.user && !stage.stopped
            ? <button onClick={() => navigate(messageLink(b))} className={btn.quiet}><MessageSquare className="h-4 w-4" aria-hidden="true" />Message {firstNameOf(b)}</button>
            : <span />}
          {renderNextStep(b)}
        </div>
      </article>
    );
  };

  return (
    <DashboardShell role="learner" navItems={navItems} sidebarPeople={{ title: 'Your educators', people: contacts.map(c => ({ ...c, subtitle: 'Educator', href: `/dashboard/learner/messages?with=${c.id}` })) }}>
      <div className="mx-auto max-w-[78rem] space-y-6">
        {activeTab !== 'overview' && (
          <DashboardHeader
            eyebrow="Learner"
            title={TAB_HEADERS[activeTab].title}
            description={TAB_HEADERS[activeTab].description}
            actions={
              activeTab === 'requests' ? <button onClick={onOpenSkillRequest} className={btn.primary}><PlusCircle className="h-4 w-4" aria-hidden="true" />New request</button>
                : activeTab === 'bookings' ? <button onClick={() => navigate('/find-skill')} className={btn.primary}><Search className="h-4 w-4" aria-hidden="true" />Find an educator</button>
                  : undefined
            }
          />
        )}

        {actionError && <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>}

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="grid items-start gap-6 pt-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
              <DashboardBanner eyebrow={`Welcome back, ${firstName}`} title={banner.title} description={banner.description} actions={banner.actions} />

              {/* Skills being learned, topped up with skills to explore so the row is always full */}
              <ul className="grid gap-4 sm:grid-cols-3" aria-label="Your skills">
                {learningSkills.slice(0, 3).map(skill => (
                  <li key={skill.name} className="dash-card flex items-center gap-3 p-4">
                    <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full', skill.color)} aria-hidden="true">
                      {skill.iconName ? <CategoryIcon iconName={skill.iconName} className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-ink-400">{skill.detail}</p>
                      <p className="truncate font-semibold text-ink-900">{skill.name}</p>
                    </div>
                  </li>
                ))}
                {[...categories]
                  .filter(category => !learningSkills.some(skill => skill.categoryId === category.id))
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .slice(0, Math.max(0, 3 - learningSkills.length))
                  .map(category => (
                    <li key={category.id}>
                      <button onClick={() => navigate(`/find-skill?category=${category.id}`)} className="dash-card flex w-full items-center gap-3 p-4 text-left transition hover:border-forest-200">
                        <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-full', categoryColor(category.id))} aria-hidden="true">
                          <CategoryIcon iconName={category.icon_name} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-ink-400">Explore</span>
                          <span className="block truncate font-semibold text-ink-900">{category.name}</span>
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>

              {/* Sessions, as photo cards */}
              <section aria-labelledby="sessions-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="sessions-heading" className="text-lg font-bold text-ink-900">Your sessions</h2>
                  {bookings.length > 0 && <button onClick={() => goTo('bookings')} className="text-sm font-semibold text-forest-600 hover:text-forest-700">See all</button>}
                </div>
                {sessionCards.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sessionCards.map(sessionCard)}
                    {sessionCards.length < 3 && (
                      <button onClick={() => navigate('/find-skill')} className="flex min-h-[16rem] flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#DFE2EA] bg-white/50 p-6 text-center transition hover:border-forest-300 hover:bg-white">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-forest-600" aria-hidden="true"><PlusCircle className="h-5 w-5" /></span>
                        <span className="mt-3 font-semibold text-ink-900">Book a session</span>
                        <span className="mt-1 text-sm text-ink-500">Find someone who teaches what you want to learn.</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="dash-card flex flex-col items-center px-6 py-10 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-forest-600" aria-hidden="true"><Calendar className="h-5 w-5" /></span>
                    <p className="mt-3 font-semibold text-ink-900">Nothing booked yet</p>
                    <p className="mt-1 max-w-sm text-sm text-ink-500">Find someone near you who teaches what you want to learn, or tell us and we’ll look for you.</p>
                    <button onClick={() => navigate('/find-skill')} className={cn(btn.primary, 'mt-5')}>Find an educator</button>
                  </div>
                )}
              </section>

              {/* Requests, as a table */}
              <Panel
                id="requests-table"
                title="Your requests"
                action={<button onClick={() => requests.length > 0 ? goTo('requests') : onOpenSkillRequest()} className="text-sm font-semibold text-forest-600 hover:text-forest-700">{requests.length > 0 ? 'See all' : 'New request'}</button>}
                bodyClassName="p-0 sm:p-0 pt-0 sm:pt-0"
              >
                {requests.length > 0 ? (
                  <div className="overflow-x-auto pb-2">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-[0.12em] text-ink-400">
                          <th className="px-6 py-3 font-semibold">Skill</th>
                          <th className="px-3 py-3 font-semibold">Budget</th>
                          <th className="px-3 py-3 font-semibold">Status</th>
                          <th className="px-3 py-3 font-semibold">Matched with</th>
                          <th className="px-6 py-3 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0F1F5]">
                        {requests.slice(0, 4).map(req => {
                          const matched = req.matched_educator;
                          const booked = matched && bookings.some(b => b.educator_id === matched.id);
                          return (
                            <tr key={req.id}>
                              <td className="px-6 py-3.5">
                                <p className="font-semibold text-ink-900">{req.skill_name}</p>
                                <p className="text-xs text-ink-400">{formatShortDate(req.created_at)}</p>
                              </td>
                              <td className="px-3 py-3.5 text-ink-700">{formatUGX(req.budget_ugx)}</td>
                              <td className="px-3 py-3.5"><StatusBadge status={booked ? 'booked' : req.status} /></td>
                              <td className="px-3 py-3.5">
                                {matched ? (
                                  <span className="flex items-center gap-2">
                                    <Avatar src={matched.avatar_url} name={matched.name} className="h-7 w-7 rounded-full" />
                                    <span className="font-medium text-ink-800">{matched.name}</span>
                                  </span>
                                ) : <span className="text-ink-400">We’re looking…</span>}
                              </td>
                              <td className="px-6 py-3.5 text-right">
                                <button
                                  onClick={() => matched && !booked ? navigate(`/educators/${matched.id}`) : goTo(booked ? 'bookings' : 'requests')}
                                  className="inline-grid h-8 w-8 place-items-center rounded-full border border-[#E3E5EC] text-ink-500 hover:border-forest-300 hover:text-forest-600"
                                  aria-label={matched && !booked ? `Book ${matched.name}` : `Open ${req.skill_name}`}
                                >
                                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-6 pb-6 text-sm text-ink-500">Can’t find someone? Tell us what you want to learn and your budget, and we’ll look for you.</p>
                )}
              </Panel>
            </div>

            <div className="space-y-6">
              <ProfileSummaryCard
                title="Statistic"
                name={user?.name}
                avatarUrl={user?.avatar_url}
                percent={bookedHours > 0 ? (learnedHours / bookedHours) * 100 : undefined}
                percentLabel="of your booked hours done"
                greeting={greetingForNow(firstName)}
                subline="Keep learning to reach your goal."
                chartTitle="Hours of learning"
                bars={hoursByMonth}
                formatValue={(v) => `${v} ${v === 1 ? 'hour' : 'hours'}`}
                emptyChartText="Your learning hours show here after your first session."
              />

              <Panel id="todo" title="To do" bodyClassName="px-3 pb-3 sm:px-3 sm:pb-3">
                {todos.length > 0 ? (
                  <ul className="space-y-1">
                    {todos.map(({ key, icon: Icon, tint, title, detail, action }) => (
                      <li key={key} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5 hover:bg-[#F7F8FB]">
                        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', tint)} aria-hidden="true"><Icon className="h-[18px] w-[18px]" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{title}</p>
                          <p className="truncate text-xs text-ink-400">{detail}</p>
                        </div>
                        {action}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-center gap-2 px-3 py-2 text-sm text-ink-500"><CheckCircle2 className="h-4 w-4 text-forest-500" aria-hidden="true" />You’re all caught up.</p>
                )}
              </Panel>

              {contacts.length > 0 && (
                <Panel id="educators" title="Your educators" bodyClassName="px-3 pb-4 sm:px-3 sm:pb-4">
                  <ul className="space-y-1">
                    {contacts.slice(0, 4).map(person => (
                      <li key={person.id} className="flex items-center gap-3 rounded-[14px] px-3 py-2.5">
                        <Avatar src={person.avatar_url} name={person.name} className="h-10 w-10 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">{person.name}</p>
                          <p className="truncate text-xs text-ink-400">Educator</p>
                        </div>
                        <button onClick={() => navigate(`/dashboard/learner/messages?with=${person.id}`)} className="inline-flex min-h-[34px] items-center gap-1.5 rounded-pill border border-forest-200 px-3 text-xs font-semibold text-forest-600 hover:bg-forest-50">
                          <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />Message
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => goTo('messages')} className="mx-3 mt-2 flex h-11 w-[calc(100%-1.5rem)] items-center justify-center rounded-pill bg-forest-50 text-sm font-semibold text-forest-700 hover:bg-forest-100">Open inbox</button>
                </Panel>
              )}
            </div>
          </div>
        )}

        {/* ===== MY REQUESTS ===== */}
        {activeTab === 'requests' && (
          requests.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-6 w-6" />}
              title="No requests yet"
              description="Can’t find someone on iSkillLink? Tell us what you want to learn and your budget, and we’ll look for you."
              action={<button onClick={onOpenSkillRequest} className={btn.primary}>Tell us what you need</button>}
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {requests.map(req => {
                const matched = req.matched_educator;
                const steps = ['Sent', 'Finding someone', 'Matched'];
                const done = matched || req.status !== 'open' ? 3 : 1;
                return (
                  <article key={req.id} className="dash-card flex flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-ink-900">{req.skill_name}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">{req.learning_goal}</p>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 rounded-control bg-[#F7F8FB] p-4 text-sm">
                      <div><dt className="text-xs text-ink-500">Budget</dt><dd className="font-semibold text-ink-900">{formatUGX(req.budget_ugx)}</dd></div>
                      <div><dt className="text-xs text-ink-500">Level</dt><dd className="font-semibold capitalize text-ink-900">{req.skill_level}</dd></div>
                      <div><dt className="text-xs text-ink-500">How</dt><dd className="text-ink-800">{FORMAT_LABELS[req.format_preference] || req.format_preference}</dd></div>
                      <div><dt className="text-xs text-ink-500">When</dt><dd className="text-ink-800">{req.preferred_schedule || 'Flexible'}</dd></div>
                    </dl>
                    <ol className="mt-5 grid grid-cols-3 gap-1.5" aria-label={`${done} of 3 steps done`}>
                      {steps.map((step, index) => (
                        <li key={step}>
                          <span className={cn('block h-1.5 rounded-full', index < done ? 'bg-forest-500' : index === done ? 'bg-forest-200' : 'bg-[#EEF0F5]')} aria-hidden="true" />
                          <span className={cn('mt-1.5 block truncate text-[12px]', index < done ? 'text-ink-700' : index === done ? 'font-semibold text-forest-800' : 'text-ink-400')}>{step}</span>
                        </li>
                      ))}
                    </ol>
                    {matched ? (
                      <div className="mt-5 flex flex-col gap-4 rounded-card border border-forest-200 bg-forest-50/70 p-4 sm:flex-row sm:items-center">
                        <Avatar src={matched.avatar_url} name={matched.name} className="h-12 w-12 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-forest-700">We matched you with</p>
                          <p className="font-semibold text-ink-900">{matched.name}</p>
                          <p className="truncate text-sm text-ink-600">{matched.title} · {formatUGX(matched.hourly_rate_ugx)}/hr</p>
                        </div>
                        {bookings.some(b => b.educator_id === matched.id)
                          ? <button onClick={() => goTo('bookings')} className={btn.outline}>See your booking<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                          : <button onClick={() => navigate(`/educators/${matched.id}`)} className={btn.primary}>View & book<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>}
                      </div>
                    ) : (
                      <p className="mt-5 text-sm text-ink-600">We’re looking for someone who fits. We’ll message you on WhatsApp and here as soon as we find them.</p>
                    )}
                    <p className="mt-4 text-xs text-ink-400">Sent {formatShortDate(req.created_at)}</p>
                  </article>
                );
              })}
            </div>
          )
        )}

        {/* ===== BOOKINGS ===== */}
        {activeTab === 'bookings' && (
          bookings.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" />}
              title="No bookings yet"
              description="When you book a session it shows up here, with what to do next."
              action={<button onClick={() => navigate('/find-skill')} className={btn.primary}>Find an educator</button>}
            />
          ) : (
            <div className="space-y-5">
              <div className="inline-flex rounded-pill bg-[#EBEDF2] p-1 text-sm font-semibold" role="tablist" aria-label="Show bookings">
                {([['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${pastBookings.length})`]] as const).map(([key, label]) => (
                  <button key={key} role="tab" aria-selected={bookingFilter === key} onClick={() => setBookingFilter(key)} className={cn('min-h-[40px] rounded-pill px-5 transition', bookingFilter === key ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-900')}>
                    {label}
                  </button>
                ))}
              </div>
              {(bookingFilter === 'upcoming' ? upcoming : pastBookings).length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-6 w-6" />}
                  title={bookingFilter === 'upcoming' ? 'Nothing coming up' : 'No past sessions yet'}
                  description={bookingFilter === 'upcoming' ? 'Book your next session with an educator near you.' : 'Finished, declined and cancelled sessions show up here.'}
                  action={bookingFilter === 'upcoming' ? <button onClick={() => navigate('/find-skill')} className={btn.primary}>Find an educator</button> : undefined}
                />
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {(bookingFilter === 'upcoming' ? upcoming : pastBookings).map(bookingCard)}
                </div>
              )}
            </div>
          )
        )}

        {/* ===== PAYMENTS ===== */}
        {activeTab === 'payments' && (
          <>
            <StatRow className="xl:grid-cols-3" stats={[
              { label: 'Held in escrow', value: formatUGX(heldInEscrow), detail: 'Released after each session is done', icon: ShieldCheck, accent: 'clay' },
              { label: 'Released to educators', value: formatUGX(released), detail: 'For sessions you finished', icon: CheckCircle2, accent: 'forest' },
              { label: 'Paid in total', value: formatUGX(heldInEscrow + released), detail: (() => { const n = payments.filter(p => p.status === 'paid' || p.status === 'completed').length; return `${n} ${n === 1 ? 'payment' : 'payments'}`; })(), icon: Wallet, accent: 'sky' }
            ]} />
            <Panel title="Payment history" bodyClassName="p-0 sm:p-0">
              {payments.length === 0 ? (
                <EmptyState
                  icon={<CreditCard className="h-6 w-6" />}
                  title="No payments yet"
                  description="You pay into escrow after an educator accepts your booking. Payments show up here."
                  action={<button onClick={() => goTo('bookings')} className={btn.primary}>See bookings</button>}
                  className="m-5 border-none"
                />
              ) : (
                <ul className="divide-y divide-[#F0F1F5]">
                  {[...payments].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(p => (
                    <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                      <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F5F6FA] text-ink-500 sm:grid" aria-hidden="true"><Wallet className="h-[18px] w-[18px]" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink-900">{bookingLabel(p.booking_id)}</p>
                        <p className="text-xs text-ink-500">{formatShortDate(p.created_at)} · {METHOD_LABELS[p.method] || p.method} · <span className="font-mono">{p.payment_reference}</span></p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <PaymentStatusBadge status={p.status} audience="learner" />
                        <span className="font-bold text-ink-900">{formatUGX(p.amount_ugx)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
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
            emptyDescription="Once you book a session, you can message your educator here about times, tools and what to bring."
            emptyAction={<button onClick={() => navigate('/find-skill')} className={btn.primary}>Find an educator</button>}
            suggestions={['Hello! Looking forward to our session.', 'What should I bring?', 'Can we change the time?']}
          />
        )}

        {/* ===== REVIEWS ===== */}
        {activeTab === 'reviews' && (
          awaitingReview.length === 0 && reviewedBookings.length === 0 ? (
            <EmptyState
              icon={<Star className="h-6 w-6" />}
              title="Nothing to review yet"
              description="When you finish a session, it appears here so you can rate your educator."
              action={<button onClick={() => navigate('/find-skill')} className={btn.primary}>Find an educator</button>}
            />
          ) : (
            <div className="space-y-6">
              {awaitingReview.length > 0 && (
                <Panel title="Waiting for your review" bodyClassName="space-y-3">
                  {awaitingReview.map(b => (
                    <div key={b.id} className="flex flex-col gap-4 rounded-card border border-amber-200 bg-amber-50/60 p-4 sm:flex-row sm:items-center">
                      <Avatar src={b.educator?.user?.avatar_url} name={b.educator?.user?.name} className="h-12 w-12 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink-900">{b.skill_name}</p>
                        <p className="text-sm text-ink-600">with {b.educator?.user?.name || 'your educator'} · {formatShortDate(b.scheduled_date)}</p>
                      </div>
                      <button onClick={() => setReviewModalBooking(b)} className={btn.dark}><Star className="h-4 w-4 text-sun-300" aria-hidden="true" />Write a review</button>
                    </div>
                  ))}
                </Panel>
              )}
              {reviewedBookings.length > 0 && (
                <Panel title="Reviews you’ve written" bodyClassName="grid gap-4 md:grid-cols-2">
                  {reviewedBookings.map(b => (
                    <article key={b.id} className="rounded-card border border-[#ECEEF3] p-5">
                      <div className="flex items-center gap-3">
                        <Avatar src={b.educator?.user?.avatar_url} name={b.educator?.user?.name} className="h-10 w-10 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink-900">{b.educator?.user?.name || 'Your educator'}</p>
                          <p className="truncate text-xs text-ink-500">{b.skill_name}</p>
                        </div>
                        <div className="flex gap-0.5" role="img" aria-label={`${b.review!.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < b.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'}`} aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-ink-700">“{b.review!.comment}”</p>
                      {b.review!.educator_reply && (
                        <div className="mt-4 rounded-control bg-forest-50/70 p-3 text-sm text-ink-700">
                          <span className="block text-xs font-semibold text-forest-800">{b.educator?.user?.name?.split(' ')[0] || 'Educator'} replied</span>
                          {b.review!.educator_reply}
                        </div>
                      )}
                    </article>
                  ))}
                </Panel>
              )}
            </div>
          )
        )}

        {/* ===== PROFILE ===== */}
        {activeTab === 'profile' && (
          <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <section className="dash-card p-6 text-center" aria-label="Your photo">
              <Avatar src={user?.avatar_url} name={user?.name} className="mx-auto h-24 w-24 rounded-full" />
              <p className="mt-4 text-xl font-bold text-ink-900">{user?.name}</p>
              <p className="text-sm text-ink-500">{user?.email}</p>
              {user?.created_at && <p className="mt-1 text-xs text-ink-400">Learning on iSkillLink since {new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>}
              <button type="button" onClick={() => setShowPhotoModal(true)} className={cn(btn.outline, 'mt-5')}>
                <Camera className="h-4 w-4" aria-hidden="true" />{user?.avatar_url ? 'Change photo' : 'Add a photo'}
              </button>
            </section>
            <Panel title="Your details" description="Educators and our team use these to reach you.">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {profileMessage && <Alert tone={profileMessage.tone} onDismiss={() => setProfileMessage(null)}>{profileMessage.text}</Alert>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="profile-name" required>
                    <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                  </Field>
                  <Field label="Phone or WhatsApp" htmlFor="profile-phone">
                    <Input id="profile-phone" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+256 7XX XXX XXX" />
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" isLoading={savingProfile} disabled={profileName.trim() === (user?.name || '') && profilePhone.trim() === (user?.phone || '')}>
                    Save changes
                  </Button>
                </div>
              </form>
            </Panel>
          </div>
        )}

        {paymentModalBooking && (
          <SimulatePaymentModal
            booking={paymentModalBooking}
            onClose={() => setPaymentModalBooking(null)}
            onPaymentSuccess={() => {
              setPaymentModalBooking(null);
              loadLearnerData(true);
            }}
          />
        )}

        {reviewModalBooking && (
          <ReviewModal
            booking={reviewModalBooking}
            onClose={() => setReviewModalBooking(null)}
            onReviewSuccess={() => {
              setReviewModalBooking(null);
              loadLearnerData(true);
            }}
          />
        )}

        <ProfilePhotoUploadModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
      </div>
    </DashboardShell>
  );
};
