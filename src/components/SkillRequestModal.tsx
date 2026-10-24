import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeachingFormat, SkillLevel, MatchEvaluation } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  X, CheckCircle2, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Modal } from './ui/Modal';
import { Field } from './ui/Field';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SignInPrompt } from './SignInPrompt';
import { Alert } from './ui/Alert';
import { Avatar } from './ui/Avatar';

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
  const navigate = useNavigate();

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
    if (!user) {
      setErrorMsg('Please sign in with a learner account to submit a skill request.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // The API files the request for the signed-in learner; learner_id only matters for admins and demo mode.
      const result = await api.createLearnerRequest({
        learner_id: learnerProfile?.id,
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
    <Modal isOpen={true} onClose={onClose} titleId="skill-request-title" title={step === 'form' ? 'Tell us what you want to learn' : 'People who could teach you'} maxWidth="max-w-2xl">
        <div className="shrink-0 bg-white px-5 py-4 flex items-center justify-between gap-3 border-b border-ink-200">
          <div>
            <h3 id="skill-request-title" className="font-bold text-lg text-ink-900 font-display">
              {step === 'form' ? 'Tell us what you want to learn' : 'People who could teach you'}
            </h3>
            {step === 'form' && <p className="text-sm text-ink-600">We’ll look for someone who fits and introduce you on WhatsApp.</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-control text-ink-500 hover:bg-ink-100 hover:text-ink-900 transition w-11 h-11 shrink-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!user ? (
          <SignInPrompt
            title="Sign in to send a request"
            description="We reply to requests on WhatsApp and in your dashboard, so we need to know who it’s from."
            next={`${window.location.pathname}?request=skill`}
            onClose={onClose}
          />
        ) : step === 'form' ? (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {errorMsg && (
              <Alert>{errorMsg}</Alert>
            )}

            <Field label="What do you want to learn?" htmlFor="skill-wanted" required>
              <Input
                id="skill-wanted"
                type="text"
                list="popular-skills"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. pattern cutting, solar installation, cake decorating"
                required
              />
            </Field>
            <datalist id="popular-skills">
              {predefinedPopularSkills.map(s => (
                <option key={s} value={s} />
              ))}
            </datalist>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Where are you starting from?" htmlFor="skill-level">
                <Select
                  id="skill-level"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                >
                  <option value="beginner">Complete beginner</option>
                  <option value="intermediate">I know the basics</option>
                  <option value="advanced">I want to master it</option>
                </Select>
              </Field>

              <Field label="How do you want to learn?" htmlFor="format-pref">
                <Select
                  id="format-pref"
                  value={formatPreference}
                  onChange={(e) => setFormatPreference(e.target.value as TeachingFormat)}
                >
                  <option value="in-person">At a workshop</option>
                  <option value="hybrid">Mix of online and workshop</option>
                  <option value="online">Online</option>
                </Select>
              </Field>
            </div>

            <Field label="What do you want to be able to do?" htmlFor="learning-goal" required hint="The more specific, the better the match.">
              <Textarea
                id="learning-goal"
                rows={2}
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Cut and sew a fitted blazer, and service my own straight-stitch machine."
                required
              />
            </Field>

            <Field label="Where are you?" htmlFor="req-location" required>
              <Input
                id="req-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kakoba, Mbarara"
                required
              />
            </Field>

            <fieldset>
              <legend className="block text-[14px] font-semibold text-ink-700 mb-1.5">
                Your total budget <span className="text-rose-600" aria-hidden="true">*</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {[100000, 250000, 500000, 1000000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBudgetUGX(amount)}
                    aria-pressed={budgetUGX === amount}
                    className={`px-3.5 min-h-[44px] rounded-control border text-sm font-semibold transition ${budgetUGX === amount ? 'bg-forest-50 border-forest-600 text-forest-900' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}
                  >
                    {formatUGX(amount)}
                  </button>
                ))}
                <label className="flex items-center gap-2 px-3 min-h-[44px] rounded-control border border-ink-200 text-sm text-ink-700 focus-within:ring-2 focus-within:ring-forest-700">
                  <span className="text-ink-600">Other: UGX</span>
                  <input
                    id="req-budget"
                    type="number"
                    inputMode="numeric"
                    step={10000}
                    min={30000}
                    value={budgetUGX}
                    onChange={(e) => setBudgetUGX(Number(e.target.value))}
                    className="w-24 bg-transparent focus:outline-none font-semibold text-ink-900"
                    aria-label="Budget in UGX"
                    required
                  />
                </label>
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="When suits you?" htmlFor="req-schedule">
                <Input
                  id="req-schedule"
                  type="text"
                  value={preferredSchedule}
                  onChange={(e) => setPreferredSchedule(e.target.value)}
                  placeholder="e.g. Weekends, or Tuesday & Thursday evenings"
                />
              </Field>

              <Field label="How often, for how long?" htmlFor="req-frequency">
                <Input
                  id="req-frequency"
                  type="text"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g. 2 sessions per week (4 weeks)"
                />
              </Field>
            </div>

            <Field label="Your WhatsApp number" htmlFor="req-phone" required hint={`We’ll reply here and in your dashboard. Sending as ${learnerName || user?.name} (${learnerEmail || user?.email}).`}>
              <Input
                id="req-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+256 7XX XXX XXX"
                required
              />
            </Field>

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
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="bg-forest-50 rounded-card p-4 border border-forest-200 flex gap-3">
              <div className="w-8 h-8 rounded-control bg-forest-100 border border-forest-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-forest-700" />
              </div>
              <div>
                <div className="font-bold text-forest-900 text-[15px]">Request sent</div>
                <p className="text-[14px] text-forest-800 mt-1">
                  We’ll also look ourselves and reply on WhatsApp. {matches.length > 0 ? <>Meanwhile, these educators look like a fit for <span className="font-bold">{skillName}</span>:</> : null}
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
                        <Avatar src={m.educator.user?.avatar_url} name={m.educator.user?.name} className="w-12 h-12 rounded-card border border-ink-200" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-ink-900 text-[15px] font-display">{m.educator.user?.name}</h4>
                            <Badge variant="success" size="sm">{m.match_score}% fit</Badge>
                          </div>
                          <p className="text-[14px] text-ink-600">{m.educator.title}</p>
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
                        View profile
                      </Button>
                    </div>

                    <div className="bg-ink-50 p-3 rounded-control border border-ink-100 text-xs space-y-1.5">
                      <span className="font-semibold text-ink-800 block text-[13px]">Why they fit</span>
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
              <div className="p-6 text-center text-[14px] text-ink-600 bg-ink-50 rounded-card border border-ink-200">
                Nobody on iSkillLink teaches this yet. We’ll look for someone and reply on WhatsApp.
              </div>
            )}

            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-100 flex items-center justify-end pb-safe">
              <Button variant="secondary" size="md" onClick={() => { onClose(); navigate('/dashboard/learner/requests'); }}>
                See my requests
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
};
