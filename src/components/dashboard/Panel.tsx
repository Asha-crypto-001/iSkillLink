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
        <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 id={headingId} className="text-lg font-bold tracking-[-0.01em] text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn('p-5 sm:p-6', (title || action) && 'pt-4 sm:pt-4', bodyClassName)}>{children}</div>
    </section>
  );
};
