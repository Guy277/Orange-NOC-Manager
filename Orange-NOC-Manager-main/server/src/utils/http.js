import { ZodError } from "zod";
import { AppError } from "../errors/AppError.js";

export function sendError(res, status, code, message, details = null) {
  return res.status(status).json({
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function parseOrThrow(schema, value, message = "Donnees invalides.") {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", message, result.error.flatten());
  }

  return result.data;
}

export function handleApiError(error, req, res, _next, nodeEnv) {
  console.error(error);

  if (error instanceof AppError) {
    return sendError(res, error.status, error.code, error.message, error.details);
  }

  if (error instanceof ZodError) {
    return sendError(res, 400, "VALIDATION_ERROR", "Donnees invalides.", error.flatten());
  }

  return sendError(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "Une erreur interne est survenue.",
    nodeEnv === "development" ? error.message : null
  );
}
