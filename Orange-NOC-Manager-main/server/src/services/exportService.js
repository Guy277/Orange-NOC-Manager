import { create } from "xmlbuilder2";
import { pool } from "../db/pool.js";
import { findAllIncidentsForExport } from "../repositories/exportRepository.js";
import { getInterventionsByIncidentId } from "../repositories/incidentRepository.js";

export async function exportIncidentsXml() {
  const incidents = await findAllIncidentsForExport(pool);

  const incidentsWithInterventions = await Promise.all(
    incidents.map(async (incident) => ({
      ...incident,
      interventions: await getInterventionsByIncidentId(pool, incident.id)
    }))
  );

  const payload = {
    noc_export: {
      "@version": "1.0",
      export_date: new Date().toISOString(),
      incidents: {
        incident: incidentsWithInterventions.map((incident) => ({
          id: incident.id,
          reference: incident.reference,
          title: incident.title,
          description: incident.description,
          priority: incident.priority,
          status: incident.status,
          created_at: incident.created_at,
          updated_at: incident.updated_at,
          assigned_at: incident.assigned_at,
          resolved_at: incident.resolved_at,
          closed_at: incident.closed_at,
          type: incident.incident_type,
          site: incident.site,
          technician: incident.technician,
          interventions: {
            intervention: incident.interventions.map((intervention) => ({
              id: intervention.id,
              action: intervention.action,
              comment: intervention.comment,
              started_at: intervention.started_at,
              ended_at: intervention.ended_at,
              duration_minutes: intervention.duration_minutes,
              technician: intervention.technician
            }))
          }
        }))
      }
    }
  };

  return create(payload).end({ prettyPrint: true });
}
