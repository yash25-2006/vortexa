import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'Pune (Rural / Khed), Maharashtra', lat: 18.8475, lng: 73.9167 },
  { name: 'Nashik (Tribal / Ward 14), Maharashtra', lat: 19.9975, lng: 73.7898 },
  { name: 'Kolhapur (Rural), Maharashtra', lat: 16.7050, lng: 74.2433 },
  { name: 'Latur (APMC Market), Maharashtra', lat: 18.4088, lng: 76.5604 },
  { name: 'Ratnagiri (Konkan), Maharashtra', lat: 16.9902, lng: 73.3120 },
  { name: 'Mumbai (Dharavi / Urban), Maharashtra', lat: 19.0415, lng: 72.8550 },
  { name: 'Barabanki District, Uttar Pradesh', lat: 26.9274, lng: 81.1834 },
  { name: 'Lucknow Rural, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Patna District, Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Bengaluru Rural, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'New Delhi (Central)', lat: 28.6139, lng: 77.2090 },
];

export default function LocationPicker({ locationName, setLocationName, latitude, setLatitude, longitude, setLongitude }) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState(null);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus({ type: 'error', message: 'Geolocation is not supported by your browser.' });
      return;
    }

    setIsLocating(true);
    setGeoStatus({ type: 'info', message: 'Acquiring high-accuracy GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        if (!locationName) {
          setLocationName(`GPS Detected (${lat}, ${lng})`);
        }
        setIsLocating(false);
        setGeoStatus({ type: 'success', message: `Location verified: ${lat}, ${lng}` });
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsLocating(false);
        let msg = 'Could not access GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. You can select a preset or type your village/city below.';
        }
        setGeoStatus({ type: 'error', message: msg });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handlePresetSelect = (e) => {
    const selected = PRESET_LOCATIONS.find(loc => loc.name === e.target.value);
    if (selected) {
      setLocationName(selected.name);
      setLatitude(selected.lat);
      setLongitude(selected.lng);
      setGeoStatus({ type: 'success', message: `Selected ${selected.name}` });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-gov-saffron" />
          <span>Location / स्थान / ठिकाण</span>
        </label>
        
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md border border-blue-200 transition-colors w-fit"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Detecting GPS...' : 'Auto-Detect My GPS Location'}</span>
        </button>
      </div>

      {/* Quick Select Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <select
            onChange={handlePresetSelect}
            value={PRESET_LOCATIONS.some(p => p.name === locationName) ? locationName : ''}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
          >
            <option value="">-- Quick Pick Region / District --</option>
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Village, Taluka, Ward or Landmark"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#002B49] focus:outline-none"
          />
        </div>
      </div>

      {/* Coordinate Badges */}
      {latitude && longitude && (
        <div className="flex items-center space-x-2 text-[11px] text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="font-semibold text-slate-700">Coordinates:</span>
          <span>Lat {latitude}</span>
          <span>&bull;</span>
          <span>Lng {longitude}</span>
        </div>
      )}

      {/* Geostatus notifications */}
      {geoStatus && (
        <div className={`p-2 rounded text-xs flex items-center space-x-1.5 ${
          geoStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          geoStatus.type === 'error' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
          'bg-blue-50 text-blue-800'
        }`}>
          {geoStatus.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
          <span>{geoStatus.message}</span>
        </div>
      )}
    </div>
  );
}
