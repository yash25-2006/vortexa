import React, { useState, useEffect } from 'react';
import {
  Landmark,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Users,
  Building2,
  Globe2,
  Home,
  CheckCircle2,
  Sparkles,
  Phone,
  Languages,
  Eye,
  EyeOff,
  KeyRound,
  RotateCw,
  MapPin,
  User,
  HardHat,
  Truck,
  Wrench,
  Layers
} from 'lucide-react';
import { govLogin, getDemoProfiles, sendCitizenOtp, verifyCitizenOtp, getDigiLockerStatus, initiateDigiLockerLogin, handleDigiLockerCallback } from '../../services/api';
import { TRANSLATIONS } from '../../constants/translations';
import BrowseMoreLanguagesModal from '../../components/common/BrowseMoreLanguagesModal';
import FieldTeamLoginFlow from '../field-team/FieldTeamLoginFlow';

import demoAccountsData from '../../data/demoAccounts.json';

const DEMO_GOVERNMENT_TIERS = demoAccountsData.governmentTiers || {};

export default function UnifiedLogin({
  onCitizenLoginSuccess,
  onGovLoginSuccess,
  citizenLanguage = 'mr',
  initialTab = 'citizen'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'citizen' or 'government'

  // Citizen Authentication Flow State
  // Steps: 1: 'aadhaar' -> 2: 'otp' -> 3: 'confirm'
  const [citizenStep, setCitizenStep] = useState(1);
  const [aadhaarInput, setAadhaarInput] = useState('2345 6789 0123');
  const [otpInput, setOtpInput] = useState('');
  const [txnId, setTxnId] = useState(null);
  const [maskedMobile, setMaskedMobile] = useState('');
  const [maskedAadhaar, setMaskedAadhaar] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [citizenLoading, setCitizenLoading] = useState(false);
  const [citizenError, setCitizenError] = useState('');
  const [verifiedCitizen, setVerifiedCitizen] = useState(null);
  const [demoCitizens, setDemoCitizens] = useState([]);

  // DigiLocker State
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [digiLockerConfig, setDigiLockerConfig] = useState({ configured: null, checked: false });
  const [digiLockerNotice, setDigiLockerNotice] = useState(null);

  // Government Login State
  const [selectedGovTier, setSelectedGovTier] = useState('state');
  const [govEmail, setGovEmail] = useState(DEMO_GOVERNMENT_TIERS.state.email);
  const [govPassword, setGovPassword] = useState(DEMO_GOVERNMENT_TIERS.state.password);
  const [showPassword, setShowPassword] = useState(false);
  const [govLoading, setGovLoading] = useState(false);
  const [govError, setGovError] = useState('');
  const [isBrowseLanguagesOpen, setIsBrowseLanguagesOpen] = useState(false);
  const [isFieldTeamFlowOpen, setIsFieldTeamFlowOpen] = useState(false);

  const t = TRANSLATIONS[citizenLanguage] || TRANSLATIONS.en;

  // Load demo citizen profiles and check DigiLocker configuration status
  useEffect(() => {
    getDemoProfiles()
      .then((profiles) => {
        if (Array.isArray(profiles) && profiles.length > 0) {
          setDemoCitizens(profiles);
        }
      })
      .catch((err) => console.warn('Could not load demo citizen profiles:', err));

    getDigiLockerStatus()
      .then((status) => {
        setDigiLockerConfig({
          configured: Boolean(status?.configured),
          message: status?.message,
          checked: true
        });
      })
      .catch((err) => {
        console.warn('Could not check DigiLocker status:', err);
        setDigiLockerConfig({ configured: false, checked: true });
      });
  }, []);

  // Check for DigiLocker OAuth return parameters in URL (code & state or error)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (code || error) {
        // Clean query parameters from URL so refreshes don't re-trigger
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab('citizen');

        if (error) {
          const isCancelled = error === 'access_denied' || error.toLowerCase().includes('cancel');
          setCitizenError(
            isCancelled
              ? 'DigiLocker login was cancelled by the user.'
              : (errorDescription || `DigiLocker authorization failed: ${error}`)
          );
          return;
        }

        if (code && state) {
          setDigiLockerLoading(true);
          handleDigiLockerCallback({ code, state })
            .then((res) => {
              if (res.success && res.data) {
                setVerifiedCitizen(res.data);
                setCitizenStep(3); // Confirmation step with verified citizen details
              } else {
                throw new Error(res.error || 'DigiLocker verification failed.');
              }
            })
            .catch((err) => {
              console.error('DigiLocker callback handling error:', err);
              setCitizenError(err.message || 'DigiLocker verification failed. Please try again.');
            })
            .finally(() => {
              setDigiLockerLoading(false);
            });
        }
      }
    } catch (e) {
      console.warn('Error checking DigiLocker redirect parameters:', e);
    }
  }, []);

  // Handler for "Login with DigiLocker" button
  const handleDigiLockerLogin = async () => {
    setCitizenError('');
    setDigiLockerNotice(null);
    setDigiLockerLoading(true);

    try {
      const res = await initiateDigiLockerLogin(citizenLanguage);
      if (res.success && res.authUrl) {
        // Redirect browser to official DigiLocker authorization portal
        window.location.href = res.authUrl;
      } else {
        throw new Error(res.error || 'DigiLocker authorization URL could not be generated.');
      }
    } catch (err) {
      console.warn('DigiLocker initiate notice/error:', err);
      if (err.code === 'DIGILOCKER_NOT_CONFIGURED' || err.configured === false) {
        setDigiLockerNotice({
          type: 'unconfigured',
          title: t.digiLockerNotConfigured || 'Integration not configured',
          message: t.digiLockerNotConfiguredDesc || 'Official DigiLocker API credentials (DIGILOCKER_CLIENT_ID / DIGILOCKER_CLIENT_SECRET) are not configured in the server environment.'
        });
      } else {
        setCitizenError(err.message || 'Unable to connect to DigiLocker at this time. Please try again later.');
      }
    } finally {
      setDigiLockerLoading(false);
    }
  };

  // Resend OTP countdown timer
  useEffect(() => {
    let timer = null;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Format Aadhaar input with spaces (XXXX XXXX XXXX)
  const handleAadhaarChange = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += digits[i];
    }
    setAadhaarInput(formatted);
    setCitizenError('');
  };

  // Quick pick demo citizen profile
  const handleSelectDemoProfile = (sampleRaw) => {
    handleAadhaarChange(sampleRaw);
    setCitizenError('');
  };

  // --- Step 1: Send OTP ---
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setCitizenError('');

    const rawDigits = aadhaarInput.replace(/\D/g, '');
    if (rawDigits.length !== 12) {
      setCitizenError(t.invalidAadhaarError || 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    setCitizenLoading(true);

    try {
      const res = await sendCitizenOtp(rawDigits);
      if (res.success && res.data) {
        setTxnId(res.data.txnId);
        setMaskedMobile(res.data.maskedMobile || '******1234');
        setMaskedAadhaar(res.data.maskedAadhaar || `XXXX XXXX ${rawDigits.slice(-4)}`);
        setResendCountdown(30);
        setOtpInput('');
        setCitizenStep(2); // Move to OTP verification
      } else {
        throw new Error(res.error || 'Failed to dispatch OTP. Please try again.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setCitizenError(err.message || 'Failed to send OTP to registered mobile number.');
    } finally {
      setCitizenLoading(false);
    }
  };

  // --- Step 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setCitizenError('');

    const cleanOtp = otpInput.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setCitizenError('Please enter the 6-digit numeric OTP sent to your registered mobile.');
      return;
    }

    setCitizenLoading(true);

    try {
      const rawDigits = aadhaarInput.replace(/\D/g, '');
      const res = await verifyCitizenOtp(txnId, cleanOtp, rawDigits);
      if (res.success && res.data) {
        setVerifiedCitizen(res.data);
        setCitizenStep(3); // Move to Details Confirmation
      } else {
        throw new Error(res.error || 'Incorrect OTP. Please try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setCitizenError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setCitizenLoading(false);
    }
  };

  // --- Step 3: Confirm Details & Enter Citizen Portal ---
  const handleConfirmCitizenDetails = () => {
    if (verifiedCitizen && onCitizenLoginSuccess) {
      onCitizenLoginSuccess(verifiedCitizen, citizenLanguage);
    }
  };

  // --- Government Login Handlers ---
  const handleSelectGovTier = (tierKey) => {
    setSelectedGovTier(tierKey);
    const account = DEMO_GOVERNMENT_TIERS[tierKey];
    if (account) {
      setGovEmail(account.email);
      setGovPassword(account.password);
      setGovError('');
    }
  };

  const handleGovSubmit = async (e) => {
    e.preventDefault();
    setGovError('');
    setGovLoading(true);

    try {
      if (!govEmail.trim() || !govPassword.trim()) {
        throw new Error('Please provide both official government email and password.');
      }

      const res = await govLogin(govEmail.trim().toLowerCase(), govPassword);
      if (res.success && res.user) {
        if (onGovLoginSuccess) {
          onGovLoginSuccess(res.user);
        }
      } else {
        throw new Error(res.error || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Government login error:', err);
      setGovError(err.message || 'Invalid credentials. Please verify your government email and password.');
    } finally {
      setGovLoading(false);
    }
  };

  if (isFieldTeamFlowOpen) {
    return (
      <FieldTeamLoginFlow
        onBackToGovLogin={() => {
          setIsFieldTeamFlowOpen(false);
          setGovError('');
        }}
        onFieldTeamLoginSuccess={(teamUser) => {
          if (onGovLoginSuccess) {
            onGovLoginSuccess(teamUser);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-800">
      {/* Top National Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Authentication Container */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative">
        {/* Background Wallpaper Image */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transition-opacity"
            style={{ backgroundImage: `url('/gov-bg.jpg')` }}
          />
        </div>

        {/* Auth Box Container */}
        <div className="relative z-10 w-full max-w-xl mx-auto">
          {/* Platform Branding Header */}
          <div className="text-center mb-6 sm:mb-8 space-y-2">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <img
                src="/gov-emblem.png"
                alt="Government of India Emblem"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#002B49] tracking-tight">
              India Development Intelligence Platform
            </h1>
            <div className="pt-1 flex items-center justify-center space-x-2 text-xs">
              <span className="font-bold text-slate-500">Interface Language:</span>
              <span className="font-extrabold text-[#002B49] bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {citizenLanguage === 'mr' ? 'मराठी (Marathi)' : citizenLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
              </span>
              <button
                type="button"
                onClick={() => setIsBrowseLanguagesOpen(true)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Browse More Languages</span>
              </button>
            </div>
          </div>

          {/* Card Wrapper */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Top Common Toggle / Segmented Control */}
            <div className="p-3 bg-slate-100 border-b border-slate-200">
              <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-2xl border border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('citizen');
                    setGovError('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'citizen'
                      ? 'bg-[#002B49] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#FF9933]" />
                  <span>Citizen Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('government');
                    setCitizenError('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    activeTab === 'government'
                      ? 'bg-[#002B49] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Government Official</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT: CITIZEN */}
            {activeTab === 'citizen' && (
              <div className="p-6 sm:p-8 animate-fadeIn space-y-6">
                {/* Citizen Header */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>Aadhaar Identity Verification</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {citizenStep === 1
                      ? 'Citizen Login with Aadhaar'
                      : citizenStep === 2
                      ? 'OTP Verification'
                      : 'Confirm Citizen Profile'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium font-indic">
                    {citizenStep === 1
                      ? 'Enter your 12-digit Aadhaar number to verify your identity and access civic services.'
                      : citizenStep === 2
                      ? 'Enter the 6-digit OTP dispatched to your Aadhaar-linked registered mobile number.'
                      : 'Review and confirm your verified identity details before entering the Citizen Portal.'}
                  </p>
                </div>

                {/* Citizen Error Alert */}
                {citizenError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-xs font-semibold animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span>{citizenError}</span>
                  </div>
                )}

                {/* STEP 1: Enter Aadhaar Number */}
                {citizenStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#002B49]" />
                          <span>Aadhaar Number</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">12 Digits</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="XXXX XXXX XXXX"
                        value={aadhaarInput}
                        onChange={(e) => handleAadhaarChange(e.target.value)}
                        className="w-full text-center text-lg sm:text-xl font-mono font-bold tracking-widest py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={citizenLoading || aadhaarInput.replace(/\D/g, '').length !== 12}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                    >
                      {citizenLoading ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating &amp; Sending OTP...</span>
                        </span>
                      ) : (
                        <>
                          <span>Send OTP to Registered Mobile</span>
                          <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                        </>
                      )}
                    </button>

                    {/* Clear "OR" Separator */}
                    <div className="relative flex items-center justify-center my-4">
                      <div className="border-t border-slate-300 w-full" />
                      <div className="absolute bg-white px-3 text-xs font-black text-slate-500 uppercase tracking-widest">
                        {t.orSeparator || 'OR'}
                      </div>
                    </div>

                    {/* Secondary Button: Login with DigiLocker */}
                    <button
                      type="button"
                      onClick={handleDigiLockerLogin}
                      disabled={digiLockerLoading || citizenLoading}
                      className="w-full py-3.5 px-5 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-300 hover:border-[#002B49] shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center space-x-3 cursor-pointer group disabled:opacity-60"
                    >
                      {digiLockerLoading ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-4 h-4 border-2 border-[#002B49]/30 border-t-[#002B49] rounded-full animate-spin" />
                          <span className="text-slate-700">{t.digiLockerConnecting || 'Connecting to DigiLocker...'}</span>
                        </span>
                      ) : (
                        <>
                          {/* DigiLocker Official Logo Icon */}
                          <div className="w-6 h-6 rounded-md bg-[#002B49] flex items-center justify-center p-1 text-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                            <Lock className="w-3.5 h-3.5 text-[#FF9933]" />
                          </div>
                          <span className="group-hover:text-[#002B49] transition-colors">
                            {t.loginWithDigiLocker || 'Login with DigiLocker'}
                          </span>
                          <span className="ml-auto text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden sm:inline-block">
                            {t.digiLockerBadge || 'Govt. Identity'}
                          </span>
                        </>
                      )}
                    </button>

                    {/* DigiLocker Unconfigured Notice Message */}
                    {digiLockerNotice && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1 animate-fadeIn">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                          <span>{digiLockerNotice.title}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-800">
                          {digiLockerNotice.message}
                        </p>
                      </div>
                    )}

                    {/* Quick Pick Demo Citizens */}
                    {demoCitizens.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Quick Demo Profiles (Autofill Aadhaar):</span>
                          <span className="text-emerald-700 font-medium lowercase">1-click test</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {demoCitizens.slice(0, 4).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectDemoProfile(c.sampleAadhaarRaw)}
                              className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#002B49] hover:bg-slate-50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-[#002B49]">
                                  {c.name.split('(')[0].trim()}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  {c.district}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                                {c.sampleAadhaar}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </form>
                )}

                {/* STEP 2: OTP Verification */}
                {citizenStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-950">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>OTP Dispatched Successfully</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        OTP has been sent to your registered mobile number: <strong className="font-mono text-slate-900">{maskedMobile}</strong> (Aadhaar: <span className="font-mono">{maskedAadhaar}</span>).
                      </p>
                      <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
                        Demo Mode: Standard code <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.2 rounded">123456</span> or server console OTP accepted.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-[#002B49]" />
                          <span>Enter 6-Digit OTP</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Valid for 5 mins</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        autoFocus
                        required
                        placeholder="••••••"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-2xl font-mono font-black tracking-[0.5em] py-3.5 px-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenStep(1);
                          setCitizenError('');
                        }}
                        className="text-[#002B49] font-bold hover:underline cursor-pointer"
                      >
                        &larr; Change Aadhaar
                      </button>

                      {resendCountdown > 0 ? (
                        <span className="text-slate-400">
                          Resend OTP in <strong>{resendCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={citizenLoading}
                          className="text-[#002B49] font-bold hover:underline flex items-center space-x-1 cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={citizenLoading || otpInput.replace(/\D/g, '').length !== 6}
                      className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer mt-2"
                    >
                      {citizenLoading ? (
                        <span className="flex items-center space-x-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying OTP &amp; Profile...</span>
                        </span>
                      ) : (
                        <>
                          <span>Verify OTP &amp; Proceed</span>
                          <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 3: Confirm Details */}
                {citizenStep === 3 && verifiedCitizen && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Verified Citizen Details
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>OTP Verified</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[11px]">Full Name:</span>
                          <span className="font-bold text-slate-900 text-sm">{verifiedCitizen.name}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Aadhaar:</span>
                          <span className="font-bold font-mono text-slate-900">{verifiedCitizen.maskedAadhaar || maskedAadhaar}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Registered Mobile:</span>
                          <span className="font-bold font-mono text-slate-900">{verifiedCitizen.maskedMobile || maskedMobile}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">District &amp; State:</span>
                          <span className="font-bold text-slate-900">{verifiedCitizen.district}, {verifiedCitizen.state}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block text-[11px]">Registered Address:</span>
                          <span className="font-medium text-slate-700">{verifiedCitizen.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCitizenStep(1);
                          setAadhaarInput('');
                          setOtpInput('');
                          setVerifiedCitizen(null);
                        }}
                        className="w-1/3 py-3 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer text-center"
                      >
                        Change
                      </button>

                      <button
                        type="button"
                        onClick={handleConfirmCitizenDetails}
                        className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
                      >
                        <span>Confirm &amp; Enter Citizen Portal</span>
                        <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: GOVERNMENT */}
            {activeTab === 'government' && (
              <div className="p-6 sm:p-8 animate-fadeIn space-y-6">
                {/* Government Official Header */}
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Official Administration Access</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Government Portal Login</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    State and Ward Officers must authenticate to access authorized administration dashboards.
                  </p>
                </div>

                {/* Clean, Full-Width Horizontal Government Field Team Login Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFieldTeamFlowOpen(true);
                    setGovError('');
                  }}
                  className="w-full py-4 px-5 rounded-2xl bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base border-2 border-slate-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <HardHat className="w-5 h-5 text-[#FF9933] flex-shrink-0" />
                    <span className="tracking-wide">Government Field Team Login</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#FF9933] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    Or State / Ward Administration
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>

                  {/* Error Banner */}
                  {govError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-800 text-xs font-semibold animate-shake">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                      <span>{govError}</span>
                    </div>
                  )}

                  {/* Government Login Form */}
                  <form onSubmit={handleGovSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Official Email / Government ID</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. demo.maharashtra@demo.gov"
                      value={govEmail}
                      onChange={(e) => setGovEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#002B49]" />
                      <span>Password</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={govPassword}
                        onChange={(e) => setGovPassword(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#002B49] focus:outline-none transition-all shadow-inner"
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

                  <button
                    type="submit"
                    disabled={govLoading}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#002B49] hover:bg-[#003961] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer mt-2"
                  >
                    {govLoading ? (
                      <span className="flex items-center space-x-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Authorization...</span>
                      </span>
                    ) : (
                      <>
                        <span>Secure Official Sign In</span>
                        <ArrowRight className="w-4 h-4 text-[#FF9933]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Authorized Demo Government Accounts: 2 Selectable Cards */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Authorized Demo Government Accounts:</span>
                    <span className="text-slate-400 font-normal">Click card to autofill</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                    {Object.values(DEMO_GOVERNMENT_TIERS).map((tier) => {
                      const isSelected = selectedGovTier === tier.id || govEmail === tier.email;
                      return (
                        <div
                          key={tier.id}
                          onClick={() => handleSelectGovTier(tier.id)}
                          className={`relative rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between text-center select-none ${
                            isSelected
                              ? 'border-[#002B49] bg-slate-50 shadow-md ring-2 ring-[#002B49]/20'
                              : 'border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/60 shadow-xs'
                          }`}
                        >
                          {/* Header with Emoji and Tier */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-center space-x-1.5">
                              <span className="text-base">{tier.emoji}</span>
                              <span className="text-xs font-black tracking-wider text-slate-800 uppercase">
                                {tier.tierName}
                              </span>
                            </div>

                            {/* Title & Subtitle */}
                            <div className="py-1">
                              <h3 className="text-sm font-extrabold text-[#002B49] leading-tight">
                                {tier.title}
                              </h3>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {tier.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Action / Selected Button */}
                          <div className="pt-3 border-t border-slate-100 mt-2">
                            <div
                              className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                                isSelected
                                  ? 'bg-[#002B49] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9933]" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <span>Use Demo</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center space-x-2 text-amber-800 text-[11px] font-medium">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    Backend authorization verifies the assigned tier (State or Ward) upon successful login.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Browse More Languages Modal */}
      <BrowseMoreLanguagesModal
        isOpen={isBrowseLanguagesOpen}
        onClose={() => setIsBrowseLanguagesOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full text-center py-4 text-slate-500 text-xs font-semibold border-t border-slate-200 bg-white">
        <span>© 2026 India Development Intelligence Platform • Ministry of Electronics &amp; IT &amp; Urban Governance</span>
      </footer>
    </div>
  );
}
