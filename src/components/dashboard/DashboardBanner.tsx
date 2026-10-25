import React, { ReactNode } from 'react';

interface DashboardBannerProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  /** Shown beside the text on wide screens (a date tile, say). */
  aside?: ReactNode;
}

// A four-point sparkle, the decoration on the welcome band.
const SPARKLE = 'M50 0C53 40 60 47 100 50C60 53 53 60 50 100C47 60 40 53 0 50C40 47 47 40 50 0Z';

/** The bright welcome band at the top of an overview: a greeting and the one thing to do next. */
export const DashboardBanner: React.FC<DashboardBannerProps> = ({ eyebrow, title, description, actions, aside }) => (
  <section className="relative isolate overflow-hidden rounded-[20px] bg-forest-500 px-6 py-8 text-white sm:px-8">
    {/* Soft rounded tiles and sparkles, like light catching the bench */}
    <span aria-hidden="true" className="absolute -right-10 -top-10 -z-10 h-40 w-40 rotate-12 rounded-[36px] border border-white/15 bg-white/[0.06]" />
    <span aria-hidden="true" className="absolute bottom-[-3.5rem] right-24 -z-10 h-32 w-32 -rotate-12 rounded-[32px] border border-white/15 bg-white/[0.06]" />
    <span aria-hidden="true" className="absolute right-[34%] top-[-2.5rem] -z-10 h-24 w-24 rotate-45 rounded-[24px] border border-white/10" />
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute right-[16%] top-1/2 -z-10 hidden h-32 w-32 -translate-y-1/2 text-white/25 sm:block"><path d={SPARKLE} fill="currentColor" /></svg>
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute right-[9%] top-7 -z-10 h-10 w-10 text-white/30"><path d={SPARKLE} fill="currentColor" /></svg>
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute bottom-6 right-[28%] -z-10 hidden h-6 w-6 text-white/30 sm:block"><path d={SPARKLE} fill="currentColor" /></svg>
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-xl">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{eyebrow}</p>}
        <h1 className="mt-2 text-[1.75rem] font-bold leading-tight tracking-[-0.02em] sm:text-[2rem]">{title}</h1>
        {description && <div className="mt-2 text-[15px] leading-relaxed text-white/90">{description}</div>}
        {actions && <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  </section>
);
