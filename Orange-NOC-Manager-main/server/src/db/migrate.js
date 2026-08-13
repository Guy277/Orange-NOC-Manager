import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initDirectory = path.resolve(__dirname, "../../../database/init");

export async function runMigrations() {
  const files = (await fs.readdir(initDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(initDirectory, file), "utf8");
    await pool.query(sql);
  }
}
