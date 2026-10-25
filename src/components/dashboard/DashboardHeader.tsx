import React, { ReactNode } from 'react';

interface DashboardHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, eyebrow, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-forest-700">{eyebrow}</p>}
      <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em] text-ink-950 sm:text-[2.1rem]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600 sm:text-[15px]">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
