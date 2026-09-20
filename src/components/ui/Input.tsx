import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, leftIcon, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-ink-400 pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={`w-full min-h-[44px] bg-white text-[13px] font-medium text-ink-900 placeholder:text-ink-500 rounded-control border px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700 disabled:bg-ink-50 disabled:text-ink-500 disabled:cursor-not-allowed
          ${leftIcon ? 'pl-10' : ''}
          ${rightElement ? 'pr-10' : ''}
          ${error ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 focus:border-rose-500' : 'border-ink-200 hover:border-ink-300'}
          ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 flex items-center">{rightElement}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
