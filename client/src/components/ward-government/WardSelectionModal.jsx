import React from 'react';
import { CheckCircle2, Ban, X } from 'lucide-react';

export default function WardSelectionModal({
  selectionModal,
  rawRequests,
  selectedRequestIds,
  setSelectedRequestIds,
  isPendingStatus,
  onClose,
  onProceedToConfirm
}) {
  if (!selectionModal) return null;

  const eligibleList = rawRequests.filter(
    (r) => r.category === selectionModal.category && isPendingStatus(r.status)
  );
  const allSelected = eligibleList.length > 0 && selectedRequestIds.length === eligibleList.length;
  const someSelected = selectedRequestIds.length > 0 && selectedRequestIds.length < eligibleList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            {selectionModal.mode === 'approve' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <Ban className="w-6 h-6 text-rose-600" />
            )}
            <div>
              <h3 className="font-black text-lg text-[#002B49]">
                {selectionModal.mode === 'approve' ? 'Approve Requests' : 'Reject Requests'} — {selectionModal.category}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Showing {eligibleList.length} eligible pending citizen requests
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selection Toolbar */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex-shrink-0">
          <label className="flex items-center space-x-2.5 font-bold text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={() => {
                if (allSelected) {
                  setSelectedRequestIds([]);
                } else {
                  setSelectedRequestIds(eligibleList.map((r) => r.id));
                }
              }}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-700"
            />
            <span>Select All</span>
          </label>

          <span className="font-extrabold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-[11px]">
            {selectedRequestIds.length} of {eligibleList.length} requests selected
          </span>
        </div>

        {/* Scrollable Request Items */}
        {eligibleList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-1">
            <p className="font-bold text-slate-700">No pending requests available</p>
            <p className="text-slate-400">All requests in {selectionModal.category} have already been processed.</p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[46vh] pr-1 scrollbar-thin">
            {eligibleList.map((stmt) => {
              const isSelected = selectedRequestIds.includes(stmt.id);
              const reqCode = stmt.request_code || `REQ-${String(stmt.id).padStart(4, '0')}`;

              return (
                <div
                  key={stmt.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedRequestIds(selectedRequestIds.filter((id) => id !== stmt.id));
                    } else {
                      setSelectedRequestIds([...selectedRequestIds, stmt.id]);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 select-none ${
                    isSelected
                      ? selectionModal.mode === 'approve'
                        ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // toggled by card click
                        className={`w-4 h-4 mt-0.5 rounded cursor-pointer ${
                          selectionModal.mode === 'approve'
                            ? 'accent-emerald-700'
                            : 'accent-rose-700'
                        }`}
                      />
                      <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] border border-slate-200">
                        {reqCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          (stmt.request_type || '').toLowerCase() === 'complaint'
                            ? 'bg-rose-100 text-rose-900 border border-rose-200'
                            : 'bg-blue-100 text-blue-900 border border-blue-200'
                        }`}
                      >
                        {(stmt.request_type || '').toLowerCase() === 'complaint' ? '⚠️ Complaint' : '🏗️ Demand'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {stmt.original_language || stmt.language || 'English'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stmt.urgency === 'High' || stmt.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {stmt.urgency || 'Medium'} Urgency
                      </span>
                    </div>
                  </div>

                  <blockquote className="font-bold text-[#002B49] text-xs leading-snug pl-6">
                    &ldquo;{stmt.original_text || stmt.issue}&rdquo;
                  </blockquote>

                  <div className="flex flex-wrap items-center justify-between gap-1 pl-6 pt-1 text-[10px] text-slate-500 border-t border-slate-100">
                    <span>📁 Sector: {stmt.category}</span>
                    <span>📍 Location: {stmt.location_details || stmt.village || 'Ward Local Area'}</span>
                    <span>📅 Date: {stmt.created_at ? new Date(stmt.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
          >
            Cancel
          </button>

          {selectionModal.mode === 'approve' ? (
            <button
              type="button"
              disabled={selectedRequestIds.length === 0}
              onClick={() => onProceedToConfirm('approve')}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Approve Selected ({selectedRequestIds.length})</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={selectedRequestIds.length === 0}
              onClick={() => onProceedToConfirm('reject')}
              className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Ban className="w-4 h-4 text-rose-200" />
              <span>Reject Selected ({selectedRequestIds.length})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
