import React, { useState } from 'react';
import { TeachingFormat, EducatorStatus } from '../types';
import { api } from '../services/api';
import { formatUGX } from '../utils/formatters';
import {
  ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Upload,
  Award, Wrench, Briefcase, DollarSign, FileText, Lock,
  AlertCircle, Sparkles, UserCheck, Star
} from 'lucide-react';

interface BecomeEducatorPageProps {
  onApplicationSubmitted: () => void;
  setCurrentView: (view: string) => void;
}

export const BecomeEducatorPage: React.FC<BecomeEducatorPageProps> = ({
  onApplicationSubmitted,
  setCurrentView
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValidUgPhone = (p: string) => {
    const digits = p.replace(/[^0-9]/g, '');
    return digits.length >= 12 && digits.startsWith('256') && /^2567\d{8}$/.test(digits) || /^0?7\d{8}$/.test(p.replace(/\s/g,''));
  };
  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isValidHourlyRate = (r: number) => r >= 15000 && r <= 100000;

  // Step 1: Personal & Contact Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('Mbarara City');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        const targetDim = 320;
        canvas.width = targetDim;
        canvas.height = targetDim;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Educator Type & Experience
  const [educatorType, setEducatorType] = useState<'artisan' | 'professional' | 'trainer' | 'practitioner' | 'mentor'>('artisan');
  const [title, setTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState(5);
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState(['English', 'Runyankore-Rukiga', 'Luganda']);

  // Step 3: Skills Taught & Pricing
  const [primarySkill, setPrimarySkill] = useState('');
  const [skillCategory, setSkillCategory] = useState('cat-fashion');
  const [skillProficiency, setSkillProficiency] = useState<'beginner' | 'intermediate' | 'advanced'>('advanced');
  const [hourlyRateUGX, setHourlyRateUGX] = useState<number>(35000);
  const [packageRateUGX, setPackageRateUGX] = useState<number>(350000);
  const [skillDescription, setSkillDescription] = useState('');

  // Step 4: Teaching Format, Service Area & Equipment
  const [teachingFormats, setTeachingFormats] = useState<TeachingFormat[]>(['in-person', 'hybrid']);
  const [serviceArea, setServiceArea] = useState('Mbarara City, Kakoba, Kamukuzi, Booma');
  const [equipmentProvided, setEquipmentProvided] = useState('');
  const [availabilitySummary, setAvailabilitySummary] = useState('Weekdays after 3pm & Full Day Saturdays');

  // Step 5: Qualifications, Portfolio, References & Consents
  const [qualificationTitle, setQualificationTitle] = useState('');
  const [qualificationInstitution, setQualificationInstitution] = useState('');
  const [qualificationYear, setQualificationYear] = useState(2018);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioImageUrl, setPortfolioImageUrl] = useState('');
  const [referenceContact, setReferenceContact] = useState('');

  // Consents
  const [conductAgreed, setConductAgreed] = useState(false);
  const [verificationAgreed, setVerificationAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  const toggleFormat = (fmt: TeachingFormat) => {
    if (teachingFormats.includes(fmt)) {
      if (teachingFormats.length > 1) {
        setTeachingFormats(teachingFormats.filter(f => f !== fmt));
      }
    } else {
      setTeachingFormats([...teachingFormats, fmt]);
    }
  };

  const handleNextStep = () => {
    setErrorMsg('');
    const errs: Record<string,string> = {};
    if (currentStep === 1) {
      if (!name.trim()) errs.name = 'Full legal name is required.';
      if (!email.trim() || !isValidEmail(email)) errs.email = 'Valid email address is required.';
      if (!phone.trim() || !isValidUgPhone(phone)) errs.phone = 'Valid Ugandan phone (+256 7XXXXXXXX) is required.';
      if (!location.trim()) errs.location = 'Location is required.';
      if (Object.keys(errs).length) { setFieldErrors(errs); setErrorMsg('Please correct the highlighted contact fields.'); return; }
    } else if (currentStep === 2) {
      if (!title.trim()) errs.title = 'Professional headline is required.';
      if (!bio.trim() || bio.trim().length < 20) errs.bio = 'Bio must be at least 20 characters.';
      if (Object.keys(errs).length) { setFieldErrors(errs); setErrorMsg('Please complete your craft background.'); return; }
    } else if (currentStep === 3) {
      if (!primarySkill.trim() || primarySkill.trim().length < 3) errs.primarySkill = 'Primary skill must be at least 3 characters.';
      if (!hourlyRateUGX || !isValidHourlyRate(hourlyRateUGX)) errs.hourlyRateUGX = 'Hourly rate must be UGX 15,000 – 100,000.';
      if (Object.keys(errs).length) { setFieldErrors(errs); setErrorMsg('Please correct skill and pricing fields.'); return; }
    } else if (currentStep === 4) {
      if (teachingFormats.length === 0) errs.teachingFormats = 'Select at least one teaching format.';
      if (!serviceArea.trim()) errs.serviceArea = 'Service area is required.';
      if (Object.keys(errs).length) { setFieldErrors(errs); setErrorMsg('Please complete workshop details.'); return; }
    }
    setFieldErrors({});
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductAgreed || !verificationAgreed || !privacyAgreed) {
      setErrorMsg('Please agree to the Professional Conduct, Verification and Privacy terms.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await api.submitEducatorOnboarding({
        name,
        email,
        phone,
        location,
        educator_type: educatorType,
        title,
        bio,
        years_experience: yearsExperience,
        service_area: serviceArea,
        teaching_formats: teachingFormats,
        languages,
        equipment_provided: equipmentProvided || 'Practical tools provided at workshop bench.',
        hourly_rate_ugx: hourlyRateUGX,
        package_rate_ugx: packageRateUGX,
        national_id_number: nationalIdNumber || 'CM-APP-PENDING',
        avatar_url: avatarUrl || undefined,
        skills: [
          {
            skill_name: primarySkill,
            category_id: skillCategory,
            proficiency_level: skillProficiency,
            hourly_rate_ugx: hourlyRateUGX,
            description: skillDescription || `${primarySkill} practical mentorship.`
          }
        ],
        qualifications: qualificationTitle ? [
          {
            title: qualificationTitle,
            institution: qualificationInstitution || 'Uganda Vocational Institute',
            year: qualificationYear
          }
        ] : [],
        portfolios: portfolioTitle ? [
          {
            title: portfolioTitle,
            description: portfolioDescription,
            image_url: portfolioImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            tag: primarySkill
          }
        ] : []
      });

      setSubmittedSuccess(true);
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit educator onboarding application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Application Submitted Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Thank you, <span className="font-bold text-gray-900">{name}</span>. Your educator profile has been registered in the iSkillLink Verification Queue.
          </p>
        </div>

        {/* Status Lifecycle Indicator */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Verification Pipeline Status
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold">
              <span className="block text-[10px] text-emerald-600">STEP 1</span>
              Applied
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-bold">
              <span className="block text-[10px] text-amber-600">STEP 2</span>
              Under Review
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200">
              <span className="block text-[10px] text-gray-400">STEP 3</span>
              Verification
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200">
              <span className="block text-[10px] text-gray-400">STEP 4</span>
              Approved
            </div>
            <div className="p-2.5 rounded-xl bg-gray-50 text-gray-500 border border-gray-200">
              <span className="block text-[10px] text-gray-400">STEP 5</span>
              Active
            </div>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed pt-2">
            Our verification officers in Mbarara will review your national ID, inspect your workshop credentials, and contact your trade reference within 24–48 business hours.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setCurrentView('educator-dashboard')}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
          >
            Go to Educator Dashboard
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
          Educator & Artisan Application
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          Teach Practical Skills on iSkillLink
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Join verified artisans, master technicians, and vocational instructors across Uganda. Set your own UGX rates, mentor eager apprentices, and get paid securely.
        </p>
      </div>

      {/* Progress Steps Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Personal & Contact' },
            { num: 2, label: 'Craft & Experience' },
            { num: 3, label: 'Skills & UGX Pricing' },
            { num: 4, label: 'Workshop & Formats' },
            { num: 5, label: 'Proof & Verification' }
          ].map(s => (
            <div
              key={s.num}
              className={`p-2 rounded-xl transition ${
                currentStep === s.num
                  ? 'bg-emerald-700 text-white font-bold shadow-sm'
                  : currentStep > s.num
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div className="text-[10px] opacity-80">STEP {s.num}</div>
              <div className="truncate hidden sm:block text-[11px]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Personal & Contact */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Step 1: Personal & Contact Information</h3>
              <p className="text-xs text-gray-500">Your basic identity and primary location in Uganda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if(fieldErrors.name) setFieldErrors(prev=>({...prev, name:''})); }}
                  placeholder="e.g. Your Full Legal Name"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.name ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.name && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if(fieldErrors.email) setFieldErrors(prev=>({...prev, email:''})); }}
                  placeholder="e.g. joseph.mukasa@gmail.com"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.email ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.email && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if(fieldErrors.phone) setFieldErrors(prev=>({...prev, phone:''})); }}
                  placeholder="+256 77X XXX XXX"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.phone && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.phone}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Number (Optional)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+256 70X XXX XXX"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  General Location / Base <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); if(fieldErrors.location) setFieldErrors(prev=>({...prev, location:''})); }}
                  placeholder="e.g. Kiyembe Lane, Kampala Central"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.location ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.location && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.location}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  National ID (NIN) Number
                </label>
                <input
                  type="text"
                  value={nationalIdNumber}
                  onChange={(e) => setNationalIdNumber(e.target.value)}
                  placeholder="e.g. CM840291038ABK"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Used strictly for identity verification.</span>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Educator Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0 shadow-sm">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{avatarUrl ? 'Change Photo' : 'Upload Profile Photo'}</span>
                      <input
                        type="file"
                        onChange={handleAvatarFile}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-gray-500 mt-1">Photo appears on your verified mentor card across Uganda.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Craft & Experience */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Step 2: Educator Type & Craft Background</h3>
              <p className="text-xs text-gray-500">Tell learners about your experience and mastery level.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Which best describes you? <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: 'artisan', label: 'Master Artisan', desc: 'Craft/Vocational master' },
                    { id: 'practitioner', label: 'Practitioner', desc: 'Active trade technician' },
                    { id: 'professional', label: 'Professional', desc: 'Certified consultant' },
                    { id: 'trainer', label: 'Trainer', desc: 'Formal instructor' },
                    { id: 'mentor', label: 'Mentor', desc: 'Business/Trade coach' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setEducatorType(t.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        educatorType === t.id
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Professional Headline / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if(fieldErrors.title) setFieldErrors(prev=>({...prev, title:''})); }}
                    placeholder="e.g. Master Tailor & Pattern Construction Instructor"
                    className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.title ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                    required
                  />
                  {fieldErrors.title && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.title}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Years of Active Experience <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Professional Bio & Teaching Methodology <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); if(fieldErrors.bio) setFieldErrors(prev=>({...prev, bio:''})); }}
                  placeholder="Describe your background, workshops you run, techniques you specialize in, and how you teach apprentices step-by-step..."
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.bio ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.bio && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.bio}</span>}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Skills & UGX Pricing */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Step 3: Primary Skill Taught & UGX Pricing</h3>
              <p className="text-xs text-gray-500">Define what you teach and set your hourly rate in Ugandan Shillings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Primary Skill Taught <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={primarySkill}
                  onChange={(e) => { setPrimarySkill(e.target.value); if(fieldErrors.primarySkill) setFieldErrors(prev=>({...prev, primarySkill:''})); }}
                  placeholder="e.g. Garment Pattern Drafting & Cutting"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none ${fieldErrors.primarySkill ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.primarySkill && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.primarySkill}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Skill Category
                </label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="cat-fashion">Fashion & Tailoring</option>
                  <option value="cat-tech">Web Dev & Programming</option>
                  <option value="cat-repair">Phone Repair & Electronics</option>
                  <option value="cat-culinary">Cooking & Baking</option>
                  <option value="cat-electrical">Electrical & Solar</option>
                  <option value="cat-welding">Welding & Metalwork</option>
                  <option value="cat-carpentry">Carpentry & Woodwork</option>
                  <option value="cat-agriculture">Agriculture & Agribusiness</option>
                  <option value="cat-photography">Photography & Video</option>
                  <option value="cat-design">Graphic Design & UI/UX</option>
                  <option value="cat-business">Accounting & Business</option>
                  <option value="cat-beauty">Beauty & Hair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Your Hourly Rate (UGX) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={5000}
                  min={15000}
                  max={100000}
                  value={hourlyRateUGX}
                  onChange={(e) => { setHourlyRateUGX(Number(e.target.value)); if(fieldErrors.hourlyRateUGX) setFieldErrors(prev=>({...prev, hourlyRateUGX:''})); }}
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 ${fieldErrors.hourlyRateUGX ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.hourlyRateUGX ? <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.hourlyRateUGX}</span> : <span className="text-[11px] text-emerald-800 font-semibold mt-0.5 block">{formatUGX(hourlyRateUGX)} / hr (You receive 90% via Mobile Money)</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Package Rate (Optional)
                </label>
                <input
                  type="number"
                  step={10000}
                  value={packageRateUGX}
                  onChange={(e) => setPackageRateUGX(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  e.g. 4-week complete mastery package
                </span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  What will the apprentice learn and build?
                </label>
                <input
                  type="text"
                  value={skillDescription}
                  onChange={(e) => setSkillDescription(e.target.value)}
                  placeholder="e.g. Drafting manual patterns, taking body measurements, making blazers and trousers."
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Workshop & Formats */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Step 4: Teaching Formats & Workshop Setup</h3>
              <p className="text-xs text-gray-500">How and where you conduct training sessions.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Formats You Offer <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'in-person' as TeachingFormat, label: 'In-Person Workshop', desc: 'At your physical shop or workspace' },
                    { id: 'hybrid' as TeachingFormat, label: 'Hybrid Format', desc: 'In-person practicals + online theory' },
                    { id: 'online' as TeachingFormat, label: 'Online Live', desc: 'Video calls & code/screen share' }
                  ].map(f => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => { toggleFormat(f.id); if(fieldErrors.teachingFormats) setFieldErrors(prev=>({...prev, teachingFormats:''})); }}
                      className={`p-3 rounded-xl border text-left transition ${
                        teachingFormats.includes(f.id)
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{f.label}</span>
                        {teachingFormats.includes(f.id) && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">{f.desc}</p>
                    </button>
                  ))}
                </div>
                {fieldErrors.teachingFormats && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.teachingFormats}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Service Area & Divisions Covered <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => { setServiceArea(e.target.value); if(fieldErrors.serviceArea) setFieldErrors(prev=>({...prev, serviceArea:''})); }}
                  placeholder="e.g. Kampala Central, Nakawa, Makindye, Wakiso"
                  className={`w-full text-xs rounded-lg border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600 ${fieldErrors.serviceArea ? 'border-rose-300 bg-rose-50' : 'border-gray-300'}`}
                  required
                />
                {fieldErrors.serviceArea && <span className="text-[11px] text-rose-600 mt-1 block">{fieldErrors.serviceArea}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Workshop Tools & Equipment Provided for Students <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={equipmentProvided}
                  onChange={(e) => setEquipmentProvided(e.target.value)}
                  placeholder="e.g. Juki industrial straight machines, cutting tables, tailoring shears, brown drafting paper and measuring tapes."
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  General Availability
                </label>
                <input
                  type="text"
                  value={availabilitySummary}
                  onChange={(e) => setAvailabilitySummary(e.target.value)}
                  placeholder="e.g. Saturdays full day, weekday evenings"
                  className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Proof, Qualifications & Consents */}
        {currentStep === 5 && (
          <form onSubmit={handleSubmitApplication} className="space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Step 5: Credentials, Portfolio & Verification Consent</h3>
              <p className="text-xs text-gray-500">Provide evidence of your craft to accelerate your verification approval.</p>
            </div>

            {/* Qualifications */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Qualification / Certification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Title / Trade Test</label>
                  <input
                    type="text"
                    value={qualificationTitle}
                    onChange={(e) => setQualificationTitle(e.target.value)}
                    placeholder="e.g. DIT Master Artisan Trade Test 1 (Tailoring)"
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Year</label>
                  <input
                    type="number"
                    value={qualificationYear}
                    onChange={(e) => setQualificationYear(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Institution / Authority</label>
                  <input
                    type="text"
                    value={qualificationInstitution}
                    onChange={(e) => setQualificationInstitution(e.target.value)}
                    placeholder="e.g. Directorate of Industrial Training (DIT) Uganda"
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Portfolio sample */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Sample Work / Practical Portfolio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Project Title</label>
                  <input
                    type="text"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                    placeholder="e.g. Bespoke 3-Piece Linen Groom Suit"
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Image Link / Work Photo</label>
                  <input
                    type="url"
                    value={portfolioImageUrl}
                    onChange={(e) => setPortfolioImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Work Description</label>
                  <input
                    type="text"
                    value={portfolioDescription}
                    onChange={(e) => setPortfolioDescription(e.target.value)}
                    placeholder="e.g. Hand-tailored canvas interlining and custom lapel stitch finish."
                    className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Trade Reference */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Professional / Trade Reference (Name & Contact Phone)
              </label>
              <input
                type="text"
                value={referenceContact}
                onChange={(e) => setReferenceContact(e.target.value)}
                placeholder="e.g. Charles Ssemakula (Workshop Chairman Kiyembe) - 0772 334 112"
                className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white text-gray-900"
              />
            </div>

            {/* Security & Verification Consents */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2.5 text-xs text-emerald-950">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Verification Agreements & Code of Conduct</span>
              </h4>

              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={conductAgreed}
                  onChange={(e) => setConductAgreed(e.target.checked)}
                  className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                  required
                />
                <span className="text-gray-700 text-[11px]">
                  <strong>Professional Conduct Agreement:</strong> I agree to maintain safe workshop standards, provide respectful training, and adhere to agreed schedules.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verificationAgreed}
                  onChange={(e) => setVerificationAgreed(e.target.checked)}
                  className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                  required
                />
                <span className="text-gray-700 text-[11px]">
                  <strong>Verification Consent:</strong> I authorize iSkillLink to verify my National ID (NIN), inspect my workshop premises, and contact my trade references.
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                  required
                />
                <span className="text-gray-700 text-[11px]">
                  <strong>Data Privacy:</strong> I understand iSkillLink does NOT store passwords, Mobile Money PINs, or bank access credentials.
                </span>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Educator Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Navigation buttons for Steps 1-4 */}
        {currentStep < 5 && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : <div></div>}

            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
