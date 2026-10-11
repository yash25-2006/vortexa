import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Building2,
  Lock,
  UserCheck,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  HardHat,
  Truck,
  Wrench,
  Users,
  ChevronRight,
  Sparkles,
  KeyRound,
  X,
  MapPin
} from 'lucide-react';
import {
  FIELD_TEAM_CATEGORIES,
  FIELD_TEAMS_DATA,
  getTeamsByCategory,
  getTeamByIdOrCode
} from '../../constants/fieldTeams';
import { govLogin } from '../../services/api';

export default function FieldTeamLoginFlow({
  onBackToGovLogin,
  onFieldTeamLoginSuccess
}) {
  // Navigation Steps:
  // Step 1: 'category' (Full-page Category / Sector selection)
  // Step 2: 'department' (Full-page Department selection under category)
  // Step 3: 'login' (Dedicated Team ID & Password Login)
  const [currentStep, setCurrentStep] = useState('category');
  
  // Selection State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Form State for Step 3
  const [teamUsername, setTeamUsername] = useState('');
  const [teamPassword, setTeamPassword] = useState('Demo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Step 1 -> Step 2
  const handleSelectCategory = (categoryObj) => {
    setSelectedCategory(categoryObj);
    setSelectedTeam(null);
    setErrorMessage('');
    setCurrentStep('department');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 -> Step 3
  const handleSelectTeam = (teamObj) => {
    setSelectedTeam(teamObj);
    setTeamUsername(teamObj.teamCode || teamObj.email);
    setTeamPassword('Demo@123');
    setErrorMessage('');
    setCurrentStep('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1-Click Demo autofill
  const handleUseDemoCredentials = () => {
    if (selectedTeam) {
      setTeamUsername(selectedTeam.teamCode || selectedTeam.email);
      setTeamPassword('Demo@123');
      setErrorMessage('');
    }
  };

  // Submit Login (Step 3)
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (!teamUsername.trim() || !teamPassword.trim()) {
        throw new Error('Please enter both Team ID / Username and Password.');
      }

      // Check against configured teams
      const localTeam = getTeamByIdOrCode(teamUsername) || selectedTeam;

      // Authenticate via backend API or fallback to validated local field team profile
      let authUser = null;
      try {
        const loginEmail = localTeam ? localTeam.email : teamUsername.trim();
        const res = await govLogin(loginEmail, teamPassword.trim());
        if (res.success && res.user) {
          authUser = {
            ...res.user,
            role: 'field_team',
            teamCode: localTeam?.teamCode || teamUsername,
            department: localTeam?.department || 'Field Operations Department',
            teamName: localTeam?.teamName || 'Municipal Field Response Unit',
            category: localTeam?.category || selectedCategory?.name || 'Roads & Transport',
            leadOfficer: localTeam?.leadOfficer || res.user.name,
            designation: localTeam?.designation || 'Field Engineer',
            equipment: localTeam?.equipment || 'Standard Field Diagnostic & Repair Kit',
            unitSize: localTeam?.unitSize || '5 Crew Members',
            operationalFocus: localTeam?.operationalFocus || 'Municipal field inspection and civic works execution.',
            jurisdiction: localTeam?.jurisdiction || `${res.user.monitoringWard || 'Ward 10'} / ${res.user.monitoringDistrict || 'Pune'}`
          };
        }
      } catch (apiErr) {
        // Local verification fallback for field team accounts
        if (localTeam && (teamPassword === 'Demo@123' || teamPassword === localTeam.password)) {
          authUser = {
            id: `FT-${localTeam.id}`,
            name: localTeam.leadOfficer,
            email: localTeam.email,
            role: 'field_team',
            teamCode: localTeam.teamCode,
            department: localTeam.department,
            teamName: localTeam.teamName,
            category: localTeam.category,
            leadOfficer: localTeam.leadOfficer,
            designation: localTeam.designation,
            equipment: localTeam.equipment,
            unitSize: localTeam.unitSize,
            operationalFocus: localTeam.operationalFocus,
            monitoringState: localTeam.state,
            monitoringDistrict: localTeam.district,
            monitoringWard: localTeam.ward,
            jurisdiction: localTeam.jurisdiction,
            activeStatus: localTeam.activeStatus
          };
        } else {
          throw new Error('Invalid Team ID or Password. Please check credentials or use Demo login.');
        }
      }

      if (!authUser) {
        throw new Error('Could not authenticate field team account. Please verify credentials.');
      }

      if (onFieldTeamLoginSuccess) {
        onFieldTeamLoginSuccess(authUser);
      }
    } catch (err) {
      console.error('Field team login error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify your Team ID and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex flex-col font-sans">
      {/* Top National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Government Portal Header Bar */}
      <header className="bg-[#002B49] text-white shadow-md border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src="/gov-emblem.png"
              alt="Government of India Emblem"
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
                  Government Field Operations
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight">
                Field Team Authentication Portal
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToGovLogin}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF9933]" />
            <span className="hidden sm:inline">Return to Main Login</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      </header>

      {/* Main Full-Width Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 animate-fadeIn">
        
        {/* ========================================================================= */}
        {/* STEP 1: FULL-PAGE CATEGORY / SECTOR SELECTION                              */}
        {/* ========================================================================= */}
        {currentStep === 'category' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Page Header */}
            <div className="text-center space-y-2 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#002B49] text-white text-xs font-bold shadow-xs">
                <HardHat className="w-4 h-4 text-[#FF9933]" />
                <span>FIELD SQUAD SECTOR SELECTION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#002B49] tracking-tight">
                Select Your Department
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                Choose your administrative sector below to access your department field team and execution terminal.
              </p>
            </div>

            {/* Category Cards Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {FIELD_TEAM_CATEGORIES.map((cat) => {
                const IconComp = cat.icon;
                const configuredTeams = getTeamsByCategory(cat.id);

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-[#002B49] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between select-none hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      {/* Top: Icon & Count Badge */}
                      <div className="flex items-center justify-between">
                        <div className={`p-4 rounded-2xl ${cat.iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
                          <IconComp className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-[#002B49] border border-slate-200">
                          {configuredTeams.length} Teams
                        </span>
                      </div>

                      {/* Category Name & Language Pointers */}
                      <div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#002B49] transition-colors">
                          {cat.name}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                          {cat.marathiName} • {cat.hindiName}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {cat.description}
                      </p>
                    </div>

                    {/* Action Link Footer */}
                    <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between">
                      <span className="text-xs font-black text-[#002B49] group-hover:text-[#003961] group-hover:underline">
                        Open Department Teams
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-[#002B49] group-hover:text-white flex items-center justify-center transition-colors text-slate-700">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FULL-PAGE DEPARTMENT / TEAM SELECTION                             */}
        {/* ========================================================================= */}
        {currentStep === 'department' && selectedCategory && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep('category');
                      setErrorMessage('');
                    }}
                    className="text-xs font-extrabold text-blue-700 hover:text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>All Departments</span>
                  </button>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center space-x-1.5 ${selectedCategory.badgeColor}`}>
                    <selectedCategory.icon className="w-3.5 h-3.5" />
                    <span>{selectedCategory.name}</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-[#002B49] tracking-tight">
                  Select Field Squad / Unit
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Showing operational departments configured strictly under <strong>{selectedCategory.name}</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep('category');
                  setErrorMessage('');
                }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-2xs self-start sm:self-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Department</span>
              </button>
            </div>

            {/* Department / Field Squad Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {getTeamsByCategory(selectedCategory.name).map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team)}
                  className="group bg-white rounded-3xl p-6 border-2 border-slate-200 hover:border-[#002B49] shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    {/* Header: Team Code & Active Badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-blue-950 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                        {team.teamCode}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{team.activeStatus}</span>
                      </span>
                    </div>

                    {/* Department & Unit Title */}
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">
                        {team.department}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-[#002B49] group-hover:text-blue-950 mt-0.5">
                        {team.teamName}
                      </h2>
                    </div>

                    {/* Key Officer & Ward */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Lead Field Officer</span>
                        <span className="font-bold text-slate-900">{team.leadOfficer}</span>
                        <span className="text-[11px] text-slate-500 block">({team.designation})</span>
                      </div>
                      <div className="pt-1 border-t border-slate-200/60">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Jurisdiction</span>
                        <span className="font-semibold text-slate-800">{team.jurisdiction}</span>
                      </div>
                    </div>

                    {/* Operational Scope */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <strong className="text-slate-800">Focus:</strong> {team.operationalFocus}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTeam(team);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-[#002B49] group-hover:bg-[#003961] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <span>Login as this Team</span>
                      <ArrowRight className="w-4 h-4 text-[#FF9933] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DEDICATED TEAM LOGIN SCREEN                                       */}
        {/* ========================================================================= */}
        {currentStep === 'login' && selectedTeam && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn py-4">
            {/* Top Navigation */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep('department');
                  setErrorMessage('');
                }}
                className="text-blue-700 hover:text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Team Selection</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep('category');
                  setSelectedCategory(null);
                  setSelectedTeam(null);
                  setErrorMessage('');
                }}
                className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Change Department
              </button>
            </div>

            {/* Login Card Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
              {/* Selected Unit Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Designated Field Team Terminal
                  </span>
                  <span className="text-[11px] font-mono font-black text-[#002B49] bg-white px-2.5 py-0.5 rounded border border-slate-300">
                    {selectedTeam.teamCode}
                  </span>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#002B49]">
                    {selectedTeam.teamName}
                  </h2>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">
                    {selectedTeam.department} • <strong className="text-slate-900">{selectedTeam.category}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lead: <strong className="text-slate-800">{selectedTeam.leadOfficer}</strong> ({selectedTeam.designation})
                  </p>
                </div>
              </div>

              {/* Login Title */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authorized Field Access</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Government Field Team Login
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enter your official Team ID and password to access the team dashboard.
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Team Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Team ID / Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Team ID / Official Username</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">e.g. {selectedTeam.teamCode}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamUsername}
                    onChange={(e) => setTeamUsername(e.target.value)}
                    placeholder={`e.g. ${selectedTeam.teamCode} or ${selectedTeam.email}`}
                    className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={teamPassword}
                      onChange={(e) => setTeamPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Team...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Field Dashboard</span>
                      <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Helper */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 block">Demo Field Credentials</span>
                  <span className="text-amber-800 text-[11px]">
                    ID: <code className="font-bold">{selectedTeam.teamCode}</code> • Pwd: <code>Demo@123</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemoCredentials}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs cursor-pointer transition-colors flex-shrink-0"
                >
                  Autofill
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-300 space-y-4 animate-scaleUp">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-[#002B49]">
                <KeyRound className="w-5 h-5 text-[#FF9933]" />
                <h3 className="font-extrabold text-base">Field Team Password Recovery</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Government Field Team accounts are issued and managed under the supervision of the <strong>Ward Administrative In-Charge</strong> and Municipal IT Nodal Cell.
              </p>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-blue-950 font-medium">
                <span className="font-bold block text-blue-900">Standard Reset Procedure:</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Contact your Ward 10 Nodal Officer at: <strong className="font-mono">ward10.bavdhan@demo.gov</strong></li>
                  <li>Provide your official Team ID (<strong className="font-mono">{selectedTeam?.teamCode || 'PMC-TEAM'}</strong>).</li>
                  <li>For demo testing, the master password is: <strong className="font-mono bg-blue-100 px-1 rounded">Demo@123</strong></li>
                </ul>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#002B49] text-white font-bold text-xs shadow-xs hover:bg-[#003961] cursor-pointer"
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4 text-slate-500 text-xs font-semibold border-t border-slate-200 bg-white mt-auto">
        <span>© 2026 Jan Setu • Municipal Field Operations Management System</span>
      </footer>
    </div>
  );
}
