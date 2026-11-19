/**
 * Encrypts integration secrets stored as plaintext, and re-encrypts values
 * written with a previous key (H-04). Safe to run repeatedly.
 *
 *   DRY_RUN=1 npx tsx scripts/encrypt-integration-secrets.ts   # report only
 *   npx tsx scripts/encrypt-integration-secrets.ts             # apply
 *
 * Needs DATABASE_URL and TOKEN_ENCRYPTION_KEY (plus TOKEN_ENCRYPTION_KEY_PREVIOUS
 * when rotating). Each row is updated in its own statement, guarded by the old
 * value, so a concurrent write is never overwritten.
 */
import "dotenv/config";
import { Pool } from "pg";
import { decryptSecret, encryptSecret, keyRingFromEnv, needsReencryption } from "../src/lib/secret-box";

const COLUMNS = ["access_token", "refresh_token", "app_secret"] as const;

async function main() {
  const dryRun = process.env.DRY_RUN === "1";
  const ring = keyRingFromEnv();
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: true } : undefined,
  });

  try {
    const { rows } = await pool.query<{ id: string } & Record<(typeof COLUMNS)[number], string | null>>(
      `SELECT id, ${COLUMNS.join(", ")} FROM integrations`
    );
    let changed = 0;
    let skipped = 0;
    for (const row of rows) {
      for (const column of COLUMNS) {
        const stored = row[column];
        if (!stored || !needsReencryption(stored, ring)) continue;
        const next = encryptSecret(decryptSecret(stored, ring), ring);
        if (dryRun) {
          changed++;
          continue;
        }
        const result = await pool.query(`UPDATE integrations SET ${column} = $1 WHERE id = $2 AND ${column} = $3`, [next, row.id, stored]);
        if (result.rowCount === 1) changed++;
        else skipped++;
      }
    }
    console.info(
      `${dryRun ? "[dry run] would encrypt" : "encrypted"} ${changed} value(s) across ${rows.length} integration(s)` +
        (skipped ? `; ${skipped} skipped because they changed during the run (run again)` : "")
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("encryption migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
