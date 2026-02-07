-- Admin configuration seeds
-- System-wide settings for interview scoring, hunter protocol, and general config.
-- ON CONFLICT DO NOTHING ensures idempotent re-runs.

INSERT INTO settings (key, value, scope) VALUES
  ('interview.scoringWeights', '{"skillMatch":1,"valuesAlign":1,"growthFit":1,"sustainability":1,"compensationFit":1}', 'system'),
  ('interview.gapThreshold', '65', 'system'),
  ('interview.maxFollowUps', '3', 'system'),
  ('hunter.enabledProviders', '["serper"]', 'system'),
  ('system.jwtLifetimeMinutes', '60', 'system'),
  ('system.rateLimitPerMinute', '100', 'system')
ON CONFLICT DO NOTHING;
