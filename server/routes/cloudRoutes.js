const express = require('express');
const router = express.Router();
const googleCloudService = require('../services/googleCloudService');

// Google Cloud Language & Voice Services Architecture Endpoints
router.get('/cloud/status', (req, res) => {
  res.json(googleCloudService.getConnectionStatus());
});

router.post('/voice/speech-to-text', async (req, res) => {
  const result = await googleCloudService.transcribeAudio(req.body?.audio, req.body?.languageCode);
  res.status(result.connected ? 200 : 503).json(result);
});

router.post('/voice/text-to-speech', async (req, res) => {
  const result = await googleCloudService.synthesizeSpeech(req.body?.text, req.body?.languageCode);
  res.status(result.connected ? 200 : 503).json(result);
});

router.post('/translate', async (req, res) => {
  const result = await googleCloudService.translateText(req.body?.text, req.body?.targetLanguage, req.body?.sourceLanguage);
  res.status(result.connected ? 200 : 503).json(result);
});

router.post('/dialogflow/detect-intent', async (req, res) => {
  const result = await googleCloudService.detectIntent(req.body?.queryText, req.body?.sessionId, req.body?.languageCode);
  res.status(result.connected ? 200 : 503).json(result);
});

module.exports = router;
