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
  Database
} from 'lucide-react';

export default function RequestDetailModal({ request, onClose }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#002B49] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-extrabold text-base tracking-wide bg-white/10 px-2.5 py-1 rounded-md border border-white/20">
              {request.request_code || `REQ-${request.id}`}
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
          {/* Data Integrity Banner if Synthetic */}
          {request.is_synthetic && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <b>Data Integrity Notice:</b> This record is part of the <b>Synthetic Demonstration Dataset</b> for prototype verification.
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
                <span>{request.language || 'Unknown'}</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Category</span>
              <span className="font-bold text-xs text-slate-800 truncate block">
                {request.category}
              </span>
            </div>
          </div>

          {/* Issue Title */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Classified Development Issue
            </span>
            <h3 className="font-bold text-base text-slate-900">
              {request.issue}
            </h3>
          </div>

          {/* AI Executive Summary */}
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/50 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Executive AI Intelligence Summary (Google Gemini)</span>
            </div>
            <p className="text-slate-800 text-sm leading-relaxed font-medium">
              {request.ai_summary}
            </p>
          </div>

          {/* Original Citizen Input */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Original Citizen Feedback (Preserved Unaltered)</span>
            </div>
            <p className="text-slate-800 font-indic text-sm bg-white p-3 rounded-lg border border-slate-200 leading-relaxed italic">
              &ldquo;{request.original_text}&rdquo;
            </p>
          </div>

          {/* Demographic & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-600 font-bold mb-1">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Affected Population Group</span>
              </div>
              <p className="font-semibold text-slate-800">
                {request.affected_group || 'General public'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-600 font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Geographic Location</span>
              </div>
              <p className="font-semibold text-slate-800 truncate">
                {request.location_details || (request.latitude ? `${request.latitude}, ${request.longitude}` : 'Not Specified')}
              </p>
              {request.latitude && request.longitude && (
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  GPS: {request.latitude}, {request.longitude}
                </span>
              )}
            </div>
          </div>

          {/* Problem Incident Location (if present) */}
          {(request.problem_address || request.problemAddress || request.problem_latitude) && (
            <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-rose-900 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>Problem Incident Location:</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  {(request.problem_location_source || request.problemLocationSource) === 'map_selected' ? '🗺️ Marked on Map' : '📍 Current Location'}
                </span>
              </div>
              <p className="font-bold text-slate-900">
                📍 {request.problem_address || request.problemAddress}
              </p>
            </div>
          )}

          {/* Official Field Team Completion Report if Completed */}
          {request.status === 'Completed' && (
            <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-emerald-950 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="uppercase text-[11px] font-black">Official Work Completion Report</span>
                </div>
                {request.completed_at && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Resolved: {new Date(request.completed_at).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>

              {request.assigned_team_name && (
                <p className="text-[11px] font-bold text-slate-700">
                  Restoration Squad: <span className="font-extrabold text-[#002B49]">{request.assigned_team_name}</span>
                </p>
              )}

              {/* Side-by-Side Before & After Photos */}
              {(request.before_photo_url || request.after_photo_url) && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                      Before Work
                    </span>
                    {request.before_photo_url ? (
                      <img
                        src={request.before_photo_url}
                        alt="Before Repair"
                        className="h-28 w-full object-cover rounded-xl border border-slate-300"
                      />
                    ) : (
                      <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block mb-1">
                      After Completion
                    </span>
                    {request.after_photo_url ? (
                      <img
                        src={request.after_photo_url}
                        alt="After Repair"
                        className="h-28 w-full object-cover rounded-xl border border-emerald-400 shadow-xs"
                      />
                    ) : (
                      <div className="h-28 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completion Note */}
              {request.completion_notes && (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                  <span className="font-bold text-emerald-900 block text-[10px] uppercase">
                    Squad Completion Note:
                  </span>
                  <p className="font-medium leading-relaxed">
                    {request.completion_notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submission Timestamp */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on: {new Date(request.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
