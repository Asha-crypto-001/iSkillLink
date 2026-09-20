import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Educator, Category } from '../types';
import { api } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { EducatorCard } from '../components/EducatorCard';
import { formatUGX } from '../utils/formatters';
import {
  Search, Filter, SlidersHorizontal,
  X, RotateCcw
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EducatorCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface FindSkillPageProps {
  initialCategoryId?: string;
  onViewEducator: (educator: Educator) => void;
  onRequestBooking: (educator: Educator) => void;
  onOpenSkillRequest: () => void;
}

export const FindSkillPage: React.FC<FindSkillPageProps> = ({
  initialCategoryId,
  onViewEducator,
  onRequestBooking,
  onOpenSkillRequest
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [educators, setEducators] = useState<Educator[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize from URL or prop
  const getInitial = (key: string, fallback: string) => searchParams.get(key) || fallback;
  const getInitialNum = (key: string, fallback: number) => {
    const v = searchParams.get(key);
    return v ? Number(v) : fallback;
  };

  const [search, setSearch] = useState(getInitial('search', ''));
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>(getInitial('category', initialCategoryId || 'all'));
  const [selectedFormat, setSelectedFormat] = useState<string>(getInitial('format', 'all'));
  const [selectedLocation, setSelectedLocation] = useState<string>(getInitial('location', 'all'));
  const [maxPrice, setMaxPrice] = useState<number>(getInitialNum('maxPrice', 60000));
  const [minRating, setMinRating] = useState<number>(getInitialNum('rating', 0));
  const [sortOption, setSortOption] = useState<string>(getInitial('sort', 'relevance'));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const ugandanLocations = [
    { value: 'all', label: 'All Locations in Uganda' },
    { value: 'mbarara', label: 'Mbarara City (HQ & Central)' },
    { value: 'kakoba', label: 'Kakoba / Kamukuzi (Mbarara)' },
    { value: 'ruharo', label: 'Ruharo / Booma (Mbarara)' },
    { value: 'kampala', label: 'Kampala & Central Region' },
    { value: 'entebbe', label: 'Entebbe' },
    { value: 'jinja', label: 'Jinja' },
    { value: 'wakiso', label: 'Wakiso' },
    { value: 'online', label: 'Online Remote Mentoring' }
  ];

  // Body scroll lock when mobile filter drawer is open (3.4)
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  // Sync URL -> state when browser navigates (back/forward)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== search) setSearch(urlSearch);
    const urlCat = searchParams.get('category') || 'all';
    if (urlCat !== selectedCategory) setSelectedCategory(urlCat);
    const urlFormat = searchParams.get('format') || 'all';
    if (urlFormat !== selectedFormat) setSelectedFormat(urlFormat);
    const urlLoc = searchParams.get('location') || 'all';
    if (urlLoc !== selectedLocation) setSelectedLocation(urlLoc);
    const urlMax = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 60000;
    if (urlMax !== maxPrice) setMaxPrice(urlMax);
    const urlRating = searchParams.get('rating') ? Number(searchParams.get('rating')) : 0;
    if (urlRating !== minRating) setMinRating(urlRating);
    const urlSort = searchParams.get('sort') || 'relevance';
    if (urlSort !== sortOption) setSortOption(urlSort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Sync state -> URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedFormat !== 'all') params.format = selectedFormat;
    if (selectedLocation !== 'all') params.location = selectedLocation;
    if (maxPrice !== 60000) params.maxPrice = String(maxPrice);
    if (minRating > 0) params.rating = String(minRating);
    if (sortOption !== 'relevance') params.sort = sortOption;

    const current = Object.fromEntries(searchParams.entries());
    const sameKeys = Object.keys(params).length === Object.keys(current).length &&
      Object.keys(params).every(k => current[k] === params[k]);
    if (!sameKeys || Object.keys(params).some(k => current[k] !== params[k])) {
      const hasDiff = JSON.stringify(params) !== JSON.stringify(current);
      if (hasDiff) setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, selectedFormat, selectedLocation, maxPrice, minRating, sortOption]);

  const fetchEducators = async () => {
    try {
      setLoading(true);
      const data = await api.getEducators({
        search: debouncedSearch || undefined,
        category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        format: selectedFormat !== 'all' ? selectedFormat : undefined,
        location: selectedLocation !== 'all' ? selectedLocation : undefined,
        maxPrice: maxPrice || undefined,
        rating: minRating > 0 ? minRating : undefined,
        sort: sortOption
      });
      setEducators(data);
    } catch (err) {
      console.error('Error fetching educators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchEducators();
  }, [debouncedSearch, selectedCategory, selectedFormat, selectedLocation, maxPrice, minRating, sortOption]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedFormat('all');
    setSelectedLocation('all');
    setMaxPrice(60000);
    setMinRating(0);
    setSortOption('relevance');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    search !== '' ||
    selectedCategory !== 'all' ||
    selectedFormat !== 'all' ||
    selectedLocation !== 'all' ||
    maxPrice < 60000 ||
    minRating > 0;

  return (
    <div className="container-app py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Explore Skills', to: '/find-skill' }]} />
      <div className="bg-white p-6 rounded-card border border-ink-200 shadow-level-1 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight font-display">
            Find a Verified Skill Educator
          </h1>
          <p className="text-[13px] sm:text-body-sm text-ink-600 mt-1">
            Browse vetted master artisans, practical technicians, and trainers in Mbarara and across Uganda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skill, educator, keyword (e.g. Tailoring, Solar, React)..."
              className="w-full text-[13px] sm:text-sm pl-10 pr-10 py-2.5 min-h-[44px] rounded-control border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700 bg-white placeholder:text-ink-400"
              aria-label="Search educators"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-control text-ink-400 hover:text-ink-700 hover:bg-ink-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold px-3 py-2.5 min-h-[44px] rounded-control border border-ink-200 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-700"
              aria-label="Sort educators"
            >
              <option value="relevance">Recommended & Featured</option>
              <option value="rating">Highest Rating (5★ first)</option>
              <option value="experience">Years of Experience</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-control border border-ink-200 bg-white text-ink-800 text-[13px] font-bold shadow-soft hover:bg-ink-50 shrink-0"
              aria-expanded={mobileFiltersOpen}
              aria-haspopup="dialog"
              aria-label="Open filters"
            >
              <Filter className="w-4 h-4 text-forest-700" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-ink-100 text-[13px]">
            <span className="text-ink-500 font-semibold">Active:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[32px] rounded-pill bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold">
                <span>Cat: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')} className="p-1 -mr-1 hover:bg-forest-100 rounded-full" aria-label="Clear category filter"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {selectedFormat !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[32px] rounded-pill bg-forest-50 text-forest-800 border border-forest-200 capitalize text-xs font-semibold">
                <span>{selectedFormat}</span>
                <button onClick={() => setSelectedFormat('all')} className="p-1 -mr-1 hover:bg-forest-100 rounded-full" aria-label="Clear format filter"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[32px] rounded-pill bg-forest-50 text-forest-800 border border-forest-200 capitalize text-xs font-semibold">
                <span>{selectedLocation}</span>
                <button onClick={() => setSelectedLocation('all')} className="p-1 -mr-1 hover:bg-forest-100 rounded-full" aria-label="Clear location filter"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[32px] rounded-pill bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <span>{minRating}★+</span>
                <button onClick={() => setMinRating(0)} className="p-1 -mr-1 hover:bg-amber-100 rounded-full" aria-label="Clear rating filter"><X className="w-3.5 h-3.5" /></button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-ink-600 hover:text-ink-900 font-bold ml-auto text-xs min-h-[44px] px-3 py-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter — Bottom Sheet (Phase 4: thumb-reach, safe-area, 44px targets) */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileFiltersOpen(false)} aria-hidden="true" />
          <div className="relative w-full bg-white rounded-t-display shadow-level-3 border-t border-ink-200 max-h-[85vh] flex flex-col animate-slideUp overflow-hidden">
            <div className="flex justify-center pt-2.5 pb-1 shrink-0">
              <span className="w-10 h-1.5 rounded-full bg-ink-200" aria-hidden="true" />
            </div>
            <div className="flex items-center justify-between px-5 pb-3 border-b border-ink-100 shrink-0">
              <h3 className="font-bold text-sm text-ink-900 flex items-center gap-2 font-display"><SlidersHorizontal className="w-4 h-4 text-forest-700" />Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-control hover:bg-ink-50 text-ink-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close filters"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 overscroll-contain">
              <div>
                <label className="block text-[13px] font-bold text-ink-800 mb-2">Skill Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full text-[13px] min-h-[44px] rounded-control border border-ink-200 p-2.5 bg-white focus:ring-2 focus:ring-forest-700">
                  <option value="all">All Skill Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-ink-800 mb-2">Learning Format</label>
                <div className="space-y-2 text-[13px]">
                  {[{id:'all',label:'All Formats'},{id:'in-person',label:'In-Person Workshop'},{id:'hybrid',label:'Hybrid'},{id:'online',label:'Online Live'}].map(f => (
                    <label key={f.id} className="flex items-center gap-3 p-3 rounded-control border hover:bg-ink-50 cursor-pointer min-h-[44px] transition">
                      <input type="radio" name="format-mobile" checked={selectedFormat===f.id} onChange={()=>setSelectedFormat(f.id)} className="text-forest-700 focus:ring-forest-700 w-4 h-4" />
                      <span className={selectedFormat===f.id?'font-bold text-ink-900':'text-ink-600'}>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-ink-800 mb-2">Service Location</label>
                <select value={selectedLocation} onChange={(e)=>setSelectedLocation(e.target.value)} className="w-full text-[13px] min-h-[44px] rounded-control border border-ink-200 p-2.5 bg-white focus:ring-2 focus:ring-forest-700">
                  {ugandanLocations.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center text-[13px] mb-2"><span className="font-bold text-ink-800">Max Hourly Rate</span><span className="font-bold text-forest-800">{formatUGX(maxPrice)}/hr</span></div>
                <input type="range" min={25000} max={60000} step={5000} value={maxPrice} onChange={(e)=>setMaxPrice(Number(e.target.value))} className="w-full accent-forest-700 h-2" />
                <div className="flex justify-between text-xs text-ink-500 mt-1"><span>UGX 25k</span><span>UGX 60k+</span></div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-ink-800 mb-2">Minimum Rating</label>
                <div className="grid grid-cols-3 gap-2 text-[13px]">
                  {[{val:0,label:'Any'},{val:4.5,label:'4.5★+'},{val:4.8,label:'4.8★+'}].map(r => (
                    <button key={r.val} type="button" onClick={()=>setMinRating(r.val)} className={`py-2.5 px-3 rounded-control border text-center min-h-[44px] font-semibold transition ${minRating===r.val?'bg-amber-50 border-amber-300 text-amber-900':'border-ink-200 text-ink-600 hover:bg-ink-50'}`}>{r.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex gap-3 pb-safe">
              <button onClick={resetFilters} className="flex-1 py-2.5 min-h-[44px] rounded-control border border-ink-200 bg-white text-[13px] font-bold text-ink-700 hover:bg-ink-50">Clear All</button>
              <button onClick={()=>setMobileFiltersOpen(false)} className="flex-1 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-white text-[13px] font-bold hover:bg-forest-800 shadow-soft">Show {educators.length} Results</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="hidden lg:block bg-white p-5 rounded-card border border-ink-200 shadow-level-1 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-forest-700" />
              <span>Filter Results</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-forest-700 hover:text-forest-800 hover:underline font-bold min-h-[44px] px-2"
              >
                Clear all
              </button>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-800 mb-2">
              Skill Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-[13px] rounded-control border-ink-200 border p-2.5 min-h-[44px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
            >
              <option value="all">All Skill Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-800 mb-2">
              Learning Format
            </label>
            <div className="space-y-1.5 text-[13px]">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'in-person', label: 'In-Person Workshop' },
                { id: 'hybrid', label: 'Hybrid (Theory + Bench)' },
                { id: 'online', label: 'Online Live Mentoring' }
              ].map(f => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 p-2.5 min-h-[44px] rounded-control hover:bg-ink-50 cursor-pointer border border-transparent has-[input:checked]:bg-forest-50 has-[input:checked]:border-forest-200 transition"
                >
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === f.id}
                    onChange={() => setSelectedFormat(f.id)}
                    className="text-forest-700 focus:ring-forest-500 w-4 h-4"
                  />
                  <span className={selectedFormat === f.id ? 'font-bold text-ink-900' : 'text-ink-600'}>
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-800 mb-2">
              Service Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-[13px] rounded-control border-ink-200 border p-2.5 min-h-[44px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
            >
              {ugandanLocations.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-[13px] mb-1">
              <span className="font-bold text-ink-800">Max Hourly Rate</span>
              <span className="font-bold text-forest-800">{formatUGX(maxPrice)}/hr</span>
            </div>
            <input
              type="range"
              min={25000}
              max={60000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-forest-700 h-2"
            />
            <div className="flex justify-between text-xs text-ink-500 mt-1">
              <span>UGX 25k</span>
              <span>UGX 60k+</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-ink-800 mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-2 text-[13px]">
              {[
                { val: 0, label: 'Any' },
                { val: 4.5, label: '4.5★+' },
                { val: 4.8, label: '4.8★+' }
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`py-2.5 px-3 rounded-control border text-center min-h-[44px] font-semibold transition ${
                    minRating === r.val
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-forest-50/60 p-4 rounded-card border border-forest-200 space-y-2">
            <h4 className="font-bold text-[13px] text-ink-900">Can't find a specific skill?</h4>
            <p className="text-[11px] text-ink-700 leading-relaxed">
              Post a custom request and our matching team will connect you with a verified practitioner.
            </p>
            <button
              onClick={onOpenSkillRequest}
              className="w-full py-2.5 min-h-[44px] text-[13px] font-bold rounded-control bg-forest-700 text-white hover:bg-forest-800 transition"
            >
              Post Skill Request
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-500 px-1">
            <span>Showing <span className="font-bold text-ink-900">{educators.length}</span> verified educators</span>
            <span className="hidden sm:inline">All profiles screened and approved for safety</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <EducatorCardSkeleton key={i} />)}
            </div>
          ) : educators.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {educators.map(edu => (
                <EducatorCard
                  key={edu.id}
                  educator={edu}
                  onViewProfile={onViewEducator}
                  onRequestBooking={onRequestBooking}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title={hasActiveFilters ? 'No educators matching selected filters' : 'Educator Onboarding in Progress'}
              description={hasActiveFilters
                ? 'Try broadening your search query, clearing filter criteria, or submit a custom skill request.'
                : 'We are actively onboarding verified artisans, trade masters, and practitioners across Mbarara and Uganda. Post what you want to learn, and our team will connect you with a vetted instructor.'}
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2.5 min-h-[44px] rounded-control border border-ink-200 text-[13px] font-bold text-ink-700 hover:bg-ink-50 transition bg-white"
                    >
                      Reset Filters
                    </button>
                  )}
                  <button
                    onClick={onOpenSkillRequest}
                    className="px-5 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-[13px] font-bold text-white hover:bg-forest-800 shadow-soft transition"
                  >
                    Post Custom Skill Request
                  </button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};
