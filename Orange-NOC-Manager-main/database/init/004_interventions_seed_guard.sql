WITH ranked_interventions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY incident_id, technician_id, action, comment, started_at
      ORDER BY id
    ) AS row_number
  FROM interventions
)
DELETE FROM interventions
WHERE id IN (
  SELECT id
  FROM ranked_interventions
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_interventions_seed_guard
ON interventions (incident_id, technician_id, action, comment, started_at);
