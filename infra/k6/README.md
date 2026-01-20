# k6 Load Testing

Performance and load testing infrastructure for the in-midst-my-life API using [k6](https://k6.io/).

## Prerequisites

### Install k6

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Windows (Chocolatey):**
```bash
choco install k6
```

**Docker:**
```bash
docker pull grafana/k6
```

### Verify Installation
```bash
k6 version
# k6 v0.50.0 (or similar)
```

## Directory Structure

```
k6/
├── config.js              # Shared configuration and utilities
├── scenarios/
│   ├── smoke.js           # Quick health check (CI/CD)
│   └── baseline.js        # Comprehensive load testing
└── README.md              # This file
```

## Quick Start

### 1. Start the API Server
```bash
# From repository root
pnpm dev
# Or just the API
pnpm --filter @in-midst-my-life/api dev
```

### 2. Run Smoke Test
```bash
k6 run infra/k6/scenarios/smoke.js
```

### 3. Run Baseline Test
```bash
k6 run infra/k6/scenarios/baseline.js
```

## Available Scenarios

### Smoke Test (`smoke.js`)
Quick health check for CI/CD pipelines. Validates critical endpoints are responsive.

```bash
# Default run (1 VU, 30s)
k6 run infra/k6/scenarios/smoke.js

# Custom base URL
K6_BASE_URL=https://api.staging.example.com k6 run infra/k6/scenarios/smoke.js
```

**Endpoints tested:**
- `GET /health` - Health check
- `GET /ready` - Readiness probe
- `GET /v1/taxonomy/masks` - Taxonomy masks
- `GET /v1/taxonomy/epochs` - Taxonomy epochs
- `GET /v1/taxonomy/stages` - Taxonomy stages

**Expected results:**
- Duration: ~30 seconds
- All checks should pass
- P95 latency < 300ms for cached endpoints
- P95 latency < 100ms for health endpoints

### Baseline Test (`baseline.js`)
Comprehensive load testing with multiple scenario presets.

```bash
# Run default baseline (10 VUs, 1m)
k6 run infra/k6/scenarios/baseline.js

# Run specific scenario
k6 run --env SCENARIO=smoke infra/k6/scenarios/baseline.js
k6 run --env SCENARIO=load infra/k6/scenarios/baseline.js
k6 run --env SCENARIO=stress infra/k6/scenarios/baseline.js
k6 run --env SCENARIO=spike infra/k6/scenarios/baseline.js
k6 run --env SCENARIO=soak infra/k6/scenarios/baseline.js
```

**Scenario presets:**

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| `smoke` | 1 | 30s | Quick validation |
| `baseline` | 10 | 1m | Normal expected load |
| `load` | 50 | 5m | Sustained moderate traffic |
| `stress` | 0→200 | 7m | Find breaking point (ramping) |
| `spike` | 10→200→10 | 3m | Sudden traffic burst |
| `soak` | 30 | 30m | Memory leak detection |

**Endpoints tested (with profile):**
- All smoke test endpoints
- `GET /v1/profiles/:id` - Profile retrieval
- `POST /v1/profiles/:id/narrative` - Narrative generation
- `POST /v1/profiles/:id/masks/select` - Mask selection

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `K6_BASE_URL` | `http://localhost:3001` | API base URL |
| `K6_API_VERSION` | `v1` | API version prefix |
| `K6_PROFILE_ID` | `00000000-0000-0000-0000-000000000001` | Test profile ID |
| `K6_AUTH_TOKEN` | (empty) | JWT auth token |
| `K6_TIMEOUT` | `30000` | Request timeout (ms) |
| `K6_VERBOSE` | `false` | Enable verbose logging |
| `SCENARIO` | `baseline` | Scenario preset (baseline.js) |

### Example Usage

```bash
# Local development
k6 run infra/k6/scenarios/smoke.js

# Staging environment with auth
K6_BASE_URL=https://api.staging.example.com \
K6_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIs... \
k6 run infra/k6/scenarios/baseline.js

# Stress test with custom profile
K6_PROFILE_ID=abc-123-def-456 \
SCENARIO=stress \
k6 run infra/k6/scenarios/baseline.js

# Docker execution
docker run --rm -i \
  -e K6_BASE_URL=http://host.docker.internal:3001 \
  -v $(pwd)/infra/k6:/scripts \
  grafana/k6 run /scripts/scenarios/smoke.js
```

## Performance Thresholds

### Standard Thresholds (smoke, baseline, load)

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_duration p(50)` | < 200ms | Median latency |
| `http_req_duration p(95)` | < 500ms | 95th percentile latency |
| `http_req_duration p(99)` | < 1000ms | 99th percentile latency |
| `http_req_failed` | < 1% | Error rate |
| `health_latency p(95)` | < 100ms | Health endpoint latency |
| `taxonomy_latency p(95)` | < 300ms | Taxonomy endpoint latency |
| `profile_latency p(95)` | < 500ms | Profile endpoint latency |
| `narrative_latency p(95)` | < 2000ms | Narrative generation latency |

### Stress Thresholds (stress, spike)

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_duration p(50)` | < 500ms | Median latency (relaxed) |
| `http_req_duration p(95)` | < 2000ms | 95th percentile (relaxed) |
| `http_req_duration p(99)` | < 5000ms | 99th percentile (relaxed) |
| `http_req_failed` | < 5% | Error rate (relaxed) |

## Expected Baseline Results

These are reference results from a local development environment. Your results may vary based on hardware and configuration.

### Smoke Test (Local)
```
scenarios: (100.00%) 1 scenario, 1 max VUs, 1m0s max duration

     ✓ health: status is 200
     ✓ health: body contains ok
     ✓ health: response time < 100ms
     ✓ ready: status is 200 or 503
     ✓ masks: status is 200
     ✓ masks: returns array
     ✓ epochs: status is 200
     ✓ stages: status is 200

     checks.........................: 100.00%
     http_req_duration...............: avg=12ms min=3ms med=8ms max=45ms p(95)=32ms
     http_req_failed.................: 0.00%
```

### Baseline Test (Local, 10 VUs)
```
scenarios: (100.00%) 1 scenario, 10 max VUs, 1m30s max duration

     ✓ http_req_duration p(95) < 500ms
     ✓ http_req_failed < 1%
     ✓ health_latency p(95) < 100ms
     ✓ taxonomy_latency p(95) < 300ms

     http_reqs......................: 1200 20/s
     http_req_duration...............: avg=45ms min=2ms med=35ms max=350ms p(95)=120ms
     http_req_failed.................: 0.10%
```

### Load Test (Local, 50 VUs)
```
scenarios: (100.00%) 1 scenario, 50 max VUs, 5m30s max duration

     ✓ http_req_duration p(95) < 500ms
     ✓ http_req_failed < 1%

     http_reqs......................: 15000 50/s
     http_req_duration...............: avg=85ms min=3ms med=60ms max=800ms p(95)=280ms
     http_req_failed.................: 0.50%
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Weekly Monday 6am

jobs:
  load-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm build

      - name: Run migrations and seed
        env:
          POSTGRES_URL: postgresql://postgres:postgres@localhost:5432/midst_test
          REDIS_URL: redis://localhost:6379
        run: |
          pnpm --filter @in-midst-my-life/api migrate
          pnpm --filter @in-midst-my-life/api seed

      - name: Start API server
        env:
          POSTGRES_URL: postgresql://postgres:postgres@localhost:5432/midst_test
          REDIS_URL: redis://localhost:6379
        run: |
          pnpm --filter @in-midst-my-life/api start &
          sleep 10  # Wait for server

      - name: Install k6
        run: |
          sudo gpg -k
          sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update
          sudo apt-get install k6

      - name: Run smoke test
        run: k6 run infra/k6/scenarios/smoke.js

      - name: Run baseline test
        run: k6 run infra/k6/scenarios/baseline.js

      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: k6-results
          path: |
            *.json
            *.html
```

### Output Formats

```bash
# JSON output for programmatic processing
k6 run --out json=results.json infra/k6/scenarios/baseline.js

# CSV output for spreadsheet analysis
k6 run --out csv=results.csv infra/k6/scenarios/baseline.js

# Cloud output (Grafana Cloud k6)
K6_CLOUD_TOKEN=your-token k6 cloud infra/k6/scenarios/baseline.js

# InfluxDB output (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 infra/k6/scenarios/baseline.js

# Prometheus Remote Write
k6 run --out experimental-prometheus-rw infra/k6/scenarios/baseline.js
```

## Grafana Integration

Import the dashboard at `infra/grafana/dashboards/api-metrics.json` to visualize:

- Request rate (RPS) by endpoint
- Latency percentiles (P50, P95, P99)
- Error rate by endpoint and status code
- Database connection pool usage
- Redis cache hit rate
- Memory usage and event loop lag

### Real-time Monitoring During Tests

1. Start Prometheus and Grafana:
   ```bash
   docker-compose up prometheus grafana
   ```

2. Run k6 with Prometheus output:
   ```bash
   k6 run --out experimental-prometheus-rw infra/k6/scenarios/baseline.js
   ```

3. Open Grafana at `http://localhost:3000` and import the dashboard.

## Troubleshooting

### API Not Reachable
```bash
# Check if API is running
curl http://localhost:3001/health

# Check Docker network (if using containers)
docker network ls
docker inspect <container_id>
```

### Profile Not Found
```bash
# Seed the database first
pnpm --filter @in-midst-my-life/api seed

# Or specify a different profile ID
K6_PROFILE_ID=your-profile-id k6 run infra/k6/scenarios/baseline.js
```

### Authentication Errors
```bash
# Get a valid JWT token
# Then run with auth
K6_AUTH_TOKEN=eyJhbG... k6 run infra/k6/scenarios/baseline.js
```

### Timeout Issues
```bash
# Increase timeout for slow endpoints
K6_TIMEOUT=60000 k6 run infra/k6/scenarios/baseline.js
```

## Writing Custom Tests

Create new test files in `scenarios/`:

```javascript
// scenarios/custom.js
import http from 'k6/http';
import { check } from 'k6';
import { config, defaultParams, buildUrl } from '../config.js';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(buildUrl('/your-endpoint'), defaultParams);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
```

Run with:
```bash
k6 run infra/k6/scenarios/custom.js
```

## Resources

- [k6 Documentation](https://k6.io/docs/)
- [k6 Best Practices](https://k6.io/docs/testing-guides/api-load-testing/)
- [Grafana k6](https://grafana.com/docs/k6/latest/)
- [k6 Extensions](https://k6.io/docs/extensions/)
