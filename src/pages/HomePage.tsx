import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Review, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { NewsletterSection } from '../components/NewsletterSection';
import { formatUGX } from '../utils/formatters';
import { EducatorCardSkeleton, CategorySkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search, ShieldCheck, ArrowRight, Star,
  Award, Users, Briefcase, Sparkles,
  Scissors, Code, Smartphone, Utensils, Zap, Hammer,
  Wrench, Sprout, Camera, Palette, TrendingUp, ChevronRight,
  BadgeCheck, Clock, DollarSign, ArrowUpRight,
  Verified, Layers, Heart
} from 'lucide-react';

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

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors': return <Scissors className="w-5 h-5" />;
      case 'Code': return <Code className="w-5 h-5" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      case 'Utensils': return <Utensils className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Hammer': return <Hammer className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Sprout': return <Sprout className="w-5 h-5" />;
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
      default: return <Briefcase className="w-5 h-5" />;
    }
  };

  return (
    <div className="pb-16 overflow-x-clip">
      {/* ===== HERO — plain promise, search first, and how the money moves ===== */}
      <section className="bg-white border-b border-ink-200">
        <div className="container-app pt-10 lg:pt-16 pb-12 lg:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            {/* Left: promise + search */}
            <div className="space-y-7">
              <div className="space-y-4">
                <h1 className="font-display font-bold text-ink-900 text-[2.25rem] sm:text-5xl lg:text-[3.5rem] leading-[1.05] tracking-[-0.02em] max-w-[15ch]">
                  Learn a trade at a real workbench.
                </h1>
                <p className="text-base sm:text-lg text-ink-600 leading-relaxed max-w-[34rem]">
                  Book hands-on sessions with tailors, electricians, bakers and technicians in Mbarara.
                  Pay with MTN or Airtel MoMo — we hold the money until your session is done.
                </p>
              </div>

              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-card shadow-level-2 border border-ink-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-[36rem]"
                role="search"
                aria-label="Find a skill educator"
              >
                <label className="flex-1 flex items-center gap-3 px-3 min-h-[48px] text-ink-800">
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
                  className="px-6 min-h-[48px] rounded-control bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white font-bold text-sm transition flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2"
                >
                  Find an educator
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* Start from the outcome, not the category name */}
              <div className="space-y-2.5">
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
                      className="px-3.5 min-h-[40px] rounded-pill bg-ink-50 hover:bg-forest-50 hover:border-forest-200 border border-ink-200 text-ink-800 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-forest-700"
                    >
                      {outcome.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-sm">
                {!loading && activeEducators.length > 0 && (
                  <p className="text-ink-700">
                    <strong className="font-semibold text-ink-900">{activeEducators.length} {activeEducators.length === 1 ? 'educator' : 'educators'}</strong> teaching{' '}
                    <strong className="font-semibold text-ink-900">{tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}</strong>
                    {reviews.length > 0 && <> · <strong className="font-semibold text-ink-900">{reviews.length}</strong> {reviews.length === 1 ? 'review' : 'reviews'} from finished sessions</>}
                  </p>
                )}
                <button onClick={onOpenSkillRequest} className="self-start font-semibold text-forest-700 hover:text-forest-800 underline underline-offset-4 decoration-forest-200 hover:decoration-forest-700">
                  Can’t find it? Tell us what you want to learn
                </button>
              </div>
            </div>

            {/* Right: an example receipt — explains the escrow promise without stock photography */}
            <figure className="receipt-shadow relative mx-auto w-full max-w-[25rem] lg:rotate-[1.5deg]" aria-labelledby="escrow-example-caption">
              <div className="receipt bg-white border border-ink-200 px-6 pt-7 pb-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Example booking</span>
                  <span className="text-xs text-ink-500">3 hrs</span>
                </div>
                <p className="mt-2 font-display text-lg font-bold text-ink-900 leading-snug">Pattern drafting with a tailor in Kakoba</p>

                <ol className="mt-6 space-y-5 border-l border-dashed border-ink-300 pl-5">
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-amber-600 ring-4 ring-white" aria-hidden="true" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-900">You pay with MoMo</span>
                      <span className="font-mono text-sm tabular-nums text-ink-900">90,000</span>
                    </div>
                    <p className="text-[13px] text-ink-600">Held by iSkillLink — not sent to anyone yet</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-ink-300 ring-4 ring-white" aria-hidden="true" />
                    <span className="text-sm font-semibold text-ink-900">Session at the workbench</span>
                    <p className="text-[13px] text-ink-600">You confirm it happened</p>
                  </li>
                  <li className="relative">
                    <span className="absolute -left-[1.6rem] top-1 w-2.5 h-2.5 rounded-full bg-forest-700 ring-4 ring-white" aria-hidden="true" />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-900">Educator is paid (90%)</span>
                      <span className="font-mono text-sm tabular-nums text-ink-900">81,000</span>
                    </div>
                    <div className="mt-1 flex items-baseline justify-between gap-3 text-[13px] text-ink-600">
                      <span>iSkillLink fee (10%)</span>
                      <span className="font-mono tabular-nums">9,000</span>
                    </div>
                  </li>
                </ol>

                <p className="mt-6 pt-4 border-t border-dashed border-ink-300 text-[13px] text-ink-700 leading-relaxed">
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

      {/* ===== CATEGORIES — editorial cards ===== */}
      <section className="container-app pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
              <Sparkles className="w-3.5 h-3.5" /> Explore by trade & discipline
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mt-1 font-display">
              Skill Categories
            </h2>
            <p className="text-sm text-ink-600 mt-1 max-w-xl">
              From industrial tailoring to solar installation — learn where work happens, not in slides.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('find-skill')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-control bg-white border border-ink-200 hover:bg-ink-50 text-ink-800 text-sm font-bold shadow-soft transition focus-visible:ring-2 focus-visible:ring-forest-700"
          >
            <span>View all trades</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <>
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shrink-0 w-[72vw] max-w-[260px]"><CategorySkeleton /></div>)}
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => <CategorySkeleton key={i} />)}
            </div>
          </>
        ) : loadError ? (
          <div className="p-4 rounded-card border border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-center gap-2" role="alert">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" aria-hidden="true" />
            <span>{loadError}</span>
            <button onClick={() => window.location.reload()} className="ml-auto px-3 py-1.5 min-h-[36px] rounded-control bg-white border border-rose-200 text-rose-700 text-xs font-bold">Retry</button>
          </div>
        ) : (
          <>
            {/* Mobile snap */}
            <div className="sm:hidden flex gap-3 overflow-x-auto snap-x-mandatory pb-3 no-scrollbar -mx-4 px-4">
              {categories.map((cat) => (
                <button
                  key={`m-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className="snap-start-item shrink-0 w-[74vw] max-w-[280px] p-4 rounded-card border border-ink-200 bg-white hover:border-forest-200 hover:shadow-level-1 focus-visible:ring-2 focus-visible:ring-forest-700 text-left transition group flex flex-col justify-between min-h-[148px]"
                  aria-label={`Browse ${cat.name}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center group-hover:bg-forest-700 group-hover:text-white transition" aria-hidden="true">
                      {getCategoryIcon(cat.icon_name)}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-forest-600 transition" />
                  </div>
                  <div className="pt-6">
                    <h3 className="font-bold text-ink-900 text-[15px] leading-tight">{cat.name}</h3>
                    <p className="text-[12px] text-ink-600 line-clamp-2 mt-1 leading-snug">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* Desktop grid */}
            <div className="hidden sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="p-4 rounded-card border border-ink-200 bg-white hover:border-forest-200 hover:shadow-level-1 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-forest-700 text-left transition group flex flex-col justify-between min-h-[156px]"
                  aria-label={`Browse ${cat.name}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="w-11 h-11 rounded-xl bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center group-hover:bg-forest-700 group-hover:text-white transition" aria-hidden="true">
                      {getCategoryIcon(cat.icon_name)}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-forest-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm leading-tight">{cat.name}</h3>
                    <p className="text-[12px] text-ink-600 line-clamp-2 mt-1 leading-snug">{cat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ===== HOW IT WORKS — timeline ===== */}
      <section className="mt-12 bg-ink-950 border-y border-ink-900 py-12 lg:py-16">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-white/10 border border-white/10 text-forest-200 text-xs font-bold tracking-wider uppercase">
              <Clock className="w-3.5 h-3.5" /> Transparent workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">How iSkillLink Works</h2>
            <p className="text-sm text-ink-300">We verify masters, match precisely, protect money, and ensure real bench learning.</p>

            <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-card border border-white/10 text-xs font-bold mt-2">
              <button onClick={() => setHowTab('learners')} className={`px-5 py-2 rounded-lg transition ${howTab === 'learners' ? 'bg-white text-ink-900 shadow' : 'text-ink-300 hover:text-white'}`}>For Learners</button>
              <button onClick={() => setHowTab('educators')} className={`px-5 py-2 rounded-lg transition ${howTab === 'educators' ? 'bg-white text-ink-900 shadow' : 'text-ink-300 hover:text-white'}`}>For Educators</button>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative mt-10">
            <div className="hidden md:block absolute top-[28px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
            {howTab === 'learners' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { n: 1, t: 'Discover or Request', d: 'Browse verified educators or post a custom learning goal with budget & location.', icon: Search },
                  { n: 2, t: 'Rule-Based Match', d: '35% skill fit + proximity, format, budget, rating — transparent, no black box.', icon: Layers },
                  { n: 3, t: 'Escrow via MoMo', d: 'Pay MTN/Airtel. Funds held until you mark milestone complete.', icon: ShieldCheck },
                  { n: 4, t: 'Build & Review', d: 'Operate machines, build real projects, leave verified review.', icon: Star },
                ].map(s => (
                  <div key={s.n} className="bg-white rounded-card border border-ink-200 p-5 shadow-level-1 space-y-3">
                    <span className="w-9 h-9 rounded-full bg-forest-700 text-white text-sm font-black flex items-center justify-center shadow-sm">{s.n}</span>
                    <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2"><s.icon className="w-4 h-4 text-forest-700" />{s.t}</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { n: 1, t: 'Apply & Verify', d: 'NIN, trade test, workshop inspection — Mbarara team reviews in 24–48h.', icon: BadgeCheck },
                  { n: 2, t: 'Set UGX Rates', d: 'Hourly & package pricing, availability, tools you provide.', icon: DollarSign },
                  { n: 3, t: 'Accept Bookings', d: 'One-click accept, message learners, mentor on your bench.', icon: Users },
                  { n: 4, t: '90% Payout', d: '10% platform fee. Net disbursed to MTN/Airtel on completion.', icon: Award },
                ].map(s => (
                  <div key={s.n} className="bg-white rounded-card border border-ink-200 p-5 shadow-level-1 space-y-3">
                    <span className="w-9 h-9 rounded-full bg-ink-900 text-white text-sm font-black flex items-center justify-center">{s.n}</span>
                    <h3 className="font-bold text-ink-900 text-sm flex items-center gap-2"><s.icon className="w-4 h-4 text-ink-700" />{s.t}</h3>
                    <p className="text-xs text-ink-600 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-3">
            <button onClick={() => setCurrentView('find-skill')} className="px-6 py-3 min-h-[44px] rounded-control bg-white text-ink-900 font-bold text-sm shadow hover:bg-ink-50 transition focus-visible:ring-2 focus-visible:ring-white">Find a Skill</button>
            <button onClick={onOpenSkillRequest} className="px-6 py-3 min-h-[44px] rounded-control bg-forest-700 text-white font-bold text-sm hover:bg-forest-800 transition focus-visible:ring-2 focus-visible:ring-forest-400">Request Custom Skill</button>
          </div>
        </div>
      </section>

      {/* ===== FEATURED — elevated ===== */}
      <section className="container-app pt-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
              <Verified className="w-3.5 h-3.5" /> Vetted artisans & practitioners
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mt-1 font-display">
              Featured Verified Educators
            </h2>
            <p className="text-sm text-ink-600 mt-1">
              Every educator here was checked by our team before taking bookings.
            </p>
          </div>
          <button onClick={() => setCurrentView('find-skill')} className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-control bg-white border border-ink-200 hover:bg-ink-50 text-ink-800 text-sm font-bold shadow-soft transition">
            <span>Browse all mentors</span>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <EducatorCardSkeleton key={i} />)}
          </div>
        ) : featuredEducators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEducators.slice(0, 6).map(edu => (
              <EducatorCard key={edu.id} educator={edu} onViewProfile={onViewEducator} onRequestBooking={onRequestBooking} />
            ))}
          </div>
        ) : loadError ? (
          <EmptyState icon={<Award className="w-6 h-6" />} title="Couldn’t load educators" description={loadError} action={<button onClick={() => window.location.reload()} className="px-5 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-white text-sm font-bold">Retry</button>} />
        ) : (
          <div className="bg-white rounded-display border border-ink-200 p-8 sm:p-10 text-center shadow-level-1 space-y-6">
            <div className="w-14 h-14 rounded-card bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center mx-auto">
              <Award className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-50 text-forest-700 px-2.5 py-1 rounded-full border border-forest-200">Educator Onboarding Open • Mbarara & Uganda</span>
              <h3 className="text-xl sm:text-2xl font-bold text-ink-900 tracking-tight font-display">Be among the first verified educators</h3>
              <p className="text-sm text-ink-600 leading-relaxed">We’re onboarding tailors, technicians, developers, bakers, welders — set your UGX rates, mentor motivated learners, get 90% MoMo payouts.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => setCurrentView('become-educator')} className="px-6 py-3 min-h-[44px] rounded-card bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-level-1 flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-forest-700">
                <span>Apply to Teach</span><ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onOpenSkillRequest} className="px-6 py-3 min-h-[44px] rounded-card bg-white hover:bg-ink-50 text-ink-800 font-bold text-sm border border-ink-200">Request a Custom Skill</button>
            </div>
          </div>
        )}
      </section>

      {/* ===== REVIEWS — only real ones, from finished sessions; hidden until there are some ===== */}
      {recentReviews.length > 0 && (
        <section className="container-app pt-14" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-[-0.01em] font-display">
            From learners who finished a session
          </h2>
          <div className="mt-6 grid md:grid-cols-3 gap-x-8 gap-y-8">
            {recentReviews.map(review => {
              const educator = educatorById.get(review.educator_id);
              return (
                <figure key={review.id} className="border-l-2 border-forest-700 pl-5">
                  <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-ink-300'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-[15px] text-ink-800 leading-relaxed">“{review.comment}”</blockquote>
                  <figcaption className="mt-3 text-sm text-ink-600">
                    <span className="font-semibold text-ink-900">{review.learner_name}</span>
                    {educator && <> learned with {educator.user?.name || 'their educator'} · {educator.title}</>}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== CTA — warm editorial ===== */}
      <section className="container-app pt-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-700 to-ink-900 rounded-display p-8 sm:p-10 border border-forest-800 shadow-level-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-white/15 border border-white/15 text-white text-[11px] font-bold tracking-wider uppercase"><Heart className="w-3 h-3" /> Craft • Teach • Earn</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">Are you a skilled artisan or professional?</h2>
            <p className="text-sm text-forest-50 leading-relaxed">Teach on your own bench, set your own UGX rate, and keep 90% of every session — paid to your MoMo.</p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 shrink-0 w-full lg:w-auto">
            <button onClick={() => setCurrentView('become-educator')} className="px-6 py-3 min-h-[44px] rounded-card bg-white hover:bg-ink-50 text-ink-900 font-bold text-sm shadow flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white">
              <span>Apply to Teach</span><ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentView('how-it-works')} className="px-6 py-3 min-h-[44px] rounded-card bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-white">
              <span>How vetting works</span><ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <div className="container-app pt-10">
        <NewsletterSection />
      </div>
    </div>
  );
};
