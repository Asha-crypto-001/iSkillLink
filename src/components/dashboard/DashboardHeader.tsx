import React, { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, description, eyebrow, actions, breadcrumbs }) => (
  <div className="mb-8">
    {breadcrumbs && breadcrumbs.length > 0 && (
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />}
              <li>{crumb.href ? <Link to={crumb.href} className="rounded text-ink-500 hover:text-forest-700">{crumb.label}</Link> : <span className="font-semibold text-ink-800" aria-current="page">{crumb.label}</span>}</li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    )}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-forest-700">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-ink-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  </div>
);
