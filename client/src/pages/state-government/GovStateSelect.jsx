import React, { useState } from 'react';
import { MapPin, ArrowRight, ShieldCheck, Landmark, Check } from 'lucide-react';
import INDIAN_STATES from '../../data/indianStates.json';

export default function GovStateSelect({ govUser, onSelectState, onBackToLevelSelect }) {
  const defaultState = govUser?.monitoringState || 'Maharashtra';
  const [selectedState, setSelectedState] = useState(defaultState);

  const handleContinue = () => {
    onSelectState(selectedState);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-[#002B49] text-white p-6 sm:p-7 text-center relative">
          {onBackToLevelSelect && (
            <button
              type="button"
              onClick={onBackToLevelSelect}
              className="absolute left-4 top-4 text-xs text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer"
            >
              <span>&larr; Back</span>
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3">
            <MapPin className="w-8 h-8 text-[#FF9933]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Select Your Monitoring Region
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as: <span className="font-bold text-white">{govUser?.name}</span> ({govUser?.role})
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Assigned Monitoring State
            </label>
            <div className="space-y-2.5">
              {INDIAN_STATES.map((st) => {
                const isSelected = selectedState === st.name;
                const isAssigned = govUser?.role === 'admin' || govUser?.monitoringState === st.name;

                return (
                  <button
                    key={st.code}
                    type="button"
                    disabled={!isAssigned}
                    onClick={() => setSelectedState(st.name)}
                    className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-[#002B49] ring-2 ring-blue-100 shadow-xs'
                        : isAssigned
                        ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                        : 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{st.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-200/80 text-slate-700">
                          {st.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {st.capital} &bull; {st.badge}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#002B49] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-[#FF9933]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <span>Continue to {selectedState} Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#FF9933]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
