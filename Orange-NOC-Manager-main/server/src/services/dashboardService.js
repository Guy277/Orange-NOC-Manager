import { pool } from "../db/pool.js";
import {
  getDashboardSummary,
  getIncidentsByStatus,
  getIncidentsByType,
  getRecentIncidents,
  getTechnicianPerformance
} from "../repositories/dashboardRepository.js";

export async function getSummary(filters) {
  return getDashboardSummary(pool, filters);
}

export async function getDashboardTypeBreakdown(filters) {
  return getIncidentsByType(pool, filters);
}

export async function getDashboardStatusBreakdown(filters) {
  return getIncidentsByStatus(pool, filters);
}

export async function getDashboardRecentIncidents(filters) {
  return getRecentIncidents(pool, filters, Number(filters.limit || 10));
}

export async function getDashboardTechnicianPerformance(filters) {
  return getTechnicianPerformance(pool, filters, Number(filters.limit || 10));
}
