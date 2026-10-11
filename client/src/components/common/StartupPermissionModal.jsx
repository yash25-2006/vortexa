import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  Mic,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Languages
} from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';

const PERMISSION_TRANSLATIONS = {
  en: {
    title: "Before you continue",
    description: "This application needs a few permissions to provide location, camera and voice-based services. Please allow the required permissions to continue.",
    selectLanguage: "Select Language",
    locationTitle: "Location",
    locationSub: "Compulsory",
    locationPurposes: [
      "Citizen request location & address resolution",
      "Complaint problem location pinpointing",
      "Geo-tagging captured photos",
      "Interactive map and government development mapping"
    ],
    cameraTitle: "Camera",
    cameraPurposes: [
      "Taking complaint and demand evidence photos",
      "Geo-tagging captured photos with high accuracy"
    ],
    micTitle: "Microphone",
    micPurposes: [
      "Voice-based citizen requests and speech input"
    ],
    allowBtn: "Allow Permissions & Continue",
    requestingTitle: "Requesting Browser Permissions...",
    requestingHelp: "Please tap 'Allow' when your browser asks for Location, Camera, and Microphone access.",
    locationDeniedTitle: "Location Permission is Required",
    locationDeniedBody: "Location access is essential to attach the verified civic location to your requests and view local development plans. Please enable location access in your browser settings and tap retry.",
    retryLocationBtn: "Retry Location Permission",
    continueToAppBtn: "Continue to Portal",
    locationGrantedBadge: "Location Access Granted",
    camDeniedBadge: "Camera access was denied. You can still use the app, but photo evidence capture will be disabled.",
    micDeniedBadge: "Microphone access was denied. You can still type text requests."
  },
  hi: {
    title: "आगे बढ़ने से पहले",
    description: "यह एप्लिकेशन स्थान, कैमरा और ध्वनि-आधारित सेवाएं प्रदान करने के लिए कुछ अनुमतियों की आवश्यकता है। जारी रखने के लिए कृपया आवश्यक अनुमतियों की अनुमति दें।",
    selectLanguage: "भाषा चुनें (Select Language)",
    locationTitle: "स्थान (Location)",
    locationSub: "अनिवार्य",
    locationPurposes: [
      "नागरिक अनुरोध स्थान और पता निर्धारण",
      "शिकायत समस्या स्थान की सटीक पहचान",
      "फोटो जियो-टैगिंग",
      "इंटरैक्टिव मानचित्र और सरकारी विकास योजना मैपिंग"
    ],
    cameraTitle: "कैमरा (Camera)",
    cameraPurposes: [
      "शिकायत और मांग साक्ष्य फोटो खींचने के लिए",
      "सटीक जियो-टैग्ड फोटो कैप्चर"
    ],
    micTitle: "माइक्रोफ़ोन (Microphone)",
    micPurposes: [
      "ध्वनि-आधारित नागरिक अनुरोध और वॉयस इनपुट"
    ],
    allowBtn: "अनुमतियां दें और आगे बढ़ें",
    requestingTitle: "ब्राउज़र अनुमतियां मांगी जा रही हैं...",
    requestingHelp: "कृपया स्थान, कैमरा और माइक्रोफ़ोन के लिए 'Allow' (अनुमति दें) पर टैप करें।",
    locationDeniedTitle: "स्थान अनुमति अनिवार्य है",
    locationDeniedBody: "नागरिक अनुरोध दर्ज करने और स्थानीय विकास योजनाओं को देखने के लिए स्थान अनुमति आवश्यक है। कृपया ब्राउज़र सेटिंग्स में स्थान सक्षम करें और पुनः प्रयास करें।",
    retryLocationBtn: "स्थान अनुमति पुनः प्रयास करें",
    continueToAppBtn: "पोर्टल पर जारी रखें",
    locationGrantedBadge: "स्थान अनुमति स्वीकृत",
    camDeniedBadge: "कैमरा अनुमति अस्वीकृत है। फोटो साक्ष्य विकल्प अक्षम रहेगा।",
    micDeniedBadge: "माइक्रोफ़ोन अनुमति अस्वीकृत है। आप लिखकर समस्या दर्ज कर सकते हैं।"
  },
  mr: {
    title: "पुढे जाण्यापूर्वी",
    description: "स्थान, कॅमेरा आणि व्हॉईस-आधारित सेवा प्रदान करण्यासाठी या ॲप्लिकेशनला काही परवानग्यांची आवश्यकता आहे. पुढे जाण्यासाठी कृपया आवश्यक परवानग्यांना अनुमती द्या.",
    selectLanguage: "भाषा निवडा (Select Language)",
    locationTitle: "स्थान (Location)",
    locationSub: "अनिवार्य",
    locationPurposes: [
      "नागरिक मागणीचे अचूक स्थान व पत्ता निश्चित करणे",
      "तक्रारीचे समस्या ठिकाण अचूक नोंदवणे",
      "फोटो जिओ-टॅगिंग जोडणे",
      "नकाशा व शासकीय विकास योजना मॅपिंग"
    ],
    cameraTitle: "कॅमेरा (Camera)",
    cameraPurposes: [
      "तक्रार व विकास मागणीचे पुरावा फोटो काढण्यासाठी",
      "अचूक जिओ-टॅग्ड फोटो कॅप्चर करण्यासाठी"
    ],
    micTitle: "मायक्रोफोन (Microphone)",
    micPurposes: [
      "व्हॉईस-आधारित नागरिक मागणी व बोलून समस्या नोंदवणे"
    ],
    allowBtn: "परवानग्या द्या व पुढे जा",
    requestingTitle: "ब्राउझर परवानग्या विचारत आहे...",
    requestingHelp: "कृपया स्थान, कॅमेरा आणि मायक्रोफोनसाठी ब्राउझर प्रॉम्प्टवर 'Allow' (परवानगी द्या) वर टॅप करा.",
    locationDeniedTitle: "स्थान (Location) परवानगी अनिवार्य आहे",
    locationDeniedBody: "नागरिक समस्या नोंदवण्यासाठी आणि स्थानिक विकास योजना पाहण्यासाठी स्थान परवानगी आवश्यक आहे. कृपया ब्राउझरमध्ये लोकेशन सुरू करून पुन्हा प्रयत्न करा.",
    retryLocationBtn: "स्थान परवानगी पुन्हा प्रयत्न करा",
    continueToAppBtn: "पोर्टलवर पुढे जा",
    locationGrantedBadge: "स्थान परवानगी मिळाली",
    camDeniedBadge: "कॅमेरा परवानगी नाकारली आहे. फोटो पुरावा पर्याय बंद राहील.",
    micDeniedBadge: "मायक्रोफोन परवानगी नाकारली आहे. आपण लिहून समस्या नोंदवू शकता."
  }
};

import BrowseMoreLanguagesModal from './BrowseMoreLanguagesModal';

export default function StartupPermissionModal({
  initialLanguage = 'mr',
  onPermissionsGranted
}) {
  const [selectedLang, setSelectedLang] = useState(initialLanguage);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const pt = PERMISSION_TRANSLATIONS[selectedLang] || PERMISSION_TRANSLATIONS.en;

  const [step, setStep] = useState('prompt'); // 'prompt' | 'requesting' | 'location_denied' | 'partial_status'
  const [locationStatus, setLocationStatus] = useState('pending'); // 'pending' | 'granted' | 'denied'
  const [cameraStatus, setCameraStatus] = useState('pending');     // 'pending' | 'granted' | 'denied'
  const [micStatus, setMicStatus] = useState('pending');           // 'pending' | 'granted' | 'denied'
  const [capturedCoords, setCapturedCoords] = useState(null);

  const handleLanguageSelect = (langCode) => {
    setSelectedLang(langCode);
    try {
      localStorage.setItem('idip_language', langCode);
      sessionStorage.setItem('idip_language', langCode);
    } catch (e) {
      // ignore
    }
  };

  // Trigger real browser device APIs upon clicking Continue
  const handleRequestAllPermissions = async () => {
    setStep('requesting');

    let isLocGranted = false;
    let isCamGranted = false;
    let isMicGranted = false;
    let coords = null;

    // 1. Geolocation Request
    const locPromise = new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        resolve({ granted: false, coords: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = {
            latitude: parseFloat(pos.coords.latitude.toFixed(6)),
            longitude: parseFloat(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy || 15),
            capturedAt: new Date().toISOString()
          };
          setLocationStatus('granted');
          setCapturedCoords(c);
          resolve({ granted: true, coords: c });
        },
        (err) => {
          console.warn('Startup geolocation prompt result:', err.message);
          setLocationStatus('denied');
          resolve({ granted: false, coords: null });
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });

    // 2. Media Permissions Request (Camera & Microphone)
    const mediaPromise = (async () => {
      let cam = false;
      let mic = false;

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach((track) => track.stop());
          cam = true;
          mic = true;
        } catch (errBoth) {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
            vStream.getTracks().forEach((track) => track.stop());
            cam = true;
          } catch (e) {
            cam = false;
          }

          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            aStream.getTracks().forEach((track) => track.stop());
            mic = true;
          } catch (e) {
            mic = false;
          }
        }
      }

      setCameraStatus(cam ? 'granted' : 'denied');
      setMicStatus(mic ? 'granted' : 'denied');
      return { cam, mic };
    })();

    const [locResult, mediaResult] = await Promise.all([locPromise, mediaPromise]);
    isLocGranted = locResult.granted;
    coords = locResult.coords;
    isCamGranted = mediaResult.cam;
    isMicGranted = mediaResult.mic;

    if (!isLocGranted) {
      setStep('location_denied');
    } else {
      if (!isCamGranted || !isMicGranted) {
        setStep('partial_status');
      } else {
        onPermissionsGranted({
          locationGranted: true,
          cameraGranted: true,
          micGranted: true,
          coords,
          language: selectedLang
        });
      }
    }
  };

  const handleRetryLocation = () => {
    setStep('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy || 15),
          capturedAt: new Date().toISOString()
        };
        setLocationStatus('granted');
        setCapturedCoords(c);

        onPermissionsGranted({
          locationGranted: true,
          cameraGranted: cameraStatus === 'granted',
          micGranted: micStatus === 'granted',
          coords: c,
          language: selectedLang
        });
      },
      (err) => {
        console.warn('Retry location error:', err.message);
        setLocationStatus('denied');
        setStep('location_denied');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleFinishPartial = () => {
    if (locationStatus === 'granted') {
      onPermissionsGranted({
        locationGranted: true,
        cameraGranted: cameraStatus === 'granted',
        micGranted: micStatus === 'granted',
        coords: capturedCoords,
        language: selectedLang
      });
    } else {
      setStep('location_denied');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Top Tricolor Strip */}
        <div className="h-1.5 w-full flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#002B49] text-white px-6 py-5 text-center relative border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center mb-2 border border-white/20">
            <ShieldCheck className="w-7 h-7 text-[#FF9933]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight font-indic">
            {pt.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1.5 font-medium font-indic leading-relaxed">
            {pt.description}
          </p>
        </div>

        {/* Language Selector at the Top of Modal Body */}
        <div className="px-6 pt-5 pb-2 bg-slate-50 border-b border-slate-200">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5 flex items-center space-x-1.5">
            <Languages className="w-3.5 h-3.5 text-[#002B49]" />
            <span>{pt.selectLanguage}</span>
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-200 p-1 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => handleLanguageSelect('en')}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                selectedLang === 'en'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSelect('hi')}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                selectedLang === 'hi'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => handleLanguageSelect('mr')}
              className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer ${
                selectedLang === 'mr'
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              मराठी
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsBrowseModalOpen(true)}
              className="text-[11px] font-bold text-[#002B49] hover:text-[#004b80] hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Browse More Languages (10+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Browse More Languages Modal */}
        <BrowseMoreLanguagesModal
          isOpen={isBrowseModalOpen}
          onClose={() => setIsBrowseModalOpen(false)}
        />

        {/* Modal Body: 3 Required Permissions */}
        <div className="p-6 space-y-3.5 overflow-y-auto max-h-[60vh]">
          {step === 'prompt' && (
            <>
              {/* Permission 1: Location */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start space-x-3.5">
                <div className="p-2 bg-blue-600 rounded-xl text-white mt-0.5 flex-shrink-0 shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">
                      {pt.locationTitle}
                    </h4>
                    <span className="text-[10px] font-extrabold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full">
                      {pt.locationSub}
                    </span>
                  </div>
                  <ul className="text-xs text-slate-600 font-indic mt-1.5 space-y-1">
                    {pt.locationPurposes.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Permission 2: Camera */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3.5">
                <div className="p-2 bg-[#002B49] rounded-xl text-white mt-0.5 flex-shrink-0 shadow-2xs">
                  <Camera className="w-5 h-5 text-[#FF9933]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    {pt.cameraTitle}
                  </h4>
                  <ul className="text-xs text-slate-600 font-indic mt-1.5 space-y-1">
                    {pt.cameraPurposes.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-slate-600 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Permission 3: Microphone */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-3.5">
                <div className="p-2 bg-emerald-700 rounded-xl text-white mt-0.5 flex-shrink-0 shadow-2xs">
                  <Mic className="w-5 h-5 text-emerald-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    {pt.micTitle}
                  </h4>
                  <ul className="text-xs text-slate-600 font-indic mt-1.5 space-y-1">
                    {pt.micPurposes.map((p, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-700 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRequestAllPermissions}
                  className="w-full py-4 px-6 rounded-2xl bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <span>{pt.allowBtn}</span>
                  <ChevronRight className="w-5 h-5 text-[#FF9933]" />
                </button>
              </div>
            </>
          )}

          {step === 'requesting' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-[#002B49] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-900 text-base font-indic">
                  {pt.requestingTitle}
                </h4>
                <p className="text-xs text-slate-500 font-indic">
                  {pt.requestingHelp}
                </p>
              </div>
            </div>
          )}

          {step === 'location_denied' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <div className="flex items-center space-x-2 text-rose-900 font-extrabold text-sm">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>{pt.locationDeniedTitle}</span>
                </div>
                <p className="text-xs text-rose-800 font-medium font-indic leading-relaxed">
                  {pt.locationDeniedBody}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetryLocation}
                className="w-full py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{pt.retryLocationBtn}</span>
              </button>
            </div>
          )}

          {step === 'partial_status' && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{pt.locationGrantedBadge}</span>
              </div>

              {cameraStatus === 'denied' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    <span>Camera Permission</span>
                  </span>
                  <p className="text-[11px] text-slate-500 font-indic">
                    {pt.camDeniedBadge}
                  </p>
                </div>
              )}

              {micStatus === 'denied' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Mic className="w-3.5 h-3.5 text-slate-600" />
                    <span>Microphone Permission</span>
                  </span>
                  <p className="text-[11px] text-slate-500 font-indic">
                    {pt.micDeniedBadge}
                  </p>
                </div>
              )}

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={handleFinishPartial}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#002B49] hover:bg-[#003961] text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                >
                  <span>{pt.continueToAppBtn}</span>
                  <ChevronRight className="w-5 h-5 text-[#FF9933]" />
                </button>

                {(cameraStatus === 'denied' || micStatus === 'denied') && (
                  <button
                    type="button"
                    onClick={handleRequestAllPermissions}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Retry Camera &amp; Microphone Permissions
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
