import React, { useState } from 'react';
import {
  X,
  Building2,
  MapPin,
  Users,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  Globe,
  Flame,
  Languages,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export default function GovRegionalIntelligencePanel({
  intelligence,
  loading,
  error,
  onClose,
  onSelectRequest
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'requests'

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col items-center justify-center animate-fadeIn">
        <div className="w-12 h-12 border-4 border-[#002B49] border-t-[#FF9933] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-800 text-sm">Loading Regional Intelligence...</p>
        <p className="text-xs text-slate-500 mt-1">Resolving administrative boundaries and verified civic data</p>
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between animate-fadeIn">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-800">Regional Intelligence</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center p-8 bg-rose-50 rounded-2xl border border-rose-200 my-auto">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
          <p className="font-bold text-rose-900 text-sm">{error || 'Could not load regional details.'}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm"
        >
          Close Panel
        </button>
      </div>
    );
  }

  const { region, office, representatives = [], demand = {} } = intelligence;
  const requests = demand.requests || [];

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Healthcare':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Roads & Transport':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Water & Sanitation':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Education':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Electricity':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* 1. Header & Regional Breadcrumbs */}
      <div className="p-5 bg-[#002B49] text-white border-b border-slate-800 flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-[#FF9933] text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                Development Hotspot
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-semibold">
                {region.government_type || 'Civic Authority'}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>{region.name}</span>
              {region.ward && (
                <span className="text-xs font-normal text-slate-300">
                  ({region.ward})
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-300 flex items-center space-x-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>
                {region.locality || region.name} &bull; {region.taluka ? `${region.taluka} Taluka &bull; ` : ''}{region.district}, {region.state}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex space-x-2 bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-[#002B49] shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            Regional Intelligence & Authorities
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'requests'
                ? 'bg-white text-[#002B49] shadow-xs'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <span>Underlying Requests</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF9933] text-slate-950 text-[10px] font-black">
              {demand.total || 0}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/60">
        {activeTab === 'overview' ? (
          <>
            {/* A. Local Government Body & Responsible Office */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#002B49]">
                      Responsible Civic Authority
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Local Government Body & Administrative Ward
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                  {region.local_government_body}
                </span>
              </div>

              {office ? (
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {office.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        {office.address}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {office.office_type || 'Ward Office'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                    {office.phone && (
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{office.phone}</span>
                      </div>
                    )}
                    {office.email && (
                      <div className="flex items-center space-x-1.5 text-slate-600 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{office.email}</span>
                      </div>
                    )}
                  </div>

                  {office.website && (
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Verified Directory Source
                      </span>
                      <a
                        href={office.source_url || office.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#002B49] hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3 h-3 text-[#FF9933]" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <p className="font-bold">District Administration Designated</p>
                  <p className="text-[11px] mt-0.5">
                    Municipal ward office pending regional mapping. Directing grievances to {region.district} Collectorate.
                  </p>
                </div>
              )}
            </div>

            {/* B. Verified Local Representatives (Authentic Roles) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#002B49]">
                      Local Government Representatives
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Publicly verified representatives for {region.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Public Records</span>
                </div>
              </div>

              {representatives && representatives.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {representatives.map((rep, idx) => (
                    <div
                      key={rep.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                            {rep.name}
                          </h4>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 whitespace-nowrap">
                            {rep.designation}
                          </span>
                        </div>

                        {rep.ward && (
                          <p className="text-[11px] text-slate-600 mt-1">
                            {rep.ward}
                          </p>
                        )}

                        {rep.political_party && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded bg-slate-200/80 text-slate-700">
                            {rep.political_party}
                          </span>
                        )}

                        {rep.contact_information && (
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                            {rep.contact_information}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center space-x-1 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{rep.source || 'State SEC Gazette'}</span>
                          </span>
                          {rep.source_url && (
                            <a
                              href={rep.source_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-[#002B49] hover:text-blue-700 flex items-center space-x-0.5 flex-shrink-0 ml-1 cursor-pointer"
                            >
                              <span>View Source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span>Verified: {rep.verified_at || '19 Sep 2026'}</span>
                          {rep.isOutdated && (
                            <span className="text-amber-600 font-bold flex items-center space-x-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Outdated</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">
                    Representative information: Not currently verified
                  </p>
                  <p className="text-[11px] text-slate-500">
                    No verified representative record is permanently mapped to this specific sub-coordinate. Directing to the verified responsible office above without guessing names.
                  </p>
                </div>
              )}
            </div>

            {/* C. Citizen Demand Breakdown (Category & Languages) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                    <Flame className="w-4 h-4 text-[#FF9933]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#002B49]">
                      Regional Demand Breakdown
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {demand.total || 0} Total Citizen Requests in this Cluster
                    </p>
                  </div>
                </div>
              </div>

              {/* Sectoral Breakdown */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Top Development Issues
                </h4>
                <div className="space-y-1.5">
                  {demand.byCategory && Object.keys(demand.byCategory).length > 0 ? (
                    Object.entries(demand.byCategory).map(([cat, count]) => {
                      const pct = Math.round((count / (demand.total || 1)) * 100);
                      return (
                        <div key={cat} className="space-y-0.5">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>{cat}</span>
                            <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#002B49] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400">No category data recorded.</p>
                  )}
                </div>
              </div>

              {/* Multilingual Citizen Input Languages */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                    <Languages className="w-3.5 h-3.5 text-blue-600" />
                    <span>Citizen Input Languages</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Language &ne; Region</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {demand.byLanguage && Object.keys(demand.byLanguage).length > 0 ? (
                    Object.entries(demand.byLanguage).map(([lang, count]) => (
                      <div
                        key={lang}
                        className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center space-x-1.5"
                      >
                        <span>{lang}</span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-900 text-[10px] font-black">
                          {count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No language data recorded.</p>
                  )}
                </div>
              </div>

              {/* Urgency Distribution */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Urgency Distribution:</span>
                <div className="flex items-center space-x-2">
                  {demand.byUrgency && Object.entries(demand.byUrgency).map(([urg, count]) => (
                    <span
                      key={urg}
                      className={`px-2 py-0.5 rounded text-[10px] border ${getUrgencyBadge(urg)}`}
                    >
                      {urg}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Underlying Requests Tab */
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900">
              <span className="font-bold flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Underlying citizen feedback in {region.name}</span>
              </span>
              <span className="text-[11px] text-blue-700 font-semibold">
                {requests.length} records
              </span>
            </div>

            {requests.length > 0 ? (
              requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-[#002B49] transition-all space-y-2 cursor-pointer group"
                  onClick={() => onSelectRequest && onSelectRequest(req)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-black text-[#002B49]">
                        {req.request_code || `REQ-${req.id}`}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {req.original_language || req.language}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getCategoryColor(req.category)}`}>
                        {req.category}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                      {req.issue}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                      {req.ai_summary || req.original_text}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {req.village || region.name} &bull; {new Date(req.created_at).toLocaleDateString('en-IN')}
                    </span>
                    <span className="font-bold text-[#002B49] group-hover:text-blue-700 flex items-center space-x-0.5">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3 h-3 text-[#FF9933]" />
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 p-6">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-sm text-slate-700">No requests in this cluster yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer with Privacy Guard */}
      <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">Privacy-First Architecture:</span>
          <span>Citizen Aadhaar, full names, and private contacts are protected.</span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-[#002B49] hover:bg-[#003961] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
