import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-10 text-center rounded-card border border-dashed border-ink-300 bg-white space-y-4 ${className}`}>
      <div className="w-12 h-12 rounded-display bg-ink-50 text-ink-500 flex items-center justify-center mx-auto border border-ink-200">
        {icon}
      </div>
      <div className="max-w-sm mx-auto space-y-1.5">
        <h3 className="text-[15px] font-bold text-ink-900 font-display">{title}</h3>
        <p className="text-body-sm text-ink-600 leading-relaxed">
          {description}
        </p>
      </div>
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
