import { User } from '../types';

// Registration gives every new educator a placeholder profile with this title (server/accounts.ts);
// it is replaced when they send the application from their account.
export const REGISTRATION_TITLE = 'Practical Skills Educator';

export const APPLY_PATH = '/dashboard/educator/apply';

/** True once the educator has sent the full application, not just registered. */
export const hasSentApplication = (user: User | null | undefined) =>
  !!user?.educatorProfile && user.educatorProfile.title !== REGISTRATION_TITLE;
