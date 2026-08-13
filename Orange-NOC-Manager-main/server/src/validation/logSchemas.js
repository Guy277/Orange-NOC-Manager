import { z } from "zod";
import { dateTimeStringSchema, paginationSchema } from "./commonSchemas.js";

export const logListQuerySchema = paginationSchema.extend({
  action: z.enum(["INSERT", "UPDATE", "DELETE"]).optional(),
  tableName: z.string().trim().max(80).optional(),
  recordId: z.coerce.number().int().positive().optional(),
  dateFrom: dateTimeStringSchema.optional(),
  dateTo: dateTimeStringSchema.optional()
}).refine(
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
