import React, { useState } from 'react';
import WelcomeScreen from '../../components/citizen/screens/WelcomeScreen';
import LanguageSelectScreen from '../../components/citizen/screens/LanguageSelectScreen';
import AadhaarVerifyScreen from '../../components/citizen/screens/AadhaarVerifyScreen';
import ConfirmDetailsScreen from '../../components/citizen/screens/ConfirmDetailsScreen';
import CitizenHomeScreen from '../../components/citizen/screens/CitizenHomeScreen';
import ReviewScreen from '../../components/citizen/screens/ReviewScreen';
import SuccessScreen from '../../components/citizen/screens/SuccessScreen';
import CitizenHistoryModal from '../../components/citizen/CitizenHistoryModal';
import StartupPermissionModal from '../../components/common/StartupPermissionModal';
import CitizenPerformanceModal from '../../components/citizen/CitizenPerformanceModal';
import GovernmentPlansModal from '../../components/citizen/GovernmentPlansModal';
import BrowseMoreLanguagesModal from '../../components/common/BrowseMoreLanguagesModal';
import { TRANSLATIONS } from '../../constants/translations';
import { submitRequest } from '../../services/api';
import {
  Landmark,
  Languages,
  User,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Award,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  ExternalLink,
  Globe
} from 'lucide-react';

export default function CitizenFlow({ initialProfile = null, initialLanguage = 'mr', onLogout = null }) {
  // Startup Permissions State
  const [hasCompletedStartupPermissions, setHasCompletedStartupPermissions] = useState(
    () => sessionStorage.getItem('citizen_startup_perms_completed') === 'true'
  );
  const [startupPermsResult, setStartupPermsResult] = useState(null);

  // Steps: 1: Welcome, 2: Language, 3: Aadhaar, 4: Confirm, 5: Home/Input, 7: Review, 8: Success
  const [currentStep, setCurrentStep] = useState(initialProfile ? 5 : 1);
  const [language, setLanguage] = useState(initialLanguage || 'mr'); // Default to Marathi
  const [isBrowseLanguagesOpen, setIsBrowseLanguagesOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  
  // Citizen profile after mock Aadhaar verification
  const [citizenProfile, setCitizenProfile] = useState(initialProfile);
  
  // Active request state
  const [draftRequest, setDraftRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState('');

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState(null);
  const [matchedPlanModalData, setMatchedPlanModalData] = useState(null);
  const [duplicateModalData, setDuplicateModalData] = useState(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Step 1: Login / Signup
  const handleLogin = ({ mobile: mob, action }) => {
    setMobile(mob);
    setCurrentStep(2); // Go to Language Selection
  };

  const handleDirectAadhaar = () => {
    setCurrentStep(3); // Go straight to Aadhaar verification
  };

  // Step 2: Language Select
  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
  };

  const handleLanguageConfirmed = () => {
    setCurrentStep(3); // Go to Aadhaar verification
  };

  // Step 3: Aadhaar Verified
  const handleAadhaarVerified = (verifiedData) => {
    setCitizenProfile(verifiedData);
    setCurrentStep(4); // Go to Confirm Details
  };

  // Step 4: Details Confirmed
  const handleDetailsConfirmed = (finalProfile) => {
    setCitizenProfile(finalProfile);
    setCurrentStep(5); // Go to Citizen Home
  };

  // Step 5: Proceed to Review
  const handleProceedToReview = (draft) => {
    setDraftRequest(draft);
    setSubmissionError('');
    setCurrentStep(7); // Go to Review Screen
  };

  // Step 7: Confirm & Submit to Backend
  const handleConfirmSend = async (finalDraft) => {
    setIsSubmitting(true);
    setSubmissionError('');

    try {
      const payload = {
        originalText: finalDraft.text,
        citizenId: citizenProfile?.citizenId || 'CIT-DEMO-001',
        language: language === 'mr' ? 'Marathi' : language === 'hi' ? 'Hindi' : 'English',
        inputType: finalDraft.inputType || 'voice',
        photo: finalDraft.photo || null,
        requestType: finalDraft.requestType || 'demand',
        photoException: Boolean(finalDraft.photoException),
        photoExceptionAcknowledged: Boolean(finalDraft.photoExceptionAcknowledged),
        problemLocation: finalDraft.problemLocation || null,
        problem_location: finalDraft.problemLocation || null,
        locationAccuracy: finalDraft.location?.accuracy || null,
        locationCapturedAt: finalDraft.location?.capturedAt || null,
        location: {
          district: finalDraft.location?.district || citizenProfile?.district || 'Pune',
          state: finalDraft.location?.state || citizenProfile?.state || 'Maharashtra',
          address: finalDraft.location?.address || citizenProfile?.address || 'Maharashtra',
          latitude: finalDraft.location?.latitude,
          longitude: finalDraft.location?.longitude,
          accuracy: finalDraft.location?.accuracy || null,
          captured_at: finalDraft.location?.capturedAt || null
        }
      };

      const res = await submitRequest(payload);

      // Gate 1: Check if matched to an upcoming government plan
      if (res && res.planMatched && res.matchedPlan) {
        setMatchedPlanModalData(res.matchedPlan);
        setCurrentStep(5); // Return to citizen home view
        return;
      }

      setSubmissionResult(res);
      setCurrentStep(8); // Go to Success Screen
    } catch (err) {
      console.error('Failed to submit request:', err);
      if (err.isDuplicate || err.status === 409) {
        setDuplicateModalData({
          message: err.message || 'Your request has already been submitted.',
          matchedRequest: err.matchedRequest || (err.data && err.data.matchedRequest) || null
        });
      } else {
        setSubmissionError(err.message || 'We could not process your request right now. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 8: Actions
  const handleReportAnother = () => {
    setDraftRequest(null);
    setSubmissionResult(null);
    setSubmissionError('');
    setCurrentStep(5); // Return to Citizen Home
  };

  const handleResetSession = () => {
    setCitizenProfile(null);
    setDraftRequest(null);
    setSubmissionResult(null);
    if (onLogout) {
      onLogout();
    } else {
      setCurrentStep(1);
    }
  };

  const handleGoBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 7) setCurrentStep(5);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9]/80 backdrop-blur-[2px]">
      {/* Top National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Citizen Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Brand & Step Back (with Left Government of India emblem) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src="/citizen-gov-emblem.png"
              alt="Government of India"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain flex-shrink-0"
            />
            {currentStep > 1 && currentStep !== 8 && currentStep !== 5 && (
              <button
                type="button"
                onClick={handleGoBack}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title={t.back}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#002B49] text-white flex items-center justify-center shadow-xs">
                <Landmark className="w-5 h-5 text-[#FF9933]" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-[#002B49] tracking-tight block leading-tight">
                  {t.appName}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  {t.appSubtitle}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls: Government Plans, Our Performance, Language Switcher, Profile & Right Digital India Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* "Government Plans" Button */}
            <button
              type="button"
              onClick={() => { setSelectedPlanForModal(null); setShowPlansModal(true); }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 border border-blue-500/30"
              title={t.governmentPlansBtn || 'Government Plans'}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{t.governmentPlansBtn || 'Government Plans'}</span>
              <span className="xs:hidden sm:hidden">Plans</span>
            </button>

            {/* "Our Performance" Button */}
            <button
              type="button"
              onClick={() => setShowPerformanceModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 border border-emerald-500/30"
              title={t.ourPerformanceBtn || 'Our Performance'}
            >
              <Award className="w-3.5 h-3.5 text-[#FF9933] flex-shrink-0" />
              <span className="hidden xs:inline sm:inline">{t.ourPerformanceBtn || 'Our Performance'}</span>
              <span className="xs:hidden sm:hidden">Stats</span>
            </button>

            {/* Quick Language Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'mr' ? 'bg-[#002B49] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'hi' ? 'bg-[#002B49] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all ${
                  language === 'en' ? 'bg-[#002B49] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setIsBrowseLanguagesOpen(true)}
                className="px-1.5 py-1 text-slate-500 hover:text-[#002B49] transition-colors flex items-center space-x-0.5 cursor-pointer"
                title="Browse More Languages (Google Cloud)"
              >
                <Globe className="w-3 h-3 text-[#FF9933]" />
                <span className="text-[10px]">More</span>
              </button>
            </div>

            {/* Logout/Reset Profile if logged in */}
            {citizenProfile && (
              <button
                type="button"
                onClick={handleResetSession}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Log out / Start New Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Right side: Digital India Logo */}
            <img
              src="/citizen-digital-india.png"
              alt="Digital India"
              className="h-9 sm:h-11 md:h-13 w-auto object-contain flex-shrink-0 hidden sm:block pl-2 border-l border-slate-200 ml-1"
            />
          </div>
        </div>
      </header>

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-center">
        {currentStep === 1 && (
          <WelcomeScreen
            language={language}
            onLogin={handleLogin}
            onDirectAadhaar={handleDirectAadhaar}
          />
        )}

        {currentStep === 2 && (
          <LanguageSelectScreen
            selectedLanguage={language}
            onSelectLanguage={handleSelectLanguage}
            onContinue={handleLanguageConfirmed}
          />
        )}

        {currentStep === 3 && (
          <AadhaarVerifyScreen
            language={language}
            mobile={mobile}
            onVerificationSuccess={handleAadhaarVerified}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 4 && (
          <ConfirmDetailsScreen
            language={language}
            citizenProfile={citizenProfile}
            onConfirmDetails={handleDetailsConfirmed}
          />
        )}

        {currentStep === 5 && (
          <CitizenHomeScreen
            language={language}
            citizenProfile={citizenProfile}
            startupLocationCoords={startupPermsResult?.coords}
            onProceedToReview={handleProceedToReview}
            onOpenMyRequests={() => setShowHistoryModal(true)}
          />
        )}

        {currentStep === 7 && (
          <ReviewScreen
            language={language}
            draftRequest={draftRequest}
            citizenProfile={citizenProfile}
            onEdit={() => setCurrentStep(5)}
            onConfirmSend={handleConfirmSend}
            isSubmitting={isSubmitting}
            submissionError={submissionError}
          />
        )}

        {currentStep === 8 && (
          <SuccessScreen
            language={language}
            submissionResult={submissionResult}
            onReportAnother={handleReportAnother}
            onViewMyRequests={() => setShowHistoryModal(true)}
          />
        )}
      </main>

      {/* Startup Permissions Modal */}
      {!hasCompletedStartupPermissions && (
        <StartupPermissionModal
          language={language}
          onPermissionsGranted={(perms) => {
            setStartupPermsResult(perms);
            sessionStorage.setItem('citizen_startup_perms_completed', 'true');
            setHasCompletedStartupPermissions(true);
          }}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <CitizenHistoryModal
          language={language}
          citizenId={citizenProfile?.citizenId || 'CIT-DEMO-001'}
          citizenName={citizenProfile?.name || 'Citizen'}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Our Performance Modal */}
      {showPerformanceModal && (
        <CitizenPerformanceModal
          language={language}
          onClose={() => setShowPerformanceModal(false)}
        />
      )}

      {/* Government Plans Modal */}
      {showPlansModal && (
        <GovernmentPlansModal
          language={language}
          initialPlan={selectedPlanForModal}
          onClose={() => {
            setShowPlansModal(false);
            setSelectedPlanForModal(null);
          }}
        />
      )}

      {/* Matched Upcoming Government Plan Notification Modal */}
      {matchedPlanModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-blue-200 w-full max-w-lg overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-indic">
                {t.alreadyPlannedTitle || 'This development is already planned'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {t.alreadyPlannedDesc || 'Your requested work is already included in an upcoming government plan. A separate request is not needed.'}
              </p>
            </div>

            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-[11px]">
                  {matchedPlanModalData.planCode || `PLAN-${matchedPlanModalData.id}`}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                  🗓️ {matchedPlanModalData.status === 'ongoing' ? 'Ongoing' : 'Upcoming Plan'}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {language === 'mr' && matchedPlanModalData.titleMr
                    ? matchedPlanModalData.titleMr
                    : language === 'hi' && matchedPlanModalData.titleHi
                    ? matchedPlanModalData.titleHi
                    : matchedPlanModalData.title}
                </h4>
                {matchedPlanModalData.department && (
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {matchedPlanModalData.department}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center space-x-2 text-slate-700">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-xs">
                  {matchedPlanModalData.plannedCompletionDate
                    ? `${t.executionDate || 'Planned Completion'}: ${new Date(matchedPlanModalData.plannedCompletionDate).toLocaleDateString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}`
                    : (t.dateNotSpecified || 'Execution date: Not specified in the available government plan')}
                </span>
              </div>

              {matchedPlanModalData.reason && (
                <div className="bg-blue-50/70 rounded-lg p-2.5 text-[11px] text-blue-900 border border-blue-100">
                  <span className="font-semibold">AI Match: </span>
                  {matchedPlanModalData.reason}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanForModal(matchedPlanModalData);
                  setShowPlansModal(true);
                  setMatchedPlanModalData(null);
                }}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>{t.viewPlanDetails || 'View Plan Details'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setMatchedPlanModalData(null)}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                {t.closeBtn || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Submission Notification Modal */}
      {duplicateModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-300 w-full max-w-md overflow-hidden p-6 sm:p-7 space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 font-indic">
                Your request has already been submitted.
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                An active civic request addressing this same issue is already pending or under active implementation.
              </p>
            </div>

            {duplicateModalData.matchedRequest && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {duplicateModalData.matchedRequest.requestCode || `REQ-${duplicateModalData.matchedRequest.id}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
                    {duplicateModalData.matchedRequest.status || 'Active'}
                  </span>
                </div>
                {duplicateModalData.matchedRequest.category && (
                  <p className="text-slate-700 font-semibold">
                    Sector: <span className="font-bold text-[#002B49]">{duplicateModalData.matchedRequest.category}</span>
                  </p>
                )}
                {duplicateModalData.matchedRequest.createdAt && (
                  <p className="text-slate-400 text-[11px]">
                    Submitted on: {new Date(duplicateModalData.matchedRequest.createdAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDuplicateModalData(null);
                  setShowHistoryModal(true);
                }}
                className="w-full py-3 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                View Request Status
              </button>
              <button
                type="button"
                onClick={() => setDuplicateModalData(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse More Languages Modal */}
      <BrowseMoreLanguagesModal
        isOpen={isBrowseLanguagesOpen}
        onClose={() => setIsBrowseLanguagesOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-600 font-indic">
            {t.appName} &bull; {t.demoModeNotice}
          </p>
          <p className="text-[10px] text-slate-400">
            Design for Indian Citizens &bull; Voice-first Development Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}
