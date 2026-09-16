import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Educator, Category } from '../types';
import { api } from '../services/api';
import { EducatorCard } from '../components/EducatorCard';
import { formatUGX } from '../utils/formatters';
import {
  Search, Filter, SlidersHorizontal,
  X, RotateCcw
} from 'lucide-react';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';

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
        search: search || undefined,
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
  }, [search, selectedCategory, selectedFormat, selectedLocation, maxPrice, minRating, sortOption]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Explore Skills', to: '/find-skill' }]} />
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Find a Verified Skill Educator
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Browse vetted master artisans, practical technicians, and trainers in Mbarara and across Uganda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill, craft name, educator, keyword (e.g. Tailoring, Solar, React, Pastry)..."
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-gray-50/50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="relevance">Sort: Recommended & Featured</option>
              <option value="rating">Sort: Highest Rating (5★ first)</option>
              <option value="experience">Sort: Years of Experience</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
            </select>

            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden p-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 flex items-center gap-1.5 text-xs font-semibold shrink-0"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>Cat: {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</span>
                <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedFormat !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                <span>Format: {selectedFormat}</span>
                <button onClick={() => setSelectedFormat('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedLocation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                <span>Loc: {selectedLocation}</span>
                <button onClick={() => setSelectedLocation('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <span>Rating: {minRating}★+</span>
                <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 font-semibold ml-auto text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer — 3.4 ergonomics with backdrop + scroll lock + slide transition */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileFiltersOpen(false)} aria-hidden="true" />
          <div className="relative w-80 max-w-[85vw] bg-white h-full overflow-y-auto p-5 space-y-6 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-emerald-700" />Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Skill Category</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white">
                <option value="all">All Skill Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Learning Format</label>
              <div className="space-y-1.5 text-xs">
                {[{id:'all',label:'All Formats'},{id:'in-person',label:'In-Person Workshop'},{id:'hybrid',label:'Hybrid'},{id:'online',label:'Online Live'}].map(f => (
                  <label key={f.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="radio" name="format-mobile" checked={selectedFormat===f.id} onChange={()=>setSelectedFormat(f.id)} className="text-emerald-600" />
                    <span className={selectedFormat===f.id?'font-bold text-gray-900':'text-gray-600'}>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Service Location</label>
              <select value={selectedLocation} onChange={(e)=>setSelectedLocation(e.target.value)} className="w-full text-xs rounded-lg border-gray-300 border p-2.5 bg-white">
                {ugandanLocations.map(loc => <option key={loc.value} value={loc.value}>{loc.label}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center text-xs mb-1"><span className="font-bold text-gray-700">Max Hourly Rate</span><span className="font-bold text-emerald-800">{formatUGX(maxPrice)}/hr</span></div>
              <input type="range" min={25000} max={60000} step={5000} value={maxPrice} onChange={(e)=>setMaxPrice(Number(e.target.value))} className="w-full accent-emerald-600" />
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>UGX 25k</span><span>UGX 60k+</span></div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Minimum Rating</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[{val:0,label:'Any'},{val:4.5,label:'4.5★+'},{val:4.8,label:'4.8★+'}].map(r => (
                  <button key={r.val} type="button" onClick={()=>setMinRating(r.val)} className={`py-1.5 px-2 rounded-lg border text-center transition ${minRating===r.val?'bg-amber-50 border-amber-400 text-amber-900 font-bold':'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{r.label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button onClick={resetFilters} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50">Clear All</button>
              <button onClick={()=>setMobileFiltersOpen(false)} className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800">Show {educators.length} Results</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="hidden lg:block bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Filter Results</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-emerald-700 hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Skill Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Skill Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Learning Format
            </label>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'in-person', label: 'In-Person Workshop' },
                { id: 'hybrid', label: 'Hybrid (Theory + Bench)' },
                { id: 'online', label: 'Online Live Mentoring' }
              ].map(f => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === f.id}
                    onChange={() => setSelectedFormat(f.id)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className={selectedFormat === f.id ? 'font-bold text-gray-900' : 'text-gray-600'}>
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Service Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs rounded-lg border-gray-300 border p-2 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-600"
            >
              {ugandanLocations.map(loc => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-bold text-gray-700">Max Hourly Rate</span>
              <span className="font-bold text-emerald-800">{formatUGX(maxPrice)}/hr</span>
            </div>
            <input
              type="range"
              min={25000}
              max={60000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
              <span>UGX 25k</span>
              <span>UGX 60k+</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { val: 0, label: 'Any' },
                { val: 4.5, label: '4.5★+' },
                { val: 4.8, label: '4.8★+' }
              ].map(r => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setMinRating(r.val)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition ${
                    minRating === r.val
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
            <h4 className="font-bold text-xs text-emerald-950">Can't find a specific skill?</h4>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Post a custom request and our matching team will connect you with a verified practitioner.
            </p>
            <button
              onClick={onOpenSkillRequest}
              className="w-full py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition"
            >
              Post Skill Request
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Showing <span className="font-bold text-gray-900">{educators.length}</span> verified educators</span>
            <span className="hidden sm:inline">All profiles screened and approved for safety</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs text-gray-500">
              Loading verified educators...
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
            <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                <Search className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  {hasActiveFilters ? 'No educators matching selected filters' : 'Educator Onboarding in Progress'}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {hasActiveFilters
                    ? 'Try broadening your search query, clearing filter criteria, or submit a custom skill request.'
                    : 'We are actively onboarding verified artisans, trade masters, and practitioners across Mbarara and Uganda. Post what you want to learn, and our team will connect you with a vetted instructor.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={onOpenSkillRequest}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 shadow-sm transition"
                >
                  Post Custom Skill Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
