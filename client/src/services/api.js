const BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : (typeof window !== 'undefined' && (window.location.hostname.endsWith('.web.app') || window.location.hostname.endsWith('.firebaseapp.com'))
        ? 'https://india-dev-intelligence-api-1037794417743.asia-south1.run.app/api'
        : '/api')
);

export async function sendCitizenOtp(aadhaarNumber) {
  const response = await fetch(`${BASE_URL}/auth/citizen/send-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ aadhaarNumber }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to dispatch OTP');
  }
  return data;
}

export async function verifyCitizenOtp(txnId, otp, aadhaarNumber = null) {
  const response = await fetch(`${BASE_URL}/auth/citizen/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ txnId, otp, aadhaarNumber }),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || 'OTP verification failed');
    err.remainingAttempts = data.remainingAttempts;
    err.code = data.code;
    throw err;
  }
  return data;
}

export async function verifyAadhaarMock(aadhaarNumber, mobile = null) {
  const response = await fetch(`${BASE_URL}/auth/verify-aadhaar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ aadhaarNumber, mobile }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Identity verification failed');
  }
  return data;
}

export async function getDemoProfiles() {
  const response = await fetch(`${BASE_URL}/auth/demo-profiles`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch demo profiles');
  }
  return data.data;
}

export async function getDigiLockerStatus() {
  const response = await fetch(`${BASE_URL}/auth/digilocker/status`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to retrieve DigiLocker status');
  }
  return data.data;
}

export async function initiateDigiLockerLogin(language = 'mr') {
  const response = await fetch(`${BASE_URL}/auth/digilocker/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language }),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || 'Failed to initiate DigiLocker authentication');
    err.code = data.code;
    err.configured = data.configured;
    throw err;
  }
  return data;
}

export async function handleDigiLockerCallback(payload) {
  const response = await fetch(`${BASE_URL}/auth/digilocker/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || 'DigiLocker verification failed');
    err.code = data.code;
    throw err;
  }
  return data;
}


export async function fetchCitizenRequests(citizenId) {
  const response = await fetch(`${BASE_URL}/citizen/requests?citizenId=${encodeURIComponent(citizenId)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch your requests');
  }
  return data.data;
}

export async function fetchCitizenCooldownStatus(citizenId) {
  const response = await fetch(`${BASE_URL}/citizen/cooldown-status?citizenId=${encodeURIComponent(citizenId)}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to check submission status');
  }
  return data;
}

export async function sendCitizenReminder(requestId, citizenId, notes = null) {
  const response = await fetch(`${BASE_URL}/requests/${requestId}/remind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ citizenId, notes })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send reminder');
  }
  return data;
}

export async function submitRequest(payload) {
  const response = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const errorObj = new Error(data.error || data.message || 'Failed to submit development request');
    errorObj.data = data;
    errorObj.status = response.status;
    errorObj.isDuplicate = data.isDuplicate;
    errorObj.matchedRequest = data.matchedRequest;
    errorObj.cooldown = data.cooldown;
    errorObj.categoryRestricted = data.categoryRestricted;
    throw errorObj;
  }
  return data;
}

export async function govLogin(email, password, requestedState = null) {
  const response = await fetch(`${BASE_URL}/auth/gov-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, requestedState }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Government authentication failed');
  }
  return data;
}

export async function fetchGovDashboardSummary(state = 'Maharashtra', district = null, userEmail = null) {
  const query = new URLSearchParams();
  if (state) query.append('state', state);
  if (district && district !== 'All' && district !== 'All Districts') query.append('district', district);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/dashboard/summary?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard summary');
  }
  return data.data;
}

export async function fetchGovMapRequests(state = 'Maharashtra', district = null, category = null, urgency = null, userEmail = null) {
  const query = new URLSearchParams();
  if (state) query.append('state', state);
  if (district && district !== 'All' && district !== 'All Districts') query.append('district', district);
  if (category && category !== 'All') query.append('category', category);
  if (urgency && urgency !== 'All') query.append('urgency', urgency);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/map/requests?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch map markers');
  }
  return data.data || [];
}

export async function fetchGovHotspots(state = 'Maharashtra', district = null, userEmail = null) {
  const query = new URLSearchParams();
  if (state) query.append('state', state);
  if (district && district !== 'All' && district !== 'All Districts') query.append('district', district);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/regions/hotspots?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch regional hotspots');
  }
  return data.data || [];
}

export async function fetchRegionalIntelligence(regionId, userEmail = null) {
  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/regions/${regionId}/intelligence`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch regional intelligence');
  }
  return data.data;
}

export async function updateWardRequestsBatchStatus(regionId, payload, userEmail = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/regions/${regionId}/requests/batch-status`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update requests status');
  }
  return data;
}

export async function resolveLocation(payload) {
  const response = await fetch(`${BASE_URL}/regions/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to resolve location hierarchy');
  }
  return data.data;
}

export async function fetchRequests(params = {}, userEmail = null) {
  const query = new URLSearchParams();
  if (params.state && params.state !== 'All') query.append('state', params.state);
  if (params.district && params.district !== 'All' && params.district !== 'All Districts') query.append('district', params.district);
  if (params.regionId) query.append('region_id', params.regionId);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.urgency && params.urgency !== 'All') query.append('urgency', params.urgency);
  if (params.priority && params.priority !== 'All') query.append('priority', params.priority);
  if (params.requestType && params.requestType !== 'All' && params.requestType !== 'all') query.append('request_type', params.requestType);
  if (params.request_type && params.request_type !== 'All' && params.request_type !== 'all') query.append('request_type', params.request_type);
  if (params.reminded) query.append('reminded', 'true');
  if (params.language && params.language !== 'All') query.append('language', params.language);
  if (params.status && params.status !== 'All') query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/requests?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch requests');
  }
  return data;
}

export async function fetchRequestById(id) {
  const response = await fetch(`${BASE_URL}/requests/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch request detail');
  }
  return data.data;
}

export async function fetchStats() {
  const response = await fetch(`${BASE_URL}/stats`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard stats');
  }
  return data.data;
}

export async function seedDemoData() {
  const response = await fetch(`${BASE_URL}/seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to seed demo data');
  }
  return data;
}

/**
 * Fetch Structured AI Qualitative Intelligence Summary
 */
export async function fetchAiSummary(params = {}, userEmail = null) {
  const query = new URLSearchParams();
  if (params.state && params.state !== 'All') query.append('state', params.state);
  if (params.district && params.district !== 'All' && params.district !== 'All Districts') query.append('district', params.district);
  if (params.regionId) query.append('regionId', params.regionId);
  if (params.ward) query.append('ward', params.ward);
  if (params.category && params.category !== 'All' && params.category !== 'All Sectors') query.append('category', params.category);
  if (params.requestType && params.requestType !== 'All' && params.requestType !== 'all') query.append('requestType', params.requestType);
  if (params.request_type && params.request_type !== 'All' && params.request_type !== 'all') query.append('requestType', params.request_type);
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.scopeLevel) query.append('scopeLevel', params.scopeLevel);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/ai/summary?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch AI summary');
  }
  return data.data;
}

/**
 * Fetch Transparent Government Performance Statistics for Citizens
 */
export async function fetchGovernmentPerformance(params = {}) {
  const query = new URLSearchParams();
  if (params.period) query.append('period', params.period);
  if (params.state && params.state !== 'All') query.append('state', params.state);
  if (params.district && params.district !== 'All' && params.district !== 'All Districts') query.append('district', params.district);
  if (params.ward && params.ward !== 'All') query.append('ward', params.ward);

  const response = await fetch(`${BASE_URL}/citizen/performance?${query.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch government performance data');
  }
  return data.data;
}

/**
 * Fetch Government Plans (Upcoming / Completed) for Citizens
 */
export async function fetchGovernmentPlans(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.category && params.category !== 'all' && params.category !== 'All Sectors' && params.category !== 'All') query.append('category', params.category);
  if (params.state && params.state !== 'All') query.append('state', params.state);
  if (params.district && params.district !== 'All' && params.district !== 'All Districts') query.append('district', params.district);
  if (params.ward && params.ward !== 'All') query.append('ward', params.ward);
  if (params.village && params.village !== 'All') query.append('village', params.village);
  if (params.search) query.append('search', params.search);

  const response = await fetch(`${BASE_URL}/citizen/plans?${query.toString()}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch government plans');
  }
  return data.plans || [];
}

/**
 * Fetch single Government Plan detail by ID
 */
export async function fetchGovernmentPlanById(id) {
  const response = await fetch(`${BASE_URL}/citizen/plans/${id}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch government plan details');
  }
  return data.plan;
}

/**
 * Assign an approved complaint / request to a field team (Ward In-charge)
 */
export async function assignComplaintToTeam(payload, userEmail = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/ward/assign-team`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to assign complaint to field team');
  }
  return data;
}

/**
 * Fetch assigned tasks for field team
 */
export async function fetchTeamTasks(params = {}, userEmail = null) {
  const query = new URLSearchParams();
  if (typeof params === 'string') {
    query.append('teamId', params);
  } else {
    if (params.teamId) query.append('teamId', params.teamId);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
  }

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/team/tasks?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team tasks');
  }
  return data.data || [];
}

/**
 * Fetch single task details by ID or code
 */
export async function fetchTaskById(taskId, userEmail = null) {
  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/team/tasks/${taskId}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch task details');
  }
  return data.data;
}

/**
 * Field team marks task "In Progress" with required before photo
 */
export async function startTeamTask(taskId, payload = {}, userEmail = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/team/tasks/${taskId}/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to start task');
  }
  return data;
}

/**
 * Field team marks task "Completed" with required after photo and completion report notes
 */
export async function completeTeamTask(taskId, payload = {}, userEmail = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/team/tasks/${taskId}/complete`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to complete task');
  }
  return data;
}

/**
 * Citizen submits rating and feedback for completed complaint
 */
export async function submitCitizenRating(requestId, payload = {}) {
  const response = await fetch(`${BASE_URL}/citizen/requests/${requestId}/rating`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit rating');
  }
  return data;
}

/**
 * Get rating for a specific complaint
 */
export async function fetchCitizenRating(requestId) {
  const response = await fetch(`${BASE_URL}/citizen/requests/${requestId}/rating`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch rating');
  }
  return data.data;
}

/**
 * Fetch ward ratings and aggregate feedback summary
 */
export async function fetchWardRatings(params = {}, userEmail = null) {
  const query = new URLSearchParams();
  if (params.state) query.append('state', params.state);
  if (params.district) query.append('district', params.district);
  if (params.ward) query.append('ward', params.ward);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.rating && params.rating !== 'All') query.append('rating', params.rating);
  if (params.search) query.append('search', params.search);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/ward/ratings?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch ward ratings');
  }
  return data;
}

/**
 * Fetch field team ratings and aggregate performance summary
 */
export async function fetchTeamRatings(params = {}, userEmail = null) {
  const query = new URLSearchParams();
  if (params.teamId) query.append('teamId', params.teamId);
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.rating && params.rating !== 'All') query.append('rating', params.rating);
  if (params.search) query.append('search', params.search);

  const headers = {};
  if (userEmail) headers['x-gov-email'] = userEmail;

  const response = await fetch(`${BASE_URL}/team/ratings?${query.toString()}`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch team ratings');
  }
  return data;
}




