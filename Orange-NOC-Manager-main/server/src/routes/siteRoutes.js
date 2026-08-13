import { Router } from "express";
import { asyncHandler, parseOrThrow } from "../utils/http.js";
import { idParamSchema } from "../validation/commonSchemas.js";
import { createSiteSchema, siteListQuerySchema, updateSiteSchema } from "../validation/siteSchemas.js";
import { createSite, getSiteById, getSites, removeSite, updateSite } from "../services/siteService.js";
import { AppError } from "../errors/AppError.js";

export const siteRouter = Router();

siteRouter.get(
  "/sites",
  asyncHandler(async (req, res) => {
    const query = parseOrThrow(siteListQuerySchema, req.query, "Parametres de requete invalides.");
    res.json(await getSites(query));
  })
);

siteRouter.get(
  "/sites/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de site invalide.");
    const site = await getSiteById(id);

    if (!site) {
      throw new AppError(404, "SITE_NOT_FOUND", "Site reseau introuvable.");
    }

    res.json(site);
  })
);

siteRouter.post(
  "/sites",
  asyncHandler(async (req, res) => {
    const payload = parseOrThrow(createSiteSchema, req.body, "Corps de requete invalide.");
    res.status(201).json(await createSite(payload));
  })
);

siteRouter.put(
  "/sites/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de site invalide.");
    const payload = parseOrThrow(updateSiteSchema, req.body, "Corps de requete invalide.");
    res.json(await updateSite(id, payload));
  })
);

siteRouter.delete(
  "/sites/:id",
  asyncHandler(async (req, res) => {
    const { id } = parseOrThrow(idParamSchema, req.params, "Identifiant de site invalide.");
    await removeSite(id);
    res.status(204).send();
  })
);
