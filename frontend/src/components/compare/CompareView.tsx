import React, { useState, useEffect } from 'react';
import { GitCompare, PlusCircle, MinusCircle, RefreshCw, UserCheck } from 'lucide-react';
import { DocumentMetadata, DocumentCompareResponse } from '../../types/legal';
import { api } from '../../services/api';

interface CompareViewProps {
  documents: DocumentMetadata[];
}

export const CompareView: React.FC<CompareViewProps> = ({ documents }) => {
  const [doc1Id, setDoc1Id] = useState<string>('doc-sample-nda-1');
  const [doc2Id, setDoc2Id] = useState<string>('doc-sample-nda-2');
  const [comparison, setComparison] = useState<DocumentCompareResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runComparison = async () => {
    if (!doc1Id || !doc2Id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.compareDocuments(doc1Id, doc2Id);
      setComparison(res);
    } catch (err: any) {
      setError(err.message || 'Failed to compare documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [doc1Id, doc2Id]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">
      {/* Selector Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <GitCompare className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Comparative Contract Diff & Rights Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Select two contract versions to evaluate added, modified, or removed clauses.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doc1-select" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Version 1 (Original / Baseline)
            </label>
            <select
              id="doc1-select"
              value={doc1Id}
              onChange={(e) => setDoc1Id(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doc2-select" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Version 2 (Revised / Comparison Version)
            </label>
            <select
              id="doc2-select"
              value={doc2Id}
              onChange={(e) => setDoc2Id(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.filename}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-12 text-sm text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin text-slate-700 dark:text-slate-300 mr-2" />
          <span>Calculating clause-by-clause diffs and impact assessment...</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
          {error}
        </div>
      )}

      {comparison && !isLoading && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Overall Comparative Finding
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {comparison.overall_favor}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {comparison.summary_of_changes}
                </p>
              </div>

              {/* Counts Badge */}
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300">
                  +{comparison.total_added} Added
                </span>
                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
                  ~{comparison.total_modified} Modified
                </span>
                <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
                  -{comparison.total_removed} Removed
                </span>
              </div>
            </div>
          </div>

          {/* Clause Diff Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Clause-by-Clause Differences ({comparison.diff_items.length})
            </h3>

            {comparison.diff_items.map((item) => (
              <div
                key={item.diff_id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.change_type === 'added' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300">
                        <PlusCircle className="h-3 w-3" />
                        <span>Added Clause</span>
                      </span>
                    )}
                    {item.change_type === 'removed' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300">
                        <MinusCircle className="h-3 w-3" />
                        <span>Removed Clause</span>
                      </span>
                    )}
                    {item.change_type === 'modified' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
                        <RefreshCw className="h-3 w-3" />
                        <span>Modified Clause</span>
                      </span>
                    )}
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.section_title}
                    </h4>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                    <UserCheck className="h-3.5 w-3.5 text-slate-500" />
                    <span>{item.who_it_favors}</span>
                  </span>
                </div>

                {/* Plain-Language Explanation */}
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.plain_explanation}
                </p>

                {/* Side-by-side or stacked diff comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {item.original_text && (
                    <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-3 font-mono text-[11px] text-slate-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-slate-300">
                      <span className="block font-bold text-red-700 dark:text-red-400 mb-1 font-sans">
                        Original Version Text:
                      </span>
                      <p className="whitespace-pre-wrap">{item.original_text}</p>
                    </div>
                  )}

                  {item.revised_text && (
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3 font-mono text-[11px] text-slate-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-slate-300">
                      <span className="block font-bold text-emerald-700 dark:text-emerald-400 mb-1 font-sans">
                        Revised Version Text:
                      </span>
                      <p className="whitespace-pre-wrap">{item.revised_text}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
