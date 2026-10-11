import React, { useState } from 'react';
import { Send, Edit3, CheckCircle2, ArrowLeft, AlertCircle, MapPin, ShieldAlert, Camera, CameraOff } from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';

export default function ReviewScreen({
  language,
  draftRequest,
  citizenProfile,
  onEdit,
  onConfirmSend,
  isSubmitting,
  submissionError
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [editedText, setEditedText] = useState(draftRequest?.text || '');
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [attachedPhoto, setAttachedPhoto] = useState(draftRequest?.photo || null);

  const reqType = draftRequest?.requestType || 'demand';
  const isPhotoException = Boolean(draftRequest?.photoException);

  const handleSend = () => {
    onConfirmSend({
      ...draftRequest,
      text: editedText,
      photo: attachedPhoto
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-[#002B49] text-white p-6 text-center">
        <h2 className="text-xl font-bold tracking-tight font-indic">
          {t.reviewTitle}
        </h2>
        <p className="text-xs text-slate-300 mt-0.5">
          {t.reviewSubtitle}
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {/* Request Type & Citizen Profile Banner */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t.requestTypeLabel || 'Request Type:'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center space-x-1 ${
              reqType === 'complaint'
                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}>
              <span>{reqType === 'complaint' ? '⚠️' : '🏗️'}</span>
              <span>{reqType === 'complaint' ? (t.complaintLabel || 'Complaint') : (t.demandLabel || 'Demand')}</span>
            </span>
          </div>

          <span className="text-xs font-bold text-slate-700">
            {citizenProfile?.name || 'Verified Citizen'}
          </span>
        </div>

        {/* User Message Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {t.yourMessageLabel}
            </span>
            <button
              type="button"
              onClick={() => setIsEditingInline(!isEditingInline)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingInline ? 'Save' : t.editBtn}</span>
            </button>
          </div>

          {isEditingInline ? (
            <textarea
              rows={4}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full text-base font-indic p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none"
            />
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-base font-indic text-slate-900 leading-relaxed font-medium shadow-2xs">
              &ldquo;{editedText}&rdquo;
            </div>
          )}
        </div>

        {/* Attached Photo Preview (if present) */}
        {attachedPhoto ? (
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.attachedPhoto || 'Attached Photo'}</span>
              </span>
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="text-rose-600 hover:text-rose-800 text-[11px] font-bold cursor-pointer hover:underline"
              >
                {t.removePhotoBtn || 'Remove Photo'}
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                <img
                  src={attachedPhoto.data || attachedPhoto.dataUrl}
                  alt="Review attachment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 truncate text-[11px]">
                  {attachedPhoto.name || 'photo.jpg'}
                </p>
                {attachedPhoto.locationCaptured ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-emerald-700">
                      <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{t.geoTaggedLocationCaptured || 'Geo-tagged Location'}:</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 font-indic leading-tight">
                      📍 {attachedPhoto.photoLocation?.address || attachedPhoto.photoAddress || draftRequest?.location?.address || citizenProfile?.address || 'Verified Location'}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-[10px] font-semibold text-amber-700">
                    <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>⚠️ {t.noLocationAttached || 'No location attached'}</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  {attachedPhoto.size ? `${(attachedPhoto.size / 1024).toFixed(0)} KB` : 'Image ready'} &bull; 📷 Camera
                  {attachedPhoto.photoLocation?.accuracy ? ` &bull; ±${attachedPhoto.photoLocation.accuracy}m` : ''}
                </p>
              </div>
            </div>
          </div>
        ) : isPhotoException ? (
          /* Complaint Exception Banner */
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>{t.noPhotoExceptionBadge || '⚠️ No Photo — Citizen Exception'}</span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              {t.complaintVerifyVisitNote || 'Note: An authorized officer may visit your location to verify this complaint.'}
            </p>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CameraOff className="w-4 h-4 text-slate-400" />
              <span>{t.noPhotoAttached || 'No photo attached.'}</span>
            </div>
            <span className="text-[10px] text-slate-400">
              {reqType === 'demand' ? 'Optional for Demand' : 'Standard'}
            </span>
          </div>
        )}

        {/* Problem Location (Compulsory for Complaints) */}
        {reqType === 'complaint' && draftRequest?.problemLocation && (
          <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-rose-950">
                <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{t.problemLocationLabel || 'Problem Location'}:</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                draftRequest.problemLocation.source === 'map_selected'
                  ? 'bg-purple-100 text-purple-900 border border-purple-200'
                  : 'bg-blue-100 text-blue-900 border border-blue-200'
              }`}>
                <span>{draftRequest.problemLocation.source === 'map_selected' ? '🗺️' : '📍'}</span>
                <span>
                  {draftRequest.problemLocation.source === 'map_selected'
                    ? (t.sourceMapSelected || 'Marked on Map')
                    : (t.sourceCurrentLocation || 'Current GPS Location')}
                </span>
              </span>
            </div>
            <p className="font-bold text-slate-900 pt-0.5 leading-snug font-indic">
              📍 {draftRequest.problemLocation.address}
            </p>
            {draftRequest.problemLocation.latitude && draftRequest.problemLocation.longitude && (
              <p className="text-[10px] text-slate-400 font-mono">
                Coordinates: {draftRequest.problemLocation.latitude.toFixed(6)}, {draftRequest.problemLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* Citizen Location & Sender Details Preview */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1.5">
          <div className="flex items-start space-x-2 text-slate-800 font-indic">
            <MapPin className="w-4 h-4 text-gov-saffron flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-950 block">
                {reqType === 'complaint' ? 'नागरिकाचे स्थान (Citizen Device Location):' : 'नोंदणीचे ठिकाण (Location):'}
              </span>
              <p className="font-semibold text-slate-900 pt-0.5 leading-snug">
                {draftRequest?.location?.address || citizenProfile?.address || 'Location Identified'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {submissionError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{submissionError}</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.editBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isSubmitting || !editedText.trim()}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
              isSubmitting || !editedText.trim()
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t.loading}</span>
              </>
            ) : (
              <>
                <span>{t.confirmSendBtn}</span>
                <Send className="w-4 h-4 text-[#FF9933]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
