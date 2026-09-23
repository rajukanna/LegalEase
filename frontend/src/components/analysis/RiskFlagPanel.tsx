import React from 'react';
import { AlertTriangle, ExternalLink, HelpCircle, UserCheck } from 'lucide-react';
import { RiskFlag } from '../../types/legal';
import { RiskBadge } from '../common/RiskBadge';

interface RiskFlagPanelProps {
  flags: RiskFlag[];
  activeFlagId?: string | null;
  onSelectFlag: (flag: RiskFlag) => void;
}

export const RiskFlagPanel: React.FC<RiskFlagPanelProps> = ({
  flags,
  activeFlagId,
  onSelectFlag,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Identified Contract Risks
            </h3>
            <p className="text-[11px] text-slate-500">Click any card to jump to the source clause</p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {flags.length} Flags Detected
        </span>
      </div>

      <div className="space-y-3">
        {flags.map((flag) => {
          const isSelected = activeFlagId === flag.id;

          return (
            <div
              key={flag.id}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              onClick={() => onSelectFlag(flag)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectFlag(flag);
                }
              }}
              className={`rounded-2xl border p-4 sm:p-5 transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
              }`}
            >
              {/* Header with Multi-Modal Badge & Clause Ref */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <RiskBadge level={flag.severity} />
                <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <span>{flag.clause_reference}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {flag.title}
              </h4>

              {/* Verbatim Excerpt */}
              <div className="my-2.5 rounded-lg border border-slate-100 bg-slate-50 p-2.5 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 italic">
                "{flag.verbatim_text}"
              </div>

              {/* Plain Explanation */}
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                {flag.plain_explanation}
              </p>

              {/* Why This Matters & Who it Favors footer */}
              <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                <div className="flex items-start gap-1.5 text-amber-900 dark:text-amber-300">
                  <HelpCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-600" />
                  <p>
                    <strong className="font-semibold">Why this matters:</strong> {flag.why_it_matters}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    <strong>Favors:</strong> {flag.who_it_favors}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
