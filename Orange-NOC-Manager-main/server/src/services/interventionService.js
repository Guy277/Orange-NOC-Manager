import { AppError } from "../errors/AppError.js";
import { pool } from "../db/pool.js";
import { withTransaction } from "../db/transaction.js";
import {
  createInterventionRecord,
  deleteInterventionRecord,
  findInterventionById,
  updateInterventionRecord
} from "../repositories/interventionRepository.js";
import { findIncidentById, getInterventionsByIncidentId } from "../repositories/incidentRepository.js";
import { findTechnicianReferenceById } from "../repositories/referenceRepository.js";
import { mapPgError } from "./incidentService.js";

async function requireIntervention(db, interventionId) {
  const intervention = await findInterventionById(db, interventionId);

  if (!intervention) {
    throw new AppError(404, "INTERVENTION_NOT_FOUND", "Intervention introuvable.");
  }

  return intervention;
}

async function requireActiveTechnician(db, technicianId) {
  const technician = await findTechnicianReferenceById(db, technicianId);

  if (!technician) {
    throw new AppError(409, "TECHNICIAN_REFERENCE_INVALID", "Le technicien reference n'existe pas.");
  }

  if (!technician.isActive) {
    throw new AppError(409, "TECHNICIAN_INACTIVE", "Le technicien selectionne est inactif.");
  }

  return technician;
}

export async function createIntervention(incidentId, payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const incident = await findIncidentById(db, incidentId);

      if (!incident) {
        throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident introuvable.");
      }

      await requireActiveTechnician(db, payload.technicianId);
      await createInterventionRecord(db, { ...payload, incidentId });
      return getInterventionsByIncidentId(db, incidentId);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function updateIntervention(id, payload) {
  try {
    return await withTransaction(pool, async (db) => {
      const intervention = await requireIntervention(db, id);
      const technicianId = payload.technicianId ?? intervention.technician_id;

      await requireActiveTechnician(db, technicianId);

      await updateInterventionRecord(db, id, {
        technicianId,
        action: payload.action ?? intervention.action,
        comment: payload.comment ?? intervention.comment,
        startedAt: payload.startedAt ?? intervention.started_at,
        endedAt: payload.endedAt === undefined ? intervention.ended_at : payload.endedAt
      });

      return findInterventionById(db, id);
    });
  } catch (error) {
    mapPgError(error);
  }
}

export async function removeIntervention(id) {
  const intervention = await findInterventionById(pool, id);

  if (!intervention) {
    throw new AppError(404, "INTERVENTION_NOT_FOUND", "Intervention introuvable.");
  }

  await deleteInterventionRecord(pool, id);
}
