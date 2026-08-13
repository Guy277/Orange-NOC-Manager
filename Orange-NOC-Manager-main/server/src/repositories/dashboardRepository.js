import { openIncidentStatuses } from "../constants/incident.js";
import { buildIncidentWhere } from "./incidentRepository.js";

function buildDashboardFilters(filters) {
  return buildIncidentWhere(filters);
}

export async function getDashboardSummary(db, filters) {
  const { whereClause, values } = buildDashboardFilters(filters);
  const openStatusesIndex = values.length + 1;

  const result = await db.query(
    `
      SELECT
        COUNT(*)::int AS total_incidents,
        COUNT(*) FILTER (WHERE i.status = ANY($${openStatusesIndex}))::int AS open_incidents,
        COUNT(*) FILTER (WHERE i.priority = 'critical')::int AS critical_incidents,
        COUNT(*) FILTER (WHERE i.status IN ('resolved', 'closed'))::int AS resolved_incidents,
        COALESCE(
          ROUND(
            (
              AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at)) / 60)
              FILTER (WHERE i.resolved_at IS NOT NULL)
            )::numeric,
            2
          ),
          0
        ) AS average_resolution_minutes
      FROM incidents i
      INNER JOIN network_sites s ON s.id = i.site_id
      ${whereClause};
    `,
    [...values, openIncidentStatuses]
  );

  return result.rows[0];
}

export async function getIncidentsByType(db, filters) {
  const { whereClause, values } = buildDashboardFilters(filters);
  const result = await db.query(
    `
      SELECT
        t.id,
        t.label,
        COUNT(*)::int AS count
      FROM incidents i
      INNER JOIN incident_types t ON t.id = i.type_id
      INNER JOIN network_sites s ON s.id = i.site_id
      ${whereClause}
      GROUP BY t.id, t.label
      ORDER BY count DESC, t.label ASC;
    `,
    values
  );

  return result.rows;
}

export async function getIncidentsByStatus(db, filters) {
  const { whereClause, values } = buildDashboardFilters(filters);
  const result = await db.query(
    `
      SELECT
        i.status,
        COUNT(*)::int AS count
      FROM incidents i
      INNER JOIN network_sites s ON s.id = i.site_id
      ${whereClause}
      GROUP BY i.status
      ORDER BY count DESC, i.status ASC;
    `,
    values
  );

  return result.rows;
}

export async function getRecentIncidents(db, filters, limit) {
  const { whereClause, values } = buildDashboardFilters(filters);
  const limitIndex = values.length + 1;

  const result = await db.query(
    `
      SELECT
        i.id,
        i.reference,
        i.title,
        i.priority,
        i.status,
        i.created_at,
        s.name AS site_name,
        t.label AS type_label,
        tech.name AS technician_name
      FROM incidents i
      INNER JOIN network_sites s ON s.id = i.site_id
      INNER JOIN incident_types t ON t.id = i.type_id
      LEFT JOIN technicians tech ON tech.id = i.technician_id
      ${whereClause}
      ORDER BY i.created_at DESC, i.id DESC
      LIMIT $${limitIndex};
    `,
    [...values, limit]
  );

  return result.rows;
}

export async function getTechnicianPerformance(db, filters, limit) {
  const { whereClause, values } = buildDashboardFilters(filters);
  const limitIndex = values.length + 1;

  const result = await db.query(
    `
      SELECT
        tech.id,
        tech.name,
        tech.specialty,
        COUNT(DISTINCT i.id)::int AS assigned_incidents,
        COUNT(DISTINCT iv.id)::int AS interventions_count,
        COUNT(DISTINCT i.id) FILTER (WHERE i.status IN ('resolved', 'closed'))::int AS resolved_incidents
      FROM technicians tech
      LEFT JOIN incidents i ON i.technician_id = tech.id
      LEFT JOIN network_sites s ON s.id = i.site_id
      LEFT JOIN interventions iv ON iv.technician_id = tech.id AND iv.incident_id = i.id
      ${whereClause}
      GROUP BY tech.id, tech.name, tech.specialty
      ORDER BY interventions_count DESC, assigned_incidents DESC, tech.name ASC
      LIMIT $${limitIndex};
    `,
    [...values, limit]
  );

  return result.rows;
}
