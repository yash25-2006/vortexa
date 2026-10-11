import React, { useState } from 'react';
import { Landmark, ShieldCheck, Mail, Lock, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { govLogin } from '../../services/api';

import demoAccountsData from '../../data/demoAccounts.json';

const DEMO_GOV_ACCOUNTS = demoAccountsData.stateAccounts || [];

export default function GovLogin({ onLoginSuccess, onBackToLevelSelect }) {
  const [email, setEmail] = useState('demo.maharashtra@demo.gov');
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
        onLoginSuccess(res.user);
      } else {
        throw new Error(res.error || 'Authentication failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid official credentials. Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#002B49] text-white p-7 text-center relative border-b border-slate-800">
          {onBackToLevelSelect && (
            <button
              type="button"
              onClick={onBackToLevelSelect}
              className="absolute left-4 top-4 text-xs text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>&larr; Back</span>
            </button>
          )}
          <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <Landmark className="w-9 h-9 text-[#FF9933]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Jan Setu State Intelligence
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium tracking-wide uppercase">
            State Government Monitoring Portal
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Demo Login Selector */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Select Demo Officer Account:</span>
              </span>
              <span className="text-[10px] font-semibold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                Demo@123
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {DEMO_GOV_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc)}
                  className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    email === acc.email
                      ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                      : 'bg-white hover:bg-amber-100/60 text-slate-800 border-amber-300'
                  }`}
                >
                  <span className="font-bold block truncate">{acc.state}</span>
                  <span className={`text-[10px] block truncate ${email === acc.email ? 'text-slate-300' : 'text-slate-500'}`}>
                    {acc.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-[#002B49]" />
                <span>Official Email / User ID</span>
              </label>
              <input
                type="email"
                required
                placeholder="officer.name@state.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#002B49]" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
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
                  : 'bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating Monitoring Scope...</span>
                </>
              ) : (
                <>
                  <span>Access State Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                </>
              )}
            </button>
          </form>

          {/* Civic Trust Badge */}
          <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Public Administration Access &bull; State Development Intelligence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
