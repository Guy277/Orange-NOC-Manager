import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { idParamSchema } from "../validation/commonSchemas.js";
import {
  createTechnicianSchema,
  technicianListQuerySchema,
  updateTechnicianSchema
} from "../validation/technicianSchemas.js";
import {
  createTechnician,
  getTechnicianById,
  getTechnicians,
  removeTechnician,
  updateTechnician
} from "../services/technicianService.js";
import { AppError } from "../errors/AppError.js";

export const technicianRouter = Router();

technicianRouter.get(
  "/technicians",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(technicianListQuerySchema, req.query, "Parametres de requete invalides.");
    res.json(await getTechnicians(query));
  })
);

technicianRouter.get(
  "/technicians/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de technicien invalide.");
    const technician = await getTechnicianById(id);

    if (!technician) {
      throw new AppError(404, "TECHNICIAN_NOT_FOUND", "Technicien introuvable.");
    }

    res.json(technician);
  })
);

technicianRouter.post(
  "/technicians",
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(createTechnicianSchema, req.body, "Corps de requete invalide.");
    res.status(201).json(await createTechnician(payload));
  })
);

technicianRouter.put(
  "/technicians/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de technicien invalide.");
    const payload = parseOrThrow(updateTechnicianSchema, req.body, "Corps de requete invalide.");
    res.json(await updateTechnician(id, payload));
  })
);

technicianRouter.delete(
  "/technicians/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de technicien invalide.");
    await removeTechnician(id);
    res.status(204).send();
  })
);
