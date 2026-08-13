export async function findSites(db, filters, pagination) {
  const clauses = [];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const idx = values.length;
    clauses.push(`(code ILIKE $${idx} OR name ILIKE $${idx})`);
  }

  if (filters.region) {
    values.push(filters.region);
    clauses.push(`region = $${values.length}`);
  }

  if (filters.city) {
    values.push(filters.city);
    clauses.push(`city = $${values.length}`);
  }

  if (filters.siteType) {
    values.push(filters.siteType);
    clauses.push(`site_type = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const [rows, total] = await Promise.all([
    db.query(
      `
        SELECT id, code, name, city, region, site_type AS "siteType", created_at
        FROM network_sites
        ${whereClause}
        ORDER BY name ASC
        LIMIT $${limitIndex} OFFSET $${offsetIndex};
      `,
      [...values, pagination.limit, (pagination.page - 1) * pagination.limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM network_sites ${whereClause};`, values)
  ]);

  return { data: rows.rows, total: total.rows[0].total };
}

export async function findSiteById(db, siteId) {
  const result = await db.query(
    `
      SELECT id, code, name, city, region, site_type AS "siteType", created_at
      FROM network_sites
      WHERE id = $1;
    `,
    [siteId]
  );

  return result.rows[0] || null;
}

export async function createSiteRecord(db, payload) {
  const result = await db.query(
    `
      INSERT INTO network_sites (code, name, city, region, site_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `,
    [payload.code, payload.name, payload.city, payload.region, payload.siteType]
  );

  return result.rows[0].id;
}

export async function updateSiteRecord(db, siteId, payload) {
  const result = await db.query(
    `
      UPDATE network_sites
      SET
        code = $2,
        name = $3,
        city = $4,
        region = $5,
        site_type = $6
      WHERE id = $1
      RETURNING id;
    `,
    [siteId, payload.code, payload.name, payload.city, payload.region, payload.siteType]
  );

  return result.rows[0]?.id ?? null;
}

export async function deleteSiteRecord(db, siteId) {
  const result = await db.query("DELETE FROM network_sites WHERE id = $1 RETURNING id;", [siteId]);
  return result.rows[0]?.id ?? null;
}

export async function countSiteUsage(db, siteId) {
  const result = await db.query("SELECT COUNT(*)::int AS incident_count FROM incidents WHERE site_id = $1;", [siteId]);
  return result.rows[0].incident_count;
}
