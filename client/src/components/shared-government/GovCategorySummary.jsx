import React from 'react';
import {
  HeartPulse,
  GraduationCap,
  Route,
  Droplets,
  Zap,
  Wifi,
  Wheat,
  Home,
  Layers,
  Check,
  BarChart3,
  Sparkles
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Healthcare': { icon: HeartPulse, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  'Education': { icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'Roads & Transport': { icon: Route, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  'Water & Sanitation': { icon: Droplets, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  'Electricity': { icon: Zap, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  'Digital Connectivity': { icon: Wifi, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  'Agriculture': { icon: Wheat, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  'Housing': { icon: Home, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'Other': { icon: Layers, color: 'text-slate-600 bg-slate-100 border-slate-200' },
};

export default function GovCategorySummary({ summary, byCategory: propByCategory, total: propTotal, selectedCategory, onSelectCategory }) {
  const byCategory = summary?.byCategory || propByCategory || {};
  const total = summary?.total !== undefined ? summary.total : (propTotal || 0);

  const categoriesList = [
    'Healthcare',
    'Roads & Transport',
    'Water & Sanitation',
    'Education',
    'Electricity',
    'Digital Connectivity',
    'Agriculture',
    'Housing',
    'Other'
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-full min-h-[580px]">
      {/* Header - Styled consistently with Map header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#002B49] text-white shadow-xs">
            <BarChart3 className="w-4 h-4 text-[#FF9933]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#002B49] tracking-tight">
              Category Intelligence Overview
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              AI-normalized sectoral demand distribution
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectCategory('All')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#002B49] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          All Sectors ({total})
        </button>
      </div>

      {/* Category List Cards - Flex-1 with smooth scrollbar */}
      <div className="flex-1 p-4 space-y-2.5 overflow-y-auto max-h-[460px]">
        {categoriesList.map((catName) => {
          const count = byCategory[catName] || 0;
          const conf = CATEGORY_ICONS[catName] || CATEGORY_ICONS['Other'];
          const Icon = conf.icon;
          const isSelected = selectedCategory === catName;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <button
              key={catName}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'All' : catName)}
              className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/90 border-[#002B49] ring-2 ring-blue-200 shadow-xs'
                  : 'bg-slate-50/70 hover:bg-slate-100/90 border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`p-2 rounded-xl border flex-shrink-0 ${conf.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-slate-900 block truncate">
                    {catName}
                  </span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#002B49] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(4, percentage))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-sm font-extrabold text-[#002B49] font-mono px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  {count}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#002B49] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-[#FF9933]" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Strip - Balanced with Map quick jump strip */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-slate-500 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
          <span>Real-time citizen demand aggregation</span>
        </span>
        <span className="text-[11px] font-bold text-[#002B49]">
          {categoriesList.length} Civic Sectors
        </span>
      </div>
    </div>
  );
}
