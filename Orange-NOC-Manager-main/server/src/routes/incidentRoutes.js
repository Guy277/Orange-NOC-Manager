import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { idParamSchema } from "../validation/commonSchemas.js";
import {
  createIncidentSchema,
  incidentAssignmentPatchSchema,
  incidentListQuerySchema,
  incidentStatusPatchSchema,
  updateIncidentSchema
} from "../validation/incidentSchemas.js";
import {
  createIncident,
  getIncidentById,
  getIncidentInterventions,
  getIncidents,
  patchIncidentAssignment,
  patchIncidentStatus,
  removeIncident,
  updateIncident
} from "../services/incidentService.js";
import { AppError } from "../errors/AppError.js";
import { createInterventionSchema } from "../validation/interventionSchemas.js";
import { createIntervention } from "../services/interventionService.js";
import { getIncidentLogs } from "../services/logService.js";

export const incidentRouter = Router();

incidentRouter.get(
  "/incidents",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(incidentListQuerySchema, req.query, "Parametres de requete invalides.");
    res.json(await getIncidents(query));
  })
);

incidentRouter.post(
  "/incidents",
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(createIncidentSchema, req.body, "Corps de requete invalide.");
    res.status(201).json(await createIncident(payload));
  })
);

incidentRouter.get(
  "/incidents/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    const incident = await getIncidentById(id);

    if (!incident) {
      throw new AppError(404, "INCIDENT_NOT_FOUND", "Incident introuvable.");
    }

    res.json(incident);
  })
);

incidentRouter.put(
  "/incidents/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    const payload = parseOrThrow(updateIncidentSchema, req.body, "Corps de requete invalide.");
    res.json(await updateIncident(id, payload));
  })
);

incidentRouter.delete(
  "/incidents/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    await removeIncident(id);
    res.status(204).send();
  })
);

incidentRouter.patch(
  "/incidents/:id/status",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    const payload = parseOrThrow(incidentStatusPatchSchema, req.body, "Corps de requete invalide.");
    res.json(await patchIncidentStatus(id, payload));
  })
);

incidentRouter.patch(
  "/incidents/:id/assignment",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    const payload = parseOrThrow(incidentAssignmentPatchSchema, req.body, "Corps de requete invalide.");
    res.json(await patchIncidentAssignment(id, payload));
  })
);

incidentRouter.get(
  "/incidents/:id/interventions",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    res.json({ data: await getIncidentInterventions(id) });
  })
);

incidentRouter.post(
  "/incidents/:id/interventions",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    const payload = parseOrThrow(createInterventionSchema, req.body, "Corps de requete invalide.");
    res.status(201).json({ data: await createIntervention(id, payload) });
  })
);

incidentRouter.get(
  "/incidents/:id/logs",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant d'incident invalide.");
    res.json({ data: await getIncidentLogs(id) });
  })
);
