import { pool } from "../db/pool.js";
import { requireIncident } from "./incidentService.js";
import { findLogs, findLogsByIncidentId } from "../repositories/logRepository.js";

export async function getLogs(query) {
  const { page, limit, ...filters } = query;
  const result = await findLogs(pool, filters, { page, limit });
  return { data: result.data, pagination: { page, limit, total: result.total } };
}

export async function getIncidentLogs(id) {
  await requireIncident(pool, id);
  return findLogsByIncidentId(pool, id);
}
