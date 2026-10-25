import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Review, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { Alert } from '../components/ui/Alert';
import { EducatorCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search, ShieldCheck, ArrowRight, Star, Quote,
  Award, Briefcase, Sparkles, BadgeCheck, CalendarCheck, Users, Smartphone,
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

// className sets the frame (position, size, rounding); the photo always covers it.
const WorkshopPhoto: React.FC<{ photo: typeof HERO_PHOTOS.carpentry; sizes: string; priority?: boolean; caption?: boolean; className?: string }> = ({
  photo, sizes, priority = false, caption = true, className = ''
}) => (
  <figure className={`overflow-hidden bg-ink-200 ${className}`}>
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
    {caption && (
      <figcaption className="absolute left-3 top-3 rounded-pill bg-ink-950/60 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-white">
        {photo.label}
      </figcaption>
    )}
  </figure>
);

const TRUST_POINTS = [
  { icon: BadgeCheck, title: 'Checked in person', text: 'We verify every educator’s ID and visit their workshop.' },
  { icon: CalendarCheck, title: 'Book in minutes', text: 'Pick a time that suits you and the educator confirms it.' },
  { icon: Hammer, title: 'Real tools, real jobs', text: 'Learn at a working bench, not from a video.' }
];

// Icon tints for the trade cards, cycled so the grid isn't one flat colour.
const CATEGORY_TINTS = ['bg-forest-50 text-forest-700', 'bg-sun-50 text-sun-700', 'bg-ink-100 text-ink-700'];

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
      {/* ===== HERO — on plain white: the promise and search on the left, real workshops on the right ===== */}
      <section className="bg-white">
          <div className="container-app pt-12 pb-14 sm:pt-16 lg:pt-20 lg:pb-20">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-5">
                  <h1 className="font-display font-bold text-ink-900 text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] leading-[1.02] tracking-[-0.03em] max-w-[14ch]">
                    Learn a trade at a{' '}
                    <span className="relative whitespace-nowrap text-forest-700">
                      real workbench
                      <svg aria-hidden="true" viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-sun-400">
                        <path d="M3 9C60 3.5 170 1.5 297 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>.
                  </h1>
                  <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-[32rem]">
                    Book hands-on sessions with tailors, electricians, bakers and technicians in Mbarara who teach on their own bench.
                  </p>
                </div>

                <form
                  onSubmit={handleHeroSearch}
                  className="bg-white p-2 rounded-display border border-ink-200 shadow-level-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[36rem]"
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
                  <p className="text-sm text-ink-600">Or start from what you want to make:</p>
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
                        className="px-3.5 min-h-[44px] md:min-h-[40px] rounded-pill bg-white hover:bg-forest-50 border border-ink-200 hover:border-forest-300 text-ink-800 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-forest-700"
                      >
                        {outcome.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={onOpenSkillRequest} className="min-h-[44px] text-left text-sm font-semibold text-forest-700 hover:text-forest-800 underline underline-offset-4 decoration-forest-200 hover:decoration-forest-700">
                    Can’t find it? Tell us what you want to learn
                  </button>
                </div>

                {!loading && activeEducators.length > 0 && (
                  <dl className="flex max-w-[30rem] border-t border-ink-200 pt-6">
                    {[
                      { value: activeEducators.length, label: activeEducators.length === 1 ? 'educator teaching' : 'educators teaching' },
                      { value: tradeCount, label: tradeCount === 1 ? 'trade to choose' : 'trades to choose' },
                      ...(reviews.length > 0 ? [{ value: reviews.length, label: reviews.length === 1 ? 'review from learners' : 'reviews from learners' }] : [])
                    ].map((stat, index) => (
                      <div key={stat.label} className={`flex flex-1 flex-col-reverse ${index > 0 ? 'pl-4 sm:pl-6 border-l border-ink-200' : 'pr-4'}`}>
                        <dt className="mt-1 text-xs sm:text-sm text-ink-600 leading-snug">{stat.label}</dt>
                        <dd className="font-display text-2xl sm:text-3xl font-bold text-ink-900 tabular-nums">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {/* Two workshop photos: the big arched one has a solid green arch of the same shape set behind it,
                  offset down and to the right; the small one overlaps the bottom-left corner. */}
              <div className="relative mx-auto w-full max-w-[34rem] aspect-[1.1]">
                <div aria-hidden="true" className="absolute left-[36%] w-[46%] top-[5%] bottom-[16%] [border-radius:50%_50%_32px_32px/32%_32%_32px_32px] bg-forest-500" />
                <WorkshopPhoto
                  photo={HERO_PHOTOS.carpentry}
                  sizes="(min-width: 1024px) 16rem, 46vw"
                  priority
                  caption={false}
                  className="absolute left-[28%] w-[46%] top-0 bottom-[22%] [border-radius:50%_50%_32px_32px/32%_32%_32px_32px] shadow-level-2"
                />
                <WorkshopPhoto
                  photo={HERO_PHOTOS.electronics}
                  sizes="(min-width: 1024px) 16rem, 46vw"
                  priority
                  caption={false}
                  className="absolute left-0 bottom-[4%] h-[32%] w-[46%] rounded-[22px] sm:rounded-[28px] border-[5px] sm:border-[6px] border-white shadow-level-3"
                />
                <span aria-hidden="true" className="absolute left-[16%] top-[14%] h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-4 ring-white shadow-level-2 bg-[linear-gradient(#000_0_16.67%,#fcdc04_16.67%_33.33%,#d90000_33.33%_50%,#000_50%_66.67%,#fcdc04_66.67%_83.33%,#d90000_83.33%)]" />
                <span aria-hidden="true" className="absolute right-[8%] top-[10%] h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-sun-300" />
                <svg aria-hidden="true" viewBox="0 0 64 16" className="absolute right-[4%] bottom-[10%] h-4 w-16 text-forest-400">
                  <path d="M2 8c5-6 9-6 14 0s9 6 14 0 9-6 14 0 9 6 14 0" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
      </section>

      {/* ===== TRUST — the reasons it’s safe to learn from someone new ===== */}
      <section aria-label="Why learners trust iSkillLink">
        <ul className="container-app grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 pt-12 pb-4">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
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

      {/* ===== TRADES — compact cards, bookable trades first ===== */}
      <section className="container-app py-16 lg:py-20" aria-labelledby="trades-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className={sectionEyebrow}>Trades</p>
          <h2 id="trades-heading" className={sectionTitle}>Trades you can learn</h2>
          <p className="text-base text-ink-600 mt-2">
            Learn where the work happens. Trades with educators ready to teach are listed first.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[4.5rem] rounded-card border border-ink-200 bg-white animate-pulse" />)}
          </div>
        ) : loadError ? (
          <Alert>
            <span className="flex flex-wrap items-center justify-between gap-2">
              {loadError}
              <button onClick={() => window.location.reload()} className="px-3 min-h-[44px] md:min-h-[36px] rounded-control bg-white border border-rose-200 text-rose-700 text-xs font-bold">Try again</button>
            </span>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {sortedCategories.slice(0, 8).map((cat, index) => {
                const bookable = (educatorCountByCategory[cat.id] || 0) > 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    title={cat.description}
                    className="group flex items-center gap-3.5 p-3.5 sm:p-4 min-h-[4.5rem] rounded-card glass text-left transition hover:border-forest-300 hover:shadow-level-2 focus-visible:ring-2 focus-visible:ring-forest-700"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${CATEGORY_TINTS[index % CATEGORY_TINTS.length]}`} aria-hidden="true">
                      {renderCategoryIcon(cat.icon_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-ink-900 leading-snug">{cat.name}</span>
                      <span className={`block text-xs ${bookable ? 'font-semibold text-forest-700' : 'text-ink-500'}`}>{educatorCountLabel(cat.id)}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-forest-700" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={() => setCurrentView('find-skill')}
                className="inline-flex items-center gap-1.5 px-5 min-h-[48px] rounded-pill bg-white border border-ink-200 hover:border-forest-300 text-ink-800 text-sm font-bold shadow-soft transition"
              >
                <span>{categories.length > 0 ? `See all ${categories.length} trades` : 'See all trades'}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </section>

      {/* ===== HOW IT WORKS — steps beside a workshop photo ===== */}
      <section className="py-16 lg:py-24" aria-labelledby="how-heading">
        <div className="container-app grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className={sectionEyebrow}>How it works</p>
            <h2 id="how-heading" className={sectionTitle}>From your first search to your first session.</h2>

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
                { t: 'Learn at the bench', d: 'Work with real tools on real jobs, side by side with the educator.' },
                { t: 'Leave a review', d: 'Tell the next learner how it went with an honest review.' }
              ] : [
                { t: 'Apply', d: 'Tell us your trade and your rate. We check your ID and visit your workshop.' },
                { t: 'Set your terms', d: 'Your rate, the tools you provide, and where you teach.' },
                { t: 'Accept bookings', d: 'Confirm the sessions that suit you and teach on your own bench.' },
                { t: 'Get paid', d: 'You’re paid once each session is done.' }
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

          {/* A real workshop, framed the same way as the hero */}
          <div className="relative mx-auto w-full max-w-[26rem] aspect-[0.9]">
            <div aria-hidden="true" className="absolute left-0 right-[12%] top-[14%] bottom-0 rounded-[44px] bg-sun-100" />
            <WorkshopPhoto
              photo={HERO_PHOTOS.baking}
              sizes="(min-width: 1024px) 22rem, 80vw"
              caption={false}
              className="absolute right-0 left-[12%] top-0 bottom-[8%] rounded-[36px] shadow-level-3"
            />
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

      {/* ===== TEACH — the educator pitch on the dark brand green, with frosted-glass cards ===== */}
      <section className="container-app pb-20" aria-labelledby="teach-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-10 sm:p-12 lg:p-14 text-white">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-300">For educators</p>
              <h2 id="teach-heading" className="mt-2 text-[1.75rem] sm:text-4xl font-bold text-white tracking-[-0.02em] font-display leading-[1.1]">Good at a trade? Teach it here.</h2>
              <p className="mt-3 text-base text-forest-100/85 leading-relaxed max-w-lg">
                Bring learners to your workshop and get paid for what you already know. We find the learners and handle the bookings.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-control bg-sun-300 hover:bg-sun-200 text-ink-950 font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950">
                  <span>Apply to teach</span><ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={() => setCurrentView('how-it-works')} className="px-6 min-h-[48px] rounded-control glass-dark hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:ring-white focus-visible:ring-offset-forest-950">
                  <span>How vetting works</span><ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                { icon: BadgeCheck, title: 'Set your own rate', text: 'Charge per hour or per course.' },
                { icon: Users, title: 'Learners come to you', text: 'People who want your trade find you here.' },
                { icon: Hammer, title: 'Teach on your own bench', text: 'Your workshop, your tools, your hours.' }
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="glass-dark flex items-start gap-4 rounded-card p-4 sm:p-5">
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
