import React, { ReactNode } from 'react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

export interface SummaryBar {
  label: string;
  value: number;
}

interface ProfileSummaryCardProps {
  name?: string;
  avatarUrl?: string;
  /** 0–100; drawn as a ring around the photo. Omit to show the photo alone. */
  percent?: number;
  percentLabel?: string;
  greeting: string;
  subline?: ReactNode;
  stats?: Array<{ label: string; value: ReactNode }>;
  chartTitle?: string;
  bars?: SummaryBar[];
  /** Formats a bar's value for its tooltip and screen readers. */
  formatValue?: (value: number) => string;
  emptyChartText?: string;
}

/**
 * The "you" card on an overview: the photo inside a progress ring, a greeting, a few numbers and a
 * small bar chart (the latest bar in brand green, earlier ones tinted).
 */
export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({
  name, avatarUrl, percent, percentLabel, greeting, subline, stats = [], chartTitle, bars = [], formatValue = String, emptyChartText
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent ?? 0));
  const max = Math.max(...bars.map(b => b.value), 0);

  return (
    <section className="dash-card p-6" aria-label="Your summary">
      <div className="relative mx-auto h-32 w-32">
        <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#efebe6" strokeWidth="6" />
          {percent !== undefined && (
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#11774f" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - clamped / 100)} className="transition-all duration-700" />
          )}
        </svg>
        <Avatar src={avatarUrl} name={name} className="absolute inset-[14px] h-[calc(100%-28px)] w-[calc(100%-28px)] rounded-full" />
        {percent !== undefined && (
          <span className="absolute -right-1 top-3 rounded-pill bg-forest-700 px-2 py-0.5 text-[12px] font-bold text-white shadow-soft" title={percentLabel}>
            {Math.round(clamped)}%
            {percentLabel && <span className="sr-only"> {percentLabel}</span>}
          </span>
        )}
      </div>
      <p className="mt-4 text-center font-display text-lg font-bold text-ink-950">{greeting}</p>
      {subline && <p className="mt-1 text-center text-sm text-ink-500">{subline}</p>}

      {stats.length > 0 && (
        <dl className={cn('mt-5 grid divide-x divide-ink-100 rounded-[18px] bg-ink-50/70 py-3 text-center', stats.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
          {stats.map(stat => (
            <div key={stat.label} className="px-2">
              <dd className="font-display text-base font-bold text-ink-950">{stat.value}</dd>
              <dt className="mt-0.5 text-[12px] text-ink-500">{stat.label}</dt>
            </div>
          ))}
        </dl>
      )}

      {chartTitle && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-ink-900">{chartTitle}</p>
          {max === 0 ? (
            <p className="mt-3 rounded-[18px] bg-ink-50/70 px-4 py-6 text-center text-xs text-ink-500">{emptyChartText}</p>
          ) : (
            <ol className="mt-3 flex h-32 items-end gap-2" aria-label={chartTitle}>
              {bars.map((bar, index) => (
                <li key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span
                    className={cn('w-full rounded-t-[10px] rounded-b-[4px] transition-all', index === bars.length - 1 ? 'bg-forest-700' : 'bg-forest-100')}
                    style={{ height: `${Math.max(bar.value > 0 ? 8 : 4, (bar.value / max) * 100)}%` }}
                    title={`${bar.label}: ${formatValue(bar.value)}`}
                  />
                  <span className="text-[12px] text-ink-500">{bar.label}</span>
                  <span className="sr-only">{formatValue(bar.value)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
};

/** The last `count` months, oldest first, for a ProfileSummaryCard chart. */
export function lastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-GB', { month: 'short' }) };
  });
}

export function greetingForNow(firstName: string) {
  const hour = new Date().getHours();
  return `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${firstName}`;
}
