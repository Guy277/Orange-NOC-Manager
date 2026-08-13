import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { idParamSchema } from "../validation/commonSchemas.js";
import { updateInterventionSchema } from "../validation/interventionSchemas.js";
import { removeIntervention, updateIntervention } from "../services/interventionService.js";

export const interventionRouter = Router();

interventionRouter.put(
  "/interventions/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'intervention invalide.");
    const payload = parseOrThrow(updateInterventionSchema, req.body, "Corps de requete invalide.");
    res.json(await updateIntervention(id, payload));
  })
);

interventionRouter.delete(
  "/interventions/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'intervention invalide.");
    await removeIntervention(id);
    res.status(204).send();
  })
);
