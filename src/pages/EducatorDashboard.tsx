import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Educator, Booking, Review, LearnerRequest, Payment, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate } from '../utils/formatters';
import { StatusBadge } from '../components/ui/Badge';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  GraduationCap, Calendar, Clock, DollarSign, Star,
  MessageSquare, Settings, ShieldCheck, CheckCircle2,
  XCircle, ArrowRight, UserCheck, Wrench, FileText, Send, Sparkles,
  Camera, User
} from 'lucide-react';

interface EducatorDashboardProps {
  onViewProfileModal?: (educator: Educator) => void;
}

export const EducatorDashboard: React.FC<EducatorDashboardProps> = () => {
  const { user, educatorProfile } = useAuth();
  const educatorId = educatorProfile?.id || 'edu-1';
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

  const loadDashboardData = async () => {
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
      await api.updateBookingStatus(bookingId, status);
      loadDashboardData();
    } catch (e) {
      console.error('Failed to update booking status:', e);
    }
  };

  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleUpdateProgress = useCallback((bookingId: string, progress: number) => {
    if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
    progressTimeoutRef.current = setTimeout(async () => {
      try {
        await api.updateBookingProgress(bookingId, progress);
        loadDashboardData();
      } catch (e) {
        console.error('Failed to update progress:', e);
      }
    }, 300);
  }, []);

  const handleReplyReview = async (reviewId: string) => {
    const text = replyText[reviewId];
    if (!text) return;
    try {
      await api.replyToReview(reviewId, text);
      loadDashboardData();
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    } catch (e) {
      console.error('Error submitting reply:', e);
    }
  };

  const totalEarningsGross = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_ugx, 0);

  const totalNetPayout = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.payout_amount_ugx, 0);

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="container-app py-6 space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs">
        <ol className="flex items-center gap-1.5 text-ink-500">
          <li><a href="/" onClick={(e)=>{e.preventDefault(); navigate('/');}} className="hover:text-forest-700 focus-visible:ring-2 focus-visible:ring-forest-700 rounded">Home</a></li>
          <li className="text-ink-400" aria-hidden="true">›</li>
          <li><a href="/dashboard/educator" onClick={(e)=>{e.preventDefault(); navigate('/dashboard/educator');}} className="hover:text-forest-700 focus-visible:ring-2 focus-visible:ring-forest-700 rounded">Dashboard</a></li>
          <li className="text-ink-400" aria-hidden="true">›</li>
          <li className="text-ink-900 font-semibold capitalize">{activeTab}</li>
        </ol>
      </nav>
      {/* Top Banner */}
      <div className="bg-ink-950 text-white p-6 sm:p-8 rounded-3xl border border-ink-800 shadow-level-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-card object-cover border-2 border-emerald-500 shadow"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-600 text-white shadow hover:bg-forest-500 transition"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Educator Portal
              </span>
              <span className="text-xs text-ink-400">{educator?.location}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              {user?.name} ({educator?.title})
            </h1>
            <div className="flex items-center gap-3 text-xs text-ink-300 mt-1">
              <span>{educator?.years_experience} Yrs Craft</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {educator?.rating || 4.9} ({educator?.total_reviews || 0} reviews)
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Rate: {formatUGX(educator?.hourly_rate_ugx || 35000)}/hr</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="px-3.5 py-2 bg-ink-900 hover:bg-slate-700 text-white border border-ink-700 rounded-card text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Photo</span>
          </button>
          <span className="px-3 py-1.5 rounded-card text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Status: {educator?.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation Tabs — Phase 4: snap, 44px, thumb-reach */}
      <div className="bg-white rounded-card border border-ink-200 p-2 shadow-level-1 overflow-x-auto flex space-x-1 no-scrollbar snap-x-mandatory" role="tablist" aria-label="Educator dashboard sections">
        {[
          { id: 'overview', label: 'Overview', icon: GraduationCap },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
          { id: 'leads', label: `Student Leads (${openRequests.length})`, icon: Clock },
          { id: 'earnings', label: `Earnings & Payouts`, icon: DollarSign },
          { id: 'reviews', label: `Student Reviews (${reviews.length})`, icon: Star },
          { id: 'profile', label: 'Workshop & Rates', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as any)}
              className={`snap-start-item px-4 py-2.5 min-h-[44px] rounded-card text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-forest-700 text-white shadow'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Total Students Mentored</div>
              <div className="text-2xl font-bold text-ink-900">{educator?.total_students || 31}</div>
              <div className="text-[11px] text-forest-700 font-medium">Hands-on apprentices</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Active Bookings</div>
              <div className="text-2xl font-bold text-ink-900">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
              </div>
              <div className="text-[11px] text-blue-700 font-medium">Upcoming training sessions</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Net Payouts (UGX)</div>
              <div className="text-xl font-bold text-ink-900">{formatUGX(totalNetPayout)}</div>
              <div className="text-[11px] text-forest-700 font-medium">Direct Mobile Money disbursal</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Average Rating</div>
              <div className="text-2xl font-bold text-ink-900">{educator?.rating || 4.9}★</div>
              <div className="text-[11px] text-amber-700 font-medium">From {reviews.length} reviews</div>
            </div>
          </div>

          {/* Pending Bookings to Accept */}
          <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Pending Learner Requests
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-forest-700 hover:text-forest-800"
              >
                View all bookings
              </button>
            </div>

            <div className="space-y-3">
              {bookings.filter(b => b.status === 'pending').length > 0 ? (
                bookings.filter(b => b.status === 'pending').map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-card border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-sm">{b.skill_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          Awaiting Your Approval
                        </span>
                      </div>
                      <p className="text-xs text-ink-700 mt-1">
                        Requested on {formatShortDate(b.scheduled_date)} at {b.start_time} ({b.duration_hours} hrs) • {formatUGX(b.total_amount_ugx)}
                      </p>
                      {b.notes && <p className="text-xs text-ink-500 italic mt-0.5">"{b.notes}"</p>}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                        className="px-4 py-2.5 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-level-1"
                      >
                        Accept & Confirm
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
                <div className="text-center py-6 text-ink-500 text-xs">
                  No pending booking requests at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Manage Practical Training Sessions</h2>
            <p className="text-xs text-ink-500">Update session status and mark progress milestones.</p>
          </div>

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
                      Learner: <strong className="text-ink-900">{b.learnerUser?.name || 'Registered Student'}</strong> {b.learnerUser?.phone ? `(${b.learnerUser.phone})` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-ink-900">{formatUGX(b.educator_payout_ugx || b.total_amount_ugx * 0.9)}</div>
                    <div className="text-[11px] text-ink-500">Net Educator Share (90%)</div>
                  </div>
                </div>

                {/* Milestone Progress Controller */}
                <div className="bg-ink-50 p-3.5 rounded-card border border-ink-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-ink-700">Practical Milestone Progress:</span>
                    <span className="font-bold text-forest-800">{b.milestone_progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => handleUpdateProgress(b.id, pct)}
                        className={`px-3 py-1 rounded text-xs font-bold transition border ${
                          b.milestone_progress === pct
                            ? 'bg-forest-700 text-white border-emerald-700'
                            : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-600">
                  <div><strong>Date:</strong> {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  <div><strong>Format:</strong> <span className="capitalize">{b.format}</span></div>
                  <div><strong>Location:</strong> {b.location_or_link}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-100">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                      className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-level-1 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Practical Session</span>
                    </button>
                  )}
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
            <h2 className="text-base font-bold text-ink-900">Open Learner Inquiries in Kampala</h2>
            <p className="text-xs text-ink-500">Learners seeking mentoring in your practical trade.</p>
          </div>

          <div className="space-y-4">
            {openRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-card border border-ink-200 bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-ink-900 text-base">{req.skill_name}</h3>
                    <p className="text-xs text-ink-600 mt-1">{req.learning_goal}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-forest-800">{formatUGX(req.budget_ugx)}</div>
                    <div className="text-[11px] text-ink-500">Allocated Budget</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                  <div><strong>Learner:</strong> {req.learner_name}</div>
                  <div><strong>Location:</strong> {req.location}</div>
                  <div><strong>Format:</strong> <span className="capitalize">{req.format_preference}</span></div>
                  <div><strong>Schedule:</strong> {req.preferred_schedule}</div>
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
            <h2 className="text-base font-bold text-ink-900">Earnings & Escrow Payout Breakdown</h2>
            <p className="text-xs text-ink-500">iSkillLink retains 10% platform facilitation fee and releases 90% net payout via Mobile Money upon completion.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-card bg-ink-50 border border-ink-200">
              <div className="text-xs text-ink-500 font-semibold">Total Gross Bookings</div>
              <div className="text-xl font-bold text-ink-900 mt-1">{formatUGX(totalEarningsGross)}</div>
            </div>
            <div className="p-4 rounded-card bg-ink-50 border border-ink-200">
              <div className="text-xs text-ink-500 font-semibold">Platform Fee (10%)</div>
              <div className="text-xl font-bold text-ink-700 mt-1">{formatUGX(Math.round(totalEarningsGross * 0.10))}</div>
            </div>
            <div className="p-4 rounded-card bg-forest-50 border border-forest-200">
              <div className="text-xs text-forest-800 font-semibold">Net Educator Payouts (90%)</div>
              <div className="text-xl font-bold text-emerald-950 mt-1">{formatUGX(totalNetPayout)}</div>
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
                  <th className="p-3">Escrow Payout Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-ink-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-ink-50/50">
                    <td className="p-3 font-mono font-semibold text-ink-900">{p.payment_reference}</td>
                    <td className="p-3 font-bold text-ink-900">{formatUGX(p.amount_ugx)}</td>
                    <td className="p-3 text-ink-500">{formatUGX(p.platform_fee_ugx)}</td>
                    <td className="p-3 font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="p-3">
                      <StatusBadge status={p.status} />
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
                  <StatusBadge status={p.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-500">Gross:</span> <span className="font-bold">{formatUGX(p.amount_ugx)}</span></div>
                  <div><span className="text-ink-500">Net:</span> <span className="font-bold text-forest-800">{formatUGX(p.payout_amount_ugx)}</span></div>
                  <div><span className="text-ink-500">Fee:</span> <span className="text-ink-600">{formatUGX(p.platform_fee_ugx)}</span></div>
                  <div><span className="text-ink-500">Date:</span> <span className="text-ink-600">{formatShortDate(p.created_at)}</span></div>
                </div>
              </div>
            ))}
            {payments.length === 0 && <div className="text-center py-8 text-xs text-ink-400">No earnings yet.</div>}
          </div>
        </div>
      )}

      {/* REVIEWS & FEEDBACK TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-ink-900">Apprentice Ratings & Reviews</h2>
            <p className="text-xs text-ink-500">Public ratings left by students who completed practical sessions with you.</p>
          </div>

          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.id}
                className="p-5 rounded-card border border-ink-200 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-ink-900 text-sm block">{r.learner_name}</span>
                    <span className="text-[11px] text-ink-400">{formatShortDate(r.created_at)}</span>
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
                    <span className="font-semibold text-emerald-950 block text-[11px]">Your Published Reply:</span>
                    <p className="text-ink-700 mt-0.5">{r.educator_reply}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText[r.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                      placeholder="Write a public reply to this student review..."
                      className="flex-1 text-xs p-2 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700"
                    />
                    <button
                      onClick={() => handleReplyReview(r.id)}
                      className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs"
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

      {/* PROFILE & SETTINGS TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-ink-100">
            <div>
              <h2 className="text-base font-bold text-ink-900">Educator Workshop & Rate Settings</h2>
              <p className="text-xs text-ink-500">Manage your publicly displayed rates in UGX and workshop tooling.</p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-3.5 py-2 rounded-card bg-forest-50 text-forest-800 border border-forest-200 text-xs font-bold hover:bg-forest-100 transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Update Workshop Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                alt={user?.name}
                className="w-20 h-20 rounded-card object-cover border-2 border-emerald-500 shadow-level-1"
              />
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-forest-700 text-white shadow hover:bg-forest-800 transition"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="text-sm font-bold text-ink-900">{user?.name}</div>
              <div className="text-xs text-ink-500">{educator?.title}</div>
              <div className="text-[11px] text-forest-700 font-semibold mt-0.5">Verified Instructor • {educator?.location}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-ink-600 font-semibold mb-1">Professional Title</label>
              <input type="text" value={educator?.title} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-800" />
            </div>

            <div>
              <label className="block text-ink-600 font-semibold mb-1">Standard Hourly Rate (UGX)</label>
              <input type="text" value={formatUGX(educator?.hourly_rate_ugx || 35000)} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-800 font-bold" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-ink-600 font-semibold mb-1">Workshop Tools & Equipment</label>
              <textarea rows={2} value={educator?.equipment_provided} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-800" />
            </div>

            <div>
              <label className="block text-ink-600 font-semibold mb-1">Base Workshop Location</label>
              <input type="text" value={educator?.location} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-800" />
            </div>

            <div>
              <label className="block text-ink-600 font-semibold mb-1">Service Radius</label>
              <input type="text" value={educator?.service_area} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-800" />
            </div>
          </div>
        </div>
      )}

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};
