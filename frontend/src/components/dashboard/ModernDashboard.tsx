import React, { useRef } from 'react';
import { ArrowUpRight, UploadCloud, FileText, BookOpen, Clock, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { DocumentMetadata } from '../../types/legal';

interface ModernDashboardProps {
  documents: DocumentMetadata[];
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  onNavigateTab: (tab: 'analyze' | 'compare' | 'brief') => void;
  onUploadFile: (file: File) => void;
}

export const ModernDashboard: React.FC<ModernDashboardProps> = ({
  documents,
  onSelectDocument,
  onOpenUpload,
  onNavigateTab,
  onUploadFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthYear = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Generate days for standard calendar display
  const daysInMonth = 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-8 space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center Main Activities Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-7">
          {/* Section: Your activities today */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Your activities today <span className="text-slate-400 font-medium">({documents.length > 0 ? documents.length : '0'})</span>
              </h2>
            </div>

            {/* Row of Neo-Modern Pastel Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mint Card: Document Workspace */}
              <div
                onClick={() => {
                  if (documents.length > 0) {
                    onSelectDocument(documents[0].id);
                  } else {
                    onOpenUpload();
                  }
                }}
                className="group relative cursor-pointer rounded-3xl bg-[#d6eee6] p-6 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-950 shadow-2xs">
                    <span>★ 4.9</span>
                    <span className="text-emerald-700 text-[10px]">AI Powered</span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900">Document Workspace</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Clause-by-clause decomposition, automated plain-English translations & risk detection.
                  </p>
                </div>
              </div>

              {/* Pastel Pink Card: Compare Versions */}
              <div
                onClick={() => onNavigateTab('compare')}
                className="group relative cursor-pointer rounded-3xl bg-[#ffd8e4] p-6 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-rose-950 shadow-2xs">
                    <span>★ 4.8</span>
                    <span className="text-rose-700 text-[10px]">Redline Diff</span>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900">Compare Versions</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Side-by-side redline comparison with &quot;Who it favors&quot; contractual heuristics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Overview Metrics (3 Pastel Pills) */}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-3 dark:text-white">
              Document metrics & status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stat 1: Uploaded Contracts */}
              <div className="flex items-center justify-between rounded-3xl bg-[#d6eee6]/80 p-5 shadow-2xs">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Uploaded Docs</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{documents.length}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xs">
                  <FileText className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Stat 2: Attorney Prep Ready */}
              <div
                onClick={() => onNavigateTab('brief')}
                className="flex items-center justify-between rounded-3xl bg-[#fdecc2] p-5 shadow-2xs cursor-pointer hover:shadow-xs transition"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-700">Attorney Prep</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">Ready</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xs">
                  <BookOpen className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Stat 3: Grounded Intelligence */}
              <div className="flex items-center justify-between rounded-3xl bg-[#e5defc] p-5 shadow-2xs">
                <div>
                  <p className="text-xs font-semibold text-slate-700">Grounded Q&A</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">100%</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xs">
                  <CheckCircle2 className="h-4.5 w-4.5 text-purple-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Clean Drag-and-Drop Upload Card (Butter Yellow Tint) */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-3xl bg-[#fef4d8] border border-amber-200/80 p-6 sm:p-7 shadow-xs relative overflow-hidden"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs shrink-0">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Your Legal Document
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Drag and drop any PDF, DOCX, TXT, or scan image here. Automatic client-side PII protection included.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 hover:scale-105 transition"
              >
                <span>Select Document</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* User's Uploaded Documents List */}
          {documents.length > 0 && (
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 mb-3 dark:text-white">
                Your uploaded documents
              </h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc.id)}
                    className="flex items-center justify-between rounded-2xl bg-white border border-slate-200/80 p-3.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition cursor-pointer dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{doc.filename}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.total_pages} page{doc.total_pages > 1 ? 's' : ''} • {doc.total_chunks} clauses
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {doc.detected_type || 'Contract'}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Legal Schedule & Deadlines (Matching Reference Image) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-sm dark:bg-slate-800/80 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Review schedule</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition dark:hover:bg-slate-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Current Month Caption */}
            <div className="text-xs font-bold text-slate-700 mb-3 dark:text-slate-300">
              {currentMonthYear}
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2">
              <span>MON</span>
              <span>THU</span>
              <span>WED</span>
              <span>TUE</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>

            {/* Calendar Day Numbers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-700 dark:text-slate-200">
              {daysArray.map((day) => {
                const isToday = day === currentDay;
                const isMilestone = day === 16 || day === 17;
                return (
                  <div
                    key={day}
                    className="flex h-8 w-8 items-center justify-center mx-auto"
                  >
                    {isToday ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 font-bold text-white shadow-2xs dark:bg-white dark:text-slate-900">
                        {day}
                      </span>
                    ) : isMilestone ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-slate-400 font-semibold text-slate-800 dark:text-slate-100">
                        {day}
                      </span>
                    ) : (
                      <span>{day}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Schedule Items: Mint Pill Cards matching reference image bottom-right */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[#d6eee6] p-3 text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shrink-0 shadow-2xs">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">Notice & Cure Periods</p>
                  <p className="text-[10px] text-slate-600 truncate">Statutory notice verification</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#d6eee6] p-3 text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shrink-0 shadow-2xs">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">Indemnity Obligations</p>
                  <p className="text-[10px] text-slate-600 truncate">Hold harmless risk review</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-[#d6eee6] p-3 text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shrink-0 shadow-2xs">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold truncate">Attorney Prep Consultation</p>
                  <p className="text-[10px] text-slate-600 truncate">Export 1-page dossier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
