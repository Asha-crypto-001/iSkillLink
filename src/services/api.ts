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
import { supabase } from './supabase';

const CONFIGURED_API_URL = (import.meta as any).env?.VITE_API_URL as string | undefined;
const API_BASE = CONFIGURED_API_URL || '/api';
if (import.meta.env.PROD && !CONFIGURED_API_URL) {
  console.error('[Auth] VITE_API_URL is not configured for the production frontend.');
}

/**
 * Browser-only demo storage is used solely when no API URL is configured (static hosting such
 * as GitHub Pages) and no API answers. With VITE_API_URL set, an unreachable API is an error.
 */
const LOCAL_FALLBACK_ENABLED = !CONFIGURED_API_URL;

let authToken: string | null = null;

function mapSupabaseUser(user: any) {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || '',
    name: metadata.name || metadata.full_name || user.email?.split('@')[0] || 'User',
    role: metadata.role || 'learner',
    phone: metadata.phone || '',
    location: metadata.location || 'Mbarara City, Uganda',
    avatar_url: metadata.avatar_url || metadata.picture || '',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

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

// Supabase refreshes access tokens in the background; keep the API bearer token in step.
if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    authToken = session?.access_token ?? null;
  });
}

/** Thrown when no API server answered: a network failure, or a static host returning its HTML page. */
class ApiUnavailableError extends Error {
  constructor() {
    super('The iSkillLink service is unavailable right now. Please try again shortly.');
    this.name = 'ApiUnavailableError';
  }
}

/**
 * Calls the API. Error responses are thrown with the server's message;
 * an unreachable API throws ApiUnavailableError.
 */
async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new ApiUnavailableError();
  }
  if (res.status === 204) return undefined as T;

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  if (!isJson) throw new ApiUnavailableError();

  const data = await res.json().catch(() => {
    throw new ApiUnavailableError();
  });
  if (!res.ok) {
    throw new Error(data?.error || `HTTP error ${res.status}`);
  }
  return data as T;
}

function jsonRequest(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: body === undefined ? undefined : JSON.stringify(body)
  };
}

let localModeWarned = false;

/** Runs the API call, using browser storage only when the API is unreachable in demo mode. */
async function withLocalFallback<T>(remote: () => Promise<T>, local: () => T | Promise<T>): Promise<T> {
  try {
    return await remote();
  } catch (error) {
    if (error instanceof ApiUnavailableError && LOCAL_FALLBACK_ENABLED) {
      if (!localModeWarned) {
        console.warn('[iSkillLink] API unavailable — using browser-only demo data. Changes are not saved to a server.');
        localModeWarned = true;
      }
      return local();
    }
    throw error;
  }
}

/**
 * After Supabase sign-in, loads the matching API account (with learner/educator profiles) so
 * that user ids line up with API data. Falls back to the Supabase profile only in demo mode.
 */
async function resolveSupabaseSession(supabaseUser: any) {
  try {
    return await apiRequest<any>('/auth/me', { headers: getAuthHeaders() });
  } catch (error) {
    if (error instanceof ApiUnavailableError && LOCAL_FALLBACK_ENABLED) {
      return { user: mapSupabaseUser(supabaseUser), learnerProfile: null, educatorProfile: null };
    }
    throw error;
  }
}

/** Completes a fresh Supabase sign-in, signing back out if the API rejects the account. */
async function finishSupabaseSignIn(supabaseUser: any, accessToken: string) {
  setAuthToken(accessToken);
  try {
    const session = await resolveSupabaseSession(supabaseUser);
    return { ...session, token: accessToken };
  } catch (error) {
    await supabase?.auth.signOut();
    clearAuthSession();
    throw error;
  }
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
      // Credentials never belong in browser storage; strip any left by older versions.
      filteredUsers.forEach(u => { delete u.password_hash; });
      const admin = filteredUsers.find(u => u.email === 'ashabahebwahassan665@gmail.com' || u.role === 'admin');
      if (admin) {
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

export const api = {
  // Auth & Session — never served from browser storage; authentication fails closed.
  async login(email: string, password?: string) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });
      if (error || !data.session || !data.user) {
        throw new Error(error?.message || 'Invalid email or password.');
      }
      return finishSupabaseSignIn(data.user, data.session.access_token);
    }
    const data = await apiRequest<any>('/auth/login', jsonRequest('POST', { email, password }));
    if (data.token) setAuthToken(data.token);
    return data;
  },

  async loginWithGoogle(credential: string) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });
      if (error || !data.session || !data.user) {
        throw new Error(error?.message || 'Google authentication could not be verified.');
      }
      return finishSupabaseSignIn(data.user, data.session.access_token);
    }
    const result = await apiRequest<any>('/auth/google', jsonRequest('POST', { credential }));
    if (result.token) setAuthToken(result.token);
    return result;
  },

  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
      clearAuthSession();
      return;
    }
    try {
      if (getAuthToken()) await apiRequest<void>('/auth/logout', jsonRequest('POST'));
    } catch (error) {
      // An unreachable API or an already-invalid session still ends the local session.
      if (!(error instanceof ApiUnavailableError)) console.warn('Logout request failed:', error);
    } finally {
      clearAuthSession();
    }
  },

  async register(data: any) {
    if (supabase) {
      if (!['learner', 'educator'].includes(data.role)) {
        throw new Error('Public registration is limited to learner or educator accounts.');
      }
      const { data: result, error } = await supabase.auth.signUp({
        email: String(data.email).trim().toLowerCase(),
        password: String(data.password),
        options: {
          data: {
            name: String(data.name).trim(),
            role: data.role,
            phone: data.phone || '',
            location: data.location || 'Mbarara City, Uganda',
            avatar_url: data.avatar_url || '',
          },
        },
      });
      if (error || !result.user) throw new Error(error?.message || 'Registration failed.');
      if (!result.session) {
        throw new Error('Registration succeeded. Check your email to confirm your account before signing in.');
      }
      return finishSupabaseSignIn(result.user, result.session.access_token);
    }
    const result = await apiRequest<any>('/auth/register', jsonRequest('POST', data));
    if (result.token) setAuthToken(result.token);
    return result;
  },

  async getMe() {
    const signedOut = { user: null, learnerProfile: null, educatorProfile: null };
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return signedOut;
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return signedOut;
      setAuthToken(sessionData.session.access_token);
      return resolveSupabaseSession(data.user);
    }
    // API tokens are held in memory only, so there is no session to restore without one.
    if (!getAuthToken()) return signedOut;
    return apiRequest<any>('/auth/me', { headers: getAuthHeaders() });
  },

  async updateUserAvatar(userId: string, avatarUrl: string) {
    return withLocalFallback(
      () => apiRequest<{ user: User }>(`/users/${userId}/avatar`, jsonRequest('PATCH', { avatar_url: avatarUrl })),
      () => {
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
      }
    );
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
    return withLocalFallback(
      () => apiRequest<{ user: User }>(`/users/${userId}`, jsonRequest('PATCH', updates)),
      () => {
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
      }
    );
  },

  // Categories & Skills
  async getCategories() {
    return withLocalFallback(
      () => apiRequest<Category[]>('/categories'),
      () => getLocalStorageData<Category[]>('categories', initialLocalCategories)
    );
  },

  async getSkills(categoryId?: string, popular?: boolean) {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId);
    if (popular) params.append('popular', 'true');
    return withLocalFallback(
      () => apiRequest<Skill[]>(`/skills?${params.toString()}`),
      () => {
        let skills = getLocalStorageData<Skill[]>('skills', initialLocalSkills);
        if (categoryId) skills = skills.filter(s => s.category_id === categoryId);
        if (popular) skills = skills.filter(s => s.popular);
        return skills;
      }
    );
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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.append(k, String(v));
      }
    });
    return withLocalFallback(
      () => apiRequest<Educator[]>(`/educators?${params.toString()}`),
      () => {
        const users = getLocalStorageData<any[]>('users', initialLocalUsers);
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        return educators.map(edu => ({
          ...edu,
          user: users.find(u => u.id === edu.user_id)
        }));
      }
    );
  },

  async getEducatorById(id: string) {
    return withLocalFallback(
      () => apiRequest<Educator>(`/educators/${id}`),
      () => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const users = getLocalStorageData<any[]>('users', initialLocalUsers);
        const edu = educators.find(e => e.id === id);
        if (!edu) throw new Error('Educator not found');
        return {
          ...edu,
          user: users.find(u => u.id === edu.user_id)
        };
      }
    );
  },

  async updateEducator(id: string, updates: Partial<Educator>) {
    return withLocalFallback(
      () => apiRequest<Educator>(`/educators/${id}`, jsonRequest('PATCH', updates)),
      () => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const index = educators.findIndex(e => e.id === id);
        if (index === -1) throw new Error('Educator not found');
        educators[index] = { ...educators[index], ...updates };
        setLocalStorageData('educators', educators);
        return educators[index];
      }
    );
  },

  async submitEducatorOnboarding(data: any) {
    return withLocalFallback(
      () => apiRequest<any>('/educators/onboard', jsonRequest('POST', data)),
      () => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const userId = `usr-${Date.now()}`;
        const newUser = {
          id: userId,
          email: data.email || 'educator@example.ug',
          role: 'educator',
          name: data.name || 'New Educator',
          phone: data.phone || '+256 744 024 529',
          avatar_url: data.avatar_url || '',
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
      }
    );
  },

  // Learner Requests & Matching
  async getLearnerRequests(filters: { learner_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.status) params.append('status', filters.status);
    return withLocalFallback(
      () => apiRequest<LearnerRequest[]>(`/learner-requests?${params.toString()}`, { headers: getAuthHeaders() }),
      () => getLocalStorageData<LearnerRequest[]>('learner_requests', [])
    );
  },

  async createLearnerRequest(data: Partial<LearnerRequest>) {
    return withLocalFallback(
      () => apiRequest<any>('/learner-requests', jsonRequest('POST', data)),
      () => {
        const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);
        const newReq: LearnerRequest = {
          id: `req-${Date.now()}`,
          learner_id: data.learner_id || '',
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
      }
    );
  },

  // Bookings
  async getBookings(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.educator_id) params.append('educator_id', filters.educator_id);
    if (filters.status) params.append('status', filters.status);
    return withLocalFallback(
      () => apiRequest<Booking[]>(`/bookings?${params.toString()}`, { headers: getAuthHeaders() }),
      () => getLocalStorageData<Booking[]>('bookings', initialLocalBookings)
    );
  },

  async createBooking(data: any) {
    return withLocalFallback(
      () => apiRequest<any>('/bookings', jsonRequest('POST', data)),
      () => {
        const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
        const totalAmount = data.total_amount_ugx || 105000;
        const fee = Math.round(totalAmount * 0.10);
        const newBooking: Booking = {
          id: `bk-${Date.now()}`,
          learner_id: data.learner_id || '',
          educator_id: data.educator_id,
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
      }
    );
  },

  async updateBookingStatus(id: string, status: string, reason?: string) {
    return withLocalFallback(
      () => apiRequest<Booking>(`/bookings/${id}/status`, jsonRequest('PATCH', { status, cancellation_reason: reason })),
      () => {
        const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
        const b = bookings.find(item => item.id === id);
        if (b) {
          b.status = status as any;
          setLocalStorageData('bookings', bookings);
        }
        return b!;
      }
    );
  },

  async updateBookingProgress(id: string, progress: number) {
    return withLocalFallback(
      () => apiRequest<Booking>(`/bookings/${id}/progress`, jsonRequest('PATCH', { milestone_progress: progress })),
      () => {
        const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
        const b = bookings.find(item => item.id === id);
        if (b) {
          b.milestone_progress = progress;
          setLocalStorageData('bookings', bookings);
        }
        return b!;
      }
    );
  },

  // Payments & Escrow
  async getPayments(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.educator_id) params.append('educator_id', filters.educator_id);
    if (filters.status) params.append('status', filters.status);
    return withLocalFallback(
      () => apiRequest<Payment[]>(`/payments?${params.toString()}`, { headers: getAuthHeaders() }),
      () => getLocalStorageData<Payment[]>('payments', initialLocalPayments)
    );
  },

  async simulatePayment(bookingId: string, method: string = 'mtn_momo', phoneNumber: string = '+256 744 024 529') {
    return withLocalFallback(
      () => apiRequest<any>('/payments/simulate-payment', jsonRequest('POST', { booking_id: bookingId, method, phone_number: phoneNumber })),
      () => {
        const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
        const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
        const b = bookings.find(item => item.id === bookingId);
        const amount = b?.total_amount_ugx || 105000;
        const fee = Math.round(amount * 0.10);

        const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          booking_id: bookingId,
          learner_id: b?.learner_id || '',
          educator_id: b?.educator_id || '',
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
      }
    );
  },

  async releasePayout(paymentId: string, adminName: string = 'Ashabahebwa Hassan') {
    return withLocalFallback(
      () => apiRequest<any>(`/payments/${paymentId}/release-payout`, jsonRequest('PATCH', { admin_name: adminName })),
      () => {
        const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
        const p = payments.find(item => item.id === paymentId);
        if (p) {
          p.status = 'completed';
          setLocalStorageData('payments', payments);
        }
        return { success: true, payment: p! };
      }
    );
  },

  // Reviews
  async getReviews(educatorId?: string) {
    const query = educatorId ? `?educator_id=${educatorId}` : '';
    return withLocalFallback(
      () => apiRequest<Review[]>(`/reviews${query}`, { headers: getAuthHeaders() }),
      () => [] as Review[]
    );
  },

  async submitReview(data: any) {
    return withLocalFallback(
      () => apiRequest<any>('/reviews', jsonRequest('POST', data)),
      () => {
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
      }
    );
  },

  async replyToReview(reviewId: string, reply: string) {
    return withLocalFallback(
      () => apiRequest<any>(`/reviews/${reviewId}/reply`, jsonRequest('POST', { reply })),
      () => ({ success: true, review: { id: reviewId, educator_reply: reply } as any })
    );
  },

  // Messages & Notifications
  async getMessages(userId: string) {
    return withLocalFallback(
      () => apiRequest<Message[]>(`/messages?user_id=${userId}`, { headers: getAuthHeaders() }),
      () => [] as Message[]
    );
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    return withLocalFallback(
      () => apiRequest<Message>('/messages', jsonRequest('POST', { sender_id: senderId, receiver_id: receiverId, content })),
      (): Message => ({
        id: `msg-${Date.now()}`,
        conversation_id: `conv-${senderId}-${receiverId}`,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        is_read: false,
        created_at: new Date().toISOString()
      })
    );
  },

  async getNotifications(userId: string) {
    return withLocalFallback(
      () => apiRequest<Notification[]>(`/notifications?user_id=${userId}`, { headers: getAuthHeaders() }),
      () => [] as Notification[]
    );
  },

  async markNotificationRead(id: string) {
    return withLocalFallback(
      () => apiRequest<any>(`/notifications/${id}/read`, jsonRequest('PATCH')),
      () => ({ success: true })
    );
  },

  // Admin Operations
  async getAdminMetrics() {
    return withLocalFallback(
      () => apiRequest<AdminMetrics>('/admin/metrics', { headers: getAuthHeaders() }),
      (): AdminMetrics => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
        const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
        const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
        const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);

        return {
          totalLearners: learners.length,
          activeEducators: educators.filter(e => e.status === 'active').length,
          pendingApplications: educators.filter(e => e.status !== 'active').length,
          activeBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
          completedSessions: bookings.filter(b => b.status === 'completed').length,
          totalVolumeUgx: payments.reduce((sum, p) => sum + p.amount_ugx, 0),
          platformRevenueUgx: payments.reduce((sum, p) => sum + p.platform_fee_ugx, 0),
          openRequests: requests.filter(r => r.status === 'open' || r.status === 'matched').length
        };
      }
    );
  },

  async getVerificationQueue() {
    return withLocalFallback(
      () => apiRequest<Educator[]>('/admin/verification-queue', { headers: getAuthHeaders() }),
      () => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const users = getLocalStorageData<any[]>('users', initialLocalUsers);
        return educators
          .filter(e => e.status !== 'active')
          .map(e => ({ ...e, user: users.find(u => u.id === e.user_id) }));
      }
    );
  },

  async updateVerificationStep(data: {
    educator_id: string;
    step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment';
    status: string;
    notes?: string;
    admin_name?: string;
  }) {
    return withLocalFallback(
      () => apiRequest<any>('/admin/verification-step', jsonRequest('PATCH', data)),
      () => ({ success: true, verification: { status: data.status } })
    );
  },

  async updateEducatorStatus(educatorId: string, status: string, notes?: string, adminName?: string) {
    return withLocalFallback(
      () => apiRequest<any>('/admin/educator-status', jsonRequest('PATCH', { educator_id: educatorId, status, notes, admin_name: adminName })),
      () => {
        const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
        const edu = educators.find(e => e.id === educatorId);
        if (edu) {
          edu.status = status as any;
          setLocalStorageData('educators', educators);
        }
        return { success: true, educator: edu! };
      }
    );
  },

  async getAuditLogs() {
    return withLocalFallback(
      () => apiRequest<AdminAction[]>('/admin/audit-logs', { headers: getAuthHeaders() }),
      () => getLocalStorageData<AdminAction[]>('audit_logs', initialLocalAuditLogs)
    );
  },

  async getMatchesForRequest(requestId: string) {
    return withLocalFallback(
      () => apiRequest<any>(`/learner-requests/${requestId}/matches`, { headers: getAuthHeaders() }),
      () => {
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
      }
    );
  },

  async assignMatch(requestId: string, educatorId: string, adminName?: string) {
    return withLocalFallback(
      () => apiRequest<any>(`/learner-requests/${requestId}/assign-match`, jsonRequest('POST', { educator_id: educatorId, admin_name: adminName })),
      () => ({ success: true, match: { requestId, educatorId } })
    );
  },

  // Admin User Directory, Contact Access & Secondary Admin Delegation
  async getAdminUsers() {
    return withLocalFallback(
      () => apiRequest<any[]>('/admin/users', { headers: getAuthHeaders() }),
      () => {
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
      }
    );
  },

  async assignSecondaryAdmin(userId: string, adminId?: string, adminName: string = 'Ashabahebwa Hassan') {
    return withLocalFallback(
      () => apiRequest<any>(`/admin/users/${userId}/assign-secondary-admin`, jsonRequest('POST', { admin_id: adminId, admin_name: adminName })),
      () => {
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
      }
    );
  },

  async revokeSecondaryAdmin(userId: string, adminId?: string, adminName: string = 'Ashabahebwa Hassan') {
    return withLocalFallback(
      () => apiRequest<any>(`/admin/users/${userId}/revoke-secondary-admin`, jsonRequest('POST', { admin_id: adminId, admin_name: adminName })),
      () => {
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
      }
    );
  },

  async getInterestsDemand() {
    return withLocalFallback(
      () => apiRequest<any>('/admin/interests-demand', { headers: getAuthHeaders() }),
      () => {
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
      }
    );
  },

  async createInquiry(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    return withLocalFallback(
      () => apiRequest<any>('/inquiries', jsonRequest('POST', data)),
      () => {
        const inquiries = getLocalStorageData<any[]>('inquiries', []);
        const newInq = { id: `inq-${Date.now()}`, ...data, status: 'open', created_at: new Date().toISOString() };
        inquiries.unshift(newInq);
        setLocalStorageData('inquiries', inquiries);
        return { success: true, inquiry: newInq };
      }
    );
  },

  async subscribeNewsletter(email: string, interest: string = 'All Practical Trades') {
    return withLocalFallback(
      () => apiRequest<any>('/newsletter/subscribe', jsonRequest('POST', { email, interest })),
      () => {
        const subs = getLocalStorageData<any[]>('newsletter_subscribers', []);
        if (subs.some((s: any) => s.email.toLowerCase() === email.toLowerCase())) {
          return { success: true, subscriber: subs.find((s: any) => s.email.toLowerCase() === email.toLowerCase()) };
        }
        const newSub = { id: `news-${Date.now()}`, email: email.toLowerCase(), interest, created_at: new Date().toISOString() };
        subs.unshift(newSub);
        setLocalStorageData('newsletter_subscribers', subs);
        return { success: true, subscriber: newSub };
      }
    );
  },

  async uploadAvatar(file: File, userId?: string) {
    const form = new FormData();
    form.append('avatar', file);
    if (userId) form.append('userId', userId);
    return withLocalFallback(
      () => apiRequest<{ success: boolean; url: string }>('/uploads/avatar', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: form
      }),
      // Fallback: return object URL for local preview (not persisted)
      () => ({ success: false, url: URL.createObjectURL(file) })
    );
  }
};
