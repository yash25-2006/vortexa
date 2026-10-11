import React from 'react';
import { MapPin, Search, Filter, RotateCw, ChevronDown, Check, Building2 } from 'lucide-react';
import { STATE_DISTRICTS_DATA } from './GovStateDistrictMap';

export default function GovDistrictFilter({
  activeState = 'Maharashtra',
  districts = {},
  districtCounts = {},
  selectedDistrict = 'All Districts',
  onSelectDistrict,
  searchTerm = '',
  onSearchChange,
  selectedUrgency = 'All',
  onSelectUrgency,
  onReset,
  onResetFilters
}) {
  const handleReset = onReset || onResetFilters;

  // Merge known state districts with any additional districts from backend records
  const countsMap = { ...districts, ...districtCounts };
  const knownDistricts = (STATE_DISTRICTS_DATA[activeState] || STATE_DISTRICTS_DATA['Maharashtra'] || []).map(d => d.name);
  
  // Combine known districts and any dynamic districts present in countsMap
  const allDistrictSet = new Set([...knownDistricts, ...Object.keys(countsMap).filter(k => k && k !== 'Unassigned')]);
  const districtList = Array.from(allDistrictSet).sort((a, b) => {
    // Sort by count descending, then alphabetically
    const countA = countsMap[a] || 0;
    const countB = countsMap[b] || 0;
    if (countB !== countA) return countB - countA;
    return a.localeCompare(b);
  });

  const totalKnownRequests = Object.values(countsMap).reduce((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);

  const isFiltered = (selectedDistrict && selectedDistrict !== 'All Districts') ||
                     (selectedUrgency && selectedUrgency !== 'All') ||
                     (searchTerm && searchTerm.trim() !== '');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 space-y-3">
      {/* Header Strip */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#002B49] flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Regional & Urgency Filters</span>
          </span>

          {selectedDistrict && selectedDistrict !== 'All Districts' && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#002B49] text-white">
              <MapPin className="w-2.5 h-2.5 text-[#FF9933]" />
              <span>{selectedDistrict}</span>
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            title="Clear all filters and restore full state view"
          >
            <RotateCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. District Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-[#FF9933]" />
            <span>District / जिल्हा ({activeState})</span>
          </label>
          <div className="relative">
            <select
              value={selectedDistrict || 'All Districts'}
              onChange={(e) => onSelectDistrict && onSelectDistrict(e.target.value)}
              className="w-full text-xs font-bold pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden transition-all appearance-none cursor-pointer"
            >
              <option value="All Districts">
                All Districts — {activeState} ({totalKnownRequests > 0 ? `${totalKnownRequests} total` : 'सर्व जिल्हे'})
              </option>
              {districtList.map((d) => {
                const count = countsMap[d];
                return (
                  <option key={d} value={d}>
                    {d} {count !== undefined && count > 0 ? `(${count} requests)` : ''}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 2. Urgency Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 block">
            Urgency Level / निकड
          </label>
          <div className="relative">
            <select
              value={selectedUrgency || 'All'}
              onChange={(e) => onSelectUrgency && onSelectUrgency(e.target.value)}
              className="w-full text-xs font-bold pl-3 pr-8 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden transition-all appearance-none cursor-pointer"
            >
              <option value="All">All Urgency Levels (सर्व)</option>
              <option value="Critical">🔴 Critical (Life/Bridge cutoff)</option>
              <option value="High">🟠 High (Hospital/Water shortage)</option>
              <option value="Medium">🔵 Medium (Power/Signal/APMC)</option>
              <option value="Low">⚪ Low (Routine)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 3. Search Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 block">
            Keyword / Issue Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder={`Search in ${selectedDistrict !== 'All Districts' ? selectedDistrict : activeState}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-hidden transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
