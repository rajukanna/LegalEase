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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Plain-Language Overview
              </h3>
              <p className="text-[11px] text-slate-500">Demystified legal explanation</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {analysis.reading_level} Readability
          </span>
        </div>

        <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {analysis.plain_summary}
        </p>

        {/* Key Takeaways */}
        <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            Key Financial & Term Commitments
          </h4>
          <ul className="space-y-2">
            {analysis.key_takeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Action Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Suggested Next Actions Checklist
            </h3>
            <p className="text-[11px] text-slate-500">Practical steps to protect your rights</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {analysis.action_checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-950/40"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.category}
                  </span>
                  <RiskBadge level={item.priority} size="sm" />
                </div>
                <h5 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                  {item.action_text}
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
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
