import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Check, Navigation, RefreshCw, Layers } from 'lucide-react';
import { TRANSLATIONS } from '../../constants/translations';
import { reverseGeocodeCoords } from '../../utils/reverseGeocoder';

// Custom Problem Pin Marker Icon (Distinct Red/Orange Problem Marker)
const problemPinIcon = new L.DivIcon({
  className: 'custom-problem-pin-marker',
  html: `<div style="background-color: #DC2626; color: white; border: 3px solid #FFFFFF; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(220, 38, 38, 0.6); font-size: 22px; cursor: grab;">📍</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// Component to handle map clicks for pin placement
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      if (e.latlng) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Component to recenter map view
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom() || 16, { animate: true });
      setTimeout(() => map.invalidateSize(), 150);
      setTimeout(() => map.invalidateSize(), 400);
    }
  }, [center, map]);
  return null;
}

export default function ProblemLocationMapModal({
  language = 'mr',
  initialCoords = null,
  citizenProfile = null,
  onConfirmLocation,
  onClose
}) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const defaultLat = initialCoords?.latitude || citizenProfile?.coordinates?.latitude || 18.5158;
  const defaultLng = initialCoords?.longitude || citizenProfile?.coordinates?.longitude || 73.7711;

  const [pinnedCoords, setPinnedCoords] = useState({ latitude: defaultLat, longitude: defaultLng });
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const markerRef = useRef(null);

  // Reverse geocode when pinned location changes
  const resolveAddressForCoords = async (lat, lng) => {
    setIsResolving(true);
    try {
      const geoResult = await reverseGeocodeCoords(lat, lng, citizenProfile);
      setResolvedAddress(geoResult.address || 'Location selected on map');
    } catch (err) {
      console.warn('Map geocoding error:', err);
      setResolvedAddress('Location selected on map');
    } finally {
      setIsResolving(false);
    }
  };

  useEffect(() => {
    resolveAddressForCoords(defaultLat, defaultLng);
  }, []);

  const handleMapClick = (lat, lng) => {
    const formattedLat = parseFloat(lat.toFixed(6));
    const formattedLng = parseFloat(lng.toFixed(6));
    setPinnedCoords({ latitude: formattedLat, longitude: formattedLng });
    resolveAddressForCoords(formattedLat, formattedLng);
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker != null) {
      const newPos = marker.getLatLng();
      const formattedLat = parseFloat(newPos.lat.toFixed(6));
      const formattedLng = parseFloat(newPos.lng.toFixed(6));
      setPinnedCoords({ latitude: formattedLat, longitude: formattedLng });
      resolveAddressForCoords(formattedLat, formattedLng);
    }
  };

  const handleConfirm = () => {
    onConfirmLocation({
      latitude: pinnedCoords.latitude,
      longitude: pinnedCoords.longitude,
      address: resolvedAddress || 'Location selected on map',
      source: 'map_selected',
      accuracy: 10
    });
  };

  const mapPosition = [pinnedCoords.latitude, pinnedCoords.longitude];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#002B49] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-indic">
                {t.markOnMapBtn || 'Mark Problem Location on Map'}
              </h3>
              <p className="text-xs text-slate-300 font-indic">
                {t.mapPinHelp || 'Click on the map or drag the pin to where the problem is located.'}
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

        {/* Map Viewport in Google Maps Satellite View */}
        <div className="relative w-full h-80 sm:h-96 bg-slate-100">
          <MapContainer
            center={mapPosition}
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
            <MapRecenter center={mapPosition} />
            <MapClickHandler onLocationSelect={handleMapClick} />

            {/* Draggable Problem Pin */}
            <Marker
              position={mapPosition}
              icon={problemPinIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
              ref={markerRef}
            />
          </MapContainer>

          {/* Map Attribution Footer */}
          <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded shadow-xs border border-slate-200/80 text-[11px] font-semibold text-slate-700 pointer-events-none select-none flex items-center space-x-1">
            <span>Google Maps</span>
          </div>

          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
            <div className="bg-slate-900/85 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg border border-white/20 flex items-center space-x-1.5 backdrop-blur-xs">
              <span>📍 Tap anywhere to place marker or drag pin</span>
            </div>
          </div>
        </div>

        {/* Resolved Location Card & Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3 flex-shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.problemLocationLabel || 'Selected Problem Location'}</span>
              </span>
              {isResolving && (
                <span className="text-[11px] text-blue-700 font-semibold flex items-center space-x-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Getting address...</span>
                </span>
              )}
            </div>

            <p className="text-xs font-bold text-slate-900 font-indic leading-snug">
              📍 {resolvedAddress || 'Resolving selected location...'}
            </p>

            <p className="text-[10px] text-slate-400 font-mono">
              Coordinates: {pinnedCoords.latitude.toFixed(6)}, {pinnedCoords.longitude.toFixed(6)}
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {t.cancelBtn || 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isResolving || !resolvedAddress}
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer ${
                isResolving || !resolvedAddress
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-rose-700 hover:bg-rose-800 active:scale-95'
              }`}
            >
              <Check className="w-4 h-4 text-white" />
              <span>{t.confirmProblemLocationBtn || 'Confirm Problem Location'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
