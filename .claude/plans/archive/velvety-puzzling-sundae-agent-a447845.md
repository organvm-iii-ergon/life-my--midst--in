# Plan: Create Route Tests for MCA Platform Phase 2

## Objective
Create comprehensive test files for the contacts and deals API routes.

## Status: READY TO IMPLEMENT

## Files to Create

### 1. `server/__tests__/routes/contacts.test.ts`

**Endpoints to test:**
- `GET /api/contacts` - List contacts with filters
- `POST /api/contacts` - Create contact
- `GET /api/contacts/:id` - Get contact with activity timeline
- `PUT /api/contacts/:id` - Update contact
- `POST /api/contacts/:id/link/:prospectId` - Link contact to prospect
- `DELETE /api/contacts/:id/link/:prospectId` - Unlink contact from prospect
- `POST /api/contacts/:id/activities` - Log activity for contact
- `GET /api/contacts/:id/activities` - Get activity timeline
- `GET /api/contacts/by-prospect/:prospectId` - Get contacts for a prospect

### 2. `server/__tests__/routes/deals.test.ts`

**Endpoints to test:**
- `GET /api/deals` - List deals with pipeline view
- `GET /api/deals/pipeline` - Get pipeline view with deals grouped by stage
- `GET /api/deals/stages` - Get all stages for an organization
- `GET /api/deals/stats` - Get pipeline statistics
- `POST /api/deals` - Create deal
- `GET /api/deals/:id` - Get deal details
- `PUT /api/deals/:id` - Update deal
- `PATCH /api/deals/:id/stage` - Move deal to a new stage
- `POST /api/deals/:id/documents` - Upload document to deal
- `GET /api/deals/:id/documents` - Get documents for a deal
- `GET /api/deals/:id/documents/checklist` - Get document checklist
- `PATCH /api/deals/:id/documents/:documentId/verify` - Verify a document
- `DELETE /api/deals/:id/documents/:documentId` - Delete a document

## Implementation

### Step 1: Update testApp.ts

Add imports and routes:
```typescript
import contactsRouter from '../../routes/contacts'
import dealsRouter from '../../routes/deals'

// In createTestApp():
app.use('/api/contacts', authMiddleware, contactsRouter)
app.use('/api/deals', authMiddleware, dealsRouter)
```

### Step 2: contacts.test.ts Implementation

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createTestApp, createAuthHeader } from '../helpers/testApp'
import type { Express } from 'express'
import { NotFoundError } from '../../errors'

// Use vi.hoisted to ensure mocks are available when vi.mock runs
const {
  mockList,
  mockGetById,
  mockCreate,
  mockUpdate,
  mockLinkToProspect,
  mockUnlinkFromProspect,
  mockLogActivity,
  mockGetActivityTimeline,
  mockGetContactsForProspect
} = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockGetById: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockLinkToProspect: vi.fn(),
  mockUnlinkFromProspect: vi.fn(),
  mockLogActivity: vi.fn(),
  mockGetActivityTimeline: vi.fn(),
  mockGetContactsForProspect: vi.fn()
}))

// Mock the ContactsService
vi.mock('../../services/ContactsService', () => ({
  ContactsService: class MockContactsService {
    list = mockList
    getById = mockGetById
    create = mockCreate
    update = mockUpdate
    linkToProspect = mockLinkToProspect
    unlinkFromProspect = mockUnlinkFromProspect
    logActivity = mockLogActivity
    getActivityTimeline = mockGetActivityTimeline
    getContactsForProspect = mockGetContactsForProspect
  }
}))

describe('Contacts API', () => {
  let app: Express
  let authHeader: string
  const testOrgId = '550e8400-e29b-41d4-a716-446655440000'
  const testContactId = '550e8400-e29b-41d4-a716-446655440001'
  const testProspectId = '550e8400-e29b-41d4-a716-446655440002'

  beforeEach(() => {
    vi.clearAllMocks()
    app = createTestApp()
    authHeader = createAuthHeader()
  })

  describe('GET /api/contacts', () => {
    it('should return paginated list of contacts', async () => {
      const mockContacts = [
        { id: testContactId, first_name: 'John', last_name: 'Doe', email: 'john@example.com' }
      ]
      mockList.mockResolvedValueOnce({
        contacts: mockContacts,
        page: 1,
        limit: 20,
        total: 1
      })

      const response = await request(app)
        .get(`/api/contacts?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('contacts')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.contacts).toBeInstanceOf(Array)
    })

    it('should require org_id query parameter', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })

    it('should validate org_id is UUID', async () => {
      const response = await request(app)
        .get('/api/contacts?org_id=invalid')
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })

    it('should support filtering by role', async () => {
      mockList.mockResolvedValueOnce({ contacts: [], page: 1, limit: 20, total: 0 })

      const response = await request(app)
        .get(`/api/contacts?org_id=${testOrgId}&role=owner`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ role: 'owner' }))
    })

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/contacts?org_id=${testOrgId}`)
      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/contacts', () => {
    it('should create a new contact', async () => {
      const contactData = {
        org_id: testOrgId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      }
      mockCreate.mockResolvedValueOnce({ id: testContactId, ...contactData })

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send(contactData)

      expect(response.status).toBe(201)
      expect(response.body.id).toBeDefined()
    })

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({ org_id: testOrgId })

      expect(response.status).toBe(400)
    })

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          org_id: testOrgId,
          first_name: 'John',
          last_name: 'Doe',
          email: 'invalid-email'
        })

      expect(response.status).toBe(400)
    })

    it('should validate role enum', async () => {
      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({
          org_id: testOrgId,
          first_name: 'John',
          last_name: 'Doe',
          role: 'invalid_role'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/contacts/:id', () => {
    it('should return contact by id', async () => {
      const mockContact = { id: testContactId, first_name: 'John', last_name: 'Doe' }
      mockGetById.mockResolvedValueOnce(mockContact)
      mockGetActivityTimeline.mockResolvedValueOnce([])

      const response = await request(app)
        .get(`/api/contacts/${testContactId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(testContactId)
      expect(response.body).toHaveProperty('activities')
    })

    it('should require org_id query parameter', async () => {
      const response = await request(app)
        .get(`/api/contacts/${testContactId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 404 for non-existent contact', async () => {
      mockGetById.mockResolvedValueOnce(null)

      const response = await request(app)
        .get(`/api/contacts/${testContactId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/contacts/invalid-uuid?org_id=' + testOrgId)
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/contacts/:id', () => {
    it('should update contact', async () => {
      const mockUpdated = { id: testContactId, first_name: 'Jane', last_name: 'Doe' }
      mockUpdate.mockResolvedValueOnce(mockUpdated)

      const response = await request(app)
        .put(`/api/contacts/${testContactId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ first_name: 'Jane' })

      expect(response.status).toBe(200)
      expect(response.body.first_name).toBe('Jane')
    })

    it('should require org_id query parameter', async () => {
      const response = await request(app)
        .put(`/api/contacts/${testContactId}`)
        .set('Authorization', authHeader)
        .send({ first_name: 'Jane' })

      expect(response.status).toBe(400)
    })

    it('should validate UUID format', async () => {
      const response = await request(app)
        .put(`/api/contacts/invalid-uuid?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ first_name: 'Jane' })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/contacts/:id/link/:prospectId', () => {
    it('should link contact to prospect', async () => {
      const mockLink = { contact_id: testContactId, prospect_id: testProspectId, is_primary: true }
      mockLinkToProspect.mockResolvedValueOnce(mockLink)

      const response = await request(app)
        .post(`/api/contacts/${testContactId}/link/${testProspectId}`)
        .set('Authorization', authHeader)
        .send({ is_primary: true, relationship: 'owner' })

      expect(response.status).toBe(201)
      expect(mockLinkToProspect).toHaveBeenCalledWith(expect.objectContaining({
        contactId: testContactId,
        prospectId: testProspectId
      }))
    })

    it('should use default relationship', async () => {
      mockLinkToProspect.mockResolvedValueOnce({})

      const response = await request(app)
        .post(`/api/contacts/${testContactId}/link/${testProspectId}`)
        .set('Authorization', authHeader)
        .send({})

      expect(response.status).toBe(201)
      expect(mockLinkToProspect).toHaveBeenCalledWith(expect.objectContaining({
        relationship: 'employee'
      }))
    })

    it('should validate relationship enum', async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/link/${testProspectId}`)
        .set('Authorization', authHeader)
        .send({ relationship: 'invalid' })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/contacts/:id/link/:prospectId', () => {
    it('should unlink contact from prospect', async () => {
      mockUnlinkFromProspect.mockResolvedValueOnce(true)

      const response = await request(app)
        .delete(`/api/contacts/${testContactId}/link/${testProspectId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(204)
    })

    it('should return 404 if link not found', async () => {
      mockUnlinkFromProspect.mockResolvedValueOnce(false)

      const response = await request(app)
        .delete(`/api/contacts/${testContactId}/link/${testProspectId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/contacts/:id/activities', () => {
    it('should log activity for contact', async () => {
      const mockActivity = { id: 'activity-1', activity_type: 'call_outbound' }
      mockLogActivity.mockResolvedValueOnce(mockActivity)

      const response = await request(app)
        .post(`/api/contacts/${testContactId}/activities`)
        .set('Authorization', authHeader)
        .send({ activity_type: 'call_outbound', subject: 'Follow up call' })

      expect(response.status).toBe(201)
      expect(response.body.activity_type).toBe('call_outbound')
    })

    it('should validate activity_type enum', async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/activities`)
        .set('Authorization', authHeader)
        .send({ activity_type: 'invalid_type' })

      expect(response.status).toBe(400)
    })

    it('should require activity_type', async () => {
      const response = await request(app)
        .post(`/api/contacts/${testContactId}/activities`)
        .set('Authorization', authHeader)
        .send({ subject: 'Test' })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/contacts/:id/activities', () => {
    it('should return activity timeline', async () => {
      const mockActivities = [{ id: 'a1', activity_type: 'call_outbound' }]
      mockGetActivityTimeline.mockResolvedValueOnce(mockActivities)

      const response = await request(app)
        .get(`/api/contacts/${testContactId}/activities`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.activities).toBeInstanceOf(Array)
    })

    it('should support limit parameter', async () => {
      mockGetActivityTimeline.mockResolvedValueOnce([])

      await request(app)
        .get(`/api/contacts/${testContactId}/activities?limit=10`)
        .set('Authorization', authHeader)

      expect(mockGetActivityTimeline).toHaveBeenCalledWith(testContactId, { limit: 10, before: undefined })
    })
  })

  describe('GET /api/contacts/by-prospect/:prospectId', () => {
    it('should return contacts for prospect', async () => {
      const mockContacts = [{ id: testContactId, first_name: 'John' }]
      mockGetContactsForProspect.mockResolvedValueOnce(mockContacts)

      const response = await request(app)
        .get(`/api/contacts/by-prospect/${testProspectId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.contacts).toBeInstanceOf(Array)
    })
  })
})
```

### Step 3: deals.test.ts Implementation

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { createTestApp, createAuthHeader } from '../helpers/testApp'
import type { Express } from 'express'
import { NotFoundError } from '../../errors'

const {
  mockList,
  mockGetById,
  mockCreate,
  mockUpdate,
  mockMoveToStage,
  mockGetPipelineView,
  mockGetStages,
  mockGetStats,
  mockUploadDocument,
  mockGetDocuments,
  mockGetDocumentChecklist,
  mockVerifyDocument,
  mockDeleteDocument
} = vi.hoisted(() => ({
  mockList: vi.fn(),
  mockGetById: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
  mockMoveToStage: vi.fn(),
  mockGetPipelineView: vi.fn(),
  mockGetStages: vi.fn(),
  mockGetStats: vi.fn(),
  mockUploadDocument: vi.fn(),
  mockGetDocuments: vi.fn(),
  mockGetDocumentChecklist: vi.fn(),
  mockVerifyDocument: vi.fn(),
  mockDeleteDocument: vi.fn()
}))

vi.mock('../../services/DealsService', () => ({
  DealsService: class MockDealsService {
    list = mockList
    getById = mockGetById
    create = mockCreate
    update = mockUpdate
    moveToStage = mockMoveToStage
    getPipelineView = mockGetPipelineView
    getStages = mockGetStages
    getStats = mockGetStats
    uploadDocument = mockUploadDocument
    getDocuments = mockGetDocuments
    getDocumentChecklist = mockGetDocumentChecklist
    verifyDocument = mockVerifyDocument
    deleteDocument = mockDeleteDocument
  }
}))

describe('Deals API', () => {
  let app: Express
  let authHeader: string
  const testOrgId = '550e8400-e29b-41d4-a716-446655440000'
  const testDealId = '550e8400-e29b-41d4-a716-446655440001'
  const testStageId = '550e8400-e29b-41d4-a716-446655440002'
  const testDocumentId = '550e8400-e29b-41d4-a716-446655440003'

  beforeEach(() => {
    vi.clearAllMocks()
    app = createTestApp()
    authHeader = createAuthHeader()
  })

  describe('GET /api/deals', () => {
    it('should return paginated list of deals', async () => {
      mockList.mockResolvedValueOnce({
        deals: [{ id: testDealId, amount_requested: 50000 }],
        page: 1,
        limit: 20,
        total: 1
      })

      const response = await request(app)
        .get(`/api/deals?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('deals')
      expect(response.body).toHaveProperty('pagination')
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .get('/api/deals')
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })

    it('should filter by priority', async () => {
      mockList.mockResolvedValueOnce({ deals: [], page: 1, limit: 20, total: 0 })

      const response = await request(app)
        .get(`/api/deals?org_id=${testOrgId}&priority=high`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(mockList).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }))
    })

    it('should validate priority enum', async () => {
      const response = await request(app)
        .get(`/api/deals?org_id=${testOrgId}&priority=invalid`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/deals?org_id=${testOrgId}`)
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/deals/pipeline', () => {
    it('should return pipeline view', async () => {
      mockGetPipelineView.mockResolvedValueOnce({
        stages: [{ id: testStageId, name: 'New Lead', deals: [] }]
      })

      const response = await request(app)
        .get(`/api/deals/pipeline?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(mockGetPipelineView).toHaveBeenCalledWith(testOrgId)
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .get('/api/deals/pipeline')
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/deals/stages', () => {
    it('should return stages', async () => {
      mockGetStages.mockResolvedValueOnce([{ id: testStageId, name: 'New Lead' }])

      const response = await request(app)
        .get(`/api/deals/stages?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.stages).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/deals/stats', () => {
    it('should return pipeline statistics', async () => {
      mockGetStats.mockResolvedValueOnce({ total_deals: 10, total_value: 500000 })

      const response = await request(app)
        .get(`/api/deals/stats?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('total_deals')
    })
  })

  describe('POST /api/deals', () => {
    it('should create a new deal', async () => {
      const dealData = {
        org_id: testOrgId,
        amount_requested: 50000,
        term_months: 12,
        priority: 'normal'
      }
      mockCreate.mockResolvedValueOnce({ id: testDealId, ...dealData })

      const response = await request(app)
        .post('/api/deals')
        .set('Authorization', authHeader)
        .send(dealData)

      expect(response.status).toBe(201)
      expect(response.body.id).toBeDefined()
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .post('/api/deals')
        .set('Authorization', authHeader)
        .send({ amount_requested: 50000 })

      expect(response.status).toBe(400)
    })

    it('should validate use_of_funds enum', async () => {
      const response = await request(app)
        .post('/api/deals')
        .set('Authorization', authHeader)
        .send({ org_id: testOrgId, use_of_funds: 'invalid' })

      expect(response.status).toBe(400)
    })

    it('should validate amount is positive', async () => {
      const response = await request(app)
        .post('/api/deals')
        .set('Authorization', authHeader)
        .send({ org_id: testOrgId, amount_requested: -1000 })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/deals/:id', () => {
    it('should return deal by id', async () => {
      mockGetById.mockResolvedValueOnce({ id: testDealId, amount_requested: 50000 })
      mockGetDocuments.mockResolvedValueOnce([])
      mockGetDocumentChecklist.mockResolvedValueOnce([])

      const response = await request(app)
        .get(`/api/deals/${testDealId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(testDealId)
      expect(response.body).toHaveProperty('documents')
      expect(response.body).toHaveProperty('documentChecklist')
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .get(`/api/deals/${testDealId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('should return 404 for non-existent deal', async () => {
      mockGetById.mockResolvedValueOnce(null)

      const response = await request(app)
        .get(`/api/deals/${testDealId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(404)
    })

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get(`/api/deals/invalid-uuid?org_id=${testOrgId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/deals/:id', () => {
    it('should update deal', async () => {
      const mockUpdated = { id: testDealId, amount_requested: 75000 }
      mockUpdate.mockResolvedValueOnce(mockUpdated)

      const response = await request(app)
        .put(`/api/deals/${testDealId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ amount_requested: 75000 })

      expect(response.status).toBe(200)
      expect(response.body.amount_requested).toBe(75000)
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .put(`/api/deals/${testDealId}`)
        .set('Authorization', authHeader)
        .send({ amount_requested: 75000 })

      expect(response.status).toBe(400)
    })

    it('should validate probability range', async () => {
      const response = await request(app)
        .put(`/api/deals/${testDealId}?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ probability: 150 })

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/deals/:id/stage', () => {
    it('should move deal to new stage', async () => {
      mockMoveToStage.mockResolvedValueOnce({ id: testDealId, stage_id: testStageId })

      const response = await request(app)
        .patch(`/api/deals/${testDealId}/stage?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ stage_id: testStageId })

      expect(response.status).toBe(200)
      expect(mockMoveToStage).toHaveBeenCalledWith(testDealId, testOrgId, testStageId, expect.any(Object))
    })

    it('should require org_id', async () => {
      const response = await request(app)
        .patch(`/api/deals/${testDealId}/stage`)
        .set('Authorization', authHeader)
        .send({ stage_id: testStageId })

      expect(response.status).toBe(400)
    })

    it('should require stage_id', async () => {
      const response = await request(app)
        .patch(`/api/deals/${testDealId}/stage?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({})

      expect(response.status).toBe(400)
    })

    it('should validate stage_id is UUID', async () => {
      const response = await request(app)
        .patch(`/api/deals/${testDealId}/stage?org_id=${testOrgId}`)
        .set('Authorization', authHeader)
        .send({ stage_id: 'invalid' })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/deals/:id/documents', () => {
    it('should upload document to deal', async () => {
      const docData = {
        document_type: 'bank_statement',
        file_name: 'statement.pdf',
        file_path: '/uploads/statement.pdf'
      }
      mockUploadDocument.mockResolvedValueOnce({ id: testDocumentId, ...docData })

      const response = await request(app)
        .post(`/api/deals/${testDealId}/documents`)
        .set('Authorization', authHeader)
        .send(docData)

      expect(response.status).toBe(201)
      expect(response.body.id).toBeDefined()
    })

    it('should validate document_type enum', async () => {
      const response = await request(app)
        .post(`/api/deals/${testDealId}/documents`)
        .set('Authorization', authHeader)
        .send({
          document_type: 'invalid_type',
          file_name: 'test.pdf',
          file_path: '/uploads/test.pdf'
        })

      expect(response.status).toBe(400)
    })

    it('should require file_name', async () => {
      const response = await request(app)
        .post(`/api/deals/${testDealId}/documents`)
        .set('Authorization', authHeader)
        .send({ document_type: 'bank_statement', file_path: '/uploads/test.pdf' })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/deals/:id/documents', () => {
    it('should return documents for deal', async () => {
      mockGetDocuments.mockResolvedValueOnce([{ id: testDocumentId, file_name: 'test.pdf' }])

      const response = await request(app)
        .get(`/api/deals/${testDealId}/documents`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.documents).toBeInstanceOf(Array)
    })
  })

  describe('GET /api/deals/:id/documents/checklist', () => {
    it('should return document checklist', async () => {
      mockGetDocumentChecklist.mockResolvedValueOnce([
        { document_type: 'bank_statement', is_required: true, is_uploaded: false }
      ])

      const response = await request(app)
        .get(`/api/deals/${testDealId}/documents/checklist`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(200)
      expect(response.body.checklist).toBeInstanceOf(Array)
    })
  })

  describe('PATCH /api/deals/:id/documents/:documentId/verify', () => {
    it('should verify document', async () => {
      const testUserId = '550e8400-e29b-41d4-a716-446655440004'
      mockVerifyDocument.mockResolvedValueOnce({ id: testDocumentId, verified_by: testUserId })

      const response = await request(app)
        .patch(`/api/deals/${testDealId}/documents/${testDocumentId}/verify`)
        .set('Authorization', authHeader)
        .send({ verified_by: testUserId })

      expect(response.status).toBe(200)
      expect(mockVerifyDocument).toHaveBeenCalledWith(testDocumentId, testUserId)
    })

    it('should require verified_by', async () => {
      const response = await request(app)
        .patch(`/api/deals/${testDealId}/documents/${testDocumentId}/verify`)
        .set('Authorization', authHeader)
        .send({})

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/deals/:id/documents/:documentId', () => {
    it('should delete document', async () => {
      mockDeleteDocument.mockResolvedValueOnce(true)

      const response = await request(app)
        .delete(`/api/deals/${testDealId}/documents/${testDocumentId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(204)
    })

    it('should return 404 if document not found', async () => {
      mockDeleteDocument.mockResolvedValueOnce(false)

      const response = await request(app)
        .delete(`/api/deals/${testDealId}/documents/${testDocumentId}`)
        .set('Authorization', authHeader)

      expect(response.status).toBe(404)
    })
  })
})
```

## Summary

This plan creates comprehensive tests for both the contacts and deals API routes:

1. **contacts.test.ts** - 9 endpoint groups with 20+ test cases covering:
   - CRUD operations
   - Contact-prospect linking
   - Activity tracking
   - Validation (UUIDs, enums, required fields)
   - Authentication

2. **deals.test.ts** - 14 endpoint groups with 25+ test cases covering:
   - CRUD operations
   - Pipeline view and stages
   - Stage transitions
   - Document management
   - Validation (UUIDs, enums, ranges)
   - Authentication

Both follow the existing pattern from prospects.test.ts using vi.hoisted mocks.
