import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Pool } from "pg";
import { assertDestructiveAllowed } from "../../src/db/guard";

/**
 * Creates (or resets) a dedicated end-to-end company and admin user in the
 * local database and exposes the credentials to the tests through env vars.
 */
export default async function globalSetup() {
  dotenv.config();
  if (process.env.E2E_BASE_URL) {
    if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD) {
      throw new Error("Set E2E_EMAIL and E2E_PASSWORD when running against E2E_BASE_URL");
    }
    return;
  }

  const url = process.env.DATABASE_URL;
  assertDestructiveAllowed(url);
  const email = "e2e-admin@example.test";
  const password = randomBytes(18).toString("base64url");
  const pool = new Pool({ connectionString: url });
  try {
    const hash = await bcrypt.hash(password, 10);
    const existing = await pool.query<{ company_id: string }>("SELECT company_id FROM users WHERE email = $1", [email]);
    if (existing.rows[0]) {
      await pool.query("UPDATE users SET password_hash = $1, is_active = true, role = 'ADMIN' WHERE email = $2", [hash, email]);
    } else {
      const companyId = randomUUID();
      await pool.query("INSERT INTO companies (id, name, timezone) VALUES ($1, 'E2E Test Company', 'Africa/Lusaka')", [companyId]);
      await pool.query(
        "INSERT INTO users (id, company_id, email, first_name, last_name, password_hash, role) VALUES ($1, $2, $3, 'E2E', 'Admin', $4, 'ADMIN')",
        [randomUUID(), companyId, email, hash]
      );
    }
  } finally {
    await pool.end();
  }
  process.env.E2E_EMAIL = email;
  process.env.E2E_PASSWORD = password;
}
