import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { NewsletterSection } from '../components/NewsletterSection';
import { formatUGX } from '../utils/formatters';
import { EducatorCardSkeleton, CategorySkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search, ShieldCheck, CheckCircle2, ArrowRight, Star,
  Award, Users, Briefcase, GraduationCap, MapPin, Sparkles,
  Scissors, Code, Smartphone, Utensils, Zap, Hammer,
  Wrench, Sprout, Camera, Palette, TrendingUp, ChevronRight, Phone,
  Play, Quote, BadgeCheck, Clock, DollarSign, ArrowUpRight,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [howTab, setHowTab] = useState<'learners' | 'educators'>('learners');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const [cats, edus, skills] = await Promise.all([
          api.getCategories(),
          api.getEducators({ featured: true }),
          api.getSkills(undefined, true)
        ]);
        setCategories(cats);
        setFeaturedEducators(edus);
        setPopularSkills(skills);
      } catch (err: any) {
        setLoadError(err.message || 'Failed to load. Please retry.');
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
      {/* ===== PREMIUM HERO — editorial split + workshop imagery ===== */}
      <section className="relative overflow-hidden bg-white">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-forest-50/80 via-white to-ink-50/60" />
          <div className="absolute -top-32 -right-32 w-[640px] h-[640px] bg-forest-100 rounded-full blur-[120px] opacity-50" />
          <div className="absolute -bottom-40 -left-40 w-[560px] h-[560px] bg-amber-50 rounded-full blur-[100px] opacity-40" />
        </div>

        <div className="container-app relative pt-8 lg:pt-14 pb-10 lg:pb-16">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-10 items-center">
            {/* Left: copy + search */}
            <div className="space-y-6 lg:pr-6">
              {/* Founder pill — subtle, not noisy */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-pill bg-white border border-ink-200 shadow-soft text-xs">
                <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" aria-hidden="true" />
                <span className="font-bold text-ink-900">Mbarara • Founded by Ashabahebwa Hassan</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-ink-500">
                  <span className="w-1 h-1 rounded-full bg-ink-300" />
                  Where Skills Meet Opportunity
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display font-bold tracking-tight text-ink-900 leading-[0.95]">
                  <span className="block text-[2rem] sm:text-[2.6rem] lg:text-[3.3rem]">Master</span>
                  <span className="block text-[2rem] sm:text-[2.6rem] lg:text-[3.3rem] bg-gradient-to-r from-forest-700 via-forest-800 to-emerald-700 bg-clip-text text-transparent">
                    real skills.
                  </span>
                  <span className="block text-[1.35rem] sm:text-[1.55rem] lg:text-[1.9rem] font-semibold text-ink-700 mt-1">In real workshops. With real masters.</span>
                </h1>
                <p className="text-[15px] sm:text-[16px] text-ink-600 leading-relaxed max-w-[560px]">
                  Not videos. Hands-on apprenticeships with verified Ugandan artisans, technicians & creatives — MTN/Airtel escrow protected, inspected workbenches, rule-based matching.
                </p>
              </div>

              {/* Search — premium card */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-card shadow-level-2 border border-ink-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                role="search"
                aria-label="Find a skill educator"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-1 min-h-[44px] text-ink-800">
                  <span className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <input
                    type="text"
                    placeholder="Try: Tailoring, Solar, Python, Dairy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Skill search"
                    className="w-full text-[14px] font-medium text-ink-900 placeholder:text-ink-500 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 min-h-[44px] rounded-control bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-soft focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2"
                >
                  <span>Find an Educator</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* Popular pills + CTAs */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-ink-500 font-medium">Popular:</span>
                {['Tailoring', 'Solar', 'React', 'Baking'].map(k => (
                  <button key={k} onClick={() => navigate(`/find-skill?search=${encodeURIComponent(k)}`)} className="px-3 py-1.5 rounded-pill bg-ink-50 hover:bg-ink-100 border border-ink-200 text-ink-700 font-semibold transition focus-visible:ring-2 focus-visible:ring-forest-700">
                    {k}
                  </button>
                ))}
                <span className="text-ink-300 hidden sm:inline">•</span>
                <button onClick={() => setCurrentView('find-skill')} className="font-bold text-forest-700 hover:text-forest-800 underline underline-offset-4 decoration-forest-200">Browse all</button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setCurrentView('become-educator')}
                  className="px-5 py-2.5 min-h-[44px] rounded-control bg-ink-900 hover:bg-black text-white font-bold text-sm shadow-soft flex items-center gap-2 transition focus-visible:ring-2 focus-visible:ring-ink-800"
                >
                  <span>Teach on iSkillLink</span>
                  <ArrowUpRight className="w-4 h-4 text-forest-300" />
                </button>
                <button
                  onClick={onOpenSkillRequest}
                  className="px-5 py-2.5 min-h-[44px] rounded-control bg-white hover:bg-ink-50 text-ink-800 font-bold text-sm border border-ink-200 shadow-soft transition focus-visible:ring-2 focus-visible:ring-forest-700"
                >
                  Submit Custom Request
                </button>
              </div>

              {/* Avatars + rating social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" aria-hidden="true" />
                  ))}
                  <span className="w-8 h-8 rounded-full bg-forest-700 text-white border-2 border-white flex items-center justify-center text-[10px] font-bold">+800</span>
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-bold text-ink-900">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span>4.9/5 from 1,200+ reviews</span>
                  </div>
                  <div className="text-ink-500">Trusted by learners across Uganda</div>
                </div>
              </div>
            </div>

            {/* Right: workshop collage */}
            <div className="relative lg:h-[560px] flex items-center">
              <div className="relative w-full">
                {/* Main image */}
                <div className="relative rounded-display overflow-hidden border border-ink-200 shadow-level-3 bg-white">
                  <img
                    src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80"
                    alt="Master artisan mentoring apprentice at workshop bench"
                    className="w-full h-[380px] lg:h-[460px] object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent pointer-events-none" />
                  {/* Bottom bar inside image */}
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-card border border-white/60 shadow-soft p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-9 h-9 rounded-lg bg-forest-700 text-white flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></span>
                      <div>
                        <div className="text-xs font-bold text-ink-900 leading-none">Workshop Inspected</div>
                        <div className="text-[11px] text-ink-600">Bench tools • Safety • ID verified</div>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-forest-50 border border-forest-200 text-forest-800 text-[11px] font-bold">✓ Verified</span>
                  </div>
                </div>

                {/* Floating stat — escrow */}
                <div className="absolute -top-3 -right-2 sm:right-4 bg-white rounded-card border border-ink-200 shadow-level-2 p-3 flex items-center gap-3 min-w-[200px] animate-slideUp">
                  <span className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm"><DollarSign className="w-5 h-5" /></span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Escrow Protected</div>
                    <div className="text-sm font-bold text-ink-900">MTN • Airtel</div>
                  </div>
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                </div>

                {/* Floating rating */}
                <div className="absolute -bottom-4 -left-2 sm:left-2 bg-ink-900 text-white rounded-card border border-ink-800 shadow-level-3 p-3 flex items-center gap-3 min-w-[220px] animate-slideUp" style={{ animationDelay: '120ms' }}>
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="" className="w-10 h-10 rounded-full object-cover border-2 border-forest-500" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1">Amina • Tailoring <BadgeCheck className="w-3.5 h-3.5 text-forest-400" /></div>
                    <div className="text-[11px] text-ink-300 flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> 4.9 • Kakoba, Mbarara</div>
                  </div>
                  <span className="text-[10px] font-bold bg-white text-ink-900 px-2 py-1 rounded-pill">UGX 35k/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-8 lg:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck, title: '100% Vetted', desc: 'NIN + trade checks' },
              { icon: BadgeCheck, title: 'Escrow Safe', desc: 'MTN & Airtel MoMo' },
              { icon: MapPin, title: 'Mbarara HQ', desc: 'Uganda nationwide' },
              { icon: Layers, title: 'Rule-Based', desc: 'Skill • budget • proximity' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-2.5 bg-white border border-ink-200 rounded-card px-3.5 py-3 shadow-soft">
                <item.icon className="w-4 h-4 text-forest-700 shrink-0" aria-hidden="true" />
                <div>
                  <div className="text-xs font-bold text-ink-900 leading-none">{item.title}</div>
                  <div className="text-[11px] text-ink-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="container-app -mt-3">
        <div className="bg-ink-950 rounded-display border border-ink-800 shadow-level-3 px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { k: '120+', v: 'Verified Educators', icon: Award },
            { k: '800+', v: 'Learners Mentored', icon: Users },
            { k: '20+', v: 'Practical Trades', icon: Wrench },
            { k: 'UGX 50M+', v: 'Escrow Volume', icon: TrendingUp },
          ].map(s => (
            <div key={s.v} className="text-center lg:text-left flex lg:items-center gap-3">
              <span className="hidden lg:flex w-9 h-9 rounded-lg bg-white/10 border border-white/10 text-forest-300 items-center justify-center"><s.icon className="w-4 h-4" /></span>
              <div>
                <div className="text-xl font-black text-white tracking-tight">{s.k}</div>
                <div className="text-xs text-ink-300">{s.v}</div>
              </div>
            </div>
          ))}
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
              Identity verified, workshop inspected, highly rated by apprentices — across Mbarara & Uganda.
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

      {/* ===== TESTIMONIALS — social proof ===== */}
      <section className="container-app pt-12">
        <div className="bg-ink-50 rounded-display border border-ink-200 p-6 sm:p-8 shadow-level-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700 mb-4">
            <Quote className="w-3.5 h-3.5" /> Learners say it best
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { q: 'Learned pattern drafting on real Juki machines. My blazer sold in week two.', n: 'Grace N.', r: 'Tailoring • Kakoba', stars: 5 },
              { q: 'Solar sizing taught with actual panels. Now I install for rentals in Booma.', n: 'Musa K.', r: 'Solar • Mbarara', stars: 5 },
              { q: 'Bookkeeping in UGX, MTN escrow — felt safe as a first-time learner.', n: 'Janet A.', r: 'Accounting • Kampala', stars: 5 },
            ].map(t => (
              <div key={t.n} className="bg-white rounded-card border border-ink-200 p-5 space-y-3">
                <div className="flex gap-0.5" aria-label={`${t.stars} stars`}>{Array.from({ length: t.stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-sm text-ink-800 leading-relaxed">“{t.q}”</p>
                <div className="text-xs font-bold text-ink-900">{t.n} <span className="text-ink-500 font-medium">— {t.r}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA — warm editorial ===== */}
      <section className="container-app pt-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest-800 via-forest-700 to-ink-900 rounded-display p-8 sm:p-10 border border-forest-800 shadow-level-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl" aria-hidden="true" />
          <div className="relative space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-pill bg-white/15 border border-white/15 text-white text-[11px] font-bold tracking-wider uppercase"><Heart className="w-3 h-3" /> Craft • Teach • Earn</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">Are you a skilled artisan or professional?</h2>
            <p className="text-sm text-forest-50 leading-relaxed">Monetize your expertise. Teach on your bench, set UGX rates, receive 90% MoMo payouts guaranteed.</p>
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
