import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Review, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { Alert } from '../components/ui/Alert';
import { EducatorCardSkeleton, CategorySkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search, ShieldCheck, ArrowRight, ArrowUpRight, Star, Quote,
  Award, Briefcase, Sparkles, BadgeCheck, Lock, Wallet, Smartphone,
  Scissors, Code, Utensils, Zap, Hammer,
  Wrench, Sprout, Camera, Palette, TrendingUp, ChevronRight,
  Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu
} from 'lucide-react';
import carpentry480 from '../assets/photos/carpentry-480.webp';
import carpentry736 from '../assets/photos/carpentry-736.webp';
import electronics480 from '../assets/photos/electronics-480.webp';
import electronics736 from '../assets/photos/electronics-736.webp';
import baking480 from '../assets/photos/baking-480.webp';
import baking736 from '../assets/photos/baking-736.webp';

// One icon per seeded category (see Category.icon_name); unknown names fall back to a briefcase.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Code, Smartphone, Utensils, Zap, Hammer, Wrench, Sprout, Camera, Palette,
  Briefcase, TrendingUp, Sparkles, Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu
};

const renderCategoryIcon = (iconName: string) => {
  const Icon = CATEGORY_ICONS[iconName] || Briefcase;
  return <Icon className="w-5 h-5" />;
};

// Real photos from educators' workshops (portrait, 736×981 originals).
const HERO_PHOTOS = {
  carpentry: { small: carpentry480, large: carpentry736, label: 'Carpentry', alt: 'A carpenter painting a pair of wooden shelves outside a timber workshop' },
  electronics: { small: electronics480, large: electronics736, label: 'Electronics', alt: 'Hands wiring sensors to a circuit board beside a laptop running code' },
  baking: { small: baking480, large: baking736, label: 'Baking', alt: 'Rolling out biscuit dough on a floured table' }
};

const WorkshopPhoto: React.FC<{ photo: typeof HERO_PHOTOS.carpentry; sizes: string; priority?: boolean; className?: string }> = ({
  photo, sizes, priority = false, className = ''
}) => (
  <figure className={`relative overflow-hidden rounded-card bg-forest-900 ring-1 ring-white/10 ${className}`}>
    <img
      src={photo.large}
      srcSet={`${photo.small} 480w, ${photo.large} 736w`}
      sizes={sizes}
      width={736}
      height={981}
      alt={photo.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchpriority: 'high' } : {})}
      className="absolute inset-0 h-full w-full object-cover"
    />
    <figcaption className="absolute left-3 top-3 rounded-pill bg-ink-950/60 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
      {photo.label}
    </figcaption>
  </figure>
);

const TRUST_POINTS = [
  { icon: BadgeCheck, title: 'Checked in person', text: 'We verify every educator’s ID and visit their workshop.' },
  { icon: Wallet, title: 'Pay with MoMo', text: 'MTN or Airtel Money. No bank account needed.' },
  { icon: Lock, title: 'Held until it’s done', text: 'Your payment is released only after the session.' },
  { icon: Hammer, title: 'Real tools, real jobs', text: 'Learn at a working bench, not from a video.' }
];

const sectionEyebrow = 'text-xs font-bold uppercase tracking-[0.14em] text-forest-700';
const sectionTitle = 'mt-2 text-[1.75rem] sm:text-4xl font-bold text-ink-900 tracking-[-0.02em] font-display leading-[1.1]';

interface HomePageProps {
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
  onSelectCategory: (categoryId: string) => void;
  onViewEducator: (educator: Educator) => void;
  onRequestBooking: (educator: Educator) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentView,
  onOpenSkillRequest,
  onSelectCategory,
  onViewEducator,
  onRequestBooking
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredEducators, setFeaturedEducators] = useState<Educator[]>([]);
  const [popularSkills, setPopularSkills] = useState<Skill[]>([]);
  const [activeEducators, setActiveEducators] = useState<Educator[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [howTab, setHowTab] = useState<'learners' | 'educators'>('learners');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const [cats, edus, skills, active, allReviews] = await Promise.all([
          api.getCategories(),
          api.getEducators({ featured: true }),
          api.getSkills(undefined, true),
          api.getEducators(),
          api.getReviews()
        ]);
        setCategories(cats);
        setFeaturedEducators(edus);
        setPopularSkills(skills);
        setActiveEducators(active);
        setReviews(allReviews);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load. Please retry.');
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Real numbers only: trades are the distinct categories that active educators teach.
  const tradeCount = new Set(activeEducators.flatMap(e => (e.skills || []).map(s => s.category_id))).size;
  const showcaseEducators = [
    ...featuredEducators,
    ...activeEducators.filter(e => !featuredEducators.some(f => f.id === e.id))
  ].slice(0, 3);
  const educatorById = new Map(activeEducators.map(e => [e.id, e]));
  const recentReviews = [...reviews]
    .filter(r => r.comment?.trim())
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 3);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/find-skill?search=${encodeURIComponent(q)}`);
    } else {
      navigate('/find-skill');
    }
  };

  const educatorCountByCategory = activeEducators.reduce<Record<string, number>>((counts, edu) => {
    new Set((edu.skills || []).map(skill => skill.category_id)).forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    return counts;
  }, {});
  // Trades people can book today come first; the rest keep their curated order.
  const sortedCategories = [...categories].sort((a, b) =>
    Number((educatorCountByCategory[b.id] || 0) > 0) - Number((educatorCountByCategory[a.id] || 0) > 0)
  );
  const educatorCountLabel = (categoryId: string) => {
    const count = educatorCountByCategory[categoryId] || 0;
    return count === 0 ? 'No educators yet' : `${count} ${count === 1 ? 'educator' : 'educators'}`;
  };

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO — the promise and search on the left, real workshops on the right ===== */}
      <section className="relative isolate overflow-hidden bg-forest-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 -right-40 -z-10 h-[40rem] w-[40rem] rounded-full bg-forest-500/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-56 -left-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-sun-400/10 blur-3xl" />

        <div className="container-app pt-12 pb-20 sm:pt-16 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-16 items-center">
            <div className="space-y-8">
              <p className="inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-forest-100">
                <span className="h-2 w-2 rounded-full bg-sun-300" aria-hidden="true" />
                Hands-on lessons in Mbarara and across Uganda
              </p>

              <div className="space-y-5">
                <h1 className="font-display font-bold text-white text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.02] tracking-[-0.03em] max-w-[14ch]">
                  Learn a trade at a{' '}
                  <span className="relative whitespace-nowrap text-sun-300">
                    real workbench
                    <svg aria-hidden="true" viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-sun-400/70">
                      <path d="M3 9C60 3.5 170 1.5 297 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>.
                </h1>
                <p className="text-base sm:text-lg text-forest-100/85 leading-relaxed max-w-[34rem]">
                  Book hands-on sessions with tailors, electricians, bakers and technicians who teach on their own bench.
                  Pay with MTN or Airtel MoMo — we hold the money until your session is done.
                </p>
              </div>

              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-display shadow-level-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[36rem]"
                role="search"
                aria-label="Find a skill educator"
              >
                <label className="flex-1 flex items-center gap-3 px-3 min-h-[52px] text-ink-800">
                  <Search className="w-5 h-5 text-ink-400 shrink-0" aria-hidden="true" />
                  <span className="sr-only">What do you want to learn?</span>
                  <input
                    type="text"
                    placeholder="What do you want to learn?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-base text-ink-900 placeholder:text-ink-500 focus:outline-none bg-transparent"
                  />
                </label>
                <button
                  type="submit"
                  className="px-6 min-h-[52px] rounded-card bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white font-bold text-sm transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2"
                >
                  Find an educator
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* Start from the outcome, not the category name */}
              <div className="space-y-3">
                <p className="text-sm text-forest-100/75">Or start from what you want to make:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'a wedding cake', search: 'cake' },
                    { label: 'a kitenge dress', search: 'tailor' },
                    { label: 'a home solar setup', search: 'solar' },
                    { label: 'a fixed phone screen', search: 'phone' }
                  ].map(outcome => (
                    <button
                      key={outcome.label}
                      onClick={() => navigate(`/find-skill?search=${encodeURIComponent(outcome.search)}`)}
                      className="px-3.5 min-h-[44px] md:min-h-[40px] rounded-pill bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 text-white text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950"
                    >
                      {outcome.label}
                    </button>
                  ))}
                </div>
                <button onClick={onOpenSkillRequest} className="min-h-[44px] text-left text-sm font-semibold text-sun-200 hover:text-sun-100 underline underline-offset-4 decoration-sun-200/40 hover:decoration-sun-100 focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950">
                  Can’t find it? Tell us what you want to learn
                </button>
              </div>

              {!loading && activeEducators.length > 0 && (
                <dl className="grid grid-cols-3 max-w-[30rem] border-t border-white/10 pt-6">
                  {[
                    { value: activeEducators.length, label: activeEducators.length === 1 ? 'educator teaching' : 'educators teaching' },
                    { value: tradeCount, label: tradeCount === 1 ? 'trade to choose' : 'trades to choose' },
                    { value: '90%', label: 'of every fee goes to the educator' }
                  ].map((stat, index) => (
                    <div key={stat.label} className={`flex flex-col-reverse ${index > 0 ? 'pl-4 sm:pl-6 border-l border-white/10' : 'pr-4'}`}>
                      <dt className="mt-1 text-xs sm:text-sm text-forest-100/70 leading-snug">{stat.label}</dt>
                      <dd className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Real workshops, with the two promises that matter pinned on top */}
            <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
              <div className="grid grid-cols-[1.2fr_1fr] grid-rows-2 gap-3 sm:gap-4 h-[24rem] sm:h-[32rem] lg:h-[36rem]">
                <WorkshopPhoto photo={HERO_PHOTOS.carpentry} sizes="(min-width: 1024px) 22rem, 55vw" priority className="row-span-2" />
                <WorkshopPhoto photo={HERO_PHOTOS.electronics} sizes="(min-width: 1024px) 18rem, 45vw" priority />
                <WorkshopPhoto photo={HERO_PHOTOS.baking} sizes="(min-width: 1024px) 18rem, 45vw" />
              </div>

              <div className="absolute -bottom-8 left-3 sm:-left-6 w-[15rem] sm:w-[16.5rem] rounded-card bg-white p-4 text-ink-900 shadow-level-3" aria-labelledby="hero-escrow-title">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-clay-50 text-clay-700" aria-hidden="true">
                    <ShieldCheck className="h-[18px] w-[18px]" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-caption uppercase tracking-[0.12em] text-clay-700">Example booking</p>
                    <p id="hero-escrow-title" className="font-display text-lg font-bold tabular-nums">UGX 90,000 held</p>
                  </div>
                </div>
                <p className="mt-2.5 text-[13px] leading-snug text-ink-600">Released to the educator only after you confirm the session happened.</p>
              </div>

              <p className="absolute top-1/2 -translate-y-1/2 -right-1 sm:-right-5 flex items-center gap-2 rounded-pill bg-white py-2 pl-2.5 pr-3.5 text-[13px] font-semibold text-ink-900 shadow-level-3">
                <BadgeCheck className="h-[18px] w-[18px] text-forest-600" aria-hidden="true" />
                ID checked · workshop visited
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST — the four reasons it’s safe to book a stranger ===== */}
      <section className="bg-white border-b border-ink-200" aria-label="Why learners trust iSkillLink">
        <ul className="container-app grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 py-10">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-forest-50 text-forest-700" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-ink-900">{title}</p>
                <p className="mt-0.5 text-sm text-ink-600 leading-snug">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ===== TRADES — bookable trades first ===== */}
      <section className="container-app py-16 lg:py-20" aria-labelledby="trades-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className={sectionEyebrow}>Trades</p>
            <h2 id="trades-heading" className={sectionTitle}>Trades you can learn</h2>
            <p className="text-base text-ink-600 mt-2 max-w-xl">
              Learn where the work happens. Trades with educators ready to teach are listed first.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('find-skill')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-control bg-white border border-ink-200 hover:border-ink-300 hover:bg-ink-50 text-ink-800 text-sm font-bold shadow-soft transition"
          >
            <span>{categories.length > 0 ? `All ${categories.length} trades` : 'All trades'}</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
          </div>
        ) : loadError ? (
          <Alert>
            <span className="flex flex-wrap items-center justify-between gap-2">
              {loadError}
              <button onClick={() => window.location.reload()} className="px-3 min-h-[44px] md:min-h-[36px] rounded-control bg-white border border-rose-200 text-rose-700 text-xs font-bold">Try again</button>
            </span>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {sortedCategories.slice(0, 8).map((cat) => {
              const bookable = (educatorCountByCategory[cat.id] || 0) > 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  title={cat.description}
                  className="group flex flex-col justify-between gap-4 sm:gap-6 p-4 sm:p-5 min-h-[8rem] sm:min-h-[9.5rem] rounded-card border border-ink-200 bg-white text-left transition hover:border-forest-300 hover:shadow-level-2 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-forest-700"
                >
                  <span className="flex items-start justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-control transition group-hover:bg-forest-700 group-hover:text-white ${bookable ? 'bg-forest-50 text-forest-700' : 'bg-ink-100 text-ink-500'}`}
                      aria-hidden="true"
                    >
                      {renderCategoryIcon(cat.icon_name)}
                    </span>
                    <ArrowUpRight className="h-5 w-5 text-ink-300 transition group-hover:text-forest-700" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-[15px] sm:text-base font-semibold text-ink-900 leading-snug">{cat.name}</span>
                    <span className={`mt-1 block text-xs ${bookable ? 'font-semibold text-forest-700' : 'text-ink-500'}`}>{educatorCountLabel(cat.id)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== HOW IT WORKS — steps beside the receipt that shows where the money goes ===== */}
      <section className="bg-white border-y border-ink-200 py-16 lg:py-24" aria-labelledby="how-heading">
        <div className="container-app grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className={sectionEyebrow}>How it works</p>
            <h2 id="how-heading" className={sectionTitle}>Four steps, and your money is protected the whole way.</h2>

            <div className="mt-6 inline-flex p-1 bg-ink-100 rounded-control text-sm font-semibold" role="tablist" aria-label="Show steps for">
              {([['learners', 'I want to learn'], ['educators', 'I want to teach']] as const).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={howTab === key}
                  onClick={() => setHowTab(key)}
                  className={`px-4 min-h-[44px] md:min-h-[40px] rounded-[9px] transition ${howTab === key ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-600 hover:text-ink-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <ol className="mt-8">
              {(howTab === 'learners' ? [
                { t: 'Find someone', d: 'Browse educators near you, or tell us what you want to learn and your budget.' },
                { t: 'Agree a session', d: 'Pick a date and time. The educator confirms it.' },
                { t: 'Pay into escrow', d: 'Pay with MTN or Airtel MoMo. We hold the money until the session is done.' },
                { t: 'Learn at the bench', d: 'Work with real tools on real jobs, then leave an honest review.' }
              ] : [
                { t: 'Apply', d: 'Tell us your trade and your rate. We check your ID and visit your workshop.' },
                { t: 'Set your terms', d: 'Your hourly rate in UGX, the tools you provide, and where you teach.' },
                { t: 'Accept bookings', d: 'Confirm the sessions that suit you and teach on your own bench.' },
                { t: 'Get paid', d: '90% of every session goes to your MoMo once it’s done.' }
              ]).map((step, index, steps) => (
                <li key={step.t} className="relative grid grid-cols-[auto_1fr] gap-4 pb-7 last:pb-0">
                  {index < steps.length - 1 && <span className="absolute left-5 top-11 bottom-1 w-px bg-ink-200" aria-hidden="true" />}
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-forest-700 bg-white font-display text-sm font-bold text-forest-700 tabular-nums" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-base font-bold text-ink-900">{step.t}</h3>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed max-w-md">{step.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap gap-3">
              {howTab === 'learners' ? (
                <button onClick={() => setCurrentView('find-skill')} className="px-6 min-h-[48px] rounded-control bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition inline-flex items-center gap-2">Find an educator<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
              ) : (
                <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-control bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition inline-flex items-center gap-2">Apply to teach<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
              )}
              <button onClick={() => setCurrentView('how-it-works')} className="px-6 min-h-[48px] rounded-control bg-white text-ink-800 font-bold text-sm border border-ink-200 hover:bg-ink-50 transition">More detail</button>
            </div>
          </div>

          {/* An example receipt — explains the escrow promise in one glance */}
          <div className="relative rounded-display bg-ink-100 px-5 py-10 sm:px-10 sm:py-14 bg-[radial-gradient(theme(colors.ink.300)_1px,transparent_1px)] [background-size:18px_18px]">
            <figure className="receipt-shadow relative mx-auto w-full max-w-[25rem] lg:rotate-[1.5deg]" aria-labelledby="escrow-example-caption">
              <div className="receipt bg-white border border-ink-200 px-6 pt-7 pb-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Example booking</span>
                  <span className="text-xs text-ink-500">3 hrs</span>
                </div>
                <p className="mt-2 font-display text-lg font-bold text-ink-900 leading-snug">Pattern drafting with a tailor in Kakoba</p>

                <ol className="mt-6 space-y-5 border-l border-dashed border-ink-300 pl-5">
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-clay-600 ring-4 ring-white" aria-hidden="true" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-900">You pay with MoMo</span>
                      <span className="font-mono text-sm tabular-nums text-ink-900">90,000</span>
                    </div>
                    <p className="text-[14px] text-ink-600">Held by iSkillLink — not sent to anyone yet</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-ink-300 ring-4 ring-white" aria-hidden="true" />
                    <span className="text-sm font-semibold text-ink-900">Session at the workbench</span>
                    <p className="text-[14px] text-ink-600">You confirm it happened</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-forest-700 ring-4 ring-white" aria-hidden="true" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-900">Educator is paid (90%)</span>
                      <span className="font-mono text-sm tabular-nums text-ink-900">81,000</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-3 text-[14px] text-ink-600">
                      <span>iSkillLink fee (10%)</span>
                      <span className="font-mono tabular-nums">9,000</span>
                    </div>
                  </li>
                </ol>

                <p className="mt-6 pt-4 border-t border-dashed border-ink-300 text-[14px] text-ink-700 leading-relaxed">
                  If the session doesn’t happen, our team refunds you in full.
                </p>
              </div>
              <figcaption id="escrow-example-caption" className="sr-only">
                Example of how a UGX 90,000 booking payment is held in escrow and then split 90% to the educator and 10% to iSkillLink.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== EDUCATORS ===== */}
      <section className="container-app py-16 lg:py-20" aria-labelledby="educators-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className={sectionEyebrow}>Educators</p>
            <h2 id="educators-heading" className={sectionTitle}>Educators you can book</h2>
            <p className="text-base text-ink-600 mt-2">
              Every educator here was checked by our team before taking bookings.
            </p>
          </div>
          <button onClick={() => setCurrentView('find-skill')} className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-control bg-white border border-ink-200 hover:border-ink-300 hover:bg-ink-50 text-ink-800 text-sm font-bold shadow-soft transition">
            <span>See all educators</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <EducatorCardSkeleton key={i} />)}
          </div>
        ) : showcaseEducators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {showcaseEducators.map(edu => (
              <EducatorCard key={edu.id} educator={edu} onViewProfile={onViewEducator} onRequestBooking={onRequestBooking} />
            ))}
          </div>
        ) : loadError ? (
          <EmptyState icon={<Award className="w-6 h-6" />} title="Couldn’t load educators" description={loadError} action={<button onClick={() => window.location.reload()} className="px-5 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-white text-sm font-bold">Retry</button>} />
        ) : (
          // The educator pitch sits just below, so this speaks to learners.
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-card border border-dashed border-ink-300 bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-forest-50 text-forest-700" aria-hidden="true">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink-900">No educators are taking bookings yet</h3>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed max-w-xl">Tell us what you want to learn and your budget. We’ll match you with someone as soon as an educator for it is verified.</p>
              </div>
            </div>
            <button onClick={onOpenSkillRequest} className="shrink-0 px-5 min-h-[48px] rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition">
              Tell us what you want to learn<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      {/* ===== REVIEWS — only real ones, from finished sessions; hidden until there are some ===== */}
      {recentReviews.length > 0 && (
        <section className="container-app pb-16 lg:pb-20" aria-labelledby="reviews-heading">
          <p className={sectionEyebrow}>Reviews</p>
          <h2 id="reviews-heading" className={sectionTitle}>From learners who finished a session</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-4 sm:gap-6">
            {recentReviews.map(review => {
              const educator = educatorById.get(review.educator_id);
              return (
                <figure key={review.id} className="flex flex-col rounded-card border border-ink-200 bg-white p-6 shadow-level-1">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-ink-300'}`} aria-hidden="true" />
                      ))}
                    </div>
                    <Quote className="h-6 w-6 text-forest-200" aria-hidden="true" />
                  </div>
                  <blockquote className="mt-4 flex-1 text-[15px] text-ink-800 leading-relaxed">“{review.comment}”</blockquote>
                  <figcaption className="mt-5 pt-4 border-t border-ink-100 text-sm text-ink-600">
                    <span className="block font-semibold text-ink-900">{review.learner_name}</span>
                    {educator && <>Learned with {educator.user?.name || 'their educator'} · {educator.title}</>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== TEACH — the educator pitch, on the same dark surface as the hero ===== */}
      <section className="container-app pb-20" aria-labelledby="teach-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-10 sm:p-12 lg:p-14 text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-forest-500/25 blur-3xl" />
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-300">For educators</p>
              <h2 id="teach-heading" className="mt-2 text-[1.75rem] sm:text-4xl font-bold text-white tracking-[-0.02em] font-display leading-[1.1]">Good at a trade? Teach it here.</h2>
              <p className="mt-3 text-base text-forest-100/85 leading-relaxed max-w-lg">
                Bring learners to your workshop and get paid for what you already know. We handle the bookings and the money.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-control bg-sun-300 hover:bg-sun-200 text-ink-950 font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950">
                  <span>Apply to teach</span><ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={() => setCurrentView('how-it-works')} className="px-6 min-h-[48px] rounded-control bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition focus-visible:ring-white focus-visible:ring-offset-forest-950">
                  <span>How vetting works</span><ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                { icon: Wallet, title: 'Set your own rate', text: 'Charge in UGX, per hour or per course.' },
                { icon: Smartphone, title: 'Keep 90% of every session', text: 'Paid straight to your MTN or Airtel MoMo.' },
                { icon: Hammer, title: 'Teach on your own bench', text: 'Your workshop, your tools, your hours.' }
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-start gap-4 rounded-card border border-white/10 bg-white/5 p-4 sm:p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-sun-300/15 text-sun-300" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm text-forest-100/75">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
