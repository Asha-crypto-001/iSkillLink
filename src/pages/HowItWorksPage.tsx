import React from 'react';
import { ArrowRight, ArrowDown, RotateCcw } from 'lucide-react';
import { VERIFICATION_STEPS } from '../utils/verification';

interface HowItWorksPageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
}

const LEARNER_STEPS = [
  { title: 'Find someone', body: 'Browse educators near you, or tell us what you want to learn and your budget and we’ll look for someone.' },
  { title: 'Send a booking request', body: 'Pick a date, time and how long. Nothing is charged yet.' },
  { title: 'The educator confirms', body: 'They accept the session, or suggest another time.' },
  { title: 'Pay into escrow', body: 'Pay with MTN MoMo or Airtel Money. iSkillLink holds the money — the educator doesn’t have it yet.' },
  { title: 'Learn at the bench', body: 'Work with real tools on real jobs. Mark the session done afterwards and leave an honest review.' }
];

const EDUCATOR_STEPS = [
  { title: 'Apply', body: 'Tell us your trade, your rate and where you teach. It takes about ten minutes, or apply on WhatsApp.' },
  { title: 'Pass four checks', body: 'We check your ID and background, talk with you, and visit your workshop (details below).' },
  { title: 'Accept the bookings that suit you', body: 'Learners send requests; you confirm the ones that fit your time and bench.' },
  { title: 'Teach, then get paid', body: 'After the session is done, 90% goes to your MoMo. iSkillLink keeps 10%.' }
];

const sectionHeading = 'text-2xl font-bold text-ink-900 font-display';

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  setCurrentView,
  onOpenSkillRequest
}) => {
  return (
    <div className="container-app py-10 space-y-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">How iSkillLink works</h1>
        <p className="text-base text-ink-600 leading-relaxed">
          You learn from someone who does the work, at their workbench. Your money is held by us until the session has happened.
        </p>
        <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-2 text-sm">
          {[['#money', 'Where your money goes'], ['#learners', 'If you want to learn'], ['#educators', 'If you want to teach'], ['#checks', 'How we check educators']].map(([href, label]) => (
            <a key={href} href={href} className="px-3 min-h-[44px] md:min-h-[40px] inline-flex items-center rounded-pill border border-ink-200 bg-white hover:border-ink-400 text-ink-800 font-medium">{label}</a>
          ))}
        </nav>
      </header>

      {/* The one diagram: how a payment moves, and what happens if a session doesn't */}
      <section id="money" aria-labelledby="money-heading" className="scroll-mt-24 space-y-5">
        <h2 id="money-heading" className={sectionHeading}>Where your money goes</h2>
        <ol className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch">
          {[
            { who: 'You', what: 'Pay with MTN MoMo or Airtel Money after the educator confirms.', tone: 'bg-white border-ink-200' },
            { who: 'iSkillLink holds it', what: 'The money waits with us. Nobody has been paid yet.', tone: 'bg-clay-50 border-clay-200' },
            { who: 'The session happens', what: 'You learn at the bench, then confirm it’s done.', tone: 'bg-white border-ink-200' },
            { who: 'The educator is paid', what: '90% goes to their MoMo. 10% is our fee.', tone: 'bg-forest-50 border-forest-200' }
          ].map((node, index, all) => (
            <React.Fragment key={node.who}>
              <li className={`rounded-card border p-4 ${node.tone}`}>
                <div className="text-xs font-semibold text-ink-600 tabular-nums">0{index + 1}</div>
                <div className="font-bold text-ink-900">{node.who}</div>
                <p className="text-sm text-ink-700 mt-1">{node.what}</p>
              </li>
              {index < all.length - 1 && (
                <li aria-hidden="true" className="flex items-center justify-center text-ink-400">
                  <ArrowRight className="w-5 h-5 hidden lg:block" />
                  <ArrowDown className="w-5 h-5 lg:hidden" />
                </li>
              )}
            </React.Fragment>
          ))}
        </ol>
        <p className="flex items-start gap-2 text-sm text-ink-700 max-w-2xl">
          <RotateCcw className="w-4 h-4 mt-0.5 text-clay-700 shrink-0" aria-hidden="true" />
          <span><strong className="text-ink-900">If the session doesn’t happen</strong> — the educator cancels or doesn’t show — our team in Mbarara refunds you in full, or helps you agree a new date.</span>
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        <section id="learners" aria-labelledby="learners-heading" className="scroll-mt-24 space-y-5">
          <h2 id="learners-heading" className={sectionHeading}>If you want to learn</h2>
          <ol className="space-y-5">
            {LEARNER_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="font-display text-lg font-bold text-forest-700 tabular-nums w-7 shrink-0" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3 pt-1">
            <button onClick={() => setCurrentView('find-skill')} className="px-5 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white text-sm font-bold">Find an educator</button>
            <button onClick={onOpenSkillRequest} className="px-5 min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 text-ink-800 text-sm font-bold">Tell us what you need</button>
          </div>
        </section>

        <section id="educators" aria-labelledby="educators-heading" className="scroll-mt-24 space-y-5">
          <h2 id="educators-heading" className={sectionHeading}>If you want to teach</h2>
          <ol className="space-y-5">
            {EDUCATOR_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="font-display text-lg font-bold text-forest-700 tabular-nums w-7 shrink-0" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="text-sm text-ink-600 leading-relaxed">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="pt-1">
            <button onClick={() => setCurrentView('become-educator')} className="px-5 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white text-sm font-bold">Apply to teach</button>
          </div>
        </section>
      </div>

      {/* The four checks — same definition the admin queue and the applicant checklist use */}
      <section id="checks" aria-labelledby="checks-heading" className="scroll-mt-24 space-y-5">
        <div className="max-w-2xl">
          <h2 id="checks-heading" className={sectionHeading}>How we check educators</h2>
          <p className="text-sm text-ink-600 mt-1">Nobody can take bookings until all four are done. Profiles that are still being checked say so.</p>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {VERIFICATION_STEPS.map((step, index) => (
            <li key={step.key} className="border-t-2 border-ink-900 pt-3">
              <span className="text-xs font-semibold text-ink-600 tabular-nums">Check {index + 1}</span>
              <h3 className="text-base font-bold text-ink-900">{step.label}</h3>
              <p className="text-sm text-ink-600 leading-relaxed mt-1">{step.applicantDetail}</p>
            </li>
          ))}
        </ol>
        <p className="text-sm text-ink-700">
          More questions? <button onClick={() => setCurrentView('contact')} className="font-semibold text-forest-700 underline underline-offset-2 hover:text-forest-800 relative after:absolute after:-inset-y-3 after:-inset-x-1 after:content-['']">Read the FAQ or message us</button>.
        </p>
      </section>
    </div>
  );
};
