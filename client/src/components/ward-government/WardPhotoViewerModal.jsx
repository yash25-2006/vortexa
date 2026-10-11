import React from 'react';
import { X } from 'lucide-react';

export default function WardPhotoViewerModal({ photoViewer, onClose }) {
  if (!photoViewer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-md bg-white/20 text-xs font-mono font-black">
            {photoViewer.requestCode}
          </span>
          <span className="text-sm font-bold truncate max-w-xs sm:max-w-md">
            {photoViewer.title}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-4xl flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-white/10">
        <img
          src={photoViewer.url}
          alt="Citizen Evidence Full Screen"
          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl"
        />
      </div>

      <div className="pt-3 text-center">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
}
