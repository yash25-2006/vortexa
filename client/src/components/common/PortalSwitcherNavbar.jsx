import React from 'react';
import { Users, LayoutDashboard, Globe2, Building2, Home } from 'lucide-react';

export default function PortalSwitcherNavbar({ activePortal, setActivePortal, govUser, govLevel }) {
  return (
    <div className="bg-[#0A192F] text-white px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-800 shadow-md">
      <div className="max-w-[1360px] w-full mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left side: Platform Title & Level Badge (Logos hidden in upper navbar) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold tracking-wide text-slate-100 text-xs sm:text-sm">
              India Development Intelligence Platform
            </span>
            {activePortal === 'government' && govLevel && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-[10px] font-bold border border-white/10">
                {govLevel === 'central' && <><Globe2 className="w-3 h-3 text-[#FF9933]" /><span>Central (National)</span></>}
                {govLevel === 'state' && <><Building2 className="w-3 h-3 text-blue-400" /><span>State ({govUser?.monitoringState || 'Regional'})</span></>}
                {govLevel === 'ward' && <><Home className="w-3 h-3 text-emerald-400" /><span>Ward ({govUser?.monitoringWard ? govUser.monitoringWard.split('–')[0].trim() : 'Local'})</span></>}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Switcher Buttons */}
        <div className="flex items-center space-x-1.5 bg-white/10 p-1 rounded-lg border border-white/15">
          <button
            type="button"
            onClick={() => setActivePortal('citizen')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activePortal === 'citizen'
                ? 'bg-[#FF9933] text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('government')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
              activePortal === 'government'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Government Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
