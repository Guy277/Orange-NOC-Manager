const incidentSelect = `
  SELECT
    i.id,
    i.reference,
    i.title,
    i.description,
    i.priority,
    i.status,
    i.created_at,
    i.updated_at,
    i.assigned_at,
    i.resolved_at,
    i.closed_at,
    json_build_object(
      'id', s.id,
      'code', s.code,
      'name', s.name,
      'city', s.city,
      'region', s.region,
      'siteType', s.site_type
    ) AS site,
    json_build_object(
      'id', t.id,
      'label', t.label,
      'description', t.description,
      'requiredSpecialty', t.required_specialty
    ) AS incident_type,
    CASE
      WHEN tech.id IS NULL THEN NULL
      ELSE json_build_object(
        'id', tech.id,
        'name', tech.name,
        'email', tech.email,
        'specialty', tech.specialty,
        'zone', tech.zone,
        'isActive', tech.is_active
      )
    END AS technician,
    json_build_object(
      'id', u.id,
      'name', u.name,
      'email', u.email,
      'role', u.role
    ) AS created_by
  FROM incidents i
  INNER JOIN network_sites s ON s.id = i.site_id
  INNER JOIN incident_types t ON t.id = i.type_id
  LEFT JOIN technicians tech ON tech.id = i.technician_id
  INNER JOIN users u ON u.id = i.created_by
`;

export function buildIncidentWhere(filters) {
  const clauses = [];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(i.reference ILIKE $${idx} OR i.title ILIKE $${idx} OR i.description ILIKE $${idx})`);
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`i.status = $${values.length}`);
  }

  if (filters.priority) {
    values.push(filters.priority);
    clauses.push(`i.priority = $${values.length}`);
  }

  if (filters.siteId) {
    values.push(filters.siteId);
    clauses.push(`i.site_id = $${values.length}`);
  }

  if (filters.typeId) {
    values.push(filters.typeId);
    clauses.push(`i.type_id = $${values.length}`);
  }

  if (filters.technicianId) {
    values.push(filters.technicianId);
    clauses.push(`i.technician_id = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`i.created_at >= $${values.length}`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`i.created_at <= $${values.length}`);
  }

  if (filters.region) {
    values.push(filters.region);
    clauses.push(`s.region = $${values.length}`);
  }

  return {
    whereClause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    values
  };
}

export async function findIncidents(db, filters, pagination) {
  const { whereClause, values } = buildIncidentWhere(filters);
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;
  const listValues = [...values, pagination.limit, (pagination.page - 1) * pagination.limit];

  const listQuery = `
    SELECT
      i.id,
      i.reference,
      i.title,
      i.priority,
      i.status,
      i.created_at,
      i.updated_at,
      i.assigned_at,
      i.resolved_at,
      s.id AS site_id,
      s.code AS site_code,
      s.name AS site_name,
      t.id AS type_id,
      t.label AS type_label,
      tech.id AS technician_id,
      tech.name AS technician_name
    FROM incidents i
    INNER JOIN network_sites s ON s.id = i.site_id
    INNER JOIN incident_types t ON t.id = i.type_id
    LEFT JOIN technicians tech ON tech.id = i.technician_id
    ${whereClause}
    ORDER BY i.created_at DESC, i.id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM incidents i
    INNER JOIN network_sites s ON s.id = i.site_id
    ${whereClause};
  `;

  const [rows, count] = await Promise.all([
    db.query(listQuery, listValues),
    db.query(countQuery, values)
  ]);

  return {
    data: rows.rows,
    total: count.rows[0].total
  };
}

export async function findIncidentById(db, incidentId) {
  const query = `
    ${incidentSelect}
    WHERE i.id = $1;
  `;

  const result = await db.query(query, [incidentId]);
  return result.rows[0] || null;
}

export async function createIncidentRecord(db, payload) {
  const query = `
    INSERT INTO incidents (
      reference,
      title,
      description,
      priority,
      status,
      site_id,
      type_id,
      technician_id,
      created_by,
      assigned_at,
      resolved_at,
      closed_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id;
  `;

  const result = await db.query(query, [
    payload.reference,
    payload.title,
    payload.description,
    payload.priority,
    payload.status,
    payload.siteId,
    payload.typeId,
    payload.technicianId,
    payload.createdBy,
    payload.assignedAt,
    payload.resolvedAt,
    payload.closedAt
  ]);

  return result.rows[0].id;
}

export async function updateIncidentRecord(db, incidentId, payload) {
  const query = `
    UPDATE incidents
    SET
      title = $2,
      description = $3,
      priority = $4,
      site_id = $5,
      type_id = $6,
      technician_id = $7,
      assigned_at = $8,
      resolved_at = $9,
      closed_at = $10,
      status = $11
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [
    incidentId,
    payload.title,
    payload.description,
    payload.priority,
    payload.siteId,
    payload.typeId,
    payload.technicianId,
    payload.assignedAt,
    payload.resolvedAt,
    payload.closedAt,
    payload.status
  ]);

  return result.rows[0]?.id ?? null;
}

export async function updateIncidentStatusRecord(db, incidentId, payload) {
  const query = `
    UPDATE incidents
    SET
      status = $2,
      resolved_at = $3,
      closed_at = $4
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [
    incidentId,
    payload.status,
    payload.resolvedAt,
    payload.closedAt
  ]);

  return result.rows[0]?.id ?? null;
}

export async function updateIncidentAssignmentRecord(db, incidentId, payload) {
  const query = `
    UPDATE incidents
    SET
      technician_id = $2,
      assigned_at = $3,
      status = $4
    WHERE id = $1
    RETURNING id;
  `;

  const result = await db.query(query, [
    incidentId,
    payload.technicianId,
    payload.assignedAt,
    payload.status
  ]);

  return result.rows[0]?.id ?? null;
}

export async function deleteIncidentRecord(db, incidentId) {
  const result = await db.query("DELETE FROM incidents WHERE id = $1 RETURNING id;", [incidentId]);
  return result.rows[0]?.id ?? null;
}

export async function getInterventionsByIncidentId(db, incidentId) {
  const query = `
    SELECT
      iv.id,
      iv.incident_id,
      iv.action,
      iv.comment,
      iv.started_at,
      iv.ended_at,
      iv.duration_minutes,
      json_build_object(
        'id', tech.id,
        'name', tech.name,
        'specialty', tech.specialty,
        'isActive', tech.is_active
      ) AS technician
    FROM interventions iv
    INNER JOIN technicians tech ON tech.id = iv.technician_id
    WHERE iv.incident_id = $1
    ORDER BY iv.started_at DESC, iv.id DESC;
  `;

  const result = await db.query(query, [incidentId]);
  return result.rows;
}
