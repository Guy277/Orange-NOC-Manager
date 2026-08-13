import { z } from "zod";

export const createInterventionSchema = z.object({
  technicianId: z.coerce.number().int().positive(),
  action: z.string().trim().min(3).max(300),
  comment: z.string().trim().min(3).max(2000),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().nullable().optional()
}).refine(
  (value) => !value.endedAt || new Date(value.endedAt) >= new Date(value.startedAt),
  {
    message: "La date de fin doit etre posterieure a la date de debut.",
    path: ["endedAt"]
  }
);

export const updateInterventionSchema = z.object({
  technicianId: z.coerce.number().int().positive().optional(),
  action: z.string().trim().min(3).max(300).optional(),
  comment: z.string().trim().min(3).max(2000).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().nullable().optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: "Aucune donnee a mettre a jour."
}).refine(
  (value) => !value.startedAt || !value.endedAt || new Date(value.endedAt) >= new Date(value.startedAt),
  {
    message: "La date de fin doit etre posterieure a la date de debut.",
    path: ["endedAt"]
  }
);
