import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type AlertTone = 'error' | 'success' | 'info';

interface AlertProps {
  tone?: AlertTone;
  children: React.ReactNode;
  /** Shows a dismiss button when provided. */
  onDismiss?: () => void;
  className?: string;
}

const toneClasses: Record<AlertTone, string> = {
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  success: 'bg-forest-50 border-forest-200 text-forest-900',
  info: 'bg-ink-50 border-ink-200 text-ink-800'
};

const toneIcons: Record<AlertTone, React.ComponentType<{ className?: string }>> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info
};

/** The one inline message box: form errors, failed actions, confirmations. */
export const Alert: React.FC<AlertProps> = ({ tone = 'error', children, onDismiss, className = '' }) => {
  const Icon = toneIcons[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 px-3.5 py-3 rounded-control border text-[14px] leading-snug ${toneClasses[tone]} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-px" aria-hidden="true" />
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="-my-2.5 -mr-2 w-11 h-11 shrink-0 flex items-center justify-center rounded-control opacity-70 hover:opacity-100 hover:bg-black/5"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default Alert;
