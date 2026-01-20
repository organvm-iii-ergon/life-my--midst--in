/**
 * k6 Smoke Test Scenario
 *
 * Quick health check for CI/CD pipelines.
 * Validates that critical endpoints are responsive.
 *
 * Duration: ~30 seconds
 * VUs: 1
 * Purpose: Sanity check before deployment
 *
 * Usage:
 *   k6 run infra/k6/scenarios/smoke.js
 *   K6_BASE_URL=https://api.example.com k6 run infra/k6/scenarios/smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { config, defaultParams, buildUrl, scenarios } from '../config.js';

// Custom metrics
const errorRate = new Rate('errors');
const healthCheckDuration = new Trend('health_check_duration', true);
const taxonomyDuration = new Trend('taxonomy_duration', true);

// Test configuration
export const options = {
  scenarios: {
    smoke: scenarios.smoke,
  },
  thresholds: {
    // Strict thresholds for smoke tests
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.01'],
    'health_check_duration': ['p(95)<100'],
    'taxonomy_duration': ['p(95)<300'],
  },
  // Don't fail on thresholds in smoke (just report)
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

// Test setup - verify API is reachable
export function setup() {
  const healthRes = http.get(buildUrl('/health'), defaultParams);

  if (healthRes.status !== 200) {
    throw new Error(`API health check failed: ${healthRes.status} - ${healthRes.body}`);
  }

  console.log(`Smoke test starting against: ${config.baseUrl}`);
  console.log(`API Version: ${config.apiVersion}`);

  return {
    startTime: new Date().toISOString(),
  };
}

// Main test function
export default function (data) {
  // Test 1: Health endpoint
  testHealthEndpoint();

  // Test 2: Ready endpoint
  testReadyEndpoint();

  // Test 3: Taxonomy - Masks
  testTaxonomyMasks();

  // Test 4: Taxonomy - Epochs
  testTaxonomyEpochs();

  // Test 5: Taxonomy - Stages
  testTaxonomyStages();

  // Small pause between iterations
  sleep(1);
}

function testHealthEndpoint() {
  const start = Date.now();
  const res = http.get(buildUrl('/health'), {
    ...defaultParams,
    tags: { endpoint: 'health' },
  });
  healthCheckDuration.add(Date.now() - start);

  const passed = check(res, {
    'health: status is 200': (r) => r.status === 200,
    'health: body contains ok': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.status === 'ok';
      } catch {
        return false;
      }
    },
    'health: response time < 100ms': (r) => r.timings.duration < 100,
  });

  errorRate.add(!passed);
}

function testReadyEndpoint() {
  const res = http.get(buildUrl('/ready'), {
    ...defaultParams,
    tags: { endpoint: 'ready' },
  });

  const passed = check(res, {
    'ready: status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'ready: has status field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return 'status' in body;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
}

function testTaxonomyMasks() {
  const start = Date.now();
  const res = http.get(buildUrl('/taxonomy/masks'), {
    ...defaultParams,
    tags: { endpoint: 'taxonomy' },
  });
  taxonomyDuration.add(Date.now() - start);

  const passed = check(res, {
    'masks: status is 200': (r) => r.status === 200,
    'masks: returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch {
        return false;
      }
    },
    'masks: has at least one mask': (r) => {
      try {
        const body = JSON.parse(r.body);
        const masks = body.data || body;
        return masks.length > 0;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
}

function testTaxonomyEpochs() {
  const start = Date.now();
  const res = http.get(buildUrl('/taxonomy/epochs'), {
    ...defaultParams,
    tags: { endpoint: 'taxonomy' },
  });
  taxonomyDuration.add(Date.now() - start);

  const passed = check(res, {
    'epochs: status is 200': (r) => r.status === 200,
    'epochs: returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
}

function testTaxonomyStages() {
  const start = Date.now();
  const res = http.get(buildUrl('/taxonomy/stages'), {
    ...defaultParams,
    tags: { endpoint: 'taxonomy' },
  });
  taxonomyDuration.add(Date.now() - start);

  const passed = check(res, {
    'stages: status is 200': (r) => r.status === 200,
    'stages: returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
}

// Teardown - log results summary
export function teardown(data) {
  console.log(`Smoke test completed`);
  console.log(`Started: ${data.startTime}`);
  console.log(`Ended: ${new Date().toISOString()}`);
}
