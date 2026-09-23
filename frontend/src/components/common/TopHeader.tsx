import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User } from '../../types/legal';

interface TopHeaderProps {
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenAuthModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (user: User): string => {
    if (user.full_name) {
      const parts = user.full_name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return user.full_name.slice(0, 2).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  const displayName = currentUser?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Evaluator');

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80">
      {/* Left: Warm Greeting */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back 👋
          </h1>
          <span className="rounded-full bg-[#d6eee6] px-2.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            AI Assistant
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 dark:text-slate-500">
          Democratizing Legal Comprehension & Clause Navigation
        </p>
      </div>

      {/* Right: Search Pill & User Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Modern Rounded Pill Search Bar */}
        <div className="relative flex items-center rounded-full bg-slate-100/90 px-3.5 py-2 text-xs shadow-2xs border border-slate-200/60 w-48 sm:w-64 focus-within:w-72 focus-within:border-slate-400 focus-within:bg-white dark:bg-slate-800 dark:border-slate-700 dark:focus-within:bg-slate-850 transition-all">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents or clauses..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* User Profile Avatar with Dropdown */}
        {currentUser ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 transition dark:hover:bg-slate-800"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs shadow-sm ring-2 ring-slate-100 dark:bg-white dark:text-slate-900 dark:ring-slate-800">
                {getInitials(currentUser)}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[100px] truncate dark:text-slate-200">
                {displayName}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 z-50 animate-in fade-in duration-100">
                <div className="px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.full_name || 'LegalEase User'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {currentUser.email}
                  </p>
                </div>
                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition dark:bg-white dark:text-slate-900"
          >
            <UserIcon className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {/* Guardrails Pill */}
        <div className="hidden lg:flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
          <span>Grounded Guardrails</span>
        </div>
      </div>
    </header>
  );
};
