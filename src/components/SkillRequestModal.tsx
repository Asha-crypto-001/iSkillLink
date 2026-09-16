import React, { useState } from 'react';
import { TeachingFormat, SkillLevel, MatchEvaluation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, CheckCircle2, ArrowRight, AlertCircle, ShieldCheck
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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
    <Modal isOpen={true} onClose={onClose} titleId="skill-request-title" title={step === 'form' ? 'Submit a Custom Skill Request' : 'Verified Educator Matches'} maxWidth="max-w-2xl">
        <div className="shrink-0 bg-ink-950 text-white p-5 flex items-center justify-between border-b border-ink-800">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold bg-forest-900/80 text-forest-300 px-2 py-0.5 rounded border border-forest-700">
              Personalized Learning Match
            </span>
            <h3 id="skill-request-title" className="font-bold text-base text-white mt-1 font-display">
              {step === 'form' ? 'Submit a Custom Skill Request' : 'Verified Educator Matches'}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-control bg-ink-800 hover:bg-ink-700 text-ink-300 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-control bg-rose-50 border border-rose-200 text-rose-700 text-[13px] flex items-center gap-2" role="alert">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="text-[13px] text-ink-600 bg-ink-50 p-3 rounded-card border border-ink-200">
              Tell us what practical skill you want to learn. Our rule-based matchmaking will instantly evaluate verified educators across Mbarara, Ankole, and Uganda based on skill fit, location, budget, and format.
            </div>

            <Field label="Skill Wanted" htmlFor="skill-wanted" required>
              <Input
                id="skill-wanted"
                type="text"
                list="popular-skills"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Garment Pattern Drafting & Cutting, Solar Installation..."
                required
              />
            </Field>
            <datalist id="popular-skills">
              {predefinedPopularSkills.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Your Current Skill Level" htmlFor="skill-level">
                <Select
                  id="skill-level"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                >
                  <option value="beginner">Beginner (No prior experience)</option>
                  <option value="intermediate">Intermediate (Some foundation)</option>
                  <option value="advanced">Advanced (Looking for mastery / certification)</option>
                </Select>
              </Field>

              <Field label="Format Preference" htmlFor="format-pref">
                <Select
                  id="format-pref"
                  value={formatPreference}
                  onChange={(e) => setFormatPreference(e.target.value as TeachingFormat)}
                >
                  <option value="in-person">In-Person Workshop (Hands-on bench/site)</option>
                  <option value="hybrid">Hybrid (Practical in-person + online theory)</option>
                  <option value="online">Online Live (Screen share & 1-on-1 calls)</option>
                </Select>
              </Field>
            </div>

            <Field label="Specific Learning Goals & Outcome" htmlFor="learning-goal" required>
              <Textarea
                id="learning-goal"
                rows={2}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master pattern drafting for blazers and dresses; learn how to calibrate industrial straight stitch machines."
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Your General Location (City / Suburb)" htmlFor="req-location" required>
                <Input
                  id="req-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mbarara High Street, Kakoba, Ruharo, Booma, Kampala"
                  required
                />
              </Field>

              <Field label="Total Budget for Training (UGX)" htmlFor="req-budget" required>
                <Input
                  id="req-budget"
                  type="number"
                  step={10000}
                  min={30000}
                  value={budgetUGX}
                  onChange={(e) => setBudgetUGX(Number(e.target.value))}
                  required
                />
              </Field>
            </div>
            <p className="text-xs text-forest-700 font-semibold -mt-2">
              {formatUGX(budgetUGX)} Total Allocation
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Preferred Schedule" htmlFor="req-schedule">
                <Input
                  id="req-schedule"
                  type="text"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="e.g. Weekends, or Tuesday & Thursday evenings"
                />
              </Field>

              <Field label="Frequency & Target Duration" htmlFor="req-frequency">
                <Input
                  id="req-frequency"
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g. 2 sessions per week (4 weeks)"
                />
              </Field>
            </div>

            <div className="border-t border-ink-200 pt-4">
              <h4 className="text-xs font-bold text-ink-800 uppercase tracking-wider mb-3">
                Your Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Your Name" htmlFor="req-name" required>
                  <Input
                    id="req-name"
                    type="text"
                    value={learnerName}
                    onChange={(e) => setLearnerName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Phone / WhatsApp" htmlFor="req-phone" required>
                  <Input
                    id="req-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Email" htmlFor="req-email" required>
                  <Input
                    id="req-email"
                    type="email"
                    value={learnerEmail}
                    onChange={(e) => setLearnerEmail(e.target.value)}
                    required
                  />
                </Field>
              </div>
            </div>

            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Submit & Find Verified Matches
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-forest-50 rounded-card p-4 border border-forest-200 flex gap-3">
              <div className="w-8 h-8 rounded-control bg-forest-100 border border-forest-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-forest-700" />
              </div>
              <div>
                <div className="font-bold text-forest-900 text-[13px]">Skill Request Submitted Successfully!</div>
                <p className="text-[13px] text-forest-800 mt-1">
                  Your request for <span className="font-bold">{skillName}</span> is now active in the matching pool. Here are verified educators matched via rule-based scoring:
                </p>
              </div>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div
                    key={m.educator.id}
                    className="p-4 rounded-card border border-ink-200 bg-white hover:border-forest-200 hover:shadow-level-1 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.educator.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={m.educator.user?.name}
                          className="w-12 h-12 rounded-card object-cover border border-ink-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-ink-900 text-[15px] font-display">{m.educator.user?.name}</h4>
                            <Badge variant="success" size="sm">{m.match_score}% MATCH</Badge>
                          </div>
                          <p className="text-[13px] text-ink-600">{m.educator.title}</p>
                          <div className="text-xs text-ink-500 flex items-center gap-2 mt-0.5">
                            <span>{m.educator.location}</span>
                            <span>•</span>
                            <span>{formatUGX(m.educator.hourly_rate_ugx)}/hr</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onClose();
                          if (onSelectEducator) onSelectEducator(m.educator.id);
                        }}
                      >
                        View & Book
                      </Button>
                    </div>

                    <div className="bg-ink-50 p-3 rounded-control border border-ink-100 text-xs space-y-1.5">
                      <span className="font-semibold text-ink-700 block text-[11px] uppercase tracking-wider">
                        Rule-Based Match Criteria:
                      </span>
                      {m.match_reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-ink-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-[13px] text-ink-600 bg-ink-50 rounded-card border border-ink-200">
                Our operations team will review your request and match you with a verified educator within 24 hours.
              </div>
            )}

            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-100 flex items-center justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
};
