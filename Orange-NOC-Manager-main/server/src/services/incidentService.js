import { AppError } from "../errors/AppError.js";
import { pool } from "../db/pool.js";
import { withTransaction } from "../db/transaction.js";
import {
  createIncidentRecord,
  deleteIncidentRecord,
  findIncidentById,
  findIncidents,
  getInterventionsByIncidentId,
  updateIncidentAssignmentRecord,
  updateIncidentRecord,
  updateIncidentStatusRecord
} from "../repositories/incidentRepository.js";
import {
  findIncidentTypeReferenceById,
  findSiteReferenceById,
  findTechnicianReferenceById,
  findUserById
} from "../repositories/referenceRepository.js";

function generateIncidentReference() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const suffix = String(now.getTime()).slice(-6);
  return `INC-${y}${m}${d}-${suffix}`;
}

async function requireIncident(db, incidentId) {
  const incident = await findIncidentById(db, incidentId);

  if (!incident) {
    throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident introuvable.");
  }

  return incident;
}

async function requireReferences(db, payload, existingIncident = null) {
  const siteId = payload.siteId ?? existingIncident.site.id;
  const typeId = payload.typeId ?? existingIncident.incident_type.id;
  const technicianId = payload.technicianId === undefined ? existingIncident?.technician?.id ?? null : payload.technicianId;

  const site = await findSiteReferenceById(db, siteId);
  const incidentType = await findIncidentTypeReferenceById(db, typeId);
  const technician = technicianId ? await findTechnicianReferenceById(db, technicianId) : null;

  if (!site) {
    throw new AppError(409, "SITE_REFERENCE_INVALID", "Le site reseau reference n'existe pas.");
  }

  if (!incidentType) {
    throw new AppError(409, "INCIDENT_TYPE_REFERENCE_INVALID", "Le type d'incident reference n'existe pas.");
  }

  if (technicianId && !technician) {
    throw new AppError(409, "TECHNICIAN_REFERENCE_INVALID", "Le technicien reference n'existe pas.");
  }

  if (technician && !technician.isActive) {
    throw new AppError(409, "TECHNICIAN_INACTIVE", "Le technicien selectionne est inactif.");
  }

  if (technician && technician.specialty !== incidentType.requiredSpecialty) {
    throw new AppError(
      409,
      "TECHNICIAN_SPECIALTY_MISMATCH",
      "La specialite du technicien est incompatible avec ce type d'incident."
    );
  }

  return { site, incidentType, technician };
}

function applyStatusRules(currentIncident, nextStatus, technicianId) {
  const currentStatus = currentIncident?.status ?? null;
  const hasTechnician = Boolean(technicianId);
  const isClosed = currentStatus === "closed";
  const reopening = ["reported", "qualified", "assigned", "in_progress", "cancelled"].includes(nextStatus);

  if (nextStatus === "in_progress" && !hasTechnician) {
    throw new AppError(
      409,
      "TECHNICIAN_REQUIRED",
      "Un technicien doit etre affecte avant le passage en cours."
    );
  }

  if (isClosed && currentStatus === "closed" && nextStatus === "closed") {
    return {
      status: nextStatus,
      resolvedAt: currentIncident.resolved_at,
      closedAt: currentIncident.closed_at
    };
  }

  let resolvedAt = currentIncident?.resolved_at ?? null;
  let closedAt = currentIncident?.closed_at ?? null;

  if (nextStatus === "resolved" || nextStatus === "closed") {
    resolvedAt = resolvedAt || new Date().toISOString();
  }

  if (nextStatus === "closed") {
    closedAt = new Date().toISOString();
  }

  if (reopening) {
    resolvedAt = null;
    closedAt = null;
  }

  return {
    status: nextStatus,
    resolvedAt,
    closedAt
  };
}

function mapPgError(error) {
  if (error?.code === "23505") {
    throw new AppError(409, "UNIQUE_CONSTRAINT_VIOLATION", "Une ressource avec ces informations existe deja.");
  }

  if (error?.code === "23503") {
    throw new AppError(409, "FOREIGN_KEY_VIOLATION", "Une reference relationnelle est invalide.");
  }

  if (error?.code === "23514") {
    throw new AppError(409, "BUSINESS_RULE_VIOLATION", "Une regle metier ou SQL a ete violee.");
  }

  throw error;
}

export async function getIncidents(query) {
  const { page, limit, ...filters } = query;
  const result = await findIncidents(pool, filters, { page, limit });
  return {
    data: result.data,
    pagination: {
      page,
      limit,
      total: result.total
    }
  };
}

export async function getIncidentById(id) {
  const incident = await findIncidentById(pool, id);

  if (!incident) {
    return null;
  }

  const interventions = await getInterventionsByIncidentId(pool, id);
  return { ...incident, interventions };
}

export async function createIncident(payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const createdBy = await findUserById(db, payload.createdBy);

      if (!createdBy) {
        throw new AppError(409, "USER_REFERENCE_INVALID", "Le declarant reference n'existe pas.");
      }

      const { technician } = await requireReferences(db, payload);
      const timestamps = applyStatusRules(null, payload.status, payload.technicianId ?? null);
      const incidentId = await createIncidentRecord(db, {
        ...payload,
        reference: generateIncidentReference(),
        technicianId: technician?.id ?? null,
        assignedAt: technician ? new Date().toISOString() : null,
        resolvedAt: timestamps.resolvedAt,
        closedAt: timestamps.closedAt
      });

      return findIncidentById(db, incidentId);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function updateIncident(id, payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const incident = await requireIncident(db, id);

      if (incident.status === "closed") {
        throw new AppError(409, "INCIDENT_CLOSED", "Un incident cloture ne peut pas etre modifie directement.");
      }

      const { technician } = await requireReferences(db, payload, incident);
      const timestamps = applyStatusRules(incident, incident.status, payload.technicianId ?? incident.technician?.id ?? null);
      const nextTechnicianId = payload.technicianId === undefined ? incident.technician?.id ?? null : payload.technicianId;
      const assignedAt = incident.assigned_at ?? (nextTechnicianId ? new Date().toISOString() : null);

      await updateIncidentRecord(db, id, {
        title: payload.title ?? incident.title,
        description: payload.description ?? incident.description,
        priority: payload.priority ?? incident.priority,
        siteId: payload.siteId ?? incident.site.id,
        typeId: payload.typeId ?? incident.incident_type.id,
        technicianId: technician?.id ?? nextTechnicianId ?? null,
        assignedAt,
        resolvedAt: timestamps.resolvedAt,
        closedAt: timestamps.closedAt,
        status: incident.status
      });

      return findIncidentById(db, id);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function patchIncidentStatus(id, payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const incident = await requireIncident(db, id);
      const timestamps = applyStatusRules(incident, payload.status, incident.technician?.id ?? null);

      await updateIncidentStatusRecord(db, id, timestamps);
      return findIncidentById(db, id);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function patchIncidentAssignment(id, payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const incident = await requireIncident(db, id);

      if (incident.status === "closed") {
        throw new AppError(409, "INCIDENT_CLOSED", "Un incident cloture ne peut pas etre reaffecte.");
      }

      let technician = null;

      if (payload.technicianId) {
        ({ technician } = await requireReferences(db, { typeId: incident.incident_type.id, siteId: incident.site.id, technicianId: payload.technicianId }));
      }

      if (!technician && incident.status === "in_progress") {
        throw new AppError(
          409,
          "TECHNICIAN_REQUIRED",
          "Un incident en cours ne peut pas etre desaffecte."
        );
      }

      const nextStatus = technician ? (incident.status === "reported" ? "assigned" : incident.status) : incident.status;
      await updateIncidentAssignmentRecord(db, id, {
        technicianId: technician?.id ?? null,
        assignedAt: incident.assigned_at ?? (technician ? new Date().toISOString() : null),
        status: nextStatus
      });

      return findIncidentById(db, id);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function removeIncident(id) {
  try {
    return await withTransaction(pool, async (db) => {
      await requireIncident(db, id);
      await deleteIncidentRecord(db, id);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function getIncidentInterventions(id) {
  await requireIncident(pool, id);
  return getInterventionsByIncidentId(pool, id);
}

export { requireIncident, requireReferences, mapPgError };
