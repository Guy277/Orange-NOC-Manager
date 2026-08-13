import { z } from "zod";
import { technicianSpecialties } from "../constants/incident.js";
import { paginationSchema } from "./commonSchemas.js";

const technicianSpecialtySchema = z.enum(technicianSpecialties);

export const technicianListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  specialty: technicianSpecialtySchema.optional(),
  zone: z.string().trim().max(80).optional(),
  active: z.coerce.boolean().optional()
});

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(255),
  employeeCode: z.string().trim().min(3).max(50),
  specialty: technicianSpecialtySchema,
  zone: z.string().trim().min(2).max(80),
  isActive: z.coerce.boolean().default(true)
});

export const updateTechnicianSchema = createTechnicianSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "Aucune donnee a mettre a jour." }
);
