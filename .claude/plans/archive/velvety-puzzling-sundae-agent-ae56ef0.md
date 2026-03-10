# MCA Platform Phase 2 Frontend Tests Implementation Plan

## Overview
Implement 7 test files for MCA Platform Phase 2 components and hooks using React Testing Library, Vitest, and the established testing patterns from the codebase.

## Test Files to Create

### Component Tests (`apps/web/src/components/__tests__/`)

#### 1. ContactDetail.test.tsx
**Component Path:** `apps/web/src/components/contacts/ContactDetail.tsx`

**Props to test:**
- `contact: Contact`
- `activities: ContactActivity[]`
- `linkedProspects?: Array<{ prospect: Prospect; link: ProspectContact }>`
- `onEdit: () => void`
- `onBack: () => void`
- `onCall?: (contact: Contact) => void`
- `onEmail?: (contact: Contact) => void`
- `onSms?: (contact: Contact) => void`
- `onScheduleMeeting?: (contact: Contact) => void`
- `onLinkProspect?: (contact: Contact) => void`
- `onProspectSelect?: (prospect: Prospect) => void`

**Test scenarios:**
- Rendering: displays contact name, email, phone, title, role badge, active/inactive status
- Avatar: shows correct initials
- Quick actions: call, email, SMS buttons render when handlers provided
- Tabs: Activity, Linked Prospects, Notes tabs render and switch correctly
- Activity timeline: passes activities to ActivityTimeline component
- Linked prospects: displays prospects list with relationship badges, handles empty state
- Notes tab: displays notes or empty state
- Contact metadata: displays source, created date, updated date
- User interactions: onEdit, onBack, onCall, onEmail, onSms callbacks fire correctly
- Tags: renders tag badges

---

#### 2. DealPipeline.test.tsx
**Component Path:** `apps/web/src/components/deals/DealPipeline.tsx`

**Props to test:**
- `deals: Deal[]`
- `stages?: DealStage[]`
- `onDealClick: (deal: Deal) => void`
- `onDealCreate: () => void`
- `onDealStageChange: (dealId: string, newStageId: string) => void`
- `onDealEdit: (deal: Deal) => void`
- `onDealDelete: (deal: Deal) => void`

**Test scenarios:**
- Rendering: displays header with total deals count and pipeline value
- Default stages: uses DEFAULT_STAGES when none provided
- Stage columns: renders all stages with correct names and colors
- Deal cards: displays deal number, amount, days in stage, priority indicator
- Stage metrics: shows count and total value per stage
- Conversion rates: calculates and displays conversion rates between stages
- Empty stages: shows "No deals in this stage" message
- User interactions: onDealClick, onDealCreate, onDealEdit, onDealDelete callbacks
- Dropdown menu: Edit, Move to Stage, Delete options
- New Deal button: triggers onDealCreate

---

#### 3. DealDetail.test.tsx
**Component Path:** `apps/web/src/components/deals/DealDetail.tsx`

**Props to test:**
- `deal: Deal`
- `stage: DealStage`
- `documents: DealDocument[]`
- `disclosure?: Disclosure | null`
- `contact?: Contact | null`
- `prospect?: Prospect | null`
- `activities: ContactActivity[]`
- `onBack: () => void`
- `onEdit: () => void`
- `onStageChange: (newStageId: string) => void`
- `onDocumentUpload: (documentType: DocumentType) => void`
- `onDocumentDownload: (document: DealDocument) => void`
- `onGenerateDisclosure: () => void`
- `onSendDisclosure: () => void`
- `stages: DealStage[]`

**Test scenarios:**
- Rendering: displays deal number, stage badge, priority badge
- Amount summary: shows requested, approved, funded amounts
- Stage progression: renders stage stepper with correct current stage
- Tabs: Overview, Documents, Underwriting, Disclosure, Activity
- Deal Terms card: term months, factor rate, payments, total payback
- Key Dates card: created, submitted, approved, funded dates
- Documents tab: shows document checklist with completion progress
- Required documents: highlighted with "Required" badge when missing
- Underwriting tab: displays ADB, monthly revenue, NSF count when bank connected
- Underwriting empty: shows connect bank prompt when no data
- Disclosure tab: shows disclosure details when exists
- Disclosure empty: shows generate disclosure prompt
- Contact/Prospect cards: display linked contact and prospect info
- User interactions: all callback handlers fire correctly

---

#### 4. UnifiedInbox.test.tsx
**Component Path:** `apps/web/src/components/communications/UnifiedInbox.tsx`

**Props to test:**
- `communications: Communication[]`
- `contacts: Contact[]`
- `onCommunicationSelect: (communication: Communication) => void`
- `onCompose: (channel?: CommunicationChannel) => void`
- `onReply: (communication: Communication) => void`

**Test scenarios:**
- Rendering: displays header with count, Compose button
- Search: filters communications by contact name, subject, body
- Channel filter: filters by email, sms, call
- Direction filter: filters by inbound, outbound
- Message list: displays contact name, relative time, subject, body preview, status
- Message grouping: groups by Today, Yesterday, older dates
- Message selection: highlights selected message, calls onCommunicationSelect
- Message detail panel: shows full message with from/to, channel badge, status
- Reply button: triggers onReply
- Compose button: triggers onCompose
- Empty state: shows "No messages found" when filtered list empty
- Channel icons: correct icons for email, sms, call
- Status colors: correct color indicators for different statuses

---

#### 5. AuditLogViewer.test.tsx
**Component Path:** `apps/web/src/components/compliance/AuditLogViewer.tsx`

**Props to test:**
- `auditLogs: AuditLog[]`
- `users?: User[]`
- `onExport: (logs: AuditLog[]) => void`

**Test scenarios:**
- Rendering: displays header with count, Export button
- Table columns: Timestamp, User, Action, Entity, Entity ID, view button
- Search: filters by action, entity type, entity ID, user name
- Entity type filter: filter by prospect, contact, deal, communication, disclosure, other
- Action filter: filter by create, update, delete, view, send, sign
- User filter: dropdown with unique users from logs
- Date range filter: from/to date inputs
- Action colors: correct color indicators for create, update, delete
- User display: shows user name from users array or truncated ID
- Export: calls onExport with filtered logs
- Detail dialog: opens on view button click, shows full log details
- Changes display: renders old/new value diff
- Before/After state: renders JSON state when present
- Empty state: shows message when no logs match filters

---

### Hook Tests (`apps/web/src/hooks/__tests__/`)

#### 6. useContactActions.test.ts
**Hook Path:** `apps/web/src/hooks/useContactActions.ts`

**Functions to test:**
- `handleFetchContacts`
- `handleFetchContact`
- `handleCreateContact`
- `handleUpdateContact`
- `handleLinkToProspect`
- `handleUnlinkFromProspect`
- `handleLogActivity`
- `handleFetchActivities`
- `handleFetchContactsForProspect`

**Test scenarios:**
- Initial state: isLoading false, error null
- handleFetchContacts: success returns ContactListResponse, sets loading states
- handleFetchContacts: error sets error state, shows toast
- handleFetchContact: success returns ContactWithActivities
- handleCreateContact: success creates contact, calls onContactCreated callback, shows success toast
- handleCreateContact: error shows error toast
- handleUpdateContact: success updates contact, calls onContactUpdated callback
- handleLinkToProspect: success calls onContactLinked callback
- handleUnlinkFromProspect: success calls onContactUnlinked callback
- handleLogActivity: success calls onActivityLogged callback
- handleFetchActivities: success returns activities array
- handleFetchContactsForProspect: success returns contacts array
- Callback stability: handlers maintain reference stability

---

#### 7. useDealActions.test.ts
**Hook Path:** `apps/web/src/hooks/useDealActions.ts`

**Functions to test:**
- `handleFetchDeals`
- `handleFetchDeal`
- `handleFetchPipelineView`
- `handleFetchStages`
- `handleFetchStats`
- `handleCreateDeal`
- `handleUpdateDeal`
- `handleMoveToStage`
- `handleUploadDocument`
- `handleFetchDocuments`
- `handleFetchDocumentChecklist`
- `handleVerifyDocument`
- `handleDeleteDocument`

**Test scenarios:**
- Initial state: isLoading false, error null
- handleFetchDeals: success returns DealListResponse
- handleFetchDeal: success returns DealWithDocuments
- handleFetchPipelineView: success returns PipelineView
- handleFetchStages: success returns stages array
- handleFetchStats: success returns DealStats
- handleCreateDeal: success creates deal, calls onDealCreated callback, shows success toast
- handleUpdateDeal: success calls onDealUpdated callback
- handleMoveToStage: success calls onStageMoved callback
- handleUploadDocument: success calls onDocumentUploaded callback
- handleFetchDocuments: success returns documents array
- handleFetchDocumentChecklist: success returns checklist array
- handleVerifyDocument: success shows verification toast
- handleDeleteDocument: success calls onDocumentDeleted callback
- Error handling: all handlers set error state and show toast on failure
- Callback stability: handlers maintain reference stability

---

## Testing Patterns (from existing codebase)

### Mocking Strategy
```typescript
// Mock UI components from @public-records/ui/*
vi.mock('@public-records/ui/card', () => ({
  Card: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  // ... other card components
}))

// Mock Phosphor icons
vi.mock('@phosphor-icons/react', () => ({
  Phone: ({ className }: { className?: string }) => (
    <span data-testid="phone-icon" className={className} />
  ),
  // ... other icons
}))

// Mock API functions
vi.mock('@/lib/api/contacts', () => ({
  fetchContacts: vi.fn(),
  // ...
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))
```

### User Interaction Pattern
```typescript
const user = userEvent.setup()
await user.click(screen.getByRole('button', { name: /submit/i }))
await user.type(screen.getByPlaceholderText(/search/i), 'query')
```

### Hook Testing Pattern
```typescript
import { renderHook, act } from '@testing-library/react'

const { result } = renderHook(() => useContactActions({ orgId: 'test-org' }))

await act(async () => {
  await result.current.handleCreateContact({ first_name: 'John', last_name: 'Doe' })
})

expect(result.current.isLoading).toBe(false)
```

### Mock Data Pattern
```typescript
const mockContact: Contact = {
  id: 'contact-1',
  orgId: 'org-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '555-1234',
  preferredContactMethod: 'email',
  timezone: 'America/New_York',
  tags: [],
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}
```

## File Structure
```
apps/web/src/
├── components/
│   └── __tests__/
│       ├── ContactDetail.test.tsx   (NEW)
│       ├── DealPipeline.test.tsx    (NEW)
│       ├── DealDetail.test.tsx      (NEW)
│       ├── UnifiedInbox.test.tsx    (NEW)
│       └── AuditLogViewer.test.tsx  (NEW)
└── hooks/
    └── __tests__/
        ├── useContactActions.test.ts (NEW)
        └── useDealActions.test.ts    (NEW)
```

## Dependencies to Mock Per Test File

### Common Mocks (all component tests)
- `@public-records/ui/*` components
- `@phosphor-icons/react`
- `@public-records/ui/utils` (cn function)

### ContactDetail.test.tsx
- `@/components/shared/ActivityTimeline`

### DealPipeline.test.tsx
- None additional

### DealDetail.test.tsx
- `@/components/shared/ActivityTimeline`

### UnifiedInbox.test.tsx
- None additional

### AuditLogViewer.test.tsx
- None additional

### useContactActions.test.ts
- `sonner` (toast)
- `@/lib/api/contacts`

### useDealActions.test.ts
- `sonner` (toast)
- `@/lib/api/deals`

## Execution Order
1. Create mock data factory functions for reusable test data
2. Implement component tests in order: ContactDetail -> DealPipeline -> DealDetail -> UnifiedInbox -> AuditLogViewer
3. Implement hook tests: useContactActions -> useDealActions
4. Run tests to verify all pass
