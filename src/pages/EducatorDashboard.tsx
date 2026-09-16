import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Educator, Booking, Review, LearnerRequest, Payment, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate, getStatusBadgeClass } from '../utils/formatters';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
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

  const handleUpdateProgress = async (bookingId: string, progress: number) => {
    try {
      await api.updateBookingProgress(bookingId, progress);
      loadDashboardData();
    } catch (e) {
      console.error('Failed to update progress:', e);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-500 transition"
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
              <span className="text-xs text-slate-400">{educator?.location}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {user?.name} ({educator?.title})
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
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
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>Update Photo</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            Status: {educator?.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm overflow-x-auto flex space-x-1">
        {[
          { id: 'overview', label: 'Overview', icon: GraduationCap },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
          { id: 'leads', label: `Student Leads (${openRequests.length})`, icon: Clock },
          { id: 'earnings', label: `Earnings & Payouts`, icon: DollarSign },
          { id: 'reviews', label: `Student Reviews (${reviews.length})`, icon: Star },
          { id: 'profile', label: 'Workshop & Rates', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Total Students Mentored</div>
              <div className="text-2xl font-black text-gray-900">{educator?.total_students || 31}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Hands-on apprentices</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Active Bookings</div>
              <div className="text-2xl font-black text-gray-900">
                {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
              </div>
              <div className="text-[11px] text-blue-700 font-medium">Upcoming training sessions</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Net Payouts (UGX)</div>
              <div className="text-xl font-black text-gray-900">{formatUGX(totalNetPayout)}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Direct Mobile Money disbursal</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Average Rating</div>
              <div className="text-2xl font-black text-gray-900">{educator?.rating || 4.9}★</div>
              <div className="text-[11px] text-amber-700 font-medium">From {reviews.length} reviews</div>
            </div>
          </div>

          {/* Pending Bookings to Accept */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Pending Learner Requests
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                View all bookings
              </button>
            </div>

            <div className="space-y-3">
              {bookings.filter(b => b.status === 'pending').length > 0 ? (
                bookings.filter(b => b.status === 'pending').map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{b.skill_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          Awaiting Your Approval
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 mt-1">
                        Requested on {formatShortDate(b.scheduled_date)} at {b.start_time} ({b.duration_hours} hrs) • {formatUGX(b.total_amount_ugx)}
                      </p>
                      {b.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{b.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                        className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm"
                      >
                        Accept & Confirm
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(b.id, 'declined')}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  No pending booking requests at the moment.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Manage Practical Training Sessions</h2>
            <p className="text-xs text-gray-500">Update session status and mark progress milestones.</p>
          </div>

          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b.id}
                className="p-5 rounded-xl border border-gray-200 bg-white space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{b.skill_name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadgeClass(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Learner: <strong className="text-gray-900">{b.learnerUser?.name || 'Registered Student'}</strong> {b.learnerUser?.phone ? `(${b.learnerUser.phone})` : ''}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-gray-900">{formatUGX(b.educator_payout_ugx || b.total_amount_ugx * 0.9)}</div>
                    <div className="text-[11px] text-gray-500">Net Educator Share (90%)</div>
                  </div>
                </div>

                {/* Milestone Progress Controller */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">Practical Milestone Progress:</span>
                    <span className="font-bold text-emerald-800">{b.milestone_progress}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[0, 25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => handleUpdateProgress(b.id, pct)}
                        className={`px-3 py-1 rounded text-xs font-bold transition border ${
                          b.milestone_progress === pct
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Session Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
                  <div><strong>Date:</strong> {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  <div><strong>Format:</strong> <span className="capitalize">{b.format}</span></div>
                  <div><strong>Location:</strong> {b.location_or_link}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Open Learner Inquiries in Kampala</h2>
            <p className="text-xs text-gray-500">Learners seeking mentoring in your practical trade.</p>
          </div>

          <div className="space-y-4">
            {openRequests.map(req => (
              <div
                key={req.id}
                className="p-5 rounded-xl border border-gray-200 bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{req.skill_name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{req.learning_goal}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-800">{formatUGX(req.budget_ugx)}</div>
                    <div className="text-[11px] text-gray-500">Allocated Budget</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-lg text-gray-600">
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Earnings & Escrow Payout Breakdown</h2>
            <p className="text-xs text-gray-500">iSkillLink retains 10% platform facilitation fee and releases 90% net payout via Mobile Money upon completion.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-xs text-gray-500 font-semibold">Total Gross Bookings</div>
              <div className="text-xl font-black text-gray-900 mt-1">{formatUGX(totalEarningsGross)}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="text-xs text-gray-500 font-semibold">Platform Fee (10%)</div>
              <div className="text-xl font-black text-slate-700 mt-1">{formatUGX(Math.round(totalEarningsGross * 0.10))}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-xs text-emerald-800 font-semibold">Net Educator Payouts (90%)</div>
              <div className="text-xl font-black text-emerald-950 mt-1">{formatUGX(totalNetPayout)}</div>
            </div>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-y border-gray-200">
                <tr>
                  <th className="p-3">Payment Ref</th>
                  <th className="p-3">Gross Amount</th>
                  <th className="p-3">Platform Fee (10%)</th>
                  <th className="p-3">Your Net Share (90%)</th>
                  <th className="p-3">Escrow Payout Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-semibold text-gray-900">{p.payment_reference}</td>
                    <td className="p-3 font-bold text-gray-900">{formatUGX(p.amount_ugx)}</td>
                    <td className="p-3 text-gray-500">{formatUGX(p.platform_fee_ugx)}</td>
                    <td className="p-3 font-bold text-emerald-800">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{formatShortDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEWS & FEEDBACK TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Apprentice Ratings & Reviews</h2>
            <p className="text-xs text-gray-500">Public ratings left by students who completed practical sessions with you.</p>
          </div>

          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.id}
                className="p-5 rounded-xl border border-gray-200 bg-white space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{r.learner_name}</span>
                    <span className="text-[11px] text-gray-400">{formatShortDate(r.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  "{r.comment}"
                </p>

                {r.educator_reply ? (
                  <div className="ml-4 pl-3 border-l-2 border-emerald-600 bg-emerald-50/40 p-2.5 rounded-r-lg text-xs">
                    <span className="font-semibold text-emerald-950 block text-[11px]">Your Published Reply:</span>
                    <p className="text-gray-700 mt-0.5">{r.educator_reply}</p>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText[r.id] || ''}
                      onChange={(e) => setReplyText({ ...replyText, [r.id]: e.target.value })}
                      placeholder="Write a public reply to this student review..."
                      className="flex-1 text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <button
                      onClick={() => handleReplyReview(r.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Educator Workshop & Rate Settings</h2>
              <p className="text-xs text-gray-500">Manage your publicly displayed rates in UGX and workshop tooling.</p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
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
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
              />
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-700 text-white shadow hover:bg-emerald-800 transition"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{educator?.title}</div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Verified Instructor • {educator?.location}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Professional Title</label>
              <input type="text" value={educator?.title} disabled className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-800" />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Standard Hourly Rate (UGX)</label>
              <input type="text" value={formatUGX(educator?.hourly_rate_ugx || 35000)} disabled className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-800 font-bold" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-gray-600 font-semibold mb-1">Workshop Tools & Equipment</label>
              <textarea rows={2} value={educator?.equipment_provided} disabled className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-800" />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Base Workshop Location</label>
              <input type="text" value={educator?.location} disabled className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-800" />
            </div>

            <div>
              <label className="block text-gray-600 font-semibold mb-1">Service Radius</label>
              <input type="text" value={educator?.service_area} disabled className="w-full p-2.5 rounded-lg border bg-gray-50 text-gray-800" />
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
