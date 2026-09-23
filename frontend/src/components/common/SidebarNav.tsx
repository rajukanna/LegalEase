import React from 'react';
import { Scale, LayoutGrid, FileText, GitCompare, BookOpen, Plus, Sun, Moon, HelpCircle } from 'lucide-react';

interface SidebarNavProps {
  activeTab: 'dashboard' | 'analyze' | 'compare' | 'brief';
  setActiveTab: (tab: 'dashboard' | 'analyze' | 'compare' | 'brief') => void;
  onOpenUpload: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onOpenTour: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  isDarkMode,
  setIsDarkMode,
  onOpenTour,
}) => {
  return (
    <aside
      className="flex h-full w-20 flex-col items-center justify-between border-r border-slate-100 bg-[#fbfcfb] py-6 dark:border-slate-800 dark:bg-slate-900/90 shrink-0"
      aria-label="Application Sidebar Navigation"
    >
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          aria-label="LegalEase Home"
          className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md hover:scale-105 transition dark:bg-white dark:text-slate-900"
        >
          <Scale className="h-6 w-6" />
        </button>

        {/* Primary Navigation Icons */}
        <nav className="flex flex-col items-center gap-3" aria-label="Workspaces">
          {/* Dashboard / Activities Overview */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            aria-label="Dashboard Activities"
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            title="Overview & Activities"
            className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>

          {/* Document Workspace */}
          <button
            type="button"
            onClick={() => setActiveTab('analyze')}
            aria-label="Document Workspace"
            aria-current={activeTab === 'analyze' ? 'page' : undefined}
            title="Document Workspace"
            className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
              activeTab === 'analyze'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-5 w-5" />
          </button>

          {/* Compare Versions */}
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            aria-label="Compare Versions"
            aria-current={activeTab === 'compare' ? 'page' : undefined}
            title="Compare Agreement Versions"
            className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
              activeTab === 'compare'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <GitCompare className="h-5 w-5" />
          </button>

          {/* Attorney Prep Dossier */}
          <button
            type="button"
            onClick={() => setActiveTab('brief')}
            aria-label="Attorney Prep Brief"
            aria-current={activeTab === 'brief' ? 'page' : undefined}
            title="Attorney Prep Brief"
            className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
              activeTab === 'brief'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
          </button>

          {/* Upload New Document Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            aria-label="Upload New Document"
            title="Upload Document"
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <Plus className="h-5 w-5" />
          </button>
        </nav>
      </div>

      {/* Bottom Controls: Tour & Theme */}
      <div className="flex flex-col items-center gap-3">
        {/* Product Tour Guide */}
        <button
          type="button"
          onClick={onOpenTour}
          aria-label="Product Tour Guide"
          title="Open Product Tour"
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
};
