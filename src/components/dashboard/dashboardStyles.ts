// Pill buttons shared by the dashboards, matching the landing and Teach pages.
const base = 'inline-flex items-center justify-center gap-2 rounded-pill text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
  primary: `${base} min-h-[44px] px-5 bg-forest-700 text-white hover:bg-forest-800 focus-visible:ring-forest-700`,
  dark: `${base} min-h-[44px] px-5 bg-ink-900 text-white hover:bg-forest-800 focus-visible:ring-ink-800`,
  outline: `${base} min-h-[44px] px-5 border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 focus-visible:ring-ink-400`,
  quiet: `${base} min-h-[40px] px-3 text-forest-700 hover:bg-forest-50 focus-visible:ring-forest-700`,
  // On the dark forest banner
  sun: `${base} min-h-[48px] px-6 bg-sun-300 text-ink-950 hover:bg-sun-200 focus-visible:ring-sun-300 focus-visible:ring-offset-forest-950`,
  glass: `${base} min-h-[48px] px-6 glass-dark text-white hover:bg-white/20 focus-visible:ring-white focus-visible:ring-offset-forest-950`,
};
