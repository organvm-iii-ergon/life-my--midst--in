# @in-midst-my-life/schema

[![npm version](https://img.shields.io/npm/v/@in-midst-my-life/schema.svg)](https://www.npmjs.com/package/@in-midst-my-life/schema)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Zod schemas and TypeScript types for the **in–midst–my-life** interactive CV system. This package provides a comprehensive type system for representing professional identities, profiles, masks (contextual presentations), epochs (time periods), and verification primitives.

## Installation

```bash
npm install @in-midst-my-life/schema zod
# or
pnpm add @in-midst-my-life/schema zod
# or
yarn add @in-midst-my-life/schema zod
```

> **Note**: `zod` is a peer dependency. You must install it alongside this package.

## Quick Start

```typescript
import { ProfileSchema, MaskSchema, type Profile, type Mask } from '@in-midst-my-life/schema';

// Validate profile data
const profile = ProfileSchema.parse({
  id: 'profile-123',
  identityId: 'identity-456',
  slug: 'jane-doe',
  displayName: 'Jane Doe',
  // ... other fields
});

// Type-safe mask creation
const mask: Mask = {
  id: 'mask-analyst',
  nomen: 'Analyst',
  emoji: '📊',
  description: 'Data-driven perspective',
  canonical: true,
  // ...
};
```

## Core Concepts

### Identity Model

The schema package implements a **theatrical identity model** where:

- **Identity** - The immutable core of who you are
- **Profile** - A complete professional profile (the "CV ledger")
- **Mask** - A contextual presentation (like a résumé for a specific audience)
- **Epoch/Aetas** - Time periods in your professional journey
- **Stage/Scaena** - Life domains (Technical, Academic, Artistic, Civic, Domestic, Hidden)

### Schema Categories

| Category | Description | Key Schemas |
|----------|-------------|-------------|
| **Identity** | Core identity primitives | `IdentitySchema`, `IdentityCoreSchema` |
| **Profile** | Complete professional profile | `ProfileSchema`, `ProfileSettingsSchema` |
| **Mask** | Contextual identity presentation | `MaskSchema`, `MaskTypeSchema` |
| **Temporal** | Time periods & lifecycle stages | `EpochSchema`, `AetasSchema` |
| **Spatial** | Life domains & stages | `StageSchema`, `ScaenaSchema` |
| **CV/Résumé** | Experience entries & blocks | `CVEntrySchema`, `CurriculumVitaeSchema` |
| **Narrative** | Story blocks & generation | `NarrativeBlockSchema`, `NarrativeTemplateSchema` |
| **Verification** | DIDs & Verifiable Credentials | `DIDDocumentSchema`, `VerifiableCredentialSchema` |
| **Collaboration** | Multi-user features | `CollaborationSessionSchema`, `CommentSchema` |
| **Billing** | Subscription & pricing | `SubscriptionSchema`, `InvoiceSchema` |

## API Reference

### Identity Schemas

```typescript
import {
  IdentitySchema,
  IdentityCoreSchema,
  ExternalIdSchema,
  type Identity,
  type IdentityCore
} from '@in-midst-my-life/schema';

// IdentityCore - Immutable identity properties
const core = IdentityCoreSchema.parse({
  given_name: 'Jane',
  family_name: 'Doe',
  thesis: 'Building tools that empower creators',
});

// Full Identity with external IDs
const identity = IdentitySchema.parse({
  id: 'identity-123',
  ...core,
  external_ids: [
    { system: 'github', value: 'janedoe' },
    { system: 'linkedin', value: 'jane-doe-123' },
  ],
});
```

### Profile Schemas

```typescript
import {
  ProfileSchema,
  ProfileVisibilitySchema,
  ProfileSettingsSchema,
  type Profile
} from '@in-midst-my-life/schema';

const profile = ProfileSchema.parse({
  id: 'profile-123',
  identityId: 'identity-123',
  slug: 'jane-doe',
  displayName: 'Jane Doe',
  visibility: 'public', // 'public' | 'unlisted' | 'private'
  summaryMarkdown: '# About Me\n\nSoftware engineer...',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Mask Schemas

```typescript
import {
  MaskSchema,
  MaskTypeSchema,
  type Mask
} from '@in-midst-my-life/schema';

// 15+ canonical mask types
const maskTypes = MaskTypeSchema.options;
// ['analyst', 'synthesist', 'artisan', 'architect', 'negotiator', ...]

const mask = MaskSchema.parse({
  id: 'mask-analyst',
  nomen: 'Analyst',
  everyday_name: 'The Data Person',
  emoji: '📊',
  description: 'Presents analytical and data-driven aspects',
  canonical: true,
  visibility_scope: ['Technica', 'Academica'],
});
```

### Temporal Schemas (Epochs & Aetas)

```typescript
import {
  EpochSchema,
  AetasSchema,
  type Epoch,
  type Aetas
} from '@in-midst-my-life/schema';

// Epoch - A defined time period
const epoch = EpochSchema.parse({
  id: 'epoch-startup',
  nomen: 'Startup Era',
  startDate: '2018-01-01',
  endDate: '2022-12-31',
  description: 'Building early-stage companies',
});

// Aetas - Life stage (Early Career, Mid Career, etc.)
const aetas = AetasSchema.parse({
  id: 'aetas-mid',
  nomen: 'Mid Career',
  age_range: '30-45',
  description: 'Established expertise, leadership roles',
});
```

### CV Entry Schemas

```typescript
import {
  CVEntrySchema,
  CVEntryTypeSchema,
  CurriculumVitaeSchema,
  type CVEntry
} from '@in-midst-my-life/schema';

const entry = CVEntrySchema.parse({
  id: 'entry-123',
  type: 'experience', // 'experience' | 'education' | 'certification' | ...
  title: 'Senior Software Engineer',
  organization: 'Acme Corp',
  startDate: '2020-01-15',
  endDate: null, // null = current
  description: 'Leading platform engineering team...',
  skills: ['typescript', 'kubernetes', 'postgresql'],
  priority: 85, // 0-100, higher = more important
});
```

### Narrative Schemas

```typescript
import {
  NarrativeBlockSchema,
  NarrativeTemplateSchema,
  type NarrativeBlock
} from '@in-midst-my-life/schema';

const block = NarrativeBlockSchema.parse({
  id: 'block-123',
  title: 'Technical Leadership',
  body: 'Led cross-functional teams to deliver...',
  weight: 80,
  theatrical_metadata: {
    scaena: 'Technica',
    mask_id: 'mask-architect',
    authentic_caveat: 'Emphasizes technical depth',
  },
});
```

### Verification Schemas

```typescript
import {
  DIDDocumentSchema,
  VerifiableCredentialSchema,
  AttestationBlockSchema,
  type DIDDocument,
  type VerifiableCredential
} from '@in-midst-my-life/schema';

// W3C DID Document
const did = DIDDocumentSchema.parse({
  '@context': ['https://www.w3.org/ns/did/v1'],
  id: 'did:web:example.com:users:jane',
  verificationMethod: [...],
  authentication: [...],
});
```

## Type Inference

All schemas export inferred TypeScript types:

```typescript
import {
  ProfileSchema,
  type Profile,  // Inferred from ProfileSchema
} from '@in-midst-my-life/schema';

// These are equivalent:
type ProfileFromSchema = z.infer<typeof ProfileSchema>;
type ProfileFromExport = Profile;
```

## Validation Helpers

```typescript
import { ProfileSchema } from '@in-midst-my-life/schema';

// Safe parsing (returns result object)
const result = ProfileSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // typed as Profile
} else {
  console.error(result.error.issues);
}

// Strict parsing (throws on invalid)
try {
  const profile = ProfileSchema.parse(data);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.error(e.issues);
  }
}
```

## Zod Re-export

For convenience, `z` is re-exported from the package:

```typescript
import { z, ProfileSchema } from '@in-midst-my-life/schema';

// Extend schemas
const ExtendedProfileSchema = ProfileSchema.extend({
  customField: z.string().optional(),
});
```

## Version Compatibility

| Schema Version | Zod Version | Node.js |
|----------------|-------------|---------|
| 0.1.x          | ^3.22.0     | >=18    |

## Contributing

See the main [in-midst-my-life repository](https://github.com/4jp/life-my--midst--in) for contribution guidelines.

## License

MIT © 4jp

## Related Packages

- `@in-midst-my-life/core` - Business logic and mask matching
- `@in-midst-my-life/content-model` - Narrative generation and transforms
