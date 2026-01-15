import { Pool } from "pg";
import { runMigrations } from "./repositories/migrations";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env["DATABASE_URL"] ?? process.env["POSTGRES_URL"] ?? process.env["INTEGRATION_POSTGRES_URL"],
    });
  }
  return pool;
}

export async function migrate(pool: Pool) {
  await runMigrations(pool);
}
