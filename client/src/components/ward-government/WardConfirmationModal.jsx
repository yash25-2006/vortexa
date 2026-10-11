import React from 'react';
import { CheckCircle2, AlertTriangle, CheckCheck, X, AlertCircle } from 'lucide-react';

export default function WardConfirmationModal({
  confirmationModal,
  wardName,
  rejectionReasonInput,
  setRejectionReasonInput,
  actionError,
  isSubmittingAction,
  onClose,
  onConfirm
}) {
  if (!confirmationModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            {confirmationModal.mode === 'approve' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {confirmationModal.mode === 'reject' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            {confirmationModal.mode === 'complete' && <CheckCheck className="w-5 h-5 text-emerald-600" />}
            <h3 className="font-black text-lg text-[#002B49]">
              {confirmationModal.mode === 'approve' && 'Confirm Approval'}
              {confirmationModal.mode === 'reject' && 'Rejection Reason'}
              {confirmationModal.mode === 'complete' && 'Mark Category Completed'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {confirmationModal.mode === 'approve' && (
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                Approve <strong className="text-emerald-900 font-black">{confirmationModal.count}</strong> selected <strong className="text-[#002B49]">{confirmationModal.category}</strong> request(s)?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This will advance only the selected requests to the <strong>Approved</strong> stage for execution in {wardName}. Unselected requests will remain Pending.
              </p>
            </div>
          )}

          {confirmationModal.mode === 'complete' && (
            <div className="space-y-2 text-xs sm:text-sm text-slate-600">
              <p>
                Mark all <strong className="text-emerald-900 font-black">{confirmationModal.count}</strong> approved request(s) in <strong className="text-[#002B49]">{confirmationModal.category}</strong> as <strong className="text-emerald-800">Completed</strong>?
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                This will record the completion timestamp and mark the civic works in this sector as fulfilled.
              </p>
            </div>
          )}

          {confirmationModal.mode === 'reject' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-600">
                You are rejecting <strong className="text-rose-800 font-black">{confirmationModal.count}</strong> selected request(s) in <strong className="text-[#002B49]">{confirmationModal.category}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Reason for Rejection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g., Requested facility already exists within the service area / Covered under municipal road tender"
                  className="w-full p-3 rounded-2xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-xs text-slate-800 outline-none transition-all resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 font-medium">
                  This explanation will be recorded against every selected rejected request.
                </p>
              </div>
            </div>
          )}

          {actionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmittingAction}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmittingAction}
            className={`px-5 py-2 rounded-xl text-white font-black text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer ${
              confirmationModal.mode === 'approve'
                ? 'bg-emerald-800 hover:bg-emerald-900'
                : confirmationModal.mode === 'reject'
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-emerald-700 hover:bg-emerald-800'
            } disabled:opacity-50`}
          >
            {isSubmittingAction ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <span>
                {confirmationModal.mode === 'approve' && 'Confirm Approval'}
                {confirmationModal.mode === 'reject' && 'Confirm Rejection'}
                {confirmationModal.mode === 'complete' && 'Mark Completed'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
