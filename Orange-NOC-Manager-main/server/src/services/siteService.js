import { AppError } from "../errors/AppError.js";
import { pool } from "../db/pool.js";
import {
  countSiteUsage,
  createSiteRecord,
  deleteSiteRecord,
  findSiteById,
  findSites,
  updateSiteRecord
} from "../repositories/siteRepository.js";
import { mapPgError } from "./incidentService.js";

export async function getSites(query) {
  const { page, limit, ...filters } = query;
  const result = await findSites(pool, filters, { page, limit });
  return { data: result.data, pagination: { page, limit, total: result.total } };
}

export async function getSiteById(id) {
  return findSiteById(pool, id);
}

export async function createSite(payload) {
  try {
    const id = await createSiteRecord(pool, payload);
    return findSiteById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function updateSite(id, payload) {
  try {
    const existing = await findSiteById(pool, id);

    if (!existing) {
      throw new AppError(404, "SITE_NOT_FOUND", "Site reseau introuvable.");
    }

    await updateSiteRecord(pool, id, {
      code: payload.code ?? existing.code,
      name: payload.name ?? existing.name,
      city: payload.city ?? existing.city,
      region: payload.region ?? existing.region,
      siteType: payload.siteType ?? existing.siteType
    });

    return findSiteById(pool, id);
  } catch (error) {
    mapPgError(error);
  }
}

export async function removeSite(id) {
  const existing = await findSiteById(pool, id);

  if (!existing) {
    throw new AppError(404, "SITE_NOT_FOUND", "Site reseau introuvable.");
  }

  const usage = await countSiteUsage(pool, id);
  if (usage > 0) {
    throw new AppError(409, "SITE_IN_USE", "Ce site est encore utilise par des incidents.");
  }

  await deleteSiteRecord(pool, id);
}
