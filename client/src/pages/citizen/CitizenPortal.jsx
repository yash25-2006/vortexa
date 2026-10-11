import React from 'react';
import CitizenForm from '../components/CitizenForm';
import { Sparkles, Languages, CheckCircle2, ShieldCheck, MapPin, Headphones } from 'lucide-react';

export default function CitizenPortal({ onSuccessfulSubmission }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
          <span>Direct Citizen-to-Government Intelligence Pipeline</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight">
          India Development Intelligence
        </h1>
        
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto">
          Your voice. Structured for development.
        </p>
        <p className="text-xs sm:text-sm text-slate-500 font-indic max-w-xl mx-auto">
          तुमची समस्या तुमच्या भाषेत सांगा &bull; अपनी समस्या अपनी भाषा में बताएं &bull; Report public infrastructure needs in your own language.
        </p>
      </div>

      {/* 3 Step Explanation Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
            1
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Report Issue</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Type or speak in Marathi, Hindi, or English using voice input.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
            2
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">AI Structuring</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Google Gemini converts unstructured feedback into classified intelligence.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
            3
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Gov Action</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Administrators view categorized demands on live maps & dashboards.
            </p>
          </div>
        </div>
      </div>

      {/* Main Citizen Form */}
      <CitizenForm onSuccessfulSubmission={onSuccessfulSubmission} />
    </div>
  );
}
