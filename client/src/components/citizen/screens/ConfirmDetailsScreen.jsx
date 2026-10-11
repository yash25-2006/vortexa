import React, { useState } from 'react';
import { UserCheck, CheckCircle, MapPin, Phone, ArrowRight, Edit3, ShieldCheck, Check } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';

export default function ConfirmDetailsScreen({ language, citizenProfile, onConfirmDetails }) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: citizenProfile?.name || '',
    mobile: citizenProfile?.mobile || '',
    address: citizenProfile?.address || '',
    district: citizenProfile?.district || '',
    state: citizenProfile?.state || '',
    maskedAadhaar: citizenProfile?.maskedAadhaar || 'XXXX XXXX 0123'
  });

  const handleConfirm = () => {
    onConfirmDetails({
      ...citizenProfile,
      ...profileData
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-[#002B49] text-white p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 mx-auto flex items-center justify-center border border-emerald-400/40 mb-2">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          {t.confirmDetailsTitle}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          {t.confirmDetailsSubtitle}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {/* Verification Success Pill */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-xs">
          <div className="flex items-center space-x-2 text-emerald-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.verifiedCitizen}</span>
          </div>
          <span className="font-mono text-emerald-800 font-semibold">
            {profileData.maskedAadhaar}
          </span>
        </div>

        {/* Profile Card Attributes */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/70 divide-y divide-slate-200 text-xs">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">{t.nameLabel}</span>
            <span className="font-bold text-slate-900 text-sm font-indic">{profileData.name || 'Citizen'}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-slate-500 font-semibold">{t.mobileLabel}</span>
            <span className="font-bold text-slate-900 font-mono">{profileData.mobile || '—'}</span>
          </div>

          <div className="p-3.5 space-y-1">
            <span className="text-slate-500 font-semibold block">{t.addressLabel}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-800 text-xs"
              />
            ) : (
              <span className="font-bold text-slate-900 block font-indic">{profileData.address || '—'}</span>
            )}
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-3.5 space-y-0.5">
              <span className="text-slate-500 font-semibold block">{t.districtLabel}</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.district}
                  onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 block">{profileData.district || '—'}</span>
              )}
            </div>

            <div className="p-3.5 space-y-0.5">
              <span className="text-slate-500 font-semibold block">{t.stateLabel}</span>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-800 text-xs"
                />
              ) : (
                <span className="font-bold text-slate-900 block">{profileData.state || '—'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Edit Details */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Save Changes' : t.editDetails}</span>
          </button>
        </div>

        {/* Confirm Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <span>{t.confirmAndContinueBtn}</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933]" />
          </button>
        </div>
      </div>
    </div>
  );
}
