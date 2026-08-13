import { Router } from "express";
import { pool } from "../db/pool.js";
import { asyncHandler } from "../utils/http.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const result = await pool.query(
      "SELECT NOW() AS database_time, COUNT(*)::int AS incident_count FROM incidents"
    );

    res.json({
      status: "ok",
      service: "orange-noc-manager",
      database: "ok",
      timestamp: new Date().toISOString(),
      databaseTime: result.rows[0].database_time,
      incidentCount: result.rows[0].incident_count
    });
  })
);
