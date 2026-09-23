import React from 'react';
import { Scale, FileText, GitCompare, BookOpen, ShieldCheck, Sun, Moon } from 'lucide-react';
import { DocumentMetadata } from '../../types/legal';

interface NavbarProps {
  activeTab: 'analyze' | 'compare' | 'brief';
  setActiveTab: (tab: 'analyze' | 'compare' | 'brief') => void;
  documents: DocumentMetadata[];
  selectedDocId: string;
  onSelectDocument: (docId: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  documents,
  selectedDocId,
  onSelectDocument,
  isDarkMode,
  setIsDarkMode,
  onOpenTour,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-900/95 sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LegalEase</span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/80 dark:text-blue-200">
                GENAI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Democratizing Legal Comprehension</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'analyze'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            aria-current={activeTab === 'analyze' ? 'page' : undefined}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>Document Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'compare'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            aria-current={activeTab === 'compare' ? 'page' : undefined}
          >
            <GitCompare className="h-4 w-4" aria-hidden="true" />
            <span>Compare Versions</span>
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'brief'
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            aria-current={activeTab === 'brief' ? 'page' : undefined}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>Attorney Prep</span>
          </button>
        </nav>

        {/* Right Controls: Quick Select Sample Document & Theme */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5">
              <label htmlFor="doc-quick-select" className="text-xs text-slate-500 font-medium">
                Active Document:
              </label>
              <select
                id="doc-quick-select"
                value={selectedDocId}
                onChange={(e) => onSelectDocument(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename.length > 30 ? d.filename.substring(0, 30) + '...' : d.filename}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Guided Tour button */}
          <button
            type="button"
            onClick={onOpenTour}
            aria-label="Open guided demo tour"
            className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300 transition focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            <span className="hidden sm:inline">Guided Tour</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isDarkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          <div className="hidden md:flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Grounded Guardrails</span>
          </div>
        </div>
      </div>
    </header>
  );
};
