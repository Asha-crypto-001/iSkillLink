import React from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactElement;
  className?: string;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
  className = '',
}) => {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const child = React.cloneElement(children as React.ReactElement<any>, {
    id: htmlFor,
    'aria-describedby': describedBy,
    'aria-invalid': !!error,
  });

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-ink-700">
        {label} {required && <span className="text-rose-600" aria-hidden="true">*</span>}
      </label>
      {child}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-500 leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-rose-600 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
};

export default Field;
