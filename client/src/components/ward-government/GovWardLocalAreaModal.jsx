import React from 'react';
import { X, MapPin, AlertTriangle, CheckCircle2, Clock, Building2, Flame, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export default function GovWardLocalAreaModal({ hotspot, onClose, onSelectCategory }) {
  if (!hotspot) return null;

  const totalRequests = hotspot.requestCount || hotspot.totalRequests || 4;
  const priorityScore = hotspot.priorityScore || 82;
  const areaName = hotspot.name || hotspot.locality || 'Local Area Cluster';
  
  // Category breakdown
  const categoryBreakdown = hotspot.categoryBreakdown || [
    { category: 'Healthcare', count: Math.round(totalRequests * 0.42), share: 42 },
    { category: 'Roads & Transport', count: Math.round(totalRequests * 0.31), share: 31 },
    { category: 'Water & Sanitation', count: Math.round(totalRequests * 0.17), share: 17 },
    { category: 'Electricity', count: Math.round(totalRequests * 0.10), share: 10 }
  ];

  // Recurring Issues
  const recurringIssues = hotspot.recurringIssues || [
    'Absence of nearby Municipal Dispensary and emergency care units',
    'Severe arterial road deterioration, potholes, and traffic congestion',
    'Low drinking water pressure and distribution network outages',
    'Transit street light blackouts on main approach corridors'
  ];

  // Status Distribution
  const statusStats = hotspot.statusDistribution || {
    pending: 52,
    inProgress: 28,
    resolved: 20
  };

  // Urgency distribution
  const urgencyStats = hotspot.urgencyDistribution || {
    high: 68,
    medium: 24,
    low: 8
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#002B49] to-slate-900 text-white flex items-start justify-between relative border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-amber-300" />
              <span>Local Area Intelligence Panel</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{areaName}</h2>
            <p className="text-xs text-slate-300 font-medium">
              Geographic Cluster Analysis &bull; Aggregated Citizen Development Signals
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top 2 KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Requests</span>
              <span className="text-xl font-black text-[#002B49] block mt-0.5">{totalRequests}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Priority Score</span>
              <span className="text-xl font-black text-rose-900 block mt-0.5">{priorityScore}/100</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">High Urgency</span>
              <span className="text-xl font-black text-amber-950 block mt-0.5">{urgencyStats.high}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Resolved</span>
              <span className="text-xl font-black text-emerald-950 block mt-0.5">{statusStats.resolved}%</span>
            </div>
          </div>

          {/* Main Demands Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Main Demands</h4>
              <span className="text-[11px] text-slate-500 font-semibold">Share of Area Requests</span>
            </div>

            <div className="space-y-2.5">
              {categoryBreakdown.map((cat, idx) => (
                <div
                  key={cat.category}
                  onClick={() => onSelectCategory && onSelectCategory(cat.category)}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#002B49] transition-all cursor-pointer space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#002B49]">{cat.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 font-medium">{cat.count} requests</span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                        {cat.share}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${cat.share}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Major Recurring Issues */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Major Recurring Issues
            </h4>
            <div className="space-y-2">
              {recurringIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium flex items-start space-x-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{issue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Issue Resolution Status</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="block text-[10px] uppercase tracking-wider text-amber-700">Pending</span>
                <span className="text-base font-black">{statusStats.pending}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="block text-[10px] uppercase tracking-wider text-blue-700">In Progress</span>
                <span className="text-base font-black">{statusStats.inProgress}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="block text-[10px] uppercase tracking-wider text-emerald-700">Resolved</span>
                <span className="text-base font-black">{statusStats.resolved}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy Preserved &bull; Aggregated Civic Intelligence</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#002B49] text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
