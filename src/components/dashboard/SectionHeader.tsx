import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action, className }) => (
  <div className={cn('mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between', className)}>
    <div><h2 className="text-lg font-bold text-ink-950">{title}</h2>{description && <p className="mt-1 text-sm text-ink-600">{description}</p>}</div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
