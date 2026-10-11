import React from 'react';
import {
  Globe,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
  CloudOff,
  Cpu,
  Sparkles,
  Languages
} from 'lucide-react';
import { INDIAN_LANGUAGES } from '../../config/languages';

export default function BrowseMoreLanguagesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const activeLanguages = INDIAN_LANGUAGES.filter((l) => l.status === 'active');
  const pendingLanguages = INDIAN_LANGUAGES.filter((l) => l.status === 'pending_cloud');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-[#002B49] text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <CloudOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Google Cloud Language Services Not Connected
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Multilingual Speech, Translation & Dialogflow Integration
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Notice Box */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-amber-900 leading-snug">
                Additional languages will be available after Google Cloud Speech-to-Text, Text-to-Speech, Translation, and Dialogflow services are connected.
              </p>
              <p className="text-[11px] text-amber-800/90 font-medium">
                The platform architecture is structured to support 13+ official Indian languages with voice-first recognition, automatic intent parsing, and dialect synthesis once Google Cloud credentials are configured in the backend environment.
              </p>
            </div>
          </div>

          {/* Currently Active Languages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Currently Active Languages (3)</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live & Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {activeLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 block font-indic">
                      {lang.nativeName}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {lang.name}
                    </span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Languages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Languages className="w-3.5 h-3.5 text-blue-600" />
                <span>Upcoming Indian Languages via Google Cloud ({pendingLanguages.length})</span>
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                Pending Cloud Service
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {pendingLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block font-indic">
                      {lang.nativeName} ({lang.name})
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {lang.region}
                    </span>
                  </div>
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-300">
                    Google Cloud STT/TTS
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003961] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
