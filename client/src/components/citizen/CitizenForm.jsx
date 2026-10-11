import React, { useState, useRef } from 'react';
import { Send, CheckCircle, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle, Camera, Image as ImageIcon, Trash2, CheckCircle2 } from 'lucide-react';
import VoiceRecorder from '../common/VoiceRecorder';
import LocationPicker from './LocationPicker';
import { submitRequest } from '../../services/api';
import SAMPLE_TEMPLATES from '../../data/sampleTemplates.json';

export default function CitizenForm({ onSuccessfulSubmission }) {
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Auto');
  const [locationName, setLocationName] = useState('Pune (Rural / Khed), Maharashtra');
  const [latitude, setLatitude] = useState(18.8475);
  const [longitude, setLongitude] = useState(73.9167);

  // Optional Photo State
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const cameraInputRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePhotoFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Please select a valid JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Photo size must be less than 5MB. Please choose a smaller photo.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAttachedPhoto({
        dataUrl: uploadEvent.target.result,
        name: file.name,
        size: file.size,
        type: file.type
      });
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceTranscript = (transcript) => {
    setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const handleLoadSample = (sample) => {
    setDescription(sample.text);
    setLanguage(sample.language);
    setLocationName(sample.location);
    setLatitude(sample.lat);
    setLongitude(sample.lng);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim()) {
      setErrorMessage('Please enter or speak your development issue before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitRequest({
        description: description.trim(),
        language: language === 'Auto' ? undefined : language,
        location_name: locationName,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        photo: attachedPhoto ? {
          data: attachedPhoto.dataUrl,
          name: attachedPhoto.name,
          size: attachedPhoto.size,
          type: attachedPhoto.type
        } : undefined
      });

      setSubmissionResult(response);
      if (onSuccessfulSubmission) {
        onSuccessfulSubmission(response.data);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'We could not process your request right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setAttachedPhoto(null);
    setSubmissionResult(null);
    setErrorMessage('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Official Form Header */}
      <div className="bg-[#002B49] text-white px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
              <span>Citizen Development Portal</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Submit public infrastructure needs, public health gaps, water, education, or civic issues.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full text-xs text-slate-200 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Service Portal</span>
          </div>
        </div>
      </div>

      {submissionResult ? (
        /* Confirmation Receipt Screen */
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3.5">
            <div className="p-2 bg-emerald-600 rounded-full text-white mt-0.5">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-950 text-base">
                Request Registered Successfully &bull; {submissionResult.data?.request_code}
              </h3>
              <p className="text-xs text-emerald-800 mt-1">
                Your request has been analyzed by Google Gemini AI and logged into the Government Intelligence Dashboard.
              </p>
            </div>
          </div>

          {/* AI Extraction Intelligence Summary Card */}
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  AI Structured Intelligence (Google Gemini)
                </span>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                {submissionResult.data?.category}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">Extracted Issue</span>
                <span className="font-semibold text-slate-800">{submissionResult.data?.issue}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">Detected Language</span>
                <span className="font-semibold text-slate-800">{submissionResult.data?.language}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block mb-1">Assessed Urgency</span>
                <span className={`inline-flex px-2 py-0.5 rounded font-bold text-xs ${
                  submissionResult.data?.urgency === 'Critical' ? 'bg-rose-100 text-rose-800' :
                  submissionResult.data?.urgency === 'High' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {submissionResult.data?.urgency}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium block mb-1">Executive AI Summary</span>
              <p className="text-slate-700 font-medium leading-relaxed">
                {submissionResult.data?.ai_summary}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium block mb-1">Original Citizen Input</span>
              <p className="text-slate-600 font-indic italic">
                &ldquo;{submissionResult.data?.original_text}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={resetForm}
              className="flex-1 px-5 py-2.5 rounded-lg bg-[#002B49] hover:bg-[#003961] text-white text-sm font-semibold transition-colors text-center"
            >
              Submit Another Development Issue
            </button>
          </div>
        </div>
      ) : (
        /* Citizen Input Form */
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Quick Demo Templates */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Quick Try Sample Problems (उदाहरणे / उदाहरण):
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEMPLATES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-900 border border-slate-200 text-slate-700 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Problem Description Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Describe the Development Gap / समस्या सांगा <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} characters
              </span>
            </div>

            <textarea
              id="description"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. आमच्या गावात जवळ रुग्णालय नाही... / हमारे गाँव में सड़क की समस्या है... / There is no regular drinking water supply in our village..."
              className="w-full text-sm font-indic sm:font-sans p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Voice Input & Language Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-1">
            <div>
              <VoiceRecorder
                selectedLanguage={language}
                onTranscriptReady={handleVoiceTranscript}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Language (भाषा / बोली)
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
              >
                <option value="Auto">✨ Auto-Detect Language (Gemini AI)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="English">English</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
                <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              </select>
            </div>
          </div>

          {/* Location Picker */}
          <div className="pt-2 border-t border-slate-100">
            <LocationPicker
              locationName={locationName}
              setLocationName={setLocationName}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
            />
          </div>

          {/* Optional Photo Attachment */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Camera className="w-4 h-4 text-gov-saffron" />
                <span>Add Photo (Optional)</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                {attachedPhoto ? '1 Photo Attached' : 'Optional'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Add a photo to help explain the issue. This is optional and helps officials understand the context.
            </p>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              className="hidden"
              onChange={handlePhotoFileChange}
            {!attachedPhoto ? (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#002B49]" />
                  <span>Take Photo</span>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white border border-emerald-300 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={attachedPhoto.dataUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{attachedPhoto.name}</p>
                    <p className="text-[10px] text-slate-400">{(attachedPhoto.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedPhoto(null);
                    if (cameraInputRef.current) cameraInputRef.current.value = '';
                  }}
                  className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center space-x-1 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
                isSubmitting || !description.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing with Google Gemini AI & Registering...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-gov-saffron" />
                  <span>Submit Development Issue (समस्या नोंदवा)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
              Data is processed securely and directly categorized for government infrastructure planning.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
