# WORKSTREAM K: Capital Ops Implementation Plan

## Status Summary

| File | Status | Notes |
|------|--------|-------|
| `database/migrations/009_portfolio_health_history.sql` | COMPLETE | Already exists with full implementation |
| `database/migrations/009_down.sql` | COMPLETE | Already exists |
| `server/services/AlertService.ts` | COMPLETE | Already exists with full DEWS implementation |
| `server/integrations/ach/client.ts` | PENDING | Needs to be created |

## Analysis of Existing Files

### 009_portfolio_health_history.sql
Already implemented with:
- `portfolio_health_history` table with prospect_id, health_score, health_grade, factors JSONB, source, notes
- Indexes for prospect lookup, time-series queries (BRIN), score queries, grade distribution
- `calculate_health_grade()` function for A/B/C/D/F grading
- Trigger to auto-calculate health grade on insert
- Down migration provided

### AlertService.ts
Already implemented with:
- DEWS (Distressed Early Warning System) alert types: `health_drop`, `new_ucc`, `payment_missed`, `score_critical`, `trend_declining`
- Alert actions: `email`, `sms`, `webhook`, `in_app`
- Alert severity levels and status tracking
- Rule-based threshold checking
- Methods: `checkHealthThresholds()`, `createAlert()`, `getActiveAlerts()`, `acknowledgeAlert()`, `resolveAlert()`, `dismissAlert()`, `listAlerts()`, `saveRule()`, `recordHealthAndCheck()`
- Action execution (email, SMS, webhook stubs)

## Remaining Task: ACH Client Stub

### File Structure
Following the pattern established by `twilio` and `sendgrid` integrations:

```
server/integrations/ach/
  client.ts    <- Create this
  index.ts     <- Create for exports
```

### ACH Client Design

The ACH (Automated Clearing House) client will handle:
- ACH payment initiation for MCA repayments
- ACH debit authorization (daily/weekly splits)
- Payment status tracking
- Bank account validation (micro-deposits)
- Return/NSF handling

### Implementation Plan

1. **Create `server/integrations/ach/client.ts`**
   - Follow the pattern from `twilio/client.ts` and `sendgrid/client.ts`
   - Stub implementation with mock responses
   - Support common ACH providers: Dwolla, Stripe ACH, Plaid ACH, NACHA direct
   - Key methods:
     - `initiateDebit()` - Initiate ACH debit for repayment
     - `initiateCredit()` - Initiate ACH credit (funding)
     - `getTransferStatus()` - Check transfer status
     - `validateBankAccount()` - Micro-deposit verification
     - `cancelTransfer()` - Cancel pending transfer
     - `listTransfers()` - List transfers with filters

2. **Create `server/integrations/ach/index.ts`**
   - Export client and types

3. **Update `server/integrations/index.ts`**
   - Add ACH exports

### ACH Types to Define

```typescript
type ACHTransferType = 'debit' | 'credit'
type ACHTransferStatus = 'pending' | 'processing' | 'settled' | 'failed' | 'cancelled' | 'returned'
type ACHReturnCode = 'R01' | 'R02' | 'R03' | 'R04' | ... // NSF, account closed, etc.

interface ACHConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
  webhookSecret?: string
  defaultDescription?: string
}

interface ACHTransfer {
  id: string
  type: ACHTransferType
  amount: number // cents
  currency: 'USD'
  status: ACHTransferStatus
  sourceAccountId: string
  destinationAccountId: string
  description?: string
  metadata?: Record<string, unknown>
  returnCode?: ACHReturnCode
  estimatedSettlement?: string
  createdAt: string
  settledAt?: string
}

interface InitiateTransferOptions {
  type: ACHTransferType
  amount: number // cents
  sourceAccountId: string
  destinationAccountId: string
  description?: string
  metadata?: Record<string, unknown>
  idempotencyKey?: string
}

interface BankAccountValidation {
  accountId: string
  status: 'pending' | 'verified' | 'failed'
  microDeposits?: { amount1: number; amount2: number }
}
```

## Files to Create

1. `/Users/4jp/Workspace/public-record-data-scrapper/server/integrations/ach/client.ts`
2. `/Users/4jp/Workspace/public-record-data-scrapper/server/integrations/ach/index.ts`

## Files to Modify

1. `/Users/4jp/Workspace/public-record-data-scrapper/server/integrations/index.ts` - Add ACH export
