import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Shared Postgres pool. Values are validated at server start by
 * src/instrumentation.ts (env.ts); here we only read them, so importing this
 * module during `next build` does not require secrets.
 *
 * Serverless functions open many short-lived instances, so the pool is kept
 * small and reused across hot invocations through globalThis.
 */
const globalForDb = globalThis as unknown as { balloDashPool?: Pool };

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined,
  });
}

export const pool = globalForDb.balloDashPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.balloDashPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
