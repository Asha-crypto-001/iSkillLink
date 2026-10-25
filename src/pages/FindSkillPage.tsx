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
import { Alert } from '../components/ui/Alert';

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
  const [loadError, setLoadError] = useState('');

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

  // Places people actually say when asked where they are; matched against educators' locations.
  const places = [
    { value: 'all', label: 'Anywhere' },
    { value: 'kakoba', label: 'Kakoba' },
    { value: 'kamukuzi', label: 'Kamukuzi' },
    { value: 'nyamitanga', label: 'Nyamitanga' },
    { value: 'ruharo', label: 'Ruharo' },
    { value: 'kampala', label: 'Kampala' }
  ];
  const pricePresets = [
    { value: 60000, label: 'Any', spoken: 'Any price' },
    { value: 40000, label: '≤ 40k', spoken: 'Up to UGX 40,000 per hour' },
    { value: 25000, label: '≤ 25k', spoken: 'Up to UGX 25,000 per hour' }
  ];
  const formatOptions = [
    { id: 'all', label: 'Any way' },
    { id: 'in-person', label: 'At their workshop' },
    { id: 'hybrid', label: 'Mix of online and workshop' },
    { id: 'online', label: 'Online' }
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
      setLoadError('');
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
    } catch (err: any) {
      console.error('Error fetching educators:', err);
      setLoadError(err.message || 'Could not load educators.');
      setEducators([]);
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

  const activeChips = [
    search && { key: 'search', label: `“${search}”`, clear: () => setSearch('') },
    selectedCategory !== 'all' && { key: 'category', label: categories.find(c => c.id === selectedCategory)?.name || selectedCategory, clear: () => setSelectedCategory('all') },
    selectedFormat !== 'all' && selectedFormat !== 'online' && { key: 'format', label: formatOptions.find(f => f.id === selectedFormat)?.label || selectedFormat, clear: () => setSelectedFormat('all') },
    maxPrice < 60000 && { key: 'price', label: `Up to ${formatUGX(maxPrice)}/hr`, clear: () => setMaxPrice(60000) },
    minRating > 0 && { key: 'rating', label: `${minRating}★ and up`, clear: () => setMinRating(0) }
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;
  // Only offer a rating filter once some results actually have ratings.
  const showRatingFilter = minRating > 0 || educators.some(e => e.rating > 0);

  const filterControls = (idPrefix: string) => (
    <>
      <div>
        <label htmlFor={`${idPrefix}-category`} className="block text-sm font-bold text-ink-800 mb-2">Category</label>
        <select
          id={`${idPrefix}-category`}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-base sm:text-sm rounded-control border-ink-200 border px-2.5 min-h-[44px] bg-white text-ink-900 focus:ring-2 focus:ring-forest-700"
        >
          <option value="all">All skills</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-bold text-ink-800 mb-2">How you’ll learn</legend>
        <div className="space-y-1.5 text-sm">
          {formatOptions.map(f => (
            <label key={f.id} className="flex items-center gap-2.5 px-2.5 min-h-[44px] rounded-control hover:bg-ink-50 cursor-pointer border border-transparent has-[input:checked]:bg-forest-50 has-[input:checked]:border-forest-200 transition">
              <input type="radio" name={`${idPrefix}-format`} checked={selectedFormat === f.id} onChange={() => setSelectedFormat(f.id)} className="text-forest-700 focus:ring-forest-500 w-4 h-4" />
              <span className={selectedFormat === f.id ? 'font-bold text-ink-900' : 'text-ink-700'}>{f.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="block text-sm font-bold text-ink-800 mb-2">Price per hour</legend>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {pricePresets.map(preset => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setMaxPrice(preset.value)}
              aria-pressed={maxPrice === preset.value}
              aria-label={preset.spoken}
              className={`px-2 min-h-[44px] whitespace-nowrap rounded-control border text-center font-semibold transition ${maxPrice === preset.value ? 'bg-forest-50 border-forest-300 text-forest-900' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </fieldset>

      {showRatingFilter && (
        <fieldset>
          <legend className="block text-sm font-bold text-ink-800 mb-2">Rating</legend>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {[{ val: 0, label: 'Any' }, { val: 4.5, label: '4.5★ +' }, { val: 4.8, label: '4.8★ +' }].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => setMinRating(r.val)}
                aria-pressed={minRating === r.val}
                className={`px-2 min-h-[44px] rounded-control border text-center font-semibold transition ${minRating === r.val ? 'bg-forest-50 border-forest-300 text-forest-900' : 'border-ink-200 text-ink-700 hover:bg-ink-50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </>
  );

  return (
    <div className="container-app py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Explore skills', to: '/find-skill' }]} />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 font-display">Find someone to learn from</h1>
          <p className="text-sm text-ink-600 mt-1">Educators in Mbarara and across Uganda, each checked by our team before taking bookings.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="A skill or a name, e.g. tailoring, solar, Grace"
              className="w-full text-base pl-11 pr-12 min-h-[48px] rounded-control border border-ink-200 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700 bg-white placeholder:text-ink-500"
              aria-label="Search educators"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-control text-ink-500 hover:text-ink-800 hover:bg-ink-50 w-11 h-11 flex items-center justify-center"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="sort-educators" className="sr-only">Sort educators</label>
            <select
              id="sort-educators"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto text-base sm:text-sm font-semibold px-3 min-h-[48px] rounded-control border border-ink-200 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-forest-700"
            >
              <option value="relevance">Recommended</option>
              <option value="rating">Highest rated</option>
              <option value="experience">Most experienced</option>
              <option value="price_asc">Lowest price</option>
              <option value="price_desc">Highest price</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center justify-center gap-1.5 px-4 min-h-[48px] rounded-control border border-ink-200 bg-white text-ink-800 text-sm font-bold hover:bg-ink-50 shrink-0"
              aria-expanded={mobileFiltersOpen}
              aria-haspopup="dialog"
            >
              <Filter className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Where — the most local filter, one tap, always visible */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="group" aria-label="Where">
          <span className="text-sm font-semibold text-ink-700 shrink-0">Where:</span>
          {places.map(place => {
            const active = selectedLocation === place.value && selectedFormat !== 'online';
            return (
              <button
                key={place.value}
                onClick={() => { setSelectedLocation(place.value); if (selectedFormat === 'online') setSelectedFormat('all'); }}
                aria-pressed={active}
                className={`shrink-0 px-3.5 min-h-[44px] md:min-h-[40px] rounded-pill border text-sm font-medium transition ${active ? 'bg-ink-900 border-ink-900 text-white' : 'bg-white border-ink-200 text-ink-700 hover:border-ink-400'}`}
              >
                {place.label}
              </button>
            );
          })}
          <button
            onClick={() => { setSelectedFormat('online'); setSelectedLocation('all'); }}
            aria-pressed={selectedFormat === 'online'}
            className={`shrink-0 px-3.5 min-h-[44px] md:min-h-[40px] rounded-pill border text-sm font-medium transition ${selectedFormat === 'online' ? 'bg-ink-900 border-ink-900 text-white' : 'bg-white border-ink-200 text-ink-700 hover:border-ink-400'}`}
          >
            Online
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-ink-600">Filtered by:</span>
            {activeChips.map(chip => (
              <span key={chip.key} className="inline-flex items-center gap-1 pl-3 pr-1 min-h-[32px] rounded-pill bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold">
                {chip.label}
                <button onClick={chip.clear} className="relative w-7 h-7 flex items-center justify-center hover:bg-forest-100 rounded-full after:absolute after:-inset-2 after:content-['']" aria-label={`Remove filter: ${chip.label}`}>
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
            <button onClick={resetFilters} className="inline-flex items-center gap-1 text-ink-600 hover:text-ink-900 font-semibold text-xs min-h-[44px] px-2">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Clear all
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
              {filterControls('mobile')}
            </div>
            <div className="shrink-0 p-4 bg-ink-50 border-t border-ink-200 flex gap-3 pb-safe">
              <button onClick={resetFilters} className="flex-1 py-2.5 min-h-[44px] rounded-control border border-ink-200 bg-white text-[14px] font-bold text-ink-700 hover:bg-ink-50">Clear all</button>
              <button onClick={()=>setMobileFiltersOpen(false)} className="flex-1 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-white text-[14px] font-bold hover:bg-forest-800 shadow-soft">Show {educators.length} {educators.length === 1 ? 'educator' : 'educators'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="hidden lg:block bg-white p-5 rounded-card border border-ink-200 shadow-level-1 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-forest-700" />
              <span>Filters</span>
            </h3>
          </div>

          {filterControls('desktop')}

          <div className="bg-forest-50/60 p-4 rounded-card border border-forest-200 space-y-2">
            <h4 className="font-bold text-sm text-ink-900">Can’t find what you need?</h4>
            <p className="text-xs text-ink-700 leading-relaxed">
              Tell us what you want to learn and your budget. We’ll look for someone and introduce you.
            </p>
            <button
              onClick={onOpenSkillRequest}
              className="w-full py-2.5 min-h-[44px] text-[14px] font-bold rounded-control bg-forest-700 text-white hover:bg-forest-800 transition"
            >
              Tell us what you need
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-500 px-1">
            <span aria-live="polite"><span className="font-bold text-ink-900">{educators.length}</span> {educators.length === 1 ? 'educator' : 'educators'}</span>
          </div>

          {loadError ? (
            <Alert>
              <span className="flex flex-wrap items-center justify-between gap-2">
                Couldn’t load educators. {loadError}
                <button onClick={fetchEducators} className="px-3 min-h-[44px] md:min-h-[36px] rounded-control bg-white border border-rose-200 text-rose-700 text-xs font-bold">Try again</button>
              </span>
            </Alert>
          ) : loading ? (
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
              title={hasActiveFilters ? 'Nobody matches all of that yet' : 'No educators yet'}
              description={hasActiveFilters
                ? 'Try fewer filters — or tell us what you want to learn and we’ll look for someone for you.'
                : 'We’re welcoming our first educators in Mbarara. Tell us what you want to learn and we’ll find someone for you.'}
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2.5 min-h-[44px] rounded-control border border-ink-200 text-[14px] font-bold text-ink-700 hover:bg-ink-50 transition bg-white"
                    >
                      Clear filters
                    </button>
                  )}
                  <button
                    onClick={onOpenSkillRequest}
                    className="px-5 py-2.5 min-h-[44px] rounded-control bg-forest-700 text-[14px] font-bold text-white hover:bg-forest-800 shadow-soft transition"
                  >
                    Tell us what you need
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
