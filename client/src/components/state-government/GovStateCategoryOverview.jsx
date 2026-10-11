import React from 'react';
import {
  HeartPulse,
  GraduationCap,
  Car,
  Droplet,
  Zap,
  Wifi,
  Sprout,
  Home,
  Layers,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Healthcare': HeartPulse,
  'Education': GraduationCap,
  'Roads & Transport': Car,
  'Water & Sanitation': Droplet,
  'Electricity': Zap,
  'Digital Connectivity': Wifi,
  'Agriculture': Sprout,
  'Housing': Home,
  'Other': Layers
};

const CATEGORY_COLORS = {
  'Healthcare': { bar: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50 hover:bg-rose-100/70', border: 'border-rose-200' },
  'Education': { bar: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50 hover:bg-indigo-100/70', border: 'border-indigo-200' },
  'Roads & Transport': { bar: 'bg-amber-500', text: 'text-amber-800', bg: 'bg-amber-50 hover:bg-amber-100/70', border: 'border-amber-200' },
  'Water & Sanitation': { bar: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50 hover:bg-sky-100/70', border: 'border-sky-200' },
  'Electricity': { bar: 'bg-yellow-500', text: 'text-yellow-800', bg: 'bg-yellow-50 hover:bg-yellow-100/70', border: 'border-yellow-200' },
  'Digital Connectivity': { bar: 'bg-cyan-500', text: 'text-cyan-700', bg: 'bg-cyan-50 hover:bg-cyan-100/70', border: 'border-cyan-200' },
  'Agriculture': { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100/70', border: 'border-emerald-200' },
  'Housing': { bar: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50 hover:bg-orange-100/70', border: 'border-orange-200' },
  'Other': { bar: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50 hover:bg-slate-100/70', border: 'border-slate-200' }
};

const ALL_CATEGORIES = [
  'Healthcare',
  'Roads & Transport',
  'Education',
  'Water & Sanitation',
  'Electricity',
  'Digital Connectivity',
  'Agriculture',
  'Housing',
  'Other'
];

export default function GovStateCategoryOverview({
  activeState = 'Maharashtra',
  totalRequests = 0,
  byCategory = {},
  selectedCategory = null,
  onSelectCategory
}) {
  const safeTotal = totalRequests || Object.values(byCategory).reduce((a, b) => a + b, 0) || 1;

  // Prepare ordered list with dynamic percentages
  const categoryData = ALL_CATEGORIES.map((cat) => {
    const count = byCategory[cat] || 0;
    const percentage = totalRequests > 0 ? Math.round((count / safeTotal) * 100) : 0;
    return {
      name: cat,
      count,
      percentage,
      icon: CATEGORY_ICONS[cat] || Layers,
      colors: CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other']
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-6 flex flex-col h-full justify-between space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-[#002B49] tracking-tight">
                Category Overview
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {activeState}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sectoral distribution of citizen development demands ({safeTotal} total)
            </p>
          </div>

          <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-900 font-extrabold text-xs border border-blue-200">
            Click any category
          </span>
        </div>

        {/* Category List */}
        <div className="space-y-2.5 mt-4">
          {categoryData.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;

            return (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer group flex flex-col space-y-1.5 ${
                  isSelected
                    ? 'bg-blue-50/80 border-[#002B49] ring-2 ring-blue-200 shadow-sm'
                    : `${cat.colors.bg} ${cat.colors.border} hover:shadow-xs`
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-1.5 rounded-xl bg-white shadow-2xs ${cat.colors.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-950 transition-colors">
                      {cat.name}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      {cat.count} requests
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 ${cat.colors.text}`}>
                      {cat.percentage}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#002B49] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/80 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className={`h-full ${cat.colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(4, cat.percentage)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Helpful Analytical Tip */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start space-x-2 text-[11px] text-slate-600">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <span>
          Clicking any category above opens <strong>Category Intelligence</strong> to compare district-by-district demand percentages and specific citizen grievances.
        </span>
      </div>
    </div>
  );
}
