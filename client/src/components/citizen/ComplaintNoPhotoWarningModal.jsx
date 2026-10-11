import React from 'react';
import { AlertTriangle, ShieldAlert, X, Check, ArrowRight } from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';

export default function ComplaintNoPhotoWarningModal({
  language = 'en',
  onConfirm,
  onCancel
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-2 border-amber-400 space-y-5 animate-scaleUp">
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                {t.civicNoticeLabel || 'Official Civic Advisory'}
              </span>
              <h3 className="text-lg font-black text-[#002B49] tracking-tight mt-0.5 font-indic">
                {t.noPhotoWarningTitle || 'Submitting Complaint Without Photo Evidence'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Advisory Body */}
        <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed font-indic bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <p className="font-semibold text-slate-900">
            {t.noPhotoWarningP1 || 'You are submitting this complaint without photographic evidence.'}
          </p>

          <p className="text-slate-700">
            {t.noPhotoWarningP2 || 'An authorized person may visit the reported location to verify the complaint. If the complaint is found to be false, misleading, or intentionally submitted without a genuine issue, appropriate action may be taken according to applicable rules.'}
          </p>

          <p className="text-amber-950 font-bold bg-white/80 p-2.5 rounded-xl border border-amber-300/80 text-[11px] sm:text-xs">
            ⚠️ {t.noPhotoWarningP3 || 'This may include restriction or suspension of your account and/or a penalty or fine where applicable. Please submit only genuine complaints and provide a photo whenever possible.'}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{t.cancelBtn || 'Cancel & Attach Photo'}</span>
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 text-amber-200" />
            <span>{t.iUnderstandAndContinue || 'I Understand & Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
