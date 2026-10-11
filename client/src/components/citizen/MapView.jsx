import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';

// Fix Leaflet default icon path issues in React Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically fit map bounds to valid markers
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ requests = [], onSelectRequest }) {
  // Filter requests that have valid coordinates
  const validRequests = requests.filter(
    (r) => r.latitude !== null && r.longitude !== null && !isNaN(r.latitude) && !isNaN(r.longitude)
  );

  // Center on India (or Maharashtra / Central India by default)
  const defaultCenter = [19.7515, 75.7139];
  const defaultZoom = 6;

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return '#E11D48'; // rose-600
      case 'High':
        return '#D97706'; // amber-600
      case 'Medium':
        return '#2563EB'; // blue-600
      case 'Low':
        return '#64748B'; // slate-500
      default:
        return '#0284C7';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#FF9933]" />
            <span>Geographic Distribution & Request Markers</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phase 1 Spatial Map Visualizer &bull; {validRequests.length} mapped development requests
          </p>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-semibold">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Critical</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <span>Medium</span>
          </span>
        </div>
      </div>

      <div className="w-full h-[400px] relative">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; Google Maps"
            url={`https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` : ''}`}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={21}
          />

          {validRequests.map((req) => (
            <CircleMarker
              key={req.id}
              center={[parseFloat(req.latitude), parseFloat(req.longitude)]}
              radius={8}
              pathOptions={{
                color: getUrgencyColor(req.urgency),
                fillColor: getUrgencyColor(req.urgency),
                fillOpacity: 0.85,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1 space-y-2 text-slate-800 text-xs max-w-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-extrabold text-[11px] text-[#002B49]">
                      {req.request_code || `REQ-${req.id}`}
                    </span>
                    <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                      {req.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{req.issue}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                      {req.ai_summary}
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Language: <b>{req.language}</b></span>
                    <span className="font-bold text-slate-700">Urgency: {req.urgency}</span>
                  </div>

                  <button
                    onClick={() => onSelectRequest && onSelectRequest(req)}
                    className="w-full mt-2 py-1 px-2 rounded bg-[#002B49] text-white text-[11px] font-semibold flex items-center justify-center space-x-1 cursor-pointer hover:bg-[#003961]"
                  >
                    <span>View Request Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Map Attribution Footer */}
        <div className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded shadow-xs border border-slate-200/80 text-[11px] font-semibold text-slate-700 pointer-events-none select-none flex items-center space-x-1">
          <span>Google Maps</span>
        </div>
      </div>
    </div>
  );
}
