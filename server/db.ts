import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User, Learner, Educator, Category, Skill, EducatorSkill,
  Qualification, Portfolio, Verification, LearnerRequest,
  Match, Booking, Availability, Payment, Transaction, Review,
  Message, Notification, AdminAction, Inquiry, NewsletterSubscriber
} from './types.js';
import {
  initialCategories, initialSkills, initialUsers, initialLearners,
  initialEducators, initialEducatorSkills, initialQualifications,
  initialPortfolios, initialVerifications, initialLearnerRequests,
  initialMatches, initialBookings, initialPayments, initialTransactions,
  initialReviews, initialMessages, initialNotifications, initialAdminActions
} from './seedData.js';
import { hashPasswordSync } from './utils/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'iskilllink_db.json');

export interface DatabaseState {
  users: User[];
  learners: Learner[];
  educators: Educator[];
  categories: Category[];
  skills: Skill[];
  educatorSkills: EducatorSkill[];
  qualifications: Qualification[];
  portfolios: Portfolio[];
  verifications: Verification[];
  learnerRequests: LearnerRequest[];
  matches: Match[];
  bookings: Booking[];
  availability: Availability[];
  payments: Payment[];
  transactions: Transaction[];
  reviews: Review[];
  messages: Message[];
  notifications: Notification[];
  adminActions: AdminAction[];
  inquiries: Inquiry[];
  newsletterSubscribers: NewsletterSubscriber[];
}

class Database {
  private data: DatabaseState;

  constructor() {
    this.data = this.loadDatabase();
    this.ensurePasswordsHashed();
  }

  /**
   * Automatically iterates existing users and upgrades any legacy plaintext passwords
   * to cryptographically secure bcrypt hashes.
   */
  private ensurePasswordsHashed() {
    let modified = false;
    for (const user of this.data.users) {
      if (user.password_hash && !user.password_hash.startsWith('$2')) {
        user.password_hash = hashPasswordSync(user.password_hash);
        modified = true;
      }
    }
    if (modified) {
      this.saveData();
      console.log('[Security] Automatically upgraded legacy plaintext user passwords to bcrypt hashes.');
    }
  }

  private loadDatabase(): DatabaseState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure founder Ashabahebwa Hassan is always present in users
        if (!parsed.users.some((u: User) => u.email === 'ashabahebwahassan665@gmail.com')) {
          return this.resetToDefault();
        }
        if (!parsed.inquiries) parsed.inquiries = [];
        if (!parsed.newsletterSubscribers) parsed.newsletterSubscribers = [];
        return parsed;
      }
    } catch (err) {
      console.warn('Could not load persisted DB file, resetting to initial seed data.', err);
    }

    return this.resetToDefault();
  }

  private saveData(dataToSave?: DatabaseState) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public resetToDefault() {
    this.data = {
      users: initialUsers.map(u => ({
        ...u,
        password_hash: u.password_hash.startsWith('$2') ? u.password_hash : hashPasswordSync(u.password_hash)
      })),
      learners: initialLearners,
      educators: initialEducators,
      categories: initialCategories,
      skills: initialSkills,
      educatorSkills: initialEducatorSkills,
      qualifications: initialQualifications,
      portfolios: initialPortfolios,
      verifications: initialVerifications,
      learnerRequests: initialLearnerRequests,
      matches: initialMatches,
      bookings: initialBookings,
      availability: [],
      payments: initialPayments,
      transactions: initialTransactions,
      reviews: initialReviews,
      messages: initialMessages,
      notifications: initialNotifications,
      adminActions: initialAdminActions,
      inquiries: [],
      newsletterSubscribers: []
    };
    this.saveData();
    return this.data;
  }

  // Generic Getters
  public getUsers() { return this.data.users; }
  public getLearners() { return this.data.learners; }
  public getEducators() { return this.data.educators; }
  public getCategories() { return this.data.categories; }
  public getSkills() { return this.data.skills; }
  public getEducatorSkills() { return this.data.educatorSkills; }
  public getQualifications() { return this.data.qualifications; }
  public getPortfolios() { return this.data.portfolios; }
  public getVerifications() { return this.data.verifications; }
  public getLearnerRequests() { return this.data.learnerRequests; }
  public getMatches() { return this.data.matches; }
  public getBookings() { return this.data.bookings; }
  public getPayments() { return this.data.payments; }
  public getTransactions() { return this.data.transactions; }
  public getReviews() { return this.data.reviews; }
  public getMessages() { return this.data.messages; }
  public getNotifications() { return this.data.notifications; }
  public getAdminActions() { return this.data.adminActions; }
  public getInquiries() { return this.data.inquiries || []; }
  public getNewsletterSubscribers() { return this.data.newsletterSubscribers || []; }

  // Specific Entity Operations
  public findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserByGoogleSub(googleSub: string) {
    return this.data.users.find(u => u.google_sub === googleSub);
  }

  public createUser(user: User) {
    const userToSave: User = {
      ...user,
      password_hash: user.password_hash.startsWith('$2') ? user.password_hash : hashPasswordSync(user.password_hash)
    };
    this.data.users.push(userToSave);
    this.saveData();
    return userToSave;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    const cleanUpdates = { ...updates };
    if (cleanUpdates.password_hash && !cleanUpdates.password_hash.startsWith('$2')) {
      cleanUpdates.password_hash = hashPasswordSync(cleanUpdates.password_hash);
    }
    this.data.users[index] = {
      ...this.data.users[index],
      ...cleanUpdates,
      updated_at: new Date().toISOString()
    };
    this.saveData();
    return this.data.users[index];
  }

  public getAllUsersDetailed() {
    return this.data.users.map(u => {
      const learner = this.data.learners.find(l => l.user_id === u.id) || null;
      const educator = this.data.educators.find(e => e.user_id === u.id) || null;
      const requests = this.data.learnerRequests.filter(r => r.learner_id === learner?.id || r.learner_email === u.email);
      const userBookings = this.data.bookings.filter(b => b.learner_id === learner?.id || b.educator_id === educator?.id);
      
      const allInterests: string[] = [];
      if (learner?.learning_interests) allInterests.push(...learner.learning_interests);
      if (requests.length > 0) allInterests.push(...requests.map(r => r.skill_name));
      if (educator?.title) allInterests.push(`Teaches: ${educator.title}`);

      return {
        ...u,
        location: u.location || learner?.location || educator?.location || 'Uganda',
        whatsapp: u.whatsapp || u.phone,
        interests: Array.from(new Set(allInterests)),
        learnerProfile: learner,
        educatorProfile: educator,
        requestsCount: requests.length,
        bookingsCount: userBookings.length
      };
    });
  }

  public assignSecondaryAdmin(userId: string, adminId: string, adminName: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    user.role = 'secondary_admin';
    user.admin_assigned_by = adminName;
    user.admin_assigned_at = new Date().toISOString();
    user.updated_at = new Date().toISOString();

    // Log admin action
    this.logAdminAction({
      admin_id: adminId,
      admin_name: adminName,
      action_type: 'ASSIGN_SECONDARY_ADMIN',
      target_entity: 'User',
      target_id: user.id,
      details: `Assigned user ${user.name} (${user.email}) as Secondary Administrator with operational oversight privileges.`
    });

    // Send user notification
    this.createNotification({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      type: 'system_alert',
      title: 'Administrator Access Granted',
      message: `You have been appointed as a Secondary Administrator by ${adminName}. You now have access to verification queues and oversight tools.`,
      link: '/admin-dashboard',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.saveData();
    return user;
  }

  public revokeSecondaryAdmin(userId: string, adminId: string, adminName: string) {
    const user = this.findUserById(userId);
    if (!user) return null;

    // Determine return role based on registered profile
    const educator = this.findEducatorByUserId(user.id);
    user.role = educator ? 'educator' : 'learner';
    user.admin_assigned_by = undefined;
    user.admin_assigned_at = undefined;
    user.updated_at = new Date().toISOString();

    // Log admin action
    this.logAdminAction({
      admin_id: adminId,
      admin_name: adminName,
      action_type: 'REVOKE_SECONDARY_ADMIN',
      target_entity: 'User',
      target_id: user.id,
      details: `Revoked Secondary Administrator privileges for ${user.name} (${user.email}). Reverted role to ${user.role}.`
    });

    // Send user notification
    this.createNotification({
      id: `notif-${Date.now()}`,
      user_id: user.id,
      type: 'system_alert',
      title: 'Administrator Privileges Updated',
      message: `Your Secondary Administrator privileges have been concluded by ${adminName}. Account role restored to ${user.role}.`,
      link: user.role === 'educator' ? '/educator-dashboard' : '/learner-dashboard',
      is_read: false,
      created_at: new Date().toISOString()
    });

    this.saveData();
    return user;
  }

  public createLearner(learner: Learner) {
    this.data.learners.push(learner);
    this.saveData();
    return learner;
  }

  public createEducator(educator: Educator) {
    this.data.educators.push(educator);
    this.saveData();
    return educator;
  }

  public updateEducator(id: string, updates: Partial<Educator>) {
    const idx = this.data.educators.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.educators[idx] = { ...this.data.educators[idx], ...updates };
      this.saveData();
      return this.data.educators[idx];
    }
    return null;
  }

  public findEducatorById(id: string) {
    const educator = this.data.educators.find(e => e.id === id);
    if (!educator) return null;
    const user = this.findUserById(educator.user_id);
    const skills = this.data.educatorSkills.filter(s => s.educator_id === educator.id);
    const qualifications = this.data.qualifications.filter(q => q.educator_id === educator.id);
    const portfolios = this.data.portfolios.filter(p => p.educator_id === educator.id);
    const reviews = this.data.reviews.filter(r => r.educator_id === educator.id);
    const verification = this.data.verifications.find(v => v.educator_id === educator.id);

    return {
      ...educator,
      user,
      skills,
      qualifications,
      portfolios,
      reviews,
      verification
    };
  }

  public findEducatorByUserId(userId: string) {
    return this.data.educators.find(e => e.user_id === userId);
  }

  public findLearnerByUserId(userId: string) {
    return this.data.learners.find(l => l.user_id === userId);
  }

  public createLearnerRequest(req: LearnerRequest) {
    this.data.learnerRequests.unshift(req);
    this.saveData();
    return req;
  }

  public updateLearnerRequest(id: string, updates: Partial<LearnerRequest>) {
    const idx = this.data.learnerRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.learnerRequests[idx] = { ...this.data.learnerRequests[idx], ...updates };
      this.saveData();
      return this.data.learnerRequests[idx];
    }
    return null;
  }

  public createMatch(match: Match) {
    this.data.matches.unshift(match);
    this.saveData();
    return match;
  }

  public createBooking(booking: Booking) {
    this.data.bookings.unshift(booking);
    this.saveData();
    return booking;
  }

  public updateBooking(id: string, updates: Partial<Booking>) {
    const idx = this.data.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.bookings[idx] = { ...this.data.bookings[idx], ...updates };
      this.saveData();
      return this.data.bookings[idx];
    }
    return null;
  }

  public createPayment(payment: Payment) {
    this.data.payments.unshift(payment);
    this.saveData();
    return payment;
  }

  public updatePayment(id: string, updates: Partial<Payment>) {
    const idx = this.data.payments.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.payments[idx] = { ...this.data.payments[idx], ...updates, updated_at: new Date().toISOString() };
      this.saveData();
      return this.data.payments[idx];
    }
    return null;
  }

  public createTransaction(tx: Transaction) {
    this.data.transactions.unshift(tx);
    this.saveData();
    return tx;
  }

  public createReview(review: Review) {
    this.data.reviews.unshift(review);
    
    // Update educator rating & count
    const educator = this.data.educators.find(e => e.id === review.educator_id);
    if (educator) {
      const allEducatorReviews = this.data.reviews.filter(r => r.educator_id === educator.id);
      const avg = allEducatorReviews.reduce((sum, r) => sum + r.rating, 0) / allEducatorReviews.length;
      educator.rating = Number(avg.toFixed(2));
      educator.total_reviews = allEducatorReviews.length;
    }

    this.saveData();
    return review;
  }

  public replyToReview(reviewId: string, reply: string) {
    const review = this.data.reviews.find(r => r.id === reviewId);
    if (review) {
      review.educator_reply = reply;
      this.saveData();
      return review;
    }
    return null;
  }

  public createMessage(msg: Message) {
    this.data.messages.push(msg);
    this.saveData();
    return msg;
  }

  public markMessagesRead(conversationId: string, userId: string) {
    this.data.messages.forEach(m => {
      if (m.conversation_id === conversationId && m.receiver_id === userId) {
        m.is_read = true;
      }
    });
    this.saveData();
  }

  public createNotification(notif: Notification) {
    this.data.notifications.unshift(notif);
    this.saveData();
    return notif;
  }

  public markNotificationRead(id: string) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.saveData();
    }
  }

  public logAdminAction(action: Omit<AdminAction, 'id' | 'created_at'>) {
    const newAction: AdminAction = {
      ...action,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.data.adminActions.unshift(newAction);
    this.saveData();
    return newAction;
  }

  public addEducatorSkill(skill: EducatorSkill) {
    this.data.educatorSkills.push(skill);
    this.saveData();
    return skill;
  }

  public addQualification(qual: Qualification) {
    this.data.qualifications.push(qual);
    this.saveData();
    return qual;
  }

  public addPortfolio(port: Portfolio) {
    this.data.portfolios.push(port);
    this.saveData();
    return port;
  }

  public addVerification(v: Verification) {
    const idx = this.data.verifications.findIndex(item => item.educator_id === v.educator_id);
    if (idx !== -1) {
      this.data.verifications[idx] = v;
    } else {
      this.data.verifications.push(v);
    }
    this.saveData();
    return v;
  }

  public updateVerification(educatorId: string, updates: Partial<Verification>) {
    const idx = this.data.verifications.findIndex(v => v.educator_id === educatorId);
    if (idx !== -1) {
      this.data.verifications[idx] = { ...this.data.verifications[idx], ...updates };
      this.saveData();
      return this.data.verifications[idx];
    }
    return null;
  }

  public createInquiry(inquiry: Inquiry) {
    if (!this.data.inquiries) this.data.inquiries = [];
    this.data.inquiries.unshift(inquiry);
    this.saveData();
    return inquiry;
  }

  public createNewsletterSubscriber(sub: NewsletterSubscriber) {
    if (!this.data.newsletterSubscribers) this.data.newsletterSubscribers = [];
    const exists = this.data.newsletterSubscribers.some(s => s.email.toLowerCase() === sub.email.toLowerCase());
    if (exists) return sub;
    this.data.newsletterSubscribers.unshift(sub);
    this.saveData();
    return sub;
  }
}

export const db = new Database();
