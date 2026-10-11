import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Sparkles, Filter, ExternalLink, Globe, Layers, Flame, Building2, ShieldCheck, ChevronRight } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATE_COORDINATES = {
  'Maharashtra': { center: [19.7515, 75.7139], zoom: 6 },
  'Assam': { center: [26.2006, 92.9376], zoom: 7 },
  'Rajasthan': { center: [27.0238, 74.2179], zoom: 6 },
  'Tamil Nadu': { center: [11.1271, 78.6569], zoom: 7 },
  'Uttar Pradesh': { center: [26.8467, 80.9462], zoom: 6.5 },
  'Karnataka': { center: [15.3173, 75.7139], zoom: 6.5 }
};

const DISTRICT_COORDINATES = {
  'Pune': [18.5204, 73.8567],
  'Nashik': [19.9975, 73.7898],
  'Nagpur': [21.1458, 79.0882],
  'Kolhapur': [16.7050, 74.2433],
  'Ratnagiri': [16.9902, 73.3120],
  'Solapur': [17.6599, 75.9064],
  'Latur': [18.4088, 76.5604],
  'Mumbai': [19.0760, 72.8777],
  'Kamrup': [26.2485, 91.5273],
  'Dibrugarh': [27.4728, 94.9120],
  'Jorhat': [26.7509, 94.2037],
  'Nagaon': [26.3500, 92.6800],
  'Jaipur': [26.9124, 75.7873],
  'Jodhpur': [26.2389, 73.0243],
  'Udaipur': [24.5854, 73.7125],
  'Madurai': [9.9252, 78.1198],
  'Coimbatore': [11.0168, 76.9558],
  'Salem': [11.6643, 78.1460],
  'Chennai': [13.0827, 80.2707]
};

function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function GovIndiaMap({
  activeState,
  selectedDistrict,
  markers = [],
  hotspots = [],
  selectedCategory,
  onSelectCategory,
  onSelectRequest,
  onSelectHotspot
}) {
  const [mapLayer, setMapLayer] = useState('all'); // 'all', 'hotspots_only'
  const stateConfig = STATE_COORDINATES[activeState] || STATE_COORDINATES['Maharashtra'];
  
  let targetCenter = stateConfig.center;
  let targetZoom = stateConfig.zoom;

  if (selectedDistrict && DISTRICT_COORDINATES[selectedDistrict]) {
    targetCenter = DISTRICT_COORDINATES[selectedDistrict];
    targetZoom = 9.5;
  }

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Map Card Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#002B49] text-white">
            <Globe className="w-4 h-4 text-[#FF9933]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-sm text-[#002B49] tracking-tight">
                {activeState} Spatial & Regional Intelligence Map
              </h3>
              {hotspots.length > 0 && (
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold border border-amber-300">
                  <Flame className="w-3 h-3 text-[#FF9933]" />
                  <span>{hotspots.length} Hotspots Active</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Click any cluster or marker to open complete regional authority context
            </p>
          </div>
        </div>

        {/* Layer Controls & Legend */}
        <div className="flex items-center space-x-2.5">
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-bold">
            <button
              onClick={() => setMapLayer('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mapLayer === 'all'
                  ? 'bg-white text-[#002B49] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Data ({markers.length})
            </button>
            <button
              onClick={() => setMapLayer('hotspots_only')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1 cursor-pointer ${
                mapLayer === 'hotspots_only'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3 h-3 text-[#FF9933]" />
              <span>Hotspots ({hotspots.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-[11px] font-semibold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
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
      </div>

      {/* Interactive Map Area */}
      <div className="flex-1 relative w-full h-[450px] sm:h-full min-h-[420px]">
        <MapContainer
          center={targetCenter}
          zoom={targetZoom}
          scrollWheelZoom={true}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapViewUpdater center={targetCenter} zoom={targetZoom} />
          
          <TileLayer
            attribution="&copy; Google Maps"
            url={`https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? `&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}` : ''}`}
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={21}
          />

          {/* 1. Hotspots Cluster Layer (High-Demand Clusters) */}
          {hotspots.map((hotspot) => (
            <React.Fragment key={`hotspot-${hotspot.regionId}`}>
              {/* Outer Pulsing Wave Ring */}
              <CircleMarker
                center={[hotspot.latitude, hotspot.longitude]}
                radius={24}
                pathOptions={{
                  color: '#FF9933',
                  fillColor: '#FF9933',
                  fillOpacity: 0.22,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              />

              {/* Core Hotspot Marker */}
              <CircleMarker
                center={[hotspot.latitude, hotspot.longitude]}
                radius={16}
                pathOptions={{
                  color: '#9A3412',
                  fillColor: '#EA580C',
                  fillOpacity: 0.9,
                  weight: 3
                }}
              >
                <Popup>
                  <div className="p-2 space-y-2.5 text-slate-800 text-xs max-w-xs font-sans">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] flex items-center space-x-1">
                        <Flame className="w-3 h-3 text-[#FF9933]" />
                        <span>Hotspot Cluster</span>
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">
                        {hotspot.totalRequests} Demands
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-[#002B49]">{hotspot.name}</h4>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {hotspot.ward || `${hotspot.district}, ${hotspot.state}`}
                      </p>
                    </div>

                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Civic Body:</span>
                        <span className="font-bold text-slate-800 truncate max-w-[140px]">
                          {hotspot.localGovernmentBody}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Top Issue:</span>
                        <span className="font-bold text-blue-700">{hotspot.topCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Representatives:</span>
                        <span className="font-bold text-emerald-700">
                          {hotspot.hasVerifiedRepresentatives ? 'Verified Public Data' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectHotspot && onSelectHotspot(hotspot.regionId)}
                      className="w-full py-2 px-3 rounded-lg bg-[#002B49] hover:bg-[#003961] text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>Open Regional Intelligence</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          ))}

          {/* 2. Individual Spatial Request Markers */}
          {mapLayer === 'all' && markers.map((item) => (
            <CircleMarker
              key={`marker-${item.id}`}
              center={[item.latitude, item.longitude]}
              radius={item.urgency === 'Critical' ? 9 : 7}
              pathOptions={{
                color: getUrgencyColor(item.urgency),
                fillColor: getUrgencyColor(item.urgency),
                fillOpacity: 0.85,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-1.5 space-y-2 text-slate-800 text-xs max-w-xs font-sans">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                    <span className="font-extrabold text-[11px] text-[#002B49] font-mono">
                      {item.requestCode || `REQ-${item.id}`}
                    </span>
                    <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {item.category}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{item.issue}</h4>
                    <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">
                      {item.aiSummary}
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-bold text-slate-800">{item.village || item.district}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Language:</span>
                      <span className="font-semibold text-slate-800">{item.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Urgency:</span>
                      <span className="font-bold text-rose-700">{item.urgency}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <button
                      onClick={() => onSelectRequest && onSelectRequest(item)}
                      className="w-full py-1.5 px-2 rounded-lg bg-[#002B49] hover:bg-[#003961] text-white text-[11px] font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <span>Inspect Request Details</span>
                      <ExternalLink className="w-3 h-3 text-[#FF9933]" />
                    </button>
                  </div>
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
