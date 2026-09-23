import React from 'react';
import { AlertCircle, Scale } from 'lucide-react';

interface DisclaimerBannerProps {
  className?: string;
  variant?: 'top' | 'footer' | 'inline';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  className = '',
  variant = 'top',
}) => {
  const disclaimerText =
    'This is general information, not legal advice. Consult a licensed attorney for your specific situation.';

  if (variant === 'footer') {
    return (
      <footer
        role="contentinfo"
        aria-label="Legal Disclaimer"
        className={`w-full border-t border-slate-200 bg-slate-100 py-3 px-4 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 ${className}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <Scale className="h-4 w-4 text-slate-500 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold text-slate-700 dark:text-slate-300">Notice:</strong>{' '}
            {disclaimerText}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <aside
      role="note"
      aria-label="Legal Disclaimer Banner"
      className={`w-full border-b border-blue-200 bg-blue-50 py-2.5 px-4 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
          <p>
            <span className="font-semibold">Educational Tool:</span> {disclaimerText}
          </p>
        </div>
        <span className="hidden sm:inline-block rounded bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Non-Conclusory
        </span>
      </div>
    </aside>
  );
};
