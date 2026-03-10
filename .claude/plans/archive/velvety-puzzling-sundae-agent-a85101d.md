# MCA Platform Phase 2 Backend Tests Implementation Plan

## Overview
Create 16 backend test files for MCA Platform Phase 2 services and routes. Tests will use vitest with mocked database connections, following existing patterns in the codebase.

## Existing Tests (Already Implemented)
Based on my analysis, the following tests already exist:
- `server/__tests__/services/AuditService.test.ts` - Already complete
- `server/__tests__/services/ContactsService.test.ts` - Already complete

## Tests to Create

### Service Tests (12 files) - in `server/__tests__/services/`

#### 1. CommunicationsService.test.ts
- Test `getTemplate` - get template by ID
- Test `renderTemplate` - variable substitution
- Test `listTemplates` - list templates with channel filter
- Test `send` - unified send method
- Test `sendEmail` - email sending with validation
- Test `sendSMS` - SMS sending with phone normalization
- Test `initiateCall` - call initiation
- Test `updateCommunicationStatus` - status updates
- Test `getHistory` - communication history with filters
- Test `getById` - get single communication
- Test `scheduleFollowUp` - schedule follow-ups
- Test `getPendingFollowUps` - get pending follow-ups
- Test `cancelFollowUp` - cancel scheduled follow-up
- Test webhook handlers (SendGrid, Twilio SMS, Twilio Call)
- Mock external services (TwilioClient, SendGridClient)

#### 2. DealsService.test.ts
- Test `getStages` - get all stages
- Test `getDefaultStage` - get first stage
- Test `list` - list deals with pagination/filters
- Test `getPipelineView` - pipeline view grouped by stage
- Test `getById` - get deal by ID
- Test `getByIdOrThrow` - throw on not found
- Test `create` - create new deal
- Test `update` - update deal fields
- Test `moveToStage` - stage transitions with validation
- Test `uploadDocument` - document upload
- Test `getDocuments` - get documents for deal
- Test `verifyDocument` - document verification
- Test `deleteDocument` - document deletion
- Test `getDocumentChecklist` - document checklist status
- Test `getStats` - pipeline statistics

#### 3. DisclosureService.test.ts
- Test `getRequirements` - get state disclosure requirements
- Test `getAllRequirements` - get all active requirements
- Test `requiresDisclosure` - check if state requires disclosure
- Test `generate` - generate disclosure for deal
- Test `getById` - get disclosure by ID
- Test `getByIdOrThrow` - throw on not found
- Test `getByDealId` - get disclosures for deal
- Test `getCurrentDisclosure` - get current active disclosure
- Test `markAsSent` - mark disclosure as sent
- Test `markAsViewed` - mark disclosure as viewed
- Test `recordSignature` - record signature with validation
- Test `setDocumentUrl` - set document URL with hash
- Test `setSignatureUrl` - set e-signature URL
- Test `list` - list disclosures with filters
- Test `hasSigned` - check if deal has signed disclosure
- Test `getPendingForFollowUp` - get pending disclosures

#### 4. DisclosureCalculator.test.ts
- Test `calculateDisclosure` - full calculation
- Test `calculateDisclosure` with different payment frequencies (daily, weekly, monthly, split)
- Test APR calculation methods (annualized_rate, true_apr)
- Test CA vs NY state requirements
- Test fee inclusion in APR
- Test `calculateFromDeal` - calculate from Deal entity
- Test `formatForDisplay` - format for human display
- Test `getStateRequirements` - get state-specific requirements
- Test validation errors (missing term, invalid factor rate, etc.)

#### 5. NarrativeService.test.ts
- Test `generateNarrative` - full narrative generation
- Test `generateSummary` (private, test via public method)
- Test `generateTalkingPoints` - talking points generation
- Test `detectWhaleOpportunity` - whale detection
- Test `analyzeRisks` - risk analysis
- Test `analyzeGrowth` - growth signal analysis
- Test `generateStackInsight` - stack position insight
- Test `determineApproach` - approach recommendation
- Test `generateCallOpeners` - call opener suggestions
- Test `generateObjectionHandlers` - objection handlers
- Test with different industry types
- Test with different growth signals
- Mock database queries for prospect data

#### 6. QualificationService.test.ts
- Test `qualify` - main qualification method
- Test tier determination (A, B, C, D, Decline)
- Test ADB evaluation
- Test NSF evaluation
- Test negative days evaluation
- Test position count evaluation
- Test time in business evaluation
- Test monthly revenue evaluation
- Test deposit consistency evaluation
- Test revenue trend evaluation
- Test `qualifyWithBankAccess` - qualification with Plaid token
- Test `getTierRequirements` - get tier requirements
- Test `updateRules` - update qualification rules
- Test risk score calculation
- Test confidence calculation
- Mock UnderwritingService

#### 7. ScoringService.test.ts
- Test `calculateIntentScore` - intent score calculation
- Test `calculateHealthScore` - health score calculation
- Test `calculatePositionScore` - position score calculation
- Test `calculateCompositeScore` - composite score with modifiers
- Test `getGrade` - letter grade from score
- Test `calculateConfidence` - confidence calculation
- Test `generateNarrative` - narrative generation
- Test `scoreProspect` - full prospect scoring
- Test `scoreProspects` - batch scoring
- Test industry and state modifiers
- Mock database queries

#### 8. StackAnalysisService.test.ts
- Test `analyzeStack` - full stack analysis
- Test position detection
- Test competitor detection
- Test funder identification
- Test collateral analysis
- Test payment estimation
- Test recommendation generation
- Test risk and opportunity identification
- Test `analyzeStackBatch` - batch analysis
- Test `getKnownFunders` - get known funders list
- Test `addKnownFunder` - add new funder
- Mock database queries

#### 9. SuppressionService.test.ts
- Test `isOnDNCList` - check phone on DNC list
- Test `isEmailSuppressed` - check email suppressed
- Test `batchCheck` - batch check phones and emails
- Test `addToSuppressionList` - add to suppression list
- Test `removeFromSuppressionList` - remove from list
- Test `list` - list suppression entries
- Test `syncFTCList` - FTC sync stub
- Test `bulkImport` - bulk import entries
- Test `getStats` - suppression statistics
- Test `cleanupExpired` - cleanup expired entries
- Test phone normalization
- Test email normalization

#### 10. UnderwritingService.test.ts
- Test `extractFeatures` - feature extraction
- Test `analyzeTransactions` - transaction analysis
- Test `detectLenderPayments` - lender payment detection
- Test `analyzeRevenueTrend` - revenue trend analysis
- Test `calculateDepositConsistency` - deposit consistency
- Test ADB calculation
- Test NSF detection
- Test negative days calculation
- Test payment frequency determination
- Mock PlaidTransactionsManager

#### 11. ConsentService.test.ts
- Test `recordConsent` - record consent
- Test `hasConsent` - check consent by channel
- Test `hasConsentOfType` - check specific consent type
- Test `revokeConsent` - revoke consent
- Test `revokeAllConsent` - revoke all consents
- Test `getForContact` - get consent records for contact
- Test `getConsentSummary` - get consent summary
- Test `batchCheck` - batch consent check
- Test `getContactsWithConsent` - get contacts with consent
- Test `getStats` - consent statistics
- Test `getById` - get consent by ID
- Test `updateEvidence` - update consent evidence

#### 12. ComplianceReportService.test.ts
- Test `generateOutreachReport` - outreach report generation
- Test `generateDNCReport` - DNC report generation
- Test `generateDisclosureReport` - disclosure report generation
- Test `detectViolations` - violation detection
- Test `generateFullReport` - full compliance report
- Test `exportToCsv` - CSV export
- Test `getComplianceScore` - compliance score calculation
- Test date range validation
- Mock dependent services (AuditService, ConsentService, SuppressionService, DisclosureService)

### Route Tests (2 files) - in `server/__tests__/routes/`

#### 1. contacts.test.ts
- Test `GET /api/contacts` - list contacts with pagination
- Test `GET /api/contacts` - filter by search, role, tags
- Test `POST /api/contacts` - create contact
- Test `POST /api/contacts` - validation errors
- Test `GET /api/contacts/:id` - get contact with activities
- Test `GET /api/contacts/:id` - 404 for non-existent
- Test `PUT /api/contacts/:id` - update contact
- Test `POST /api/contacts/:id/link/:prospectId` - link to prospect
- Test `DELETE /api/contacts/:id/link/:prospectId` - unlink from prospect
- Test `POST /api/contacts/:id/activities` - log activity
- Test `GET /api/contacts/:id/activities` - get activity timeline
- Test `GET /api/contacts/by-prospect/:prospectId` - get contacts for prospect
- Use supertest and mock ContactsService

#### 2. deals.test.ts
- Test `GET /api/deals` - list deals with pagination
- Test `GET /api/deals/pipeline` - get pipeline view
- Test `GET /api/deals/stages` - get stages
- Test `GET /api/deals/stats` - get statistics
- Test `POST /api/deals` - create deal
- Test `GET /api/deals/:id` - get deal with documents
- Test `PUT /api/deals/:id` - update deal
- Test `PATCH /api/deals/:id/stage` - move to stage
- Test `POST /api/deals/:id/documents` - upload document
- Test `GET /api/deals/:id/documents` - get documents
- Test `GET /api/deals/:id/documents/checklist` - get checklist
- Test `PATCH /api/deals/:id/documents/:documentId/verify` - verify document
- Test `DELETE /api/deals/:id/documents/:documentId` - delete document
- Use supertest and mock DealsService

## Test Patterns to Follow

### Service Test Pattern
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ServiceName } from '../../services/ServiceName'
import { NotFoundError, ValidationError, DatabaseError } from '../../errors'

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
      mockQuery.mockResolvedValueOnce([/* expected result */])
      const result = await service.methodName(/* args */)
      expect(result).toBeDefined()
    })

    it('should throw DatabaseError on failure', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Query failed'))
      await expect(service.methodName(/* args */)).rejects.toThrow(DatabaseError)
    })
  })
})
```

### Route Test Pattern
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createTestApp, createAuthHeader } from '../helpers/testApp'
import type { Express } from 'express'

const { mockMethod1, mockMethod2 } = vi.hoisted(() => ({
  mockMethod1: vi.fn(),
  mockMethod2: vi.fn()
}))

vi.mock('../../services/ServiceName', () => ({
  ServiceName: class MockServiceName {
    method1 = mockMethod1
    method2 = mockMethod2
  }
}))

describe('Resource API', () => {
  let app: Express
  let authHeader: string

  beforeEach(() => {
    vi.clearAllMocks()
    app = createTestApp()
    authHeader = createAuthHeader()
  })

  describe('GET /api/resource', () => {
    it('should return paginated list', async () => {
      mockMethod1.mockResolvedValueOnce({ /* response */ })
      const response = await request(app)
        .get('/api/resource')
        .set('Authorization', authHeader)
      expect(response.status).toBe(200)
    })
  })
})
```

## Test Helper Updates
The route tests for contacts and deals will need to update `server/__tests__/helpers/testApp.ts` to include the new routes:
- Add import for contactsRouter
- Add import for dealsRouter
- Mount routes: `app.use('/api/contacts', authMiddleware, contactsRouter)`
- Mount routes: `app.use('/api/deals', authMiddleware, dealsRouter)`

## Implementation Order
1. Update testApp.ts helper to include contacts and deals routes
2. Service tests (simpler, no express setup):
   - DisclosureCalculator.test.ts (no DB mocks needed, pure logic)
   - ScoringService.test.ts
   - QualificationService.test.ts
   - UnderwritingService.test.ts
   - SuppressionService.test.ts
   - ConsentService.test.ts
   - StackAnalysisService.test.ts
   - NarrativeService.test.ts
   - DealsService.test.ts
   - DisclosureService.test.ts
   - CommunicationsService.test.ts
   - ComplianceReportService.test.ts
3. Route tests:
   - contacts.test.ts
   - deals.test.ts

## Notes
- AuditService.test.ts and ContactsService.test.ts already exist and are complete
- Tests should focus on core functionality, success paths, error handling, and edge cases
- Mock external services (Twilio, SendGrid, Plaid) where needed
- Use proper error types from `../../errors` or `../../errors/index`
