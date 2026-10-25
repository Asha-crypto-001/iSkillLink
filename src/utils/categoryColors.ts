// One colour per seeded category (see server/seedData.ts) for its icon tile: a soft tint behind a strong icon.
// Categories added later fall back to the brand green.
export const CATEGORY_COLORS: Record<string, string> = {
  'cat-fashion': 'bg-rose-50 text-rose-600',
  'cat-tech': 'bg-indigo-50 text-indigo-600',
  'cat-repair': 'bg-sky-50 text-sky-600',
  'cat-culinary': 'bg-orange-50 text-orange-600',
  'cat-electrical': 'bg-amber-50 text-amber-600',
  'cat-welding': 'bg-slate-100 text-slate-700',
  'cat-carpentry': 'bg-yellow-50 text-yellow-700',
  'cat-agriculture': 'bg-lime-50 text-lime-700',
  'cat-photography': 'bg-violet-50 text-violet-600',
  'cat-design': 'bg-fuchsia-50 text-fuchsia-600',
  'cat-business': 'bg-teal-50 text-teal-600',
  'cat-marketing': 'bg-pink-50 text-pink-600',
  'cat-beauty': 'bg-purple-50 text-purple-600',
  'cat-plumbing': 'bg-cyan-50 text-cyan-600',
  'cat-automotive': 'bg-red-50 text-red-600',
  'cat-communication': 'bg-blue-50 text-blue-600',
  'cat-music': 'bg-violet-50 text-violet-700',
  'cat-construction': 'bg-stone-100 text-stone-700',
  'cat-crafts': 'bg-emerald-50 text-emerald-600',
  'cat-ai': 'bg-indigo-50 text-indigo-700'
};

export const categoryColor = (categoryId: string) => CATEGORY_COLORS[categoryId] || 'bg-forest-50 text-forest-700';
