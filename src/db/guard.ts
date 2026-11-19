/**
 * Guard for destructive database scripts (reset, seed --reset).
 * Allows only local databases unless ALLOW_DESTRUCTIVE_DB=<database name>
 * is set explicitly, so a stray DATABASE_URL can never wipe a shared database.
 */
export function assertDestructiveAllowed(connectionString: string | undefined, env: Record<string, string | undefined> = process.env): void {
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }
  const database = url.pathname.replace(/^\//, "");
  const local = ["localhost", "127.0.0.1", "::1", "[::1]", ""].includes(url.hostname);
  if (env.APP_ENV === "staging" || env.APP_ENV === "production") {
    throw new Error(`Refusing destructive database operation with APP_ENV=${env.APP_ENV}`);
  }
  if (local) return;
  if (env.ALLOW_DESTRUCTIVE_DB && env.ALLOW_DESTRUCTIVE_DB === database) return;
  throw new Error(
    `Refusing destructive operation on remote database "${database}" at ${url.hostname}. ` +
      `Set ALLOW_DESTRUCTIVE_DB=${database} if you really mean it.`
  );
}
