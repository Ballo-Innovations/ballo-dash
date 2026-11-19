import { z } from "zod";

/**
 * Server environment schema (H-08). Read values through `env()`, never
 * `process.env` directly, so a missing or malformed variable fails with a
 * readable message instead of a crash deep inside a request.
 *
 * Validation runs once at server start (see src/instrumentation.ts) and lazily
 * on first use, so `next build` does not need production secrets.
 */

const optionalUrl = z
  .string()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalString = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const base64Key32 = z
  .string()
  .refine((value) => Buffer.from(value, "base64").length === 32, {
    message: "must be 32 bytes, base64 encoded (generate with: openssl rand -base64 32)",
  });

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_ENV: z.enum(["development", "preview", "staging", "production"]).default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),

    DATABASE_URL: z.string().url(),
    DATABASE_SSL: z.enum(["require", "disable"]).default("disable"),

    NEXTAUTH_SECRET: z.string().min(32, "must be at least 32 characters"),
    NEXTAUTH_URL: optionalUrl,

    /** Key for encrypting integration tokens at rest (H-04). */
    TOKEN_ENCRYPTION_KEY: base64Key32,
    /** Previous key, accepted for decryption only, during key rotation. */
    TOKEN_ENCRYPTION_KEY_PREVIOUS: base64Key32.optional().or(z.literal("").transform(() => undefined)),

    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalString,

    AWS_REGION: optionalString,
    AWS_ACCESS_KEY_ID: optionalString,
    AWS_SECRET_ACCESS_KEY: optionalString,
    AWS_S3_BUCKET_NAME: optionalString,

    FACEBOOK_REDIRECT_URI: optionalUrl,
    INSTAGRAM_REDIRECT_URI: optionalUrl,
    LINKEDIN_REDIRECT_URI: optionalUrl,
    X_REDIRECT_URI: optionalUrl,

    ANTHROPIC_API_KEY: optionalString,
    ANTHROPIC_MODEL: z.string().default("claude-sonnet-5-5"),
  })
  .superRefine((value, ctx) => {
    const deployed = value.APP_ENV === "staging" || value.APP_ENV === "production";
    if (deployed && !value.UPSTASH_REDIS_REST_URL) {
      ctx.addIssue({ code: "custom", path: ["UPSTASH_REDIS_REST_URL"], message: "required in staging and production (rate limiting)" });
    }
    if (deployed && !value.UPSTASH_REDIS_REST_TOKEN) {
      ctx.addIssue({ code: "custom", path: ["UPSTASH_REDIS_REST_TOKEN"], message: "required in staging and production (rate limiting)" });
    }
    if (deployed && value.DATABASE_SSL !== "require") {
      ctx.addIssue({ code: "custom", path: ["DATABASE_SSL"], message: "must be 'require' in staging and production" });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration:\n${issues.map((issue) => `  - ${issue}`).join("\n")}`);
    this.name = "EnvError";
  }
}

/** Parses an environment object; throws EnvError listing every problem. */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`));
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/** Validated server environment. Server-only: never import from client components. */
export function env(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("env() is server-only");
  }
  cached ??= parseServerEnv(process.env);
  return cached;
}

/** Test hook: forget the cached environment. */
export function resetEnvCache(): void {
  cached = undefined;
}
