import React, { useState, useEffect } from 'react';
import { X, Layers, Flame, MapPin, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Sparkles } from 'lucide-react';
import { fetchAiSummary } from '../../services/api';

export default function GovWardCategoryModal({
  category,
  wardName,
  regionId = 13,
  userEmail = null,
  share = 0,
  categoryRequests = [],
  onClose
}) {
  const [aiData, setAiData] = useState(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAi = async () => {
      setIsLoadingAi(true);
      try {
        const data = await fetchAiSummary(
          {
            regionId,
            category,
            scopeLevel: 'ward'
          },
          userEmail
        );
        if (isMounted) {
          setAiData(data);
        }
      } catch (err) {
        console.warn('Modal AI summary notice:', err.message);
        if (isMounted) {
          setAiData({ error: 'AI summary temporarily unavailable. Please try again.', summary: null });
        }
      } finally {
        if (isMounted) setIsLoadingAi(false);
      }
    };

    if (category) {
      loadAi();
    }
    return () => { isMounted = false; };
  }, [category, regionId, userEmail]);

  if (!category) return null;

  // Derive factual numerical metrics strictly from backend requests
  const totalCategoryRequests = categoryRequests.length;

  const rawLocations = categoryRequests
    .map(r => r.problem_address || r.location_details || r.village || r.locality || '')
    .filter(Boolean);
  const uniqueLocations = Array.from(new Set(rawLocations));
  const hotspotAreas = uniqueLocations.length > 0
    ? uniqueLocations.slice(0, 5)
    : [wardName ? `${wardName} Sector` : 'Ward Area'];

  // Status breakdown calculated strictly by application logic
  const pendingCount = categoryRequests.filter(r => !r.status || r.status === 'Pending' || r.status === 'In Progress').length;
  const resolvedCount = categoryRequests.filter(r => r.status === 'Resolved' || r.status === 'Approved' || r.status === 'Completed').length;
  const pendingPct = totalCategoryRequests > 0 ? Math.round((pendingCount / totalCategoryRequests) * 100) : 0;
  const resolvedPct = totalCategoryRequests > 0 ? Math.round((resolvedCount / totalCategoryRequests) * 100) : 0;

  // Real issues from Gemini AI or real request issues
  const displayIssues = aiData?.mainIssues && aiData.mainIssues.length > 0
    ? aiData.mainIssues
    : Array.from(new Set(categoryRequests.map(r => r.issue || r.subcategory || '').filter(Boolean))).slice(0, 5);

  const displayUrgency = aiData?.overallUrgency || (
    categoryRequests.some(r => r.urgency === 'Critical') ? 'Critical' :
    categoryRequests.some(r => r.urgency === 'High') ? 'High' :
    totalCategoryRequests > 0 ? 'Medium' : 'Low'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-start justify-between relative border-b border-emerald-950">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
              <Layers className="w-3 h-3 text-amber-300" />
              <span>Category Sector Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{category}</h2>
            <p className="text-xs text-emerald-200 font-medium">
              {wardName || 'Local Ward'} &bull; Detailed Citizen Demand Profile
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
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Ward Demand Share</span>
              <span className="text-2xl font-black text-emerald-950 block mt-0.5">{share}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Priority Level</span>
              <span className="text-xl font-black text-rose-900 block mt-1">{displayUrgency} Priority</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Resolution Status</span>
              <span className="text-sm font-black text-[#002B49] block mt-1">
                {pendingPct}% Pending / {resolvedPct}% Actioned
              </span>
            </div>
          </div>

          {/* Real AI Sector Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-wider text-[#002B49]">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>Ward Collective AI Demand Summary</span>
            </div>
            {isLoadingAi ? (
              <div className="flex items-center space-x-2 text-xs text-slate-600 py-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9933] animate-spin" />
                <span>Synthesizing Gemini AI summary from citizen requests...</span>
              </div>
            ) : aiData?.error ? (
              <p className="text-xs text-slate-500 font-medium italic">
                {aiData.error}
              </p>
            ) : aiData?.message ? (
              <p className="text-xs text-slate-500 font-medium italic">
                {aiData.message}
              </p>
            ) : aiData?.summary ? (
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                {aiData.summary}
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium italic">
                {totalCategoryRequests === 0 ? 'No citizen requests found for this selection.' : 'AI summary temporarily unavailable. Please try again.'}
              </p>
            )}
          </div>

          {/* Major Recurring Issues */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Major Recurring Issues & Themes
            </h4>
            <div className="space-y-2">
              {displayIssues.length > 0 ? (
                displayIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 font-medium flex items-start space-x-2.5 shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      &bull;
                    </span>
                    <span className="leading-relaxed">{issue}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No specific issues logged.</p>
              )}
            </div>
          </div>

          {/* Hotspot Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>Hotspot Areas within Ward</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {hotspotAreas.map((area, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>{area}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Administrative Intelligence</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
