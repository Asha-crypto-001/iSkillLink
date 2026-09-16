import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'verified';
export type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
}

type size = 'sm' | 'md';

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-forest-50 text-forest-700 border-forest-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-ink-100 text-ink-700 border-ink-200',
  verified: 'bg-forest-50 text-forest-800 border-forest-200 font-bold',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-blue-500',
  neutral: 'bg-ink-400',
  verified: 'bg-forest-600',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-pill border tracking-tight leading-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
};

export default Badge;
