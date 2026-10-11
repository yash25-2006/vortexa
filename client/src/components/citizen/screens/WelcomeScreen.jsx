import React, { useState } from 'react';
import { Landmark, Phone, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';

export default function WelcomeScreen({ language, onLogin, onDirectAadhaar, onOpenLanguageSelect }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

  const handleAction = (type) => {
    setError('');
    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length > 0 && cleanMobile.length !== 10) {
      setError(language === 'mr' ? 'कृपया १० अंकी मोबाईल नंबर टाका.' : language === 'hi' ? 'कृपया १० अंकों का मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    onLogin({ mobile: cleanMobile || '9823014589', action: type });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Official Header Banner */}
      <div className="bg-[#002B49] text-white p-6 sm:p-7 text-center relative">
        <div className="w-16 h-16 rounded-2xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-3 shadow-inner">
          <Landmark className="w-9 h-9 text-[#FF9933]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {t.appName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
          {t.appSubtitle}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Civic Subheading */}
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900">
            {t.welcomeTitle}
          </h2>
          <p className="text-xs text-slate-500 font-indic leading-relaxed">
            {t.welcomeSubtitle}
          </p>
        </div>

        {/* Mobile Number Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Phone className="w-3.5 h-3.5 text-[#002B49]" />
            <span>{t.mobileNumberLabel}</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 pr-2.5 flex items-center pointer-events-none text-slate-600 font-bold text-sm z-10 border-r border-slate-200 my-2">
              +91
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder={t.mobilePlaceholder}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-16 pr-4 py-3.5 text-sm sm:text-base font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
            />
          </div>
          {error && <p className="text-xs text-rose-600 font-medium pt-0.5">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={() => handleAction('login')}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <span>{t.loginBtn}</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933]" />
          </button>

          <button
            type="button"
            onClick={() => handleAction('signup')}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] border border-slate-300 transition-all cursor-pointer text-center"
          >
            <span>{t.signupBtn}</span>
          </button>
        </div>

        {/* Or direct Aadhaar mock route */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium">
              {t.orContinueWithAadhaar}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onDirectAadhaar}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-amber-700" />
          <span>{t.directAadhaarBtn}</span>
        </button>

        {/* Trust & Privacy Badge */}
        <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.privacyNote}</span>
        </div>
      </div>
    </div>
  );
}
