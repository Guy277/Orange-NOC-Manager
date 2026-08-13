export async function findLogs(db, filters, pagination) {
  const clauses = [];
  const values = [];

  if (filters.action) {
    values.push(filters.action);
    clauses.push(`action = $${values.length}`);
  }

  if (filters.tableName) {
    values.push(filters.tableName);
    clauses.push(`table_name = $${values.length}`);
  }

  if (filters.recordId) {
    values.push(filters.recordId);
    clauses.push(`record_id = $${values.length}`);
  }

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`changed_at >= $${values.length}`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`changed_at <= $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const [rows, total] = await Promise.all([
    db.query(
      `
        SELECT id, table_name AS "tableName", record_id AS "recordId", action, old_data AS "oldData", new_data AS "newData", changed_at AS "changedAt", db_user AS "dbUser"
        FROM logs
        ${whereClause}
        ORDER BY changed_at DESC, id DESC
        LIMIT $${limitIndex} OFFSET $${offsetIndex};
      `,
      [...values, pagination.limit, (pagination.page - 1) * pagination.limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM logs ${whereClause};`, values)
  ]);

  return { data: rows.rows, total: total.rows[0].total };
}

export async function findLogsByIncidentId(db, incidentId) {
  const result = await db.query(
    `
      SELECT id, table_name AS "tableName", record_id AS "recordId", action, old_data AS "oldData", new_data AS "newData", changed_at AS "changedAt", db_user AS "dbUser"
      FROM logs
      WHERE table_name = 'incidents' AND record_id = $1
      ORDER BY changed_at DESC, id DESC;
    `,
    [incidentId]
  );

  return result.rows;
}
