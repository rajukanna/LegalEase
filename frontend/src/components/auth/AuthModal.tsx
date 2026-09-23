import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types/legal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleTabChange = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleFillDemo = () => {
    setTab('signin');
    setEmail('demo@legalease.com');
    setPassword('demo1234');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'signin') {
        const response = await api.login({ email, password });
        setSuccessMessage('Successfully signed in.');
        setTimeout(() => {
          onSuccess(response.user);
          resetForm();
          onClose();
        }, 300);
      } else {
        if (!email || !password) {
          throw new Error('Email and password are required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const response = await api.register({
          email,
          password,
          full_name: fullName.trim() || undefined,
        });
        setSuccessMessage('Account created successfully.');
        setTimeout(() => {
          onSuccess(response.user);
          resetForm();
          onClose();
        }, 300);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200/80 p-6 sm:p-7 dark:bg-slate-900 dark:border-slate-800">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center pb-5">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 id="auth-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {tab === 'signin' ? 'Sign in to LegalEase' : 'Create your account'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {tab === 'signin'
              ? 'Access your saved documents, analyses, and custom contracts'
              : 'Save personal contracts, run grounded Q&A, and prepare briefs'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/60 mb-5 dark:bg-slate-800/80 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'signin'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Demo Fill Banner */}
        <div className="mb-4 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
              <span>Demo account:</span>
              <code className="rounded bg-white px-1.5 py-0.5 text-[11px] font-mono text-slate-800 border border-slate-200 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200">
                demo@legalease.com
              </code>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-slate-900 hover:underline shrink-0 dark:text-slate-100"
            >
              Fill Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label htmlFor="auth-fullname" className="block text-xs font-medium text-slate-700 mb-1.5 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-500"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1.5 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 mb-1.5 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition"
          >
            <span>{isLoading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Account'}</span>
            {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500">
          General information & analytical tool. Not legal advice.
        </p>
      </div>
    </div>
  );
};
