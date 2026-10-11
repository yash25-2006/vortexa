import React from 'react';
import { Landmark, ShieldCheck, ArrowRight, Building2, Home, CheckCircle2 } from 'lucide-react';

export default function GovLevelSelect({ onSelectLevel }) {
  return (
    <div className="min-h-[88vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl space-y-8 animate-fadeIn">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#002B49]/10 text-[#002B49] text-xs font-black uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4 text-[#FF9933]" />
            <span>Official Government Intelligence Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#002B49] tracking-tight">
            Select Government Level
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
            Access multi-tiered evidence-based development intelligence and citizen demand insights across State and Ward levels.
          </p>
        </div>

        {/* Two Government Level Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* 1. State Government Option */}
          <div
            onClick={() => onSelectLevel('state')}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-[#002B49] shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all -mr-6 -mt-6"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-8 h-8 text-[#FF9933]" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🏛️</span>
                  <h2 className="text-lg sm:text-xl font-black text-[#002B49] group-hover:text-blue-900 transition-colors">
                    State Government
                  </h2>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                  Monitor development demands, district clusters, and responsible civic bodies within an <strong>assigned state</strong>.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-semibold">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>State-specific District Map & Hotspots</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Civic Jurisdiction & Ward Offices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Verified Representative Governance</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 group-hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
              >
                <span>Select State & Continue</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF9933] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* 2. Ward Government Option */}
          <div
            onClick={() => onSelectLevel('ward')}
            className="group relative bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 hover:border-emerald-600 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all -mr-6 -mt-6"></div>
            
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Home className="w-8 h-8 text-amber-300" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🏘️</span>
                  <h2 className="text-lg sm:text-xl font-black text-emerald-950 group-hover:text-emerald-900 transition-colors">
                    Ward Government
                  </h2>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
                  Monitor local demand hotspots, recurring category themes, and resolution progress within your <strong>assigned ward</strong>.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-semibold">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Interactive Local Ward Map</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Local Area Hotspot Intelligence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Aggregated Citizen Demand & Status</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 group-hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md group-hover:shadow-lg cursor-pointer"
              >
                <span>Login to Ward Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Security / Verification Badge */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Based State & Ward Access Control Enforced</span>
        </div>
      </div>
    </div>
  );
}
