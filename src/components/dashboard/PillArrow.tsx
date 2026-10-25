import React from 'react';
import { ArrowRight } from 'lucide-react';

/** The white circle with an arrow at the end of a black banner pill. */
export const PillArrow: React.FC = () => (
  <span className="ml-1 grid h-9 w-9 place-items-center rounded-full bg-white text-ink-950" aria-hidden="true">
    <ArrowRight className="h-4 w-4" />
  </span>
);
