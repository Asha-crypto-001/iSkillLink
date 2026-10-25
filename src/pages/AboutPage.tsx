import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

interface AboutPageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
}

const PRINCIPLES = [
  { title: 'Learn where the work happens', body: 'At a real bench, with real tools and real jobs — not slides or videos.' },
  { title: 'Check people before they teach', body: 'Every educator passes four checks, including a visit to their workshop, before anyone can book them.' },
  { title: 'Hold the money until it’s earned', body: 'Learners’ MoMo payments wait with us until the session has happened. If it doesn’t, they’re refunded.' }
];

export const AboutPage: React.FC<AboutPageProps> = ({
  setCurrentView,
  onOpenSkillRequest
}) => {
  return (
    <div className="container-app py-10 space-y-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 font-display">Why iSkillLink exists</h1>
        <p className="text-lg text-ink-700 leading-relaxed">
          Every year, thousands of young people in Mbarara and across Uganda want a trade they can earn from. And in workshops,
          market stalls and kitchens all over the region, there are people who already do that work well — with no simple,
          trusted way to teach it and be paid for it.
        </p>
        <p className="text-lg text-ink-700 leading-relaxed">iSkillLink connects the two.</p>
      </header>

      <section aria-labelledby="believe-heading" className="space-y-5">
        <h2 id="believe-heading" className="text-2xl font-bold text-ink-900 font-display">What we hold ourselves to</h2>
        <ul className="grid md:grid-cols-3 gap-x-8 gap-y-6">
          {PRINCIPLES.map(p => (
            <li key={p.title} className="border-t-2 border-ink-900 pt-3">
              <h3 className="text-base font-bold text-ink-900">{p.title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed mt-1">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The founder, introduced once */}
      <section aria-labelledby="who-heading" className="bg-white rounded-card border border-ink-200 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center">
        <Avatar name="Ashabahebwa Hassan" className="w-20 h-20 rounded-card" />
        <div className="flex-1 space-y-2">
          <h2 id="who-heading" className="text-xl font-bold text-ink-900 font-display">Started in Mbarara by Ashabahebwa Hassan</h2>
          <p className="text-sm text-ink-700 leading-relaxed max-w-2xl">
            iSkillLink is run from Mbarara City. Our small team checks every educator, answers learners on WhatsApp, and
            releases every payout by hand.
          </p>
          <p className="flex items-center gap-1.5 text-sm text-ink-600">
            <MapPin className="w-4 h-4" aria-hidden="true" /> Mbarara City, Western Uganda
          </p>
        </div>
        <a
          href="https://wa.me/256744024529"
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-center inline-flex items-center gap-2 px-4 min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 text-sm font-bold text-ink-900"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" /> Talk to us
        </a>
      </section>

      <section className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => setCurrentView('find-skill')} className="px-5 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 text-white text-sm font-bold">Find an educator</button>
        <button onClick={() => setCurrentView('become-educator')} className="px-5 min-h-[44px] rounded-control border border-ink-200 bg-white hover:bg-ink-50 text-ink-800 text-sm font-bold">Teach on iSkillLink</button>
        <button onClick={onOpenSkillRequest} className="px-5 min-h-[44px] rounded-control text-forest-700 hover:text-forest-800 text-sm font-bold underline underline-offset-4">Tell us what you need</button>
      </section>
    </div>
  );
};
