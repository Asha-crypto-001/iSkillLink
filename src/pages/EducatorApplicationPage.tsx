import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, TeachingFormat } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ShieldCheck, Upload } from 'lucide-react';
import { DashboardShell } from '../components/dashboard/DashboardShell';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Alert } from '../components/ui/Alert';
import { VERIFICATION_STEPS } from '../utils/verification';
import { REGISTRATION_TITLE } from '../utils/educatorApplication';

const STEPS = [
  { name: 'About you', hint: 'How we reach you' },
  { name: 'Your craft', hint: 'Experience and background' },
  { name: 'What you teach', hint: 'Skill, level and rate' },
  { name: 'Your workshop', hint: 'Where and how you teach' },
  { name: 'Proof & consent', hint: 'Work samples and agreements' }
];

const EDUCATOR_TYPES = [
  { id: 'artisan', label: 'Master artisan', desc: 'Craft or vocational master' },
  { id: 'practitioner', label: 'Practitioner', desc: 'Working technician' },
  { id: 'professional', label: 'Professional', desc: 'Certified specialist' },
  { id: 'trainer', label: 'Trainer', desc: 'Formal instructor' },
  { id: 'mentor', label: 'Mentor', desc: 'Business or skills coach' }
] as const;

const FORMATS: { id: TeachingFormat; label: string; desc: string }[] = [
  { id: 'in-person', label: 'In person', desc: 'At your workshop or workspace' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Practicals in person, theory online' },
  { id: 'online', label: 'Online', desc: 'Live video and screen share' }
];

const isValidUgPhone = (p: string) => /^2567\d{8}$/.test(p.replace(/[^0-9]/g, '')) || /^07\d{8}$/.test(p.replace(/\s/g, ''));
const isValidHourlyRate = (r: number) => r >= 15000 && r <= 100000;

const choiceClass = (selected: boolean) =>
  `p-4 rounded-card border text-left transition focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2 ${
    selected ? 'border-forest-600 bg-forest-50 ring-2 ring-forest-600/15' : 'border-ink-200 bg-white hover:border-ink-300'
  }`;

export const EducatorApplicationPage: React.FC<{ onApplicationSubmitted?: () => void }> = ({ onApplicationSubmitted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const profile = user?.educatorProfile;
  const hasRealProfile = !!profile && profile.title !== REGISTRATION_TITLE;

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. About you
  const [phone, setPhone] = useState(user?.phone || '+256 ');
  const [location, setLocation] = useState(user?.location || profile?.location || 'Mbarara City');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  // 2. Your craft
  const [educatorType, setEducatorType] = useState<typeof EDUCATOR_TYPES[number]['id']>((profile?.educator_type as any) || 'artisan');
  const [title, setTitle] = useState(hasRealProfile ? profile!.title : '');
  const [yearsExperience, setYearsExperience] = useState(hasRealProfile ? profile!.years_experience : 5);
  const [bio, setBio] = useState(hasRealProfile ? profile!.bio : '');
  // 3. What you teach
  const [primarySkill, setPrimarySkill] = useState('');
  const [skillCategory, setSkillCategory] = useState('cat-fashion');
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('advanced');
  const [hourlyRate, setHourlyRate] = useState<number>(hasRealProfile ? profile!.hourly_rate_ugx : 35000);
  const [packageRate, setPackageRate] = useState<number | ''>('');
  const [skillDescription, setSkillDescription] = useState('');
  // 4. Your workshop
  const [teachingFormats, setTeachingFormats] = useState<TeachingFormat[]>(hasRealProfile ? profile!.teaching_formats : ['in-person']);
  const [serviceArea, setServiceArea] = useState(hasRealProfile ? profile!.service_area : 'Mbarara City');
  const [equipmentProvided, setEquipmentProvided] = useState(hasRealProfile ? profile!.equipment_provided : '');
  // 5. Proof & consent
  const [qualificationTitle, setQualificationTitle] = useState('');
  const [qualificationInstitution, setQualificationInstitution] = useState('');
  const [qualificationYear, setQualificationYear] = useState(2018);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');
  const [conductAgreed, setConductAgreed] = useState(false);
  const [verificationAgreed, setVerificationAgreed] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const clearError = (key: string) => { if (fieldErrors[key]) setFieldErrors(prev => ({ ...prev, [key]: '' })); };

  // Square-crop and shrink the photo in the browser before it is sent.
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 320, 320);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const toggleFormat = (format: TeachingFormat) => {
    clearError('teachingFormats');
    setTeachingFormats(current => current.includes(format) ? current.filter(f => f !== format) : [...current, format]);
  };

  const validate = (index: number) => {
    const errs: Record<string, string> = {};
    if (index === 0) {
      if (!isValidUgPhone(phone)) errs.phone = 'Enter a Ugandan mobile number, like +256 772 123 456.';
      if (!location.trim()) errs.location = 'Tell us where you are based.';
    } else if (index === 1) {
      if (!title.trim()) errs.title = 'Add a short headline, like “Master tailor”.';
      if (bio.trim().length < 20) errs.bio = 'Write at least 20 characters about your work.';
    } else if (index === 2) {
      if (primarySkill.trim().length < 3) errs.primarySkill = 'Name the skill you teach.';
      if (!isValidHourlyRate(hourlyRate)) errs.hourlyRate = 'Choose a rate between UGX 15,000 and 100,000 an hour.';
    } else if (index === 3) {
      if (teachingFormats.length === 0) errs.teachingFormats = 'Choose at least one way you teach.';
      if (!serviceArea.trim()) errs.serviceArea = 'Tell learners where you teach.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    setErrorMsg('');
    if (!validate(step)) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setErrorMsg('');
    setFieldErrors({});
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) { goNext(); return; }
    if (!conductAgreed || !verificationAgreed) {
      setErrorMsg('Please agree to both statements before sending.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.submitEducatorOnboarding({
        name: user?.name,
        email: user?.email,
        phone,
        location,
        educator_type: educatorType,
        title,
        bio,
        years_experience: yearsExperience,
        service_area: serviceArea,
        teaching_formats: teachingFormats,
        languages: ['English', 'Runyankore-Rukiga', 'Luganda'],
        equipment_provided: equipmentProvided || 'Practical tools provided at the workshop.',
        hourly_rate_ugx: hourlyRate,
        package_rate_ugx: packageRate || undefined,
        national_id_number: nationalIdNumber || 'CM-APP-PENDING',
        avatar_url: avatarUrl || undefined,
        skills: [{
          skill_name: primarySkill,
          category_id: skillCategory,
          proficiency_level: skillLevel,
          hourly_rate_ugx: hourlyRate,
          description: skillDescription || `${primarySkill}, taught hands-on.`
        }],
        qualifications: qualificationTitle ? [{ title: qualificationTitle, institution: qualificationInstitution || 'Not given', year: qualificationYear }] : [],
        portfolios: portfolioTitle ? [{ title: portfolioTitle, description: portfolioDescription, image_url: portfolioImageUrl || '', tag: primarySkill }] : []
      });
      setSubmitted(true);
      onApplicationSubmitted?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'We couldn’t send your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardShell role="educator">
        <div className="container-app max-w-2xl py-6">
          <div className="rounded-display border border-ink-200 bg-white p-8 sm:p-10 text-center shadow-level-1">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="mt-5 font-display text-2xl sm:text-3xl font-bold text-ink-900">Application sent. Thank you, {user?.name.split(' ')[0]}.</h1>
            <p className="mt-2 text-ink-600">We’ll contact you on WhatsApp to arrange these four checks.</p>
            <ol className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
              {VERIFICATION_STEPS.map((check, index) => (
                <li key={check.key} className="rounded-card border border-ink-200 p-4">
                  <span className="text-caption text-forest-700">Check {index + 1}</span>
                  <p className="mt-1 font-semibold text-ink-900">{check.label}</p>
                  <p className="mt-0.5 text-sm text-ink-600">{check.applicantDetail}</p>
                </li>
              ))}
            </ol>
            <button onClick={() => navigate('/dashboard/educator')} className="mt-8 px-6 min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold inline-flex items-center gap-2">
              Go to your dashboard<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="educator">
      <div className="container-app space-y-6">
        <DashboardHeader
          eyebrow="Teach on iSkillLink"
          title="Your educator application"
          description="About ten minutes. You can go back to any step before you send it."
          breadcrumbs={[{ label: 'Dashboard', href: '/dashboard/educator' }, { label: 'Application' }]}
        />

        <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
          {/* Steps: a vertical list on desktop, a compact bar on phones */}
          <nav aria-label="Application steps" className="lg:sticky lg:top-24">
            <div className="lg:hidden">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold text-ink-900">Step {step + 1} of {STEPS.length}: {STEPS[step].name}</span>
              </div>
              <div className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
                {STEPS.map((s, i) => <span key={s.name} className={`h-1.5 rounded-full ${i <= step ? 'bg-forest-600' : 'bg-ink-200'}`} />)}
              </div>
            </div>
            <ol className="hidden lg:block space-y-1">
              {STEPS.map((s, i) => {
                const done = i < step;
                const current = i === step;
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      disabled={!done}
                      onClick={() => setStep(i)}
                      aria-current={current ? 'step' : undefined}
                      className={`w-full flex items-start gap-3 rounded-card p-3 text-left transition ${current ? 'bg-forest-50' : done ? 'hover:bg-ink-50' : ''}`}
                    >
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done ? 'bg-forest-600 text-white' : current ? 'border-2 border-forest-600 text-forest-700 bg-white' : 'border border-ink-300 text-ink-500'
                      }`} aria-hidden="true">
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold ${current ? 'text-forest-800' : done ? 'text-ink-900' : 'text-ink-500'}`}>{s.name}</span>
                        <span className="block text-xs text-ink-500">{s.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <form onSubmit={handleSubmit} className="rounded-display border border-ink-200 bg-white shadow-level-1" noValidate>
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900">{STEPS[step].name}</h2>
                <p className="text-sm text-ink-600">{STEPS[step].hint}</p>
              </div>
              {errorMsg && <Alert>{errorMsg}</Alert>}

              {step === 0 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Name" htmlFor="ap-name" hint="From your account">
                    <Input id="ap-name" value={user?.name || ''} disabled readOnly />
                  </Field>
                  <Field label="Email" htmlFor="ap-email" hint="From your account">
                    <Input id="ap-email" value={user?.email || ''} disabled readOnly />
                  </Field>
                  <Field label="Mobile number" htmlFor="ap-phone" required error={fieldErrors.phone} hint="We’ll use WhatsApp on this number">
                    <Input id="ap-phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clearError('phone'); }} placeholder="+256 772 123 456" error={!!fieldErrors.phone} />
                  </Field>
                  <Field label="Where you’re based" htmlFor="ap-location" required error={fieldErrors.location}>
                    <Input id="ap-location" value={location} onChange={(e) => { setLocation(e.target.value); clearError('location'); }} placeholder="e.g. Kakoba, Mbarara" error={!!fieldErrors.location} />
                  </Field>
                  <Field label="National ID number (NIN)" htmlFor="ap-nin" hint="Only used to check your identity" className="sm:col-span-2">
                    <Input id="ap-nin" value={nationalIdNumber} onChange={(e) => setNationalIdNumber(e.target.value)} placeholder="e.g. CM840291038ABK" />
                  </Field>
                  <div className="sm:col-span-2 flex items-center gap-4 rounded-card border border-dashed border-ink-300 p-4">
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-100 text-ink-400">
                      {avatarUrl ? <img src={avatarUrl} alt="Your new profile photo" className="h-full w-full object-cover" /> : <Upload className="h-6 w-6" aria-hidden="true" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Profile photo <span className="font-normal text-ink-500">(optional)</span></p>
                      <p className="text-xs text-ink-500">A clear photo of your face. Learners see it on your profile.</p>
                      <label className="mt-2 inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-pill border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50 cursor-pointer">
                        {avatarUrl ? 'Change photo' : 'Upload photo'}
                        <input type="file" accept="image/*" onChange={handleAvatarFile} className="sr-only" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-sm font-semibold text-ink-800 mb-2">Which best describes you?</legend>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {EDUCATOR_TYPES.map(t => (
                        <button type="button" key={t.id} onClick={() => setEducatorType(t.id)} aria-pressed={educatorType === t.id} className={choiceClass(educatorType === t.id)}>
                          <span className="block text-sm font-semibold text-ink-900">{t.label}</span>
                          <span className="block text-xs text-ink-500 mt-0.5">{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid sm:grid-cols-[1fr_10rem] gap-5">
                    <Field label="Headline" htmlFor="ap-title" required error={fieldErrors.title} hint="Shown under your name">
                      <Input id="ap-title" value={title} onChange={(e) => { setTitle(e.target.value); clearError('title'); }} placeholder="e.g. Master tailor and pattern cutter" error={!!fieldErrors.title} />
                    </Field>
                    <Field label="Years of experience" htmlFor="ap-years">
                      <Input id="ap-years" type="number" min={1} max={50} value={String(yearsExperience)} onChange={(e) => setYearsExperience(Number(e.target.value))} />
                    </Field>
                  </div>
                  <Field label="About your work and how you teach" htmlFor="ap-bio" required error={fieldErrors.bio}>
                    <Textarea id="ap-bio" rows={5} value={bio} onChange={(e) => { setBio(e.target.value); clearError('bio'); }} placeholder="Where you trained, what you make, and how you take a beginner through their first jobs." error={!!fieldErrors.bio} />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Skill you teach" htmlFor="ap-skill" required error={fieldErrors.primarySkill}>
                    <Input id="ap-skill" value={primarySkill} onChange={(e) => { setPrimarySkill(e.target.value); clearError('primarySkill'); }} placeholder="e.g. Pattern drafting and cutting" error={!!fieldErrors.primarySkill} />
                  </Field>
                  <Field label="Category" htmlFor="ap-category">
                    <Select id="ap-category" value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)}>
                      {(categories.length ? categories : [{ id: 'cat-fashion', name: 'Fashion & Tailoring' } as Category]).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <fieldset className="sm:col-span-2">
                    <legend className="text-sm font-semibold text-ink-800 mb-2">Your level in this skill</legend>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                        <button type="button" key={level} onClick={() => setSkillLevel(level)} aria-pressed={skillLevel === level} className={`${choiceClass(skillLevel === level)} py-3 text-sm font-semibold text-ink-900 capitalize`}>
                          {level}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <Field label="Hourly rate (UGX)" htmlFor="ap-rate" required error={fieldErrors.hourlyRate} hint="Between 15,000 and 100,000">
                    <Input id="ap-rate" type="number" inputMode="numeric" step={1000} min={15000} max={100000} value={String(hourlyRate)} onChange={(e) => { setHourlyRate(Number(e.target.value)); clearError('hourlyRate'); }} error={!!fieldErrors.hourlyRate} />
                  </Field>
                  <Field label="Full course price (UGX)" htmlFor="ap-package" hint="Optional, for a set course">
                    <Input id="ap-package" type="number" inputMode="numeric" step={10000} value={packageRate === '' ? '' : String(packageRate)} onChange={(e) => setPackageRate(e.target.value ? Number(e.target.value) : '')} placeholder="e.g. 350000" />
                  </Field>
                  <Field label="What will learners make?" htmlFor="ap-skill-desc" className="sm:col-span-2">
                    <Textarea id="ap-skill-desc" rows={3} value={skillDescription} onChange={(e) => setSkillDescription(e.target.value)} placeholder="e.g. Take measurements, draft patterns by hand, and finish a blazer and trousers." />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-sm font-semibold text-ink-800 mb-2">How do you teach? <span className="font-normal text-ink-500">Choose all that apply</span></legend>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {FORMATS.map(f => {
                        const selected = teachingFormats.includes(f.id);
                        return (
                          <button type="button" key={f.id} onClick={() => toggleFormat(f.id)} aria-pressed={selected} className={choiceClass(selected)}>
                            <span className="flex items-center justify-between text-sm font-semibold text-ink-900">
                              {f.label}
                              {selected && <CheckCircle2 className="h-4 w-4 text-forest-700" aria-hidden="true" />}
                            </span>
                            <span className="block text-xs text-ink-500 mt-0.5">{f.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.teachingFormats && <p className="mt-2 text-sm text-rose-700">{fieldErrors.teachingFormats}</p>}
                  </fieldset>
                  <Field label="Areas you teach in" htmlFor="ap-area" required error={fieldErrors.serviceArea}>
                    <Input id="ap-area" value={serviceArea} onChange={(e) => { setServiceArea(e.target.value); clearError('serviceArea'); }} placeholder="e.g. Kakoba, Kamukuzi, Nyamitanga" error={!!fieldErrors.serviceArea} />
                  </Field>
                  <Field label="Tools and equipment you provide" htmlFor="ap-equipment">
                    <Textarea id="ap-equipment" rows={3} value={equipmentProvided} onChange={(e) => setEquipmentProvided(e.target.value)} placeholder="e.g. Two industrial sewing machines, a cutting table, shears and measuring tapes." />
                  </Field>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <section className="space-y-4" aria-labelledby="ap-qual-heading">
                    <h3 id="ap-qual-heading" className="text-sm font-semibold text-ink-900">Qualification <span className="font-normal text-ink-500">(optional)</span></h3>
                    <div className="grid sm:grid-cols-[1fr_8rem] gap-4">
                      <Field label="Certificate or trade test" htmlFor="ap-qual-title">
                        <Input id="ap-qual-title" value={qualificationTitle} onChange={(e) => setQualificationTitle(e.target.value)} placeholder="e.g. DIT Trade Test Level 1, Tailoring" />
                      </Field>
                      <Field label="Year" htmlFor="ap-qual-year">
                        <Input id="ap-qual-year" type="number" value={String(qualificationYear)} onChange={(e) => setQualificationYear(Number(e.target.value))} />
                      </Field>
                      <Field label="Issued by" htmlFor="ap-qual-inst" className="sm:col-span-2">
                        <Input id="ap-qual-inst" value={qualificationInstitution} onChange={(e) => setQualificationInstitution(e.target.value)} placeholder="e.g. Directorate of Industrial Training" />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-ink-100 pt-6" aria-labelledby="ap-work-heading">
                    <h3 id="ap-work-heading" className="text-sm font-semibold text-ink-900">A piece of your work <span className="font-normal text-ink-500">(optional)</span></h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="What you made" htmlFor="ap-work-title">
                        <Input id="ap-work-title" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} placeholder="e.g. Three-piece linen suit" />
                      </Field>
                      <Field label="Link to a photo" htmlFor="ap-work-img">
                        <Input id="ap-work-img" type="url" value={portfolioImageUrl} onChange={(e) => setPortfolioImageUrl(e.target.value)} placeholder="https://" />
                      </Field>
                      <Field label="A line about it" htmlFor="ap-work-desc" className="sm:col-span-2">
                        <Input id="ap-work-desc" value={portfolioDescription} onChange={(e) => setPortfolioDescription(e.target.value)} placeholder="e.g. Hand-finished lapels and a canvas interlining." />
                      </Field>
                    </div>
                  </section>

                  <section className="space-y-3 rounded-card bg-forest-50/70 border border-forest-100 p-5" aria-labelledby="ap-consent-heading">
                    <h3 id="ap-consent-heading" className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                      <ShieldCheck className="h-4 w-4 text-forest-700" aria-hidden="true" />Before you send
                    </h3>
                    <label className="flex items-start gap-3 text-sm text-ink-700 cursor-pointer">
                      <input type="checkbox" checked={conductAgreed} onChange={(e) => setConductAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-ink-300 text-forest-700 focus:ring-forest-700" />
                      I’ll keep my workshop safe, treat learners with respect, and keep to the times we agree.
                    </label>
                    <label className="flex items-start gap-3 text-sm text-ink-700 cursor-pointer">
                      <input type="checkbox" checked={verificationAgreed} onChange={(e) => setVerificationAgreed(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-ink-300 text-forest-700 focus:ring-forest-700" />
                      iSkillLink may check my national ID, interview me, and visit my workshop.
                    </label>
                  </section>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-6 sm:px-8 py-4 pb-safe sm:pb-4">
              {step > 0 ? (
                <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 px-5 min-h-[44px] rounded-pill border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back
                </button>
              ) : <span />}
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-6 min-h-[44px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold disabled:opacity-60">
                {step < STEPS.length - 1 ? <>Continue<ArrowRight className="h-4 w-4" aria-hidden="true" /></> : isSubmitting ? 'Sending…' : 'Send application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
};

export default EducatorApplicationPage;
