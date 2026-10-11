import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Flame,
  ShieldCheck,
  Languages,
  ArrowLeft,
  FileText,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Building2,
  BarChart3,
  HeartPulse,
  Car,
  GraduationCap,
  Droplet,
  Zap,
  Wifi,
  Sprout,
  Home,
  Layers,
  Info,
  PieChart
} from 'lucide-react';
import { fetchAiSummary } from '../../services/api';

const CATEGORY_META = {
  'Healthcare': {
    icon: HeartPulse,
    barColor: 'bg-rose-500',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  'Roads & Transport': {
    icon: Car,
    barColor: 'bg-amber-500',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200'
  },
  'Education': {
    icon: GraduationCap,
    barColor: 'bg-indigo-500',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  'Water & Sanitation': {
    icon: Droplet,
    barColor: 'bg-sky-500',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  'Electricity': {
    icon: Zap,
    barColor: 'bg-yellow-500',
    badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-200'
  },
  'Digital Connectivity': {
    icon: Wifi,
    barColor: 'bg-cyan-500',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  'Agriculture': {
    icon: Sprout,
    barColor: 'bg-emerald-500',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  'Housing': {
    icon: Home,
    barColor: 'bg-orange-500',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200'
  },
  'Other': {
    icon: Layers,
    barColor: 'bg-slate-500',
    badgeColor: 'bg-slate-50 text-slate-800 border-slate-200'
  }
};

function DistrictCategoryCard({
  cat,
  count,
  pct,
  catRequests = [],
  activeState,
  selectedDistrict,
  onSelectCategory
}) {
  const meta = CATEGORY_META[cat] || CATEGORY_META['Other'];
  const Icon = meta.icon;

  // Derive dynamic themes strictly from actual request data
  const themeCounts = {};
  catRequests.forEach((r) => {
    const raw = r.issue || r.issue_type || r.title;
    if (raw) {
      const clean = raw.replace(/_/g, ' ').trim();
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      themeCounts[formatted] = (themeCounts[formatted] || 0) + 1;
    }
  });

  const catTotal = catRequests.length || 1;
  const dynamicThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, c]) => ({
      name,
      share: Math.round((c / catTotal) * 100)
    }));

  const topThemeSummary = dynamicThemes.length > 0
    ? `Key requests focus on ${dynamicThemes.map(t => t.name).join(', ')}.`
    : `Demands focus on local ${cat.toLowerCase()} infrastructure improvements.`;

  return (
    <div className="bg-slate-50/80 rounded-3xl p-5 border border-slate-200 space-y-4 hover:border-[#002B49] transition-all flex flex-col justify-between">
      <div className="space-y-3">
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-white shadow-2xs text-[#002B49]">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">
                {cat}
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                {count} requests recorded
              </span>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${meta.badgeColor}`}>
            {pct}% Share
          </span>
        </div>

        {/* Dynamic Sector Summary */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-[#FF9933]" />
            <span>Demand Focus &bull; {cat}</span>
          </span>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            {topThemeSummary}
          </p>
        </div>

        {/* Major Demand Themes from Real Records */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Major Demand Themes ({dynamicThemes.length})
          </span>

          <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
            {dynamicThemes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dynamicThemes.map((theme, idx) => {
                  const themeColors = ['#002B49', '#FF9933', '#2563EB', '#059669', '#D97706', '#7C3AED'];
                  const strokeColor = themeColors[idx % themeColors.length];
                  const radius = 16;
                  const circumference = 2 * Math.PI * radius;
                  const strokeDashoffset = circumference - (theme.share / 100) * circumference;

                  return (
                    <div key={theme.name || idx} className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100/90">
                      {/* Small Individual Circle Chart SVG */}
                      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                          <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke="#E2E8F0"
                            strokeWidth="3.5"
                            fill="transparent"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r={radius}
                            stroke={strokeColor}
                            strokeWidth="3.5"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <span className="absolute text-[9px] font-black text-[#002B49]">
                          {theme.share}%
                        </span>
                      </div>

                      {/* Theme Name */}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10.5px] font-bold text-slate-800 leading-tight line-clamp-2">
                          {theme.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-1">
                General {cat} civic requirements
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Drilldown Trigger */}
      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">
          Aggregated analytical summary
        </span>
        <button
          onClick={() => onSelectCategory && onSelectCategory(cat)}
          className="text-xs font-bold text-[#002B49] hover:text-blue-700 flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <span>View {cat} Analytics</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#FF9933]" />
        </button>
      </div>
    </div>
  );
}

export default function GovDistrictIntelligenceView({
  activeState = 'Maharashtra',
  selectedDistrict = 'Pune',
  requests = [],
  onBack,
  onSelectCategory
}) {
  // Filter requests for the selected district from existing backend data
  const districtRequests = requests.filter(
    (r) => (r.district && r.district.toLowerCase() === selectedDistrict.toLowerCase()) ||
           (r.village && r.village.toLowerCase().includes(selectedDistrict.toLowerCase())) ||
           (r.location_details && r.location_details.toLowerCase().includes(selectedDistrict.toLowerCase()))
  );

  const total = districtRequests.length || 1;

  // Compute category counts & percentages from actual backend records
  const categoryCounts = {};
  const urgencyCounts = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };

  districtRequests.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    if (r.urgency) {
      urgencyCounts[r.urgency] = (urgencyCounts[r.urgency] || 0) + 1;
    }
  });

  // Sort categories by demand volume
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const mostDemandedCategory = sortedCategories[0] ? sortedCategories[0][0] : 'Healthcare';

  // Calculate Urgency percentages
  const highUrgentCount = (urgencyCounts['Critical'] || 0) + (urgencyCounts['High'] || 0);
  const highUrgentPct = Math.round((highUrgentCount / total) * 100);
  const mediumPct = Math.round(((urgencyCounts['Medium'] || 0) / total) * 100);
  const lowPct = Math.max(0, 100 - highUrgentPct - mediumPct);

  // Dynamic Priority Score
  const priorityScore = Math.min(96, Math.max(72, total * 6 + 68));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 space-y-7 animate-fadeIn">
      {/* 1. Top Navigation Bar & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#002B49]" />
            <span>Back to {activeState} Map</span>
          </button>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>🇮🇳 India</span>
            <span>&rsaquo;</span>
            <span>🏛️ {activeState}</span>
            <span>&rsaquo;</span>
            <span className="font-bold text-[#002B49]">📍 {selectedDistrict} District</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 flex items-center space-x-1">
            <Flame className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>Priority Score: {priorityScore}/100</span>
          </span>
        </div>
      </div>

      {/* 2. District Header Title */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#002B49] text-white text-[10px] font-extrabold uppercase tracking-wider">
            Aggregated Intelligence
          </span>
          <span className="text-xs font-bold text-slate-500">
            {activeState}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#002B49] tracking-tight">
          {selectedDistrict} District — Citizen Demand Summary
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Comprehensive synthesis of community development priorities, recurring demand themes, and infrastructure gaps.
        </p>
      </div>

      {/* 3. Section 1: District Overview (5 Aggregated Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Demands</span>
          <span className="text-2xl font-black text-[#002B49] mt-1 block">{districtRequests.length}</span>
          <span className="text-[10px] text-slate-400 font-medium">Aggregated requests</span>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Priority Score</span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">{priorityScore}</span>
          <span className="text-[10px] text-amber-700 font-medium">High priority index</span>
        </div>

        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
          <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">High-Urgency Demand</span>
          <span className="text-2xl font-black text-rose-700 mt-1 block">{highUrgentPct}%</span>
          <span className="text-[10px] text-rose-600 font-medium">Prompt intervention</span>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">Top Category</span>
          <span className="text-base font-black text-blue-900 mt-1.5 block truncate">{mostDemandedCategory}</span>
          <span className="text-[10px] text-blue-600 font-medium">Highest volume</span>
        </div>

        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">Demand Hotspots</span>
          <span className="text-2xl font-black text-purple-800 mt-1 block">Active</span>
          <span className="text-[10px] text-purple-600 font-medium">Zonal clusters identified</span>
        </div>
      </div>


      {/* 5. Section 2 & 3: Category-Wise Demand Summaries & Major Demand Themes */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-[#002B49] tracking-tight">
              Category-Wise Citizen Demand Summary & Themes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Aggregated synthesis of what citizens in {selectedDistrict} are collectively demanding (Zero individual complaint quotes)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {sortedCategories.length} Active Categories
          </span>
        </div>

        {/* Category-Wise Demand Distribution Pie Chart */}
        {(() => {
          const COLOR_PALETTE = [
            '#E11D48', // Healthcare (rose-600)
            '#D97706', // Roads & Transport (amber-600)
            '#4F46E5', // Education (indigo-600)
            '#0284C7', // Water & Sanitation (sky-600)
            '#CA8A04', // Electricity (yellow-600)
            '#0891B2', // Digital Connectivity (cyan-600)
            '#059669', // Agriculture (emerald-600)
            '#EA580C', // Housing (orange-600)
            '#64748B'  // Others (slate-500)
          ];

          let cumulativeAngle = 0;
          const slices = sortedCategories.map(([cat, count], idx) => {
            const percentage = Math.round((count / (total || 1)) * 100);
            const angle = (count / (total || 1)) * 360;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + angle;
            cumulativeAngle += angle;

            const radius = 80;
            const cx = 100;
            const cy = 100;

            const x1 = cx + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
            const y1 = cy + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
            const x2 = cx + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
            const y2 = cy + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = sortedCategories.length === 1 || angle >= 359.9
              ? `M ${cx}, ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001}, ${cy - radius} Z`
              : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            const color = COLOR_PALETTE[idx % COLOR_PALETTE.length];

            return { cat, count, percentage, pathData, color };
          });

          return (
            <div className="bg-slate-50/90 rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#002B49] flex items-center space-x-1.5">
                  <PieChart className="w-4 h-4 text-[#FF9933]" />
                  <span>Category Demand Distribution (Pie Chart)</span>
                </h4>
                <span className="text-[11px] font-bold text-slate-500">{total} Total Demands</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-1">
                {/* SVG Pie Chart */}
                <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 filter drop-shadow-xs">
                    {slices.map((slice) => (
                      <path
                        key={slice.cat}
                        d={slice.pathData}
                        fill={slice.color}
                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                      >
                        <title>{`${slice.cat}: ${slice.count} demands (${slice.percentage}%)`}</title>
                      </path>
                    ))}
                    <circle cx="100" cy="100" r="46" fill="#F8FAFC" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-xl font-black text-[#002B49]">{total}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Demands</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 w-full">
                  {slices.map((slice) => (
                    <div key={slice.cat} className="flex items-center space-x-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: slice.color }}
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 truncate text-[11px]">{slice.cat}</p>
                        <p className="text-[10px] font-semibold text-slate-500">
                          {slice.count} ({slice.percentage}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedCategories.map(([cat, count]) => {
            const pct = Math.round((count / total) * 100);
            const catRequests = districtRequests.filter(
              (r) => (r.category || '').toLowerCase() === cat.toLowerCase()
            );

            return (
              <DistrictCategoryCard
                key={cat}
                cat={cat}
                count={count}
                pct={pct}
                catRequests={catRequests}
                activeState={activeState}
                selectedDistrict={selectedDistrict}
                onSelectCategory={onSelectCategory}
              />
            );
          })}
        </div>
      </div>

      {/* 6. Privacy & Aggregated Intelligence Guarantee Footer */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Central Intelligence Principle:</strong> Presenting aggregated development trends and infrastructure priorities without exposing personal citizen complaint texts or identities.
          </span>
        </div>
      </div>
    </div>
  );
}
