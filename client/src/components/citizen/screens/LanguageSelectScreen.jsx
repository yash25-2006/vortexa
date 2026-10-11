import React, { useState } from 'react';
import { Languages, Check, ArrowRight, Volume2, Globe, ChevronRight } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';
import BrowseMoreLanguagesModal from '../../common/BrowseMoreLanguagesModal';
import LANGUAGES from '../../../data/primaryLanguages.json';

export default function LanguageSelectScreen({ selectedLanguage, onSelectLanguage, onContinue }) {
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.en;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-[#002B49] text-white p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-2 shadow-inner">
          <Languages className="w-6 h-6 text-[#FF9933]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight font-indic">
          {t.chooseLanguageTitle}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          {t.chooseLanguageSubtitle}
        </p>
      </div>

      <div className="p-6 sm:p-7 space-y-4">
        {/* Language Selection Buttons */}
        <div className="space-y-3">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => onSelectLanguage(lang.code)}
                className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#002B49] bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-slate-900 font-indic">
                      {lang.native}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({lang.sub})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium font-indic">
                    {lang.greeting}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#002B49] text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-[#FF9933]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-300"></div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Browse More Languages Option */}
          <button
            type="button"
            onClick={() => setIsBrowseOpen(true)}
            className="w-full p-3 rounded-2xl border border-dashed border-slate-300 hover:border-[#002B49] hover:bg-slate-50 transition-all flex items-center justify-between text-slate-700 cursor-pointer group"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#002B49] group-hover:text-white transition-colors">
                <Globe className="w-4 h-4 text-slate-600 group-hover:text-[#FF9933]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 group-hover:text-[#002B49] block">
                  Browse More Languages (10+)
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Bengali, Gujarati, Tamil, Telugu, Kannada & more
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#002B49] group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Continue Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <span>{t.continueBtn}</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933]" />
          </button>
        </div>
      </div>

      {/* Browse More Languages Modal */}
      <BrowseMoreLanguagesModal
        isOpen={isBrowseOpen}
        onClose={() => setIsBrowseOpen(false)}
      />
    </div>
  );
}
