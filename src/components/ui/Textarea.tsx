import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full min-h-[96px] bg-white text-[13px] font-medium text-ink-900 placeholder:text-ink-400 rounded-control border px-3.5 py-3 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-forest-700 disabled:bg-ink-50 disabled:text-ink-500
        ${error ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-500 focus:border-rose-500' : 'border-ink-200 hover:border-ink-300'}
        ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
