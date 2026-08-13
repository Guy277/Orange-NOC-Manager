import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { idParamSchema } from "../validation/commonSchemas.js";
import {
  createIncidentTypeSchema,
  incidentTypeListQuerySchema,
  updateIncidentTypeSchema
} from "../validation/incidentTypeSchemas.js";
import {
  createIncidentType,
  getIncidentTypeById,
  getIncidentTypes,
  removeIncidentType,
  updateIncidentType
} from "../services/incidentTypeService.js";
import { AppError } from "../errors/AppError.js";

export const incidentTypeRouter = Router();

incidentTypeRouter.get(
  "/incident-types",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(incidentTypeListQuerySchema, req.query, "Parametres de requete invalides.");
    res.json(await getIncidentTypes(query));
  })
);

incidentTypeRouter.post(
  "/incident-types",
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(createIncidentTypeSchema, req.body, "Corps de requete invalide.");
    res.status(201).json(await createIncidentType(payload));
  })
);

incidentTypeRouter.put(
  "/incident-types/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de type invalide.");
    const payload = parseOrThrow(updateIncidentTypeSchema, req.body, "Corps de requete invalide.");
    res.json(await updateIncidentType(id, payload));
  })
);

incidentTypeRouter.delete(
  "/incident-types/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de type invalide.");
    await removeIncidentType(id);
    res.status(204).send();
  })
);

incidentTypeRouter.get(
  "/incident-types/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de type invalide.");
    const incidentType = await getIncidentTypeById(id);

    if (!incidentType) {
      throw new AppError(404, "INCIDENT_TYPE_NOT_FOUND", "Type d'incident introuvable.");
    }

    res.json(incidentType);
  })
);
