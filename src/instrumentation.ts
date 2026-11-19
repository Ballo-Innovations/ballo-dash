/**
 * Runs once when the Next.js server starts. Validates the environment so a
 * misconfigured deploy fails at boot with a readable message (H-08).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { env } = await import("./env");
  env();
}
