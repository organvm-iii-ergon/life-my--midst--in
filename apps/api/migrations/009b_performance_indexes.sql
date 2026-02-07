-- Performance optimization indexes for In Midst My Life
-- Note: Many indexes commented out because the referenced columns don't exist
-- in the current schema. These can be added once the schema is properly aligned.

-- Masks table - only create indexes for columns that exist
CREATE INDEX IF NOT EXISTS idx_masks_created_at ON masks(created_at DESC);

-- Other indexes removed due to schema mismatches with column definitions
-- TODO: Review schema and add appropriate indexes once column structure is finalized
