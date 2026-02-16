-- Settings table: key-value store for system and per-user configuration
-- scope = 'system' for global admin settings, 'user' for per-profile settings
CREATE TABLE IF NOT EXISTS settings (
  id          SERIAL      PRIMARY KEY,
  key         TEXT        NOT NULL,
  value       JSONB       NOT NULL DEFAULT '{}',
  scope       TEXT        NOT NULL DEFAULT 'system' CHECK (scope IN ('system', 'user')),
  profile_id  UUID        REFERENCES profiles(id) ON DELETE CASCADE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  TEXT
);

-- Functional unique index handles NULL profile_id via COALESCE sentinel
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key_scope_profile
  ON settings (key, scope, COALESCE(profile_id, '00000000-0000-0000-0000-000000000000'));

-- Index for fast per-profile lookups
CREATE INDEX IF NOT EXISTS idx_settings_profile ON settings (profile_id) WHERE profile_id IS NOT NULL;

-- Seed default system settings (idempotent)
INSERT INTO settings (key, value, scope) VALUES
  ('feature.hunter_protocol', '"enabled"', 'system'),
  ('feature.inverted_interviews', '"enabled"', 'system'),
  ('feature.mask_editor', '"enabled"', 'system'),
  ('feature.did_verification', '"enabled"', 'system'),
  ('feature.autonomous_agents', '"disabled"', 'system'),
  ('maintenance_mode', 'false', 'system')
ON CONFLICT DO NOTHING;
