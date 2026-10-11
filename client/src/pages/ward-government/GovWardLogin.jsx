import React, { useState } from 'react';
import { Home, ShieldCheck, Mail, Lock, ArrowRight, UserCheck, AlertCircle, MapPin } from 'lucide-react';
import { govLogin } from '../../services/api';

import demoAccountsData from '../../data/demoAccounts.json';

const DEMO_WARD_ACCOUNTS = demoAccountsData.wardAccounts || [];

export default function GovWardLogin({ onLoginSuccess, onBackToLevelSelect }) {
  const [email, setEmail] = useState('ward10.bavdhan@demo.gov');
  const [password, setPassword] = useState('Demo@123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuickSelect = (acc) => {
    setEmail(acc.email);
    setPassword('Demo@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await govLogin(email, password);
      if (res.success && res.user) {
        if (res.user.role !== 'ward_monitor' && res.user.role !== 'admin') {
          throw new Error('This account is not designated as a Ward Officer. Please login via the State portal.');
        }
        onLoginSuccess(res.user);
      } else {
        throw new Error(res.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Ward Login error:', err);
      setError(err.message || 'Invalid official ward credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-7 text-center relative border-b border-emerald-950">
          {onBackToLevelSelect && (
            <button
              type="button"
              onClick={onBackToLevelSelect}
              className="absolute left-4 top-4 text-xs text-emerald-200 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>&larr; Back</span>
            </button>
          )}
          <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <Home className="w-9 h-9 text-amber-300" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Ward Intelligence Portal
          </h1>
          <p className="text-xs text-emerald-200 mt-1 font-medium tracking-wide uppercase">
            Ward & Local Civic Administration Login
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Demo Login Selector */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Select Demo Ward Officer:</span>
              </span>
              <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded">
                Demo@123
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {DEMO_WARD_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    email === acc.email
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white hover:bg-emerald-100/60 text-slate-800 border-emerald-300'
                  }`}
                >
                  <span className="font-bold block truncate text-[11px]">{acc.ward}</span>
                  <span className={`text-[10px] block truncate ${email === acc.email ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {acc.city.split(',')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-800" />
                <span>Official Email / Ward ID</span>
              </label>
              <input
                type="email"
                required
                placeholder="ward.officer@localgov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-800" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none transition-all shadow-inner"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
                isLoading || !email || !password
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Ward Assignment...</span>
                </>
              ) : (
                <>
                  <span>Access Ward Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>

          {/* Civic Trust Badge */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assigned Ward Locked &bull; Cross-Ward Access Prohibited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
