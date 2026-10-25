// Pill buttons shared by the dashboards.
const base = 'inline-flex items-center justify-center gap-2 rounded-pill text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  primary: `${base} min-h-[44px] px-5 bg-forest-500 text-white hover:bg-forest-600 focus-visible:ring-forest-500`,
  dark: `${base} min-h-[44px] px-5 bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-ink-800`,
  outline: `${base} min-h-[44px] px-5 border border-[#E3E5EC] bg-white text-ink-800 hover:border-ink-300 focus-visible:ring-ink-400`,
  quiet: `${base} min-h-[40px] px-3 text-forest-600 hover:bg-forest-50 focus-visible:ring-forest-500`,
  // On the bright banner: a black pill (pair it with <PillArrow />) and a frosted one
  sun: `${base} min-h-[48px] pl-5 pr-1.5 bg-ink-950 text-white hover:bg-ink-800 focus-visible:ring-white focus-visible:ring-offset-forest-500`,
  glass: `${base} min-h-[48px] px-5 bg-white/15 text-white backdrop-blur hover:bg-white/25 focus-visible:ring-white focus-visible:ring-offset-forest-500`,
};
