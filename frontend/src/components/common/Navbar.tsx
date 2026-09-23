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
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xs sticky top-0 z-30 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs dark:bg-white dark:text-slate-900">
            <Scale className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">LegalEase</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                AI Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Democratizing Legal Comprehension</p>
          </div>
        </div>

        {/* Navigation Tabs - Light Minimal Segmented Control */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100/70 p-1 border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'analyze'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'analyze' ? 'page' : undefined}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Document Workspace</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'compare'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'compare' ? 'page' : undefined}
          >
            <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compare Versions</span>
          </button>

          <button
            onClick={() => setActiveTab('brief')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'brief'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-current={activeTab === 'brief' ? 'page' : undefined}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Attorney Prep</span>
          </button>
        </nav>

        {/* Right Controls: Quick Select Sample Document & Theme */}
        <div className="flex items-center gap-2">
          {documents.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5">
              <label htmlFor="doc-quick-select" className="text-xs text-slate-500 font-medium">
                Document:
              </label>
              <select
                id="doc-quick-select"
                value={selectedDocId}
                onChange={(e) => onSelectDocument(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.filename.length > 28 ? d.filename.substring(0, 28) + '...' : d.filename}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Product Tour button */}
          <button
            type="button"
            onClick={onOpenTour}
            aria-label="Open product tour"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Product Tour</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            {isDarkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>

          <div className="hidden md:flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>Grounded Guardrails</span>
          </div>
        </div>
      </div>
    </header>
  );
};
