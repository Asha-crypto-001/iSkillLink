import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Educator, Booking, Review, LearnerRequest, Payment, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { PaymentStatusBadge, StatusBadge } from '../components/ui/Badge';
import { VERIFICATION_STEPS, isStepPassed, verificationProgress } from '../utils/verification';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { DashboardHeader, DashboardShell, SectionHeader, StatRow } from '../components/dashboard';
import {
  GraduationCap, Calendar, Clock, DollarSign, Star,
  MessageSquare, Settings, ShieldCheck, CheckCircle2,
  XCircle, ArrowRight, UserCheck, Wrench, FileText, Send, Sparkles,
  Camera, User
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';

interface EducatorDashboardProps {
  onViewProfileModal?: (educator: Educator) => void;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = () => {
  const { user, educatorProfile } = useAuth();
  const educatorId: string | undefined = educatorProfile?.id;
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): 'overview' | 'bookings' | 'leads' | 'earnings' | 'reviews' | 'profile' => {
    const seg = location.pathname.split('/')[3];
    if (['bookings','leads','earnings','reviews','profile'].includes(seg)) return seg as any;
    return 'overview';
  };
  const activeTab = getActiveTab();
  const setActiveTab = (tab: 'overview' | 'bookings' | 'leads' | 'earnings' | 'reviews' | 'profile') => {
    if (tab === 'overview') navigate('/dashboard/educator');
    else navigate(`/dashboard/educator/${tab}`);
  };
  const [educator, setEducator] = useState<Educator | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openRequests, setOpenRequests] = useState<LearnerRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState<{ [reviewId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadDashboardData = async () => {
    // Accounts without an educator profile have nothing to load; they are prompted to apply instead.
    if (!educatorId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [educatorId]);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      setActionError('');
      await api.updateBookingStatus(bookingId, status);
      loadDashboardData();
    } catch (e: any) {
      console.error('Failed to update booking status:', e);
      setActionError(e.message || 'Could not update the booking. Please try again.');
    }
  };

  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleUpdateProgress = useCallback((bookingId: string, progress: number) => {
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    progressTimeoutRef.current = setTimeout(async () => {
      try {
        setActionError('');
        await api.updateBookingProgress(bookingId, progress);
        loadDashboardData();
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
      loadDashboardData();
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    } catch (e: any) {
      console.error('Error submitting reply:', e);
      setActionError(e.message || 'Could not post your reply. Please try again.');
    }
  };

  const ratingLabel = educator?.rating ? `${educator.rating}★` : 'No ratings yet';
  const TAB_LABELS: Record<typeof activeTab, string> = {
    overview: 'Overview', bookings: 'Bookings', leads: 'Leads', earnings: 'Earnings', reviews: 'Reviews', profile: 'Profile'
  };
  const FORMAT_LABELS: Record<string, string> = { 'in-person': 'At your workshop', hybrid: 'Online and workshop', online: 'Online' };
  const pendingBookings = bookings.filter(b => b.status === 'pending');

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
  const platformFees = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.platform_fee_ugx, 0);

  const isLive = educator?.status === 'active' || educator?.status === 'approved';
  const progress = verificationProgress(educator?.verification);
  const nextStepIndex = VERIFICATION_STEPS.findIndex(step => !isStepPassed(educator?.verification, step));
  const reviewCount = educator?.total_reviews || 0;
  const ratingSummary = educator?.rating ? `${educator.rating}★ from ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}` : 'No reviews yet';

  // Leads in the educator's own trade come first; a word match on title/skills is enough here.
  const tradeText = [educator?.title, ...(educator?.skills || []).map(s => s.skill_name)].join(' ').toLowerCase();
  const matchesTrade = (req: LearnerRequest) =>
    req.skill_name.toLowerCase().split(/[^a-z]+/).some(word => word.length > 3 && tradeText.includes(word));
  const sortedLeads = [...openRequests].sort((a, b) => Number(matchesTrade(b)) - Number(matchesTrade(a)));

  if (loading) {
    return (
      <DashboardShell role="educator">
      <div className="container-app py-6 space-y-6" aria-busy="true" aria-live="polite">
        <div className="h-32 rounded-3xl bg-white border border-ink-200 shadow-level-1 relative overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
        </div>
        <div className="p-8 rounded-card border border-ink-200 bg-white">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
      </DashboardShell>
    );
  }

  if (!educatorId) {
    return (
      <DashboardShell role="educator">
      <div className="container-app space-y-6">
        <DashboardHeader
          eyebrow="Educator portal"
          title={`Welcome, ${user?.name || 'Educator'}`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        />
        <EmptyState
          icon={<GraduationCap className="w-6 h-6" />}
          title="No educator profile yet"
          description="Complete the educator application so the iSkillLink team can verify your trade credentials and list you for learners."
          action={<button onClick={() => navigate('/become-educator')} className="rounded-card bg-forest-700 px-4 py-2 text-xs font-bold text-white">Apply to teach</button>}
        />
      </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="educator" navItems={[
      { label: 'Overview', href: '/dashboard/educator', icon: GraduationCap, end: true },
      { label: 'Bookings', href: '/dashboard/educator/bookings', icon: Calendar },
      { label: 'Leads', href: '/dashboard/educator/leads', icon: Clock },
      { label: 'Earnings', href: '/dashboard/educator/earnings', icon: DollarSign },
      { label: 'Reviews', href: '/dashboard/educator/reviews', icon: Star },
      { label: 'Profile', href: '/dashboard/educator/profile', icon: Settings }
    ]}>
    <div className="container-app space-y-6">
      <DashboardHeader
        eyebrow={isLive ? 'Educator portal' : 'Application in review'}
        title={user?.name || 'Educator'}
        description={[educator?.title, `${educator?.years_experience || 0} years experience`, ratingSummary, `${formatUGX(educator?.hourly_rate_ugx || 0)}/hr`].filter(Boolean).join(' · ')}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard/educator' }, { label: TAB_LABELS[activeTab] }]}
        actions={educator?.status && <StatusBadge status={educator.status} size="md" />}
      />

      {actionError && (
        <Alert onDismiss={() => setActionError('')}>{actionError}</Alert>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {educator?.status === 'suspended' ? (
            <section className="bg-white rounded-card border border-rose-200 shadow-level-1 p-6 space-y-2" aria-labelledby="hold-heading">
              <h2 id="hold-heading" className="text-lg font-bold text-ink-900">Your profile is on hold</h2>
              <p className="text-sm text-ink-600">Learners can’t book you right now. {educator.verification_notes ? `Reason: ${educator.verification_notes}. ` : ''}Message us on WhatsApp to sort it out.</p>
              <a href="https://wa.me/256744024529" target="_blank" rel="noopener noreferrer" className="inline-flex px-4 py-2.5 min-h-[44px] items-center rounded-control bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold">WhatsApp iSkillLink</a>
            </section>
          ) : !isLive ? (
            <section className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-5" aria-labelledby="application-heading">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h2 id="application-heading" className="text-lg font-bold text-ink-900">
                    Your application: {progress.passed} of {progress.total} checks done
                  </h2>
                  <p className="text-sm text-ink-600 mt-1">Learners can book you as soon as all four checks pass. We’ll contact you on WhatsApp to arrange each one.</p>
                </div>
                <button onClick={() => navigate(`/educators/${educator?.id}`)} className="shrink-0 px-4 py-2.5 min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 text-xs font-bold text-ink-800">
                  Preview your public profile
                </button>
              </div>
              <ol className="space-y-3">
                {VERIFICATION_STEPS.map((step, index) => {
                  const passed = isStepPassed(educator?.verification, step);
                  const isNext = index === nextStepIndex;
                  return (
                    <li key={step.key} className={`flex items-start gap-3 p-3.5 rounded-card border ${isNext ? 'border-forest-200 bg-forest-50/60' : 'border-ink-200'}`}>
                      <span className={`mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${passed ? 'bg-forest-700 text-white' : isNext ? 'bg-white border-2 border-forest-700 text-forest-800' : 'bg-ink-100 text-ink-500'}`} aria-hidden="true">
                        {passed ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-ink-900">{step.label}</span>
                          <span className={`text-xs font-semibold ${passed ? 'text-forest-700' : isNext ? 'text-forest-800' : 'text-ink-500'}`}>{passed ? 'Done' : isNext ? 'Next' : 'Waiting'}</span>
                        </div>
                        <p className="text-[14px] text-ink-600">{step.applicantDetail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : (
            <StatRow stats={[
              { label: 'Students taught', value: educator?.total_students ?? 0, detail: 'Learners with a completed session', icon: User },
              { label: 'Upcoming sessions', value: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length, detail: 'Confirmed or awaiting your reply', icon: Calendar },
              { label: 'Paid out to you', value: formatUGX(paidOut), detail: heldPayout > 0 ? `${formatUGX(heldPayout)} still held in escrow` : 'Sent to your MoMo', icon: DollarSign },
              { label: 'Average rating', value: ratingLabel, detail: `From ${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`, icon: Star, accent: 'amber' }
            ]} />
          )}

          {/* Pending Bookings to Accept — only once learners can book this educator */}
          {isLive && (
          <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
            <SectionHeader title={pendingBookings.length > 0 ? `Waiting for your reply (${pendingBookings.length})` : 'Waiting for your reply'} action={<button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-forest-700 hover:text-forest-800 min-h-[44px]"
              >
                All bookings
              </button>} />

            <div className="space-y-3">
              {pendingBookings.length > 0 ? (
                pendingBookings.map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-card border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-ink-900 text-sm">{b.learnerUser?.name || 'A learner'} wants to learn {b.skill_name}</div>
                      <p className="text-xs text-ink-700 mt-1">
                        {formatShortDate(b.scheduled_date)} at {b.start_time} · {b.duration_hours} {b.duration_hours === 1 ? 'hour' : 'hours'} · you’d receive {formatUGX(b.educator_payout_ugx)}
                      </p>
                      {b.notes && <p className="text-xs text-ink-500 italic mt-0.5">"{b.notes}"</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                        className="px-4 py-2.5 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-level-1"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                        className="px-4 py-2.5 min-h-[44px] rounded-control bg-ink-50 hover:bg-ink-100 text-ink-700 font-bold text-xs border border-ink-200"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-ink-600 text-sm">Nothing to reply to. New booking requests show up here.</p>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">{bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}</h2>
            <p className="text-xs text-ink-600">Set progress as you go. Mark a session done after it happens — that’s when your payout is released.</p>
          </div>

          {bookings.length === 0 && (
            <EmptyState
              icon={<Calendar className="w-6 h-6" />}
              title="No bookings yet"
              description="When a learner books you, the request shows up here and on your overview."
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
                    <div className="text-xs text-ink-600 mt-1">
                      with <strong className="text-ink-900">{b.learnerUser?.name || 'a learner'}</strong>{b.learnerUser?.phone ? ` · ${b.learnerUser.phone}` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-ink-900">{formatUGX(b.educator_payout_ugx || b.total_amount_ugx * 0.9)}</div>
                    <div className="mt-1"><PaymentStatusBadge status={b.payment?.status || 'pending'} audience="educator" /></div>
                  </div>
                </div>

                {/* Progress only means something while the session is under way */}
                {(b.status === 'confirmed' || b.status === 'in_progress') && (
                <div className="bg-ink-50 p-3.5 rounded-card border border-ink-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-ink-700">Progress the learner sees</span>
                    <span className="font-bold text-forest-800">{b.milestone_progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => handleUpdateProgress(b.id, pct)}
                        aria-pressed={b.milestone_progress === pct}
                        className={`px-3 min-h-[44px] md:min-h-[40px] rounded-control text-xs font-bold transition border ${
                          b.milestone_progress === pct
                            ? 'bg-forest-700 text-white border-forest-700'
                            : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
                )}

                {/* Session Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-600">
                  <div><strong>When:</strong> {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  <div><strong>How:</strong> {FORMAT_LABELS[b.format] || b.format}</div>
                  <div><strong>Where:</strong> {b.location_or_link}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
                  {b.status === 'pending' && (
                    <>
                      <button onClick={() => handleUpdateBookingStatus(b.id, 'declined')} className="px-4 min-h-[44px] rounded-control bg-white hover:bg-ink-50 text-ink-700 font-bold text-xs border border-ink-200">Decline</button>
                      <button onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')} className="px-4 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs">Accept</button>
                    </>
                  )}
                  {(b.status === 'confirmed' || b.status === 'in_progress') && (
                    b.payment?.status === 'paid' ? (
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                        className="px-4 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Mark session done
                      </button>
                    ) : (
                      // Completing an unpaid session would leave nothing in escrow to release.
                      <span className="text-sm text-ink-600">Waiting for {b.learnerUser?.name?.split(' ')[0] || 'the learner'} to pay</span>
                    )
                  )}
                  {b.status === 'completed' && <span className="text-sm text-ink-600">Done{b.payment?.status === 'completed' ? ' · paid out' : ' · payout on its way'}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STUDENT LEADS TAB */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Open learner requests</h2>
            <p className="text-xs text-ink-500">Learners who described what they want to learn. Ones that match your trade are listed first — ask us and we’ll introduce you.</p>
          </div>

          {sortedLeads.length === 0 && (
            <EmptyState
              icon={<Clock className="w-6 h-6" />}
              title="No open requests right now"
              description="When a learner posts a request, it shows up here. Requests in your trade are listed first."
            />
          )}

          <div className="space-y-4">
            {sortedLeads.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-card border border-ink-200 bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-ink-900 text-base">{req.skill_name}</h3>
                      {matchesTrade(req) && <span className="text-[12px] font-semibold px-2 py-0.5 rounded-pill bg-forest-50 text-forest-800 border border-forest-200">Matches your trade</span>}
                    </div>
                    <p className="text-xs text-ink-600 mt-1">{req.learning_goal}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-forest-800">{formatUGX(req.budget_ugx)}</div>
                    <div className="text-[12px] text-ink-500">Learner’s budget</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                  <div><strong>Learner:</strong> {req.learner_name}</div>
                  <div><strong>Location:</strong> {req.location}</div>
                  <div><strong>Format:</strong> <span className="capitalize">{req.format_preference}</span></div>
                  <div><strong>Schedule:</strong> {req.preferred_schedule}</div>
                </div>
                <div className="flex justify-end">
                  <a
                    href={introductionLink(req)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-control border border-forest-700 text-forest-800 hover:bg-forest-50 text-xs font-bold"
                  >
                    Ask us to introduce you
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EARNINGS & PAYOUTS TAB */}
      {activeTab === 'earnings' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Earnings</h2>
            <p className="text-xs text-ink-500">Learners pay into escrow when they book. After the session is done, we send 90% to your MoMo and keep 10%.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-card bg-ink-50 border border-ink-200">
              <div className="text-xs text-ink-500 font-semibold">Held in escrow</div>
              <div className="text-xl font-bold text-ink-900 mt-1">{formatUGX(heldPayout)}</div>
              <div className="text-[12px] text-ink-500 mt-0.5">Released after each session is done</div>
            </div>
            <div className="p-4 rounded-card bg-forest-50 border border-forest-200">
              <div className="text-xs text-forest-800 font-semibold">Paid out to you</div>
              <div className="text-xl font-bold text-forest-900 mt-1">{formatUGX(paidOut)}</div>
              <div className="text-[12px] text-forest-800 mt-0.5">Sent to your MoMo</div>
            </div>
            <div className="p-4 rounded-card bg-ink-50 border border-ink-200">
              <div className="text-xs text-ink-500 font-semibold">iSkillLink fee (10%)</div>
              <div className="text-xl font-bold text-ink-700 mt-1">{formatUGX(platformFees)}</div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 text-ink-700 uppercase font-bold border-y border-ink-200">
                <tr>
                  <th className="p-3">Payment Ref</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Platform Fee (10%)</th>
                  <th className="p-3">Your Net Share (90%)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 text-ink-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-ink-50/50">
                    <td className="p-3 font-mono font-semibold text-ink-900">{p.payment_reference}</td>
                    <td className="p-3 font-bold text-ink-900">{formatUGX(p.amount_ugx)}</td>
                    <td className="p-3 text-ink-500">{formatUGX(p.platform_fee_ugx)}</td>
                    <td className="p-3 font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="p-3">
                      <PaymentStatusBadge status={p.status} audience="educator" />
                    </td>
                    <td className="p-3 text-ink-500">{formatShortDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 pt-2">
            {payments.map(p => (
              <div key={p.id} className="p-4 rounded-card border border-ink-200 bg-white shadow-level-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-ink-900">{p.payment_reference}</span>
                  <PaymentStatusBadge status={p.status} audience="educator" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-500">Gross:</span> <span className="font-bold">{formatUGX(p.amount_ugx)}</span></div>
                  <div><span className="text-ink-500">Net:</span> <span className="font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</span></div>
                  <div><span className="text-ink-500">Fee:</span> <span className="text-ink-600">{formatUGX(p.platform_fee_ugx)}</span></div>
                  <div><span className="text-ink-500">Date:</span> <span className="text-ink-600">{formatShortDate(p.created_at)}</span></div>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div className="text-center py-8 text-xs text-ink-500">No payments yet. They appear here when a learner books you.</div>}
          </div>
        </div>
      )}

      {/* REVIEWS & FEEDBACK TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Reviews from learners</h2>
            <p className="text-xs text-ink-600">Shown on your public profile. A short, kind reply goes a long way.</p>
          </div>

          {reviews.length === 0 && (
            <EmptyState
              icon={<Star className="w-6 h-6" />}
              title="No reviews yet"
              description="Learners can review you after a session is marked done."
            />
          )}

          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.id}
                className="p-5 rounded-card border border-ink-200 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink-900 text-sm block">{r.learner_name}</span>
                    <span className="text-[12px] text-ink-600">{formatShortDate(r.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-ink-700 leading-relaxed bg-ink-50 p-3 rounded-lg border border-ink-100">
                  "{r.comment}"
                </p>

                {r.educator_reply ? (
                  <div className="ml-4 pl-3 border-l-2 border-forest-600 bg-forest-50/40 p-2.5 rounded-r-lg text-xs">
                    <span className="font-semibold text-forest-950 block text-[12px]">Your reply</span>
                    <p className="text-ink-700 mt-0.5">{r.educator_reply}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <label htmlFor={`reply-${r.id}`} className="sr-only">Reply to {r.learner_name}</label>
                    <input
                      id={`reply-${r.id}`}
                      type="text"
                      value={replyText[r.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                      placeholder="Reply publicly — thank them, or answer a concern"
                      className="flex-1 text-base sm:text-sm px-3 min-h-[44px] rounded-control border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700"
                    />
                    <button
                      onClick={() => handleReplyReview(r.id)}
                      disabled={!replyText[r.id]?.trim()}
                      className="px-4 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB — what learners see on the public profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6 max-w-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-100">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar_url} name={user?.name} className="w-20 h-20 rounded-card" />
              <div className="space-y-1.5">
                <div className={`text-sm font-semibold ${isLive ? 'text-forest-700' : 'text-ink-600'}`}>{isLive ? 'Verified educator' : 'Application in review'}</div>
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(true)}
                  className="px-3.5 min-h-[44px] md:min-h-[40px] rounded-control border border-ink-200 bg-white text-ink-800 text-xs font-bold hover:bg-ink-50 inline-flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                  {user?.avatar_url ? 'Change photo' : 'Add a photo'}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => navigate(`/educators/${educator?.id}`)} className="self-start sm:self-auto px-4 min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 text-xs font-bold text-ink-800">
              View public profile
            </button>
          </div>

          {profileMessage && (
            <Alert tone={profileMessage.tone} onDismiss={() => setProfileMessage(null)}>{profileMessage.text}</Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="What you teach (your title)" htmlFor="edu-title" required>
              <Input id="edu-title" value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} required />
            </Field>
            <Field label="Your rate per hour (UGX)" htmlFor="edu-rate" required hint="Learners see this before they book.">
              <Input
                id="edu-rate"
                type="number"
                inputMode="numeric"
                min={5000}
                step={1000}
                value={profileForm.hourly_rate_ugx || ''}
                onChange={(e) => setProfileForm({ ...profileForm, hourly_rate_ugx: Number(e.target.value) })}
                required
              />
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
      )}

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
    </DashboardShell>
  );
};
