const express = require('express');
const router = express.Router();
const {
  verifyAadhaarMock,
  getDemoProfilesList,
  sendCitizenOtpHandler,
  verifyCitizenOtpHandler,
  digiLockerStatusHandler,
  digiLockerInitiateHandler,
  digiLockerCallbackHandler
} = require('../controllers/authController');
const { govLoginHandler } = require('../controllers/dashboardController');

// Citizen Aadhaar & OTP Auth Endpoints
router.post('/citizen/send-otp', sendCitizenOtpHandler);
router.post('/citizen/verify-otp', verifyCitizenOtpHandler);
router.post('/verify-aadhaar', verifyAadhaarMock);
router.get('/demo-profiles', getDemoProfilesList);

// DigiLocker Citizen Authentication Endpoints
router.get('/digilocker/status', digiLockerStatusHandler);
router.post('/digilocker/initiate', digiLockerInitiateHandler);
router.post('/digilocker/callback', digiLockerCallbackHandler);

// Government Portal Auth Endpoints
router.post('/gov-login', govLoginHandler);

module.exports = router;

