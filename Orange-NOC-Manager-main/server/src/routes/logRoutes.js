import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { getLogs } from "../services/logService.js";
import { logListQuerySchema } from "../validation/logSchemas.js";

export const logRouter = Router();

logRouter.get(
  "/logs",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(logListQuerySchema, req.query, "Parametres de requete invalides.");
    res.json(await getLogs(query));
  })
);
