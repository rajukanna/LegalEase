import React from 'react';
import { BookOpen, CheckCircle2, ListChecks } from 'lucide-react';
import { DocumentAnalysisResponse } from '../../types/legal';
import { RiskBadge } from '../common/RiskBadge';

interface SummaryPanelProps {
  analysis: DocumentAnalysisResponse;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ analysis }) => {
  return (
    <div className="space-y-6">
      {/* Grade-8 Plain-Language Summary Box */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                Plain-Language Overview
              </h3>
              <p className="text-[10px] text-slate-400">Demystified legal explanation</p>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            {analysis.reading_level} Readability
          </span>
        </div>

        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {analysis.plain_summary}
        </p>

        {/* Key Takeaways */}
        <div className="mt-4 rounded-xl bg-slate-50/70 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950/60">
          <h4 className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2">
            Key Financial & Term Commitments
          </h4>
          <ul className="space-y-2">
            {analysis.key_takeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Action Checklist */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <ListChecks className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Suggested Next Actions Checklist
            </h3>
            <p className="text-[10px] text-slate-400">Practical steps to protect your rights</p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {analysis.action_checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <RiskBadge level={item.priority} size="sm" />
                </div>
                <h5 className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                  {item.action_text}
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
