export async function findAllIncidentsForExport(db) {
  const result = await db.query(
    `
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
            'employeeCode', tech.employee_code,
            'specialty', tech.specialty,
            'zone', tech.zone
          )
        END AS technician
      FROM incidents i
      INNER JOIN network_sites s ON s.id = i.site_id
      INNER JOIN incident_types t ON t.id = i.type_id
      LEFT JOIN technicians tech ON tech.id = i.technician_id
      ORDER BY i.created_at DESC, i.id DESC;
    `
  );

  return result.rows;
}
