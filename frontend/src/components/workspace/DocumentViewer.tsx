import React, { useEffect, useRef } from 'react';
import { FileText, Bookmark } from 'lucide-react';
import { DocumentDetail } from '../../types/legal';

interface DocumentViewerProps {
  document: DocumentDetail;
  activeClauseId?: string | null;
  highlightQuery?: string | null;
  onClauseClick?: (clauseTitle: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  activeClauseId,
  highlightQuery,
  onClauseClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-scroll to active clause if selected from risk panel or chat citation
  useEffect(() => {
    if (activeClauseId && chunkRefs.current[activeClauseId]) {
      const el = chunkRefs.current[activeClauseId];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (highlightQuery) {
      // Find chunk matching section query (e.g. "Section 7.3")
      const lowerQuery = highlightQuery.toLowerCase();
      const matchedChunk = document.chunks.find(
        (c) => c.clause_title.toLowerCase().includes(lowerQuery) || c.text.toLowerCase().includes(lowerQuery)
      );
      if (matchedChunk && chunkRefs.current[matchedChunk.chunk_id]) {
        chunkRefs.current[matchedChunk.chunk_id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeClauseId, highlightQuery, document.chunks]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="truncate text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {document.metadata.filename}
          </h2>
          <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {document.chunks.length} Clauses
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Page 1 of {document.metadata.total_pages}</span>
        </div>
      </div>

      {/* Document Content Canvas */}
      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Document text reader with navigable clauses"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 select-text focus-visible:outline-none"
      >
        {document.chunks.map((chunk) => {
          const isTargeted =
            activeClauseId === chunk.chunk_id ||
            (highlightQuery && chunk.clause_title.toLowerCase().includes(highlightQuery.toLowerCase()));

          return (
            <div
              key={chunk.chunk_id}
              ref={(el) => (chunkRefs.current[chunk.chunk_id] = el)}
              onClick={() => onClauseClick && onClauseClick(chunk.clause_title)}
              className={`rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                isTargeted
                  ? 'border-amber-400 bg-amber-50/80 shadow-md ring-2 ring-amber-400/40 dark:border-amber-600 dark:bg-amber-950/40'
                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-950/50 dark:hover:border-slate-700'
              }`}
            >
              {/* Clause Header & Page Badge */}
              <div className="mb-2 flex items-center justify-between border-b border-slate-200/60 pb-1.5 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Bookmark className={`h-3.5 w-3.5 ${isTargeted ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="font-sans font-bold text-xs text-slate-900 dark:text-white">
                    {chunk.clause_title}
                  </span>
                </div>
                <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Page {chunk.page_number}
                </span>
              </div>

              {/* Clause Text */}
              <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-normal">
                {chunk.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
