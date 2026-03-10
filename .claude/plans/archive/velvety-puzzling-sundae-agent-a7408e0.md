# WORKSTREAM H: Backend Tests Plan

## Overview
Create comprehensive tests for 14 services and 2 routes using Vitest, following existing patterns in the codebase.

## Test Patterns Identified

### Service Test Pattern
From `EnrichmentService.test.ts` and `CompetitorsService.test.ts`:
- Mock database with `vi.mock('../../database/connection', () => ({ database: { query: vi.fn() } }))`
- Import mocked database after mock declaration
- Use `beforeEach` to reset mocks and create service instance
- Group tests with `describe` blocks for each method
- Test success cases, error handling, and edge cases

### Route Test Pattern
From `prospects.test.ts` and `competitors.test.ts`:
- Use `vi.hoisted()` for mock functions
- Mock the entire service class
- Use `createTestApp()` helper or create Express app directly
- Use `supertest` for HTTP testing
- Test validation, success responses, error responses, and edge cases

## Files to Create

### Service Tests (14 files)
Location: `/Users/4jp/Workspace/public-record-data-scrapper/server/__tests__/services/`

| File | Service | Key Methods to Test |
|------|---------|---------------------|
| `AuditService.test.ts` | AuditService | getEntityHistory, searchAuditLogs, getAuditSummary, exportForCompliance, getUserActivity, getByRequestId, getHighVolumeAlerts |
| `CommunicationsService.test.ts` | CommunicationsService | getTemplate, renderTemplate, listTemplates, send, sendEmail, sendSMS, initiateCall, updateCommunicationStatus, getHistory, getById, scheduleFollowUp, getPendingFollowUps, cancelFollowUp, handleSendGridWebhook, handleTwilioSMSWebhook, handleTwilioCallWebhook |
| `ContactsService.test.ts` | ContactsService | list, getById, getByIdOrThrow, create, update, delete, logActivity, getActivityTimeline, linkToProspect, unlinkFromProspect, getContactsForProspect, getPrimaryContact, findByEmail, findByPhone, addTags, removeTags |
| `DealsService.test.ts` | DealsService | getStages, getDefaultStage, list, getPipelineView, getById, getByIdOrThrow, create, update, moveToStage, uploadDocument, getDocuments, verifyDocument, deleteDocument, getDocumentChecklist, getStats |
| `DisclosureService.test.ts` | DisclosureService | getRequirements, getAllRequirements, requiresDisclosure, generate, getById, getByIdOrThrow, getByDealId, getCurrentDisclosure, markAsSent, markAsViewed, recordSignature, setDocumentUrl, setSignatureUrl, list, hasSigned, getPendingForFollowUp |
| `DisclosureCalculator.test.ts` | DisclosureCalculator | calculateDisclosure, calculateFromDeal, getStateRequirements, formatForDisplay (pure functions - no DB mocking needed) |
| `NarrativeService.test.ts` | NarrativeService | generateNarrative (main), generateSummary, generateTalkingPoints, detectWhaleOpportunity, analyzeRisks, analyzeGrowth, generateStackInsight, determineApproach, generateCallOpeners, generateObjectionHandlers |
| `QualificationService.test.ts` | QualificationService | qualify, qualifyWithBankAccess, getTierRequirements, updateRules (pure logic + mocked underwriting service) |
| `ScoringService.test.ts` | ScoringService | calculateIntentScore, calculateHealthScore, calculatePositionScore, calculateCompositeScore, getGrade, calculateConfidence, generateNarrative, scoreProspect, scoreProspects |
| `StackAnalysisService.test.ts` | StackAnalysisService | analyzeStack, getKnownFunders, addKnownFunder, analyzeStackBatch |
| `SuppressionService.test.ts` | SuppressionService | isOnDNCList, isEmailSuppressed, batchCheck, addToSuppressionList, removeFromSuppressionList, list, syncFTCList, bulkImport, getStats, cleanupExpired |
| `UnderwritingService.test.ts` | UnderwritingService | extractFeatures, analyzeTransactions, detectLenderPayments, analyzeRevenueTrend, calculateDepositConsistency |
| `ConsentService.test.ts` | ConsentService | recordConsent, hasConsent, hasConsentOfType, revokeConsent, revokeAllConsent, getForContact, getConsentSummary, batchCheck, getContactsWithConsent, getStats, getById, updateEvidence |
| `ComplianceReportService.test.ts` | ComplianceReportService | generateOutreachReport, generateDNCReport, generateDisclosureReport, detectViolations, generateFullReport, exportToCsv, getComplianceScore |

### Route Tests (2 files)
Location: `/Users/4jp/Workspace/public-record-data-scrapper/server/__tests__/routes/`

| File | Route | Endpoints to Test |
|------|-------|-------------------|
| `contacts.test.ts` | /api/contacts | GET /, POST /, GET /:id, PUT /:id, POST /:id/link/:prospectId, DELETE /:id/link/:prospectId, POST /:id/activities, GET /:id/activities, GET /by-prospect/:prospectId |
| `deals.test.ts` | /api/deals | GET /, GET /pipeline, GET /stages, GET /stats, POST /, GET /:id, PUT /:id, PATCH /:id/stage, POST /:id/documents, GET /:id/documents, GET /:id/documents/checklist, PATCH /:id/documents/:documentId/verify, DELETE /:id/documents/:documentId |

## Implementation Order

### Phase 1: Pure Logic Services (No DB mocking)
1. `DisclosureCalculator.test.ts` - Pure calculation functions
2. `ScoringService.test.ts` - Pure scoring calculations (partial DB for full tests)

### Phase 2: Core Services
3. `ContactsService.test.ts`
4. `DealsService.test.ts`
5. `AuditService.test.ts`
6. `SuppressionService.test.ts`
7. `ConsentService.test.ts`

### Phase 3: Communication & Compliance Services
8. `CommunicationsService.test.ts` - Mock Twilio/SendGrid clients
9. `DisclosureService.test.ts` - Uses DealsService
10. `ComplianceReportService.test.ts` - Uses multiple services

### Phase 4: Intelligence Services
11. `NarrativeService.test.ts` - Complex narrative generation
12. `QualificationService.test.ts` - Uses UnderwritingService
13. `UnderwritingService.test.ts` - Mock Plaid transactions
14. `StackAnalysisService.test.ts`

### Phase 5: Route Tests
15. `contacts.test.ts`
16. `deals.test.ts`

## Test Structure Template

### Service Test Template
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ServiceName } from '../../services/ServiceName'

// Mock database
vi.mock('../../database/connection', () => ({
  database: {
    query: vi.fn()
  }
}))

import { database } from '../../database/connection'

const mockQuery = vi.mocked(database.query)

describe('ServiceName', () => {
  let service: ServiceName

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ServiceName()
  })

  describe('methodName', () => {
    it('should handle success case', async () => {
      mockQuery.mockResolvedValueOnce([/* expected data */])
      const result = await service.methodName(/* params */)
      expect(result).toBeDefined()
      // assertions
    })

    it('should handle error case', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'))
      await expect(service.methodName(/* params */)).rejects.toThrow()
    })
  })
})
```

### Route Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express, { Express } from 'express'
import request from 'supertest'
import { errorHandler } from '../../middleware/errorHandler'

const mockServiceInstance = {
  list: vi.fn(),
  getById: vi.fn(),
  // ... other methods
}

vi.mock('../../services/ServiceName', () => ({
  ServiceName: class MockServiceName {
    list = mockServiceInstance.list
    getById = mockServiceInstance.getById
    // ... other methods
  }
}))

import router from '../../routes/routeName'

describe('RouteName Routes', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/routename', router)
    app.use(errorHandler)
    vi.clearAllMocks()
  })

  describe('GET /api/routename', () => {
    it('returns paginated list', async () => {
      mockServiceInstance.list.mockResolvedValueOnce({
        items: [],
        page: 1,
        limit: 20,
        total: 0
      })

      const response = await request(app)
        .get('/api/routename?org_id=...')

      expect(response.status).toBe(200)
    })
  })
})
```

## Test Coverage Goals
- Minimum 80% line coverage per service
- All public methods tested
- Success, error, and edge cases covered
- Database query validation (verify correct SQL patterns)
- Input validation tests for routes

## Dependencies
- vitest
- supertest (for route tests)
- @types/supertest

## Notes
- Mock external services (Twilio, SendGrid, Plaid) where needed
- Use vi.mocked() for type-safe mock access
- Follow existing test naming conventions
- Keep tests isolated - no shared state between tests
