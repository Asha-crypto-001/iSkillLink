import React, { useState } from 'react';
import { Educator, TeachingFormat } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, Calendar, ShieldCheck, CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';

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

  const hourlyRate = educator.hourly_rate_ugx || 35000;
  const totalAmount = hourlyRate * durationHours;
  const platformFee = Math.round(totalAmount * 0.10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');
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
      const learnerId = learnerProfile?.id || (user?.role === 'learner' ? 'lrn-1' : 'lrn-1');
      await api.createBooking({
        learner_id: learnerId,
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
    <Modal isOpen={!!educator} onClose={onClose} titleId="booking-modal-title" title="Book Practical Learning Session" maxWidth="max-w-xl">
        <div id="booking-modal-title" className="shrink-0 bg-ink-950 text-white p-5 flex items-center justify-between border-b border-ink-800">
          <div className="flex items-center gap-3">
            <img
              src={educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={educator.user?.name}
              className="w-10 h-10 rounded-card object-cover border border-ink-800"
            />
            <div>
              <h3 className="font-bold text-[15px] text-white font-display">Book Practical Learning Session</h3>
              <p className="text-xs text-ink-300">With {educator.user?.name} — {educator.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close booking"
            className="p-2 rounded-control bg-ink-800 hover:bg-ink-700 text-ink-300 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Field label="Select Skill Focus / Module" htmlFor="booking-skill">
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
              <option value={educator.title}>General 1-on-1 Apprenticeship & Consultation</option>
            </Select>
          </Field>

          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-1.5">
              Learning Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {educator.teaching_formats.map(f => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFormat(f)}
                  aria-pressed={format === f}
                  className={`p-3 text-[13px] font-medium rounded-control border capitalize transition text-center min-h-[44px] ${
                    format === f
                      ? 'bg-forest-50 border-forest-600 text-forest-800 font-bold'
                      : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
                </button>
              ))}
            </div>
          </div>

          {format !== 'online' && (
            <Field label="Workshop / Training Location" htmlFor="booking-location" required>
              <Input
                id="booking-location"
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Educator Workshop, Kiyembe Arcade Room 304"
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

            <Field label="Start Time" htmlFor="booking-time" required>
              <Input
                id="booking-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Field>

            <Field label="Duration (Hours)" htmlFor="booking-duration" required>
              <Select
                id="booking-duration"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours (Standard Practical)</option>
                <option value={3}>3 Hours (Intensive Workshop)</option>
                <option value={4}>4 Hours (Half Day)</option>
                <option value={8}>8 Hours (Full Day Immersion)</option>
              </Select>
            </Field>
          </div>

          <Field label="What specific project or skill goal do you want to achieve?" htmlFor="booking-notes" hint="Be specific — educators prepare tools accordingly">
            <Textarea
              id="booking-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master pattern cutting for female jacket sleeves; bringing my own fabrics."
            />
          </Field>

          <div className="bg-forest-50/70 rounded-card p-4 border border-forest-200 text-[13px] space-y-2">
            <div className="flex justify-between items-center text-ink-700">
              <span>Hourly Rate:</span>
              <span className="font-semibold">{formatUGX(hourlyRate)} / hr</span>
            </div>
            <div className="flex justify-between items-center text-ink-700">
              <span>Duration:</span>
              <span className="font-semibold">{durationHours} Hours</span>
            </div>
            <div className="flex justify-between items-center text-ink-700 border-t border-forest-200 pt-2 font-bold text-[15px] text-ink-900">
              <span>Total Session Fee:</span>
              <span className="text-forest-800">{formatUGX(totalAmount)}</span>
            </div>
            <p className="text-xs text-ink-600 leading-relaxed pt-1 flex gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
              Funds are held securely in iSkillLink Escrow (via MTN/Airtel MoMo) and released only after the educator completes the scheduled session.
            </p>
          </div>

          </div>
          <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Confirm & Send Request
            </Button>
          </div>
        </form>
    </Modal>
  );
};
