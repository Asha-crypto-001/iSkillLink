import React, { useState } from 'react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X, Star, CheckCircle2, AlertCircle, MessageSquare
} from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onReviewSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  onClose,
  onReviewSuccess
}) => {
  if (!booking) return null;

  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [skillRating, setSkillRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.submitReview({
        booking_id: booking.id,
        educator_id: booking.educator_id,
        learner_id: booking.learner_id,
        learner_name: user?.name || 'Verified Learner',
        learner_avatar: user?.avatar_url,
        rating,
        skill_rating: skillRating,
        punctuality_rating: punctualityRating,
        communication_rating: communicationRating,
        comment
      });

      onReviewSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header — pinned */}
        <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white">Leave Verified Review</h3>
            <p className="text-xs text-slate-300">For {booking.educator?.user?.name || 'Educator'} • {booking.skill_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Overall Star Rating */}
          <div className="text-center py-2 space-y-1">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Overall Experience
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-emerald-800">
              {rating === 5 ? 'Exceptional Mentor & Master' : rating === 4 ? 'Very Good Experience' : 'Standard'}
            </div>
          </div>

          {/* Sub Criteria */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="text-[11px] font-semibold text-gray-600 block mb-1">Practical Skill</span>
              <select
                value={skillRating}
                onChange={(e) => setSkillRating(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-gray-300 text-xs bg-white text-gray-900"
              >
                <option value={5}>5★ Master</option>
                <option value={4}>4★ High</option>
                <option value={3}>3★ Good</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-600 block mb-1">Punctuality</span>
              <select
                value={punctualityRating}
                onChange={(e) => setPunctualityRating(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-gray-300 text-xs bg-white text-gray-900"
              >
                <option value={5}>5★ On Time</option>
                <option value={4}>4★ Minor delay</option>
                <option value={3}>3★ Late</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-600 block mb-1">Teaching Clarity</span>
              <select
                value={communicationRating}
                onChange={(e) => setCommunicationRating(Number(e.target.value))}
                className="w-full p-1.5 rounded border border-gray-300 text-xs bg-white text-gray-900"
              >
                <option value={5}>5★ Clear</option>
                <option value={4}>4★ Good</option>
                <option value={3}>3★ Fair</option>
              </select>
            </div>
          </div>

          {/* Written feedback */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Your Review / Feedback for Future Learners <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe what practical skills you practiced, how well the educator explained the steps, and what you created..."
              className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              required
            />
          </div>

          </div>
          <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
