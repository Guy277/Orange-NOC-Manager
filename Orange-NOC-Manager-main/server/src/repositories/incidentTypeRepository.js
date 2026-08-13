export async function findIncidentTypes(db, filters, pagination) {
  const clauses = [];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(label ILIKE $${idx} OR description ILIKE $${idx})`);
  }

  if (filters.requiredSpecialty) {
    values.push(filters.requiredSpecialty);
    clauses.push(`required_specialty = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const [rows, total] = await Promise.all([
    db.query(
      `
        SELECT id, label, description, required_specialty AS "requiredSpecialty", created_at
        FROM incident_types
        ${whereClause}
        ORDER BY label ASC
        LIMIT $${limitIndex} OFFSET $${offsetIndex};
      `,
      [...values, pagination.limit, (pagination.page - 1) * pagination.limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM incident_types ${whereClause};`, values)
  ]);

  return { data: rows.rows, total: total.rows[0].total };
}

export async function findIncidentTypeById(db, typeId) {
  const result = await db.query(
    `
      SELECT id, label, description, required_specialty AS "requiredSpecialty", created_at
      FROM incident_types
      WHERE id = $1;
    `,
    [typeId]
  );

  return result.rows[0] || null;
}

export async function createIncidentTypeRecord(db, payload) {
  const result = await db.query(
    `
      INSERT INTO incident_types (label, description, required_specialty)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
    [payload.label, payload.description, payload.requiredSpecialty]
  );

  return result.rows[0].id;
}

export async function updateIncidentTypeRecord(db, typeId, payload) {
  const result = await db.query(
    `
      UPDATE incident_types
      SET
        label = $2,
        description = $3,
        required_specialty = $4
      WHERE id = $1
      RETURNING id;
    `,
    [typeId, payload.label, payload.description, payload.requiredSpecialty]
  );

  return result.rows[0]?.id ?? null;
}

export async function deleteIncidentTypeRecord(db, typeId) {
  const result = await db.query("DELETE FROM incident_types WHERE id = $1 RETURNING id;", [typeId]);
  return result.rows[0]?.id ?? null;
}

export async function countIncidentTypeUsage(db, typeId) {
  const result = await db.query("SELECT COUNT(*)::int AS incident_count FROM incidents WHERE type_id = $1;", [typeId]);
  return result.rows[0].incident_count;
}
