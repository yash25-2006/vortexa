import React from 'react';
import {
  FileText,
  HeartPulse,
  GraduationCap,
  Route,
  Droplets,
  Wifi,
  Zap,
  Wheat,
  AlertOctagon,
  Languages
} from 'lucide-react';

export default function SummaryCards({ stats, selectedCategory, onSelectCategory }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const { total = 0, byCategory = {}, byUrgency = {}, byLanguage = {} } = stats;

  const cards = [
    {
      label: 'Total Requests',
      categoryKey: 'All',
      count: total,
      icon: FileText,
      color: 'border-slate-300 text-slate-800 bg-white hover:border-[#002B49]',
      iconColor: 'text-[#002B49] bg-slate-100'
    },
    {
      label: 'Healthcare',
      categoryKey: 'Healthcare',
      count: byCategory['Healthcare'] || 0,
      icon: HeartPulse,
      color: 'border-rose-200 text-rose-950 bg-white hover:border-rose-400',
      iconColor: 'text-rose-600 bg-rose-50'
    },
    {
      label: 'Education',
      categoryKey: 'Education',
      count: byCategory['Education'] || 0,
      icon: GraduationCap,
      color: 'border-blue-200 text-blue-950 bg-white hover:border-blue-400',
      iconColor: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Roads & Transport',
      categoryKey: 'Roads & Transport',
      count: byCategory['Roads & Transport'] || 0,
      icon: Route,
      color: 'border-amber-200 text-amber-950 bg-white hover:border-amber-400',
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      label: 'Water & Sanitation',
      categoryKey: 'Water & Sanitation',
      count: byCategory['Water & Sanitation'] || 0,
      icon: Droplets,
      color: 'border-cyan-200 text-cyan-950 bg-white hover:border-cyan-400',
      iconColor: 'text-cyan-600 bg-cyan-50'
    },
    {
      label: 'Digital Connectivity',
      categoryKey: 'Digital Connectivity',
      count: byCategory['Digital Connectivity'] || 0,
      icon: Wifi,
      color: 'border-indigo-200 text-indigo-950 bg-white hover:border-indigo-400',
      iconColor: 'text-indigo-600 bg-indigo-50'
    },
    {
      label: 'Electricity',
      categoryKey: 'Electricity',
      count: byCategory['Electricity'] || 0,
      icon: Zap,
      color: 'border-yellow-200 text-yellow-950 bg-white hover:border-yellow-400',
      iconColor: 'text-yellow-600 bg-yellow-50'
    },
    {
      label: 'Agriculture',
      categoryKey: 'Agriculture',
      count: byCategory['Agriculture'] || 0,
      icon: Wheat,
      color: 'border-emerald-200 text-emerald-950 bg-white hover:border-emerald-400',
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
  ];

  const criticalCount = (byUrgency['Critical'] || 0) + (byUrgency['High'] || 0);

  return (
    <div className="space-y-3">
      {/* Category Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedCategory === card.categoryKey;
          return (
            <button
              key={card.label}
              onClick={() => onSelectCategory && onSelectCategory(card.categoryKey)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${card.color} ${
                isSelected ? 'ring-2 ring-[#002B49] shadow-md -translate-y-0.5' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#002B49]"></span>
                )}
              </div>
              <div className="text-xl font-extrabold tracking-tight">{card.count}</div>
              <div className="text-[11px] font-semibold text-slate-500 truncate mt-0.5">
                {card.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-rose-900">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span className="font-bold">Critical / High Urgency Issues:</span>
          </div>
          <span className="font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
            {criticalCount} requests
          </span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-blue-900">
            <Languages className="w-4 h-4 text-blue-600" />
            <span className="font-bold">Multilingual Distribution:</span>
          </div>
          <div className="flex items-center space-x-2 font-medium text-blue-800">
            <span>Marathi: <b>{byLanguage['Marathi'] || 0}</b></span>
            <span>&bull;</span>
            <span>Hindi: <b>{byLanguage['Hindi'] || 0}</b></span>
            <span>&bull;</span>
            <span>English: <b>{byLanguage['English'] || 0}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
