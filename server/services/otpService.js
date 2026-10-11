const crypto = require('crypto');

/**
 * OTP Service for Citizen Aadhaar Verification
 * Manages in-memory secure OTP lifecycle with expiration, rate limiting, and demo fallback.
 */

// In-memory store: txnId -> { otp, expiresAt, attempts, citizenData, maskedAadhaar, maskedMobile }
const otpStore = new Map();

// Periodic cleanup of expired entries every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [txnId, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(txnId);
    }
  }
}, 2 * 60 * 1000);

/**
 * Cleanly mask mobile number (e.g. 98230 14589 -> ******4589)
 */
function maskMobileNumber(rawMobile) {
  if (!rawMobile) return '******1234';
  const clean = rawMobile.replace(/\D/g, '');
  if (clean.length >= 4) {
    return '******' + clean.slice(-4);
  }
  return '******1234';
}

/**
 * Cleanly mask Aadhaar number (e.g. 2345 6789 0123 -> XXXX XXXX 0123)
 */
function maskAadhaarNumber(rawAadhaar) {
  if (!rawAadhaar) return 'XXXX XXXX 0123';
  const clean = rawAadhaar.replace(/\D/g, '');
  if (clean.length >= 4) {
    return 'XXXX XXXX ' + clean.slice(-4);
  }
  return 'XXXX XXXX 0123';
}

/**
 * Generate secure 6-digit OTP and register transaction
 */
function generateOtp(aadhaarNumber, citizenProfile) {
  const txnId = crypto.randomUUID();
  const rawOtp = (Math.floor(100000 + Math.random() * 900000)).toString();
  const expiresInSeconds = 300; // 5 minutes
  const expiresAt = Date.now() + expiresInSeconds * 1000;

  const maskedAadhaar = maskAadhaarNumber(aadhaarNumber);
  const maskedMobile = maskMobileNumber(citizenProfile?.mobile);

  otpStore.set(txnId, {
    otp: rawOtp,
    expiresAt,
    attempts: 0,
    maxAttempts: 3,
    citizenData: {
      ...citizenProfile,
      maskedAadhaar,
      maskedMobile
    },
    maskedAadhaar,
    maskedMobile
  });

  // Safe server-side console log for demo evaluation (without exposing sensitive PII)
  console.log(`[OTP Service] Generated OTP for Citizen (${maskedAadhaar}, ${maskedMobile}): [${rawOtp}] (Demo standard '123456' also accepted)`);

  return {
    txnId,
    maskedAadhaar,
    maskedMobile,
    expiresIn: expiresInSeconds
  };
}

/**
 * Verify OTP against active transaction
 */
function verifyOtp(txnId, inputOtp) {
  if (!txnId || !otpStore.has(txnId)) {
    return {
      success: false,
      code: 'OTP_EXPIRED_OR_NOT_FOUND',
      error: 'OTP session expired or not found. Please request a new OTP.'
    };
  }

  const record = otpStore.get(txnId);

  if (Date.now() > record.expiresAt) {
    otpStore.delete(txnId);
    return {
      success: false,
      code: 'OTP_EXPIRED',
      error: 'OTP has expired. Please request a new OTP.'
    };
  }

  if (record.attempts >= record.maxAttempts) {
    otpStore.delete(txnId);
    return {
      success: false,
      code: 'TOO_MANY_ATTEMPTS',
      error: 'Too many incorrect attempts. Please request a new OTP.'
    };
  }

  const cleanInput = (inputOtp || '').toString().trim();
  const isMatch = cleanInput === record.otp || cleanInput === '123456';

  if (!isMatch) {
    record.attempts += 1;
    const remaining = record.maxAttempts - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(txnId);
      return {
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        error: 'Too many incorrect attempts. Please request a new OTP.'
      };
    }
    return {
      success: false,
      code: 'INVALID_OTP',
      error: `Incorrect OTP. You have ${remaining} attempt(s) remaining.`,
      remainingAttempts: remaining
    };
  }

  // OTP Verified Successfully — Consume the single-use OTP
  const verifiedCitizenData = { ...record.citizenData };
  otpStore.delete(txnId);

  return {
    success: true,
    citizenData: verifiedCitizenData
  };
}

module.exports = {
  generateOtp,
  verifyOtp,
  maskMobileNumber,
  maskAadhaarNumber
};
