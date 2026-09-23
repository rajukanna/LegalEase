import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { RiskLevel } from '../../types/legal';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = '', size = 'md' }) => {
  const isSm = size === 'sm';

  switch (level) {
    case 'high-risk':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border border-rose-200/80 bg-rose-50/70 font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
          } ${className}`}
          role="status"
          aria-label="High Risk Level"
        >
          <AlertTriangle className={isSm ? 'h-3 w-3 text-rose-600 dark:text-rose-400' : 'h-3.5 w-3.5 text-rose-600 dark:text-rose-400'} aria-hidden="true" />
          <span>High Risk</span>
        </span>
      );

    case 'caution':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50/70 font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
          } ${className}`}
          role="status"
          aria-label="Caution Risk Level"
        >
          <AlertCircle className={isSm ? 'h-3 w-3 text-amber-600 dark:text-amber-400' : 'h-3.5 w-3.5 text-amber-600 dark:text-amber-400'} aria-hidden="true" />
          <span>Caution</span>
        </span>
      );

    case 'info':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50/80 font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 ${
            isSm ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
          } ${className}`}
          role="status"
          aria-label="Informational Level"
        >
          <Info className={isSm ? 'h-3 w-3 text-slate-500 dark:text-slate-400' : 'h-3.5 w-3.5 text-slate-500 dark:text-slate-400'} aria-hidden="true" />
          <span>Informational</span>
        </span>
      );
  }
};
