import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Hammer, MapPin, MessageCircle, RotateCcw, Wallet
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { VERIFICATION_STEPS } from '../utils/verification';
import carpentry480 from '../assets/photos/carpentry-480.webp';
import carpentry736 from '../assets/photos/carpentry-736.webp';
import studentsWidePhoto from '../assets/photos/students-wide.webp';

interface AboutPageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
}

const PRINCIPLES = [
  { icon: Hammer, tint: 'bg-rose-50 text-rose-600', title: 'Learn where the work happens', body: 'At a real bench, with real tools and real jobs — not slides or videos.' },
  { icon: BadgeCheck, tint: 'bg-sky-50 text-sky-600', title: 'Check people before they teach', body: 'Every educator passes four checks, including a visit to their workshop, before anyone can book them.' },
  { icon: Wallet, tint: 'bg-amber-50 text-amber-600', title: 'Hold the money until it’s earned', body: 'Learners’ MoMo payments wait with us until the session has happened. If it doesn’t, they’re refunded.' }
];

const LEARNER_STEPS = [
  { title: 'Find someone', body: 'Browse educators near you, or tell us what you want to learn and your budget and we’ll look for someone.' },
  { title: 'Send a booking request', body: 'Pick a date, time and how long. Nothing is charged yet.' },
  { title: 'The educator confirms', body: 'They accept the session, or suggest another time.' },
  { title: 'Pay into escrow', body: 'Pay with MTN MoMo or Airtel Money. iSkillLink holds the money — the educator doesn’t have it yet.' },
  { title: 'Learn at the bench', body: 'Work with real tools on real jobs. Mark the session done afterwards and leave an honest review.' }
];

const EDUCATOR_STEPS = [
  { title: 'Apply', body: 'Tell us your skill, your rate and where you teach. It takes about ten minutes, or apply on WhatsApp.' },
  { title: 'Pass four checks', body: 'We check your ID and background, talk with you, and visit your workshop.' },
  { title: 'Accept the bookings that suit you', body: 'Learners send requests; you confirm the ones that fit your time and bench.' },
  { title: 'Teach, then get paid', body: 'After the session is done, 90% goes to your MoMo. iSkillLink keeps 10%.' }
];

const MONEY_FLOW = [
  { who: 'You pay', what: 'With MTN MoMo or Airtel Money, after the educator confirms.', tone: 'bg-white border-ink-200' },
  { who: 'iSkillLink holds it', what: 'The money waits with us. Nobody has been paid yet.', tone: 'bg-clay-50 border-clay-200' },
  { who: 'The session happens', what: 'You learn at the bench, then confirm it’s done.', tone: 'bg-white border-ink-200' },
  { who: 'The educator is paid', what: '90% goes to their MoMo. 10% is our fee.', tone: 'bg-forest-50 border-forest-200' }
];

const sectionEyebrow = 'text-xs font-bold uppercase tracking-[0.14em] text-forest-700';
const sectionTitle = 'mt-2 text-[1.75rem] sm:text-4xl font-bold text-ink-900 tracking-[-0.02em] font-display leading-[1.1]';

export const AboutPage: React.FC<AboutPageProps> = ({
  setCurrentView,
  onOpenSkillRequest
}) => {
  const location = useLocation();
  const [stepsFor, setStepsFor] = useState<'learners' | 'educators'>('learners');
  const steps = stepsFor === 'learners' ? LEARNER_STEPS : EDUCATOR_STEPS;

  // Links such as /about#how-it-works (and the old /how-it-works page) land on their section.
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO — why we exist, beside a workshop photo ===== */}
      <section className="container-app pt-12 pb-20 sm:pt-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className={sectionEyebrow}>About iSkillLink</p>
              <h1 className="font-display font-bold text-ink-900 text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] leading-[1.02] tracking-[-0.035em]">
                Skills are learned at the bench
              </h1>
              <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-[34rem]">
                Every year, thousands of young people in Mbarara and across Uganda want a skill they can earn from. And in workshops,
                market stalls and kitchens all over the region, there are people who already do that work well — with no simple,
                trusted way to teach it and be paid for it. iSkillLink connects the two.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setCurrentView('find-skill')} className="group inline-flex items-center gap-2.5 self-start pl-6 pr-1.5 min-h-[52px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold transition">
                Find an educator
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest-800 transition-transform group-hover:rotate-45" aria-hidden="true">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </button>
              <a href="#how-it-works" className="inline-flex items-center self-start gap-2 px-6 min-h-[52px] rounded-pill border border-ink-200 bg-white text-ink-900 hover:bg-ink-50 text-sm font-semibold transition">
                How it works<ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[22rem] sm:max-w-[26rem] pb-10 sm:pb-12">
            <img
              src={carpentry736}
              srcSet={`${carpentry480} 480w, ${carpentry736} 736w`}
              sizes="(min-width: 640px) 26rem, 22rem"
              width={736}
              height={981}
              alt="A carpenter painting a pair of wooden shelves outside a timber workshop"
              {...{ fetchpriority: 'high' }}
              className="aspect-[4/5] w-full rounded-[32px] object-cover bg-ink-100 shadow-level-3"
            />
            <img
              src={studentsWidePhoto}
              width={678}
              height={452}
              alt="Two students sitting on the pavement with a laptop and a tablet"
              loading="lazy"
              decoding="async"
              className="absolute left-0 sm:-left-12 bottom-0 w-[58%] aspect-[3/2] rounded-card object-cover bg-ink-100 ring-8 ring-white shadow-level-2"
            />
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLES ===== */}
      <section className="container-app pb-16 lg:pb-24" aria-labelledby="believe-heading">
        <div className="max-w-2xl">
          <p className={sectionEyebrow}>What we stand for</p>
          <h2 id="believe-heading" className={sectionTitle}>What we hold ourselves to</h2>
        </div>
        <ul className="mt-10 grid md:grid-cols-3 gap-4">
          {PRINCIPLES.map(({ icon: Icon, tint, title, body }) => (
            <li key={title} className="glass rounded-card p-6">
              <span className={`flex h-12 w-12 items-center justify-center rounded-control ${tint}`} aria-hidden="true">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-1.5 text-sm text-ink-600 leading-relaxed">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== HOW IT WORKS — steps for each side, where the money goes, and the four checks ===== */}
      <section id="how-it-works" className="scroll-mt-24 bg-ink-50/60 border-y border-ink-100 py-16 lg:py-24" aria-labelledby="how-heading">
        <div className="container-app space-y-16">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className={sectionEyebrow}>How it works</p>
                <h2 id="how-heading" className={sectionTitle}>From first message to finished session</h2>
                <p className="mt-3 text-base text-ink-600 leading-relaxed">
                  You learn from someone who does the work, at their workbench. Your money is held by us until the session has happened.
                </p>
              </div>
              <div className="inline-flex self-start lg:self-auto p-1 bg-white border border-ink-200 rounded-pill text-sm font-semibold" role="tablist" aria-label="Show steps for">
                {([['learners', 'I want to learn'], ['educators', 'I want to teach']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={stepsFor === key}
                    aria-controls="about-steps"
                    onClick={() => setStepsFor(key)}
                    className={`px-5 min-h-[44px] md:min-h-[40px] rounded-pill transition ${stepsFor === key ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <ol id="about-steps" role="tabpanel" className={`mt-10 grid sm:grid-cols-2 gap-4 ${stepsFor === 'learners' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
              {steps.map((step, index) => (
                <li key={step.title} className="rounded-card border border-ink-200 bg-white p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-forest-700 font-display text-base font-bold text-white tabular-nums" aria-hidden="true">{index + 1}</span>
                  <h3 className="mt-4 text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              {stepsFor === 'learners' ? (
                <>
                  <button onClick={() => setCurrentView('find-skill')} className="px-6 min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm transition inline-flex items-center gap-2">Find an educator<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
                  <button onClick={onOpenSkillRequest} className="px-6 min-h-[48px] rounded-pill bg-white text-ink-800 font-bold text-sm border border-ink-200 hover:bg-ink-50 transition">Tell us what you need</button>
                </>
              ) : (
                <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm transition inline-flex items-center gap-2">Apply to teach<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
              )}
            </div>
          </div>

          {/* How a payment moves, and what happens if a session doesn't */}
          <div id="money" className="scroll-mt-24" role="group" aria-labelledby="money-heading">
            <h3 id="money-heading" className="font-display text-2xl font-bold text-ink-900 tracking-[-0.02em]">Where your money goes</h3>
            <ol className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch">
              {MONEY_FLOW.map((node, index) => (
                <React.Fragment key={node.who}>
                  <li className={`rounded-card border p-5 ${node.tone}`}>
                    <div className="text-xs font-semibold text-ink-600 tabular-nums">0{index + 1}</div>
                    <div className="mt-1 font-bold text-ink-900">{node.who}</div>
                    <p className="text-sm text-ink-700 mt-1 leading-relaxed">{node.what}</p>
                  </li>
                  {index < MONEY_FLOW.length - 1 && (
                    <li aria-hidden="true" className="flex items-center justify-center text-ink-400">
                      <ArrowRight className="w-5 h-5 hidden lg:block" />
                      <ArrowDown className="w-5 h-5 lg:hidden" />
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ol>
            <p className="mt-5 flex items-start gap-2 text-sm text-ink-700 max-w-2xl">
              <RotateCcw className="w-4 h-4 mt-0.5 text-clay-700 shrink-0" aria-hidden="true" />
              <span><strong className="text-ink-900">If the session doesn’t happen</strong> — the educator cancels or doesn’t show — our team in Mbarara refunds you in full, or helps you agree a new date.</span>
            </p>
          </div>

          {/* The four checks — same definition the admin queue and the applicant checklist use */}
          <div id="checks" className="scroll-mt-24" role="group" aria-labelledby="checks-heading">
            <h3 id="checks-heading" className="font-display text-2xl font-bold text-ink-900 tracking-[-0.02em]">How we check educators</h3>
            <p className="mt-1 text-sm text-ink-600 max-w-2xl">Nobody can take bookings until all four are done. Profiles that are still being checked say so.</p>
            <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VERIFICATION_STEPS.map((step, index) => (
                <li key={step.key} className="rounded-card border border-ink-200 bg-white p-5">
                  <span className="text-caption text-forest-700">Check {index + 1}</span>
                  <h4 className="mt-1 text-base font-bold text-ink-900">{step.label}</h4>
                  <p className="mt-1 text-sm text-ink-600 leading-relaxed">{step.applicantDetail}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ===== THE TEAM — the founder, introduced once ===== */}
      <section className="container-app py-16 lg:py-24" aria-labelledby="who-heading">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className={sectionEyebrow}>Who we are</p>
            <h2 id="who-heading" className={sectionTitle}>Started in Mbarara, run from Mbarara</h2>
          </div>
          <div className="glass rounded-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center">
            <Avatar name="Ashabahebwa Hassan" className="w-20 h-20 rounded-card" />
            <div className="flex-1 space-y-2">
              <p className="text-lg font-bold text-ink-900">Ashabahebwa Hassan, founder</p>
              <p className="text-sm text-ink-700 leading-relaxed">
                Our small team checks every educator, answers learners on WhatsApp, and releases every payout by hand.
              </p>
              <p className="flex items-center gap-1.5 text-sm text-ink-600">
                <MapPin className="w-4 h-4" aria-hidden="true" /> Mbarara City, Western Uganda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CALL ===== */}
      <section className="container-app pb-20" aria-labelledby="about-cta-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-12 sm:p-14 text-white">
          <span aria-hidden="true" className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border border-white/15 bg-white/5" />
          <span aria-hidden="true" className="absolute right-32 -bottom-12 -z-10 h-32 w-32 rounded-full border border-white/15 bg-white/5" />
          <div className="max-w-2xl">
            <h2 id="about-cta-heading" className="font-display text-[1.75rem] sm:text-4xl font-bold leading-[1.1] tracking-[-0.02em]">Still have questions?</h2>
            <p className="mt-3 text-base text-forest-100/85">Our team in Mbarara answers on WhatsApp, Monday to Saturday.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/256744024529"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 min-h-[52px] rounded-pill bg-sun-300 hover:bg-sun-200 text-ink-950 text-sm font-semibold transition focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />Message us on WhatsApp
              </a>
              <button onClick={() => setCurrentView('contact')} className="inline-flex items-center justify-center px-6 min-h-[52px] rounded-pill glass-dark hover:bg-white/20 text-white text-sm font-semibold transition focus-visible:ring-white focus-visible:ring-offset-forest-950">
                Other ways to reach us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
