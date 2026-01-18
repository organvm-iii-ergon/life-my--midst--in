-- Subscriptions Table for Stripe Integration
-- Tracks recurring subscription status for each user

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  billing_interval VARCHAR(10), -- 'month' or 'year'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id
  ON subscriptions(profile_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id
  ON subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id
  ON subscriptions(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_tier
  ON subscriptions(tier);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Stripe Events Log (for idempotency)
CREATE TABLE IF NOT EXISTS stripe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR(255) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_stripe_events_event_id
  ON stripe_events(stripe_event_id);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type
  ON stripe_events(event_type);

CREATE INDEX IF NOT EXISTS idx_stripe_events_processed
  ON stripe_events(processed);

-- Comments for clarity
COMMENT ON TABLE subscriptions IS 'Tracks user subscriptions via Stripe';
COMMENT ON COLUMN subscriptions.profile_id IS 'Reference to user profile (one subscription per user)';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID (immutable)';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID (changes if subscription is recreated)';
COMMENT ON COLUMN subscriptions.tier IS 'Current subscription tier (FREE, PRO, ENTERPRISE)';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status from Stripe (active, canceled, past_due, etc.)';
COMMENT ON COLUMN subscriptions.cancel_at IS 'Timestamp when subscription will be canceled';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'If true, cancel at period end; otherwise cancel immediately';

COMMENT ON TABLE stripe_events IS 'Log of all Stripe webhook events for idempotency';
COMMENT ON COLUMN stripe_events.stripe_event_id IS 'Unique event ID from Stripe (prevents duplicates)';
COMMENT ON COLUMN stripe_events.processed IS 'Whether this event has been processed by the app';
