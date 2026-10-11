import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HardHat,
  Truck,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  MapPin,
  Building2,
  Clock,
  Layers,
  FileCheck2,
  Users,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  Send,
  Play,
  FileText,
  Camera,
  Eye,
  ShieldAlert,
  Loader2,
  X,
  Activity,
  CheckCheck,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Award,
  Timer,
  Globe,
  Languages,
  ChevronDown,
  Star
} from 'lucide-react';
import { fetchTeamTasks, startTeamTask, completeTeamTask, fetchTeamRatings } from '../../services/api';
import LiveCameraModal from '../../components/field-team/LiveCameraModal';
import {
  FIELD_TEAM_TRANSLATIONS,
  getTranslatedCitizenText,
  getLocalizedCategory,
  getLocalizedUrgency,
  getLocalizedStatus
} from '../../constants/fieldTeamTranslations';

// Helper to format resolution duration between two ISO timestamps
function formatResolutionTime(startIso, endIso) {
  if (!startIso || !endIso) return 'N/A';
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMs = Math.max(0, end - start);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${Math.max(1, mins)} mins`;
}

import demoPhotosData from '../../data/demoPhotos.json';
import indicLanguagesData from '../../data/languages.json';

const DEMO_BEFORE_PHOTOS = demoPhotosData.beforePhotos || [];
const DEMO_AFTER_PHOTOS = demoPhotosData.afterPhotos || [];
const ALL_INDIC_LANGUAGES = indicLanguagesData || [];

export default function FieldTeamDashboard({
  user,
  onLogout
}) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [teamRatingsSummary, setTeamRatingsSummary] = useState({
    totalCompleted: 0,
    ratedCount: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [ratingsOriginalLangMap, setRatingsOriginalLangMap] = useState({});

  // Multilingual Language State (User-scoped persistence)
  const [teamLanguage, setTeamLanguage] = useState(() => {
    return localStorage.getItem('jan_setu_field_team_lang') || 'en';
  });
  const [isBrowseLanguagesOpen, setIsBrowseLanguagesOpen] = useState(false);

  // Active translation dictionary
  const t = FIELD_TEAM_TRANSLATIONS[teamLanguage] || FIELD_TEAM_TRANSLATIONS.en;

  const handleLanguageChange = (langCode) => {
    setTeamLanguage(langCode);
    localStorage.setItem('jan_setu_field_team_lang', langCode);
    setIsBrowseLanguagesOpen(false);
  };

  // Start Task Modal State
  const [startTaskModal, setStartTaskModal] = useState(null); // task object
  const [beforePhoto, setBeforePhoto] = useState('');
  const [startNotes, setStartNotes] = useState('');
  const [isStartingTask, setIsStartingTask] = useState(false);
  const [startPhotoError, setStartPhotoError] = useState('');

  // Complete Task Modal State
  const [completeTaskModal, setCompleteTaskModal] = useState(null); // task object
  const [afterPhoto, setAfterPhoto] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [completePhotoError, setCompletePhotoError] = useState('');

  // Live Camera Modal State
  const [cameraModalConfig, setCameraModalConfig] = useState({
    isOpen: false,
    mode: null, // 'BEFORE' or 'AFTER'
    title: ''
  });

  // File input refs
  const beforeFileInputRef = useRef(null);
  const afterFileInputRef = useRef(null);

  const teamCode = user?.teamCode || user?.username || 'PMC-ROADS-01';
  const teamName = user?.teamName || user?.name || 'Municipal Field Squad';
  const department = user?.department || 'Municipal Public Works Department';
  const category = user?.category || 'Roads & Transport';
  const leadOfficer = user?.leadOfficer || user?.name || 'Field Officer';
  const wardName = user?.monitoringWard || 'Ward 10 – Bavdhan / Bhusari Colony';
  const districtName = user?.monitoringDistrict || 'Pune';
  const stateName = user?.monitoringState || 'Maharashtra';
  const jurisdiction = user?.jurisdiction || `${wardName} • ${districtName}`;
  const unitSize = user?.unitSize || '6 Field Technicians';
  const activeStatus = user?.activeStatus || 'Active on Duty';

  const loadTasks = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      const data = await fetchTeamTasks(
        {
          teamId: teamCode,
          category: category !== 'All' ? category : null
        },
        user?.email
      );
      setTasks(data || []);

      // Fetch team ratings & performance summary
      try {
        const ratingsRes = await fetchTeamRatings(
          {
            teamId: teamCode,
            category: category !== 'All' ? category : null
          },
          user?.email
        );
        if (ratingsRes && ratingsRes.summary) {
          setTeamRatingsSummary(ratingsRes.summary);
        }
      } catch (rateErr) {
        console.warn('Could not load team ratings:', rateErr);
      }
    } catch (err) {
      console.error('Error fetching team tasks:', err);
      setError('Could not load assigned tasks. Please try again or check network.');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [teamCode, category, user?.email]);

  useEffect(() => {
    loadTasks(true);
  }, [loadTasks]);

  // Open "Start Task" modal
  const handleOpenStartModal = (task) => {
    setStartTaskModal(task);
    setBeforePhoto(task.before_photo_url || '');
    setStartNotes('');
    setStartPhotoError('');
  };

  // Open "Complete Task" modal
  const handleOpenCompleteModal = (task) => {
    setCompleteTaskModal(task);
    setAfterPhoto(task.after_photo_url || '');
    setCompletionNotes('');
    setCompletePhotoError('');
  };

  // Open Live Camera Modal
  const handleOpenLiveCamera = (mode) => {
    const modalTitle = mode === 'BEFORE' 
      ? (t.startTaskModalTitle || "Capture Before Photo") 
      : (t.completeTaskModalTitle || "Capture After Photo");
    setCameraModalConfig({
      isOpen: true,
      mode,
      title: modalTitle
    });
  };

  // Handle Camera Capture Success
  const handleCameraCapture = (dataUrl) => {
    if (cameraModalConfig.mode === 'BEFORE') {
      setBeforePhoto(dataUrl);
      setStartPhotoError('');
    } else if (cameraModalConfig.mode === 'AFTER') {
      setAfterPhoto(dataUrl);
      setCompletePhotoError('');
    }
    setCameraModalConfig({ isOpen: false, mode: null, title: '' });
  };

  // Handle Photo File Upload & Compression
  const handlePhotoFileChange = (e, setPhotoFn, setErrorFn) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorFn('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoFn(compressedDataUrl);
        setErrorFn('');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submit "Start Task" (Assigned -> In Progress)
  const handleSubmitStartTask = async (e) => {
    if (e) e.preventDefault();
    if (!startTaskModal) return;

    if (!beforePhoto || !beforePhoto.trim()) {
      setStartPhotoError('Before photo is required to start this task.');
      return;
    }

    setIsStartingTask(true);
    setStartPhotoError('');

    try {
      const res = await startTeamTask(
        startTaskModal.id,
        {
          beforePhoto: beforePhoto.trim(),
          notes: startNotes.trim() || 'Work started on-site by field team.'
        },
        user?.email
      );

      const updated = res.data;
      setActionSuccessMsg(`Task ${updated.task_code || updated.request_code} is now IN PROGRESS!`);

      // Update local task list
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated, status: 'In Progress', before_photo_url: beforePhoto } : t))
      );

      if (selectedTask && selectedTask.id === updated.id) {
        setSelectedTask({ ...selectedTask, ...updated, status: 'In Progress', before_photo_url: beforePhoto });
      }

      setStartTaskModal(null);
      setBeforePhoto('');
      setStartNotes('');

      setTimeout(() => {
        setActionSuccessMsg('');
      }, 6000);
    } catch (err) {
      console.error('Error starting task:', err);
      setStartPhotoError(err.message || 'Failed to start task. Please try again.');
    } finally {
      setIsStartingTask(false);
    }
  };

  // Submit "Complete Task" (In Progress -> Completed)
  const handleSubmitCompleteTask = async (e) => {
    if (e) e.preventDefault();
    if (!completeTaskModal) return;

    if (!afterPhoto || !afterPhoto.trim()) {
      setCompletePhotoError('After photo is required to complete this task.');
      return;
    }

    setIsCompletingTask(true);
    setCompletePhotoError('');

    try {
      const res = await completeTeamTask(
        completeTaskModal.id,
        {
          afterPhoto: afterPhoto.trim(),
          completionNotes: completionNotes.trim() || 'Work completed and verified on-site by field squad.'
        },
        user?.email
      );

      const updated = res.data;
      setActionSuccessMsg(`Task ${updated.task_code || updated.request_code} marked COMPLETED! Completion report dispatched.`);

      // Update local task list
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated, status: 'Completed', after_photo_url: afterPhoto, completion_notes: completionNotes } : t))
      );

      if (selectedTask && selectedTask.id === updated.id) {
        setSelectedTask({ ...selectedTask, ...updated, status: 'Completed', after_photo_url: afterPhoto, completion_notes: completionNotes });
      }

      setCompleteTaskModal(null);
      setAfterPhoto('');
      setCompletionNotes('');

      setTimeout(() => {
        setActionSuccessMsg('');
      }, 6000);
    } catch (err) {
      console.error('Error completing task:', err);
      setCompletePhotoError(err.message || 'Failed to complete task. Please try again.');
    } finally {
      setIsCompletingTask(false);
    }
  };

  // Filter tasks by active tab & search query
  const assignedTasks = tasks.filter((t) => t.status === 'Assigned');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  let filteredTasks = tasks;
  if (activeTab === 'ASSIGNED') filteredTasks = assignedTasks;
  else if (activeTab === 'IN_PROGRESS') filteredTasks = inProgressTasks;
  else if (activeTab === 'COMPLETED') filteredTasks = completedTasks;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredTasks = filteredTasks.filter((t) => {
      const taskCode = (t.task_code || '').toLowerCase();
      const reqCode = (t.request_code || '').toLowerCase();
      const issue = (t.issue || '').toLowerCase();
      const loc = (t.location_details || t.ward || '').toLowerCase();
      return taskCode.includes(q) || reqCode.includes(q) || issue.includes(q) || loc.includes(q);
    });
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      {/* Top National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Government Navigation Bar */}
      <header className="bg-[#002B49] text-white shadow-md border-b border-slate-700/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Branding & Team Details */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src="/gov-emblem.png"
              alt="Government Emblem"
              className="h-10 w-auto object-contain drop-shadow-sm brightness-200"
            />
            <div className="h-8 w-px bg-slate-700 hidden sm:block" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#FF9933]">
                  Jan Setu
                </span>
                <span className="text-slate-500 text-xs">•</span>
                <span className="text-[11px] font-bold text-slate-300">
                  {t.fieldTeamOperations || 'Field Operations Portal'}
                </span>
                <span className="font-mono text-[10px] font-black bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded">
                  {teamCode}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {teamName}
              </h1>
            </div>
          </div>

          {/* Right: Language Selector & Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Multilingual Selector */}
            <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-inner">
              <Languages className="w-4 h-4 text-amber-300 ml-1.5 mr-0.5 flex-shrink-0" />
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teamLanguage === 'mr'
                    ? 'bg-amber-400 text-slate-900 shadow-xs font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teamLanguage === 'hi'
                    ? 'bg-amber-400 text-slate-900 shadow-xs font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  teamLanguage === 'en'
                    ? 'bg-amber-400 text-slate-900 shadow-xs font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setIsBrowseLanguagesOpen(true)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:bg-slate-700 transition-all cursor-pointer flex items-center space-x-1 border-l border-slate-700"
                title="Browse more Indian languages"
              >
                <Globe className="w-3 h-3" />
                <span className="hidden md:inline">+ More</span>
              </button>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 text-xs font-bold transition-all border border-slate-700 flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">{t.signOut || 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Unit Identity & Sector Overview Banner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-start sm:items-center space-x-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <HardHat className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>{t.activeStatusOnDuty || activeStatus}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                  {getLocalizedCategory(category, teamLanguage)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                  {unitSize}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {teamName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center space-x-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{department} &bull; {jurisdiction}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => loadTasks(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-300 flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t.refreshList || 'Refresh Tasks'}</span>
            </button>
          </div>
        </div>

        {/* Global Action Feedback Alert */}
        {actionSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMsg('')}
              className="text-emerald-700 hover:text-emerald-950 font-black text-sm cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Status Counters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveTab('ALL')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider opacity-80">
                {t.allWorkOrders || 'Total Work Orders'}
              </span>
              <Layers className="w-4 h-4 opacity-70" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black">
              {tasks.length}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('ASSIGNED')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
              activeTab === 'ASSIGNED'
                ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-500/30 font-black'
                : 'bg-white text-slate-900 border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider opacity-90">
                {t.assignedWorkOrders || 'Assigned (Pending)'}
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-700">
              {assignedTasks.length}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('IN_PROGRESS')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-600/30'
                : 'bg-white text-slate-900 border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider opacity-80">
                {t.inProgressWorkOrders || 'In Progress (Active)'}
              </span>
              <Wrench className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-blue-600">
              {inProgressTasks.length}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('COMPLETED')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-700/30'
                : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider opacity-80">
                {t.completedWorkOrders || 'Completed (Resolved)'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
              {completedTasks.length}
            </div>
          </div>

          {/* Citizen Performance Rating KPI */}
          <div className="p-5 rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 text-slate-900 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                {t.averageCitizenRating || 'Citizen Rating'}
              </span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-950">
                {teamRatingsSummary?.averageRating ? Number(teamRatingsSummary.averageRating).toFixed(1) : '5.0'}
              </span>
              <span className="text-xs font-bold text-amber-700">★ / 5.0</span>
            </div>
            <p className="text-[10px] text-amber-800 font-bold mt-1">
              {teamRatingsSummary?.ratedCount || 0} {t.ratedComplaints || 'citizen reviews'}
            </p>
          </div>
        </div>

        {/* Search Bar & Filter Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder || "Search by work order ID or issue..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Eye className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500">{filteredTasks.length} work orders</span>
          </div>
        </div>

        {/* Work Orders List / Grid */}
        {isLoading ? (
          <div className="min-h-[300px] flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-[#002B49]">Loading Assigned Field Tasks...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800 space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-base">Error Loading Tasks</h3>
            </div>
            <p className="text-xs">{error}</p>
            <button
              type="button"
              onClick={() => loadTasks(true)}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">{t.noTasksFound || 'No work orders in this category'}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t.noTasksDesc || 'All assigned tasks have been serviced or are awaiting dispatch from the Ward In-charge.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTasks.map((task) => {
              const isAssigned = task.status === 'Assigned';
              const isInProgress = task.status === 'In Progress';
              const isCompleted = task.status === 'Completed';

              const issueText = getTranslatedCitizenText(
                task.issue || task.original_text || 'Field issue reported by citizen',
                teamLanguage,
                task.original_language
              );

              const originalCitizenText = getTranslatedCitizenText(
                task.original_text || task.issue || '',
                teamLanguage,
                task.original_language
              );

              return (
                <div
                  key={task.id || task.task_code}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Header Strip */}
                  <div className="p-5 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {task.task_code || `TSK-${task.id}`}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wide border flex items-center space-x-1 ${
                          isAssigned
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : isInProgress
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isAssigned && <Clock className="w-3 h-3" />}
                        {isInProgress && <Wrench className="w-3 h-3" />}
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        <span>{getLocalizedStatus(task.status, teamLanguage)}</span>
                      </span>
                    </div>

                    {/* Complaint ID & Priority */}
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-500">
                        {t.citizenComplaintId || 'Complaint'}: {task.request_code || `REQ-${task.request_id}`}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          task.priority === 'Critical' || task.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {getLocalizedUrgency(task.priority || 'Medium', teamLanguage)}
                      </span>
                    </div>

                    {/* Issue Title & Description */}
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                        {issueText}
                      </h4>
                      {originalCitizenText && originalCitizenText !== issueText && (
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 italic">
                          "{originalCitizenText}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Location & Meta Details */}
                  <div className="p-5 bg-slate-50/50 space-y-2.5 text-xs text-slate-600 border-b border-slate-100 flex-1">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-2">
                        {task.problem_address || task.location_details || task.ward || 'Bavdhan, Pune'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.assignedDate || 'Assigned'}: {new Date(task.assigned_at || task.created_at).toLocaleDateString()}</span>
                    </div>

                    {isCompleted && task.completed_at && (
                      <div className="flex items-center space-x-2 text-[11px] text-emerald-700 font-bold">
                        <Timer className="w-3.5 h-3.5" />
                        <span>{t.resolutionDuration || 'Resolution'}: {formatResolutionTime(task.started_at || task.assigned_at, task.completed_at)}</span>
                      </div>
                    )}

                    {/* Citizen Rating & Feedback Badge (if completed & rated) */}
                    {isCompleted && task.citizen_rating ? (
                      <div className="mt-2 p-3 bg-amber-50/90 rounded-2xl border border-amber-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= task.citizen_rating
                                    ? 'text-amber-500 fill-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-amber-950 ml-1">
                              {task.citizen_rating}.0
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800">
                            {t.citizenFeedback || 'Citizen Rating'}
                          </span>
                        </div>
                        {task.citizen_feedback && (
                          <div className="space-y-1 pt-1 border-t border-amber-200/60">
                            <p className="text-[11px] font-medium text-slate-800 italic line-clamp-2">
                              &ldquo;{ratingsOriginalLangMap[task.id] ? task.citizen_feedback : getTranslatedCitizenText(task.citizen_feedback, teamLanguage)}&rdquo;
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRatingsOriginalLangMap(prev => ({ ...prev, [task.id]: !prev[task.id] }));
                              }}
                              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer block"
                            >
                              {ratingsOriginalLangMap[task.id] ? (t.viewTranslated || 'View Translated') : (t.viewOriginal || 'View Original')}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : isCompleted ? (
                      <div className="mt-2 text-[11px] text-slate-400 italic flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{t.awaitingRating || 'Awaiting citizen rating'}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-white flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.viewTaskDetailsBtn || 'Details'}</span>
                    </button>

                    {isAssigned && (
                      <button
                        type="button"
                        onClick={() => handleOpenStartModal(task)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                        <span>{t.startTaskBtn || 'Start Task'}</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        type="button"
                        onClick={() => handleOpenCompleteModal(task)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.completeTaskBtn || 'Complete Task'}</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 1. START TASK MODAL (Requires Before Photo) */}
      {/* ------------------------------------------------------------- */}
      {startTaskModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                  <Play className="w-5 h-5 fill-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {t.startTaskModalTitle || "Start Work Order"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {startTaskModal.task_code || `TSK-${startTaskModal.id}`} &bull; {startTaskModal.request_code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStartTaskModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-amber-50/70 p-3 rounded-2xl border border-amber-200/60">
              {t.startTaskModalDesc || "Attaching an on-site 'Before Photo' is mandatory before commencing execution on this work order."}
            </p>

            {/* Photo Attachment Section */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                {t.attachBeforePhoto || "Attach Before Photo *"}
              </label>

              {/* Photo Preview Container */}
              {beforePhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400 bg-slate-900 aspect-16/9 flex items-center justify-center group shadow-md">
                  <img
                    src={beforePhoto}
                    alt="Before Work Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Before Photo Attached</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLiveCamera('BEFORE')}
                      className="px-3 py-1.5 bg-slate-900/90 text-white text-[11px] font-bold rounded-xl hover:bg-slate-800 backdrop-blur-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.retakePhoto || "Retake"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeforePhoto('')}
                      className="px-3 py-1.5 bg-rose-600/90 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700 backdrop-blur-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.removePhoto || "Remove"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Live Camera */}
                  <button
                    type="button"
                    onClick={() => handleOpenLiveCamera('BEFORE')}
                    className="p-5 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black">{t.takeLivePhoto || "📷 Take Live Photo"}</span>
                    <span className="text-[10px] text-amber-800 font-medium">Use device camera</span>
                  </button>

                  {/* Option 2: Upload File */}
                  <button
                    type="button"
                    onClick={() => beforeFileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black">{t.uploadPhoto || "🖼️ Upload Photo"}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Select from files</span>
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={beforeFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileChange(e, setBeforePhoto, setStartPhotoError)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Verified Demo Presets for Testing */}
              {!beforePhoto && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">
                    {t.selectDemoPreset || "Or select a verified sample photo for testing:"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEMO_BEFORE_PHOTOS.map((dp) => (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => {
                          setBeforePhoto(dp.url);
                          setStartPhotoError('');
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-white transition-all text-left group cursor-pointer"
                      >
                        <img
                          src={dp.url}
                          alt={dp.title}
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[10px] font-bold text-slate-700 block truncate">
                          {dp.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {startPhotoError && (
                <p className="text-xs text-rose-600 font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{startPhotoError}</span>
                </p>
              )}
            </div>

            {/* Initial Work Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t.startWorkNotes || "Initial Work Notes / Remarks (Optional)"}
              </label>
              <textarea
                value={startNotes}
                onChange={(e) => setStartNotes(e.target.value)}
                placeholder={t.startWorkNotesPlaceholder || "Note on-site observations or initial equipment deployed..."}
                rows={2}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setStartTaskModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {t.closeModal || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleSubmitStartTask}
                disabled={isStartingTask || !beforePhoto}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {isStartingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{t.startingTask || "Starting Task..."}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{t.confirmStartTask || "Confirm & Start Task"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. COMPLETE TASK MODAL (Requires After Photo + Report) */}
      {/* ------------------------------------------------------------- */}
      {completeTaskModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {t.completeTaskModalTitle || "Complete Work Order"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {completeTaskModal.task_code || `TSK-${completeTaskModal.id}`} &bull; {completeTaskModal.request_code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompleteTaskModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/60">
              {t.completeTaskModalDesc || "Attaching a verified 'After Photo' of the resolved site and submitting a completion report is mandatory."}
            </p>

            {/* Photo Attachment Section */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                {t.attachAfterPhoto || "Attach After Photo *"}
              </label>

              {/* Photo Preview Container */}
              {afterPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-900 aspect-16/9 flex items-center justify-center group shadow-md">
                  <img
                    src={afterPhoto}
                    alt="After Work Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>After Photo Attached</span>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLiveCamera('AFTER')}
                      className="px-3 py-1.5 bg-slate-900/90 text-white text-[11px] font-bold rounded-xl hover:bg-slate-800 backdrop-blur-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.retakePhoto || "Retake"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhoto('')}
                      className="px-3 py-1.5 bg-rose-600/90 text-white text-[11px] font-bold rounded-xl hover:bg-rose-700 backdrop-blur-xs transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.removePhoto || "Remove"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Live Camera */}
                  <button
                    type="button"
                    onClick={() => handleOpenLiveCamera('AFTER')}
                    className="p-5 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black">{t.takeLivePhoto || "📷 Take Live Photo"}</span>
                    <span className="text-[10px] text-emerald-800 font-medium">Use device camera</span>
                  </button>

                  {/* Option 2: Upload File */}
                  <button
                    type="button"
                    onClick={() => afterFileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 flex flex-col items-center justify-center space-y-2 transition-all cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black">{t.uploadPhoto || "🖼️ Upload Photo"}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Select from files</span>
                  </button>

                  {/* Hidden File Input */}
                  <input
                    ref={afterFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoFileChange(e, setAfterPhoto, setCompletePhotoError)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Verified Demo Presets for Testing */}
              {!afterPhoto && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2">
                    {t.selectDemoPreset || "Or select a verified sample photo for testing:"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEMO_AFTER_PHOTOS.map((dp) => (
                      <button
                        key={dp.id}
                        type="button"
                        onClick={() => {
                          setAfterPhoto(dp.url);
                          setCompletePhotoError('');
                        }}
                        className="p-1.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white transition-all text-left group cursor-pointer"
                      >
                        <img
                          src={dp.url}
                          alt={dp.title}
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[10px] font-bold text-slate-700 block truncate">
                          {dp.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {completePhotoError && (
                <p className="text-xs text-rose-600 font-bold flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{completePhotoError}</span>
                </p>
              )}
            </div>

            {/* Field Completion Report Notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-700">
                {t.completionNotesLabel || "Field Completion Report & Notes *"}
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder={t.completionNotesPlaceholder || "Describe the remediation work executed (e.g. asphalt patching completed and leveled with roller)..."}
                rows={3}
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCompleteTaskModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {t.closeModal || "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleSubmitCompleteTask}
                disabled={isCompletingTask || !afterPhoto || !completionNotes.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                {isCompletingTask ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t.completingTask || "Submitting..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.confirmCompleteTask || "Submit Work Order Completion"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. TASK DETAILS DOSSIER MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedTask && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                    {selectedTask.task_code || `TSK-${selectedTask.id}`}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                      selectedTask.status === 'Assigned'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : selectedTask.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {getLocalizedStatus(selectedTask.status, teamLanguage)}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {getTranslatedCitizenText(selectedTask.issue || selectedTask.original_text, teamLanguage, selectedTask.original_language)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Before & After Photographic Evidence Section */}
            {(selectedTask.before_photo_url || selectedTask.after_photo_url) && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  <span>{t.beforeAndAfterEvidence || "Before & After Field Photographic Evidence"}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Photo Box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md inline-block">
                      {t.beforeWorkPhoto || "Initial Condition (Before)"}
                    </span>
                    {selectedTask.before_photo_url ? (
                      <div className="rounded-xl overflow-hidden border border-amber-300 bg-slate-900 aspect-16/10">
                        <img
                          src={selectedTask.before_photo_url}
                          alt="Before Work"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white aspect-16/10 flex items-center justify-center text-[11px] text-slate-400">
                        No before photo attached
                      </div>
                    )}
                  </div>

                  {/* After Photo Box */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block">
                      {t.afterWorkPhoto || "Remediated Condition (After)"}
                    </span>
                    {selectedTask.after_photo_url ? (
                      <div className="rounded-xl overflow-hidden border border-emerald-400 bg-slate-900 aspect-16/10">
                        <img
                          src={selectedTask.after_photo_url}
                          alt="After Work"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white aspect-16/10 flex items-center justify-center text-[11px] text-slate-400">
                        Awaiting task completion
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grievance & Execution Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Location</span>
                <span className="font-bold text-slate-800 block">
                  {selectedTask.problem_address || selectedTask.location_details || selectedTask.ward || 'Bavdhan, Pune'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Category & Urgency</span>
                <span className="font-bold text-slate-800 block">
                  {getLocalizedCategory(selectedTask.category, teamLanguage)} &bull; {getLocalizedUrgency(selectedTask.priority, teamLanguage)}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">Assigned Timestamp</span>
                <span className="font-bold text-slate-800 block">
                  {new Date(selectedTask.assigned_at || selectedTask.created_at).toLocaleString()}
                </span>
              </div>

              {selectedTask.completed_at && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-emerald-700 font-bold uppercase text-[10px] block">Resolution Completed</span>
                  <span className="font-bold text-emerald-900 block">
                    {new Date(selectedTask.completed_at).toLocaleString()} ({formatResolutionTime(selectedTask.started_at, selectedTask.completed_at)})
                  </span>
                </div>
              )}
            </div>

            {/* Citizen Statement */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
              <span className="text-slate-500 font-bold uppercase text-[10px] block">
                {t.citizenDescription || "Citizen Statement:"}
              </span>
              <p className="text-slate-800 font-medium leading-relaxed italic">
                "{getTranslatedCitizenText(selectedTask.original_text || selectedTask.issue, teamLanguage, selectedTask.original_language)}"
              </p>
            </div>

            {/* Squad Completion Notes */}
            {selectedTask.completion_notes && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                <span className="text-emerald-800 font-black uppercase text-[10px] block">
                  {t.completionReportNote || "Squad Completion Report:"}
                </span>
                <p className="text-emerald-950 font-bold leading-relaxed">
                  {selectedTask.completion_notes}
                </p>
              </div>
            )}

            {/* Citizen Rating & Feedback Block */}
            {selectedTask.citizen_rating && (
              <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-amber-900 font-black uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{t.citizenFeedback || "Citizen Rating & Feedback"}</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                    {selectedTask.citizen_rating}.0 / 5.0
                  </span>
                </div>

                <div className="flex items-center space-x-1 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= selectedTask.citizen_rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-black text-amber-950 ml-1.5">
                    {selectedTask.citizen_rating >= 4 ? 'High Satisfaction' : selectedTask.citizen_rating === 3 ? 'Moderate' : 'Low Satisfaction'}
                  </span>
                </div>

                {/* Sub-ratings */}
                {(selectedTask.resolution_quality || selectedTask.timeliness || selectedTask.overall_satisfaction) && (
                  <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                    {selectedTask.resolution_quality && (
                      <div className="p-2 rounded-xl bg-white border border-amber-200/80 text-center">
                        <span className="block text-slate-500 font-bold">Quality</span>
                        <span className="font-black text-slate-800">{selectedTask.resolution_quality}★</span>
                      </div>
                    )}
                    {selectedTask.timeliness && (
                      <div className="p-2 rounded-xl bg-white border border-amber-200/80 text-center">
                        <span className="block text-slate-500 font-bold">Speed</span>
                        <span className="font-black text-slate-800">{selectedTask.timeliness}★</span>
                      </div>
                    )}
                    {selectedTask.overall_satisfaction && (
                      <div className="p-2 rounded-xl bg-white border border-amber-200/80 text-center">
                        <span className="block text-slate-500 font-bold">Overall</span>
                        <span className="font-black text-slate-800">{selectedTask.overall_satisfaction}★</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedTask.citizen_feedback && (
                  <div className="space-y-1.5 pt-1.5 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {t.citizenFeedback || "Feedback Comment:"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setRatingsOriginalLangMap((prev) => ({
                            ...prev,
                            [selectedTask.id]: !prev[selectedTask.id]
                          }))
                        }
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        {ratingsOriginalLangMap[selectedTask.id]
                          ? (t.viewTranslated || 'View Translated')
                          : (t.viewOriginal || 'View Original')}
                      </button>
                    </div>
                    <p className="p-2.5 bg-white rounded-xl border border-amber-200/80 text-slate-800 italic leading-relaxed">
                      &ldquo;{ratingsOriginalLangMap[selectedTask.id]
                        ? selectedTask.citizen_feedback
                        : getTranslatedCitizenText(selectedTask.citizen_feedback, teamLanguage)}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {t.closeModal || "Close"}
              </button>

              {selectedTask.status === 'Assigned' && (
                <button
                  type="button"
                  onClick={() => {
                    const tToStart = selectedTask;
                    setSelectedTask(null);
                    handleOpenStartModal(tToStart);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{t.startTaskBtn || "Start Task"}</span>
                </button>
              )}

              {selectedTask.status === 'In Progress' && (
                <button
                  type="button"
                  onClick={() => {
                    const tToComp = selectedTask;
                    setSelectedTask(null);
                    handleOpenCompleteModal(tToComp);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.completeTaskBtn || "Complete Task"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. LIVE CAMERA MODAL COMPONENT */}
      {/* ------------------------------------------------------------- */}
      <LiveCameraModal
        isOpen={cameraModalConfig.isOpen}
        onClose={() => setCameraModalConfig({ isOpen: false, mode: null, title: '' })}
        onCapture={handleCameraCapture}
        title={cameraModalConfig.title}
        t={t}
      />

      {/* ------------------------------------------------------------- */}
      {/* 5. ALL INDIC LANGUAGES SELECTION MODAL */}
      {/* ------------------------------------------------------------- */}
      {isBrowseLanguagesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-black text-slate-900">
                  Select Portal Language
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBrowseLanguagesOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto p-1">
              {ALL_INDIC_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleLanguageChange(l.code)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    teamLanguage === l.code
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-sm font-bold">{l.name}</span>
                  <span className="text-[11px] opacity-75 font-medium">{l.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setIsBrowseLanguagesOpen(false)}
                className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
