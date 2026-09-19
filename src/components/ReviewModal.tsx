import React, { useState } from 'react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X, Star, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

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
    <Modal isOpen={!!booking} onClose={onClose} titleId="review-modal-title" title="Leave Verified Review" maxWidth="max-w-lg">
        <div className="shrink-0 bg-ink-950 text-white p-5 flex items-center justify-between border-b border-ink-800">
          <div>
            <h3 id="review-modal-title" className="font-bold text-sm text-white font-display">Leave Verified Review</h3>
            <p className="text-xs text-ink-300">For {booking.educator?.user?.name || 'Educator'} • {booking.skill_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-control bg-ink-800 hover:bg-ink-700 text-ink-300 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close review"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-center gap-2" role="alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="text-center py-2 space-y-2">
            <label className="block text-xs font-bold text-ink-700 uppercase tracking-wider">
              Overall Experience
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-ink-50 rounded-control transition focus-visible:ring-2 focus-visible:ring-forest-700"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-[13px] font-bold text-forest-800">
              {rating === 5 ? 'Exceptional Mentor & Master' : rating === 4 ? 'Very Good Experience' : 'Standard'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-ink-50 p-3 rounded-card border border-ink-200 text-xs">
            <div>
              <span className="text-[11px] font-bold text-ink-600 block mb-1">Practical Skill</span>
              <select
                value={skillRating}
                onChange={(e) => setSkillRating(Number(e.target.value))}
                className="w-full p-2.5 min-h-[44px] rounded-control border border-ink-200 text-[13px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
              >
                <option value={5}>5★ Master</option>
                <option value={4}>4★ High</option>
                <option value={3}>3★ Good</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-600 block mb-1">Punctuality</span>
              <select
                value={punctualityRating}
                onChange={(e) => setPunctualityRating(Number(e.target.value))}
                className="w-full p-2.5 min-h-[44px] rounded-control border border-ink-200 text-[13px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
              >
                <option value={5}>5★ On Time</option>
                <option value={4}>4★ Minor delay</option>
                <option value={3}>3★ Late</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] font-bold text-ink-600 block mb-1">Teaching Clarity</span>
              <select
                value={communicationRating}
                onChange={(e) => setCommunicationRating(Number(e.target.value))}
                className="w-full p-2.5 min-h-[44px] rounded-control border border-ink-200 text-[13px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
              >
                <option value={5}>5★ Clear</option>
                <option value={4}>4★ Good</option>
                <option value={3}>3★ Fair</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-800 mb-1" htmlFor="review-comment">
              Your Review for Future Learners <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe what practical skills you practiced, how well the educator explained steps, and what you created..."
              className="w-full text-[13px] min-h-[88px] rounded-control border-ink-200 border p-3 bg-white text-ink-900 focus:ring-2 focus:ring-forest-700 focus:outline-none"
              required
            />
          </div>

          </div>
          <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3 pb-safe">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSubmitting} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Publish Verified Review
            </Button>
          </div>
        </form>
    </Modal>
  );
};