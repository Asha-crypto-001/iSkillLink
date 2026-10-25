import React from 'react';
import { Check } from 'lucide-react';
import { BookingStage } from '../../utils/bookingStage';
import { cn } from '../../utils/cn';

/** A booking's steps as a slim progress track: finished steps filled, the next one tinted. */
export const BookingJourney: React.FC<{ stage: BookingStage; className?: string }> = ({ stage, className }) => {
  if (stage.stopped) return null;
  const allDone = stage.done >= stage.steps.length;
  const current = Math.min(stage.done, stage.steps.length - 1);
  return (
    <div className={className}>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${stage.steps.length}, minmax(0, 1fr))` }} aria-label={`${stage.done} of ${stage.steps.length} steps done`}>
        {stage.steps.map((step, index) => {
          const finished = index < stage.done;
          const isNext = index === current && !finished;
          return (
            <li key={step} className="min-w-0">
              <span className={cn('block h-1.5 rounded-full', finished ? 'bg-forest-600' : isNext ? 'bg-forest-200' : 'bg-ink-100')} aria-hidden="true" />
              <span className={cn('mt-1.5 hidden items-center gap-1 truncate text-[12px] leading-4 sm:flex', finished ? 'text-ink-700' : isNext ? 'font-semibold text-forest-800' : 'text-ink-400')}>
                {finished && <Check className="h-3 w-3 shrink-0 text-forest-600" aria-hidden="true" />}
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-[12px] text-ink-600 sm:hidden">
        {allDone ? 'All steps done' : <>Step {current + 1} of {stage.steps.length}: <span className="font-semibold text-forest-800">{stage.steps[current]}</span></>}
      </p>
    </div>
  );
};
