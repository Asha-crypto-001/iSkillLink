import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking, LearnerRequest, Payment, Review, Message, Educator } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { SimulatePaymentModal } from '../components/SimulatePaymentModal';
import { ReviewModal } from '../components/ReviewModal';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import {
  BookOpen, Calendar, Clock, CreditCard, MessageSquare,
  Award, Star, User, Settings, CheckCircle2, PlusCircle, ArrowRight, ShieldCheck, ExternalLink, Send,
  Camera
} from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { PaymentStatusBadge, StatusBadge } from '../components/ui/Badge';
import { DashboardHeader, DashboardShell, SectionHeader, StatRow } from '../components/dashboard';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';

interface LearnerDashboardProps {
  onOpenSkillRequest: () => void;
  onViewEducator: (educator: Educator) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onOpenSkillRequest,
  onViewEducator
}) => {
  const { user, learnerProfile } = useAuth();
  // The API already scopes results to the signed-in learner; the id only narrows admin views.
  const learnerId: string | undefined = learnerProfile?.id;
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): 'overview' | 'requests' | 'bookings' | 'payments' | 'messages' | 'reviews' | 'profile' => {
    const seg = location.pathname.split('/')[3];
    if (['requests','bookings','payments','messages','reviews','profile'].includes(seg)) return seg as any;
    return 'overview';
  };
  const activeTab = getActiveTab();
  const setActiveTab = (tab: 'overview' | 'requests' | 'bookings' | 'payments' | 'messages' | 'reviews' | 'profile') => {
    if (tab === 'overview') navigate('/dashboard/learner');
    else navigate(`/dashboard/learner/${tab}`);
  };
  const [requests, setRequests] = useState<LearnerRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const { updateProfile } = useAuth();
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

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
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Modal states
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);

  const loadLearnerData = async () => {
    try {
      setLoading(true);
      const [reqs, bks, pays, msgs] = await Promise.all([
        api.getLearnerRequests({ learner_id: learnerId }),
        api.getBookings({ learner_id: learnerId }),
        api.getPayments({ learner_id: learnerId }),
        user ? api.getMessages(user.id) : Promise.resolve([])
      ]);

      setRequests(reqs);
      setBookings(bks);
      setPayments(pays);
      setMessages(msgs);
      // Default the message thread to the first instructor the learner has booked.
      setSelectedRecipientId(prev => prev || bks.find(b => b.educator?.user?.id)?.educator?.user?.id || '');
    } catch (err) {
      console.error('Error loading learner dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearnerData();
  }, [learnerId, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !user || !selectedRecipientId) return;

    try {
      setActionError('');
      const msg = await api.sendMessage(user.id, selectedRecipientId, newMessageText);
      setMessages(prev => [...prev, msg]);
      setNewMessageText('');
    } catch (e: any) {
      console.error('Failed to send message:', e);
      setActionError(e.message || 'Failed to send message. Please try again.');
    }
  };

  const handleMarkSessionComplete = async (bookingId: string) => {
    try {
      setActionError('');
      await api.updateBookingStatus(bookingId, 'completed');
      loadLearnerData();
    } catch (e: any) {
      console.error('Error completing session:', e);
      setActionError(e.message || 'Could not mark the session as completed. Please try again.');
    }
  };

  const awaitingReview = bookings.filter(b => b.status === 'completed' && !b.review);
  const reviewedBookings = bookings.filter(b => b.review);

  const threadMessages = messages.filter(m => m.sender_id === selectedRecipientId || m.receiver_id === selectedRecipientId);

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedSessionsCount = bookings.filter(b => b.status === 'completed').length;
  const totalInvestedUGX = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_ugx, 0);
  const bookingLabel = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    return booking ? `${booking.skill_name}${booking.educator?.user?.name ? ` with ${booking.educator.user.name}` : ''}` : 'Session';
  };
  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings
    .filter(b => ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status))
    .sort((a, b) => `${a.scheduled_date} ${a.start_time}`.localeCompare(`${b.scheduled_date} ${b.start_time}`));
  const nextBooking = upcoming[0];
  const openRequestsCount = requests.filter(r => r.status === 'open' || r.status === 'matched').length;
  const firstNameOf = (b: Booking) => b.educator?.user?.name?.split(' ')[0] || 'the educator';
  const FORMAT_LABELS: Record<string, string> = { 'in-person': 'At the workshop', hybrid: 'Online and workshop', online: 'Online' };

  const TAB_TITLES: Record<typeof activeTab, { label: string; title: string; description?: string }> = {
    overview: { label: 'Overview', title: `Hi, ${user?.name?.split(' ')[0] || 'there'}` },
    requests: { label: 'My requests', title: 'My requests', description: 'What you asked us to find. We reply on WhatsApp.' },
    bookings: { label: 'Bookings', title: 'Bookings', description: 'Every session you’ve booked, and what happens next.' },
    payments: { label: 'Payments', title: 'Payments' },
    messages: { label: 'Messages', title: 'Messages' },
    reviews: { label: 'Reviews', title: 'Reviews' },
    profile: { label: 'Profile', title: 'Profile' }
  };

  /** The single rule for what a learner can do next with a booking (send -> confirm -> pay -> learn -> review). */
  const renderNextStep = (b: Booking) => {
    const name = firstNameOf(b);
    const paid = b.payment?.status === 'paid' || b.payment?.status === 'completed';
    const buttonClass = 'px-4 py-2.5 min-h-[44px] rounded-control font-bold text-xs inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2';
    if (b.status === 'pending' || b.status === 'accepted') {
      return <span className="text-sm text-ink-600">Waiting for {name} to confirm</span>;
    }
    if (b.status === 'confirmed' || b.status === 'in_progress') {
      if (!paid) {
        return (
          <button onClick={() => setPaymentModalBooking(b)} className={`${buttonClass} bg-forest-700 hover:bg-forest-800 text-white`}>
            <CreditCard className="w-3.5 h-3.5" aria-hidden="true" /> Pay {formatUGX(b.total_amount_ugx)}
          </button>
        );
      }
      if (b.scheduled_date > today) {
        return <span className="text-sm text-ink-600">Paid · see you {formatShortDate(b.scheduled_date)}</span>;
      }
      return (
        <button onClick={() => handleMarkSessionComplete(b.id)} className={`${buttonClass} bg-forest-700 hover:bg-forest-800 text-white`}>
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Mark session done
        </button>
      );
    }
    if (b.status === 'completed') {
      return b.review
        ? <span className="text-sm text-ink-600">Reviewed — thank you</span>
        : (
          <button onClick={() => setReviewModalBooking(b)} className={`${buttonClass} bg-ink-900 hover:bg-ink-800 text-white`}>
            <Star className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" /> Write a review
          </button>
        );
    }
    return <span className="text-sm text-ink-600">{b.status === 'declined' ? `${name} couldn’t take this one` : 'Cancelled'}</span>;
  };

  // Default bios written by the app are not worth repeating back to the learner.
  const ownBio = learnerProfile?.bio && !/^(Interested in learning practical skills\.|Enthusiastic practical skills learner\.|Practical skills student)/.test(learnerProfile.bio) ? learnerProfile.bio : undefined;

  const heldInEscrowUGX = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount_ugx, 0);

  if (loading) {
    return (
      <DashboardShell role="learner">
      <div className="container-app py-6 space-y-6" aria-busy="true" aria-live="polite">
        <div className="h-32 rounded-3xl bg-white border border-ink-200 shadow-level-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-ink-100 animate-pulse" aria-hidden="true" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-card bg-white border border-ink-200 shadow-level-1"><div className="h-full w-full bg-ink-100 animate-pulse" /></div>)}
        </div>
        <div className="p-8 rounded-card border border-ink-200 bg-white">
          <div className="h-6 w-48 bg-ink-100 animate-pulse rounded mb-4" />
          <div className="h-4 w-full bg-ink-100 animate-pulse rounded mb-2" />
          <div className="h-4 w-5/6 bg-ink-100 animate-pulse rounded" />
        </div>
      </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="learner" navItems={[
      { label: 'Overview', href: '/dashboard/learner', icon: BookOpen, end: true },
      { label: 'My requests', href: '/dashboard/learner/requests', icon: Clock },
      { label: 'Bookings', href: '/dashboard/learner/bookings', icon: Calendar },
      { label: 'Payments', href: '/dashboard/learner/payments', icon: CreditCard },
      { label: 'Messages', href: '/dashboard/learner/messages', icon: MessageSquare },
      { label: 'Reviews', href: '/dashboard/learner/reviews', icon: Star },
      { label: 'Profile', href: '/dashboard/learner/profile', icon: User }
    ]}>
    <div className="container-app space-y-6">
      <DashboardHeader
        title={TAB_TITLES[activeTab].title}
        description={activeTab === 'overview' ? ownBio : TAB_TITLES[activeTab].description}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard/learner' }, { label: TAB_TITLES[activeTab].label }]}
        actions={<button onClick={onOpenSkillRequest} className="inline-flex items-center min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 px-4 text-xs font-bold text-white"><PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />New request</button>}
      />

      {actionError && (
        <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Next session — the one thing a learner opens the dashboard for */}
          {nextBooking ? (
            <section aria-labelledby="next-session-heading" className="bg-white rounded-card border border-ink-200 shadow-level-1 overflow-hidden">
              <h2 id="next-session-heading" className="px-6 pt-5 text-sm font-semibold text-ink-600">Your next session</h2>
              <div className="p-6 pt-3 flex flex-col sm:flex-row gap-5 sm:items-center">
                {/* Tear-off calendar date */}
                <div className="shrink-0 w-20 rounded-control border border-ink-200 overflow-hidden text-center" aria-hidden="true">
                  <div className="bg-clay-600 text-white text-xs font-bold uppercase tracking-wide py-1">
                    {new Date(`${nextBooking.scheduled_date}T00:00`).toLocaleDateString('en-GB', { month: 'short' })}
                  </div>
                  <div className="font-display text-3xl font-bold text-ink-900 py-1.5">
                    {new Date(`${nextBooking.scheduled_date}T00:00`).getDate()}
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="font-display text-xl font-bold text-ink-900">{nextBooking.skill_name}</div>
                  <div className="text-sm text-ink-700">
                    with <strong className="text-ink-900">{nextBooking.educator?.user?.name || 'your educator'}</strong> ·{' '}
                    {new Date(`${nextBooking.scheduled_date}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at {nextBooking.start_time} · {nextBooking.duration_hours} {nextBooking.duration_hours === 1 ? 'hour' : 'hours'}
                  </div>
                  <div className="text-sm text-ink-600">{nextBooking.format === 'online' ? 'Online' : nextBooking.location_or_link}</div>
                </div>
                <div className="shrink-0">{renderNextStep(nextBooking)}</div>
              </div>
            </section>
          ) : (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="Nothing booked yet"
              description="Find someone near you who teaches what you want to learn, or tell us and we’ll look for you."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => navigate('/find-skill')} className="px-5 min-h-[44px] rounded-control bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Find an educator</button>
                  <button onClick={onOpenSkillRequest} className="px-5 min-h-[44px] rounded-control border border-ink-200 bg-white text-ink-800 text-xs font-bold hover:bg-ink-50">Tell us what you need</button>
                </div>
              }
            />
          )}

          <StatRow className="xl:grid-cols-3" stats={[
            { label: 'Sessions done', value: completedSessionsCount, detail: completedSessionsCount === 1 ? 'Completed session' : 'Completed sessions', icon: CheckCircle2 },
            { label: 'Open requests', value: openRequestsCount, detail: 'We’re looking for someone', icon: Clock, accent: 'ink' },
            { label: 'Paid so far', value: formatUGX(totalInvestedUGX), detail: heldInEscrowUGX > 0 ? `${formatUGX(heldInEscrowUGX)} held until your session is done` : 'Nothing waiting in escrow', icon: CreditCard }
          ]} />

          {upcoming.length > 1 && (
            <section aria-labelledby="also-heading" className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-3">
              <SectionHeader title="Also coming up" action={<button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-forest-700 hover:text-forest-800 min-h-[44px]">All bookings</button>} />
              {upcoming.slice(1, 4).map(b => (
                <div key={b.id} className="p-4 rounded-card border border-ink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-ink-900 text-sm">{b.skill_name}</div>
                    <div className="text-xs text-ink-600 mt-0.5">with {b.educator?.user?.name || 'your educator'} · {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  </div>
                  <div className="shrink-0">{renderNextStep(b)}</div>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {/* TAB CONTENT: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">{requests.length} {requests.length === 1 ? 'request' : 'requests'}</h2>
            </div>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6" />}
                title="No requests yet"
                description="Can’t find someone on iSkillLink? Tell us what you want to learn and your budget, and we’ll look for you."
                action={<button onClick={onOpenSkillRequest} className="px-5 min-h-[44px] rounded-control bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Tell us what you need</button>}
              />
            ) : (
              requests.map(req => (
                <div
                  key={req.id}
                  className="p-5 rounded-card border border-ink-200 bg-white hover:border-ink-200 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-ink-900 text-base">{req.skill_name}</h3>
                        <StatusBadge status={req.status} />
                        <span className="text-[12px] uppercase font-semibold px-2 py-0.5 rounded bg-ink-50 text-ink-600">
                          {req.skill_level}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600 mt-1">{req.learning_goal}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-ink-900">{formatUGX(req.budget_ugx)}</div>
                      <div className="text-[12px] text-ink-600">Your budget</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                    <div><strong>How:</strong> {FORMAT_LABELS[req.format_preference] || req.format_preference}</div>
                    <div><strong>Location:</strong> {req.location}</div>
                    <div><strong>Schedule:</strong> {req.preferred_schedule}</div>
                    <div><strong>Frequency:</strong> {req.frequency}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</h2>
          </div>

          {bookings.length === 0 && (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="No bookings yet"
              description="When you book a session it shows up here, with what to do next."
              action={<button onClick={() => navigate('/find-skill')} className="px-5 min-h-[44px] rounded-control bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Find an educator</button>}
            />
          )}

          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-card border border-ink-200 bg-white space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-ink-900 text-base">{b.skill_name}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-ink-600 mt-1">
                      with <strong className="text-ink-900">{b.educator?.user?.name || 'your educator'}</strong>{b.educator?.title ? ` · ${b.educator.title}` : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-ink-900">{formatUGX(b.total_amount_ugx)}</div>
                    <div className="mt-1">
                      <PaymentStatusBadge status={b.payment?.status || 'pending'} audience="learner" />
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-600">
                    <span>Progress (updated by {firstNameOf(b)})</span>
                    <span className="font-bold">{b.milestone_progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-50 overflow-hidden">
                    <div
                      className="h-full bg-forest-600 rounded-full transition-all duration-300"
                      style={{ width: `${b.milestone_progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                  <div><strong>When:</strong> {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  <div><strong>How:</strong> {FORMAT_LABELS[b.format] || b.format}</div>
                  <div><strong>Where:</strong> {b.location_or_link}</div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-ink-100">
                  {renderNextStep(b)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PAYMENTS & ESCROW */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Payments</h2>
            <p className="text-xs text-ink-500">iSkillLink holds your money until your session is done, then releases it to the educator. If a session doesn’t happen, we refund you in full.</p>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-6 h-6" />}
              title="No payments yet"
              description="You pay into escrow after an educator confirms your booking. Payments show up here."
              action={<button onClick={() => setActiveTab('bookings')} className="px-5 min-h-[44px] rounded-control bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">See bookings</button>}
            />
          ) : (
            <>
              {/* Desktop Table — hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ink-50 text-ink-700 uppercase font-bold border-y border-ink-200">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Session / Educator</th>
                      <th className="p-3">Amount (UGX)</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 text-ink-700">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-ink-50/50">
                        <td className="p-3 font-mono font-semibold text-ink-900">{p.payment_reference}</td>
                        <td className="p-3">
                          {bookingLabel(p.booking_id)}
                        </td>
                        <td className="p-3 font-bold text-ink-900">{formatUGX(p.amount_ugx)}</td>
                        <td className="p-3 uppercase font-semibold text-forest-800">{p.method.replace('_', ' ')}</td>
                        <td className="p-3">
                          <PaymentStatusBadge status={p.status} audience="learner" />
                        </td>
                        <td className="p-3 text-ink-500">{formatShortDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Stacked Cards — visible only on small screens */}
              <div className="md:hidden space-y-3">
                {payments.map(p => (
                  <div key={p.id} className="p-4 rounded-card border border-ink-200 bg-white shadow-level-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-ink-900">{p.payment_reference}</span>
                      <PaymentStatusBadge status={p.status} audience="learner" />
                    </div>
                    <div className="text-xs text-ink-600"><span className="font-semibold text-ink-900">{bookingLabel(p.booking_id)}</span> · {formatShortDate(p.created_at)}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-ink-100">
                      <div><span className="text-ink-500">Amount:</span> <span className="font-bold text-ink-900">{formatUGX(p.amount_ugx)}</span></div>
                      <div><span className="text-ink-500">Method:</span> <span className="font-semibold text-forest-800 uppercase">{p.method.replace('_', ' ')}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Your reviews</h2>
            <p className="text-xs text-ink-500">An honest review helps the next learner choose — and helps good educators get booked.</p>
          </div>

          {awaitingReview.length === 0 && reviewedBookings.length === 0 ? (
            <EmptyState
              icon={<Star className="w-6 h-6" />}
              title="Nothing to review yet"
              description="When you finish a session, it appears here so you can rate your educator."
              action={<button onClick={() => navigate('/find-skill')} className="px-5 py-2.5 rounded-card bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Find an educator</button>}
            />
          ) : (
            <>
              {awaitingReview.length > 0 && (
                <section aria-labelledby="awaiting-review-heading" className="space-y-3">
                  <h3 id="awaiting-review-heading" className="text-sm font-bold text-ink-900">Waiting for your review</h3>
                  {awaitingReview.map(b => (
                    <div key={b.id} className="p-4 rounded-card border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-ink-900">{b.skill_name}</div>
                        <div className="text-xs text-ink-600">with {b.educator?.user?.name || 'your educator'} · {formatShortDate(b.scheduled_date)}</div>
                      </div>
                      <button
                        onClick={() => setReviewModalBooking(b)}
                        className="px-4 py-2.5 min-h-[44px] rounded-control bg-ink-950 hover:bg-ink-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                        Write a review
                      </button>
                    </div>
                  ))}
                </section>
              )}

              {reviewedBookings.length > 0 && (
                <section aria-labelledby="written-reviews-heading" className="space-y-3">
                  <h3 id="written-reviews-heading" className="text-sm font-bold text-ink-900">Reviews you’ve written</h3>
                  {reviewedBookings.map(b => (
                    <article key={b.id} className="p-4 rounded-card border border-ink-200 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-bold text-ink-900">{b.skill_name} <span className="font-normal text-ink-600">with {b.educator?.user?.name || 'your educator'}</span></div>
                        <div className="flex gap-0.5" role="img" aria-label={`${b.review!.rating} out of 5 stars`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < b.review!.rating ? 'fill-amber-500 text-amber-500' : 'text-ink-300'}`} aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-ink-700 leading-relaxed">“{b.review!.comment}”</p>
                      {b.review!.educator_reply && (
                        <div className="pl-3 border-l-2 border-forest-700 text-xs text-ink-700">
                          <span className="font-semibold text-ink-900">{b.educator?.user?.name || 'Educator'} replied:</span> {b.review!.educator_reply}
                        </div>
                      )}
                    </article>
                  ))}
                </section>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT: MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Direct In-App Messages</h2>
            <p className="text-xs text-ink-500">Communicate with your assigned educators and plan workshop visits.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contacts list */}
            <div className="space-y-2 border-r border-ink-100 pr-4">
              <div className="text-xs font-bold text-ink-700 uppercase mb-2">My Instructors</div>
              {bookings.filter(b => b.educator?.user).length > 0 ? (
                Array.from(new Set(bookings.map(b => b.educator?.user?.id))).map(userId => {
                  const b = bookings.find(bk => bk.educator?.user?.id === userId);
                  if (!b || !b.educator?.user) return null;
                  return (
                    <button
                      key={userId}
                      onClick={() => setSelectedRecipientId(userId)}
                      className={`w-full p-3 rounded-card text-left text-xs transition border flex items-center justify-between ${
                        selectedRecipientId === userId
                          ? 'bg-forest-50 border-forest-300 text-forest-950 font-bold'
                          : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-ink-900">{b.educator.user.name}</div>
                        <div className="text-[12px] text-ink-500">{b.educator.title}</div>
                      </div>
                      {selectedRecipientId === userId && <span className="w-2 h-2 rounded-full bg-forest-600"></span>}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 rounded-card bg-ink-50 border border-ink-200 text-center text-xs text-ink-500">
                  <p className="font-medium text-ink-700 mb-1">No active educators yet</p>
                  <p className="text-[12px]">Book a hands-on session or post a skill request to start a direct message thread.</p>
                </div>
              )}
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 flex flex-col h-96 border border-ink-200 rounded-card overflow-hidden bg-ink-50/50">
              <div className="p-3 bg-white border-b border-ink-200 text-xs font-bold text-ink-800">
                Conversation
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {threadMessages.length > 0 ? (
                  threadMessages.map(m => {
                    const isMe = m.sender_id === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-card text-xs leading-relaxed ${
                            isMe
                              ? 'bg-forest-700 text-white rounded-br-none'
                              : 'bg-white text-ink-800 border border-ink-200 rounded-bl-none shadow-level-1'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[12px] text-ink-400 mt-0.5 px-1">
                          {formatShortDate(m.created_at)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-xs text-ink-400">
                    No messages in this thread yet. Send a message to start!
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-ink-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={selectedRecipientId ? 'Type your message...' : 'Book a session to message an instructor'}
                  disabled={!selectedRecipientId}
                  className="flex-1 text-xs p-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700 disabled:bg-ink-50"
                />
                <button
                  type="submit"
                  disabled={!selectedRecipientId}
                  aria-label="Send message"
                  className="p-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6 max-w-2xl">
          <div className="flex items-center gap-4">
            <Avatar src={user?.avatar_url} name={user?.name} className="w-20 h-20 rounded-card" />
            <div className="space-y-1.5">
              <div className="text-sm text-ink-600">{user?.email}</div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="px-3.5 min-h-[40px] rounded-control border border-ink-200 bg-white text-ink-800 text-xs font-bold hover:bg-ink-50 inline-flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                {user?.avatar_url ? 'Change photo' : 'Add a photo'}
              </button>
            </div>
          </div>

          {profileMessage && (
            <Alert tone={profileMessage.tone} onDismiss={() => setProfileMessage(null)}>{profileMessage.text}</Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Your name" htmlFor="profile-name" required>
              <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
            </Field>
            <Field label="Phone / WhatsApp" htmlFor="profile-phone" hint="Educators and our team use this to reach you.">
              <Input id="profile-phone" type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+256 7XX XXX XXX" />
            </Field>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={savingProfile} disabled={profileName.trim() === (user?.name || '') && profilePhone.trim() === (user?.phone || '')}>
              Save changes
            </Button>
          </div>
        </form>
      )}

      {/* Modals */}
      {paymentModalBooking && (
        <SimulatePaymentModal
          booking={paymentModalBooking}
          onClose={() => setPaymentModalBooking(null)}
          onPaymentSuccess={() => {
            setPaymentModalBooking(null);
            loadLearnerData();
          }}
        />
      )}

      {reviewModalBooking && (
        <ReviewModal
          booking={reviewModalBooking}
          onClose={() => setReviewModalBooking(null)}
          onReviewSuccess={() => {
            setReviewModalBooking(null);
            loadLearnerData();
          }}
        />
      )}

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
    </DashboardShell>
  );
};
