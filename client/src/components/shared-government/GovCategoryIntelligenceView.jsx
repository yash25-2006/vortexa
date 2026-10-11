import React from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  TrendingUp,
  FileText,
  ChevronRight,
  Sparkles,
  Info,
  BarChart3,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function GovCategoryIntelligenceView({
  activeState = 'Maharashtra',
  selectedCategory = 'Healthcare',
  requests = [],
  onBack,
  onSelectDistrict
}) {
  // Filter all requests in this state matching the selected category
  const categoryRequests = requests.filter(
    (r) => r.category && r.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  const total = categoryRequests.length;

  // Group by district to compute district demand comparison percentages and extract unique demand topics
  const districtCounts = {};
  const districtDemandTopics = {};

  categoryRequests.forEach((r) => {
    const dist = r.district || 'Unassigned District';
    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
    if (!districtDemandTopics[dist]) {
      districtDemandTopics[dist] = new Set();
    }
    // Extract unique issue / demand summary topics
    if (r.issue) {
      districtDemandTopics[dist].add(r.issue);
    }
  });

  const sortedDistricts = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-7 space-y-6 animate-fadeIn">
      {/* Top Navigation Bar & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#002B49]" />
            <span>Back to {activeState} Overview</span>
          </button>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>🇮🇳 India</span>
            <span>&rsaquo;</span>
            <span>🏛️ {activeState}</span>
            <span>&rsaquo;</span>
            <span className="font-bold text-[#002B49]">📊 {selectedCategory} Demand</span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-900 font-extrabold text-xs border border-blue-200">
          {total} Total Demands in {activeState}
        </span>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#002B49] tracking-tight">
          {selectedCategory} Demand — {activeState}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Comparative district breakdown and specific citizen demand themes in {selectedCategory.toLowerCase()}.
        </p>
      </div>

      {/* 2-Column Layout: District Demand Comparison (Left) + Specific Citizen Demands (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Column: District Demand Comparison Bars (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#002B49] flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-blue-700" />
              <span>{selectedCategory} Demand by District</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-medium">Share %</span>
          </div>

          <div className="space-y-3">
            {sortedDistricts.length > 0 ? (
              sortedDistricts.map(([district, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={district}
                    onClick={() => onSelectDistrict && onSelectDistrict(district)}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200 hover:border-[#002B49] transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 group-hover:text-blue-950 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9933]" />
                        <span>{district}</span>
                      </span>
                      <span className="text-[#002B49] font-black">
                        {count} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#002B49] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400">No requests recorded for this category.</p>
            )}
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span>
              This is an analytical comparison of citizen demand volume across districts to inform evidence-based resource allocation.
            </span>
          </div>
        </div>

        {/* Right Column: What Exactly Are Citizens Requesting by District? (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[#002B49] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#FF9933]" />
              <span>What Exactly Are Citizens Requesting?</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Aggregated Themes by District
            </span>
          </div>

          <div className="space-y-4">
            {sortedDistricts.map(([district, count]) => {
              const topics = Array.from(districtDemandTopics[district] || []);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={district} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#002B49]" />
                      <h4 className="text-xs font-black text-slate-900">
                        {district} District ({count} demands &bull; {pct}%)
                      </h4>
                    </div>
                    <button
                      onClick={() => onSelectDistrict && onSelectDistrict(district)}
                      className="text-[11px] font-bold text-[#002B49] hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Inspect District Summary</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Aggregated Demand Topics Bullet Points */}
                  <div className="space-y-1.5 pl-1">
                    {topics.length > 0 ? (
                      topics.map((topic, i) => (
                        <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#002B49] mt-1.5 flex-shrink-0"></span>
                          <span className="font-semibold text-slate-800">{topic}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">General {selectedCategory} infrastructure requirements.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center space-x-2 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>Aggregated Demand Intelligence:</strong> Displays high-level community demand patterns without exposing individual citizen profiles or complaints.
        </span>
      </div>
    </div>
  );
}
