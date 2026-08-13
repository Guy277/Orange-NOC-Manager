import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { dashboardFiltersSchema } from "../validation/incidentSchemas.js";
import {
  getDashboardRecentIncidents,
  getDashboardStatusBreakdown,
  getDashboardTechnicianPerformance,
  getDashboardTypeBreakdown,
  getSummary
} from "../services/dashboardService.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/dashboard/summary",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(dashboardFiltersSchema, req.query, "Parametres de requete invalides.");
    res.json(await getSummary(query));
  })
);

dashboardRouter.get(
  "/dashboard/incidents-by-type",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(dashboardFiltersSchema, req.query, "Parametres de requete invalides.");
    res.json({ data: await getDashboardTypeBreakdown(query) });
  })
);

dashboardRouter.get(
  "/dashboard/incidents-by-status",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(dashboardFiltersSchema, req.query, "Parametres de requete invalides.");
    res.json({ data: await getDashboardStatusBreakdown(query) });
  })
);

dashboardRouter.get(
  "/dashboard/recent-incidents",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(dashboardFiltersSchema, req.query, "Parametres de requete invalides.");
    res.json({ data: await getDashboardRecentIncidents(query) });
  })
);

dashboardRouter.get(
  "/dashboard/technician-performance",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(dashboardFiltersSchema, req.query, "Parametres de requete invalides.");
    res.json({ data: await getDashboardTechnicianPerformance(query) });
  })
);
