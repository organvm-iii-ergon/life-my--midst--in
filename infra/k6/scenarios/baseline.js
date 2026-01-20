/**
 * k6 Baseline Performance Test
 *
 * Comprehensive load testing for the in-midst-my-life API.
 * Tests all critical endpoints under various load conditions.
 *
 * Scenarios:
 *   1. smoke    - Quick validation (1 VU, 30s)
 *   2. baseline - Normal load (10 VUs, 1m)
 *   3. load     - Sustained load (50 VUs, 5m)
 *   4. stress   - Find breaking point (ramp to 200 VUs)
 *
 * Usage:
 *   # Run default baseline scenario
 *   k6 run infra/k6/scenarios/baseline.js
 *
 *   # Run specific scenario
 *   k6 run --env SCENARIO=smoke infra/k6/scenarios/baseline.js
 *   k6 run --env SCENARIO=stress infra/k6/scenarios/baseline.js
 *
 *   # Custom configuration
 *   K6_BASE_URL=https://api.example.com \
 *   K6_PROFILE_ID=uuid-here \
 *   K6_AUTH_TOKEN=jwt-token \
 *   k6 run infra/k6/scenarios/baseline.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import {
  config,
  defaultParams,
  buildUrl,
  scenarios,
  standardThresholds,
  stressThresholds,
  narrativePayloads,
  maskSelectionPayloads,
  jitter,
  randomItem,
} from '../config.js';

// ============ CUSTOM METRICS ============

// Error tracking
const errorRate = new Rate('errors');
const httpErrors = new Counter('http_errors');

// Endpoint-specific latency
const healthLatency = new Trend('health_latency', true);
const taxonomyLatency = new Trend('taxonomy_latency', true);
const profileLatency = new Trend('profile_latency', true);
const narrativeLatency = new Trend('narrative_latency', true);
const maskSelectLatency = new Trend('mask_select_latency', true);

// Throughput tracking
const requestsPerEndpoint = new Counter('requests_by_endpoint');

// Current active VUs (for stress analysis)
const activeVUs = new Gauge('active_vus');

// ============ TEST CONFIGURATION ============

// Determine which scenario to run
const selectedScenario = __ENV.SCENARIO || 'baseline';

// Build options dynamically based on selected scenario
function getOptions() {
  const scenarioConfig = scenarios[selectedScenario];
  if (!scenarioConfig) {
    throw new Error(`Unknown scenario: ${selectedScenario}. Available: ${Object.keys(scenarios).join(', ')}`);
  }

  // Use relaxed thresholds for stress testing
  const thresholds = selectedScenario === 'stress' || selectedScenario === 'spike'
    ? stressThresholds
    : standardThresholds;

  return {
    scenarios: {
      [selectedScenario]: scenarioConfig,
    },
    thresholds: {
      ...thresholds,
      // Additional custom thresholds
      'errors': ['rate<0.05'],
      'health_latency': ['p(95)<100'],
      'taxonomy_latency': ['p(95)<300'],
      'profile_latency': ['p(95)<500'],
      'narrative_latency': ['p(95)<2000'],
      'mask_select_latency': ['p(95)<500'],
    },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
    // Tags for filtering in Grafana
    tags: {
      scenario: selectedScenario,
      api_version: config.apiVersion,
    },
  };
}

export const options = getOptions();

// ============ SETUP ============

export function setup() {
  console.log('='.repeat(60));
  console.log(`k6 Baseline Performance Test`);
  console.log('='.repeat(60));
  console.log(`Scenario: ${selectedScenario}`);
  console.log(`Target: ${config.baseUrl}`);
  console.log(`API Version: ${config.apiVersion}`);
  console.log(`Profile ID: ${config.profileId}`);
  console.log(`Auth Token: ${config.authToken ? 'Configured' : 'Not configured'}`);
  console.log('='.repeat(60));

  // Verify API is reachable
  const healthRes = http.get(buildUrl('/health'), { timeout: '10s' });
  if (healthRes.status !== 200) {
    throw new Error(`API unreachable: ${healthRes.status}`);
  }

  // Check if profile exists (for profile-specific tests)
  let profileExists = false;
  if (config.profileId) {
    const profileRes = http.get(buildUrl(`/profiles/${config.profileId}`), defaultParams);
    profileExists = profileRes.status === 200;
    if (!profileExists) {
      console.log(`Warning: Profile ${config.profileId} not found. Profile tests will be skipped.`);
    }
  }

  return {
    startTime: new Date().toISOString(),
    profileExists,
    scenario: selectedScenario,
  };
}

// ============ MAIN TEST FUNCTION ============

export default function (data) {
  // Track active VUs
  activeVUs.add(__VU);

  // Weighted endpoint selection for realistic traffic patterns
  const weights = {
    health: 10,          // 10% - frequent health checks
    taxonomy: 30,        // 30% - taxonomy lookups (cached)
    profile: 40,         // 40% - profile operations
    narrative: 15,       // 15% - narrative generation (expensive)
    maskSelect: 5,       // 5% - mask selection
  };

  // Select endpoint based on weights
  const endpoint = selectWeightedEndpoint(weights);

  switch (endpoint) {
    case 'health':
      testHealthEndpoints();
      break;
    case 'taxonomy':
      testTaxonomyEndpoints();
      break;
    case 'profile':
      if (data.profileExists) {
        testProfileEndpoints();
      } else {
        testTaxonomyEndpoints(); // Fallback
      }
      break;
    case 'narrative':
      if (data.profileExists) {
        testNarrativeGeneration();
      } else {
        testTaxonomyEndpoints(); // Fallback
      }
      break;
    case 'maskSelect':
      if (data.profileExists) {
        testMaskSelection();
      } else {
        testTaxonomyEndpoints(); // Fallback
      }
      break;
  }

  // Think time between requests (simulates real user behavior)
  sleep(jitter(1, 50) / 1000); // 0.5-1.5 seconds
}

// ============ TEST GROUPS ============

function testHealthEndpoints() {
  group('Health Endpoints', function () {
    // Health check
    const healthStart = Date.now();
    const healthRes = http.get(buildUrl('/health'), {
      ...defaultParams,
      tags: { endpoint: 'health', name: 'GET /health' },
    });
    healthLatency.add(Date.now() - healthStart);
    requestsPerEndpoint.add(1, { endpoint: 'health' });

    const healthPassed = check(healthRes, {
      'health: status 200': (r) => r.status === 200,
      'health: body ok': (r) => {
        try {
          return JSON.parse(r.body).status === 'ok';
        } catch {
          return false;
        }
      },
    });
    trackError(healthPassed, healthRes);

    // Ready check
    const readyRes = http.get(buildUrl('/ready'), {
      ...defaultParams,
      tags: { endpoint: 'ready', name: 'GET /ready' },
    });
    requestsPerEndpoint.add(1, { endpoint: 'ready' });

    const readyPassed = check(readyRes, {
      'ready: status 200 or 503': (r) => r.status === 200 || r.status === 503,
    });
    trackError(readyPassed, readyRes);
  });
}

function testTaxonomyEndpoints() {
  group('Taxonomy Endpoints', function () {
    const endpoints = [
      { path: '/taxonomy/masks', name: 'masks' },
      { path: '/taxonomy/epochs', name: 'epochs' },
      { path: '/taxonomy/stages', name: 'stages' },
    ];

    // Random taxonomy endpoint
    const endpoint = randomItem(endpoints);
    const start = Date.now();

    const res = http.get(buildUrl(endpoint.path), {
      ...defaultParams,
      tags: { endpoint: 'taxonomy', name: `GET ${endpoint.path}` },
    });

    taxonomyLatency.add(Date.now() - start);
    requestsPerEndpoint.add(1, { endpoint: 'taxonomy', taxonomy_type: endpoint.name });

    const passed = check(res, {
      [`${endpoint.name}: status 200`]: (r) => r.status === 200,
      [`${endpoint.name}: is array`]: (r) => {
        try {
          const body = JSON.parse(r.body);
          return Array.isArray(body.data || body);
        } catch {
          return false;
        }
      },
      [`${endpoint.name}: latency < 300ms`]: (r) => r.timings.duration < 300,
    });
    trackError(passed, res);

    // Test pagination
    const paginatedRes = http.get(buildUrl(`${endpoint.path}?offset=0&limit=5`), {
      ...defaultParams,
      tags: { endpoint: 'taxonomy', name: `GET ${endpoint.path} (paginated)` },
    });
    requestsPerEndpoint.add(1, { endpoint: 'taxonomy', taxonomy_type: endpoint.name, paginated: 'true' });

    const paginatedPassed = check(paginatedRes, {
      [`${endpoint.name} paginated: status 200`]: (r) => r.status === 200,
    });
    trackError(paginatedPassed, paginatedRes);
  });
}

function testProfileEndpoints() {
  group('Profile Endpoints', function () {
    // Get profile
    const profileStart = Date.now();
    const profileRes = http.get(buildUrl(`/profiles/${config.profileId}`), {
      ...defaultParams,
      tags: { endpoint: 'profile', name: 'GET /profiles/:id' },
    });
    profileLatency.add(Date.now() - profileStart);
    requestsPerEndpoint.add(1, { endpoint: 'profile', operation: 'get' });

    const profilePassed = check(profileRes, {
      'profile: status 200': (r) => r.status === 200,
      'profile: has id': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.id || body.data?.id;
        } catch {
          return false;
        }
      },
      'profile: latency < 500ms': (r) => r.timings.duration < 500,
    });
    trackError(profilePassed, profileRes);

    // List profiles (if auth configured)
    if (config.authToken) {
      const listRes = http.get(buildUrl('/profiles?limit=10'), {
        ...defaultParams,
        tags: { endpoint: 'profile', name: 'GET /profiles (list)' },
      });
      requestsPerEndpoint.add(1, { endpoint: 'profile', operation: 'list' });

      const listPassed = check(listRes, {
        'profile list: status 200 or 401': (r) => r.status === 200 || r.status === 401,
      });
      trackError(listPassed, listRes);
    }
  });
}

function testNarrativeGeneration() {
  group('Narrative Generation', function () {
    // Select payload complexity based on current load
    const payloadKey = __VU > 100 ? 'minimal' : (__VU > 50 ? 'standard' : 'comprehensive');
    const payload = narrativePayloads[payloadKey];

    const start = Date.now();
    const res = http.post(
      buildUrl(`/profiles/${config.profileId}/narrative`),
      JSON.stringify(payload),
      {
        ...defaultParams,
        tags: { endpoint: 'narrative', name: 'POST /profiles/:id/narrative', payload_type: payloadKey },
      }
    );
    narrativeLatency.add(Date.now() - start);
    requestsPerEndpoint.add(1, { endpoint: 'narrative', payload_type: payloadKey });

    const passed = check(res, {
      'narrative: status 200': (r) => r.status === 200,
      'narrative: has blocks': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.blocks && Array.isArray(body.blocks);
        } catch {
          return false;
        }
      },
      'narrative: latency < 2000ms': (r) => r.timings.duration < 2000,
    });
    trackError(passed, res);
  });
}

function testMaskSelection() {
  group('Mask Selection', function () {
    // Random mask selection payload
    const payloadKeys = Object.keys(maskSelectionPayloads);
    const payloadKey = randomItem(payloadKeys);
    const payload = maskSelectionPayloads[payloadKey];

    const start = Date.now();
    const res = http.post(
      buildUrl(`/profiles/${config.profileId}/masks/select`),
      JSON.stringify(payload),
      {
        ...defaultParams,
        tags: { endpoint: 'maskSelect', name: 'POST /profiles/:id/masks/select', mask_type: payloadKey },
      }
    );
    maskSelectLatency.add(Date.now() - start);
    requestsPerEndpoint.add(1, { endpoint: 'maskSelect', mask_type: payloadKey });

    const passed = check(res, {
      'mask select: status 200': (r) => r.status === 200,
      'mask select: has selectedMasks': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.selectedMasks && Array.isArray(body.selectedMasks);
        } catch {
          return false;
        }
      },
      'mask select: latency < 500ms': (r) => r.timings.duration < 500,
    });
    trackError(passed, res);
  });
}

// ============ UTILITY FUNCTIONS ============

function selectWeightedEndpoint(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  for (const [endpoint, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      return endpoint;
    }
  }
  return 'health'; // Fallback
}

function trackError(passed, response) {
  if (!passed) {
    errorRate.add(1);
    httpErrors.add(1, {
      status: response.status.toString(),
      endpoint: response.request.tags?.endpoint || 'unknown',
    });
  } else {
    errorRate.add(0);
  }
}

// ============ TEARDOWN ============

export function teardown(data) {
  console.log('='.repeat(60));
  console.log(`Test completed: ${data.scenario}`);
  console.log(`Started: ${data.startTime}`);
  console.log(`Ended: ${new Date().toISOString()}`);
  console.log(`Profile tested: ${data.profileExists}`);
  console.log('='.repeat(60));
}
