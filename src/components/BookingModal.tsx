import React, { useState } from 'react';
import { Educator, TeachingFormat } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, Calendar, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { SignInPrompt } from './SignInPrompt';
import { Alert } from './ui/Alert';
import { Avatar } from './ui/Avatar';

interface BookingModalProps {
  educator: Educator | null;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  educator,
  onClose,
  onBookingSuccess
}) => {
  if (!educator) return null;

  const { user, learnerProfile } = useAuth();

  const [selectedSkill, setSelectedSkill] = useState(
    educator.skills?.[0]?.skill_name || educator.title
  );
  const [format, setFormat] = useState<TeachingFormat>(
    educator.teaching_formats[0] || 'in-person'
  );
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('10:00');
  const [durationHours, setDurationHours] = useState(3);
  const [notes, setNotes] = useState('');
  const [customLocation, setCustomLocation] = useState(educator.location);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dateError, setDateError] = useState('');

  // The price follows the skill chosen (each skill can have its own rate).
  const selectedSkillRate = educator.skills?.find(s => s.skill_name === selectedSkill)?.hourly_rate_ugx;
  const hourlyRate = selectedSkillRate || educator.hourly_rate_ugx || 35000;
  const firstName = educator.user?.name?.split(' ')[0] || 'The educator';
  const totalAmount = hourlyRate * durationHours;
  const platformFee = Math.round(totalAmount * 0.10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');
    if (!user) {
      setErrorMsg('Please sign in with a learner account to book a session.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (scheduledDate < today) {
      setDateError('Cannot book a past date. Please select today or a future date.');
      return;
    }
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 90);
    if (scheduledDate > maxDate.toISOString().split('T')[0]) {
      setDateError('Bookings can only be made up to 90 days in advance.');
      return;
    }
    try {
      const existing = await api.getBookings({ educator_id: educator.id });
      const conflict = existing.some(b => b.scheduled_date === scheduledDate && !['cancelled','declined'].includes(b.status));
      if (conflict) {
        setDateError('Educator already has a booking on this date. Please choose another date.');
        return;
      }
    } catch {}
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // The API books for the signed-in learner; learner_id only matters for admins and demo mode.
      await api.createBooking({
        learner_id: learnerProfile?.id,
        educator_id: educator.id,
        skill_name: selectedSkill,
        format,
        location_or_link: format === 'online' ? 'iSkillLink Virtual Room' : customLocation,
        scheduled_date: scheduledDate,
        start_time: startTime,
        duration_hours: durationHours,
        total_amount_ugx: totalAmount,
        notes
      });

      onBookingSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={!!educator} onClose={onClose} titleId="booking-modal-title" title={`Book a session with ${educator.user?.name}`} maxWidth="max-w-xl">
        <div className="shrink-0 bg-white px-5 py-4 flex items-center justify-between gap-3 border-b border-ink-200">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={educator.user?.avatar_url} name={educator.user?.name} className="w-11 h-11 rounded-card" />
            <div className="min-w-0">
              <h3 id="booking-modal-title" className="font-bold text-lg text-ink-900 font-display truncate">Book a session with {firstName}</h3>
              <p className="text-sm text-ink-600 truncate">{educator.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking"
            className="rounded-control text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition w-11 h-11 shrink-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <SignInPrompt
            title={`Sign in to book ${educator.user?.name?.split(' ')[0] || 'this educator'}`}
            description="Bookings are tied to your account so your payment, session and review stay together. It takes a minute."
            next={`/educators/${educator.id}`}
            onClose={onClose}
          />
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <Alert>{errorMsg}</Alert>
          )}

          <Field label="What do you want to learn?" htmlFor="booking-skill">
            <Select
              id="booking-skill"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              {educator.skills?.map(s => (
                <option key={s.id} value={s.skill_name}>
                  {s.skill_name} ({formatUGX(s.hourly_rate_ugx)}/hr)
                </option>
              ))}
              <option value={educator.title}>Something else — I’ll describe it below</option>
            </Select>
          </Field>

          {educator.teaching_formats.length > 1 ? (
            <fieldset>
              <legend className="block text-[14px] font-semibold text-ink-700 mb-1.5">How do you want to learn?</legend>
              <div className="grid grid-cols-3 gap-2">
                {educator.teaching_formats.map(f => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setFormat(f)}
                    aria-pressed={format === f}
                    className={`px-2 text-[14px] font-medium rounded-control border transition text-center min-h-[44px] ${
                      format === f
                        ? 'bg-forest-50 border-forest-600 text-forest-800 font-bold'
                        : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {f === 'in-person' ? 'At the workshop' : f === 'online' ? 'Online' : 'Mix of both'}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : (
            <p className="text-sm text-ink-700">
              {firstName} teaches {format === 'online' ? 'online' : format === 'hybrid' ? 'a mix of online and at the workshop' : 'at their workshop'}.
            </p>
          )}

          {format !== 'online' && (
            <Field label="Where" htmlFor="booking-location" required hint="Prefilled with the educator’s workshop — change it if you agreed somewhere else.">
              <Input
                id="booking-location"
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Kakoba market, stall 12"
                required
              />
            </Field>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Date" htmlFor="booking-date" required error={dateError || undefined}>
              <Input
                id="booking-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => { setScheduledDate(e.target.value); if(dateError) setDateError(''); }}
                min={new Date().toISOString().split('T')[0]}
                required
                error={!!dateError}
              />
            </Field>

            <Field label="Start time" htmlFor="booking-time" required>
              <Input
                id="booking-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Field>

            <Field label="How long" htmlFor="booking-duration" required>
              <Select
                id="booking-duration"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
                <option value={4}>Half day (4 hrs)</option>
                <option value={8}>Full day (8 hrs)</option>
              </Select>
            </Field>
          </div>

          <Field label="Anything the educator should know?" htmlFor="booking-notes" hint="What you want to make, what you can already do, what you’ll bring — it helps them prepare.">
            <Textarea
              id="booking-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master pattern cutting for female jacket sleeves; bringing my own fabrics."
            />
          </Field>

          <div className="rounded-card border border-ink-200 bg-ink-50 p-4 space-y-3 text-[14px]">
            <div className="flex justify-between items-baseline">
              <span className="text-ink-700">{formatUGX(hourlyRate)} × {durationHours} {durationHours === 1 ? 'hour' : 'hours'}</span>
              <span className="font-display text-lg font-bold text-ink-900">{formatUGX(totalAmount)}</span>
            </div>
            <p className="font-semibold text-ink-900">Nothing is charged now.</p>
            {/* What happens after "Send request" — the escrow promise, step by step */}
            <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-ink-700">
              {[
                'You send this request',
                `${firstName} confirms`,
                'You pay with MoMo — we hold it',
                'Money released after the session'
              ].map((step, i) => (
                <li key={step} className="flex gap-1.5">
                  <span className={`shrink-0 w-5 h-5 rounded-full text-[12px] font-bold flex items-center justify-center ${i === 2 ? 'bg-clay-600 text-white' : 'bg-white border border-ink-300 text-ink-700'}`} aria-hidden="true">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          </div>
          <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3 pb-safe">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting}>
              Send request
            </Button>
          </div>
        </form>
        )}
    </Modal>
  );
};
