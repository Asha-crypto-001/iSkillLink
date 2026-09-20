import bcrypt from 'bcryptjs';
import {
  User, Educator, Category, Skill, LearnerRequest,
  Booking, Payment, Review, Message, Notification,
  AdminAction, AdminMetrics, MatchEvaluation
} from '../types';
import {
  initialLocalCategories,
  initialLocalSkills,
  initialLocalUsers,
  initialLocalEducators,
  initialLocalLearners,
  initialLocalBookings,
  initialLocalPayments,
  initialLocalAuditLogs
} from './localData';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';
if (import.meta.env.PROD && API_BASE === '/api') {
  console.error('[Auth] VITE_API_URL is not configured for the production frontend.');
}
let authToken: string | null = null;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return authToken;
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  authToken = token;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  authToken = null;
  localStorage.removeItem('iskilllink_user_id');
}

export function getAuthHeaders(headers: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken();
  const res: Record<string, string> = { ...headers };
  if (token) {
    res['Authorization'] = `Bearer ${token}`;
  }
  return res;
}

// Helper to initialize local persistent storage for static environments (e.g. GitHub Pages)
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`iskilllink_${key}`);
    if (!item) {
      localStorage.setItem(`iskilllink_${key}`, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setLocalStorageData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`iskilllink_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// Ensure initial seed data is loaded into local storage
if (typeof window !== 'undefined') {
  // Clean up any old placeholder educator accounts or Sarah Namubiru from local storage
  const rawUsers = localStorage.getItem('iskilllink_users');
  if (!rawUsers) {
    setLocalStorageData('users', initialLocalUsers);
  } else {
    try {
      const parsedUsers: any[] = JSON.parse(rawUsers);
      const filteredUsers = parsedUsers.filter(u => 
        u.email === 'ashabahebwahassan665@gmail.com' || 
        (!u.email?.endsWith('@iskilllink.ug') && u.email !== 'sarah.namubiru@gmail.com')
      );
      const admin = filteredUsers.find(u => u.email === 'ashabahebwahassan665@gmail.com' || u.role === 'admin');
      if (admin) {
        admin.password_hash = '$2b$10$NErcEsd5s0.RVb6cJ8kEXecftFIs9q/scddJaJUupEeDzD/YbMOxm';
        admin.role = 'admin';
        admin.name = 'Ashabahebwa Hassan';
      }
      setLocalStorageData('users', filteredUsers);
    } catch {
      setLocalStorageData('users', initialLocalUsers);
    }
  }

  // Clean old educators if containing imaginary accounts
  const rawEducators = localStorage.getItem('iskilllink_educators');
  if (!rawEducators) {
    setLocalStorageData('educators', initialLocalEducators);
  } else {
    try {
      const parsedEdu: any[] = JSON.parse(rawEducators);
      const filteredEdu = parsedEdu.filter(e => !e.id?.startsWith('edu-') || e.id?.length > 10);
      setLocalStorageData('educators', filteredEdu);
    } catch {
      setLocalStorageData('educators', initialLocalEducators);
    }
  }

  if (!localStorage.getItem('iskilllink_categories')) setLocalStorageData('categories', initialLocalCategories);
  if (!localStorage.getItem('iskilllink_skills')) setLocalStorageData('skills', initialLocalSkills);
  if (!localStorage.getItem('iskilllink_learners')) setLocalStorageData('learners', initialLocalLearners);
  if (!localStorage.getItem('iskilllink_bookings')) setLocalStorageData('bookings', initialLocalBookings);
  if (!localStorage.getItem('iskilllink_payments')) setLocalStorageData('payments', initialLocalPayments);
  if (!localStorage.getItem('iskilllink_audit_logs')) setLocalStorageData('audit_logs', initialLocalAuditLogs);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth & Session
  async login(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse<any>(res);
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async loginWithGoogle(credential: string) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });
    const result = await handleResponse<any>(res);
    if (result.token) setAuthToken(result.token);
    return result;
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    clearAuthSession();
    if (!res.ok && res.status !== 401) {
      throw await handleResponse<Error>(res);
    }
  },

  async register(data: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await handleResponse<any>(res);
        if (result.token) setAuthToken(result.token);
        return result;
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Registration service is unavailable. Please try again.');
    }

    throw new Error('Registration service is unavailable. Please try again.');

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : '$2b$10$unauthenticatedfallback';
    const newUser: any = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: data.email.trim().toLowerCase(),
      password_hash: hashedPassword,
      role: data.role || 'learner',
      name: data.name,
      phone: data.phone || '+256 ',
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: data.location || 'Mbarara City, Uganda',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setLocalStorageData('users', users);

    let learnerProfile = null;
    let educatorProfile = null;

    if (newUser.role === 'learner') {
      const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
      learnerProfile = {
        id: `lrn-${Date.now()}`,
        user_id: newUser.id,
        location: newUser.location,
        bio: 'Enthusiastic practical skills learner.',
        learning_interests: [],
        preferred_format: 'in-person',
        created_at: new Date().toISOString()
      };
      learners.push(learnerProfile);
      setLocalStorageData('learners', learners);
    } else if (newUser.role === 'educator') {
      const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);
      educatorProfile = {
        id: `edu-${Date.now()}`,
        user_id: newUser.id,
        title: data.title || 'Skilled Artisan & Educator',
        bio: data.bio || 'Experienced practitioner ready to train apprentices.',
        educator_type: 'artisan',
        years_experience: 3,
        location: newUser.location,
        service_area: 'Mbarara City & Western Uganda',
        teaching_formats: ['in-person', 'hybrid'],
        languages: ['English', 'Runyankole'],
        equipment_provided: 'Workshop equipment available.',
        hourly_rate_ugx: 35000,
        status: 'applied',
        rating: 5.0,
        total_reviews: 0,
        total_students: 0,
        created_at: new Date().toISOString()
      };
      educators.push(educatorProfile);
      setLocalStorageData('educators', educators);
    }

    const token = `local-token-${newUser.id}-${Date.now()}`;
    setAuthToken(token);

    const safeUser = { ...newUser };
    delete safeUser.password_hash;

    return { user: safeUser, learnerProfile, educatorProfile, token };
  },

  async getMe(userId?: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return await handleResponse<any>(res);

    if (!userId) return { user: null, learnerProfile: null, educatorProfile: null };

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const user = users.find(u => u.id === userId);
    if (!user) return { user: null, learnerProfile: null, educatorProfile: null };

    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);

    const learnerProfile = learners.find(l => l.user_id === user.id) || null;
    const educatorProfile = educators.find(e => e.user_id === user.id) || null;

    const safeUser = { ...user };
    delete safeUser.password_hash;

    return { user: safeUser, learnerProfile, educatorProfile };
  },

  async updateUserAvatar(userId: string, avatarUrl: string) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/avatar`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ avatar_url: avatarUrl })
      });
      if (res.ok) return await handleResponse<{ user: User }>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].avatar_url = avatarUrl;
      users[userIndex].updated_at = new Date().toISOString();
      setLocalStorageData('users', users);

      // Also update in educators if applicable
      const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);
      const eduIndex = educators.findIndex(e => e.user_id === userId);
      if (eduIndex !== -1 && educators[eduIndex].user) {
        educators[eduIndex].user.avatar_url = avatarUrl;
        setLocalStorageData('educators', educators);
      }

      return { user: users[userIndex] };
    }
    return { user: null };
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      if (res.ok) return await handleResponse<{ user: User }>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      setLocalStorageData('users', users);

      // Also sync educators
      const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);
      const eduIndex = educators.findIndex(e => e.user_id === userId);
      if (eduIndex !== -1 && educators[eduIndex].user) {
        educators[eduIndex].user = { ...educators[eduIndex].user, ...updates };
        setLocalStorageData('educators', educators);
      }

      return { user: users[userIndex] };
    }
    return { user: null };
  },

  // Categories & Skills
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await handleResponse<Category[]>(res);
    } catch {}
    return getLocalStorageData<Category[]>('categories', initialLocalCategories);
  },

  async getSkills(categoryId?: string, popular?: boolean) {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('category_id', categoryId);
      if (popular) params.append('popular', 'true');
      const res = await fetch(`${API_BASE}/skills?${params.toString()}`);
      if (res.ok) return await handleResponse<Skill[]>(res);
    } catch {}
    let skills = getLocalStorageData<Skill[]>('skills', initialLocalSkills);
    if (categoryId) skills = skills.filter(s => s.category_id === categoryId);
    if (popular) skills = skills.filter(s => s.popular);
    return skills;
  },

  // Educators
  async getEducators(filters: {
    search?: string;
    category_id?: string;
    format?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    status?: string;
    sort?: string;
    featured?: boolean;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          params.append(k, String(v));
        }
      });
      const res = await fetch(`${API_BASE}/educators?${params.toString()}`);
      if (res.ok) return await handleResponse<Educator[]>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    let educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);

    return educators.map(edu => ({
      ...edu,
      user: users.find(u => u.id === edu.user_id)
    }));
  },

  async getEducatorById(id: string) {
    try {
      const res = await fetch(`${API_BASE}/educators/${id}`);
      if (res.ok) return await handleResponse<Educator>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const edu = educators.find(e => e.id === id) || educators[0];
    return {
      ...edu,
      user: users.find(u => u.id === edu.user_id)
    };
  },

  async submitEducatorOnboarding(data: any) {
    try {
      const res = await fetch(`${API_BASE}/educators/onboard`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const userId = `usr-${Date.now()}`;
    const newUser = {
      id: userId,
      email: data.email || 'educator@example.ug',
      role: 'educator',
      name: data.name || 'New Educator',
      phone: data.phone || '+256 744 024 529',
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    users.push(newUser);
    setLocalStorageData('users', users);

    const newEdu: Educator = {
      id: `edu-${Date.now()}`,
      user_id: userId,
      user: newUser as any,
      title: data.title,
      bio: data.bio,
      educator_type: data.educator_type || 'artisan',
      years_experience: data.years_experience || 3,
      location: data.location || 'Mbarara City',
      service_area: data.service_area || 'Mbarara City & Western Region',
      teaching_formats: data.teaching_formats || ['in-person'],
      languages: data.languages || ['English', 'Runyankole'],
      equipment_provided: data.equipment_provided || 'Workshop tools provided.',
      hourly_rate_ugx: data.hourly_rate_ugx || 35000,
      status: 'applied',
      rating: 5.0,
      total_reviews: 0,
      total_students: 0,
      created_at: new Date().toISOString()
    };
    educators.push(newEdu);
    setLocalStorageData('educators', educators);
    return { success: true, educator: newEdu };
  },

  // Learner Requests & Matching
  async getLearnerRequests(filters: { learner_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/learner-requests?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<LearnerRequest[]>(res);
    } catch {}
    return getLocalStorageData<LearnerRequest[]>('learner_requests', []);
  },

  async createLearnerRequest(data: Partial<LearnerRequest>) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);
    const newReq: LearnerRequest = {
      id: `req-${Date.now()}`,
      learner_id: data.learner_id || 'lrn-1',
      skill_name: data.skill_name || 'Practical Skill',
      skill_level: data.skill_level || 'beginner',
      learning_goal: data.learning_goal || '',
      format_preference: data.format_preference || 'in-person',
      location: data.location || 'Mbarara City',
      preferred_schedule: data.preferred_schedule || 'Flexible',
      frequency: data.frequency || 'Weekly',
      budget_ugx: data.budget_ugx || 250000,
      status: 'open',
      contact_phone: data.contact_phone || '+256 700 000 000',
      learner_name: data.learner_name || 'Student',
      learner_email: data.learner_email || 'student@example.com',
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    setLocalStorageData('learner_requests', requests);

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const potentialMatches: MatchEvaluation[] = educators.slice(0, 3).map(e => ({
      educator: { ...e, user: users.find(u => u.id === e.user_id) },
      match_score: 95,
      match_reasons: [
        `Practical trade match: ${newReq.skill_name}`,
        `Location compatible: ${e.location}`,
        `Verified educator in Mbarara network`
      ],
      breakdown: { skillMatch: 35, formatMatch: 20, locationMatch: 15, budgetMatch: 15, experienceMatch: 10 }
    }));

    return { request: newReq, potentialMatches };
  },

  // Bookings
  async getBookings(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.educator_id) params.append('educator_id', filters.educator_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Booking[]>(res);
    } catch {}
    return getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
  },

  async createBooking(data: any) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const totalAmount = data.total_amount_ugx || 105000;
    const fee = Math.round(totalAmount * 0.10);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      learner_id: data.learner_id || 'lrn-1',
      educator_id: data.educator_id || 'edu-1',
      skill_name: data.skill_name || 'Practical Skill Session',
      format: data.format || 'in-person',
      location_or_link: data.location_or_link || 'Workshop Location',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '10:00',
      duration_hours: data.duration_hours || 3,
      total_amount_ugx: totalAmount,
      platform_fee_ugx: fee,
      educator_payout_ugx: totalAmount - fee,
      status: 'pending',
      notes: data.notes || '',
      milestone_progress: 0,
      created_at: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    setLocalStorageData('bookings', bookings);
    return { success: true, booking: newBooking };
  },

  async updateBookingStatus(id: string, status: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status, cancellation_reason: reason })
      });
      if (res.ok) return await handleResponse<Booking>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === id);
    if (b) {
      b.status = status as any;
      setLocalStorageData('bookings', bookings);
    }
    return b!;
  },

  async updateBookingProgress(id: string, progress: number) {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/progress`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ milestone_progress: progress })
      });
      if (res.ok) return await handleResponse<Booking>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === id);
    if (b) {
      b.milestone_progress = progress;
      setLocalStorageData('bookings', bookings);
    }
    return b!;
  },

  // Payments & Escrow
  async getPayments(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.educator_id) params.append('educator_id', filters.educator_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/payments?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Payment[]>(res);
    } catch {}
    return getLocalStorageData<Payment[]>('payments', initialLocalPayments);
  },

  async simulatePayment(bookingId: string, method: string = 'mtn_momo', phoneNumber: string = '+256 744 024 529') {
    try {
      const res = await fetch(`${API_BASE}/payments/simulate-payment`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ booking_id: bookingId, method, phone_number: phoneNumber })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === bookingId);
    const amount = b?.total_amount_ugx || 105000;
    const fee = Math.round(amount * 0.10);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      booking_id: bookingId,
      learner_id: b?.learner_id || 'lrn-1',
      educator_id: b?.educator_id || 'edu-1',
      amount_ugx: amount,
      platform_fee_ugx: fee,
      payout_amount_ugx: amount - fee,
      method: method as any,
      payment_reference: `MOMO-UG-${Date.now().toString().slice(-6)}`,
      status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    payments.unshift(newPayment);
    setLocalStorageData('payments', payments);

    if (b) {
      b.status = 'confirmed';
      setLocalStorageData('bookings', bookings);
    }

    return { success: true, message: 'Payment deposited into Escrow', payment: newPayment };
  },

  async releasePayout(paymentId: string, adminName: string = 'Ashabahebwa Hassan') {
    try {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/release-payout`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
    const p = payments.find(item => item.id === paymentId);
    if (p) {
      p.status = 'completed';
      setLocalStorageData('payments', payments);
    }
    return { success: true, payment: p! };
  },

  // Reviews
  async getReviews(educatorId?: string) {
    try {
      const query = educatorId ? `?educator_id=${educatorId}` : '';
      const res = await fetch(`${API_BASE}/reviews${query}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Review[]>(res);
    } catch {}
    return [];
  },

  async submitReview(data: any) {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      booking_id: data.booking_id,
      educator_id: data.educator_id,
      learner_id: data.learner_id,
      learner_name: data.learner_name || 'Verified Learner',
      learner_avatar: data.learner_avatar,
      rating: data.rating || 5,
      skill_rating: data.skill_rating || 5,
      punctuality_rating: data.punctuality_rating || 5,
      communication_rating: data.communication_rating || 5,
      comment: data.comment,
      is_verified: true,
      is_moderated: true,
      created_at: new Date().toISOString()
    };
    return { success: true, review: newRev };
  },

  async replyToReview(reviewId: string, reply: string) {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ reply })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, review: { id: reviewId, educator_reply: reply } as any };
  },

  // Messages & Notifications
  async getMessages(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/messages?user_id=${userId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Message[]>(res);
    } catch {}
    return [];
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, content })
      });
      if (res.ok) return await handleResponse<Message>(res);
    } catch {}
    return {
      id: `msg-${Date.now()}`,
      conversation_id: `conv-${senderId}-${receiverId}`,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
  },

  async getNotifications(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Notification[]>(res);
    } catch {}
    return [];
  },

  async markNotificationRead(id: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true };
  },

  // Admin Operations
  async getAdminMetrics() {
    try {
      const res = await fetch(`${API_BASE}/admin/metrics`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<AdminMetrics>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);

    return {
      totalLearners: learners.length,
      activeEducators: educators.filter(e => e.status === 'active').length,
      pendingApplications: educators.filter(e => e.status !== 'active').length,
      activeBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
      completedSessions: bookings.filter(b => b.status === 'completed').length,
      totalVolumeUgx: payments.reduce((sum, p) => sum + p.amount_ugx, 0),
      platformRevenueUgx: payments.reduce((sum, p) => sum + p.platform_fee_ugx, 0),
      openRequests: 1
    };
  },

  async getVerificationQueue() {
    try {
      const res = await fetch(`${API_BASE}/admin/verification-queue`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<Educator[]>(res);
    } catch {}
    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    return educators
      .filter(e => e.status !== 'active')
      .map(e => ({ ...e, user: users.find(u => u.id === e.user_id) }));
  },

  async updateVerificationStep(data: {
    educator_id: string;
    step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment';
    status: string;
    notes?: string;
    admin_name?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/admin/verification-step`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, verification: { status: data.status } };
  },

  async updateEducatorStatus(educatorId: string, status: string, notes?: string, adminName?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/educator-status`, {
        method: 'PATCH',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ educator_id: educatorId, status, notes, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const edu = educators.find(e => e.id === educatorId);
    if (edu) {
      edu.status = status as any;
      setLocalStorageData('educators', educators);
    }
    return { success: true, educator: edu! };
  },

  async getAuditLogs() {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<AdminAction[]>(res);
    } catch {}
    return getLocalStorageData<AdminAction[]>('audit_logs', initialLocalAuditLogs);
  },

  async getMatchesForRequest(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests/${requestId}/matches`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const matches: MatchEvaluation[] = educators.slice(0, 3).map(e => ({
      educator: { ...e, user: users.find(u => u.id === e.user_id) },
      match_score: 95,
      match_reasons: [
        `Practical trade match`,
        `Proximity in Mbarara & Ankole region`,
        `Verified educator in good standing`
      ],
      breakdown: { skillMatch: 35, formatMatch: 20, locationMatch: 15, budgetMatch: 15, experienceMatch: 10 }
    }));
    return { request: { id: requestId } as any, matches };
  },

  async assignMatch(requestId: string, educatorId: string, adminName?: string) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests/${requestId}/assign-match`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ educator_id: educatorId, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, match: { requestId, educatorId } };
  },

  // Admin User Directory, Contact Access & Secondary Admin Delegation
  async getAdminUsers() {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<any[]>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);
    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);

    return users.map(u => {
      const learner = learners.find(l => l.user_id === u.id) || null;
      const educator = educators.find(e => e.user_id === u.id) || null;
      const userRequests = requests.filter(r => r.learner_id === learner?.id || r.learner_email === u.email);
      const userBookings = bookings.filter(b => b.learner_id === learner?.id || b.educator_id === educator?.id);

      const allInterests: string[] = [];
      if (learner?.learning_interests) allInterests.push(...learner.learning_interests);
      if (userRequests.length > 0) allInterests.push(...userRequests.map(r => r.skill_name));
      if (educator?.title) allInterests.push(`Teaches: ${educator.title}`);

      return {
        ...u,
        location: u.location || learner?.location || educator?.location || 'Mbarara City, Uganda',
        whatsapp: u.whatsapp || u.phone,
        interests: Array.from(new Set(allInterests)),
        learnerProfile: learner,
        educatorProfile: educator,
        requestsCount: userRequests.length,
        bookingsCount: userBookings.length
      };
    });
  },

  async assignSecondaryAdmin(userId: string, adminId?: string, adminName: string = 'Ashabahebwa Hassan') {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/assign-secondary-admin`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ admin_id: adminId, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const u = users.find(user => user.id === userId);
    if (u) {
      u.role = 'secondary_admin';
      u.admin_assigned_by = adminName;
      u.admin_assigned_at = new Date().toISOString();
      setLocalStorageData('users', users);

      // Add audit log
      const auditLogs = getLocalStorageData<AdminAction[]>('audit_logs', initialLocalAuditLogs);
      auditLogs.unshift({
        id: `act-${Date.now()}`,
        admin_id: adminId || 'usr-admin-ashabahebwa',
        admin_name: adminName,
        action_type: 'ASSIGN_SECONDARY_ADMIN',
        target_entity: 'User',
        target_id: u.id,
        details: `Assigned ${u.name} (${u.email}) as Secondary Administrator with operational oversight privileges.`,
        created_at: new Date().toISOString()
      });
      setLocalStorageData('audit_logs', auditLogs);

      return { success: true, user: u };
    }
    return { success: false };
  },

  async revokeSecondaryAdmin(userId: string, adminId?: string, adminName: string = 'Ashabahebwa Hassan') {
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}/revoke-secondary-admin`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ admin_id: adminId, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const u = users.find(user => user.id === userId);
    if (u) {
      const isEdu = educators.some(e => e.user_id === u.id);
      u.role = isEdu ? 'educator' : 'learner';
      u.admin_assigned_by = undefined;
      u.admin_assigned_at = undefined;
      setLocalStorageData('users', users);

      // Add audit log
      const auditLogs = getLocalStorageData<AdminAction[]>('audit_logs', initialLocalAuditLogs);
      auditLogs.unshift({
        id: `act-${Date.now()}`,
        admin_id: adminId || 'usr-admin-ashabahebwa',
        admin_name: adminName,
        action_type: 'REVOKE_SECONDARY_ADMIN',
        target_entity: 'User',
        target_id: u.id,
        details: `Revoked Secondary Administrator privileges for ${u.name} (${u.email}). Reverted role to ${u.role}.`,
        created_at: new Date().toISOString()
      });
      setLocalStorageData('audit_logs', auditLogs);

      return { success: true, user: u };
    }
    return { success: false };
  },

  async getInterestsDemand() {
    try {
      const res = await fetch(`${API_BASE}/admin/interests-demand`, {
        headers: getAuthHeaders()
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);
    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);

    const demandByTrade: { [trade: string]: { count: number; totalBudget: number; locations: Set<string> } } = {};
    requests.forEach(r => {
      const trade = r.skill_name || 'General Practical Skill';
      if (!demandByTrade[trade]) {
        demandByTrade[trade] = { count: 0, totalBudget: 0, locations: new Set() };
      }
      demandByTrade[trade].count += 1;
      demandByTrade[trade].totalBudget += r.budget_ugx || 0;
      if (r.location) demandByTrade[trade].locations.add(r.location);
    });

    const formattedDemand = Object.entries(demandByTrade).map(([trade, data]) => ({
      trade,
      requestCount: data.count,
      averageBudgetUgx: data.count > 0 ? Math.round(data.totalBudget / data.count) : 0,
      topLocations: Array.from(data.locations)
    })).sort((a, b) => b.requestCount - a.requestCount);

    const interestCounts: { [interest: string]: number } = {};
    learners.forEach(l => {
      l.learning_interests?.forEach((item: string) => {
        interestCounts[item] = (interestCounts[item] || 0) + 1;
      });
    });

    return {
      tradeDemand: formattedDemand,
      learnerInterests: interestCounts,
      totalRequests: requests.length,
      openRequestsCount: requests.filter(r => r.status === 'open').length,
      matchedRequestsCount: requests.filter(r => r.status === 'matched' || r.status === 'fulfilled').length
    };
  },

  async createInquiry(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    try {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    const inquiries = getLocalStorageData<any[]>('inquiries', []);
    const newInq = { id: `inq-${Date.now()}`, ...data, status: 'open', created_at: new Date().toISOString() };
    inquiries.unshift(newInq);
    setLocalStorageData('inquiries', inquiries);
    return { success: true, inquiry: newInq };
  },

  async subscribeNewsletter(email: string, interest: string = 'All Practical Trades') {
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email, interest })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    const subs = getLocalStorageData<any[]>('newsletter_subscribers', []);
    if (subs.some((s: any) => s.email.toLowerCase() === email.toLowerCase())) {
      return { success: true, subscriber: subs.find((s: any) => s.email.toLowerCase() === email.toLowerCase()) };
    }
    const newSub = { id: `news-${Date.now()}`, email: email.toLowerCase(), interest, created_at: new Date().toISOString() };
    subs.unshift(newSub);
    setLocalStorageData('newsletter_subscribers', subs);
    return { success: true, subscriber: newSub };
  },

  async uploadAvatar(file: File, userId?: string) {
    try {
      const form = new FormData();
      form.append('avatar', file);
      if (userId) form.append('userId', userId);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/uploads/avatar`, {
        method: 'POST',
        headers,
        body: form
      });
      if (res.ok) {
        const data = await handleResponse<{ success: boolean; url: string }>(res);
        return data;
      }
    } catch {}
    // Fallback: return object URL for local preview (not persisted)
    return { success: false, url: URL.createObjectURL(file) };
  }
};
