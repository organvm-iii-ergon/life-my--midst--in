# WORKSTREAM J: Webhooks & Documentation Implementation Plan

## Current Status Assessment

After reviewing the codebase, here's what already exists and what needs to be created:

### Already Implemented (No Changes Needed)
1. **`server/routes/webhooks.ts`** - Fully implemented with:
   - Twilio SMS status webhook (`POST /api/webhooks/twilio/sms/status`)
   - Twilio SMS inbound webhook (`POST /api/webhooks/twilio/sms/inbound`)
   - Twilio Voice status webhook (`POST /api/webhooks/twilio/voice/status`)
   - SendGrid events webhook (`POST /api/webhooks/sendgrid/events`)
   - Plaid transactions webhook (`POST /api/webhooks/plaid/transactions`)
   - Plaid item webhook (`POST /api/webhooks/plaid/item`)

2. **`server/middleware/webhookAuth.ts`** - Fully implemented with:
   - `verifyTwilioSignature` - HMAC-SHA1 signature verification
   - `verifySendGridSignature` - ECDSA signature verification
   - `verifyPlaidSignature` - JWT verification with body hash
   - `captureRawBody` middleware for signature verification
   - `timingSafeEqual` helper for timing attack prevention

### Needs to be Created
1. **`server/openapi.yaml`** - OpenAPI 3.0 specification documenting all API endpoints
2. **`server/integrations/aws/s3.ts`** - S3 client stub for document storage

### Needs to be Updated
1. **`server/index.ts`** - Register webhooks router and add Swagger UI at `/api/docs`

---

## Implementation Plan

### Task 1: Create OpenAPI Specification (`server/openapi.yaml`)

Create a comprehensive OpenAPI 3.0 spec covering all endpoints:

**API Endpoints to Document:**
- Health (`/api/health/*`)
- Prospects (`/api/prospects/*`)
- Competitors (`/api/competitors/*`)
- Portfolio (`/api/portfolio/*`)
- Enrichment (`/api/enrichment/*`)
- Jobs (`/api/jobs/*`)
- Contacts (`/api/contacts/*`)
- Deals (`/api/deals/*`)
- Webhooks (`/api/webhooks/*`)

**Components to Define:**
- Schemas for all request/response bodies
- Security schemes (API key auth)
- Common error responses
- Pagination schema
- Tags for grouping endpoints

### Task 2: Create S3 Integration Stub (`server/integrations/aws/s3.ts`)

Following the pattern from existing integrations (Twilio, SendGrid, Plaid):

```typescript
// Structure:
server/integrations/aws/
  ├── index.ts       # Re-exports
  └── s3.ts          # S3Client class
```

**S3Client Features:**
- Configuration from environment variables
- Upload file method
- Download file method
- Delete file method
- Generate presigned URL method
- Stub mode for development

### Task 3: Update `server/index.ts`

**Changes Required:**
1. Import webhooks router
2. Import swagger-ui-express (add to dependencies)
3. Register webhooks router at `/api/webhooks`
4. Set up Swagger UI at `/api/docs`
5. Add raw body capture middleware for webhook routes

---

## Detailed Implementation

### Task 1: OpenAPI Specification

The OpenAPI spec will be approximately 1500-2000 lines covering:
- Info section with API title, description, version
- Server URLs (dev/prod)
- Security definitions
- 40+ endpoint definitions
- 50+ schema definitions
- Tag descriptions

### Task 2: S3 Client Stub

```typescript
export interface S3Config {
  region: string
  bucket: string
  accessKeyId?: string
  secretAccessKey?: string
}

export interface UploadResult {
  key: string
  bucket: string
  url: string
  etag?: string
}

export class S3Client {
  // Upload file to S3
  async upload(key: string, body: Buffer | string, options?: UploadOptions): Promise<UploadResult>

  // Download file from S3
  async download(key: string): Promise<Buffer>

  // Delete file from S3
  async delete(key: string): Promise<boolean>

  // Generate presigned URL for direct access
  async getPresignedUrl(key: string, expiresIn?: number): Promise<string>

  // Check if file exists
  async exists(key: string): Promise<boolean>
}
```

### Task 3: Server Index Updates

```typescript
// New imports
import webhooksRouter from './routes/webhooks'
import { captureRawBody } from './middleware/webhookAuth'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

// In setupMiddleware():
// Add raw body capture for webhook routes before JSON parser
this.app.use('/api/webhooks', captureRawBody)

// In setupRoutes():
// Load OpenAPI spec
const swaggerDocument = YAML.load('./server/openapi.yaml')

// Swagger UI (no auth required)
this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Webhook routes (no auth, uses signature verification)
this.app.use('/api/webhooks', webhooksRouter)
```

---

## Dependencies to Add

```json
{
  "swagger-ui-express": "^5.0.0",
  "yamljs": "^0.3.0",
  "@types/swagger-ui-express": "^4.1.6",
  "@types/yamljs": "^0.2.34"
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `server/openapi.yaml` | CREATE | OpenAPI 3.0 specification |
| `server/integrations/aws/s3.ts` | CREATE | S3 client stub |
| `server/integrations/aws/index.ts` | CREATE | AWS module exports |
| `server/integrations/index.ts` | UPDATE | Add AWS exports |
| `server/index.ts` | UPDATE | Register webhooks, serve Swagger UI |
| `package.json` | UPDATE | Add swagger-ui-express, yamljs dependencies |

---

## Execution Order

1. Add npm dependencies (swagger-ui-express, yamljs)
2. Create `server/integrations/aws/s3.ts`
3. Create `server/integrations/aws/index.ts`
4. Update `server/integrations/index.ts`
5. Create `server/openapi.yaml`
6. Update `server/index.ts`
7. Test by running the server and visiting `/api/docs`
