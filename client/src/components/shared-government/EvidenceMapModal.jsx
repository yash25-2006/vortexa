import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Camera, ShieldCheck, Navigation } from 'lucide-react';

// Custom Photo Evidence Pin Marker Icon
const photoPinIcon = new L.DivIcon({
  className: 'custom-photo-pin-marker',
  html: `<div style="background-color: #002B49; color: #FF9933; border: 3px solid #10B981; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.45); font-size: 20px; cursor: pointer;">📸</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21]
});

function MapReloader({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 16, { animate: true });
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 400);
    }
  }, [center, map]);
  return null;
}

export default function EvidenceMapModal({ evidence, onClose }) {
  if (!evidence || !evidence.latitude || !evidence.longitude) return null;

  const lat = parseFloat(evidence.latitude);
  const lng = parseFloat(evidence.longitude);
  const accuracy = parseFloat(evidence.accuracy) || 15;
  const position = [lat, lng];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#002B49] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">
                Citizen Photo Evidence Location
              </h3>
              <p className="text-xs font-mono text-emerald-300 font-bold">
                {evidence.requestCode || 'Verified Citizen Capture'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Viewport */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-100">
          <MapContainer
            center={position}
            zoom={16}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
            attributionControl={false}
          >
            <TileLayer
              attribution="&copy; Google Maps"
              url={`https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` : ''}`}
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={21}
            />
            <MapReloader center={position} />

            {/* Accuracy Radius Circle */}
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{
                color: '#10B981',
                fillColor: '#10B981',
                fillOpacity: 0.18,
                weight: 2
              }}
            />

            {/* Exact GPS Pin Marker */}
            <Marker position={position} icon={photoPinIcon}>
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <strong className="block text-[#002B49]">📍 Verified Photo Location</strong>
                  <p className="text-slate-600">{evidence.title || 'Civic Issue'}</p>
                  <p className="font-mono text-[10px] text-slate-500">
                    Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    GPS Accuracy: ±{accuracy}m
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Map Attribution Footer */}
          <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded shadow-xs border border-slate-200/80 text-[11px] font-semibold text-slate-700 pointer-events-none select-none flex items-center space-x-1">
            <span>Google Maps</span>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-700 font-medium">
              <span>📅 <b>Captured:</b> {evidence.capturedAt || 'During request submission'}</span>
              <span>&bull;</span>
              <span className="text-emerald-800 font-bold">🎯 Accuracy: ±{accuracy}m</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003961] text-white font-bold text-xs transition-colors cursor-pointer self-end sm:self-auto"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
