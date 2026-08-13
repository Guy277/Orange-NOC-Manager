ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

UPDATE incidents
SET assigned_at = COALESCE(assigned_at, updated_at, created_at)
WHERE technician_id IS NOT NULL
  AND assigned_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'incidents_assigned_at_date_check'
  ) THEN
    ALTER TABLE incidents
    ADD CONSTRAINT incidents_assigned_at_date_check
    CHECK (assigned_at IS NULL OR assigned_at >= created_at);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_incidents_assigned_at ON incidents(assigned_at DESC);
