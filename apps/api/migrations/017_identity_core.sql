-- Identity Core table
-- Stores the foundational philosophical identity invariants from IdentityCoreSchema.
-- Each profile can have one identity core record (persona principalis).

CREATE TABLE IF NOT EXISTS identity_core (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thesis TEXT NOT NULL CHECK (char_length(thesis) >= 10),
  invariants JSONB NOT NULL DEFAULT '[]',
  master_keywords JSONB NOT NULL DEFAULT '[]',
  intellectual_lineage JSONB NOT NULL DEFAULT '[]',
  strategic_differentiators JSONB NOT NULL DEFAULT '[]',
  tensions JSONB NOT NULL DEFAULT '[]',
  constraints JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

CREATE INDEX IF NOT EXISTS idx_identity_core_profile_id ON identity_core(profile_id);
