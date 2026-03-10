# WORKSTREAM I: Frontend Tests for MCA Platform Phase 2

## Overview

This plan creates comprehensive component and hook tests for the MCA Platform's broker services UI components following existing test patterns found in the codebase.

## Test Patterns Identified

From analyzing existing tests (ProspectCard.test.tsx, useProspectActions.test.ts, ContactList.test.tsx), the established patterns are:

1. **Component Tests**:
   - Mock all UI components from `@public-records/ui/*`
   - Mock Phosphor icons from `@phosphor-icons/react`
   - Mock `cn` utility from `@public-records/ui/utils`
   - Use `userEvent.setup()` for user interactions
   - Group tests by: rendering, empty state, interactions, specific features, accessibility
   - Use descriptive `data-testid` attributes in mocks

2. **Hook Tests**:
   - Mock external dependencies (API, toast, etc.)
   - Use `renderHook` and `act` from `@testing-library/react`
   - Test async operations with proper promise handling
   - Verify toast messages for success/error states
   - Test callback stability

## Files to Create

### Component Tests

1. **`/apps/web/src/components/contacts/__tests__/ContactDetail.test.tsx`**
   - Test rendering profile card (avatar, name, role, badges)
   - Test contact info grid (email, phone, mobile, timezone)
   - Test quick action buttons (call, email, SMS)
   - Test tabs navigation (Activity, Linked Prospects, Notes)
   - Test activity timeline rendering
   - Test linked prospects list with navigation
   - Test notes display
   - Test callback handlers (onEdit, onBack, onCall, etc.)

2. **`/apps/web/src/components/deals/__tests__/DealPipeline.test.tsx`**
   - Test rendering header with title and stats
   - Test stage columns (default stages)
   - Test deal cards in stages
   - Test drag and drop handlers
   - Test stage metrics calculation
   - Test conversion rates display
   - Test callbacks (onDealClick, onDealCreate, onDealStageChange, etc.)
   - Test dropdown menu actions (Edit, Move to, Delete)

3. **`/apps/web/src/components/deals/__tests__/DealDetail.test.tsx`**
   - Test header with deal number, stage badge, priority badge
   - Test amount summary (requested, approved, funded)
   - Test stage progression component
   - Test tabs (Overview, Documents, Underwriting, Disclosure, Activity)
   - Test document checklist and upload
   - Test underwriting metrics display (when bank connected)
   - Test disclosure section (generated vs empty state)
   - Test callbacks (onEdit, onBack, onStageChange, etc.)

4. **`/apps/web/src/components/communications/__tests__/UnifiedInbox.test.tsx`**
   - Test inbox header with compose button
   - Test message list with date grouping
   - Test filters (channel, direction, search)
   - Test message selection and detail view
   - Test different channel types (email, SMS, call)
   - Test status indicators
   - Test callbacks (onCommunicationSelect, onCompose, onReply)
   - Test empty state

5. **`/apps/web/src/components/compliance/__tests__/AuditLogViewer.test.tsx`**
   - Test rendering audit log table
   - Test filters (entity type, action, user, date range)
   - Test search functionality
   - Test export button
   - Test detail dialog opening
   - Test change rendering in detail view
   - Test empty state
   - Test user name resolution

### Hook Tests

6. **`/apps/web/src/hooks/__tests__/useContactActions.test.ts`**
   - Mock all API functions from `@/lib/api/contacts`
   - Test handleFetchContacts (success, error)
   - Test handleFetchContact (success, error)
   - Test handleCreateContact (success, error, callbacks)
   - Test handleUpdateContact (success, error, callbacks)
   - Test handleLinkToProspect (success, error, callbacks)
   - Test handleUnlinkFromProspect (success, error, callbacks)
   - Test handleLogActivity (success, error, callbacks)
   - Test handleFetchActivities (success, error)
   - Test handleFetchContactsForProspect (success, error)
   - Test isLoading state management
   - Test error state management

7. **`/apps/web/src/hooks/__tests__/useDealActions.test.ts`**
   - Mock all API functions from `@/lib/api/deals`
   - Test handleFetchDeals (success, error)
   - Test handleFetchDeal (success, error)
   - Test handleFetchPipelineView (success, error)
   - Test handleFetchStages (success, error)
   - Test handleFetchStats (success, error)
   - Test handleCreateDeal (success, error, callbacks)
   - Test handleUpdateDeal (success, error, callbacks)
   - Test handleMoveToStage (success, error, callbacks)
   - Test handleUploadDocument (success, error, callbacks)
   - Test handleFetchDocuments (success, error)
   - Test handleFetchDocumentChecklist (success, error)
   - Test handleVerifyDocument (success, error)
   - Test handleDeleteDocument (success, error, callbacks)
   - Test isLoading state management
   - Test error state management

## Implementation Details

### Common Mocks

Each component test will need:

```typescript
// UI Component mocks (Card, Button, Badge, etc.)
vi.mock('@public-records/ui/card', () => ({...}))
vi.mock('@public-records/ui/button', () => ({...}))
vi.mock('@public-records/ui/badge', () => ({...}))
// ... other UI components used

// Phosphor icons mock
vi.mock('@phosphor-icons/react', () => ({...}))

// Utils mock
vi.mock('@public-records/ui/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}))
```

### Mock Data Factories

Create consistent mock data:

```typescript
const createMockContact = (overrides?: Partial<Contact>): Contact => ({
  id: 'contact-1',
  orgId: 'org-1',
  firstName: 'John',
  lastName: 'Doe',
  // ... default values
  ...overrides
})

const createMockDeal = (overrides?: Partial<Deal>): Deal => ({
  id: 'deal-1',
  orgId: 'org-1',
  stageId: 'lead',
  // ... default values
  ...overrides
})
```

### Test Structure

Each test file follows:

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders component', () => {})
    it('displays key data', () => {})
  })

  describe('interactions', () => {
    it('handles clicks', async () => {})
  })

  describe('specific feature', () => {
    // Feature-specific tests
  })

  describe('edge cases', () => {
    it('handles empty state', () => {})
    it('handles missing optional data', () => {})
  })
})
```

## Execution Order

1. Create ContactDetail.test.tsx (builds on existing ContactList test)
2. Create DealPipeline.test.tsx
3. Create DealDetail.test.tsx
4. Create UnifiedInbox.test.tsx
5. Create AuditLogViewer.test.tsx
6. Create useContactActions.test.ts
7. Create useDealActions.test.ts

## Verification

After implementation, run:
```bash
npm test -- ContactDetail DealPipeline DealDetail UnifiedInbox AuditLogViewer useContactActions useDealActions
```

Expected: All tests pass with good coverage of:
- Component rendering
- User interactions
- State management
- Callback invocations
- Edge cases / empty states
