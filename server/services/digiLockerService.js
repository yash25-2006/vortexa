const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * DigiLocker OAuth2 / API Service for JanSetu
 * Handles:
 * - Authorization URL generation (state & code_verifier PKCE / nonce)
 * - State session verification & expiration tracking
 * - Token exchange from DigiLocker token endpoint
 * - User profile retrieval (EAadhaar / User profile)
 * - Error classification (cancellation, expired request, unconfigured API, failed handshake)
 * - Linking & citizen mapping without insecure auto-merging
 */

// In-memory state store with 10-minute TTL: state -> { createdAt, expiresAt, codeVerifier, citizenLanguage }
const digilockerSessionStore = new Map();

// Periodic cleanup every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, session] of digilockerSessionStore.entries()) {
    if (now > session.expiresAt) {
      digilockerSessionStore.delete(state);
    }
  }
}, 2 * 60 * 1000);

/**
 * Check if official DigiLocker credentials are fully configured in the environment
 */
function isDigiLockerConfigured() {
  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
  const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;
  return Boolean(clientId && clientSecret && redirectUri);
}

/**
 * Get DigiLocker configuration status for frontend detection
 */
function getDigiLockerConfigStatus() {
  const configured = isDigiLockerConfigured();
  return {
    configured,
    issuer: 'DigiLocker (National e-Governance Division - NeGD, MeitY)',
    message: configured
      ? 'DigiLocker integration is active and configured.'
      : 'DigiLocker integration is not configured. Missing authorized DIGILOCKER_CLIENT_ID or DIGILOCKER_CLIENT_SECRET.'
  };
}

/**
 * Initiate DigiLocker OAuth authorization request
 */
function initiateDigiLockerAuth(preferredLanguage = 'mr') {
  if (!isDigiLockerConfigured()) {
    return {
      success: false,
      configured: false,
      code: 'DIGILOCKER_NOT_CONFIGURED',
      error: 'DigiLocker API access is not configured. Official API credentials (DIGILOCKER_CLIENT_ID, DIGILOCKER_CLIENT_SECRET) must be set in server environment.'
    };
  }

  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;
  const authEndpoint = process.env.DIGILOCKER_AUTH_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize';

  // Generate cryptographic state & PKCE code_verifier
  const state = crypto.randomBytes(24).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

  digilockerSessionStore.set(state, {
    createdAt: now,
    expiresAt,
    codeVerifier,
    language: preferredLanguage
  });

  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope: 'openid profile'
  });

  const authUrl = `${authEndpoint}?${queryParams.toString()}`;

  return {
    success: true,
    configured: true,
    authUrl,
    state,
    expiresIn: 600
  };
}

/**
 * Validate and consume OAuth state
 */
function validateAndConsumeState(state) {
  if (!state || typeof state !== 'string') {
    return { valid: false, error: 'Missing authorization state identifier.', code: 'INVALID_STATE' };
  }

  const session = digilockerSessionStore.get(state);
  if (!session) {
    return { valid: false, error: 'Session expired or invalid authorization state.', code: 'EXPIRED_OR_UNKNOWN_STATE' };
  }

  if (Date.now() > session.expiresAt) {
    digilockerSessionStore.delete(state);
    return { valid: false, error: 'The DigiLocker authorization request has expired. Please try again.', code: 'EXPIRED_STATE' };
  }

  // State is valid; consume it once to prevent replay attacks
  digilockerSessionStore.delete(state);
  return { valid: true, session };
}

/**
 * Handle callback from DigiLocker
 * Exchanges code for access token and retrieves verified citizen credentials.
 */
async function processDigiLockerCallback({ code, state, error, error_description }) {
  // 1. Check for provider-side cancellation or error
  if (error) {
    // Consume state if provided
    if (state) digilockerSessionStore.delete(state);

    const isCancelled = error === 'access_denied' || error.toLowerCase().includes('cancel');
    return {
      success: false,
      code: isCancelled ? 'AUTH_CANCELLED' : 'AUTH_REJECTED',
      error: isCancelled
        ? 'DigiLocker login was cancelled by the user.'
        : (error_description || `DigiLocker authentication failed: ${error}`)
    };
  }

  // 2. Validate state against session store
  const stateCheck = validateAndConsumeState(state);
  if (!stateCheck.valid) {
    return {
      success: false,
      code: stateCheck.code,
      error: stateCheck.error
    };
  }

  if (!code) {
    return {
      success: false,
      code: 'MISSING_CODE',
      error: 'Authorization code was not provided in the DigiLocker response.'
    };
  }

  if (!isDigiLockerConfigured()) {
    return {
      success: false,
      code: 'DIGILOCKER_NOT_CONFIGURED',
      error: 'DigiLocker server integration is not configured.'
    };
  }

  const clientId = process.env.DIGILOCKER_CLIENT_ID;
  const clientSecret = process.env.DIGILOCKER_CLIENT_SECRET;
  const redirectUri = process.env.DIGILOCKER_REDIRECT_URI;
  const tokenEndpoint = process.env.DIGILOCKER_TOKEN_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/token';
  const userinfoEndpoint = process.env.DIGILOCKER_USERINFO_URL || 'https://digilocker.meripehchaan.gov.in/public/oauth2/1/user';

  try {
    // 3. Exchange authorization code for access token
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: stateCheck.session.codeVerifier
    });

    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[DigiLocker] Token exchange error:', tokenResponse.status, errorText);
      return {
        success: false,
        code: 'TOKEN_EXCHANGE_FAILED',
        error: 'Failed to complete token exchange with DigiLocker gateway. Please try again.'
      };
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return {
        success: false,
        code: 'NO_ACCESS_TOKEN',
        error: 'Invalid response from DigiLocker token service.'
      };
    }

    // 4. Retrieve verified citizen userinfo
    const userResponse = await fetch(userinfoEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const userErr = await userResponse.text();
      console.error('[DigiLocker] Userinfo fetch error:', userResponse.status, userErr);
      return {
        success: false,
        code: 'USERINFO_FETCH_FAILED',
        error: 'Could not fetch verified identity attributes from DigiLocker.'
      };
    }

    const userData = await userResponse.json();
    
    // 5. Build verified citizen profile structure adhering to JanSetu's schema
    const rawDigiLockerId = userData.digilockerid || userData.sub || userData.id;
    if (!rawDigiLockerId) {
      return {
        success: false,
        code: 'INVALID_DIGILOCKER_IDENTITY',
        error: 'DigiLocker response did not contain a valid verified identifier.'
      };
    }

    // Derive internal safe citizenId prefixed with DL-
    const safeCitizenId = `CIT-DL-${rawDigiLockerId.slice(0, 8)}`;
    const verifiedCitizen = {
      citizenId: safeCitizenId,
      name: userData.name || userData.fullname || 'Verified Citizen',
      mobile: userData.mobile || userData.phone_number || '',
      maskedMobile: userData.mobile ? `******${userData.mobile.slice(-4)}` : '******(Verified)',
      maskedAadhaar: userData.eaadhaar ? `XXXX XXXX ${userData.eaadhaar.slice(-4)}` : 'Verified via DigiLocker',
      address: userData.address || 'Address verified via DigiLocker',
      district: userData.district || 'Pune',
      state: userData.state || 'Maharashtra',
      defaultLanguage: stateCheck.session.language || 'mr',
      authMethod: 'digilocker',
      digilockerId: rawDigiLockerId,
      verifiedAt: new Date().toISOString()
    };

    return {
      success: true,
      citizen: verifiedCitizen
    };

  } catch (netErr) {
    console.error('[DigiLocker Service] Network/execution error:', netErr);
    return {
      success: false,
      code: 'GATEWAY_COMMUNICATION_ERROR',
      error: 'Unable to communicate with DigiLocker gateway. Please check network connectivity or try again.'
    };
  }
}

module.exports = {
  isDigiLockerConfigured,
  getDigiLockerConfigStatus,
  initiateDigiLockerAuth,
  validateAndConsumeState,
  processDigiLockerCallback
};
