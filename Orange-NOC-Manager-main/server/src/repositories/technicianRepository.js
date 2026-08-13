export async function findTechnicians(db, filters, pagination) {
  const clauses = [];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR employee_code ILIKE $${idx})`);
  }

  if (filters.specialty) {
    values.push(filters.specialty);
    clauses.push(`specialty = $${values.length}`);
  }

  if (filters.zone) {
    values.push(filters.zone);
    clauses.push(`zone = $${values.length}`);
  }

  if (typeof filters.active === "boolean") {
    values.push(filters.active);
    clauses.push(`is_active = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const [rows, total] = await Promise.all([
    db.query(
      `
        SELECT id, name, email, employee_code AS "employeeCode", specialty, zone, is_active AS "isActive", created_at
        FROM technicians
        ${whereClause}
        ORDER BY name ASC
        LIMIT $${limitIndex} OFFSET $${offsetIndex};
      `,
      [...values, pagination.limit, (pagination.page - 1) * pagination.limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM technicians ${whereClause};`, values)
  ]);

  return { data: rows.rows, total: total.rows[0].total };
}

export async function findTechnicianById(db, technicianId) {
  const result = await db.query(
    `
      SELECT id, name, email, employee_code AS "employeeCode", specialty, zone, is_active AS "isActive", created_at
      FROM technicians
      WHERE id = $1;
    `,
    [technicianId]
  );

  return result.rows[0] || null;
}

export async function createTechnicianRecord(db, payload) {
  const result = await db.query(
    `
      INSERT INTO technicians (name, email, employee_code, specialty, zone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `,
    [payload.name, payload.email, payload.employeeCode, payload.specialty, payload.zone, payload.isActive]
  );

  return result.rows[0].id;
}

export async function updateTechnicianRecord(db, technicianId, payload) {
  const result = await db.query(
    `
      UPDATE technicians
      SET
        name = $2,
        email = $3,
        employee_code = $4,
        specialty = $5,
        zone = $6,
        is_active = $7
      WHERE id = $1
      RETURNING id;
    `,
    [technicianId, payload.name, payload.email, payload.employeeCode, payload.specialty, payload.zone, payload.isActive]
  );

  return result.rows[0]?.id ?? null;
}

export async function deleteTechnicianRecord(db, technicianId) {
  const result = await db.query("DELETE FROM technicians WHERE id = $1 RETURNING id;", [technicianId]);
  return result.rows[0]?.id ?? null;
}

export async function countTechnicianUsage(db, technicianId) {
  const result = await db.query(
    `
      SELECT
        (SELECT COUNT(*)::int FROM incidents WHERE technician_id = $1) AS incident_count,
        (SELECT COUNT(*)::int FROM interventions WHERE technician_id = $1) AS intervention_count;
    `,
    [technicianId]
  );

  return result.rows[0];
}
