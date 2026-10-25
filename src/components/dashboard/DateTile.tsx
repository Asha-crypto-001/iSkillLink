import React from 'react';
import { cn } from '../../utils/cn';

/** A tear-off calendar date: the month on a coloured strip, the day below. */
export const DateTile: React.FC<{ date: string; tone?: 'light' | 'dark'; className?: string }> = ({ date, tone = 'light', className }) => {
  const day = new Date(`${date}T00:00`);
  return (
    <div
      className={cn(
        'w-16 shrink-0 overflow-hidden rounded-control text-center',
        tone === 'light' ? 'border border-[#ECEEF3] bg-white' : 'border border-white/25 bg-white/15 backdrop-blur',
        className
      )}
      aria-hidden="true"
    >
      <div className={cn('py-1 text-[12px] font-bold uppercase tracking-wide', tone === 'light' ? 'bg-forest-500 text-white' : 'bg-white text-forest-700')}>
        {day.toLocaleDateString('en-GB', { month: 'short' })}
      </div>
      <div className={cn('text-2xl font-bold leading-none py-2', tone === 'light' ? 'text-ink-900' : 'text-white')}>{day.getDate()}</div>
    </div>
  );
};
