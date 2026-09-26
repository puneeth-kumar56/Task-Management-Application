import React, { useState } from 'react';
import { LogIn, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';

export const Login = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login(email.trim(), password);
      onSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@taskflow.dev');
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Sign In to TaskFlow</h2>
            <p className="text-xs text-slate-400">Real-time collaborative task workspace</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Need an account?</span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>

          <div className="mt-4 p-3 bg-slate-950/40 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[11px] text-slate-400 font-medium">Quick Demo Credentials</span>
              <span className="text-[11px] text-slate-500 font-mono">demo@taskflow.dev / password123</span>
            </div>
            <button
              type="button"
              onClick={fillDemoAccount}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs rounded border border-slate-700 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Fill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
