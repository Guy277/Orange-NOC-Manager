import { Router } from "express";
import { asyncHandler } from "../utils/http.js";
import { exportIncidentsXml } from "../services/exportService.js";

export const exportRouter = Router();

exportRouter.get(
  "/exports/incidents.xml",
  asyncHandler(async (_req, res) => {
    const xml = await exportIncidentsXml();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  })
);
