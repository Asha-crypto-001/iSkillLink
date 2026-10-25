import { Booking } from '../types';
import { BadgeVariant } from '../components/ui/Badge';

export type BookingAudience = 'learner' | 'educator';

export interface BookingStage {
  /** Steps of the journey for this audience, in order. */
  steps: string[];
  /** How many steps are finished (0 – steps.length). */
  done: number;
  /** Short status for a badge, written for whoever is looking. */
  label: string;
  variant: BadgeVariant;
  /** True for declined or cancelled bookings, which leave the journey. */
  stopped: boolean;
}

const LEARNER_STEPS = ['Requested', 'Accepted', 'Paid', 'Session', 'Reviewed'];
const EDUCATOR_STEPS = ['Requested', 'Accepted', 'Paid', 'Session done', 'Paid out'];

export const isBookingPaid = (b: Booking) => b.payment?.status === 'paid' || b.payment?.status === 'completed';

/**
 * One reading of a booking's state for both dashboards: request → accept → pay → session →
 * review (learner) or payout (educator). Badges and the journey bar both come from here.
 */
export function bookingStage(b: Booking, audience: BookingAudience): BookingStage {
  const steps = audience === 'learner' ? LEARNER_STEPS : EDUCATOR_STEPS;
  const other = audience === 'learner'
    ? b.educator?.user?.name?.split(' ')[0] || 'the educator'
    : b.learnerUser?.name?.split(' ')[0] || 'the learner';

  if (b.status === 'declined') {
    return { steps, done: 1, label: audience === 'learner' ? `${other} couldn’t take it` : 'Declined', variant: 'neutral', stopped: true };
  }
  if (b.status === 'cancelled') {
    return { steps, done: 1, label: 'Cancelled', variant: 'neutral', stopped: true };
  }
  if (b.status === 'pending' || b.status === 'accepted') {
    return { steps, done: 1, label: audience === 'learner' ? `Waiting for ${other}` : 'Needs your reply', variant: 'warning', stopped: false };
  }
  if (b.status === 'confirmed' || b.status === 'in_progress') {
    if (!isBookingPaid(b)) {
      return { steps, done: 2, label: audience === 'learner' ? 'Accepted · pay to confirm' : `Waiting for ${other} to pay`, variant: 'warning', stopped: false };
    }
    return { steps, done: 3, label: b.status === 'in_progress' ? 'In progress' : 'Paid · coming up', variant: 'info', stopped: false };
  }
  // Completed
  if (audience === 'learner') {
    return b.review
      ? { steps, done: 5, label: 'Done · reviewed', variant: 'success', stopped: false }
      : { steps, done: 4, label: 'Done · leave a review', variant: 'success', stopped: false };
  }
  return b.payment?.status === 'completed'
    ? { steps, done: 5, label: 'Paid out', variant: 'success', stopped: false }
    : { steps, done: 4, label: 'Done · payout on its way', variant: 'held', stopped: false };
}

/** Sessions still ahead, soonest first. */
export function upcomingBookings(bookings: Booking[]) {
  return bookings
    .filter(b => ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status))
    .sort((a, b) => `${a.scheduled_date} ${a.start_time}`.localeCompare(`${b.scheduled_date} ${b.start_time}`));
}
