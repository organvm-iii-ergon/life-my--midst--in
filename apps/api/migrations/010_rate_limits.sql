-- Rate Limits Table for Feature Gate Enforcement
-- Tracks per-user, per-feature usage within billing periods

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature VARCHAR(255) NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP NOT NULL DEFAULT NOW(),
  period_end TIMESTAMP NOT NULL DEFAULT NOW() + INTERVAL '1 month',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, feature)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_profile_feature
  ON rate_limits(profile_id, feature);

CREATE INDEX IF NOT EXISTS idx_rate_limits_period_end
  ON rate_limits(period_end);

-- Note: Partial index with NOW() removed because NOW() is not IMMUTABLE
-- Use application-level filtering for active rate limits instead
CREATE INDEX IF NOT EXISTS idx_rate_limits_profile_period
  ON rate_limits(profile_id, period_end);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS rate_limits_updated_at ON rate_limits;
CREATE TRIGGER rate_limits_updated_at
BEFORE UPDATE ON rate_limits
FOR EACH ROW
EXECUTE FUNCTION update_rate_limits_updated_at();

-- Comments for clarity
COMMENT ON TABLE rate_limits IS 'Tracks feature usage per user per billing period for rate limiting and quota enforcement';
COMMENT ON COLUMN rate_limits.profile_id IS 'Reference to user profile';
COMMENT ON COLUMN rate_limits.feature IS 'Feature key (e.g., hunter_job_searches, resume_tailoring)';
COMMENT ON COLUMN rate_limits.used IS 'Current usage count in the period';
COMMENT ON COLUMN rate_limits.period_start IS 'Start of current billing period';
COMMENT ON COLUMN rate_limits.period_end IS 'End of current billing period - after this date, usage resets';
