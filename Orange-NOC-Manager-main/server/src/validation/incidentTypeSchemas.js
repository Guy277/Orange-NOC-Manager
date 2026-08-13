import { z } from "zod";
import { technicianSpecialties } from "../constants/incident.js";
import { paginationSchema } from "./commonSchemas.js";

const specialtySchema = z.enum(technicianSpecialties);

export const incidentTypeListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  requiredSpecialty: specialtySchema.optional()
});

export const createIncidentTypeSchema = z.object({
  label: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(1000),
  requiredSpecialty: specialtySchema
});

export const updateIncidentTypeSchema = createIncidentTypeSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Aucune donnee a mettre a jour." }
);
