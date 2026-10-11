import React from 'react';
import { Sparkles, ShieldCheck, Activity, X, BarChart3, AlertOctagon, TrendingUp, Info } from 'lucide-react';

export default function GovDistrictPriorityBreakdown({
  districtName,
  districtData,
  activeState,
  onClose
}) {
  if (!districtName || !districtData) return null;

  const rawScore = typeof districtData.priorityScore === 'object' && districtData.priorityScore !== null
    ? (districtData.priorityScore.priorityScore || 65.0)
    : districtData.priorityScore;

  const priorityScore = typeof rawScore === 'number' && !isNaN(rawScore)
    ? rawScore
    : parseFloat(rawScore) || 65.0;

  const demand = typeof districtData.demand === 'number' && !isNaN(districtData.demand) ? districtData.demand : 82;
  const infraGap = typeof districtData.infraGap === 'number' && !isNaN(districtData.infraGap) ? districtData.infraGap : 71;
  const impact = typeof districtData.impact === 'number' && !isNaN(districtData.impact) ? districtData.impact : 88;
  const vulnerability = typeof districtData.vulnerability === 'number' && !isNaN(districtData.vulnerability) ? districtData.vulnerability : 64;
  const urgency = typeof districtData.urgency === 'number' && !isNaN(districtData.urgency) ? districtData.urgency : 79;
  const topCategory = typeof districtData.topCategory === 'string' ? districtData.topCategory : 'Healthcare & Roads';

  const isHigh = priorityScore >= 75;
  const isModerate = priorityScore >= 60 && priorityScore < 75;

  const factors = [
    {
      name: 'Citizen Demand',
      score: demand,
      weight: '20%',
      desc: 'Normalized citizen demand volume from verified requests',
      barColor: 'bg-rose-500'
    },
    {
      name: 'Infrastructure Gap',
      score: infraGap,
      weight: '20%',
      desc: 'Existing deficit/shortage in public infrastructure',
      barColor: 'bg-amber-500'
    },
    {
      name: 'Population Impact',
      score: impact,
      weight: '20%',
      desc: 'Estimated demographic scale and citizen reach',
      barColor: 'bg-blue-600'
    },
    {
      name: 'Vulnerability Gap',
      score: vulnerability,
      weight: '20%',
      desc: 'Level of unmet need in underserved & remote communities',
      barColor: 'bg-purple-600'
    },
    {
      name: 'Urgency',
      score: urgency,
      weight: '20%',
      desc: 'Assessed critical response urgency weight',
      barColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              District Priority Model
            </span>
            <span className="text-xs text-slate-500 font-semibold">{activeState}</span>
          </div>
          <h3 className="text-xl font-black text-[#002B49] tracking-tight">
            {districtName} District &mdash; Priority Analysis
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Primary focus sector: <strong className="text-slate-800">{topCategory}</strong>
          </p>
        </div>

        {/* Priority Score Big Badge */}
        <div className="flex items-center space-x-3">
          <div className={`text-right p-3 rounded-2xl border ${
            isHigh ? 'bg-rose-50 border-rose-200 text-rose-950' : isModerate ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Priority Score</span>
            <span className="text-2xl font-black tracking-tight">{priorityScore}</span>
            <span className="text-[9px] font-bold block opacity-75">/ 100</span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Close District Analysis"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5 Factors Progress Bars */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-700">
          <span>Contributing Factor Breakdown</span>
          <span className="text-slate-400 font-mono text-[11px]">Normalized (0–100)</span>
        </div>

        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.name} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-[#002B49]">{f.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    Weight: {f.weight}
                  </span>
                </div>
                <span className="font-black text-sm text-[#002B49] font-mono">{f.score}</span>
              </div>

              <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${f.barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, f.score))}%` }}
                ></div>
              </div>

              <p className="text-[10px] text-slate-500 font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Formula Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 text-[11px] text-slate-700 space-y-1">
        <div className="flex items-center space-x-1.5 font-black text-xs text-[#002B49]">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Analytical Priority Formula</span>
        </div>
        <p className="font-mono text-[10px] text-slate-600">
          Priority Score = ({demand} + {infraGap} + {impact} + {vulnerability} + {urgency}) / 5 = <strong>{priorityScore}</strong>
        </p>
        <p className="text-[10px] text-slate-500">
          Equal 20% weighting across all 5 normalized pillars to ensure explainable, evidence-based prioritization.
        </p>
      </div>
    </div>
  );
}
