import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking, LearnerRequest, Payment, Review, Message, Educator } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX, formatShortDate, getStatusBadgeClass } from '../utils/formatters';
import { SimulatePaymentModal } from '../components/SimulatePaymentModal';
import { ReviewModal } from '../components/ReviewModal';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import {
  BookOpen, Calendar, Clock, CreditCard, MessageSquare,
  Award, Star, User, Settings, CheckCircle2, AlertCircle,
  PlusCircle, ArrowRight, ShieldCheck, ExternalLink, Send,
  Camera
} from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';

interface LearnerDashboardProps {
  onOpenSkillRequest: () => void;
  onViewEducator: (educator: Educator) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onOpenSkillRequest,
  onViewEducator
}) => {
  const { user, learnerProfile } = useAuth();
  const learnerId = learnerProfile?.id || (user?.role === 'learner' ? 'lrn-1' : 'lrn-1');
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
  const [selectedRecipientId, setSelectedRecipientId] = useState('usr-edu-1');
  const [loading, setLoading] = useState(true);
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
        api.getMessages(user?.id || 'usr-learner-1')
      ]);

      setRequests(reqs);
      setBookings(bks);
      setPayments(pays);
      setMessages(msgs);
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
    if (!newMessageText.trim() || !user) return;

    try {
      const msg = await api.sendMessage(user.id, selectedRecipientId, newMessageText);
      setMessages(prev => [...prev, msg]);
      setNewMessageText('');
    } catch (e) {
      console.error('Failed to send message:', e);
    }
  };

  const handleMarkSessionComplete = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'completed');
      loadLearnerData();
    } catch (e) {
      console.error('Error completing session:', e);
    }
  };

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedSessionsCount = bookings.filter(b => b.status === 'completed').length;
  const totalInvestedUGX = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_ugx, 0);

  return (
    <div className="container-app py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <nav aria-label="Breadcrumb" className="text-xs">
            <ol className="flex items-center gap-1.5 text-ink-500">
              <li><a href="/" onClick={(e)=>{e.preventDefault(); navigate('/');}} className="hover:text-forest-700 font-medium">Home</a></li>
              <li className="text-ink-400">›</li>
              <li><a href="/dashboard/learner" onClick={(e)=>{e.preventDefault(); navigate('/dashboard/learner');}} className="hover:text-forest-700 font-medium">Dashboard</a></li>
              <li className="text-ink-400">›</li>
              <li className="text-ink-900 font-semibold capitalize">{activeTab}</li>
            </ol>
          </nav>
        </div>
      </div>
      {/* Top Banner with Persona Profile */}
      <div className="bg-ink-950 text-white p-6 sm:p-8 rounded-3xl border border-ink-800 shadow-level-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
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
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                Learner Portal
              </span>
              <span className="text-xs text-ink-400">{user?.location || 'Mbarara City, Uganda'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-ink-300 mt-0.5 max-w-md">
              {learnerProfile?.bio || 'Track your practical apprenticeships, manage verified bookings, and communicate with educators.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowPhotoModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-card bg-ink-900 hover:bg-slate-700 text-white font-semibold text-xs transition border border-ink-700 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Update Photo</span>
          </button>
          <button
            onClick={onOpenSkillRequest}
            className="w-full sm:w-auto px-5 py-2.5 rounded-card bg-emerald-600 hover:bg-forest-500 text-white font-bold text-xs transition shadow flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request New Skill</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-card border border-ink-200 p-2 shadow-level-1 overflow-x-auto flex space-x-1">
        {[
          { id: 'overview', label: 'Overview', icon: BookOpen },
          { id: 'requests', label: `My Requests (${requests.length})`, icon: Clock },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Calendar },
          { id: 'payments', label: `Payments & Escrow (${payments.length})`, icon: CreditCard },
          { id: 'messages', label: `Messages`, icon: MessageSquare },
          { id: 'profile', label: 'Profile Settings', icon: User }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-card text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-forest-700 text-white shadow'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Active Bookings</div>
              <div className="text-2xl font-bold text-ink-900">{activeBookingsCount}</div>
              <div className="text-[11px] text-forest-700 font-medium">Scheduled & in progress</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Completed Sessions</div>
              <div className="text-2xl font-bold text-ink-900">{completedSessionsCount}</div>
              <div className="text-[11px] text-forest-700 font-medium">Verified practical milestones</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Active Skill Requests</div>
              <div className="text-2xl font-bold text-ink-900">{requests.length}</div>
              <div className="text-[11px] text-blue-700 font-medium">In matching pool</div>
            </div>

            <div className="p-5 rounded-card bg-white border border-ink-200 shadow-level-1 space-y-1">
              <div className="text-xs text-ink-500 font-semibold">Total Escrow Volume</div>
              <div className="text-xl font-bold text-ink-900">{formatUGX(totalInvestedUGX)}</div>
              <div className="text-[11px] text-forest-700 font-medium">Protected by iSkillLink Escrow</div>
            </div>
          </div>

          {/* Upcoming Sessions Section */}
          <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Upcoming & Active Sessions
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-forest-700 hover:text-forest-800"
              >
                View all bookings
              </button>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 3).map(b => (
                  <div
                    key={b.id}
                    className="p-4 rounded-card border border-ink-200 bg-ink-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-900 text-sm">{b.skill_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadgeClass(b.status)}`}>
                          {b.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-ink-500 flex flex-wrap items-center gap-3 mt-1">
                        <span>Educator: <strong className="text-ink-800">{b.educator?.user?.name || 'Verified Educator'}</strong></span>
                        <span>•</span>
                        <span>{formatShortDate(b.scheduled_date)} at {b.start_time}</span>
                        <span>•</span>
                        <span>{b.duration_hours} hrs</span>
                        <span>•</span>
                        <span className="capitalize">{b.format}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => setPaymentModalBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                        >
                          Deposit to Escrow
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleMarkSessionComplete(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs"
                        >
                          Mark Session Done
                        </button>
                      )}
                      {b.status === 'completed' && !b.review && (
                        <button
                          onClick={() => setReviewModalBooking(b)}
                          className="px-3 py-1.5 rounded-lg bg-ink-950 hover:bg-ink-900 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>Leave Review</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar className="w-6 h-6" />}
                title="No active bookings yet"
                description="Browse verified educators to book your first practical learning session and start your hands-on journey."
                action={<button onClick={onOpenSkillRequest} className="px-5 py-2.5 rounded-card bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Find an Educator</button>}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900">Submitted Skill Requests</h2>
              <p className="text-xs text-ink-500">Custom requests evaluated by our rule-based matching algorithm.</p>
            </div>
            <button
              onClick={onOpenSkillRequest}
              className="px-4 py-2 rounded-card bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Request</span>
            </button>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <EmptyState
                icon={<Clock className="w-6 h-6" />}
                title="No skill requests yet"
                description="You haven't submitted any custom learning requests. Tell us what practical skill you want to master and we'll match you with a verified educator."
                action={<button onClick={onOpenSkillRequest} className="px-5 py-2.5 rounded-card bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">Submit Your First Request</button>}
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
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-ink-50 text-ink-600">
                          {req.skill_level}
                        </span>
                      </div>
                      <p className="text-xs text-ink-600 mt-1">{req.learning_goal}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-ink-900">{formatUGX(req.budget_ugx)}</div>
                      <div className="text-[11px] text-ink-500 font-medium">Budget Allocation</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                    <div><strong>Format:</strong> <span className="capitalize">{req.format_preference}</span></div>
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
            <h2 className="text-base font-bold text-ink-900">All Scheduled Learning Bookings</h2>
            <p className="text-xs text-ink-500">Track milestones, payment status, and completion records.</p>
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadgeClass(b.status)}`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-ink-600 mt-1">
                      Mentor: <strong className="text-ink-900">{b.educator?.user?.name || 'Verified Educator'}</strong> {b.educator?.title ? `(${b.educator.title})` : ''}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-ink-900">{formatUGX(b.total_amount_ugx)}</div>
                    <div className="text-[11px] text-forest-700 font-semibold">
                      {b.payment?.status === 'paid' ? 'Paid in Escrow' : b.payment?.status === 'completed' ? 'Disbursed on Completion' : 'Payment Pending'}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-ink-600">
                    <span>Practical Milestone Progress:</span>
                    <span className="font-bold">{b.milestone_progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ink-50 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${b.milestone_progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-ink-50 p-3 rounded-lg text-ink-600">
                  <div><strong>Date & Time:</strong> {formatShortDate(b.scheduled_date)} at {b.start_time}</div>
                  <div><strong>Format:</strong> <span className="capitalize">{b.format}</span></div>
                  <div><strong>Location:</strong> {b.location_or_link}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => setPaymentModalBooking(b)}
                      className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-level-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Deposit via Mobile Money</span>
                    </button>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleMarkSessionComplete(b.id)}
                      className="px-4 py-2 rounded-lg bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-level-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Session Completed</span>
                    </button>
                  )}

                  {b.status === 'completed' && !b.review && (
                    <button
                      onClick={() => setReviewModalBooking(b)}
                      className="px-4 py-2 rounded-lg bg-ink-950 hover:bg-ink-900 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>Write Review</span>
                    </button>
                  )}
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
            <h2 className="text-base font-bold text-ink-900">Escrow Payments & Transactions Ledger</h2>
            <p className="text-xs text-ink-500">Every shilling is held safely in escrow until your training is completed.</p>
          </div>

          {payments.length === 0 ? (
            <EmptyState
              icon={<CreditCard className="w-6 h-6" />}
              title="No escrow payments yet"
              description="Your Mobile Money escrow ledger will appear here once you book a practical session. Funds are held safely until milestone completion."
              action={<button onClick={() => setActiveTab('bookings')} className="px-5 py-2.5 rounded-card bg-forest-700 text-white text-xs font-bold hover:bg-forest-800">View Bookings</button>}
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
                      <th className="p-3">Escrow Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-ink-700">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-ink-50/50">
                        <td className="p-3 font-mono font-semibold text-ink-900">{p.payment_reference}</td>
                        <td className="p-3">
                          Booking #{p.booking_id}
                        </td>
                        <td className="p-3 font-bold text-ink-900">{formatUGX(p.amount_ugx)}</td>
                        <td className="p-3 uppercase font-semibold text-forest-800">{p.method.replace('_', ' ')}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(p.status)}`}>
                            {p.status.replace('_', ' ')}
                          </span>
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
                      <span className={`px-2 py-0.5 rounded border font-bold capitalize text-[11px] ${getStatusBadgeClass(p.status)}`}>{p.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xs text-ink-600">Booking <span className="font-semibold text-ink-900">#{p.booking_id}</span> • {formatShortDate(p.created_at)}</div>
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
                          ? 'bg-forest-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'border-ink-200 text-ink-700 hover:bg-ink-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-ink-900">{b.educator.user.name}</div>
                        <div className="text-[11px] text-ink-500">{b.educator.title}</div>
                      </div>
                      {selectedRecipientId === userId && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 rounded-card bg-ink-50 border border-ink-200 text-center text-xs text-ink-500">
                  <p className="font-medium text-ink-700 mb-1">No active educators yet</p>
                  <p className="text-[11px]">Book a hands-on session or post a skill request to start a direct message thread.</p>
                </div>
              )}
            </div>

            {/* Message Thread */}
            <div className="md:col-span-2 flex flex-col h-96 border border-ink-200 rounded-card overflow-hidden bg-ink-50/50">
              <div className="p-3 bg-white border-b border-ink-200 text-xs font-bold text-ink-800">
                Conversation
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length > 0 ? (
                  messages.map(m => {
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
                        <span className="text-[10px] text-ink-400 mt-0.5 px-1">
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
                  placeholder="Type your message..."
                  className="flex-1 text-xs p-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white transition shrink-0"
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
        <div className="bg-white rounded-card border border-ink-200 shadow-level-1 p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-ink-100">
            <div>
              <h2 className="text-base font-bold text-ink-900">Learner Profile Details</h2>
              <p className="text-xs text-ink-500">Manage your personal details and profile picture.</p>
            </div>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="px-3.5 py-2 rounded-card bg-forest-50 text-forest-800 border border-forest-200 text-xs font-bold hover:bg-forest-100 transition flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
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
              <div className="text-xs text-ink-500">{user?.email}</div>
              <div className="text-[11px] text-forest-700 font-semibold mt-0.5">Learner Account • Active</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-ink-500 font-semibold mb-1">Full Name</label>
              <input type="text" value={user?.name} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-700" />
            </div>
            <div>
              <label className="block text-ink-500 font-semibold mb-1">Email</label>
              <input type="text" value={user?.email} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-700" />
            </div>
            <div>
              <label className="block text-ink-500 font-semibold mb-1">Phone</label>
              <input type="text" value={user?.phone} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-700" />
            </div>
            <div>
              <label className="block text-ink-500 font-semibold mb-1">Primary Learning Area</label>
              <input type="text" value={user?.location || learnerProfile?.location || 'Mbarara City, Uganda'} disabled className="w-full p-2.5 rounded-lg border bg-ink-50 text-ink-700" />
            </div>
          </div>
        </div>
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
  );
};
