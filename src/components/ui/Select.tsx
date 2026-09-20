import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error = false, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full min-h-[44px] appearance-none bg-white text-[13px] font-medium text-ink-900 rounded-control border pl-3.5 pr-9 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700 disabled:bg-ink-50 disabled:text-ink-500
          ${error ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 focus:border-rose-500' : 'border-ink-200 hover:border-ink-300'}
          ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" aria-hidden="true" />
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
