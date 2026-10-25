import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatItem {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  detail?: string;
  accent?: 'forest' | 'ink' | 'amber' | 'sky' | 'clay' | 'violet' | 'rose';
}

interface StatRowProps { stats: StatItem[]; className?: string; }

const ACCENTS: Record<NonNullable<StatItem['accent']>, string> = {
  forest: 'bg-forest-50 text-forest-600',
  ink: 'bg-[#F1F2F6] text-ink-600',
  amber: 'bg-amber-50 text-amber-500',
  sky: 'bg-sky-50 text-sky-500',
  clay: 'bg-orange-50 text-orange-500',
  violet: 'bg-violet-50 text-violet-500',
  rose: 'bg-rose-50 text-rose-500',
};

/** Small cards: a pastel icon, a quiet label, and the number. */
export const StatRow: React.FC<StatRowProps> = ({ stats, className }) => (
  <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
    {stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <article key={stat.label} className="dash-card flex items-center gap-4 p-4">
          {Icon && <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full', ACCENTS[stat.accent || 'forest'])}><Icon className="h-5 w-5" aria-hidden="true" /></span>}
          <div className="min-w-0">
            <p className="truncate text-xs text-ink-400">{stat.label}</p>
            <p className="truncate text-lg font-bold leading-snug text-ink-900">{stat.value}</p>
            {stat.detail && <p className="truncate text-xs text-ink-500">{stat.detail}</p>}
          </div>
        </article>
      );
    })}
  </div>
);
