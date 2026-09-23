import React, { useState } from 'react';
import { Scale, Mail, Lock, User as UserIcon, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types/legal';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setSuccessMessage('Successfully signed in. Loading your workspace...');
        setTimeout(() => {
          onLoginSuccess(response.user);
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
        setSuccessMessage('Account created successfully. Welcome to LegalEase!');
        setTimeout(() => {
          onLoginSuccess(response.user);
        }, 300);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#b8c8c2] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Background Organic Wave Curves */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 1200"
        fill="none"
      >
        <path
          d="M-200 400 C 300 200, 500 700, 1100 400 C 1400 250, 1600 600, 1900 450"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="3"
        />
        <path
          d="M-100 700 C 400 500, 700 900, 1300 650 C 1600 550, 1800 800, 2000 750"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2.5"
        />
        <path
          d="M-50 150 C 500 350, 800 50, 1400 300 C 1700 400, 1900 150, 2100 250"
          stroke="rgba(45,75,65,0.15)"
          strokeWidth="2"
        />
      </svg>

      {/* Main Floating Card Container */}
      <div className="relative z-10 w-full max-w-md rounded-[36px] bg-white p-7 sm:p-9 shadow-2xl border border-white/80 transition-all">
        {/* Brand Emblem & Welcome Title */}
        <div className="text-center">
          <div className="mx-auto mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md">
            <Scale className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">LegalEase</span>
            <span className="rounded-full bg-[#d6eee6] px-2.5 py-0.5 text-[10px] font-semibold text-emerald-900">
              AI Assistant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {tab === 'signin'
              ? 'Sign in to access your personal contract workspace'
              : 'Create an account to analyze, compare & navigate legal documents'}
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Click Demo Fill Banner */}
        <div className="mt-4 rounded-2xl bg-[#d6eee6]/60 border border-[#b2ded0] p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <Sparkles className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Demo Account:</span>
              <code className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-mono text-slate-800 font-medium border border-emerald-100 shadow-2xs">
                demo@legalease.com
              </code>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="rounded-lg bg-emerald-800 hover:bg-emerald-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs transition"
            >
              Fill Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label htmlFor="login-fullname" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="login-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 transition"
          >
            <span>{isLoading ? 'Verifying...' : tab === 'signin' ? 'Sign In to Workspace' : 'Create My Account'}</span>
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Frictionless Guest Option */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2">Want to try without creating an account?</p>
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
            <span>Explore as Guest →</span>
          </button>
        </div>

        {/* Non-Negotiable Legal Disclaimer */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
          Educational & analytical tool. This is general information, not legal advice. Consult a licensed attorney for specific situations.
        </p>
      </div>
    </div>
  );
};
