import { execFileSync } from "node:child_process";
import { assertDestructiveAllowed } from "../../src/db/guard";

/**
 * Prepares the integration-test database once per run: applies the current
 * schema with drizzle-kit push. Refuses any database that is not local.
 */
export default function setup() {
  const user = process.env.USER ?? "postgres";
  const url = process.env.TEST_DATABASE_URL ?? `postgres://${user}@localhost:5432/ballo_dash_test`;
  assertDestructiveAllowed(url, { ALLOW_DESTRUCTIVE_DB: process.env.CI ? new URL(url).pathname.slice(1) : undefined });
  execFileSync("npx", ["drizzle-kit", "push", "--force"], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: "pipe",
  });
}
