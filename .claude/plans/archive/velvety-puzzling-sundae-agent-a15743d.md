# ACH Integration Stub Implementation Plan

## Overview

Create an ACH integration stub for MCA Platform Phase 2, following the established patterns from the existing Twilio and SendGrid integrations.

## Files to Create

### 1. `server/integrations/ach/client.ts`

The main ACH client following the class-based pattern with:
- `ACHConfig` interface for configuration (apiKey, merchantId, environment)
- `ACHStatus` type union for transaction statuses
- `ACHResponse<T>` interface for API responses (consistent with other integrations)
- `ACHClient` class with:
  - Constructor accepting optional custom config
  - Config loaded from environment variables (fallback to stub mode)
  - `initialize()` method
  - `isConfigured()` method
  - Core transaction methods:
    - `initiateDebit(amount, accountId)` - returns transaction ID
    - `initiateCredit(amount, accountId)` - returns transaction ID
    - `checkStatus(transactionId)` - returns ACHStatus
    - `cancelTransaction(transactionId)` - void
    - `validateAccount(routingNumber, accountNumber)` - returns boolean
  - Stub response generation for dev/testing
  - Transaction ID generation (ACH-style prefix)
- Singleton export `achClient`

**Environment variables:**
- `ACH_API_KEY` - API key for Actum/ACH Works
- `ACH_MERCHANT_ID` - Merchant identifier
- `ACH_ENVIRONMENT` - 'sandbox' | 'production'
- `ACH_WEBHOOK_BASE_URL` - Optional webhook URL

### 2. `server/integrations/ach/index.ts`

Module exports following the same pattern:
- Export `ACHClient` class and `achClient` singleton
- Export all types (`ACHConfig`, `ACHResponse`, `ACHStatus`)
- Export helper functions

### 3. Update `server/integrations/index.ts`

Add ACH module exports:
```typescript
// ACH (Payment Processing)
export * from './ach'
```

## Implementation Details

### ACHClient Class Structure

```typescript
export class ACHClient {
  private config: ACHConfig
  private initialized: boolean = false

  constructor(customConfig?: Partial<ACHConfig>)
  async initialize(): Promise<void>
  isConfigured(): boolean
  getEnvironment(): 'sandbox' | 'production'
  getMerchantId(): string

  // Transaction methods
  async initiateDebit(amount: number, accountId: string): Promise<string>
  async initiateCredit(amount: number, accountId: string): Promise<string>
  async checkStatus(transactionId: string): Promise<ACHStatus>
  async cancelTransaction(transactionId: string): Promise<void>
  async validateAccount(routingNumber: string, accountNumber: string): Promise<boolean>

  // Private helpers
  private generateTransactionId(): string
  private validateRoutingNumber(routing: string): boolean
}
```

### Stub Mode Behavior

When not configured (missing credentials):
- Log warnings indicating stub mode
- Return mock transaction IDs
- `checkStatus` returns 'pending' then 'completed' pattern
- `validateAccount` returns true for valid-looking formats
- All methods log their calls for debugging

## Execution Order

1. Create `server/integrations/ach/` directory (if needed)
2. Create `server/integrations/ach/client.ts`
3. Create `server/integrations/ach/index.ts`
4. Update `server/integrations/index.ts`

## Verification

After implementation:
- TypeScript compilation check (`npm run build`)
- Verify exports are accessible from main integrations module
