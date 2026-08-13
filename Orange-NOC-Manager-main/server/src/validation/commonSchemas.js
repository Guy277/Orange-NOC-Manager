import { z } from "zod";

export const dateTimeStringSchema = z.string().datetime();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const dateRangeSchema = z.object({
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
