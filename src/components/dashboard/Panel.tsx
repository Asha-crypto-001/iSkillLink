import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}

/** A white dashboard card with an optional title row. */
export const Panel: React.FC<PanelProps> = ({ title, description, action, children, className, bodyClassName, id }) => {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section className={cn('dash-card', className)} aria-labelledby={title ? headingId : undefined} id={id}>
      {(title || action) && (
        <div className="flex flex-col gap-2 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            {title && <h2 id={headingId} className="font-display text-lg font-bold tracking-[-0.01em] text-ink-950">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-600">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </section>
  );
};
