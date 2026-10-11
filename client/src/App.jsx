import React, { useState, useEffect, Suspense, lazy } from 'react';
import StartupPermissionModal from './components/common/StartupPermissionModal';

// Route-level Code Splitting for Dashboards & Flow Pages
const UnifiedLogin = lazy(() => import('./pages/auth/UnifiedLogin'));
const CitizenFlow = lazy(() => import('./pages/citizen/CitizenFlow'));
const GovernmentDashboard = lazy(() => import('./pages/state-government/GovernmentDashboard'));
const GovWardDashboard = lazy(() => import('./pages/ward-government/GovWardDashboard'));
const FieldTeamDashboard = lazy(() => import('./pages/field-team/FieldTeamDashboard'));

// Dashboard Loading Spinner Fallback
function DashboardFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#002B49] text-white p-6">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FF9933] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold tracking-wider uppercase text-amber-300">
          Jan Setu — Loading Portal Module...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  // Startup Permissions Completed State
  const [hasCompletedStartupPerms, setHasCompletedStartupPerms] = useState(() => {
    try {
      return sessionStorage.getItem('idip_startup_perms_completed') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Global UI Language State
  const [appLanguage, setAppLanguage] = useState(() => {
    try {
      return localStorage.getItem('idip_language') || sessionStorage.getItem('idip_language') || 'mr';
    } catch (e) {
      return 'mr';
    }
  });

  // Authentication Session State: null | { type: 'citizen', profile, language } | { type: 'government', level: 'state'|'ward', user }
  const [authSession, setAuthSession] = useState(() => {
    try {
      const stored = sessionStorage.getItem('idip_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Sync session changes to sessionStorage
  useEffect(() => {
    try {
      if (authSession) {
        sessionStorage.setItem('idip_auth_session', JSON.stringify(authSession));
      } else {
        sessionStorage.removeItem('idip_auth_session');
      }
    } catch (e) {
      console.warn('Could not persist auth session:', e);
    }
  }, [authSession]);

  // Handle Startup Permission Grant
  const handleStartupPermissionsGranted = ({ language, coords, locationGranted }) => {
    try {
      sessionStorage.setItem('idip_startup_perms_completed', 'true');
      if (language) {
        setAppLanguage(language);
        localStorage.setItem('idip_language', language);
        sessionStorage.setItem('idip_language', language);
      }
      if (coords) {
        sessionStorage.setItem('idip_user_coords', JSON.stringify(coords));
      }
    } catch (e) {
      console.warn('Error saving startup perms info:', e);
    }
    setHasCompletedStartupPerms(true);
  };

  // Citizen Login Callback
  const handleCitizenLoginSuccess = (profile, language = appLanguage) => {
    const session = {
      type: 'citizen',
      profile,
      language: language || appLanguage
    };
    setAuthSession(session);
  };

  // Government Login Callback (State, Ward, or Field Team)
  const handleGovLoginSuccess = (user) => {
    if (user.role === 'field_team' || user.teamCode) {
      setAuthSession({
        type: 'field_team',
        user
      });
      return;
    }

    let level = 'state';
    if (user.role === 'ward_monitor' || user.region_id || user.monitoring_ward) {
      level = 'ward';
    } else {
      level = 'state';
    }

    const session = {
      type: 'government',
      level,
      user
    };
    setAuthSession(session);
  };

  // Common Logout Callback
  const handleLogout = () => {
    sessionStorage.removeItem('idip_auth_session');
    setAuthSession(null);
  };

  // 0. Initial Launch -> Show Startup Permission + Language Selection Popup
  if (!hasCompletedStartupPerms && !authSession) {
    return (
      <div className="relative min-h-screen bg-slate-900">
        <StartupPermissionModal
          initialLanguage={appLanguage}
          onPermissionsGranted={handleStartupPermissionsGranted}
        />
      </div>
    );
  }

  // 1. Unauthenticated -> Show Unified Common Login Screen
  if (!authSession) {
    return (
      <Suspense fallback={<DashboardFallback />}>
        <UnifiedLogin
          citizenLanguage={appLanguage}
          onCitizenLoginSuccess={handleCitizenLoginSuccess}
          onGovLoginSuccess={handleGovLoginSuccess}
        />
      </Suspense>
    );
  }

  // 2. Authenticated Citizen Portal
  if (authSession.type === 'citizen') {
    return (
      <div className="relative min-h-screen flex flex-col bg-[#F4F6F9]">
        {/* Citizen Background Wallpaper */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity"
            style={{ backgroundImage: `url('/citizen-bg.jpg')` }}
          />
        </div>
        <div className="relative z-10 flex-1">
          <Suspense fallback={<DashboardFallback />}>
            <CitizenFlow
              initialProfile={authSession.profile}
              initialLanguage={authSession.language}
              onLogout={handleLogout}
            />
          </Suspense>
        </div>
      </div>
    );
  }

  // 3. Authenticated Government Portal (State & Ward Levels)
  if (authSession.type === 'government') {
    const { level, user } = authSession;

    return (
      <div className="relative min-h-screen flex flex-col bg-[#F4F6F9]">
        {/* Government Portal Background Wallpaper & Logos */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 transition-opacity"
            style={{ backgroundImage: `url('/gov-bg.jpg')` }}
          />

          {/* Wallpaper Overlay Logos (Hidden on Ward Government) */}
          {level !== 'ward' && (
            <>
              {/* Top-Left: Government Emblem */}
              <div className="absolute top-10 left-4 sm:top-12 sm:left-6 md:left-8 z-0">
                <img
                  src="/gov-emblem.png"
                  alt="State Administration"
                  className="h-20 sm:h-28 md:h-36 lg:h-44 w-auto object-contain opacity-95 drop-shadow-md"
                />
              </div>

              {/* Top-Right: Digital Governance Logo */}
              <div className="absolute top-12 right-4 sm:top-14 sm:right-6 md:right-8 z-0">
                <img
                  src="/digital-india.png"
                  alt="Digital Governance"
                  className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto object-contain opacity-95 drop-shadow-md"
                />
              </div>
            </>
          )}
        </div>

        <div className="relative z-10 flex-1">
          <Suspense fallback={<DashboardFallback />}>
            {level === 'ward' ? (
              <GovWardDashboard
                govUser={user}
                onLogout={handleLogout}
              />
            ) : (
              <GovernmentDashboard
                govUser={user}
                onLogout={handleLogout}
                onChangeState={(st) =>
                  setAuthSession((prev) => ({
                    ...prev,
                    user: { ...prev.user, monitoringState: st, monitoring_state: st }
                  }))
                }
              />
            )}
          </Suspense>
        </div>
      </div>
    );
  }

  // 4. Authenticated Government Field Team Dashboard
  if (authSession.type === 'field_team') {
    return (
      <Suspense fallback={<DashboardFallback />}>
        <FieldTeamDashboard
          user={authSession.user}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // Fallback -> Common Login
  return (
    <Suspense fallback={<DashboardFallback />}>
      <UnifiedLogin
        onCitizenLoginSuccess={handleCitizenLoginSuccess}
        onGovLoginSuccess={handleGovLoginSuccess}
      />
    </Suspense>
  );
}
