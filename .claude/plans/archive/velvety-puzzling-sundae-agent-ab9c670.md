# Workstream J Implementation Plan

## Overview
Implement remaining Workstream J items for the UCC-MCA Intelligence Platform:
1. OpenAPI 3.0 specification (`server/openapi.yaml`)
2. AWS S3 client stub (`server/integrations/aws/s3.ts`)
3. AWS module exports (`server/integrations/aws/index.ts`)
4. Update server index with webhooks router and Swagger UI
5. Update integrations index to export AWS module

---

## 1. Create `server/openapi.yaml` - OpenAPI 3.0 Specification

### API Routes to Document

Based on analysis of the routes, here are all endpoints to document:

#### Health Routes (`/api/health`)
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with service status
- `GET /api/health/ready` - Kubernetes readiness probe
- `GET /api/health/live` - Kubernetes liveness probe

#### Prospects Routes (`/api/prospects`) - Auth Required
- `GET /api/prospects` - List prospects (paginated, filtered, sorted)
- `GET /api/prospects/:id` - Get prospect details
- `POST /api/prospects` - Create prospect
- `PATCH /api/prospects/:id` - Update prospect
- `DELETE /api/prospects/:id` - Delete prospect

#### Competitors Routes (`/api/competitors`) - Auth Required
- `GET /api/competitors` - List competitors
- `GET /api/competitors/:id` - Get competitor details
- `GET /api/competitors/:id/analysis` - Get SWOT analysis
- `GET /api/competitors/stats/summary` - Get statistics

#### Portfolio Routes (`/api/portfolio`) - Auth Required
- `GET /api/portfolio` - List portfolio companies
- `GET /api/portfolio/:id` - Get company details
- `GET /api/portfolio/:id/health-history` - Get health score history
- `GET /api/portfolio/stats/summary` - Get statistics

#### Enrichment Routes (`/api/enrichment`) - Auth Required
- `POST /api/enrichment/prospect` - Enrich single prospect
- `POST /api/enrichment/batch` - Batch enrich prospects
- `POST /api/enrichment/refresh` - Trigger data refresh
- `GET /api/enrichment/status` - Get pipeline status
- `GET /api/enrichment/queue` - Get queue status

#### Jobs Routes (`/api/jobs`) - Auth Required
- `POST /api/jobs/ingestion` - Trigger UCC ingestion job
- `POST /api/jobs/enrichment` - Trigger enrichment job
- `POST /api/jobs/health-scores` - Trigger health score calculation
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/jobs/queues/stats` - Get queue statistics
- `GET /api/jobs/queues/:queueName` - Get jobs in queue
- `DELETE /api/jobs/:jobId` - Remove a job

#### Contacts Routes (`/api/contacts`) - Auth Required
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact with timeline
- `PUT /api/contacts/:id` - Update contact
- `POST /api/contacts/:id/link/:prospectId` - Link to prospect
- `DELETE /api/contacts/:id/link/:prospectId` - Unlink from prospect
- `POST /api/contacts/:id/activities` - Log activity
- `GET /api/contacts/:id/activities` - Get activity timeline
- `GET /api/contacts/by-prospect/:prospectId` - Get contacts for prospect

#### Deals Routes (`/api/deals`) - Auth Required
- `GET /api/deals` - List deals
- `GET /api/deals/pipeline` - Pipeline view
- `GET /api/deals/stages` - Get stages
- `GET /api/deals/stats` - Get statistics
- `POST /api/deals` - Create deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `PATCH /api/deals/:id/stage` - Move to stage
- `POST /api/deals/:id/documents` - Upload document
- `GET /api/deals/:id/documents` - Get documents
- `GET /api/deals/:id/documents/checklist` - Get checklist
- `PATCH /api/deals/:id/documents/:documentId/verify` - Verify document
- `DELETE /api/deals/:id/documents/:documentId` - Delete document

#### Webhooks Routes (`/api/webhooks`) - Signature Verification
- `POST /api/webhooks/twilio/sms/status` - SMS delivery status
- `POST /api/webhooks/twilio/sms/inbound` - Inbound SMS
- `POST /api/webhooks/twilio/voice/status` - Voice call status
- `POST /api/webhooks/sendgrid/events` - Email events
- `POST /api/webhooks/plaid/transactions` - Transaction updates
- `POST /api/webhooks/plaid/item` - Item status changes

### Security Schemes
- `bearerAuth` - JWT Bearer token for protected routes
- `webhookSignature` - Signature verification for webhooks

### Common Schemas to Define
- Error response schema
- Pagination schema
- UUID type
- Industry enum
- State code (2 characters)
- Contact role enum
- Activity type enum
- Deal priority enum
- Document type enum

---

## 2. Create `server/integrations/aws/s3.ts` - S3 Client Stub

### Pattern to Follow
Based on `twilio/client.ts` and `sendgrid/client.ts`:
- Create `S3Config` interface with AWS credentials
- Create `S3Response<T>` interface
- Create `S3Client` class with:
  - Constructor accepting optional config
  - `initialize()` method
  - `isConfigured()` check
  - Stub mode when credentials missing

### Methods to Implement
```typescript
// Upload document for a prospect
uploadDocument(prospectId: string, buffer: Buffer, mimetype: string): Promise<string>
// Returns: S3 key/URL

// Generate presigned URL for downloads
getPresignedUrl(key: string): Promise<string>
// Returns: Presigned URL string

// Delete a document
deleteDocument(key: string): Promise<void>
```

### Environment Variables
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (default: 'us-east-1')
- `S3_BUCKET_NAME`

### Stub Behavior
- Generate fake S3 keys like `s3://bucket/prospects/{prospectId}/{uuid}.{ext}`
- Generate fake presigned URLs
- Log operations in stub mode

---

## 3. Create `server/integrations/aws/index.ts` - Module Exports

Follow the pattern from `twilio/index.ts`:
```typescript
export { S3Client, s3Client } from './s3'
export type { S3Config, S3Response, UploadResult } from './s3'
```

---

## 4. Update `server/index.ts` - Add Webhooks Router and Swagger UI

### Changes Required

1. **Add imports:**
   ```typescript
   import webhooksRouter from './routes/webhooks'
   import swaggerUi from 'swagger-ui-express'
   import YAML from 'yamljs'
   ```

2. **Add raw body middleware for webhooks** (needed for signature verification):
   - Configure `express.raw()` for `/api/webhooks` routes BEFORE json parsing
   - Or use a custom middleware to preserve raw body

3. **Register webhooks router:**
   ```typescript
   this.app.use('/api/webhooks', webhooksRouter)
   ```

4. **Serve Swagger UI:**
   ```typescript
   const openApiSpec = YAML.load('./server/openapi.yaml')
   this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
   ```

5. **Update root endpoint** to include webhooks in endpoints list

### Package Dependencies Needed
- `swagger-ui-express` - Serve Swagger UI
- `yamljs` - Parse YAML files
- `@types/swagger-ui-express` (devDependency)
- `@types/yamljs` (devDependency)

---

## 5. Update `server/integrations/index.ts` - Export AWS Module

Add export for AWS module:
```typescript
// AWS (S3)
export * from './aws'
```

---

## Implementation Order

1. **First**: Create `server/integrations/aws/s3.ts` (self-contained)
2. **Second**: Create `server/integrations/aws/index.ts` (depends on s3.ts)
3. **Third**: Update `server/integrations/index.ts` (depends on aws/index.ts)
4. **Fourth**: Create `server/openapi.yaml` (self-contained, large file)
5. **Fifth**: Update `server/index.ts` (depends on openapi.yaml existing, needs npm install for deps)

---

## File Locations Summary

| File | Action |
|------|--------|
| `server/integrations/aws/s3.ts` | CREATE |
| `server/integrations/aws/index.ts` | CREATE |
| `server/integrations/index.ts` | UPDATE |
| `server/openapi.yaml` | CREATE |
| `server/index.ts` | UPDATE |

---

## Notes

- The webhooks router already exists at `server/routes/webhooks.ts` but is not registered in the main server
- Need to handle raw body preservation for webhook signature verification
- swagger-ui-express will need to be added to dependencies
- The OpenAPI spec will be comprehensive (~1500+ lines) to document all routes
