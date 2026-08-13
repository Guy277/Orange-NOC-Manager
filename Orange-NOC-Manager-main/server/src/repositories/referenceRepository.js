export async function findUserById(db, userId) {
  const result = await db.query(
    `
      SELECT id, name, email, role, is_active AS "isActive"
      FROM users
      WHERE id = $1;
    `,
    [userId]
  );

  return result.rows[0] || null;
}

export async function findSiteReferenceById(db, siteId) {
  const result = await db.query(
    `
      SELECT id, code, name, city, region, site_type AS "siteType"
      FROM network_sites
      WHERE id = $1;
    `,
    [siteId]
  );

  return result.rows[0] || null;
}

export async function findIncidentTypeReferenceById(db, typeId) {
  const result = await db.query(
    `
      SELECT id, label, description, required_specialty AS "requiredSpecialty"
      FROM incident_types
      WHERE id = $1;
    `,
    [typeId]
  );

  return result.rows[0] || null;
}

export async function findTechnicianReferenceById(db, technicianId) {
  const result = await db.query(
    `
      SELECT id, name, email, employee_code AS "employeeCode", specialty, zone, is_active AS "isActive"
      FROM technicians
      WHERE id = $1;
    `,
    [technicianId]
  );

  return result.rows[0] || null;
}

export async function findActiveUsers(db) {
  const result = await db.query(
    `
      SELECT id, name, email, role
      FROM users
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `
  );

  return result.rows;
}

export async function findAllSiteReferences(db) {
  const result = await db.query(
    `
      SELECT id, code, name, city, region, site_type AS "siteType"
      FROM network_sites
      ORDER BY name ASC;
    `
  );

  return result.rows;
}

export async function findAllIncidentTypeReferences(db) {
  const result = await db.query(
    `
      SELECT id, label, description, required_specialty AS "requiredSpecialty"
      FROM incident_types
      ORDER BY label ASC;
    `
  );

  return result.rows;
}

export async function findActiveTechnicianReferences(db) {
  const result = await db.query(
    `
      SELECT id, name, email, employee_code AS "employeeCode", specialty, zone, is_active AS "isActive"
      FROM technicians
      WHERE is_active = TRUE
      ORDER BY name ASC;
    `
  );

  return result.rows;
}
