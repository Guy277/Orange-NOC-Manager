import { AppError } from "../errors/AppError.js";
import { pool } from "../db/pool.js";
import {
  countIncidentTypeUsage,
  createIncidentTypeRecord,
  deleteIncidentTypeRecord,
  findIncidentTypeById,
  findIncidentTypes,
  updateIncidentTypeRecord
} from "../repositories/incidentTypeRepository.js";
import { mapPgError } from "./incidentService.js";

export async function getIncidentTypes(query) {
  const { page, limit, ...filters } = query;
  const result = await findIncidentTypes(pool, filters, { page, limit });
  return { data: result.data, pagination: { page, limit, total: result.total } };
}

export async function getIncidentTypeById(id) {
  return findIncidentTypeById(pool, id);
}

export async function createIncidentType(payload) {
  try {
    const id = await createIncidentTypeRecord(pool, payload);
    return findIncidentTypeById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function updateIncidentType(id, payload) {
  try {
    const existing = await findIncidentTypeById(pool, id);

    if (!existing) {
      throw new AppError(404, "INCIDENT_TYPE_NOT_FOUND", "Type d'incident introuvable.");
    }

    await updateIncidentTypeRecord(pool, id, {
      label: payload.label ?? existing.label,
      description: payload.description ?? existing.description,
      requiredSpecialty: payload.requiredSpecialty ?? existing.requiredSpecialty
    });

    return findIncidentTypeById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function removeIncidentType(id) {
  const existing = await findIncidentTypeById(pool, id);

  if (!existing) {
    throw new AppError(404, "INCIDENT_TYPE_NOT_FOUND", "Type d'incident introuvable.");
  }

  const usage = await countIncidentTypeUsage(pool, id);
  if (usage > 0) {
    throw new AppError(409, "INCIDENT_TYPE_IN_USE", "Ce type d'incident est encore utilise par des incidents.");
  }

  await deleteIncidentTypeRecord(pool, id);
}
