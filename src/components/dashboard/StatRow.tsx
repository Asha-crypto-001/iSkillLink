import React, { ReactNode } from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatItem {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  detail?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'forest' | 'ink' | 'amber' | 'sky' | 'clay' | 'violet';
}

interface StatRowProps { stats: StatItem[]; className?: string; }

const ACCENTS: Record<NonNullable<StatItem['accent']>, string> = {
  forest: 'bg-forest-50 text-forest-700',
  ink: 'bg-ink-100 text-ink-700',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
  clay: 'bg-clay-50 text-clay-700',
  violet: 'bg-violet-50 text-violet-600',
};

export const StatRow: React.FC<StatRowProps> = ({ stats, className }) => (
  <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
    {stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <article key={stat.label} className="dash-card p-5">
          <div className="flex items-center gap-3">
            {Icon && <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-control', ACCENTS[stat.accent || 'forest'])}><Icon className="h-5 w-5" aria-hidden="true" /></span>}
            <p className="text-sm font-medium text-ink-600">{stat.label}</p>
          </div>
          <p className="mt-4 font-display text-[1.75rem] font-bold leading-none tracking-[-0.02em] text-ink-950">{stat.value}</p>
          {(stat.detail || stat.trend) && <div className="mt-2 flex items-center gap-1 text-xs text-ink-500">{stat.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-forest-700" aria-hidden="true" />}{stat.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}{stat.detail}</div>}
        </article>
      );
    })}
  </div>
);
