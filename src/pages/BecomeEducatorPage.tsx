import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, ClipboardList, Hammer,
  IdCard, MessageCircle, Minus, Plus, Star, UserPlus, Users, Wallet
} from 'lucide-react';
import { VERIFICATION_STEPS } from '../utils/verification';
import { categoryColor } from '../utils/categoryColors';
import { CategoryIcon } from '../utils/categoryIcons';
import { APPLY_PATH, hasSentApplication } from '../utils/educatorApplication';
import teacherChalkboardPhoto from '../assets/photos/teacher-chalkboard.webp';
import educatorsIllustration from '../assets/photos/educators-illustration.webp';
import teacherWidePhoto from '../assets/photos/teacher-wide.webp';

interface BecomeEducatorPageProps {
  setCurrentView: (view: string) => void;
}

// A 16-point starburst (same shape as on the landing page).
const STARBURST_POINTS = Array.from({ length: 32 }, (_, i) => {
  const r = i % 2 ? 36 : 50;
  const a = (Math.PI * i) / 16;
  return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
}).join(' ');

const BENEFITS = [
  { icon: Users, tint: 'bg-sky-50 text-sky-600', title: 'Learners come to you', text: 'People who want your trade find you, read your profile and book a session.' },
  { icon: Wallet, tint: 'bg-amber-50 text-amber-600', title: 'Your rate, your hours', text: 'Charge per hour or per course, and accept only the sessions that suit you.' },
  { icon: Hammer, tint: 'bg-rose-50 text-rose-600', title: 'Teach on your own bench', text: 'Learners come to your workshop and work with your tools on real jobs.' },
  { icon: Star, tint: 'bg-violet-50 text-violet-600', title: 'Build your name', text: 'Every finished session can earn a review that brings the next learner.' }
];

const START_STEPS = [
  { icon: UserPlus, title: 'Create your account', text: 'Sign up as an educator. It takes a minute.' },
  { icon: ClipboardList, title: 'Send your application', text: 'From your account: your craft, what you teach and your workshop. About ten minutes.' },
  { icon: BadgeCheck, title: 'Get checked', text: 'We check your ID, talk to you, and visit your workshop.' },
  { icon: CalendarCheck, title: 'Start teaching', text: 'Your profile goes live and learners can book you.' }
];

const CHECK_ICONS = [IdCard, BadgeCheck, MessageCircle, Hammer];

const FAQS = [
  { q: 'Do I need a certificate to teach?', a: 'No. Many of the best educators learned on the job. Add a certificate if you have one; either way, we see your work when we visit your workshop.' },
  { q: 'Is it free to apply?', a: 'Yes. Creating an account and sending your application cost nothing.' },
  { q: 'What happens after I apply?', a: 'We contact you on WhatsApp to arrange the checks: your national ID, a background check, a short interview and a visit to your workshop. You can follow each one from your dashboard.' },
  { q: 'Can I teach online?', a: 'Yes, for trades that suit it, like web development or design. Most trades are taught in person at your workshop.' },
  { q: 'I already have a learner account. Can I teach?', a: 'Educator accounts are separate. Sign up with another email, or message us and we’ll help you switch.' }
];

const sectionEyebrow = 'text-xs font-bold uppercase tracking-[0.14em] text-forest-700';
const sectionTitle = 'mt-2 text-[1.75rem] sm:text-4xl font-bold text-ink-900 tracking-[-0.02em] font-display leading-[1.1]';

export const BecomeEducatorPage: React.FC<BecomeEducatorPageProps> = ({ setCurrentView }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const signUpUrl = `/auth?mode=register&role=educator&next=${encodeURIComponent(APPLY_PATH)}`;
  const signInUrl = `/auth?next=${encodeURIComponent(APPLY_PATH)}`;
  const isAdmin = user?.role === 'admin' || user?.role === 'secondary_admin';

  // The one thing to do next, depending on who is looking.
  const renderActions = (onDark = false) => {
    const primary = `group inline-flex items-center gap-2.5 pl-6 pr-1.5 min-h-[52px] rounded-pill text-sm font-semibold transition ${onDark ? 'bg-sun-300 hover:bg-sun-200 text-ink-950' : 'bg-forest-700 hover:bg-forest-800 text-white'}`;
    const arrow = (
      <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:rotate-45 ${onDark ? 'bg-ink-950 text-sun-300' : 'bg-white text-forest-800'}`} aria-hidden="true">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    );
    const secondary = `inline-flex items-center px-6 min-h-[52px] rounded-pill text-sm font-semibold transition ${onDark ? 'glass-dark text-white hover:bg-white/20' : 'border border-ink-200 bg-white text-ink-900 hover:bg-ink-50'}`;

    if (!user) {
      return (
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate(signUpUrl)} className={primary}>Create an educator account{arrow}</button>
          <button onClick={() => navigate(signInUrl)} className={secondary}>I already have an account</button>
        </div>
      );
    }
    if (isAdmin) {
      return <button onClick={() => setCurrentView('admin-dashboard')} className={primary}>Open the admin dashboard{arrow}</button>;
    }
    if (user.role === 'educator') {
      return hasSentApplication(user)
        ? <button onClick={() => setCurrentView('educator-dashboard')} className={primary}>Go to your dashboard{arrow}</button>
        : <button onClick={() => navigate(APPLY_PATH)} className={primary}>Continue your application{arrow}</button>;
    }
    return (
      <div className={`max-w-lg rounded-card p-5 ${onDark ? 'glass-dark text-white' : 'border border-ink-200 bg-white'}`}>
        <p className={`text-sm ${onDark ? 'text-forest-100' : 'text-ink-700'}`}>
          You’re signed in as a learner. Educator accounts are separate: sign out and create one, or message us and we’ll help you switch.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="https://wa.me/256744024529?text=Hello%20iSkillLink%2C%20I%27d%20like%20to%20teach%20on%20iSkillLink." target="_blank" rel="noopener noreferrer" className={secondary}>Message us on WhatsApp</a>
          <button onClick={async () => { await logout(); navigate(signUpUrl); }} className={secondary}>Sign out and sign up</button>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO ===== */}
      <section className="container-app pt-12 pb-20 sm:pt-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className={sectionEyebrow}>Teach on iSkillLink</p>
              <h1 className="font-display font-bold text-ink-900 text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1.02] tracking-[-0.035em]">
                Teach your trade.{' '}
                <span className="inline-flex items-center gap-3 sm:gap-4 whitespace-nowrap">
                  Grow your name
                  <svg aria-hidden="true" viewBox="0 0 100 100" className="hidden sm:block h-11 w-11 lg:h-12 lg:w-12 text-sun-300">
                    <polygon points={STARBURST_POINTS} fill="currentColor" />
                  </svg>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-[34rem]">
                Bring learners to your workshop and get paid for what you already know. We find the learners, handle the bookings,
                and check every educator so learners can trust you.
              </p>
            </div>
            {renderActions()}
            <p className="text-sm text-ink-500">Free to join. About ten minutes to apply once you have an account.</p>
          </div>

          {/* The teacher in a circle, inside a slowly turning ring of words */}
          <div className="relative mx-auto aspect-square w-full max-w-[20rem] sm:max-w-[26rem]">
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-[spin_40s_linear_infinite] motion-reduce:animate-none" aria-hidden="true">
              <defs>
                <path id="teach-ring" d="M100,100 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0" />
              </defs>
              <text className="font-display" fontSize="10.5" fontWeight="700" fill="#1f1c18">
                <textPath href="#teach-ring" textLength="562" lengthAdjust="spacing">
                  TEACH YOUR TRADE • GROW YOUR NAME • TEACH YOUR TRADE • GROW YOUR NAME •
                </textPath>
              </text>
            </svg>
            <img
              src={teacherChalkboardPhoto}
              width={518}
              height={518}
              alt="A teacher explaining a lesson at the chalkboard"
              className="absolute inset-[12%] h-[76%] w-[76%] rounded-full object-cover object-[30%_30%] bg-ink-100 shadow-level-3"
            />
          </div>
        </div>
      </section>

      {/* ===== WHY TEACH — the illustration beside four benefits ===== */}
      <section className="container-app pb-16 lg:pb-24" aria-labelledby="why-heading">
        <div className="max-w-2xl">
          <p className={sectionEyebrow}>Why teach here</p>
          <h2 id="why-heading" className={sectionTitle}>Do the work you know, and pass it on</h2>
        </div>
        <div className="mt-10 grid lg:grid-cols-[0.95fr_1.05fr] gap-6 items-stretch">
          <div className="flex items-end overflow-hidden rounded-[32px] bg-[#f7e4de]">
            <img src={educatorsIllustration} width={678} height={452} alt="Illustration of four educators holding notebooks" loading="lazy" decoding="async" className="w-full" />
          </div>
          <ul className="grid sm:grid-cols-2 gap-4">
            {BENEFITS.map(({ icon: Icon, tint, title, text }) => (
              <li key={title} className="glass rounded-card p-6">
                <span className={`flex h-12 w-12 items-center justify-center rounded-control ${tint}`} aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== HOW TO START ===== */}
      <section className="bg-ink-50/60 border-y border-ink-100 py-16 lg:py-24" aria-labelledby="start-heading">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto">
            <p className={sectionEyebrow}>How to start</p>
            <h2 id="start-heading" className={sectionTitle}>Four steps to your first learner</h2>
          </div>
          <ol className="relative mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-forest-200 lg:block" />
            {START_STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="relative text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest-700 text-white ring-8 ring-ink-50" aria-hidden="true">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-5 text-caption text-forest-700">Step {index + 1}</p>
                <h3 className="mt-1 text-lg font-bold text-ink-900">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-600 leading-relaxed max-w-[16rem] mx-auto">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== WHAT WE CHECK ===== */}
      <section className="container-app py-16 lg:py-24" aria-labelledby="checks-heading">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <img src={teacherWidePhoto} width={740} height={415} alt="A teacher leading a lesson while pupils listen" loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-display object-cover bg-ink-100" />
          <div>
            <p className={sectionEyebrow}>What we check</p>
            <h2 id="checks-heading" className={sectionTitle}>We check every educator, so learners trust you</h2>
            <p className="mt-3 text-base text-ink-600 leading-relaxed max-w-lg">Four checks, arranged with you on WhatsApp after you apply. You can follow each one from your dashboard.</p>
            <ul className="mt-8 space-y-4">
              {VERIFICATION_STEPS.map((check, index) => {
                const Icon = CHECK_ICONS[index] || BadgeCheck;
                return (
                  <li key={check.key} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink-900">{check.label}</p>
                      <p className="text-sm text-ink-600">{check.applicantDetail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== EVERY TRADE ===== */}
      <section className="container-app pb-16 lg:pb-24 text-center" aria-labelledby="trades-heading">
        <p className={sectionEyebrow}>Every trade is welcome</p>
        <h2 id="trades-heading" className={sectionTitle}>Whatever you make, someone wants to learn it</h2>
        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {categories.map(category => (
            <li key={category.id} className="inline-flex items-center gap-2 rounded-pill border border-ink-200 bg-white py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-800">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${categoryColor(category.id)}`} aria-hidden="true">
                <CategoryIcon iconName={category.icon_name} className="h-3.5 w-3.5" />
              </span>
              {category.name}
            </li>
          ))}
        </ul>
      </section>

      {/* ===== FAQ ===== */}
      <section className="container-app pb-16 lg:pb-24" aria-labelledby="faq-heading">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
          <div>
            <p className={sectionEyebrow}>Questions</p>
            <h2 id="faq-heading" className={sectionTitle}>What educators ask us</h2>
            <p className="mt-3 text-base text-ink-600 leading-relaxed max-w-md">Can’t see your question? Our team in Mbarara answers on WhatsApp.</p>
            <button onClick={() => setCurrentView('contact')} className="mt-6 inline-flex items-center gap-2 px-6 min-h-[48px] rounded-pill bg-ink-900 hover:bg-forest-800 text-white text-sm font-semibold transition">
              Contact us<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <ul className="space-y-3">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <li key={faq.q} className={`rounded-card border transition ${open ? 'border-forest-200 bg-forest-50/60' : 'border-ink-200 bg-white'}`}>
                  <h3 className="text-base">
                    <button
                      onClick={() => setOpenFaq(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`teach-faq-${index}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 min-h-[56px] text-left font-semibold text-ink-900 font-sans"
                    >
                      {faq.q}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${open ? 'bg-forest-700 text-white' : 'bg-ink-100 text-ink-700'}`} aria-hidden="true">
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h3>
                  {open && <p id={`teach-faq-${index}`} className="px-5 pb-5 -mt-1 text-sm text-ink-700 leading-relaxed">{faq.a}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ===== FINAL CALL ===== */}
      <section className="container-app pb-20" aria-labelledby="cta-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-12 sm:p-14 text-white">
          <span aria-hidden="true" className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border border-white/15 bg-white/5" />
          <span aria-hidden="true" className="absolute right-32 -bottom-12 -z-10 h-32 w-32 rounded-full border border-white/15 bg-white/5" />
          <div className="max-w-2xl">
            <h2 id="cta-heading" className="font-display text-[1.75rem] sm:text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Ready to teach your trade?</h2>
            <p className="mt-3 text-base text-forest-100/85">Create your account, send your application, and we’ll be in touch on WhatsApp.</p>
            <div className="mt-8">{renderActions(true)}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
