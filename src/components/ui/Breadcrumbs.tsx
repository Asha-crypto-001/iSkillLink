import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol className="flex items-center flex-wrap gap-1 text-body-sm">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 text-ink-500 hover:text-forest-700 font-medium transition">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <React.Fragment key={`${item.label}-${idx}`}>
              <li className="text-ink-300 flex items-center">
                <ChevronRight className="w-3 h-3" />
              </li>
              <li>
                {isLast || !item.to ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'text-ink-900 font-semibold' : 'text-ink-600'}
                  >
                    <span className="inline-flex items-center gap-1">{item.icon}{item.label}</span>
                  </span>
                ) : (
                  <Link to={item.to} className="text-ink-500 hover:text-forest-700 font-medium transition inline-flex items-center gap-1">
                    {item.icon}{item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
