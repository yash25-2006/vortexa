import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  MapPin,
  Navigation,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Camera,
  Trash2,
  X,
  Eye,
  ShieldAlert,
  HelpCircle,
  RotateCcw,
  HardHat,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';
import { TRANSLATIONS } from '../../../constants/translations';
import CameraCaptureModal from '../../common/CameraCaptureModal';
import GeoTagHelpModal from '../../common/GeoTagHelpModal';
import ComplaintNoPhotoWarningModal from '../ComplaintNoPhotoWarningModal';
import ProblemLocationMapModal from '../ProblemLocationMapModal';
import { reverseGeocodeCoords } from '../../../utils/reverseGeocoder';
import { fetchCitizenCooldownStatus } from '../../../services/api';

export default function CitizenHomeScreen({
  language,
  citizenProfile,
  startupLocationCoords = null,
  onProceedToReview,
  onOpenMyRequests
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Request Type Toggle State ('demand' | 'complaint') - Default is 'demand'
  const [requestType, setRequestType] = useState('demand');

  const [problemText, setProblemText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Location State (Compulsory)
  const [useGps, setUseGps] = useState(Boolean(startupLocationCoords));
  const [gpsCoords, setGpsCoords] = useState(
    startupLocationCoords
      ? { latitude: startupLocationCoords.latitude, longitude: startupLocationCoords.longitude }
      : citizenProfile?.coordinates?.latitude && citizenProfile?.coordinates?.longitude
      ? { latitude: citizenProfile.coordinates.latitude, longitude: citizenProfile.coordinates.longitude }
      : { latitude: 20.5937, longitude: 78.9629 }
  );
  const [locationAccuracy, setLocationAccuracy] = useState(startupLocationCoords?.accuracy || 15);
  const [locationCapturedAt, setLocationCapturedAt] = useState(new Date().toISOString());
  const [humanReadableAddress, setHumanReadableAddress] = useState(citizenProfile?.address || 'Location Identified');
  const [isLocating, setIsLocating] = useState(false);

  // Problem Location State (Complaint Specific)
  const [problemLocation, setProblemLocation] = useState(null);
  const [isProblemMapModalOpen, setIsProblemMapModalOpen] = useState(false);
  const [isSettingProblemLocation, setIsSettingProblemLocation] = useState(false);

  // Photo State & Modals
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Complaint No-Photo Exception State & Modal
  const [noPhotoExceptionChecked, setNoPhotoExceptionChecked] = useState(false);
  const [noPhotoExceptionAcknowledged, setNoPhotoExceptionAcknowledged] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

  // Cooldown status state
  const [cooldownData, setCooldownData] = useState(null);

  const recognitionRef = useRef(null);

  // Fetch Cooldown Status
  useEffect(() => {
    if (!citizenProfile?.citizenId) return;
    fetchCitizenCooldownStatus(citizenProfile.citizenId)
      .then((data) => setCooldownData(data))
      .catch((err) => console.warn('Cooldown status check notice:', err.message));
  }, [citizenProfile?.citizenId]);

  // Auto-resolve initial human-readable location on mount
  const fetchCurrentLocation = (isManualRefresh = false) => {
    setIsLocating(true);
    setErrorMessage('');

    if (!navigator.geolocation) {
      setHumanReadableAddress(citizenProfile?.address || 'Location Identified');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy || 15);
        const nowIso = new Date().toISOString();

        setGpsCoords({ latitude: lat, longitude: lng });
        setLocationAccuracy(acc);
        setLocationCapturedAt(nowIso);
        setUseGps(true);

        // Reverse geocode to clean human-readable address
        const geoResult = await reverseGeocodeCoords(lat, lng, citizenProfile);
        setHumanReadableAddress(geoResult.address);
        setIsLocating(false);
      },
      async (err) => {
        console.warn('Geolocation notice:', err.message);
        setIsLocating(false);
        const fallback = await reverseGeocodeCoords(
          gpsCoords?.latitude || citizenProfile?.coordinates?.latitude || 20.5937,
          gpsCoords?.longitude || citizenProfile?.coordinates?.longitude || 78.9629,
          citizenProfile
        );
        setHumanReadableAddress(fallback.address || citizenProfile?.address || 'Location Identified');
        if (isManualRefresh) {
          setErrorMessage(t.locationDeniedNotice || 'Location access not permitted. Using registered address.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    fetchCurrentLocation(false);
  }, [citizenProfile]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    const langCodeMap = {
      mr: 'mr-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };
    recognition.lang = langCodeMap[language] || 'mr-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setInterimText(interimTranscript);
      }

      if (finalTranscript) {
        setInterimText('');
        setProblemText((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setErrorMessage(t.micDeniedError);
      } else if (event.error !== 'no-speech') {
        setErrorMessage(`Voice note: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, t]);

  const toggleListening = () => {
    setErrorMessage('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage(t.micDeniedError);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        const langCodeMap = {
          mr: 'mr-IN',
          hi: 'hi-IN',
          en: 'en-IN'
        };
        if (recognitionRef.current) {
          recognitionRef.current.lang = langCodeMap[language] || 'mr-IN';
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setErrorMessage('Unable to activate microphone. You can type below.');
      }
    }
  };

  // Handle Camera Capture Return
  const handleCameraCaptureComplete = (photoPayload) => {
    setErrorMessage('');
    setAttachedPhoto(photoPayload);

    // If photo contains accurate location & address, sync the form address
    if (photoPayload?.photoLocation?.address && photoPayload.photoLocation.address !== 'Address temporarily unavailable') {
      setHumanReadableAddress(photoPayload.photoLocation.address);
    }
    if (photoPayload?.photoLocation?.latitude && photoPayload?.photoLocation?.longitude) {
      setGpsCoords({
        latitude: photoPayload.photoLocation.latitude,
        longitude: photoPayload.photoLocation.longitude
      });
      setLocationAccuracy(photoPayload.photoLocation.accuracy || 10);
      setUseGps(true);
    }

    // Reset photo exception if photo is added
    setNoPhotoExceptionChecked(false);
    setNoPhotoExceptionAcknowledged(false);
  };

  const handleRemovePhoto = () => {
    setAttachedPhoto(null);
  };

  // Toggle "I don't have a photo" exception
  const handleToggleNoPhotoCheckbox = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      // Open the serious legal warning modal for confirmation
      setIsWarningModalOpen(true);
    } else {
      setNoPhotoExceptionChecked(false);
      setNoPhotoExceptionAcknowledged(false);
    }
  };

  const handleConfirmNoPhotoException = () => {
    setNoPhotoExceptionChecked(true);
    setNoPhotoExceptionAcknowledged(true);
    setIsWarningModalOpen(false);
  };

  const handleCancelNoPhotoException = () => {
    setNoPhotoExceptionChecked(false);
    setNoPhotoExceptionAcknowledged(false);
    setIsWarningModalOpen(false);
  };

  // Problem Location Handlers (Complaint Flow)
  const handleUseCurrentLocationAsProblemLocation = () => {
    setIsSettingProblemLocation(true);
    setErrorMessage('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(6));
          const lng = parseFloat(pos.coords.longitude.toFixed(6));
          const acc = Math.round(pos.coords.accuracy || 15);

          const geoResult = await reverseGeocodeCoords(lat, lng, citizenProfile);
          setProblemLocation({
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            address: geoResult.address || humanReadableAddress || 'Current Location',
            source: 'current_location'
          });
          setIsSettingProblemLocation(false);
        },
        async (err) => {
          console.warn('Geolocation problem location notice:', err.message);
          const fallbackLat = gpsCoords?.latitude || 18.5158;
          const fallbackLng = gpsCoords?.longitude || 73.7711;
          const geoResult = await reverseGeocodeCoords(fallbackLat, fallbackLng, citizenProfile);
          setProblemLocation({
            latitude: fallbackLat,
            longitude: fallbackLng,
            accuracy: 15,
            address: geoResult.address || humanReadableAddress || 'Current Location',
            source: 'current_location'
          });
          setIsSettingProblemLocation(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      const fallbackLat = gpsCoords?.latitude || 18.5158;
      const fallbackLng = gpsCoords?.longitude || 73.7711;
      reverseGeocodeCoords(fallbackLat, fallbackLng, citizenProfile).then((geoResult) => {
        setProblemLocation({
          latitude: fallbackLat,
          longitude: fallbackLng,
          accuracy: 15,
          address: geoResult.address || humanReadableAddress || 'Current Location',
          source: 'current_location'
        });
        setIsSettingProblemLocation(false);
      });
    }
  };

  const handleConfirmProblemLocationFromMap = (locationData) => {
    setProblemLocation(locationData);
    setIsProblemMapModalOpen(false);
    setErrorMessage('');
  };

  const handleSubmitToReview = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmed = problemText.trim();
    if (!trimmed) {
      setErrorMessage(t.emptyRequestError);
      return;
    }

    if (!humanReadableAddress) {
      setErrorMessage(t.locationRequired || 'Location is required to submit a request. Please allow location access.');
      return;
    }

    // Complaint Rule 1: Problem Location is compulsory
    if (requestType === 'complaint') {
      if (!problemLocation || !problemLocation.address) {
        setErrorMessage(
          t.problemLocationRequiredError ||
          'Please specify where the problem occurred (Use Current Location or Mark on Map).'
        );
        return;
      }
    }

    // Complaint Rule 2: Photo is compulsory unless "I don't have a photo" is confirmed
    if (requestType === 'complaint' && !attachedPhoto) {
      if (!noPhotoExceptionChecked || !noPhotoExceptionAcknowledged) {
        setErrorMessage(
          t.complaintPhotoRequiredError ||
          'A photo is required for complaints, or you must acknowledge submitting without photographic evidence.'
        );
        return;
      }
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    onProceedToReview({
      requestType,
      text: trimmed,
      inputType: isListening || interimText ? 'voice' : 'text',
      problemLocation: requestType === 'complaint' ? problemLocation : null,
      photo: attachedPhoto ? {
        data: attachedPhoto.dataUrl || attachedPhoto.data,
        name: attachedPhoto.name,
        size: attachedPhoto.size,
        type: attachedPhoto.type,
        source: attachedPhoto.source || 'upload',
        locationCaptured: attachedPhoto.locationCaptured || false,
        photoLocation: attachedPhoto.photoLocation || null,
        capturedAtFormatted: attachedPhoto.capturedAtFormatted
      } : null,
      photoException: Boolean(noPhotoExceptionChecked && noPhotoExceptionAcknowledged),
      photoExceptionAcknowledged: Boolean(noPhotoExceptionAcknowledged),
      location: {
        latitude: gpsCoords?.latitude || citizenProfile?.coordinates?.latitude || 20.5937,
        longitude: gpsCoords?.longitude || citizenProfile?.coordinates?.longitude || 78.9629,
        accuracy: locationAccuracy || 15,
        capturedAt: locationCapturedAt || new Date().toISOString(),
        district: citizenProfile?.district || '',
        state: citizenProfile?.state || '',
        address: humanReadableAddress || citizenProfile?.address || 'Location Identified'
      }
    });
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Citizen Welcome Greeting Bar */}
      <div className="bg-[#002B49] text-white px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <ShieldCheck className="w-5 h-5 text-[#FF9933]" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-medium block">
              {t.namaste}, {citizenProfile?.name || t.verifiedCitizen}
            </span>
            <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5 font-indic">
              {t.appName}
            </h2>
          </div>
        </div>

        {/* Action Controls in Header Bar */}
        <div className="flex items-center space-x-3">
          {onOpenMyRequests && (
            <button
              type="button"
              onClick={onOpenMyRequests}
              className="text-xs bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold px-3.5 py-2 rounded-xl border border-white/20 transition-all flex items-center space-x-2 cursor-pointer shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.viewMyRequestsBtn || 'My Requests'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Request Form in Expansive 2-Column Responsive Layout */}
      <form onSubmit={handleSubmitToReview} className="p-6 sm:p-8 lg:p-10 space-y-6">
        {/* Cooldown or Category Restriction Information Banner (Full Width) */}
        {cooldownData?.cooldownActive && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1 animate-fadeIn">
            <div className="flex items-center space-x-2 font-bold">
              <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span className="text-sm">Daily Submission Limit (24-Hour Cooldown Active)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              You submitted a civic request recently. Your next submission unlocks in approx{' '}
              <strong>{cooldownData.remainingHours || 0} hours {cooldownData.remainingMinutes || 0} minutes</strong>.
            </p>
            {cooldownData.lastCategory && (
              <p className="text-[11px] text-amber-800 font-medium">
                Note: Next submission must belong to a different sector than <strong>{cooldownData.lastCategory}</strong>.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ============================================================== */}
          {/* LEFT COLUMN: Submission Type, Title, Voice & Text Input (Col 7) */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. DEMAND / COMPLAINT TOGGLE */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t.submissionTypeQuestion || 'What would you like to submit?'}
              </label>
              
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                {/* Demand Option */}
                <button
                  type="button"
                  onClick={() => {
                    setRequestType('demand');
                    setErrorMessage('');
                  }}
                  className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    requestType === 'demand'
                      ? 'bg-[#002B49] text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>🏗️</span>
                  <span>{t.demandTab || 'DEMAND'}</span>
                </button>

                {/* Complaint Option */}
                <button
                  type="button"
                  onClick={() => {
                    setRequestType('complaint');
                    setErrorMessage('');
                  }}
                  className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    requestType === 'complaint'
                      ? 'bg-rose-700 text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>⚠️</span>
                  <span>{t.complaintTab || 'COMPLAINT'}</span>
                </button>
              </div>

              {/* Contextual Description of Selected Type */}
              <p className="text-[11px] sm:text-xs text-slate-500 font-indic leading-relaxed px-1">
                {requestType === 'demand'
                  ? (t.demandDescription || 'Demands are for suggesting new infrastructure, facilities, or community improvements (e.g., new park, hospital, library, road widening, streetlights).')
                  : (t.complaintDescription || 'Complaints are for reporting existing issues, breakdowns, damages, or service failures (e.g., potholes, overflowing garbage, broken water pipe, illegal dumping).')}
              </p>
            </div>

            {/* Step Title */}
            <div className="space-y-1 pt-1">
              <h3 className="text-xl sm:text-2xl font-black text-[#002B49] tracking-tight font-indic">
                {requestType === 'demand'
                  ? (t.homeHeading || 'What development demand do you have?')
                  : (t.complaintHeading || 'What complaint would you like to report?')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-indic">
                {requestType === 'demand'
                  ? (t.homeSubheading || 'Tell us about new facilities, road repairs, water lines, or civic improvements needed.')
                  : (t.complaintSubheading || 'Report potholes, water leaks, garbage, or other service issues.')}
              </p>
            </div>

            {/* Primary Voice Input Button */}
            <div>
              <button
                type="button"
                onClick={toggleListening}
                className={`w-full py-4 px-5 rounded-2xl font-extrabold text-base flex items-center justify-center space-x-3 transition-all cursor-pointer shadow-md ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200 animate-pulse'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-[0.99]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-6 h-6 animate-bounce" />
                    <span>{t.stopListeningBtn || 'Done / Stop'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 text-emerald-200" />
                    <span>{t.speakBtn}</span>
                  </>
                )}
              </button>
            </div>

            {/* Live Listening Waveform / Status */}
            {isListening && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-1.5 h-4 bg-rose-500 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-6 bg-rose-600 rounded-full animate-pulse delay-75"></span>
                  <span className="w-1.5 h-3 bg-rose-500 rounded-full animate-pulse delay-150"></span>
                </div>
                <p className="text-xs font-bold text-rose-800">
                  {t.speechHelpText || 'Listening... Please speak clearly'}
                </p>
                {interimText && (
                  <p className="text-xs text-slate-600 italic">
                    &ldquo;{interimText}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Text Input Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t.orTypeText}
              </label>
              <textarea
                rows={5}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder={
                  requestType === 'demand'
                    ? (t.textPlaceholder || 'Describe the development need in your area...')
                    : (t.complaintPlaceholder || 'Describe your complaint (e.g. major pothole on main road causing traffic hazard...)')
                }
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-[#002B49] focus:ring-2 focus:ring-[#002B49]/20 text-sm font-indic text-slate-900 outline-none transition-all resize-none shadow-2xs leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: Location, Complaint Location & Photo (Col 5)     */}
          {/* ============================================================== */}
          <div className="lg:col-span-5 space-y-5">
            {/* 2. COMPULSORY CITIZEN LOCATION SECTION */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-blue-950 font-extrabold text-xs">
                  <MapPin className="w-4 h-4 text-gov-saffron flex-shrink-0" />
                  <span>{t.myLocationLabel || 'Location (Compulsory)'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchCurrentLocation(true)}
                  disabled={isLocating}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 cursor-pointer hover:shadow-2xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                  <span>{t.refreshLocation || 'Refresh'}</span>
                </button>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                <p className="text-xs font-bold text-slate-900 font-indic leading-snug">
                  📍 {humanReadableAddress || citizenProfile?.address || 'Location Identified'}
                </p>
                {locationAccuracy && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    {t.accuracyApprox || 'Accuracy: approximately'} ±{locationAccuracy} m
                  </p>
                )}
              </div>
            </div>

            {/* 2B. COMPLAINT PROBLEM LOCATION SECTION (Compulsory for Complaints) */}
            {requestType === 'complaint' && (
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-950 font-extrabold text-xs">
                    <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{t.whereDidProblemOccur || 'Where did the problem occur?'}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    problemLocation
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {problemLocation ? `✓ ${t.locationSelectedBadge || 'Location Selected'}` : (t.requiredBadge || 'Required')}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-indic leading-relaxed">
                  {t.whereDidProblemOccurHelp || 'Specify the exact location where the issue is located.'}
                </p>

                {/* Selection Options */}
                {!problemLocation ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Option 1: Use Current Location */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocationAsProblemLocation}
                      disabled={isSettingProblemLocation}
                      className="py-3 px-3 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs group"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform ${isSettingProblemLocation ? 'animate-spin' : ''}`} />
                      <span className="truncate">{isSettingProblemLocation ? 'Locating...' : (t.useCurrentLocationBtn || 'Current Location')}</span>
                    </button>

                    {/* Option 2: Mark on Map */}
                    <button
                      type="button"
                      onClick={() => setIsProblemMapModalOpen(true)}
                      className="py-3 px-3 rounded-xl bg-[#002B49] hover:bg-[#003961] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs group active:scale-95"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#FF9933] group-hover:scale-110 transition-transform" />
                      <span>{t.markOnMapBtn || 'Mark on Map'}</span>
                    </button>
                  </div>
                ) : (
                  /* Selected Problem Location Confirmation Card */
                  <div className="p-3.5 bg-white border border-rose-200 rounded-xl space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                        problemLocation.source === 'map_selected'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        <span>{problemLocation.source === 'map_selected' ? '🗺️' : '📍'}</span>
                        <span>
                          {problemLocation.source === 'map_selected'
                            ? (t.sourceMapSelected || 'Marked on Map')
                            : (t.sourceCurrentLocation || 'Current GPS Location')}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setIsProblemMapModalOpen(true)}
                        className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center space-x-1 cursor-pointer hover:underline"
                      >
                        <span>{t.changeProblemLocation || 'Change'}</span>
                      </button>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 font-indic leading-snug">
                        📍 {problemLocation.address || 'Selected Problem Location'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Coordinates: {problemLocation.latitude?.toFixed(6)}, {problemLocation.longitude?.toFixed(6)}
                        {problemLocation.accuracy ? ` (±${problemLocation.accuracy}m)` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PHOTO ATTACHMENT SECTION */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              requestType === 'complaint' && !attachedPhoto && !noPhotoExceptionAcknowledged
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-slate-50/90 border-slate-200'
            }`}>
              {/* Header with [?] Help Button & Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-gov-saffron" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    {requestType === 'demand'
                      ? (t.addPhotoOptional || 'Add Photo (Optional)')
                      : (t.evidencePhotoRequired || 'Evidence Photo (Required)')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHelpModalOpen(true)}
                    className="w-4 h-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-black flex items-center justify-center transition-colors cursor-pointer"
                    title="What is a geo-tagged photo?"
                  >
                    ?
                  </button>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  attachedPhoto
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : requestType === 'complaint'
                    ? noPhotoExceptionAcknowledged
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-white text-slate-500 border-slate-200'
                }`}>
                  {attachedPhoto
                    ? (attachedPhoto.locationCaptured ? '📍 Geo-tagged' : '1 Photo')
                    : requestType === 'complaint'
                    ? noPhotoExceptionAcknowledged
                      ? '⚠️ Exception Active'
                      : 'Required'
                    : 'Optional'}
                </span>
              </div>

              {/* Helper Guidance */}
              <p className="text-xs text-slate-500 font-indic leading-relaxed">
                {requestType === 'demand'
                  ? (t.preferGeoPhotoHelp || 'Take a photo if possible. It helps explain the demand.')
                  : (t.complaintPhotoHelp || 'A photo of the issue is required for complaints to enable verification.')}
              </p>

              {!attachedPhoto ? (
                <div className="space-y-3">
                  {/* Action Button: Take Photo (Direct In-App Camera) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="w-full py-3 px-4 rounded-xl bg-[#002B49] hover:bg-[#003961] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 group"
                    >
                      <Camera className="w-4 h-4 text-[#FF9933] group-hover:scale-110 transition-transform" />
                      <span>{t.takeGeoPhotoBtn || t.takePhotoBtn || 'Take Photo'}</span>
                    </button>
                  </div>

                  {/* Complaint Exception Checkbox: "I don't have a photo" */}
                  {requestType === 'complaint' && (
                    <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noPhotoExceptionChecked}
                          onChange={handleToggleNoPhotoCheckbox}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          {t.noPhotoCheckbox || "I don't have a photo"}
                        </span>
                      </label>

                      {noPhotoExceptionAcknowledged && (
                        <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 font-medium space-y-1 animate-fadeIn">
                          <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span>{t.noPhotoExceptionBadge || '⚠️ No Photo — Citizen Exception Active'}</span>
                          </div>
                          <p className="leading-snug">
                            {t.complaintVerifyVisitNote || 'Note: An authorized officer may visit your location to verify this complaint.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Attached Photo Preview Card with Geo-Tag Status */
                <div className="p-3.5 bg-white border border-emerald-300 rounded-xl space-y-2.5 shadow-2xs animate-fadeIn">
                  <div className="flex items-center justify-between">
                    {/* Geo-tag Status Badge */}
                    {attachedPhoto.locationCaptured ? (
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>📍 {t.locationCaptured || 'Location captured'}</span>
                        {attachedPhoto.photoLocation?.accuracy && (
                          <span className="text-[10px] text-emerald-600 font-mono">
                            (±{attachedPhoto.photoLocation.accuracy}m)
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-800 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚠️ {t.locationNotCaptured || 'Location not captured'}</span>
                      </span>
                    )}

                    {/* Remove Action */}
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center space-x-1 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.removePhotoBtn || 'Remove'}</span>
                    </button>
                  </div>

                  {/* Photo Thumbnail + Metadata */}
                  <div className="flex items-center space-x-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                      <img
                        src={attachedPhoto.dataUrl || attachedPhoto.data}
                        alt="Problem attachment preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800 truncate text-[11px]">
                        {attachedPhoto.name || 'Captured Photo'}
                      </p>
                      {attachedPhoto.locationCaptured && (
                        <p className="text-[11px] font-bold text-emerald-800 font-indic leading-snug">
                          📍 {attachedPhoto.photoLocation?.address || attachedPhoto.photoAddress || humanReadableAddress || 'Verified Location'}
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400">
                        {attachedPhoto.size ? `${(attachedPhoto.size / 1024).toFixed(0)} KB` : 'Image ready'} &bull; 📷 Camera
                        {attachedPhoto.photoLocation?.accuracy ? ` &bull; ±${attachedPhoto.photoLocation.accuracy}m` : ''}
                      </p>
                      {attachedPhoto.capturedAtFormatted && (
                        <p className="text-[10px] text-slate-500 font-medium">
                          Captured: {attachedPhoto.capturedAtFormatted}
                        </p>
                      )}
                      {!attachedPhoto.locationCaptured && (
                        <p className="text-[10px] text-amber-700 font-medium">
                          {t.locationNotFoundInPhoto || 'Location information was not found in this photo.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Retake Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center space-x-1 cursor-pointer hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.retakeBtn || 'Retake Photo'}</span>
                    </button>

                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Ready to submit
                    </span>
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-[10px] text-slate-400 font-medium leading-normal flex items-start space-x-1.5 pt-1">
                <span className="flex-shrink-0">🛡️</span>
                <span>{t.photoPrivacyNotice || 'Your photo and, if provided, its location may be viewed by authorized government officials handling this request.'}</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* BOTTOM FULL-WIDTH ACTIONS & ERROR (Col 12)                    */}
          {/* ============================================================== */}
          <div className="lg:col-span-12 space-y-4 pt-2 border-t border-slate-100">
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Big Action Button (➤ Send) */}
            <div>
              <button
                type="submit"
                disabled={!problemText.trim()}
                className={`w-full py-4 px-8 rounded-2xl font-black text-base text-white flex items-center justify-center space-x-3 shadow-lg transition-all ${
                  !problemText.trim()
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] cursor-pointer'
                }`}
              >
                <span>{t.sendBtn}</span>
                <Send className="w-5 h-5 text-[#FF9933]" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* In-App Camera Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          language={language}
          initialCoords={gpsCoords}
          humanReadableAddress={humanReadableAddress}
          citizenProfile={citizenProfile}
          onCaptureComplete={handleCameraCaptureComplete}
          onClose={() => setIsCameraModalOpen(false)}
        />
      )}

      {/* Explanatory Geo-Tag Help Modal */}
      {isHelpModalOpen && (
        <GeoTagHelpModal
          language={language}
          onClose={() => setIsHelpModalOpen(false)}
        />
      )}

      {/* Complaint No-Photo Warning Modal */}
      {isWarningModalOpen && (
        <ComplaintNoPhotoWarningModal
          language={language}
          onConfirm={handleConfirmNoPhotoException}
          onCancel={handleCancelNoPhotoException}
        />
      )}

      {/* Complaint Problem Location Map Picker Modal */}
      {isProblemMapModalOpen && (
        <ProblemLocationMapModal
          language={language}
          initialCoords={problemLocation || gpsCoords}
          citizenProfile={citizenProfile}
          onConfirmLocation={handleConfirmProblemLocationFromMap}
          onClose={() => setIsProblemMapModalOpen(false)}
        />
      )}
    </div>
  );
}
