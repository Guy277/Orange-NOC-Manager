import { pool } from "../db/pool.js";
import { createIncident } from "./incidentService.js";
import { parseOrThrow } from "../utils/http.js";
import { createIncidentSchema } from "../validation/incidentSchemas.js";
import {
  findActiveTechnicianReferences,
  findActiveUsers,
  findAllIncidentTypeReferences,
  findAllSiteReferences
} from "../repositories/referenceRepository.js";

export async function getLegacyIncidentFormReferences() {
  const [users, sites, incidentTypes, technicians] = await Promise.all([
    findActiveUsers(pool),
    findAllSiteReferences(pool),
    findAllIncidentTypeReferences(pool),
    findActiveTechnicianReferences(pool)
  ]);

  return { users, sites, incidentTypes, technicians };
}

export async function submitLegacyIncidentForm(rawPayload) {
  const payload = parseOrThrow(
    createIncidentSchema,
    {
      ...rawPayload,
      technicianId: rawPayload.technicianId === "" ? null : rawPayload.technicianId
    },
    "Le formulaire contient des donnees invalides."
  );

  return createIncident(payload);
}
