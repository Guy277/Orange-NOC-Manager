import { z } from "zod";
import { incidentPriorities, incidentStatuses } from "../constants/incident.js";
import { dateTimeStringSchema, paginationSchema } from "./commonSchemas.js";

const incidentStatusSchema = z.enum(incidentStatuses);
const incidentPrioritySchema = z.enum(incidentPriorities);

export const incidentListQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(120).optional(),
  status: incidentStatusSchema.optional(),
  priority: incidentPrioritySchema.optional(),
  siteId: z.coerce.number().int().positive().optional(),
  typeId: z.coerce.number().int().positive().optional(),
  technicianId: z.coerce.number().int().positive().optional()
});

export const createIncidentSchema = z.object({
  title: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(4000),
  priority: incidentPrioritySchema,
  status: incidentStatusSchema.default("reported"),
  siteId: z.coerce.number().int().positive(),
  typeId: z.coerce.number().int().positive(),
  technicianId: z.coerce.number().int().positive().nullable().optional(),
  createdBy: z.coerce.number().int().positive()
});

export const updateIncidentSchema = z.object({
  title: z.string().trim().min(5).max(180).optional(),
  description: z.string().trim().min(10).max(4000).optional(),
  priority: incidentPrioritySchema.optional(),
  siteId: z.coerce.number().int().positive().optional(),
  typeId: z.coerce.number().int().positive().optional(),
  technicianId: z.coerce.number().int().positive().nullable().optional()
}).refine((value) => Object.keys(value).length > 0, {
  message: "Aucune donnee a mettre a jour."
});

export const incidentStatusPatchSchema = z.object({
  status: incidentStatusSchema
});

export const incidentAssignmentPatchSchema = z.object({
  technicianId: z.coerce.number().int().positive().nullable()
});

export const dashboardFiltersSchema = paginationSchema.partial()
  .extend({
    dateFrom: dateTimeStringSchema.optional(),
    dateTo: dateTimeStringSchema.optional(),
    siteId: z.coerce.number().int().positive().optional(),
    typeId: z.coerce.number().int().positive().optional(),
    technicianId: z.coerce.number().int().positive().optional(),
    priority: incidentPrioritySchema.optional(),
    status: incidentStatusSchema.optional(),
    region: z.string().trim().max(100).optional()
  })
  .refine(
    (value) => {
      if (!value.dateFrom || !value.dateTo) {
        return true;
      }

      return new Date(value.dateFrom) <= new Date(value.dateTo);
    },
    {
      message: "La periode est invalide.",
      path: ["dateTo"]
    }
  );
