import React, { ReactNode } from 'react';

interface DashboardBannerProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Shown beside the text on wide screens (a date tile, a progress ring…). */
  aside?: ReactNode;
}

// A four-point sparkle, the decoration on the welcome band.
const SPARKLE = 'M50 0C54 38 62 46 100 50C62 54 54 62 50 100C46 62 38 54 0 50C38 46 46 38 50 0Z';

/** The dark welcome band at the top of an overview: who you are, and the one thing to do next. */
export const DashboardBanner: React.FC<DashboardBannerProps> = ({ eyebrow, title, description, actions, aside }) => (
  <section className="relative isolate overflow-hidden rounded-display bg-forest-950 px-6 py-8 text-white sm:px-9 sm:py-10">
    <span aria-hidden="true" className="absolute -right-12 -top-16 -z-10 h-56 w-56 rounded-full border border-white/15 bg-white/5" />
    <span aria-hidden="true" className="absolute bottom-[-4rem] right-40 -z-10 h-32 w-32 rounded-full border border-white/15 bg-white/5" />
    <span aria-hidden="true" className="absolute left-[45%] -top-8 -z-10 h-16 w-16 rounded-full border border-white/10 bg-white/5" />
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute right-[18%] top-6 -z-10 hidden h-24 w-24 text-white/10 sm:block"><path d={SPARKLE} fill="currentColor" /></svg>
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute bottom-6 right-[12%] -z-10 h-8 w-8 text-sun-300/80"><path d={SPARKLE} fill="currentColor" /></svg>
    <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.14em] text-sun-300">{eyebrow}</p>}
        <h1 className="mt-2 font-display text-[1.9rem] font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.4rem]">{title}</h1>
        {description && <div className="mt-3 text-base leading-relaxed text-forest-100/85">{description}</div>}
        {actions && <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  </section>
);
