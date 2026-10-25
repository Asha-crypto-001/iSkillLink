export type UserRole = 'learner' | 'educator' | 'admin' | 'secondary_admin';

export type EducatorStatus = 'applied' | 'under_review' | 'verification' | 'approved' | 'active' | 'suspended' | 'inactive';

export type TeachingFormat = 'online' | 'in-person' | 'hybrid';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'payment_requested' | 'paid' | 'failed' | 'refunded' | 'completed';

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'cash_escrow';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  whatsapp?: string;
  location?: string;
  avatar_url: string;
  is_primary_admin?: boolean;
  admin_assigned_by?: string;
  admin_assigned_at?: string;
  interests?: string[];
  learnerProfile?: Learner;
  educatorProfile?: Educator;
  created_at: string;
}

export interface Learner {
  id: string;
  user_id: string;
  location: string;
  bio: string;
  learning_interests: string[];
  preferred_format: TeachingFormat;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

export interface Skill {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  level_options: SkillLevel[];
  typical_duration_hours: number;
  popular?: boolean;
}

export interface EducatorSkill {
  id: string;
  educator_id: string;
  skill_id: string;
  skill_name: string;
  category_id: string;
  proficiency_level: SkillLevel;
  hourly_rate_ugx: number;
  package_rate_ugx?: number;
  description: string;
}

export interface Qualification {
  id: string;
  educator_id: string;
  title: string;
  institution: string;
  year: number;
  verified: boolean;
  document_url?: string;
}

export interface Portfolio {
  id: string;
  educator_id: string;
  title: string;
  description: string;
  image_url: string;
  project_link?: string;
  tag: string;
}

export interface Verification {
  id: string;
  educator_id: string;
  national_id_number: string;
  national_id_status: 'pending' | 'verified' | 'rejected';
  background_check_status: 'pending' | 'verified' | 'rejected';
  interview_status: 'pending' | 'scheduled' | 'completed' | 'waived';
  skill_assessment_status: 'pending' | 'verified' | 'rejected';
  verified_by_admin_id?: string;
  verified_at?: string;
  notes?: string;
}

export interface Educator {
  id: string;
  user_id: string;
  user?: User;
  title: string;
  bio: string;
  educator_type: 'artisan' | 'professional' | 'trainer' | 'practitioner' | 'mentor';
  years_experience: number;
  location: string;
  service_area: string;
  teaching_formats: TeachingFormat[];
  languages: string[];
  equipment_provided: string;
  hourly_rate_ugx: number;
  package_rate_ugx?: number;
  status: EducatorStatus;
  verification_notes?: string;
  rating: number;
  total_reviews: number;
  total_students: number;
  featured?: boolean;
  skills?: EducatorSkill[];
  qualifications?: Qualification[];
  portfolios?: Portfolio[];
  reviews?: Review[];
  verification?: Verification;
  created_at: string;
}

export interface LearnerRequest {
  id: string;
  learner_id: string;
  skill_id?: string;
  skill_name: string;
  skill_level: SkillLevel;
  learning_goal: string;
  format_preference: TeachingFormat;
  location: string;
  preferred_schedule: string;
  frequency: string;
  budget_ugx: number;
  additional_notes?: string;
  status: 'open' | 'matched' | 'in_progress' | 'fulfilled' | 'cancelled';
  /** The educator our team matched this request with (only on the learner's own requests). */
  matched_educator?: { id: string; name: string; title: string; hourly_rate_ugx: number; avatar_url: string };
  contact_phone: string;
  learner_name: string;
  learner_email: string;
  created_at: string;
}

export interface MatchEvaluation {
  educator: Educator;
  match_score: number;
  match_reasons: string[];
  breakdown: {
    skillMatch: number;
    formatMatch: number;
    locationMatch: number;
    budgetMatch: number;
    experienceMatch: number;
  };
}

export interface Match {
  id: string;
  request_id: string;
  educator_id: string;
  match_score: number;
  match_reasons: string[];
  matched_by: 'system' | 'admin';
  status: 'suggested' | 'contacted' | 'accepted' | 'declined';
  created_at: string;
}

export interface Booking {
  id: string;
  learner_id: string;
  educator_id: string;
  request_id?: string;
  skill_id?: string;
  skill_name: string;
  format: TeachingFormat;
  location_or_link: string;
  scheduled_date: string;
  start_time: string;
  duration_hours: number;
  total_amount_ugx: number;
  platform_fee_ugx: number;
  educator_payout_ugx: number;
  status: BookingStatus;
  notes?: string;
  milestone_progress: number;
  completed_at?: string;
  educator?: Educator;
  learner?: Learner;
  learnerUser?: User;
  payment?: Payment;
  review?: Review;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  learner_id: string;
  educator_id: string;
  amount_ugx: number;
  platform_fee_ugx: number;
  payout_amount_ugx: number;
  method: PaymentMethod;
  payment_reference: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  payment_id: string;
  type: 'learner_charge' | 'educator_payout' | 'platform_commission' | 'refund';
  amount_ugx: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  educator_id: string;
  learner_id: string;
  learner_name: string;
  learner_avatar?: string;
  rating: number;
  skill_rating: number;
  punctuality_rating: number;
  communication_rating: number;
  comment: string;
  educator_reply?: string;
  is_verified: boolean;
  is_moderated: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking_request' | 'booking_accepted' | 'payment_update' | 'match_found' | 'verification_update' | 'system_alert';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  target_entity: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface AdminMetrics {
  totalLearners: number;
  activeEducators: number;
  pendingApplications: number;
  activeBookings: number;
  completedSessions: number;
  totalVolumeUgx: number;
  platformRevenueUgx: number;
  openRequests: number;
}
