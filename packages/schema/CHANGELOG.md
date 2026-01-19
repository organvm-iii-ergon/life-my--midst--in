# Changelog

All notable changes to `@in-midst-my-life/schema` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Prepared package for npm publishing with dual ESM/CJS exports
- Comprehensive README with API documentation
- MIT License file
- tsup build configuration

### Changed
- Moved `zod` from dependencies to peerDependencies (consumers control version)

## [0.1.0] - 2026-01-19

### Added

#### Identity & Profile
- `IdentitySchema` - Core identity with external IDs
- `IdentityCoreSchema` - Immutable identity properties (name, thesis)
- `ProfileSchema` - Complete professional profile
- `ProfileVisibilitySchema` - Public/unlisted/private visibility
- `ProfileSettingsSchema` - User preferences and settings

#### Masks (Contextual Presentation)
- `MaskSchema` - Identity mask definition
- `MaskTypeSchema` - 15+ canonical mask types (analyst, synthesist, artisan, etc.)
- `TabulaPersonarumEntrySchema` - Persona registry entry

#### Temporal (Time Periods)
- `EpochSchema` - Defined time periods in career
- `AetasSchema` - Life stages (early/mid/late career)
- `TimelineEventSchema` - Timeline entry with epoch reference

#### Spatial (Life Domains)
- `StageSchema` - Career stages
- `ScaenaSchema` - Life domains (Technica, Academica, Artistica, Civica, Domestica, Occulta)
- `CanonicalScaenaType` - 6 canonical stage types

#### CV & Experience
- `CVEntrySchema` - Individual CV entry
- `CVEntryTypeSchema` - Entry types (experience, education, certification, etc.)
- `CurriculumVitaeSchema` - Full CV with entries
- `CVFilterSchema` - Filtering and search criteria

#### Narrative Generation
- `NarrativeBlockSchema` - Story block with theatrical metadata
- `NarrativeTemplateSchema` - Generation templates
- `TheatricalMetadataSchema` - Mask, scaena, and performance annotations

#### Verification (DIDs & VCs)
- `DIDDocumentSchema` - W3C DID Document
- `VerifiableCredentialSchema` - W3C Verifiable Credential
- `AttestationBlockSchema` - Attestation with verification status
- `AttestationStatusSchema` - self_attested/verified/revoked

#### Collaboration
- `CollaborationSessionSchema` - Multi-user editing session
- `CommentSchema` - Inline comments and feedback
- `SuggestionSchema` - Edit suggestions

#### Agents & Automation
- `AgentDefinitionSchema` - Agent configuration
- `AgentResponseSchema` - Structured agent output
- `AgentRegistrySchema` - Available agents catalog

#### Jobs & Hunter Protocol
- `JobSchema` - Job posting
- `ApplicationSchema` - Job application
- `JobSearchCriteriaSchema` - Search parameters
- `CoverLetterSchema` - Generated cover letters

#### Billing
- `SubscriptionSchema` - User subscription
- `InvoiceSchema` - Billing invoice
- `BillingIntervalSchema` - month/year billing cycles

#### Artifacts
- `ArtifactSchema` - Document/file metadata
- `ArtifactTypeSchema` - Type classification
- `ArtifactSyncStateSchema` - Cloud sync status

### Technical
- Full TypeScript support with inferred types
- Zod v3.22+ compatibility
- ESM and CommonJS dual exports
- Tree-shakeable structure

---

## Pre-release Notes

This package is currently in **pre-1.0** status (version 0.x.x):

- **Breaking changes** may occur in minor version bumps
- **Pin exact versions** in production: `"@in-midst-my-life/schema": "0.1.0"`
- See ADR-016 in the main repository for versioning policy

### 1.0 Promotion Criteria

The package will be promoted to 1.0.0 when:
- [ ] All core entities stabilized (no breaking changes for 2+ weeks)
- [ ] 90%+ test coverage achieved
- [ ] Integration tests cover serialization/deserialization
- [ ] At least one production deployment validated

---

[Unreleased]: https://github.com/4jp/life-my--midst--in/compare/schema-v0.1.0...HEAD
[0.1.0]: https://github.com/4jp/life-my--midst--in/releases/tag/schema-v0.1.0
