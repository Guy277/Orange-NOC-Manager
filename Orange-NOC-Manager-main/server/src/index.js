import { app } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";
import { pool } from "./db/pool.js";

async function bootstrap() {
  try {
    await runMigrations();

    app.listen(env.port, () => {
      console.log(`Server listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Bootstrap failed", error);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}

bootstrap();
