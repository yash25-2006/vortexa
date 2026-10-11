import React from 'react';
import { HelpCircle, X, MapPin, Camera, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';

export default function GeoTagHelpModal({ language, onClose }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2 text-[#002B49]">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base font-indic">
              {t.whatIsGeoPhotoTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed font-indic">
          <p className="font-medium">
            {t.whatIsGeoPhotoBody1}
          </p>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1.5 text-xs text-blue-950">
            <div className="flex items-center space-x-1.5 font-bold text-blue-900">
              <MapPin className="w-4 h-4 text-[#FF9933]" />
              <span>{t.whatIsGeoPhotoTitle}</span>
            </div>
            <p className="leading-normal">
              {t.whatIsGeoPhotoBody2}
            </p>
          </div>

          <p className="text-xs text-slate-500 font-medium pt-1">
            {t.whatIsGeoPhotoBody3}
          </p>
        </div>

        {/* Got it action button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.gotItBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
