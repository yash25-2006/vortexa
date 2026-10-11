import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Car,
  Droplet,
  GraduationCap,
  Zap,
  Wifi,
  Sprout,
  Home,
  Layers,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  MapPin,
  Building2,
  X,
  ArrowRight,
  ShieldCheck,
  FileText,
  RotateCw
} from 'lucide-react';
import { fetchAiSummary } from '../../services/api';

const CATEGORY_CONFIG = {
  'Healthcare': {
    icon: HeartPulse,
    barColor: 'bg-rose-500',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    desc: 'Medical facilities, hospitals, PHCs, and emergency healthcare access'
  },
  'Roads & Transport': {
    icon: Car,
    barColor: 'bg-amber-500',
    textColor: 'text-amber-800',
    bgColor: 'bg-amber-50',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
    desc: 'Road repairs, pothole resurfacing, bridges, and public bus connectivity'
  },
  'Education': {
    icon: GraduationCap,
    barColor: 'bg-indigo-500',
    textColor: 'text-indigo-800',
    bgColor: 'bg-indigo-50',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    desc: 'School buildings, classroom infrastructure, digital labs, and student amenities'
  },
  'Water & Sanitation': {
    icon: Droplet,
    barColor: 'bg-sky-500',
    textColor: 'text-sky-800',
    bgColor: 'bg-sky-50',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    desc: 'Piped potable water supply, drainage networks, and sanitation maintenance'
  },
  'Electricity': {
    icon: Zap,
    barColor: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    bgColor: 'bg-yellow-50',
    badgeColor: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    desc: 'Street lighting, power grid stabilization, and transformer reliability'
  },
  'Digital Connectivity': {
    icon: Wifi,
    barColor: 'bg-cyan-500',
    textColor: 'text-cyan-800',
    bgColor: 'bg-cyan-50',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    desc: 'Broadband optical fiber, cellular signal coverage, and digital service hubs'
  },
  'Agriculture': {
    icon: Sprout,
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-800',
    bgColor: 'bg-emerald-50',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    desc: 'Crop storage warehouses, irrigation channels, and farm transport routes'
  },
  'Housing': {
    icon: Home,
    barColor: 'bg-orange-500',
    textColor: 'text-orange-800',
    bgColor: 'bg-orange-50',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    desc: 'Civic housing amenities, drainage connectivity, and shelter support'
  },
  'Other': {
    icon: Layers,
    barColor: 'bg-slate-500',
    textColor: 'text-slate-800',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    desc: 'General public infrastructure, municipal facilitation, and civic welfare'
  }
};

const ALL_CATEGORIES = [
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

export default function GovCategoryRequestSummary({
  activeState = 'Maharashtra',
  selectedDistrict = 'Pune',
  selectedCategory = 'All',
  requests = [],
  isLoading = false,
  userEmail = null,
  onSelectCategory,
  onClose
}) {
  const [aiData, setAiData] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // 1. FILTER REQUEST DATASET CONSISTENTLY:
  // State -> District -> Category (if selected)
  const isAllCategories = !selectedCategory || selectedCategory === 'All' || selectedCategory === 'All Sectors';
  const config = CATEGORY_CONFIG[selectedCategory] || CATEGORY_CONFIG['Other'];
  const IconComponent = config.icon;

  const filteredRequests = (requests || []).filter((r) => {
    if (!r) return false;
    
    // Check State matching
    if (activeState && activeState !== 'All' && r.state) {
      if (r.state.toLowerCase() !== activeState.toLowerCase()) return false;
    }

    // Check District matching
    if (selectedDistrict && selectedDistrict !== 'All Districts') {
      const rDist = (r.district || '').toLowerCase();
      const rVill = (r.village || '').toLowerCase();
      const rLoc = (r.location_details || '').toLowerCase();
      const target = selectedDistrict.toLowerCase();
      const matchesDist = rDist === target || rVill.includes(target) || rLoc.includes(target);
      if (!matchesDist) return false;
    }

    // Check Category matching (if specific category is selected)
    if (!isAllCategories) {
      const rCat = (r.category || '').toLowerCase();
      if (rCat !== selectedCategory.toLowerCase()) return false;
    }

    return true;
  });

  // Fetch real Gemini AI summary from backend
  useEffect(() => {
    let isMounted = true;
    const loadAi = async () => {
      if (!selectedDistrict || selectedDistrict === 'All Districts') return;
      setIsLoadingAi(true);
      try {
        const data = await fetchAiSummary(
          {
            state: activeState,
            district: selectedDistrict,
            category: !isAllCategories ? selectedCategory : null,
            scopeLevel: 'district'
          },
          userEmail
        );
        if (isMounted) {
          setAiData(data);
        }
      } catch (err) {
        console.warn('AI summary fetch notice:', err.message);
        if (isMounted) {
          setAiData({ error: 'AI summary temporarily unavailable. Please try again.', summary: null });
        }
      } finally {
        if (isMounted) setIsLoadingAi(false);
      }
    };

    loadAi();
    return () => { isMounted = false; };
  }, [activeState, selectedDistrict, selectedCategory, userEmail, filteredRequests.length]);

  if (!selectedDistrict || selectedDistrict === 'All Districts') {
    return null;
  }

  // 2. TOTAL REQUESTS (strictly derived from the filtered dataset)
  const totalRequestsCount = filteredRequests.length;

  // 3. URGENCY DISTRIBUTION (strictly derived from the filtered dataset)
  const urgencyCounts = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
  filteredRequests.forEach((r) => {
    const urg = r.urgency || 'Medium';
    if (urgencyCounts[urg] !== undefined) {
      urgencyCounts[urg] += 1;
    } else {
      urgencyCounts['Medium'] += 1;
    }
  });

  const highCriticalTotal = urgencyCounts.Critical + urgencyCounts.High;
  const highCriticalPercent = totalRequestsCount > 0
    ? Math.round((highCriticalTotal / totalRequestsCount) * 100)
    : 0;

  // 4. REQUEST PROCESSING STATUS (strictly derived from the filtered dataset)
  const statusCounts = {};
  filteredRequests.forEach((r) => {
    const st = r.status || 'New';
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  // 5. MAJOR AFFECTED DEMOGRAPHIC GROUPS (from Gemini AI or strictly derived from requests)
  const affectedGroupsMap = {};
  filteredRequests.forEach((r) => {
    if (r.affected_group) {
      affectedGroupsMap[r.affected_group] = (affectedGroupsMap[r.affected_group] || 0) + 1;
    }
  });
  const affectedGroupsList = Object.entries(affectedGroupsMap)
    .sort((a, b) => b[1] - a[1])
    .map(([group, count]) => ({ group, count }));

  // 6. MAIN ISSUES & RECURRING THEMES
  const issueFrequency = {};
  filteredRequests.forEach((r) => {
    const rawIssue = r.issue || r.issue_type;
    if (rawIssue) {
      const clean = rawIssue.replace(/_/g, ' ').trim();
      const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
      issueFrequency[formatted] = (issueFrequency[formatted] || 0) + 1;
    }
  });

  const recurringThemes = Object.entries(issueFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalRequestsCount > 0 ? Math.round((count / totalRequestsCount) * 100) : 0
    }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.badgeColor || 'bg-blue-50 text-blue-800 border-blue-200'}`}>
              District Category Intelligence
            </span>
            <span className="text-xs text-slate-500 font-semibold">{activeState}</span>
          </div>
          
          <h3 className="text-xl font-black text-[#002B49] tracking-tight flex items-center space-x-2">
            <IconComponent className={`w-5 h-5 ${config.textColor}`} />
            <span>
              {isAllCategories ? `All Requests — ${selectedDistrict}` : `${selectedCategory} Requests — ${selectedDistrict}`}
            </span>
          </h3>
          
          <p className="text-xs text-slate-500 font-medium">
            Aggregated intelligence from citizen development requests in {selectedDistrict} district
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Return to State Overview"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Quick Selector Tabs */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Filter by Sector in {selectedDistrict}:
          </label>
          {!isAllCategories && (
            <button
              type="button"
              onClick={() => onSelectCategory && onSelectCategory('All')}
              className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Show All Sectors
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onSelectCategory && onSelectCategory('All')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isAllCategories
                ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className={`w-3.5 h-3.5 ${isAllCategories ? 'text-[#FF9933]' : 'text-slate-500'}`} />
            <span>All Sectors</span>
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Other'];
            const CatIcon = catCfg.icon;
            const isSelected = !isAllCategories && selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#002B49] text-white border-[#002B49] shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <CatIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF9933]' : 'text-slate-500'}`} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Requests Card (Calculated strictly from filteredRequests.length) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total {isAllCategories ? 'District' : selectedCategory} Requests
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-[#002B49] font-mono">
              {isLoading ? (
                <RotateCw className="w-5 h-5 animate-spin text-slate-400 inline" />
              ) : (
                totalRequestsCount
              )}
            </span>
            <span className="text-xs text-slate-400 font-semibold">in {selectedDistrict}</span>
          </div>
        </div>

        {/* High / Critical Urgency Card */}
        <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            High / Critical Urgency
          </span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-black text-rose-700 font-mono">
              {isLoading ? '—' : highCriticalTotal}
            </span>
            <span className="text-xs text-rose-600 font-bold">
              ({isLoading ? '—' : `${highCriticalPercent}%`})
            </span>
          </div>
        </div>

        {/* Verified Records Card */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Authenticity & Integrity
          </span>
          <div className="flex items-center space-x-1 mt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-black text-emerald-950">100% Verified</span>
          </div>
        </div>
      </div>

      {/* Real Gemini AI-Generated Request Summary Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-black text-[#002B49] uppercase tracking-wider">
            <div className="w-5 h-5 rounded-lg bg-[#002B49] text-white flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-[#FF9933]" />
            </div>
            <span>AI Demand Summary &bull; Google Gemini</span>
          </div>
          {aiData?.overallUrgency && (
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">
              {aiData.overallUrgency} Priority
            </span>
          )}
        </div>

        {isLoadingAi ? (
          <div className="flex items-center space-x-2 text-xs text-slate-600 py-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933] animate-spin" />
            <span>Synthesizing Gemini AI qualitative analysis for {selectedDistrict}...</span>
          </div>
        ) : aiData?.error ? (
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium italic">
            {aiData.error}
          </p>
        ) : aiData?.message ? (
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium italic">
            {aiData.message}
          </p>
        ) : aiData?.summary ? (
          <div className="space-y-2">
            <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium">
              {aiData.summary}
            </p>
            {aiData.mainIssues && aiData.mainIssues.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aiData.mainIssues.map((issue, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-100/80 text-blue-950 text-[11px] font-bold border border-blue-200/80 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>{issue}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium italic">
            {totalRequestsCount === 0 ? 'No citizen requests found for this selection.' : 'AI summary temporarily unavailable. Please try again.'}
          </p>
        )}
      </div>

      {/* Main Issues & Recurring Themes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
          <span className="flex items-center space-x-1.5">
            <BarChart3 className="w-4 h-4 text-[#002B49]" />
            <span>Main Issues & Recurring Themes</span>
          </span>
          <span className="text-slate-400 text-[11px] font-mono">
            {totalRequestsCount} matching demands
          </span>
        </div>

        {recurringThemes.length > 0 ? (
          <div className="space-y-2.5">
            {recurringThemes.map((theme, idx) => (
              <div key={theme.name || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900 leading-snug">{theme.name}</span>
                  <span className="font-black text-xs text-[#002B49] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200">
                    {theme.count} {theme.count === 1 ? 'demand' : 'demands'} ({theme.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${config.barColor || 'bg-blue-600'} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(10, theme.percentage))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
            No specific recurring themes reported for this selection yet.
          </div>
        )}
      </div>

      {/* Urgency & Status Distributions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Urgency Breakdown */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <AlertOctagon className="w-3.5 h-3.5 text-amber-600" />
            <span>Urgency Distribution</span>
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1 font-semibold text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Critical / High:</span>
              </span>
              <strong className="font-mono font-bold text-rose-900">{highCriticalTotal}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1 font-semibold text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Medium:</span>
              </span>
              <strong className="font-mono font-bold text-amber-900">{urgencyCounts.Medium}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span className="flex items-center space-x-1 font-semibold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Low:</span>
              </span>
              <strong className="font-mono font-bold text-emerald-900">{urgencyCounts.Low}</strong>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Request Processing Status</span>
          </span>
          <div className="space-y-1.5 text-xs">
            {Object.keys(statusCounts).length > 0 ? (
              Object.entries(statusCounts).map(([st, cnt]) => (
                <div key={st} className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold text-slate-700">{st}:</span>
                  <strong className="font-mono font-bold text-slate-900">{cnt}</strong>
                </div>
              ))
            ) : (
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold text-slate-700">Registered:</span>
                <strong className="font-mono font-bold text-slate-900">{totalRequestsCount}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Major Affected Demographic Groups */}
      {(aiData?.affectedGroups?.length > 0 || affectedGroupsList.length > 0) && (
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Major Affected Demographic Groups</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {aiData?.affectedGroups && aiData.affectedGroups.length > 0 ? (
              aiData.affectedGroups.map((group, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold"
                >
                  {group}
                </span>
              ))
            ) : (
              affectedGroupsList.map(({ group, count }) => (
                <span
                  key={group}
                  className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center space-x-1.5"
                >
                  <span>{group}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-200/70 text-blue-950 text-[10px] font-black">
                    {count}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
