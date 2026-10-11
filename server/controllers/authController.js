const path = require('path');
const fs = require('fs');

function loadCitizenProfiles() {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'demo', 'citizen_profiles.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.warn('Could not read citizen_profiles.json:', err.message);
  }
  return [];
}

const DEMO_PROFILES = loadCitizenProfiles();

const { generateOtp, verifyOtp, maskAadhaarNumber, maskMobileNumber } = require('../services/otpService');

/**
 * Step 1: Send OTP to Citizen's registered mobile after Aadhaar validation
 * Endpoint: POST /api/auth/citizen/send-otp
 */
function sendCitizenOtpHandler(req, res) {
  try {
    const { aadhaarNumber } = req.body;
    const cleanAadhaar = (aadhaarNumber || '').toString().replace(/\D/g, '');

    if (cleanAadhaar.length !== 12) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 12-digit Aadhaar number.'
      });
    }

    // Match against database / demo profiles
    const suffix = cleanAadhaar.slice(-4);
    const matched = DEMO_PROFILES.find(p => p.aadhaarSuffix === suffix) || DEMO_PROFILES[0];

    const citizenProfile = {
      citizenId: `CIT-${cleanAadhaar.slice(0, 4)}-${suffix}`,
      name: matched.name,
      mobile: matched.mobile,
      address: matched.address,
      district: matched.district,
      state: matched.state,
      defaultLanguage: matched.defaultLanguage,
      coordinates: {
        latitude: matched.lat,
        longitude: matched.lng
      },
      verifiedAt: new Date().toISOString()
    };

    const otpResult = generateOtp(cleanAadhaar, citizenProfile);

    return res.status(200).json({
      success: true,
      message: 'OTP has been sent to your registered mobile number.',
      data: {
        txnId: otpResult.txnId,
        maskedAadhaar: otpResult.maskedAadhaar,
        maskedMobile: otpResult.maskedMobile,
        expiresIn: otpResult.expiresIn
      }
    });

  } catch (err) {
    console.error('[Auth Controller] Error in sendCitizenOtpHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to dispatch OTP. Please try again.'
    });
  }
}

/**
 * Step 2: Verify OTP and return authenticated citizen details
 * Endpoint: POST /api/auth/citizen/verify-otp
 */
function verifyCitizenOtpHandler(req, res) {
  try {
    const { txnId, otp, aadhaarNumber } = req.body;

    if (!txnId) {
      return res.status(400).json({
        success: false,
        error: 'OTP transaction ID is required.'
      });
    }

    if (!otp || otp.toString().trim().length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 6-digit numeric OTP.'
      });
    }

    const verifyResult = verifyOtp(txnId, otp);

    if (!verifyResult.success) {
      const status = verifyResult.code === 'TOO_MANY_ATTEMPTS' ? 429 : 400;
      return res.status(status).json({
        success: false,
        error: verifyResult.error,
        code: verifyResult.code,
        remainingAttempts: verifyResult.remainingAttempts
      });
    }

    const citizen = verifyResult.citizenData;

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Aadhaar OTP verification successful.',
      data: citizen,
      citizen,
      token: citizen.citizenId
    });

  } catch (err) {
    console.error('[Auth Controller] Error in verifyCitizenOtpHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'OTP verification failed. Please try again.'
    });
  }
}

function verifyAadhaarMock(req, res) {
  try {
    const { aadhaarNumber, mobile } = req.body;
    
    // Clean string input (remove spaces/hyphens)
    const cleaned = (aadhaarNumber || '').replace(/\D/g, '');
    
    if (cleaned.length !== 12) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 12-digit Aadhaar number for mock verification.'
      });
    }

    // Find matching demo profile or pick by last 4 digits / default
    const suffix = cleaned.slice(-4);
    let matchedProfile = DEMO_PROFILES.find(p => p.aadhaarSuffix === suffix) || DEMO_PROFILES[0];

    // Generate internal safe citizen identifier (NEVER stores or returns real Aadhaar)
    const citizenId = `CIT-${cleaned.slice(0, 4)}-${suffix}`;
    const maskedAadhaar = `XXXX XXXX ${suffix}`;

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Identity verification successful (Mock Sandbox).',
      data: {
        citizenId,
        maskedAadhaar,
        name: matchedProfile.name,
        mobile: mobile || matchedProfile.mobile,
        address: matchedProfile.address,
        district: matchedProfile.district,
        state: matchedProfile.state,
        defaultLanguage: matchedProfile.defaultLanguage,
        coordinates: {
          latitude: matchedProfile.lat,
          longitude: matchedProfile.lng
        },
        verifiedAt: new Date().toISOString(),
        isDemoMock: true
      }
    });

  } catch (err) {
    console.error('Error during Aadhaar mock verification:', err);
    return res.status(500).json({
      success: false,
      error: 'Identity verification could not be completed. Please try again.'
    });
  }
}

function getDemoProfilesList(req, res) {
  const safeList = DEMO_PROFILES.map((p, idx) => ({
    id: idx + 1,
    sampleAadhaar: `XXXX XXXX ${p.aadhaarSuffix}`,
    sampleAadhaarRaw: `23456789${p.aadhaarSuffix}`,
    name: p.name,
    district: p.district,
    state: p.state,
    language: p.defaultLanguage
  }));
  res.json({ success: true, data: safeList });
}

const {
  getDigiLockerConfigStatus,
  initiateDigiLockerAuth,
  processDigiLockerCallback
} = require('../services/digiLockerService');

/**
 * Endpoint: GET /api/auth/digilocker/status
 * Returns configuration readiness of DigiLocker OAuth integration
 */
function digiLockerStatusHandler(req, res) {
  try {
    const status = getDigiLockerConfigStatus();
    return res.status(200).json({
      success: true,
      data: status
    });
  } catch (err) {
    console.error('Error in digiLockerStatusHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'Could not check DigiLocker status.'
    });
  }
}

/**
 * Endpoint: POST /api/auth/digilocker/initiate
 * Initiates official DigiLocker OAuth authorization flow or returns unconfigured notification
 */
function digiLockerInitiateHandler(req, res) {
  try {
    const { language } = req.body || {};
    const result = initiateDigiLockerAuth(language || 'mr');

    if (!result.success) {
      const statusCode = result.code === 'DIGILOCKER_NOT_CONFIGURED' ? 503 : 400;
      return res.status(statusCode).json({
        success: false,
        configured: result.configured || false,
        code: result.code,
        error: result.error
      });
    }

    return res.status(200).json({
      success: true,
      configured: true,
      authUrl: result.authUrl,
      state: result.state,
      expiresIn: result.expiresIn
    });
  } catch (err) {
    console.error('Error in digiLockerInitiateHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to initiate DigiLocker authentication.'
    });
  }
}

/**
 * Endpoint: POST /api/auth/digilocker/callback
 * Validates state, exchanges auth code for token, verifies citizen identity, and establishes JanSetu session
 */
async function digiLockerCallbackHandler(req, res) {
  try {
    const { code, state, error, error_description } = req.body || {};

    const result = await processDigiLockerCallback({
      code,
      state,
      error,
      error_description
    });

    if (!result.success) {
      let statusCode = 400;
      if (result.code === 'EXPIRED_STATE') statusCode = 410;
      if (result.code === 'DIGILOCKER_NOT_CONFIGURED') statusCode = 503;
      if (result.code === 'AUTH_CANCELLED') statusCode = 403;

      return res.status(statusCode).json({
        success: false,
        code: result.code,
        error: result.error
      });
    }

    const citizen = result.citizen;

    return res.status(200).json({
      success: true,
      verified: true,
      authMethod: 'digilocker',
      message: 'DigiLocker authentication and identity verification successful.',
      data: citizen,
      citizen,
      token: citizen.citizenId
    });

  } catch (err) {
    console.error('Error in digiLockerCallbackHandler:', err);
    return res.status(500).json({
      success: false,
      error: 'DigiLocker verification failed. Please try again.'
    });
  }
}

module.exports = {
  sendCitizenOtpHandler,
  verifyCitizenOtpHandler,
  verifyAadhaarMock,
  getDemoProfilesList,
  digiLockerStatusHandler,
  digiLockerInitiateHandler,
  digiLockerCallbackHandler
};

