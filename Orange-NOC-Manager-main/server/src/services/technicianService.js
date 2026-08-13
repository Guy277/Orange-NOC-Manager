import { AppError } from "../errors/AppError.js";
import { pool } from "../db/pool.js";
import {
  countTechnicianUsage,
  createTechnicianRecord,
  deleteTechnicianRecord,
  findTechnicianById,
  findTechnicians,
  updateTechnicianRecord
} from "../repositories/technicianRepository.js";
import { mapPgError } from "./incidentService.js";

export async function getTechnicians(query) {
  const { page, limit, ...filters } = query;
  const result = await findTechnicians(pool, filters, { page, limit });
  return { data: result.data, pagination: { page, limit, total: result.total } };
}

export async function getTechnicianById(id) {
  return findTechnicianById(pool, id);
}

export async function createTechnician(payload) {
  try {
    const id = await createTechnicianRecord(pool, payload);
    return findTechnicianById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function updateTechnician(id, payload) {
  try {
    const existing = await findTechnicianById(pool, id);

    if (!existing) {
      throw new AppError(404, "TECHNICIAN_NOT_FOUND", "Technicien introuvable.");
    }

    await updateTechnicianRecord(pool, id, {
      name: payload.name ?? existing.name,
      email: payload.email ?? existing.email,
      employeeCode: payload.employeeCode ?? existing.employeeCode,
      specialty: payload.specialty ?? existing.specialty,
      zone: payload.zone ?? existing.zone,
      isActive: payload.isActive ?? existing.isActive
    });

    return findTechnicianById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function removeTechnician(id) {
  const existing = await findTechnicianById(pool, id);

  if (!existing) {
    throw new AppError(404, "TECHNICIAN_NOT_FOUND", "Technicien introuvable.");
  }

  const usage = await countTechnicianUsage(pool, id);
  if (usage.incident_count > 0 || usage.intervention_count > 0) {
    throw new AppError(409, "TECHNICIAN_IN_USE", "Ce technicien est encore reference par des incidents ou interventions.");
  }

  await deleteTechnicianRecord(pool, id);
}
