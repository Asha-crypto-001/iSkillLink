import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Educator, Skill } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { NewsletterSection } from '../components/NewsletterSection';
import { formatUGX } from '../utils/formatters';
import {
  Search, ShieldCheck, CheckCircle2, ArrowRight, Star,
  Award, Users, Briefcase, GraduationCap, MapPin, Sparkles,
  Scissors, Code, Smartphone, Utensils, Zap, Hammer,
  Wrench, Sprout, Camera, Palette, TrendingUp, ChevronRight, Phone
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, edus, skills] = await Promise.all([
          api.getCategories(),
          api.getEducators({ featured: true }),
          api.getSkills(undefined, true)
        ]);
        setCategories(cats);
        setFeaturedEducators(edus);
        setPopularSkills(skills);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
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
    <div className="section-stack pb-16">
      {/* Hero Section — wired search (Phase 2 precise: real workflow) */}
      <section className="relative bg-ink-950 text-white pt-12 sm:pt-16 pb-16 sm:pb-20 border-b border-ink-800">
        <div className="container-app text-center space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-ink-900 border border-ink-800 text-ink-200 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-forest-400" aria-hidden="true"></span>
            <span>Where Skills Meet Opportunity • Founded by Ashabahebwa Hassan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight font-display">
            Learn Practical Skills From People Who Know Them.
          </h1>

          <p className="text-[15px] sm:text-base text-ink-300 max-w-2xl mx-auto leading-relaxed">
            iSkillLink connects learners across Mbarara, Greater Ankole, and Uganda with verified educators, master artisans, trainers, and seasoned practitioners for hands-on vocational, creative, and technical mastery.
          </p>

          {/* Quick Search Bar — now wired to ?search= (Phase 2 fix) */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleHeroSearch}
              className="bg-white p-2 rounded-card shadow-level-3 flex flex-col sm:flex-row items-center gap-2 border border-ink-200"
              role="search"
              aria-label="Find a skill educator"
            >
              <div className="flex-1 flex items-center gap-2 px-3 w-full text-ink-800">
                <Search className="w-5 h-5 text-ink-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="What practical skill do you want to learn? (e.g. Tailoring, Solar, Python, Dairy...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Skill search"
                  className="w-full text-[13px] sm:text-body py-2.5 text-ink-900 placeholder:text-ink-400 focus:outline-none bg-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold text-[13px] sm:text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-soft min-h-[44px]"
              >
                <span>Find an Educator</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
            <p className="text-xs text-ink-400 mt-2">Try: “Tailoring” → filtered results instantly. No dead-end search.</p>
          </div>

          {/* CTAs — single primary hierarchy (Phase 2 precise: one primary per view) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[13px]">
            <button
              onClick={() => setCurrentView('find-skill')}
              className="px-6 py-3 rounded-control bg-forest-700 hover:bg-forest-800 text-white font-bold transition shadow-soft min-h-[44px]"
            >
              Browse All Skills
            </button>
            <button
              onClick={() => setCurrentView('become-educator')}
              className="px-6 py-3 rounded-control bg-white hover:bg-ink-50 text-ink-900 font-bold border border-ink-200 shadow-soft transition min-h-[44px]"
            >
              Teach on iSkillLink
            </button>
            <button
              onClick={onOpenSkillRequest}
              className="px-5 py-2.5 text-[13px] font-semibold text-ink-300 hover:text-white underline decoration-ink-600 underline-offset-4 transition"
            >
              Submit Custom Request →
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 border-t border-ink-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left max-w-4xl mx-auto">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-forest-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-ink-100">100% Vetted Identity</div>
                <div className="text-xs text-ink-400">National ID & Trade checks</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-forest-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-ink-100">Escrow Protected</div>
                <div className="text-xs text-ink-400">MTN & Airtel MoMo holding</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-5 h-5 text-forest-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-ink-100">Based in Mbarara</div>
                <div className="text-xs text-ink-400">Serving Uganda nationwide</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Award className="w-5 h-5 text-forest-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-ink-100">Rule-Based Match</div>
                <div className="text-xs text-ink-400">Skill, budget & proximity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Explore By Trade & Discipline
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              Skill Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Discover experienced practitioners across vocational, creative, agricultural, and technical trades.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('find-skill')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All Trades</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-600 hover:shadow-sm text-left transition group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-700 group-hover:text-white transition">
                {getCategoryIcon(cat.icon_name)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm group-hover:text-emerald-800 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                  {cat.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 border-y border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Clear & Transparent Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              How iSkillLink Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
              We do not teach the skills ourselves. We verify masters, facilitate structured matching, protect payments, and ensure hands-on learning occurs safely.
            </p>

            {/* Switch Tabs */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-gray-200 text-xs font-bold shadow-sm">
              <button
                onClick={() => setHowTab('learners')}
                className={`px-5 py-2 rounded-lg transition ${
                  howTab === 'learners' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                For Students & Apprentices
              </button>
              <button
                onClick={() => setHowTab('educators')}
                className={`px-5 py-2 rounded-lg transition ${
                  howTab === 'educators' ? 'bg-emerald-700 text-white shadow' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                For Educators & Artisans
              </button>
            </div>
          </div>

          {howTab === 'learners' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Discover or Request</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Browse verified educators by trade, location, and rate, or submit your custom learning goal.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Rule-Based Match</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Get matched based on proximity, format (in-person workshop or online), schedule, and budget.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Escrow Protection</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pay securely via MTN or Airtel MoMo. Funds remain in escrow until training milestones are delivered.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Mastery & Review</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Complete your hands-on practical sessions, build real projects, and leave verified feedback.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Apply & Verify Identity</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Submit your national ID, trade qualifications, and workshop location for verification.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Set UGX Rates</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Define your hourly or course package pricing, availability, and practical workshop equipment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Accept Learner Bookings</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Review student goals, confirm schedules, and mentor apprentices in your workshop or online.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2 relative">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="font-bold text-gray-900 text-sm">Guaranteed Payouts</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Receive 90% of the session fee directly to your Mobile Money account upon milestone completion.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Verified Educators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Vetted Artisans & Practitioners
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
              Featured Verified Educators
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Identity verified, workshop inspected, and highly rated by previous apprentices.
            </p>
          </div>
          <button
            onClick={() => setCurrentView('find-skill')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Browse All Verified Mentors</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {featuredEducators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEducators.slice(0, 6).map(edu => (
              <EducatorCard
                key={edu.id}
                educator={edu}
                onViewProfile={onViewEducator}
                onRequestBooking={onRequestBooking}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl border border-emerald-100 p-8 sm:p-12 text-center shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Educator Onboarding Open • Mbarara & Across Uganda
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Be Among the First Verified Educators on iSkillLink
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                We are actively onboarding verified artisans, technicians, software developers, pastry chefs, and master practitioners. Teach your craft, set your UGX pricing, and mentor motivated Ugandan apprentices.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('become-educator')}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-sm flex items-center gap-2"
              >
                <span>Apply to Teach Practical Skills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSkillRequest}
                className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm border border-gray-300 transition shadow-xs"
              >
                Request a Custom Skill
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Educator CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Are you a skilled artisan, professional, or craftsperson?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Monetize your practical expertise. Share real-world skills with motivated learners across Mbarara and Uganda, set your own UGX rates, and receive guaranteed payouts.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('become-educator')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-gray-100 text-emerald-900 font-bold text-xs sm:text-sm transition shadow"
            >
              Apply to Teach
            </button>
            <button
              onClick={() => setCurrentView('how-it-works')}
              className="px-6 py-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm border border-emerald-700 transition"
            >
              Educator Standards
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NewsletterSection />
      </div>
    </div>
  );
};
