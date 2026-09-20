import React, { ReactNode } from 'react';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface StatItem {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  detail?: string;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'forest' | 'ink' | 'amber';
}

interface StatRowProps { stats: StatItem[]; className?: string; }

export const StatRow: React.FC<StatRowProps> = ({ stats, className }) => (
  <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
    {stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <article key={stat.label} className="rounded-card border border-ink-200 bg-white p-5 shadow-level-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-ink-600">{stat.label}</p>
            {Icon && <span className={cn('grid h-9 w-9 place-items-center rounded-control', stat.accent === 'amber' ? 'bg-amber-50 text-amber-700' : stat.accent === 'ink' ? 'bg-ink-100 text-ink-700' : 'bg-forest-50 text-forest-700')}><Icon className="h-4 w-4" aria-hidden="true" /></span>}
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-ink-950">{stat.value}</p>
          {(stat.detail || stat.trend) && <div className="mt-2 flex items-center gap-1 text-xs text-ink-500">{stat.trend === 'up' && <TrendingUp className="h-3.5 w-3.5 text-forest-700" aria-hidden="true" />}{stat.trend === 'down' && <TrendingDown className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />}{stat.detail}</div>}
        </article>
      );
    })}
  </div>
);
