import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Review, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { Alert } from '../components/ui/Alert';
import { EducatorCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { categoryColor } from '../utils/categoryColors';
import {
  Search, ArrowRight, ArrowUpRight, Star, Plus, Minus, MessageCircle,
  Award, Briefcase, Sparkles, BadgeCheck, CalendarCheck, Users, Smartphone,
  Scissors, Code, Utensils, Zap, Hammer, ShieldCheck,
  Wrench, Sprout, Camera, Palette, TrendingUp, ChevronRight,
  Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu, Info
} from 'lucide-react';
import carpentry480 from '../assets/photos/carpentry-480.webp';
import carpentry736 from '../assets/photos/carpentry-736.webp';
import electronics480 from '../assets/photos/electronics-480.webp';
import electronics736 from '../assets/photos/electronics-736.webp';
import baking480 from '../assets/photos/baking-480.webp';
import baking736 from '../assets/photos/baking-736.webp';
import studentsPhoto from '../assets/photos/students.webp';
import studentsWidePhoto from '../assets/photos/students-wide.webp';
import teacherPhoto from '../assets/photos/teacher.webp';
import teacherWidePhoto from '../assets/photos/teacher-wide.webp';
import classroomPhoto from '../assets/photos/classroom.webp';

// One icon per seeded category (see Category.icon_name); unknown names fall back to a briefcase.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Code, Smartphone, Utensils, Zap, Hammer, Wrench, Sprout, Camera, Palette,
  Briefcase, TrendingUp, Sparkles, Droplets, Car, MessageSquare, Music, Building2, Feather, Cpu
};

const renderCategoryIcon = (iconName: string) => {
  const Icon = CATEGORY_ICONS[iconName] || Briefcase;
  return <Icon className="w-5 h-5" />;
};

interface Photo { src: string; srcSet?: string; width: number; height: number; alt: string }

// Workshop photos from educators, plus classroom photos the founder supplied.
const PHOTOS: Record<string, Photo> = {
  carpentry: { src: carpentry736, srcSet: `${carpentry480} 480w, ${carpentry736} 736w`, width: 736, height: 981, alt: 'A carpenter painting a pair of wooden shelves outside a timber workshop' },
  electronics: { src: electronics736, srcSet: `${electronics480} 480w, ${electronics736} 736w`, width: 736, height: 981, alt: 'Hands wiring sensors to a circuit board beside a laptop running code' },
  baking: { src: baking736, srcSet: `${baking480} 480w, ${baking736} 736w`, width: 736, height: 981, alt: 'Rolling out biscuit dough on a floured table' },
  students: { src: studentsPhoto, width: 340, height: 452, alt: 'Two students smiling up from their laptop and tablet' },
  studentsWide: { src: studentsWidePhoto, width: 678, height: 452, alt: 'Two students sitting on the pavement with a laptop and a tablet' },
  teacher: { src: teacherPhoto, width: 300, height: 415, alt: 'A teacher standing at the front of a classroom' },
  teacherWide: { src: teacherWidePhoto, width: 740, height: 415, alt: 'A teacher leading a lesson while pupils listen' },
  classroom: { src: classroomPhoto, width: 300, height: 355, alt: 'Pupils in uniform listening in a classroom' }
};

// className sets the frame (position, size, rounding); the photo always covers it.
const PhotoFrame: React.FC<{ photo: Photo; sizes?: string; priority?: boolean; className?: string }> = ({
  photo, sizes, priority = false, className = ''
}) => (
  <img
    src={photo.src}
    srcSet={photo.srcSet}
    sizes={photo.srcSet ? sizes : undefined}
    width={photo.width}
    height={photo.height}
    alt={photo.alt}
    loading={priority ? 'eager' : 'lazy'}
    decoding="async"
    {...(priority ? { fetchpriority: 'high' } : {})}
    className={`object-cover bg-ink-100 ${className}`}
  />
);

// A 16-point starburst, drawn once.
const STARBURST_POINTS = Array.from({ length: 32 }, (_, i) => {
  const r = i % 2 ? 36 : 50;
  const a = (Math.PI * i) / 16;
  return `${(50 + r * Math.sin(a)).toFixed(1)},${(50 - r * Math.cos(a)).toFixed(1)}`;
}).join(' ');

// The road: four coloured stretches, one station per step (coordinates in the 1200×520 viewBox).
const ROAD = [
  { x: 150, y: 360, stroke: '#11774f', pill: 'bg-forest-600 text-white', d: 'M0 360 L150 360' },
  { x: 450, y: 170, stroke: '#f2b42c', pill: 'bg-sun-400 text-ink-950', d: 'M150 360 C300 360 300 170 450 170' },
  { x: 750, y: 360, stroke: '#b4532a', pill: 'bg-clay-600 text-white', d: 'M450 170 C600 170 600 360 750 360' },
  { x: 1050, y: 170, stroke: '#0c4f36', pill: 'bg-forest-800 text-white', d: 'M750 360 C900 360 900 170 1050 170 L1200 170' }
];
const ROAD_PATH = 'M0 360 L150 360 C300 360 300 170 450 170 C600 170 600 360 750 360 C900 360 900 170 1050 170 L1200 170';

const STEPS = {
  learners: [
    { icon: Search, t: 'Find your trade', d: 'Search for what you want to make, or browse all the trades.' },
    { icon: CalendarCheck, t: 'Book a session', d: 'Pick a date and time. The educator confirms it.' },
    { icon: Hammer, t: 'Learn at the bench', d: 'Real tools and real jobs, side by side with the educator.' },
    { icon: Star, t: 'Share your success', d: 'Leave a review and show the next learner what you made.' }
  ],
  educators: [
    { icon: Briefcase, t: 'Apply to teach', d: 'Tell us your trade, your rate and where you work.' },
    { icon: ShieldCheck, t: 'Get checked', d: 'We verify your ID and visit your workshop.' },
    { icon: CalendarCheck, t: 'Accept bookings', d: 'Confirm the sessions that suit you, on your own bench.' },
    { icon: Star, t: 'Grow your name', d: 'Reviews from learners bring you the next booking.' }
  ]
};

const FAQS = [
  { q: 'How do I find an educator?', a: 'Search for what you want to learn, or open a trade to see who teaches it. If nobody does yet, send us a request and we’ll match you as soon as an educator for it is verified.' },
  { q: 'Are the educators checked?', a: 'Yes. Before anyone can take bookings, our team verifies their national ID and visits their workshop.' },
  { q: 'Where do lessons happen?', a: 'Mostly at the educator’s own workshop, so you learn with real tools. Some trades, like web development, can also be taught online.' },
  { q: 'How do I book a session?', a: 'Open an educator’s profile, choose a date and time, and send the booking. The educator confirms it and you get a notification.' },
  { q: 'Can I teach on iSkillLink?', a: 'If you are good at a trade, apply to teach. Tell us about your work and your rate, and we’ll arrange the checks.' }
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
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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
  const tradesLabel = categories.length > 0 ? `${categories.length}` : '20';
  const steps = STEPS[howTab];

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO — headline and search on the left; the baking photo in an oval frame with an outline ring ===== */}
      <section className="relative bg-white">
        <div className="container-app pt-12 pb-20 sm:pt-16 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-10 items-center">
            <div className="relative space-y-8">
              {/* Hand-drawn loop leading from the headline to the photo */}
              <svg aria-hidden="true" viewBox="0 0 200 120" className="absolute -right-10 top-4 hidden w-44 text-ink-800 xl:block">
                <path d="M4 70 C 40 18, 92 14, 96 52 S 58 112, 52 74 S 122 18, 196 96" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              <div className="space-y-6">
                <h1 className="font-display font-bold text-ink-900 text-[2.4rem] sm:text-[3.4rem] lg:text-[4rem] xl:text-[4.25rem] leading-[1.02] tracking-[-0.035em]">
                  Learn a trade at a{' '}
                  <span className="inline-flex items-center gap-3 sm:gap-4 whitespace-nowrap">
                    real workbench
                    <span aria-hidden="true" className="hidden sm:inline-flex items-center">
                      <span className="h-px w-12 lg:w-16 bg-ink-900" />
                      <svg viewBox="0 0 100 100" className="-ml-1 h-11 w-11 lg:h-12 lg:w-12 text-sun-300">
                        <polygon points={STARBURST_POINTS} fill="currentColor" />
                        <path d="M38 50h24M54 42l8 8-8 8" stroke="#1f1c18" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-[32rem]">
                  Book hands-on sessions with tailors, electricians, bakers and technicians in Mbarara who teach on their own bench.
                </p>
              </div>

              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-[26px] sm:rounded-pill border border-ink-200 shadow-level-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[36rem]"
                role="search"
                aria-label="Find a skill educator"
              >
                <label className="flex-1 flex items-center gap-3 px-4 min-h-[52px] text-ink-800">
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
                  className="px-7 min-h-[52px] rounded-pill bg-ink-900 hover:bg-forest-800 text-white font-bold text-sm transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2"
                >
                  Find an educator
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

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
                      className="px-4 min-h-[44px] md:min-h-[40px] rounded-pill bg-white hover:bg-forest-50 border border-ink-200 hover:border-forest-300 text-ink-800 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-forest-700"
                    >
                      {outcome.label}
                    </button>
                  ))}
                </div>
                <button onClick={onOpenSkillRequest} className="min-h-[44px] text-left text-sm font-semibold text-forest-700 hover:text-forest-800 underline underline-offset-4 decoration-forest-200 hover:decoration-forest-700">
                  Can’t find it? Tell us what you want to learn
                </button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[19rem] sm:max-w-[23rem]">
              <div className="relative aspect-[0.7]">
                <div aria-hidden="true" className="absolute -inset-4 sm:-inset-5 rounded-full border-[1.5px] border-ink-800">
                  <span className="absolute right-[14.6%] bottom-[10.5%] h-4 w-4 translate-x-1/2 translate-y-1/2 rounded-full bg-ink-900" />
                </div>
                <PhotoFrame photo={PHOTOS.baking} sizes="(min-width: 640px) 23rem, 19rem" priority className="absolute inset-0 h-full w-full rounded-full" />
                <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute -left-7 -top-3 h-20 w-20 sm:h-24 sm:w-24 text-sun-300">
                  <polygon points={STARBURST_POINTS} fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT — what we believe, three honest numbers, and three photo cards ===== */}
      <section className="container-app pb-16 lg:pb-24" aria-labelledby="about-heading">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className={`${sectionEyebrow} flex items-center gap-2`}><Info className="h-4 w-4" aria-hidden="true" />About iSkillLink</p>
            <h2 id="about-heading" className={`${sectionTitle} max-w-[22ch]`}>We believe a trade is best learned at the bench, from someone who does it every day.</h2>
          </div>
          <button onClick={() => setCurrentView('about')} className="self-start lg:self-auto shrink-0 px-6 min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm transition inline-flex items-center gap-2">
            More about us<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-12 grid sm:grid-cols-3 gap-8 sm:gap-0">
          {[
            { value: tradesLabel, label: 'Trades to learn', text: 'From tailoring and baking to solar, welding and web development.' },
            { value: '100%', label: 'Checked in person', text: 'Every educator’s ID is verified and their workshop visited before they teach.' },
            { value: '1-on-1', label: 'Lessons at a real bench', text: 'Learn one-to-one or in a small group, on real jobs.' }
          ].map((stat, index) => (
            <div key={stat.label} className={`flex flex-col-reverse justify-end ${index > 0 ? 'sm:pl-8 sm:border-l border-ink-200' : 'sm:pr-8'}`}>
              <dd className="mt-2 text-sm text-ink-600 leading-relaxed max-w-xs">{stat.text}</dd>
              <dt className="mt-2 font-semibold text-ink-900">{stat.label}</dt>
              <dd className="font-display text-4xl sm:text-5xl font-bold text-ink-900 tracking-[-0.03em]">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { photo: PHOTOS.teacherWide, icon: BadgeCheck, title: 'Taught by people who do the work' },
            { photo: PHOTOS.electronics, icon: Hammer, title: 'Real tools, real jobs' },
            { photo: PHOTOS.studentsWide, icon: Users, title: 'Learn alongside people near you' }
          ].map(({ photo, icon: Icon, title }) => (
            <figure key={title} className="group relative h-64 sm:h-72 overflow-hidden rounded-card">
              <PhotoFrame photo={photo} sizes="(min-width: 640px) 33vw, 100vw" className="absolute inset-0 h-full w-full transition duration-500 group-hover:scale-105" />
              <div aria-hidden="true" className="absolute inset-0 bg-ink-950/45" />
              <span className="glass-dark absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-control text-white" aria-hidden="true">
                <Icon className="h-5 w-5" />
              </span>
              <figcaption className="absolute inset-x-5 bottom-5 font-display text-xl font-bold text-white leading-snug">{title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ===== TRADES — compact cards, bookable trades first ===== */}
      <section className="container-app py-16 lg:py-20 border-t border-ink-100" aria-labelledby="trades-heading">
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
              {sortedCategories.slice(0, 8).map((cat) => {
                const bookable = (educatorCountByCategory[cat.id] || 0) > 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    title={cat.description}
                    className="group flex items-center gap-3.5 p-3.5 sm:p-4 min-h-[4.5rem] rounded-card glass text-left transition hover:border-forest-300 hover:shadow-level-2 focus-visible:ring-2 focus-visible:ring-forest-700"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${categoryColor(cat.id)}`} aria-hidden="true">
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

      {/* ===== HOW IT WORKS — the road to becoming a success story ===== */}
      <section className="bg-ink-50/60 border-y border-ink-100 py-16 lg:py-24" aria-labelledby="how-heading">
        <div className="container-app">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className={sectionEyebrow}>How it works</p>
              <h2 id="how-heading" className={`${sectionTitle} max-w-[20ch]`}>How to become an iSkillLink success story</h2>
            </div>
            <div className="inline-flex self-start lg:self-auto p-1 bg-white border border-ink-200 rounded-pill text-sm font-semibold" role="tablist" aria-label="Show steps for">
              {([['learners', 'I want to learn'], ['educators', 'I want to teach']] as const).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={howTab === key}
                  onClick={() => setHowTab(key)}
                  className={`px-5 min-h-[44px] md:min-h-[40px] rounded-pill transition ${howTab === key ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: a winding road with a numbered station per step */}
          <div className="relative mt-6 hidden lg:block aspect-[1200/520]">
            <svg viewBox="0 0 1200 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
              {ROAD.map(stretch => (
                <path key={stretch.d} d={stretch.d} fill="none" stroke={stretch.stroke} strokeWidth="38" strokeLinecap="round" />
              ))}
              <path d={ROAD_PATH} fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="14 14" strokeLinecap="round" opacity="0.85" />
              {ROAD.map((stretch, index) => (
                <g key={stretch.x}>
                  <circle cx={stretch.x} cy={stretch.y} r="42" fill="#fff" stroke={stretch.stroke} strokeWidth="7" />
                  <text x={stretch.x} y={stretch.y + 10} textAnchor="middle" className="font-display" fontSize="28" fontWeight="800" fill="#1f1c18">
                    0{index + 1}
                  </text>
                </g>
              ))}
            </svg>
            <ol>
              {steps.map((step, index) => {
                const stretch = ROAD[index];
                const above = stretch.y < 300;
                const Icon = step.icon;
                return (
                  <li
                    key={step.t}
                    className="absolute w-[15rem] -translate-x-1/2 text-center"
                    style={above
                      ? { left: `${(stretch.x / 1200) * 100}%`, bottom: `${100 - ((stretch.y - 58) / 520) * 100}%` }
                      : { left: `${(stretch.x / 1200) * 100}%`, top: `${((stretch.y + 58) / 520) * 100}%` }}
                  >
                    <span className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-sm font-bold ${stretch.pill}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {step.t}
                    </span>
                    <p className="mt-2 text-sm text-ink-600 leading-snug">{step.d}</p>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Phones and tablets: the same road, running down the page */}
          <ol className="mt-10 lg:hidden">
            {steps.map((step, index) => {
              const stretch = ROAD[index];
              const Icon = step.icon;
              return (
                <li key={step.t} className="relative grid grid-cols-[3.5rem_1fr] gap-4 pb-8 last:pb-0">
                  {index < steps.length - 1 && <span aria-hidden="true" className="absolute left-[1.5rem] top-12 bottom-0 w-2 rounded-full" style={{ backgroundColor: ROAD[index + 1].stroke }} />}
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[5px] bg-white font-display text-lg font-extrabold text-ink-900" style={{ borderColor: stretch.stroke }} aria-hidden="true">
                    0{index + 1}
                  </span>
                  <div className="pt-1.5">
                    <span className={`inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-sm font-bold ${stretch.pill}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {step.t}
                    </span>
                    <p className="mt-2 text-sm text-ink-600 leading-relaxed">{step.d}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-10 lg:mt-4 flex flex-wrap gap-3">
            {howTab === 'learners' ? (
              <button onClick={() => setCurrentView('find-skill')} className="px-6 min-h-[48px] rounded-pill bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition inline-flex items-center gap-2">Find an educator<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
            ) : (
              <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-pill bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition inline-flex items-center gap-2">Apply to teach<ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
            )}
            <button onClick={() => setCurrentView('how-it-works')} className="px-6 min-h-[48px] rounded-pill bg-white text-ink-800 font-bold text-sm border border-ink-200 hover:bg-ink-50 transition">More detail</button>
          </div>
        </div>
      </section>

      {/* ===== COMMUNITY — the statement in the middle, photos curving around it ===== */}
      <section className="container-app py-16 lg:py-24" aria-labelledby="community-heading">
        <div className="relative lg:h-[38rem]">
          <div className="relative z-10 mx-auto max-w-[42rem] text-center">
            <p className="flex items-center justify-center gap-3 text-sm font-semibold text-forest-700">
              <span aria-hidden="true" className="h-px w-8 bg-forest-300" />Our community<span aria-hidden="true" className="h-px w-8 bg-forest-300" />
            </p>
            <h2 id="community-heading" className="mt-4 font-display text-[1.6rem] sm:text-[2.1rem] font-bold leading-[1.2] tracking-[-0.02em] text-ink-900">
              At iSkillLink, we believe every skill deserves a real teacher.{' '}
              <span className="text-ink-400">From tailoring and baking to solar and carpentry, we connect you with people who do the work every day.</span>
            </h2>
            <div className="mt-7 flex items-center justify-center gap-2">
              <button onClick={() => setCurrentView('about')} className="px-6 min-h-[48px] rounded-pill bg-sun-300 hover:bg-sun-200 text-ink-950 font-bold text-sm transition">More about us</button>
              <button onClick={() => setCurrentView('about')} aria-label="More about us" className="flex h-12 w-12 items-center justify-center rounded-full bg-sun-300 hover:bg-sun-200 text-ink-950 transition">
                <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Six photos on a smile-shaped curve: outer ones high, inner ones low */}
          <div className="mt-10 grid grid-cols-3 gap-3 lg:mt-0 lg:block">
            {[
              { photo: PHOTOS.carpentry, pos: 'lg:left-0 lg:top-[26%]' },
              { photo: PHOTOS.students, pos: 'lg:left-[14.5%] lg:top-[47%]' },
              { photo: PHOTOS.baking, pos: 'lg:left-[30%] lg:top-[62%]' },
              { photo: PHOTOS.teacher, pos: 'lg:right-[30%] lg:top-[62%]' },
              { photo: PHOTOS.classroom, pos: 'lg:right-[14.5%] lg:top-[47%]' },
              { photo: PHOTOS.electronics, pos: 'lg:right-0 lg:top-[26%]' }
            ].map(({ photo, pos }) => (
              <PhotoFrame key={photo.alt} photo={photo} sizes="(min-width: 1024px) 11rem, 33vw" className={`aspect-[4/5] w-full rounded-[20px] shadow-level-2 lg:absolute lg:w-[13%] ${pos}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== EDUCATORS ===== */}
      <section className="container-app pb-16 lg:pb-20" aria-labelledby="educators-heading">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className={sectionEyebrow}>Educators</p>
            <h2 id="educators-heading" className={sectionTitle}>Educators you can book</h2>
            <p className="text-base text-ink-600 mt-2">
              Every educator here was checked by our team before taking bookings.
            </p>
          </div>
          <button onClick={() => setCurrentView('find-skill')} className="self-start sm:self-auto inline-flex items-center gap-1.5 px-5 min-h-[44px] rounded-pill bg-white border border-ink-200 hover:border-ink-300 hover:bg-ink-50 text-ink-800 text-sm font-bold transition">
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
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-ink-900">No educators are taking bookings yet</h3>
                <p className="mt-1 text-sm text-ink-600 leading-relaxed max-w-xl">Tell us what you want to learn and your budget. We’ll match you with someone as soon as an educator for it is verified.</p>
              </div>
            </div>
            <button onClick={onOpenSkillRequest} className="shrink-0 px-5 min-h-[48px] rounded-pill bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition">
              Tell us what you want to learn<ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </section>

      {/* ===== REVIEWS — only real ones, from finished sessions; hidden until there are some ===== */}
      {recentReviews.length > 0 && (
        <section className="container-app pb-16 lg:pb-20 text-center" aria-labelledby="reviews-heading">
          <p className="flex items-center justify-center gap-3 text-sm font-semibold text-forest-700">
            <span aria-hidden="true" className="h-px w-8 bg-forest-300" />From our learners<span aria-hidden="true" className="h-px w-8 bg-forest-300" />
          </p>
          <h2 id="reviews-heading" className={sectionTitle}>What learners say after a session</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-10 text-left">
            {recentReviews.map(review => {
              const educator = educatorById.get(review.educator_id);
              return (
                <figure key={review.id}>
                  <figcaption className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 font-display font-bold text-forest-700" aria-hidden="true">
                      {review.learner_name.charAt(0)}
                    </span>
                    <span className="leading-tight">
                      <span className="block font-semibold text-ink-900">{review.learner_name}</span>
                      {educator && <span className="block text-xs text-ink-500">Learned with {educator.user?.name || 'their educator'}</span>}
                    </span>
                  </figcaption>
                  <div className="mt-4 flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-ink-300'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-3 font-semibold text-ink-800 leading-relaxed">{review.comment}</blockquote>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== TEACH — the educator pitch on the dark brand green, with frosted-glass cards ===== */}
      <section className="container-app pb-16 lg:pb-20" aria-labelledby="teach-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-10 sm:p-12 lg:p-14 text-white">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-300">For educators</p>
              <h2 id="teach-heading" className="mt-2 text-[1.75rem] sm:text-4xl font-bold text-white tracking-[-0.02em] font-display leading-[1.1]">Good at a trade? Teach it here.</h2>
              <p className="mt-3 text-base text-forest-100/85 leading-relaxed max-w-lg">
                Bring learners to your workshop and get paid for what you already know. We find the learners and handle the bookings.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button onClick={() => setCurrentView('become-educator')} className="px-6 min-h-[48px] rounded-pill bg-sun-300 hover:bg-sun-200 text-ink-950 font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950">
                  <span>Apply to teach</span><ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={() => setCurrentView('how-it-works')} className="px-6 min-h-[48px] rounded-pill glass-dark hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition focus-visible:ring-white focus-visible:ring-offset-forest-950">
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

      {/* ===== FAQ — questions on the right, a way to ask our team on the left ===== */}
      <section className="container-app pb-16 lg:pb-24" aria-labelledby="faq-heading">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 lg:gap-16">
          <div>
            <p className={`${sectionEyebrow} flex items-center gap-2`}><MessageCircle className="h-4 w-4" aria-hidden="true" />Questions</p>
            <h2 id="faq-heading" className={sectionTitle}>Your questions, answered clearly</h2>
            <p className="mt-3 text-base text-ink-600 leading-relaxed max-w-md">The things people ask us most, from finding an educator to teaching on iSkillLink.</p>
            <div className="glass mt-8 rounded-card p-6 max-w-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-forest-50 text-forest-700" aria-hidden="true">
                <MessageCircle className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold text-ink-900">Still have questions?</p>
              <p className="mt-1 text-sm text-ink-600">Our team in Mbarara answers on WhatsApp and email.</p>
              <button onClick={() => setCurrentView('contact')} className="mt-5 w-full px-5 min-h-[48px] rounded-pill bg-ink-900 hover:bg-forest-800 text-white font-bold text-sm transition">Contact us</button>
            </div>
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
                      aria-controls={`faq-${index}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 min-h-[56px] text-left font-semibold text-ink-900 font-sans"
                    >
                      {faq.q}
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${open ? 'bg-forest-700 text-white' : 'bg-ink-100 text-ink-700'}`} aria-hidden="true">
                        {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h3>
                  {open && <p id={`faq-${index}`} className="px-5 pb-5 -mt-1 text-sm text-ink-700 leading-relaxed">{faq.a}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ===== JOIN — a solid band with frosted-glass circles ===== */}
      <section className="container-app pb-20" aria-labelledby="join-heading">
        <div className="relative isolate overflow-hidden rounded-display bg-forest-700 px-6 py-12 sm:px-12 sm:py-14">
          <span aria-hidden="true" className="absolute -right-10 -top-14 -z-10 h-48 w-48 rounded-full bg-white/10 border border-white/20" />
          <span aria-hidden="true" className="absolute right-40 bottom-[-3rem] -z-10 h-28 w-28 rounded-full bg-white/10 border border-white/20" />
          <span aria-hidden="true" className="absolute left-[38%] -top-6 -z-10 h-16 w-16 rounded-full bg-white/10 border border-white/20" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h2 id="join-heading" className="font-display text-[1.6rem] sm:text-[2.1rem] font-bold leading-[1.15] tracking-[-0.02em] text-white max-w-[22ch]">
              Join learners across Mbarara and book your first session today.
            </h2>
            <button onClick={() => navigate('/auth?mode=register')} className="self-start md:self-auto shrink-0 px-7 min-h-[52px] rounded-pill bg-white hover:bg-forest-50 text-ink-900 font-bold text-sm inline-flex items-center gap-2 transition focus-visible:ring-white focus-visible:ring-offset-forest-700">
              Create a free account<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
