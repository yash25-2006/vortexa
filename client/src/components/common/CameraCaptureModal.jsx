import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';
import { reverseGeocodeCoords } from '../../utils/reverseGeocoder';

export default function CameraCaptureModal({
  language,
  initialCoords = null,
  humanReadableAddress = '',
  citizenProfile = null,
  onCaptureComplete,
  onClose
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Camera & Stream States
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isInitializing, setIsInitializing] = useState(true);

  // Location / Geo-tag States (Automatic via already-granted startup permission)
  const [isLocating, setIsLocating] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(Boolean(initialCoords));
  const [locationCoords, setLocationCoords] = useState(
    initialCoords
      ? {
          latitude: initialCoords.latitude,
          longitude: initialCoords.longitude,
          accuracy: initialCoords.accuracy || 10,
          capturedAt: new Date().toISOString()
        }
      : null
  );
  const [photoAddress, setPhotoAddress] = useState(humanReadableAddress || '');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Captured Photo State
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const [captureTimestamp, setCaptureTimestamp] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Automatically acquire/refresh GPS coordinates in background without any popup
  useEffect(() => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: parseFloat(pos.coords.latitude.toFixed(6)),
            longitude: parseFloat(pos.coords.longitude.toFixed(6)),
            accuracy: Math.round(pos.coords.accuracy || 10),
            capturedAt: new Date().toISOString()
          };
          setLocationCoords(coords);
          setLocationCaptured(true);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Background GPS update note:', err.message);
          if (initialCoords) {
            setLocationCoords({
              latitude: initialCoords.latitude,
              longitude: initialCoords.longitude,
              accuracy: initialCoords.accuracy || 15,
              capturedAt: new Date().toISOString()
            });
            setLocationCaptured(true);
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [initialCoords]);

  // 2. Start Camera Stream
  const startCamera = async (mode = facingMode) => {
    setIsInitializing(true);
    setCameraError('');

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser.');
      }

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (errMode) {
        console.warn('Facing mode constraint failed, falling back to default video:', errMode);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      setCameraError(t.cameraNotOpened || 'Camera could not be opened.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Start camera on mount
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  // Connect stream to video element whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Toggle Camera (Front / Back)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // 3. Capture Photo from Video Frame
  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const now = new Date();
    setCapturedPhotoUrl(dataUrl);
    setCaptureTimestamp(now);

    // If location was captured, update capture timestamp & perform reverse geocoding
    if (locationCoords) {
      const updatedCoords = {
        ...locationCoords,
        capturedAt: now.toISOString()
      };
      setLocationCoords(updatedCoords);

      // Perform reverse geocoding for precise human-readable address
      if (updatedCoords.latitude && updatedCoords.longitude) {
        setIsGeocoding(true);
        reverseGeocodeCoords(updatedCoords.latitude, updatedCoords.longitude, citizenProfile)
          .then((res) => {
            if (res && res.address && res.address !== 'Address temporarily unavailable') {
              setPhotoAddress(res.address);
            } else if (humanReadableAddress) {
              setPhotoAddress(humanReadableAddress);
            } else {
              setPhotoAddress(res?.address || 'Address temporarily unavailable');
            }
            setIsGeocoding(false);
          })
          .catch((err) => {
            console.warn('Photo reverse geocode error:', err);
            setPhotoAddress(humanReadableAddress || 'Address temporarily unavailable');
            setIsGeocoding(false);
          });
      }
    }

    // Stop camera stream while previewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // 4. Retake Photo
  const handleRetake = () => {
    setCapturedPhotoUrl(null);
    setCaptureTimestamp(null);
    setPhotoAddress(humanReadableAddress || '');
    setIsGeocoding(false);
    startCamera(facingMode);
  };

  // 5. Accept & Use Photo
  const handleAcceptPhoto = () => {
    if (!capturedPhotoUrl) return;

    const captureTime = captureTimestamp || new Date();
    const finalAddress = photoAddress || humanReadableAddress || 'Verified Location';

    const photoPayload = {
      dataUrl: capturedPhotoUrl,
      data: capturedPhotoUrl,
      name: `CAMERA-GEO-${captureTime.getTime()}.jpg`,
      size: Math.round(capturedPhotoUrl.length * 0.75),
      type: 'image/jpeg',
      source: 'camera',
      locationCaptured: locationCaptured,
      photoAddress: finalAddress,
      photoLocation: locationCaptured && locationCoords ? {
        latitude: locationCoords.latitude,
        longitude: locationCoords.longitude,
        accuracy: locationCoords.accuracy,
        address: finalAddress,
        capturedAt: locationCoords.capturedAt || captureTime.toISOString()
      } : null,
      capturedAtFormatted: captureTime.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };

    onCaptureComplete(photoPayload);
    onClose();
  };

  // Format Date Helper
  const formatTimestamp = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white z-10 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-gov-saffron" />
            <span className="font-extrabold text-sm tracking-wide">
              {capturedPhotoUrl ? 'Photo Preview' : 'Camera Capture'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Viewport: Live Stream or Photo Preview */}
        <div className="relative flex-1 bg-black min-h-[320px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            /* Camera Error / Fallback Card */
            <div className="p-6 text-center space-y-4 max-w-sm text-white animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-base">
                  {t.cameraNotOpened || 'Camera could not be opened.'}
                </h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Camera permission may be blocked or unavailable on this device. Please allow camera permissions in your browser.
                </p>
              </div>

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-3 px-4 rounded-xl bg-[#002B49] hover:bg-[#003961] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-[#FF9933]" />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : capturedPhotoUrl ? (
            /* Captured Photo Preview */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-black animate-fadeIn">
              <img
                src={capturedPhotoUrl}
                alt="Captured Issue"
                className="max-h-[50vh] sm:max-h-[55vh] max-w-full object-contain"
              />

              {/* Reverse-Geocoded Address Overlay in Preview */}
              <div className="w-full px-3 py-2.5 bg-slate-900/95 border-t border-slate-800 text-white flex-shrink-0 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Location / पत्ता:</span>
                  </span>
                  {locationCoords?.accuracy && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      GPS Accuracy ±{locationCoords.accuracy}m
                    </span>
                  )}
                </div>

                {isGeocoding ? (
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-300 py-0.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>📍 Getting your location...</span>
                  </div>
                ) : photoAddress && photoAddress !== 'Address temporarily unavailable' ? (
                  <p className="text-xs sm:text-sm font-bold text-emerald-300 font-indic leading-snug">
                    📍 {photoAddress}
                  </p>
                ) : locationCaptured ? (
                  <p className="text-xs font-semibold text-slate-300 font-indic">
                    📍 Location captured &bull; Address temporarily unavailable
                  </p>
                ) : (
                  <p className="text-xs text-amber-300 font-semibold">
                    ⚠️ Location not captured
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[65vh] object-cover"
              />

              {/* Live Overlay: Automatic GPS Status & Switch Camera */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                {locationCaptured ? (
                  <span className="px-3 py-1 rounded-full bg-black/60 text-emerald-400 text-[11px] font-bold backdrop-blur-sm flex items-center space-x-1 border border-emerald-500/40 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>📍 GPS Active</span>
                    {locationCoords?.accuracy && (
                      <span className="text-[10px] text-emerald-300 font-mono">
                        (±{locationCoords.accuracy}m)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-black/60 text-slate-300 text-[10px] font-medium backdrop-blur-sm">
                    {isLocating ? 'Acquiring GPS...' : 'GPS Active'}
                  </span>
                )}

                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-sm transition-transform active:scale-90 cursor-pointer"
                  title="Switch Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder crosshairs */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border border-white/20 rounded-2xl flex items-center justify-center">
                  <div className="w-3 h-3 border-t border-l border-white/60 -mt-1 -ml-1 self-start"></div>
                  <div className="w-3 h-3 border-t border-r border-white/60 -mt-1 -mr-1 self-start ml-auto"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Controls Area */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col space-y-3 flex-shrink-0 text-white">
          {capturedPhotoUrl ? (
            /* Action Buttons for Preview State */
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>{t.capturedAtLabel || 'Captured at:'}</span>
                <span className="font-mono font-bold text-slate-300">
                  {formatTimestamp(captureTimestamp)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.retakeBtn || 'Retake'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptPhoto}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.usePhotoBtn || 'Use Photo'}</span>
                </button>
              </div>
            </div>
          ) : !cameraError ? (
            /* Capture Button for Live Camera State */
            <div className="flex items-center justify-center py-1">
              <button
                type="button"
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 active:scale-95 border-4 border-emerald-500 flex items-center justify-center shadow-xl transition-all cursor-pointer group"
                title="Capture Photo"
              >
                <div className="w-11 h-11 rounded-full bg-emerald-600 group-hover:bg-emerald-500 transition-colors flex items-center justify-center text-white">
                  <Camera className="w-6 h-6" />
                </div>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
