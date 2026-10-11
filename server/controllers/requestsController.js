const path = require('path');
const fs = require('fs');
const db = require('../db');
const {
  processCitizenRequestWithGemini,
  detectSemanticDuplicate,
  matchCitizenRequestToGovernmentPlans,
  invalidateAiSummaryCache
} = require('../services/gemini');

const ALLOWED_PHOTO_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Submit a citizen development request with optional photo attachment
 */
async function createRequestHandler(req, res) {
  try {
    const {
      description,
      originalText,
      text,
      language: userSelectedLanguage,
      latitude,
      longitude,
      location_name,
      location,
      citizenId,
      citizen_id,
      inputType = 'text',
      input_method,
      photo,
      photoBase64,
      image,
      requestType,
      request_type,
      photoException,
      photo_exception,
      photoExceptionAcknowledged,
      photo_exception_acknowledged,
      locationAccuracy,
      location_accuracy,
      locationCapturedAt,
      location_captured_at,
      problemLocation,
      problem_location,
      problemLatitude,
      problem_latitude,
      problemLongitude,
      problem_longitude,
      problemAddress,
      problem_address,
      problemLocationSource,
      problem_location_source,
      problemAccuracy,
      problem_accuracy
    } = req.body;

    const normalizedRequestType = (requestType || request_type || 'demand').toString().toLowerCase().trim() === 'complaint'
      ? 'complaint'
      : 'demand';

    const isPhotoException = Boolean(photoException || photo_exception);
    const isPhotoExceptionAck = Boolean(photoExceptionAcknowledged || photo_exception_acknowledged);

    const rawText = (originalText || description || text || '').trim();

    if (!rawText || rawText.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please describe the problem before sending.'
      });
    }

    if (rawText.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Problem description is too short. Please provide more details.'
      });
    }

    // Optional Photo Attachment Processing & Validation
    let savedPhotoUrl = null;
    let savedAttachments = null;
    const incomingPhoto = photo || photoBase64 || image;

    if (incomingPhoto) {
      let rawDataUrl = typeof incomingPhoto === 'string'
        ? incomingPhoto
        : (incomingPhoto.dataUrl || incomingPhoto.data || incomingPhoto.base64 || '');
      let declaredType = (typeof incomingPhoto === 'object' && incomingPhoto.type) ? incomingPhoto.type.toLowerCase() : null;
      let declaredName = (typeof incomingPhoto === 'object' && incomingPhoto.name) ? incomingPhoto.name : null;

      let mimeType = declaredType;
      let base64Payload = rawDataUrl;

      // Extract MIME type from data URL if present (e.g. data:image/jpeg;base64,...)
      if (rawDataUrl.startsWith('data:')) {
        const matches = rawDataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1].toLowerCase();
          base64Payload = matches[2];
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid photo data format. Please upload a standard image file.'
          });
        }
      }

      // Check allowed image MIME types
      if (!mimeType || !ALLOWED_PHOTO_MIME_TYPES[mimeType]) {
        // Fallback extension check from filename
        if (declaredName) {
          const extMatch = declaredName.split('.').pop()?.toLowerCase();
          if (extMatch === 'jpg' || extMatch === 'jpeg') mimeType = 'image/jpeg';
          else if (extMatch === 'png') mimeType = 'image/png';
          else if (extMatch === 'webp') mimeType = 'image/webp';
        }
      }

      if (!mimeType || !ALLOWED_PHOTO_MIME_TYPES[mimeType]) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported image format. Please select a JPG, PNG, or WEBP image.'
        });
      }

      // Decode base64 to buffer
      let photoBuffer;
      try {
        photoBuffer = Buffer.from(base64Payload, 'base64');
      } catch (decodeErr) {
        return res.status(400).json({
          success: false,
          error: 'Failed to process image file. Please try selecting the photo again.'
        });
      }

      // Validate decoded file size
      if (!photoBuffer || photoBuffer.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'The selected photo file is empty. Please choose a valid image.'
        });
      }

      if (photoBuffer.length > MAX_PHOTO_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          error: 'Photo size exceeds the maximum limit of 5MB. Please choose a smaller photo.'
        });
      }

      // Store photo securely on disk (without sensitive citizen PII in filename)
      const extension = ALLOWED_PHOTO_MIME_TYPES[mimeType];
      const safeFilename = `REQ-ATT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;
      const uploadsDir = path.resolve(__dirname, '..', 'uploads', 'requests');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, safeFilename);
      fs.writeFileSync(filePath, photoBuffer);

      savedPhotoUrl = `/uploads/requests/${safeFilename}`;
      const photoSource = incomingPhoto.source || (incomingPhoto.photoSource || 'upload');
      const locationCaptured = Boolean(
        incomingPhoto.locationCaptured ||
        incomingPhoto.location_captured ||
        (incomingPhoto.photoLocation && incomingPhoto.photoLocation.latitude !== undefined && incomingPhoto.photoLocation.latitude !== null)
      );

      const photoLocation = locationCaptured ? {
        latitude: incomingPhoto.photoLocation?.latitude !== undefined ? incomingPhoto.photoLocation.latitude : (incomingPhoto.latitude || null),
        longitude: incomingPhoto.photoLocation?.longitude !== undefined ? incomingPhoto.photoLocation.longitude : (incomingPhoto.longitude || null),
        accuracy: incomingPhoto.photoLocation?.accuracy !== undefined ? incomingPhoto.photoLocation.accuracy : (incomingPhoto.accuracy || 10),
        captured_at: incomingPhoto.photoLocation?.captured_at || incomingPhoto.photoLocation?.capturedAt || incomingPhoto.captured_at || new Date().toISOString()
      } : null;

      savedAttachments = JSON.stringify([
        {
          url: savedPhotoUrl,
          filename: safeFilename,
          size: photoBuffer.length,
          type: mimeType,
          source: photoSource,
          location_captured: locationCaptured,
          photo_location: photoLocation,
          uploaded_at: new Date().toISOString()
        }
      ]);
    }

    // Extract location fields (object or flat)
    let locName = location_name || '';
    let locLat = latitude;
    let locLng = longitude;
    let locAccuracy = locationAccuracy || location_accuracy || null;
    let locCapturedAt = locationCapturedAt || location_captured_at || null;

    if (location && typeof location === 'object') {
      if (location.district && location.state) {
        locName = location.address ? location.address : `${location.district}, ${location.state}`;
      } else if (location.address) {
        locName = location.address;
      }
      if (location.latitude !== undefined) locLat = location.latitude;
      if (location.longitude !== undefined) locLng = location.longitude;
      if (location.accuracy !== undefined) locAccuracy = location.accuracy;
      if (location.captured_at !== undefined) locCapturedAt = location.captured_at;
      if (location.capturedAt !== undefined) locCapturedAt = location.capturedAt;
    }

    // Validate coordinates if provided
    let validLat = null;
    let validLng = null;
    if (locLat !== undefined && locLat !== null && locLat !== '') {
      const latNum = parseFloat(locLat);
      if (!isNaN(latNum) && latNum >= -90 && latNum <= 90) {
        validLat = latNum;
      }
    }
    if (locLng !== undefined && locLng !== null && locLng !== '') {
      const lngNum = parseFloat(locLng);
      if (!isNaN(lngNum) && lngNum >= -180 && lngNum <= 180) {
        validLng = lngNum;
      }
    }

    // 1. Location is COMPULSORY for all requests (Demand and Complaint)
    const hasValidCoords = validLat !== null && validLng !== null;
    const hasValidAddress = Boolean(locName && locName.trim().length > 0) || Boolean(req.body.district || req.body.state || req.body.village || req.body.ward);
    if (!hasValidCoords && !hasValidAddress) {
      return res.status(400).json({
        success: false,
        error: 'Location is required to submit a request. Please allow location access.'
      });
    }

    // 2. Complaint Photo Rule: Photo is compulsory unless "I don't have a photo" exception is acknowledged
    if (normalizedRequestType === 'complaint' && !savedPhotoUrl) {
      if (!isPhotoException || !isPhotoExceptionAck) {
        return res.status(400).json({
          success: false,
          error: 'A photo is required for complaints, or you must acknowledge submitting without photographic evidence.'
        });
      }
    }

    const activeCitizenId = citizenId || citizen_id || null;

    // 3. Citizen Daily Submission Cooldown (1 new request per 24 hours)
    let lastSubmission = null;
    if (activeCitizenId) {
      lastSubmission = await db.getLastSubmissionByCitizen(activeCitizenId);
      if (lastSubmission && lastSubmission.created_at) {
        const lastCreatedAt = new Date(lastSubmission.created_at).getTime();
        const diffMs = Date.now() - lastCreatedAt;
        const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;

        if (diffMs < COOLDOWN_24H_MS) {
          const remainingMs = COOLDOWN_24H_MS - diffMs;
          const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remMins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

          return res.status(429).json({
            success: false,
            cooldownActive: true,
            error: `You have already submitted a request. Next request available in: ${remHours} hours ${remMins} minutes.`,
            cooldown: {
              active: true,
              lastSubmissionAt: lastSubmission.created_at,
              nextEligibleAt: new Date(lastCreatedAt + COOLDOWN_24H_MS).toISOString(),
              remainingHours: remHours,
              remainingMinutes: remMins
            }
          });
        }
      }
    }

    // Process with Gemini AI behind the scenes (silently)
    const aiAnalysis = await processCitizenRequestWithGemini(rawText, {
      userLanguage: userSelectedLanguage,
      locationName: locName
    });

    const detectedLanguage = (userSelectedLanguage && userSelectedLanguage !== 'Auto' && userSelectedLanguage !== 'Unknown')
      ? userSelectedLanguage
      : aiAnalysis.language;

    // 4. Category Restriction: Next request after 24h must be from a different category
    if (lastSubmission && lastSubmission.category && aiAnalysis.category) {
      if (lastSubmission.category.trim().toLowerCase() === aiAnalysis.category.trim().toLowerCase()) {
        return res.status(400).json({
          success: false,
          categoryRestricted: true,
          error: 'You can submit your next request after the cooldown period and it must belong to a different category.',
          lastCategory: lastSubmission.category,
          attemptedCategory: aiAnalysis.category
        });
      }
    }

    const locationDetails = locName || aiAnalysis.location_details || (validLat && validLng ? `Lat: ${validLat.toFixed(4)}, Lng: ${validLng.toFixed(4)}` : null);

    let targetState = (location && typeof location === 'object' ? location.state : null) || req.body.state || 'Maharashtra';
    let targetDistrict = (location && typeof location === 'object' ? location.district : null) || req.body.district || 'Pune';
    let targetTaluka = (location && typeof location === 'object' ? location.taluka : null) || req.body.taluka || null;
    let targetVillage = (location && typeof location === 'object' ? location.village : null) || req.body.village || null;
    let targetWard = (location && typeof location === 'object' ? location.ward : null) || req.body.ward || null;
    let targetRegionId = req.body.region_id || req.body.regionId || (location && typeof location === 'object' ? location.region_id : null) || null;

    if (!targetRegionId && (validLat || validLng || locName || targetVillage || targetWard)) {
      try {
        const matched = await db.findRegionByCoordinatesOrName(
          validLat,
          validLng,
          targetVillage || targetWard || locName,
          targetDistrict,
          targetState
        );
        if (matched && matched.region && matched.region.id) {
          targetRegionId = matched.region.id;
          if (!targetWard && matched.region.ward) targetWard = matched.region.ward;
        }
      } catch (matchErr) {
        console.warn('Region lookup warning:', matchErr.message);
      }
    }

    // Default fallback to Bavdhan Ward if in Pune and not matched
    if (!targetRegionId && targetDistrict === 'Pune') {
      targetRegionId = 13;
    }

    // 5. Gate 1: Check if request is already covered by an Upcoming Government Plan
    try {
      const candidatePlans = await db.getActiveCandidatePlans({
        state: targetState,
        district: targetDistrict,
        ward: targetWard,
        village: targetVillage,
        category: aiAnalysis.category
      });

      if (candidatePlans && candidatePlans.length > 0) {
        const planMatchResult = await matchCitizenRequestToGovernmentPlans({
          userText: rawText,
          requestType: normalizedRequestType,
          category: aiAnalysis.category,
          location: {
            state: targetState,
            district: targetDistrict,
            ward: targetWard,
            village: targetVillage,
            locationName: locName
          },
          candidatePlans
        });

        if (planMatchResult && planMatchResult.planMatch) {
          const matched = candidatePlans.find(p =>
            p.plan_code === planMatchResult.matchedPlanCode ||
            String(p.id) === String(planMatchResult.matchedPlanCode)
          ) || candidatePlans[0];

          return res.status(200).json({
            success: true,
            planMatched: true,
            message: 'This development is already included in an upcoming government plan.',
            matchedPlan: {
              id: matched.id,
              planCode: matched.plan_code,
              title: matched.title,
              titleMr: matched.title_mr,
              titleHi: matched.title_hi,
              description: matched.description,
              descriptionMr: matched.description_mr,
              descriptionHi: matched.description_hi,
              category: matched.category,
              status: matched.status,
              state: matched.state,
              district: matched.district,
              ward: matched.ward,
              village: matched.village,
              locationName: matched.location_name,
              plannedStartDate: matched.planned_start_date,
              plannedCompletionDate: matched.planned_completion_date,
              estimatedBudget: matched.estimated_budget,
              department: matched.department,
              sourceUrl: matched.source_url,
              reason: planMatchResult.reason,
              confidence: planMatchResult.confidence
            }
          });
        }
      }
    } catch (planMatchErr) {
      console.warn('Upcoming government plan matching check warning:', planMatchErr.message);
    }

    // 6. Gate 2: Active Duplicate Check (Blocked until Completed) using Gemini AI
    const candidates = await db.getActiveCandidateRequests({
      citizenId: activeCitizenId,
      category: aiAnalysis.category,
      requestType: normalizedRequestType,
      district: targetDistrict,
      ward: targetWard
    });

    if (candidates && candidates.length > 0) {
      const dupCheck = await detectSemanticDuplicate({
        userText: rawText,
        requestType: normalizedRequestType,
        category: aiAnalysis.category,
        candidateRequests: candidates
      });

      if (dupCheck && dupCheck.isDuplicate) {
        const matched = candidates.find(c =>
          c.request_code === dupCheck.matchedRequestId ||
          String(c.id) === String(dupCheck.matchedRequestId)
        ) || candidates[0];

        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: 'Your request has already been submitted.',
          error: 'Your request has already been submitted.',
          matchedRequest: {
            id: matched.id,
            requestCode: matched.request_code || `REQ-${matched.id}`,
            category: matched.category,
            requestType: matched.request_type || normalizedRequestType,
            status: matched.status || 'New',
            submittedDate: matched.created_at,
            originalText: matched.original_text || matched.issue,
            reason: dupCheck.reason,
            confidence: dupCheck.confidence
          }
        });
      }
    }

    // Extract problem location fields (for complaints)
    const incomingProblemLocation = problemLocation || problem_location || null;
    let probLat = problemLatitude || problem_latitude || null;
    let probLng = problemLongitude || problem_longitude || null;
    let probAddress = problemAddress || problem_address || null;
    let probSource = problemLocationSource || problem_location_source || null;
    let probAccuracy = problemAccuracy || problem_accuracy || null;

    if (incomingProblemLocation && typeof incomingProblemLocation === 'object') {
      if (incomingProblemLocation.latitude !== undefined) probLat = incomingProblemLocation.latitude;
      if (incomingProblemLocation.longitude !== undefined) probLng = incomingProblemLocation.longitude;
      if (incomingProblemLocation.address !== undefined) probAddress = incomingProblemLocation.address;
      if (incomingProblemLocation.source !== undefined) probSource = incomingProblemLocation.source;
      if (incomingProblemLocation.accuracy !== undefined) probAccuracy = incomingProblemLocation.accuracy;
    }

    let validProblemLat = null;
    let validProblemLng = null;
    if (probLat !== undefined && probLat !== null && probLat !== '') {
      const pLatNum = parseFloat(probLat);
      if (!isNaN(pLatNum) && pLatNum >= -90 && pLatNum <= 90) {
        validProblemLat = pLatNum;
      }
    }
    if (probLng !== undefined && probLng !== null && probLng !== '') {
      const pLngNum = parseFloat(probLng);
      if (!isNaN(pLngNum) && pLngNum >= -180 && pLngNum <= 180) {
        validProblemLng = pLngNum;
      }
    }

    // Save structured request to Database
    const savedRecord = await db.createRequest({
      citizen_id: activeCitizenId,
      region_id: targetRegionId,
      original_text: rawText,
      original_language: detectedLanguage,
      language: detectedLanguage,
      input_type: inputType || input_method || 'text',
      category: aiAnalysis.category,
      issue: aiAnalysis.issue,
      issue_type: aiAnalysis.issue_type,
      urgency: aiAnalysis.urgency,
      affected_group: aiAnalysis.affected_group,
      state: targetState,
      district: targetDistrict,
      taluka: targetTaluka,
      village: targetVillage,
      ward: targetWard,
      location_details: locationDetails,
      latitude: validLat,
      longitude: validLng,
      ai_summary: aiAnalysis.summary,
      photo_url: savedPhotoUrl,
      attachments: savedAttachments,
      status: 'New',
      is_synthetic: false,
      request_type: normalizedRequestType,
      photo_exception: isPhotoException,
      photo_exception_acknowledged: isPhotoExceptionAck,
      location_accuracy: locAccuracy,
      location_captured_at: locCapturedAt,
      problem_latitude: validProblemLat,
      problem_longitude: validProblemLng,
      problem_address: probAddress,
      problem_location_source: probSource,
      problem_accuracy: probAccuracy
    });

    // Invalidate affected AI summary cache entries so government dashboard updates
    try {
      invalidateAiSummaryCache({
        regionId: targetRegionId,
        ward: targetWard,
        district: targetDistrict,
        state: targetState,
        category: aiAnalysis.category
      });
    } catch (cacheErr) {
      console.warn('AI cache invalidation warning:', cacheErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your request has been received.',
      requestId: savedRecord.request_code,
      data: savedRecord,
      request: savedRecord,
      photoAttached: Boolean(savedPhotoUrl),
      photoUrl: savedPhotoUrl,
      attachments: savedAttachments,
      request_type: normalizedRequestType,
      photo_exception: isPhotoException,
      problem_location: (validProblemLat || probAddress) ? {
        latitude: validProblemLat,
        longitude: validProblemLng,
        address: probAddress,
        source: probSource,
        accuracy: probAccuracy
      } : null,
      ai_metadata: {
        engine: aiAnalysis.ai_engine,
        detected_language: detectedLanguage,
        urgency: aiAnalysis.urgency,
        category: aiAnalysis.category
      }
    });

  } catch (err) {
    console.error('Error handling citizen request:', err);
    return res.status(500).json({
      success: false,
      error: "We couldn't process your request right now. Please try again."
    });
  }
}

/**
 * Get requests for a specific citizen
 */
async function getCitizenRequestsHandler(req, res) {
  try {
    const { citizenId } = req.query;
    if (!citizenId) {
      return res.status(400).json({
        success: false,
        error: 'citizenId query parameter is required.'
      });
    }

    const citizenRequests = await db.getCitizenRequests(citizenId);
    return res.status(200).json({
      success: true,
      data: citizenRequests
    });
  } catch (err) {
    console.error('Error fetching citizen requests:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve your requests.'
    });
  }
}

/**
 * Get all requests with filtering, pagination and search
 */
async function getRequestsHandler(req, res) {
  try {
    const { state, district, region_id, category, urgency, language, status, search, limit = 100, offset = 0 } = req.query;

    const results = await db.getRequests({
      state,
      district,
      region_id,
      category,
      urgency,
      language,
      status,
      search,
      limit: parseInt(limit, 10) || 100,
      offset: parseInt(offset, 10) || 0
    });

    return res.status(200).json({
      success: true,
      data: results.requests,
      total: results.total,
      limit: results.limit,
      offset: results.offset
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve development requests.'
    });
  }
}

/**
 * Get request by ID or request code
 */
async function getRequestByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const requestItem = await db.getRequestById(id);

    if (!requestItem) {
      return res.status(400).json({
        success: false,
        error: `Request not found with identifier '${id}'.`
      });
    }

    return res.status(200).json({
      success: true,
      data: requestItem
    });
  } catch (err) {
    console.error('Error fetching request by id:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve request details.'
    });
  }
}

/**
 * Get aggregated statistics for the government dashboard
 */
async function getStatsHandler(req, res) {
  try {
    const stats = await db.getStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error('Error calculating dashboard stats:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate platform statistics.'
    });
  }
}

/**
 * Handle citizen reminder on an existing request (7-day rule enforced)
 */
async function remindRequestHandler(req, res) {
  try {
    const { id } = req.params;
    const { citizenId, citizen_id, notes } = req.body;
    const targetCitizenId = citizenId || citizen_id || null;

    const updatedRecord = await db.recordReminder({
      requestId: id,
      citizenId: targetCitizenId,
      notes: notes || 'Citizen sent status reminder'
    });

    const reminderEvents = await db.getRemindersForRequest(updatedRecord.id);

    return res.status(200).json({
      success: true,
      message: 'Reminder sent successfully.',
      data: updatedRecord,
      request: updatedRecord,
      nextReminderAt: updatedRecord.next_reminder_at,
      lastRemindedAt: updatedRecord.last_reminded_at,
      reminderCount: updatedRecord.reminder_count,
      reminders: reminderEvents
    });
  } catch (err) {
    console.error('Error handling citizen reminder:', err.message);
    const msg = err.message || 'Failed to process reminder.';
    const isAuth = msg.toLowerCase().includes('unauthorized');
    return res.status(isAuth ? 403 : 400).json({
      success: false,
      error: msg
    });
  }
}

/**
 * Check citizen cooldown and last submission status
 */
async function getCitizenCooldownStatusHandler(req, res) {
  try {
    const { citizenId } = req.query;
    if (!citizenId) {
      return res.status(400).json({
        success: false,
        error: 'citizenId query parameter is required.'
      });
    }

    const lastSubmission = await db.getLastSubmissionByCitizen(citizenId);
    if (!lastSubmission || !lastSubmission.created_at) {
      return res.status(200).json({
        success: true,
        canSubmit: true,
        cooldownActive: false,
        lastSubmission: null
      });
    }

    const lastCreatedAt = new Date(lastSubmission.created_at).getTime();
    const diffMs = Date.now() - lastCreatedAt;
    const COOLDOWN_24H_MS = 24 * 60 * 60 * 1000;
    const cooldownActive = diffMs < COOLDOWN_24H_MS;

    let remainingHours = 0;
    let remainingMinutes = 0;
    if (cooldownActive) {
      const remainingMs = COOLDOWN_24H_MS - diffMs;
      remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    }

    return res.status(200).json({
      success: true,
      canSubmit: !cooldownActive,
      cooldownActive,
      lastSubmission: {
        id: lastSubmission.id,
        requestCode: lastSubmission.request_code || `REQ-${lastSubmission.id}`,
        category: lastSubmission.category,
        requestType: lastSubmission.request_type,
        createdAt: lastSubmission.created_at,
        status: lastSubmission.status
      },
      remainingHours,
      remainingMinutes,
      nextEligibleAt: new Date(lastCreatedAt + COOLDOWN_24H_MS).toISOString()
    });
  } catch (err) {
    console.error('Error checking cooldown status:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to check cooldown status.'
    });
  }
}

/**
 * Get Transparent Government Performance Analytics for Citizen Dashboard
 */
async function getGovernmentPerformanceHandler(req, res) {
  try {
    const { period = 'all', state, district, ward } = req.query;
    const performanceData = await db.getGovernmentPerformance({
      period,
      state: state || null,
      district: district || null,
      ward: ward || null
    });

    return res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (err) {
    console.error('Error fetching government performance data:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve government performance statistics.'
    });
  }
}

/**
 * Seed synthetic demo dataset
 */
async function seedDemoDataHandler(req, res) {
  try {
    const { seed } = require('../db/seed');
    await seed();
    const stats = await db.getStats();
    return res.status(200).json({
      success: true,
      message: 'Synthetic demonstration dataset seeded successfully.',
      data: stats
    });
  } catch (err) {
    console.error('Error seeding demo data:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to seed demo data: ' + (err.message || err)
    });
  }
}

/**
 * Get government plans with optional status, district, ward, category filters
 */
async function getGovernmentPlansHandler(req, res) {
  try {
    const { status, category, state, district, ward, village, search } = req.query;
    const result = await db.getGovernmentPlans({
      status: status || null,
      category: category || null,
      state: state || null,
      district: district || null,
      ward: ward || null,
      village: village || null,
      search: search || null
    });
    const plansList = Array.isArray(result) ? result : (result?.plans || []);

    return res.status(200).json({
      success: true,
      count: plansList.length,
      plans: plansList
    });
  } catch (err) {
    console.error('Error fetching government plans:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve government plans.'
    });
  }
}

/**
 * Get single government plan details by ID or code
 */
async function getGovernmentPlanByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const plan = await db.getGovernmentPlanById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Government plan not found.'
      });
    }

    return res.status(200).json({
      success: true,
      plan
    });
  } catch (err) {
    console.error('Error fetching government plan by ID:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve government plan details.'
    });
  }
}

module.exports = {
  createRequestHandler,
  getCitizenRequestsHandler,
  getCitizenCooldownStatusHandler,
  getGovernmentPerformanceHandler,
  getGovernmentPlansHandler,
  getGovernmentPlanByIdHandler,
  remindRequestHandler,
  getRequestsHandler,
  getRequestByIdHandler,
  getStatsHandler,
  seedDemoDataHandler
};

