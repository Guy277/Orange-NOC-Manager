import { z } from "zod";
import { siteTypes } from "../constants/incident.js";
import { paginationSchema } from "./commonSchemas.js";

const siteTypeSchema = z.enum(siteTypes);

export const siteListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  region: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  siteType: siteTypeSchema.optional()
});

export const createSiteSchema = z.object({
  code: z.string().trim().min(3).max(30),
  name: z.string().trim().min(3).max(160),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().min(2).max(100),
  siteType: siteTypeSchema
});

export const updateSiteSchema = createSiteSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Aucune donnee a mettre a jour." }
);
