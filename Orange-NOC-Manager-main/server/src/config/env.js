const requiredEnv = ["DATABASE_URL"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL,
  clientDistPath: process.env.CLIENT_DIST_PATH || "/app/client/dist"
};
