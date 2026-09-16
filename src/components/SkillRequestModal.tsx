import React, { useState } from 'react';
import { TeachingFormat, SkillLevel, MatchEvaluation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, CheckCircle2, Sparkles, MapPin, Calendar, Clock,
  DollarSign, ArrowRight, AlertCircle, ShieldCheck, UserCheck
} from 'lucide-react';

interface SkillRequestModalProps {
  onClose: () => void;
  onRequestCreated?: () => void;
  onSelectEducator?: (educatorId: string) => void;
}

export const SkillRequestModal: React.FC<SkillRequestModalProps> = ({
  onClose,
  onRequestCreated,
  onSelectEducator
}) => {
  const { user, learnerProfile } = useAuth();

  const [step, setStep] = useState<'form' | 'matches'>('form');
  const [skillName, setSkillName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [formatPreference, setFormatPreference] = useState<TeachingFormat>('in-person');
  const [location, setLocation] = useState(learnerProfile?.location || 'Mbarara City');
  const [preferredSchedule, setPreferredSchedule] = useState('Weekends (Saturdays & Sundays, Morning)');
  const [frequency, setFrequency] = useState('2 sessions per week (4 weeks)');
  const [budgetUGX, setBudgetUGX] = useState<number>(250000);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [learnerName, setLearnerName] = useState(user?.name || '');
  const [learnerEmail, setLearnerEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matches, setMatches] = useState<MatchEvaluation[]>([]);

  const predefinedPopularSkills = [
    'Garment Pattern Drafting & Cutting',
    'Industrial Sewing Machine Mastery',
    'Full-Stack Web Development (React & Node)',
    'Smartphone Hardware Diagnostics & Repair',
    'Solar PV System Sizing & Installation',
    'Commercial Pastry & Cake Decorating',
    'Electric Arc & MIG Welding',
    'SME Bookkeeping & QuickBooks Online',
    'Bridal & Glamour Makeup Artistry',
    'Commercial Poultry & Broiler Farming'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const learnerId = learnerProfile?.id || (user?.role === 'learner' ? 'lrn-1' : 'lrn-1');
      const result = await api.createLearnerRequest({
        learner_id: learnerId,
        skill_name: skillName,
        skill_level: skillLevel,
        learning_goal: learningGoal,
        format_preference: formatPreference,
        location,
        preferred_schedule: preferredSchedule,
        frequency,
        budget_ugx: budgetUGX,
        additional_notes: additionalNotes,
        contact_phone: contactPhone,
        learner_name: learnerName,
        learner_email: learnerEmail
      });

      setMatches(result.potentialMatches || []);
      setStep('matches');
      if (onRequestCreated) onRequestCreated();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit skill request. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header — pinned */}
        <div className="shrink-0 bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
              Personalized Learning Match
            </span>
            <h3 className="font-bold text-base text-white mt-1">
              {step === 'form' ? 'Submit a Custom Skill Request' : 'Verified Educator Matches'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
              Tell us what practical skill you want to learn. Our rule-based matchmaking algorithm will instantly evaluate verified educators across Mbarara, Ankole, and Uganda based on skill fit, location, budget, and format.
            </div>

            {/* Skill wanted */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Skill Wanted <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="popular-skills"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Garment Pattern Drafting & Cutting, Solar Installation..."
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
              <datalist id="popular-skills">
                {predefinedPopularSkills.map(s => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Current Level & Learning Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Current Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="beginner">Beginner (No prior experience)</option>
                  <option value="intermediate">Intermediate (Some foundation)</option>
                  <option value="advanced">Advanced (Looking for mastery / certification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Format Preference
                </label>
                <select
                  value={formatPreference}
                  onChange={(e) => setFormatPreference(e.target.value as TeachingFormat)}
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="in-person">In-Person Workshop (Hands-on bench/site)</option>
                  <option value="hybrid">Hybrid (Practical in-person + online theory)</option>
                  <option value="online">Online Live (Screen share & 1-on-1 calls)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Specific Learning Goals & Outcome <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master pattern drafting for blazers and dresses; learn how to calibrate industrial straight stitch machines."
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            {/* Location & Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your General Location (City / Suburb)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mbarara High Street, Kakoba, Ruharo, Booma, Kampala"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Budget for Training (UGX) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={10000}
                  min={30000}
                  value={budgetUGX}
                  onChange={(e) => setBudgetUGX(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
                <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">
                  {formatUGX(budgetUGX)} Total Allocation
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Preferred Schedule
                </label>
                <input
                  type="text"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="e.g. Weekends, or Tuesday & Thursday evenings"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Frequency & Target Duration
                </label>
                <input
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g. 2 sessions per week (4 weeks)"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Learner Contact */}
            <div className="border-t border-gray-200 pt-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Your Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Your Name</label>
                  <input
                    type="text"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Email</label>
                  <input
                    type="email"
                    value={learnerEmail}
                    onChange={(e) => setLearnerEmail(e.target.value)}
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            </div>
            {/* Footer — pinned */}
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
                  <span>Evaluating Matches...</span>
                ) : (
                  <>
                    <span>Submit & Find Verified Matches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Matches Result View — flex column with scrollable body + pinned footer */
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Skill Request Submitted Successfully!</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Your request for <span className="font-bold">{skillName}</span> is now active in the matching pool. Here are verified educators matched via rule-based scoring:
              </p>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m, idx) => (
                  <div
                    key={m.educator.id}
                    className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 transition shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={m.educator.user?.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{m.educator.user?.name}</h4>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              {m.match_score}% MATCH
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">{m.educator.title}</p>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                            <span>{m.educator.location}</span>
                            <span>•</span>
                            <span>{formatUGX(m.educator.hourly_rate_ugx)}/hr</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectEducator) onSelectEducator(m.educator.id);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition shrink-0"
                      >
                        View & Book
                      </button>
                    </div>

                    {/* Match Reasons Breakdown */}
                    <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] space-y-1">
                      <span className="font-semibold text-gray-700 block text-[10px] uppercase">
                        Rule-Based Match Criteria:
                      </span>
                      {m.match_reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                Our operations team will review your request and match you with a verified educator within 24 hours.
              </div>
            )}

            </div>
            <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
