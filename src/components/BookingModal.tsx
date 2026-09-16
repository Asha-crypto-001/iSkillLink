import React, { useState } from 'react';
import { Educator, TeachingFormat } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, Calendar, Clock, MapPin, ShieldCheck, CheckCircle2,
  AlertCircle, ChevronRight, CreditCard
} from 'lucide-react';

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
  const educatorPayout = totalAmount - platformFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError('');
    // 4.3 Date constraints: past date + 90-day window + conflict check
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header — pinned */}
        <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={educator.user?.name}
              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
            />
            <div>
              <h3 className="font-bold text-sm text-white">Book Practical Learning Session</h3>
              <p className="text-xs text-slate-300">With {educator.user?.name} ({educator.title})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form — body scrollable, footer pinned */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Skill / Module selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Select Skill Focus / Module
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {educator.skills?.map(s => (
                <option key={s.id} value={s.skill_name}>
                  {s.skill_name} ({formatUGX(s.hourly_rate_ugx)}/hr)
                </option>
              ))}
              <option value={educator.title}>General 1-on-1 Apprenticeship & Consultation</option>
            </select>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Learning Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {educator.teaching_formats.map(f => (
                <button
                  type="button"
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`p-2.5 text-xs font-medium rounded-lg border capitalize transition text-center ${
                    format === f
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f === 'in-person' ? 'In-Person Workshop' : f === 'online' ? 'Online Live' : 'Hybrid'}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Workshop address */}
          {format !== 'online' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Workshop / Training Location
              </label>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                placeholder="e.g. Educator Workshop, Kiyembe Arcade Room 304"
                required
              />
            </div>
          )}

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => { setScheduledDate(e.target.value); if(dateError) setDateError(''); }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${dateError ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                required
              />
              {dateError && <span className="text-[11px] text-rose-600 mt-1 block">{dateError}</span>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration (Hours)
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value={1}>1 Hour</option>
                <option value={2}>2 Hours (Standard Practical)</option>
                <option value={3}>3 Hours (Intensive Workshop)</option>
                <option value={4}>4 Hours (Half Day)</option>
                <option value={8}>8 Hours (Full Day Immersion)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              What specific project or skill goal do you want to achieve?
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master pattern cutting for female jacket sleeves; bringing my own fabrics."
              className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Transparent Escrow Pricing Summary */}
          <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-gray-700">
              <span>Hourly Rate:</span>
              <span className="font-semibold">{formatUGX(hourlyRate)} / hr</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Duration:</span>
              <span className="font-semibold">{durationHours} Hours</span>
            </div>
            <div className="flex justify-between items-center text-gray-700 border-t border-emerald-200 pt-2 font-bold text-sm text-gray-900">
              <span>Total Session Fee:</span>
              <span className="text-emerald-800">{formatUGX(totalAmount)}</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed pt-1">
              Funds are held securely in iSkillLink Escrow (via MTN/Airtel MoMo) and released only after the educator completes the scheduled session.
            </p>
          </div>

          </div>
          {/* Footer — pinned, always reachable above keyboard */}
          <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
