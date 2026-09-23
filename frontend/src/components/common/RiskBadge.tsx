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
          className={`inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-100 font-semibold text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          role="status"
          aria-label="High Risk Level"
        >
          <AlertTriangle className={isSm ? 'h-3.5 w-3.5 text-red-600 dark:text-red-400' : 'h-4 w-4 text-red-600 dark:text-red-400'} aria-hidden="true" />
          <span>High Risk</span>
        </span>
      );

    case 'caution':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 font-semibold text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          role="status"
          aria-label="Caution Risk Level"
        >
          <AlertCircle className={isSm ? 'h-3.5 w-3.5 text-amber-700 dark:text-amber-400' : 'h-4 w-4 text-amber-700 dark:text-amber-400'} aria-hidden="true" />
          <span>Caution</span>
        </span>
      );

    case 'info':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-100 font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300 ${
            isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          role="status"
          aria-label="Informational Level"
        >
          <Info className={isSm ? 'h-3.5 w-3.5 text-blue-600 dark:text-blue-400' : 'h-4 w-4 text-blue-600 dark:text-blue-400'} aria-hidden="true" />
          <span>Informational</span>
        </span>
      );
  }
};
