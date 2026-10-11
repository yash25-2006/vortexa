import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  CheckCircle2,
  Inbox,
  Clock,
  Zap,
  Activity,
  Award,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';
import { fetchGovernmentPerformance } from '../../services/api';

export default function CitizenPerformanceModal({ language = 'en', onClose }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [perfData, setPerfData] = useState(null);

  const loadData = async (selectedPeriod) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGovernmentPerformance({ period: selectedPeriod });
      setPerfData(data);
    } catch (err) {
      console.error('Failed to load performance metrics:', err);
      setError(err.message || 'Failed to load government performance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  const periods = [
    { key: '30d', label: t.period30d || 'Last 30 Days' },
    { key: '6m', label: t.period6m || 'Last 6 Months' },
    { key: '1y', label: t.period1y || 'This Year' },
    { key: 'all', label: t.periodAll || 'All Time' }
  ];

  const total = perfData?.totalReceived ?? 0;
  const resolved = perfData?.totalResolved ?? 0;
  const resolutionRate = perfData?.resolutionRate ?? 0;
  const avgResponse = perfData?.avgResponseDays ?? '1.8 days';
  const avgResolution = perfData?.avgResolutionDays ?? '0 days';
  const fastest = perfData?.fastestResolution ?? '0 days';
  const within7Rate = perfData?.resolvedWithin7DaysRate ?? 0;
  const sectors = perfData?.bySector ?? [];
  const speedBuckets = [
    { label: '< 24 hours', count: perfData?.speedBreakdown?.within24h?.count || 0, percentage: perfData?.speedBreakdown?.within24h?.percentage || 0 },
    { label: '1–3 days', count: perfData?.speedBreakdown?.days1to3?.count || 0, percentage: perfData?.speedBreakdown?.days1to3?.percentage || 0 },
    { label: '4–7 days', count: perfData?.speedBreakdown?.days4to7?.count || 0, percentage: perfData?.speedBreakdown?.days4to7?.percentage || 0 },
    { label: '8–30 days', count: perfData?.speedBreakdown?.days8to30?.count || 0, percentage: perfData?.speedBreakdown?.days8to30?.percentage || 0 },
    { label: '30+ days', count: perfData?.speedBreakdown?.days30plus?.count || 0, percentage: perfData?.speedBreakdown?.days30plus?.percentage || 0 }
  ];
  const dynamicSummary = perfData?.dynamicSummary || '';
  const hasEnoughData = perfData?.hasEnoughData !== false && total > 0;

  // Helper for Circular SVG progress ring
  const renderProgressRing = (percentage, size = 110, stroke = 10, colorClass = 'text-emerald-500') => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="text-slate-100"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
          />
          {/* Foreground circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} transition-all duration-1000 ease-out`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-black text-slate-900 leading-none">
            {hasEnoughData ? `${percentage}%` : '--'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#002B49] text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Award className="w-5 h-5 text-[#FF9933]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight font-indic flex items-center space-x-2">
                <span>{t.performanceTitle || 'Government Performance & Transparency'}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 font-indic">
                {t.performanceSubtitle || 'Real-time track record of citizen request resolutions and civic improvements'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={t.closeBtn || 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Period Filter Bar */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t.timePeriod || 'Time Period'}:
            </span>
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {periods.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    period === p.key
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadData(period)}
            disabled={loading}
            className="text-xs font-bold text-slate-600 hover:text-[#002B49] flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{t.refreshLocation || 'Refresh'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-[#002B49]" />
              <p className="text-sm font-bold font-indic">{t.loading || 'Loading performance data...'}</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : !hasEnoughData ? (
            <div className="py-16 text-center space-y-3 bg-slate-50 rounded-3xl border border-slate-200 p-8">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">
                {t.notEnoughData || 'Not enough data yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No civic submissions recorded for this time period yet. As citizens submit demands and complaints, real-time performance analytics will automatically compute here.
              </p>
            </div>
          ) : (
            <>
              {/* Section 1: Top Hero Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Requests Received */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      {t.requestsReceived || 'Requests Received'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{total}</p>
                  <p className="text-[11px] text-blue-800/80 font-medium">
                    Citizens engaging for development
                  </p>
                </div>

                {/* 2. Problems Solved */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                      {t.problemsSolved || 'Problems Solved'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-emerald-700">{resolved}</p>
                  <p className="text-[11px] text-emerald-800/80 font-medium">
                    Works completed on ground
                  </p>
                </div>

                {/* 3. Average Resolution Time */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      {t.avgResolutionTime || 'Avg Resolution Time'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">
                    {avgResolution}
                  </p>
                  <p className="text-[11px] text-amber-800/80 font-medium">
                    From receipt to completion
                  </p>
                </div>

                {/* 4. Fastest Resolution */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-2xl p-4.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      {t.fastestResolution || 'Fastest Resolution'}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-purple-950">
                    {fastest}
                  </p>
                  <p className="text-[11px] text-purple-800/80 font-medium">
                    Rapid civic response
                  </p>
                </div>
              </div>

              {/* Section 2: Ring Visualizations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Ring 1: Overall Resolution Rate */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center space-x-6">
                  {renderProgressRing(resolutionRate, 100, 9, 'text-emerald-600')}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {t.resolutionRate || 'Resolution Rate'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-indic">
                      {resolutionRate}% of all submitted issues solved
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-indic">
                      {resolved} out of {total} community requests have been resolved by the civic administration.
                    </p>
                  </div>
                </div>

                {/* Ring 2: 7-Day Resolution Rate */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center space-x-6">
                  {renderProgressRing(within7Rate, 100, 9, 'text-blue-600')}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {t.resolvedWithin7Days || 'Turnaround in ≤ 7 Days'}
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-indic">
                      {within7Rate}% resolved in under a week
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-indic">
                      High-priority and emergency matters addressed swiftly by on-ground field officers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Sector Performance Breakdown */}
              {sectors.length > 0 && (
                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-[#002B49]" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-indic">
                        {t.sectorPerformance || 'Development Sector Performance'}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Received vs Resolved
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {sectors.map((sec) => (
                      <div key={sec.sector} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{sec.sector}</span>
                          <span className="font-medium text-slate-500">
                            <strong className="text-emerald-700">{sec.resolved}</strong> / {sec.received} resolved ({sec.resolutionRate}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#002B49] h-full rounded-full transition-all duration-500"
                            style={{ width: `${sec.resolutionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 4: Resolution Speed Breakdown */}
              {speedBuckets.length > 0 && (
                <div className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-indic">
                      {t.resolutionSpeed || 'Resolution Speed Breakdown'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {speedBuckets.map((bucket) => (
                      <div
                        key={bucket.label}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1"
                      >
                        <span className="text-[11px] font-bold text-slate-600 block">{bucket.label}</span>
                        <p className="text-lg font-black text-slate-900">{bucket.count}</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                          {bucket.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Transparency & Accountability Statement */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-[#002B49] text-white space-y-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    {t.transparencySection || 'How Are We Performing?'}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-indic leading-relaxed">
                  {dynamicSummary ||
                    'All performance numbers are derived directly from verified citizen submissions and government actions in the database.'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Live database verification &bull; Real-time civic transparency
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {t.closeBtn || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
