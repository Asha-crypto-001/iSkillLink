import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white shadow-soft focus-visible:ring-forest-700 border border-forest-800',
  secondary: 'bg-ink-900 hover:bg-ink-800 active:bg-black text-white shadow-soft focus-visible:ring-ink-800 border border-ink-900',
  outline: 'bg-white hover:bg-ink-50 active:bg-ink-100 text-ink-700 border border-ink-200 shadow-soft focus-visible:ring-ink-400',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-soft focus-visible:ring-rose-500 border border-rose-700',
  ghost: 'bg-transparent hover:bg-ink-100 active:bg-ink-200 text-ink-700 border border-transparent focus-visible:ring-ink-400'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-[13px] font-semibold min-h-[36px] px-3.5 py-1.5 rounded-control gap-1.5',
  md: 'text-[13px] font-bold min-h-[44px] px-5 py-2.5 rounded-control gap-2',
  lg: 'text-[14px] font-bold min-h-[48px] px-6 py-3 rounded-control gap-2.5'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-display tracking-tight transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
