import React from 'react';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  FileText,
  Languages,
  Database,
  Mic,
  Tag,
  ShieldAlert
} from 'lucide-react';

export default function GovRequestDetailModal({ request, onClose }) {
  if (!request) return null;

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Low':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const originalText = request.original_text || request.originalText;
  const aiSummary = request.ai_summary || request.aiSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-base tracking-wide bg-white/10 px-2.5 py-1 rounded-md border border-white/20 font-mono">
              {request.request_code || request.requestCode || `REQ-${request.id}`}
            </span>
            <span className="text-sm font-semibold text-slate-200 truncate max-w-xs">
              {request.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Data Integrity Notice */}
          {request.is_synthetic && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <b>Data Notice:</b> This record is part of the <b>Synthetic Demonstration Dataset</b> for prototype verification.
              </span>
            </div>
          )}

          {/* Key Attributes Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Status</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>{request.status || 'New'}</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Urgency</span>
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold border ${getUrgencyBadge(request.urgency)}`}>
                {request.urgency}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Language</span>
              <span className="inline-flex items-center space-x-1 font-bold text-xs text-slate-800">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>{request.language || request.original_language || 'Unknown'}</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Input Type</span>
              <span className="inline-flex items-center space-x-1 font-bold text-xs text-slate-800">
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span className="capitalize">{request.input_type || request.inputType || 'Text'}</span>
              </span>
            </div>
          </div>

          {/* Original Citizen Message (Unaltered Preservation) */}
          <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Original Citizen Message (Preserved in Native Script)</span>
              </div>
              <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                {request.language || 'Native'}
              </span>
            </div>
            <p className="text-slate-900 font-indic text-base bg-white p-3.5 rounded-lg border border-slate-200 leading-relaxed italic shadow-2xs">
              &ldquo;{originalText}&rdquo;
            </p>
          </div>

          {/* AI Semantic Intelligence Breakdown */}
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-blue-950 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Google Gemini Semantic Classification</span>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                AI-Assisted Intelligence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                <span className="text-slate-500 font-medium block">Sectoral Category</span>
                <span className="font-bold text-slate-900">{request.category}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                <span className="text-slate-500 font-medium block">Issue Type Code</span>
                <span className="font-mono font-bold text-slate-800">{request.issue_type || request.issueType || 'civic_need'}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-blue-200 text-xs">
              <span className="text-slate-500 font-semibold block mb-1">Executive English AI Summary</span>
              <p className="text-slate-800 text-sm leading-relaxed font-medium">
                {aiSummary}
              </p>
            </div>
          </div>

          {/* Geographic & Demographic Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-600 font-bold mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Affected Demographic</span>
              </div>
              <p className="font-semibold text-slate-800">
                {request.affected_group || 'Local community'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-600 font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Citizen Registered Location</span>
              </div>
              <p className="font-semibold text-slate-800 truncate">
                {request.district}, {request.state}
              </p>
              {request.latitude && request.longitude && (
                <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                  GPS: {request.latitude}, {request.longitude}
                </span>
              )}
            </div>
          </div>

          {/* Problem Location (if recorded) */}
          {(request.problem_address || request.problemAddress || request.problem_latitude || request.problemLatitude) && (
            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-rose-950">
                  <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Problem Incident Location (Reported):</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                  {(request.problem_location_source || request.problemLocationSource) === 'map_selected' ? '🗺️ Marked on Map' : '📍 Current GPS Location'}
                </span>
              </div>
              <p className="font-bold text-slate-900 leading-snug">
                📍 {request.problem_address || request.problemAddress || 'Incident Coordinates Recorded'}
              </p>
              {(request.problem_latitude || request.problemLatitude) && (
                <span className="text-[11px] text-slate-500 font-mono block">
                  Incident GPS: {request.problem_latitude || request.problemLatitude}, {request.problem_longitude || request.problemLongitude}
                </span>
              )}
            </div>
          )}

          {/* Submission Timestamp */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on: {new Date(request.created_at || request.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
