import React from 'react';
import { Landmark, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white border-y border-slate-100"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('citizen')}>
            <div className="w-10 h-10 rounded-lg bg-[#002B49] text-white flex items-center justify-center shadow-inner">
              <Landmark className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-[#002B49] tracking-tight">
                  India Development Intelligence
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  Phase 1 MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Citizen-to-Government Platform &bull; Powered by Google Gemini AI
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('citizen')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'citizen'
                  ? 'bg-white text-[#002B49] shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-[#FF9933]" />
              <span>Citizen Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('government')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'government'
                  ? 'bg-[#002B49] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Government Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
