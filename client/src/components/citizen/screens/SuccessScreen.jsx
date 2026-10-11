import React from 'react';
import { CheckCircle2, Sparkles, PlusCircle, ListFilter, ArrowRight, ShieldCheck, Landmark, ShieldAlert, Camera } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';

export default function SuccessScreen({
  language,
  submissionResult,
  onReportAnother,
  onViewMyRequests
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const reqData = submissionResult?.data || submissionResult?.request || {};
  const requestCode = submissionResult?.requestId || reqData?.request_code || 'REQ-0001';
  const reqType = (submissionResult?.request_type || reqData?.request_type || 'demand').toLowerCase();
  const isPhotoAttached = Boolean(submissionResult?.photoAttached || reqData?.photo_url);
  const isPhotoException = Boolean(submissionResult?.photo_exception || reqData?.photo_exception);

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Official Success Banner */}
      <div className="bg-[#002B49] text-white p-7 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg mb-3 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-indic">
          {t.successTitle}
        </h2>
      </div>

      <div className="p-6 sm:p-8 space-y-5 text-center">
        {/* Request ID Display Card */}
        <div className="p-4 bg-blue-50/80 border-2 border-dashed border-blue-300 rounded-2xl space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
              reqType === 'complaint'
                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                : 'bg-blue-100 text-blue-900 border border-blue-200'
            }`}>
              {reqType === 'complaint' ? (t.complaintBadge || '⚠️ Complaint') : (t.demandBadge || '🏗️ Demand')}
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
            {t.requestIdLabel}
          </span>
          <div className="text-3xl font-extrabold text-[#002B49] font-mono tracking-wider">
            {requestCode}
          </div>
          <span className="text-[11px] text-blue-700 font-medium block">
            विकास नियोजन प्रणालीमध्ये सुरक्षितपणे नोंदवले
          </span>

          {isPhotoAttached ? (
            <div className="pt-2 border-t border-blue-200/80 flex items-center justify-center space-x-1.5 text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t.photoAttachedSuccess || 'Photo attached successfully'}</span>
            </div>
          ) : isPhotoException ? (
            <div className="pt-2 border-t border-blue-200/80 flex items-center justify-center space-x-1.5 text-xs text-amber-800 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{t.noPhotoExceptionBadge || '⚠️ No Photo — Citizen Exception'}</span>
            </div>
          ) : null}
        </div>

        {/* Civic Acknowledgement Note */}
        <p className="text-xs sm:text-sm text-slate-600 font-indic leading-relaxed">
          {t.thankYouMessage}
        </p>

        {/* Verification Visit Notice for Complaint without Photo */}
        {reqType === 'complaint' && !isPhotoAttached && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-indic text-left space-y-1">
            <span className="font-bold flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span>स्थान पडताळणी सूचना (Verification Notice):</span>
            </span>
            <p className="text-[11px] leading-snug">
              {t.complaintVerifyVisitNote || 'Note: An authorized officer may visit your location to verify this complaint.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onReportAnother}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FF9933]" />
            <span>{t.reportAnotherBtn}</span>
          </button>

          <button
            type="button"
            onClick={onViewMyRequests}
            className="w-full py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] border border-slate-300 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ListFilter className="w-4 h-4 text-slate-600" />
            <span>{t.viewMyRequestsBtn}</span>
          </button>
        </div>

        {/* Trust badge */}
        <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>भारत विकास संवाद &bull; अधिकृत नागरिक पोर्टल</span>
        </div>
      </div>
    </div>
  );
}
