export async function createInterventionRecord(db, payload) {
  const query = `
    INSERT INTO interventions (incident_id, technician_id, action, comment, started_at, ended_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `;

  const result = await db.query(query, [
    payload.incidentId,
    payload.technicianId,
    payload.action,
    payload.comment,
    payload.startedAt,
    payload.endedAt
  ]);

  return result.rows[0].id;
}

export async function findInterventionById(db, interventionId) {
  const query = `
    SELECT
      iv.id,
      iv.incident_id,
      iv.technician_id,
      iv.action,
      iv.comment,
      iv.started_at,
      iv.ended_at,
      iv.duration_minutes
    FROM interventions iv
    WHERE iv.id = $1;
  `;

  const result = await db.query(query, [interventionId]);
  return result.rows[0] || null;
}

export async function updateInterventionRecord(db, interventionId, payload) {
  const query = `
    UPDATE interventions
    SET
      technician_id = $2,
      action = $3,
      comment = $4,
      started_at = $5,
      ended_at = $6
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [
    interventionId,
    payload.technicianId,
    payload.action,
    payload.comment,
    payload.startedAt,
    payload.endedAt
  ]);

  return result.rows[0]?.id ?? null;
}

export async function deleteInterventionRecord(db, interventionId) {
  const result = await db.query("DELETE FROM interventions WHERE id = $1 RETURNING id;", [interventionId]);
  return result.rows[0]?.id ?? null;
}
