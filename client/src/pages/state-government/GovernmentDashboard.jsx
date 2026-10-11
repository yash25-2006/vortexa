import React, { useState, useEffect } from 'react';
import GovCategorySummary from '../../components/shared-government/GovCategorySummary';
import GovDistrictFilter from '../../components/state-government/GovDistrictFilter';
import GovStateDistrictMap, { STATE_DISTRICTS_DATA, calculateDistrictPriority } from '../../components/state-government/GovStateDistrictMap';
import GovCategoryRequestSummary from '../../components/shared-government/GovCategoryRequestSummary';
import GovRequestDetailModal from '../../components/shared-government/GovRequestDetailModal';
import GovRegionalIntelligencePanel from '../../components/shared-government/GovRegionalIntelligencePanel';
import {
  fetchGovDashboardSummary,
  fetchGovMapRequests,
  fetchRequests,
  fetchGovHotspots,
  fetchRegionalIntelligence
} from '../../services/api';
import {
  Landmark,
  MapPin,
  LogOut,
  User,
  ShieldCheck,
  AlertOctagon,
  Languages,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  Flame,
  Building2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const AVAILABLE_STATES = [
  'Maharashtra',
  'Assam',
  'Rajasthan',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Karnataka'
];

export default function GovernmentDashboard({ govUser, onLogout, onChangeState }) {
  const [activeState, setActiveState] = useState(govUser?.monitoringState || 'Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedUrgency, setSelectedUrgency] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize state if user's assigned state changes
  useEffect(() => {
    if (govUser?.monitoringState && govUser.monitoringState !== activeState) {
      setActiveState(govUser.monitoringState);
    }
  }, [govUser?.monitoringState]);

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [statewideSummary, setStatewideSummary] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Regional Intelligence Drawer State (Phase 2A)
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [regionalIntelligence, setRegionalIntelligence] = useState(null);
  const [isRegionalPanelLoading, setIsRegionalPanelLoading] = useState(false);
  const [regionalPanelError, setRegionalPanelError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, mapData, hotspotsData, reqData] = await Promise.all([
        fetchGovDashboardSummary(activeState, selectedDistrict, govUser?.email),
        fetchGovMapRequests(activeState, selectedDistrict, selectedCategory, selectedUrgency, govUser?.email),
        fetchGovHotspots(activeState, selectedDistrict, govUser?.email),
        fetchRequests({
          state: activeState,
          district: selectedDistrict,
          category: selectedCategory,
          urgency: selectedUrgency,
          search: searchTerm,
          limit: 100
        }, govUser?.email)
      ]);

      setSummary(sumData);
      if (!selectedDistrict || selectedDistrict === 'All Districts') {
        setStatewideSummary(sumData);
      }
      setMapMarkers(mapData || []);
      setHotspots(hotspotsData || []);
      setRequests(reqData.data || []);
      setTotalRequests(reqData.total || 0);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeState, selectedDistrict, selectedCategory, selectedUrgency, searchTerm]);

  const handleStateChange = (newState) => {
    setActiveState(newState);
    setSelectedDistrict('All Districts');
    setSelectedCategory('All');
    setStatewideSummary(null);
    setRegionalIntelligence(null);
    setSelectedRegionId(null);
    if (onChangeState) onChangeState(newState);
  };

  const handleResetFilters = () => {
    setSelectedDistrict('All Districts');
    setSelectedCategory('All');
    setSelectedUrgency('All');
    setSearchTerm('');
  };

  // Hotspot Click Handler: Resolves complete regional authority & representative data
  const handleSelectHotspot = async (regionId) => {
    setSelectedRegionId(regionId);
    setIsRegionalPanelLoading(true);
    setRegionalPanelError(null);

    try {
      const intel = await fetchRegionalIntelligence(regionId, govUser?.email);
      setRegionalIntelligence(intel);
    } catch (err) {
      console.error('Failed to load regional intelligence:', err);
      setRegionalPanelError(err.message || 'Could not load regional intelligence.');
    } finally {
      setIsRegionalPanelLoading(false);
    }
  };

  const criticalCount = ((summary?.byUrgency?.Critical || 0) + (summary?.byUrgency?.High || 0));

  return (
    <div className="min-h-screen bg-[#F4F6F9]/70 backdrop-blur-[1px] flex flex-col font-sans">
      {/* Official State Government Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* 1. Left Side: Government Emblem & Ministry/State Brand */}
          <div className="flex items-center space-x-3.5 flex-shrink-0">
            <img
              src="/gov-emblem.png"
              alt="Government of India"
              className="h-11 sm:h-12 w-auto object-contain drop-shadow-xs"
            />
            <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#002B49] text-white flex items-center justify-center shadow-inner">
                <Landmark className="w-4 h-4 text-[#FF9933]" />
              </div>
              <div className="leading-tight">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#002B49] block">
                  {activeState} State
                </span>
                <span className="text-[9px] text-slate-500 font-medium block">
                  Civic Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* 2. Center: Prominent Portal Title & Subtitle */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-base sm:text-lg md:text-xl font-black text-[#002B49] tracking-tight">
              State Development Intelligence Portal
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate max-w-xl mx-auto">
              Administrative Boundaries &bull; Responsible Civic Bodies &bull; Verified Representatives
            </p>
          </div>

          {/* 3. Right Side: Controls, Profile & Digital India Emblem */}
          <div className="flex items-center space-x-2.5 flex-shrink-0">
            {/* Region Selector */}
            {govUser?.role === 'admin' ? (
              <div className="relative hidden lg:block">
                <select
                  value={activeState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#002B49] cursor-pointer"
                >
                  {AVAILABLE_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-extrabold text-[#002B49]">
                <MapPin className="w-3 h-3 text-[#FF9933]" />
                <span>{activeState} Monitor</span>
              </div>
            )}

            {/* Officer Profile Badge */}
            <div className="hidden xl:flex items-center space-x-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <div className="text-left leading-tight">
                <p className="text-[11px] font-bold text-slate-800 truncate max-w-[130px]">{govUser?.name || 'Monitoring Officer'}</p>
                <p className="text-[9px] text-slate-400 font-medium">{govUser?.role || 'state_monitor'}</p>
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              title="Refresh Analytics"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />

            {/* Right Logo: Digital India */}
            <img
              src="/digital-india.png"
              alt="Digital India"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-xs"
            />
          </div>
        </div>

        {/* District Priority Hotspots Strip */}
        {(() => {
          const stateDistricts = STATE_DISTRICTS_DATA[activeState] || STATE_DISTRICTS_DATA['Maharashtra'] || [];
          if (!stateDistricts || stateDistricts.length === 0) return null;
          return (
            <div className="bg-amber-50/80 border-t border-amber-200/70 px-4 sm:px-6 lg:px-8 py-2">
              <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1 text-xs font-black text-amber-950 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-[#FF9933]" />
                    <span>District Priority Hotspots:</span>
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium hidden md:inline">
                    Active Civic Monitoring &bull; Demand Density Distribution
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {stateDistricts.slice(0, 7).map((d) => {
                    const calc = calculateDistrictPriority(d);
                    const score = typeof d.priorityScore === 'number'
                      ? d.priorityScore
                      : (typeof calc?.priorityScore === 'number' ? calc.priorityScore : 70.0);
                    const isHigh = score >= 75;
                    const isMod = score >= 60 && score < 75;
                    return (
                      <button
                        key={d.name}
                        onClick={() => setSelectedDistrict(selectedDistrict === d.name ? 'All Districts' : d.name)}
                        className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                          selectedDistrict === d.name
                            ? 'bg-[#002B49] text-white border-[#002B49]'
                            : 'bg-white hover:bg-amber-100/70 border-amber-300 text-slate-900'
                        }`}
                      >
                        <Building2 className={`w-3 h-3 ${selectedDistrict === d.name ? 'text-[#FF9933]' : 'text-[#002B49]'}`} />
                        <span>{d.name}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                          isHigh ? 'bg-rose-500 text-white' : isMod ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {String(score)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric KPI Cards (3 Clean Balanced Metric Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedDistrict && selectedDistrict !== 'All Districts' ? `${selectedDistrict} Demands` : 'Total Citizen Demands'}
            </p>
            <h3 className="text-2xl font-black text-[#002B49] mt-1">
              {summary ? summary.total : '—'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {selectedDistrict && selectedDistrict !== 'All Districts'
                ? `Active in ${selectedDistrict}, ${activeState}`
                : `Multilingual requests in ${activeState}`}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">High & Critical Urgency</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {summary ? criticalCount : '—'}
            </h3>
            <p className="text-[11px] text-rose-500 mt-1 font-medium">
              Require prompt regional intervention
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {selectedDistrict && selectedDistrict !== 'All Districts' ? 'District Context' : 'District Hotspots'}
            </p>
            <h3 className="text-2xl font-black text-amber-700 mt-1 flex items-center space-x-1.5">
              <span>{selectedDistrict && selectedDistrict !== 'All Districts' ? selectedDistrict : (STATE_DISTRICTS_DATA[activeState] || []).length}</span>
              <Flame className="w-5 h-5 text-[#FF9933]" />
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Active civic monitoring zones in {activeState}
            </p>
          </div>
        </div>

        {/* Interactive District Filter and Search */}
        <GovDistrictFilter
          activeState={activeState}
          districts={statewideSummary?.byDistrict || summary?.byDistrict || {}}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={setSelectedDistrict}
          selectedUrgency={selectedUrgency}
          onSelectUrgency={setSelectedUrgency}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReset={handleResetFilters}
          onResetFilters={handleResetFilters}
        />

        {/* 2-Column Responsive Layout: State District Map + (Category Intelligence Overview OR District Category Request Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Interactive State Map */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <GovStateDistrictMap
              activeState={activeState}
              districtSummary={statewideSummary?.byDistrict || summary?.byDistrict || {}}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(distName) => {
                setSelectedDistrict(distName);
              }}
            />
          </div>

          {/* Right Column: EITHER Statewide Category Intelligence Overview (no district selected) OR District Category Request Summary (district selected) */}
          <div className="lg:col-span-5 flex flex-col h-full">
            {(!selectedDistrict || selectedDistrict === 'All Districts') ? (
              <GovCategorySummary
                summary={summary}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            ) : (
              <GovCategoryRequestSummary
                activeState={activeState}
                selectedDistrict={selectedDistrict}
                selectedCategory={selectedCategory}
                requests={requests}
                isLoading={isLoading}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                onClose={() => {
                  setSelectedDistrict('All Districts');
                  setSelectedCategory('All');
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Regional Intelligence Panel Drawer (Phase 2A) */}
      {(selectedRegionId || isRegionalPanelLoading) && (
        <GovRegionalIntelligencePanel
          intelligence={regionalIntelligence}
          loading={isRegionalPanelLoading}
          error={regionalPanelError}
          onClose={() => {
            setSelectedRegionId(null);
            setRegionalIntelligence(null);
          }}
          onSelectRequest={(req) => setSelectedRequest(req)}
        />
      )}

      {/* Request Detail Inspection Modal */}
      {selectedRequest && (
        <GovRequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
