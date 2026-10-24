import crypto from 'crypto';
import { db } from './db.js';
import { User, Learner, Educator, TeachingFormat } from './types.js';
import { hashPasswordSync } from './utils/security.js';

interface RoleProfileDetails {
  location?: string;
  bio?: string;
  learning_interests?: string[];
  preferred_format?: TeachingFormat;
}

/**
 * Password hash for accounts that authenticate elsewhere (Google, Supabase).
 * Random, so the account can never be signed into with a password.
 */
export function unusablePasswordHash(): string {
  return hashPasswordSync(`external-auth-${crypto.randomBytes(32).toString('hex')}`);
}

/**
 * Creates the learner or educator profile that belongs to a newly created user.
 * Educators also get a pending verification record and the admin is notified.
 */
export function createRoleProfile(user: User, details: RoleProfileDetails = {}) {
  let learnerProfile: Learner | null = null;
  let educatorProfile: Educator | null = null;

  if (user.role === 'learner') {
    learnerProfile = {
      id: `lrn-${Date.now()}`,
      user_id: user.id,
      location: details.location || 'Mbarara, Uganda',
      bio: details.bio || 'Interested in learning practical skills.',
      learning_interests: details.learning_interests || [],
      preferred_format: details.preferred_format || 'in-person',
      created_at: new Date().toISOString()
    };
    db.createLearner(learnerProfile);
  } else if (user.role === 'educator') {
    educatorProfile = {
      id: `edu-${Date.now()}`,
      user_id: user.id,
      title: 'Practical Skills Educator',
      bio: details.bio || 'Sharing practical vocational expertise in Uganda.',
      educator_type: 'practitioner',
      years_experience: 1,
      location: details.location || 'Mbarara, Uganda',
      service_area: 'Mbarara City & Western Region',
      teaching_formats: ['in-person'],
      languages: ['English', 'Runyankole'],
      equipment_provided: 'Workshop practical equipment',
      hourly_rate_ugx: 35000,
      status: 'applied',
      rating: 0,
      total_reviews: 0,
      total_students: 0,
      created_at: new Date().toISOString()
    };
    db.createEducator(educatorProfile);

    // Create verification entry
    db.addVerification({
      id: `v-${educatorProfile.id}`,
      educator_id: educatorProfile.id,
      national_id_number: 'CM-PENDING-SUBMISSION',
      national_id_status: 'pending',
      background_check_status: 'pending',
      interview_status: 'pending',
      skill_assessment_status: 'pending',
      notes: 'New educator registered. Pending verification.'
    });

    // Notify Ashabahebwa Hassan (Admin)
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: 'usr-admin-ashabahebwa',
      type: 'system_alert',
      title: 'New Educator Registered',
      message: `${user.name} has registered as an educator from ${details.location || 'Mbarara'}.`,
      link: '/admin-dashboard',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  return { learnerProfile, educatorProfile };
}

/**
 * Returns the learner profile owned by a user, creating a default one for learner
 * accounts that predate automatic profile creation.
 */
export function getOrCreateLearnerProfile(userId: string): Learner | null {
  const existing = db.findLearnerByUserId(userId);
  if (existing) return existing;

  const user = db.findUserById(userId);
  if (!user || user.role !== 'learner') return null;

  return createRoleProfile(user, { location: user.location }).learnerProfile;
}
