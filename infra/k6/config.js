/**
 * k6 Shared Configuration
 *
 * Centralized configuration for load testing the in-midst-my-life API.
 * Import this module in test scenarios for consistent settings.
 */

// Environment-based configuration with sensible defaults
export const config = {
  // Base URL for API requests (override with K6_BASE_URL env var)
  baseUrl: __ENV.K6_BASE_URL || 'http://localhost:3001',

  // API version prefix
  apiVersion: __ENV.K6_API_VERSION || 'v1',

  // Test profile ID (for profile-specific tests)
  // Set via K6_PROFILE_ID env var or use seeded demo profile
  profileId: __ENV.K6_PROFILE_ID || '00000000-0000-0000-0000-000000000001',

  // Authentication token (for protected endpoints)
  authToken: __ENV.K6_AUTH_TOKEN || '', // allow-secret (env var with empty default)

  // Request timeout (ms)
  timeout: __ENV.K6_TIMEOUT ? parseInt(__ENV.K6_TIMEOUT, 10) : 30000,

  // Enable verbose logging
  verbose: __ENV.K6_VERBOSE === 'true',
};

// Default HTTP request parameters
export const defaultParams = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Version': '1',
    ...(config.authToken && { 'Authorization': `Bearer ${config.authToken}` }),
  },
  timeout: `${config.timeout}ms`,
};

// Build full URL with API version prefix
export function buildUrl(path) {
  const base = config.baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // System endpoints don't use version prefix
  const systemEndpoints = ['/health', '/ready', '/metrics'];
  if (systemEndpoints.some(ep => cleanPath.startsWith(ep))) {
    return `${base}${cleanPath}`;
  }

  return `${base}/${config.apiVersion}${cleanPath}`;
}

// Standard thresholds for all scenarios
export const standardThresholds = {
  // HTTP request duration
  'http_req_duration': ['p(50)<200', 'p(95)<500', 'p(99)<1000'],
  // HTTP request failure rate
  'http_req_failed': ['rate<0.01'],
  // Specific endpoint thresholds (tagged)
  'http_req_duration{endpoint:health}': ['p(95)<100'],
  'http_req_duration{endpoint:taxonomy}': ['p(95)<300'],
  'http_req_duration{endpoint:profile}': ['p(95)<500'],
  'http_req_duration{endpoint:narrative}': ['p(95)<2000'],
};

// Relaxed thresholds for stress testing
export const stressThresholds = {
  'http_req_duration': ['p(50)<500', 'p(95)<2000', 'p(99)<5000'],
  'http_req_failed': ['rate<0.05'],
};

// Scenario presets
export const scenarios = {
  // Quick validation - single user, short duration
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },

  // Baseline - normal expected load
  baseline: {
    executor: 'constant-vus',
    vus: 10,
    duration: '1m',
  },

  // Load - sustained moderate traffic
  load: {
    executor: 'constant-vus',
    vus: 50,
    duration: '5m',
  },

  // Stress - find breaking point with ramping
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 50 },   // Ramp up to 50
      { duration: '2m', target: 100 },  // Ramp up to 100
      { duration: '2m', target: 200 },  // Ramp up to 200 (peak)
      { duration: '1m', target: 100 },  // Scale down
      { duration: '1m', target: 0 },    // Ramp down to 0
    ],
    gracefulRampDown: '30s',
  },

  // Spike - sudden traffic burst
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 10 },  // Warm up
      { duration: '1m', target: 10 },   // Normal load
      { duration: '10s', target: 200 }, // Spike!
      { duration: '1m', target: 200 },  // Stay at spike
      { duration: '10s', target: 10 },  // Recovery
      { duration: '1m', target: 10 },   // Stabilize
    ],
  },

  // Soak - extended duration for memory leak detection
  soak: {
    executor: 'constant-vus',
    vus: 30,
    duration: '30m',
  },
};

// Narrative generation request body templates
export const narrativePayloads = {
  minimal: {
    contexts: ['general'],
    tags: ['overview'],
    limit: 5,
    includeMeta: false,
  },
  standard: {
    contexts: ['professional', 'technical'],
    tags: ['engineering', 'leadership'],
    limit: 10,
    includeMeta: true,
  },
  comprehensive: {
    contexts: ['professional', 'technical', 'academic', 'creative'],
    tags: ['engineering', 'leadership', 'research', 'innovation'],
    limit: 25,
    includeMeta: true,
  },
};

// Mask selection request body templates
export const maskSelectionPayloads = {
  analyst: {
    contexts: ['analytical', 'research'],
    tags: ['data', 'metrics', 'evaluation'],
  },
  architect: {
    contexts: ['technical', 'design'],
    tags: ['systems', 'infrastructure', 'patterns'],
  },
  synthesist: {
    contexts: ['integrative', 'holistic'],
    tags: ['connections', 'synthesis', 'cross-functional'],
  },
};

// Helper to add random jitter to request timing
export function jitter(baseMs, variancePercent = 20) {
  const variance = baseMs * (variancePercent / 100);
  return baseMs + (Math.random() * variance * 2) - variance;
}

// Helper to select random item from array
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
