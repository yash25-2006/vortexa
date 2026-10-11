import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, X, Check, AlertCircle, Sparkles } from 'lucide-react';

/**
 * Live Camera Capture Component for Field Operations
 * Uses WebRTC getUserMedia with front/back camera toggling, canvas frame extraction, and JPEG compression.
 */
export default function LiveCameraModal({
  isOpen,
  onClose,
  onCapture,
  title = "Take Live Photo",
  t = {}
}) {
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (rear) or 'user' (front)
  const [cameraError, setCameraError] = useState('');
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    setIsInitializing(true);
    setCameraError('');
    
    // Stop any existing stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(t.cameraPermissionDenied || 'Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system.');
      } else {
        setCameraError(err.message || 'Unable to start camera. Please check camera access.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [facingMode, t.cameraPermissionDenied]);

  useEffect(() => {
    if (isOpen) {
      setCapturedPreview(null);
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode, startCamera]);

  // Flip camera mode
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture snapshot from video frame
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);
      // Export as compressed JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setCapturedPreview(dataUrl);
    }
  };

  // Confirm captured photo
  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  // Retake
  const handleRetake = () => {
    setCapturedPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Jan Setu On-Site Live Photo Verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="relative bg-black aspect-4/3 flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            <div className="relative w-full h-full">
              <img
                src={capturedPreview}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1 shadow-md">
                <Check className="w-3 h-3" />
                <span>Photo Captured</span>
              </div>
            </div>
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-rose-200 font-medium leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-600 transition-all cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viewfinder Crosshair Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 m-4 rounded-2xl flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-amber-400/50 rounded-lg"></div>
              </div>
              {isInitializing && (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">Opening Camera...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden Canvas for capture rendering */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between gap-3">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t.retakePhoto || "Retake"}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use This Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleToggleCamera}
                disabled={Boolean(cameraError) || isInitializing}
                className="p-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                title={t.switchCamera || "Switch Camera"}
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline text-[11px]">{t.switchCamera || "Flip"}</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={Boolean(cameraError) || isInitializing}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>{t.capturePhoto || "Capture Photo"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                {t.closeModal || "Cancel"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
