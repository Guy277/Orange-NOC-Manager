import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { healthRouter } from "./routes/healthRoutes.js";
import { incidentRouter } from "./routes/incidentRoutes.js";
import { technicianRouter } from "./routes/technicianRoutes.js";
import { siteRouter } from "./routes/siteRoutes.js";
import { incidentTypeRouter } from "./routes/incidentTypeRoutes.js";
import { interventionRouter } from "./routes/interventionRoutes.js";
import { logRouter } from "./routes/logRoutes.js";
import { dashboardRouter } from "./routes/dashboardRoutes.js";
import { exportRouter } from "./routes/exportRoutes.js";
import { legacyRouter } from "./routes/legacyRoutes.js";
import { handleApiError, sendError } from "./utils/http.js";
import { env } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const clientDistPath = env.clientDistPath || path.resolve(__dirname, "../../client/dist");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api", healthRouter);
app.use("/api", incidentRouter);
app.use("/api", interventionRouter);
app.use("/api", technicianRouter);
app.use("/api", siteRouter);
app.use("/api", incidentTypeRouter);
app.use("/api", logRouter);
app.use("/api", dashboardRouter);
app.use("/api", exportRouter);
app.use("/legacy", legacyRouter);

app.use(express.static(clientDistPath));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(clientDistPath, "index.html"));
});

app.use((req, res) => {
  sendError(res, 404, "NOT_FOUND", "Route introuvable.");
});

app.use((error, req, res, next) => handleApiError(error, req, res, next, env.nodeEnv));

export { app };
