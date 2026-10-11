import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';
import { verifyAadhaarMock, getDemoProfiles } from '../../../services/api';

export default function AadhaarVerifyScreen({ language, mobile, onVerificationSuccess, onBack }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  
  const [aadhaarInput, setAadhaarInput] = useState('2345 6789 0123');
  const [consent, setConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoProfiles, setDemoProfiles] = useState([]);

  useEffect(() => {
    getDemoProfiles()
      .then(setDemoProfiles)
      .catch((err) => console.warn('Could not load demo profiles:', err));
  }, []);

  const handleInputChange = (val) => {
    // Keep only numbers and format as XXXX XXXX XXXX
    const digits = val.replace(/\D/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += digits[i];
    }
    setAadhaarInput(formatted);
    setError('');
  };

  const handleSelectDemoProfile = (rawAadhaar) => {
    handleInputChange(rawAadhaar);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const rawDigits = aadhaarInput.replace(/\D/g, '');
    if (rawDigits.length !== 12) {
      setError(t.invalidAadhaarError);
      return;
    }

    if (!consent) {
      setError('Please check the consent box to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyAadhaarMock(rawDigits, mobile);
      if (response.success && response.data) {
        onVerificationSuccess(response.data);
      } else {
        throw new Error(response.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || 'Identity verification could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-[#002B49] text-white p-6 text-center relative">
        <div className="w-12 h-12 rounded-xl bg-white/10 mx-auto flex items-center justify-center border border-white/20 mb-2">
          <UserCheck className="w-6 h-6 text-[#FF9933]" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          {t.verifyIdentityTitle}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          {t.verifyIdentitySubtitle}
        </p>
      </div>

      <form onSubmit={handleVerify} className="p-6 sm:p-8 space-y-5">
        {/* Quick Pick Demo Citizens */}
        {demoProfiles.length > 0 && (
          <div className="space-y-1.5 bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl">
            <span className="text-[11px] font-bold text-amber-900 block">
              {t.quickPickCitizen}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {demoProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectDemoProfile(p.sampleAadhaarRaw)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 transition-colors shadow-2xs"
                >
                  {p.name.split(' ')[0]} ({p.district})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aadhaar Input Field */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
            <span>{t.aadhaarLabel}</span>
            <span className="text-[10px] text-slate-400 font-medium">12 Digits</span>
          </label>
          
          <input
            type="text"
            required
            placeholder="XXXX XXXX XXXX"
            value={aadhaarInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full text-center text-lg sm:text-xl font-mono font-bold tracking-widest py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start space-x-2.5 pt-1">
          <input
            type="checkbox"
            id="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-[#002B49] rounded border-slate-300 focus:ring-[#002B49]"
          />
          <label htmlFor="consent" className="text-xs text-slate-600 font-medium leading-tight cursor-pointer">
            {t.consentCheckbox}
          </label>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verify Action Button */}
        <button
          type="submit"
          disabled={isLoading || aadhaarInput.replace(/\D/g, '').length !== 12}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
            isLoading || aadhaarInput.replace(/\D/g, '').length !== 12
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t.loading}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
              <span>{t.verifyBtn}</span>
            </>
          )}
        </button>

        {/* Privacy / Sandbox Note */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-start space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
          <span>{t.securityNotice}</span>
        </div>
      </form>
    </div>
  );
}
